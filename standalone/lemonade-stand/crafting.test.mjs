import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation} from './simulation.mjs';import {preferences} from './taste.mjs';
import {openStand,fillCup,tick} from './test-helpers.mjs';
function customer(g,id=1,preference=preferences[1]){const p={id,x:240,y:204,state:'waiting',dir:'up',moving:false,patience:15,maxPatience:15,path:[],preference,willing:true};g.queue=[p];g.people.push(p);return p}
function counter(stock=[10,10,10,10]){const g=new Simulation(()=>.5);openStand(g,stock,150);g.spawnIn=Infinity;customer(g);g.tick(0);return g}
test('cups start at the counter only, portions debit immediately and cap at three',()=>{
 const g=new Simulation(()=>.5);openStand(g,[5,5,5,5]);g.spawnIn=Infinity;tick(g,1);assert.equal(g.drink,null);assert.deepEqual(g.state.inventory,[5,5,5,5]);assert.equal(g.addIngredient(0),false);
 customer(g);g.tick(0);assert.deepEqual(g.state.inventory,[4,5,5,5]);assert.deepEqual(g.drink.ingredients,[0,0,0]);g.tick(0);assert.equal(g.state.inventory[0],4);
 for(let i=0;i<3;i++)assert.equal(g.addIngredient(0),true);assert.equal(g.addIngredient(0),false);assert.deepEqual(g.state.inventory,[4,2,5,5]);assert.equal(g.canServe(),false);
 for(const i of [-1,3,.5,NaN])assert.equal(g.addIngredient(i),false);assert.deepEqual(g.drink.ingredients,[3,0,0]);
});
test('a final cup serves after all remaining inventory is already consumed',()=>{
 const g=counter([1,1,1,1]);fillCup(g);assert.deepEqual(g.state.inventory,[0,0,0,0]);assert.equal(g.hasSupplies(),true);assert.equal(g.canServe(),true);const cash=g.state.cash;
 assert.equal(g.serve(),true);assert.equal(g.serve(),false);assert.equal(g.addIngredient(0),false);assert.equal(g.discard(),false);tick(g,1.3);
 assert.equal(g.stats.sold,1);assert.equal(g.state.cash,cash+150);assert.deepEqual(g.state.inventory,[0,0,0,0]);assert.equal(g.drink,null);assert.equal(g.hasSupplies(),false);
});
test('successive customers receive distinct live recipes and tips',()=>{
 const g=counter();fillCup(g,[1,2,2]);g.serve();tick(g,1.3);assert.equal(g.stats.tips,30);assert.deepEqual(g.events[0].ingredients,[1,2,2]);
 customer(g,2,preferences[0]);g.tick(0);fillCup(g,[2,1,1]);g.serve();tick(g,1.3);assert.equal(g.stats.tips,45);assert.equal(g.stats.sold,2);assert.deepEqual(g.events[1].ingredients,[2,1,1]);assert.equal(g.stats.profit,300+45-g.stats.cost);
});
test('discarding and customer abandonment never refund spent ingredients',()=>{
 const g=counter();g.addIngredient(0);g.addIngredient(1);const cup=g.drink,before=[...g.state.inventory];g.queue[0].patience=.01;g.tick(.05);
 assert.equal(g.stats.impatient,1);assert.equal(g.drink,cup);assert.deepEqual(g.state.inventory,before);assert.equal(g.addIngredient(2),false);
 customer(g,2);g.tick(0);assert.equal(g.drink,cup);assert.deepEqual(g.state.inventory,before);assert.equal(g.addIngredient(2),true);
 const spent=[...g.state.inventory];assert.equal(g.discard(),true);assert.equal(g.stats.wasted,1);assert.deepEqual(g.state.inventory,spent);assert.equal(g.discard(),false);
 g.tick(0);assert.deepEqual(g.drink.ingredients,[0,0,0]);assert.equal(g.state.inventory[0],spent[0]-1);
});
test('stock depletion, pause and mixing cannot cause extra spending',()=>{
 const g=counter([2,1,2,2]);assert.equal(g.addIngredient(0),true);assert.equal(g.addIngredient(0),false);g.paused=true;const before=JSON.stringify(g);assert.equal(g.addIngredient(1),false);assert.equal(g.discard(),false);assert.equal(g.serve(),false);tick(g,2);assert.equal(JSON.stringify(g),before);
 g.paused=false;fillCup(g);g.serve();g.paused=true;const mixing=JSON.stringify(g);tick(g,3);assert.equal(JSON.stringify(g),mixing);g.paused=false;tick(g,1.3);assert.equal(g.stats.sold,1);
});
test('an interrupted mix keeps the paid-for cup without a sale',()=>{
 const g=counter();fillCup(g,[1,2,2]);g.serve();const cup=g.drink,before=[...g.state.inventory],cash=g.state.cash;g.leave(g.queue[0],'!');tick(g,1.3);assert.equal(g.making,null);assert.equal(g.drink,cup);assert.deepEqual(g.state.inventory,before);assert.equal(g.state.cash,cash);assert.equal(g.stats.sold,0);
 customer(g,2);g.tick(0);g.serve();tick(g,1.3);assert.equal(g.stats.sold,1);assert.equal(g.stats.tips,30);
});
test('closing disposes of an unfinished cup once; next day and reset clear mixing state',()=>{
 const g=counter();g.addIngredient(0);const before=[...g.state.inventory];g.remaining=0;g.leave(g.queue[0],'!');tick(g,8);
 assert.equal(g.phase,'summary');assert.equal(g.stats.wasted,1);assert.equal(g.drink,null);assert.deepEqual(g.state.inventory,before);tick(g,3);assert.equal(g.stats.wasted,1);
 g.next();assert.equal(g.drink,null);assert.equal(g.making,null);assert.deepEqual(g.state.inventory,before);g.reset();assert.equal(g.drink,null);assert.deepEqual(g.state.inventory,[10,10,10,10]);
});
test('varied live recipes finish full seeded days with exact cash and bounded inventory',()=>{
 for(let seed=1;seed<=30;seed++){
  let value=seed;const random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296};
  const g=new Simulation(random);openStand(g,[10,20,20,20],100);
  const spent=[0,0,0];for(let i=0;i<2800;i++){
   const p=g.activeCustomer();if(p&&g.drink&&!g.making){const recipe={sour:[2,1,2],sweet:[1,2,2],cool:[1,1,3]}[p.preference.id];recipe.forEach((n,j)=>{while(g.drink.ingredients[j]<n){if(!g.addIngredient(j))break;spent[j]++}});g.serve()}
   g.tick(.05);assert.ok(g.state.inventory.every(n=>Number.isInteger(n)&&n>=0));
  }
  assert.equal(g.phase,'summary');assert.ok(g.stats.sold<=10);assert.deepEqual(g.state.inventory.slice(1),[20,20,20].map((n,i)=>n-spent[i]));assert.equal(g.state.cash,1500-g.stats.cost+g.stats.revenue+g.stats.tips);assert.equal(g.stats.sold,g.events.length);assert.equal(g.stats.profit,g.stats.revenue+g.stats.tips-g.stats.cost);
 }
});

test('early closing settles sales and tips, discards an unfinished mix once, and works while paused',()=>{
 const g=counter();fillCup(g,[1,2,2]);g.serve();tick(g,1.3);
 customer(g,2);g.tick(0);fillCup(g);g.serve();g.paused=true;
 const stock=[...g.state.inventory],cash=g.state.cash,weather=g.tomorrow;
 assert.equal(g.finishDay(),true);assert.equal(g.phase,'summary');assert.equal(g.stats.sold,1);assert.equal(g.stats.tips,30);assert.equal(g.stats.wasted,1);
 assert.deepEqual(g.state.inventory,stock);assert.equal(g.state.cash,cash);assert.equal(g.stats.profit,g.stats.revenue+g.stats.tips-g.stats.cost);
 assert.equal(g.making,null);assert.equal(g.drink,null);assert.equal(g.queue.length,0);assert.equal(g.people.length,0);assert.equal(g.paused,false);
 assert.equal(g.finishDay(),false);tick(g,3);assert.equal(g.stats.wasted,1);assert.equal(g.stats.sold,1);assert.equal(g.state.cash,cash);
 g.next();assert.equal(g.phase,'setup');assert.equal(g.state.day,2);assert.equal(g.conditions,weather);assert.deepEqual(g.state.inventory,stock);
});
test('early closing before any customer has no phantom sale, waste or refund',()=>{
 const g=new Simulation(()=>.5);assert.equal(g.finishDay(),false);openStand(g,[5,5,5,5]);const stock=[...g.state.inventory],cash=g.state.cash;
 assert.equal(g.finishDay(),true);assert.equal(g.stats.sold,0);assert.equal(g.stats.wasted,0);assert.equal(g.stats.profit,-g.stats.cost);assert.equal(g.state.cash,cash);assert.deepEqual(g.state.inventory,stock);
});
