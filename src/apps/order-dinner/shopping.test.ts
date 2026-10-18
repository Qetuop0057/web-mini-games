import { test } from "node:test";
import assert from "node:assert/strict";
import { buildShoppingList, defaultChoices, formatAmount, isLineChecked, itemDetails, itemIngredients } from "./shopping.ts";
import type { Dish, Order, OrderItem } from "./types.ts";

const eggs: Dish = {
  id: "eggs", name: "番茄炒蛋", category: "家常菜",
  ingredients: [{ name: "番茄", amount: 2, unit: "个" }, { name: "鸡蛋", amount: 3, unit: "个" }, { name: "葱", removable: true }, { name: "盐", staple: true }],
  options: [
    { id: "sweet", name: "甜度", defaultChoice: "normal", choices: [{ id: "less", label: "少糖" }, { id: "normal", label: "正常" }] },
    { id: "extra", name: "加料", multiple: true, choices: [{ id: "more-egg", label: "多加蛋", adds: [{ name: "鸡蛋", amount: 1, unit: "个" }] }] },
  ],
};
const rice: Dish = { id: "rice", name: "蛋炒饭", category: "主食", ingredients: [{ name: "鸡蛋", amount: 2, unit: "个" }, { name: "葱", removable: true }], options: [] };
const menu = new Map([[eggs.id, eggs], [rice.id, rice]]);

function line(overrides: Partial<OrderItem>): OrderItem {
  return { lineId: "l", quantity: 1, choices: {}, removed: [], note: "", ...overrides };
}
function order(id: string, items: OrderItem[], status: Order["status"] = "new"): Order {
  return { id, createdAt: "2026-10-18T00:00:00.000Z", createdBy: "她", note: "", status, items };
}

test("default choices pick the single-choice default and leave multi-choice empty", () => {
  assert.deepEqual(defaultChoices(eggs), { sweet: ["normal"], extra: [] });
});

test("removed ingredients are dropped and option add-ons are included", () => {
  const ingredients = itemIngredients(line({ dishId: "eggs", removed: ["葱"], choices: { extra: ["more-egg"] } }), eggs);
  assert.deepEqual(ingredients.map((i) => i.name), ["番茄", "鸡蛋", "盐", "鸡蛋"]);
});

test("only removable ingredients can be removed", () => {
  const ingredients = itemIngredients(line({ dishId: "eggs", removed: ["番茄"] }), eggs);
  assert.ok(ingredients.some((i) => i.name === "番茄"));
});

test("quantities scale amounts", () => {
  const ingredients = itemIngredients(line({ dishId: "eggs", quantity: 2 }), eggs);
  assert.equal(ingredients.find((i) => i.name === "番茄")?.amount, 4);
});

test("shopping list merges the same ingredient across dishes and orders", () => {
  const list = buildShoppingList([
    order("a", [line({ dishId: "eggs" })]),
    order("b", [line({ dishId: "rice" })]),
  ], menu);
  const egg = list.find((l) => l.name === "鸡蛋");
  assert.equal(egg?.amount, 5);
  assert.deepEqual(egg?.orderIds, ["a", "b"]);
  assert.deepEqual(egg?.dishes, ["番茄炒蛋", "蛋炒饭"]);
});

test("shopping list skips staples, finished orders and unknown dishes", () => {
  const list = buildShoppingList([
    order("a", [line({ dishId: "eggs" })]),
    order("done", [line({ dishId: "rice" })], "done"),
    order("old", [line({ dishId: "removed-from-menu" })]),
  ], menu);
  assert.equal(list.find((l) => l.name === "盐"), undefined);
  assert.equal(list.find((l) => l.name === "鸡蛋")?.amount, 3);
  assert.deepEqual(list.flatMap((l) => l.orderIds).filter((id) => id !== "a"), []);
});

test("DIY dishes add their listed ingredients without amounts", () => {
  const list = buildShoppingList([order("a", [line({ customName: "凉拌黄瓜", customIngredients: ["黄瓜", " 蒜 ", ""] })])], menu);
  assert.deepEqual(list.map((l) => [l.name, formatAmount(l)]), [["黄瓜", "适量"], ["蒜", "适量"]]);
});

test("ingredients with and without amounts show both", () => {
  const list = buildShoppingList([order("a", [line({ dishId: "eggs" }), line({ customName: "蛋羹", customIngredients: ["鸡蛋"] })])], menu);
  const egg = list.find((l) => l.name === "鸡蛋" && l.unit === "个");
  assert.equal(egg && formatAmount(egg), "3个");
  const loose = list.find((l) => l.name === "鸡蛋" && l.unit === undefined);
  assert.equal(loose && formatAmount(loose), "适量");
});

test("a merged line is checked only when every order has it checked", () => {
  const [egg] = buildShoppingList([order("a", [line({ dishId: "rice" })]), order("b", [line({ dishId: "rice" })])], menu);
  assert.equal(isLineChecked(egg, [{ orderId: "a", key: egg.key }]), false);
  assert.equal(isLineChecked(egg, [{ orderId: "a", key: egg.key }, { orderId: "b", key: egg.key }]), true);
});

test("item details list flavors, removed ingredients and notes", () => {
  const details = itemDetails(line({ dishId: "eggs", choices: { sweet: ["less"], extra: ["more-egg"] }, removed: ["葱"], note: "番茄去皮" }), eggs);
  assert.deepEqual(details, ["甜度：少糖", "加料：多加蛋", "不要：葱", "备注：番茄去皮"]);
});
