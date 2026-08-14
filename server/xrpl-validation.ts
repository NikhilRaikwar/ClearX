import type { ExpectedPayment, XrplPreflight } from "./xrpl.js";

export function validatePaymentResult(hash: string, result: any, expected: ExpectedPayment): XrplPreflight {
  const tx: any = result.tx_json ?? result; const meta: any = result.meta;
  if (!result.validated) throw new Error("XRPL_TX_NOT_VALIDATED");
  if (tx.TransactionType !== "Payment") throw new Error("XRPL_NOT_PAYMENT");
  if (meta?.TransactionResult !== "tesSUCCESS") throw new Error("XRPL_PAYMENT_FAILED");
  if (tx.Account !== expected.source) throw new Error("XRPL_SOURCE_MISMATCH");
  if (tx.Destination !== expected.destination) throw new Error("XRPL_DESTINATION_MISMATCH");
  const delivered = typeof meta?.delivered_amount === "string" ? BigInt(meta.delivered_amount) : typeof tx.Amount === "string" ? BigInt(tx.Amount) : 0n;
  if (delivered < expected.amountDrops) throw new Error("XRPL_AMOUNT_TOO_LOW");
  if (tx.Flags && (Number(tx.Flags) & 0x00020000) !== 0) throw new Error("XRPL_PARTIAL_PAYMENT_NOT_ALLOWED");
  const memos = tx.Memos ?? [];
  if (memos.length !== 1) throw new Error("XRPL_MEMO_COUNT_INVALID");
  const memoHex = String(memos[0]?.Memo?.MemoData ?? "").toUpperCase();
  if (!/^[A-F0-9]{64}$/.test(memoHex)) throw new Error("XRPL_MEMO_NOT_32_BYTES");
  if (`0x${memoHex}`.toLowerCase() !== expected.paymentReference.toLowerCase()) throw new Error("XRPL_MEMO_MISMATCH");
  return { hash: hash.toUpperCase(), source: tx.Account, destination: tx.Destination, amountDrops: delivered, memoHex };
}
