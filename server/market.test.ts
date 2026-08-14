import { afterEach, describe, expect, it, vi } from "vitest";
import { getXrpUsdPrice, resetMarketCache } from "./market.js";

afterEach(resetMarketCache);
const ok = (amount = "2.35") => vi.fn(async () => new Response(JSON.stringify({ data: { amount, currency: "USD" } }), { status: 200 }));

describe("XRP/USD market service", () => {
  it("validates and caches Coinbase spot prices", async () => {
    const fetcher = ok();
    expect(await getXrpUsdPrice(fetcher, 1_700_000_000_000)).toMatchObject({ priceUsd: 2.35, stale: false, source: "coinbase" });
    await getXrpUsdPrice(fetcher, 1_700_000_010_000);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("returns a stale recent value when the provider fails", async () => {
    await getXrpUsdPrice(ok(), 1_700_000_000_000);
    const failing = vi.fn(async () => { throw new Error("offline"); });
    expect(await getXrpUsdPrice(failing, 1_700_000_031_000)).toMatchObject({ priceUsd: 2.35, stale: true });
  });
  it("rejects malformed and non-positive prices", async () => {
    await expect(getXrpUsdPrice(ok("0"), 1_700_000_000_000)).rejects.toThrow("Invalid XRP/USD price");
  });
});
