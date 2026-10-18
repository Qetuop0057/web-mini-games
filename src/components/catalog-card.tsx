import Link from "next/link";

// 游戏和生活 app 的列表页共用这张卡片。
type CardItem = { title: string; icon: string; color: string; status: "ready" | "coming-soon" };
export function CatalogCard({ href, item }: { href: string; item: CardItem }) {
  return <Link href={href} className="game-card">
    <div className={`game-art ${item.color}`}><span>{item.icon}</span><span className="art-spark">✦</span></div>
    <div className="card-body"><h3>{item.title}</h3>{item.status === "coming-soon" && <span className="game-status">Coming soon</span>}
      <span aria-hidden="true" className="card-arrow">↗</span>
    </div>
  </Link>;
}
