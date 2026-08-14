import { Client, isValidClassicAddress, xrpToDrops } from "xrpl";
import { config } from "./config.js";
import { validatePaymentResult } from "./xrpl-validation.js";

export type ExpectedPayment = { source: string; destination: string; amountDrops: bigint; paymentReference: string };
export type XrplPreflight = { hash: string; source: string; destination: string; amountDrops: bigint; memoHex: string };

export async function preflightPayment(hash: string, expected: ExpectedPayment): Promise<XrplPreflight> {
  if (!/^[A-Fa-f0-9]{64}$/.test(hash)) throw new Error("INVALID_XRPL_HASH");
  if (!isValidClassicAddress(expected.source) || !isValidClassicAddress(expected.destination)) throw new Error("INVALID_XRPL_ADDRESS");
  const client = new Client(config.XRPL_TESTNET_WS);
  await client.connect();
  try {
    const result: any = (await client.request({ command: "tx", transaction: hash.toUpperCase(), binary: false })).result;
    return validatePaymentResult(hash, result, expected);
  } finally { await client.disconnect(); }
}

export const formatXrp = (drops: bigint) => Number(drops) / Number(xrpToDrops("1"));
