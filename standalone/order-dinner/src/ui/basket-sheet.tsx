import { useState } from "react";
import type { OrderItem } from "../types";
import { dishesById } from "../menu";
import { itemDetails, itemTitle } from "../shopping";
import { Sheet } from "./sheet";
import { ConnectForm } from "./connect-form";

export type SubmitMode = { name: string; passcode: string } | "saved" | "local";

// 下单前确认：可以改、删每道菜，再写一句整单备注。
// 已经输过口令就直接发送；没输过的话，按下单时才问口令，也可以选择只存在这台设备上。
export function BasketSheet({ items, connected, name, onEdit, onRemove, onSubmit, onClose }: {
  items: OrderItem[];
  connected: boolean;
  name: string;
  onEdit: (item: OrderItem) => void;
  onRemove: (lineId: string) => void;
  onSubmit: (note: string, mode: SubmitMode) => Promise<void>;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [asking, setAsking] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function send(mode: SubmitMode) {
    setSending(true);
    setError("");
    try { await onSubmit(note.trim(), mode); } catch (caught) { setError(caught instanceof Error ? caught.message : "没发出去，再试一次"); setSending(false); }
  }

  if (asking) return <Sheet title="发送订单" onClose={onClose}>
    <p className="din-hint">输入口令，订单会发到共享的订单里。</p>
    <ConnectForm initialName={name} submitLabel="发送" busyLabel="正在发送…" onSubmit={(nextName, passcode) => onSubmit(note.trim(), { name: nextName, passcode })}>
      <button type="button" className="din-secondary din-gap" onClick={() => void send("local")} disabled={sending}>没有口令，只存在这台设备上</button>
      <button type="button" className="din-link din-back" onClick={() => setAsking(false)}>← 回到购物篮</button>
    </ConnectForm>
    {error && <p className="din-error">{error}</p>}
  </Sheet>;

  return <Sheet title="购物篮" onClose={onClose}>
    {items.length === 0 ? <p className="din-empty">还没选菜</p> : <ul className="din-lines">{items.map((item) => {
      const dish = item.dishId ? dishesById.get(item.dishId) : undefined;
      return <li key={item.lineId}>
        <div className="din-line-main">
          <strong>{itemTitle(item, dish)}{item.quantity > 1 && <span className="din-qty"> × {item.quantity}</span>}</strong>
          {itemDetails(item, dish).map((detail) => <span key={detail} className="din-detail">{detail}</span>)}
        </div>
        <div className="din-line-actions">
          <button type="button" className="din-link" onClick={() => onEdit(item)}>修改</button>
          <button type="button" className="din-link danger" onClick={() => onRemove(item.lineId)}>删掉</button>
        </div>
      </li>;
    })}</ul>}
    <label className="din-field"><h3>整单备注</h3><textarea value={note} maxLength={500} rows={2} placeholder="今天想早点吃" onChange={(event) => setNote(event.target.value)} /></label>
    {error && <p className="din-error">{error}</p>}
    <button type="button" className="din-primary" disabled={sending || items.length === 0} onClick={() => connected ? void send("saved") : setAsking(true)}>{sending ? "正在下单…" : "下单"}</button>
  </Sheet>;
}
