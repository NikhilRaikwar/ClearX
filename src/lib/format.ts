export const short = (value: string) => value ? `${value.slice(0,8)}...${value.slice(-6)}` : "";
export const copy = async (value: string) => navigator.clipboard.writeText(value);
export const canonicalXrplTxHash = (value: string) => value.replace(/^0x/i, "").toUpperCase();
