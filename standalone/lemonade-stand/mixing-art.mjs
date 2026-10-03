// Pixel art for the functional ingredient controls and the live mixing glass.
export function ingredientIcon(ctx,index,x=0,y=0,scale=1){
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 const r=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
 if(index===0){r(4,10,24,14,'#bc9232');r(7,6,18,22,'#ebbd3e');r(10,8,14,16,'#ffdf65');r(7,13,3,7,'#fff09e');r(23,4,6,4,'#4e8b4b');r(26,2,4,3,'#76a35b')}
 if(index===1){r(6,5,20,3,'#665744');r(8,8,16,20,'#c8d6ce');r(10,13,12,13,'#fff6df');r(9,9,3,15,'#e4eee3');r(8,27,16,3,'#8b998b');r(14,15,6,7,'#d9cbb4');r(15,16,4,4,'#fffef5')}
 if(index===2){r(3,8,26,21,'#6a989d');r(5,10,22,16,'#c5e6e6');r(7,6,9,10,'#6ca9c6');r(8,7,7,7,'#d5f3f0');r(18,3,10,11,'#72b4cd');r(19,4,8,8,'#d5f3f0');r(12,15,9,9,'#88c4d5');r(13,16,6,5,'#eafbf1');r(5,24,22,3,'#a8d5d1')}
 ctx.restore();
}
function glass(ctx,ingredients,time,mixing){
 const total=ingredients.reduce((a,b)=>a+b,0),top=176-Math.min(9,total)*8;
 ctx.fillStyle='#7d684033';ctx.beginPath();ctx.ellipse(160,211,46,9,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#e6efde';ctx.beginPath();ctx.moveTo(111,83);ctx.lineTo(209,83);ctx.lineTo(199,205);ctx.lineTo(122,205);ctx.closePath();ctx.fill();
 if(total){ctx.save();ctx.beginPath();ctx.moveTo(115,89);ctx.lineTo(205,89);ctx.lineTo(195,200);ctx.lineTo(126,200);ctx.closePath();ctx.clip();ctx.fillStyle=ingredients[0]>ingredients[1]?'#e7ba40':'#f0d76a';ctx.fillRect(111,top,100,122);
 for(let i=0;i<ingredients[0];i++){ctx.fillStyle='#ffe77e';ctx.beginPath();ctx.arc(137+i*17,170-(i%2)*20,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d4a43a';ctx.lineWidth=2;ctx.stroke()}
 for(let i=0;i<ingredients[1]*5;i++){ctx.fillStyle='#fff4bd';ctx.fillRect(132+(i*11)%50,top+9+(i*17)%Math.max(12,190-top),2,2)}
 for(let i=0;i<ingredients[2];i++){const dx=mixing?Math.sin(time*15+i)*4:0;ctx.fillStyle='#e8f8e6cc';ctx.fillRect(133+i*16+dx,top+10+(i%2)*14,14,13);ctx.strokeStyle='#fffef0';ctx.lineWidth=2;ctx.strokeRect(133+i*16+dx,top+10+(i%2)*14,14,13)}ctx.restore()}
 ctx.strokeStyle='#698271';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(111,83);ctx.lineTo(122,205);ctx.lineTo(199,205);ctx.lineTo(209,83);ctx.stroke();ctx.beginPath();ctx.ellipse(160,83,49,9,0,0,Math.PI*2);ctx.stroke();
 ctx.fillStyle='#ffffff66';ctx.fillRect(125,103,4,83);
 if(mixing){const dx=Math.sin(time*18)*17;ctx.strokeStyle='#876344';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(171+dx,52);ctx.lineTo(157+dx,190);ctx.stroke()}
}
export function mixingScene(ctx,drink,making,time,drops=[],delivery=null){
 ctx.clearRect(0,0,320,240);
 if(drink)glass(ctx,drink.ingredients,time,!!making);
 else{ctx.fillStyle='#a8835140';ctx.beginPath();ctx.ellipse(160,211,46,9,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#b0956b';ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.strokeRect(120,88,80,114);ctx.setLineDash([])}
 if(delivery){ctx.save();ctx.translate(delivery.age*300,-delivery.age*25);ctx.globalAlpha=Math.max(0,1-delivery.age/.7);glass(ctx,delivery.ingredients,time,false);ctx.restore()}
 for(const drop of drops){const t=Math.min(1,drop.age/.4),sx=drop.index===0?20:drop.index===1?144:264,x=sx+(144-sx)*t,y=5+95*t*t;ctx.save();ctx.globalAlpha=1-t;ingredientIcon(ctx,drop.index,x,y,.85);ctx.restore()}
}
