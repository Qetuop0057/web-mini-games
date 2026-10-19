import { useEffect, useRef, type ReactNode } from "react";

// 从底部弹出的面板；按 Esc 或点遮罩关闭。
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  // 父组件每次渲染都会传新的 onClose，用 ref 拿最新的，避免反复挂载监听。
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close.current(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, []);
  return <div className="din-overlay" onClick={onClose}>
    <div className="din-sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
      <header className="din-sheet-head"><h2>{title}</h2><button type="button" className="din-close" aria-label="关闭" onClick={onClose}>×</button></header>
      {children}
    </div>
  </div>;
}
