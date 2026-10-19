import { useState } from "react";
import type { Dish, OrderItem } from "../types";
import { categories, dishes } from "../menu";

// 像饭馆墙上的菜单：一行一道菜，右边的圆圈显示点了几份；最后一行是 DIY。
export function MenuView({ basket, onPick, onDiy }: { basket: OrderItem[]; onPick: (dish: Dish) => void; onDiy: () => void }) {
  const [category, setCategory] = useState<string | null>(null);
  const shown = category ? dishes.filter((dish) => dish.category === category) : dishes;
  const count = (dish: Dish) => basket.filter((item) => item.dishId === dish.id).reduce((sum, item) => sum + item.quantity, 0);
  return <>
    <div className="din-cats" role="group" aria-label="分类">
      {[null, ...categories].map((entry) => <button key={entry ?? "all"} type="button" className={category === entry ? "on" : ""} aria-pressed={category === entry} onClick={() => setCategory(entry)}>{entry ?? "全部"}</button>)}
    </div>
    <ul className="din-menu">
      {shown.map((dish) => {
        const picked = count(dish);
        return <li key={dish.id}><button type="button" className="din-menu-row" onClick={() => onPick(dish)}>
          <span className="din-menu-name">{dish.name}</span>
          <span className="din-leader" aria-hidden="true" />
          <span className={picked > 0 ? "din-plus on" : "din-plus"} aria-label={picked > 0 ? `已点 ${picked} 份` : "点这道"}>{picked > 0 ? picked : "+"}</span>
        </button></li>;
      })}
      <li><button type="button" className="din-menu-row diy" onClick={onDiy}>
        <span className="din-menu-name">自己写一道</span>
        <span className="din-leader" aria-hidden="true" />
        <span className="din-plus" aria-hidden="true">✎</span>
      </button></li>
    </ul>
  </>;
}
