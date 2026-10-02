import type { Metadata } from "next";
import { GameCard } from "@/components/game-card";
import { games } from "@/games/registry";
export const metadata: Metadata = { title: "All games" };
export default function Games() { return <div className="container page-content"><h1>All games<span className="brand-dot">.</span></h1><div className="game-grid">{games.map(game => <GameCard key={game.slug} game={game} />)}</div></div>; }
