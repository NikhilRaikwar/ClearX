import type { Job, MarketPrice, RuntimeConfig, Trade } from "../types";
const base = import.meta.env.VITE_API_BASE_URL || "/api";
async function json<T>(path: string, init?: RequestInit): Promise<T> { const response = await fetch(`${base}${path}`, init); const body = await response.json(); if (!response.ok) throw new Error(body.error || "Request failed"); return body; }
export const api = {
  config: () => json<RuntimeConfig>("/config"),
  publicTrades: () => json<Trade[]>("/trades/public"),
  walletTrades: (address: string) => json<Trade[]>(`/trades/wallet/${address}`),
  trade: (id: string) => json<Trade>(`/trades/${id}`),
  startJob: (tradeId: string, xrplTxHash: string) => json<Job>("/fdc/jobs", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({tradeId,xrplTxHash}) }),
  job: (id: string) => json<Job>(`/fdc/jobs/${id}`),
  marketPrice: () => json<MarketPrice>("/market/xrp-usd"),
};
