import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 20) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true } as const);
export const WalletIcon = ({ size, ...props }: IconProps) => <svg {...base(size)} {...props}><path d="M3.5 6.5h14A2.5 2.5 0 0 1 20 9v9H5.5A2.5 2.5 0 0 1 3 15.5V6.8A2.8 2.8 0 0 1 5.8 4H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M15 11h5v4h-5a2 2 0 1 1 0-4Z" stroke="currentColor" strokeWidth="1.8"/></svg>;
export const ExternalIcon = ({ size, ...props }: IconProps) => <svg {...base(size)} {...props}><path d="M14 5h5v5M19 5l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M18 13v5H6V6h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
export const CopyIcon = ({ size, ...props }: IconProps) => <svg {...base(size)} {...props}><rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M16 8V5H5v11h3" stroke="currentColor" strokeWidth="1.8"/></svg>;
export const ArrowRight = ({ size, ...props }: IconProps) => <svg {...base(size)} {...props}><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
export const ShieldIcon = ({ size, ...props }: IconProps) => <svg {...base(size)} {...props}><path d="M12 3 4.5 6v5.2c0 4.6 3 8 7.5 9.8 4.5-1.8 7.5-5.2 7.5-9.8V6L12 3Z" stroke="currentColor" strokeWidth="1.8"/><path d="m8.5 12 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
export const ClockIcon = ({ size, ...props }: IconProps) => <svg {...base(size)} {...props}><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
export const ChevronDown = ({ size, ...props }: IconProps) => <svg {...base(size)} {...props}><path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;

export function TokenIcon({ token, size = 34 }: { token: "xrp" | "usdt0" | "flare" | "fdc" | "gem"; size?: number }) {
  if (token !== "gem") return <span className={`token-icon token-${token}`} style={{ width: size, height: size }}><img src={`/assets/${token}.svg`} alt="" /></span>;
  return <span className="token-icon token-gem" style={{ width: size, height: size }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 4 6 5-6 11L6 9l6-5Z" stroke="currentColor" strokeWidth="1.6"/><path d="m6 9 6 3 6-3" stroke="currentColor" strokeWidth="1.4"/></svg></span>;
}
