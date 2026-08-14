# ClearX — Product Requirements Document (MVP)

**Hackathon:** Flare Summer Signal  
**Track:** Bounty 1 — Interoperable Asset Products  
**Target network:** Flare Testnet Coston2 + XRP Ledger Testnet  
**Build goal:** A working, end-to-end payment-versus-payment settlement product where one party locks USDT0 on Coston2, the counterparty pays native testXRP on XRPL Testnet, Flare Data Connector (FDC) verifies the XRP payment, and the Coston2 contract atomically releases USDT0.

**Status:** Build-from-scratch hackathon MVP  
**PRD version:** 1.0  
**Verified against Flare docs:** 2026-08-14

---

## 0. Codex instructions — read this first

Build exactly the MVP in this document. Do **not** expand scope until the happy path works end-to-end on public testnets.

Priority order:

1. Deploy and test the settlement contract on Coston2.
2. Make a real native testXRP payment on XRPL Testnet with the required 32-byte memo.
3. Obtain an FDC `Payment` attestation for that XRPL transaction.
4. Pass the FDC proof into the ClearX contract and release real Coston2 USDT0.
5. Wire the supplied Lovable/React UI to the above flow.
6. Add explorer links and polished states.
7. Only then add cancellation / timeout polish.

**Do not add:** AI agents, FTSO, Smart Accounts, FXRP minting, swaps, liquidity routing, non-payment proofs, orderbooks, user accounts, databases, chat, KYC, mainnet, or extra protocols for the MVP.

The winning demo is the cross-chain settlement itself.

---

# 1. Product thesis

## One-line pitch

**ClearX is trust-minimized payment-versus-payment settlement between native XRP and assets on Flare.**

## Short product description

Two counterparties want to exchange native XRP for an asset on Flare without either side sending first and trusting the other.

With ClearX:

1. The maker locks USDT0 in a Coston2 settlement contract.
2. The taker reserves the trade and sends native testXRP directly to the maker on XRPL Testnet.
3. The payment contains a trade-specific 32-byte reference.
4. Flare Data Connector independently proves that the exact XRP payment succeeded.
5. The ClearX smart contract verifies the FDC proof and releases the locked USDT0 to the taker.

No operator decides whether payment happened. No backend can fabricate settlement. The backend may relay FDC requests, but the ClearX contract only releases funds when Flare's onchain FDC verifier accepts the proof.

---

# 2. Why this fits Summer Signal Track 1

The hackathon asks for products that make assets more useful across Flare and connected ecosystems, with strong submissions showing:

- a real user problem,
- meaningful Flare integration,
- a working product,
- practical post-hackathon potential.

ClearX is specifically an **interoperable asset product**:

```text
Native XRP on XRPL
        |
        |  payment
        v
Flare Data Connector
        |
        |  cryptographic / consensus-backed attestation
        v
ClearX on Coston2
        |
        |  settlement
        v
USDT0 on Flare
```

### Why Flare is not superficial

Without FDC, a Flare smart contract cannot independently know whether a native XRP payment happened on XRPL. A centralized backend, exchange, oracle, or one counterparty would have to be trusted.

FDC is therefore the missing settlement primitive:

> **external native-asset payment -> verifiable fact -> onchain asset release**

This should be the center of the hackathon pitch.

---

# 3. Exact target user

## Primary MVP user

**OTC trader / treasury operator / market maker exchanging native XRP against a Flare asset.**

Example:

- Alice wants 25 USDT0.
- Bob wants 10 XRP.
- Bob already has USDT0 on Flare.
- Alice has native XRP on XRPL.
- They agree on a rate off-platform.
- Their problem is settlement principal risk: who sends first?

ClearX does **not** try to discover the price in V1. It settles an already-agreed trade safely.

## Secondary future users

- OTC desks
- DAO / protocol treasuries
- XRP-native businesses
- cross-chain market makers
- broker platforms
- treasury rebalancing products
- RWA / stablecoin settlement providers

---

# 4. Painful workflow today

A bilateral cross-chain trade often looks like:

```text
Alice: "Send the USDT0 first."
Bob:   "No, send the XRP first."

Alice sends first -> Bob can disappear.
Bob sends first   -> Alice can disappear.
```

Alternatives add trust or operational overhead:

- centralized exchange custody,
- an escrow operator,
- manual settlement desk,
- multisig coordination,
- screenshots / explorer checks,
- legal counterparty limits.

The core pain is **principal settlement risk**.

ClearX's job is not to be a DEX. Its job is to make both legs conditionally safe.

---

# 5. Hackathon judging alignment

## Product usefulness

**Question:** Does this solve a real user / ecosystem problem?

**ClearX answer:** It removes "who sends first?" risk from native XRP <-> Flare asset settlement.

## Flare integration quality

**Question:** Is Flare necessary?

**ClearX answer:** Yes. FDC converts the native XRPL payment into a fact a Coston2 smart contract can independently verify. The asset escrow and release happen on Flare.

## Technical execution

The demo must show all of these:

- Coston2 USDT0 approval transaction
- Coston2 ClearX trade creation transaction
- XRPL Testnet native XRP payment
- FDC attestation request
- FDC round finalization
- FDC proof accepted by ClearX
- USDT0 transfer to the taker
- explorer links for both chains

## Evidence of new work

Submission text:

> ClearX was built from scratch for Flare Summer Signal. During the program we built the Coston2 settlement contract, XRP payment reference scheme, FDC attestation relay, XRPL Testnet payment validation flow, and the complete web interface.

## Clarity and future potential

V1 settles:

> native XRP <-> USDT0 on Flare.

Future:

> native XRP <-> any approved Flare asset, then API / SDK settlement infrastructure for OTC desks and treasury products.

---

# 6. MVP scope

## Must ship

- [ ] One-page responsive web app
- [ ] Connect EVM wallet to Coston2
- [ ] Show current Coston2 network status
- [ ] Maker creates trade: USDT0 amount, XRP amount, maker XRPL receiving address, expiry
- [ ] Approve USDT0
- [ ] Lock USDT0 in `ClearXSettlement.sol`
- [ ] Generate a unique 32-byte XRP payment reference
- [ ] Generate shareable trade URL
- [ ] Taker opens trade URL
- [ ] Taker connects Coston2 wallet
- [ ] Taker enters XRPL source address and reserves trade
- [ ] UI displays exact XRPL destination, exact XRP amount, and exact 32-byte memo
- [ ] Taker pays from XRPL Testnet wallet
- [ ] Taker pastes XRPL transaction hash
- [ ] App verifies the tx exists on XRPL as a quick UX precheck
- [ ] FDC `Payment` attestation is requested using `sourceId = testXRP`
- [ ] Wait for FDC voting round finalization
- [ ] Retrieve Merkle proof + `IPayment.Response`
- [ ] Submit proof to `ClearXSettlement.settleTrade`
- [ ] Contract verifies FDC proof and trade invariants
- [ ] Contract releases locked USDT0 to taker
- [ ] Final success screen with XRPL + Coston2 explorer links
- [ ] Maker can cancel an OPEN, untaken trade
- [ ] Maker can reclaim a TAKEN but unpaid trade only after expiry + settlement grace period

## Explicit non-goals

Do not build for MVP:

- price discovery
- AMM
- orderbook
- matching engine
- multi-token routing
- mainnet
- FXRP conversion
- native XRP custody
- XRPL wallet seed handling
- internal wallet generation
- KYC
- database-backed user profiles
- admin dashboard
- fees
- disputes
- FDC non-payment proof
- cross-chain generalized messaging

---

# 7. Core product flow

## Actor definitions

**Maker**
- owns USDT0 on Coston2;
- wants native XRP;
- locks the Flare-side leg.

**Taker**
- owns native XRP on XRPL Testnet;
- wants USDT0 on Coston2;
- pays the XRP leg.

**FDC relayer**
- operational helper only;
- requests FDC attestation, waits for finalization, obtains proof, and calls settlement;
- cannot forge an accepted payment because ClearX verifies the proof using Flare's official `FdcVerification`.

---

# 8. Detailed happy path

## Step 1 — Maker connects to Coston2

Required network:

```text
Network: Flare Testnet Coston2
Chain ID: 114
RPC: https://coston2-api.flare.network/ext/C/rpc
Native gas token: C2FLR
Explorer: https://coston2-explorer.flare.network
```

If wrong chain:
- show inline warning;
- offer "Switch to Coston2".

Maker needs test:
- C2FLR for gas;
- USDT0 from official Coston2 faucet.

Official faucet:
`https://faucet.flare.network/coston2`

---

## Step 2 — Maker configures trade

Form:

```text
I LOCK
25 USDT0

I RECEIVE
10 XRP

Receive XRP at
rXXXXXXXXXXXXXXXXXXXXXXXXXXXX

Trade expires
20 minutes
```

Validation:
- USDT0 > 0
- XRP > 0
- XRP amount converted to drops as integer: `1 XRP = 1_000_000 drops`
- expiry >= 10 minutes and <= 24 hours
- XRPL address starts with `r`
- optional client-side validation using `xrpl.isValidClassicAddress`

The contract stores the standardized-address hash as:

```solidity
keccak256(bytes(makerXrplAddress))
```

Flare FDC's standard XRPL address hash uses `keccak256` of the standardized address string. For classic `r...` addresses, the standardized representation is the classic address.

---

## Step 3 — USDT0 approval and trade creation

Two EVM transactions are acceptable for hackathon MVP:

1. `USDT0.approve(CLEARX_CONTRACT, amount)`
2. `ClearXSettlement.createTrade(...)`

Do not over-engineer permit support.

Trade creation transfers USDT0 into the contract with `SafeERC20.safeTransferFrom`.

After creation:

```text
TRADE #42
25 USDT0 LOCKED
Awaiting taker
```

Generate:

```text
https://clearx.app/trade/42
```

For a single-page SPA, route may still be `/trade/:id`.

---

# 9. Payment-reference design

The XRP payment needs a unique **32-byte MemoData** because FDC `Payment` maps an XRPL transaction's exactly-32-byte MemoData to `standardPaymentReference`.

Generate onchain:

```solidity
paymentReference = keccak256(
    abi.encode(
        block.chainid,
        address(this),
        tradeId,
        maker,
        usdt0Amount,
        xrpAmountDrops,
        expiry
    )
);
```

This is already `bytes32`.

The XRPL payment must contain **exactly one Memo** whose `MemoData` is the 64-hex-character value of `paymentReference` without the `0x` prefix.

Example:

```json
{
  "TransactionType": "Payment",
  "Account": "rTAKER...",
  "Destination": "rMAKER...",
  "Amount": "10000000",
  "Memos": [
    {
      "Memo": {
        "MemoData": "A1B2...64_HEX_CHARS_TOTAL"
      }
    }
  ]
}
```

Important:
- `Amount` is drops.
- use direct XRP Payment;
- do not use partial payment;
- exactly one memo;
- MemoData must represent exactly 32 bytes.

---

# 10. Taker reservation

Before the XRP payment, the taker connects their Coston2 wallet and enters the exact XRPL account they will pay from.

Call:

```solidity
acceptTrade(uint256 tradeId, string calldata takerXrplAddress)
```

Contract stores:

```text
takerEvm = msg.sender
takerXrplAddressHash = keccak256(bytes(takerXrplAddress))
status = TAKEN
```

Why this is required:
- prevents a random third party from submitting another XRP transfer;
- binds the expected XRPL payer to the EVM address that will receive USDT0;
- makes proof submission safe even if a relayer calls `settleTrade`.

Once TAKEN:
- maker cannot cancel immediately;
- another taker cannot replace the reservation.

---

# 11. XRP payment UX

The app shows a dedicated "Pay on XRP Ledger" state.

Display:

```text
Send exactly
10 XRP

To
rMAKER...

Memo / payment reference
0xABCD...

Network
XRPL Testnet
```

Buttons:
- Copy address
- Copy XRP amount
- Copy memo
- Open XRPL Testnet explorer (after payment)
- "I have paid — verify transaction"

The UI must **never ask for an XRPL seed or private key**.

For MVP, the user makes the payment using any external XRPL Testnet wallet/tool.

Optional convenience:
- QR containing payment fields;
- deep link if easy.

Not a blocker.

---

# 12. XRPL transaction preflight

After payment, taker pastes the XRPL transaction hash.

Backend / API does a **non-authoritative preflight** using XRPL Testnet RPC:

`https://s.altnet.rippletest.net:51234/`

or WebSocket:

`wss://s.altnet.rippletest.net:51233/`

Using `xrpl.js`, fetch the validated transaction.

Preflight checks for UX only:
- transaction exists;
- transaction type = Payment;
- result = success;
- destination looks correct;
- amount looks correct;
- memo looks correct.

If preflight fails, do not waste an FDC attestation request.

**Security note:** preflight never releases funds. Only FDC proof validation inside `ClearXSettlement` can release USDT0.

---

# 13. Flare Data Connector integration

## Use attestation type

Use the generic Flare FDC:

```text
attestationType = Payment
sourceId = testXRP
```

Do **not** depend on the newer `IXRPPayment` consumer interface for MVP because the documented public `IFdcVerification` entry point directly supports `IPayment.Proof` through `verifyPayment`.

For XRPL:
- `inUtxo = 0`
- `utxo = 0`

The `IPayment.ResponseBody` contains everything needed:

- `sourceAddressHash`
- `receivingAddressHash`
- `receivedAmount`
- `standardPaymentReference`
- `oneToOne`
- `status`
- `blockTimestamp`

This is enough for ClearX.

---

# 14. FDC executor / relayer flow

Implement a thin Node/TypeScript serverless API or Node service. It is an **executor**, not a trusted oracle.

Recommended file:

```text
api/fdc/settle.ts
```

Request:

```json
{
  "tradeId": "42",
  "xrplTxHash": "ABCDEF..."
}
```

Response should stream/poll through statuses or expose a job endpoint.

For hackathon simplicity, the frontend can poll:

```text
POST /api/fdc/start
GET  /api/fdc/status/:jobId
```

The relayer may keep in-memory state for the live demo. A persistent DB is not required.

## FDC stages

### A. Prepare verifier request

Official testnet verifier base:

`https://fdc-verifiers-testnet.flare.network`

For XRP Payment:

```text
/verifier/xrp/Payment/prepareRequest
```

Body concept:

```json
{
  "attestationType": "<bytes32 utf8 Payment>",
  "sourceId": "<bytes32 utf8 testXRP>",
  "requestBody": {
    "transactionId": "0x<XRPL_TX_HASH>",
    "inUtxo": "0",
    "utxo": "0"
  }
}
```

Use the official public verifier API key from current Flare network docs:

```text
00000000-0000-0000-0000-000000000000
```

Prefer copying/adapting the current Flare Hardhat starter helper functions:
- `prepareAttestationRequestBase`
- `submitAttestationRequest`
- `retrieveDataAndProofBase`
- contract-registry getters

Do not re-invent FDC encoding if the official helper code can be used.

### B. Submit attestation request on Coston2

Resolve protocol addresses through Flare Contract Registry whenever practical.

Registry:

```text
0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019
```

Resolve at runtime:
- `FdcHub`
- `FdcRequestFeeConfigurations`
- `FlareSystemsManager`
- `Relay`
- `FdcVerification`

Flow:

```text
getRequestFee(abiEncodedRequest)
        |
        v
FdcHub.requestAttestation(...)
        |
        v
calculate voting round ID
```

Relayer pays FDC request gas / fee using C2FLR.

### C. Wait for finalization

FDC rounds normally finalize in approximately 90–180 seconds.

Read:
- `FdcVerification.fdcProtocolId()`
- `Relay.isFinalized(protocolId, roundId)`

Poll every ~5–10 seconds.

Frontend status:

```text
XRP payment found          ✓
FDC request submitted      ✓
FDC consensus              ...
Final proof                pending
```

Never fake instant FDC completion.

### D. Retrieve proof

Current Coston2 DA layer:

`https://ctn2-data-availability.flare.network`

Use:

```text
/api/v1/fdc/proof-by-request-round-raw
```

with:
- voting round id
- request bytes / encoded request

Retrieve:
- Merkle proof array
- ABI encoded `IPayment.Response`

Decode using the current Flare periphery ABI / generated TypeChain types.

### E. Call ClearX settlement

Relayer calls:

```solidity
settleTrade(tradeId, proof)
```

The relayer can be any EVM account. Settlement recipient is already bound in the trade.

---

# 15. Smart contract specification

File:

```text
contracts/ClearXSettlement.sol
```

Solidity:
`^0.8.25`

Set EVM target to:
`cancun`

Use:
- OpenZeppelin `SafeERC20`
- OpenZeppelin `ReentrancyGuard`
- Flare Coston2 periphery contracts
- `ContractRegistry`
- `IFdcVerification`
- `IPayment`

Suggested imports:

```solidity
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";
import {IFdcVerification} from "@flarenetwork/flare-periphery-contracts/coston2/IFdcVerification.sol";
import {IPayment} from "@flarenetwork/flare-periphery-contracts/coston2/IPayment.sol";
```

---

# 16. Contract data model

```solidity
enum TradeStatus {
    NONE,
    OPEN,
    TAKEN,
    SETTLED,
    CANCELLED
}

struct Trade {
    uint256 id;
    address maker;
    address taker;
    uint256 usdt0Amount;
    uint256 xrpAmountDrops;

    bytes32 makerXrplAddressHash;
    bytes32 takerXrplAddressHash;
    bytes32 paymentReference;

    uint64 createdAt;
    uint64 expiry;

    bytes32 settlementXrplTx;
    TradeStatus status;
}
```

Mappings:

```solidity
mapping(uint256 => Trade) public trades;
mapping(bytes32 => bool) public processedXrplTransactions;
uint256 public nextTradeId;
```

Immutable:

```solidity
IERC20 public immutable USDT0;
```

Constant:

```solidity
uint64 public constant SETTLEMENT_GRACE = 15 minutes;
```

---

# 17. Contract methods

## `createTrade`

Suggested signature:

```solidity
function createTrade(
    uint256 usdt0Amount,
    uint256 xrpAmountDrops,
    string calldata makerXrplAddress,
    uint64 expiry
) external nonReentrant returns (uint256 tradeId);
```

Requirements:
- amounts > 0
- expiry > block.timestamp + minimum window
- expiry <= block.timestamp + 24 hours
- non-empty maker XRPL address

Actions:
1. increment trade id;
2. derive payment reference;
3. store maker XRPL standardized hash as `keccak256(bytes(makerXrplAddress))`;
4. transfer USDT0 from maker into contract;
5. emit `TradeCreated`.

---

## `acceptTrade`

```solidity
function acceptTrade(
    uint256 tradeId,
    string calldata takerXrplAddress
) external;
```

Requirements:
- status OPEN
- not expired
- maker != msg.sender
- non-empty taker XRPL address

Actions:
- set taker = msg.sender
- set `takerXrplAddressHash = keccak256(bytes(takerXrplAddress))`
- status TAKEN
- emit `TradeTaken`

---

## `settleTrade`

```solidity
function settleTrade(
    uint256 tradeId,
    IPayment.Proof calldata proof
) external nonReentrant;
```

### Mandatory proof checks

```text
1. trade.status == TAKEN

2. ContractRegistry.getFdcVerification()
   .verifyPayment(proof) == true

3. proof.data.sourceId == bytes32("testXRP" padded)

4. response.status == 0

5. response.oneToOne == true

6. response.sourceAddressHash
   == trade.takerXrplAddressHash

7. response.receivingAddressHash
   == trade.makerXrplAddressHash

8. response.receivedAmount
   >= int256(trade.xrpAmountDrops)

9. response.standardPaymentReference
   == trade.paymentReference

10. response.blockTimestamp
    <= trade.expiry

11. proof.data.requestBody.transactionId
    has not already been processed
```

Then:

```text
processedXrplTransactions[txId] = true
trade.status = SETTLED
trade.settlementXrplTx = txId

USDT0.safeTransfer(trade.taker, trade.usdt0Amount)
```

Emit `TradeSettled`.

### Checks-effects-interactions

Update state before USDT0 transfer.

---

## `cancelOpenTrade`

```solidity
function cancelOpenTrade(uint256 tradeId) external nonReentrant;
```

Only maker.

Allowed only when:
- `status == OPEN`

Return locked USDT0 to maker.

---

## `reclaimExpiredTrade`

```solidity
function reclaimExpiredTrade(uint256 tradeId) external nonReentrant;
```

Only maker.

Allowed when:
- `status == TAKEN`
- `block.timestamp > expiry + SETTLEMENT_GRACE`

Why grace exists:
- taker may have paid just before the expiry;
- FDC can take ~90–180 seconds to finalize;
- maker must not reclaim while a valid pre-expiry payment proof is still being produced.

Use a generous 15-minute MVP grace.

---

# 18. Contract events

```solidity
event TradeCreated(
    uint256 indexed tradeId,
    address indexed maker,
    uint256 usdt0Amount,
    uint256 xrpAmountDrops,
    bytes32 makerXrplAddressHash,
    bytes32 paymentReference,
    uint64 expiry
);

event TradeTaken(
    uint256 indexed tradeId,
    address indexed taker,
    bytes32 takerXrplAddressHash
);

event TradeSettled(
    uint256 indexed tradeId,
    bytes32 indexed xrplTransactionId,
    address indexed taker,
    uint256 usdt0Amount,
    uint256 xrpAmountDrops
);

event TradeCancelled(
    uint256 indexed tradeId
);
```

---

# 19. Important security invariants

These are not optional.

## S1 — backend cannot release funds by itself

`settleTrade` must independently call the official Flare FDC verification contract.

## S2 — proof is bound to exact trade

Check:
- source address hash
- destination address hash
- received amount
- 32-byte standard payment reference
- success status
- one-to-one payment
- payment timestamp

## S3 — transaction cannot settle twice

`processedXrplTransactions[txId]`.

## S4 — taker cannot be replaced

After `acceptTrade`, trade is TAKEN until settled or maker reclaims after expiry + grace.

## S5 — USDT0 cannot be stolen via reentrancy

Use:
- ReentrancyGuard
- SafeERC20
- state update before transfer

## S6 — no private key handling in frontend

Never request:
- XRPL seed
- XRPL secret
- EVM private key

Use external wallets.

## S7 — late XRP payment does not settle

Proof's XRPL `blockTimestamp` must be <= trade expiry.

UI must warn the user not to pay once the countdown is too low.

---

# 20. Failure states

## Maker lacks USDT0

UI:
`Insufficient USDT0 balance`

Offer faucet link.

## Maker lacks C2FLR

UI:
`You need C2FLR for testnet gas`

Offer faucet link.

## Wrong Coston2 chain

Prompt network switch.

## Taker enters wrong XRPL source address

Trade cannot settle if payment comes from another XRPL account.

Show a confirmation before `acceptTrade`:

> "You must send XRP from exactly this XRPL address."

## Taker sends wrong amount

FDC proof is valid but contract rejects amount check.

## Taker sends without 32-byte memo

FDC `Payment` may not have matching `standardPaymentReference`; settlement rejects.

## Taker pays wrong destination

`receivingAddressHash` mismatch; settlement rejects.

## FDC request takes time

Show transparent state with real round ID and systems explorer link.

## FDC proof is invalid

No asset movement.

UI:
`FDC proof rejected — USDT0 remains locked.`

## Trade expires during FDC finalization

Valid if actual XRPL payment's `blockTimestamp <= expiry`.

The contract does not use proof-submission time for that check.

---

# 21. Token configuration

Current official Coston2 faucet provides:
- C2FLR
- FXRP
- USDT0

Current Coston2 explorer lists the faucet-used `USDT0 test (USD₮0)` as:

```text
0xC1A5B41512496B80903D1f32d6dEa3a73212E71F
```

**Do not assume token decimals in code.**
Read `decimals()` at runtime and use `parseUnits`.

Store in environment:

```bash
VITE_USDT0_ADDRESS=0xC1A5B41512496B80903D1f32d6dEa3a73212E71F
```

Before deploying, verify the address still corresponds to the current faucet token on Coston2 Explorer.

---

# 22. Network configuration

```bash
COSTON2_CHAIN_ID=114
COSTON2_RPC_URL=https://coston2-api.flare.network/ext/C/rpc
COSTON2_EXPLORER_URL=https://coston2-explorer.flare.network
COSTON2_SYSTEMS_EXPLORER_URL=https://coston2-systems-explorer.flare.network

XRPL_TESTNET_RPC=https://s.altnet.rippletest.net:51234/
XRPL_TESTNET_WS=wss://s.altnet.rippletest.net:51233/

FDC_VERIFIER_BASE=https://fdc-verifiers-testnet.flare.network
FDC_DA_LAYER_BASE=https://ctn2-data-availability.flare.network
FDC_PUBLIC_API_KEY=00000000-0000-0000-0000-000000000000

FLARE_CONTRACT_REGISTRY=0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019

VITE_USDT0_ADDRESS=0xC1A5B41512496B80903D1f32d6dEa3a73212E71F
VITE_CLEARX_CONTRACT=<deployed address>
```

Server-only:

```bash
FDC_RELAYER_PRIVATE_KEY=<funded Coston2 relayer key>
```

Never expose relayer key to Vite/browser env.

---

# 23. Recommended technical stack

## Frontend

Use the Lovable-generated React app if provided.

Expected stack:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- `wagmi`
- `viem`
- TanStack Query
- `lucide-react`
- optional `qrcode.react`

Do not replace the visual layer unnecessarily when Codex integrates the core flow.

## Smart contracts

- Solidity 0.8.25+
- Hardhat
- TypeScript
- OpenZeppelin
- Flare periphery packages
- EVM version: Cancun

Recommended Flare package:

```bash
@flarenetwork/flare-periphery-contracts
@flarenetwork/flare-periphery-contract-artifacts
```

## XRPL

```bash
xrpl
```

Use XRPL public Testnet only.

## FDC executor

Node + TypeScript.

Can be:
- Vercel serverless API routes for HTTP orchestration, or
- small Express service.

For reliability under a demo, a tiny Express worker is acceptable.

---

# 24. Suggested repository layout

```text
clearx/
├─ src/                         # Lovable React UI
│  ├─ components/
│  ├─ hooks/
│  ├─ lib/
│  │  ├─ chains.ts
│  │  ├─ clearx.ts
│  │  ├─ usdt0.ts
│  │  └─ format.ts
│  ├─ pages/
│  └─ App.tsx
│
├─ contracts/
│  └─ ClearXSettlement.sol
│
├─ scripts/
│  ├─ deploy.ts
│  ├─ seed-demo.ts
│  └─ smoke-test.ts
│
├─ api/ or server/
│  └─ fdc/
│     ├─ start.ts
│     ├─ status.ts
│     ├─ verifier.ts
│     ├─ flare-registry.ts
│     └─ proof.ts
│
├─ test/
│  └─ ClearXSettlement.test.ts
│
├─ hardhat.config.ts
├─ .env.example
├─ README.md
├─ CLEARX_PRD.md
└─ CLEARX_UI_SPEC.md
```

If using a separate Express server, place it under `server/`.

---

# 25. Frontend integration API

The Lovable UI should call a small product service abstraction.

## Reads

```ts
getTrade(tradeId)
getUsdt0Balance(address)
getUsdt0Allowance(address)
getTradeStatus(tradeId)
```

## Wallet actions

```ts
approveUsdt0(amount)
createTrade(...)
acceptTrade(...)
cancelOpenTrade(...)
reclaimExpiredTrade(...)
```

## FDC actions

```ts
startFdcSettlement(tradeId, xrplTxHash)
getFdcSettlementStatus(jobId)
```

Status object:

```ts
type SettlementStage =
  | "preflight"
  | "fdc_preparing"
  | "fdc_submitted"
  | "fdc_waiting"
  | "proof_ready"
  | "settling"
  | "settled"
  | "failed";

type FdcJob = {
  id: string;
  tradeId: string;
  xrplTxHash: string;
  stage: SettlementStage;
  roundId?: number;
  fdcRequestTxHash?: string;
  settlementTxHash?: string;
  error?: string;
};
```

---

# 26. UI state machine

```text
CREATE
  |
  v
APPROVING
  |
  v
LOCKING
  |
  v
OPEN
  |
  v
TAKEN
  |
  v
AWAITING_XRP
  |
  v
XRPL_TX_SUBMITTED
  |
  v
FDC_WAITING
  |
  v
PROOF_READY
  |
  v
SETTLING
  |
  v
SETTLED
```

Error states never destroy the trade automatically.

---

# 27. Testing requirements

## Unit tests — contract

Must test:

- create trade transfers USDT0 into contract
- payment reference unique per trade
- only OPEN trade can be taken
- maker cannot take own trade
- second taker cannot take
- maker can cancel OPEN trade
- maker cannot cancel TAKEN before expiry
- reclaim only after expiry + grace
- processed XRPL tx cannot settle twice
- wrong payment reference rejects
- wrong receiver hash rejects
- wrong sender hash rejects
- insufficient XRP amount rejects
- failed payment status rejects
- non-one-to-one payment rejects
- payment after expiry rejects
- valid mocked FDC proof releases token

For local tests, use a mock FDC verifier abstraction if necessary. Keep production contract connected to Flare ContractRegistry.

## Integration test — mandatory

Real public-testnet smoke test:

```text
Coston2 USDT0 locked
        ->
XRPL Testnet XRP sent
        ->
FDC request
        ->
FDC round finalizes
        ->
proof retrieved
        ->
ClearX settlement tx
        ->
USDT0 balance of taker increases
```

Save all transaction hashes to `demo-evidence.json`.

---

# 28. Demo evidence file

Generate after successful end-to-end test:

```json
{
  "network": "Coston2",
  "clearXContract": "0x...",
  "usdt0": "0x...",
  "tradeId": "1",
  "tradeCreationTx": "0x...",
  "tradeAcceptanceTx": "0x...",
  "xrplPaymentTx": "...",
  "fdcRequestTx": "0x...",
  "fdcRoundId": 0,
  "settlementTx": "0x..."
}
```

This becomes extremely useful for:
- README,
- hackathon submission,
- demo video,
- judge verification.

---

# 29. Two-minute judge demo script

## 0:00–0:15 — problem

Show:

> "Alice wants USDT0. Bob wants native XRP. Today one of them has to send first."

Then open ClearX.

## 0:15–0:35 — lock Flare asset

Maker:
- `25 USDT0`
- receive `10 XRP`
- XRPL destination
- click **Lock & Create**

Show:

`25 USDT0 locked on Coston2 ✓`

Open explorer briefly.

## 0:35–0:55 — taker accepts

Taker connects wallet.

Enter their XRPL source.

Show:

```text
PAY 10 XRP
TO r...
REFERENCE 0x...
```

## 0:55–1:10 — native XRP leg

Show actual XRPL Testnet transaction.

`10 XRP confirmed ✓`

## 1:10–1:35 — FDC

Return to ClearX.

Status:

```text
XRP transaction found       ✓
FDC request submitted       ✓
Voting round finalized      ✓
Payment proof verified      ✓
```

Cut waiting time in recorded video, but explicitly label:
`FDC finalization ~90–180s on testnet`.

## 1:35–1:55 — settlement

Show:

`25 USDT0 released to taker ✓`

Open Coston2 settlement tx.

## 1:55–2:00 — final statement

> **Native XRP moved on XRPL. USDT0 moved on Flare. FDC made the two legs trust each other.**

---

# 30. Winning submission copy — draft facts

## Project name

ClearX

## Selected bounty

Bounty 1 — Interoperable Asset Products

## Short description

ClearX is payment-versus-payment settlement for native XRP and assets on Flare. A maker locks USDT0 on Coston2, a taker pays native XRP on XRPL, and Flare Data Connector verifies the XRP payment before ClearX releases the Flare-side asset.

## Target user

OTC traders, treasury operators, and market makers settling native XRP against assets on Flare.

## How ClearX uses Flare

- ClearX settlement contract is deployed on Coston2.
- USDT0 is locked and released on Flare.
- Flare Data Connector `Payment` attestation verifies the native XRP payment on XRPL Testnet.
- The contract uses Flare's official FDC verifier through ContractRegistry before allowing settlement.

## Newly built

Built from scratch during Summer Signal:
- settlement contract,
- XRP payment-reference protocol,
- XRPL transaction flow,
- FDC attestation executor,
- Coston2 proof-based settlement,
- one-page product UI.

## Deployment details

Fill before submission:

```text
Coston2 contract:
USDT0 address:
XRPL payment example:
FDC request:
Coston2 settlement transaction:
```

## Roadmap

1. support more Flare assets;
2. add FDC non-payment timeout settlement;
3. add RFQ / quote APIs for OTC desks;
4. production relayer infrastructure;
5. mainnet XRP <-> Flare asset settlement;
6. SDK for treasury and broker integrations.

---

# 31. What NOT to say in the pitch

Do not say:

- "ClearX is a cross-chain swap."
- "ClearX is a DEX."
- "ClearX bridges XRP."
- "ClearX uses many Flare protocols."
- "We built an escrow."

Say:

> **ClearX is a payment-versus-payment settlement rail. Flare's Data Connector verifies the native XRP leg, so the Flare-side asset only moves after the external payment is proven.**

That is the differentiator.

---

# 32. Definition of done

The MVP is done only when a judge can reproduce:

1. request C2FLR + USDT0 from Coston2 faucet;
2. connect wallet;
3. create trade;
4. take trade;
5. send real testXRP on XRPL Testnet with generated memo;
6. submit XRPL tx hash;
7. watch FDC progress;
8. see Coston2 settlement succeed;
9. click both explorer links.

A static UI, mocked FDC, fake transaction animation, or backend-only "verified" state is **not done**.

---

# 33. Current official references for Codex

Use these as the source of truth when implementation details differ from assumptions in this PRD.

## Flare network / Coston2

- https://dev.flare.network/network/overview
- https://faucet.flare.network/coston2

## FDC

- https://dev.flare.network/fdc/getting-started
- https://dev.flare.network/fdc/guides/hardhat/payment
- https://dev.flare.network/fdc/reference/IPayment
- https://dev.flare.network/fdc/reference/IFdcVerification
- https://dev.flare.network/fdc/reference
- https://dev.flare.network/network/guides/flare-contracts-registry

## XRP Ledger testnet

- https://xrpl.org/docs/tutorials/public-servers
- https://js.xrpl.org/

## Important implementation facts verified from current docs

- Coston2 chain ID = `114`.
- Public Coston2 RPC = `https://coston2-api.flare.network/ext/C/rpc`.
- Coston2 faucet provides C2FLR, FXRP, and USDT0.
- `Payment` supports `testXRP`.
- XRPL uses `inUtxo = 0` and `utxo = 0`.
- `IPayment.ResponseBody` exposes source hash, receiver hash, received amount, payment reference, one-to-one flag, and status.
- XRPL `standardPaymentReference` comes from exactly one Memo whose MemoData is exactly 32 bytes.
- FDC proof verification uses `ContractRegistry.getFdcVerification().verifyPayment(proof)`.
- FDC rounds normally finalize in ~90–180 seconds.
- Flare recommends resolving official protocol contract addresses from `FlareContractRegistry` instead of hardcoding them.

---

# 34. Final build principle

**One painful workflow. One Flare-native proof. One visible cross-chain settlement.**

Do not broaden ClearX until that sentence is demonstrably true on public testnets.
