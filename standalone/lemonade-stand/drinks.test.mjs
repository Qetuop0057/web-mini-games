import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation} from './simulation.mjs';import {chooseDrink,matchesDrink} from './drinks.mjs';import {preferences} from './taste.mjs';import {fillCup,tick} from './test-helpers.mjs';
function counter(order){
 const g=new Simulation(()=>.5);g.buyMarket('fruit',{strawberry:3,watermelon:3});g.open(150);g.spawnIn=Infinity;
 const p={id:1,x:240,y:204,state:'waiting',dir:'up',moving:false,patience:15,maxPatience:15,path:[],preference:preferences[1],willing:true,order};g.queue=[p];g.people=[p];g.tick(0);return g;
}
test('customer orders include classic, pink and watermelon; fruit match requires exactly one corresponding fruit',()=>{
 assert.deepEqual([0,.599,.6,.799,.8,.999].map(n=>chooseDrink(()=>n)),['lemonade','lemonade','pink','pink','watermelon','watermelon']);
 for(const [order,fruit] of [['lemonade',{}],['pink',{strawberry:1}],['watermelon',{watermelon:1}]])assert.equal(matchesDrink({fruit},order),true);
 assert.equal(matchesDrink({fruit:{}},'pink'),false);assert.equal(matchesDrink({fruit:{strawberry:1,watermelon:1}},'pink'),false);assert.equal(matchesDrink({fruit:{watermelon:1}},'lemonade'),false);assert.equal(matchesDrink({fruit:{strawberry:2}},'pink'),false);
 for(const [roll,order] of [[.5,'lemonade'],[.7,'pink'],[.9,'watermelon']]){const g=new Simulation(()=>roll);g.spawn();assert.equal(g.people[0].order,order)}
});
test('correct pink and watermelon drinks consume market stock once and retain normal tips',()=>{
 for(const [order,index,fruit] of [['pink',3,'strawberry'],['watermelon',4,'watermelon']]){
  const g=counter(order);assert.equal(g.queue[0].bubble,`drink-${order}`);fillCup(g,[1,2,2]);assert.equal(g.addIngredient(index),true);assert.equal(g.addIngredient(index),false);assert.equal(g.state.pantry[fruit],2);
  const stock=JSON.stringify(g.state),cash=g.state.cash;assert.equal(g.serve(),true);assert.equal(g.serve(),false);assert.equal(g.addIngredient(index),false);tick(g,1.3);
  assert.equal(g.stats.sold,1);assert.equal(g.stats.tips,30);assert.equal(g.state.cash,cash+180);assert.equal(g.stats.wasted,0);assert.equal(g.stats.wrongDrinks,0);assert.equal(g.state.pantry[fruit],2);assert.equal(g.events[0].fruit[fruit],1);assert.equal(g.stats.profit,g.stats.revenue+g.stats.tips-g.stats.cost);
 }
});
test('missing, opposite, mixed or unwanted fruit wastes one cup, removes the customer and never pays',()=>{
 for(const [order,fruits] of [['pink',[]],['pink',[4]],['pink',[3,4]],['watermelon',[]],['watermelon',[3]],['watermelon',[3,4]],['lemonade',[3]],['lemonade',[4]]]){
  const g=counter(order);fillCup(g);for(const index of fruits)assert.equal(g.addIngredient(index),true);const stock=JSON.stringify(g.state.inventory),pantry=JSON.stringify(g.state.pantry),cash=g.state.cash;
  assert.equal(g.serve(),true);tick(g,1.3);assert.equal(g.stats.sold,0);assert.equal(g.stats.revenue,0);assert.equal(g.stats.tips,0);assert.equal(g.state.cash,cash);assert.equal(g.state.totalSold,0);assert.equal(g.events.length,0);
  assert.equal(g.stats.wasted,1);assert.equal(g.stats.wrongDrinks,1);assert.equal(g.drink,null);assert.equal(g.making,null);assert.equal(g.queue.length,0);assert.equal(g.people[0].state,'leaving');assert.equal(JSON.stringify(g.state.inventory),stock);assert.equal(JSON.stringify(g.state.pantry),pantry);
  g.finishDay();assert.equal(g.stats.wasted,1);assert.equal(g.stats.profit,-g.stats.cost);
 }
});
test('fruit respects stock, pause, discard, early closing and carry-over without refunds',()=>{
 const g=counter('pink');g.state.pantry.strawberry=0;assert.equal(g.addIngredient(3),false);g.state.pantry.strawberry=2;g.paused=true;assert.equal(g.addIngredient(3),false);g.paused=false;assert.equal(g.addIngredient(3),true);assert.equal(g.state.pantry.strawberry,1);
 assert.equal(g.discard(),true);assert.equal(g.state.pantry.strawberry,1);g.tick(0);g.addIngredient(3);g.finishDay();assert.equal(g.stats.wasted,2);assert.equal(g.state.pantry.strawberry,0);g.next();assert.equal(g.state.pantry.strawberry,0);g.reset();assert.equal(g.state.pantry.strawberry,0);
});
