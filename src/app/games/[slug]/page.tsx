import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { games, getGame } from "@/games/registry";

// 门户只介绍游戏；开始按钮通过注册表的 playUrl 跳转到独立站点。
export function generateStaticParams() { return games.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const game = getGame((await params).slug);
  return { title: game?.title ?? "Game not found" };
}
export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const game = getGame((await params).slug);
  if (!game) notFound();
  return <div className="container page-content">
    <Link href="/games" className="back-link">← All games</Link>
    <div className="game-title"><div><h1>{game.title}</h1></div><span className={`title-icon ${game.color}`}>{game.icon}</span></div>
    <div className="game-overview"><section><h2>About the game</h2><p>{game.about}</p>
    </section><aside className="launch-panel"><span className="launch-icon" aria-hidden="true">{game.icon}</span>
      {game.playUrl ? <a className="button start-game" href={game.playUrl}>Start game</a> : <h2>Coming soon</h2>}
    </aside></div>
    <section className="preview-section"><h2>Preview</h2>{game.previews.length > 0 ? <div className="preview-grid">{game.previews.map(preview => <figure key={preview.src}><a href={preview.src} target="_blank" rel="noopener noreferrer" aria-label={`View ${preview.alt}`}><Image src={preview.src} alt={preview.alt} width={1100} height={1000} unoptimized className="preview-image" /></a></figure>)}</div> : <div className="preview-empty">Screenshots will be added when this game is ready.</div>}</section>
  </div>;
}
