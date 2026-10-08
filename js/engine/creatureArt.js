/** 野怪轮廓库。头像复用同一绘制，物种由轮廓、肢体与材质区分。 */
window.CreatureArt = {
  ids: new Set(['pig', 'fox', 'snake', 'bear', 'tiger', 'stone_monkey', 'yecha', 'skeleton', 'ghost',
    'scorpion', 'spider', 'centipede', 'lizard', 'bat', 'crane', 'eagle', 'elephant', 'lion',
    'stone_spirit', 'tree', 'fire_spirit', 'water_wraith', 'demon_monk', 'demon_taoist',
    'fish', 'red_carp', 'black_fish', 'spirit_cat', 'cat_demon', 'rooster', 'sandworm', 'crystal_spirit']),
  draw(ctx, id, by = 0, time = 0, direction = 'right', moving = false) {
    ctx.save(); ctx.translate(0, by); if (direction === 'left') ctx.scale(-1, 1);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const sway = Math.sin(time * 0.15), stride = moving ? Math.sin(time * 0.35) * 2 : 0;
    const ellipse = (x, y, rx, ry, color, rotation = 0) => {
      ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2); ctx.fill();
    };
    const line = (points, color, width = 1) => {
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath();
      points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    };
    const shape = (points, color) => {
      ctx.fillStyle = color; ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill();
    };
    const eyes = (x, y, color = '#f4d786') => {
      ellipse(x, y, 1.5, 1.1, color); ellipse(x + 0.4, y, 0.65, 0.8, '#161b26'); ellipse(x - 0.4, y - 0.35, 0.35, 0.3, '#fff4dc');
    };
    const glaze = (base, light) => {
      const g = ctx.createLinearGradient(-16, -16, 16, 12); g.addColorStop(0, light); g.addColorStop(0.48, base); g.addColorStop(1, '#202330'); return g;
    };
    if (['fish', 'red_carp', 'black_fish'].includes(id)) {
      const carp = id === 'red_carp', dark = id === 'black_fish';
      const skin = glaze(carp ? '#b46549' : dark ? '#34444b' : '#537f8b', carp ? '#ecc27d' : dark ? '#94a29d' : '#bcdbca');
      const fin = carp ? '#cf9370' : dark ? '#687e82' : '#92b6b1';
      shape([[-8,-3],[-21,-15+sway],[-17,-3],[-23,7+sway],[-8,2]], fin);
      ellipse(0,-4,13,7,skin); shape([[-6,-10],[-1,-18],[7,-10]], fin);
      shape([[-3,0],[3,8],[7,-1]], fin); eyes(8,-6,'#ecd3a0');
      line([[10,-2],[13,-2]], '#d6c6aa', 0.8); line([[5,-10],[4,-6],[5,1]], fin, 1);
      for (let row=0;row<3;row++) for (let col=0;col<5;col++) {
        ctx.strokeStyle = carp ? '#f0ba81' : '#aac4bb'; ctx.lineWidth=0.55; ctx.beginPath();
        ctx.arc(-8+col*3+row%2,-8+row*3,1.5,-0.8,0.8); ctx.stroke();
      }
      if (carp) { line([[12,-2],[16,1],[19,0]], '#f0d1a2', 0.7); line([[11,-1],[14,4]], '#f0d1a2', 0.7); }
      if (id==='fish') { line([[-2,9],[4,9]], '#bad4cb', 0.7); ellipse(9,-12,1,1,'#b9d6d1'); }
    } else if (id === 'spirit_cat' || id === 'cat_demon') {
      const demon = id === 'cat_demon', fur = glaze(demon?'#504665':'#b6b9a6', demon?'#a78fb4':'#eee5cb');
      ctx.strokeStyle=demon?'#776286':'#bdb6a1';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-8,3);
      ctx.bezierCurveTo(-23,10,-27,-8,-18,-14+sway);ctx.stroke();
      for(const side of [-1,1])line([[side*5,1],[side*(6+stride),11]], demon?'#4e435b':'#989f90',3);
      ellipse(0,0,9,8,fur);ellipse(1,-13,8,7,fur);
      shape([[-6,-17],[-7,-25],[0,-18]], demon?'#8b7797':'#d4c9b3');shape([[5,-18],[9,-25],[8,-15]],demon?'#8b7797':'#d4c9b3');
      for(const side of [-1,1]) { eyes(side*3+1,-14,demon?'#d9bf87':'#a9c6a6');
        line([[side*4,-10],[side*11,-12]], '#ddd3bf',0.6);line([[side*4,-9],[side*12,-9]], '#ddd3bf',0.6); }
      shape([[0,-10],[3,-10],[1.5,-8]],'#a67979');line([[1.5,-8],[0,-6]],'#6c565d',0.7);
      if(demon){shape([[-4,-3],[0,-6],[4,-3],[0,0]],'#c2ad85');line([[-4,2],[4,2]],'#a68768',1);}
      else{ellipse(0,-4,2,2,'#c8b687');line([[0,-2],[0,1]],'#8e9d85',0.7);}
    } else if (id === 'rooster') {
      for(let i=0;i<4;i++){ctx.strokeStyle=i%2?'#55796a':'#394e61';ctx.lineWidth=2;ctx.beginPath();
        ctx.moveTo(-7,0);ctx.bezierCurveTo(-22,-4,-26,-24+i*3,-12,-23+i*3+sway);ctx.stroke();}
      ellipse(0,-1,9,10,glaze('#91704d','#e5c48c'));ellipse(6,-14,4.5,6,'#cbb88e');
      for(let i=0;i<3;i++)ellipse(3+i*2,-20,1.8,2.5,'#ab5345');eyes(7,-15);
      shape([[9,-14],[16,-12],[9,-10]],'#d4ae66');ellipse(8,-8,2,3,'#ad5a48');
      line([[-3,7],[-4,13],[-8,14]],'#b59458',1.2);line([[4,7],[5,13],[9,14]],'#b59458',1.2);
      line([[-6,-4],[-1,1],[3,3]],'#e0c88f',0.8);
    } else if (id === 'sandworm') {
      for(let i=0;i<7;i++){const x=-17+i*5,y=7-Math.sin(i*0.65)*8;
        ellipse(x,y,4.8,5,glaze('#987441','#ddbd7e'));line([[x-2,y-2],[x+2,y-2]],'#f0d99a',0.7);}
      ellipse(16,-1,5.5,6,'#af965d');ellipse(18,-2,3.5,3.5,'#4b3731');
      for(let i=0;i<5;i++){const a=i*Math.PI*2/5;shape([[18+Math.cos(a)*4,-2+Math.sin(a)*4],[18+Math.cos(a)*2,-2+Math.sin(a)*2],[19+Math.cos(a+0.3)*4,-2+Math.sin(a+0.3)*4]],'#eee1b7');}
    } else if (id === 'crystal_spirit') {
      for(const side of [-1,1]){line([[side*5,4],[side*7,11]],'#615471',3);line([[side*7,-9],[side*14,-2]],'#8b78a8',4);}
      shape([[-9,5],[-12,-9],[-6,-15],[4,-14],[10,-6],[9,5],[0,10]],glaze('#765c91','#c7afd6'));
      shape([[-6,-15],[-5,-27],[1,-31],[5,-21],[4,-14]],'#9f8bba');
      shape([[-11,-6],[-15,-18],[-10,-23],[-5,-13]],'#8d75a4');
      line([[-6,-14],[0,-7],[4,-14]],'#e3d3e9',0.8);line([[0,-7],[0,8]],'#c3aacf',0.7);
      eyes(-3,-6,'#e8dbb4');eyes(3,-6,'#e8dbb4');
    } else if (['scorpion', 'spider', 'centipede'].includes(id)) {
      const spider = id === 'spider', long = id === 'centipede';
      const count = long ? 8 : 4;
      for (let i = 0; i < count; i++) {
        const y = long ? -13 + i * 3.2 : -4 + i * 2.2;
        const x = long ? 4 : 7;
        for (const side of [-1, 1]) line([[side * x, y], [side * (x + 6), y - 3 + stride * (i % 2 ? 1 : -1)], [side * (x + 10), y + 5]], '#806869', 1.7);
      }
      if (long) {
        for (let i = 7; i >= 0; i--) {
          ellipse(0, -13 + i * 3.2, 4.8, 3, glaze('#75564c', '#b79672'));
          line([[-3, -13 + i * 3.2], [3, -13 + i * 3.2]], '#d3ac78', 0.6);
        }
        ellipse(0, -16, 5, 3.8, '#766477'); eyes(-2, -16, '#f5ba73'); eyes(2, -16, '#f5ba73');
        line([[-2, -19], [-6, -23], [-8, -21]], '#cc9e6a'); line([[2, -19], [6, -23], [8, -21]], '#cc9e6a');
      } else {
        ellipse(0, spider ? -7 : 0, spider ? 9 : 7, spider ? 9 : 7, glaze(spider ? '#544667' : '#6b6856', '#a99b87'));
        ellipse(0, spider ? 4 : -7, 5, 4, '#45354b');
        for (let i = -1; i <= 1; i++) ellipse(i * 2.6, spider ? 3 : -8, 0.9, 0.8, '#dbaf7d');
        if (spider) {
          shape([[-4,-13],[0,-10],[4,-13],[0,-3]], '#b298b7');
          line([[-2,7],[-4,10]], '#d7c5a7'); line([[2,7],[4,10]], '#d7c5a7');
        } else {
          ctx.strokeStyle = '#9e8c65'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0,4);
          ctx.bezierCurveTo(12, 8, 18, -11 + sway, 9, -20 + sway); ctx.stroke();
          shape([[9,-20+sway],[4,-20+sway],[7,-15+sway]], '#e2c78b');
          for (const side of [-1,1]) {
            line([[side*4,-7],[side*11,-14],[side*16,-16]], '#92765b', 2);
            ellipse(side*16,-16,4,3,'#a8936c',side*0.6); line([[side*16,-18],[side*20,-19]],'#e7cd93');
          }
        }
      }
    } else if (['bat', 'crane', 'eagle'].includes(id)) {
      const crane = id === 'crane', bat = id === 'bat'; const flutter = sway * (moving ? 3 : 1);
      if (crane) {
        line([[-3,1],[-5,12+stride]], '#b59b72'); line([[3,1],[5,12-stride]], '#b59b72');
        ellipse(0,-3,10,7,glaze('#d6ddd6','#fff5df'));
        shape([[-10,-4],[-19,1],[-9,1]], '#253743');
        ctx.strokeStyle='#e5e9dc';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(5,-7);ctx.bezierCurveTo(1,-18,11,-11,8,-22);ctx.stroke();
        ellipse(9,-22,4,3,'#ede9d9'); ellipse(9,-25,2.5,1.5,'#ad4f45');
        shape([[12,-23],[21,-21],[12,-20]],'#b89458');eyes(10,-22,'#d4ac67');
        line([[-5,-6],[0,-1],[7,0]],'#879896',1.3);
      } else {
        for (const side of [-1,1]) {
          ctx.fillStyle = glaze(bat ? '#635773' : '#736554', bat ? '#9e819b' : '#c6ab7b');
          ctx.beginPath();ctx.moveTo(side*3,-5);ctx.quadraticCurveTo(side*13,-15-flutter,side*23,-9-flutter);
          if(bat){ctx.lineTo(side*19,2);ctx.quadraticCurveTo(side*13,-3,side*10,5);ctx.quadraticCurveTo(side*6,0,side*3,4);}
          else {ctx.lineTo(side*18,4);ctx.lineTo(side*15,1);ctx.lineTo(side*12,6);ctx.lineTo(side*8,2);ctx.lineTo(side*3,6);}
          ctx.closePath();ctx.fill();
          for(let i=0;i<3;i++)line([[side*4,-4],[side*(12+i*4),-5-flutter+i*2]],bat?'#b38a9b':'#dcc49a',0.65);
        }
        ellipse(0,-1,4.5,8,glaze('#594a50','#b8a18c'));ellipse(0,-10,5,4.5,bat?'#4c3e53':'#c7b589');
        if(bat){shape([[-5,-12],[-5,-20],[-1,-14]],'#80647e');shape([[5,-12],[5,-20],[1,-14]],'#80647e');}
        else shape([[2,-10],[9,-9],[5,-5]],'#d0a35b');
        eyes(-2,-10);eyes(2,-10);line([[-2,6],[-3,10],[0,8]],'#b29260');line([[2,6],[3,10],[5,8]],'#b29260');
      }
    } else if (['snake','lizard','water_wraith','fire_spirit','ghost'].includes(id)) {
      if (id === 'snake' || id === 'lizard') {
        const lizard=id==='lizard';const body=glaze(lizard?'#9e5645':'#398278',lizard?'#d9a15f':'#a8c9a0');
        if(lizard){
          ctx.strokeStyle=body;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-7,2);ctx.bezierCurveTo(-18,10,-24,7,-24,1);ctx.stroke();ellipse(0,-2,11,5,body);
          for(const side of [-1,1]){line([[side*4,0],[side*10,4],[side*13,8]],'#b67955',2);line([[side*3,-5],[side*9,-8],[side*13,-5]],'#b67955',2);}
          for(let i=0;i<4;i++)shape([[-7+i*4,-5],[-6+i*4,-11],[-4+i*4,-5]],'#d3a166');
        }else{ctx.strokeStyle=body;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-16,8);ctx.bezierCurveTo(-7,14,12,9,4,1);ctx.bezierCurveTo(-9,-10,8,-17,10,-9+sway);ctx.stroke();}
        ellipse(10,-8+sway,lizard?6:5,lizard?4:3.5,body);eyes(12,-9+sway);line([[14,-7+sway],[19,-7+sway],[21,-9+sway]],'#af645b',0.7);
      } else {
        const fire=id==='fire_spirit', ghost=id==='ghost';
        const base=fire?'#b25743':ghost?'#727c9a':'#477c9b',light=fire?'#f4cd7d':ghost?'#c1c9d8':'#a9dae1';
        ctx.fillStyle=glaze(base,light);ctx.beginPath();
        if(fire){ctx.moveTo(-8,10);ctx.quadraticCurveTo(-17,0,-9,-15);ctx.lineTo(-7,-8);ctx.quadraticCurveTo(-1,-17,0,-28+sway);ctx.lineTo(5,-16);ctx.lineTo(10,-23-sway);ctx.quadraticCurveTo(17,-3,10,9);ctx.quadraticCurveTo(0,14,-8,10);}
        else if(ghost){ctx.moveTo(-10,9);ctx.quadraticCurveTo(-13,-17,0,-26);ctx.quadraticCurveTo(13,-17,10,9);ctx.lineTo(6,5);ctx.lineTo(3,12);ctx.lineTo(-1,7);ctx.lineTo(-5,12);ctx.closePath();}
        else{ctx.moveTo(-12,8);ctx.quadraticCurveTo(-8,-6,-6,-12);ctx.quadraticCurveTo(-3,-20,3,-19);ctx.quadraticCurveTo(14,-15,8,-3);ctx.quadraticCurveTo(5,7,16,7);ctx.quadraticCurveTo(7,17,-2,8);ctx.quadraticCurveTo(-8,15,-12,8);}
        ctx.fill();
        ellipse(0,-5,6,8,fire?'#783a37':ghost?'#d3d2cb':'#366274');eyes(-3,-6,light);eyes(3,-6,light);
        line([[-4,0],[0,2],[4,0]],ghost?'#596575':light,0.8);
        ctx.strokeStyle=light;ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(-9,9);ctx.quadraticCurveTo(-18,6+sway,-17,-4);ctx.moveTo(8,10);ctx.quadraticCurveTo(18,6-sway,16,-6);ctx.stroke();
      }
    } else if (['pig','fox','bear','tiger','lion','elephant'].includes(id)) {
      const pig=id==='pig',fox=id==='fox',bear=id==='bear',elephant=id==='elephant',lion=id==='lion';
      const base=pig?'#726156':fox?'#aa603d':bear?'#4d4540':elephant?'#697b85':lion?'#bd9657':'#c69a51';
      const light=pig?'#ac9481':fox?'#e6bd85':bear?'#8c8170':elephant?'#abbfc1':'#ecd5a0';
      const body=glaze(base,light);
      if(fox){ctx.fillStyle=body;ctx.beginPath();ctx.moveTo(-9,1);ctx.bezierCurveTo(-24,9,-28,-10,-19,-16+sway);ctx.quadraticCurveTo(-12,-7,-9,1);ctx.fill();ellipse(-21,-10+sway,4,5,'#eee0bb',0.3);}
      else {ctx.strokeStyle=base;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-13,0);ctx.quadraticCurveTo(-22,-7,-20,-12+sway);ctx.stroke();}
      for(let i=0;i<4;i++){const x=-10+i*6,walk=i%2?stride:-stride;ctx.fillStyle=i%2?base:'#403b3b';ctx.beginPath();ctx.roundRect(x+walk,3,4,9,1.5);ctx.fill();ellipse(x+2+walk,11,3,1.3,'#3b3433');}
      ellipse(-2,bear?-3:-1,elephant||bear?15:13,elephant||bear?11:pig?9:8,body);
      if(lion){ellipse(11,-9,10,12,glaze('#825138','#c6975a'));for(let i=0;i<7;i++){const a=i*Math.PI/4;line([[11+Math.cos(a)*7,-9+Math.sin(a)*9],[11+Math.cos(a)*9,-9+Math.sin(a)*11]],'#ddaf68',0.7);}}
      ellipse(11,-6,elephant?9:bear?8:7,elephant?10:bear?8:7,body);
      if(elephant){ellipse(7,-9,6,8,'#8ba0a8',0.3);ctx.strokeStyle=body;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(17,-3);ctx.bezierCurveTo(22,3,15,14,23,10);ctx.stroke();line([[16,0],[22,3],[24,1]],'#ece2c9',2);}
      else{if(!bear){shape([[7,-11],[6,-19],[11,-13]],base);shape([[13,-12],[17,-18],[18,-9]],base);}ellipse(16,-3,pig?5:4,pig?3.6:2.5,light);if(pig){ellipse(19,-3,0.7,0.9,'#554239');line([[13,0],[16,2],[16,-1]],'#eddfb8',1.4);for(let i=0;i<5;i++)line([[-10+i*4,-8],[-11+i*4,-12]],'#b7aa8d',0.7);}}
      eyes(13,-7);
      if(id==='tiger'){for(let i=0;i<4;i++)shape([[-12+i*6,-6],[-8+i*6,-4],[-11+i*6,1]],'#534537');line([[8,-11],[11,-8],[10,-4]],'#534537',1);}
      if(bear){ellipse(7,-14,3,3,base);ellipse(14,-14,3,3,base);shape([[-5,-6],[0,-2],[5,-6],[0,1]],'#d4c5a5');}
      if(fox)line([[15,-1],[20,0]],'#4b342b',0.65);
    } else if (['stone_spirit','tree'].includes(id)) {
      const tree=id==='tree';const rock=glaze(tree?'#665342':'#657882',tree?'#a18b63':'#a8b8b7');
      for(const side of [-1,1]){line([[side*6,1],[side*12,8],[side*16,11]],tree?'#746145':'#56676f',3);line([[side*7,-9],[side*15,-5],[side*17,1]],tree?'#746145':'#56676f',4);}
      shape([[-11,8],[-9,-12],[-3,-19],[8,-16],[12,-5],[8,10]],rock);
      line([[-7,-9],[-2,-5],[-5,3]],'#d0b994',0.8);line([[5,-12],[2,-6],[7,-1]],'#394650',0.8);
      eyes(-4,-6,'#b8d99d');eyes(4,-6,'#b8d99d');line([[-3,2],[0,0],[3,2]],'#302f30');
      if(tree){for(const side of [-1,1]){line([[side*6,-13],[side*10,-21],[side*17,-24]],'#8f7752',2);ellipse(side*13,-20,5,2.5,'#647a58',side*0.5);}}
      else {shape([[-8,-12],[-2,-18],[1,-12]],'#b3b7a3');ellipse(-7,3,3,1.5,'#6e876b');}
    } else {
      // 人形野怪：骨骼、夜叉、山猴、恶僧与假道士各有不同头部与道具。
      const skeleton=id==='skeleton',monkey=id==='stone_monkey',tao=id==='demon_taoist',monk=id==='demon_monk';
      const body=skeleton?'#cfccbb':monkey?'#a47d56':tao?'#587d83':monk?'#6f5048':'#456c76';
      for(const side of [-1,1]){line([[side*4,3],[side*(5+stride),11]],skeleton?'#b8b7a7':'#403e42',3);ellipse(side*(5+stride),11,3,1.5,'#39383c');}
      if(skeleton){line([[0,-12],[0,4]],'#d9d5bd',2);for(let i=0;i<4;i++){ctx.strokeStyle='#c9c5af';ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(0,-9+i*3,6,2,0,0,Math.PI);ctx.stroke();}}
      else{ctx.fillStyle=glaze(body,'#b6b6a1');ctx.beginPath();ctx.roundRect(-8,-13,16,19,3);ctx.fill();line([[-5,-12],[3,-3],[3,4]],'#d7c9aa',1);ctx.fillStyle='#544735';ctx.fillRect(-8,0,16,2);}
      for(const side of [-1,1])line([[side*7,-10],[side*10,-3],[side*12,2]],body,skeleton?2:4);
      ellipse(0,-18,monkey?7:6,7,skeleton?'#d9d4bf':monkey?'#cdb48b':monk?'#b3937c':body);
      if(skeleton){ellipse(-2.5,-19,2,2,'#31434b');ellipse(2.5,-19,2,2,'#31434b');line([[-3,-14],[3,-14]],'#70675c');for(let i=-2;i<=2;i+=2)line([[i,-15],[i,-13]],'#70675c',0.6);}
      else{eyes(-2.5,-19);eyes(2.5,-19);line([[-2,-14],[0,-15],[2,-14]],'#685052',0.7);}
      if(monkey){ellipse(-7,-19,3,3,body);ellipse(7,-19,3,3,body);ctx.strokeStyle=body;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-7,3);ctx.bezierCurveTo(-23,6,-24,-11,-16,-8);ctx.stroke();}
      if(tao){shape([[-5,-23],[-4,-31],[4,-31],[5,-23]],'#334953');ellipse(0,-27,1.5,1.5,'#c8b88f');line([[12,4],[12,-22]],'#9f8261',1.8);shape([[9,-22],[16,-24],[15,-15],[9,-13]],'#d6bd87');}
      if(monk){for(let i=0;i<7;i++)ellipse(-7+i*2.3,-9+Math.sin(i/6*Math.PI)*6,1.5,1.5,'#cab091');line([[12,10],[12,-25]],'#927052',2);ellipse(12,-24,3,3,'#9a8c67');}
      if(id==='yecha'){shape([[-5,-23],[-8,-31],[-1,-24]],'#c9c5a1');shape([[5,-23],[8,-31],[1,-24]],'#c9c5a1');line([[13,10],[13,-23]],'#b4a67a',1.8);line([[9,-28],[9,-23],[13,-20],[17,-23],[17,-28]],'#cbd3c4',1.2);}
    }
    ctx.restore();
  }
};
