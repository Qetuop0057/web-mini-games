const town=new Image();town.src='assets/town.png';
const sprites=Object.fromEntries(['down','side','up'].map(d=>{
 const image=new Image();
 image.onload=()=>{
  // Extracted GIF frames have a solid RGB(104,169,245) backdrop.
  // Key only that exact palette color once on load, preserving every animation pixel.
  const canvas=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(image.width,image.height):document.createElement('canvas');
  canvas.width=image.width;canvas.height=image.height;
  const context=canvas.getContext('2d');context.drawImage(image,0,0);
  const pixels=context.getImageData(0,0,canvas.width,canvas.height);
  for(let p=0;p<pixels.data.length;p+=4)if(pixels.data[p]===104&&pixels.data[p+1]===169&&pixels.data[p+2]===245)pixels.data[p+3]=0;
  context.putImageData(pixels,0,0);image.transparentSprite=canvas;
 };
 image.src=`assets/walk-${d}.png`;return[d,image];
}));
export function scene(ctx,time,people=[],price=150,serveProgress=0,conditions=null,location='lemon-lane'){
 ctx.save();ctx.scale(2,2);ctx.imageSmoothingEnabled=false;
 const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
 const tile=(n,x,y,size=24)=>{if(town.complete&&town.naturalWidth)ctx.drawImage(town,(n%12)*16,Math.floor(n/12)*16,16,16,x,y,size,size)};
 // Tile coordinates below are verified against the downloaded Kenney atlas.
 rect(0,0,480,300,'#87bc73');for(let y=0;y<300;y+=24)for(let x=0;x<480;x+=24)tile((x+y)%72===0?1:0,x,y);
 if(location==='park'){
  for(const x of [28,376]){rect(x,134,66,5,'#85613e');rect(x,144,66,6,'#b48752');rect(x+5,149,5,13,'#715940');rect(x+55,149,5,13,'#715940')}
 }else if(location==='commercial'){
  for(const x of [12,380]){rect(x,25,86,135,'#a29a8b');rect(x+5,20,76,8,'#737c76');for(let y=38;y<130;y+=25)for(let dx=10;dx<75;dx+=24)rect(x+dx,y,15,16,'#c9ded8');rect(x+32,132,24,28,'#566b67')}
 }else if(location==='night-market'){
  for(const x of [16,378]){rect(x,106,80,8,'#9a785b');for(let i=0;i<8;i++)rect(x+i*10,85,10,21,i%2?'#cdb49e':'#9673a5');rect(x+5,114,4,43,'#765539');rect(x+70,114,4,43,'#765539');rect(x+4,148,72,16,'#ae8358')}
 }
 rect(0,192,480,75,'#e9c397');rect(0,192,480,5,'#f7d8aa');rect(0,262,480,5,'#bf996e');
 for(let x=12;x<480;x+=36){rect(x,212,18,2,'#d9b180');rect(x+13,239,14,2,'#d9b180')}
 for(const [x,y] of [[24,16],[407,22],[65,78],[368,98],[24,275],[432,272]]){tile(5,x,y,40);tile(2,x+35,y+10,24)}
 // Original stand artwork, drawn at integer coordinates in world space.
 rect(171,160,143,12,'#66965a');rect(187,92,6,68,'#734e36');rect(287,92,6,68,'#734e36');
 rect(176,55,128,7,'#785b3c');for(let i=0;i<8;i++){rect(176+i*16,62,16,35,i%2?'#fff5cd':'#f5c641');rect(176+i*16,97,16,8,i%2?'#e5dab6':'#dda92e')}
 rect(195,42,89,17,'#fff6dc');ctx.fillStyle='#694f33';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText('LEMONADE',240,54);
 person(ctx,{x:240,y:141,dir:'down',moving:false,tint:0},time);
 rect(185,139,111,7,'#a56c42');rect(190,146,101,26,'#ca9157');for(let x=197;x<291;x+=17)rect(x,148,2,22,'#b47b48');rect(185,170,111,5,'#805a3a');
 rect(217,141,48,22,'#fff2c9');ctx.font='bold 12px monospace';ctx.fillStyle='#72562c';ctx.fillText(`$${(price/100).toFixed(2)}`,241,157);
 // Lemon basket and pitcher.
 rect(199,130,15,9,'#9b673a');rect(201,126,5,5,'#ffd44d');rect(207,124,5,6,'#fbe476');rect(280,123,9,14,'#fff6d9');rect(281,128,7,8,'#f5cb45');rect(289,124,3,7,'#fff6d9');
 for(let i=0;i<4;i++){ctx.strokeStyle='#d2ad80';ctx.setLineDash([2,4]);ctx.strokeRect(227,181+i*26,26,23);ctx.setLineDash([])}
 people.slice().sort((a,b)=>a.y-b.y).forEach(p=>person(ctx,p,time));
 if(serveProgress>0){rect(191,111,99,7,'#5a6947');rect(193,113,95*serveProgress,3,'#ffe077')}
 if(location==='night-market'){
  rect(0,0,480,300,'#24345766');for(const x of [42,438]){rect(x,142,3,45,'#596052');rect(x-5,133,13,12,'#ffe6a0');ctx.fillStyle='#ffdc7340';ctx.beginPath();ctx.arc(x+1,138,27,0,Math.PI*2);ctx.fill()}
 }
 if(conditions?.id==='cloudy'||conditions?.id==='rainy'){
  rect(0,0,480,300,conditions.id==='rainy'?'#344a6e38':'#67778a1c');
 }
 if(conditions?.id==='rainy'){
  ctx.strokeStyle='#d5e5ed99';ctx.lineWidth=1;
  for(let i=0;i<55;i++){const x=(i*83+time*30)%500-10,y=(i*47+time*145)%320-10;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-3,y+8);ctx.stroke()}
 }else if(conditions?.id==='heatwave'){
  rect(0,0,480,300,'#ffd77919');
 }
 ctx.restore();
}
export function person(ctx,p,time){const d=p.dir||'down',im=sprites[d],w=d==='side'?10:12,h=15,frame=p.moving?Math.floor(time*8)%4:0;
 ctx.fillStyle='#45634144';ctx.beginPath();ctx.ellipse(p.x,p.y-1,10,3,0,0,Math.PI*2);ctx.fill();
 if(im.complete&&im.naturalWidth){ctx.save();ctx.translate(Math.round(p.x),Math.round(p.y));if(p.flip)ctx.scale(-1,1);ctx.filter=`hue-rotate(${p.tint||0}deg)`;ctx.drawImage(im.transparentSprite||im,frame*w,0,w,h,-w, -h*2,w*2,h*2);ctx.restore()}
 if(p.umbrella)umbrella(ctx,p,time);
 if(p.bubble){ctx.font='bold 10px monospace';const bx=p.x+(p.umbrella?28:14),by=p.y-46,width=p.feedback?Math.max(66,ctx.measureText(p.feedback).width+30):28;
  ctx.fillStyle='#fff9e8';ctx.fillRect(bx,by,width,19);ctx.fillRect(bx-4,by+13,4,4);
  const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  if(p.bubble==='taste-sour'){
   rect(bx+8,by+7,12,7,'#f5cb42');rect(bx+10,by+5,8,11,'#ffe276');rect(bx+18,by+3,5,3,'#6b9955');
  }else if(p.bubble==='taste-sweet'){
   rect(bx+9,by+5,11,11,'#decfc4');rect(bx+8,by+4,10,10,'#fffef5');rect(bx+8,by+4,10,2,'#c6b6a8');
  }else if(p.bubble==='taste-cool'){
   rect(bx+8,by+4,12,12,'#75b8d1');rect(bx+10,by+5,8,9,'#ccebf0');rect(bx+11,by+6,3,2,'#fffef5');
  }else if(p.bubble==='cup'){rect(bx+10,by+4,9,12,'#b9cdbd');rect(bx+11,by+8,7,7,'#f5ce48');rect(bx+16,by+1,2,6,'#638349')}
  else{ctx.fillStyle=p.rating==='unhappy'?'#b06948':p.bubble==='♥'?'#bd5c51':'#5c6b49';ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.fillText(p.bubble,bx+14,by+14);
   if(p.feedback){ctx.font='bold 10px monospace';ctx.textAlign='left';ctx.fillText(p.feedback,bx+27,by+13)}}}
 if(p.patience!==undefined&&p.state==='waiting'){const offset=p.umbrella?28:14;ctx.fillStyle='#795c43';ctx.fillRect(p.x+offset,p.y-51,28,3);ctx.fillStyle=p.patience<4?'#d76e50':'#e4bb3f';ctx.fillRect(p.x+offset,p.y-51,28*p.patience/p.maxPatience,3)}
}

// Original pixel canopy; drawn with its owner, so depth ordering and pauses stay consistent.
function umbrella(ctx,p,time){
 const x=Math.round(p.x),y=Math.round(p.y)-35+(p.moving?Math.round(Math.sin(time*8+p.id)):0);
 const colors=[['#c86456','#ec9c83'],['#5e85ab','#91b8d0'],['#8d76ab','#bba0cf']];
 const [dark,light]=colors[(p.id-1)%colors.length];
 const rect=(dx,dy,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x+dx,y+dy,w,h)};
 rect(5,8,2,18,'#594f47');rect(1,24,5,2,'#594f47');
 rect(-8,-7,16,3,'#495449');rect(-16,-4,32,4,'#495449');rect(-20,0,40,4,'#495449');rect(-22,4,44,7,'#495449');
 rect(-7,-5,14,3,light);rect(-15,-2,30,4,light);rect(-19,2,38,4,dark);rect(-20,6,40,3,dark);
 rect(-7,0,14,8,light);rect(-1,-8,2,3,'#495449');rect(-17,9,7,2,light);rect(-4,9,8,2,light);rect(10,9,7,2,light);
}

export function homeScene(ctx,time,conditions,day=1){
 ctx.save();ctx.scale(2,2);ctx.imageSmoothingEnabled=false;
 const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
 const tile=(n,x,y,size=24)=>{if(town.complete&&town.naturalWidth)ctx.drawImage(town,(n%12)*16,Math.floor(n/12)*16,16,16,x,y,size,size)};
 rect(0,0,480,300,'#87bc73');for(let y=0;y<300;y+=24)for(let x=0;x<480;x+=24)tile((x+y)%72===0?1:0,x,y);
 for(const [x,y] of [[20,36],[430,26],[25,228],[416,263]]){tile(5,x,y,38);tile(2,x+28,y+27)}
 // Front path joins the player's house to the enclosed yard on its right.
 rect(131,157,37,143,'#e4bf92');rect(164,183,198,25,'#e4bf92');rect(0,260,480,26,'#e4bf92');
 ctx.save();ctx.translate(0,-42);
 rect(72,203,174,13,'#659257');rect(77,112,164,95,'#ead9a6');
 rect(77,195,164,12,'#b59b76');rect(77,112,164,7,'#a68763');
 // Stepped terracotta roof and a chimney.
 rect(204,64,16,37,'#87674e');rect(201,61,22,6,'#a98566');
 for(let i=0;i<10;i++){const x=66+i*8,y=112-i*5,w=186-i*16;rect(x,y,w,6,i%2?'#ad644e':'#bd7454')}
 rect(65,114,188,5,'#715840');
 for(const x of [95,189]){
  rect(x-3,134,34,38,'#ab7e53');
  if(x===95){
   // The TV sits inside the dark room; glass and the window frame cover it.
   rect(x,137,28,29,'#454d48');rect(x+2,139,24,26,'#62645a');
   ctx.strokeStyle='#514c42';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+12,149);ctx.lineTo(x+7,143);ctx.moveTo(x+14,149);ctx.lineTo(x+20,142);ctx.stroke();
   rect(x+3,149,23,16,'#755f49');rect(x+5,151,15,11,'#7baca5');rect(x+6,152,13,1,'#a7c9b7');rect(x+22,152,2,2,'#c4b48d');rect(x+22,157,2,4,'#514b40');
   // Curtains and reflections keep the television behind the house facade.
   rect(x,137,3,29,'#6e7f6d');rect(x+25,137,3,29,'#6e7f6d');rect(x,137,28,29,'#a9c9d222');rect(x+4,140,7,2,'#c4d8d04d');rect(x+4,142,2,4,'#c4d8d04d');
  }else{
   rect(x,137,28,29,'#5d8b9c');rect(x+3,140,10,10,'#b2d3d3');rect(x+15,140,10,10,'#b2d3d3');
  }
  rect(x+13,137,3,29,'#dfc494');rect(x,151,28,3,'#dfc494');rect(x,166,28,3,'#dfc494');rect(x-5,170,38,5,'#8f7555');
 }
 rect(133,153,31,54,'#795c41');rect(137,157,23,45,'#aa7c4b');rect(153,181,3,3,'#f2d382');rect(129,206,39,6,'#c4b595');
 person(ctx,{x:151,y:236,dir:'down',moving:false,tint:0},time);
 // Yard fence, with an opening facing the house path.
 for(const y of [126,247]){
  rect(279,y+7,171,3,'#d7bf8a');rect(279,y+16,171,3,'#d7bf8a');
  for(let x=279;x<=447;x+=14){rect(x,y,5,24,'#efdbab');rect(x+1,y-2,3,2,'#efdbab')}
 }
 rect(330,246,29,27,'#e4bf92');
 for(const x of [279,447])for(let y=143;y<247;y+=20){rect(x,y,5,25,'#efdbab');rect(x,y+9,7,3,'#d7bf8a')}
 rect(310,211,107,8,'#659257');rect(319,164,4,44,'#755039');rect(402,164,4,44,'#755039');
 for(let i=0;i<9;i++){rect(311+i*11,143,11,21,i%2?'#fff4ce':'#f5cb43');rect(311+i*11,164,11,5,i%2?'#e3d5b2':'#dcb033')}
 rect(320,193,86,5,'#986842');rect(324,198,78,18,'#c99459');rect(337,201,52,11,'#fff2cf');
 ctx.fillStyle='#725637';ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.fillText('LEMONADE',363,210);
 rect(419,208,17,17,'#a2764b');rect(422,212,11,2,'#755339');rect(422,218,11,2,'#755339');
 ctx.restore();
 // Open recipe book above the stored stand. Native hotspot provides keyboard/touch access.
 rect(342,74,48,4,'#659257');
 rect(342,43,22,31,'#735b42');rect(364,40,24,34,'#735b42');rect(346,46,17,24,'#fff0c8');rect(367,43,17,27,'#fff6db');
 rect(363,45,3,29,'#bd9f70');rect(347,50,12,2,'#cdb68c');rect(347,55,10,2,'#cdb68c');rect(347,60,12,2,'#cdb68c');
 rect(372,49,8,8,'#f0ca44');rect(378,46,5,3,'#69945a');rect(373,62,9,2,'#cdb68c');rect(380,67,3,11,'#b76e56');
 rect(344,50,42,15,'#fff6db');ctx.fillStyle='#493d2b';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText('Recipe',365,62);
 // A day marker stands to the left of the house, away from its doorway.
 rect(32,125,6,43,'#765539');rect(14,104,46,27,'#72543a');rect(17,107,40,21,'#d3a970');
 ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillStyle='#493d2b';ctx.fillText(`DAY ${day}`,37,122);
 // Wooden direction sign at the lower crossroads. Its native hotspot is in app.mjs.
 rect(213,252,6,33,'#765539');rect(179,235,68,23,'#765539');rect(182,238,63,17,'#d3a970');
 ctx.fillStyle='#493d2b';ctx.font='bold 12px monospace';ctx.fillText('MAP →',214,251);
 if(conditions.id==='rainy'||conditions.id==='cloudy')rect(0,0,480,300,conditions.id==='rainy'?'#344a6e38':'#67778a1c');
 if(conditions.id==='rainy'){
  ctx.strokeStyle='#d5e5ed99';ctx.lineWidth=1;
  for(let i=0;i<55;i++){const x=(i*83+time*30)%500-10,y=(i*47+time*145)%320-10;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-3,y+8);ctx.stroke()}
 }else if(conditions.id==='heatwave')rect(0,0,480,300,'#ffd77919');
 ctx.restore();
}

const marketStalls=['red','blue'].map(color=>{const image=new Image();image.src=`assets/market-${color}.png`;return image});
// LPC Bazaar artwork and this market-background arrangement: CC BY-SA 3.0.
// Original authors, source links and the full license are included in assets/.
export function marketScene(ctx){
 ctx.save();ctx.scale(2,2);ctx.imageSmoothingEnabled=false;
 const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
 const tile=(n,x,y,size=24)=>{if(town.complete&&town.naturalWidth)ctx.drawImage(town,(n%12)*16,Math.floor(n/12)*16,16,16,x,y,size,size)};
 rect(0,0,480,300,'#9ba7a0');
 for(let y=0;y<300;y+=24)for(let x=0;x<480;x+=24)tile(126,x,y);
 // A green edge borders the paved market square.
 for(let x=0;x<480;x+=24){tile(0,x,0);tile(0,x,276)}
 for(const x of [14,432]){tile(5,x,8,34);tile(5,x,240,34)}
 // Two static stalls, each with a clickable hotspot in app.mjs.
 for(const [x,color] of [[34,0],[190,1]]){
  const image=marketStalls[color];rect(x+3,211,108,11,'#34443e38');
  if(image.complete&&image.naturalWidth)ctx.drawImage(image,0,0,56,96,x,30,112,192);
  // Replace the generic shelf contents with this stall's actual goods.
  rect(x+7,166,98,34,'#64482e');rect(x+8,198,96,4,'#ad8152');
 }
 // Fruit crates: lemons, watermelon, strawberries and oranges.
 const fruitX=44;
 for(let i=0;i<4;i++){const x=fruitX+i*23;rect(x,173,21,23,'#b78c53');rect(x+2,175,17,17,'#6d5436')}
 rect(47,179,13,7,'#f5c743');rect(50,176,8,13,'#ffdf65');rect(56,175,4,3,'#73a159');
 rect(70,177,15,14,'#507e40');rect(72,178,2,11,'#a0bf64');rect(78,178,2,11,'#a0bf64');rect(73,176,8,1,'#71944b');
 rect(92,179,13,5,'#d45848');rect(94,184,9,5,'#dd6855');rect(97,189,3,2,'#dd6855');rect(94,176,9,4,'#6c994f');rect(96,182,2,2,'#f6d29c');rect(101,185,2,2,'#f6d29c');
 rect(118,178,12,13,'#eb963b');rect(116,181,16,7,'#eb963b');rect(119,180,3,3,'#ffc06b');rect(124,175,5,3,'#6c994f');
 // Dry goods: sugar sacks, milk bottles, an ice box and a stack of cups.
 rect(200,175,18,22,'#e9d6a6');rect(203,171,12,6,'#b8aa80');rect(204,181,10,7,'#fff7df');
 rect(226,174,13,22,'#d9e8dd');rect(229,168,7,6,'#7795a3');rect(228,184,9,8,'#83a3b3');
 rect(245,182,24,15,'#7da7b1');rect(247,179,20,6,'#c8e9e7');rect(250,176,7,8,'#e4f8ed');rect(260,176,6,7,'#c6e6ef');
 rect(279,176,12,20,'#f4ebd3');for(let y=177;y<197;y+=4)rect(278,y,14,2,'#d5caad');
 // Vending machine entrance; transactions are deliberately not enabled yet.
 rect(362,211,70,11,'#34443e38');rect(363,86,65,129,'#665342');rect(367,90,57,121,'#ba6f55');rect(370,95,39,78,'#455653');rect(374,99,31,69,'#85a5a0');
 for(const y of [106,133])for(const x of [378,391]){rect(x,y,8,17,'#e8d8a4');rect(x,y+5,8,6,x===378?'#d98954':'#80a8bd');rect(x+1,y,6,2,'#fff3d1')}
 rect(414,106,6,18,'#e1c18c');rect(415,110,4,2,'#6e5944');rect(415,116,4,2,'#6e5944');rect(415,128,4,13,'#544b42');rect(374,181,41,20,'#594d43');rect(378,184,33,9,'#352f2b');
 // Wood signs label the destinations without extra people or motion.
 for(const [x,w,label] of [[34,112,'FRUIT'],[190,112,'DRY GOODS'],[357,78,'VENDING']]){
  rect(x,235,w,23,'#755539');rect(x+3,238,w-6,17,'#dfb57e');ctx.fillStyle='#493c2d';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText(label,x+w/2,250);
 }
 ctx.restore();
}
