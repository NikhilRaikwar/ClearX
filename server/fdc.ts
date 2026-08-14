import { randomUUID } from "node:crypto";
import { AbiCoder, Contract, JsonRpcProvider, Wallet, encodeBytes32String } from "ethers";
import { config, isConfigured } from "./config.js";
import { FLARE_REGISTRY, clearXAbi, fdcHubAbi, feeAbi, paymentResponseTuple, registryAbi, relayAbi, systemsManagerAbi, verificationAbi } from "./abi.js";
import { createJob, findByTx, getJob, listActiveJobs, updateJob, type Job } from "./db.js";
import { preflightPayment } from "./xrpl.js";

const active = new Set<string>();
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const provider = new JsonRpcProvider(config.COSTON2_RPC_URL, config.COSTON2_CHAIN_ID);
const clearX = () => new Contract(config.CLEARX_CONTRACT_ADDRESS, clearXAbi, provider);
const asPaymentResponse = (decoded: any) => ({
  attestationType: decoded.attestationType,
  sourceId: decoded.sourceId,
  votingRound: decoded.votingRound,
  lowestUsedTimestamp: decoded.lowestUsedTimestamp,
  requestBody: {
    transactionId: decoded.requestBody.transactionId,
    inUtxo: decoded.requestBody.inUtxo,
    utxo: decoded.requestBody.utxo,
  },
  responseBody: {
    blockNumber: decoded.responseBody.blockNumber,
    blockTimestamp: decoded.responseBody.blockTimestamp,
    sourceAddressHash: decoded.responseBody.sourceAddressHash,
    sourceAddressesRoot: decoded.responseBody.sourceAddressesRoot,
    receivingAddressHash: decoded.responseBody.receivingAddressHash,
    intendedReceivingAddressHash: decoded.responseBody.intendedReceivingAddressHash,
    spentAmount: decoded.responseBody.spentAmount,
    intendedSpentAmount: decoded.responseBody.intendedSpentAmount,
    receivedAmount: decoded.responseBody.receivedAmount,
    intendedReceivedAmount: decoded.responseBody.intendedReceivedAmount,
    standardPaymentReference: decoded.responseBody.standardPaymentReference,
    oneToOne: decoded.responseBody.oneToOne,
    status: decoded.responseBody.status,
  },
});

async function protocol(name: string, abi: any, signerOrProvider: any = provider) {
  const registry = new Contract(FLARE_REGISTRY, registryAbi, provider);
  const address = await registry.getContractAddressByName(name);
  if (address === "0x0000000000000000000000000000000000000000") throw new Error(`PROTOCOL_NOT_FOUND:${name}`);
  return new Contract(address, abi, signerOrProvider);
}

export async function startJob(tradeId: string, txHash: string): Promise<Job> {
  const existing = findByTx(txHash.toUpperCase());
  if (existing) return existing;
  const job = createJob({ id: randomUUID(), tradeId, xrplTxHash: txHash.toUpperCase() });
  void processJob(job.id);
  return job;
}

export async function processJob(id: string) {
  if (active.has(id)) return;
  active.add(id);
  try {
    if (!isConfigured()) throw new Error("SERVICE_NOT_CONFIGURED");
    let job = getJob(id); if (!job) return;
    const trade = await clearX().trades(job.tradeId);
    if (Number(trade.status) !== 2) throw new Error("TRADE_NOT_TAKEN");

    if (job.stage === "PREFLIGHT") {
      const xrpl = await import("xrpl");
      const source = await resolveXrplAddressFromHash(trade.takerXrplAddressHash, job.xrplTxHash, "source");
      const destination = await resolveXrplAddressFromHash(trade.makerXrplAddressHash, job.xrplTxHash, "destination");
      await preflightPayment(job.xrplTxHash, { source, destination, amountDrops: BigInt(trade.xrpAmountDrops), paymentReference: trade.paymentReference });
      job = updateJob(id, { stage: "FDC_PREPARING" });
      void xrpl;
    }

    let requestBytes = job.abiEncodedRequest;
    if (job.stage === "FDC_PREPARING") {
      const body = { attestationType: encodeBytes32String("Payment"), sourceId: encodeBytes32String("testXRP"), requestBody: { transactionId: `0x${job.xrplTxHash}`, inUtxo: "0", utxo: "0" } };
      const response = await fetch(`${config.FDC_VERIFIER_BASE_URL}/verifier/xrp/Payment/prepareRequest`, { method: "POST", headers: { "Content-Type": "application/json", "X-API-KEY": config.FDC_VERIFIER_API_KEY }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error(`FDC_PREPARE_FAILED:${response.status}`);
      const prepared: any = await response.json();
      if (prepared.status !== "VALID" || !prepared.abiEncodedRequest) throw new Error(`FDC_REQUEST_INVALID:${prepared.status ?? "UNKNOWN"}`);
      requestBytes = prepared.abiEncodedRequest;
      job = updateJob(id, { stage: "FDC_SUBMITTED", abiEncodedRequest: requestBytes });
    }

    const signer = new Wallet(config.FDC_RELAYER_PRIVATE_KEY, provider);
    if (job.stage === "FDC_SUBMITTED" && !job.fdcRequestTxHash) {
      const fees = await protocol("FdcRequestFeeConfigurations", feeAbi);
      const fee = await fees.getRequestFee(requestBytes);
      const hub = await protocol("FdcHub", fdcHubAbi, signer);
      const tx = await hub.requestAttestation(requestBytes, { value: fee });
      const receipt = await tx.wait();
      const systems = await protocol("FlareSystemsManager", systemsManagerAbi);
      const round = Number(await systems.getCurrentVotingEpochId({ blockTag: receipt.blockNumber }));
      job = updateJob(id, { stage: "FDC_WAITING", fdcRequestTxHash: tx.hash, votingRoundId: round });
    }

    if (job.stage === "FDC_WAITING") {
      const verification = await protocol("FdcVerification", verificationAbi);
      const protocolId = await verification.fdcProtocolId();
      const relay = new Contract(await verification.relay(), relayAbi, provider);
      const deadline = Date.now() + config.FDC_JOB_TIMEOUT_MS;
      while (!(await relay.isFinalized(protocolId, job.votingRoundId))) {
        if (Date.now() >= deadline) throw new Error("FDC_FINALIZATION_TIMEOUT");
        await sleep(config.FDC_POLL_INTERVAL_MS);
      }
      job = updateJob(id, { stage: "PROOF_READY" });
    }

    if (job.stage === "PROOF_READY") {
      let proof: any;
      const deadline = Date.now() + config.FDC_JOB_TIMEOUT_MS;
      do {
        const response = await fetch(`${config.FDC_DA_LAYER_URL}/api/v1/fdc/proof-by-request-round-raw`, { method: "POST", headers: { "Content-Type": "application/json", "X-API-KEY": config.FDC_VERIFIER_API_KEY }, body: JSON.stringify({ votingRoundId: job.votingRoundId, requestBytes }) });
        if (response.ok) proof = await response.json();
        if (!proof?.response_hex && !proof?.responseHex) await sleep(config.FDC_POLL_INTERVAL_MS);
      } while (!proof?.response_hex && !proof?.responseHex && Date.now() < deadline);
      const responseHex = proof?.response_hex ?? proof?.responseHex;
      if (!responseHex) throw new Error("FDC_PROOF_TIMEOUT");
      const decoded = AbiCoder.defaultAbiCoder().decode([paymentResponseTuple], responseHex)[0];
      const merkleProof = proof.proof ?? proof.proofs ?? proof.merkleProof;
      if (!Array.isArray(merkleProof)) throw new Error("FDC_PROOF_MISSING_MERKLE_PATH");
      const paymentProof = { merkleProof, data: asPaymentResponse(decoded) };
      job = updateJob(id, { stage: "SETTLING" });
      const settlement = await new Contract(config.CLEARX_CONTRACT_ADDRESS, clearXAbi, signer).settleTrade(job.tradeId, paymentProof);
      await settlement.wait();
      updateJob(id, { stage: "SETTLED", settlementTxHash: settlement.hash });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    updateJob(id, { stage: "FAILED", errorCode: message.split(":")[0], errorMessage: message.slice(0, 300) });
  } finally { active.delete(id); }
}

async function resolveXrplAddressFromHash(expectedHash: string, txHash: string, field: "source" | "destination") {
  const { Client } = await import("xrpl");
  const { keccak256, toUtf8Bytes } = await import("ethers");
  const client = new Client(config.XRPL_TESTNET_WS); await client.connect();
  try {
    const result: any = (await client.request({ command: "tx", transaction: txHash, binary: false })).result;
    const tx = result.tx_json ?? result;
    const value = field === "source" ? tx.Account : tx.Destination;
    if (!value || keccak256(toUtf8Bytes(value)).toLowerCase() !== expectedHash.toLowerCase()) throw new Error(`XRPL_${field.toUpperCase()}_MISMATCH`);
    return value;
  } finally { await client.disconnect(); }
}

export function resumeJobs() { for (const job of listActiveJobs()) void processJob(job.id); }
