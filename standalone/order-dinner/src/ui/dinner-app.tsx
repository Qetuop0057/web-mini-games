import { useCallback, useEffect, useMemo, useState } from "react";
import type { DinnerState, Dish, Order, OrderItem, OrderStatus } from "../types";
import { dishesById } from "../menu";
import { ApiError, createApi, type DinnerStore } from "../api";
import { createLocalStore } from "../local-store";
import { useStored } from "./use-stored";
import { MenuView } from "./menu-view";
import { DishSheet } from "./dish-sheet";
import { BasketSheet, type SubmitMode } from "./basket-sheet";
import { OrdersView } from "./orders-view";
import { ShoppingView } from "./shopping-view";
import { ConnectForm } from "./connect-form";
import { Sheet } from "./sheet";

type Tab = "menu" | "orders" | "shopping";
const pollMs = 15_000;

function parseBasket(raw: string | null | undefined): OrderItem[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value as OrderItem[] : [];
  } catch { return []; }
}

// 谁都能看菜、加购物篮。下单时才问口令：口令对了就进入共享模式，记在这台设备上；
// 没有口令就是单机模式，订单和买菜清单只存在本机。
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
  const [connecting, setConnecting] = useState(false);

  // passcode 为 undefined 时页面还在服务端渲染，先只显示菜单。
  const connected = Boolean(passcode);
  const store = useMemo<DinnerStore | null>(() => passcode === undefined ? null : passcode ? createApi(passcode) : createLocalStore(), [passcode]);

  const handleError = useCallback((caught: unknown) => {
    if (caught instanceof ApiError && caught.status === 401) {
      setPasscode(null);
      setError("口令已经变了，现在是单机模式。下次下单时重新输入口令。");
      return;
    }
    setError(caught instanceof Error ? caught.message : "出错了");
  }, [setPasscode]);

  const refresh = useCallback(async () => {
    if (!store) return;
    try { setState(await store.state()); setError(""); } catch (caught) { handleError(caught); }
  }, [store, handleError]);

  // 共享模式下两个人各用各的手机，靠定时刷新和切回页面时刷新看到对方的改动。
  useEffect(() => {
    if (!store) return;
    let cancelled = false;
    const load = () => { if (!cancelled && document.visibilityState === "visible") void refresh(); };
    load();
    if (!connected) return () => { cancelled = true; };
    const timer = window.setInterval(load, pollMs);
    document.addEventListener("visibilitychange", load);
    return () => { cancelled = true; window.clearInterval(timer); document.removeEventListener("visibilitychange", load); };
  }, [store, connected, refresh]);

  const run = useCallback(async (action: (store: DinnerStore) => Promise<unknown>) => {
    if (!store) return;
    try { await action(store); } catch (caught) { handleError(caught); }
    await refresh();
  }, [store, handleError, refresh]);

  function saveItem(item: OrderItem) {
    const exists = basket.some((entry) => entry.lineId === item.lineId);
    setBasket(exists ? basket.map((entry) => entry.lineId === item.lineId ? item : entry) : [...basket, item]);
    setEditing(null);
  }

  async function submitOrder(note: string, mode: SubmitMode) {
    if (mode === "saved") {
      if (!store) return;
      await store.createOrder({ createdBy: name || "我", note, items: basket });
    } else if (mode === "local") {
      await createLocalStore().createOrder({ createdBy: name || "我", note, items: basket });
    } else {
      // 先用新口令发出去；成功了才记住口令和名字，切换到共享模式。
      await createApi(mode.passcode).createOrder({ createdBy: mode.name, note, items: basket });
      setName(mode.name);
      setPasscode(mode.passcode);
    }
    setBasket([]);
    setBasketOpen(false);
    setTab("orders");
    setError("");
    await refresh();
  }

  async function connect(nextName: string, nextPasscode: string) {
    await createApi(nextPasscode).state();
    setName(nextName);
    setPasscode(nextPasscode);
    setConnecting(false);
    setError("");
  }

  function setStatus(order: Order, status: OrderStatus) { void run((current) => current.setStatus(order.id, status)); }
  function cancelOrder(order: Order) { if (window.confirm("取消这张订单？")) void run((current) => current.deleteOrder(order.id)); }
  function repeatOrder(order: Order) {
    const items = order.items.filter((item) => !item.dishId || dishesById.has(item.dishId)).map((item) => ({ ...item, lineId: crypto.randomUUID() }));
    setBasket([...basket, ...items]);
    setTab("menu");
    setBasketOpen(true);
  }

  const orders = state?.orders ?? [];
  const openCount = orders.filter((order) => order.status !== "done").length;
  const basketCount = basket.reduce((sum, item) => sum + item.quantity, 0);
  const tabs: { id: Tab; label: string; title: string; count?: number }[] = [
    { id: "menu", label: "点菜", title: "今晚吃什么" },
    { id: "orders", label: "订单", title: "订单", count: openCount },
    { id: "shopping", label: "买菜", title: "买菜清单" },
  ];
  const today = new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "short" });

  return <div className="din">
    <header className="din-head">
      <div className="din-head-row">
        <span className="din-caption">{today}</span>
        {passcode !== undefined && (connected
          ? <button type="button" className="din-mode" onClick={() => { setPasscode(null); setState(null); }}>{name} · 共享中 · 退出</button>
          : <button type="button" className="din-mode" onClick={() => setConnecting(true)}>单机 · 输入口令</button>)}
      </div>
      <h1>{tabs.find((entry) => entry.id === tab)?.title}</h1>
    </header>
    {error && <p className="din-error" role="alert">{error}</p>}

    {tab === "menu" && <MenuView basket={basket} onPick={(dish) => setEditing({ dish })} onDiy={() => setEditing({ dish: null })} />}
    {tab === "orders" && (state ? <OrdersView orders={orders} onStatus={setStatus} onCancel={cancelOrder} onRepeat={repeatOrder} /> : <p className="din-empty">正在加载…</p>)}
    {tab === "shopping" && (state ? <ShoppingView
      state={state}
      onCheck={(line, checked) => void run((current) => current.setCheck(line.key, line.orderIds, checked))}
      onAddExtra={(extra) => run((current) => current.addExtra(extra))}
      onCheckExtra={(id, checked) => void run((current) => current.setExtra(id, checked))}
      onDeleteExtra={(id) => void run((current) => current.deleteExtra(id))}
    /> : <p className="din-empty">正在加载…</p>)}

    {tab === "menu" && basketCount > 0 && <button type="button" className="din-basket-bar" onClick={() => setBasketOpen(true)}>
      <span>已点 {basketCount} 份</span><span>下单 →</span>
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
      connected={connected}
      name={name ?? ""}
      onEdit={(item) => setEditing({ dish: item.dishId ? dishesById.get(item.dishId) ?? null : null, item })}
      onRemove={(lineId) => setBasket(basket.filter((item) => item.lineId !== lineId))}
      onSubmit={submitOrder}
      onClose={() => setBasketOpen(false)}
    />}
    {connecting && <Sheet title="输入口令" onClose={() => setConnecting(false)}>
      <p className="din-hint">输入口令后，订单和买菜清单会和对方共享。这台设备上单机时的订单不会合并过去。</p>
      <ConnectForm initialName={name ?? ""} submitLabel="进入共享" busyLabel="正在确认…" onSubmit={connect} />
    </Sheet>}
  </div>;
}
