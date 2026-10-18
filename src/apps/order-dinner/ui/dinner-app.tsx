"use client";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { DinnerState, Dish, Order, OrderItem, OrderStatus } from "../types";
import { dishesById } from "../menu";
import { ApiError, createApi } from "../api";
import { useStored } from "./use-stored";
import { MenuView } from "./menu-view";
import { DishSheet } from "./dish-sheet";
import { BasketSheet } from "./basket-sheet";
import { OrdersView } from "./orders-view";
import { ShoppingView } from "./shopping-view";

type Tab = "menu" | "orders" | "shopping";
const pollMs = 15_000;

function parseBasket(raw: string | null | undefined): OrderItem[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value as OrderItem[] : [];
  } catch { return []; }
}

// 第一次打开时填名字和口令，口令对了才进入。
function Setup({ name, onDone }: { name: string; onDone: (name: string, passcode: string) => void }) {
  const [draftName, setDraftName] = useState(name);
  const [passcode, setPasscode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!draftName.trim() || !passcode) { setError("名字和口令都要填"); return; }
    setChecking(true);
    setError("");
    try {
      await createApi(passcode).state();
      onDone(draftName.trim(), passcode);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "口令不对");
      setChecking(false);
    }
  }

  return <form className="din-setup" onSubmit={submit}>
    <h1>点菜</h1>
    <label className="din-field"><h3>你的名字</h3><input value={draftName} maxLength={20} autoComplete="nickname" onChange={(event) => setDraftName(event.target.value)} /></label>
    <label className="din-field"><h3>口令</h3><input type="password" value={passcode} autoComplete="current-password" onChange={(event) => setPasscode(event.target.value)} /></label>
    {error && <p className="din-error">{error}</p>}
    <button type="submit" className="din-primary" disabled={checking}>{checking ? "正在确认…" : "进入"}</button>
  </form>;
}

export function DinnerApp() {
  const [passcode, setPasscode] = useStored("dinner.passcode");
  const [name, setName] = useStored("dinner.name");
  const [basketRaw, setBasketRaw] = useStored("dinner.basket");
  const basket = useMemo(() => parseBasket(basketRaw), [basketRaw]);
  const setBasket = useCallback((items: OrderItem[]) => setBasketRaw(items.length > 0 ? JSON.stringify(items) : null), [setBasketRaw]);

  const [tab, setTab] = useState<Tab>("menu");
  const [state, setState] = useState<DinnerState | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<{ dish: Dish | null; item?: OrderItem } | null>(null);
  const [basketOpen, setBasketOpen] = useState(false);
  const api = useMemo(() => passcode ? createApi(passcode) : null, [passcode]);

  const handleError = useCallback((caught: unknown) => {
    if (caught instanceof ApiError && caught.status === 401) { setPasscode(null); return; }
    setError(caught instanceof Error ? caught.message : "出错了");
  }, [setPasscode]);

  const refresh = useCallback(async () => {
    if (!api) return;
    try { setState(await api.state()); setError(""); } catch (caught) { handleError(caught); }
  }, [api, handleError]);

  // 两个人各用各的手机，靠定时刷新和切回页面时刷新看到对方的改动。
  useEffect(() => {
    if (!api) return;
    let cancelled = false;
    const load = () => { if (!cancelled && document.visibilityState === "visible") void refresh(); };
    load();
    const timer = window.setInterval(load, pollMs);
    document.addEventListener("visibilitychange", load);
    return () => { cancelled = true; window.clearInterval(timer); document.removeEventListener("visibilitychange", load); };
  }, [api, refresh]);

  const run = useCallback(async (action: () => Promise<unknown>) => {
    try { await action(); } catch (caught) { handleError(caught); }
    await refresh();
  }, [handleError, refresh]);

  if (passcode === undefined) return <div className="din" />;
  if (!passcode || !name) return <div className="din"><Setup name={name ?? ""} onDone={(nextName, nextPasscode) => { setName(nextName); setPasscode(nextPasscode); }} /></div>;
  if (!api) return null;
  const ready = api;

  function saveItem(item: OrderItem) {
    const exists = basket.some((entry) => entry.lineId === item.lineId);
    setBasket(exists ? basket.map((entry) => entry.lineId === item.lineId ? item : entry) : [...basket, item]);
    setEditing(null);
  }

  async function submitOrder(note: string) {
    await ready.createOrder({ createdBy: name ?? "", note, items: basket });
    setBasket([]);
    setBasketOpen(false);
    setTab("orders");
    await refresh();
  }

  function setStatus(order: Order, status: OrderStatus) { void run(() => ready.setStatus(order.id, status)); }
  function cancelOrder(order: Order) { if (window.confirm("取消这张订单？")) void run(() => ready.deleteOrder(order.id)); }
  function repeatOrder(order: Order) {
    const items = order.items.filter((item) => !item.dishId || dishesById.has(item.dishId)).map((item) => ({ ...item, lineId: crypto.randomUUID() }));
    setBasket([...basket, ...items]);
    setTab("menu");
    setBasketOpen(true);
  }

  const orders = state?.orders ?? [];
  const openCount = orders.filter((order) => order.status !== "done").length;
  const basketCount = basket.reduce((sum, item) => sum + item.quantity, 0);
  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "menu", label: "点菜" },
    { id: "orders", label: "订单", count: openCount },
    { id: "shopping", label: "买菜" },
  ];

  return <div className="din">
    <header className="din-head">
      <h1>{tabs.find((entry) => entry.id === tab)?.label}</h1>
      <button type="button" className="din-link" onClick={() => { setPasscode(null); setState(null); }}>{name} · 退出</button>
    </header>
    {error && <p className="din-error" role="alert">{error}</p>}

    {tab === "menu" && <MenuView basket={basket} onPick={(dish) => setEditing({ dish })} onDiy={() => setEditing({ dish: null })} />}
    {tab === "orders" && (state ? <OrdersView orders={orders} onStatus={setStatus} onCancel={cancelOrder} onRepeat={repeatOrder} /> : <p className="din-empty">正在加载…</p>)}
    {tab === "shopping" && (state ? <ShoppingView
      state={state}
      onCheck={(line, checked) => void run(() => ready.setCheck(line.key, line.orderIds, checked))}
      onAddExtra={(extra) => run(() => ready.addExtra(extra))}
      onCheckExtra={(id, checked) => void run(() => ready.setExtra(id, checked))}
      onDeleteExtra={(id) => void run(() => ready.deleteExtra(id))}
    /> : <p className="din-empty">正在加载…</p>)}

    {tab === "menu" && basketCount > 0 && <button type="button" className="din-basket-bar" onClick={() => setBasketOpen(true)}>
      <span>已选 {basketCount} 份</span><span>去下单 →</span>
    </button>}

    <nav className="din-tabs" aria-label="点菜 app">
      {tabs.map((entry) => <button key={entry.id} type="button" className={tab === entry.id ? "on" : ""} aria-current={tab === entry.id ? "page" : undefined} onClick={() => setTab(entry.id)}>
        {entry.label}{entry.count ? <span className="din-badge">{entry.count}</span> : null}
      </button>)}
    </nav>

    {editing && <DishSheet
      key={editing.item?.lineId ?? editing.dish?.id ?? "diy"}
      dish={editing.dish}
      initial={editing.item}
      onSave={saveItem}
      onClose={() => setEditing(null)}
    />}
    {basketOpen && !editing && <BasketSheet
      items={basket}
      onEdit={(item) => setEditing({ dish: item.dishId ? dishesById.get(item.dishId) ?? null : null, item })}
      onRemove={(lineId) => setBasket(basket.filter((item) => item.lineId !== lineId))}
      onSubmit={submitOrder}
      onClose={() => setBasketOpen(false)}
    />}
  </div>;
}
