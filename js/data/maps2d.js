/**
 * 汉风西游 - 2D 真实网格地图数据库 (Maps2D)
 * 严格还原正统西游主线地理：天宫大闹天宫 -> 两界山刘家村 -> 大唐都城长安 -> 五行山救大圣
 */

window.GAME_DATA = window.GAME_DATA || {};

// 辅助快速生成固定宽高的瓦片矩阵
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

window.GAME_DATA.MAPS_2D = {
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
        name: '弼马温',
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
      },
      {
        id: 'npc_liujia_tudi',
        name: '刘家村土地公',
        title: '【当方土地】',
        x: 23 * 32,
        y: 9 * 32,
        appearance: 'tang_seng',
        icon: '🌿',
        dialogueKey: 'liujia_tudi_talk'
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
  // 3. 第二章：大唐国都·长安城 (见玄奘、受菩萨点化、钱庄、医馆、定居)
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
      // 城门出入口：西门、南门
      g[11][0] = 'changan_stone';
      g[10][0] = 'changan_stone';
      g[21][14] = 'changan_stone';
      g[21][15] = 'changan_stone';

      // 化生寺大殿围墙
      for (let r = 4; r <= 8; r++) {
        for (let c = 18; c <= 24; c++) {
          g[r][c] = 'city_wall';
        }
      }
      g[8][21] = 'changan_stone';
      return g;
    })(),
    playerSpawn: { x: 3 * 32, y: 11 * 32, direction: 'right' },
    npcs: [
      {
        id: 'npc_qianzhuang',
        name: '钱庄掌柜',
        title: '【通达三界】',
        x: 5 * 32,
        y: 8 * 32,
        appearance: 'liu_boqin',
        icon: '💰',
        dialogueKey: 'qianzhuang_talk'
      },
      {
        id: 'npc_yishi',
        name: '回生老医师',
        title: '【妙手回春】',
        x: 5 * 32,
        y: 14 * 32,
        appearance: 'tang_seng',
        icon: '🏥',
        dialogueKey: 'yishi_talk'
      },
      {
        id: 'npc_changan_huji',
        name: '长安户籍官',
        title: '【定居户籍】',
        x: 10 * 32,
        y: 8 * 32,
        appearance: 'tang_seng',
        icon: '📜',
        dialogueKey: 'huji_talk'
      },
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
        x: 10 * 32,
        y: 16 * 32,
        appearance: 'liu_boqin',
        icon: '🔨',
        dialogueKey: 'blacksmith_talk'
      },
      {
        id: 'npc_shop',
        name: '万宝商贾',
        title: '【百宝货铺】',
        x: 15 * 32,
        y: 16 * 32,
        appearance: 'liu_boqin',
        icon: '🏮',
        dialogueKey: 'shop_talk'
      },
      {
        id: 'npc_tiangong_guide',
        name: '飞升仙官',
        title: '【接引天界】',
        x: 6 * 32,
        y: 6 * 32,
        appearance: 'tang_seng',
        icon: '☁️',
        dialogueKey: 'tiangong_guide_talk'
      }
    ],
    monsters: [],
    portals: [
      { x: 1 * 32, y: 11 * 32, targetMap: 'liujiacun', targetX: 24 * 32, targetY: 10 * 32, name: '出西门返回【双叉岭刘家村】' },
      { x: 14 * 32, y: 21 * 32, targetMap: 'chentangguan', targetX: 13 * 32, targetY: 2 * 32, name: '出南城门前往【陈塘关】' },
      { x: 26 * 32, y: 11 * 32, targetMap: 'tiangong_pantao', targetX: 10 * 32, targetY: 13 * 32, name: '登仙云飞升【蟠桃园吃桃】' }
    ]
  },

  // =========================================================================
  // 陈塘关 (李靖总兵府、九湾河畔，往东海要塞)
  // =========================================================================
  chentangguan: {
    id: 'chentangguan',
    name: '东海雄关·陈塘关',
    region: '九湾河畔',
    width: 26,
    height: 20,
    tiles: (() => {
      const g = createGrid(26, 20, 'grass');
      // 青石关道
      for (let c = 0; c < 26; c++) g[10][c] = 'dirt_path';
      for (let r = 0; r < 20; r++) g[r][13] = 'dirt_path';

      // 关隘石墙
      for (let r = 0; r < 20; r++) {
        g[r][0] = 'city_wall';
      }
      g[10][0] = 'dirt_path';

      // 九湾河支流水泽
      for (let r = 14; r < 20; r++) {
        for (let c = 16; c < 26; c++) {
          g[r][c] = 'water';
        }
      }
      return g;
    })(),
    playerSpawn: { x: 13 * 32, y: 3 * 32, direction: 'down' },
    npcs: [
      {
        id: 'npc_lijing_zongbing',
        name: '李靖总兵',
        title: '【陈塘关镇守】',
        x: 10 * 32,
        y: 8 * 32,
        appearance: 'heaven_general',
        icon: '🛡️',
        dialogueKey: 'lijing_talk'
      },
      {
        id: 'npc_nezha_child',
        name: '哪吒三太子',
        title: '【混天绫火尖枪】',
        x: 16 * 32,
        y: 8 * 32,
        appearance: 'sun_wukong',
        icon: '🔥',
        dialogueKey: 'nezha_talk'
      }
    ],
    monsters: [],
    portals: [
      { x: 13 * 32, y: 1 * 32, targetMap: 'changan_city', targetX: 14 * 32, targetY: 20 * 32, name: '北上返回【大唐长安城】' },
      { x: 25 * 32, y: 10 * 32, targetMap: 'donghai_coast', targetX: 2 * 32, targetY: 10 * 32, name: '东出关隘前往【东海之滨】' }
    ]
  },

  // =========================================================================
  // 东海之滨 (海天浩瀚，下潜水底可入水晶宫)
  // =========================================================================
  donghai_coast: {
    id: 'donghai_coast',
    name: '碧海波涛·东海之滨',
    region: '东海海岸',
    width: 26,
    height: 20,
    tiles: (() => {
      const g = createGrid(26, 20, 'grass');
      for (let r = 0; r < 20; r++) {
        for (let c = 12; c < 26; c++) {
          g[r][c] = 'water';
        }
      }
      for (let c = 0; c < 12; c++) g[10][c] = 'dirt_path';
      return g;
    })(),
    playerSpawn: { x: 3 * 32, y: 10 * 32, direction: 'right' },
    npcs: [
      {
        id: 'npc_yecha_ligen',
        name: '巡海夜叉',
        title: '【龙宫差役】',
        x: 10 * 32,
        y: 9 * 32,
        appearance: 'liu_boqin',
        icon: '🔱',
        dialogueKey: 'yecha_talk'
      }
    ],
    monsters: [],
    portals: [
      { x: 1 * 32, y: 10 * 32, targetMap: 'chentangguan', targetX: 24 * 32, targetY: 10 * 32, name: '西回【陈塘关】' },
      { x: 14 * 32, y: 10 * 32, targetMap: 'shuijinggong', targetX: 13 * 32, targetY: 3 * 32, name: '避水下潜深入【水底水晶宫】' }
    ]
  },

  // =========================================================================
  // 东海水底·水晶宫 (珊瑚琉璃仙宫，通向龙宫宝殿)
  // =========================================================================
  shuijinggong: {
    id: 'shuijinggong',
    name: '东海水底·水晶宫',
    region: '龙域仙渊',
    width: 24,
    height: 18,
    tiles: (() => {
      const g = createGrid(24, 18, 'dark_water');
      for (let r = 3; r <= 14; r++) {
        for (let c = 5; c <= 18; c++) {
          g[r][c] = 'changan_stone';
        }
      }
      // 水晶立柱
      g[5][7] = 'heaven_pillar';
      g[5][16] = 'heaven_pillar';
      g[12][7] = 'heaven_pillar';
      g[12][16] = 'heaven_pillar';
      return g;
    })(),
    playerSpawn: { x: 12 * 32, y: 4 * 32, direction: 'down' },
    npcs: [
      {
        id: 'npc_guichengxiang',
        name: '龟丞相',
        title: '【水族智者】',
        x: 10 * 32,
        y: 9 * 32,
        appearance: 'tang_seng',
        icon: '🐢',
        dialogueKey: 'guichengxiang_talk'
      }
    ],
    monsters: [],
    portals: [
      { x: 12 * 32, y: 2 * 32, targetMap: 'donghai_coast', targetX: 13 * 32, targetY: 9 * 32, name: '浮出水面返回【东海之滨】' },
      { x: 12 * 32, y: 15 * 32, targetMap: 'longgong_palace', targetX: 12 * 32, targetY: 3 * 32, name: '入殿拜谒【东海龙宫大殿】' }
    ]
  },

  // =========================================================================
  // 东海龙宫大殿 (定海神针铁故地，龙王敖广)
  // =========================================================================
  longgong_palace: {
    id: 'longgong_palace',
    name: '东海龙宫·凌霄宝殿',
    region: '水府至尊',
    width: 24,
    height: 18,
    tiles: (() => {
      const g = createGrid(24, 18, 'changan_stone');
      // 四周海水
      for (let r = 0; r < 18; r++) {
        g[r][0] = 'dark_water';
        g[r][23] = 'dark_water';
      }
      for (let c = 0; c < 24; c++) {
        g[0][c] = 'dark_water';
        g[17][c] = 'dark_water';
      }
      // 龙柱
      g[5][6] = 'heaven_pillar';
      g[5][17] = 'heaven_pillar';
      g[11][6] = 'heaven_pillar';
      g[11][17] = 'heaven_pillar';
      return g;
    })(),
    playerSpawn: { x: 12 * 32, y: 4 * 32, direction: 'down' },
    npcs: [
      {
        id: 'npc_aoguang_longwang',
        name: '东海龙王敖广',
        title: '【四海龙尊】',
        x: 12 * 32,
        y: 7 * 32,
        appearance: 'heaven_general',
        icon: '🐉',
        dialogueKey: 'aoguang_talk'
      }
    ],
    monsters: [],
    portals: [
      { x: 12 * 32, y: 16 * 32, targetMap: 'shuijinggong', targetX: 12 * 32, targetY: 14 * 32, name: '出殿返回【水晶宫】' }
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
      { x: 25 * 32, y: 10 * 32, targetMap: 'liujiacun', targetX: 2 * 32, targetY: 10 * 32, name: '东回【双叉岭刘家村】' },
      { x: 1 * 32, y: 10 * 32, targetMap: 'yingchoujian', targetX: 23 * 32, targetY: 10 * 32, name: '西行前往【蛇盘山·鹰愁涧】' }
    ]
  },

  // =========================================================================
  // 5. 第四章：蛇盘山·鹰愁涧 (小白龙夺马，龙女点化化为白龙马)
  // =========================================================================
  yingchoujian: {
    id: 'yingchoujian',
    name: '蛇盘山·鹰愁涧',
    region: '千丈寒潭',
    width: 26,
    height: 20,
    tiles: (() => {
      const g = createGrid(26, 20, 'grass');
      // 栈道小径
      for (let c = 0; c < 26; c++) g[10][c] = 'dirt_path';
      for (let r = 5; r <= 15; r++) g[r][5] = 'dirt_path';

      // 广阔幽深千丈寒潭
      for (let r = 4; r <= 16; r++) {
        for (let c = 10; c <= 21; c++) {
          g[r][c] = 'dark_water';
        }
      }
      // 峻险陡峭山石
      for (let c = 0; c < 26; c++) {
        g[0][c] = 'mountain_rock';
        g[19][c] = 'mountain_rock';
      }
      return g;
    })(),
    playerSpawn: { x: 23 * 32, y: 10 * 32, direction: 'left' },
    npcs: [
      {
        id: 'npc_tang_seng_yingchou',
        name: '唐三藏',
        title: '【西行圣僧】',
        x: 6 * 32,
        y: 9 * 32,
        appearance: 'tang_seng',
        icon: '🧘‍♂️',
        dialogueKey: 'tang_seng_yingchou_talk'
      },
      {
        id: 'npc_bailong_human',
        name: '小白龙敖烈',
        title: '【西海龙三太子】',
        x: 15 * 32,
        y: 10 * 32,
        appearance: 'xiaobailong',
        icon: '🐉',
        dialogueKey: 'bailong_encounter'
      }
    ],
    monsters: [
      {
        id: 'mob_water_serpent',
        name: '寒潭黑水玄蛇',
        icon: '🐍',
        x: 12 * 32,
        y: 6 * 32,
        level: 12,
        hp: 450,
        maxHp: 450,
        atk: 75,
        def: 38,
        spd: 32,
        patrolRadius: 35
      }
    ],
    portals: [
      { x: 25 * 32, y: 10 * 32, targetMap: 'wuxingshan', targetX: 2 * 32, targetY: 10 * 32, name: '东回【五行山】' },
      { x: 1 * 32, y: 10 * 32, targetMap: 'gaolaozhuang', targetX: 23 * 32, targetY: 10 * 32, name: '西去【乌斯藏·高老庄】' }
    ]
  },

  // =========================================================================
  // 6. 第五章：乌斯藏·高老庄与云栈洞 (夜战天蓬元帅猪八戒，八戒拜师入队)
  // =========================================================================
  gaolaozhuang: {
    id: 'gaolaozhuang',
    name: '乌斯藏·高老庄与云栈洞',
    region: '福陵山下',
    width: 28,
    height: 22,
    tiles: (() => {
      const g = createGrid(28, 22, 'manor_floor');
      // 主干道路
      for (let c = 0; c < 28; c++) g[11][c] = 'dirt_path';

      // 高太公府第院墙
      for (let r = 3; r <= 8; r++) {
        for (let c = 3; c <= 10; c++) {
          g[r][c] = 'city_wall';
        }
      }
      g[8][6] = 'manor_floor'; // 府门

      // 福陵山云栈洞黑风林石壁
      for (let r = 14; r <= 20; r++) {
        for (let c = 16; c <= 25; c++) {
          g[r][c] = 'demon_cave_wall';
        }
      }
      g[17][20] = 'dirt_path'; // 洞府入口
      return g;
    })(),
    playerSpawn: { x: 25 * 32, y: 11 * 32, direction: 'left' },
    npcs: [
      {
        id: 'npc_gaotaigong',
        name: '高太公',
        title: '【庄院太公】',
        x: 6 * 32,
        y: 6 * 32,
        appearance: 'tang_seng',
        icon: '👴',
        dialogueKey: 'gaotaigong_talk'
      },
      {
        id: 'npc_cuilan',
        name: '高翠兰',
        title: '【高府三小姐】',
        x: 8 * 32,
        y: 6 * 32,
        appearance: 'tang_seng',
        icon: '👧',
        dialogueKey: 'cuilan_talk'
      },
      {
        id: 'npc_zhu_bajie',
        name: '猪刚鬣 (天蓬元帅)',
        title: '【云栈洞妖王】',
        x: 20 * 32,
        y: 17 * 32,
        appearance: 'zhu_bajie',
        icon: '🐗',
        dialogueKey: 'bajie_encounter'
      }
    ],
    monsters: [
      {
        id: 'mob_pig_minion',
        name: '云栈洞黑风小猪妖',
        icon: '🐗',
        x: 18 * 32,
        y: 15 * 32,
        level: 16,
        hp: 680,
        maxHp: 680,
        atk: 95,
        def: 55,
        spd: 34,
        patrolRadius: 30
      }
    ],
    portals: [
      { x: 27 * 32, y: 11 * 32, targetMap: 'yingchoujian', targetX: 2 * 32, targetY: 10 * 32, name: '东回【蛇盘山·鹰愁涧】' },
      { x: 1 * 32, y: 11 * 32, targetMap: 'huangfengling', targetX: 24 * 32, targetY: 10 * 32, name: '西入【八百里·黄风岭】' }
    ]
  },

  // =========================================================================
  // 7. 第六章：八百里·黄风岭 (大战虎先锋，破黄风怪三昧神风)
  // =========================================================================
  huangfengling: {
    id: 'huangfengling',
    name: '八百里·黄风岭',
    region: '狂沙恶岭',
    width: 26,
    height: 20,
    tiles: (() => {
      const g = createGrid(26, 20, 'yellow_sand');
      // 乱石山路
      for (let c = 0; c < 26; c++) g[10][c] = 'dirt_path';

      // 嶙峋巨岩阻挡
      for (let r = 2; r <= 6; r++) {
        for (let c = 4; c <= 10; c++) {
          g[r][c] = 'mountain_rock';
        }
      }
      for (let r = 14; r <= 18; r++) {
        for (let c = 12; c <= 20; c++) {
          g[r][c] = 'mountain_rock';
        }
      }
      return g;
    })(),
    playerSpawn: { x: 24 * 32, y: 10 * 32, direction: 'left' },
    npcs: [
      {
        id: 'npc_lingji_pusa',
        name: '灵吉菩萨',
        title: '【小须弥山圣僧】',
        x: 6 * 32,
        y: 8 * 32,
        appearance: 'guanyin',
        icon: '🪷',
        dialogueKey: 'lingji_pusa_talk'
      },
      {
        id: 'npc_hu_xianfeng',
        name: '虎先锋',
        title: '【巡山大都督】',
        x: 13 * 32,
        y: 9 * 32,
        appearance: 'hu_xianfeng',
        icon: '🐅',
        dialogueKey: 'hu_xianfeng_encounter'
      },
      {
        id: 'npc_huangfeng_boss',
        name: '黄风怪 (黄风大圣)',
        title: '【黄风洞洞主】',
        x: 18 * 32,
        y: 7 * 32,
        appearance: 'huangfeng_guai',
        icon: '🌪️',
        dialogueKey: 'huangfeng_boss_encounter'
      }
    ],
    monsters: [],
    portals: [
      { x: 25 * 32, y: 10 * 32, targetMap: 'gaolaozhuang', targetX: 2 * 32, targetY: 11 * 32, name: '东回【高老庄】' },
      { x: 1 * 32, y: 10 * 32, targetMap: 'liushahe', targetX: 24 * 32, targetY: 10 * 32, name: '西去【八百里·流沙河】' }
    ]
  },

  // =========================================================================
  // 8. 第七章：八百里·流沙河 (九项骷髅降妖宝杖，收沙僧沙悟净入队)
  // =========================================================================
  liushahe: {
    id: 'liushahe',
    name: '八百里·流沙河',
    region: '浊浪飞沙',
    width: 28,
    height: 20,
    tiles: (() => {
      const g = createGrid(28, 20, 'yellow_sand');
      // 两岸浅滩
      for (let c = 0; c < 28; c++) g[10][c] = 'dirt_path';

      // 鹅毛不能浮、芦花定底沉的八百里流沙浊浪
      for (let r = 2; r <= 17; r++) {
        for (let c = 10; c <= 18; c++) {
          g[r][c] = 'dark_water';
        }
      }
      // 木吒点化的骷髅宝船渡桥
      g[10][13] = 'dirt_path';
      g[10][14] = 'dirt_path';
      g[10][15] = 'dirt_path';
      return g;
    })(),
    playerSpawn: { x: 25 * 32, y: 10 * 32, direction: 'left' },
    npcs: [
      {
        id: 'npc_muzha',
        name: '木吒 (惠岸行者)',
        title: '【菩萨尊者】',
        x: 21 * 32,
        y: 8 * 32,
        appearance: 'heaven_general',
        icon: '🗡️',
        dialogueKey: 'muzha_talk'
      },
      {
        id: 'npc_shaseng',
        name: '沙悟净 (卷帘大将)',
        title: '【流沙河妖王】',
        x: 14 * 32,
        y: 9 * 32,
        appearance: 'sha_wujing',
        icon: '🌊',
        dialogueKey: 'shaseng_encounter'
      }
    ],
    monsters: [],
    portals: [
      { x: 27 * 32, y: 10 * 32, targetMap: 'huangfengling', targetX: 2 * 32, targetY: 10 * 32, name: '东回【黄风岭】' },
      { x: 1 * 32, y: 10 * 32, targetMap: 'futushan', targetX: 20 * 32, targetY: 10 * 32, name: '西渡前往【浮屠山·乌巢禅林】' }
    ]
  },

  // =========================================================================
  // 9. 第八章：浮屠山·乌巢禅林 (遇乌巢禅师传心经)
  // =========================================================================
  futushan: {
    id: 'futushan',
    name: '浮屠山·乌巢禅林',
    region: '紫气祥云福地',
    width: 22,
    height: 18,
    tiles: (() => {
      const g = createGrid(22, 18, 'grass');
      for (let c = 0; c < 22; c++) g[10][c] = 'dirt_path';

      // 仙桧修竹
      g[4][10] = 'bamboo';
      g[4][11] = 'bamboo';
      g[5][10] = 'bamboo';
      g[5][11] = 'bamboo';
      g[6][10] = 'bamboo';
      g[6][11] = 'bamboo';
      return g;
    })(),
    playerSpawn: { x: 20 * 32, y: 10 * 32, direction: 'left' },
    npcs: [
      {
        id: 'npc_wuchao_master',
        name: '乌巢禅师',
        title: '【浮屠世外高僧】',
        x: 10 * 32,
        y: 8 * 32,
        appearance: 'wuchao_chanshi',
        icon: '🪺',
        dialogueKey: 'wuchao_talk'
      }
    ],
    monsters: [],
    portals: [
      { x: 21 * 32, y: 10 * 32, targetMap: 'liushahe', targetX: 2 * 32, targetY: 10 * 32, name: '东回【流沙河】' },
      { x: 1 * 32, y: 10 * 32, targetMap: 'wuzhuangguan', targetX: 25 * 32, targetY: 11 * 32, name: '西登【万寿山·五庄观】' }
    ]
  },

  // =========================================================================
  // 10. 第九章：万寿山·五庄观 (奉人参果，战地仙之祖镇元子)
  // =========================================================================
  wuzhuangguan: {
    id: 'wuzhuangguan',
    name: '万寿山·五庄观',
    region: '地仙之祖仙府',
    width: 28,
    height: 22,
    tiles: (() => {
      const g = createGrid(28, 22, 'heaven_floor');
      for (let c = 0; c < 28; c++) g[11][c] = 'dirt_path';

      // 五庄观正殿红墙
      for (let r = 3; r <= 8; r++) {
        for (let c = 5; c <= 14; c++) {
          g[r][c] = 'city_wall';
        }
      }
      g[8][9] = 'heaven_floor'; // 山门殿门

      // 后园万年不老草还丹人参果树
      g[5][21] = 'ginseng_tree';
      g[5][22] = 'ginseng_tree';
      g[6][21] = 'ginseng_tree';
      g[6][22] = 'ginseng_tree';
      return g;
    })(),
    playerSpawn: { x: 25 * 32, y: 11 * 32, direction: 'left' },
    npcs: [
      {
        id: 'npc_qingfeng',
        name: '清风仙童',
        title: '【五庄观执事】',
        x: 8 * 32,
        y: 6 * 32,
        appearance: 'tang_seng',
        icon: '👦',
        dialogueKey: 'qingfeng_talk'
      },
      {
        id: 'npc_mingyue',
        name: '明月仙童',
        title: '【五庄观执事】',
        x: 11 * 32,
        y: 6 * 32,
        appearance: 'tang_seng',
        icon: '👦',
        dialogueKey: 'mingyue_talk'
      },
      {
        id: 'npc_zhenyuanzi',
        name: '镇元大仙',
        title: '【地仙之祖·与天同齐】',
        x: 18 * 32,
        y: 8 * 32,
        appearance: 'zhenyuanzi',
        icon: '仙',
        dialogueKey: 'zhenyuanzi_encounter'
      }
    ],
    monsters: [],
    portals: [
      { x: 27 * 32, y: 11 * 32, targetMap: 'futushan', targetX: 2 * 32, targetY: 10 * 32, name: '东回【浮屠山】' },
      { x: 1 * 32, y: 11 * 32, targetMap: 'baihuling', targetX: 24 * 32, targetY: 10 * 32, name: '西行进入【白虎岭·白骨洞】' }
    ]
  },

  // =========================================================================
  // 11. 第十章：白虎岭·白骨洞 (三打白骨夫人连环变)
  // =========================================================================
  baihuling: {
    id: 'baihuling',
    name: '白虎岭·白骨洞',
    region: '尸气白骨魔障',
    width: 26,
    height: 20,
    tiles: (() => {
      const g = createGrid(26, 20, 'grass');
      for (let c = 0; c < 26; c++) g[10][c] = 'dirt_path';

      // 幽冥魔窟石壁
      for (let r = 3; r <= 8; r++) {
        for (let c = 14; c <= 22; c++) {
          g[r][c] = 'demon_cave_wall';
        }
      }
      return g;
    })(),
    playerSpawn: { x: 24 * 32, y: 10 * 32, direction: 'left' },
    npcs: [
      {
        id: 'npc_baigujing',
        name: '白骨夫人',
        title: '【幽冥尸魔三戏圣僧】',
        x: 14 * 32,
        y: 10 * 32,
        appearance: 'baigu_jing',
        icon: '💀',
        dialogueKey: 'baigujing_encounter'
      }
    ],
    monsters: [
      {
        id: 'mob_bone_skeleton',
        name: '白虎岭怨灵骷髅兵',
        icon: '💀',
        x: 8 * 32,
        y: 7 * 32,
        level: 28,
        hp: 1200,
        maxHp: 1200,
        atk: 145,
        def: 80,
        spd: 38,
        patrolRadius: 35
      }
    ],
    portals: [
      { x: 25 * 32, y: 10 * 32, targetMap: 'wuzhuangguan', targetX: 2 * 32, targetY: 11 * 32, name: '东回【万寿山五庄观】' },
      { x: 1 * 32, y: 10 * 32, targetMap: 'baoxiangguo', targetX: 26 * 32, targetY: 11 * 32, name: '西入【宝象国·金顶王都】' }
    ]
  },

  // =========================================================================
  // 12. 第十一章：宝象国·王都与碗子山波月洞 (大破黄袍怪奎木狼)
  // =========================================================================
  baoxiangguo: {
    id: 'baoxiangguo',
    name: '宝象国·王都与波月洞',
    region: '异域天府王城',
    width: 28,
    height: 22,
    tiles: (() => {
      const g = createGrid(28, 22, 'manor_floor');
      for (let c = 0; c < 28; c++) g[11][c] = 'changan_stone';

      // 宝象国王宫
      for (let r = 2; r <= 7; r++) {
        for (let c = 2; c <= 11; c++) {
          g[r][c] = 'city_wall';
        }
      }
      g[7][6] = 'manor_floor';

      // 碗子山波月洞
      for (let r = 14; r <= 20; r++) {
        for (let c = 16; c <= 25; c++) {
          g[r][c] = 'demon_cave_wall';
        }
      }
      g[17][20] = 'changan_stone';
      return g;
    })(),
    playerSpawn: { x: 26 * 32, y: 11 * 32, direction: 'left' },
    npcs: [
      {
        id: 'npc_baoxiang_king',
        name: '宝象国国王',
        title: '【异域国君】',
        x: 6 * 32,
        y: 5 * 32,
        appearance: 'tang_seng',
        icon: '👑',
        dialogueKey: 'baoxiang_king_talk'
      },
      {
        id: 'npc_baihuaxiu',
        name: '百花羞公主',
        title: '【披香殿侍女转世】',
        x: 8 * 32,
        y: 5 * 32,
        appearance: 'tang_seng',
        icon: '👸',
        dialogueKey: 'baihuaxiu_talk'
      },
      {
        id: 'npc_huangpao_boss',
        name: '黄袍怪 (奎木狼)',
        title: '【二十八宿奎宿星君】',
        x: 20 * 32,
        y: 17 * 32,
        appearance: 'huangpao_guai',
        icon: '🐺',
        dialogueKey: 'huangpao_boss_encounter'
      }
    ],
    monsters: [],
    portals: [
      { x: 27 * 32, y: 11 * 32, targetMap: 'baihuling', targetX: 2 * 32, targetY: 10 * 32, name: '东回【白虎岭】' },
      { x: 1 * 32, y: 11 * 32, targetMap: 'fangcunshan', targetX: 18 * 32, targetY: 10 * 32, name: '步入乾坤法阵探访【灵台方寸山】' }
    ]
  },

  // =========================================================================
  // 13. 隐藏圣境：灵台方寸山·斜月三星洞 (菩提祖师道场)
  // =========================================================================
  fangcunshan: {
    id: 'fangcunshan',
    name: '灵台方寸山·斜月三星洞',
    region: '大道真仙隐世圣境',
    width: 22,
    height: 18,
    tiles: (() => {
      const g = createGrid(22, 18, 'heaven_floor');
      for (let c = 0; c < 22; c++) g[10][c] = 'dirt_path';
      for (let r = 0; r < 18; r++) {
        g[r][0] = 'cloud_void';
        g[r][21] = 'cloud_void';
      }
      return g;
    })(),
    playerSpawn: { x: 18 * 32, y: 10 * 32, direction: 'left' },
    npcs: [
      {
        id: 'npc_puti_ancestor',
        name: '菩提祖师',
        title: '【西游始祖真仙】',
        x: 10 * 32,
        y: 6 * 32,
        appearance: 'puti_zushi',
        icon: '✨',
        dialogueKey: 'puti_talk'
      }
    ],
    monsters: [],
    portals: [
      { x: 20 * 32, y: 10 * 32, targetMap: 'baoxiangguo', targetX: 3 * 32, targetY: 11 * 32, name: '穿梭法阵返回【宝象国】' },
      { x: 1 * 32, y: 10 * 32, targetMap: 'luojiashan', targetX: 18 * 32, targetY: 10 * 32, name: '云游仙界前往【南海珞珈山】' }
    ]
  },

  // =========================================================================
  // 14. 隐藏圣境：南海普陀山·珞珈山紫竹潮音洞 (观音大士道场)
  // =========================================================================
  luojiashan: {
    id: 'luojiashan',
    name: '南海普陀山·紫竹潮音洞',
    region: '大慈大悲观世音道场',
    width: 22,
    height: 18,
    tiles: (() => {
      const g = createGrid(22, 18, 'grass');
      for (let c = 0; c < 22; c++) g[10][c] = 'dirt_path';
      // 紫竹林掩映
      for (let r = 2; r <= 8; r++) {
        for (let c = 3; c <= 8; c++) {
          g[r][c] = 'purple_bamboo';
        }
      }
      for (let r = 12; r <= 16; r++) {
        for (let c = 12; c <= 18; c++) {
          g[r][c] = 'purple_bamboo';
        }
      }
      return g;
    })(),
    playerSpawn: { x: 18 * 32, y: 10 * 32, direction: 'left' },
    npcs: [
      {
        id: 'npc_guanyin_luojia',
        name: '观世音菩萨',
        title: '【南海大慈大悲正身】',
        x: 10 * 32,
        y: 6 * 32,
        appearance: 'guanyin',
        icon: '🪷',
        dialogueKey: 'guanyin_luojia_talk'
      }
    ],
    monsters: [],
    portals: [
      { x: 20 * 32, y: 10 * 32, targetMap: 'changan_city', targetX: 16 * 32, targetY: 9 * 32, name: '腾云飞返【长安城化生寺】' }
    ]
  }
};
