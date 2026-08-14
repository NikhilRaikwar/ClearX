export type RuntimeConfig = { chainId: number; rpcUrl: string; explorerUrl: string; systemsExplorerUrl: string; faucetUrl: string; xrplExplorerTxBaseUrl: string; clearXContractAddress: `0x${string}` | null; usdt0Address: `0x${string}` | null; deploymentBlock: number; configured: boolean };
export type Trade = { id: string; maker: string; taker: string; makerXrplAddress: string; takerXrplAddress: string; usdt0Amount: string; xrpAmountDrops: string; paymentReference: string; expiry: number; isPublic: boolean; status: number; settlementXrplTx: string };
export type Job = { id: string; tradeId: string; xrplTxHash: string; stage: string; fdcRequestTxHash?: string; votingRoundId?: number; settlementTxHash?: string; errorCode?: string; errorMessage?: string };

