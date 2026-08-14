const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ClearXSettlement", function () {
  let token, clearX, maker, taker, other;
  const usdt = 25_000_000n;
  const drops = 10_000_000n;
  const makerXrp = "rMaker1111111111111111111111111";
  const takerXrp = "rTaker1111111111111111111111111";

  beforeEach(async () => {
    [, maker, taker, other] = await ethers.getSigners();
    token = await ethers.deployContract("MockUSDT0");
    clearX = await ethers.deployContract("ClearXSettlementHarness", [await token.getAddress()]);
    await token.mint(maker.address, usdt * 10n);
    await token.connect(maker).approve(await clearX.getAddress(), usdt * 10n);
  });

  async function create(isPublic = true) {
    const expiry = BigInt((await time.latest()) + 1200);
    await clearX.connect(maker).createTrade(usdt, drops, makerXrp, expiry, isPublic);
    return { trade: await clearX.trades(1), expiry };
  }

  function proof(trade, overrides = {}) {
    const txId = overrides.txId ?? ethers.keccak256(ethers.toUtf8Bytes("xrpl-payment-1"));
    return {
      merkleProof: [],
      data: {
        attestationType: ethers.encodeBytes32String("Payment"),
        sourceId: overrides.sourceId ?? ethers.encodeBytes32String("testXRP"),
        votingRound: 1,
        lowestUsedTimestamp: trade.createdAt,
        requestBody: { transactionId: txId, inUtxo: 0, utxo: 0 },
        responseBody: {
          blockNumber: 1,
          blockTimestamp: overrides.blockTimestamp ?? trade.createdAt,
          sourceAddressHash: overrides.sourceAddressHash ?? ethers.keccak256(ethers.toUtf8Bytes(takerXrp)),
          sourceAddressesRoot: ethers.ZeroHash,
          receivingAddressHash: overrides.receivingAddressHash ?? ethers.keccak256(ethers.toUtf8Bytes(makerXrp)),
          intendedReceivingAddressHash: ethers.ZeroHash,
          spentAmount: drops + 12n,
          intendedSpentAmount: drops + 12n,
          receivedAmount: overrides.receivedAmount ?? drops,
          intendedReceivedAmount: drops,
          standardPaymentReference: overrides.reference ?? trade.paymentReference,
          oneToOne: overrides.oneToOne ?? true,
          status: overrides.status ?? 0,
        },
      },
    };
  }

  it("locks funds, creates a unique reference, and stores listing metadata", async () => {
    await expect(clearX.connect(maker).createTrade(usdt, drops, makerXrp, (await time.latest()) + 1200, true)).to.emit(clearX, "TradeCreated");
    expect(await token.balanceOf(await clearX.getAddress())).to.equal(usdt);
    const first = await clearX.trades(1);
    await clearX.connect(maker).createTrade(usdt, drops, makerXrp, (await time.latest()) + 1300, false);
    expect((await clearX.trades(2)).paymentReference).to.not.equal(first.paymentReference);
    expect(await clearX.makerXrplAddresses(1)).to.equal(makerXrp);
  });

  it("binds one taker and rejects the maker or a replacement", async () => {
    await create();
    await expect(clearX.connect(maker).acceptTrade(1, makerXrp)).to.be.revertedWithCustomError(clearX, "MakerCannotTake");
    await clearX.connect(taker).acceptTrade(1, takerXrp);
    await expect(clearX.connect(other).acceptTrade(1, "rOther111111111111111111111111")).to.be.revertedWithCustomError(clearX, "InvalidStatus");
  });

  it("settles a valid FDC payment and blocks replay", async () => {
    await create(); await clearX.connect(taker).acceptTrade(1, takerXrp);
    const trade = await clearX.trades(1); const p = proof(trade);
    await expect(clearX.settleTrade(1, p)).to.emit(clearX, "TradeSettled");
    expect(await token.balanceOf(taker.address)).to.equal(usdt);
    expect((await clearX.trades(1)).status).to.equal(3);
    expect(await clearX.processedXrplTransactions(p.data.requestBody.transactionId)).to.equal(true);
  });

  it("rejects each critical payment mismatch", async () => {
    await create(); await clearX.connect(taker).acceptTrade(1, takerXrp); const trade = await clearX.trades(1);
    await expect(clearX.settleTrade(1, proof(trade,{reference:ethers.ZeroHash}))).to.be.revertedWithCustomError(clearX,"WrongPaymentReference");
    await expect(clearX.settleTrade(1, proof(trade,{sourceAddressHash:ethers.ZeroHash}))).to.be.revertedWithCustomError(clearX,"WrongPayer");
    await expect(clearX.settleTrade(1, proof(trade,{receivingAddressHash:ethers.ZeroHash}))).to.be.revertedWithCustomError(clearX,"WrongReceiver");
    await expect(clearX.settleTrade(1, proof(trade,{receivedAmount:drops-1n}))).to.be.revertedWithCustomError(clearX,"InsufficientPayment");
    await expect(clearX.settleTrade(1, proof(trade,{status:1}))).to.be.revertedWithCustomError(clearX,"PaymentFailed");
    await expect(clearX.settleTrade(1, proof(trade,{oneToOne:false}))).to.be.revertedWithCustomError(clearX,"NotOneToOne");
    await expect(clearX.settleTrade(1, proof(trade,{blockTimestamp:trade.expiry+1n}))).to.be.revertedWithCustomError(clearX,"LatePayment");
  });

  it("rejects an invalid verifier result", async () => {
    await create(); await clearX.connect(taker).acceptTrade(1, takerXrp); await clearX.setProofValid(false);
    await expect(clearX.settleTrade(1, proof(await clearX.trades(1)))).to.be.revertedWithCustomError(clearX,"InvalidProof");
  });

  it("allows maker cancellation only while open", async () => {
    await create();
    await expect(clearX.connect(taker).cancelOpenTrade(1)).to.be.revertedWithCustomError(clearX,"Unauthorized");
    await clearX.connect(maker).cancelOpenTrade(1);
    expect(await token.balanceOf(maker.address)).to.equal(usdt * 10n);
  });

  it("reclaims a taken trade only after expiry and grace", async () => {
    const { expiry } = await create(); await clearX.connect(taker).acceptTrade(1, takerXrp);
    await expect(clearX.connect(maker).reclaimExpiredTrade(1)).to.be.revertedWithCustomError(clearX,"GracePeriodActive");
    await time.increaseTo(Number(expiry) + 901);
    await clearX.connect(maker).reclaimExpiredTrade(1);
    expect((await clearX.trades(1)).status).to.equal(4);
  });
});

