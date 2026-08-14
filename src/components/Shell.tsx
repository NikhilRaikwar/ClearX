import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { useXrplWallet } from "../contexts/XrplWalletContext";
import { short } from "../lib/format";
import { useMarketPrice, usd } from "../lib/market";
import { ChevronDown, CopyIcon, TokenIcon, WalletIcon } from "./Icons";

const nav = [["/", "Trade"], ["/open", "Markets"], ["/my-trades", "Portfolio"], ["/how-it-works", "Protocol"]] as const;

export function Shell() {
  const { address, isConnected, chainId } = useAccount(); const { connect, isPending } = useConnect(); const { disconnect } = useDisconnect(); const { switchChain } = useSwitchChain();
  const xrpl = useXrplWallet(); const price = useMarketPrice(); const [evmOpen, setEvmOpen] = useState(false); const [xrplOpen, setXrplOpen] = useState(false); const [copied, setCopied] = useState("");
  const copy = async (value: string, key: string) => { await navigator.clipboard.writeText(value); setCopied(key); setTimeout(() => setCopied(""), 1400); };
  return <div className="app-shell">
    <div className="network-bar"><span><i />Coston2 testnet</span><span>XRP/USD <b>{price.data ? usd(price.data.priceUsd) : "Loading…"}</b>{price.data?.stale && <em>stale</em>}</span><span>FDC <b>Operational</b></span></div>
    <header className="header">
      <NavLink to="/" className="brand" aria-label="ClearX home"><span>Clear<b>X</b><small>Trustless settlement</small></span></NavLink>
      <nav>{nav.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"}>{label}</NavLink>)}</nav>
      <div className="wallet-group">
        {!isConnected ? <button className="wallet-button connect" disabled={isPending} onClick={() => connect({ connector: injected() })}><WalletIcon size={18} />{isPending ? "Connecting…" : "Connect MetaMask"}</button> : <div className="wallet-menu"><button className="wallet-button connected" onClick={() => { setEvmOpen(!evmOpen); setXrplOpen(false); }} aria-expanded={evmOpen}><TokenIcon token="flare" size={27} /><span>{short(address!)}<small>{chainId === 114 ? "Coston2" : "Wrong network"}</small></span><ChevronDown size={15} /></button>{evmOpen && <WalletDropdown title="MetaMask" network={chainId === 114 ? "Flare Coston2" : `Chain ${chainId}`} address={address!} copied={copied === "evm"} onCopy={() => void copy(address!, "evm")} onNetwork={() => switchChain({ chainId: 114 })} onDisconnect={() => { disconnect(); setEvmOpen(false); }} />}</div>}
        <div className="wallet-menu"><button className={`wallet-button gem ${xrpl.connected ? "connected" : ""}`} onClick={() => xrpl.connected ? (setXrplOpen(!xrplOpen), setEvmOpen(false)) : void xrpl.connect()}><TokenIcon token="gem" size={27} /><span>{xrpl.connected ? short(xrpl.address!) : "GemWallet"}<small>{xrpl.connected ? xrpl.network : xrpl.installed ? "Connect XRPL" : "Install extension"}</small></span>{xrpl.connected && <ChevronDown size={15} />}</button>{xrpl.connected && xrplOpen && <WalletDropdown title="GemWallet" network={`XRPL ${xrpl.network}`} address={xrpl.address!} copied={copied === "xrpl"} onCopy={() => void copy(xrpl.address!, "xrpl")} onDisconnect={() => { xrpl.disconnect(); setXrplOpen(false); }} />}</div>
      </div>
    </header>
    <main><Outlet /></main>
    <footer><div className="footer-brand"><div><b>Clear<span>X</span></b><small>Payment-versus-payment on Flare</small></div></div><div className="footer-links"><a href="https://dev.flare.network/fdc/overview" target="_blank">FDC docs</a><a href="https://github.com/NikhilRaikwar/ClearX" target="_blank">GitHub</a><span>Testnet only</span></div></footer>
    <div className="mobile-nav">{nav.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"}>{label}</NavLink>)}</div>
  </div>;
}

function WalletDropdown({ title, network, address, copied, onCopy, onNetwork, onDisconnect }: { title: string; network: string; address: string; copied: boolean; onCopy: () => void; onNetwork?: () => void; onDisconnect: () => void }) { return <div className="wallet-dropdown"><div className="wallet-dropdown-head"><span><b>{title}</b><small>{network}</small></span><i /></div><div className="wallet-address"><small>CONNECTED ADDRESS</small><code>{address}</code><button onClick={onCopy}><CopyIcon size={15} />{copied ? "Copied" : "Copy address"}</button></div>{onNetwork && !network.includes("Coston2") && <button className="dropdown-action" onClick={onNetwork}>Switch to Coston2</button>}<button className="dropdown-action disconnect" onClick={onDisconnect}>Disconnect wallet</button></div>; }
