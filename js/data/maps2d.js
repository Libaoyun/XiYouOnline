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
      // 凌霄宝殿金顶琉璃大殿 (北端仙阙)
      for (let c = 8; c <= 14; c++) {
        g[2][c] = 'tang_palace';
      }
      // 南天门汉白玉牌楼
      g[14][10] = 'paifang';
      g[14][11] = 'paifang';
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
      { x: 3 * 32, y: 13 * 32, targetMap: 'tiangong_yuma', targetX: 12 * 32, targetY: 13 * 32, name: '御马监' },
      { x: 19 * 32, y: 13 * 32, targetMap: 'tiangong_pantao', targetX: 12 * 32, targetY: 13 * 32, name: '蟠桃园' }
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
      // 仙马御厩金顶廊房
      for (let c = 6; c <= 13; c++) {
        g[2][c] = 'tang_store';
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
      { x: 10 * 32, y: 14 * 32, targetMap: 'tiangong_palace', targetX: 4 * 32, targetY: 13 * 32, name: '天宫' }
    ]
  },

  // =========================================================================
  // 天宫·蟠桃园 (每日采摘品尝仙桃，海量经验飞速升级)
  // =========================================================================
  tiangong_pantao: {
    id: 'tiangong_pantao',
    name: '天宫·蟠桃胜境',
    region: '瑶池仙境',
    width: 26,
    height: 20,
    tiles: (() => {
      const g = createGrid(26, 20, 'grass');
      // 外围九霄云海深渊
      for (let r = 0; r < 20; r++) {
        g[r][0] = 'cloud_void';
        g[r][1] = 'cloud_void';
        g[r][24] = 'cloud_void';
        g[r][25] = 'cloud_void';
      }
      for (let c = 0; c < 26; c++) {
        g[0][c] = 'cloud_void';
        g[19][c] = 'cloud_void';
      }
      // 仙玉铺地石道 (十字环廊)
      for (let c = 4; c <= 21; c++) g[10][c] = 'heaven_floor';
      for (let r = 3; r <= 16; r++) g[r][13] = 'heaven_floor';

      // 瑶池仙泉水榭 (中央水泽)
      for (let r = 8; r <= 12; r++) {
        for (let c = 11; c <= 15; c++) {
          g[r][c] = 'water';
        }
      }
      // 水中央品桃仙亭与白玉道
      g[9][13] = 'stone_temple';
      g[10][11] = 'heaven_floor';
      g[10][12] = 'heaven_floor';
      g[10][13] = 'heaven_floor';
      g[10][14] = 'heaven_floor';
      g[10][15] = 'heaven_floor';

      // 四方祥云蟠桃仙木阻挡桩 (不可直接穿行大树桩中心)
      g[5][6] = 'bamboo';
      g[5][20] = 'bamboo';
      g[14][5] = 'bamboo';
      g[14][21] = 'bamboo';
      g[4][13] = 'heaven_pillar';
      g[16][13] = 'heaven_pillar';
      return g;
    })(),
    playerSpawn: { x: 13 * 32, y: 12 * 32, direction: 'up' },
    // 蟠桃古树实体配置 (包含三千年、六千年、九千年仙桃母树，玩家靠近点击即可确认采摘吃桃)
    peachTrees: [
      { id: 'tree_3000_1', name: '三千年·青翠仙木', tier: 'tier_3000', x: 6 * 32, y: 5 * 32, title: '【三千年一熟】', icon: '🍑' },
      { id: 'tree_3000_2', name: '三千年·繁枝仙树', tier: 'tier_3000', x: 20 * 32, y: 5 * 32, title: '【三千年一熟】', icon: '🍑' },
      { id: 'tree_3000_3', name: '三千年·灵根老树', tier: 'tier_3000', x: 5 * 32, y: 14 * 32, title: '【三千年一熟】', icon: '🍑' },
      { id: 'tree_6000_1', name: '六千年·层花仙树', tier: 'tier_6000', x: 8 * 32, y: 4 * 32, title: '【六千年一熟】', icon: '🍑' },
      { id: 'tree_6000_2', name: '六千年·甘露母树', tier: 'tier_6000', x: 21 * 32, y: 14 * 32, title: '【六千年一熟】', icon: '🍑' },
      { id: 'tree_9000_1', name: '九千年·紫纹至尊母树', tier: 'tier_9000', x: 13 * 32, y: 3 * 32, title: '【九千年一熟】', icon: '✨🍑' },
      { id: 'tree_9000_2', name: '九千年·缃核造化神树', tier: 'tier_9000', x: 13 * 32, y: 16 * 32, title: '【九千年一熟】', icon: '✨🍑' }
    ],
    npcs: [
      {
        id: 'npc_pantao_tudi',
        name: '蟠桃园土地',
        title: '【园苑执事】',
        x: 10 * 32,
        y: 10 * 32,
        appearance: 'tudi_gong',
        icon: '👴',
        dialogueKey: 'pantao_tudi_talk'
      },
      {
        id: 'npc_qixiannv',
        name: '红衣仙女',
        title: '【采桃仙子】',
        x: 14 * 32,
        y: 7 * 32,
        appearance: 'tieshan',
        icon: '🧚‍♀️',
        dialogueKey: 'qixiannv_talk'
      }
    ],
    monsters: [],
    portals: [
      { x: 13 * 32, y: 18 * 32, targetMap: 'tiangong_palace', targetX: 18 * 32, targetY: 13 * 32, name: '天宫' }
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

      // 凡间关隘木拒马鹿砦 (复刻图2木拒马)
      g[9][2] = 'wooden_barricade';
      g[11][2] = 'wooden_barricade';
      g[9][24] = 'wooden_barricade';
      g[11][24] = 'wooden_barricade';
      g[1][11] = 'wooden_barricade';
      g[1][13] = 'wooden_barricade';
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
        appearance: 'liu_taigong',
        icon: '👴',
        dialogueKey: 'liutaigong_talk'
      },
      {
        id: 'npc_liujia_tudi',
        name: '刘家村土地公',
        title: '【当方土地】',
        x: 23 * 32,
        y: 9 * 32,
        appearance: 'tudi_gong',
        icon: '🌿',
        dialogueKey: 'liujia_tudi_talk'
      }
    ],
    monsters: [
      {
        id: 'mob_rat_1',
        name: '偷粮硕鼠',
        icon: '🐀',
        appearance: 'giant_rat',
        x: 14 * 32,
        y: 13 * 32,
        level: 2,
        hp: 90,
        maxHp: 90,
        atk: 20,
        def: 10,
        spd: 24,
        skills: ['撕咬'],
        patrolRadius: 30
      },
      {
        id: 'mob_piglet_1',
        name: '山林小野猪',
        icon: '🐗',
        x: 18 * 32,
        y: 16 * 32,
        level: 3,
        hp: 130,
        maxHp: 130,
        atk: 25,
        def: 14,
        spd: 20,
        skills: ['冲撞'],
        patrolRadius: 25
      },
      {
        id: 'mob_wolf_1',
        name: '双叉岭恶狼',
        icon: '🐺',
        appearance: 'wild_wolf',
        x: 17 * 32,
        y: 6 * 32,
        level: 4,
        hp: 160,
        maxHp: 160,
        atk: 32,
        def: 16,
        spd: 25,
        skills: ['连击'],
        patrolRadius: 35
      },
      {
        id: 'mob_tiger_1',
        name: '下山吊睛猛虎',
        icon: '🐅',
        appearance: 'hu_xianfeng',
        x: 20 * 32,
        y: 12 * 32,
        level: 6,
        hp: 280,
        maxHp: 280,
        atk: 48,
        def: 24,
        spd: 28,
        skills: ['猛扑'],
        patrolRadius: 40
      }
    ],
    portals: [
      { x: 25 * 32, y: 10 * 32, targetMap: 'changan_city', targetX: 3 * 32, targetY: 16 * 32, name: '长安城' },
      { x: 1 * 32, y: 10 * 32, targetMap: 'wuxingshan', targetX: 23 * 32, targetY: 10 * 32, name: '五行山', minLevel: 5 }
    ]
  },

  // =========================================================================
  // 3. 第二章：大唐国都·长安城 (大尺度盛唐棋盘坊市，明亮祥和市井烟火)
  // =========================================================================
  changan_city: {
    id: 'changan_city',
    name: '大唐王都·长安城',
    region: '盛唐帝阙',
    width: 46,
    height: 34,
    tiles: (() => {
      const g = createGrid(46, 34, 'changan_stone');
      // 外城墙
      for (let c = 0; c < 46; c++) {
        g[0][c] = 'city_wall';
        g[1][c] = 'city_wall';
        g[32][c] = 'city_wall';
        g[33][c] = 'city_wall';
      }
      for (let r = 0; r < 34; r++) {
        g[r][0] = 'city_wall';
        g[r][1] = 'city_wall';
        g[r][44] = 'city_wall';
        g[r][45] = 'city_wall';
      }
      // 北侧宏伟宫殿飞檐与大红灯笼 (复刻图1顶部建筑)
      for (let c = 1; c < 43; c++) {
        g[1][c] = 'palace_eaves';
      }

      // 中央皇家汉白玉御道 (复刻图1御道：贯通南北大中轴线)
      for (let r = 2; r <= 33; r++) {
        g[r][21] = 'imperial_way_left';
        g[r][22] = 'imperial_way_center';
        g[r][23] = 'imperial_way_right';
      }

      // 西城门通往刘家村 (开口宽阔)
      g[16][0] = 'changan_stone'; g[16][1] = 'changan_stone';
      g[17][0] = 'changan_stone'; g[17][1] = 'changan_stone';

      // 南城门通往陈塘关 (朱雀门开口)
      g[32][22] = 'changan_stone'; g[32][23] = 'changan_stone';
      g[33][22] = 'changan_stone'; g[33][23] = 'changan_stone';

      // 中央朱雀牌楼门坊 (盛世长安)
      g[5][22] = 'paifang';
      g[5][23] = 'paifang';

      // 东北·化生宝刹 (金顶琉璃大雄宝殿群)
      for (let r = 3; r <= 7; r++) {
        for (let c = 29; c <= 37; c++) {
          g[r][c] = 'tang_palace';
        }
      }
      // 化生寺大殿正门前台阶空开
      g[7][33] = 'changan_stone';

      // 铁匠工坊锻造火炉 (复刻图1铁匠铺火炉)
      g[24][30] = 'blacksmith_forge';

      // 西北·大唐府衙官署 (户籍司大堂)
      for (let r = 3; r <= 6; r++) {
        for (let c = 6; c <= 13; c++) {
          g[r][c] = 'tang_palace';
        }
      }
      g[6][9] = 'changan_stone'; g[6][10] = 'changan_stone';

      // 西北·飞升仙台 (天界接引灵柱)
      g[4][17] = 'heaven_pillar';
      g[6][17] = 'heaven_pillar';

      // 西南·市井坊肆商铺阁楼 (北排)
      for (let r = 11; r <= 13; r++) {
        for (let c = 5; c <= 15; c++) {
          g[r][c] = 'tang_store';
        }
      }
      // 西南·市井坊肆商铺阁楼 (南排)
      for (let r = 21; r <= 23; r++) {
        for (let c = 5; c <= 15; c++) {
          g[r][c] = 'tang_store';
        }
      }

      // 东南·大唐第一镖局与武将府第 (北排)
      for (let r = 11; r <= 13; r++) {
        for (let c = 29; c <= 39; c++) {
          g[r][c] = 'tang_store';
        }
      }
      // 东南·神兵百炼坊与万宝行 (南排)
      for (let r = 21; r <= 23; r++) {
        for (let c = 29; c <= 39; c++) {
          g[r][c] = 'tang_store';
        }
      }

      // 街边歇脚古亭
      g[18][20] = 'stone_temple';
      return g;
    })(),
    playerSpawn: { x: 3 * 32, y: 16 * 32, direction: 'right' },
    npcs: [
      {
        id: 'npc_qianzhuang',
        name: '钱庄掌柜',
        title: '【通达三界】',
        x: 7 * 32,
        y: 14 * 32,
        appearance: 'shopkeeper',
        icon: '💰',
        dialogueKey: 'qianzhuang_talk'
      },
      {
        id: 'npc_yishi',
        name: '回生老医师',
        title: '【妙手回春】',
        x: 13 * 32,
        y: 14 * 32,
        appearance: 'shopkeeper',
        icon: '🏥',
        dialogueKey: 'yishi_talk'
      },
      {
        id: 'npc_changan_huji',
        name: '长安户籍官',
        title: '【定居户籍】',
        x: 10 * 32,
        y: 7 * 32,
        appearance: 'heaven_general',
        icon: '📜',
        dialogueKey: 'huji_talk'
      },
      {
        id: 'npc_xuanzang',
        name: '玄奘法师 (唐僧)',
        title: '【金山寺高僧】',
        x: 33 * 32,
        y: 8 * 32,
        appearance: 'tang_seng',
        icon: '🧘‍♂️',
        dialogueKey: 'xuanzang_talk'
      },
      {
        id: 'npc_guanyin',
        name: '观音菩萨 (化身)',
        title: '【大慈大悲】',
        x: 36 * 32,
        y: 8 * 32,
        appearance: 'guanyin',
        icon: '🪷',
        dialogueKey: 'guanyin_talk'
      },
      {
        id: 'npc_blacksmith',
        name: '李铁匠',
        title: '【神兵淬火】',
        x: 31 * 32,
        y: 24 * 32,
        appearance: 'blacksmith',
        icon: '🔨',
        dialogueKey: 'blacksmith_talk'
      },
      {
        id: 'npc_shop',
        name: '万宝商贾',
        title: '【百宝货铺】',
        x: 37 * 32,
        y: 24 * 32,
        appearance: 'shopkeeper',
        icon: '🏮',
        dialogueKey: 'shop_talk'
      },
      {
        id: 'npc_tiangong_guide',
        name: '飞升仙官',
        title: '【接引天界】',
        x: 17 * 32,
        y: 5 * 32,
        appearance: 'tang_seng',
        icon: '☁️',
        dialogueKey: 'tiangong_guide_talk'
      },
      {
        id: 'npc_zhongkui',
        name: '钟馗',
        title: '【伏魔大将军】',
        x: 36 * 32,
        y: 14 * 32,
        appearance: 'heaven_general',
        icon: '👹',
        dialogueKey: 'zhongkui_talk'
      },
      {
        id: 'npc_biaoju',
        name: '程咬金 (镖局总管)',
        title: '【天下第一镖】',
        x: 31 * 32,
        y: 14 * 32,
        appearance: 'heaven_general',
        icon: '🚩',
        dialogueKey: 'biaoju_talk'
      },
      // 盛世长安路人 (充满烟火气与祥和安宁)
      {
        id: 'npc_changan_girl',
        name: '苏绣娘',
        title: '【长安织造】',
        x: 8 * 32,
        y: 24 * 32,
        appearance: 'changan_girl',
        icon: '🧵',
        dialogueKey: 'changan_girl_talk'
      },
      {
        id: 'npc_changan_scholar',
        name: '杜子美',
        title: '【游方书生】',
        x: 20 * 32,
        y: 10 * 32,
        appearance: 'changan_scholar',
        icon: '📜',
        dialogueKey: 'changan_scholar_talk'
      },
      {
        id: 'npc_changan_hawker',
        name: '货郎阿福',
        title: '【挑担货郎】',
        x: 26 * 32,
        y: 16 * 32,
        appearance: 'changan_hawker',
        icon: '🍡',
        dialogueKey: 'changan_hawker_talk'
      },
      {
        id: 'npc_changan_child',
        name: '小虎',
        title: '【坊间顽童】',
        x: 28 * 32,
        y: 9 * 32,
        appearance: 'changan_child',
        icon: '🍭',
        dialogueKey: 'changan_child_talk'
      },
      {
        id: 'npc_changan_guard',
        name: '金甲禁军',
        title: '【御林巡卒】',
        x: 21 * 32,
        y: 31 * 32,
        appearance: 'changan_guard',
        icon: '🛡️',
        dialogueKey: 'changan_guard_talk'
      },
      {
        id: 'npc_changan_tea',
        name: '茶肆阿婆',
        title: '【长安茶肆】',
        x: 18 * 32,
        y: 19 * 32,
        appearance: 'changan_girl',
        icon: '🍵',
        dialogueKey: 'changan_tea_talk'
      }
    ],
    monsters: [],
    portals: [
      { x: 1 * 32, y: 16 * 32, targetMap: 'liujiacun', targetX: 24 * 32, targetY: 10 * 32, name: '刘家村' },
      { x: 23 * 32, y: 33 * 32, targetMap: 'chentangguan', targetX: 11 * 32, targetY: 3 * 32, name: '陈塘关', minLevel: 15 },
      { x: 42 * 32, y: 8 * 32, targetMap: 'tiangong_pantao', targetX: 10 * 32, targetY: 13 * 32, name: '蟠桃园' }
    ]
  },

  // =========================================================================
  // 陈塘关 (李靖总兵府、九湾河畔，往东海要塞)
  // =========================================================================
  chentangguan: {
    id: 'chentangguan',
    name: '东海雄关·陈塘关',
    region: '九湾河畔与东海之滨',
    width: 26,
    height: 20,
    tiles: (() => {
      // 默认大面积金黄细腻沙滩
      const g = createGrid(26, 20, 'beach_sand');

      // 屏幕右侧 1/5 (col = 21..25) 全部为波涛浩瀚大海！
      for (let r = 0; r < 20; r++) {
        for (let c = 21; c < 26; c++) {
          g[r][c] = 'water';
        }
      }

      // 西侧雄关石墙 (col = 0) 与关隘石门
      for (let r = 0; r < 20; r++) {
        g[r][0] = 'city_wall';
      }
      g[10][0] = 'beach_sand'; // 西出野狐岭关口

      // 李靖总兵帅府大殿群 (西北沙滩高台)
      for (let r = 3; r <= 5; r++) {
        for (let c = 8; c <= 14; c++) {
          g[r][c] = 'tang_palace';
        }
      }
      // 帅府前正门台阶
      g[5][11] = 'beach_sand';

      // 守关箭楼
      g[13][2] = 'stone_temple';

      // 观海避风石亭 (位于沙滩与海浪交界前)
      g[7][19] = 'stone_temple';

      // 北门通向长安城石道与主干道
      for (let r = 0; r < 20; r++) g[r][11] = 'dirt_path';
      for (let c = 0; c <= 20; c++) g[10][c] = 'dirt_path';
      return g;
    })(),
    playerSpawn: { x: 11 * 32, y: 3 * 32, direction: 'down' },
    npcs: [
      {
        id: 'npc_lijing_zongbing',
        name: '李靖总兵',
        title: '【陈塘关镇守】',
        x: 10 * 32,
        y: 7 * 32,
        appearance: 'heaven_general',
        icon: '🛡️',
        dialogueKey: 'lijing_talk'
      },
      {
        id: 'npc_nezha_child',
        name: '哪吒三太子',
        title: '【混天绫火尖枪】',
        x: 13 * 32,
        y: 7 * 32,
        appearance: 'sun_wukong',
        icon: '🔥',
        dialogueKey: 'nezha_talk'
      },
      {
        id: 'npc_fisherman',
        name: '海滨老渔翁',
        title: '【陈塘老渔】',
        x: 19 * 32,
        y: 8 * 32,
        appearance: 'liu_boqin',
        icon: '🎣',
        dialogueKey: 'fisherman_talk'
      }
    ],
    monsters: [
      {
        id: 'mob_clam_1',
        name: '灵河巨蚌',
        icon: '🦪',
        x: 18 * 32,
        y: 5 * 32,
        level: 18,
        hp: 1100,
        maxHp: 1100,
        atk: 135,
        def: 90,
        spd: 22,
        skills: ['水击'],
        patrolRadius: 35
      },
      {
        id: 'mob_clam_2',
        name: '碧水老蚌精',
        icon: '🦪',
        x: 19 * 32,
        y: 11 * 32,
        level: 19,
        hp: 1250,
        maxHp: 1250,
        atk: 142,
        def: 98,
        spd: 20,
        skills: ['水击'],
        patrolRadius: 35
      },
      {
        id: 'mob_crab_1',
        name: '铁甲金蟹',
        icon: '🦀',
        x: 17 * 32,
        y: 8 * 32,
        level: 20,
        hp: 1350,
        maxHp: 1350,
        atk: 150,
        def: 105,
        spd: 26,
        skills: ['连击'],
        patrolRadius: 35
      },
      {
        id: 'mob_crab_2',
        name: '巨钳青蟹怪',
        icon: '🦀',
        x: 18 * 32,
        y: 14 * 32,
        level: 20,
        hp: 1400,
        maxHp: 1400,
        atk: 155,
        def: 110,
        spd: 25,
        skills: ['横扫'],
        patrolRadius: 35
      },
      {
        id: 'mob_lobster_1',
        name: '巡海大龙虾',
        icon: '🦞',
        x: 19 * 32,
        y: 17 * 32,
        level: 20,
        hp: 1450,
        maxHp: 1450,
        atk: 160,
        def: 102,
        spd: 28,
        skills: ['双螯猛击'],
        patrolRadius: 35
      }
    ],
    portals: [
      { x: 11 * 32, y: 1 * 32, targetMap: 'changan_city', targetX: 23 * 32, targetY: 31 * 32, name: '长安城', minLevel: 0 },
      { x: 21 * 32, y: 10 * 32, targetMap: 'donghai_coast', targetX: 2 * 32, targetY: 10 * 32, name: '东海之滨', minLevel: 18 },
      { x: 1 * 32, y: 10 * 32, targetMap: 'yehu_ling', targetX: 25 * 32, targetY: 10 * 32, name: '野狐岭', minLevel: 18 }
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
    monsters: [
      {
        id: 'mob_shrimp_soldier_1',
        name: '巡海虾兵',
        icon: '🦐',
        x: 8 * 32,
        y: 6 * 32,
        level: 16,
        hp: 880,
        maxHp: 880,
        atk: 122,
        def: 68,
        spd: 36,
        skills: ['水击'],
        patrolRadius: 35
      },
      {
        id: 'mob_crab_soldier_1',
        name: '赤甲蟹兵',
        icon: '🦀',
        x: 8 * 32,
        y: 15 * 32,
        level: 17,
        hp: 1020,
        maxHp: 1020,
        atk: 132,
        def: 82,
        spd: 26,
        skills: ['连击'],
        patrolRadius: 35
      }
    ],
    portals: [
      { x: 1 * 32, y: 10 * 32, targetMap: 'chentangguan', targetX: 24 * 32, targetY: 10 * 32, name: '陈塘关' },
      { x: 14 * 32, y: 10 * 32, targetMap: 'shuijinggong', targetX: 13 * 32, targetY: 3 * 32, name: '水晶宫' , minLevel: 20}
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
        appearance: 'turtle',
        icon: '🐢',
        dialogueKey: 'guichengxiang_talk'
      }
    ],
    monsters: [
      {
        id: 'mob_palace_shrimp_1',
        name: '巡殿虾将',
        icon: '🦐',
        x: 7 * 32,
        y: 6 * 32,
        level: 18,
        hp: 1180,
        maxHp: 1180,
        atk: 142,
        def: 78,
        spd: 38,
        skills: ['水击'],
        patrolRadius: 30
      },
      {
        id: 'mob_palace_crab_1',
        name: '水府铁蟹将',
        icon: '🦀',
        x: 16 * 32,
        y: 6 * 32,
        level: 19,
        hp: 1320,
        maxHp: 1320,
        atk: 152,
        def: 98,
        spd: 28,
        skills: ['连击', '金刚护体'],
        patrolRadius: 30
      }
    ],
    portals: [
      { x: 12 * 32, y: 2 * 32, targetMap: 'donghai_coast', targetX: 13 * 32, targetY: 9 * 32, name: '东海之滨' },
      { x: 12 * 32, y: 15 * 32, targetMap: 'longgong_palace', targetX: 12 * 32, targetY: 3 * 32, name: '龙宫大殿' }
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
      { x: 12 * 32, y: 16 * 32, targetMap: 'shuijinggong', targetX: 12 * 32, targetY: 14 * 32, name: '水晶宫' , minLevel: 20}
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
    monsters: [
      {
        id: 'mob_snake_1',
        name: '盘石小青蛇',
        icon: '🐍',
        x: 8 * 32,
        y: 15 * 32,
        level: 7,
        hp: 320,
        maxHp: 320,
        atk: 55,
        def: 26,
        spd: 32,
        skills: ['毒雾'],
        patrolRadius: 35
      },
      {
        id: 'mob_fox_1',
        name: '巡山小野狐',
        icon: '🦊',
        x: 18 * 32,
        y: 15 * 32,
        level: 8,
        hp: 370,
        maxHp: 370,
        atk: 60,
        def: 28,
        spd: 34,
        skills: ['魅惑'],
        patrolRadius: 40
      },
      {
        id: 'mob_mountain_ape',
        name: '五指山顽猿',
        icon: '🐒',
        x: 5 * 32,
        y: 14 * 32,
        level: 9,
        hp: 430,
        maxHp: 430,
        atk: 68,
        def: 32,
        spd: 30,
        skills: ['掷石'],
        patrolRadius: 35
      }
    ],
    portals: [
      { x: 25 * 32, y: 10 * 32, targetMap: 'liujiacun', targetX: 2 * 32, targetY: 10 * 32, name: '刘家村' },
      { x: 1 * 32, y: 10 * 32, targetMap: 'yingchoujian', targetX: 23 * 32, targetY: 10 * 32, name: '鹰愁涧' , minLevel: 12}
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
        id: 'mob_bandit_1',
        name: '黑风强盗',
        icon: '🗡️',
        x: 7 * 32,
        y: 14 * 32,
        level: 11,
        hp: 550,
        maxHp: 550,
        atk: 82,
        def: 42,
        spd: 33,
        skills: ['连击'],
        patrolRadius: 40
      },
      {
        id: 'mob_water_serpent',
        name: '寒潭黑水玄蛇',
        icon: '🐍',
        appearance: 'pet_snake',
        x: 12 * 32,
        y: 6 * 32,
        level: 12,
        hp: 600,
        maxHp: 600,
        atk: 88,
        def: 44,
        spd: 36,
        skills: ['毒雾'],
        patrolRadius: 35
      },
      {
        id: 'mob_tyrant_1',
        name: '蛇盘山恶霸',
        icon: '🪓',
        x: 18 * 32,
        y: 6 * 32,
        level: 13,
        hp: 720,
        maxHp: 720,
        atk: 96,
        def: 48,
        spd: 30,
        skills: ['横扫'],
        patrolRadius: 40
      }
    ],
    portals: [
      { x: 25 * 32, y: 10 * 32, targetMap: 'wuxingshan', targetX: 2 * 32, targetY: 10 * 32, name: '五行山' },
      { x: 1 * 32, y: 10 * 32, targetMap: 'gaolaozhuang', targetX: 23 * 32, targetY: 10 * 32, name: '高老庄' , minLevel: 15}
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
        appearance: 'tieshan',
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
        appearance: 'zhu_bajie',
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
      { x: 27 * 32, y: 11 * 32, targetMap: 'yingchoujian', targetX: 2 * 32, targetY: 10 * 32, name: '鹰愁涧' },
      { x: 1 * 32, y: 11 * 32, targetMap: 'huangfengling', targetX: 24 * 32, targetY: 10 * 32, name: '黄风岭' , minLevel: 18}
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
      { x: 25 * 32, y: 10 * 32, targetMap: 'gaolaozhuang', targetX: 2 * 32, targetY: 11 * 32, name: '高老庄' },
      { x: 1 * 32, y: 10 * 32, targetMap: 'liushahe', targetX: 24 * 32, targetY: 10 * 32, name: '流沙河' }
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
      { x: 27 * 32, y: 10 * 32, targetMap: 'huangfengling', targetX: 2 * 32, targetY: 10 * 32, name: '黄风岭' },
      { x: 1 * 32, y: 10 * 32, targetMap: 'futushan', targetX: 20 * 32, targetY: 10 * 32, name: '乌巢禅林' }
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
      { x: 21 * 32, y: 10 * 32, targetMap: 'liushahe', targetX: 2 * 32, targetY: 10 * 32, name: '流沙河' },
      { x: 1 * 32, y: 10 * 32, targetMap: 'wuzhuangguan', targetX: 25 * 32, targetY: 11 * 32, name: '五庄观' }
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
        appearance: 'martial_hero',
        icon: '👦',
        dialogueKey: 'qingfeng_talk'
      },
      {
        id: 'npc_mingyue',
        name: '明月仙童',
        title: '【五庄观执事】',
        x: 11 * 32,
        y: 6 * 32,
        appearance: 'martial_hero',
        icon: '👦',
        dialogueKey: 'mingyue_talk'
      },
      {
        id: 'npc_zhenyuanzi',
        name: '镇元大仙',
        title: '【地仙之祖·与天同齐】',
        x: 18 * 32,
        y: 8 * 32,
        appearance: 'tang_seng',
        icon: '仙',
        dialogueKey: 'zhenyuanzi_encounter'
      }
    ],
    monsters: [],
    portals: [
      { x: 27 * 32, y: 11 * 32, targetMap: 'futushan', targetX: 2 * 32, targetY: 10 * 32, name: '浮屠山' },
      { x: 1 * 32, y: 11 * 32, targetMap: 'baihuling', targetX: 24 * 32, targetY: 10 * 32, name: '白虎岭' , minLevel: 30}
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
        appearance: 'baigu_jing',
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
      { x: 25 * 32, y: 10 * 32, targetMap: 'wuzhuangguan', targetX: 2 * 32, targetY: 11 * 32, name: '五庄观' },
      { x: 1 * 32, y: 10 * 32, targetMap: 'baoxiangguo', targetX: 26 * 32, targetY: 11 * 32, name: '宝象国' , minLevel: 35}
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
        appearance: 'tieshan',
        icon: '👸',
        dialogueKey: 'baihuaxiu_talk'
      },
      {
        id: 'npc_huangpao_boss',
        name: '黄袍怪 (奎木狼)',
        title: '【二十八宿奎宿星君】',
        x: 20 * 32,
        y: 17 * 32,
        appearance: 'wild_wolf',
        icon: '🐺',
        dialogueKey: 'huangpao_boss_encounter'
      }
    ],
    monsters: [],
    portals: [
      { x: 27 * 32, y: 11 * 32, targetMap: 'baihuling', targetX: 2 * 32, targetY: 10 * 32, name: '白虎岭' },
      { x: 1 * 32, y: 11 * 32, targetMap: 'fangcunshan', targetX: 18 * 32, targetY: 10 * 32, name: '方寸山' , minLevel: 35}
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
      { x: 20 * 32, y: 10 * 32, targetMap: 'baoxiangguo', targetX: 3 * 32, targetY: 11 * 32, name: '宝象国' },
      { x: 1 * 32, y: 10 * 32, targetMap: 'luojiashan', targetX: 18 * 32, targetY: 10 * 32, name: '普陀山' , minLevel: 40}
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
      { x: 20 * 32, y: 10 * 32, targetMap: 'changan_city', targetX: 16 * 32, targetY: 9 * 32, name: '长安城' }
    ]
  },

  // =========================================================================
  // 全新练功区 1：苍茫古木·野狐岭 (20级左右练功区，陈塘关西出即达)
  // =========================================================================
  yehu_ling: {
    id: 'yehu_ling',
    name: '苍茫古林·野狐岭',
    region: '青丘古地·20级练功场',
    width: 28,
    height: 20,
    tiles: (() => {
      const g = createGrid(28, 20, 'grass');
      // 东西贯通古栈道
      for (let c = 0; c < 28; c++) g[10][c] = 'dirt_path';
      for (let r = 1; r <= 10; r++) g[r][14] = 'dirt_path'; // 往北通郊狼岭小径

      // 狐妖灵丘巨石与迷雾灌木
      for (let r = 3; r <= 7; r++) {
        for (let c = 3; c <= 8; c++) g[r][c] = 'mountain_rock';
      }
      for (let r = 13; r <= 17; r++) {
        for (let c = 4; c <= 10; c++) g[r][c] = 'bamboo';
        for (let c = 18; c <= 24; c++) g[r][c] = 'bamboo';
      }
      return g;
    })(),
    playerSpawn: { x: 25 * 32, y: 10 * 32, direction: 'left' },
    npcs: [
      {
        id: 'npc_yehu_guide',
        name: '修道散修',
        title: '【练功向导】',
        x: 23 * 32,
        y: 8 * 32,
        appearance: 'tang_seng',
        icon: '🧙‍♂️',
        dialogueKey: 'yehu_guide_talk'
      }
    ],
    monsters: [
      {
        id: 'mob_fox_white',
        name: '白面灵狐',
        icon: '🦊',
        x: 18 * 32,
        y: 7 * 32,
        level: 19,
        hp: 1250,
        maxHp: 1250,
        atk: 145,
        def: 75,
        spd: 38,
        skills: ['连击'],
        patrolRadius: 35
      },
      {
        id: 'mob_fox_fire',
        name: '赤尾火狐妖',
        icon: '🦊',
        x: 10 * 32,
        y: 8 * 32,
        level: 20,
        hp: 1450,
        maxHp: 1450,
        atk: 160,
        def: 82,
        spd: 40,
        skills: ['三昧真火'],
        patrolRadius: 40
      },
      {
        id: 'mob_fox_shadow',
        name: '青丘魅影狐',
        icon: '🦊',
        x: 8 * 32,
        y: 13 * 32,
        level: 21,
        hp: 1600,
        maxHp: 1600,
        atk: 175,
        def: 88,
        spd: 44,
        skills: ['定身咒'],
        patrolRadius: 45
      },
      {
        id: 'mob_fox_lord',
        name: '野狐妖护法',
        icon: '🦊',
        x: 15 * 32,
        y: 14 * 32,
        level: 22,
        hp: 2100,
        maxHp: 2100,
        atk: 195,
        def: 98,
        spd: 46,
        skills: ['飞沙走石'],
        patrolRadius: 50
      }
    ],
    portals: [
      { x: 26 * 32, y: 10 * 32, targetMap: 'chentangguan', targetX: 2 * 32, targetY: 10 * 32, name: '陈塘关' },
      { x: 14 * 32, y: 1 * 32, targetMap: 'jiaolang_ling', targetX: 14 * 32, targetY: 18 * 32, name: '郊狼岭' , minLevel: 20}
    ]
  },

  // =========================================================================
  // 全新练功区 2：阴风呼啸·郊狼岭 (25级练功秘境，嗜血群狼盘踞)
  // =========================================================================
  jiaolang_ling: {
    id: 'jiaolang_ling',
    name: '阴风呼啸·郊狼岭',
    region: '苍狼旷野·25级练功场',
    width: 28,
    height: 20,
    tiles: (() => {
      const g = createGrid(28, 20, 'grass');
      // 南北纵贯与东西岔道
      for (let r = 0; r < 20; r++) g[r][14] = 'dirt_path';
      for (let c = 4; c <= 24; c++) g[10][c] = 'dirt_path';

      // 乱石阵与狼骨荒冢
      for (let r = 3; r <= 8; r++) {
        for (let c = 4; c <= 10; c++) g[r][c] = 'mountain_rock';
        for (let c = 18; c <= 24; c++) g[r][c] = 'mountain_rock';
      }
      for (let r = 12; r <= 17; r++) {
        for (let c = 4; c <= 10; c++) g[r][c] = 'mountain_rock';
        for (let c = 18; c <= 24; c++) g[r][c] = 'mountain_rock';
      }
      return g;
    })(),
    playerSpawn: { x: 14 * 32, y: 18 * 32, direction: 'up' },
    npcs: [],
    monsters: [
      {
        id: 'mob_wolf_blood',
        name: '嗜血郊狼',
        icon: '🐺',
        x: 8 * 32,
        y: 10 * 32,
        level: 24,
        hp: 1950,
        maxHp: 1950,
        atk: 210,
        def: 105,
        spd: 42,
        skills: ['连击'],
        patrolRadius: 35
      },
      {
        id: 'mob_wolf_shadow',
        name: '幽影魔狼',
        icon: '🐺',
        x: 20 * 32,
        y: 10 * 32,
        level: 25,
        hp: 2200,
        maxHp: 2200,
        atk: 230,
        def: 115,
        spd: 45,
        skills: ['舍生取义'],
        patrolRadius: 40
      },
      {
        id: 'mob_wolf_grayking',
        name: '狂暴灰狼王',
        icon: '🐺',
        x: 10 * 32,
        y: 5 * 32,
        level: 26,
        hp: 2500,
        maxHp: 2500,
        atk: 250,
        def: 125,
        spd: 48,
        skills: ['连击', '横扫'],
        patrolRadius: 45
      },
      {
        id: 'mob_wolf_silver',
        name: '啸月银狼领主',
        icon: '🐺',
        x: 18 * 32,
        y: 5 * 32,
        level: 27,
        hp: 3100,
        maxHp: 3100,
        atk: 280,
        def: 135,
        spd: 52,
        skills: ['雷霆万钧', '舍生取义'],
        patrolRadius: 50
      }
    ],
    portals: [
      { x: 14 * 32, y: 19 * 32, targetMap: 'yehu_ling', targetX: 14 * 32, targetY: 2 * 32, name: '野狐岭' },
      { x: 14 * 32, y: 1 * 32, targetMap: 'heifeng_juebi', targetX: 14 * 32, targetY: 18 * 32, name: '黑风绝壁' , minLevel: 25}
    ]
  },

  // =========================================================================
  // 全新练功区 3：万妖魔窟·黑风绝壁 (30级+高阶练功圣地，掉落珍宝天外陨铁与宝石)
  // =========================================================================
  heifeng_juebi: {
    id: 'heifeng_juebi',
    name: '万妖魔窟·黑风绝壁',
    region: '绝壁深渊·30级+高阶练功场',
    width: 28,
    height: 20,
    tiles: (() => {
      const g = createGrid(28, 20, 'grass');
      for (let r = 0; r < 20; r++) {
        g[r][0] = 'mountain_rock';
        g[r][27] = 'mountain_rock';
        g[r][14] = 'dirt_path';
      }
      for (let c = 0; c < 28; c++) {
        g[0][c] = 'mountain_rock';
        g[10][c] = 'dirt_path';
      }
      // 幽冥魔窟血池
      for (let r = 4; r <= 8; r++) {
        for (let c = 4; c <= 9; c++) g[r][c] = 'dark_water';
        for (let c = 19; c <= 24; c++) g[r][c] = 'dark_water';
      }
      return g;
    })(),
    playerSpawn: { x: 14 * 32, y: 18 * 32, direction: 'up' },
    npcs: [],
    monsters: [
      {
        id: 'mob_heifeng_demon',
        name: '黑风狂暴巨魔',
        icon: '👹',
        x: 8 * 32,
        y: 10 * 32,
        level: 30,
        hp: 3400,
        maxHp: 3400,
        atk: 300,
        def: 155,
        spd: 46,
        skills: ['雷霆万钧'],
        patrolRadius: 40
      },
      {
        id: 'mob_bear_general',
        name: '万年熊精战将',
        icon: '🐻',
        x: 20 * 32,
        y: 10 * 32,
        level: 32,
        hp: 4200,
        maxHp: 4200,
        atk: 340,
        def: 185,
        spd: 44,
        skills: ['金刚护体', '舍生取义'],
        patrolRadius: 45
      },
      {
        id: 'mob_bone_demon',
        name: '九幽蚀骨尸魔',
        icon: '💀',
        x: 14 * 32,
        y: 6 * 32,
        level: 35,
        hp: 4800,
        maxHp: 4800,
        atk: 380,
        def: 210,
        spd: 50,
        skills: ['飞沙走石', '三昧真火'],
        patrolRadius: 50
      }
    ],
    portals: [
      { x: 14 * 32, y: 19 * 32, targetMap: 'jiaolang_ling', targetX: 14 * 32, targetY: 2 * 32, name: '郊狼岭' }
    ]
  }
};
