"use client";
import { useState, type FormEvent } from "react";
import type { DinnerState } from "../types";
import { dishesById } from "../menu";
import { buildShoppingList, formatAmount, isLineChecked, type ShoppingLine } from "../shopping";

// 由还没做完的订单自动生成；勾选状态两个人共享。下面可以手动加几样。
export function ShoppingView({ state, onCheck, onAddExtra, onCheckExtra, onDeleteExtra }: {
  state: DinnerState;
  onCheck: (line: ShoppingLine, checked: boolean) => void;
  onAddExtra: (name: string) => Promise<void>;
  onCheckExtra: (id: string, checked: boolean) => void;
  onDeleteExtra: (id: string) => void;
}) {
  const [extra, setExtra] = useState("");
  const lines = buildShoppingList(state.orders, dishesById)
    .map((line) => ({ line, checked: isLineChecked(line, state.checks) }))
    .sort((a, b) => Number(a.checked) - Number(b.checked));
  const left = lines.filter((entry) => !entry.checked).length + state.extras.filter((entry) => !entry.checked).length;

  async function add(event: FormEvent) {
    event.preventDefault();
    const name = extra.trim();
    if (!name) return;
    await onAddExtra(name);
    setExtra("");
  }

  return <div className="din-stack">
    <p className="din-summary">{lines.length + state.extras.length === 0 ? "现在没有要买的" : left === 0 ? "都买齐了" : `还差 ${left} 样`}</p>
    {lines.length > 0 && <ul className="din-checklist">{lines.map(({ line, checked }) => <li key={line.key} className={checked ? "done" : ""}>
      <label>
        <input type="checkbox" checked={checked} onChange={(event) => onCheck(line, event.target.checked)} />
        <span className="din-check-name">{line.name}</span>
        <span className="din-check-amount">{formatAmount(line)}</span>
      </label>
      <span className="din-detail">{line.dishes.join("、")}</span>
    </li>)}</ul>}
    <section>
      <h3 className="din-subhead">另外要买</h3>
      {state.extras.length > 0 && <ul className="din-checklist">{state.extras.map((entry) => <li key={entry.id} className={entry.checked ? "done" : ""}>
        <label>
          <input type="checkbox" checked={entry.checked} onChange={(event) => onCheckExtra(entry.id, event.target.checked)} />
          <span className="din-check-name">{entry.name}</span>
        </label>
        <button type="button" className="din-link danger" onClick={() => onDeleteExtra(entry.id)}>删掉</button>
      </li>)}</ul>}
      <form className="din-add" onSubmit={add}>
        <input value={extra} maxLength={40} placeholder="牛奶" aria-label="要另外买的东西" onChange={(event) => setExtra(event.target.value)} />
        <button type="submit" className="din-secondary">加上</button>
      </form>
    </section>
  </div>;
}
