import type { ReactNode } from "react";

// 自绘图标：48 格网、2.5 线宽、圆角端点，浅色填充用 currentColor 的透明度，颜色跟随所在分区。
const soft = { fill: "currentColor", fillOpacity: 0.18 };
// 前景形状用容器底色填充，挡住后面的线条。
const knockout = { fill: "var(--icon-bg)" };
const icons = {
  controller: <>
    <rect x="5" y="14" width="38" height="22" rx="11" {...soft} />
    <rect x="5" y="14" width="38" height="22" rx="11" />
    <path d="M15 21v8M11 25h8" />
    <circle cx="31" cy="23" r="1.5" fill="currentColor" /><circle cx="36" cy="27" r="1.5" fill="currentColor" />
  </>,
  home: <>
    <path d="M8 22 24 9l16 13v17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z" {...soft} />
    <path d="M8 22 24 9l16 13v17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z" />
    <path d="M20 41V30h8v11" />
  </>,
  lemonade: <>
    <path d="M15.5 22h17l-1.7 18h-13.6z" {...soft} />
    <path d="M12 12h24l-3 28H15z" />
    <path d="M27 12 31 4" />
    <circle cx="35" cy="13" r="6" style={knockout} /><circle cx="35" cy="13" r="6" />
    <path d="M35 7v12M29 13h12" strokeWidth="1.5" />
  </>,
  bowl: <>
    <path d="M7 25h34a17 15 0 0 1-34 0z" {...soft} />
    <path d="M7 25h34a17 15 0 0 1-34 0z" />
    <path d="M19 40h10" />
    <path d="M24 21 31 5M29 21l9-13" />
  </>,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof icons;
export function ItemIcon({ name, className }: { name: IconName; className?: string }) {
  return <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>;
}
