import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { BrowserRouter } from "react-router-dom";
import { wagmiConfig } from "./lib/wagmi";
import { App } from "./App";
import "./styles.css";
import { XrplWalletProvider } from "./contexts/XrplWalletContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={new QueryClient()}>
        <XrplWalletProvider>
          <BrowserRouter>
            <App />
            <Analytics />
          </BrowserRouter>
        </XrplWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
