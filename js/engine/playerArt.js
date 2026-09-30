/** 玩家统一造型：步行、骑乘与头像共享衣冠与配色。 */
window.PlayerArt = {
  draw(ctx, by, time, direction, moving, heaven = false, mounted = false) {
    ctx.save(); ctx.translate(0, by); if(direction === 'left') ctx.scale(-1,1);
    ctx.lineCap='round';ctx.lineJoin='round';
    const back=direction==='up', step=moving?Math.sin(time*0.32)*2:0, wind=Math.sin(time*0.13)*1.3;
    const metal=heaven?'#e0bf76':'#c7b78a', deep=heaven?'#30364b':'#1f3541', cloth=heaven?'#742f3c':'#315d65';
    const line=(points,color,width=1)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
    const shape=(points,color)=>{ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();};
    const oval=(x,y,rx,ry,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
    const gradient=(a,b)=>{const g=ctx.createLinearGradient(-9,-14,10,13);g.addColorStop(0,a);g.addColorStop(0.55,b);g.addColorStop(1,deep);return g;};
    // 身后衣摆与剑鞘，色块收敛，避免大红披风盖住整个身体。
    ctx.fillStyle=gradient(heaven?'#b44d53':'#6a9894',cloth);ctx.beginPath();ctx.moveTo(-7,-13);ctx.lineTo(5,-13);
    ctx.bezierCurveTo(8,0,8+wind,7,11+wind,11);ctx.quadraticCurveTo(0,15,-11+wind,10);ctx.quadraticCurveTo(-8,0,-7,-13);ctx.fill();
    line([[-7,-8],[-8+wind,8],[-4+wind,11]],heaven?'#bf8f64':'#a9c2bd',0.7);
    ctx.save();ctx.translate(-8,-3);ctx.rotate(0.22);ctx.fillStyle='#253440';ctx.beginPath();ctx.roundRect(-1.5,-10,3,23,1);ctx.fill();
    line([[-2,-7],[2,-7]],metal,1.5);line([[0,-13],[0,-8]],'#a88d67',2);line([[0,7],[0,11]],metal,1);ctx.restore();
    // 靴子与重心：骑乘时屈膝落在鞍侧，步行时小幅交替。
    if(mounted){line([[-4,3],[-9,8],[-7,17]],deep,4);line([[4,3],[9,6],[6,15]],'#303c48',3.5);oval(-6,17,4,1.6,'#202632');oval(7,15,3,1.4,'#202632');}
    else {for(const side of [-1,1]){const d=side*step;line([[side*4,3],[side*4+d,12]],deep,4);oval(side*4+d+0.8,13,3.3,1.7,'#202632');line([[side*4+d-1,11],[side*4+d+2,11]],metal,0.7);}}
    const robe=gradient(heaven?'#f0d8a3':'#e3d8b7',heaven?'#9a7548':'#648d8b');
    ctx.fillStyle=robe;ctx.beginPath();ctx.moveTo(-6,-14);ctx.quadraticCurveTo(-10,-9,-8,-2);ctx.lineTo(-9,6);
    ctx.quadraticCurveTo(-2,9,1,7);ctx.lineTo(1,0);ctx.lineTo(4,7);ctx.lineTo(9,5);ctx.lineTo(7,-5);ctx.quadraticCurveTo(10,-10,6,-14);ctx.closePath();ctx.fill();
    line([[-5,-14],[1,-6],[5,-13]],heaven?'#fff0c8':'#f6ebcc',1.5);
    // 前后襟与云纹织线：放大时有工笔细节，原尺寸保留清晰轮廓。
    line([[-2,-4],[-2,6]],heaven?'#73504d':'#3f6871',0.8);
    line([[2,-3],[3,6]],heaven?'#d5b172':'#c2ad75',0.7);
    for(const side of [-1,1]){
      ctx.strokeStyle=heaven?'#e9c783':'#a7c9bc';ctx.lineWidth=0.65;ctx.beginPath();
      ctx.moveTo(side*5,0);ctx.quadraticCurveTo(side*8,1,side*5,3);ctx.quadraticCurveTo(side*3,4,side*5,5);ctx.stroke();
    }
    if(heaven){
      ctx.fillStyle=gradient('#e4d0a2','#b39661');ctx.beginPath();ctx.roundRect(-6.5,-11,13,10,2);ctx.fill();
      line([[-6,-10],[-3,-9],[0,-10],[3,-9],[6,-10]],'#f0dfb6',0.7);
      for(let row=0;row<3;row++)for(let c=0;c<4;c++){ctx.strokeStyle='#73634e';ctx.lineWidth=0.5;ctx.beginPath();ctx.arc(-4.5+c*3,-6+row*2,1.4,0.15,Math.PI-0.15);ctx.stroke();}
      oval(0,-7,3.2,3.5,'#4f6670');oval(-0.6,-8,1.6,1.7,'#a8c6c8');line([[-2,-4],[2,-4]],'#d8c08c',0.6);
      // 双层护心镜与肩甲鱼鳞金边。
      ctx.strokeStyle='#fff0bf';ctx.lineWidth=0.7;ctx.beginPath();ctx.ellipse(0,-7,4.4,4.7,0,0,Math.PI*2);ctx.stroke();
      line([[-9,-9],[-5,-7]],'#ffdf9d',1);line([[9,-9],[5,-7]],'#ffdf9d',1);
      for(const side of [-1,1]){shape([[side*6,-12],[side*11,-10],[side*10,-6],[side*6,-8]],gradient('#e3c993','#aa8954'));line([[side*7,-11],[side*9,-9]],'#f4dfaa',0.7);}
      for(let i=-1;i<=1;i++)line([[i*3,-1],[i*3+0.4,6]],'#695a4b',0.6);
    }else{
      line([[-4,-10],[2,-3],[2,5]],'#e9e0c9',0.8);line([[-5,0],[-7,5]],'#315662',0.8);line([[5,0],[7,4]],'#a7c6c0',0.6);
      // 青玉云心佩，替代一整片平色衣袍。
      oval(0,-7,2.8,3.2,'#315a62');oval(-0.7,-8,1.2,1.4,'#bddbd0');
      line([[-4,-2],[-6,4]],'#d5b982',0.75);line([[4,-2],[6,3]],'#d5b982',0.75);
    }
    ctx.fillStyle='#3c3434';ctx.fillRect(-8,-1,16,2.5);ctx.fillStyle=metal;ctx.beginPath();ctx.roundRect(-1.7,-1.5,3.4,3.5,0.7);ctx.fill();
    line([[5,1],[6,7]],'#a97760',0.8);oval(6,7,1.5,2,'#c8d4bd');
    line([[-7,0],[-9,6+wind]],heaven?'#d95d61':'#d3ab65',1.2);
    oval(-9,7+wind,1,1.6,heaven?'#e6b777':'#c8d5b2');
    // 肩、袖、护腕与手掌沿身体自然垂落，骑乘时右手握缰。
    for(const side of [-1,1]){
      const x=side*8, y=mounted && side===1?-5:step*side*0.3;
      line([[x,-10],[x+side,-4],[mounted&&side===1?5:x+side,y]],heaven?'#5a5b60':'#426e7d',4.1);
      line([[x+side,-2],[mounted&&side===1?5:x+side,y]],metal,2.7);
      oval(mounted&&side===1?5:x+side,y+1.2,1.6,2,'#d7ae8d');
    }
    ctx.fillStyle='#d7ae8d';ctx.fillRect(-2,-18,4,5);
    const skin=ctx.createRadialGradient(-1.5,-23,0.5,0,-21,7);
    skin.addColorStop(0,'#f4ddbd');skin.addColorStop(1,'#c2997c');oval(0,-21,5.1,6,skin);
    if(!back){
      line([[-3.6,-23.2],[-2.4,-23.5],[-1.3,-23]],'#4f3832',0.8);line([[1.2,-23],[2.4,-23.5],[3.6,-23.2]],'#4f3832',0.8);
      oval(-2.3,-21.5,1.2,0.7,'#e1ceb3');oval(2.3,-21.5,1.2,0.7,'#e1ceb3');
      oval(-2.2,-21.5,0.7,0.7,'#3d3332');oval(2.4,-21.5,0.7,0.7,'#3d3332');
      oval(-2.6,-21.8,0.3,0.25,'#f7e9d3');oval(2,-21.8,0.3,0.25,'#f7e9d3');
      line([[0,-20.6],[0.6,-19]],'#b38c73',0.6);line([[-1.4,-18.2],[0,-17.9],[1.4,-18.2]],'#9e6c5f',0.6);
    }
    if(heaven){
      ctx.fillStyle=gradient('#e2cb94','#9f8557');ctx.beginPath();ctx.moveTo(-6,-22);ctx.quadraticCurveTo(-6,-31,0,-31);ctx.quadraticCurveTo(6,-31,6,-22);ctx.lineTo(3,-24);ctx.lineTo(-3,-24);ctx.closePath();ctx.fill();
      line([[0,-30],[0,-25]],'#eaddb6',0.8);
      for(const side of [-1,1]){
        ctx.fillStyle='#b89a66';ctx.beginPath();ctx.moveTo(side*5,-25);ctx.quadraticCurveTo(side*9,-25,side*10,-30);ctx.quadraticCurveTo(side*12,-21,side*5,-20);ctx.closePath();ctx.fill();
        line([[side*6,-24],[side*8,-26]],'#eddab0',0.6);line([[side*6,-22],[side*9,-25]],'#836b4a',0.6);
      }
      ctx.fillStyle='#88444a';ctx.beginPath();ctx.moveTo(0,-31);ctx.quadraticCurveTo(-5,-37,-12,-32+wind);ctx.quadraticCurveTo(-4,-31,0,-29);ctx.fill();
      if(back){shape([[-5,-23],[5,-23],[4,-17],[-4,-17]],'#847657');line([[-3,-22],[-3,-18]],'#d8bf86',0.7);}
    }else{
      ctx.fillStyle='#29303a';ctx.beginPath();ctx.arc(0,-24,5.5,Math.PI,0);ctx.quadraticCurveTo(5,-19,3.5,-16);ctx.lineTo(4,-24);ctx.lineTo(-4,-24);ctx.lineTo(-4,-18);ctx.quadraticCurveTo(-6,-24,-5.5,-24);ctx.fill();
      oval(-1,-29,3,3.5,'#29303a');line([[-4,-26],[4,-26]],'#d8bd82',1.4);
      oval(0,-26,1.4,1.1,'#95b9ae');
      ctx.strokeStyle='#8a514e';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-4,-26);ctx.quadraticCurveTo(-9,-25,-12,-20+wind);ctx.stroke();
      if(back)oval(0,-21,5.3,6.4,'#29303a');
    }
    if(back){line([[-4,-12],[0,-7],[4,-12]],metal,0.8);}
    ctx.restore();
  },
  portrait(ctx, role, cx, cy, r) {
    ctx.save();ctx.translate(cx,cy+27*r/30);ctx.scale(1.65*r/30,1.65*r/30);
    this.draw(ctx,0,0,'down',false,role==='heaven_general');ctx.restore();
  }
};
