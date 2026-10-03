import test from 'node:test';
import assert from 'node:assert/strict';
import {preferences,evaluateTaste} from './taste.mjs';
import {Simulation} from './simulation.mjs';
const preference=id=>preferences.find(p=>p.id===id);
test('each ideal recipe earns exactly 20% tips',()=>{
 for(const [id,recipe] of [['sour',[2,1,2]],['sweet',[1,2,2]],['cool',[2,2,3]]]){
  const result=evaluateTaste(recipe,preference(id),150);
  assert.equal(result.difference,0);assert.equal(result.rating,'delighted');assert.equal(result.tip,30);assert.equal(result.feedback,'Just right!');
 }
});
test('one-step differences earn 10%, two or more earn no tip',()=>{
 const sweet=preference('sweet');
 assert.equal(evaluateTaste([1,2,1],sweet,150).tip,15);
 assert.equal(evaluateTaste([1,1,1],sweet,150).tip,0);
 assert.equal(evaluateTaste([1,1,2],sweet,150).rating,'okay');
});
test('feedback chooses largest mismatch, and preference breaks ties',()=>{
 assert.equal(evaluateTaste([1,3,2],preference('sour'),150).feedback,'Too sweet');
 assert.equal(evaluateTaste([3,1,2],preference('sweet'),150).feedback,'Too sour');
 assert.equal(evaluateTaste([2,2,1],preference('cool'),150).feedback,'Not cold enough');
 assert.equal(evaluateTaste([1,2,1],preference('cool'),150).feedback,'Not cold enough');
 assert.equal(evaluateTaste([3,1,1],preference('sour'),150).feedback,'Too sour');
});
test('tips round to whole cents',()=>{
 assert.equal(evaluateTaste([1,2,2],preference('sweet'),123).tip,25);
 assert.equal(evaluateTaste([1,1,2],preference('sweet'),125).tip,13);
});
const tick=(g,seconds)=>{for(let i=0;i<seconds*20;i++)g.tick(.05)};
test('tips are posted once with sale, shown separately and included in cash and profit',()=>{
 for(const [recipe,expectedTip] of [[[1,2,2],25],[[1,1,2],13],[[3,1,1],0]]){
  const g=new Simulation(()=>.5);g.open([10,20,20,20],recipe,125);tick(g,8);
  assert.equal(g.queue[0]?.state,'waiting');g.queue[0].preference=preference('sweet');const cash=g.state.cash;
  g.serve();assert.equal(g.serve(),false);tick(g,.5);assert.equal(g.stats.tips,0);assert.equal(g.state.cash,cash);
  tick(g,.8);assert.equal(g.stats.sold,1);assert.equal(g.stats.revenue,125);assert.equal(g.stats.tips,expectedTip);
  assert.equal(g.state.cash,cash+125+expectedTip);assert.equal(g.stats.profit,125+expectedTip-g.stats.cost);
  assert.equal(g.events[0].tip,expectedTip);assert.equal(g.events[0].price,125);
  tick(g,1);assert.equal(g.stats.tips,expectedTip);assert.equal(g.stats.sold,1);
 }
});
test('rejections and impatience never earn tips; daily totals reset while cash carries over',()=>{
 const g=new Simulation(()=>.5);g.open([10,20,20,20],[1,2,2],125);tick(g,8);g.queue[0].preference=preference('sweet');g.serve();tick(g,1.3);tick(g,140);
 assert.equal(g.phase,'summary');assert.ok(g.stats.impatient>0);assert.equal(g.stats.tips,25);const cash=g.state.cash;
 g.next();assert.equal(g.state.cash,cash);g.open([0,0,0,0],[1,2,2],500);assert.equal(g.stats.tips,0);tick(g,140);assert.equal(g.stats.tips,0);assert.equal(g.stats.sold,0);
});
