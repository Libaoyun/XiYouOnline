const fs = require('fs');

const globalWindow = { GAME_DATA: {} };
global.window = globalWindow;

const mapsContent = fs.readFileSync('js/data/maps2d.js', 'utf8');
eval(mapsContent);

const MAPS = window.GAME_DATA.MAPS_2D;

// 1. huaguoshan: 增加天庭前锋营神将，赤毛马猴移到水帘洞，增加大圣在主山决战
const hgs = MAPS.huaguoshan;
hgs.npcs = [
  {
    id: "npc_tianbing_scout",
    name: "天庭前锋营神将",
    title: "【征讨前锋】",
    x: 608,
    y: 704,
    appearance: "heaven_general",
    icon: "⚔️",
    dialogueKey: "huaguoshan_arrival"
  },
  {
    id: "npc_tongbi_yuan",
    name: "通臂猿猴",
    title: "【引路老猴】",
    x: 544,
    y: 224,
    appearance: "sun_wukong",
    icon: "🐒",
    dialogueKey: "tongbi_talk"
  },
  {
    id: "npc_wukong_huaguo",
    name: "齐天大圣孙悟空",
    title: "【齐天大圣】",
    x: 608,
    y: 352,
    appearance: "sun_wukong",
    icon: "🐒",
    dialogueKey: "wukong_huaguoshan_havoc"
  }
];

// 2. huaguoshan_shuilien: 部署赤毛马猴(入口)、巨灵神(深处)、受困小猴
const sl = MAPS.huaguoshan_shuilien;
sl.npcs = [
  {
    id: "npc_chimao_mahou",
    name: "赤毛马猴",
    title: "【花果山健将】",
    x: 608,
    y: 576,
    appearance: "sun_wukong",
    icon: "🐒",
    dialogueKey: "chimao_in_shuilien"
  },
  {
    id: "npc_juling_shen",
    name: "征讨先锋·巨灵神",
    title: "【征讨先锋】",
    x: 640,
    y: 352,
    appearance: "bull_demon",
    icon: "👹",
    dialogueKey: "juling_shuilien_battle"
  },
  {
    id: "npc_huaguo_monkey",
    name: "花果山受困小猴",
    title: "【无辜小猴】",
    x: 576,
    y: 352,
    appearance: "sun_wukong",
    icon: "🐒",
    dialogueKey: "huaguo_monkey_talk"
  }
];

// 3. liujiacun: 部署 4 朵野生青蘑菇与 4 只偷粮硕鼠
const ljc = MAPS.liujiacun;
ljc.npcs = [
  {
    id: "npc_liuboqin",
    name: "刘伯钦",
    title: "【镇山太保】",
    x: 448,
    y: 416,
    appearance: "liu_boqin",
    icon: "🏹",
    dialogueKey: "liuboqin_talk"
  },
  {
    id: "npc_village_elder",
    name: "刘太公",
    title: "【村长老者】",
    x: 320,
    y: 320,
    appearance: "liu_taigong",
    icon: "👴",
    dialogueKey: "liutaigong_talk"
  },
  {
    id: "npc_liujia_tudi",
    name: "刘家村土地公",
    title: "【当方土地】",
    x: 832,
    y: 416,
    appearance: "tudi_gong",
    icon: "🌿",
    dialogueKey: "liujia_tudi_talk"
  },
  {
    id: "prop_mushroom_1",
    name: "野生青蘑菇",
    title: "【鲜嫩野蕈】",
    x: 224,
    y: 288,
    appearance: "mushroom",
    icon: "🍄",
    dialogueKey: "pickup_mushroom"
  },
  {
    id: "prop_mushroom_2",
    name: "野生青蘑菇",
    title: "【鲜嫩野蕈】",
    x: 384,
    y: 608,
    appearance: "mushroom",
    icon: "🍄",
    dialogueKey: "pickup_mushroom"
  },
  {
    id: "prop_mushroom_3",
    name: "野生青蘑菇",
    title: "【鲜嫩野蕈】",
    x: 864,
    y: 256,
    appearance: "mushroom",
    icon: "🍄",
    dialogueKey: "pickup_mushroom"
  },
  {
    id: "prop_mushroom_4",
    name: "野生青蘑菇",
    title: "【鲜嫩野蕈】",
    x: 832,
    y: 640,
    appearance: "mushroom",
    icon: "🍄",
    dialogueKey: "pickup_mushroom"
  }
];

ljc.monsters = [
  {
    id: "mob_rat_1",
    name: "偷粮硕鼠 (北仓)",
    icon: "🐀",
    appearance: "giant_rat",
    x: 704,
    y: 256,
    level: 2,
    hp: 90,
    maxHp: 90,
    atk: 20,
    def: 10,
    spd: 24,
    skills: ["撕咬"],
    patrolRadius: 35
  },
  {
    id: "mob_rat_2",
    name: "偷粮硕鼠 (南垄)",
    icon: "🐀",
    appearance: "giant_rat",
    x: 704,
    y: 704,
    level: 3,
    hp: 110,
    maxHp: 110,
    atk: 24,
    def: 12,
    spd: 26,
    skills: ["撕咬", "利爪"],
    patrolRadius: 35
  },
  {
    id: "mob_rat_3",
    name: "偷粮硕鼠 (西畦)",
    icon: "🐀",
    appearance: "giant_rat",
    x: 320,
    y: 704,
    level: 2,
    hp: 95,
    maxHp: 95,
    atk: 22,
    def: 11,
    spd: 25,
    skills: ["撕咬"],
    patrolRadius: 35
  },
  {
    id: "mob_rat_4",
    name: "偷粮硕鼠 (东篱)",
    icon: "🐀",
    appearance: "giant_rat",
    x: 512,
    y: 224,
    level: 3,
    hp: 105,
    maxHp: 105,
    atk: 23,
    def: 11,
    spd: 25,
    skills: ["撕咬"],
    patrolRadius: 35
  }
];

// 4. wuxingshan: 确保 4 株枯树精
const wxs = MAPS.wuxingshan;
wxs.monsters = [
  {
    id: "mob_snake_1",
    name: "盘石小青蛇 (幽径)",
    appearance: "snake",
    x: 288,
    y: 384,
    level: 8,
    hp: 480,
    maxHp: 480,
    atk: 68,
    def: 38,
    spd: 28,
    skills: ["毒牙"],
    patrolRadius: 30
  },
  {
    id: "mob_snake_2",
    name: "盘石小青蛇 (崖下)",
    appearance: "snake",
    x: 864,
    y: 384,
    level: 8,
    hp: 490,
    maxHp: 490,
    atk: 69,
    def: 38,
    spd: 28,
    skills: ["毒牙"],
    patrolRadius: 30
  },
  {
    id: "mob_fox_1",
    name: "巡山小野狐 (松林)",
    appearance: "fox",
    x: 384,
    y: 640,
    level: 9,
    hp: 560,
    maxHp: 560,
    atk: 75,
    def: 42,
    spd: 32,
    skills: ["灵狐扑"],
    patrolRadius: 35
  },
  {
    id: "mob_fox_2",
    name: "巡山小野狐 (东麓)",
    appearance: "fox",
    x: 768,
    y: 640,
    level: 9,
    hp: 580,
    maxHp: 580,
    atk: 76,
    def: 42,
    spd: 32,
    skills: ["灵狐扑"],
    patrolRadius: 35
  },
  {
    id: "mob_tree_demon",
    name: "百年枯树精 (左峰)",
    appearance: "tree",
    x: 224,
    y: 512,
    level: 10,
    hp: 720,
    maxHp: 720,
    atk: 85,
    def: 48,
    spd: 20,
    skills: ["枯木逢春"],
    patrolRadius: 20
  },
  {
    id: "mob_tree_2",
    name: "百年枯树精 (右绝)",
    appearance: "tree",
    x: 928,
    y: 512,
    level: 10,
    hp: 750,
    maxHp: 750,
    atk: 88,
    def: 50,
    spd: 20,
    skills: ["枯木逢春"],
    patrolRadius: 20
  },
  {
    id: "mob_tree_3",
    name: "百年枯树精 (前岗)",
    appearance: "tree",
    x: 384,
    y: 448,
    level: 10,
    hp: 730,
    maxHp: 730,
    atk: 86,
    def: 49,
    spd: 20,
    skills: ["枯木逢春"],
    patrolRadius: 20
  },
  {
    id: "mob_tree_4",
    name: "百年枯树精 (后峦)",
    appearance: "tree",
    x: 832,
    y: 448,
    level: 10,
    hp: 740,
    maxHp: 740,
    atk: 87,
    def: 49,
    spd: 20,
    skills: ["枯木逢春"],
    patrolRadius: 20
  }
];

// 5. changan_city: 增加唐太宗与城门刘伯钦
const cgc = MAPS.changan_city;
if (!cgc.npcs.some(n => n.id === 'npc_tangtaizong')) {
  cgc.npcs.push({
    id: "npc_tangtaizong",
    name: "唐太宗·李世民",
    title: "【大唐圣天子】",
    x: 736,
    y: 160,
    appearance: "heaven_general",
    icon: "👑",
    dialogueKey: "tangtaizong_talk"
  });
}
if (!cgc.npcs.some(n => n.id === 'npc_liuboqin_changan')) {
  cgc.npcs.push({
    id: "npc_liuboqin_changan",
    name: "刘伯钦 (送行)",
    title: "【镇山太保】",
    x: 96,
    y: 512,
    appearance: "liu_boqin",
    icon: "🏹",
    dialogueKey: "changan_farewell_liuboqin"
  });
}

// 6. chentangguan: 确保李靖总兵、海滨老渔翁、观音菩萨
const ctg = MAPS.chentangguan;
ctg.npcs = [
  {
    id: "npc_li_jing",
    name: "李靖总兵",
    title: "【陈塘关总兵】",
    x: 256,
    y: 320,
    appearance: "heaven_general",
    icon: "👑",
    dialogueKey: "chentang_lijing_talk"
  },
  {
    id: "npc_fisherman",
    name: "海滨老渔翁",
    title: "【东海老渔】",
    x: 832,
    y: 512,
    appearance: "fisherman",
    icon: "🎣",
    dialogueKey: "fisherman_talk"
  },
  {
    id: "npc_guanyin_pu_sa",
    name: "观世音菩萨",
    title: "【大慈大悲】",
    x: 512,
    y: 384,
    appearance: "guanyin",
    icon: "🪷",
    dialogueKey: "chentang_guanyin_revelation"
  }
];

// 7. donghai_coast: 部署巡海夜叉·李艮与东海龙王敖广
const dhc = MAPS.donghai_coast;
dhc.npcs = [
  {
    id: "npc_yecha",
    name: "巡海夜叉·李艮",
    title: "【东海凶煞】",
    x: 640,
    y: 448,
    appearance: "bull_demon",
    icon: "🔱",
    dialogueKey: "donghai_yecha_battle"
  },
  {
    id: "npc_aoguang_coast",
    name: "东海龙王敖广",
    title: "【水府龙君】",
    x: 736,
    y: 448,
    appearance: "xiaobailong",
    icon: "🐉",
    dialogueKey: "donghai_dragon_apology"
  }
];

// 确保东海之滨有直通龙宫的传送门或保留现有
if (!dhc.portals.some(p => p.targetMap === 'longgong_palace')) {
  dhc.portals.push({
    x: 832,
    y: 448,
    targetMap: "longgong_palace",
    targetX: 128,
    targetY: 448,
    name: "东海龙宫"
  });
}

// 8. longgong_palace: 东海龙王敖广(宝库赠装)与返回东海传送门
const lgp = MAPS.longgong_palace;
lgp.npcs = [
  {
    id: "npc_aoguang",
    name: "东海龙王敖广",
    title: "【东海之主】",
    x: 832,
    y: 416,
    appearance: "xiaobailong",
    icon: "🐉",
    dialogueKey: "longgong_receive_armor"
  }
];
if (!lgp.portals.some(p => p.targetMap === 'donghai_coast')) {
  lgp.portals.push({
    x: 96,
    y: 448,
    targetMap: "donghai_coast",
    targetX: 800,
    targetY: 448,
    name: "东海之滨"
  });
}

// 输出新的 maps2d.js
const updatedContent = 'window.GAME_DATA = window.GAME_DATA || {};\nwindow.GAME_DATA.MAPS_2D = ' + JSON.stringify(MAPS, null, 2) + ';\n';
fs.writeFileSync('js/data/maps2d.js', updatedContent, 'utf8');
console.log('✅ maps2d.js successfully updated!');
