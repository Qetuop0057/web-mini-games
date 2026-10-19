"use client";
import type { Order, OrderStatus } from "../types";
import { dishesById } from "../menu";
import { itemDetails, itemTitle } from "../shopping";

const statusLabel: Record<OrderStatus, string> = { new: "已下单", cooking: "在做了", done: "开饭啦" };
const nextStep: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  new: { status: "cooking", label: "开始做" },
  cooking: { status: "done", label: "做好了" },
};

function when(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function OrderCard({ order, onStatus, onCancel, onRepeat }: { order: Order; onStatus: (status: OrderStatus) => void; onCancel: () => void; onRepeat: () => void }) {
  const next = nextStep[order.status];
  return <article className="din-card">
    <header className="din-card-head">
      <span>{order.createdBy} · {when(order.createdAt)}</span>
      <span className={`din-status ${order.status}`}>{statusLabel[order.status]}</span>
    </header>
    <ul className="din-lines">{order.items.map((item) => {
      const dish = item.dishId ? dishesById.get(item.dishId) : undefined;
      return <li key={item.lineId}><div className="din-line-main">
        <strong>{itemTitle(item, dish)}{item.quantity > 1 && <span className="din-qty"> × {item.quantity}</span>}</strong>
        {itemDetails(item, dish).map((detail) => <span key={detail} className="din-detail">{detail}</span>)}
      </div></li>;
    })}</ul>
    {order.note && <p className="din-order-note">{order.note}</p>}
    <footer className="din-card-actions">
      {next && <button type="button" className="din-primary small" onClick={() => onStatus(next.status)}>{next.label}</button>}
      {order.status === "done" && <button type="button" className="din-secondary small" onClick={onRepeat}>再点一次</button>}
      {order.status !== "done" && <button type="button" className="din-link danger" onClick={onCancel}>取消订单</button>}
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
  const card = (order: Order) => <OrderCard key={order.id} order={order} onStatus={(status) => onStatus(order, status)} onCancel={() => onCancel(order)} onRepeat={() => onRepeat(order)} />;
  return <div className="din-stack">
    {open.length === 0 ? <p className="din-empty">现在没有要做的菜</p> : open.map(card)}
    {done.length > 0 && <details className="din-history"><summary>吃过的（{done.length}）</summary><div className="din-stack">{done.map(card)}</div></details>}
  </div>;
}
