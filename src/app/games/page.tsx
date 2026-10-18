import type { Metadata } from "next";
import { CatalogCard } from "@/components/catalog-card";
import { games } from "@/games/registry";
export const metadata: Metadata = { title: "Mini games" };
export default function Games() { return <div className="container page-content section-games"><h1>Mini games</h1><div className="game-grid">{games.map(game => <CatalogCard key={game.slug} href={`/games/${game.slug}`} item={game} />)}</div></div>; }
