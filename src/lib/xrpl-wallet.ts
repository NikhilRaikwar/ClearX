import type { Payment } from "xrpl";

export function buildGemWalletPayment(account: string, destination: string, amountDrops: string, paymentReference: string): Payment {
  if (!/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(account)) throw new Error("Invalid XRPL account");
  if (!/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(destination)) throw new Error("Invalid XRPL destination");
  if (!/^\d+$/.test(amountDrops) || BigInt(amountDrops) <= 0n) throw new Error("Invalid XRP amount");
  const memoData = paymentReference.replace(/^0x/i, "").toUpperCase();
  if (!/^[A-F0-9]{64}$/.test(memoData)) throw new Error("Payment reference must be exactly 32 bytes");
  return {
    TransactionType: "Payment",
    Account: account,
    Destination: destination,
    Amount: amountDrops,
    Memos: [{ Memo: { MemoData: memoData } }],
  };
}

export const xrplPaymentGuard = (input: { installed: boolean; connected: boolean; network?: string; address?: string; reservedAddress: string; expired: boolean }) => {
  if (!input.installed) return "WALLET_REQUIRED";
  if (!input.connected) return "WALLET_REQUIRED";
  if (input.network !== "Testnet") return "WRONG_NETWORK";
  if (input.address !== input.reservedAddress) return "ADDRESS_MISMATCH";
  if (input.expired) return "EXPIRED";
  return "READY_TO_PAY";
};

export function gemWalletTransactionHash(response: { type?: string; result?: { hash?: string } }): string {
  const hash = response.result?.hash;
  if (!hash) throw new Error(response.type === "reject" ? "GemWallet payment was rejected" : "GemWallet did not return a transaction hash");
  const normalized = hash.replace(/^0x/i, "").toUpperCase();
  if (!/^[A-F0-9]{64}$/.test(normalized)) throw new Error("GemWallet returned an invalid transaction hash");
  return normalized;
}
