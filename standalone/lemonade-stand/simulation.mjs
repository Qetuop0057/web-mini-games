import {newGame,weather} from './engine.mjs';
import {preferences,evaluateTaste} from './taste.mjs';
export const DAY_LENGTH=75;
export const capacity=(inventory,recipe)=>Math.max(0,Math.min(...inventory.map((n,i)=>Math.floor(n/[1,...recipe][i]))));
// The simulation owns money, queue slots and time. Rendering only observes it.
export class Simulation{
 constructor(random=Math.random){this.random=random;this.reset()}
 reset(){this.state=newGame();this.conditions=weather(this.random);this.phase='setup';this.people=[];this.queue=[];this.price=150;this.recipe=[1,1,1];this.time=0;this.message='Ready for a sunny day?';this.notice=0;this.making=null;this.paused=false}
 open(order,recipe,price){
  if(this.phase!=='setup')throw Error('The stand is already open.');
  if(order.length!==4||order.some(n=>!Number.isInteger(n)||n<0||n>1000))throw Error('Choose whole supply quantities.');
  if(recipe.length!==3||recipe.some(n=>!Number.isInteger(n)||n<1||n>3))throw Error('Choose a recipe between 1 and 3.');
  if(!Number.isInteger(price)||price<25||price>500)throw Error('Price must be between $0.25 and $5.00.');
  const cost=order.reduce((s,n,i)=>s+n*this.conditions.prices[i],0), inventory=this.state.inventory.map((n,i)=>n+order[i]);
  if(cost>this.state.cash)throw Error('Not enough cash for those supplies.');
  if(!capacity(inventory,recipe))throw Error('Buy enough supplies for at least one cup.');
  this.state={...this.state,cash:this.state.cash-cost,inventory};this.recipe=[...recipe];this.price=price;this.phase='playing';this.remaining=DAY_LENGTH;this.spawnIn=.7;this.people=[];this.queue=[];this.making=null;this.time=0;this.paused=false;this.visits=0;
  this.stats={sold:0,rejected:0,missed:0,impatient:0,cost,revenue:0,tips:0,profit:-cost};this.message='The stand is open!';this.notice=2;this.events=[];
 }
 announce(message){this.message=message;this.notice=2.5}
 spawn(){
  const budget=85+(this.conditions.temperature-60)*3+this.recipe[0]*10+Math.floor(this.random()*100);
  const p={id:++this.visits,x:-18,y:213,state:'approaching',dir:'side',moving:true,tint:Math.floor(this.random()*35)-10,maxPatience:12+this.random()*7,patience:0,path:[{x:150,y:213}],bubble:null};p.patience=p.maxPatience;
  p.preference=preferences[Math.floor(this.random()*preferences.length)];p.willing=budget>=this.price;this.people.push(p);
 }
 leave(p,bubble){
  // Remove queue ownership immediately, so the next customer can advance.
  this.queue=this.queue.filter(q=>q!==p);p.state='leaving';p.bubble=bubble;p.path=[{x:329,y:p.y},{x:350,y:225},{x:505,y:225}];p.moving=true;
  if(this.making?.customer===p.id)this.making=null;
 }
 serve(){
  if(this.phase!=='playing'||this.paused||this.making)return false;
  const p=this.queue[0];if(!p||p.state!=='waiting'){this.announce('Waiting for a customer');return false}
  if(!capacity(this.state.inventory,this.recipe)){this.announce('Sold out!');return false}
  this.making={customer:p.id,elapsed:0,duration:1.25};p.bubble='…';this.announce('Mixing lemonade…');return true;
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
  if(this.remaining>0){this.spawnIn-=dt;if(this.spawnIn<=0){this.spawn();this.spawnIn=2.8+this.random()*2.5-(this.conditions.temperature-60)*.035}}
  for(const p of this.people){
   if(p.state==='approaching'&&this.advance(p,dt)){
    if(!p.willing){this.stats.rejected++;this.leave(p,'$!');this.announce('Too expensive for this customer')}
    else if(!capacity(this.state.inventory,this.recipe)){this.stats.missed++;this.leave(p,'×');this.announce('Sold out!')}
    else if(this.queue.length>=4){this.stats.missed++;this.leave(p,'!');this.announce('The line is full')}
    else{p.state='queuing';this.queue.push(p)}
   }else if(p.state==='queuing'||p.state==='waiting'){
    const index=this.queue.indexOf(p),target={x:240,y:204+index*26};
    if(Math.hypot(p.x-target.x,p.y-target.y)>.5){p.state='queuing';p.path=p.x<230&&Math.abs(p.y-target.y)>.5?[{x:p.x,y:target.y}]:[target];if(this.advance(p,dt)&&Math.hypot(p.x-target.x,p.y-target.y)<.5)p.state='waiting'}else{p.state='waiting';p.moving=false;p.dir='up';p.bubble=this.making?.customer===p.id?'…':`taste-${p.preference.id}`}
    // Patience runs while queuing too, but is held during an active order.
    if(this.making?.customer!==p.id)p.patience-=dt;
    if(p.patience<=0){this.stats.impatient++;this.leave(p,'!');this.announce('A customer got tired of waiting')}
    else if(!capacity(this.state.inventory,this.recipe)&&!this.making){this.stats.missed++;this.leave(p,'×')}
   }else if(p.state==='leaving'&&this.advance(p,dt))p.state='gone';
  }
  if(this.making){
   this.making.elapsed+=dt;
   if(this.making.elapsed>=this.making.duration){
    const p=this.queue.find(p=>p.id===this.making.customer);
    if(p&&capacity(this.state.inventory,this.recipe)>0){
     const taste=evaluateTaste(this.recipe,p.preference,this.price);
     [1,...this.recipe].forEach((n,i)=>this.state.inventory[i]-=n);
     this.state.cash+=this.price+taste.tip;this.stats.sold++;this.stats.revenue+=this.price;this.stats.tips+=taste.tip;
     this.stats.profit=this.stats.revenue+this.stats.tips-this.stats.cost;
     p.feedback=taste.feedback;p.rating=taste.rating;
     this.events.push({type:'sale',id:p.id,x:p.x,y:p.y,price:this.price,tip:taste.tip});
     this.leave(p,taste.rating==='delighted'?'♥':taste.rating==='okay'?':)':':(');this.announce(taste.tip?`Thanks! $${(taste.tip/100).toFixed(2)} tip`:'Fresh lemonade!');
    }
    this.making=null;
   }
  }
  this.people=this.people.filter(p=>p.state!=='gone');
  if(!this.notice)this.message=this.remaining<=0?'Closing — serve the last customers':!capacity(this.state.inventory,this.recipe)?'Sold out':this.queue[0]?.state==='waiting'?'Order ready — make lemonade':'Customers are on their way';
  if(this.remaining<=0&&!this.people.length&&!this.making){this.phase='summary';this.message='Day complete'}
 }
 next(){if(this.phase!=='summary')return;this.state.day++;this.conditions=weather(this.random);this.phase='setup';this.people=[];this.queue=[];this.paused=false;this.message='A new day, a fresh start'}
}
