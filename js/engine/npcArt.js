/** NPC 职业衣冠在大地图、战斗与头像保持一致。 */
window.NpcArt = {
  ids: new Set(['changan_scholar', 'changan_girl', 'baoxiang_king', 'baihuaxiu',
    'zhenyuanzi', 'taishang_laojun', 'tangtaizong', 'gaocuilan', 'xuanfeng_daoshi',
    'baigu_maiden', 'baigu_granny', 'baigu_oldman']),
  draw(ctx, id, by, time = 0, direction = 'down') {
    if (['baigu_maiden', 'baigu_granny', 'baigu_oldman'].includes(id)) {
      this.drawDisguise(ctx, id, by, time, direction); return;
    }
    if (['zhenyuanzi', 'taishang_laojun', 'tangtaizong', 'gaocuilan', 'xuanfeng_daoshi'].includes(id)) {
      this.drawNamedNpc(ctx, id, by, time, direction); return;
    }
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
  drawNamedNpc(ctx, id, by, time, direction) {
    ctx.save(); ctx.translate(0, by); if (direction === 'left') ctx.scale(-1, 1);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const emperor = id === 'tangtaizong', girl = id === 'gaocuilan';
    const laojun = id === 'taishang_laojun', hermit = id === 'xuanfeng_daoshi';
    const back = direction === 'up', sway = Math.sin(time * 0.12) * 0.7;
    const colors = emperor ? ['#bba26c', '#604c36', '#e9cf92'] : girl ? ['#a7b8a7', '#54756a', '#e0d5bc'] :
      laojun ? ['#d5c6a9', '#8b816e', '#d9ae6b'] : hermit ? ['#849a87', '#465f58', '#c9b987'] : ['#b5abc3', '#655979', '#d3c39a'];
    const oval = (x, y, rx, ry, color) => { ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); };
    const line = (points, color, width = 1) => { ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
    const path = (points, color) => { ctx.fillStyle = color; ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); };
    const robe = ctx.createLinearGradient(-11, -15, 12, 13); robe.addColorStop(0, colors[0]); robe.addColorStop(1, colors[1]);
    oval(-4, 13, 3.4, 1.6, '#33343c'); oval(4, 13, 3.4, 1.6, '#33343c');
    ctx.fillStyle = robe; ctx.beginPath(); ctx.moveTo(-6, -14); ctx.quadraticCurveTo(-10, -4, -12 + sway, 11);
    ctx.quadraticCurveTo(0, 16, 12 + sway, 11); ctx.quadraticCurveTo(10, -4, 6, -14); ctx.closePath(); ctx.fill();
    for (const side of [-1, 1]) {
      ctx.fillStyle = robe; ctx.beginPath(); ctx.moveTo(side * 5, -13); ctx.quadraticCurveTo(side * 12, -10, side * 15, 0);
      ctx.lineTo(side * 7, 3); ctx.lineTo(side * 5, -7); ctx.fill();
      line([[side * 7, 1], [side * 13, -1]], colors[2], 0.8);
      oval(side * 9, 0, 1.8, 1.5, '#d9b493');
      line([[side * 4, 2], [side * 6, 11]], colors[2], 0.65);
    }
    line([[-4, -13], [2, -5], [3, 11]], '#e8dfc8', 1.1);
    line([[-8, 0], [8, 0]], colors[2], 1.6); oval(0, 0, 1.6, 1.8, '#7e9b91');
    const skin = ctx.createRadialGradient(-2, -21, 1, 0, -20, 7);
    skin.addColorStop(0, '#efcfaa'); skin.addColorStop(1, '#be987c');
    oval(0, -20, 5.5, 6.8, skin); oval(-5.4, -20, 1.3, 2, '#cbaa8d'); oval(5.4, -20, 1.3, 2, '#cbaa8d');
    ctx.fillStyle = girl ? '#29343b' : '#d1ccbd'; ctx.beginPath(); ctx.arc(0, -23, 6, Math.PI, 0); ctx.fill();
    if (back) oval(0, -20, 5.8, 6.8, girl ? '#29343b' : '#d1ccbd');
    else {
      line([[-4, -22], [-1.4, -22.6]], girl ? '#5c4437' : '#e7e1d0', 0.9);
      line([[1.4, -22.6], [4, -22]], girl ? '#5c4437' : '#e7e1d0', 0.9);
      oval(-2.4, -20.5, 0.8, 0.6, '#38363a'); oval(2.4, -20.5, 0.8, 0.6, '#38363a');
      line([[0, -19], [0.5, -17.5]], '#ab846b', 0.6); line([[-1.8, -15.9], [0, -15.5], [1.8, -15.9]], '#9f7363', 0.6);
    }
    if (emperor) {
      ctx.fillStyle = '#33353c'; ctx.beginPath(); ctx.roundRect(-5.5, -30, 11, 7, 1.2); ctx.fill();
      line([[-5, -26], [-13, -27]], '#33353c', 2); line([[5, -26], [13, -27]], '#33353c', 2);
      line([[-4, -24], [4, -24]], colors[2], 0.8);
      if (!back) { path([[-3, -15], [0, -12], [3, -15], [2, -10], [0, -7], [-2, -10]], '#544234');
        // 常服以团龙纹和玉笏辨识，不套妖王的尖冠。
        oval(0, -7, 3.5, 3.8, '#8d723f'); line([[-2, -8], [0, -10], [2, -8], [0, -6], [-2, -8]], '#e2c68e', 0.8);
        path([[7, -1], [8, -13], [11, -13], [11, -1]], '#d7d5b5'); }
    } else if (girl) {
      oval(0, -27, 3.5, 3.2, '#29343b'); line([[-4, -27], [6, -27]], '#c9b385', 0.9);
      oval(6, -27, 1.5, 1.4, '#e7c4b3'); line([[5, -25], [6, -20]], '#c9b385', 0.6);
      if (!back) { ctx.strokeStyle = '#c4b79a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(6, 3, 4, 3, -0.2, 0, Math.PI * 2); ctx.stroke();
        line([[3, 2], [8, 4]], '#e3ceb5', 0.9); line([[-4, 4], [-6, 10]], '#d7c3a6', 0.8); }
    } else {
      path([[-5, -24], [-4, -32], [0, laojun ? -37 : -35], [4, -32], [5, -24]], laojun ? '#b19b6d' : hermit ? '#394e48' : '#665e79');
      line([[-4, -26], [4, -26]], colors[2], 0.8); oval(0, -30, 1.5, 2, laojun ? '#bc7754' : '#84a4a0');
      if (!back) { ctx.fillStyle = hermit ? '#8d9690' : '#e6dfc9'; ctx.beginPath(); ctx.moveTo(-3.5, -15);
        ctx.quadraticCurveTo(0, -10, 3.5, -15); ctx.quadraticCurveTo(4, -5, 0, laojun ? 0 : -3); ctx.quadraticCurveTo(-4, -5, -3.5, -15); ctx.fill();
        for (let i = -1; i <= 1; i++) line([[i * 1.5, -12], [i, -4]], '#b7b8a5', 0.5); }
      if (laojun) {
        // 炼丹者的八卦衣纹、葫芦，和镇元的拂尘明确分开。
        oval(-9, 5, 2, 2, '#b99456'); oval(-9, 8, 3, 3.2, '#bd9a5b');
        for (let i = 0; i < 4; i++) line([[-3 + i * 2, 5], [-3 + i * 2, 7]], '#d9cc9c', 0.8);
      } else if (hermit) {
        line([[13, 12], [12, -15]], '#8d7658', 1.6); path([[10, -15], [15, -15], [15, -5], [10, -6]], '#d2c09a');
        line([[11, -12], [14, -11], [11, -8]], '#786554', 0.6);
      } else {
        line([[9, -1], [13, -17]], '#9b8060', 1.5);
        for (let i = 0; i < 5; i++) { ctx.strokeStyle = '#e3dfcf'; ctx.lineWidth = 0.8; ctx.beginPath();
          ctx.moveTo(13, -17); ctx.quadraticCurveTo(18 + i * 0.5, -10, 13 + i * 1.3 + sway, -2); ctx.stroke(); }
        line([[-5, 5], [-2, 7], [-5, 9]], '#ccbea6', 0.7);
      }
    }
    ctx.restore();
  },
  drawDisguise(ctx, id, by, time, direction) {
    ctx.save(); ctx.translate(0, by); if (direction === 'left') ctx.scale(-1, 1);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const maiden = id === 'baigu_maiden', granny = id === 'baigu_granny', back = direction === 'up';
    const sway = Math.sin(time * 0.12) * 0.5, faceY = maiden ? -19 : -16;
    const oval = (x,y,rx,ry,color) => {ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
    const line = (points,color,width=1) => {ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
    const shape = (points,color) => {ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();};
    const robe=ctx.createLinearGradient(-8,-10,10,12);
    robe.addColorStop(0,maiden?'#c2a487':granny?'#b2a391':'#a5aaa0');
    robe.addColorStop(1,maiden?'#725f65':granny?'#736652':'#606d65');
    oval(-4,13,3,1.4,'#363b3b');oval(4,13,3,1.4,'#363b3b');
    ctx.fillStyle=robe;ctx.beginPath();ctx.moveTo(-6,-11);ctx.quadraticCurveTo(-9,0,-11+sway,11);
    ctx.quadraticCurveTo(0,14,11+sway,11);ctx.quadraticCurveTo(9,0,6,-11);ctx.closePath();ctx.fill();
    if(maiden){shape([[-5,-1],[5,-1],[8,11],[-8,11]],'#637f83');line([[-3,1],[-4,10]],'#a3b3ae',0.7);}
    else{shape([[-5,-10],[-8,0],[-7,5],[0,2],[7,5],[8,0],[5,-10]],granny?'#827468':'#7a8176');}
    line([[-3,-10],[2,-5],[4,-10]],'#d7ccb8',1.1);line([[-7,0],[7,0]],'#a69b7f',1.5);
    for(const side of [-1,1]){
      line([[side*6,-9],[side*10,-2],[side*8,2]],maiden?'#a58c79':granny?'#988a78':'#889287',4);
      oval(side*8,2,1.7,1.5,'#d0ae91');
    }
    oval(0,faceY,maiden?5.3:5.6,maiden?6.5:6,'#dbb899');
    const hair=maiden?'#31343c':'#c3c1b2';
    ctx.fillStyle=hair;ctx.beginPath();ctx.arc(0,faceY-3,6,Math.PI,0);ctx.fill();
    if(back)oval(0,faceY,5.8,6.2,hair);
    else{
      line([[-4,faceY-2],[-1.5,faceY-2.5]],'#6b6052',0.7);line([[1.5,faceY-2.5],[4,faceY-2]],'#6b6052',0.7);
      oval(-2.3,faceY,0.75,0.55,'#3d3936');oval(2.3,faceY,0.75,0.55,'#3d3936');
      line([[-1.8,faceY+3],[1.5,faceY+3]],'#a47b6a',0.6);
      if(!maiden){line([[-5,faceY],[-4,faceY+2]],'#ad8e76',0.5);line([[4,faceY+2],[5,faceY]],'#ad8e76',0.5);}
    }
    if(maiden){
      // 麻布头巾、双辫、饭篮；不提前披露白骨妖的法冠与妖纹。
      shape([[-6,-22],[-4,-28],[4,-28],[6,-22]],'#a7b7ac');line([[-4,-25],[4,-25]],'#d2d7be',0.7);
      for(const side of [-1,1]){line([[side*5,-20],[side*6,-13],[side*5,-10]],hair,2);line([[side*5,-11],[side*7,-11]],'#9b7667',1);}
    }else if(granny){
      oval(-2,-24,3.5,2.7,'#c3c1b2');shape([[-6,-20],[-5,-26],[4,-25],[6,-20]],'#bcb8a4');
      line([[-5,-22],[4,-22]],'#ded5bd',1);line([[4,-23],[7,-17]],'#bcb8a4',1.6);
    }else{
      shape([[-6,-20],[-6,-25],[5,-25],[6,-20]],'#737e76');line([[-5,-22],[5,-22]],'#bcbba6',1);
      if(!back){shape([[-3,faceY+3],[0,faceY+8],[3,faceY+3],[2,faceY+10],[0,faceY+13],[-2,faceY+10]],'#c9c7b8');}
      // 木杖以削平杖头和竹节辨识，不借土地公的神杖。
      line([[13,13],[12,-19],[10,-22]],'#867053',1.8);
      for(let y=-13;y<12;y+=7)line([[11,y],[13,y]],'#b6a17b',0.6);
    }
    if(maiden||granny){
      ctx.strokeStyle='#b19a72';ctx.lineWidth=1;ctx.beginPath();ctx.arc(-10,3,4.2,Math.PI,0);ctx.stroke();
      shape([[-15,3],[-5,3],[-6,9],[-14,9]],'#a18c66');line([[-15,3],[-5,3]],'#e0c99c',1);
      for(let y=5;y<9;y+=2)line([[-14,y],[-6,y]],'#cfb58a',0.6);
      // 两张画皮共用结绳，呼应第二次识破的线索。
      line([[-11,1],[-10,3],[-8,1],[-10,2],[-11,-1]],'#996b5b',0.8);
    }
    ctx.restore();
  },
  portrait(ctx,id,cx,cy,r){ctx.save();ctx.translate(cx,cy+19*r/30);ctx.scale(1.4*r/30,1.4*r/30);this.draw(ctx,id,0);ctx.restore();}
};
