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
