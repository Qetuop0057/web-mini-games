// Original pixel scenery. Preserve the stand footprint and the walkable road in
// every destination, so decoration cannot change queue geometry or collisions.
export function locationBackground(ctx,id,tile){
 const r=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
 const text=(label,x,y,color='#eee7cc',size=8)=>{ctx.fillStyle=color;ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillText(label,x,y)};
 const tree=(x,y)=>{tile(5,x,y,40);tile(2,x+30,y+28,24)};
 const bench=(x,y)=>{r(x,y,64,5,'#77513b');r(x,y+8,64,5,'#bf8d55');r(x+4,y+13,4,12,'#664d39');r(x+55,y+13,4,12,'#664d39')};
 const shop=(x,y,width,name,color)=>{r(x,y,width,130,color);r(x-3,y-5,width+6,7,'#4b565e');r(x+8,y+14,width-16,28,'#9dbec0');r(x+width/2,y+14,3,28,'#e5d9c4');r(x+6,y+68,width-12,58,'#547e89');r(x+width/2-11,y+73,22,53,'#3a5765');r(x+width/2-2,y+97,3,5,'#dfbe69');r(x+4,y+46,width-8,17,'#f4e3c4');text(name,x+width/2,y+58,'#4d5960');for(let i=0;i<width/10;i++)r(x+i*10,y+63,10,9,i%2?'#faf0d2':'#bf7460')};
 const stall=(x,y,width,color,label)=>{r(x+5,y+18,4,56,'#6d5548');r(x+width-9,y+18,4,56,'#6d5548');for(let i=0;i<width/10;i++){r(x+i*10,y,10,24,i%2?'#eddabb':color);r(x+i*10,y+24,10,5,i%2?'#cbb799':color)}r(x+4,y+59,width-8,8,'#bd8653');r(x+8,y+67,width-16,13,'#906341');r(x+12,y+52,12,7,'#e68b53');r(x+28,y+48,10,11,'#a9bf71');r(x+44,y+53,13,6,'#ecc661');text(label,x+width/2,y+77,'#ffe9b3',7)};
 if(id==='commercial'){
  r(0,0,480,300,'#9baaaa');
  for(let y=0;y<300;y+=16)for(let x=0;x<480;x+=32){r(x,y,31,15,(x+y)%64?'#aeb8b6':'#b9c2bd');r(x,y+14,32,1,'#849796')}
  shop(10,28,78,'CAFE','#d4b29b');shop(95,16,67,'BOOKS','#c2c8b0');shop(325,18,65,'OFFICE','#b6c3cf');shop(397,33,74,'BOUTIQUE','#d5c1b3');
  for(const x of [23,443]){r(x,172,27,13,'#586958');r(x+3,153,21,19,'#7b9c66');r(x+9,145,10,14,'#92ae73')}
  r(0,192,480,75,'#818b91');r(0,192,480,6,'#d8d8c9');r(0,261,480,6,'#d8d8c9');
  for(let x=0;x<480;x+=48)r(x+8,230,26,3,'#ddd0a5');
  for(const x of [80,382]){r(x,275,6,25,'#58636a');r(x-7,272,20,5,'#4e6067')}
 }else if(id==='night-market'){
  r(0,0,480,300,'#29354e');
  for(let y=0;y<300;y+=16)for(let x=0;x<480;x+=24)r(x,y,23,15,(x+y)%48?'#38445d':'#414d65');
  stall(10,80,70,'#b45a69','NOODLES');stall(91,95,67,'#677aab','FRUIT');stall(326,91,65,'#799067','SNACKS');stall(402,75,68,'#b07a45','TEA');
  r(0,192,480,75,'#53586b');r(0,192,480,5,'#727181');r(0,262,480,5,'#3d4259');
  for(let x=8;x<480;x+=32){r(x,214,18,2,'#626979');r(x+9,244,15,2,'#444c63')}
  for(const y of [22,47]){ctx.strokeStyle='#20273e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,y);ctx.quadraticCurveTo(240,y+20,480,y);ctx.stroke();for(let x=18;x<480;x+=38){const ly=y+Math.round(10*Math.sin(x/480*Math.PI));r(x,ly,2,6,'#b9ac8a');r(x-2,ly+6,6,8,(x+y)%3?'#ffe89c':'#e8a0a2');ctx.fillStyle='#ffdd7317';ctx.beginPath();ctx.arc(x+1,ly+10,15,0,Math.PI*2);ctx.fill()}}
  r(13,275,137,17,'#4a3549');text('NIGHT MARKET',82,287,'#efc885',9);
  for(const x of [330,430]){r(x,281,18,19,'#6d4e45');r(x-3,276,24,6,'#b78863')}
 }else{
  r(0,0,480,300,id==='park'?'#85b877':'#87bc73');for(let y=0;y<300;y+=24)for(let x=0;x<480;x+=24)tile((x+y)%72===0?1:0,x,y);
  if(id==='park'){
   r(18,36,121,56,'#bdd1a2');r(25,41,108,48,'#629aab');r(33,47,91,34,'#80bbc1');r(35,55,24,2,'#b8d5ca');r(89,68,22,2,'#b8d5ca');r(30,42,13,8,'#87aa65');r(118,73,10,8,'#87aa65');
   bench(28,143);bench(375,149);
   r(360,66,83,7,'#6b7f65');r(369,50,65,8,'#b5c2a0');r(378,41,47,9,'#718660');r(369,73,5,55,'#ded6b6');r(430,73,5,55,'#ded6b6');r(360,128,83,7,'#aaa184');r(377,90,52,6,'#95816b');
   for(const [x,y] of [[12,6],[111,9],[419,8],[323,97],[9,274],[428,274]])tree(x,y);
   for(const x of [105,344]){r(x,151,8,25,'#677849');r(x-5,141,18,12,'#d1d6a5');r(x-1,144,10,6,'#769665')}
   r(334,278,91,15,'#755e45');text('WILLOW PARK',379,289,'#f4e6b3',8);
  }else for(const [x,y] of [[24,16],[407,22],[65,78],[368,98],[24,275],[432,272]])tree(x,y);
  r(0,192,480,75,id==='park'?'#d0bd96':'#e9c397');r(0,192,480,5,'#f7d8aa');r(0,262,480,5,'#bf996e');
  for(let x=12;x<480;x+=36){r(x,212,18,2,'#bda77e');r(x+13,239,14,2,'#bda77e')}
 }
}
