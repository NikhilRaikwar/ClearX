import { useState, type ReactNode } from "react";
import { CopyIcon, ExternalIcon, TokenIcon } from "./Icons";

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) { return <span className={`status ${tone}`}><i />{children}</span>; }
export function ExplorerLink({ href, children }: { href: string; children: ReactNode }) { return <a className="explorer" href={href} target="_blank" rel="noreferrer">{children}<ExternalIcon size={14} /></a>; }
export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) { const [copied, setCopied] = useState(false); const copy = async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1400); }; return <button className="copy-button" type="button" onClick={copy} aria-label={`Copy ${label}`}><CopyIcon size={15} />{copied ? "Copied" : label}</button>; }
export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) { return <div className="empty"><div className="empty-mark"><TokenIcon token="fdc" size={48} /></div><h2>{title}</h2><p>{body}</p>{action}</div>; }
export function Loading() { return <div className="skeleton" aria-label="Loading"><i /><i /><i /></div>; }
export function Metric({ label, value, detail }: { label: string; value: ReactNode; detail?: ReactNode }) { return <div className="metric"><small>{label}</small><strong>{value}</strong>{detail && <span>{detail}</span>}</div>; }
