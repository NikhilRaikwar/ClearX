import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export const useMarketPrice = () => useQuery({ queryKey: ["market", "xrp-usd"], queryFn: api.marketPrice, refetchInterval: 30_000, staleTime: 25_000, retry: 1 });
export const usd = (value?: number) => value == null || !Number.isFinite(value) ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: value < 1 ? 4 : 2 }).format(value);
export const number = (value: number, digits = 2) => new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
