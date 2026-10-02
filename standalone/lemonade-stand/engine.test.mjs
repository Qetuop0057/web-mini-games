import test from "node:test";
import assert from "node:assert/strict";
import { newGame, runDay } from "./engine.mjs";
const conditions = { temperature: 90, customers: 3, prices: [10,20,10,5] };
test("sales use recipe and account for purchases exactly", () => {
 const original = newGame(); const r = runDay(original, conditions, [3,3,3,3], [1,1,1], 100, () => 0);
 assert.equal(r.summary.sold,3); assert.equal(r.state.cash,2165); assert.deepEqual(r.state.inventory,[0,0,0,0]); assert.equal(original.cash,2000);
});
test("invalid or unaffordable purchases do not mutate cash", () => {
 const original=newGame();assert.throws(()=>runDay(original,conditions,[-1,0,0,0],[1,1,1],100));assert.throws(()=>runDay(original,conditions,[100,100,100,100],[1,1,1],100));assert.equal(original.cash,2000);
});
test("price rejection preserves inventory and sold-out visits earn nothing", () => {
 const r=runDay(newGame(),conditions,[1,1,1,1],[1,1,1],10000,()=>0);assert.equal(r.summary.rejected,3);assert.equal(r.summary.sold,0);assert.deepEqual(r.state.inventory,[1,1,1,1]);
 const sold=runDay(newGame(),conditions,[1,1,1,1],[1,1,1],100,()=>0);assert.equal(sold.summary.sold,1);assert.equal(sold.summary.missed,2);
});
