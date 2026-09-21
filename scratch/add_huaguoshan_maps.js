const fs = require('fs');
const path = require('path');

const mapsFile = path.join(__dirname, '../js/data/maps2d.js');
let content = fs.readFileSync(mapsFile, 'utf8');

// 构造 38x28 瓦片矩阵辅助函数
function createTileGrid(defaultTile, modifierFn) {
  const grid = [];
  for (let r = 0; r < 28; r++) {
    const row = [];
    for (let c = 0; c < 38; c++) {
      let tile = defaultTile;
      if (r === 0 || r === 27 || c === 0 || c === 37) {
        tile = 'mountain_rock';
      }
      if (modifierFn) {
        tile = modifierFn(r, c, tile);
      }
      row.push(tile);
    }
    grid.push(row);
  }
  return grid;
}

// 1. 花果山主景瓦片 (苍翠仙山、桃花林道、北侧飞瀑)
const huaguoTiles = createTileGrid('grass', (r, c, current) => {
  // 北侧飞瀑
  if (r >= 2 && r <= 4 && c >= 16 && c <= 22) {
    if (r === 4 && (c === 18 || c === 19 || c === 20)) {
      return 'dirt_road'; // 水帘洞石矶入口桥
    }
    return 'water';
  }
  // 中部与南部主干石道
  if (c >= 18 && c <= 20 && r >= 5 && r <= 26) {
    return 'dirt_road';
  }
  // 横向观桃小径
  if (r >= 13 && r <= 15 && c >= 6 && c <= 31) {
    return 'dirt_road';
  }
  return current;
});

// 2. 水帘洞内天福地瓦片 (石质地面、古岩石笋、两侧甘泉)
const shuilienTiles = createTileGrid('cave_floor', (r, c, current) => {
  // 两侧清泉
  if (r >= 8 && r <= 18 && ((c >= 4 && c <= 7) || (c >= 30 && c <= 33))) {
    return 'water';
  }
  // 中央石板神道
  if (c >= 17 && c <= 21 && r >= 4 && r <= 25) {
    return 'cave_floor';
  }
  return current;
});

const huaguoshanMap = {
  id: "huaguoshan",
  name: "东胜神洲·花果山",
  region: "十洲之祖脉",
  width: 38,
  height: 28,
  tiles: huaguoTiles,
  playerSpawn: {
    x: 19 * 32,
    y: 24 * 32,
    direction: "up"
  },
  npcs: [
    {
      id: "npc_chimao_mahou",
      name: "赤毛马猴",
      title: "【花果山健将】",
      x: 19 * 32,
      y: 19 * 32,
      appearance: "sun_wukong",
      icon: "🐒",
      dialogueKey: "chimao_encounter"
    },
    {
      id: "npc_juling_shen",
      name: "征讨先锋·巨灵神",
      title: "【征讨先锋】",
      x: 18 * 32,
      y: 8 * 32,
      appearance: "bull_demon",
      icon: "👹",
      dialogueKey: "huaguoshan_battle_intro"
    },
    {
      id: "npc_huaguo_monkey",
      name: "花果山受困小猴",
      title: "【无辜小猴】",
      x: 20 * 32,
      y: 8 * 32,
      appearance: "sun_wukong",
      icon: "🐒",
      dialogueKey: "huaguoshan_battle_intro"
    },
    {
      id: "npc_wukong_huaguo",
      name: "齐天大圣孙悟空",
      title: "【美猴王】",
      x: 19 * 32,
      y: 5 * 32,
      appearance: "sun_wukong",
      icon: "🐒",
      dialogueKey: "wukong_respect_scene"
    }
  ],
  monsters: [
    {
      id: "mob_hg_monkey_1",
      name: "巡山小石猴",
      title: "【守山精怪】",
      level: 12,
      hp: 650,
      maxHp: 650,
      atk: 75,
      def: 45,
      spd: 28,
      x: 12 * 32,
      y: 14 * 32,
      templateId: "wukong",
      skills: ["连击"]
    },
    {
      id: "mob_hg_monkey_2",
      name: "巡山小石猴",
      title: "【守山精怪】",
      level: 12,
      hp: 650,
      maxHp: 650,
      atk: 75,
      def: 45,
      spd: 28,
      x: 26 * 32,
      y: 14 * 32,
      templateId: "wukong",
      skills: ["连击"]
    },
    {
      id: "mob_hg_fox_1",
      name: "花果灵狐",
      title: "【仙山灵兽】",
      level: 14,
      hp: 780,
      maxHp: 780,
      atk: 88,
      def: 50,
      spd: 32,
      x: 12 * 32,
      y: 20 * 32,
      templateId: "fox",
      skills: ["妖气侵蚀"]
    },
    {
      id: "mob_hg_fox_2",
      name: "花果灵狐",
      title: "【仙山灵兽】",
      level: 14,
      hp: 780,
      maxHp: 780,
      atk: 88,
      def: 50,
      spd: 32,
      x: 26 * 32,
      y: 20 * 32,
      templateId: "fox",
      skills: ["妖气侵蚀"]
    }
  ],
  portals: [
    {
      x: 19 * 32,
      y: 4 * 32,
      targetMap: "huaguoshan_shuilien",
      targetX: 19 * 32,
      targetY: 23 * 32,
      name: "水帘洞天"
    },
    {
      x: 19 * 32,
      y: 26 * 32,
      targetMap: "tiangong_palace",
      targetX: 192,
      targetY: 448,
      name: "南天门"
    }
  ]
};

const shuilienMap = {
  id: "huaguoshan_shuilien",
  name: "花果山·水帘洞",
  region: "福地洞天",
  width: 38,
  height: 28,
  tiles: shuilienTiles,
  playerSpawn: {
    x: 19 * 32,
    y: 23 * 32,
    direction: "up"
  },
  npcs: [
    {
      id: "npc_tongbi_yuan",
      name: "通臂猿猴",
      title: "【水帘洞总管】",
      x: 19 * 32,
      y: 11 * 32,
      appearance: "sun_wukong",
      icon: "🐒",
      dialogueKey: "tongbi_talk"
    }
  ],
  monsters: [],
  portals: [
    {
      x: 19 * 32,
      y: 25 * 32,
      targetMap: "huaguoshan",
      targetX: 19 * 32,
      targetY: 5 * 32,
      name: "花果山"
    }
  ]
};

// 拼接并写回 maps2d.js
// 寻找末尾的最后一个 "};\n"
const lastBraceIdx = content.lastIndexOf('};\n');
if (lastBraceIdx === -1) {
  console.error('未找到 maps2d.js 的闭合位置');
  process.exit(1);
}

const huaguoStr = ',\n  "huaguoshan": ' + JSON.stringify(huaguoshanMap, null, 2) + ',\n  "huaguoshan_shuilien": ' + JSON.stringify(shuilienMap, null, 2);
content = content.slice(0, lastBraceIdx) + huaguoStr + '\n};\n';

fs.writeFileSync(mapsFile, content, 'utf8');
console.log('✅ 成功将【huaguoshan】与【huaguoshan_shuilien】写入 maps2d.js！');
