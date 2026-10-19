import type { IconName } from "@/components/item-icon";

export type LifeApp = {
  slug: string;
  title: string;
  icon: IconName;
  status: "ready" | "coming-soon";
  about: string;
  openUrl?: string;
};

// 生活 app 列表和介绍页共用这份注册表；新增 app 从这里开始。
export const apps: LifeApp[] = [
  { slug: "order-dinner", title: "Order Dinner", icon: "bowl", status: "ready", about: "Pick dishes, choose flavors, share orders and get a shopping list.", openUrl: "https://order-dinner.mini-arcade-hub.workers.dev" },
];
export function getApp(slug: string) { return apps.find((app) => app.slug === slug); }
