import {openStand,fillCup,tick as playTicks} from './test-helpers.mjs';
import test from 'node:test';import assert from 'node:assert/strict';
import {generateWeather,weatherTypes,arrivalInterval,customerBudget,coolPreferenceChance} from './weather.mjs';
import {Simulation} from './simulation.mjs';
test('weather kinds respect probabilities and compatible temperature ranges',()=>{
 for(const [roll,id] of [[0,'sunny'],[.3999,'sunny'],[.4,'cloudy'],[.6999,'cloudy'],[.7,'rainy'],[.8999,'rainy'],[.9,'heatwave'],[.9999,'heatwave']]){
  for(const tempRoll of [0,.9999]){let calls=0;const c=generateWeather(()=>calls++===0?roll:tempRoll);assert.equal(c.id,id);const type=weatherTypes.find(t=>t.id===id);assert.equal(c.temperature,tempRoll===0?type.min:type.max);assert.equal(c.prices.length,4)}
 }
});
test('weather and temperature both affect arrivals and budgets',()=>{
 const sunny={...weatherTypes[0],temperature:75},rainy={...weatherTypes[2],temperature:75},hot={...weatherTypes[3],temperature:90};
 assert.ok(arrivalInterval(rainy,()=>.5)>arrivalInterval(sunny,()=>.5));
 assert.ok(arrivalInterval(hot,()=>.5)<arrivalInterval(sunny,()=>.5));
 assert.equal(customerBudget(sunny,1,()=>.5)-customerBudget(rainy,1,()=>.5),25);
 assert.ok(customerBudget(hot,1,()=>.5)>customerBudget(sunny,1,()=>.5));
 assert.ok(arrivalInterval({...sunny,temperature:85},()=>.5)<arrivalInterval(sunny,()=>.5));
 assert.equal(customerBudget({...sunny,temperature:85},1,()=>.5)-customerBudget(sunny,1,()=>.5),30);
});
test('forecasts stay fixed through setup, gameplay and next-day transition',()=>{
 let value=.2;const g=new Simulation(()=>value);const today={...g.conditions},tomorrow={...g.tomorrow};value=.95;
 openStand(g,[10,10,10,10],100);for(let i=0;i<2800;i++)g.tick(.05);
 assert.equal(g.phase,'summary');assert.deepEqual(g.conditions,today);assert.deepEqual(g.tomorrow,tomorrow);
 g.next();assert.deepEqual(g.conditions,tomorrow);assert.equal(g.tomorrow.id,'heatwave');assert.equal(g.state.day,2);
});
test('hot weather increases cool preferences, rain decreases them; taste targets do not change',()=>{
 assert.equal(coolPreferenceChance({...weatherTypes[0],temperature:85}),.5);
 assert.equal(coolPreferenceChance({...weatherTypes[0],temperature:74}),1/3);
 assert.equal(coolPreferenceChance({...weatherTypes[2],temperature:74}),.2);
 const g=new Simulation(()=>.25);g.conditions={...weatherTypes[3],temperature:90};g.spawn();assert.equal(g.people[0].preference.id,'cool');assert.equal(g.people[0].preference.ice,3);
 g.conditions={...weatherTypes[2],temperature:70};g.spawn();assert.equal(g.people[1].preference.id,'sour');
});
test('rain and heatwave days still finish with exact money and no overselling',()=>{
 for(const type of [weatherTypes[2],weatherTypes[3]]){
  const g=new Simulation(()=>.5);g.conditions={...type,temperature:type.max,prices:[10,20,10,5]};openStand(g,[6,6,6,6],100);
  for(let i=0;i<2800;i++){fillCup(g);g.serve();g.tick(.05)}
  assert.equal(g.phase,'summary');assert.ok(g.stats.sold<=6);assert.equal(g.state.cash,2000-g.stats.cost+g.stats.revenue+g.stats.tips);assert.ok(g.state.inventory.every(n=>n>=0));
 }
});
