"use client";
import { useState } from "react";
import type { OrderItem } from "../types";
import { dishesById } from "../menu";
import { itemDetails, itemTitle } from "../shopping";
import { Sheet } from "./sheet";

// 下单前确认：可以改、删每道菜，再写一句整单备注。
export function BasketSheet({ items, onEdit, onRemove, onSubmit, onClose }: {
  items: OrderItem[];
  onEdit: (item: OrderItem) => void;
  onRemove: (lineId: string) => void;
  onSubmit: (note: string) => Promise<void>;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setSending(true);
    setError("");
    try { await onSubmit(note.trim()); } catch (caught) { setError(caught instanceof Error ? caught.message : "没发出去，再试一次"); setSending(false); }
  }

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
    <button type="button" className="din-primary" disabled={sending || items.length === 0} onClick={submit}>{sending ? "正在下单…" : "下单"}</button>
  </Sheet>;
}
