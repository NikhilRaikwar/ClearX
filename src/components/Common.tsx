import type { ReactNode } from "react";
export function StatusPill({children,tone="neutral"}:{children:ReactNode;tone?:"neutral"|"success"|"warning"}) { return <span className={`status ${tone}`}>{children}</span>; }
export function ExplorerLink({href,children}:{href:string;children:ReactNode}) { return <a className="explorer" href={href} target="_blank" rel="noreferrer">{children} ↗</a>; }
export function Empty({title,body,action}:{title:string;body:string;action?:ReactNode}) { return <div className="empty"><div className="empty-mark">CX</div><h2>{title}</h2><p>{body}</p>{action}</div>; }
export function Loading() { return <div className="skeleton"><i/><i/><i/></div>; }
