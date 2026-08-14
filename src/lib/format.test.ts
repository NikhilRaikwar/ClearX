import { describe, expect, it } from "vitest";
import { canonicalXrplTxHash } from "./format";

describe("canonicalXrplTxHash", () => {
  const hash = "4EE4880D6BC32082094B8F069C809D8C69CA5049D8B6CC61EE62C461C4128172";

  it("removes the EVM bytes32 prefix used by settled trades", () => {
    expect(canonicalXrplTxHash(`0x${hash.toLowerCase()}`)).toBe(hash);
  });

  it("preserves canonical XRPL hashes", () => {
    expect(canonicalXrplTxHash(hash)).toBe(hash);
  });
});
