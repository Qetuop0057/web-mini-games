import { test } from "node:test";
import assert from "node:assert/strict";
import { createLocalStore } from "./local-store.ts";
import type { OrderItem } from "./types.ts";

function memoryStorage() {
  const data = new Map<string, string>();
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
}
const item: OrderItem = { lineId: "l", dishId: "rice", quantity: 1, choices: {}, removed: [], note: "" };

test("orders are saved and survive a new store on the same storage", async () => {
  const storage = memoryStorage();
  const order = await createLocalStore(storage).createOrder({ createdBy: "我", note: "早点吃", items: [item] });
  const state = await createLocalStore(storage).state();
  assert.deepEqual(state.orders.map((o) => [o.id, o.status, o.note]), [[order.id, "new", "早点吃"]]);
});

test("open orders come before finished ones", async () => {
  let minute = 0;
  const store = createLocalStore(memoryStorage(), () => new Date(Date.UTC(2026, 9, 18, 18, minute++)));
  const first = await store.createOrder({ createdBy: "我", note: "", items: [item] });
  const second = await store.createOrder({ createdBy: "我", note: "", items: [item] });
  await store.setStatus(second.id, "done");
  assert.deepEqual((await store.state()).orders.map((o) => o.id), [first.id, second.id]);
});

test("finishing or deleting an order clears its shopping ticks", async () => {
  const store = createLocalStore(memoryStorage());
  const a = await store.createOrder({ createdBy: "我", note: "", items: [item] });
  const b = await store.createOrder({ createdBy: "我", note: "", items: [item] });
  await store.setCheck("鸡蛋|个", [a.id, b.id], true);
  assert.equal((await store.state()).checks.length, 2);
  await store.setStatus(a.id, "done");
  await store.deleteOrder(b.id);
  assert.deepEqual((await store.state()).checks, []);
});

test("ticks are ignored for finished orders and can be undone", async () => {
  const store = createLocalStore(memoryStorage());
  const open = await store.createOrder({ createdBy: "我", note: "", items: [item] });
  const done = await store.createOrder({ createdBy: "我", note: "", items: [item] });
  await store.setStatus(done.id, "done");
  await store.setCheck("葱|", [open.id, done.id], true);
  assert.deepEqual((await store.state()).checks, [{ orderId: open.id, key: "葱|" }]);
  await store.setCheck("葱|", [open.id], false);
  assert.deepEqual((await store.state()).checks, []);
});

test("extra shopping items can be added, ticked and removed", async () => {
  const store = createLocalStore(memoryStorage());
  const milk = await store.addExtra(" 牛奶 ");
  await store.setExtra(milk.id, true);
  assert.deepEqual((await store.state()).extras, [{ id: milk.id, name: "牛奶", checked: true }]);
  await store.deleteExtra(milk.id);
  assert.deepEqual((await store.state()).extras, []);
});

test("broken saved data starts fresh instead of crashing", async () => {
  const storage = memoryStorage();
  storage.setItem("dinner.local", "{not json");
  assert.deepEqual(await createLocalStore(storage).state(), { orders: [], checks: [], extras: [] });
});
