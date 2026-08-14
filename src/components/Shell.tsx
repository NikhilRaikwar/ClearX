import { NavLink, Outlet } from "react-router-dom";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { useXrplWallet } from "../contexts/XrplWalletContext";
import { short } from "../lib/format";
import { useMarketPrice, usd } from "../lib/market";
import { TokenIcon, WalletIcon } from "./Icons";

const nav = [["/", "Trade"], ["/open", "Markets"], ["/my-trades", "Portfolio"], ["/how-it-works", "Protocol"]] as const;

export function Shell() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const xrpl = useXrplWallet();
  const price = useMarketPrice();
  return <div className="app-shell">
    <div className="network-bar"><span><i />Coston2 testnet</span><span>XRP/USD <b>{price.data ? usd(price.data.priceUsd) : "Loading…"}</b>{price.data?.stale && <em>stale</em>}</span><span>FDC <b>Operational</b></span></div>
    <header className="header">
      <NavLink to="/" className="brand" aria-label="ClearX home"><span className="brand-mark">CX</span><span>Clear<b>X</b><small>Trustless settlement</small></span></NavLink>
      <nav>{nav.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"}>{label}</NavLink>)}</nav>
      <div className="wallet-group">
        <button className={`chain-chip ${chainId === 114 ? "ready" : ""}`} onClick={() => chainId !== 114 && switchChain({ chainId: 114 })}><TokenIcon token="flare" size={28} /><span>{chainId === 114 ? "Coston2" : "Switch network"}<small>{chainId === 114 ? "Connected" : "Required"}</small></span></button>
        {isConnected ? <button className="wallet-button connected" onClick={() => disconnect()}><WalletIcon size={18} /><span>{short(address!)}<small>MetaMask</small></span></button> : <button className="wallet-button connect" disabled={isPending} onClick={() => connect({ connector: injected() })}><WalletIcon size={18} />{isPending ? "Connecting…" : "Connect wallet"}</button>}
      </div>
    </header>
    <main><Outlet /></main>
    <footer><div className="footer-brand"><span className="brand-mark">CX</span><div><b>ClearX</b><small>Payment-versus-payment on Flare</small></div></div><div className="footer-links"><a href="https://dev.flare.network/fdc/overview" target="_blank">FDC docs</a><a href="https://github.com/NikhilRaikwar/ClearX" target="_blank">GitHub</a><span>Testnet only</span></div></footer>
    <div className="mobile-nav">{nav.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"}>{label}</NavLink>)}</div>
    {xrpl.connected && <div className="xrpl-float"><TokenIcon token="gem" size={26} /><span>{short(xrpl.address!)}<small>GemWallet · {xrpl.network}</small></span></div>}
  </div>;
}
