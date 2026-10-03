import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation} from './simulation.mjs';import {marketStalls,stallProducts,marketQuote,productPrice,owned} from './market.mjs';
test('catalog groups four fruits and dry goods; vending remains an entrance only',()=>{
 assert.deepEqual(stallProducts('fruit').map(p=>p.id),['lemons','watermelon','strawberry','orange']);assert.deepEqual(stallProducts('dry').map(p=>p.id),['sugar','milk','ice','cups']);assert.equal(marketStalls.find(s=>s.id==='vending').comingSoon,true);assert.deepEqual(stallProducts('vending'),[]);
});
test('fruit purchases debit cash once and store both live and future ingredients',()=>{
 const g=new Simulation(()=>.5),order={lemons:3,watermelon:2,strawberry:4,orange:1};const cost=marketQuote('fruit',order,g.conditions);const cash=g.state.cash;
 assert.equal(g.buyMarket('fruit',order),cost);assert.equal(g.state.cash,cash-cost);assert.deepEqual(g.state.inventory,[0,3,0,0]);assert.deepEqual(g.state.pantry,{watermelon:2,strawberry:4,orange:1,milk:0});assert.equal(g.dailySupplyCost,cost);assert.equal(g.phase,'setup');
 for(const product of stallProducts('fruit'))assert.ok(owned(g.state,product)>0);
});
test('dry goods complete supplies for live lemonade, include milk and charge nothing at opening',()=>{
 const g=new Simulation(()=>.5);g.buyMarket('fruit',{lemons:3});g.buyMarket('dry',{sugar:3,ice:3,cups:3,milk:2});const cash=g.state.cash,cost=g.dailySupplyCost;assert.equal(g.state.pantry.milk,2);assert.deepEqual(g.state.inventory,[3,3,3,3]);g.open(150);assert.equal(g.state.cash,cash);assert.equal(g.stats.cost,cost);assert.equal(g.stats.profit,-cost);assert.throws(()=>g.buyMarket('fruit',{lemons:1}));
});
test('wrong stall, vending, invalid or unaffordable purchases cannot partially mutate stock',()=>{
 const g=new Simulation(()=>.5);for(const [stall,order] of [['missing',{}],['vending',{}],['fruit',{milk:1}],['dry',{lemons:1}],['fruit',{lemons:2,orange:-1}],['fruit',{watermelon:1.5}],['fruit',{lemons:NaN}],['fruit',{lemons:1001}],['fruit',{lemons:1000}],['dry',null],['dry',[1,2,3]]]){
  const before=JSON.stringify(g.state),cost=g.dailySupplyCost;assert.throws(()=>g.buyMarket(stall,order));assert.equal(JSON.stringify(g.state),before);assert.equal(g.dailySupplyCost,cost);
 }
 assert.equal(g.buyMarket('fruit',{}),0);assert.equal(g.state.cash,2000);
});
test('future ingredients survive a day transition and reset starts a fresh pantry',()=>{
 const g=new Simulation(()=>.5);g.buyMarket('fruit',{lemons:1,watermelon:1,orange:1,strawberry:1});g.buyMarket('dry',{sugar:1,ice:1,cups:1,milk:1});const pantry={...g.state.pantry},forecast={...g.tomorrow};g.open(150);for(let i=0;i<2800;i++)g.tick(.05);assert.equal(g.phase,'summary');assert.deepEqual(g.state.pantry,pantry);g.next();assert.deepEqual(g.state.pantry,pantry);assert.deepEqual(g.conditions,forecast);assert.equal(g.dailySupplyCost,0);g.reset();assert.deepEqual(g.state.pantry,{watermelon:0,strawberry:0,orange:0,milk:0});
});
