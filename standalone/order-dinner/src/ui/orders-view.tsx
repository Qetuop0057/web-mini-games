import type { Order, OrderStatus } from "../types";
import { dishesById } from "../menu";
import { itemDetails, itemTitle } from "../shopping";

// 每张订单是一张小票，状态用红色印章盖在右上角。
const statusLabel: Record<OrderStatus, string> = { new: "已下单", cooking: "在做了", done: "开饭啦" };
const nextStep: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  new: { status: "cooking", label: "开始做" },
  cooking: { status: "done", label: "做好了，开饭" },
};

function when(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Ticket({ order, onStatus, onCancel, onRepeat }: { order: Order; onStatus: (status: OrderStatus) => void; onCancel: () => void; onRepeat: () => void }) {
  const next = nextStep[order.status];
  return <article className={`din-ticket ${order.status}`}>
    <div className="din-ticket-meta">No.{order.id.slice(0, 4).toUpperCase()} · {order.createdBy} · {when(order.createdAt)}</div>
    <div className={`din-stamp ${order.status}`}>{statusLabel[order.status]}</div>
    <ul className="din-ticket-items">{order.items.map((item) => {
      const dish = item.dishId ? dishesById.get(item.dishId) : undefined;
      const details = itemDetails(item, dish);
      return <li key={item.lineId}>
        <strong>{itemTitle(item, dish)}{item.quantity > 1 && ` ×${item.quantity}`}</strong>
        {details.length > 0 && <span>{details.join(" · ")}</span>}
      </li>;
    })}</ul>
    {order.note && <p className="din-ticket-note">“{order.note}”</p>}
    <footer className="din-ticket-actions">
      {next && <button type="button" className="din-ink" onClick={() => onStatus(next.status)}>{next.label}</button>}
      {order.status === "done" && <button type="button" className="din-outline" onClick={onRepeat}>再点一次</button>}
      {order.status !== "done" && <button type="button" className="din-link" onClick={onCancel}>取消订单</button>}
    </footer>
  </article>;
}

export function OrdersView({ orders, onStatus, onCancel, onRepeat }: {
  orders: Order[];
  onStatus: (order: Order, status: OrderStatus) => void;
  onCancel: (order: Order) => void;
  onRepeat: (order: Order) => void;
}) {
  const open = orders.filter((order) => order.status !== "done");
  const done = orders.filter((order) => order.status === "done");
  const ticket = (order: Order) => <Ticket key={order.id} order={order} onStatus={(status) => onStatus(order, status)} onCancel={() => onCancel(order)} onRepeat={() => onRepeat(order)} />;
  return <div className="din-stack">
    {open.length === 0 ? <p className="din-empty">现在没有要做的菜</p> : open.map(ticket)}
    {done.length > 0 && <details className="din-history"><summary>吃过的（{done.length}）</summary><div className="din-stack">{done.map(ticket)}</div></details>}
  </div>;
}
