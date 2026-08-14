import { NavLink, Outlet } from "react-router-dom";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";

const short = (value: string) => `${value.slice(0,6)}...${value.slice(-4)}`;
export function Shell() {
  const { address, isConnected, chainId } = useAccount(); const { connect, isPending } = useConnect(); const { disconnect } = useDisconnect(); const { switchChain } = useSwitchChain();
  return <div className="app-shell"><header className="header"><NavLink to="/" className="wordmark">Clear<span>X</span></NavLink><nav><NavLink to="/">Trade</NavLink><NavLink to="/open">Open Settlements</NavLink><NavLink to="/my-trades">My Trades</NavLink><NavLink to="/how-it-works">How it works</NavLink></nav><div className="wallet-group"><button className={chainId===114?"network good":"network"} onClick={()=>chainId!==114&&switchChain({chainId:114})}>{chainId===114?"Coston2":"Switch to Coston2"}</button>{isConnected?<button className="wallet" onClick={()=>disconnect()}>{short(address!)}</button>:<button className="primary compact" disabled={isPending} onClick={()=>connect({connector:injected()})}>{isPending?"Connecting...":"Connect wallet"}</button>}</div></header><main><Outlet /></main><footer><b>ClearX</b><span>Built for Flare Summer Signal</span><a href="https://dev.flare.network/fdc/overview" target="_blank">Flare Data Connector</a></footer></div>;
}

