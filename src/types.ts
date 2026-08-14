export type RuntimeConfig = { chainId: number; rpcUrl: string; explorerUrl: string; systemsExplorerUrl: string; faucetUrl: string; xrplExplorerTxBaseUrl: string; clearXContractAddress: `0x${string}` | null; usdt0Address: `0x${string}` | null; deploymentBlock: number; configured: boolean };
export type Trade = { id: string; maker: string; taker: string; makerXrplAddress: string; takerXrplAddress: string; usdt0Amount: string; xrpAmountDrops: string; paymentReference: string; expiry: number; isPublic: boolean; status: number; settlementXrplTx: string; settlementTxHash?: string };
export type Job = { id: string; tradeId: string; xrplTxHash: string; stage: string; fdcRequestTxHash?: string; votingRoundId?: number; settlementTxHash?: string; errorCode?: string; errorMessage?: string };
export type MarketPrice = { priceUsd: number; source: "coinbase"; fetchedAt: string; stale: boolean };
export type XrplNetwork = "Mainnet" | "Testnet" | "Devnet" | "NFTDevnet" | "Custom";
export type XrplWalletState = { installed: boolean; connected: boolean; address?: string; network?: XrplNetwork; loading: boolean; error?: string };
