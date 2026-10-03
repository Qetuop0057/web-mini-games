import {scene,homeScene} from './art.mjs';
import {Simulation,capacity,DAY_LENGTH} from './simulation.mjs';
import {money,names} from './engine.mjs';
import {locations,getLocation,unlocked} from './locations.mjs';
import {recipePages,tasteLabels} from './recipes.mjs';
const $=s=>document.querySelector(s),game=new Simulation(),ctx=$('#scene').getContext('2d');let last=0,shownPhase='',audio,muted=true,effects=[],view='home',homeTime=0,bookRecipes=[],bookPage=0;
// Only show hotspot focus outlines during keyboard navigation.
document.addEventListener('pointerdown',()=>document.body.classList.add('pointer-input'),true);
document.addEventListener('keydown',()=>document.body.classList.remove('pointer-input'),true);
function tone(freq,duration=.12){if(muted)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(.05,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}catch{/* Sound is optional; game remains playable. */}}
function recipe(){return ['lemons','sugar','ice'].map(id=>Number($('#'+id).value))}function order(){return [...document.querySelectorAll('.supply input')].map(el=>Number(el.value))}
function refreshCost(){const cost=order().reduce((s,n,i)=>s+n*game.conditions.prices[i],0);$('#cost').textContent=money(cost);$('#error').textContent=cost>game.state.cash?'Not enough cash':''}
function setup(){
 $('#setup-day').textContent=game.state.day;$('#forecast').textContent=`Today: ${game.conditions.icon} ${game.conditions.label} · ${game.conditions.temperature}°F`;$('#tomorrow').textContent=`Tomorrow: ${game.tomorrow.icon} ${game.tomorrow.label} · ${game.tomorrow.temperature}°F`;$('#forecast').title=game.conditions.description;
 $('#supplies').replaceChildren(...names.map((name,i)=>{const label=document.createElement('label');label.className='supply';const span=document.createElement('span');span.textContent=name+' ';const small=document.createElement('small');small.textContent=`${money(game.conditions.prices[i])} each · ${game.state.inventory[i]} left`;span.append(small);const input=document.createElement('input');Object.assign(input,{type:'number',min:'0',max:'1000',step:'1',value:game.state.inventory[i]>0?'0':game.state.day===1?'20':'10',required:true});input.setAttribute('aria-label',`Buy ${name.toLowerCase()}`);input.addEventListener('input',refreshCost);label.append(span,input);return label}));refreshCost();
}
$('#setup').addEventListener('submit',e=>{e.preventDefault();try{game.open(order(),recipe(),Math.round(Number($('#price').value)*100));effects=[];view='stand';$('#scene').focus();tone(440)}catch(error){$('#error').textContent=error.message}});
function serve(){if(game.serve())tone(330)}$('#serve').addEventListener('click',serve);$('#scene').addEventListener('pointerdown',serve);
window.addEventListener('keydown',e=>{if(e.code==='Space'&&!/INPUT|BUTTON|TEXTAREA/.test(e.target.tagName)){e.preventDefault();if(!e.repeat)serve()}if(e.code==='Escape'&&game.phase==='playing')pause()});
function pause(){if(game.phase!=='playing')return;game.paused=!game.paused;$('#pause').textContent=game.paused?'Resume':'Pause';tone(220)}$('#pause').addEventListener('click',pause);
document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden&&game.phase==='playing'){game.paused=true;$('#pause').textContent='Resume'}});
$('#sound').addEventListener('click',()=>{muted=!muted;$('#sound').textContent=muted?'Sound off':'Sound on';$('#sound').setAttribute('aria-pressed',String(!muted));$('#sound').setAttribute('aria-label',muted?'Enable sound':'Mute sound');tone(523)});
$('#next').addEventListener('click',()=>{game.next();view='home';effects=[];tone(440)});$('#restart').addEventListener('click',()=>{game.reset();effects=[];view='home';shownPhase=''});
function changeView(next){
 if(game.phase!=='setup')return;
 view=next;
 if(next==='map')renderMap();
 if(next==='market')renderMarket();
 if(next==='prepare')$('#setup-location').textContent=getLocation(game.location).name;
 if(next==='inventory'){
  $('#inventory-details').replaceChildren(...names.map((name,i)=>{const div=document.createElement('div');div.textContent=name;const strong=document.createElement('strong');strong.textContent=game.state.inventory[i];div.append(strong);return div}));
  const draft=recipe().map((n,i)=>Number.isInteger(n)&&n>=1&&n<=3?n:game.recipe[i]);
  $('#inventory-capacity').textContent=capacity(game.state.inventory,draft);
 }
 if(next==='recipe'){
  const quantities=recipe().map((n,i)=>Number.isInteger(n)&&n>=1&&n<=3?n:game.recipe[i]);
  bookRecipes=recipePages(quantities);bookPage=0;renderRecipePage();
 }
 syncView();
 $(next==='market'?'#market-home':next==='inventory'?'#close-inventory':next==='map'?'#close-map':next==='recipe'?'#close-recipe':next==='prepare'?'#price':'#map-sign').focus();
}
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
function marketOrder(){return [...document.querySelectorAll('#market-supplies input')].map(input=>Number(input.value))}
function marketCost(){const cost=marketOrder().reduce((sum,n,i)=>sum+n*game.conditions.prices[i],0);$('#market-cost').textContent=money(cost);return cost}
function renderMarket(){
 $('#market-message').textContent='';
 $('#market-supplies').replaceChildren(...names.map((name,i)=>{const label=document.createElement('label');label.className='supply';const span=document.createElement('span');span.textContent=`${name} · ${money(game.conditions.prices[i])} each · ${game.state.inventory[i]} left`;const input=document.createElement('input');Object.assign(input,{type:'number',min:'0',max:'1000',step:'1',value:'0',required:true});input.setAttribute('aria-label','Buy '+name.toLowerCase());input.addEventListener('input',marketCost);label.append(span,input);return label}));marketCost();
}
$('#market-form').addEventListener('submit',e=>{e.preventDefault();try{const cost=game.buySupplies(marketOrder());renderMarket();$('#market-message').textContent=cost?`Supplies added · ${money(cost)}`:'Choose supplies to buy';document.querySelectorAll('.supply input').forEach(input=>{if(input.closest('#supplies'))input.value='0'});refreshCost();tone(440)}catch(error){$('#market-message').textContent=error.message}});
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
 $('#overlay').hidden=game.phase==='playing'||(atHome&&view==='home');
 $('#market-view').hidden=!atHome||view!=='market';
 $('#inventory-view').hidden=!atHome||view!=='inventory';$('#show-inventory').hidden=!atHome||view!=='home';
 $('#map-view').hidden=!atHome||view!=='map';$('#map-sign').hidden=!atHome||view!=='home';$('#show-recipe').hidden=!atHome||view!=='home';positionHomeHotspots();
 $('#setup').hidden=!atHome||view!=='prepare';$('#recipe-view').hidden=!atHome||view!=='recipe';$('#summary').hidden=game.phase!=='summary';
 $('#home-actions').hidden=!atHome;$('#play-actions').hidden=game.phase!=='playing';$('#clock').hidden=game.phase!=='playing';$('#banner').hidden=atHome;
 $('#scene').setAttribute('aria-label',atHome?'Your home, with a lemonade stand in the yard to the right':'Street scene with a lemonade stand and customers');
 $('#home-forecast').textContent=`Tomorrow: ${game.tomorrow.icon} ${game.tomorrow.label} · ${game.tomorrow.temperature}°F`;
}
function sync(){
 $('#location-name').textContent=game.phase==='setup'?'Home':getLocation(game.location).name;$('#cash').textContent=money(game.state.cash);$('#cups').textContent=capacity(game.state.inventory,game.recipe);$('#weather').textContent=`${game.conditions.icon} ${game.conditions.label} · ${game.conditions.temperature}°F`;
 const seconds=Math.ceil(game.phase==='playing'?game.remaining:DAY_LENGTH);$('#clock').textContent=`${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
 $('#banner').textContent=game.phase==='setup'?'Home':game.paused?'Paused':game.message;
 $('#serve').disabled=game.phase!=='playing'||game.paused||!!game.making||game.queue[0]?.state!=='waiting'||!capacity(game.state.inventory,game.recipe);
 $('#pause').disabled=game.phase!=='playing';
 $('#progress').textContent=game.making?`Mixing… ${Math.min(100,Math.round(game.making.elapsed/game.making.duration*100))}%`:game.paused?'Press Resume to continue':'Click the stand or press Space';
 if(shownPhase!==game.phase){shownPhase=game.phase;$('#pause').textContent='Pause';if(game.phase==='setup')view='home';syncView();
  if(game.phase==='setup'){setup();['lemons','sugar','ice'].forEach((id,i)=>$('#'+id).value=game.recipe[i])}
  if(game.phase==='summary'){
   const s=game.stats;$('#results').replaceChildren(...[['Cups sold',s.sold],['Sales revenue',money(s.revenue)],['Tips',money(s.tips)],['Supplies',money(s.cost)],['Net cash change',money(s.profit)],['Price rejected',s.rejected],['Walked away',s.impatient+s.missed]].map(([label,value])=>{const div=document.createElement('div');div.textContent=label;const strong=document.createElement('strong');strong.textContent=value;div.append(strong);return div}));tone(659,.3);$('#next').focus();
  }
 }
}
function frame(timestamp){const dt=last?Math.min((timestamp-last)/1000,.1):0;last=timestamp;game.tick(dt);
 for(const event of game.events||[]){effects.push({...event,life:1.3});tone(780,.16)}if(game.events)game.events.length=0;
 if(!game.paused)effects=effects.map(e=>({...e,life:e.life-dt})).filter(e=>e.life>0);
 if(game.phase==='setup'){homeTime+=dt;homeScene(ctx,homeTime,game.conditions,game.state.day)}else scene(ctx,game.time,game.people,game.price,game.making?game.making.elapsed/game.making.duration:0,game.conditions,game.location);
 ctx.save();ctx.scale(2,2);ctx.font='bold 13px monospace';ctx.textAlign='center';for(const e of effects){ctx.globalAlpha=Math.min(1,e.life*2);ctx.fillStyle='#fff6c9';ctx.fillText('+'+money(e.price),e.x,e.y-50-(1.3-e.life)*24);if(e.tip){ctx.fillStyle='#ffe077';ctx.fillText('+'+money(e.tip)+' tip',e.x,e.y-35-(1.3-e.life)*24)}}ctx.restore();sync();requestAnimationFrame(frame)
}
requestAnimationFrame(frame);

// Canvas uses object-fit: contain on mobile. Keep the native, keyboard-accessible
// hotspot over the drawn sign, including any letterboxing.
function positionHomeHotspots(){
 const canvas=$('#scene'),bounds=canvas.getBoundingClientRect(),parent=canvas.parentElement.getBoundingClientRect();
 const width=Math.min(bounds.width,bounds.height*1.6),height=width/1.6;
 const left=bounds.left-parent.left-canvas.parentElement.clientLeft+canvas.parentElement.scrollLeft+(bounds.width-width)/2;
 const top=bounds.top-parent.top-canvas.parentElement.clientTop+canvas.parentElement.scrollTop+(bounds.height-height)/2;
 for(const [id,x,y,w,h] of [['map-sign',176,231,82,53],['show-recipe',332,32,68,54],['show-inventory',310,98,102,78]]){
  Object.assign($('#'+id).style,{left:`${left+width*x/480}px`,top:`${top+height*y/300}px`,width:`${width*w/480}px`,height:`${height*h/300}px`});
 }
}
new ResizeObserver(positionHomeHotspots).observe($('#scene'));
