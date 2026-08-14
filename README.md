![ClearX banner](public/assets/clearX%20banner.png)

# ClearX

### Native XRP settlement without sending first

[![Flare](https://img.shields.io/badge/Flare-Coston2-E62058?style=flat-square)](https://dev.flare.network/)
[![XRPL](https://img.shields.io/badge/XRPL-Testnet-111111?style=flat-square)](https://testnet.xrpl.org/)
[![FDC](https://img.shields.io/badge/Proof-Flare_Data_Connector-FF4F32?style=flat-square)](https://dev.flare.network/fdc/overview)
[![Tests](https://img.shields.io/badge/tests-59_passing-079A61?style=flat-square)](#verification)
[![License](https://img.shields.io/badge/license-MIT-2563EB?style=flat-square)](LICENSE)

[**Live application**](https://clearx-protocol.vercel.app) · [**API health**](https://clearx-protocol.vercel.app/api/health) · [**Verified Coston2 contract**](https://coston2-explorer.flare.network/address/0xf8c3682A1C3cCE91FF3709Cc4907681c98dC0Ce4#code)

ClearX is a non-custodial payment-versus-payment marketplace between native XRP on XRP Ledger and USD₮0 on Flare. A maker funds an escrow on Coston2, a taker pays XRP directly to the maker, and Flare Data Connector proves the external-chain payment before the contract releases USD₮0.

> **Flare Summer Signal · Bounty 1: Interoperable Asset Products**
>
> Target users: OTC traders, treasury operators, XRP holders, market makers, and counterparties who need verifiable bilateral settlement.

## Judge quick path

1. Open the [live app](https://clearx-protocol.vercel.app) and inspect **Open Settlements**, **My Trades**, and **How it works**.
2. Review the completed public-testnet settlement in [demo-evidence.json](demo-evidence.json).
3. Open the [native XRP payment](https://testnet.xrpl.org/transactions/4EE4880D6BC32082094B8F069C809D8C69CA5049D8B6CC61EE62C461C4128172), [FDC voting round](https://coston2-systems-explorer.flare.network/voting-round/1425351?tab=fdc), and [USD₮0 release](https://coston2-explorer.flare.network/tx/0xc01126e7e0a6edc2b2fe26c21eb85bbe30ce8750a980d53e602f044ba442fcf1).
4. Confirm the hosted backend is configured at [the public health endpoint](https://clearx-protocol.vercel.app/api/health).

The app is a real testnet MVP. Do not use mainnet funds or production wallet credentials.

## The problem

Cross-chain OTC trades still depend on one party sending first, a trusted intermediary holding funds, or wrapped assets that change the asset being exchanged. Screenshots and transaction links are evidence for humans, but an EVM contract cannot independently enforce settlement from them.

## The solution

ClearX locks the Flare-side asset before XRP moves. Native XRP travels directly between external XRPL wallets with a trade-specific 32-byte memo. The relayer requests an official FDC attestation, retrieves the finalized proof, and submits it to the ClearX contract. The contract verifies sender, receiver, amount, memo, timestamp, status, proof owner, and replay state before releasing escrow.

| Property | ClearX approach |
|---|---|
| Custody | Neither XRP nor XRPL seeds are held by ClearX |
| XRP payment | Native XRPL `Payment`, signed with GemWallet or an external signer |
| Flare asset | Real test USD₮0 locked in the verified Coston2 contract |
| Cross-chain truth | Official Flare Data Connector payment attestation |
| Settlement | Smart-contract enforced release after proof verification |
| Recovery | Maker cancellation and deadline plus proof-grace reclaim paths |

## Live testnet protocol

| Item | Verified value |
|---|---|
| ClearX contract | [`0xf8c3682A1C3cCE91FF3709Cc4907681c98dC0Ce4`](https://coston2-explorer.flare.network/address/0xf8c3682A1C3cCE91FF3709Cc4907681c98dC0Ce4#code) |
| Deployment transaction | [`0x6e04…33d2`](https://coston2-explorer.flare.network/tx/0x6e04e319f4956899e9ba18147145adf353c43db1ffca626997a99141d4f233d2) |
| Test USD₮0 | [`0xC1A5B41512496B80903D1f32d6dEa3a73212E71F`](https://coston2-explorer.flare.network/address/0xC1A5B41512496B80903D1f32d6dEa3a73212E71F) |
| Network | Flare Coston2, chain ID `114` |
| Source | Verified on Coston2 Explorer |

## Proven end-to-end settlement

Trade `#1` completed on public testnets: the maker locked `5 test USD₮0`, the taker paid `10 test XRP`, FDC finalized voting round `1425351`, and the verified proof released escrow to the taker.

| Evidence | Public transaction |
|---|---|
| Funded trade | [`0x3db295…b3c53`](https://coston2-explorer.flare.network/tx/0x3db2950b8421d26bf175e536c11eb72199b73f44295ae0541950fb373f3b3c53) |
| Taker reservation | [`0xa3eecb…8d34`](https://coston2-explorer.flare.network/tx/0xa3eecb4a0b420047a5eb25946cf19963143df994177732667678bccfb8b48d34) |
| Native XRP payment | [`4EE488…28172`](https://testnet.xrpl.org/transactions/4EE4880D6BC32082094B8F069C809D8C69CA5049D8B6CC61EE62C461C4128172) |
| FDC request | [`0xede8f8…6b10a`](https://coston2-explorer.flare.network/tx/0xede8f8f6655fafe68fa0f33a4a2882cf439bbd428e33508c3a352c9d1f16b10a) |
| FDC consensus | [Voting round `1425351`](https://coston2-systems-explorer.flare.network/voting-round/1425351?tab=fdc) |
| USD₮0 release | [`0xc01126…2fcf1`](https://coston2-explorer.flare.network/tx/0xc01126e7e0a6edc2b2fe26c21eb85bbe30ce8750a980d53e602f044ba442fcf1) |

The maker received 10 XRP, the taker received 5 USD₮0, and contract escrow returned to zero. Machine-readable identifiers are preserved in [`demo-evidence.json`](demo-evidence.json).

## How it works

```mermaid
flowchart LR
  M["Maker funds USD₮0"] --> E["ClearX escrow · Coston2"]
  T["Taker signs native XRP Payment"] --> X["XRP Ledger Testnet"]
  X --> P["Preflight validation"]
  P --> F["Flare Data Connector"]
  F --> V["Finalized Merkle proof"]
  V --> E
  E --> R["USD₮0 released to taker"]
  classDef flare fill:#E62058,color:#fff,stroke:#FF8AA8;
  classDef xrpl fill:#15171A,color:#fff,stroke:#777;
  classDef proof fill:#5B21B6,color:#fff,stroke:#C4B5FD;
  classDef done fill:#078A58,color:#fff,stroke:#6EE7B7;
  class E flare;
  class X xrpl;
  class P,F,V proof;
  class R done;
```

1. Maker approves and locks USD₮0 with the receiving XRPL address and exact XRP amount.
2. Taker reserves the funded trade, binding their Coston2 and XRPL identities.
3. GemWallet signs a native XRP payment with the required single 32-byte memo.
4. The API validates the transaction before spending relayer gas or FDC fees.
5. FDC reaches decentralized consensus and publishes the proof.
6. ClearX verifies every invariant and releases USD₮0 to the bound taker.

## Why Flare is essential

ClearX is not an interface with a superficial wallet connection. The Coston2 contract cannot know what happened on XRPL without a trustworthy external-data protocol. FDC converts the validated native XRP payment into a fact the contract can verify. Removing Flare removes the enforcement mechanism that makes non-custodial settlement possible.

## Product experience

- Fund and publish real Coston2 settlements.
- Discover already-funded offers in Open Markets.
- Track maker, taker, open, reserved, settled, cancelled, and expired states.
- Sign native XRP payments directly through GemWallet without exposing a seed.
- Fall back to any external XRPL signer by submitting its validated hash.
- Follow real XRP preflight, FDC request, consensus, proof, and release progress.
- View live XRP/USD market references without changing agreed contract amounts.
- Inspect Coston2, XRPL, and FDC evidence through the relevant explorers.

## What was built during Summer Signal

- Production smart-contract escrow with identity binding, replay protection, expiry recovery, and official FDC proof verification.
- Real XRPL `Payment` validation and public Coston2 FDC lifecycle.
- Persistent, restart-safe SQLite job engine with deduplication and rate limiting.
- GemWallet Testnet signing with exact single-memo payload and automatic FDC handoff.
- Responsive trading, market discovery, portfolio, settlement, and protocol interfaces.
- Live market-reference service with validation, caching, and stale fallback.
- A real public-testnet settlement with complete transaction evidence.

ClearX was built as a new Flare-native product for this hackathon. The core value is the implemented and demonstrated XRPL-to-Flare settlement path, not a pre-existing product with a token integration added later.

## Architecture and stack

`Solidity` · `Hardhat` · `OpenZeppelin` · `Flare FDC` · `XRPL` · `GemWallet` · `React` · `Vite` · `TypeScript` · `Wagmi` · `Viem` · `TanStack Query` · `Express` · `SQLite`

The relayer cannot fabricate settlement. `ClearXSettlement` independently calls Flare's verifier and checks the attested source, destination, amount, memo, status, timestamp, proof owner, and transaction replay state.

### Hosted deployment

- **Frontend:** Vercel at [clearx-protocol.vercel.app](https://clearx-protocol.vercel.app), with privacy-friendly Vercel Web Analytics.
- **Backend:** Railway Docker service running the Express API and FDC worker.
- **Persistence:** Railway volume mounted at `/app/data` for restart-safe SQLite job state.
- **Networking:** same-origin `/api` requests are proxied by Vercel to Railway, avoiding browser DNS and CORS dependence.
- **Secrets:** the permanent runtime contains the relayer key only; no deployer key or XRPL seed is deployed.

## Verification

```text
17 unit and integration tests
7 Solidity contract tests
35 responsive browser tests across 320, 375, 768, 1024 and 1440 px
TypeScript, ESLint and production build checks
1 completed real XRPL → FDC → Coston2 settlement
```

Test coverage includes contract state transitions, proof mismatches, XRP preflight failures, GemWallet rejection and malformed hashes, market-cache fallback, responsive overflow, wallet CTA visibility, and external-payment fallback.

## Security model

- ClearX never receives or stores an XRPL seed.
- XRP moves directly between externally controlled XRPL accounts.
- Private keys never enter frontend variables or committed files.
- Escrow state changes before token transfers and uses `SafeERC20` plus `ReentrancyGuard`.
- Every XRP transaction settles at most one trade.
- Late or mismatched payments cannot release escrow.
- Public FDC starts are preflighted, deduplicated, persisted, and rate-limited.
- The current deployment is testnet-only and must not be used with real funds.

## Roadmap

| Stage | Next milestone |
|---|---|
| Demo readiness | Public hosted app, judge walkthrough video, mobile wallet QA |
| Protocol hardening | Independent audit, richer relayer monitoring, indexed event discovery |
| Market usability | Quote expiry, reusable counterparties, notifications, settlement receipts |
| Asset expansion | Additional FDC-supported payment rails and Flare-side settlement assets |
| Production path | Mainnet risk review, production token verification, decentralized relayer model |

## Judging criteria

| Criterion | ClearX evidence |
|---|---|
| Product usefulness | Removes send-first and custody risk from bilateral native-XRP settlement |
| Flare integration quality | FDC proof verification is the contract's settlement-enforcement boundary |
| Technical execution | Hosted product, verified contract, persistent relayer, automated tests, and a completed public-testnet settlement |
| Evidence of new work | Contract, relayer, XRPL validation, GemWallet flow, interface, deployment, and real evidence were built during Summer Signal |
| Clarity and future potential | Focused testnet MVP with an explicit security model and a path to more assets, payment rails, and decentralized relaying |

## Known limitations

- ClearX is testnet-only and has not received an independent security audit.
- FDC consensus is asynchronous and may outlast a short live demo.
- A single relayer currently submits requests and proofs, although it cannot forge a proof the contract accepts.
- Trade discovery scans a bounded recent range instead of using a production indexer.
- XRP/USD is a display-only market reference, not an execution oracle.

## Hackathon submission snapshot

- **Hackathon:** Flare Summer Signal
- **Selected bounty:** Bounty 1, Interoperable Asset Products
- **Project:** ClearX
- **Product:** Non-custodial native XRP versus Flare asset settlement
- **Deployment:** Flare Coston2 + XRPL Testnet
- **Repository:** [github.com/NikhilRaikwar/ClearX](https://github.com/NikhilRaikwar/ClearX)
- **Technical evidence:** [demo-evidence.json](demo-evidence.json)
- **Developer:** Nikhil Raikwar

## Documentation

- [Flare/FDC verification](docs-verification.md)
- [Real settlement evidence](demo-evidence.json)

## License

Released under the [MIT License](LICENSE). Copyright © 2026 Nikhil Raikwar.
