export const clearXAbi = [
  { type: "function", name: "createTrade", stateMutability: "nonpayable", inputs: [{name:"usdt0Amount",type:"uint256"},{name:"xrpAmountDrops",type:"uint256"},{name:"makerXrplAddress",type:"string"},{name:"expiry",type:"uint64"},{name:"isPublic",type:"bool"}], outputs:[{name:"tradeId",type:"uint256"}] },
  { type: "function", name: "acceptTrade", stateMutability: "nonpayable", inputs: [{name:"tradeId",type:"uint256"},{name:"takerXrplAddress",type:"string"}], outputs:[] },
  { type: "function", name: "setPublicListing", stateMutability: "nonpayable", inputs: [{name:"tradeId",type:"uint256"},{name:"isPublic",type:"bool"}], outputs:[] },
  { type: "function", name: "cancelOpenTrade", stateMutability: "nonpayable", inputs: [{name:"tradeId",type:"uint256"}], outputs:[] },
  { type: "function", name: "reclaimExpiredTrade", stateMutability: "nonpayable", inputs: [{name:"tradeId",type:"uint256"}], outputs:[] },
] as const;
export const erc20Abi = [
  { type:"function", name:"balanceOf", stateMutability:"view", inputs:[{name:"account",type:"address"}], outputs:[{type:"uint256"}] },
  { type:"function", name:"allowance", stateMutability:"view", inputs:[{name:"owner",type:"address"},{name:"spender",type:"address"}], outputs:[{type:"uint256"}] },
  { type:"function", name:"approve", stateMutability:"nonpayable", inputs:[{name:"spender",type:"address"},{name:"amount",type:"uint256"}], outputs:[{type:"bool"}] },
  { type:"function", name:"decimals", stateMutability:"view", inputs:[], outputs:[{type:"uint8"}] },
] as const;

