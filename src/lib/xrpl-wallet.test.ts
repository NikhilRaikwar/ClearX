import { describe, expect, it } from "vitest";
import { buildGemWalletPayment, gemWalletTransactionHash, xrplPaymentGuard } from "./xrpl-wallet";

describe("GemWallet XRP payment", () => {
  const destination = "rGsT9Wu9rWX1jZkFiFWfkBgqRoJNwAbedA";
  const account = "rD3q4dqWrArciu3agzPAAwq5WqhdX5gU3R";
  const reference = "0x64a12d6b3e0f818000f93ee9ee5a1e3e614338f80ffb623a2d5498bd9840ff72";
  it("builds one exact memo without the EVM prefix", () => {
    const payment = buildGemWalletPayment(account, destination, "10000000", reference);
    expect(payment).toEqual({ TransactionType: "Payment", Account: account, Destination: destination, Amount: "10000000", Memos: [{ Memo: { MemoData: reference.slice(2).toUpperCase() } }] });
    expect(payment.Memos).toHaveLength(1);
  });
  it("rejects malformed payment inputs", () => {
    expect(() => buildGemWalletPayment(account, "bad", "100", reference)).toThrow("destination");
    expect(() => buildGemWalletPayment(account, destination, "0", reference)).toThrow("amount");
    expect(() => buildGemWalletPayment(account, destination, "10", "0x1234")).toThrow("32 bytes");
  });
  it("guards network and reserved address", () => {
    expect(xrplPaymentGuard({ installed: true, connected: true, network: "Mainnet", address: "rA", reservedAddress: "rA", expired: false })).toBe("WRONG_NETWORK");
    expect(xrplPaymentGuard({ installed: true, connected: true, network: "Testnet", address: "rA", reservedAddress: "rB", expired: false })).toBe("ADDRESS_MISMATCH");
    expect(xrplPaymentGuard({ installed: true, connected: true, network: "Testnet", address: "rA", reservedAddress: "rA", expired: false })).toBe("READY_TO_PAY");
  });
  it("normalizes valid hashes and explains rejection or missing results", () => {
    expect(gemWalletTransactionHash({ result: { hash: `0x${"ab".repeat(32)}` } })).toBe("AB".repeat(32));
    expect(() => gemWalletTransactionHash({ type: "reject" })).toThrow("rejected");
    expect(() => gemWalletTransactionHash({ result: {} })).toThrow("did not return");
    expect(() => gemWalletTransactionHash({ result: { hash: "0x1234" } })).toThrow("invalid");
  });
});
