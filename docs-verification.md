# ClearX Flare documentation verification

Verified on 2026-08-14 through the configured official `flare-devhub` MCP (`https://dev.flare.network/mcp`). The MCP tools used were `docs_search` and `docs_fetch`.

## Network and asset configuration

| Item | Verified value |
|---|---|
| Network | Flare Testnet Coston2 |
| Chain ID | `114` |
| Native token | C2FLR, 18 decimals |
| HTTPS RPC | `https://coston2-api.flare.network/ext/C/rpc` |
| WSS RPC | `wss://coston2-api.flare.network/ext/C/ws` |
| Explorer | `https://coston2-explorer.flare.network` |
| Systems explorer | `https://coston2-systems-explorer.flare.network` |
| Faucet | `https://faucet.flare.network/coston2` |
| Supported EVM target | Cancun |
| Flare Contract Registry | `0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019` on every Flare network |

The faucet currently advertises C2FLR, FXRP, and test USD₮0. The faucet token address is deliberately not trusted from the PRD. `USDT0_ADDRESS` remains unset until the token received from the faucet is verified on Coston2 Explorer and its `symbol()` and `decimals()` are read onchain.

## FDC payment implementation

- ClearX uses the public generic `Payment` attestation and `IPayment.Proof`.
- Source ID is the zero-padded bytes32 UTF-8 value `testXRP`.
- XRPL request body is `transactionId`, `inUtxo = 0`, and `utxo = 0`.
- XRPL requires 3 confirmations, normally about 12 seconds.
- A standard XRPL payment reference exists only when the transaction contains exactly one Memo and its `MemoData` represents exactly 32 bytes.
- XRPL standard address hashes are `keccak256(bytes(classicAddress))`; XRPL addresses have one case-sensitive standard representation.
- The response fields used by ClearX are `sourceAddressHash`, `receivingAddressHash`, `receivedAmount`, `standardPaymentReference`, `oneToOne`, `status`, and `blockTimestamp`.
- Success status is `0`. XRPL payments are one-to-one by definition, but ClearX checks the flag defensively.
- Verification is `ContractRegistry.getFdcVerification().verifyPayment(proof)`.
- The FDC protocol ID must be read through `IFdcVerification.fdcProtocolId()` rather than hardcoded.

The public reference index exposes an `IXRPPayment` interface, but current public DevHub search and the supported payment guide establish generic `Payment` as the documented Coston2 integration path. This corrects the optional XRPPayment assumption in the build plan while preserving every ClearX payment invariant.

## Request lifecycle

1. Prepare through the XRP Payment verifier endpoint using the testnet verifier base URL.
2. Resolve `FdcRequestFeeConfigurations`, `FdcHub`, `FlareSystemsManager`, `Relay`, and `FdcVerification` using `ContractRegistry`.
3. Query the exact request fee and call `FdcHub.requestAttestation` with that value.
4. Record the confirmed request block and voting round.
5. Poll Relay finalization using the runtime FDC protocol ID.
6. Retrieve the response and Merkle proof from the testnet DA Layer using the same request bytes and round ID.
7. ABI-decode the response using the installed current Flare periphery artifact and submit `IPayment.Proof` to ClearX.

The rate-limited public verifier and DA Layer are suitable for this testnet hackathon MVP. A production mainnet service would operate dedicated infrastructure.

## Sources fetched through MCP

- `https://dev.flare.network/network/overview`
- `https://dev.flare.network/fdc/attestation-types/payment`
- `https://dev.flare.network/fdc/guides/hardhat/payment`
- `https://dev.flare.network/fdc/getting-started`
- `https://dev.flare.network/fdc/reference/IPayment`
- `https://dev.flare.network/fdc/reference/IFdcVerification`
- `https://dev.flare.network/fdc/reference`
- `https://dev.flare.network/network/guides/flare-contracts-registry`

