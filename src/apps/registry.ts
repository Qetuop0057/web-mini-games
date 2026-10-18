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
  { slug: "order-dinner", title: "Order Dinner", icon: "bowl", status: "coming-soon", about: "A simple way to pick dishes and put together a meal order." },
];
export function getApp(slug: string) { return apps.find((app) => app.slug === slug); }
