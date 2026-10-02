import Link from "next/link";
import { notFound } from "next/navigation";
import { games, getGame } from "@/games/registry";
import { LemonadePreparation } from "@/games/lemonade-stand/preparation";
// 为注册表中的每个游戏生成独立入口，未知 slug 由 notFound 返回 404。
export function generateStaticParams() { return games.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const game = getGame((await params).slug); return { title: game?.title ?? "Game not found" }; }
export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
 const game = getGame((await params).slug); if (!game) notFound();
 // 已接入的游戏在这里加载组件，其余入口保留 Coming Soon 页面。
 return <div className="container page-content"><Link href="/games" className="back-link">← All games</Link><div className="game-title"><div><h1>{game.title}</h1></div><span className={`title-icon ${game.color}`}>{game.icon}</span></div>{game.slug === "lemonade-stand" ? <LemonadePreparation /> : <section className="placeholder"><span className="placeholder-icon">{game.icon}</span><h2>Coming soon</h2><Link className="button" href="/games">Explore other games →</Link></section>}</div>;
}
