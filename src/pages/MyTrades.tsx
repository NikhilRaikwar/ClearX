import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { api } from "../lib/api";
import { Empty, Loading, StatusPill } from "../components/Common";
import { ArrowRight, TokenIcon, WalletIcon } from "../components/Icons";
import { useMarketPrice, usd } from "../lib/market";
const names = ["NONE", "OPEN", "RESERVED", "SETTLED", "CANCELLED"];
export function MyTrades() {
  const { address } = useAccount(); const market = useMarketPrice();
  const q = useQuery({ queryKey: ["wallet-trades", address], queryFn: () => api.walletTrades(address!), enabled: !!address, refetchInterval: 10_000 });
  if (!address) return <section className="page"><Empty title="Connect your Coston2 wallet" body="Your created, reserved, and completed settlements will appear here." /></section>;
  const trades = q.data ?? []; const open = trades.filter(t => t.status === 1).length; const reserved = trades.filter(t => t.status === 2).length; const settled = trades.filter(t => t.status === 3).length;
  return <section className="page portfolio-page"><div className="page-heading"><span className="section-kicker">YOUR ACTIVITY</span><h1>Settlement portfolio</h1><p>Created and reserved trades for your connected Coston2 account.</p></div><div className="portfolio-stats"><article><small>TOTAL TRADES</small><b>{trades.length}</b><span><WalletIcon /> Connected portfolio</span></article><article><small>OPEN</small><b>{open}</b><span>Funded by you</span></article><article><small>RESERVED</small><b>{reserved}</b><span>Payment in progress</span></article><article><small>SETTLED</small><b>{settled}</b><span>FDC verified</span></article></div>
    {q.isLoading ? <Loading /> : q.error ? <div className="notice error">Unable to read your Coston2 activity.</div> : !trades.length ? <Empty title="No settlements yet" body="Create or reserve a funded settlement to begin." action={<Link className="primary link-button" to="/open">Explore markets</Link>} /> : <div className="portfolio-list">{trades.map(t => { const usdt = Number(formatUnits(BigInt(t.usdt0Amount), 6)); const xrp = Number(formatUnits(BigInt(t.xrpAmountDrops), 6)); const maker = t.maker.toLowerCase() === address.toLowerCase(); return <Link to={`/settlement/${t.id}`} className="portfolio-row" key={t.id}><div><StatusPill tone={t.status === 3 ? "success" : t.status === 2 ? "warning" : "neutral"}>{names[t.status]}</StatusPill><span><small>SETTLEMENT</small><b>#{t.id}</b></span></div><div className="mini-pair"><TokenIcon token="usdt0" /><span><b>{usdt} USD₮0</b><small>≈ {usd(usdt)}</small></span><ArrowRight /><TokenIcon token="xrp" /><span><b>{xrp} XRP</b><small>≈ {market.data ? usd(xrp * market.data.priceUsd) : "—"}</small></span></div><span className="role">{maker ? "Maker" : "Taker"}<small>{maker ? "Created by you" : "Reserved by you"}</small></span><strong className="row-action">Open <ArrowRight /></strong></Link>; })}</div>}
  </section>;
}
