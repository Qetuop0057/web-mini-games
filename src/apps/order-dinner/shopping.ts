import type { Dish, Ingredient, Order, OrderItem, ShoppingCheck } from "./types";

// 买菜清单和菜品描述都是纯函数，前端渲染和单元测试共用。
export type ShoppingLine = {
  key: string;
  name: string;
  unit?: string;
  // 有明确用量的部分相加；没有用量的记为"适量"。
  amount?: number;
  approximate: boolean;
  orderIds: string[];
  dishes: string[];
};

export function ingredientKey(name: string, unit?: string) { return `${name.trim()}|${unit ?? ""}`; }

export function defaultChoices(dish: Dish): Record<string, string[]> {
  const choices: Record<string, string[]> = {};
  for (const group of dish.options) choices[group.id] = !group.multiple && group.defaultChoice ? [group.defaultChoice] : [];
  return choices;
}

// 一道菜实际要用的食材：去掉她不要的，加上选项里加的料，按份数放大。
export function itemIngredients(item: OrderItem, dish: Dish | undefined): Ingredient[] {
  if (!dish) return (item.customIngredients ?? []).map((name) => name.trim()).filter(Boolean).map((name) => ({ name }));
  const removed = new Set(item.removed);
  const base = dish.ingredients.filter((ingredient) => !(ingredient.removable && removed.has(ingredient.name)));
  const added = dish.options.flatMap((group) => group.choices.filter((choice) => item.choices[group.id]?.includes(choice.id)).flatMap((choice) => choice.adds ?? []));
  return [...base, ...added].map((ingredient) => ingredient.amount === undefined ? ingredient : { ...ingredient, amount: ingredient.amount * item.quantity });
}

export function itemTitle(item: OrderItem, dish: Dish | undefined) { return dish?.name ?? item.customName ?? "自定义菜"; }

// 订单卡片上显示的细节：口味、不要的配料、DIY 食材和备注。
export function itemDetails(item: OrderItem, dish: Dish | undefined): string[] {
  const details: string[] = [];
  if (dish) {
    for (const group of dish.options) {
      const labels = group.choices.filter((choice) => item.choices[group.id]?.includes(choice.id)).map((choice) => choice.label);
      if (labels.length > 0) details.push(`${group.name}：${labels.join("、")}`);
    }
    if (item.removed.length > 0) details.push(`不要：${item.removed.join("、")}`);
  } else if (item.customIngredients && item.customIngredients.length > 0) {
    details.push(`食材：${item.customIngredients.join("、")}`);
  }
  if (item.note.trim()) details.push(`备注：${item.note.trim()}`);
  return details;
}

// 把还没做完的订单里的食材按"名字 + 单位"合并成一份清单。
export function buildShoppingList(orders: Order[], dishesById: Map<string, Dish>): ShoppingLine[] {
  const lines = new Map<string, ShoppingLine>();
  for (const order of orders) {
    if (order.status === "done") continue;
    for (const item of order.items) {
      const dish = item.dishId ? dishesById.get(item.dishId) : undefined;
      if (item.dishId && !dish) continue;
      for (const ingredient of itemIngredients(item, dish)) {
        if (ingredient.staple) continue;
        const key = ingredientKey(ingredient.name, ingredient.unit);
        const line = lines.get(key) ?? { key, name: ingredient.name.trim(), unit: ingredient.unit, approximate: false, orderIds: [], dishes: [] };
        if (ingredient.amount === undefined) line.approximate = true;
        else line.amount = (line.amount ?? 0) + ingredient.amount;
        if (!line.orderIds.includes(order.id)) line.orderIds.push(order.id);
        const title = itemTitle(item, dish);
        if (!line.dishes.includes(title)) line.dishes.push(title);
        lines.set(key, line);
      }
    }
  }
  return [...lines.values()];
}

// 合并后的一行来自多张订单；只有每张订单里都勾上了才算买好。
export function isLineChecked(line: ShoppingLine, checks: ShoppingCheck[]) {
  return line.orderIds.every((orderId) => checks.some((check) => check.orderId === orderId && check.key === line.key));
}

export function formatAmount(line: ShoppingLine) {
  if (line.amount === undefined) return "适量";
  const amount = `${Math.round(line.amount * 100) / 100}${line.unit ?? ""}`;
  return line.approximate ? `${amount} + 适量` : amount;
}
