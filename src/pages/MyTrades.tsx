import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { api } from "../lib/api";
import { Empty, Loading, StatusPill } from "../components/Common";
const names=["NONE","OPEN","TAKEN","SETTLED","CANCELLED"];
export function MyTrades(){const {address}=useAccount();const q=useQuery({queryKey:["wallet-trades",address],queryFn:()=>api.walletTrades(address!),enabled:!!address,refetchInterval:10000});if(!address)return <section className="page"><Empty title="Connect your wallet" body="Your created, reserved, and completed settlements will appear here."/></section>;return <section className="page"><div className="page-heading"><h1>My Trades</h1><p>Live settlement state read from Coston2.</p></div>{q.isLoading?<Loading/>:!q.data?.length?<Empty title="No settlements yet" body="Create or reserve a funded settlement to begin."/>:<div className="trade-list">{q.data.map(t=><Link className="trade-row" to={`/settlement/${t.id}`} key={t.id}><StatusPill tone={t.status===3?"success":t.status===2?"warning":"neutral"}>{names[t.status]}</StatusPill><strong>{formatUnits(BigInt(t.usdt0Amount),6)} USD₮0 <i>for</i> {formatUnits(BigInt(t.xrpAmountDrops),6)} XRP</strong><span>{t.maker.toLowerCase()===address.toLowerCase()?"Created by you":"Taken by you"}</span><b>Open →</b></Link>)}</div>}</section>}

