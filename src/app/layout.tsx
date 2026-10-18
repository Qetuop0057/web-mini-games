import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = { title: { default: "Mini Hub", template: "%s | Mini Hub" }, description: "Small browser games and everyday apps." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // 顶栏右侧暂时留空，之后再决定放什么。
  return <html lang="en"><body><header className="top-bar"><Link href="/" className="top-bar-mark" aria-label="Home"><span className="mark-dot games" /><span className="mark-dot apps" /></Link></header><main>{children}</main></body></html>;
}
