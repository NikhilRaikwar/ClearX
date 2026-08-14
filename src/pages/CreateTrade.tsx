import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { api } from "../lib/api";
import { clearXAbi, erc20Abi } from "../lib/contracts";
import { useMarketPrice, usd as usdValue } from "../lib/market";
import { useXrplWallet } from "../contexts/XrplWalletContext";
import { ExplorerLink } from "../components/Common";
import { ArrowRight, ShieldIcon, TokenIcon } from "../components/Icons";

export function CreateTrade() {
  const { address, chainId } = useAccount();
  const { data: cfg } = useQuery({ queryKey: ["config"], queryFn: api.config });
  const market = useMarketPrice();
  const gem = useXrplWallet();
  const [usd, setUsd] = useState("5"); const [xrp, setXrp] = useState("10"); const [xrpl, setXrpl] = useState(""); const [minutes, setMinutes] = useState(60); const [listed, setListed] = useState(true);
  useEffect(() => { if (gem.connected && gem.network === "Testnet" && gem.address && !xrpl) setXrpl(gem.address); }, [gem.connected, gem.network, gem.address, xrpl]);
  const { data: decimals = 6 } = useReadContract({ abi: erc20Abi, address: cfg?.usdt0Address ?? undefined, functionName: "decimals", query: { enabled: !!cfg?.usdt0Address } });
  const amount = usd && Number(usd) > 0 ? parseUnits(usd, Number(decimals)) : 0n;
  const { data: balance = 0n } = useReadContract({ abi: erc20Abi, address: cfg?.usdt0Address ?? undefined, functionName: "balanceOf", args: address ? [address] : undefined, query: { enabled: !!address && !!cfg?.usdt0Address } });
  const { data: allowance = 0n, refetch } = useReadContract({ abi: erc20Abi, address: cfg?.usdt0Address ?? undefined, functionName: "allowance", args: address && cfg?.clearXContractAddress ? [address, cfg.clearXContractAddress] : undefined, query: { enabled: !!address && !!cfg?.clearXContractAddress && !!cfg.usdt0Address } });
  const { writeContract, data: hash, isPending, error } = useWriteContract(); const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const approve = () => cfg?.usdt0Address && cfg.clearXContractAddress && writeContract({ abi: erc20Abi, address: cfg.usdt0Address, functionName: "approve", args: [cfg.clearXContractAddress, amount] }, { onSuccess: () => setTimeout(() => refetch(), 3000) });
  const create = () => cfg?.clearXContractAddress && writeContract({ abi: clearXAbi, address: cfg.clearXContractAddress, functionName: "createTrade", args: [amount, parseUnits(xrp, 6), xrpl, BigInt(Math.floor(Date.now() / 1000) + minutes * 60), listed] });
  const ready = !!address && chainId === 114 && !!cfg?.configured && amount > 0n && Number(xrp) > 0 && xrpl.startsWith("r") && balance >= amount;
  const xrpUsd = Number(xrp || 0) * (market.data?.priceUsd ?? 0); const implied = Number(xrp) ? Number(usd) / Number(xrp) : 0; const premium = market.data?.priceUsd && implied ? ((implied / market.data.priceUsd) - 1) * 100 : 0;
  return <>
    <section className="hero defi-hero"><div className="hero-glow" /><span className="eyebrow"><i />LIVE ON COSTON2</span><h1>Settle native XRP.<br /><em>Without sending first.</em></h1><p>Lock USD₮0 on Flare, receive XRP directly, and let decentralized FDC consensus enforce the exchange.</p><div className="hero-actions"><a href="#composer" className="primary">Create settlement <ArrowRight /></a><Link to="/open" className="secondary">Explore funded markets</Link></div><div className="proof-chips"><span><TokenIcon token="xrp" size={24} />Native XRP</span><span><TokenIcon token="flare" size={24} />Flare escrow</span><span><TokenIcon token="fdc" size={24} />FDC verified</span></div></section>
    <section className="trade-composer" id="composer">
      <div className="composer-head"><div><span className="section-kicker">NEW SETTLEMENT</span><h2>Define your bilateral trade</h2></div><div className="market-ticker"><small>XRP / USD MARKET REFERENCE</small><b>{market.data ? usdValue(market.data.priceUsd) : "Loading…"}</b><span className={market.data?.stale ? "stale" : "live"}>{market.data?.stale ? "Stale quote" : "Live · Coinbase"}</span></div></div>
      {!cfg?.configured && <div className="notice warning">Deployment configuration is pending.</div>}
      <div className="amount-grid premium">
        <label className="amount-panel"><span>YOU LOCK</span><div className="asset-line"><TokenIcon token="usdt0" size={42} /><div><b>USD₮0</b><small>Flare Coston2</small></div></div><input value={usd} onChange={e => setUsd(e.target.value)} inputMode="decimal" aria-label="USDt0 amount to lock" /><div className="amount-meta"><span>≈ {usdValue(Number(usd || 0))} <em>testnet reference</em></span><span>Balance {formatUnits(balance, Number(decimals))}</span></div></label>
        <div className="swap-direction"><ArrowRight /></div>
        <label className="amount-panel"><span>YOU RECEIVE</span><div className="asset-line"><TokenIcon token="xrp" size={42} /><div><b>XRP</b><small>XRP Ledger Testnet</small></div></div><input value={xrp} onChange={e => setXrp(e.target.value)} inputMode="decimal" aria-label="XRP amount to receive" /><div className="amount-meta"><span>≈ {market.data ? usdValue(xrpUsd) : "—"} <em>market reference</em></span><span>{implied ? `${usdValue(implied)}/XRP` : "Custom rate"}</span></div></label>
      </div>
      {market.data && <div className="rate-strip"><span>Agreed value <b>{usdValue(Number(usd || 0))}</b></span><span>Market value <b>{usdValue(xrpUsd)}</b></span><span>Rate difference <b className={premium > 0 ? "positive" : "negative"}>{premium >= 0 ? "+" : ""}{premium.toFixed(1)}%</b></span><small>Reference only. Contract settlement uses the exact entered amounts.</small></div>}
      <div className="form-grid"><label>Your XRP receiving address<div className="input-with-action"><input value={xrpl} onChange={e => setXrpl(e.target.value.trim())} placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXX" />{gem.connected ? <button type="button" onClick={() => gem.address && setXrpl(gem.address)}>Use GemWallet</button> : <button type="button" onClick={() => void gem.connect()}>{gem.installed ? "Connect GemWallet" : "Check GemWallet"}</button>}</div><small>Native XRP moves directly here. ClearX never has custody.</small></label><label>Settlement window<select value={minutes} onChange={e => setMinutes(Number(e.target.value))}><option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={60}>1 hour</option><option value={180}>3 hours</option></select><small>Includes time for payment and FDC consensus.</small></label></div>
      {gem.connected && gem.network !== "Testnet" && <div className="notice error">GemWallet is on {gem.network}. Switch it to XRPL Testnet before using this address.</div>}
      <div className="composer-footer"><label className="check"><input type="checkbox" checked={listed} onChange={e => setListed(e.target.checked)} /><span>List publicly<small>Anyone can inspect and reserve this funded settlement.</small></span></label><div className="action-stack">{error && <div className="notice error">{error.message}</div>}{allowance < amount ? <button className="primary action-main" disabled={!ready || isPending || isConfirming} onClick={approve}>{isPending ? "Confirm in wallet…" : isConfirming ? "Approving USD₮0…" : `Approve ${usd || "0"} USD₮0`}</button> : <button className="primary action-main" disabled={!ready || isPending || isConfirming} onClick={create}>{isPending ? "Confirm in wallet…" : isConfirming ? "Funding escrow…" : "Lock & create settlement"}</button>}{hash && cfg && <ExplorerLink href={`${cfg.explorerUrl}/tx/${hash}`}>{isSuccess ? "Transaction confirmed" : "View pending transaction"}</ExplorerLink>}</div></div>
    </section>
    <SettlementRail /><Trust />
  </>;
}

function SettlementRail() { return <section className="protocol-rail"><div><TokenIcon token="usdt0" /><span><small>01 · FUND</small><b>USD₮0 escrowed</b></span></div><ArrowRight /><div><TokenIcon token="xrp" /><span><small>02 · PAY</small><b>Native XRP sent</b></span></div><ArrowRight /><div><TokenIcon token="fdc" /><span><small>03 · PROVE</small><b>FDC consensus</b></span></div><ArrowRight /><div><TokenIcon token="flare" /><span><small>04 · RELEASE</small><b>Atomic settlement</b></span></div></section>; }
function Trust() { return <section className="trust"><article><ShieldIcon /><h3>No send-first risk</h3><p>The Flare asset is visibly funded before native XRP moves.</p></article><article><TokenIcon token="xrp" /><h3>Native stays native</h3><p>XRP travels directly between externally controlled XRPL wallets.</p></article><article><TokenIcon token="fdc" /><h3>Proof, not promises</h3><p>USD₮0 releases only after the onchain FDC verifier accepts the proof.</p></article></section>; }
