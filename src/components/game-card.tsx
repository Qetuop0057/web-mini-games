import Link from "next/link";
import type { Game } from "@/games/registry";
export function GameCard({ game }: { game: Game }) {
  return <Link href={`/games/${game.slug}`} className="game-card">
    <div className={`game-art ${game.color}`}><span>{game.icon}</span><span className="art-spark">✦</span></div>
    <div className="card-body"><h3>{game.title}</h3>{game.status === "coming-soon" && <span className="game-status">Coming soon</span>}
      <span aria-hidden="true" className="card-arrow">↗</span>
    </div>
  </Link>;
}
