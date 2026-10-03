import {marketQuote,stallProducts} from './market.mjs';
import {getLocation,unlocked} from './locations.mjs';
import {newGame,weather} from './engine.mjs';
import {preferences,evaluateTaste} from './taste.mjs';
import {arrivalInterval,customerBudget,coolPreferenceChance} from './weather.mjs';
export const DAY_LENGTH=75;
export const capacity=(inventory,recipe=[1,1,1])=>Math.max(0,Math.min(...inventory.map((n,i)=>Math.floor(n/[1,...recipe][i]))));
// The simulation owns money, queue slots and time. Rendering only observes it.
export class Simulation{
 constructor(random=Math.random){this.random=random;this.reset()}
 reset(){this.state=newGame();this.location='lemon-lane';this.dailySupplyCost=0;this.conditions=weather(this.random);this.tomorrow=weather(this.random);this.phase='setup';this.people=[];this.queue=[];this.price=150;this.drink=null;this.time=0;this.message='Ready to open?';this.notice=0;this.making=null;this.paused=false;this.events=[];this.visits=0;this.remaining=DAY_LENGTH;this.stats=null}
 selectLocation(id){
  if(this.phase!=='setup')throw Error('Choose a destination before opening.');
  const location=getLocation(id);if(!unlocked(location,this.state.totalSold))throw Error(`Sell ${location.required} cups to unlock ${location.name}.`);
  if(location.kind==='stand')this.location=id;return location;
 }
 buySupplies(order){
  if(this.phase!=='setup')throw Error('Visit the market before opening.');
  if(order.length!==4||order.some(n=>!Number.isInteger(n)||n<0||n>1000))throw Error('Choose whole supply quantities from 0 to 1000.');
  const cost=order.reduce((sum,n,i)=>sum+n*this.conditions.prices[i],0);if(cost>this.state.cash)throw Error('Not enough cash for these supplies.');
  this.state={...this.state,cash:this.state.cash-cost,inventory:this.state.inventory.map((n,i)=>n+order[i])};this.dailySupplyCost+=cost;return cost;
 }
 buyMarket(stallId,order){
  if(this.phase!=='setup')throw Error('Visit the market before opening.');
  const cost=marketQuote(stallId,order,this.conditions);if(cost>this.state.cash)throw Error('Not enough cash for these supplies.');
  const inventory=[...this.state.inventory],pantry={...this.state.pantry};
  for(const product of stallProducts(stallId)){
   const count=order[product.id]??0;
   if(product.inventoryIndex===undefined)pantry[product.id]+=count;else inventory[product.inventoryIndex]+=count;
  }
  this.state={...this.state,cash:this.state.cash-cost,inventory,pantry};this.dailySupplyCost+=cost;return cost;
 }
 open(price){
  if(this.phase!=='setup')throw Error('The stand is already open.');
  const destination=getLocation(this.location);if(destination.kind!=='stand'||!unlocked(destination,this.state.totalSold))throw Error('This location is locked.');
  if(!Number.isInteger(price)||price<25||price>500)throw Error('Price must be between $0.25 and $5.00.');
  if(!capacity(this.state.inventory))throw Error('Visit the market for cups, lemons, sugar and ice first.');
  this.price=price;this.phase='playing';this.remaining=DAY_LENGTH;this.spawnIn=.7;this.people=[];this.queue=[];this.making=null;this.drink=null;this.time=0;this.paused=false;this.visits=0;
  this.stats={sold:0,rejected:0,missed:0,impatient:0,wasted:0,cost:this.dailySupplyCost,revenue:0,tips:0,profit:-this.dailySupplyCost};this.message='The stand is open!';this.notice=2;this.events=[];
 }
 activeCustomer(){const p=this.queue[0];return p?.state==='waiting'&&Math.hypot(p.x-240,p.y-204)<1?p:null}
 hasSupplies(){return this.drink?this.drink.ingredients.every((n,i)=>n>0||this.state.inventory[i+1]>0):capacity(this.state.inventory)>0}
 prepareCup(){
  if(this.phase!=='playing'||this.paused||this.drink||!this.activeCustomer()||!this.hasSupplies())return false;
  // A cup and every added portion are consumed immediately, never refunded.
  this.state.inventory[0]--;this.drink={ingredients:[0,0,0]};return true;
 }
 canAdd(index){return Number.isInteger(index)&&index>=0&&index<3&&this.phase==='playing'&&!this.paused&&!this.making&&!!this.activeCustomer()&&!!this.drink&&this.drink.ingredients[index]<3&&this.state.inventory[index+1]>0}
 addIngredient(index){
  if(!this.canAdd(index))return false;
  this.state.inventory[index+1]--;this.drink.ingredients[index]++;this.announce('Add ingredients, then mix & serve');return true;
 }
 discard(){
  if(this.phase!=='playing'||this.paused||this.making||!this.drink)return false;
  this.drink=null;this.stats.wasted++;this.announce('Cup discarded');return true;
 }
 canServe(){return this.phase==='playing'&&!this.paused&&!this.making&&!!this.activeCustomer()&&!!this.drink&&this.drink.ingredients.every(n=>n>=1)}
 announce(message){this.message=message;this.notice=2.5}
 spawn(){
  const budget=customerBudget(this.conditions,1,this.random);
  const p={id:++this.visits,x:-18,y:213,state:'approaching',dir:'side',moving:true,tint:Math.floor(this.random()*35)-10,maxPatience:12+this.random()*7,patience:0,path:[{x:150,y:213}],bubble:null};p.patience=p.maxPatience;
  const coolChance=coolPreferenceChance(this.conditions),roll=this.random();
  p.preference=roll<coolChance?preferences[2]:roll<coolChance+(1-coolChance)/2?preferences[0]:preferences[1];p.willing=budget>=this.price;
  // Decide once on arrival: the umbrella stays with this customer for the entire visit.
  p.umbrella=this.conditions.id==='rainy'&&this.random()<.6;this.people.push(p);
 }
 leave(p,bubble){
  // Remove queue ownership immediately, so the next customer can advance.
  this.queue=this.queue.filter(q=>q!==p);p.state='leaving';p.bubble=bubble;p.path=[{x:329,y:p.y},{x:350,y:225},{x:505,y:225}];p.moving=true;
  if(this.making?.customer===p.id)this.making=null;
 }
 serve(){
  if(!this.canServe())return false;
  const p=this.activeCustomer();this.making={customer:p.id,ingredients:[...this.drink.ingredients],elapsed:0,duration:1.25};p.bubble='…';this.announce('Mixing lemonade…');return true;
 }
 advance(p,dt){
  const target=p.path[0];if(!target){p.moving=false;return true}
  const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy),step=55*dt;
  p.dir=Math.abs(dx)>Math.abs(dy)?'side':dy<0?'up':'down';p.flip=dx<0;p.moving=true;
  if(d<=step){p.x=target.x;p.y=target.y;p.path.shift();return !p.path.length}
  p.x+=dx/d*step;p.y+=dy/d*step;return false;
 }
 tick(dt){
  if(this.phase!=='playing'||this.paused)return;
  dt=Math.max(0,Math.min(dt,.1));this.time+=dt;this.remaining=Math.max(0,this.remaining-dt);this.notice=Math.max(0,this.notice-dt);
  if(this.remaining>0){this.spawnIn-=dt;if(this.spawnIn<=0){this.spawn();this.spawnIn=arrivalInterval(this.conditions,this.random)}}
  for(const p of this.people){
   if(p.state==='approaching'&&this.advance(p,dt)){
    if(!p.willing){this.stats.rejected++;this.leave(p,'$!');this.announce('Too expensive for this customer')}
    else if(!this.hasSupplies()){this.stats.missed++;this.leave(p,'×');this.announce('Sold out!')}
    else if(this.queue.length>=4){this.stats.missed++;this.leave(p,'!');this.announce('The line is full')}
    else{p.state='queuing';this.queue.push(p)}
   }else if(p.state==='queuing'||p.state==='waiting'){
    const index=this.queue.indexOf(p),target={x:240,y:204+index*26};
    if(Math.hypot(p.x-target.x,p.y-target.y)>.5){p.state='queuing';p.path=p.x<230&&Math.abs(p.y-target.y)>.5?[{x:p.x,y:target.y}]:[target];if(this.advance(p,dt)&&Math.hypot(p.x-target.x,p.y-target.y)<.5)p.state='waiting'}else{p.state='waiting';p.moving=false;p.dir='up';p.bubble=this.making?.customer===p.id?'…':`taste-${p.preference.id}`}
    // Patience runs while queuing too, but is held during an active order.
    if(this.making?.customer!==p.id)p.patience-=dt;
    if(p.patience<=0){this.stats.impatient++;this.leave(p,'!');this.announce('A customer got tired of waiting')}
    else if(!this.hasSupplies()&&!this.making){this.stats.missed++;this.leave(p,'×')}
   }else if(p.state==='leaving'&&this.advance(p,dt))p.state='gone';
  }
  if(this.making){
   this.making.elapsed+=dt;
   if(this.making.elapsed>=this.making.duration){
    const p=this.queue.find(p=>p.id===this.making.customer);
    if(p&&this.drink){
     const ingredients=this.making.ingredients,taste=evaluateTaste(ingredients,p.preference,this.price);
     this.drink=null;
     this.state.cash+=this.price+taste.tip;this.stats.sold++;this.state.totalSold++;this.stats.revenue+=this.price;this.stats.tips+=taste.tip;
     this.stats.profit=this.stats.revenue+this.stats.tips-this.stats.cost;
     p.feedback=taste.feedback;p.rating=taste.rating;
     this.events.push({type:'sale',id:p.id,x:p.x,y:p.y,price:this.price,tip:taste.tip,ingredients:[...ingredients]});
     this.leave(p,taste.rating==='delighted'?'♥':taste.rating==='okay'?':)':':(');this.announce(taste.feedback+(taste.tip?` · $${(taste.tip/100).toFixed(2)} tip`:''));
    }
    this.making=null;
   }
  }
  this.prepareCup();
  this.people=this.people.filter(p=>p.state!=='gone');
  if(!this.notice)this.message=this.remaining<=0?'Closing — serve the last customers':!this.hasSupplies()?'Sold out':this.queue[0]?.state==='waiting'?'Add ingredients, then mix & serve':'Customers are on their way';
  if(this.remaining<=0&&!this.people.length&&!this.making)this.finishDay();
 }
 // Closing settles completed sales only; unfinished drinks remain spent.
 finishDay(){
  if(this.phase!=='playing')return false;
  if(this.drink)this.stats.wasted++;
  this.drink=null;this.making=null;this.people=[];this.queue=[];this.paused=false;this.remaining=0;
  this.stats.profit=this.stats.revenue+this.stats.tips-this.stats.cost;
  this.phase='summary';this.message='Day complete';return true;
 }
 next(){if(this.phase!=='summary')return;this.state.day++;this.dailySupplyCost=0;this.conditions=this.tomorrow;this.tomorrow=weather(this.random);this.phase='setup';this.people=[];this.queue=[];this.drink=null;this.making=null;this.paused=false;this.message='A new day, a fresh start'}
}
