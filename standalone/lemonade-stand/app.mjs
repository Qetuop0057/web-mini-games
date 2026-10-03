import {scene} from './art.mjs';
import {Simulation,capacity,DAY_LENGTH} from './simulation.mjs';
import {money,names} from './engine.mjs';
const $=s=>document.querySelector(s),game=new Simulation(),ctx=$('#scene').getContext('2d');let last=0,shownPhase='',audio,muted=true,effects=[];
function tone(freq,duration=.12){if(muted)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(.05,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}catch{/* Sound is optional; game remains playable. */}}
function recipe(){return ['lemons','sugar','ice'].map(id=>Number($('#'+id).value))}function order(){return [...document.querySelectorAll('.supply input')].map(el=>Number(el.value))}
function refreshCost(){const cost=order().reduce((s,n,i)=>s+n*game.conditions.prices[i],0);$('#cost').textContent=money(cost);$('#error').textContent=cost>game.state.cash?'Not enough cash':''}
function setup(){
 $('#setup-day').textContent=game.state.day;$('#forecast').textContent=`☀ ${game.conditions.temperature}°F`;
 $('#supplies').replaceChildren(...names.map((name,i)=>{const label=document.createElement('label');label.className='supply';const span=document.createElement('span');span.textContent=name+' ';const small=document.createElement('small');small.textContent=`${money(game.conditions.prices[i])} each · ${game.state.inventory[i]} left`;span.append(small);const input=document.createElement('input');Object.assign(input,{type:'number',min:'0',max:'1000',step:'1',value:game.state.day===1?'20':'10',required:true});input.setAttribute('aria-label',`Buy ${name.toLowerCase()}`);input.addEventListener('input',refreshCost);label.append(span,input);return label}));refreshCost();
}
$('#setup').addEventListener('submit',e=>{e.preventDefault();try{game.open(order(),recipe(),Math.round(Number($('#price').value)*100));effects=[];$('#scene').focus();tone(440)}catch(error){$('#error').textContent=error.message}});
function serve(){if(game.serve())tone(330)}$('#serve').addEventListener('click',serve);$('#scene').addEventListener('pointerdown',serve);
window.addEventListener('keydown',e=>{if(e.code==='Space'&&!/INPUT|BUTTON|TEXTAREA/.test(e.target.tagName)){e.preventDefault();if(!e.repeat)serve()}if(e.code==='Escape'&&game.phase==='playing')pause()});
function pause(){if(game.phase!=='playing')return;game.paused=!game.paused;$('#pause').textContent=game.paused?'Resume':'Pause';tone(220)}$('#pause').addEventListener('click',pause);
document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden&&game.phase==='playing'){game.paused=true;$('#pause').textContent='Resume'}});
$('#sound').addEventListener('click',()=>{muted=!muted;$('#sound').textContent=muted?'Sound off':'Sound on';$('#sound').setAttribute('aria-pressed',String(!muted));$('#sound').setAttribute('aria-label',muted?'Enable sound':'Mute sound');tone(523)});
$('#next').addEventListener('click',()=>{game.next();tone(440)});$('#restart').addEventListener('click',()=>{game.reset();effects=[];shownPhase=''});
function sync(){
 $('#day').textContent=game.state.day;$('#cash').textContent=money(game.state.cash);$('#cups').textContent=capacity(game.state.inventory,game.recipe);$('#weather').textContent=`☀ ${game.conditions.temperature}°F`;
 const seconds=Math.ceil(game.phase==='playing'?game.remaining:DAY_LENGTH);$('#clock').textContent=`${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
 $('#banner').textContent=game.paused?'Paused':game.message;
 $('#serve').disabled=game.phase!=='playing'||game.paused||!!game.making||game.queue[0]?.state!=='waiting'||!capacity(game.state.inventory,game.recipe);
 $('#pause').disabled=game.phase!=='playing';
 $('#progress').textContent=game.making?`Mixing… ${Math.min(100,Math.round(game.making.elapsed/game.making.duration*100))}%`:game.paused?'Press Resume to continue':'Click the stand or press Space';
 if(shownPhase!==game.phase){shownPhase=game.phase;$('#overlay').hidden=game.phase==='playing';$('#setup').hidden=game.phase!=='setup';$('#summary').hidden=game.phase!=='summary';$('#pause').textContent='Pause';
  if(game.phase==='setup')setup();
  if(game.phase==='summary'){
   const s=game.stats;$('#results').replaceChildren(...[['Cups sold',s.sold],['Sales revenue',money(s.revenue)],['Tips',money(s.tips)],['Supplies',money(s.cost)],['Net cash change',money(s.profit)],['Price rejected',s.rejected],['Walked away',s.impatient+s.missed]].map(([label,value])=>{const div=document.createElement('div');div.textContent=label;const strong=document.createElement('strong');strong.textContent=value;div.append(strong);return div}));tone(659,.3);$('#next').focus();
  }
 }
}
function frame(timestamp){const dt=last?Math.min((timestamp-last)/1000,.1):0;last=timestamp;game.tick(dt);
 for(const event of game.events||[]){effects.push({...event,life:1.3});tone(780,.16)}if(game.events)game.events.length=0;
 if(!game.paused)effects=effects.map(e=>({...e,life:e.life-dt})).filter(e=>e.life>0);
 scene(ctx,game.time,game.people,game.price,game.making?game.making.elapsed/game.making.duration:0);
 ctx.save();ctx.scale(2,2);ctx.font='bold 13px monospace';ctx.textAlign='center';for(const e of effects){ctx.globalAlpha=Math.min(1,e.life*2);ctx.fillStyle='#fff6c9';ctx.fillText('+'+money(e.price),e.x,e.y-50-(1.3-e.life)*24);if(e.tip){ctx.fillStyle='#ffe077';ctx.fillText('+'+money(e.tip)+' tip',e.x,e.y-35-(1.3-e.life)*24)}}ctx.restore();sync();requestAnimationFrame(frame)
}
requestAnimationFrame(frame);
