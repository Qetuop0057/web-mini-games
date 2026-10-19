import { useState } from "react";
import type { Dish, OrderItem } from "../types";
import { defaultChoices } from "../shopping";
import { Sheet } from "./sheet";

// 选口味、去配料、写备注；dish 为 null 时是 DIY 菜。传入 initial 表示在改购物篮里已有的菜。
export function DishSheet({ dish, initial, onSave, onClose }: { dish: Dish | null; initial?: OrderItem; onSave: (item: OrderItem) => void; onClose: () => void }) {
  const [choices, setChoices] = useState(initial?.choices ?? (dish ? defaultChoices(dish) : {}));
  const [removed, setRemoved] = useState<string[]>(initial?.removed ?? []);
  const [quantity, setQuantity] = useState(initial?.quantity ?? 1);
  const [note, setNote] = useState(initial?.note ?? "");
  const [customName, setCustomName] = useState(initial?.customName ?? "");
  const [customIngredients, setCustomIngredients] = useState((initial?.customIngredients ?? []).join("、"));
  const [error, setError] = useState("");

  function pick(groupId: string, choiceId: string, multiple: boolean | undefined) {
    setChoices((current) => {
      const picked = current[groupId] ?? [];
      if (!multiple) return { ...current, [groupId]: [choiceId] };
      return { ...current, [groupId]: picked.includes(choiceId) ? picked.filter((id) => id !== choiceId) : [...picked, choiceId] };
    });
  }

  function toggleRemoved(name: string) {
    setRemoved((current) => current.includes(name) ? current.filter((entry) => entry !== name) : [...current, name]);
  }

  function save() {
    if (!dish && !customName.trim()) { setError("写个菜名"); return; }
    onSave({
      lineId: initial?.lineId ?? crypto.randomUUID(),
      dishId: dish?.id,
      customName: dish ? undefined : customName.trim(),
      customIngredients: dish ? undefined : customIngredients.split(/[,，、\n]/).map((entry) => entry.trim()).filter(Boolean),
      quantity,
      choices: dish ? choices : {},
      removed: dish ? removed : [],
      note: note.trim(),
    });
  }

  const removable = dish?.ingredients.filter((ingredient) => ingredient.removable) ?? [];
  return <Sheet title={dish?.name ?? "自己写一道"} onClose={onClose}>
    {dish ? <>
      {dish.options.map((group) => <section key={group.id} className="din-field">
        <h3>{group.name}{group.multiple && <small>可多选</small>}</h3>
        <div className="din-chips">{group.choices.map((choice) => {
          const on = choices[group.id]?.includes(choice.id) ?? false;
          return <button key={choice.id} type="button" className={on ? "din-chip on" : "din-chip"} aria-pressed={on} onClick={() => pick(group.id, choice.id, group.multiple)}>{choice.label}</button>;
        })}</div>
      </section>)}
      {removable.length > 0 && <section className="din-field">
        <h3>不要<small>点一下去掉</small></h3>
        <div className="din-chips">{removable.map((ingredient) => {
          const off = removed.includes(ingredient.name);
          return <button key={ingredient.name} type="button" className={off ? "din-chip off" : "din-chip"} aria-pressed={off} onClick={() => toggleRemoved(ingredient.name)}>{ingredient.name}</button>;
        })}</div>
      </section>}
    </> : <>
      <label className="din-field"><h3>菜名</h3><input value={customName} maxLength={40} placeholder="凉拌黄瓜" onChange={(event) => { setCustomName(event.target.value); setError(""); }} /></label>
      <label className="din-field"><h3>需要买的食材<small>用顿号或逗号隔开</small></h3><input value={customIngredients} placeholder="黄瓜、蒜" onChange={(event) => setCustomIngredients(event.target.value)} /></label>
    </>}
    <label className="din-field"><h3>备注</h3><textarea value={note} maxLength={200} rows={2} placeholder={dish ? "有什么特别要求" : "怎么做、什么口味"} onChange={(event) => setNote(event.target.value)} /></label>
    <section className="din-field din-row">
      <h3>份数</h3>
      <div className="din-stepper">
        <button type="button" aria-label="少一份" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
        <span>{quantity}</span>
        <button type="button" aria-label="多一份" onClick={() => setQuantity((q) => Math.min(20, q + 1))}>+</button>
      </div>
    </section>
    {error && <p className="din-error">{error}</p>}
    <button type="button" className="din-primary" onClick={save}>{initial ? "保存" : "放进购物篮"}</button>
  </Sheet>;
}
