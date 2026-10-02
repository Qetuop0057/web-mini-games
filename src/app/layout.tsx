import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = { title: { default: "Mini Arcade — Small games, good times", template: "%s | Mini Arcade" }, description: "A growing collection of browser mini games." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><header className="site-header"><Link href="/" className="brand"><span className="brand-icon">✦</span> mini arcade<span className="brand-dot">.</span></Link><nav aria-label="Main navigation"><Link href="/">Home</Link><Link href="/games">All games <span aria-hidden="true">↗</span></Link></nav></header><main>{children}</main></body></html>;
}
