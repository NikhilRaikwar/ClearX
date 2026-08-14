import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { api } from "../lib/api";
import { Empty, Loading, StatusPill } from "../components/Common";
import { short } from "../lib/format";
export function OpenTrades(){const q=useQuery({queryKey:["public-trades"],queryFn:api.publicTrades,refetchInterval:12000});return <section className="page"><div className="page-heading"><h1>Open Settlements</h1><p>Every offer below is already funded on Flare Coston2.</p></div>{q.isLoading?<Loading/>:q.error?<div className="notice error">Unable to load Coston2 settlements.</div>:!q.data?.length?<Empty title="No funded settlements are open" body="Create the first public settlement and share it with a counterparty." action={<Link className="primary link-button" to="/">Create settlement</Link>}/>:<div className="trade-list">{q.data.map(t=><Link className="trade-row" to={`/settlement/${t.id}`} key={t.id}><div><StatusPill tone="success">FUNDED</StatusPill><small>Settlement #{t.id}</small></div><strong>{formatUnits(BigInt(t.usdt0Amount),6)} USD₮0 <i>for</i> {formatUnits(BigInt(t.xrpAmountDrops),6)} XRP</strong><span>{short(t.maker)}</span><span>{Math.max(0,Math.floor((t.expiry-Date.now()/1000)/60))} min</span><b>Inspect →</b></Link>)}</div>}</section>}
