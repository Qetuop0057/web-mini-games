import Link from "next/link";
import { GamepadIcon, UtensilsIcon } from "@/components/icons";

// 主页只做一件事：在游戏平台和生活 app 平台之间二选一。
export default function Home() {
  return <div className="doors">
    <Link href="/games" className="door door-games"><GamepadIcon className="door-icon" /><span>Mini games</span></Link>
    <Link href="/apps" className="door door-apps"><UtensilsIcon className="door-icon" /><span>Life apps</span></Link>
  </div>;
}
