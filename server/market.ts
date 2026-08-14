import { z } from "zod";

const coinbaseResponse = z.object({ data: z.object({ amount: z.string(), currency: z.literal("USD") }) });
export type MarketPrice = { priceUsd: number; source: "coinbase"; fetchedAt: string; stale: boolean };

const CACHE_MS = 30_000;
const STALE_MS = 10 * 60_000;
let cached: MarketPrice | undefined;

export async function getXrpUsdPrice(fetcher: typeof fetch = fetch, now = Date.now(), endpoint = "https://api.coinbase.com/v2/prices/XRP-USD/spot"): Promise<MarketPrice> {
  if (cached && now - Date.parse(cached.fetchedAt) < CACHE_MS) return cached;
  try {
    const response = await fetcher(endpoint, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) throw new Error(`Coinbase returned ${response.status}`);
    const parsed = coinbaseResponse.parse(await response.json());
    const priceUsd = Number(parsed.data.amount);
    if (!Number.isFinite(priceUsd) || priceUsd <= 0) throw new Error("Invalid XRP/USD price");
    cached = { priceUsd, source: "coinbase", fetchedAt: new Date(now).toISOString(), stale: false };
    return cached;
  } catch (error) {
    if (cached && now - Date.parse(cached.fetchedAt) <= STALE_MS) return { ...cached, stale: true };
    throw error;
  }
}

export function resetMarketCache() { cached = undefined; }
