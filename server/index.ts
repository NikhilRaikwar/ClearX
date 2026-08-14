import express from "express";
import cors from "cors";
import helmet from "helmet";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { Contract, JsonRpcProvider } from "ethers";
import { config, isConfigured } from "./config.js";
import { clearXAbi } from "./abi.js";
import { findSettledByTrade, getJob } from "./db.js";
import { resumeJobs, startJob } from "./fdc.js";
import { getXrpUsdPrice } from "./market.js";

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.NODE_ENV === "production" ? config.PUBLIC_APP_URL : true }));
app.use(express.json({ limit: "32kb" }));

const starts = new Map<string, number[]>();
const startSchema = z.object({ tradeId: z.string().regex(/^\d+$/), xrplTxHash: z.string().regex(/^[A-Fa-f0-9]{64}$/) });

app.get("/api/health", (_req, res) => res.json({ ok: true, network: "coston2", configured: isConfigured(), timestamp: new Date().toISOString() }));
app.get("/api/config", (_req, res) => res.json({ chainId: config.COSTON2_CHAIN_ID, rpcUrl: config.COSTON2_RPC_URL, explorerUrl: config.COSTON2_EXPLORER_URL, systemsExplorerUrl: config.COSTON2_SYSTEMS_EXPLORER_URL, faucetUrl: config.COSTON2_FAUCET_URL, xrplExplorerTxBaseUrl: config.XRPL_TESTNET_EXPLORER_TX_BASE_URL, clearXContractAddress: config.CLEARX_CONTRACT_ADDRESS || null, usdt0Address: config.USDT0_ADDRESS || null, deploymentBlock: config.CLEARX_DEPLOYMENT_BLOCK, configured: isConfigured() }));
app.get("/api/market/xrp-usd", async (_req, res) => { try { return res.json(await getXrpUsdPrice(fetch, Date.now(), config.MARKET_PRICE_URL)); } catch { return res.status(503).json({ error: "XRP/USD market reference is temporarily unavailable" }); } });
app.post("/api/fdc/jobs", async (req, res) => {
  const parsed = startSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: "Invalid trade ID or XRPL transaction hash" });
  const ip = req.ip ?? "unknown"; const cutoff = Date.now() - 3600000; const recent = (starts.get(ip) ?? []).filter((t) => t > cutoff);
  if (recent.length >= config.FDC_START_RATE_LIMIT_PER_HOUR) return res.status(429).json({ error: "FDC request limit reached. Try again later." });
  starts.set(ip, [...recent, Date.now()]);
  try { return res.status(202).json(await startJob(parsed.data.tradeId, parsed.data.xrplTxHash)); }
  catch (error) { return res.status(409).json({ error: error instanceof Error ? error.message : "Unable to create settlement job" }); }
});
app.get("/api/fdc/jobs/:id", (req, res) => { const job = getJob(req.params.id); return job ? res.json(job) : res.status(404).json({ error: "Job not found" }); });

const provider = new JsonRpcProvider(config.COSTON2_RPC_URL, config.COSTON2_CHAIN_ID);
async function settlementTxHash(contract: Contract, tradeId: string, status: number) {
  if (status !== 3) return undefined;
  const persisted = findSettledByTrade(tradeId)?.settlementTxHash;
  if (persisted) return persisted;
  try {
    const latest = await provider.getBlockNumber();
    for (let to = latest; to >= config.CLEARX_DEPLOYMENT_BLOCK; to -= 2_000) {
      const from = Math.max(config.CLEARX_DEPLOYMENT_BLOCK, to - 1_999);
      const events = await contract.queryFilter(contract.filters.TradeSettled(BigInt(tradeId)), from, to);
      if (events.length) return events.at(-1)?.transactionHash;
    }
  } catch { return undefined; }
  return undefined;
}
async function readTrades(wallet?: string) {
  if (!config.CLEARX_CONTRACT_ADDRESS) return [];
  const contract = new Contract(config.CLEARX_CONTRACT_ADDRESS, clearXAbi, provider);
  const next = Number(await contract.nextTradeId()); const trades = [];
  for (let id = Math.max(1, next - 250); id < next; id++) {
    const t = await contract.trades(id);
    if ((!wallet && t.isPublic && Number(t.status) === 1) || (wallet && (t.maker.toLowerCase() === wallet.toLowerCase() || t.taker.toLowerCase() === wallet.toLowerCase()))) trades.push({ id: t.id.toString(), maker: t.maker, taker: t.taker, makerXrplAddress: await contract.makerXrplAddresses(id), takerXrplAddress: await contract.takerXrplAddresses(id), usdt0Amount: t.usdt0Amount.toString(), xrpAmountDrops: t.xrpAmountDrops.toString(), paymentReference: t.paymentReference, expiry: Number(t.expiry), isPublic: t.isPublic, status: Number(t.status), settlementXrplTx: t.settlementXrplTx });
  }
  return trades.reverse();
}
app.get("/api/trades/public", async (_req, res) => { try { res.json(await readTrades()); } catch { res.status(503).json({ error: "Coston2 is temporarily unavailable" }); } });
app.get("/api/trades/wallet/:address", async (req, res) => { if (!/^0x[0-9a-fA-F]{40}$/.test(req.params.address)) return res.status(400).json({ error: "Invalid wallet address" }); try { return res.json(await readTrades(req.params.address)); } catch { return res.status(503).json({ error: "Coston2 is temporarily unavailable" }); } });
app.get("/api/trades/:id", async (req, res) => {
  if (!/^\d+$/.test(req.params.id) || !config.CLEARX_CONTRACT_ADDRESS) return res.status(404).json({ error: "Trade not found" });
  try {
    const contract = new Contract(config.CLEARX_CONTRACT_ADDRESS, clearXAbi, provider); const t = await contract.trades(req.params.id);
    if (Number(t.id) === 0) return res.status(404).json({ error: "Trade not found" });
    const status = Number(t.status);
    return res.json({ id: t.id.toString(), maker: t.maker, taker: t.taker, makerXrplAddress: await contract.makerXrplAddresses(req.params.id), takerXrplAddress: await contract.takerXrplAddresses(req.params.id), usdt0Amount: t.usdt0Amount.toString(), xrpAmountDrops: t.xrpAmountDrops.toString(), paymentReference: t.paymentReference, expiry: Number(t.expiry), isPublic: t.isPublic, status, settlementXrplTx: t.settlementXrplTx, settlementTxHash: await settlementTxHash(contract, req.params.id, status) });
  } catch { return res.status(503).json({ error: "Unable to read trade" }); }
});

const webRoot = resolve("dist");
if (existsSync(webRoot)) { app.use(express.static(webRoot)); app.get("/{*path}", (_req, res) => res.sendFile(resolve(webRoot, "index.html"))); }

const server = app.listen(config.PORT, "0.0.0.0", () => { console.log(`ClearX listening on ${config.PORT}`); resumeJobs(); });
const shutdown = () => server.close(() => { provider.destroy(); process.exit(0); });
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
