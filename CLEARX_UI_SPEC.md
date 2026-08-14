# ClearX — UI / UX Specification for Lovable

**Goal:** Generate a complete, polished one-page interface for the ClearX MVP.  
**Product:** Trust-minimized payment-versus-payment settlement between native XRP on XRPL and USDT0 on Flare.  
**Audience:** Hackathon judges, OTC traders, treasury operators, market makers.  
**Implementation handoff:** Lovable generates the visual React frontend. Codex will then connect the UI to Coston2, XRPL Testnet, and Flare Data Connector.

---

# 0. Lovable instruction

Build this as a **real product interface**, not a marketing landing page with a fake dashboard.

The center of the page must be the working settlement console.

A judge should understand ClearX within 5 seconds:

> **Lock on Flare. Pay on XRP Ledger. FDC proves the payment. Settle automatically.**

Do not add login or signup.

Do not create multiple marketing pages.

Do not use crypto clichés:
- no glowing coins,
- no 3D tokens,
- no purple gradients,
- no blockchain globe,
- no astronaut art,
- no giant generic hero.

The app should feel like a modern institutional fintech product crossed with a very clean swap interface.

---

# 1. Brand

## Name

**ClearX**

Wordmark:
- `Clear` in near-black
- `X` can use the accent color
- simple text wordmark, no complex logo required

## Tagline

**Native XRP settlement, without sending first.**

Alternative micro-copy inside product:

**Payment-versus-payment for XRP and Flare.**

---

# 2. Visual direction

Reference feeling:
- Stripe
- Linear
- modern OTC terminal
- Uniswap simplicity
- premium trading infrastructure

Avoid looking like:
- exchange casino UI
- NFT app
- generic DeFi dashboard
- old Bloomberg terminal
- startup landing-page template

## Color palette

```text
Page background:    #F7F8FA
Primary card:       #FFFFFF
Primary text:       #0B0D12
Secondary text:     #667085
Muted text:         #98A2B3
Border:             #E4E7EC
Border strong:      #D0D5DD

Accent / ClearX:    #FF5A36
Accent hover:       #E94C2B
Accent soft:        #FFF0EB

Success:            #168A63
Success soft:       #EAF8F2

Warning:            #D97706
Warning soft:       #FFF7E6

Danger:             #D92D20
Danger soft:        #FFF0EE

XRP chip:           #111827
Flare chip:         #FF5A36
```

No page-wide gradient.

A subtle radial accent behind the main card is acceptable only if extremely faint.

## Typography

Use:
- Geist Sans, Inter, or equivalent.
- numeric amounts should be tabular / monospaced where useful.

Hierarchy:
- nav: 14px
- eyebrow: 12px uppercase
- headline: 44–56px desktop / 36px mobile
- card amount: 30–36px
- body: 14–16px
- technical metadata: 12–13px

---

# 3. Page layout

Single page:

```text
┌──────────────────────────────────────────────────────────────┐
│ ClearX                         Coston2 ●   Connect Wallet     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   Native XRP settlement, without sending first.              │
│   FDC proves the XRP leg before Flare releases the asset.    │
│                                                              │
│                    ┌───────────────────────┐                  │
│                    │ Settlement Console    │                  │
│                    │                       │                  │
│                    │ [Create] [Open Trade] │                  │
│                    │                       │                  │
│                    │ ...functional UI...   │                  │
│                    └───────────────────────┘                  │
│                                                              │
│   XRPL ───────── FDC proof ───────── Flare                   │
│                                                              │
│   Three short trust / product cards                          │
│                                                              │
│   Recent settlement / protocol evidence                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

The functional card should be visible above the fold on desktop.

---

# 4. Header

Desktop max width ~1180px.

Left:
- ClearX wordmark
- small label: `SUMMER SIGNAL`

Right:
- status pill: `Coston2`
- green status dot if connected to RPC
- `Connect wallet` button

After wallet connect:

```text
Coston2 ●
0x71A4...3C82
```

Click opens tiny popover:
- full address
- USDT0 balance
- C2FLR balance
- copy address
- disconnect

If wallet on wrong chain:

```text
Wrong network
[Switch to Coston2]
```

No full sidebar.

---

# 5. Hero copy

Keep hero compact.

Eyebrow:

`PAYMENT-VERSUS-PAYMENT ON FLARE`

Headline:

# Native XRP settlement, without sending first.

Supporting line:

> Lock a Flare asset, send native XRP, and let Flare Data Connector prove the payment before settlement.

Do not use more than 2 lines of body copy.

Small proof chips below:

```text
XRPL Testnet
Flare Coston2
Verified by FDC
```

---

# 6. Main settlement console

Desktop width:
`520–580px`

White card.
Rounded corners:
`20–24px`

Border:
1px subtle.

Shadow:
very soft.

Top of card:

```text
Settlement

[ Create trade ] [ Open trade ]
```

This is not a conventional swap. The wording must reinforce settlement.

---

# 7. Create Trade state

Default state for connected maker.

## Section A — You lock

Large input panel:

```text
YOU LOCK

25.00                             USDT0
                                  Flare
Balance 10.00
```

Components:
- numeric input
- token pill with simple `$` / Tether-style icon placeholder
- network micro-label `Coston2`
- `MAX`
- balance

If not enough:
`Insufficient USDT0`

Below it, subtle vertical connector with lock icon.

## Section B — You receive

```text
YOU RECEIVE

10.00                              XRP
                                   XRP Ledger
```

No live pricing needed in MVP.

Small text:

`Rate agreed directly with your counterparty.`

This is important so judges know ClearX is settlement, not price discovery.

---

# 8. XRPL destination field

Below amounts:

Label:
`Your XRP receiving address`

Input:
`rXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

Right icon:
XRP symbol / copy if filled.

Helper:

`Native XRP is sent directly to this address. ClearX never holds it.`

Validation:
- empty
- invalid classic address
- valid

Valid badge:
`XRPL address ✓`

---

# 9. Expiry control

Compact row:

```text
Settlement window

[ 20 minutes v ]
```

Options:
- 15 min
- 20 min
- 30 min
- 1 hour

Default:
20 minutes.

Below:
`FDC proofs may take ~90–180 seconds after payment.`

---

# 10. Create button sequence

If wallet disconnected:

`Connect Coston2 wallet`

If no USDT0 approval:

`Approve 25 USDT0`

Then:

`Lock & create settlement`

On click, button transitions:

```text
Confirm in wallet...
```

then:

```text
Locking USDT0...
```

with Coston2 explorer hash link underneath.

After success transition card into OPEN TRADE state rather than navigating away.

---

# 11. Open Trade state — maker view

Header:

```text
Settlement #42                          OPEN
```

Status pill:
orange-outline `OPEN`

Large center:

```text
25 USDT0
LOCKED

for

10 XRP
```

Small lock icon.

Two compact network cards:

```text
FLARE
25 USDT0 locked
0xcontract...

XRPL
10 XRP expected
rMaker...
```

Payment reference:

```text
REFERENCE
0x7d84...ab19
```

with copy.

Expiry:

```text
Expires in 18:42
```

Primary button:

`Copy settlement link`

Secondary:
`Cancel settlement`

Share link section:

`clearx.app/trade/42`

---

# 12. Open Trade state — taker view

When someone opens `/trade/42` and is not maker:

Top:

```text
Settlement #42
Counterparty has locked funds
```

Huge success / trust line:

```text
25 USDT0 LOCKED ON COSTON2 ✓
```

Explorer text link:

`View locked funds ↗`

Trade summary:

```text
YOU PAY
10 XRP
native • XRPL Testnet

YOU RECEIVE
25 USDT0
Flare • Coston2
```

Callout:

> The USDT0 is already locked. It can only be released after FDC proves your XRP payment.

This is the main trust message.

---

# 13. Reserve trade state

Before payment, taker must bind their identities.

Field 1:
`Receive USDT0 at`

Default:
connected EVM wallet.

Read-only:
`0xTAKER...`

Field 2:
`You will send XRP from`

Input:
`rTAKER...`

Helper:

`The FDC proof must match this exact XRPL source address.`

CTA:

`Reserve settlement`

Confirmation modal:

```text
Reserve settlement?

You must send 10 XRP from:
rTAKER...

to:
rMAKER...

Do not pay from another XRP address.

[Cancel] [Reserve]
```

After Coston2 tx:
status becomes `RESERVED`.

---

# 14. Payment state

This is the most important screen.

Card header:

```text
Settlement #42                       AWAITING XRP
```

Main title:

# Send 10 XRP

Destination box:

```text
TO
rMAKERXXXXXXXXXXXXXXXX

[Copy]
```

Reference box:

```text
MEMO — REQUIRED
7D84AF...64_HEX_CHARS

[Copy]
```

Warning in amber soft box:

> **The memo is required.** Send exactly 10 XRP from `rTAKER...` with this 32-byte reference.

Action row:
- `Copy payment details`
- optional `Show QR`

Do not show "Pay with ClearX wallet." We do not hold XRPL keys.

---

# 15. After user pays

Section:

`Already sent XRP?`

Input:

`Paste XRPL transaction hash`

CTA:

`Verify & settle`

Example hash placeholder:
`2A3E7C7F...`

When clicked, immediately show a progress experience, not a blank loading spinner.

---

# 16. FDC progress component

This should be visually excellent because it demonstrates Flare integration.

Use a vertical four-step proof timeline.

```text
VERIFYING CROSS-CHAIN PAYMENT

✓  XRP transaction found
   XRPL Testnet
   2A3E...1447

✓  FDC request submitted
   Coston2
   0x83...da9

●  Waiting for FDC consensus
   Voting round #123456
   Usually ~90–180 seconds

○  Release USDT0
   Waiting for proof
```

Each completed step gets:
- green check
- timestamp
- explorer link

Current step:
- accent ring / subtle spinner

Upcoming:
- gray.

Important:
do not fake percentages.

Add small link:
`View FDC round ↗`

---

# 17. FDC explanatory tooltip

Next to `Verified by FDC`, an info icon.

Popover copy:

> Flare Data Connector lets smart contracts verify external blockchain events. ClearX uses it to prove the native XRP payment before the locked USDT0 can move.

Keep it short.

---

# 18. Settlement success state

This should be the most screenshot-worthy screen.

Large green check.

Headline:

# Settlement complete

Subline:

`Both legs are final.`

Visual dual rail:

```text
XRP LEDGER
10 XRP
rTaker ─────────────→ rMaker
CONFIRMED ✓

        FLARE DATA CONNECTOR
             PROVED ✓

FLARE COSTON2
25 USDT0
Maker ──────────────→ Taker
SETTLED ✓
```

Then compact proof card:

```text
PROOF OF SETTLEMENT

XRPL payment
2A3E...1447                    ↗

FDC voting round
#123456                        ↗

Coston2 settlement
0x8F21...DA91                  ↗

ClearX contract
0x...                          ↗
```

Buttons:

`Create another settlement`

`Copy proof link`

This state should be used in screenshots / demo thumbnail.

---

# 19. Maker monitoring view while taker pays

If maker has the page open after TAKEN:

```text
Settlement #42                    RESERVED

Counterparty
0xTaker...

Expected XRP source
rTaker...

10 XRP
awaiting payment
```

Timeline:

```text
USDT0 locked          ✓
Counterparty reserved ✓
XRP payment           waiting
FDC proof             waiting
USDT0 release         waiting
```

Maker does not need to take action.

---

# 20. Expired state

For OPEN trade:

```text
EXPIRED

No counterparty reserved this settlement.

[Reclaim 25 USDT0]
```

For TAKEN but unpaid after grace:

```text
PAYMENT WINDOW ENDED

The settlement window has closed.

[Reclaim locked USDT0]
```

Do not show reclaim until contract says it is available.

---

# 21. Error states

All errors must be human-readable.

## Wrong network

`ClearX runs on Flare Coston2 for this demo.`

Button:
`Switch network`

## No gas

`You need C2FLR to submit this transaction.`

Button:
`Open Coston2 faucet ↗`

## No USDT0

`You need test USDT0 to create a settlement.`

Button:
`Get USDT0 ↗`

## Invalid XRP address

`Enter a valid classic XRP Ledger address starting with r.`

## XRP source mismatch

`This payment came from a different XRPL address than the address reserved for this trade.`

## Wrong XRP destination

`The XRP payment was not sent to the settlement destination.`

## Wrong memo

`The XRP payment reference does not match this ClearX settlement.`

## Amount too low

`The XRP payment amount is below the agreed settlement amount.`

## FDC invalid proof

`Flare Data Connector could not validate this payment proof. Locked USDT0 has not moved.`

## Expired payment

`The XRP transaction was confirmed after the settlement deadline.`

---

# 22. Below-the-console product explanation

Keep this short and visual.

Section title:

## Two chains. One settlement condition.

Three horizontal steps on desktop / stacked mobile.

### 1. Lock on Flare

`The maker locks USDT0 in ClearX on Coston2.`

### 2. Pay native XRP

`The taker pays the maker directly on XRP Ledger.`

### 3. Prove and release

`FDC proves the XRP payment. ClearX releases USDT0.`

Mini diagram:

```text
XRPL Payment
     ↓
    FDC
     ↓
Coston2 Release
```

---

# 23. Why ClearX cards

Three cards only.

## No "send first"

`Neither party has to trust the other to complete the second leg.`

## Native XRP stays native

`The XRP leg happens directly on XRP Ledger, not as a wrapped token transfer.`

## Flare verifies reality

`The Coston2 contract only releases the asset after an FDC payment proof passes onchain verification.`

---

# 24. Evidence / demo section

Section title:

## Live on public testnets

Show four tiny status rows:

```text
Flare Coston2      LIVE
XRPL Testnet       LIVE
FDC Payment        LIVE
ClearX Contract    0x...
```

After Codex integration, make address clickable.

Small note:

`Hackathon MVP — testnet assets only.`

---

# 25. Footer

Minimal.

Left:
`ClearX`

Center:
`Built for Flare Summer Signal`

Right:
- Flare docs
- Coston2 explorer
- GitHub

No giant footer.

---

# 26. Responsive behavior

## Desktop

Hero left-aligned or centered with console directly beneath.

Main product card:
520–580px.

Keep core trade information visible without scrolling much.

## Mobile

- sticky wallet/network bar
- product console width 100%
- amount panels stack
- buttons full width
- proof timeline stays readable
- addresses truncate middle, never overflow
- copy buttons remain visible

---

# 27. Component list Lovable should generate

```text
AppHeader
NetworkPill
WalletButton
Hero
SettlementCard
ModeTabs
AmountPanel
AssetPill
XrplAddressInput
ExpirySelect
TradeSummary
LockedFundsBanner
ReserveTradeForm
PaymentInstructions
CopyField
Countdown
FdcProgressTimeline
ExplorerLink
SettlementProofCard
StatusPill
SuccessState
ErrorAlert
HowItWorks
TrustCards
NetworkEvidence
Footer
```

Use components, not one giant `App.tsx`.

---

# 28. Required mock data / frontend types

Lovable may initially use mock data, but structure it so Codex can replace functions easily.

```ts
type TradeStatus =
  | "OPEN"
  | "TAKEN"
  | "SETTLED"
  | "CANCELLED"
  | "EXPIRED";

type Trade = {
  id: string;
  maker: string;
  taker?: string;

  usdt0Amount: string;
  xrpAmount: string;
  xrpAmountDrops: string;

  makerXrplAddress: string;
  takerXrplAddress?: string;

  paymentReference: string;
  expiry: number;
  status: TradeStatus;

  creationTxHash?: string;
  acceptanceTxHash?: string;
  xrplTxHash?: string;
  fdcRequestTxHash?: string;
  fdcRoundId?: number;
  settlementTxHash?: string;
};
```

Do not hardwire every state into static JSX. Create a clear state machine.

---

# 29. Integration boundaries for Codex

Lovable should isolate blockchain calls behind hooks/services.

Mock names:

```ts
useClearX()
useCoston2Wallet()
useTrade(tradeId)
useFdcSettlement()
```

Functions:

```ts
connectWallet()
switchToCoston2()

approveUsdt0(amount)
createTrade(input)
acceptTrade(tradeId, xrplAddress)

cancelTrade(tradeId)
reclaimTrade(tradeId)

startSettlementVerification(tradeId, xrplTxHash)
pollSettlement(jobId)
```

Codex should be able to replace mock implementations without redesigning the page.

---

# 30. Important UX rules

1. **Do not call it a swap.**
   Use `settlement`, `trade`, `lock`, `pay`, `prove`, `release`.

2. Always make it visible that **XRP stays on XRPL**.

3. Always make it visible that **USDT0 is locked first**.

4. FDC must be a visible step, not hidden in developer text.

5. The user should always know:
   - what they must send,
   - where,
   - from which XRPL address,
   - with which memo,
   - what they will receive.

6. Explorer links are part of the product, not an afterthought.

7. Never ask for an XRPL private key.

8. Never imply FDC finalizes instantly.
   Label ~90–180 seconds.

9. Make the success state screenshot-worthy.

10. The core card should feel usable even if the marketing copy were removed.

---

# 31. Copy library

## Hero

**Native XRP settlement, without sending first.**

`Lock a Flare asset, pay native XRP, and let FDC prove the payment before settlement.`

## Trust badge

`USDT0 locked on Coston2`

## Payment badge

`Native XRP payment`

## FDC badge

`Verified by Flare Data Connector`

## Settlement badge

`Both legs complete`

## Explanation

`ClearX does not custody XRP. Native XRP moves directly between XRP Ledger accounts.`

## Waiting

`FDC is reaching consensus on the XRP payment. This normally takes about 90–180 seconds on testnet.`

## Success

`The native XRP payment was proven and the locked USDT0 was released.`

---

# 32. Judge-first polish

The following elements must exist because judges will care:

### A. "Why Flare?" visible without opening README

Under progress timeline:

`FDC is the bridge between the two settlement legs: it turns the XRPL payment into data the Flare contract can trust.`

### B. Real deployment badge

`Coston2 • Contract 0x...`

### C. Testnet clarity

Never pretend assets are mainnet.

`Testnet demo`

### D. Transparent status

Do not use fake confetti before settlement transaction confirms.

### E. Technical evidence

Success state contains all hashes.

---

# 33. Suggested animations

Keep motion functional.

- card state transitions: 180–250ms
- checkmarks draw in
- FDC current step has subtle rotating border
- locked asset icon closes once creation tx finalizes
- cross-chain rail animates only when progress advances
- success screen may have one subtle scale/fade check

No constant floating blobs.
No flashy Web3 effects.

---

# 34. Landing-page + app balance

Above fold:
- 20% positioning
- 80% product

Do not build a long SaaS landing page before the app.

The user should be able to create a settlement immediately.

Recommended order:

```text
Header
Hero
Functional Settlement Console
Cross-chain rail
How it works
Why ClearX
Live testnet evidence
Footer
```

---

# 35. Visual settlement rail

Use this throughout the UI:

```text
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│ XRP Ledger  │ ────> │     FDC     │ ────> │    Flare    │
│  native XRP │       │ payment proof│       │ USDT0 release│
└─────────────┘       └─────────────┘       └─────────────┘
```

Desktop:
horizontal.

Mobile:
vertical.

Status colors:
- waiting = gray
- active = accent
- completed = green

---

# 36. Lovable completion checklist

The Lovable output is ready to hand to Codex when:

- [ ] page is responsive
- [ ] no login/signup
- [ ] main console is above fold
- [ ] Create Trade form exists
- [ ] OPEN trade state exists
- [ ] taker reserve state exists
- [ ] payment instruction state exists
- [ ] transaction hash input exists
- [ ] FDC progress timeline exists
- [ ] success proof state exists
- [ ] error components exist
- [ ] all explorer links have dedicated component
- [ ] blockchain interactions live behind mocked hooks/services
- [ ] mock values can be replaced without redesign
- [ ] no fake 3D crypto art
- [ ] no purple gradient
- [ ] typography and spacing feel institutional / premium
- [ ] code is clean React + TypeScript components

---

# 37. Final design principle

The design must visually tell this story before the judge reads the README:

```text
USDT0 is already locked
          ↓
native XRP is paid
          ↓
Flare proves it
          ↓
USDT0 moves
```

The product should make **cross-chain settlement risk disappearing** feel obvious.
