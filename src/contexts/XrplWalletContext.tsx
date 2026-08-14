import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getAddress, getNetwork, isInstalled, on, submitTransaction } from "@gemwallet/api";
import type { XrplWalletState } from "../types";
import { buildGemWalletPayment, gemWalletTransactionHash } from "../lib/xrpl-wallet";

type ContextValue = XrplWalletState & {
  connect: () => Promise<void>;
  disconnect: () => void;
  refresh: () => Promise<void>;
  submitPayment: (destination: string, amountDrops: string, reference: string) => Promise<string>;
};

const XrplWalletContext = createContext<ContextValue | undefined>(undefined);
const initial: XrplWalletState = { installed: false, connected: false, loading: true };

export function XrplWalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<XrplWalletState>(initial);
  const refresh = useCallback(async () => {
    setState((value) => ({ ...value, loading: true, error: undefined }));
    try {
      const installed = (await isInstalled()).result.isInstalled;
      if (!installed) return setState({ installed: false, connected: false, loading: false });
      const [addressResponse, networkResponse] = await Promise.all([getAddress(), getNetwork()]);
      const address = addressResponse.result?.address;
      const network = networkResponse.result?.network;
      setState({ installed: true, connected: !!address, address, network, loading: false });
    } catch (error) {
      setState((value) => ({ ...value, loading: false, error: error instanceof Error ? error.message : "GemWallet unavailable" }));
    }
  }, []);
  const connect = useCallback(async () => { await refresh(); }, [refresh]);
  const disconnect = useCallback(() => setState((value) => ({ ...value, connected: false, address: undefined })), []);
  const submitPayment = useCallback(async (destination: string, amountDrops: string, reference: string) => {
    if (!state.address) throw new Error("Connect GemWallet before signing");
    const response = await submitTransaction({ transaction: buildGemWalletPayment(state.address, destination, amountDrops, reference) });
    return gemWalletTransactionHash(response);
  }, [state.address]);

  useEffect(() => {
    void refresh();
    for (const event of ["EVENT_NETWORK_CHANGED", "EVENT_WALLET_CHANGED", "EVENT_LOGIN", "EVENT_LOGOUT"]) on(event, () => void refresh());
  }, [refresh]);

  const value = useMemo(() => ({ ...state, connect, disconnect, refresh, submitPayment }), [state, connect, disconnect, refresh, submitPayment]);
  return <XrplWalletContext.Provider value={value}>{children}</XrplWalletContext.Provider>;
}

// Provider and hook intentionally share this small module.
// eslint-disable-next-line react-refresh/only-export-components
export const useXrplWallet = () => {
  const context = useContext(XrplWalletContext);
  if (!context) throw new Error("useXrplWallet must be used within XrplWalletProvider");
  return context;
};
