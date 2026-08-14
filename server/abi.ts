export const registryAbi = ["function getContractAddressByName(string) view returns (address)"] as const;
export const feeAbi = ["function getRequestFee(bytes) view returns (uint256)"] as const;
export const fdcHubAbi = ["function requestAttestation(bytes) payable"] as const;
export const systemsManagerAbi = ["function getCurrentVotingEpochId() view returns (uint32)"] as const;
export const verificationAbi = ["function fdcProtocolId() view returns (uint8)", "function relay() view returns (address)"] as const;
export const relayAbi = ["function isFinalized(uint256,uint256) view returns (bool)"] as const;

export const clearXAbi = [
  "function trades(uint256) view returns (uint256 id,address maker,address taker,uint256 usdt0Amount,uint256 xrpAmountDrops,bytes32 makerXrplAddressHash,bytes32 takerXrplAddressHash,bytes32 paymentReference,uint64 createdAt,uint64 expiry,bool isPublic,bytes32 settlementXrplTx,uint8 status)",
  "function nextTradeId() view returns (uint256)",
  "function makerXrplAddresses(uint256) view returns (string)",
  "function takerXrplAddresses(uint256) view returns (string)",
  "function settleTrade(uint256 tradeId,(bytes32[] merkleProof,(bytes32 attestationType,bytes32 sourceId,uint64 votingRound,uint64 lowestUsedTimestamp,(bytes32 transactionId,uint256 inUtxo,uint256 utxo) requestBody,(uint64 blockNumber,uint64 blockTimestamp,bytes32 sourceAddressHash,bytes32 sourceAddressesRoot,bytes32 receivingAddressHash,bytes32 intendedReceivingAddressHash,int256 spentAmount,int256 intendedSpentAmount,int256 receivedAmount,int256 intendedReceivedAmount,bytes32 standardPaymentReference,bool oneToOne,uint8 status) responseBody) data) proof)",
  "event TradeCreated(uint256 indexed tradeId,address indexed maker,uint256 usdt0Amount,uint256 xrpAmountDrops,bytes32 makerXrplAddressHash,bytes32 paymentReference,uint64 expiry,bool isPublic)",
  "event TradeTaken(uint256 indexed tradeId,address indexed taker,bytes32 takerXrplAddressHash)",
  "event TradeSettled(uint256 indexed tradeId,bytes32 indexed xrplTransactionId,address indexed taker,uint256 usdt0Amount,uint256 xrpAmountDrops)",
] as const;

export const FLARE_REGISTRY = "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019";
export const paymentResponseTuple = "tuple(bytes32 attestationType,bytes32 sourceId,uint64 votingRound,uint64 lowestUsedTimestamp,tuple(bytes32 transactionId,uint256 inUtxo,uint256 utxo) requestBody,tuple(uint64 blockNumber,uint64 blockTimestamp,bytes32 sourceAddressHash,bytes32 sourceAddressesRoot,bytes32 receivingAddressHash,bytes32 intendedReceivingAddressHash,int256 spentAmount,int256 intendedSpentAmount,int256 receivedAmount,int256 intendedReceivedAmount,bytes32 standardPaymentReference,bool oneToOne,uint8 status) responseBody)";
