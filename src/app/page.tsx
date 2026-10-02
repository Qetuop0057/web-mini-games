import Link from "next/link";
import { GameCard } from "@/components/game-card";
import { games } from "@/games/registry";
export default function Home() {
 return <div className="container"><section className="hero"><div><Link className="button" href="/games">Explore games <span>→</span></Link></div></section><section className="collection"><div className="section-heading"><div><h2>Games</h2></div><Link href="/games">View all games →</Link></div><div className="game-grid">{games.map(game => <GameCard key={game.slug} game={game} />)}</div></section></div>;
}
