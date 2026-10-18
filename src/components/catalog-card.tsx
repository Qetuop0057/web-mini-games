import Link from "next/link";
import { ItemIcon, type IconName } from "@/components/item-icon";

// 游戏和生活 app 的列表页共用这张卡片；颜色跟随所在分区，未上线的用虚线框。
type CardItem = { title: string; icon: IconName; status: "ready" | "coming-soon" };
export function CatalogCard({ href, item }: { href: string; item: CardItem }) {
  const soon = item.status === "coming-soon";
  return <Link href={href} className={soon ? "tile tile-soon" : "tile"}>
    <ItemIcon name={item.icon} className="tile-icon" /><span>{item.title}</span>{soon && <span className="sr-only">(coming soon)</span>}
  </Link>;
}
