import type { Metadata } from "next";
import { DinnerApp } from "@/apps/order-dinner/ui/dinner-app";
export const metadata: Metadata = { title: "点菜" };
export default function Dinner() { return <div lang="zh-CN" className="section-apps"><DinnerApp /></div>; }
