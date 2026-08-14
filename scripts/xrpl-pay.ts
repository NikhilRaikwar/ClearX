import "dotenv/config";
import { Contract, JsonRpcProvider, formatUnits } from "ethers";
import { Client, Wallet, xrpToDrops } from "xrpl";

const tradeId = process.argv.slice(2).find((value) => /^\d+$/.test(value));
const execute = process.argv.slice(2).includes("execute");

if (!tradeId) throw new Error("Usage: npm run xrpl:pay -- <tradeId> [execute]");

const required = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in .env`);
  return value;
};

const provider = new JsonRpcProvider(required("COSTON2_RPC_URL"), 114, { staticNetwork: true });
const clearX = new Contract(required("CLEARX_CONTRACT_ADDRESS"), [
  "function trades(uint256) view returns(uint256 id,address maker,address taker,uint256 usdt0Amount,uint256 xrpAmountDrops,bytes32 makerXrplAddressHash,bytes32 takerXrplAddressHash,bytes32 paymentReference,uint64 createdAt,uint64 expiry,bool isPublic,bytes32 settlementXrplTx,uint8 status)",
  "function makerXrplAddresses(uint256) view returns(string)",
  "function takerXrplAddresses(uint256) view returns(string)",
], provider);

async function main() {
  const trade = await clearX.trades(tradeId);
  const makerXrpl = await clearX.makerXrplAddresses(tradeId);
  const takerXrpl = await clearX.takerXrplAddresses(tradeId);
  const latest = await provider.getBlock("latest");
  const wallet = Wallet.fromSeed(required("XRPL_TAKER_SEED"));
  const configuredTaker = required("XRPL_TAKER_ADDRESS");

  if (Number(trade.status) !== 2) throw new Error("Trade is not in TAKEN state");
  if (!latest || latest.timestamp >= Number(trade.expiry)) throw new Error("Trade payment deadline has passed");
  if (wallet.classicAddress !== configuredTaker || wallet.classicAddress !== takerXrpl) throw new Error("Taker seed/address does not match the reserved trade");
  if (makerXrpl !== required("XRPL_MAKER_ADDRESS")) throw new Error("Maker destination does not match configured address");

  const xrpAmount = formatUnits(trade.xrpAmountDrops, 6);
  const memo = String(trade.paymentReference).slice(2).toUpperCase();
  const summary = {
    mode: execute ? "EXECUTE" : "DRY_RUN",
    tradeId,
    from: wallet.classicAddress,
    to: makerXrpl,
    amountXrp: xrpAmount,
    amountDrops: trade.xrpAmountDrops.toString(),
    memoData: memo,
    secondsRemaining: Number(trade.expiry) - latest.timestamp,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (!execute) {
    console.log("Dry run only. Add --execute after reviewing the summary.");
    return;
  }

  const client = new Client(required("XRPL_TESTNET_WS"));
  await client.connect();
  try {
    const payment = await client.autofill({
      TransactionType: "Payment",
      Account: wallet.classicAddress,
      Destination: makerXrpl,
      Amount: xrpToDrops(xrpAmount),
      Memos: [{ Memo: { MemoData: memo } }],
    });
    const signed = wallet.sign(payment);
    const result = await client.submitAndWait(signed.tx_blob);
    const meta = result.result.meta;
    const transactionResult = typeof meta === "object" && meta && "TransactionResult" in meta ? meta.TransactionResult : "unknown";
    if (transactionResult !== "tesSUCCESS") throw new Error(`XRPL payment failed: ${transactionResult}`);
    console.log(JSON.stringify({
      validated: result.result.validated,
      transactionResult,
      hash: signed.hash,
      explorer: `${required("XRPL_TESTNET_EXPLORER_TX_BASE_URL")}${signed.hash}`,
    }, null, 2));
  } finally {
    await client.disconnect();
  }
}

main().finally(() => provider.destroy()).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
