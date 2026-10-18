import type { ReactNode } from "react";

// 自绘图标：48 格网、2.5 线宽、圆角端点，浅色填充用 currentColor 的透明度，颜色跟随所在分区。
const soft = { fill: "currentColor", fillOpacity: 0.18 };
// 前景形状用容器底色填充，挡住后面的线条。
const knockout = { fill: "var(--icon-bg)" };
const icons = {
  // Mini games 沿用之前的 Lucide gamepad-2（ISC 许可），按 24 格网放大到 48。
  controller: <g transform="scale(2)" strokeWidth="1.6">
    <line x1="6" x2="10" y1="11" y2="11" /><line x1="8" x2="8" y1="9" y2="13" /><line x1="15" x2="15.01" y1="12" y2="12" /><line x1="18" x2="18.01" y1="10" y2="10" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
  </g>,
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
