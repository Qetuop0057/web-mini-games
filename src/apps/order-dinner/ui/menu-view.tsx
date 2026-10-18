"use client";
import { useState } from "react";
import type { Dish, OrderItem } from "../types";
import { categories, dishes } from "../menu";

// 按分类浏览预设菜；最后一格是 DIY。
export function MenuView({ basket, onPick, onDiy }: { basket: OrderItem[]; onPick: (dish: Dish) => void; onDiy: () => void }) {
  const [category, setCategory] = useState<string | null>(null);
  const shown = category ? dishes.filter((dish) => dish.category === category) : dishes;
  const count = (dish: Dish) => basket.filter((item) => item.dishId === dish.id).reduce((sum, item) => sum + item.quantity, 0);
  return <div className="din-stack">
    <div className="din-chips din-scroll" role="group" aria-label="分类">
      {[null, ...categories].map((entry) => <button key={entry ?? "all"} type="button" className={category === entry ? "din-chip on" : "din-chip"} aria-pressed={category === entry} onClick={() => setCategory(entry)}>{entry ?? "全部"}</button>)}
    </div>
    <div className="din-dishes">
      {shown.map((dish) => {
        const picked = count(dish);
        return <button key={dish.id} type="button" className="din-dish" onClick={() => onPick(dish)}>
          {dish.name}
          {picked > 0 && <span className="din-badge" aria-label={`已选 ${picked} 份`}>{picked}</span>}
        </button>;
      })}
      <button type="button" className="din-dish diy" onClick={onDiy}>自己写一道</button>
    </div>
  </div>;
}
