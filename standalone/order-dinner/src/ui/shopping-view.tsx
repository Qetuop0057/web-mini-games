import { useState, type FormEvent } from "react";
import type { DinnerState } from "../types";
import { dishesById } from "../menu";
import { buildShoppingList, formatAmount, isLineChecked, type ShoppingLine } from "../shopping";

// 记事本样式的买菜清单：由还没做完的订单自动生成，最后一行可以手动加。
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
  const total = lines.length + state.extras.length;
  const left = lines.filter((entry) => !entry.checked).length + state.extras.filter((entry) => !entry.checked).length;

  async function add(event: FormEvent) {
    event.preventDefault();
    const name = extra.trim();
    if (!name) return;
    await onAddExtra(name);
    setExtra("");
  }

  return <>
    <p className="din-caption din-count">{total === 0 ? "现在没有要买的" : left === 0 ? "都买齐了" : `还差 ${left} 样`}</p>
    <ul className="din-notepad">
      {lines.map(({ line, checked }) => <li key={line.key} className={checked ? "done" : ""}>
        <label>
          <input type="checkbox" checked={checked} onChange={(event) => onCheck(line, event.target.checked)} />
          <span className="din-pad-name">{line.name}</span>
          <span className="din-pad-amount">{formatAmount(line)}</span>
        </label>
        <span className="din-pad-for">{line.dishes.join("、")}</span>
      </li>)}
      {state.extras.map((entry) => <li key={entry.id} className={entry.checked ? "done" : ""}>
        <label>
          <input type="checkbox" checked={entry.checked} onChange={(event) => onCheckExtra(entry.id, event.target.checked)} />
          <span className="din-pad-name">{entry.name}</span>
        </label>
        <button type="button" className="din-link" aria-label={`删掉${entry.name}`} onClick={() => onDeleteExtra(entry.id)}>删掉</button>
      </li>)}
      <li className="din-pad-add">
        <form onSubmit={add}>
          <span aria-hidden="true">+</span>
          <input value={extra} maxLength={40} placeholder="另外要买…" aria-label="另外要买的东西" onChange={(event) => setExtra(event.target.value)} />
          {extra.trim() && <button type="submit" className="din-link strong">加上</button>}
        </form>
      </li>
    </ul>
  </>;
}
