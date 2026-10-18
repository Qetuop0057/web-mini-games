import Link from "next/link";
import { ItemIcon } from "@/components/item-icon";

// 主页只做一件事：在游戏平台和生活 app 平台之间二选一。
export default function Home() {
  return <div className="doors">
    <Link href="/games" className="door door-games"><ItemIcon name="controller" className="door-icon" /><span>Mini games</span></Link>
    <Link href="/apps" className="door door-apps"><ItemIcon name="home" className="door-icon" /><span>Life apps</span></Link>
  </div>;
}
