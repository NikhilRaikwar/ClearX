// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";
import {IPayment} from "@flarenetwork/flare-periphery-contracts/coston2/IPayment.sol";

contract ClearXSettlement is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum TradeStatus { NONE, OPEN, TAKEN, SETTLED, CANCELLED }

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
        bool isPublic;
        bytes32 settlementXrplTx;
        TradeStatus status;
    }

    uint64 public constant MIN_EXPIRY = 10 minutes;
    uint64 public constant MAX_EXPIRY = 24 hours;
    uint64 public constant SETTLEMENT_GRACE = 15 minutes;
    bytes32 public constant TEST_XRP_SOURCE_ID = bytes32("testXRP");

    IERC20 public immutable USDT0;
    uint256 public nextTradeId = 1;
    mapping(uint256 => Trade) public trades;
    mapping(uint256 => string) public makerXrplAddresses;
    mapping(uint256 => string) public takerXrplAddresses;
    mapping(bytes32 => bool) public processedXrplTransactions;

    error InvalidAmount();
    error InvalidExpiry();
    error InvalidXrplAddress();
    error InvalidStatus();
    error Unauthorized();
    error MakerCannotTake();
    error InvalidProof();
    error WrongSourceNetwork();
    error PaymentFailed();
    error NotOneToOne();
    error WrongPayer();
    error WrongReceiver();
    error InsufficientPayment();
    error WrongPaymentReference();
    error LatePayment();
    error TransactionAlreadyProcessed();
    error GracePeriodActive();

    event TradeCreated(uint256 indexed tradeId, address indexed maker, uint256 usdt0Amount, uint256 xrpAmountDrops, bytes32 makerXrplAddressHash, bytes32 paymentReference, uint64 expiry, bool isPublic);
    event TradeTaken(uint256 indexed tradeId, address indexed taker, bytes32 takerXrplAddressHash);
    event TradeListingUpdated(uint256 indexed tradeId, bool isPublic);
    event TradeSettled(uint256 indexed tradeId, bytes32 indexed xrplTransactionId, address indexed taker, uint256 usdt0Amount, uint256 xrpAmountDrops);
    event TradeCancelled(uint256 indexed tradeId);

    constructor(address usdt0Address) {
        if (usdt0Address == address(0)) revert InvalidAmount();
        USDT0 = IERC20(usdt0Address);
    }

    function createTrade(uint256 usdt0Amount, uint256 xrpAmountDrops, string calldata makerXrplAddress, uint64 expiry, bool isPublic) external nonReentrant returns (uint256 tradeId) {
        if (usdt0Amount == 0 || xrpAmountDrops == 0) revert InvalidAmount();
        if (bytes(makerXrplAddress).length == 0) revert InvalidXrplAddress();
        if (expiry < block.timestamp + MIN_EXPIRY || expiry > block.timestamp + MAX_EXPIRY) revert InvalidExpiry();

        tradeId = nextTradeId++;
        bytes32 makerHash = keccak256(bytes(makerXrplAddress));
        bytes32 paymentRef = keccak256(abi.encode(block.chainid, address(this), tradeId, msg.sender, usdt0Amount, xrpAmountDrops, expiry));
        trades[tradeId] = Trade({
            id: tradeId,
            maker: msg.sender,
            taker: address(0),
            usdt0Amount: usdt0Amount,
            xrpAmountDrops: xrpAmountDrops,
            makerXrplAddressHash: makerHash,
            takerXrplAddressHash: bytes32(0),
            paymentReference: paymentRef,
            createdAt: uint64(block.timestamp),
            expiry: expiry,
            isPublic: isPublic,
            settlementXrplTx: bytes32(0),
            status: TradeStatus.OPEN
        });
        makerXrplAddresses[tradeId] = makerXrplAddress;

        USDT0.safeTransferFrom(msg.sender, address(this), usdt0Amount);
        emit TradeCreated(tradeId, msg.sender, usdt0Amount, xrpAmountDrops, makerHash, paymentRef, expiry, isPublic);
    }

    function acceptTrade(uint256 tradeId, string calldata takerXrplAddress) external {
        Trade storage trade = trades[tradeId];
        if (trade.status != TradeStatus.OPEN || block.timestamp >= trade.expiry) revert InvalidStatus();
        if (msg.sender == trade.maker) revert MakerCannotTake();
        if (bytes(takerXrplAddress).length == 0) revert InvalidXrplAddress();
        trade.taker = msg.sender;
        trade.takerXrplAddressHash = keccak256(bytes(takerXrplAddress));
        takerXrplAddresses[tradeId] = takerXrplAddress;
        trade.status = TradeStatus.TAKEN;
        emit TradeTaken(tradeId, msg.sender, trade.takerXrplAddressHash);
    }

    function setPublicListing(uint256 tradeId, bool isPublic) external {
        Trade storage trade = trades[tradeId];
        if (msg.sender != trade.maker) revert Unauthorized();
        if (trade.status != TradeStatus.OPEN) revert InvalidStatus();
        trade.isPublic = isPublic;
        emit TradeListingUpdated(tradeId, isPublic);
    }

    function settleTrade(uint256 tradeId, IPayment.Proof calldata proof) external nonReentrant {
        Trade storage trade = trades[tradeId];
        if (trade.status != TradeStatus.TAKEN) revert InvalidStatus();
        if (!_verifyPayment(proof)) revert InvalidProof();
        if (proof.data.sourceId != TEST_XRP_SOURCE_ID) revert WrongSourceNetwork();

        IPayment.ResponseBody calldata payment = proof.data.responseBody;
        if (payment.status != 0) revert PaymentFailed();
        if (!payment.oneToOne) revert NotOneToOne();
        if (payment.sourceAddressHash != trade.takerXrplAddressHash) revert WrongPayer();
        if (payment.receivingAddressHash != trade.makerXrplAddressHash) revert WrongReceiver();
        if (payment.receivedAmount < 0 || uint256(payment.receivedAmount) < trade.xrpAmountDrops) revert InsufficientPayment();
        if (payment.standardPaymentReference != trade.paymentReference) revert WrongPaymentReference();
        if (payment.blockTimestamp > trade.expiry) revert LatePayment();

        bytes32 txId = proof.data.requestBody.transactionId;
        if (processedXrplTransactions[txId]) revert TransactionAlreadyProcessed();
        processedXrplTransactions[txId] = true;
        trade.status = TradeStatus.SETTLED;
        trade.settlementXrplTx = txId;
        trade.isPublic = false;

        USDT0.safeTransfer(trade.taker, trade.usdt0Amount);
        emit TradeSettled(tradeId, txId, trade.taker, trade.usdt0Amount, trade.xrpAmountDrops);
    }

    function cancelOpenTrade(uint256 tradeId) external nonReentrant {
        Trade storage trade = trades[tradeId];
        if (msg.sender != trade.maker) revert Unauthorized();
        if (trade.status != TradeStatus.OPEN) revert InvalidStatus();
        trade.status = TradeStatus.CANCELLED;
        trade.isPublic = false;
        USDT0.safeTransfer(trade.maker, trade.usdt0Amount);
        emit TradeCancelled(tradeId);
    }

    function reclaimExpiredTrade(uint256 tradeId) external nonReentrant {
        Trade storage trade = trades[tradeId];
        if (msg.sender != trade.maker) revert Unauthorized();
        if (trade.status != TradeStatus.TAKEN) revert InvalidStatus();
        if (block.timestamp <= uint256(trade.expiry) + SETTLEMENT_GRACE) revert GracePeriodActive();
        trade.status = TradeStatus.CANCELLED;
        trade.isPublic = false;
        USDT0.safeTransfer(trade.maker, trade.usdt0Amount);
        emit TradeCancelled(tradeId);
    }

    function _verifyPayment(IPayment.Proof calldata proof) internal view virtual returns (bool) {
        return ContractRegistry.getFdcVerification().verifyPayment(proof);
    }
}
