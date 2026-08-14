import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { api } from "../lib/api";
import { Empty, Loading, StatusPill } from "../components/Common";
import { ArrowRight, ClockIcon, TokenIcon } from "../components/Icons";
import { short } from "../lib/format";
import { useMarketPrice, usd } from "../lib/market";

export function OpenTrades() {
  const q = useQuery({ queryKey: ["public-trades"], queryFn: api.publicTrades, refetchInterval: 12_000 });
  const market = useMarketPrice();
  return <section className="page market-page">
    <div className="page-heading split"><div><span className="section-kicker">FUNDED MARKET</span><h1>Open settlements</h1><p>Every offer is already backed by USD₮0 locked on Flare Coston2.</p></div><Link className="primary link-button" to="/">Create settlement <ArrowRight /></Link></div>
    <div className="market-summary"><span><i className="pulse" /> LIVE ONCHAIN</span><div><small>XRP / USD REFERENCE</small><b>{market.data ? usd(market.data.priceUsd) : "Loading…"}</b></div><p>Direct bilateral rates · No orderbook · No custody</p></div>
    {q.isLoading ? <Loading /> : q.error ? <div className="notice error">Unable to load Coston2 settlements.</div> : !q.data?.length ? <Empty title="No funded settlements are open" body="Create the first public settlement and share it with a counterparty." action={<Link className="primary link-button" to="/">Create settlement</Link>} /> : <div className="market-grid">{q.data.map(t => {
      const usdt = Number(formatUnits(BigInt(t.usdt0Amount), 6)); const xrp = Number(formatUnits(BigInt(t.xrpAmountDrops), 6)); const mins = Math.max(0, Math.floor((t.expiry - Date.now() / 1000) / 60));
      return <Link className="market-trade-card" to={`/settlement/${t.id}`} key={t.id}><div className="card-heading"><div><StatusPill tone="success">FUNDED</StatusPill><small>Settlement #{t.id}</small></div><span className="time"><ClockIcon />{mins} min</span></div><div className="pair-row"><div><TokenIcon token="usdt0" /><span><small>LOCKED</small><b>{usdt} USD₮0</b><em>≈ {usd(usdt)} testnet ref.</em></span></div><ArrowRight /><div><TokenIcon token="xrp" /><span><small>REQUESTED</small><b>{xrp} XRP</b><em>≈ {market.data ? usd(xrp * market.data.priceUsd) : "—"}</em></span></div></div><div className="trade-card-foot"><span>Maker <b>{short(t.maker)}</b></span><strong>Inspect trade <ArrowRight /></strong></div></Link>;
    })}</div>}
  </section>;
}
