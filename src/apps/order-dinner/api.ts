import type { DinnerState, Order, OrderItem, OrderStatus, ShoppingExtra } from "./types";

// 浏览器端调用 Worker 接口；口令放在请求头里。
export class ApiError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

export function createApi(passcode: string) {
  async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`/api/dinner/${path}`, {
        method,
        headers: { "x-passcode": passcode, ...(body === undefined ? {} : { "content-type": "application/json" }) },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError(0, "连不上服务器，检查一下网络");
    }
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) throw new ApiError(response.status, data.error ?? "出错了，再试一次");
    return data as T;
  }
  return {
    state: () => call<DinnerState>("GET", "state"),
    createOrder: (order: { createdBy: string; note: string; items: OrderItem[] }) => call<Order>("POST", "orders", order),
    setStatus: (id: string, status: OrderStatus) => call("PATCH", `orders/${encodeURIComponent(id)}`, { status }),
    deleteOrder: (id: string) => call("DELETE", `orders/${encodeURIComponent(id)}`),
    setCheck: (key: string, orderIds: string[], checked: boolean) => call("PUT", "checks", { key, orderIds, checked }),
    addExtra: (name: string) => call<ShoppingExtra>("POST", "extras", { name }),
    setExtra: (id: string, checked: boolean) => call("PATCH", `extras/${encodeURIComponent(id)}`, { checked }),
    deleteExtra: (id: string) => call("DELETE", `extras/${encodeURIComponent(id)}`),
  };
}

// 共享模式用 createApi，单机模式用 createLocalStore，两者接口一致。
export type DinnerStore = ReturnType<typeof createApi>;
