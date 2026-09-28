/** NPC 职业衣冠在大地图、战斗与头像保持一致。 */
window.NpcArt = {
  ids: new Set(['changan_scholar', 'changan_girl', 'baoxiang_king', 'baihuaxiu']),
  draw(ctx, id, by, time = 0, direction = 'down') {
    ctx.save();ctx.translate(0,by);if(direction==='left')ctx.scale(-1,1);
    const king=id==='baoxiang_king',princess=id==='baihuaxiu',scholar=id==='changan_scholar',girl=!king&&!scholar,sway=Math.sin(time*0.13)*0.6;
    const oval=(x,y,rx,ry,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
    const line=(points,color,width=1)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
    const shape=(points,color)=>{ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();};
    const g=ctx.createLinearGradient(-10,-10,10,12);g.addColorStop(0,king?'#d2ae78':princess?'#c68d9f':scholar?'#7faaa6':'#688ca0');g.addColorStop(1,king?'#765651':princess?'#705b81':scholar?'#365561':'#354f71');
    oval(-3,12,3,1.5,'#33333d');oval(3,12,3,1.5,'#33333d');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-6,-10);ctx.quadraticCurveTo(-9,1,-11+sway,10);ctx.quadraticCurveTo(0,14,11+sway,10);ctx.quadraticCurveTo(9,1,6,-10);ctx.closePath();ctx.fill();
    if(girl){shape([[-5,-1],[5,-1],[8,10],[-8,10]],princess?'#a58eae':'#b190a0');line([[-3,1],[-4,10]],'#d8bfc3',0.6);line([[3,1],[4,10]],'#725e82',0.6);}
    line([[-4,-10],[1,-4],[5,-10]],'#e0d5bd',1.2);line([[-7,0],[7,0]],king?'#c3a16c':princess?'#d6bd93':'#b9b89e',2);
    for(const side of [-1,1]){line([[side*6,-7],[side*10,-1],[side*5,2]],king?'#a38463':princess?'#9a7999':scholar?'#547b82':'#52728b',4);oval(side*5,2,1.6,1.4,'#e0bba0');}
    oval(0,-16,5.4,6.5,king?'#cfac8a':'#edcab0');ctx.fillStyle='#30303b';ctx.beginPath();ctx.arc(0,-19,6,Math.PI,0);ctx.fill();
    line([[-3.8,-18],[-1.4,-18.6]],'#554239',0.7);line([[1.4,-18.6],[3.8,-18]],'#554239',0.7);oval(-2.4,-16.7,1,0.6,'#33333c');oval(2.4,-16.7,1,0.6,'#33333c');line([[-1.7,-12.5],[1.7,-12.5]],'#af7a73',0.6);
    if(king){
      shape([[-6,-20],[-7,-29],[-3,-25],[0,-31],[3,-25],[7,-29],[6,-20]],'#cbb078');line([[-6,-21],[6,-21]],'#f0d5a0',1.2);oval(0,-24,1.7,2,'#477d83');
      shape([[-4,-13],[0,-9],[4,-13],[3,-8],[0,-5],[-3,-8]],'#615047');for(let i=0;i<3;i++)line([[-5,3+i*2],[5,3+i*2]],'#cdb17e',0.6);line([[10,10],[10,-8]],'#ac9365',1.8);oval(10,-9,2.7,2.7,'#cbbd85');
    }else if(scholar){
      shape([[-6,-20],[-5,-28],[4,-28],[6,-20]],'#345561');line([[-4,-24],[4,-24]],'#a2b5ac',0.8);shape([[-4,0],[4,-1],[5,5],[-3,6]],'#d2c7a3');line([[0,0],[1,5]],'#81765f',0.7);line([[10,3],[10,-5]],'#b3966b',1);shape([[10,-5],[6,-12],[16,-12]],'#dcd3b9');
    }else{
      oval(0,-24,3.5,4,'#30303b');line([[-3,-25],[7,-25]],'#d1b179',1);oval(6,-24,1.3,1.3,princess?'#d3b483':'#bca8c4');line([[5,-23],[6,-19]],'#d1b179',0.6);oval(6,-19,0.7,0.9,'#e9d5ad');
      if(princess){ctx.strokeStyle='#d1b4b8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-7,-7);ctx.bezierCurveTo(-17,-2,-10,5,-13+sway,9);ctx.moveTo(7,-7);ctx.bezierCurveTo(17,-2,10,5,13+sway,9);ctx.stroke();for(let i=0;i<5;i++){const a=i*Math.PI*2/5;oval(Math.cos(a)*1.8,4+Math.sin(a)*1.8,1,1,'#dfcdb0');}}
      else{ctx.strokeStyle='#9e886b';ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(-1,3,4.5,3,0,0,Math.PI*2);ctx.stroke();line([[-3,3],[2,3]],'#d6c1bb',1.8);line([[4,1],[8,-3]],'#d9d9cd',0.6);line([[8,-3],[10,-1],[6,4]],'#b596a4',0.5);}
    }
    ctx.restore();
  },
  portrait(ctx,id,cx,cy,r){ctx.save();ctx.translate(cx,cy+19*r/30);ctx.scale(1.4*r/30,1.4*r/30);this.draw(ctx,id,0);ctx.restore();}
};
