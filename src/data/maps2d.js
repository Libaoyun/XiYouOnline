/**
 * 汉风西游 - 2D 真实网格地图数据库 (Maps2D)
 * 严格还原正统西游主线地理：天宫大闹天宫 -> 两界山刘家村 -> 大唐都城长安 -> 五行山救大圣
 */

function createGrid(w, h, fillTile) {
  const grid = [];
  for (let r = 0; r < h; r++) {
    const row = [];
    for (let c = 0; c < w; c++) {
      row.push(fillTile);
    }
    grid.push(row);
  }
  return grid;
}

export const MAPS_2D = {
  // =========================================================================
  // 1. 序章：天宫·南天门与凌霄宝殿
  // =========================================================================
  tiangong_palace: {
    id: 'tiangong_palace',
    name: '天宫·南天门与凌霄宝殿',
    region: '九重天阙',
    width: 22,
    height: 18,
    tiles: (() => {
      const g = createGrid(22, 18, 'heaven_floor');
      // 四周深渊云海
      for (let r = 0; r < 18; r++) {
        g[r][0] = 'cloud_void';
        g[r][1] = 'cloud_void';
        g[r][20] = 'cloud_void';
        g[r][21] = 'cloud_void';
      }
      for (let c = 0; c < 22; c++) {
        g[0][c] = 'cloud_void';
        g[1][c] = 'cloud_void';
        g[17][c] = 'cloud_void';
      }
      // 左右蟠龙天柱
      g[4][5] = 'heaven_pillar';
      g[4][16] = 'heaven_pillar';
      g[8][5] = 'heaven_pillar';
      g[8][16] = 'heaven_pillar';
      g[12][5] = 'heaven_pillar';
      g[12][16] = 'heaven_pillar';
      return g;
    })(),
    playerSpawn: { x: 11 * 32, y: 13 * 32, direction: 'up' },
    npcs: [
      {
        id: 'npc_taibai',
        name: '太白金星',
        title: '【天庭老仙】',
        x: 8 * 32,
        y: 10 * 32,
        appearance: 'tang_seng',
        icon: '👴',
        dialogueKey: 'taibai_intro'
      },
      {
        id: 'npc_litianwang',
        name: '托塔李天王',
        title: '【降魔大元帅】',
        x: 13 * 32,
        y: 8 * 32,
        appearance: 'heaven_general',
        icon: '👑',
        dialogueKey: 'litianwang_intro'
      },
      {
        id: 'npc_wukong_heaven',
        name: '齐天大圣孙悟空',
        title: '【大闹天宫】',
        x: 11 * 32,
        y: 4 * 32,
        appearance: 'sun_wukong',
        icon: '🐒',
        dialogueKey: 'wukong_heaven_encounter'
      }
    ],
    monsters: [],
    portals: [
      { x: 3 * 32, y: 13 * 32, targetMap: 'tiangong_yuma', targetX: 12 * 32, targetY: 13 * 32, name: '西去【天宫·御马监】选领坐骑' },
      { x: 19 * 32, y: 13 * 32, targetMap: 'tiangong_pantao', targetX: 12 * 32, targetY: 13 * 32, name: '东入【天宫·蟠桃胜境】采摘仙桃' }
    ]
  },

  // =========================================================================
  // 天宫·御马监 (新手挑选领养坐骑、训练升级增生命攻击)
  // =========================================================================
  tiangong_yuma: {
    id: 'tiangong_yuma',
    name: '天宫·御马监',
    region: '天马仙厩',
    width: 20,
    height: 16,
    tiles: (() => {
      const g = createGrid(20, 16, 'heaven_floor');
      for (let r = 0; r < 16; r++) {
        g[r][0] = 'cloud_void';
        g[r][19] = 'cloud_void';
      }
      for (let c = 0; c < 20; c++) {
        g[0][c] = 'cloud_void';
        g[15][c] = 'cloud_void';
      }
      // 仙马围栏柱
      g[5][4] = 'heaven_pillar';
      g[5][15] = 'heaven_pillar';
      g[10][4] = 'heaven_pillar';
      g[10][15] = 'heaven_pillar';
      return g;
    })(),
    playerSpawn: { x: 10 * 32, y: 12 * 32, direction: 'up' },
    npcs: [
      {
        id: 'npc_bimawen',
        name: '弼马温 (孙悟空)',
        title: '【御马监主事】',
        x: 10 * 32,
        y: 6 * 32,
        appearance: 'sun_wukong',
        icon: '🐒',
        dialogueKey: 'bimawen_mount_gift'
      },
      {
        id: 'npc_yuma_guanyuan',
        name: '御马监监副',
        title: '【坐骑驯化】',
        x: 6 * 32,
        y: 8 * 32,
        appearance: 'heaven_general',
        icon: '🐎',
        dialogueKey: 'mount_train_npc'
      }
    ],
    monsters: [],
    portals: [
      { x: 10 * 32, y: 14 * 32, targetMap: 'tiangong_palace', targetX: 4 * 32, targetY: 13 * 32, name: '返回【凌霄宝殿】' }
    ]
  },

  // =========================================================================
  // 天宫·蟠桃园 (每日采摘品尝仙桃，海量经验飞速升级)
  // =========================================================================
  tiangong_pantao: {
    id: 'tiangong_pantao',
    name: '天宫·蟠桃胜境',
    region: '瑶池仙境',
    width: 20,
    height: 16,
    tiles: (() => {
      const g = createGrid(20, 16, 'grass');
      for (let r = 0; r < 16; r++) {
        g[r][0] = 'cloud_void';
        g[r][19] = 'cloud_void';
      }
      for (let c = 0; c < 20; c++) {
        g[0][c] = 'cloud_void';
        g[15][c] = 'cloud_void';
      }
      // 蟠桃古树与瑶池
      g[4][10] = 'bamboo';
      g[5][9] = 'bamboo';
      g[5][11] = 'bamboo';
      g[6][10] = 'bamboo';

      g[10][6] = 'water';
      g[10][7] = 'water';
      g[11][6] = 'water';
      g[11][7] = 'water';
      return g;
    })(),
    playerSpawn: { x: 10 * 32, y: 12 * 32, direction: 'up' },
    npcs: [
      {
        id: 'npc_pantao_tudi',
        name: '蟠桃园土地',
        title: '【园苑执事】',
        x: 10 * 32,
        y: 8 * 32,
        appearance: 'tang_seng',
        icon: '👴',
        dialogueKey: 'pantao_tudi_talk'
      },
      {
        id: 'npc_qixiannv',
        name: '红衣仙女',
        title: '【采桃仙子】',
        x: 14 * 32,
        y: 7 * 32,
        appearance: 'tang_seng',
        icon: '🧚‍♀️',
        dialogueKey: 'qixiannv_talk'
      }
    ],
    monsters: [],
    portals: [
      { x: 10 * 32, y: 14 * 32, targetMap: 'tiangong_palace', targetX: 18 * 32, targetY: 13 * 32, name: '返回【凌霄宝殿】' }
    ]
  },

  // =========================================================================
  // 2. 第一章：凡间·两界山刘家村 (重获新生，遇刘伯钦)
  // =========================================================================
  liujiacun: {
    id: 'liujiacun',
    name: '双叉岭·刘家村',
    region: '两界山下',
    width: 26,
    height: 20,
    tiles: (() => {
      const g = createGrid(26, 20, 'grass');
      // 泥土路径 (十字主路)
      for (let c = 0; c < 26; c++) g[10][c] = 'dirt_path';
      for (let r = 0; r < 20; r++) g[r][12] = 'dirt_path';

      // 猎户茅屋
      for (let r = 4; r <= 7; r++) {
        for (let c = 4; c <= 8; c++) {
          g[r][c] = 'hut_wall';
        }
      }
      g[7][6] = 'dirt_path'; // 茅屋大门

      // 修竹丛林
      g[3][15] = 'bamboo';
      g[3][16] = 'bamboo';
      g[4][15] = 'bamboo';
      g[4][16] = 'bamboo';
      g[5][15] = 'bamboo';

      // 清流山涧
      for (let r = 14; r < 20; r++) {
        g[r][18] = 'water';
        g[r][19] = 'water';
      }
      return g;
    })(),
    playerSpawn: { x: 6 * 32, y: 9 * 32, direction: 'down' },
    npcs: [
      {
        id: 'npc_liuboqin',
        name: '刘伯钦',
        title: '【镇山太保】',
        x: 10 * 32,
        y: 9 * 32,
        appearance: 'liu_boqin',
        icon: '🏹',
        dialogueKey: 'liuboqin_talk'
      },
      {
        id: 'npc_village_elder',
        name: '刘太公',
        title: '【村长老者】',
        x: 8 * 32,
        y: 12 * 32,
        appearance: 'tang_seng',
        icon: '👴',
        dialogueKey: 'liutaigong_talk'
      }
    ],
    monsters: [
      {
        id: 'mob_wolf_1',
        name: '双叉岭恶狼',
        icon: '🐺',
        x: 16 * 32,
        y: 6 * 32,
        level: 3,
        hp: 120,
        maxHp: 120,
        atk: 28,
        def: 14,
        spd: 22,
        patrolRadius: 30
      },
      {
        id: 'mob_tiger_1',
        name: '下山吊睛猛虎',
        icon: '🐅',
        x: 20 * 32,
        y: 12 * 32,
        level: 6,
        hp: 260,
        maxHp: 260,
        atk: 45,
        def: 22,
        spd: 26,
        patrolRadius: 40
      }
    ],
    portals: [
      { x: 25 * 32, y: 10 * 32, targetMap: 'changan_city', targetX: 3 * 32, targetY: 11 * 32, name: '东行前往【大唐长安城】' },
      { x: 1 * 32, y: 10 * 32, targetMap: 'wuxingshan', targetX: 23 * 32, targetY: 10 * 32, name: '西行前往【两界山·五行山】' }
    ]
  },

  // =========================================================================
  // 3. 第二章：大唐国都·长安城 (见玄奘、受菩萨点化)
  // =========================================================================
  changan_city: {
    id: 'changan_city',
    name: '大唐王都·长安城',
    region: '盛唐帝阙',
    width: 28,
    height: 22,
    tiles: (() => {
      const g = createGrid(28, 22, 'changan_stone');
      // 外城墙
      for (let c = 0; c < 28; c++) {
        g[0][c] = 'city_wall';
        g[21][c] = 'city_wall';
      }
      for (let r = 0; r < 22; r++) {
        g[r][0] = 'city_wall';
        g[r][27] = 'city_wall';
      }
      // 城门出入口
      g[11][0] = 'changan_stone';
      g[10][0] = 'changan_stone';

      // 化生寺大殿围墙
      for (let r = 4; r <= 8; r++) {
        for (let c = 18; c <= 24; c++) {
          g[r][c] = 'city_wall';
        }
      }
      g[8][21] = 'changan_stone'; // 寺庙山门
      return g;
    })(),
    playerSpawn: { x: 3 * 32, y: 11 * 32, direction: 'right' },
    npcs: [
      {
        id: 'npc_xuanzang',
        name: '玄奘法师 (唐僧)',
        title: '【金山寺高僧】',
        x: 21 * 32,
        y: 6 * 32,
        appearance: 'tang_seng',
        icon: '🧘‍♂️',
        dialogueKey: 'xuanzang_talk'
      },
      {
        id: 'npc_guanyin',
        name: '观音菩萨 (化身)',
        title: '【大慈大悲】',
        x: 16 * 32,
        y: 7 * 32,
        appearance: 'tang_seng',
        icon: '🪷',
        dialogueKey: 'guanyin_talk'
      },
      {
        id: 'npc_blacksmith',
        name: '李铁匠',
        title: '【神兵淬火】',
        x: 8 * 32,
        y: 15 * 32,
        appearance: 'liu_boqin',
        icon: '🔨',
        dialogueKey: 'blacksmith_talk'
      },
      {
        id: 'npc_shop',
        name: '万宝商贾',
        title: '【百宝货铺】',
        x: 12 * 32,
        y: 15 * 32,
        appearance: 'liu_boqin',
        icon: '🏮',
        dialogueKey: 'shop_talk'
      },
      {
        id: 'npc_tiangong_guide',
        name: '飞升仙官',
        title: '【接引天界】',
        x: 6 * 32,
        y: 7 * 32,
        appearance: 'tang_seng',
        icon: '☁️',
        dialogueKey: 'tiangong_guide_talk'
      }
    ],
    monsters: [],
    portals: [
      { x: 1 * 32, y: 11 * 32, targetMap: 'liujiacun', targetX: 24 * 32, targetY: 10 * 32, name: '出西门返回【刘家村】' },
      { x: 26 * 32, y: 11 * 32, targetMap: 'tiangong_pantao', targetX: 10 * 32, targetY: 13 * 32, name: '登仙云飞升【蟠桃园吃桃】' }
    ]
  },

  // =========================================================================
  // 4. 第三章：两界山·五行山 (救出齐天大圣)
  // =========================================================================
  wuxingshan: {
    id: 'wuxingshan',
    name: '两界山·五行山',
    region: '大圣蒙尘地',
    width: 26,
    height: 20,
    tiles: (() => {
      const g = createGrid(26, 20, 'grass');
      // 崎岖山路
      for (let c = 0; c < 26; c++) g[10][c] = 'dirt_path';

      // 巍峨五指岩壁
      for (let r = 2; r <= 8; r++) {
        for (let c = 6; c <= 18; c++) {
          g[r][c] = 'mountain_rock';
        }
      }
      // 山顶真言金帖压帖处
      g[3][12] = 'wuxing_seal';
      g[4][12] = 'dirt_path'; // 攀山小道
      g[5][12] = 'dirt_path';
      g[6][12] = 'dirt_path';
      g[7][12] = 'dirt_path';
      g[8][12] = 'dirt_path';
      return g;
    })(),
    playerSpawn: { x: 23 * 32, y: 10 * 32, direction: 'left' },
    npcs: [
      {
        id: 'npc_wukong_sealed',
        name: '孙悟空 (压于山下)',
        title: '【齐天大圣】',
        x: 12 * 32,
        y: 9 * 32,
        appearance: 'sun_wukong',
        icon: '🐒',
        dialogueKey: 'wukong_sealed_talk'
      },
      {
        id: 'npc_mountain_god',
        name: '五行山土地神',
        title: '【当方土地】',
        x: 15 * 32,
        y: 11 * 32,
        appearance: 'tang_seng',
        icon: '🌿',
        dialogueKey: 'mountain_god_talk'
      }
    ],
    monsters: [],
    portals: [
      { x: 25 * 32, y: 10 * 32, targetMap: 'liujiacun', targetX: 2 * 32, targetY: 10 * 32, name: '东回【双叉岭刘家村】' }
    ]
  }
};

export function getMap(mapId) {
  return MAPS_2D[mapId] || MAPS_2D.tiangong_palace;
}
