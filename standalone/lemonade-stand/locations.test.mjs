import {openStand,fillCup,tick as playTicks} from './test-helpers.mjs';
import test from 'node:test';import assert from 'node:assert/strict';
import {locations,unlocked} from './locations.mjs';import {Simulation} from './simulation.mjs';
test('only market and Lemon Lane start open; exact thresholds unlock selling regions',()=>{
 assert.deepEqual(locations.filter(l=>unlocked(l,0)).map(l=>l.id),['market','lemon-lane']);
 for(const location of locations.filter(l=>l.required)){assert.equal(unlocked(location,location.required-1),false);assert.equal(unlocked(location,location.required),true)}
});
test('locked or unknown destinations cannot be selected and do not spend cash',()=>{
 const g=new Simulation(()=>.5);assert.throws(()=>g.selectLocation('park'));assert.throws(()=>g.selectLocation('missing'));assert.equal(g.location,'lemon-lane');assert.equal(g.state.cash,1500);
 g.state.totalSold=20;g.selectLocation('park');assert.equal(g.location,'park');g.selectLocation('market');assert.equal(g.location,'park');openStand(g,[10,10,10,10],100);assert.throws(()=>g.selectLocation('lemon-lane'));
});
test('market buys atomically and daily expenses include market purchases only',()=>{
 const g=new Simulation(()=>.5),prices=g.conditions.prices;const cost=prices.reduce((s,p)=>s+10*p,0);
 g.buySupplies([10,10,10,10]);assert.equal(g.state.cash,1500-cost);assert.deepEqual(g.state.inventory,[20,20,20,20]);assert.equal(g.phase,'setup');
 const before=JSON.stringify(g.state);assert.throws(()=>g.buySupplies([-1,0,0,0]));assert.throws(()=>g.buySupplies([1000,1000,1000,1000]));assert.equal(JSON.stringify(g.state),before);
 g.open(100);assert.equal(g.stats.cost,cost);assert.equal(g.stats.profit,-g.stats.cost);assert.throws(()=>g.buySupplies([1,0,0,0]));
});
test('completed sales unlock regions and persist across days while reset clears progress',()=>{
 const g=new Simulation(()=>.5);g.state.totalSold=19;openStand(g,[3,3,3,3],100);
 for(let i=0;i<2800;i++){fillCup(g);g.serve();g.tick(.05)}
 assert.equal(g.phase,'summary');assert.equal(g.stats.sold,3);assert.equal(g.state.totalSold,22);assert.equal(g.state.cash,1500-g.stats.cost+g.stats.revenue+g.stats.tips);
 g.next();assert.equal(g.state.totalSold,22);g.selectLocation('park');assert.equal(g.location,'park');assert.equal(g.dailySupplyCost,0);g.reset();assert.equal(g.state.totalSold,0);assert.throws(()=>g.selectLocation('park'));
});
test('locked location guard also prevents opening even if the UI is bypassed',()=>{
 const g=new Simulation(()=>.5);g.location='night-market';assert.throws(()=>g.open(100));assert.equal(g.state.cash,1500);assert.equal(g.phase,'setup');
});

test('night-market fee is charged atomically once at opening and shown separately from supplies',()=>{
 const g=new Simulation(()=>.5);g.state.totalSold=100;g.selectLocation('night-market');const before=JSON.stringify(g);
 assert.throws(()=>g.open(150),/50.00/);assert.equal(JSON.stringify(g),before);
 g.state.cash=10000;const stock=[...g.state.inventory],forecast=JSON.stringify(g.conditions);assert.throws(()=>g.open(0));assert.equal(g.state.cash,10000);
 g.open(150);assert.equal(g.state.cash,5000);assert.equal(g.stats.stallFee,5000);assert.equal(g.stats.supplyCost,0);assert.equal(g.stats.cost,5000);assert.equal(g.stats.profit,-5000);assert.deepEqual(g.state.inventory,stock);assert.equal(JSON.stringify(g.conditions),forecast);
 assert.throws(()=>g.open(150));assert.equal(g.state.cash,5000);g.finishDay();assert.equal(g.stats.profit,-5000);assert.equal(g.state.cash,5000);
 g.next();g.open(150);assert.equal(g.state.cash,0);assert.equal(g.stats.stallFee,5000);g.finishDay();g.next();assert.throws(()=>g.open(150),/50.00/);assert.equal(g.state.cash,0);assert.equal(g.phase,'setup');
});
test('fee validation preserves inventory, cash and day when locked or missing supplies',()=>{
 const g=new Simulation(()=>.5);g.state.cash=10000;g.location='night-market';const before=JSON.stringify(g);assert.throws(()=>g.open(150),/locked/);assert.equal(JSON.stringify(g),before);
 g.state.totalSold=100;g.state.inventory=[0,10,10,10];const empty=JSON.stringify(g);assert.throws(()=>g.open(150),/market/);assert.equal(JSON.stringify(g),empty);
});
test('night-market traffic stacks with weather and yields roughly twice as many arrivals',()=>{
 for(const weather of [{id:'sunny',temperature:76,traffic:1,budget:0},{id:'rainy',temperature:64,traffic:.55,budget:-25}]){
  const counts=[];for(const id of ['lemon-lane','night-market']){const g=new Simulation(()=>.5);g.state.totalSold=100;g.state.cash=10000;g.conditions={...g.conditions,...weather};g.selectLocation(id);g.open(150);for(let i=0;i<1500;i++)g.tick(.05);counts.push(g.visits)}
  assert.ok(counts[1]>=counts[0]*1.8,JSON.stringify(counts));assert.ok(counts[1]<=counts[0]*2.1,JSON.stringify(counts));
 }
});
test('commercial customers accept a higher price while weather, tips and other locations keep their rules',()=>{
 const customers=[];for(const id of ['lemon-lane','park','commercial']){const g=new Simulation(()=>.5);g.state.totalSold=100;g.conditions={...g.conditions,id:'sunny',temperature:70,budget:0,traffic:1};g.selectLocation(id);g.open(225);g.spawn();customers.push(g.people[0].willing);assert.equal(g.stats.stallFee,0);assert.equal(g.state.cash,1500)}
 assert.deepEqual(customers,[false,false,true]);
});
