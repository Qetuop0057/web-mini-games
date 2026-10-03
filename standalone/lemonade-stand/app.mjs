import {scene,homeScene,marketScene} from './art.mjs';
import {ingredientIcon,mixingScene} from './mixing-art.mjs';
import {Simulation,capacity,DAY_LENGTH} from './simulation.mjs';
import {money,names} from './engine.mjs';
import {marketStalls,getStall,stallProducts,products,productPrice,owned,marketQuote} from './market.mjs';
import {locations,getLocation,unlocked} from './locations.mjs';
import {recipePages,tasteLabels} from './recipes.mjs';
const $=s=>document.querySelector(s),game=new Simulation(),ctx=$('#scene').getContext('2d');let last=0,shownPhase='',audio,muted=true,effects=[],view='home',homeTime=0,bookRecipes=[],bookPage=0,tvChannel=0,drops=[],delivery=null,selectedStall=null;
// Only show hotspot focus outlines during keyboard navigation.
document.addEventListener('pointerdown',()=>document.body.classList.add('pointer-input'),true);
document.addEventListener('keydown',()=>document.body.classList.remove('pointer-input'),true);
function tone(freq,duration=.12){if(muted)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(.05,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}catch{/* Sound is optional; game remains playable. */}}
function standStock(){
 $('#stand-stock').replaceChildren(...names.map((name,i)=>{const item=document.createElement('div');item.textContent=name;const count=document.createElement('strong');count.textContent=game.state.inventory[i];item.append(count);return item}));
 $('#stand-capacity').textContent=`Up to ${capacity(game.state.inventory)} cups · mixed at the counter`;
 $('#error').textContent='';
}
function setup(){
 $('#setup-day').textContent=game.state.day;$('#forecast').textContent=`Today: ${game.conditions.icon} ${game.conditions.label} · ${game.conditions.temperature}°F`;$('#tomorrow').textContent=`Tomorrow: ${game.tomorrow.icon} ${game.tomorrow.label} · ${game.tomorrow.temperature}°F`;$('#forecast').title=game.conditions.description;
 standStock();
}
$('#setup').addEventListener('submit',e=>{e.preventDefault();try{game.open(Math.round(Number($('#price').value)*100));effects=[];drops=[];delivery=null;view='stand';$('#scene').focus();tone(440)}catch(error){$('#error').textContent=error.message}});
function serve(){if(game.serve())tone(330)}$('#serve').addEventListener('click',serve);
const ingredientIds=['lemon','sugar','ice'];
for(const [index,id] of ingredientIds.entries()){
 ingredientIcon($('#'+id+'-icon').getContext('2d'),index,0,0,2);
 $('#add-'+id).addEventListener('click',()=>addIngredient(index));
}
function addIngredient(index){if(game.addIngredient(index)){drops.push({index,age:0});tone(380+index*100,.07)}}
$('#end-day').addEventListener('click',()=>{if(game.finishDay()){effects=[];drops=[];delivery=null;sync()}});
$('#discard').addEventListener('click',()=>{if(game.discard()){drops=[];tone(180,.1)}});
window.addEventListener('keydown',e=>{
 if(game.phase!=='playing'||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
 if(['Digit1','Digit2','Digit3'].includes(e.code)){e.preventDefault();if(!e.repeat)addIngredient(Number(e.code.slice(-1))-1)}
 if(e.code==='Space'&&e.target.tagName!=='BUTTON'){e.preventDefault();if(!e.repeat)serve()}
 if(e.code==='Escape')pause();
});
function pause(){if(game.phase!=='playing')return;game.paused=!game.paused;$('#pause').setAttribute('aria-pressed',String(game.paused));$('#pause').textContent=game.paused?'Resume':'Pause';tone(220)}$('#pause').addEventListener('click',pause);
document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden&&game.phase==='playing'){game.paused=true;$('#pause').textContent='Resume'}});
$('#sound').addEventListener('click',()=>{muted=!muted;$('#sound').textContent=muted?'Sound off':'Sound on';$('#sound').setAttribute('aria-pressed',String(!muted));$('#sound').setAttribute('aria-label',muted?'Enable sound':'Mute sound');tone(523)});
$('#next').addEventListener('click',()=>{game.next();view='home';effects=[];tone(440)});$('#restart').addEventListener('click',()=>{game.reset();effects=[];view='home';shownPhase=''});
function changeView(next){
 if(game.phase!=='setup')return;
 view=next;selectedStall=null;
 if(next==='map')renderMap();
 if(next==='tv'){tvChannel=0;renderTelevision()}
 if(next==='market')renderMarket();
 if(next==='prepare'){$('#setup-location').textContent=getLocation(game.location).name;standStock()}
 if(next==='inventory'){
  $('#inventory-details').replaceChildren(...names.map((name,i)=>{const div=document.createElement('div');div.textContent=name;const strong=document.createElement('strong');strong.textContent=game.state.inventory[i];div.append(strong);return div}));
  for(const product of products.filter(product=>product.inventoryIndex===undefined)){const item=document.createElement('div');item.textContent=product.name;const count=document.createElement('strong');count.textContent=owned(game.state,product);item.append(count);$('#inventory-details').append(item)}
  $('#inventory-capacity').textContent=capacity(game.state.inventory);
 }
 if(next==='recipe'){
  bookRecipes=recipePages();bookPage=0;renderRecipePage();
 }
 syncView();
 $(next==='tv'?'#tv-previous':next==='market'?'#market-home':next==='inventory'?'#close-inventory':next==='map'?'#close-map':next==='recipe'?'#close-recipe':next==='prepare'?'#price':'#map-sign').focus();
}
// Broadcasts read the existing simulation; watching TV never advances the day.
function renderTelevision(){
 const weatherChannel=tvChannel===0;
 $('#tv-station-name').textContent=weatherChannel?'LEMON WEATHER':'TOWN NEWS';
 $('#tv-channel-number').textContent=`CH ${tvChannel+1}`;
 $('#tv-screen').classList.toggle('news-channel',!weatherChannel);
 const program=$('#tv-program');program.replaceChildren();
 const heading=document.createElement('h2');heading.textContent=weatherChannel?'Weather forecast':'Around town';program.append(heading);
 if(weatherChannel){
  const forecasts=document.createElement('div');forecasts.className='tv-forecasts';
  for(const [label,conditions] of [['Today',game.conditions],['Tomorrow',game.tomorrow]]){
   const card=document.createElement('article');card.className='tv-weather-card';
   for(const [tag,className,text] of [['h3','',label],['span','tv-weather-icon',conditions.icon],['strong','tv-temperature',`${conditions.temperature}°F`],['span','',conditions.label]]){
    const node=document.createElement(tag);node.className=className;node.textContent=text;card.append(node);
   }
   forecasts.append(card);
  }
  program.append(forecasts);$('#tv-ticker').textContent=`DAY ${game.state.day} · ${game.conditions.description}`;
 }else{
  const open=locations.filter(location=>unlocked(location,game.state.totalSold));
  const next=locations.find(location=>!unlocked(location,game.state.totalSold));
  const articles=[['OPEN TODAY',open.map(location=>location.name).join(' · ')],next?['NEXT OPENING',`${next.name} opens after ${next.required} cups sold. Town stands have sold ${game.state.totalSold} cups so far.`]:['TOWN UPDATE','Every neighborhood is now open for business.']];
  for(const [label,text] of articles){const article=document.createElement('article');article.className='tv-news-story';const title=document.createElement('h3');title.textContent=label;const body=document.createElement('p');body.textContent=text;article.append(title,body);program.append(article)}
  $('#tv-ticker').textContent=`DAY ${game.state.day} · LEMON LANE LOCAL REPORT`;
 }
 if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  program.getAnimations().forEach(animation=>animation.cancel());
  program.animate([{opacity:0,filter:'brightness(2)'},{opacity:1,filter:'brightness(1)'}],{duration:220});
 }
}
$('#show-tv').addEventListener('click',()=>changeView('tv'));
$('#tv-previous').addEventListener('click',()=>{tvChannel=(tvChannel+1)%2;renderTelevision();tone(260,.06)});
function closeTelevision(){changeView('home');$('#show-tv').focus()}
$('#close-tv').addEventListener('click',closeTelevision);
window.addEventListener('keydown',e=>{if(view==='tv'&&game.phase==='setup'){if(e.code==='Escape'){e.preventDefault();closeTelevision()}else if(e.code==='ArrowLeft'){e.preventDefault();tvChannel=(tvChannel+1)%2;renderTelevision()}else if(e.code==='Tab'){e.preventDefault();$(document.activeElement===$('#close-tv')?'#tv-previous':'#close-tv').focus()}}});
function renderMap(){
 $('#map-progress').textContent=`${game.state.totalSold} cups sold`;
 $('#map-destinations').replaceChildren(...locations.map(location=>{
  const open=unlocked(location,game.state.totalSold),button=document.createElement('button');button.type='button';button.className='map-place'+(open?'':' locked');button.disabled=!open;
  button.style.left=location.x+'%';button.style.top=location.y+'%';
  const title=document.createElement('strong');title.textContent=(open?'':'🔒 ')+location.name;
  const status=document.createElement('span');status.textContent=open?(location.kind==='shop'?'Buy supplies':'Go to stand'):`${game.state.totalSold} / ${location.required} cups`;
  button.append(title,status);button.addEventListener('click',()=>{try{const selected=game.selectLocation(location.id);changeView(selected.kind==='shop'?'market':'prepare')}catch(error){$('#map-progress').textContent=error.message}});return button;
 }));
}
function marketOrder(){return Object.fromEntries([...document.querySelectorAll('#market-supplies input')].map(input=>[input.dataset.productId,Number(input.value)]))}
function marketCost(){try{const cost=marketQuote(selectedStall,marketOrder(),game.conditions);$('#market-cost').textContent=money(cost);$('#market-message').textContent='';return cost}catch(error){$('#market-cost').textContent='—';$('#market-message').textContent=error.message;return null}}
function renderMarket(){selectedStall=null}
function openMarketStall(id){
 if(game.phase!=='setup'||view!=='market')return;
 getStall(id);selectedStall=id;renderMarketShop();syncView();$('#close-market-shop').focus();
}
function renderMarketShop(){
 const stall=getStall(selectedStall);$('#market-shop-title').textContent=stall.name;$('#market-message').textContent='';
 $('#vending-message').hidden=!stall.comingSoon;$('#market-form').hidden=!!stall.comingSoon;
 $('#market-supplies').replaceChildren(...stallProducts(selectedStall).map(product=>{
  const label=document.createElement('label');label.className='supply';const name=document.createElement('span');name.className='market-item-name';name.textContent=product.name;
  const price=document.createElement('span');price.className='market-item-price';price.textContent=money(productPrice(product,game.conditions))+' each';
  const stock=document.createElement('span');stock.className='market-item-stock';stock.textContent=owned(game.state,product)+' in stock';
  const input=document.createElement('input');Object.assign(input,{type:'number',min:'0',max:'1000',step:'1',value:'0',required:true});input.dataset.productId=product.id;input.setAttribute('aria-label','Buy '+product.name.toLowerCase());input.addEventListener('input',marketCost);label.append(name,price,stock,input);return label;
 }));if(!stall.comingSoon)marketCost();
}
function closeMarketShop(){if(!selectedStall)return;const id=selectedStall;selectedStall=null;syncView();$('#market-'+id).focus()}
for(const stall of marketStalls)$('#market-'+stall.id).addEventListener('click',()=>openMarketStall(stall.id));
$('#close-market-shop').addEventListener('click',closeMarketShop);
window.addEventListener('keydown',e=>{
 if(view!=='market'||!selectedStall)return;
 if(e.code==='Escape'){e.preventDefault();closeMarketShop()}
 if(e.code==='Tab'){
  const controls=[...$('#market-shop').querySelectorAll('button:not(:disabled), input')].filter(control=>!control.closest('[hidden]'));
  const index=controls.indexOf(document.activeElement),next=(index+(e.shiftKey?-1:1)+controls.length)%controls.length;e.preventDefault();controls[next]?.focus();
 }
});
$('#market-form').addEventListener('submit',e=>{e.preventDefault();try{const cost=game.buyMarket(selectedStall,marketOrder());renderMarketShop();$('#market-message').textContent=cost?`Supplies added · ${money(cost)}`:'Choose supplies to buy';tone(440)}catch(error){$('#market-message').textContent=error.message}});
$('#market-map').addEventListener('click',()=>changeView('map'));$('#market-home').addEventListener('click',()=>changeView('home'));
function renderRecipePage(direction){
 const page=bookRecipes[bookPage],labels=tasteLabels(page.quantities);
 $('#recipe-name').textContent=page.name;$('#recipe-flavor').textContent=labels.flavor;$('#recipe-cooling').textContent=labels.ice;
 $('#recipe-details').replaceChildren(...[['Cups',1],['Lemons',page.quantities[0]],['Sugar',page.quantities[1]],['Ice',page.quantities[2]]].flatMap(([name,count])=>{const term=document.createElement('dt'),value=document.createElement('dd');term.textContent=name;value.textContent=count;return [term,value]}));
 function options(selector,values,active){$(selector).replaceChildren(...values.map(label=>{const span=document.createElement('span');span.textContent=label;span.className=label===active?'selected':'';return span}))}
 options('#flavor-options',['Very sour','Sour','Balanced','Sweet','Very sweet'],labels.flavor);
 options('#ice-options',['Light ice','Regular ice','Ice cold'],labels.ice);
 $('#recipe-page-number').textContent=`${bookPage+1} / ${bookRecipes.length}`;
 $('#recipe-prev').disabled=bookPage===0;$('#recipe-next').disabled=bookPage===bookRecipes.length-1;
 if(direction&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  $('#book-page').getAnimations().forEach(animation=>animation.cancel());
  $('#book-page').animate([{opacity:.3,transform:`translateX(${direction==='next'?12:-12}px)`},{opacity:1,transform:'translateX(0)'}],{duration:220,easing:'ease-out'});
 }
}
function turnRecipe(direction){if(view!=='recipe'||game.phase!=='setup')return;const next=bookPage+(direction==='next'?1:-1);if(next<0||next>=bookRecipes.length)return;bookPage=next;renderRecipePage(direction);tone(390,.07)}
$('#recipe-prev').addEventListener('click',()=>turnRecipe('previous'));
$('#recipe-next').addEventListener('click',()=>turnRecipe('next'));
window.addEventListener('keydown',e=>{if(view==='recipe'&&game.phase==='setup'){if(e.code==='ArrowLeft'||e.code==='ArrowRight'){e.preventDefault();turnRecipe(e.code==='ArrowRight'?'next':'previous')}else if(e.code==='Escape'){changeView('home');$('#show-recipe').focus()}}});
$('#show-inventory').addEventListener('click',()=>changeView('inventory'));
$('#close-inventory').addEventListener('click',()=>{changeView('home');$('#show-inventory').focus()});
window.addEventListener('keydown',e=>{if(e.code==='Escape'&&view==='inventory'){changeView('home');$('#show-inventory').focus()}});
$('#map-sign').addEventListener('click',()=>changeView('map'));
$('#close-map').addEventListener('click',()=>{changeView('home');$('#map-sign').focus()});
$('#show-recipe').addEventListener('click',()=>changeView('recipe'));
$('#back-home').addEventListener('click',()=>changeView('home'));
$('#close-recipe').addEventListener('click',()=>{changeView('home');$('#show-recipe').focus()});
function syncView(){
 const atHome=game.phase==='setup';
 $('#overlay').hidden=game.phase==='playing'||(atHome&&(view==='home'||(view==='market'&&!selectedStall)));
 $('#tv-view').hidden=!atHome||view!=='tv';$('#show-tv').hidden=!atHome||view!=='home';
 $('#market-view').hidden=!atHome||view!=='market';$('#market-view').inert=!!selectedStall;
 $('#market-shop').hidden=!atHome||view!=='market'||!selectedStall;
 for(const stall of marketStalls)$('#market-'+stall.id).hidden=!atHome||view!=='market'||!!selectedStall;
 $('#inventory-view').hidden=!atHome||view!=='inventory';$('#show-inventory').hidden=!atHome||view!=='home';
 $('#map-view').hidden=!atHome||view!=='map';$('#map-sign').hidden=!atHome||view!=='home';$('#show-recipe').hidden=!atHome||view!=='home';positionHomeHotspots();
 $('#setup').hidden=!atHome||view!=='prepare';$('#recipe-view').hidden=!atHome||view!=='recipe';$('#summary').hidden=game.phase!=='summary';
 $('#home-actions').hidden=!atHome||view==='market';$('#play-actions').hidden=game.phase!=='playing';$('#ingredient-rack').hidden=game.phase!=='playing';$('#clock').hidden=game.phase!=='playing';$('#banner').hidden=game.phase!=='summary';
 $('#scene').parentElement.classList.toggle('is-playing',game.phase==='playing');
 $('#scene').parentElement.classList.toggle('is-market',atHome&&view==='market');
 $('#scene').setAttribute('aria-label',atHome?(view==='market'?'Market square with a fruit stall, dry goods stall and vending machine':'Your home, with a lemonade stand in the yard to the right'):'Street scene with a lemonade stand and customers');
 $('#home-forecast').textContent=`Tomorrow: ${game.tomorrow.icon} ${game.tomorrow.label} · ${game.tomorrow.temperature}°F`;
}
function sync(){
 $('#location-name').textContent=game.phase==='setup'?(view==='market'?'Market':'Home'):getLocation(game.location).name;$('#cash').textContent=money(game.state.cash);$('#cups').textContent=game.state.inventory[0];$('#weather').textContent=`${game.conditions.icon} ${game.conditions.label} · ${game.conditions.temperature}°F`;
 const seconds=Math.ceil(game.phase==='playing'?game.remaining:DAY_LENGTH);$('#clock').textContent=`${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
 $('#banner').textContent=game.phase==='setup'?'Home':game.paused?'Paused':game.message;
 syncCounter();
 if(shownPhase!==game.phase){shownPhase=game.phase;$('#pause').textContent='Pause';if(game.phase==='setup')view='home';syncView();
  if(game.phase==='setup')setup();
  if(game.phase==='summary'){
   const s=game.stats;$('#results').replaceChildren(...[['Cups sold',s.sold],['Sales revenue',money(s.revenue)],['Tips',money(s.tips)],['Cups discarded',s.wasted],['Supplies',money(s.cost)],['Net cash change',money(s.profit)],['Price rejected',s.rejected],['Walked away',s.impatient+s.missed]].map(([label,value])=>{const div=document.createElement('div');div.textContent=label;const strong=document.createElement('strong');strong.textContent=value;div.append(strong);return div}));tone(659,.3);$('#next').focus();
  }
 }
}
function syncCounter(){
 if(game.phase!=='playing')return;
 const customer=game.activeCustomer(),amounts=game.drink?.ingredients||[0,0,0];
 $('#order-request').textContent=customer?{sour:'Something sour, please!',sweet:'Sweet lemonade, please!',cool:'Make it ice cold!'}[customer.preference.id]:'Waiting for a customer';
 $('#customer-patience').hidden=!customer;$('#customer-patience').value=customer?.patience||0;$('#customer-patience').max=customer?.maxPatience||1;
 for(const [i,id] of ingredientIds.entries()){
  $('#add-'+id).disabled=!game.canAdd(i);$('#'+id+'-stock').textContent=game.state.inventory[i+1];$('#'+id+'-count').textContent=amounts[i]+' / 3';$('#add-'+id).setAttribute('aria-label',`${id}: ${game.state.inventory[i+1]} in stock, ${amounts[i]} of 3 added`);
 }
 $('#mixing-stage').setAttribute('aria-label',game.drink?`Current cup: ${amounts[0]} lemon, ${amounts[1]} sugar, ${amounts[2]} ice`:'No cup prepared');
 $('#cup-stock').textContent=game.state.inventory[0]+' cups left';
 $('#serve').disabled=!game.canServe();$('#discard').disabled=!game.drink||game.paused||!!game.making;$('#pause').disabled=false;$('#pause').setAttribute('aria-pressed',String(game.paused));
 $('#serve').textContent=game.making?`Mixing ${Math.min(100,Math.round(game.making.elapsed/game.making.duration*100))}%`:'Mix & serve';
 const status=game.paused?'Paused':game.notice>0?game.message:game.canServe()?'Ready to serve':game.drink?'Add lemon, sugar and ice':game.message;
 if($('#progress').textContent!==status)$('#progress').textContent=status;
}
function frame(timestamp){const dt=last?Math.min((timestamp-last)/1000,.1):0;last=timestamp;game.tick(dt);
 for(const event of game.events||[]){effects.push({...event,life:1.3});delivery={ingredients:event.ingredients,age:0};tone(780,.16)}if(game.events)game.events.length=0;
 if(!game.paused){effects=effects.map(e=>({...e,life:e.life-dt})).filter(e=>e.life>0);drops=drops.map(d=>({...d,age:d.age+dt})).filter(d=>d.age<.4);if(delivery){delivery.age+=dt;if(delivery.age>=.7)delivery=null}}
 if(game.phase==='setup'){homeTime+=dt;view==='market'?marketScene(ctx):homeScene(ctx,homeTime,game.conditions,game.state.day)}else scene(ctx,game.time,game.people,game.price,game.making?game.making.elapsed/game.making.duration:0,game.conditions,game.location);
 ctx.save();ctx.scale(2,2);ctx.font='bold 13px monospace';ctx.textAlign='center';for(const e of effects){ctx.globalAlpha=Math.min(1,e.life*2);ctx.fillStyle='#fff6c9';ctx.fillText('+'+money(e.price),e.x,e.y-50-(1.3-e.life)*24);if(e.tip){ctx.fillStyle='#ffe077';ctx.fillText('+'+money(e.tip)+' tip',e.x,e.y-35-(1.3-e.life)*24)}}ctx.restore();if(game.phase==='playing')mixingScene($('#mixing-stage').getContext('2d'),game.drink,game.making,game.time,drops,delivery);sync();requestAnimationFrame(frame)
}
requestAnimationFrame(frame);

// Canvas uses object-fit: contain on mobile. Keep the native, keyboard-accessible
// hotspot over the drawn sign, including any letterboxing.
function positionHomeHotspots(){
 const canvas=$('#scene'),bounds=canvas.getBoundingClientRect(),parent=canvas.parentElement.getBoundingClientRect();
 const width=Math.min(bounds.width,bounds.height*1.6),height=width/1.6;
 const left=bounds.left-parent.left-canvas.parentElement.clientLeft+canvas.parentElement.scrollLeft+(bounds.width-width)/2;
 const top=bounds.top-parent.top-canvas.parentElement.clientTop+canvas.parentElement.scrollTop+(bounds.height-height)/2;
 for(const [id,x,y,w,h] of [['show-tv',87,87,44,44],['map-sign',176,231,82,53],['show-recipe',332,32,68,54],['show-inventory',310,98,102,78],...marketStalls.map(stall=>['market-'+stall.id,...stall.bounds])]){
  Object.assign($('#'+id).style,{left:`${left+width*x/480}px`,top:`${top+height*y/300}px`,width:`${width*w/480}px`,height:`${height*h/300}px`});
 }
}
new ResizeObserver(positionHomeHotspots).observe($('#scene'));
