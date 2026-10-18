import { useCallback, useSyncExternalStore } from "react";

// 本机记住名字、口令和没提交的购物篮。localStorage 用不了（隐私模式等）时只记在这次打开的页面里。
const changeEvent = "dinner-storage";
const memory = new Map<string, string>();

function read(key: string) {
  let stored: string | null = null;
  try { stored = window.localStorage.getItem(key); } catch {}
  return stored ?? memory.get(key) ?? null;
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(changeEvent, onChange);
  return () => { window.removeEventListener("storage", onChange); window.removeEventListener(changeEvent, onChange); };
}

// 返回 undefined 表示还在服务端渲染，页面还不知道本机存了什么。
export function useStored(key: string): [string | null | undefined, (value: string | null) => void] {
  const value = useSyncExternalStore(subscribe, () => read(key), () => undefined);
  const setValue = useCallback((next: string | null) => {
    if (next === null) memory.delete(key);
    else memory.set(key, next);
    try {
      if (next === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, next);
    } catch {}
    window.dispatchEvent(new Event(changeEvent));
  }, [key]);
  return [value, setValue];
}
