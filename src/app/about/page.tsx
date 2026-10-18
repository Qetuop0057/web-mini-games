import type { Metadata } from "next";
import { Fragment } from "react";
export const metadata: Metadata = { title: "About" };

// 作者和程序信息集中写在这里，改内容只需要动这一份列表。
const rows: { label: string; value: React.ReactNode }[] = [
  { label: "Author", value: <a href="https://github.com/Qetuop0057" target="_blank" rel="noopener noreferrer">Qetuop0057</a> },
  { label: "Project", value: "Small browser games and everyday apps, all running in the browser with no account needed." },
  { label: "Source", value: <a href="https://github.com/Qetuop0057/web-mini-games" target="_blank" rel="noopener noreferrer">github.com/Qetuop0057/web-mini-games</a> },
  { label: "Built with", value: "Next.js, React, TypeScript, Tailwind CSS, HTML Canvas" },
  { label: "Hosting", value: "Cloudflare Workers" },
  { label: "Art credits", value: <a href="/previews/art-credits.txt" target="_blank" rel="noopener noreferrer">Lemonade Stand art credits</a> },
];

export default function About() {
  return <div className="container page-content"><h1>About</h1>
    <dl className="about-list">{rows.map(row => <Fragment key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></Fragment>)}</dl>
  </div>;
}
