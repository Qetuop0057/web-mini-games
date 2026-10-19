import type { DinnerState, Order, OrderItem, OrderStatus, ShoppingExtra } from "./types";

// 没有口令时的单机模式：订单和买菜清单只存在这台设备上，行为和 Worker 接口保持一致。
type Storage = { getItem(key: string): string | null; setItem(key: string, value: string): void };

const storageKey = "dinner.local";
const doneHistoryLimit = 20;

function browserStorage(): Storage {
  const memory = new Map<string, string>();
  const fallback: Storage = { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => { memory.set(key, value); } };
  try {
    const storage = window.localStorage;
    storage.getItem(storageKey);
    return storage;
  } catch { return fallback; }
}

export function createLocalStore(storage: Storage = browserStorage(), now = () => new Date()) {
  function load(): DinnerState {
    try {
      const value = JSON.parse(storage.getItem(storageKey) ?? "") as DinnerState;
      if (Array.isArray(value.orders) && Array.isArray(value.checks) && Array.isArray(value.extras)) return value;
    } catch {}
    return { orders: [], checks: [], extras: [] };
  }

  function save(state: DinnerState) {
    const open = state.orders.filter((order) => order.status !== "done");
    const done = state.orders.filter((order) => order.status === "done").slice(0, doneHistoryLimit);
    try { storage.setItem(storageKey, JSON.stringify({ ...state, orders: [...open, ...done] })); } catch {}
  }

  function update(change: (state: DinnerState) => DinnerState) { save(change(load())); }

  // 已下单和在做的在前，吃过的在后，各自按时间倒序。
  function sorted(orders: Order[]) {
    const byNewest = (a: Order, b: Order) => b.createdAt.localeCompare(a.createdAt);
    return [...orders.filter((order) => order.status !== "done").sort(byNewest), ...orders.filter((order) => order.status === "done").sort(byNewest)];
  }

  return {
    state: async (): Promise<DinnerState> => { const state = load(); return { ...state, orders: sorted(state.orders) }; },
    createOrder: async ({ createdBy, note, items }: { createdBy: string; note: string; items: OrderItem[] }): Promise<Order> => {
      const order: Order = { id: crypto.randomUUID(), createdAt: now().toISOString(), createdBy, note, status: "new", items };
      update((state) => ({ ...state, orders: [order, ...state.orders] }));
      return order;
    },
    setStatus: async (id: string, status: OrderStatus) => {
      update((state) => ({
        ...state,
        orders: state.orders.map((order) => order.id === id ? { ...order, status } : order),
        checks: status === "done" ? state.checks.filter((check) => check.orderId !== id) : state.checks,
      }));
    },
    deleteOrder: async (id: string) => {
      update((state) => ({ ...state, orders: state.orders.filter((order) => order.id !== id), checks: state.checks.filter((check) => check.orderId !== id) }));
    },
    setCheck: async (key: string, orderIds: string[], checked: boolean) => {
      update((state) => {
        const others = state.checks.filter((check) => !(check.key === key && orderIds.includes(check.orderId)));
        if (!checked) return { ...state, checks: others };
        const open = new Set(state.orders.filter((order) => order.status !== "done").map((order) => order.id));
        return { ...state, checks: [...others, ...orderIds.filter((orderId) => open.has(orderId)).map((orderId) => ({ orderId, key }))] };
      });
    },
    addExtra: async (name: string): Promise<ShoppingExtra> => {
      const extra = { id: crypto.randomUUID(), name: name.trim(), checked: false };
      update((state) => ({ ...state, extras: [...state.extras, extra] }));
      return extra;
    },
    setExtra: async (id: string, checked: boolean) => {
      update((state) => ({ ...state, extras: state.extras.map((extra) => extra.id === id ? { ...extra, checked } : extra) }));
    },
    deleteExtra: async (id: string) => {
      update((state) => ({ ...state, extras: state.extras.filter((extra) => extra.id !== id) }));
    },
  };
}
