const fs = require('fs');

global.window = {};
require('../js/data/maps2d.js');
const maps = global.window.GAME_DATA.MAPS_2D;

// 1. 重构【高老庄】(乌斯藏·高老庄与云栈洞)
{
  const gl = maps['gaolaozhuang'];
  gl.width = 38;
  gl.height = 28;
  const tiles = Array.from({ length: 28 }, () => Array(38).fill('manor_floor'));

  // 庄外四周设为田垄草地
  for (let r = 0; r < 28; r++) {
    for (let c = 0; c < 38; c++) {
      if (r <= 2 || r >= 26 || c <= 2 || c >= 35) {
        tiles[r][c] = 'grass';
      }
    }
  }

  // 庄外主干横贯大路 (连接东西传送门)
  for (let c = 0; c < 38; c++) {
    tiles[14][c] = 'dirt_path';
    tiles[15][c] = 'dirt_path';
  }
  // 庄外南门进庄大路
  for (let r = 16; r < 28; r++) {
    tiles[r][18] = 'dirt_path';
    tiles[r][19] = 'dirt_path';
  }

  // 【外层围墙】：c=3~34, r=3~25
  for (let c = 3; c <= 34; c++) {
    tiles[3][c] = 'city_wall';
    tiles[25][c] = 'city_wall';
  }
  for (let r = 3; r <= 25; r++) {
    tiles[r][3] = 'city_wall';
    tiles[r][34] = 'city_wall';
  }
  // 外层正南门门楼通道 (宽3格通行)
  tiles[25][17] = 'dirt_path';
  tiles[25][18] = 'dirt_path';
  tiles[25][19] = 'dirt_path';
  // 外层东西侧门通道
  tiles[14][3] = 'dirt_path';
  tiles[15][3] = 'dirt_path';
  tiles[14][34] = 'dirt_path';
  tiles[15][34] = 'dirt_path';

  // 【内层围墙】：c=9~28, r=6~17
  for (let c = 9; c <= 28; c++) {
    tiles[6][c] = 'city_wall';
    tiles[17][c] = 'city_wall';
  }
  for (let r = 6; r <= 17; r++) {
    tiles[r][9] = 'city_wall';
    tiles[r][28] = 'city_wall';
  }
  // 内层南门 (仪门) 通行口
  tiles[17][18] = 'dirt_path';
  tiles[17][19] = 'dirt_path';
  // 内层东西侧门通行口
  tiles[14][9] = 'dirt_path';
  tiles[15][9] = 'dirt_path';
  tiles[14][28] = 'dirt_path';
  tiles[15][28] = 'dirt_path';

  // 【高府正堂迎客大厅】(内院正北，大宅，3x10)
  for (let r = 7; r <= 9; r++) {
    for (let c = 14; c <= 23; c++) {
      tiles[r][c] = 'tang_palace';
    }
  }

  // 【东厢房·高翠兰绣楼】(内院东侧，青黛飞檐红灯笼，3x4)
  for (let r = 10; r <= 13; r++) {
    for (let c = 23; c <= 26; c++) {
      tiles[r][c] = 'tang_store';
    }
  }

  // 【西客房与书斋】(内院西侧，3x4)
  for (let r = 10; r <= 13; r++) {
    for (let c = 11; c <= 14; c++) {
      tiles[r][c] = 'tang_store';
    }
  }

  // 【外院东侧谷仓与木栅栏】(c=27~32, r=19~23)
  for (let r = 19; r <= 21; r++) {
    for (let c = 28; c <= 31; c++) {
      tiles[r][c] = 'hut_wall';
    }
  }
  for (let c = 26; c <= 33; c++) {
    tiles[18][c] = 'wooden_barricade';
    tiles[23][c] = 'wooden_barricade';
  }
  tiles[18][29] = 'dirt_path'; // 栅栏门

  // 【外院西侧柴房与水井】(c=5~8, r=19~23)
  for (let r = 19; r <= 21; r++) {
    for (let c = 5; c <= 7; c++) {
      tiles[r][c] = 'hut_wall';
    }
  }

  gl.tiles = tiles;

  // NPC 坐标微调保证在开阔地
  const npcTaigong = gl.npcs.find(n => n.id === 'npc_gaotaigong');
  if (npcTaigong) { npcTaigong.x = 18 * 32 + 16; npcTaigong.y = 11 * 32; }
  const npcCuilan = gl.npcs.find(n => n.id === 'npc_gaocuilan');
  if (npcCuilan) { npcCuilan.x = 21 * 32; npcCuilan.y = 12 * 32; }
  const npcBajie = gl.npcs.find(n => n.id === 'npc_zhubajie');
  if (npcBajie) { npcBajie.x = 16 * 32; npcBajie.y = 12 * 32; }

  // 怪物坐标微调避开建筑物
  const pig1 = gl.monsters.find(m => m.id === 'mob_gl_pig_1');
  if (pig1) { pig1.x = 10 * 32; pig1.y = 15 * 32; }
  const pig2 = gl.monsters.find(m => m.id === 'mob_gl_pig_2');
  if (pig2) { pig2.x = 27 * 32; pig2.y = 15 * 32; }
  const wild1 = gl.monsters.find(m => m.id === 'mob_gl_wildpig_1');
  if (wild1) { wild1.x = 8 * 32; wild1.y = 26 * 32; }
  const wild2 = gl.monsters.find(m => m.id === 'mob_gl_wildpig_2');
  if (wild2) { wild2.x = 28 * 32; wild2.y = 26 * 32; }
}

// 2. 重构【刘家村】(双叉岭·刘家村)
{
  const lj = maps['liujiacun'];
  lj.width = 38;
  lj.height = 28;
  const tiles = Array.from({ length: 28 }, () => Array(38).fill('grass'));

  // 穿村主干道 (东西连通长安与五行山)
  for (let c = 0; c < 38; c++) {
    tiles[14][c] = 'dirt_path';
    tiles[15][c] = 'dirt_path';
  }
  // 南北纵向乡道
  for (let r = 4; r < 25; r++) {
    tiles[r][17] = 'dirt_path';
    tiles[r][18] = 'dirt_path';
  }

  // 1. 【猎户刘伯钦大院】(西北，c=8~16, r=6~12)
  for (let c = 8; c <= 16; c++) {
    tiles[6][c] = 'wooden_barricade';
    tiles[12][c] = 'wooden_barricade';
  }
  for (let r = 6; r <= 12; r++) {
    tiles[r][8] = 'wooden_barricade';
    tiles[r][16] = 'wooden_barricade';
  }
  tiles[12][12] = 'dirt_path'; // 院门
  for (let r = 7; r <= 11; r++) {
    for (let c = 9; c <= 15; c++) {
      tiles[r][c] = 'dirt_path';
    }
  }
  for (let r = 7; r <= 9; r++) {
    for (let c = 10; c <= 14; c++) {
      tiles[r][c] = 'hut_wall';
    }
  }

  // 2. 【村长刘太公家宅】(东北，c=22~29, r=6~12)
  for (let c = 22; c <= 29; c++) {
    tiles[6][c] = 'wooden_barricade';
    tiles[12][c] = 'wooden_barricade';
  }
  for (let r = 6; r <= 12; r++) {
    tiles[r][22] = 'wooden_barricade';
    tiles[r][29] = 'wooden_barricade';
  }
  tiles[12][25] = 'dirt_path'; // 院门
  for (let r = 7; r <= 11; r++) {
    for (let c = 23; c <= 28; c++) {
      tiles[r][c] = 'dirt_path';
    }
  }
  for (let r = 7; r <= 9; r++) {
    for (let c = 24; c <= 27; c++) {
      tiles[r][c] = 'hut_wall';
    }
  }

  // 3. 【西南农舍与菜园】(西南，c=7~15, r=17~23)
  for (let c = 7; c <= 15; c++) {
    tiles[17][c] = 'wooden_barricade';
    tiles[23][c] = 'wooden_barricade';
  }
  for (let r = 17; r <= 23; r++) {
    tiles[r][7] = 'wooden_barricade';
    tiles[r][15] = 'wooden_barricade';
  }
  tiles[17][11] = 'dirt_path'; // 菜园门
  for (let r = 18; r <= 20; r++) {
    for (let c = 8; c <= 10; c++) {
      tiles[r][c] = 'hut_wall';
    }
  }

  // 4. 【东南粮仓磨坊】(东南，c=23~30, r=17~23)
  for (let c = 23; c <= 30; c++) {
    tiles[17][c] = 'wooden_barricade';
    tiles[23][c] = 'wooden_barricade';
  }
  for (let r = 17; r <= 23; r++) {
    tiles[r][23] = 'wooden_barricade';
    tiles[r][30] = 'wooden_barricade';
  }
  tiles[17][26] = 'dirt_path';
  for (let r = 18; r <= 20; r++) {
    for (let c = 25; c <= 28; c++) {
      tiles[r][c] = 'hut_wall';
    }
  }

  // 5. 村中竹林与灵泉 (c=19~20, r=7~8)
  tiles[7][19] = 'bamboo';
  tiles[7][20] = 'bamboo';
  tiles[8][19] = 'bamboo';
  tiles[8][20] = 'water';

  lj.tiles = tiles;

  // 保证刘伯钦和太公站在可行走开阔处
  const npcBoqin = lj.npcs.find(n => n.id === 'npc_liuboqin');
  if (npcBoqin) { npcBoqin.x = 12 * 32; npcBoqin.y = 11 * 32; }
  const npcVillageElder = lj.npcs.find(n => n.id === 'npc_village_elder');
  if (npcVillageElder) { npcVillageElder.x = 25 * 32; npcVillageElder.y = 11 * 32; }

  // 4 朵青蘑菇精准部署在草地上
  const m1 = lj.npcs.find(n => n.id === 'prop_mushroom_1');
  if (m1) { m1.x = 5 * 32; m1.y = 8 * 32; }
  const m2 = lj.npcs.find(n => n.id === 'prop_mushroom_2');
  if (m2) { m2.x = 12 * 32; m2.y = 20 * 32; }
  const m3 = lj.npcs.find(n => n.id === 'prop_mushroom_3');
  if (m3) { m3.x = 32 * 32; m3.y = 9 * 32; }
  const m4 = lj.npcs.find(n => n.id === 'prop_mushroom_4');
  if (m4) { m4.x = 20 * 32; m4.y = 21 * 32; }

  // 4 只偷粮硕鼠精准部署在草地或乡道上
  const rat1 = lj.monsters.find(m => m.id === 'mob_rat_1');
  if (rat1) { rat1.x = 21 * 32; rat1.y = 9 * 32; }
  const rat2 = lj.monsters.find(m => m.id === 'mob_rat_2');
  if (rat2) { rat2.x = 18 * 32; rat2.y = 22 * 32; }
  const rat3 = lj.monsters.find(m => m.id === 'mob_rat_3');
  if (rat3) { rat3.x = 5 * 32; rat3.y = 19 * 32; }
  const rat4 = lj.monsters.find(m => m.id === 'mob_rat_4');
  if (rat4) { rat4.x = 32 * 32; rat4.y = 20 * 32; }
}

// 3. 重构【五行山】(两界山·五行山)
{
  const wx = maps['wuxingshan'];
  wx.width = 38;
  wx.height = 28;
  const tiles = Array.from({ length: 28 }, () => Array(38).fill('grass'));

  // 贯穿山脚道路 (连接鹰愁涧与刘家村)
  for (let c = 0; c < 38; c++) {
    tiles[14][c] = 'dirt_path';
    tiles[15][c] = 'dirt_path';
  }

  // 盘山险道通往山腰与峰脚
  for (let r = 9; r <= 14; r++) {
    tiles[r][12] = 'dirt_path';
    tiles[r][13] = 'dirt_path';
  }

  // 巍峨五指巨岩绝壁群 (mountain_rock)
  // 1. 中指最高峰 (峰顶压金符，c=9~16, r=1~6)
  for (let r = 1; r <= 6; r++) {
    for (let c = 9; c <= 16; c++) {
      tiles[r][c] = 'mountain_rock';
    }
  }
  // 峰顶金符
  tiles[3][12] = 'wuxing_seal';

  // 2. 食指峰 (左上高岩，c=3~8, r=2~7)
  for (let r = 2; r <= 7; r++) {
    for (let c = 3; c <= 8; c++) {
      tiles[r][c] = 'mountain_rock';
    }
  }
  // 3. 大拇指峰 (极左，c=0~3, r=4~9)
  for (let r = 4; r <= 9; r++) {
    for (let c = 0; c <= 2; c++) {
      tiles[r][c] = 'mountain_rock';
    }
  }
  // 4. 无名指峰 (右上险峰，c=17~23, r=2~7)
  for (let r = 2; r <= 7; r++) {
    for (let c = 17; c <= 23; c++) {
      tiles[r][c] = 'mountain_rock';
    }
  }
  // 5. 小指峰 (极右绝壁，c=25~31, r=3~8)
  for (let r = 3; r <= 8; r++) {
    for (let c = 25; c <= 31; c++) {
      tiles[r][c] = 'mountain_rock';
    }
  }

  // 【山脚石缝·被压处】：(c=11~14, r=7~9)
  tiles[7][10] = 'mountain_rock';
  tiles[7][11] = 'mountain_rock';
  tiles[7][14] = 'mountain_rock';
  tiles[7][15] = 'mountain_rock';
  tiles[8][10] = 'mountain_rock';
  tiles[8][15] = 'mountain_rock';
  tiles[8][12] = 'dirt_path'; // 穴前

  // 【两界界碑】(矗立在两界山道要冲，c=18, r=13)
  tiles[13][18] = 'two_realms_stele';

  wx.tiles = tiles;

  // 修正孙悟空坐标在山脚石穴前 (c=12, r=8 即 x=384, y=256)
  const npcWukong = wx.npcs.find(n => n.id === 'npc_wukong_sealed');
  if (npcWukong) { npcWukong.x = 12 * 32; npcWukong.y = 8 * 32; }

  // 4 株百年枯树精分布在南坡开阔处
  const tree1 = wx.monsters.find(m => m.id === 'mob_tree_demon' || m.id === 'mob_tree_1');
  if (tree1) { tree1.x = 8 * 32; tree1.y = 19 * 32; tree1.appearance = 'tree'; }
  const tree2 = wx.monsters.find(m => m.id === 'mob_tree_2');
  if (tree2) { tree2.x = 24 * 32; tree2.y = 19 * 32; tree2.appearance = 'tree'; }
  const tree3 = wx.monsters.find(m => m.id === 'mob_tree_3');
  if (tree3) { tree3.x = 14 * 32; tree3.y = 22 * 32; tree3.appearance = 'tree'; }
  const tree4 = wx.monsters.find(m => m.id === 'mob_tree_4');
  if (tree4) { tree4.x = 20 * 32; tree4.y = 22 * 32; tree4.appearance = 'tree'; }
}

// 4. 校准天宫与花果山 NPC 外观
{
  const tg = maps['tiangong_palace'];
  if (tg) {
    const tp = tg.npcs.find(n => n.id === 'npc_tianpeng');
    if (tp) { tp.appearance = 'tianpeng_marshal'; tp.icon = '🎖️'; }
    const jl = tg.npcs.find(n => n.id === 'npc_juling_shen');
    if (jl) { jl.appearance = 'juling_shen'; jl.icon = '🪓'; }
  }

  const hg = maps['huaguoshan'];
  if (hg) {
    const tb = hg.npcs.find(n => n.id === 'npc_tongbi_yuan');
    if (tb) { tb.appearance = 'stone_monkey'; }
    hg.monsters.forEach(m => {
      if (m.name.includes('小石猴')) m.appearance = 'stone_monkey';
      if (m.name.includes('灵狐') || m.name.includes('野狐')) m.appearance = 'fox';
    });
  }

  const sl = maps['huaguoshan_shuilien'];
  if (sl) {
    const cm = sl.npcs.find(n => n.id === 'npc_chimao_mahou');
    if (cm) { cm.appearance = 'chimao_mahou'; }
    const jl = sl.npcs.find(n => n.id === 'npc_juling_shen');
    if (jl) { jl.appearance = 'juling_shen'; jl.icon = '🪓'; }
    const hk = sl.npcs.find(n => n.id === 'npc_huaguo_monkey');
    if (hk) { hk.appearance = 'stone_monkey'; }
  }
}

// 写入回 js/data/maps2d.js
const fullCode = 'window.GAME_DATA = window.GAME_DATA || {};\nwindow.GAME_DATA.MAPS_2D = ' + JSON.stringify(maps, null, 2) + ';\n';
fs.writeFileSync('js/data/maps2d.js', fullCode, 'utf8');
console.log('Successfully upgraded maps2d.js with clean walkable coordinates for all NPCs and mobs!');
