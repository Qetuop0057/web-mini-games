// 点菜 app 的数据结构；前端和 Worker 都按这份约定读写订单。
export type Ingredient = {
  name: string;
  amount?: number;
  unit?: string;
  // 可以在点菜时选择"不要"。
  removable?: boolean;
  // 家里常备的调料，不进买菜清单。
  staple?: boolean;
};

export type Choice = { id: string; label: string; adds?: Ingredient[] };

export type OptionGroup = {
  id: string;
  name: string;
  multiple?: boolean;
  choices: Choice[];
  // 单选组的默认选项；多选组默认不选。
  defaultChoice?: string;
};

export type Dish = { id: string; name: string; category: string; ingredients: Ingredient[]; options: OptionGroup[] };

export type OrderItem = {
  lineId: string;
  // 预设菜填 dishId；DIY 菜填 customName 和 customIngredients。
  dishId?: string;
  customName?: string;
  customIngredients?: string[];
  quantity: number;
  choices: Record<string, string[]>;
  removed: string[];
  note: string;
};

export type OrderStatus = "new" | "cooking" | "done";

export type Order = { id: string; createdAt: string; createdBy: string; note: string; status: OrderStatus; items: OrderItem[] };

export type ShoppingCheck = { orderId: string; key: string };
export type ShoppingExtra = { id: string; name: string; checked: boolean };

export type DinnerState = { orders: Order[]; checks: ShoppingCheck[]; extras: ShoppingExtra[] };
