const town=new Image();town.src='assets/town.png';
const sprites=Object.fromEntries(['down','side','up'].map(d=>{const i=new Image();i.src=`assets/walk-${d}.png`;return[d,i]}));
export function scene(ctx,time,people=[],price=150,serveProgress=0,conditions=null){
 ctx.save();ctx.scale(2,2);ctx.imageSmoothingEnabled=false;
 const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
 const tile=(n,x,y,size=24)=>{if(town.complete&&town.naturalWidth)ctx.drawImage(town,(n%12)*16,Math.floor(n/12)*16,16,16,x,y,size,size)};
 // Tile coordinates below are verified against the downloaded Kenney atlas.
 rect(0,0,480,300,'#87bc73');for(let y=0;y<300;y+=24)for(let x=0;x<480;x+=24)tile((x+y)%72===0?1:0,x,y);
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
 if(im.complete&&im.naturalWidth){ctx.save();ctx.translate(Math.round(p.x),Math.round(p.y));if(p.flip)ctx.scale(-1,1);ctx.filter=`hue-rotate(${p.tint||0}deg)`;ctx.drawImage(im,frame*w,0,w,h,-w, -h*2,w*2,h*2);ctx.restore()}
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
