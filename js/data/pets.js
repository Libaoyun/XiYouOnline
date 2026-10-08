/**
 * 汉风西游 - 仙宠（召唤兽）权威数据库 (Pets Canonical 3.0)
 * 严格遵照《西游OL 仙宠总表》规约：
 * 1. 普通野怪（50种）：低成长(0.70~0.97)，不可学技能，无变身，初值50~100。猿猴将上限之冠(0.97,血95,攻100,法80,速20)，子神速度之冠(23)。
 * 2. 散仙（严格限定12种）：成长率0.87~1.08，银壶收服，10级长安神坛免费授法，不可变身。
 *    - 雷公、电母速度型（速46，血75）；巨灵神气血型（血108，速12）；嫦娥、多闻天王均衡型（血103，速30~42）。
 * 3. 金仙（严格限定15种）：成长率0.97~1.18，金壶收服，10级免费授法，可元神变身，专属变身天赋。
 *    - 速度型（白骨精、红孩儿、铁扇公主、黑熊精）速61血90，攻击60~70出头；
 *    - 血牛低速型（猪八戒、牛魔王、黄眉大王）血119速26，八戒/牛魔王初始攻击115左右。
 */
window.GAME_DATA = window.GAME_DATA || {};

window.GAME_DATA.PETS = {
  // =========================================================================
  // 一、普通野怪系列 (共 50 种，仅普攻，不可学技能，成长率 0.70 ~ 0.97)
  // =========================================================================
  shuo_shu: {
    id: 'shuo_shu', name: '偷粮硕鼠', quality: 'ordinary', qualityName: '普通',
    element: 'earth', elementName: '土', reqLevel: 0, icon: '🐀',
    desc: '【普通野怪】刘家村粮仓偷吃稻粮的肥硕田鼠，鼠类演化起点，只能进行普通攻击。',
    growthRange: [0.70, 0.85],
    initialStats: {
      growth: { name: '成长率', init: '0.76', range: '0.70 ~ 0.85', min: 0.70, max: 0.85 },
      hp: { name: '生命值', init: 55, range: '50 ~ 71', min: 50, max: 71 },
      mp: { name: '法力值', init: 45, range: '42 ~ 68', min: 42, max: 68 },
      atk: { name: '攻击力', init: 22, range: '15 ~ 38', min: 15, max: 38 },
      spd: { name: '速度', init: 5, range: '2 ~ 13', min: 2, max: 13 },
      def: { name: '防御力', init: 20, range: '15 ~ 30', min: 15, max: 30 }
    },
    aptitudes: { hp: [2200, 2700], atk: [750, 950], def: [700, 900], matk: [500, 700], spd: [650, 850] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  hooligan_wild: {
    id: 'hooligan_wild', name: '街头混混', quality: 'ordinary', qualityName: '普通',
    element: 'gold', elementName: '金', reqLevel: 3, icon: '🥋',
    desc: '【普通野怪】市井街头游荡的地痞闲汉，棍棒乱舞，仅普攻。',
    growthRange: [0.71, 0.85],
    initialStats: {
      growth: { name: '成长率', init: '0.77', range: '0.71 ~ 0.85', min: 0.71, max: 0.85 },
      hp: { name: '生命值', init: 58, range: '52 ~ 74', min: 52, max: 74 },
      mp: { name: '法力值', init: 38, range: '30 ~ 50', min: 30, max: 50 },
      atk: { name: '攻击力', init: 28, range: '20 ~ 42', min: 20, max: 42 },
      spd: { name: '速度', init: 8, range: '4 ~ 15', min: 4, max: 15 },
      def: { name: '防御力', init: 24, range: '18 ~ 35', min: 18, max: 35 }
    },
    aptitudes: { hp: [2300, 2900], atk: [850, 1050], def: [750, 950], matk: [400, 600], spd: [750, 950] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  caokou: {
    id: 'caokou', name: '绿林草寇', quality: 'ordinary', qualityName: '普通',
    element: 'gold', elementName: '金', reqLevel: 5, icon: '🗡️',
    desc: '【普通野怪】崇山峻岭间打家劫舍的匪寇，刀法粗劣，仅普攻。',
    growthRange: [0.72, 0.86],
    initialStats: {
      growth: { name: '成长率', init: '0.78', range: '0.72 ~ 0.86', min: 0.72, max: 0.86 },
      hp: { name: '生命值', init: 62, range: '55 ~ 78', min: 55, max: 78 },
      mp: { name: '法力值', init: 40, range: '32 ~ 52', min: 32, max: 52 },
      atk: { name: '攻击力', init: 32, range: '22 ~ 45', min: 22, max: 45 },
      spd: { name: '速度', init: 9, range: '5 ~ 16', min: 5, max: 16 },
      def: { name: '防御力', init: 26, range: '20 ~ 38', min: 20, max: 38 }
    },
    aptitudes: { hp: [2400, 3000], atk: [900, 1100], def: [800, 1000], matk: [450, 650], spd: [800, 1000] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  kushu_jing: {
    id: 'kushu_jing', name: '百年树精', quality: 'ordinary', qualityName: '普通',
    element: 'wood', elementName: '木', reqLevel: 5, icon: '🪵',
    desc: '【普通野怪】五行山脚下扎根百年的古木老藤，木属性，躯干坚韧。',
    growthRange: [0.72, 0.86],
    initialStats: {
      growth: { name: '成长率', init: '0.78', range: '0.72 ~ 0.86', min: 0.72, max: 0.86 },
      hp: { name: '生命值', init: 68, range: '60 ~ 82', min: 60, max: 82 },
      mp: { name: '法力值', init: 48, range: '40 ~ 60', min: 40, max: 60 },
      atk: { name: '攻击力', init: 26, range: '18 ~ 40', min: 18, max: 40 },
      spd: { name: '速度', init: 6, range: '2 ~ 12', min: 2, max: 12 },
      def: { name: '防御力', init: 32, range: '25 ~ 45', min: 25, max: 45 }
    },
    aptitudes: { hp: [2500, 3100], atk: [700, 900], def: [1000, 1250], matk: [600, 800], spd: [450, 650] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  shuyao: {
    id: 'shuyao', name: '嗜血树妖', quality: 'ordinary', qualityName: '普通',
    element: 'wood', elementName: '木', reqLevel: 12, icon: '🌲',
    desc: '【普通野怪】百年树精吞噬精血进化而成，枝叶如爪，根系嗜血。',
    growthRange: [0.76, 0.89],
    initialStats: {
      growth: { name: '成长率', init: '0.82', range: '0.76 ~ 0.89', min: 0.76, max: 0.89 },
      hp: { name: '生命值', init: 76, range: '68 ~ 88', min: 68, max: 88 },
      mp: { name: '法力值', init: 56, range: '48 ~ 70', min: 48, max: 70 },
      atk: { name: '攻击力', init: 36, range: '25 ~ 50', min: 25, max: 50 },
      spd: { name: '速度', init: 8, range: '4 ~ 15', min: 4, max: 15 },
      def: { name: '防御力', init: 38, range: '30 ~ 52', min: 30, max: 52 }
    },
    aptitudes: { hp: [2800, 3400], atk: [850, 1050], def: [1100, 1350], matk: [700, 900], spd: [550, 750] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  wolf_wild: {
    id: 'wolf_wild', name: '巡山野狼', quality: 'ordinary', qualityName: '普通',
    element: 'gold', elementName: '金', reqLevel: 6, icon: '🐺',
    desc: '【普通野怪】荒野间成群出没的饿狼，尖牙利齿，迅猛扑杀。',
    growthRange: [0.73, 0.87],
    initialStats: {
      growth: { name: '成长率', init: '0.79', range: '0.73 ~ 0.87', min: 0.73, max: 0.87 },
      hp: { name: '生命值', init: 60, range: '54 ~ 76', min: 54, max: 76 },
      mp: { name: '法力值', init: 36, range: '30 ~ 50', min: 30, max: 50 },
      atk: { name: '攻击力', init: 35, range: '26 ~ 48', min: 26, max: 48 },
      spd: { name: '速度', init: 12, range: '7 ~ 18', min: 7, max: 18 },
      def: { name: '防御力', init: 24, range: '18 ~ 34', min: 18, max: 34 }
    },
    aptitudes: { hp: [2400, 3000], atk: [1000, 1200], def: [700, 900], matk: [500, 700], spd: [950, 1200] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  shanlang: {
    id: 'shanlang', name: '恶谷山狼', quality: 'ordinary', qualityName: '普通',
    element: 'gold', elementName: '金', reqLevel: 10, icon: '🐕',
    desc: '【普通野怪】深山幽谷间盘踞的猛狼，性情残暴，嗜血狂奔。',
    growthRange: [0.75, 0.88],
    initialStats: {
      growth: { name: '成长率', init: '0.81', range: '0.75 ~ 0.88', min: 0.75, max: 0.88 },
      hp: { name: '生命值', init: 66, range: '58 ~ 80', min: 58, max: 80 },
      mp: { name: '法力值', init: 40, range: '32 ~ 54', min: 32, max: 54 },
      atk: { name: '攻击力', init: 40, range: '30 ~ 55', min: 30, max: 55 },
      spd: { name: '速度', init: 13, range: '8 ~ 19', min: 8, max: 19 },
      def: { name: '防御力', init: 27, range: '20 ~ 38', min: 20, max: 38 }
    },
    aptitudes: { hp: [2600, 3200], atk: [1050, 1280], def: [750, 950], matk: [550, 750], spd: [1000, 1250] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  langyao: {
    id: 'langyao', name: '啸月狼妖', quality: 'ordinary', qualityName: '普通',
    element: 'gold', elementName: '金', reqLevel: 18, icon: '🐺',
    desc: '【普通野怪】狼群中吞吐月华化形的妖狼，爪如钢刃，身如迅雷。',
    growthRange: [0.78, 0.91],
    initialStats: {
      growth: { name: '成长率', init: '0.84', range: '0.78 ~ 0.91', min: 0.78, max: 0.91 },
      hp: { name: '生命值', init: 74, range: '65 ~ 86', min: 65, max: 86 },
      mp: { name: '法力值', init: 46, range: '36 ~ 60', min: 36, max: 60 },
      atk: { name: '攻击力', init: 50, range: '38 ~ 65', min: 38, max: 65 },
      spd: { name: '速度', init: 15, range: '10 ~ 21', min: 10, max: 21 },
      def: { name: '防御力', init: 32, range: '24 ~ 44', min: 24, max: 44 }
    },
    aptitudes: { hp: [2800, 3400], atk: [1150, 1380], def: [850, 1050], matk: [650, 850], spd: [1100, 1350] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  yinke: {
    id: 'yinke', name: '寅客（虎妖）', quality: 'ordinary', qualityName: '普通',
    element: 'earth', elementName: '土', reqLevel: 15, icon: '🐯',
    desc: '【普通野怪】深山得道的斑斓虎妖，尊称寅客，扑咬势大力沉。',
    growthRange: [0.77, 0.90],
    initialStats: {
      growth: { name: '成长率', init: '0.83', range: '0.77 ~ 0.90', min: 0.77, max: 0.90 },
      hp: { name: '生命值', init: 78, range: '70 ~ 90', min: 70, max: 90 },
      mp: { name: '法力值', init: 38, range: '30 ~ 52', min: 30, max: 52 },
      atk: { name: '攻击力', init: 55, range: '42 ~ 70', min: 42, max: 70 },
      spd: { name: '速度', init: 13, range: '8 ~ 19', min: 8, max: 19 },
      def: { name: '防御力', init: 36, range: '28 ~ 50', min: 28, max: 50 }
    },
    aptitudes: { hp: [3000, 3600], atk: [1250, 1480], def: [950, 1180], matk: [600, 800], spd: [950, 1200] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  diaojing_guai: {
    id: 'diaojing_guai', name: '吊睛怪', quality: 'ordinary', qualityName: '普通',
    element: 'earth', elementName: '土', reqLevel: 22, icon: '🐅',
    desc: '【普通野怪】吊睛白额神虎成精，咆哮惊动百兽，凶威赫赫。',
    growthRange: [0.80, 0.93],
    initialStats: {
      growth: { name: '成长率', init: '0.86', range: '0.80 ~ 0.93', min: 0.80, max: 0.93 },
      hp: { name: '生命值', init: 82, range: '74 ~ 92', min: 74, max: 92 },
      mp: { name: '法力值', init: 44, range: '35 ~ 58', min: 35, max: 58 },
      atk: { name: '攻击力', init: 62, range: '48 ~ 78', min: 48, max: 78 },
      spd: { name: '速度', init: 14, range: '9 ~ 20', min: 9, max: 20 },
      def: { name: '防御力', init: 40, range: '32 ~ 55', min: 32, max: 55 }
    },
    aptitudes: { hp: [3200, 3800], atk: [1350, 1580], def: [1000, 1250], matk: [650, 850], spd: [1000, 1250] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  huli: {
    id: 'huli', name: '野狐狸', quality: 'ordinary', qualityName: '普通',
    element: 'wood', elementName: '木', reqLevel: 6, icon: '🦊',
    desc: '【普通野怪】荒丘洞窟中的机警赤狐，行踪飘忽，善于避敌。',
    growthRange: [0.73, 0.87],
    initialStats: {
      growth: { name: '成长率', init: '0.79', range: '0.73 ~ 0.87', min: 0.73, max: 0.87 },
      hp: { name: '生命值', init: 54, range: '48 ~ 68', min: 48, max: 68 },
      mp: { name: '法力值', init: 52, range: '45 ~ 68', min: 45, max: 68 },
      atk: { name: '攻击力', init: 28, range: '20 ~ 42', min: 20, max: 42 },
      spd: { name: '速度', init: 13, range: '8 ~ 19', min: 8, max: 19 },
      def: { name: '防御力', init: 22, range: '16 ~ 32', min: 16, max: 32 }
    },
    aptitudes: { hp: [2300, 2900], atk: [850, 1050], def: [650, 850], matk: [800, 1000], spd: [1050, 1300] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  hulijing: {
    id: 'hulijing', name: '狐狸精', quality: 'ordinary', qualityName: '普通',
    element: 'wood', elementName: '木', reqLevel: 16, icon: '🦊',
    desc: '【普通野怪】修炼成精的灵狐，略通幻术，爪风带煞。',
    growthRange: [0.77, 0.90],
    initialStats: {
      growth: { name: '成长率', init: '0.83', range: '0.77 ~ 0.90', min: 0.77, max: 0.90 },
      hp: { name: '生命值', init: 64, range: '56 ~ 78', min: 56, max: 78 },
      mp: { name: '法力值', init: 68, range: '58 ~ 82', min: 58, max: 82 },
      atk: { name: '攻击力', init: 38, range: '28 ~ 52', min: 28, max: 52 },
      spd: { name: '速度', init: 16, range: '11 ~ 21', min: 11, max: 21 },
      def: { name: '防御力', init: 26, range: '20 ~ 38', min: 20, max: 38 }
    },
    aptitudes: { hp: [2600, 3200], atk: [950, 1150], def: [750, 950], matk: [1100, 1350], spd: [1200, 1450] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  xiaohua_she: {
    id: 'xiaohua_she', name: '青蛇', quality: 'ordinary', qualityName: '普通',
    element: 'wood', elementName: '木', reqLevel: 5, icon: '🐍',
    desc: '【普通野怪】草莽杂草丛中的青鳞小蛇，行动敏捷，仅普攻。',
    growthRange: [0.74, 0.88],
    initialStats: {
      growth: { name: '成长率', init: '0.80', range: '0.74 ~ 0.88', min: 0.74, max: 0.88 },
      hp: { name: '生命值', init: 56, range: '50 ~ 70', min: 50, max: 70 },
      mp: { name: '法力值', init: 50, range: '42 ~ 65', min: 42, max: 65 },
      atk: { name: '攻击力', init: 32, range: '24 ~ 46', min: 24, max: 46 },
      spd: { name: '速度', init: 14, range: '9 ~ 20', min: 9, max: 20 },
      def: { name: '防御力', init: 22, range: '16 ~ 32', min: 16, max: 32 }
    },
    aptitudes: { hp: [2300, 2900], atk: [900, 1100], def: [700, 900], matk: [650, 850], spd: [900, 1150] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  sheyao: {
    id: 'sheyao', name: '蛇妖', quality: 'ordinary', qualityName: '普通',
    element: 'wood', elementName: '木', reqLevel: 18, icon: '🐍',
    desc: '【普通野怪】盘丝岭深处吞吐毒雾的蛇妖，身段滑腻，撕咬迅捷。',
    growthRange: [0.78, 0.91],
    initialStats: {
      growth: { name: '成长率', init: '0.84', range: '0.78 ~ 0.91', min: 0.78, max: 0.91 },
      hp: { name: '生命值', init: 70, range: '62 ~ 82', min: 62, max: 82 },
      mp: { name: '法力值', init: 60, range: '50 ~ 74', min: 50, max: 74 },
      atk: { name: '攻击力', init: 45, range: '34 ~ 60', min: 34, max: 60 },
      spd: { name: '速度', init: 16, range: '12 ~ 22', min: 12, max: 22 },
      def: { name: '防御力', init: 30, range: '22 ~ 42', min: 22, max: 42 }
    },
    aptitudes: { hp: [2700, 3300], atk: [1050, 1250], def: [850, 1050], matk: [900, 1150], spd: [1150, 1400] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  mihou: {
    id: 'mihou', name: '猕猴', quality: 'ordinary', qualityName: '普通',
    element: 'wood', elementName: '木', reqLevel: 10, icon: '🐵',
    desc: '【普通野怪】花果山跳跃在枝头的猕猴，猴系初阶灵兽。',
    growthRange: [0.76, 0.89],
    initialStats: {
      growth: { name: '成长率', init: '0.82', range: '0.76 ~ 0.89', min: 0.76, max: 0.89 },
      hp: { name: '生命值', init: 62, range: '55 ~ 76', min: 55, max: 76 },
      mp: { name: '法力值', init: 42, range: '35 ~ 55', min: 35, max: 55 },
      atk: { name: '攻击力', init: 38, range: '28 ~ 52', min: 28, max: 52 },
      spd: { name: '速度', init: 13, range: '9 ~ 19', min: 9, max: 19 },
      def: { name: '防御力', init: 26, range: '20 ~ 36', min: 20, max: 36 }
    },
    aptitudes: { hp: [2500, 3100], atk: [950, 1150], def: [800, 1000], matk: [600, 800], spd: [1000, 1250] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  mihou_bing: {
    id: 'mihou_bing', name: '猕猴兵', quality: 'ordinary', qualityName: '普通',
    element: 'wood', elementName: '木', reqLevel: 15, icon: '🐵',
    desc: '【普通野怪】花果山水帘洞操练的先锋猴兵，木属性，机警灵动。',
    growthRange: [0.82, 0.92],
    initialStats: {
      growth: { name: '成长率', init: '0.86', range: '0.82 ~ 0.92', min: 0.82, max: 0.92 },
      hp: { name: '生命值', init: 72, range: '64 ~ 84', min: 64, max: 84 },
      mp: { name: '法力值', init: 48, range: '40 ~ 62', min: 40, max: 62 },
      atk: { name: '攻击力', init: 46, range: '36 ~ 62', min: 36, max: 62 },
      spd: { name: '速度', init: 15, range: '11 ~ 21', min: 11, max: 21 },
      def: { name: '防御力', init: 32, range: '25 ~ 45', min: 25, max: 45 }
    },
    aptitudes: { hp: [2800, 3400], atk: [1100, 1300], def: [900, 1100], matk: [700, 900], spd: [1100, 1350] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  mihou_jiang: {
    id: 'mihou_jiang', name: '猕猴将', quality: 'ordinary', qualityName: '普通',
    element: 'wood', elementName: '木', reqLevel: 22, icon: '🦧',
    desc: '【普通野怪】花果山大帅麾下猕猴战将，武艺精湛，资质强悍。',
    growthRange: [0.84, 0.96],
    initialStats: {
      growth: { name: '成长率', init: '0.89', range: '0.84 ~ 0.96', min: 0.84, max: 0.96 },
      hp: { name: '生命值', init: 80, range: '72 ~ 90', min: 72, max: 90 },
      mp: { name: '法力值', init: 55, range: '46 ~ 68', min: 46, max: 68 },
      atk: { name: '攻击力', init: 58, range: '45 ~ 72', min: 45, max: 72 },
      spd: { name: '速度', init: 16, range: '12 ~ 21', min: 12, max: 21 },
      def: { name: '防御力', init: 38, range: '30 ~ 52', min: 30, max: 52 }
    },
    aptitudes: { hp: [3200, 3800], atk: [1300, 1550], def: [1000, 1220], matk: [800, 1000], spd: [1200, 1450] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  yuanhou: {
    id: 'yuanhou', name: '猿猴', quality: 'ordinary', qualityName: '普通',
    element: 'wood', elementName: '木', reqLevel: 12, icon: '🐒',
    desc: '【普通野怪】水帘洞力士猿猴，体格高大，臂力过人。',
    growthRange: [0.78, 0.91],
    initialStats: {
      growth: { name: '成长率', init: '0.84', range: '0.78 ~ 0.91', min: 0.78, max: 0.91 },
      hp: { name: '生命值', init: 70, range: '62 ~ 82', min: 62, max: 82 },
      mp: { name: '法力值', init: 44, range: '36 ~ 56', min: 36, max: 56 },
      atk: { name: '攻击力', init: 45, range: '35 ~ 60', min: 35, max: 60 },
      spd: { name: '速度', init: 12, range: '8 ~ 18', min: 8, max: 18 },
      def: { name: '防御力', init: 30, range: '24 ~ 42', min: 24, max: 42 }
    },
    aptitudes: { hp: [2800, 3400], atk: [1100, 1300], def: [850, 1050], matk: [650, 850], spd: [950, 1200] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  yuanhou_bing: {
    id: 'yuanhou_bing', name: '猿猴兵', quality: 'ordinary', qualityName: '普通',
    element: 'wood', elementName: '木', reqLevel: 18, icon: '🐒',
    desc: '【普通野怪】花果山巡山力士猿兵，木属性，臂力过人。',
    growthRange: [0.83, 0.94],
    initialStats: {
      growth: { name: '成长率', init: '0.88', range: '0.83 ~ 0.94', min: 0.83, max: 0.94 },
      hp: { name: '生命值', init: 78, range: '70 ~ 88', min: 70, max: 88 },
      mp: { name: '法力值', init: 50, range: '42 ~ 64', min: 42, max: 64 },
      atk: { name: '攻击力', init: 55, range: '44 ~ 70', min: 44, max: 70 },
      spd: { name: '速度', init: 14, range: '10 ~ 20', min: 10, max: 20 },
      def: { name: '防御力', init: 35, range: '28 ~ 48', min: 28, max: 48 }
    },
    aptitudes: { hp: [3000, 3600], atk: [1200, 1420], def: [950, 1150], matk: [750, 950], spd: [1150, 1400] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  yuanhou_jiang: {
    id: 'yuanhou_jiang', name: '猿猴将', quality: 'ordinary', qualityName: '普通',
    element: 'wood', elementName: '木', reqLevel: 25, icon: '🦍',
    desc: '【普通野怪之冠】花果山四健将之一！除速度外所有初值均为普通野怪上限最高（成长率最高0.97，气血最高95，攻击力最高100，法力值最高80，速度最高20）！',
    growthRange: [0.85, 0.97],
    initialStats: {
      growth: { name: '成长率', init: '0.91', range: '0.85 ~ 0.97', min: 0.85, max: 0.97 },
      hp: { name: '生命值', init: 85, range: '78 ~ 95', min: 78, max: 95 },
      mp: { name: '法力值', init: 70, range: '60 ~ 80', min: 60, max: 80 },
      atk: { name: '攻击力', init: 90, range: '80 ~ 100', min: 80, max: 100 },
      spd: { name: '速度', init: 16, range: '12 ~ 20', min: 12, max: 20 },
      def: { name: '防御力', init: 65, range: '55 ~ 75', min: 55, max: 75 }
    },
    aptitudes: { hp: [3500, 4200], atk: [1400, 1680], def: [1100, 1350], matk: [850, 1100], spd: [1100, 1350] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  clam_jing: {
    id: 'clam_jing', name: '河蚌', quality: 'ordinary', qualityName: '普通',
    element: 'water', elementName: '水', reqLevel: 8, icon: '🦪',
    desc: '【普通野怪】东海支流栖息的灵河巨蚌，蚌壳如铁壁，吐水击敌。',
    growthRange: [0.76, 0.90],
    initialStats: {
      growth: { name: '成长率', init: '0.82', range: '0.76 ~ 0.90', min: 0.76, max: 0.90 },
      hp: { name: '生命值', init: 72, range: '65 ~ 85', min: 65, max: 85 },
      mp: { name: '法力值', init: 52, range: '45 ~ 66', min: 45, max: 66 },
      atk: { name: '攻击力', init: 26, range: '18 ~ 40', min: 18, max: 40 },
      spd: { name: '速度', init: 6, range: '2 ~ 12', min: 2, max: 12 },
      def: { name: '防御力', init: 45, range: '35 ~ 60', min: 35, max: 60 }
    },
    aptitudes: { hp: [2800, 3400], atk: [750, 950], def: [1200, 1450], matk: [800, 1050], spd: [480, 680] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  crab_jing: {
    id: 'crab_jing', name: '螃蟹', quality: 'ordinary', qualityName: '普通',
    element: 'water', elementName: '水', reqLevel: 10, icon: '🦀',
    desc: '【普通野怪】浅滩横行的黑甲螃蟹，水属性，双螯如剪。',
    growthRange: [0.76, 0.90],
    initialStats: {
      growth: { name: '成长率', init: '0.82', range: '0.76 ~ 0.90', min: 0.76, max: 0.90 },
      hp: { name: '生命值', init: 70, range: '62 ~ 82', min: 62, max: 82 },
      mp: { name: '法力值', init: 42, range: '36 ~ 56', min: 36, max: 56 },
      atk: { name: '攻击力', init: 35, range: '26 ~ 48', min: 26, max: 48 },
      spd: { name: '速度', init: 8, range: '4 ~ 14', min: 4, max: 14 },
      def: { name: '防御力', init: 42, range: '32 ~ 55', min: 32, max: 55 }
    },
    aptitudes: { hp: [2700, 3300], atk: [950, 1180], def: [1150, 1400], matk: [600, 800], spd: [600, 800] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  lobster_jing: {
    id: 'lobster_jing', name: '龙虾', quality: 'ordinary', qualityName: '普通',
    element: 'water', elementName: '水', reqLevel: 12, icon: '🦞',
    desc: '【普通野怪】深水岩缝中的赤甲龙虾，水属性，长须如鞭，甲壳厚重。',
    growthRange: [0.78, 0.91],
    initialStats: {
      growth: { name: '成长率', init: '0.84', range: '0.78 ~ 0.91', min: 0.78, max: 0.91 },
      hp: { name: '生命值', init: 72, range: '64 ~ 84', min: 64, max: 84 },
      mp: { name: '法力值', init: 45, range: '38 ~ 58', min: 38, max: 58 },
      atk: { name: '攻击力', init: 40, range: '30 ~ 54', min: 30, max: 54 },
      spd: { name: '速度', init: 10, range: '6 ~ 16', min: 6, max: 16 },
      def: { name: '防御力', init: 40, range: '30 ~ 52', min: 30, max: 52 }
    },
    aptitudes: { hp: [2900, 3500], atk: [1000, 1220], def: [1100, 1350], matk: [700, 900], spd: [720, 920] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  bangjing: {
    id: 'bangjing', name: '蚌精', quality: 'ordinary', qualityName: '普通',
    element: 'water', elementName: '水', reqLevel: 20, icon: '🦪',
    desc: '【普通野怪】千年蚌女化形，吐纳灵珠波光，水系防御出众。',
    growthRange: [0.81, 0.94],
    initialStats: {
      growth: { name: '成长率', init: '0.87', range: '0.81 ~ 0.94', min: 0.81, max: 0.94 },
      hp: { name: '生命值', init: 80, range: '72 ~ 90', min: 72, max: 90 },
      mp: { name: '法力值', init: 64, range: '55 ~ 75', min: 55, max: 75 },
      atk: { name: '攻击力', init: 35, range: '25 ~ 50', min: 25, max: 50 },
      spd: { name: '速度', init: 7, range: '3 ~ 14', min: 3, max: 14 },
      def: { name: '防御力', init: 55, range: '45 ~ 70', min: 45, max: 70 }
    },
    aptitudes: { hp: [3200, 3800], atk: [900, 1120], def: [1300, 1550], matk: [950, 1200], spd: [550, 750] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  xia_bing: {
    id: 'xia_bing', name: '虾兵', quality: 'ordinary', qualityName: '普通',
    element: 'water', elementName: '水', reqLevel: 20, icon: '🦐',
    desc: '【普通野怪】东海龙宫亲军小卒，手持玄铁尖戟，水陆两栖。',
    growthRange: [0.82, 0.94],
    initialStats: {
      growth: { name: '成长率', init: '0.88', range: '0.82 ~ 0.94', min: 0.82, max: 0.94 },
      hp: { name: '生命值', init: 78, range: '70 ~ 88', min: 70, max: 88 },
      mp: { name: '法力值', init: 52, range: '45 ~ 66', min: 45, max: 66 },
      atk: { name: '攻击力', init: 54, range: '42 ~ 68', min: 42, max: 68 },
      spd: { name: '速度', init: 12, range: '8 ~ 18', min: 8, max: 18 },
      def: { name: '防御力', init: 44, range: '35 ~ 58', min: 35, max: 58 }
    },
    aptitudes: { hp: [3100, 3700], atk: [1150, 1380], def: [1050, 1280], matk: [800, 1000], spd: [900, 1150] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  xie_jiang: {
    id: 'xie_jiang', name: '蟹将', quality: 'ordinary', qualityName: '普通',
    element: 'water', elementName: '水', reqLevel: 22, icon: '🦀',
    desc: '【普通野怪】东海龙宫黑甲巡海蟹将，巨螯如开山斧，厚甲重铠。',
    growthRange: [0.83, 0.95],
    initialStats: {
      growth: { name: '成长率', init: '0.89', range: '0.83 ~ 0.95', min: 0.83, max: 0.95 },
      hp: { name: '生命值', init: 82, range: '74 ~ 92', min: 74, max: 92 },
      mp: { name: '法力值', init: 50, range: '42 ~ 64', min: 42, max: 64 },
      atk: { name: '攻击力', init: 60, range: '48 ~ 75', min: 48, max: 75 },
      spd: { name: '速度', init: 11, range: '7 ~ 17', min: 7, max: 17 },
      def: { name: '防御力', init: 50, range: '40 ~ 65', min: 40, max: 65 }
    },
    aptitudes: { hp: [3300, 3900], atk: [1250, 1480], def: [1200, 1450], matk: [750, 950], spd: [850, 1100] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  yuxian: {
    id: 'yuxian', name: '鱼仙', quality: 'ordinary', qualityName: '普通',
    element: 'water', elementName: '水', reqLevel: 24, icon: '🐟',
    desc: '【普通野怪】龙宫深水清修得道的小仙灵，法力充盈。',
    growthRange: [0.83, 0.95],
    initialStats: {
      growth: { name: '成长率', init: '0.89', range: '0.83 ~ 0.95', min: 0.83, max: 0.95 },
      hp: { name: '生命值', init: 76, range: '68 ~ 86', min: 68, max: 86 },
      mp: { name: '法力值', init: 68, range: '60 ~ 80', min: 60, max: 80 },
      atk: { name: '攻击力', init: 42, range: '32 ~ 56', min: 32, max: 56 },
      spd: { name: '速度', init: 15, range: '11 ~ 21', min: 11, max: 21 },
      def: { name: '防御力', init: 36, range: '28 ~ 48', min: 28, max: 48 }
    },
    aptitudes: { hp: [3000, 3600], atk: [950, 1180], def: [900, 1120], matk: [1150, 1380], spd: [1100, 1350] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  shuiyao: {
    id: 'shuiyao', name: '水妖', quality: 'ordinary', qualityName: '普通',
    element: 'water', elementName: '水', reqLevel: 16, icon: '🌊',
    desc: '【普通野怪】碧波中翻江倒海的恶妖，掀起暗涌，爪牙尖锐。',
    growthRange: [0.79, 0.92],
    initialStats: {
      growth: { name: '成长率', init: '0.85', range: '0.79 ~ 0.92', min: 0.79, max: 0.92 },
      hp: { name: '生命值', init: 74, range: '66 ~ 85', min: 66, max: 85 },
      mp: { name: '法力值', init: 60, range: '52 ~ 72', min: 52, max: 72 },
      atk: { name: '攻击力', init: 44, range: '34 ~ 58', min: 34, max: 58 },
      spd: { name: '速度', init: 13, range: '9 ~ 19', min: 9, max: 19 },
      def: { name: '防御力', init: 34, range: '26 ~ 46', min: 26, max: 46 }
    },
    aptitudes: { hp: [2900, 3500], atk: [1000, 1220], def: [850, 1050], matk: [1000, 1220], spd: [950, 1200] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  hongliyu: {
    id: 'hongliyu', name: '红鲤鱼', quality: 'ordinary', qualityName: '普通',
    element: 'water', elementName: '水', reqLevel: 15, icon: '🐟',
    desc: '【普通野怪】流沙河特产，红鳞赤尾，灵动破浪。',
    growthRange: [0.78, 0.91],
    initialStats: {
      growth: { name: '成长率', init: '0.84', range: '0.78 ~ 0.91', min: 0.78, max: 0.91 },
      hp: { name: '生命值', init: 68, range: '60 ~ 80', min: 60, max: 80 },
      mp: { name: '法力值', init: 58, range: '50 ~ 72', min: 50, max: 72 },
      atk: { name: '攻击力', init: 38, range: '28 ~ 50', min: 28, max: 50 },
      spd: { name: '速度', init: 16, range: '12 ~ 21', min: 12, max: 21 },
      def: { name: '防御力', init: 32, range: '24 ~ 42', min: 24, max: 42 }
    },
    aptitudes: { hp: [2800, 3400], atk: [950, 1180], def: [800, 1000], matk: [1050, 1280], spd: [1150, 1400] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  heiyu: {
    id: 'heiyu', name: '黑鱼', quality: 'ordinary', qualityName: '普通',
    element: 'water', elementName: '水', reqLevel: 17, icon: '🐡',
    desc: '【普通野怪】流沙河特产，乌黑凶暴，撕咬猛烈。',
    growthRange: [0.79, 0.92],
    initialStats: {
      growth: { name: '成长率', init: '0.85', range: '0.79 ~ 0.92', min: 0.79, max: 0.92 },
      hp: { name: '生命值', init: 75, range: '66 ~ 86', min: 66, max: 86 },
      mp: { name: '法力值', init: 52, range: '45 ~ 65', min: 45, max: 65 },
      atk: { name: '攻击力', init: 48, range: '38 ~ 62', min: 38, max: 62 },
      spd: { name: '速度', init: 14, range: '10 ~ 20', min: 10, max: 20 },
      def: { name: '防御力', init: 36, range: '28 ~ 48', min: 28, max: 48 }
    },
    aptitudes: { hp: [3000, 3600], atk: [1100, 1320], def: [900, 1120], matk: [850, 1080], spd: [1000, 1250] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  youhun: {
    id: 'youhun', name: '幽魂', quality: 'ordinary', qualityName: '普通',
    element: 'water', elementName: '水', reqLevel: 12, icon: '👻',
    desc: '【普通野怪】荒郊孤坟夜游的怨魂，行迹飘忽虚化。',
    growthRange: [0.77, 0.90],
    initialStats: {
      growth: { name: '成长率', init: '0.83', range: '0.77 ~ 0.90', min: 0.77, max: 0.90 },
      hp: { name: '生命值', init: 58, range: '50 ~ 70', min: 50, max: 70 },
      mp: { name: '法力值', init: 64, range: '55 ~ 75', min: 55, max: 75 },
      atk: { name: '攻击力', init: 30, range: '22 ~ 45', min: 22, max: 45 },
      spd: { name: '速度', init: 14, range: '10 ~ 20', min: 10, max: 20 },
      def: { name: '防御力', init: 24, range: '18 ~ 35', min: 18, max: 35 }
    },
    aptitudes: { hp: [2400, 3000], atk: [800, 1000], def: [700, 900], matk: [1100, 1350], spd: [1050, 1300] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  daoshi: {
    id: 'daoshi', name: '道士', quality: 'ordinary', qualityName: '普通',
    element: 'gold', elementName: '金', reqLevel: 14, icon: '🧙',
    desc: '【普通野怪】游走民间的江湖散修道人，桃木剑击。',
    growthRange: [0.77, 0.90],
    initialStats: {
      growth: { name: '成长率', init: '0.83', range: '0.77 ~ 0.90', min: 0.77, max: 0.90 },
      hp: { name: '生命值', init: 66, range: '58 ~ 78', min: 58, max: 78 },
      mp: { name: '法力值', init: 58, range: '50 ~ 70', min: 50, max: 70 },
      atk: { name: '攻击力', init: 40, range: '30 ~ 52', min: 30, max: 52 },
      spd: { name: '速度', init: 12, range: '8 ~ 18', min: 8, max: 18 },
      def: { name: '防御力', init: 30, range: '22 ~ 40', min: 22, max: 40 }
    },
    aptitudes: { hp: [2600, 3200], atk: [950, 1150], def: [800, 1000], matk: [950, 1150], spd: [900, 1150] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  yaodao: {
    id: 'yaodao', name: '妖道', quality: 'ordinary', qualityName: '普通',
    element: 'gold', elementName: '金', reqLevel: 22, icon: '🧙‍♂️',
    desc: '【普通野怪】走火入魔堕入邪道的术士，手持黑幡，煞气缠身。',
    growthRange: [0.82, 0.94],
    initialStats: {
      growth: { name: '成长率', init: '0.88', range: '0.82 ~ 0.94', min: 0.82, max: 0.94 },
      hp: { name: '生命值', init: 75, range: '66 ~ 86', min: 66, max: 86 },
      mp: { name: '法力值', init: 70, range: '62 ~ 82', min: 62, max: 82 },
      atk: { name: '攻击力', init: 48, range: '38 ~ 62', min: 38, max: 62 },
      spd: { name: '速度', init: 14, range: '10 ~ 20', min: 10, max: 20 },
      def: { name: '防御力', init: 34, range: '26 ~ 46', min: 26, max: 46 }
    },
    aptitudes: { hp: [2900, 3500], atk: [1100, 1300], def: [850, 1050], matk: [1200, 1450], spd: [1000, 1250] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  duxie: {
    id: 'duxie', name: '毒蝎', quality: 'ordinary', qualityName: '普通',
    element: 'earth', elementName: '土', reqLevel: 15, icon: '🦂',
    desc: '【普通野怪】荒漠乱石滩栖息的铁甲毒蝎，尾针倒刺破甲。',
    growthRange: [0.78, 0.91],
    initialStats: {
      growth: { name: '成长率', init: '0.84', range: '0.78 ~ 0.91', min: 0.78, max: 0.91 },
      hp: { name: '生命值', init: 68, range: '60 ~ 80', min: 60, max: 80 },
      mp: { name: '法力值', init: 48, range: '40 ~ 60', min: 40, max: 60 },
      atk: { name: '攻击力', init: 46, range: '36 ~ 60', min: 36, max: 60 },
      spd: { name: '速度', init: 13, range: '9 ~ 19', min: 9, max: 19 },
      def: { name: '防御力', init: 40, range: '32 ~ 52', min: 32, max: 52 }
    },
    aptitudes: { hp: [2700, 3300], atk: [1050, 1250], def: [1000, 1250], matk: [750, 950], spd: [950, 1200] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  shiguai: {
    id: 'shiguai', name: '石怪', quality: 'ordinary', qualityName: '普通',
    element: 'earth', elementName: '土', reqLevel: 16, icon: '🪨',
    desc: '【普通野怪】崇山顽石孕育之怪，躯体沉重如岳，物理抗性极佳。',
    growthRange: [0.78, 0.91],
    initialStats: {
      growth: { name: '成长率', init: '0.84', range: '0.78 ~ 0.91', min: 0.78, max: 0.91 },
      hp: { name: '生命值', init: 80, range: '72 ~ 90', min: 72, max: 90 },
      mp: { name: '法力值', init: 36, range: '28 ~ 48', min: 28, max: 48 },
      atk: { name: '攻击力', init: 42, range: '32 ~ 55', min: 32, max: 55 },
      spd: { name: '速度', init: 6, range: '2 ~ 12', min: 2, max: 12 },
      def: { name: '防御力', init: 52, range: '42 ~ 68', min: 42, max: 68 }
    },
    aptitudes: { hp: [3200, 3800], atk: [950, 1180], def: [1350, 1600], matk: [550, 750], spd: [450, 650] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  zhizhuguai: {
    id: 'zhizhuguai', name: '蜘蛛怪', quality: 'ordinary', qualityName: '普通',
    element: 'earth', elementName: '土', reqLevel: 18, icon: '🕷️',
    desc: '【普通野怪】盘丝洞外结网守株待兔的八足巨蛛，撕咬缠绕。',
    growthRange: [0.79, 0.92],
    initialStats: {
      growth: { name: '成长率', init: '0.85', range: '0.79 ~ 0.92', min: 0.79, max: 0.92 },
      hp: { name: '生命值', init: 72, range: '64 ~ 84', min: 64, max: 84 },
      mp: { name: '法力值', init: 56, range: '48 ~ 68', min: 48, max: 68 },
      atk: { name: '攻击力', init: 45, range: '35 ~ 58', min: 35, max: 58 },
      spd: { name: '速度', init: 14, range: '10 ~ 20', min: 10, max: 20 },
      def: { name: '防御力', init: 36, range: '28 ~ 48', min: 28, max: 48 }
    },
    aptitudes: { hp: [2900, 3500], atk: [1050, 1250], def: [950, 1150], matk: [850, 1050], spd: [1000, 1250] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  heixiong_guai_mob: {
    id: 'heixiong_guai_mob', name: '黑熊怪', quality: 'ordinary', qualityName: '普通',
    element: 'earth', elementName: '土', reqLevel: 20, icon: '🐻',
    desc: '【普通野怪】黑风山洞府巡山壮汉黑熊，体魄健硕，巨掌开碑。',
    growthRange: [0.82, 0.95],
    initialStats: {
      growth: { name: '成长率', init: '0.88', range: '0.82 ~ 0.95', min: 0.82, max: 0.95 },
      hp: { name: '生命值', init: 84, range: '76 ~ 92', min: 76, max: 92 },
      mp: { name: '法力值', init: 38, range: '30 ~ 50', min: 30, max: 50 },
      atk: { name: '攻击力', init: 62, range: '50 ~ 78', min: 50, max: 78 },
      spd: { name: '速度', init: 10, range: '6 ~ 16', min: 6, max: 16 },
      def: { name: '防御力', init: 45, range: '36 ~ 58', min: 36, max: 58 }
    },
    aptitudes: { hp: [3400, 4000], atk: [1300, 1550], def: [1100, 1350], matk: [650, 850], spd: [750, 950] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  baigu_xiaoyao: {
    id: 'baigu_xiaoyao', name: '白骨小妖', quality: 'ordinary', qualityName: '普通',
    element: 'gold', elementName: '金', reqLevel: 20, icon: '💀',
    desc: '【普通野怪】白虎岭枯骨聚集阴气而成的小妖，骨刀森森。',
    growthRange: [0.81, 0.94],
    initialStats: {
      growth: { name: '成长率', init: '0.87', range: '0.81 ~ 0.94', min: 0.81, max: 0.94 },
      hp: { name: '生命值', init: 70, range: '62 ~ 82', min: 62, max: 82 },
      mp: { name: '法力值', init: 54, range: '45 ~ 65', min: 45, max: 65 },
      atk: { name: '攻击力', init: 50, range: '40 ~ 65', min: 40, max: 65 },
      spd: { name: '速度', init: 15, range: '11 ~ 21', min: 11, max: 21 },
      def: { name: '防御力', init: 34, range: '25 ~ 45', min: 25, max: 45 }
    },
    aptitudes: { hp: [2800, 3400], atk: [1150, 1380], def: [900, 1100], matk: [800, 1000], spd: [1100, 1350] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  huabanzhu: {
    id: 'huabanzhu', name: '花斑蛛', quality: 'ordinary', qualityName: '普通',
    element: 'wood', elementName: '木', reqLevel: 24, icon: '🕷️',
    desc: '【普通野怪】密林中花纹斑驳的剧毒妖蛛，动作轻灵。',
    growthRange: [0.83, 0.95],
    initialStats: {
      growth: { name: '成长率', init: '0.89', range: '0.83 ~ 0.95', min: 0.83, max: 0.95 },
      hp: { name: '生命值', init: 76, range: '68 ~ 86', min: 68, max: 86 },
      mp: { name: '法力值', init: 62, range: '54 ~ 74', min: 54, max: 74 },
      atk: { name: '攻击力', init: 52, range: '42 ~ 68', min: 42, max: 68 },
      spd: { name: '速度', init: 16, range: '12 ~ 21', min: 12, max: 21 },
      def: { name: '防御力', init: 38, range: '30 ~ 50', min: 30, max: 50 }
    },
    aptitudes: { hp: [3000, 3600], atk: [1200, 1420], def: [950, 1150], matk: [950, 1200], spd: [1150, 1400] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  lingmao: {
    id: 'lingmao', name: '灵猫', quality: 'ordinary', qualityName: '普通',
    element: 'wood', elementName: '木', reqLevel: 16, icon: '🐱',
    desc: '【普通野怪】幽谷中穿梭通灵的花狸野猫，爪带微风，身形敏巧。',
    growthRange: [0.79, 0.92],
    initialStats: {
      growth: { name: '成长率', init: '0.85', range: '0.79 ~ 0.92', min: 0.79, max: 0.92 },
      hp: { name: '生命值', init: 60, range: '52 ~ 72', min: 52, max: 72 },
      mp: { name: '法力值', init: 56, range: '48 ~ 68', min: 48, max: 68 },
      atk: { name: '攻击力', init: 42, range: '32 ~ 55', min: 32, max: 55 },
      spd: { name: '速度', init: 17, range: '13 ~ 22', min: 13, max: 22 },
      def: { name: '防御力', init: 27, range: '20 ~ 38', min: 20, max: 38 }
    },
    aptitudes: { hp: [2600, 3200], atk: [1050, 1250], def: [750, 950], matk: [850, 1050], spd: [1250, 1500] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  cat_demon: {
    id: 'cat_demon', name: '猫妖', quality: 'ordinary', qualityName: '普通',
    element: 'wood', elementName: '木', reqLevel: 25, icon: '🐱',
    desc: '【普通野怪】九命通灵猫妖，木属性，身手极敏，利爪撕裂幽风。',
    growthRange: [0.84, 0.96],
    initialStats: {
      growth: { name: '成长率', init: '0.90', range: '0.84 ~ 0.96', min: 0.84, max: 0.96 },
      hp: { name: '生命值', init: 72, range: '64 ~ 84', min: 64, max: 84 },
      mp: { name: '法力值', init: 64, range: '56 ~ 76', min: 56, max: 76 },
      atk: { name: '攻击力', init: 55, range: '44 ~ 70', min: 44, max: 70 },
      spd: { name: '速度', init: 18, range: '14 ~ 23', min: 14, max: 23 },
      def: { name: '防御力', init: 34, range: '26 ~ 46', min: 26, max: 46 }
    },
    aptitudes: { hp: [2900, 3500], atk: [1200, 1420], def: [850, 1080], matk: [1000, 1250], spd: [1300, 1550] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  shuyao_rat: {
    id: 'shuyao_rat', name: '鼠妖', quality: 'ordinary', qualityName: '普通',
    element: 'earth', elementName: '土', reqLevel: 18, icon: '🐭',
    desc: '【普通野怪】硕鼠吞噬月华化形而成的鼠妖，鼠系进化树阶段一。',
    growthRange: [0.80, 0.93],
    initialStats: {
      growth: { name: '成长率', init: '0.86', range: '0.80 ~ 0.93', min: 0.80, max: 0.93 },
      hp: { name: '生命值', init: 66, range: '58 ~ 78', min: 58, max: 78 },
      mp: { name: '法力值', init: 55, range: '46 ~ 68', min: 46, max: 68 },
      atk: { name: '攻击力', init: 44, range: '34 ~ 58', min: 34, max: 58 },
      spd: { name: '速度', init: 17, range: '13 ~ 22', min: 13, max: 22 },
      def: { name: '防御力', init: 30, range: '22 ~ 40', min: 22, max: 40 }
    },
    aptitudes: { hp: [2700, 3300], atk: [1050, 1250], def: [800, 1000], matk: [800, 1000], spd: [1200, 1450] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  kanjing: {
    id: 'kanjing', name: '坎精', quality: 'ordinary', qualityName: '普通',
    element: 'water', elementName: '水', reqLevel: 26, icon: '🐀',
    desc: '【普通野怪】坎水灵穴孕育的通灵地鼠精，鼠类演化阶段二，身轻如燕。',
    growthRange: [0.83, 0.95],
    initialStats: {
      growth: { name: '成长率', init: '0.89', range: '0.83 ~ 0.95', min: 0.83, max: 0.95 },
      hp: { name: '生命值', init: 75, range: '68 ~ 86', min: 68, max: 86 },
      mp: { name: '法力值', init: 66, range: '58 ~ 78', min: 58, max: 78 },
      atk: { name: '攻击力', init: 52, range: '42 ~ 68', min: 42, max: 68 },
      spd: { name: '速度', init: 19, range: '15 ~ 23', min: 15, max: 23 },
      def: { name: '防御力', init: 36, range: '28 ~ 48', min: 28, max: 48 }
    },
    aptitudes: { hp: [3000, 3600], atk: [1150, 1380], def: [900, 1120], matk: [950, 1180], spd: [1350, 1600] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  zishen: {
    id: 'zishen', name: '子神', quality: 'ordinary', qualityName: '普通',
    element: 'water', elementName: '水', reqLevel: 35, icon: '🐀',
    desc: '【普通野怪速度之巅】十二地支子鼠神明法相！鼠类演化终极神化，普通野怪速度初值全服第一（最高初值可达23）！',
    growthRange: [0.85, 0.97],
    initialStats: {
      growth: { name: '成长率', init: '0.91', range: '0.85 ~ 0.97', min: 0.85, max: 0.97 },
      hp: { name: '生命值', init: 82, range: '75 ~ 92', min: 75, max: 92 },
      mp: { name: '法力值', init: 72, range: '65 ~ 80', min: 65, max: 80 },
      atk: { name: '攻击力', init: 60, range: '50 ~ 75', min: 50, max: 75 },
      spd: { name: '速度', init: 20, range: '16 ~ 23', min: 16, max: 23 },
      def: { name: '防御力', init: 40, range: '32 ~ 52', min: 32, max: 52 }
    },
    aptitudes: { hp: [3200, 3800], atk: [1250, 1500], def: [950, 1180], matk: [1100, 1350], spd: [1450, 1750] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  zijingguai: {
    id: 'zijingguai', name: '紫晶怪', quality: 'ordinary', qualityName: '普通',
    element: 'earth', elementName: '土', reqLevel: 28, icon: '💎',
    desc: '【普通野怪】灵山紫晶矿脉中凝聚灵识的坚晶怪兽，躯体璀璨坚硬。',
    growthRange: [0.83, 0.95],
    initialStats: {
      growth: { name: '成长率', init: '0.89', range: '0.83 ~ 0.95', min: 0.83, max: 0.95 },
      hp: { name: '生命值', init: 85, range: '78 ~ 94', min: 78, max: 94 },
      mp: { name: '法力值', init: 44, range: '35 ~ 55', min: 35, max: 55 },
      atk: { name: '攻击力', init: 58, range: '45 ~ 72', min: 45, max: 72 },
      spd: { name: '速度', init: 8, range: '4 ~ 14', min: 4, max: 14 },
      def: { name: '防御力', init: 62, range: '50 ~ 75', min: 50, max: 75 }
    },
    aptitudes: { hp: [3300, 3900], atk: [1200, 1420], def: [1400, 1650], matk: [700, 900], spd: [600, 800] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  hualishu: {
    id: 'hualishu', name: '花狸鼠', quality: 'ordinary', qualityName: '普通',
    element: 'wood', elementName: '木', reqLevel: 20, icon: '🐿️',
    desc: '【普通野怪】密林松梢间跳跃的斑纹花狸松鼠，机警灵敏。',
    growthRange: [0.81, 0.94],
    initialStats: {
      growth: { name: '成长率', init: '0.87', range: '0.81 ~ 0.94', min: 0.81, max: 0.94 },
      hp: { name: '生命值', init: 64, range: '56 ~ 76', min: 56, max: 76 },
      mp: { name: '法力值', init: 56, range: '48 ~ 68', min: 48, max: 68 },
      atk: { name: '攻击力', init: 45, range: '35 ~ 58', min: 35, max: 58 },
      spd: { name: '速度', init: 18, range: '14 ~ 22', min: 14, max: 22 },
      def: { name: '防御力', init: 30, range: '22 ~ 40', min: 22, max: 40 }
    },
    aptitudes: { hp: [2700, 3300], atk: [1050, 1250], def: [800, 1000], matk: [800, 1000], spd: [1300, 1550] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  changwei_yaoji: {
    id: 'changwei_yaoji', name: '长尾妖鸡', quality: 'ordinary', qualityName: '普通',
    element: 'fire', elementName: '火', reqLevel: 22, icon: '🐓',
    desc: '【普通野怪】啼晓催日落的长尾火羽妖禽，尖喙穿甲，火气升腾。',
    growthRange: [0.82, 0.94],
    initialStats: {
      growth: { name: '成长率', init: '0.88', range: '0.82 ~ 0.94', min: 0.82, max: 0.94 },
      hp: { name: '生命值', init: 68, range: '60 ~ 80', min: 60, max: 80 },
      mp: { name: '法力值', init: 54, range: '45 ~ 65', min: 45, max: 65 },
      atk: { name: '攻击力', init: 52, range: '42 ~ 68', min: 42, max: 68 },
      spd: { name: '速度', init: 17, range: '13 ~ 22', min: 13, max: 22 },
      def: { name: '防御力', init: 32, range: '24 ~ 42', min: 24, max: 42 }
    },
    aptitudes: { hp: [2800, 3400], atk: [1150, 1380], def: [850, 1050], matk: [900, 1120], spd: [1250, 1500] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  huangjin_shachong: {
    id: 'huangjin_shachong', name: '黄金沙虫', quality: 'ordinary', qualityName: '普通',
    element: 'earth', elementName: '土', reqLevel: 25, icon: '🐛',
    desc: '【普通野怪】八百里黄沙深处潜伏的金甲沙虫，巨颚凶残。',
    growthRange: [0.83, 0.95],
    initialStats: {
      growth: { name: '成长率', init: '0.89', range: '0.83 ~ 0.95', min: 0.83, max: 0.95 },
      hp: { name: '生命值', init: 82, range: '74 ~ 92', min: 74, max: 92 },
      mp: { name: '法力值', init: 46, range: '38 ~ 58', min: 38, max: 58 },
      atk: { name: '攻击力', init: 60, range: '48 ~ 75', min: 48, max: 75 },
      spd: { name: '速度', init: 10, range: '6 ~ 16', min: 6, max: 16 },
      def: { name: '防御力', init: 55, range: '45 ~ 68', min: 45, max: 68 }
    },
    aptitudes: { hp: [3200, 3800], atk: [1250, 1480], def: [1250, 1500], matk: [750, 950], spd: [750, 950] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  shijing: {
    id: 'shijing', name: '石精', quality: 'ordinary', qualityName: '普通',
    element: 'earth', elementName: '土', reqLevel: 28, icon: '🪨',
    desc: '【普通野怪】崇山灵石受天地交感凝结而成的石髓灵精，甲坚无比。',
    growthRange: [0.84, 0.96],
    initialStats: {
      growth: { name: '成长率', init: '0.90', range: '0.84 ~ 0.96', min: 0.84, max: 0.96 },
      hp: { name: '生命值', init: 86, range: '80 ~ 94', min: 80, max: 94 },
      mp: { name: '法力值', init: 40, range: '32 ~ 52', min: 32, max: 52 },
      atk: { name: '攻击力', init: 58, range: '46 ~ 74', min: 46, max: 74 },
      spd: { name: '速度', init: 7, range: '3 ~ 13', min: 3, max: 13 },
      def: { name: '防御力', init: 64, range: '52 ~ 78', min: 52, max: 78 }
    },
    aptitudes: { hp: [3400, 4000], atk: [1200, 1450], def: [1450, 1750], matk: [650, 850], spd: [550, 750] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  shiyao: {
    id: 'shiyao', name: '石妖', quality: 'ordinary', qualityName: '普通',
    element: 'earth', elementName: '土', reqLevel: 32, icon: '🗿',
    desc: '【普通野怪】万载巨岩裂地化妖，重若丘峦，一拳崩山裂石。',
    growthRange: [0.85, 0.97],
    initialStats: {
      growth: { name: '成长率', init: '0.91', range: '0.85 ~ 0.97', min: 0.85, max: 0.97 },
      hp: { name: '生命值', init: 88, range: '84 ~ 95', min: 84, max: 95 },
      mp: { name: '法力值', init: 45, range: '36 ~ 58', min: 36, max: 58 },
      atk: { name: '攻击力', init: 65, range: '52 ~ 80', min: 52, max: 80 },
      spd: { name: '速度', init: 8, range: '4 ~ 14', min: 4, max: 14 },
      def: { name: '防御力', init: 68, range: '55 ~ 80', min: 55, max: 80 }
    },
    aptitudes: { hp: [3500, 4100], atk: [1300, 1550], def: [1500, 1800], matk: [700, 900], spd: [600, 800] },
    skills: [], canLearnSkill: false, canTransform: false, catchRate: 0.80
  },

  // =========================================================================
  // 二、散仙仙宠系列 (严格限定 12 种，成长率 0.87 ~ 1.08，银壶收服，10级可学技能，不可变身)
  // =========================================================================
  juling_shen: {
    id: 'juling_shen', name: '巨灵神', quality: 'sanxian', qualityName: '散仙',
    element: 'earth', elementName: '土', reqLevel: 15, icon: '🪓', gender: 'male',
    desc: '【散仙仙宠·气血力沉】托塔天王部下宣花斧巨灵神将！气血极高（初值最高108），物理攻击强横，但速度初值极低（最高仅12）。',
    growthRange: [0.88, 1.02],
    initialStats: {
      growth: { name: '成长率', init: '0.95', range: '0.88 ~ 1.02', min: 0.88, max: 1.02 },
      hp: { name: '生命值', init: 99, range: '90 ~ 108', min: 90, max: 108 },
      mp: { name: '法力值', init: 32, range: '25 ~ 38', min: 25, max: 38 },
      atk: { name: '攻击力', init: 88, range: '80 ~ 96', min: 80, max: 96 },
      spd: { name: '速度', init: 9, range: '6 ~ 12', min: 6, max: 12 },
      def: { name: '防御力', init: 78, range: '70 ~ 88', min: 70, max: 88 }
    },
    aptitudes: { hp: [4800, 5600], atk: [1550, 1850], def: [1400, 1700], matk: [800, 1050], spd: [700, 950] },
    skills: [], canLearnSkill: true, canTransform: false, catchRate: 0.70
  },

  chiguo_tianwang: {
    id: 'chiguo_tianwang', name: '持国天王', quality: 'sanxian', qualityName: '散仙',
    element: 'wood', elementName: '木', reqLevel: 25, icon: '🪕', gender: 'male',
    desc: '【散仙仙宠·东方天王】手执碧玉琵琶之护世正神，法音撼动四野，均衡法修仙宠。',
    growthRange: [0.94, 1.07],
    initialStats: {
      growth: { name: '成长率', init: '1.00', range: '0.94 ~ 1.07', min: 0.94, max: 1.07 },
      hp: { name: '生命值', init: 90, range: '82 ~ 98', min: 82, max: 98 },
      mp: { name: '法力值', init: 80, range: '72 ~ 88', min: 72, max: 88 },
      atk: { name: '攻击力', init: 72, range: '65 ~ 80', min: 65, max: 80 },
      spd: { name: '速度', init: 29, range: '24 ~ 34', min: 24, max: 34 },
      def: { name: '防御力', init: 68, range: '60 ~ 76', min: 60, max: 76 }
    },
    aptitudes: { hp: [4300, 5100], atk: [1400, 1700], def: [1300, 1550], matk: [1600, 1900], spd: [1200, 1450] },
    skills: [], canLearnSkill: true, canTransform: false, catchRate: 0.70
  },

  zengzhang_tianwang: {
    id: 'zengzhang_tianwang', name: '增长天王', quality: 'sanxian', qualityName: '散仙',
    element: 'fire', elementName: '火', reqLevel: 26, icon: '⚔️', gender: 'male',
    desc: '【散仙仙宠·南方天王】手握青云宝剑，引动烈焰黑风，攻敏双修神将。',
    growthRange: [0.94, 1.07],
    initialStats: {
      growth: { name: '成长率', init: '1.01', range: '0.94 ~ 1.07', min: 0.94, max: 1.07 },
      hp: { name: '生命值', init: 88, range: '80 ~ 96', min: 80, max: 96 },
      mp: { name: '法力值', init: 65, range: '58 ~ 72', min: 58, max: 72 },
      atk: { name: '攻击力', init: 85, range: '78 ~ 92', min: 78, max: 92 },
      spd: { name: '速度', init: 32, range: '26 ~ 37', min: 26, max: 37 },
      def: { name: '防御力', init: 66, range: '58 ~ 74', min: 58, max: 74 }
    },
    aptitudes: { hp: [4200, 5000], atk: [1600, 1900], def: [1250, 1500], matk: [1350, 1600], spd: [1300, 1550] },
    skills: [], canLearnSkill: true, canTransform: false, catchRate: 0.70
  },

  guangmu_tianwang: {
    id: 'guangmu_tianwang', name: '广目天王', quality: 'sanxian', qualityName: '散仙',
    element: 'water', elementName: '水', reqLevel: 27, icon: '🐉', gender: 'male',
    desc: '【散仙仙宠·西方天王】臂缠赤龙神索，双眼明察秋毫，重甲重御防守反击型散仙。',
    growthRange: [0.94, 1.07],
    initialStats: {
      growth: { name: '成长率', init: '1.01', range: '0.94 ~ 1.07', min: 0.94, max: 1.07 },
      hp: { name: '生命值', init: 92, range: '84 ~ 100', min: 84, max: 100 },
      mp: { name: '法力值', init: 68, range: '60 ~ 75', min: 60, max: 75 },
      atk: { name: '攻击力', init: 78, range: '72 ~ 85', min: 72, max: 85 },
      spd: { name: '速度', init: 23, range: '18 ~ 28', min: 18, max: 28 },
      def: { name: '防御力', init: 82, range: '75 ~ 92', min: 75, max: 92 }
    },
    aptitudes: { hp: [4500, 5300], atk: [1450, 1720], def: [1550, 1850], matk: [1300, 1550], spd: [1000, 1250] },
    skills: [], canLearnSkill: true, canTransform: false, catchRate: 0.70
  },

  duowen_tianwang: {
    id: 'duowen_tianwang', name: '多闻天王', quality: 'sanxian', qualityName: '散仙',
    element: 'gold', elementName: '金', reqLevel: 28, icon: '🛡️', gender: 'male',
    desc: '【散仙之巅·均衡卓越】北方天王之首，掌管混元珍珠伞！气血初值高达103，速度高位30~42之间，散仙巅峰成长率 (1.08)！',
    growthRange: [0.95, 1.08],
    initialStats: {
      growth: { name: '成长率', init: '1.02', range: '0.95 ~ 1.08', min: 0.95, max: 1.08 },
      hp: { name: '生命值', init: 94, range: '86 ~ 103', min: 86, max: 103 },
      mp: { name: '法力值', init: 78, range: '70 ~ 85', min: 70, max: 85 },
      atk: { name: '攻击力', init: 82, range: '75 ~ 90', min: 75, max: 90 },
      spd: { name: '速度', init: 36, range: '30 ~ 42', min: 30, max: 42 },
      def: { name: '防御力', init: 76, range: '68 ~ 85', min: 68, max: 85 }
    },
    aptitudes: { hp: [4600, 5400], atk: [1600, 1900], def: [1450, 1750], matk: [1500, 1800], spd: [1400, 1700] },
    skills: [], canLearnSkill: true, canTransform: false, catchRate: 0.70
  },

  sha_wujing: {
    id: 'sha_wujing', name: '巡海夜叉', quality: 'sanxian', qualityName: '散仙',
    element: 'water', elementName: '水', reqLevel: 10, icon: '🔱', gender: 'male',
    desc: '【散仙仙宠】东海深水波涛巡查恶煞，纯正水属性，手持三股托天钢叉！散仙入门基准。',
    growthRange: [0.87, 1.01],
    initialStats: {
      growth: { name: '成长率', init: '0.94', range: '0.87 ~ 1.01', min: 0.87, max: 1.01 },
      hp: { name: '生命值', init: 84, range: '76 ~ 92', min: 76, max: 92 },
      mp: { name: '法力值', init: 68, range: '60 ~ 75', min: 60, max: 75 },
      atk: { name: '攻击力', init: 80, range: '72 ~ 88', min: 72, max: 88 },
      spd: { name: '速度', init: 27, range: '22 ~ 32', min: 22, max: 32 },
      def: { name: '防御力', init: 62, range: '55 ~ 70', min: 55, max: 70 }
    },
    aptitudes: { hp: [3800, 4500], atk: [1350, 1600], def: [1200, 1450], matk: [1100, 1350], spd: [1100, 1350] },
    skills: [], canLearnSkill: true, canTransform: false, catchRate: 0.70
  },

  leigong: {
    id: 'leigong', name: '雷公', quality: 'sanxian', qualityName: '散仙',
    element: 'fire', elementName: '火', reqLevel: 25, icon: '⚡', gender: 'male',
    desc: '【散仙仙宠·速度型】天庭掌管雷霆霹雳正神！速度初值极高（最高达46），气血初值偏少（最高75），高法爆轰击。',
    growthRange: [0.94, 1.07],
    initialStats: {
      growth: { name: '成长率', init: '1.01', range: '0.94 ~ 1.07', min: 0.94, max: 1.07 },
      hp: { name: '生命值', init: 68, range: '60 ~ 75', min: 60, max: 75 },
      mp: { name: '法力值', init: 78, range: '72 ~ 86', min: 72, max: 86 },
      atk: { name: '攻击力', init: 42, range: '35 ~ 48', min: 35, max: 48 },
      spd: { name: '速度', init: 40, range: '35 ~ 46', min: 35, max: 46 },
      def: { name: '防御力', init: 52, range: '45 ~ 60', min: 45, max: 60 }
    },
    aptitudes: { hp: [3800, 4400], atk: [1100, 1350], def: [1050, 1300], matk: [1750, 2100], spd: [1600, 1950] },
    skills: [], canLearnSkill: true, canTransform: false, catchRate: 0.70
  },

  dianmu: {
    id: 'dianmu', name: '电母', quality: 'sanxian', qualityName: '散仙',
    element: 'gold', elementName: '金', reqLevel: 28, icon: '⚡', gender: 'female',
    desc: '【散仙之巅·速度型】瑶池闪电神君！手执双宝镜引动照世极光，速度初值极高（最高达46），气血上限75，巅峰成长率1.08！',
    growthRange: [0.95, 1.08],
    initialStats: {
      growth: { name: '成长率', init: '1.02', range: '0.95 ~ 1.08', min: 0.95, max: 1.08 },
      hp: { name: '生命值', init: 68, range: '60 ~ 75', min: 60, max: 75 },
      mp: { name: '法力值', init: 80, range: '74 ~ 88', min: 74, max: 88 },
      atk: { name: '攻击力', init: 38, range: '32 ~ 45', min: 32, max: 45 },
      spd: { name: '速度', init: 41, range: '36 ~ 46', min: 36, max: 46 },
      def: { name: '防御力', init: 54, range: '46 ~ 62', min: 46, max: 62 }
    },
    aptitudes: { hp: [3900, 4500], atk: [1050, 1300], def: [1100, 1350], matk: [1800, 2200], spd: [1650, 2000] },
    skills: [], canLearnSkill: true, canTransform: false, catchRate: 0.70
  },

  xihai_longwang: {
    id: 'xihai_longwang', name: '西海龙王', quality: 'sanxian', qualityName: '散仙',
    element: 'water', elementName: '水', reqLevel: 30, icon: '🐲', gender: 'male',
    desc: '【散仙之巅·水龙法相】西海水晶宫龙主，呼风唤雨，法力资质雄浑磅礴，散仙巅峰成长率 (1.08)！',
    growthRange: [0.95, 1.08],
    initialStats: {
      growth: { name: '成长率', init: '1.02', range: '0.95 ~ 1.08', min: 0.95, max: 1.08 },
      hp: { name: '生命值', init: 93, range: '85 ~ 102', min: 85, max: 102 },
      mp: { name: '法力值', init: 88, range: '80 ~ 95', min: 80, max: 95 },
      atk: { name: '攻击力', init: 70, range: '65 ~ 78', min: 65, max: 78 },
      spd: { name: '速度', init: 30, range: '25 ~ 36', min: 25, max: 36 },
      def: { name: '防御力', init: 70, range: '62 ~ 78', min: 62, max: 78 }
    },
    aptitudes: { hp: [4500, 5300], atk: [1400, 1680], def: [1400, 1680], matk: [1750, 2150], spd: [1250, 1500] },
    skills: [], canLearnSkill: true, canTransform: false, catchRate: 0.70
  },

  change: {
    id: 'change', name: '嫦娥', quality: 'sanxian', qualityName: '散仙',
    element: 'water', elementName: '水', reqLevel: 30, icon: '🧝‍♀️', gender: 'female',
    desc: '【散仙之巅·均衡仙姿】广寒宫月影仙子！气血初值高达103，出手速度稳健处于30~42之间，法力防御俱全，巅峰成长率1.08！',
    growthRange: [0.95, 1.08],
    initialStats: {
      growth: { name: '成长率', init: '1.02', range: '0.95 ~ 1.08', min: 0.95, max: 1.08 },
      hp: { name: '生命值', init: 94, range: '85 ~ 103', min: 85, max: 103 },
      mp: { name: '法力值', init: 85, range: '78 ~ 92', min: 78, max: 92 },
      atk: { name: '攻击力', init: 56, range: '48 ~ 65', min: 48, max: 65 },
      spd: { name: '速度', init: 38, range: '30 ~ 42', min: 30, max: 42 },
      def: { name: '防御力', init: 68, range: '60 ~ 76', min: 60, max: 76 }
    },
    aptitudes: { hp: [4400, 5200], atk: [1200, 1450], def: [1350, 1600], matk: [1750, 2100], spd: [1450, 1750] },
    skills: [], canLearnSkill: true, canTransform: false, catchRate: 0.70
  },

  chimao_mahou: {
    id: 'chimao_mahou', name: '赤毛马猴', quality: 'sanxian', qualityName: '散仙',
    element: 'fire', elementName: '火', reqLevel: 22, icon: '🐵', gender: 'male',
    desc: '【散仙仙宠·敏攻猴仙】混世四猴之赤尻马猴血脉！晓阴阳会人事，身手极为敏捷（初速最高41），物攻极高（最高96）。',
    growthRange: [0.92, 1.06],
    initialStats: {
      growth: { name: '成长率', init: '0.99', range: '0.92 ~ 1.06', min: 0.92, max: 1.06 },
      hp: { name: '生命值', init: 82, range: '75 ~ 90', min: 75, max: 90 },
      mp: { name: '法力值', init: 58, range: '50 ~ 65', min: 50, max: 65 },
      atk: { name: '攻击力', init: 88, range: '82 ~ 96', min: 82, max: 96 },
      spd: { name: '速度', init: 36, range: '30 ~ 41', min: 30, max: 41 },
      def: { name: '防御力', init: 60, range: '52 ~ 68', min: 52, max: 68 }
    },
    aptitudes: { hp: [4100, 4800], atk: [1650, 1950], def: [1200, 1450], matk: [1200, 1450], spd: [1500, 1800] },
    skills: [], canLearnSkill: true, canTransform: false, catchRate: 0.70
  },

  tongbi_yuanhou: {
    id: 'tongbi_yuanhou', name: '通臂猿猴', quality: 'sanxian', qualityName: '散仙',
    element: 'gold', elementName: '金', reqLevel: 24, icon: '🦍', gender: 'male',
    desc: '【散仙仙宠·力拔千钧】混世四猴之通臂神猿！拿日月缩千山，力大无穷，强力物理战将（初始攻击力最高98）。',
    growthRange: [0.93, 1.07],
    initialStats: {
      growth: { name: '成长率', init: '1.00', range: '0.93 ~ 1.07', min: 0.93, max: 1.07 },
      hp: { name: '生命值', init: 86, range: '78 ~ 94', min: 78, max: 94 },
      mp: { name: '法力值', init: 54, range: '46 ~ 60', min: 46, max: 60 },
      atk: { name: '攻击力', init: 91, range: '84 ~ 98', min: 84, max: 98 },
      spd: { name: '速度', init: 33, range: '28 ~ 38', min: 28, max: 38 },
      def: { name: '防御力', init: 66, range: '58 ~ 74', min: 58, max: 74 }
    },
    aptitudes: { hp: [4300, 5000], atk: [1700, 2050], def: [1300, 1550], matk: [1100, 1350], spd: [1350, 1600] },
    skills: [], canLearnSkill: true, canTransform: false, catchRate: 0.70
  },

  // =========================================================================
  // 三、金仙仙宠系列 (严格限定 15 种，成长率 0.97 ~ 1.18，金壶收服，独享元神变身与变身天赋)
  // =========================================================================
  bailong_ma: {
    id: 'bailong_ma', name: '白龙马', quality: 'jinxian', qualityName: '金仙',
    element: 'water', elementName: '水', reqLevel: 25, icon: '🐎', gender: 'male',
    desc: '【金仙神兽·八部天龙】西海龙王三太子化身！元神【八部天龙】，变身天赋：法术攻击有概率触发法术连击！敏法兼备。',
    growthRange: [0.97, 1.12],
    initialStats: {
      growth: { name: '成长率', init: '1.04', range: '0.97 ~ 1.12', min: 0.97, max: 1.12 },
      hp: { name: '生命值', init: 88, range: '80 ~ 96', min: 80, max: 96 },
      mp: { name: '法力值', init: 98, range: '90 ~ 105', min: 90, max: 105 },
      atk: { name: '攻击力', init: 65, range: '58 ~ 72', min: 58, max: 72 },
      spd: { name: '速度', init: 46, range: '40 ~ 52', min: 40, max: 52 },
      def: { name: '防御力', init: 72, range: '65 ~ 80', min: 65, max: 80 }
    },
    aptitudes: { hp: [4800, 5600], atk: [1500, 1800], def: [1500, 1800], matk: [1950, 2350], spd: [1600, 1950] },
    skills: [], canLearnSkill: true, canTransform: true, catchRate: 0.60,
    avatarName: '【八部天龙】', avatarTalent: 'avatar_bailong', avatarTalentDesc: '法术攻击有概率法术连击'
  },

  baigu_jing: {
    id: 'baigu_jing', name: '白骨精', quality: 'jinxian', qualityName: '金仙',
    element: 'gold', elementName: '金', reqLevel: 30, icon: '💀', gender: 'female',
    desc: '【金仙神兽·白骨夫人】白虎岭骷髅幻化尊主！元神【白骨夫人】，变身天赋：受到伤害按百分比转移！速度型（初值最高达61），气血最高90，攻击60~70出头。',
    growthRange: [0.98, 1.15],
    initialStats: {
      growth: { name: '成长率', init: '1.06', range: '0.98 ~ 1.15', min: 0.98, max: 1.15 },
      hp: { name: '生命值', init: 81, range: '72 ~ 90', min: 72, max: 90 },
      mp: { name: '法力值', init: 88, range: '80 ~ 95', min: 80, max: 95 },
      atk: { name: '攻击力', init: 63, range: '55 ~ 70', min: 55, max: 70 },
      spd: { name: '速度', init: 55, range: '48 ~ 61', min: 48, max: 61 },
      def: { name: '防御力', init: 65, range: '58 ~ 72', min: 58, max: 72 }
    },
    aptitudes: { hp: [4500, 5300], atk: [1450, 1750], def: [1450, 1750], matk: [1900, 2300], spd: [1800, 2200] },
    skills: [], canLearnSkill: true, canTransform: true, catchRate: 0.60,
    avatarName: '【白骨夫人】', avatarTalent: 'avatar_baigu', avatarTalentDesc: '受到伤害按百分比转移'
  },

  zhu_bajie: {
    id: 'zhu_bajie', name: '猪八戒', quality: 'jinxian', qualityName: '金仙',
    element: 'wood', elementName: '木', reqLevel: 25, icon: '🐷', gender: 'male',
    desc: '【金仙神兽·天蓬元帅】天蓬统帅真灵！元神【天蓬元帅】，变身天赋：增加百分比气血！明显气血极高（初值最高119），速度极低（最高26左右），初始攻击力高达115左右！',
    growthRange: [0.97, 1.12],
    initialStats: {
      growth: { name: '成长率', init: '1.04', range: '0.97 ~ 1.12', min: 0.97, max: 1.12 },
      hp: { name: '生命值', init: 108, range: '98 ~ 119', min: 98, max: 119 },
      mp: { name: '法力值', init: 68, range: '60 ~ 75', min: 60, max: 75 },
      atk: { name: '攻击力', init: 106, range: '98 ~ 115', min: 98, max: 115 },
      spd: { name: '速度', init: 21, range: '16 ~ 26', min: 16, max: 26 },
      def: { name: '防御力', init: 86, range: '78 ~ 95', min: 78, max: 95 }
    },
    aptitudes: { hp: [5600, 6500], atk: [1900, 2300], def: [1750, 2100], matk: [1300, 1600], spd: [1000, 1250] },
    skills: [], canLearnSkill: true, canTransform: true, catchRate: 0.60,
    avatarName: '【天蓬元帅】', avatarTalent: 'avatar_bajie', avatarTalentDesc: '增加百分比气血'
  },

  honghai_er: {
    id: 'honghai_er', name: '红孩儿', quality: 'jinxian', qualityName: '金仙',
    element: 'fire', elementName: '火', reqLevel: 32, icon: '🔥', gender: 'male',
    desc: '【金仙神兽·圣婴大王】枯松涧火云洞主！元神【圣婴大王】，变身天赋：提升三昧真火技能伤害！速度型（初值最高达61），气血上限90，攻击60~70出头，法力狂暴。',
    growthRange: [0.98, 1.15],
    initialStats: {
      growth: { name: '成长率', init: '1.06', range: '0.98 ~ 1.15', min: 0.98, max: 1.15 },
      hp: { name: '生命值', init: 81, range: '72 ~ 90', min: 72, max: 90 },
      mp: { name: '法力值', init: 100, range: '92 ~ 110', min: 92, max: 110 },
      atk: { name: '攻击力', init: 60, range: '52 ~ 68', min: 52, max: 68 },
      spd: { name: '速度', init: 55, range: '48 ~ 61', min: 48, max: 61 },
      def: { name: '防御力', init: 62, range: '55 ~ 70', min: 55, max: 70 }
    },
    aptitudes: { hp: [4600, 5400], atk: [1400, 1700], def: [1400, 1680], matk: [2200, 2650], spd: [1800, 2200] },
    skills: [], canLearnSkill: true, canTransform: true, catchRate: 0.60,
    avatarName: '【圣婴大王】', avatarTalent: 'avatar_honghaier', avatarTalentDesc: '提升三昧真火技能伤害'
  },

  tieshan_gongzhu: {
    id: 'tieshan_gongzhu', name: '铁扇公主', quality: 'jinxian', qualityName: '金仙',
    element: 'fire', elementName: '火', reqLevel: 35, icon: '🪭', gender: 'female',
    desc: '【金仙神兽·罗刹女】翠云山芭蕉洞铁扇仙！元神【罗刹女】，变身天赋：提升飞沙走石、真火技能伤害！速度型（初值最高达61），气血上限90，攻击60~70出头。',
    growthRange: [0.98, 1.15],
    initialStats: {
      growth: { name: '成长率', init: '1.06', range: '0.98 ~ 1.15', min: 0.98, max: 1.15 },
      hp: { name: '生命值', init: 81, range: '72 ~ 90', min: 72, max: 90 },
      mp: { name: '法力值', init: 102, range: '94 ~ 112', min: 94, max: 112 },
      atk: { name: '攻击力', init: 58, range: '50 ~ 66', min: 50, max: 66 },
      spd: { name: '速度', init: 55, range: '48 ~ 61', min: 48, max: 61 },
      def: { name: '防御力', init: 66, range: '58 ~ 74', min: 58, max: 74 }
    },
    aptitudes: { hp: [4600, 5400], atk: [1350, 1650], def: [1450, 1750], matk: [2250, 2700], spd: [1800, 2200] },
    skills: [], canLearnSkill: true, canTransform: true, catchRate: 0.60,
    avatarName: '【罗刹女】', avatarTalent: 'avatar_tieshan', avatarTalentDesc: '提升飞沙走石、真火技能伤害'
  },

  niumowang: {
    id: 'niumowang', name: '牛魔王', quality: 'jinxian', qualityName: '金仙',
    element: 'fire', elementName: '火', reqLevel: 45, icon: '🐂', gender: 'male',
    desc: '【金仙神兽·平天大圣】大力牛魔王法相！元神【平天大圣】，变身天赋：增加气血以及攻击力！气血极高（初值最高119），速度极低（最高26左右），初始攻击力高达115左右，全服顶峰成长率 (1.18)！',
    growthRange: [1.00, 1.18],
    initialStats: {
      growth: { name: '成长率', init: '1.09', range: '1.00 ~ 1.18', min: 1.00, max: 1.18 },
      hp: { name: '生命值', init: 110, range: '100 ~ 119', min: 100, max: 119 },
      mp: { name: '法力值', init: 62, range: '55 ~ 70', min: 55, max: 70 },
      atk: { name: '攻击力', init: 108, range: '98 ~ 115', min: 98, max: 115 },
      spd: { name: '速度', init: 21, range: '16 ~ 26', min: 16, max: 26 },
      def: { name: '防御力', init: 90, range: '82 ~ 98', min: 82, max: 98 }
    },
    aptitudes: { hp: [5800, 6800], atk: [2100, 2550], def: [1900, 2300], matk: [1400, 1750], spd: [1050, 1300] },
    skills: [], canLearnSkill: true, canTransform: true, catchRate: 0.60,
    avatarName: '【平天大圣】', avatarTalent: 'avatar_niumo', avatarTalentDesc: '增加气血以及攻击力'
  },

  sha_seng: {
    id: 'sha_seng', name: '沙僧', quality: 'jinxian', qualityName: '金仙',
    element: 'water', elementName: '水', reqLevel: 28, icon: '🧔', gender: 'male',
    desc: '【金仙神兽·卷帘大将】灵霄殿前卷帘神尊！元神【卷帘大将】，变身天赋：受到伤害部分从法力值扣除！气血上限110，法力初值高达115，稳固坚盾。',
    growthRange: [0.97, 1.13],
    initialStats: {
      growth: { name: '成长率', init: '1.05', range: '0.97 ~ 1.13', min: 0.97, max: 1.13 },
      hp: { name: '生命值', init: 101, range: '92 ~ 110', min: 92, max: 110 },
      mp: { name: '法力值', init: 105, range: '95 ~ 115', min: 95, max: 115 },
      atk: { name: '攻击力', init: 88, range: '80 ~ 95', min: 80, max: 95 },
      spd: { name: '速度', init: 22, range: '18 ~ 27', min: 18, max: 27 },
      def: { name: '防御力', init: 88, range: '80 ~ 95', min: 80, max: 95 }
    },
    aptitudes: { hp: [5200, 6100], atk: [1700, 2050], def: [1800, 2150], matk: [1750, 2150], spd: [1050, 1300] },
    skills: [], canLearnSkill: true, canTransform: true, catchRate: 0.60,
    avatarName: '【卷帘大将】', avatarTalent: 'avatar_shaseng', avatarTalentDesc: '受到伤害部分从法力值扣除'
  },

  huangfeng_guai: {
    id: 'huangfeng_guai', name: '黄风怪', quality: 'jinxian', qualityName: '金仙',
    element: 'earth', elementName: '土', reqLevel: 30, icon: '🌪️', gender: 'male',
    desc: '【金仙神兽·黄鼠原身】灵山脚下得道黄毛貂鼠！元神【黄鼠原身】，变身天赋：增加法力以及速度！神风极速（初速最高达60），法力初值高达110。',
    growthRange: [0.98, 1.15],
    initialStats: {
      growth: { name: '成长率', init: '1.06', range: '0.98 ~ 1.15', min: 0.98, max: 1.15 },
      hp: { name: '生命值', init: 83, range: '75 ~ 92', min: 75, max: 92 },
      mp: { name: '法力值', init: 100, range: '92 ~ 110', min: 92, max: 110 },
      atk: { name: '攻击力', init: 64, range: '56 ~ 72', min: 56, max: 72 },
      spd: { name: '速度', init: 53, range: '46 ~ 60', min: 46, max: 60 },
      def: { name: '防御力', init: 68, range: '60 ~ 75', min: 60, max: 75 }
    },
    aptitudes: { hp: [4700, 5500], atk: [1450, 1750], def: [1500, 1800], matk: [2100, 2550], spd: [1800, 2150] },
    skills: [], canLearnSkill: true, canTransform: true, catchRate: 0.60,
    avatarName: '【黄鼠原身】', avatarTalent: 'avatar_huangfeng', avatarTalentDesc: '增加法力以及速度'
  },

  huangpao_guai: {
    id: 'huangpao_guai', name: '黄袍怪', quality: 'jinxian', qualityName: '金仙',
    element: 'wood', elementName: '木', reqLevel: 32, icon: '🐺', gender: 'male',
    desc: '【金仙神兽·奎木狼星君】二十八宿奎木狼星君真灵！元神【奎木狼星君】，变身天赋：伤害会使敌方额外少量流血两回合，可叠加！物攻凶猛（初始攻击最高108）。',
    growthRange: [0.98, 1.15],
    initialStats: {
      growth: { name: '成长率', init: '1.06', range: '0.98 ~ 1.15', min: 0.98, max: 1.15 },
      hp: { name: '生命值', init: 91, range: '82 ~ 100', min: 82, max: 100 },
      mp: { name: '法力值', init: 68, range: '60 ~ 75', min: 60, max: 75 },
      atk: { name: '攻击力', init: 99, range: '90 ~ 108', min: 90, max: 108 },
      spd: { name: '速度', init: 42, range: '36 ~ 48', min: 36, max: 48 },
      def: { name: '防御力', init: 78, range: '70 ~ 85', min: 70, max: 85 }
    },
    aptitudes: { hp: [4900, 5800], atk: [1950, 2350], def: [1550, 1850], matk: [1450, 1750], spd: [1500, 1850] },
    skills: [], canLearnSkill: true, canTransform: true, catchRate: 0.60,
    avatarName: '【奎木狼星君】', avatarTalent: 'avatar_huangpao', avatarTalentDesc: '伤害会使敌方额外少量流血两回合，可叠加'
  },

  heixiong_guai: {
    id: 'heixiong_guai', name: '黑熊精', quality: 'jinxian', qualityName: '金仙',
    element: 'earth', elementName: '土', reqLevel: 30, icon: '🐻', gender: 'male',
    desc: '【金仙神兽·黑熊原身】黑风山洞府熊罴妖圣！元神【黑熊原身】，变身天赋：增加速度以及攻击力！用户指定速度型金仙（初速最高达61），气血最高90，物攻高达105。',
    growthRange: [0.98, 1.15],
    initialStats: {
      growth: { name: '成长率', init: '1.06', range: '0.98 ~ 1.15', min: 0.98, max: 1.15 },
      hp: { name: '生命值', init: 82, range: '75 ~ 90', min: 75, max: 90 },
      mp: { name: '法力值', init: 58, range: '52 ~ 65', min: 52, max: 65 },
      atk: { name: '攻击力', init: 96, range: '88 ~ 105', min: 88, max: 105 },
      spd: { name: '速度', init: 55, range: '48 ~ 61', min: 48, max: 61 },
      def: { name: '防御力', init: 80, range: '72 ~ 88', min: 72, max: 88 }
    },
    aptitudes: { hp: [4700, 5500], atk: [1950, 2350], def: [1650, 1950], matk: [1200, 1500], spd: [1800, 2200] },
    skills: [], canLearnSkill: true, canTransform: true, catchRate: 0.60,
    avatarName: '【黑熊原身】', avatarTalent: 'avatar_heixiong', avatarTalentDesc: '增加速度以及攻击力'
  },

  nezha: {
    id: 'nezha', name: '哪吒', quality: 'jinxian', qualityName: '金仙',
    element: 'gold', elementName: '金', reqLevel: 38, icon: '🪷', gender: 'male',
    desc: '【金仙神兽·三头六臂】莲花化身中坛元帅！元神【三头六臂】，变身天赋：攻击概率眩晕目标1回合！敏捷斗战金仙（初速最高58，攻击最高106）。',
    growthRange: [0.99, 1.16],
    initialStats: {
      growth: { name: '成长率', init: '1.07', range: '0.99 ~ 1.16', min: 0.99, max: 1.16 },
      hp: { name: '生命值', init: 86, range: '78 ~ 95', min: 78, max: 95 },
      mp: { name: '法力值', init: 79, range: '72 ~ 86', min: 72, max: 86 },
      atk: { name: '攻击力', init: 98, range: '90 ~ 106', min: 90, max: 106 },
      spd: { name: '速度', init: 52, range: '45 ~ 58', min: 45, max: 58 },
      def: { name: '防御力', init: 76, range: '68 ~ 84', min: 68, max: 84 }
    },
    aptitudes: { hp: [4900, 5700], atk: [2050, 2450], def: [1600, 1900], matk: [1600, 1900], spd: [1800, 2150] },
    skills: [], canLearnSkill: true, canTransform: true, catchRate: 0.60,
    avatarName: '【三头六臂】', avatarTalent: 'avatar_nezha', avatarTalentDesc: '攻击概率眩晕目标1回合'
  },

  huangmei_dawang: {
    id: 'huangmei_dawang', name: '黄眉大王', quality: 'jinxian', qualityName: '金仙',
    element: 'gold', elementName: '金', reqLevel: 40, icon: '🔔', gender: 'male',
    desc: '【金仙神兽·黄眉老祖】小雷音寺假佛弥勒童子！元神【黄眉老祖】，变身天赋：对目标造成伤害后会使下回合该目标造成的伤害降低；如果速度比该目标快，则该回合伤害即变低！血高气沉（气血初值最高119，速度大多26左右）。',
    growthRange: [0.99, 1.16],
    initialStats: {
      growth: { name: '成长率', init: '1.07', range: '0.99 ~ 1.16', min: 0.99, max: 1.16 },
      hp: { name: '生命值', init: 108, range: '96 ~ 119', min: 96, max: 119 },
      mp: { name: '法力值', init: 82, range: '75 ~ 90', min: 75, max: 90 },
      atk: { name: '攻击力', init: 91, range: '82 ~ 100', min: 82, max: 100 },
      spd: { name: '速度', init: 21, range: '16 ~ 26', min: 16, max: 26 },
      def: { name: '防御力', init: 88, range: '80 ~ 96', min: 80, max: 96 }
    },
    aptitudes: { hp: [5600, 6500], atk: [1850, 2250], def: [1800, 2150], matk: [1700, 2050], spd: [1000, 1250] },
    skills: [], canLearnSkill: true, canTransform: true, catchRate: 0.60,
    avatarName: '【黄眉老祖】', avatarTalent: 'avatar_huangmei', avatarTalentDesc: '对目标造成伤害后会使下回合该目标造成的伤害略微降低；如果速度比该目标快，则该回合目标伤害变低'
  },

  lijing: {
    id: 'lijing', name: '李靖（托塔天王）', quality: 'jinxian', qualityName: '金仙',
    element: 'gold', elementName: '金', reqLevel: 42, icon: '🏯', gender: 'male',
    desc: '【金仙神兽·托塔天王】降魔大元帅！元神【托塔天王】，变身天赋：提升神仙职业技能命中概率！天庭法统帅才，均衡卓越。',
    growthRange: [1.00, 1.17],
    initialStats: {
      growth: { name: '成长率', init: '1.08', range: '1.00 ~ 1.17', min: 1.00, max: 1.17 },
      hp: { name: '生命值', init: 96, range: '88 ~ 105', min: 88, max: 105 },
      mp: { name: '法力值', init: 90, range: '82 ~ 98', min: 82, max: 98 },
      atk: { name: '攻击力', init: 82, range: '75 ~ 90', min: 75, max: 90 },
      spd: { name: '速度', init: 33, range: '28 ~ 38', min: 28, max: 38 },
      def: { name: '防御力', init: 82, range: '75 ~ 90', min: 75, max: 90 }
    },
    aptitudes: { hp: [5100, 5900], atk: [1700, 2050], def: [1700, 2050], matk: [1850, 2250], spd: [1350, 1600] },
    skills: [], canLearnSkill: true, canTransform: true, catchRate: 0.60,
    avatarName: '【托塔天王】', avatarTalent: 'avatar_lijing', avatarTalentDesc: '提升神仙职业技能命中概率'
  },

  xiezi_jing: {
    id: 'xiezi_jing', name: '蝎子精', quality: 'jinxian', qualityName: '金仙',
    element: 'earth', elementName: '土', reqLevel: 42, icon: '🦂', gender: 'female',
    desc: '【金仙神兽·琵琶妖仙】毒敌山琵琶洞倒马毒蝎！元神【琵琶妖仙】，变身天赋：提升万毒攻心伤害！法术倒马毒桩凶残至极。',
    growthRange: [1.00, 1.17],
    initialStats: {
      growth: { name: '成长率', init: '1.08', range: '1.00 ~ 1.17', min: 1.00, max: 1.17 },
      hp: { name: '生命值', init: 82, range: '74 ~ 90', min: 74, max: 90 },
      mp: { name: '法力值', init: 104, range: '95 ~ 112', min: 95, max: 112 },
      atk: { name: '攻击力', init: 68, range: '62 ~ 76', min: 62, max: 76 },
      spd: { name: '速度', init: 50, range: '44 ~ 57', min: 44, max: 57 },
      def: { name: '防御力', init: 70, range: '62 ~ 78', min: 62, max: 78 }
    },
    aptitudes: { hp: [4800, 5600], atk: [1550, 1850], def: [1550, 1850], matk: [2300, 2750], spd: [1700, 2050] },
    skills: [], canLearnSkill: true, canTransform: true, catchRate: 0.60,
    avatarName: '【琵琶妖仙】', avatarTalent: 'avatar_xiezi', avatarTalentDesc: '提升万毒攻心伤害'
  },

  jiutou_chong: {
    id: 'jiutou_chong', name: '九头虫', quality: 'jinxian', qualityName: '金仙',
    element: 'water', elementName: '水', reqLevel: 45, icon: '🐉', gender: 'male',
    desc: '【金仙神兽·九头蛇原身】乱石山碧波潭九头妖圣！元神【九头蛇原身】，变身天赋：变身期间内死亡后直接复活并回复少量气血！全服顶峰成长率 (1.18)！',
    growthRange: [1.00, 1.18],
    initialStats: {
      growth: { name: '成长率', init: '1.09', range: '1.00 ~ 1.18', min: 1.00, max: 1.18 },
      hp: { name: '生命值', init: 93, range: '85 ~ 102', min: 85, max: 102 },
      mp: { name: '法力值', init: 77, range: '70 ~ 85', min: 70, max: 85 },
      atk: { name: '攻击力', init: 100, range: '92 ~ 108', min: 92, max: 108 },
      spd: { name: '速度', init: 40, range: '34 ~ 45', min: 34, max: 45 },
      def: { name: '防御力', init: 82, range: '74 ~ 90', min: 74, max: 90 }
    },
    aptitudes: { hp: [5400, 6200], atk: [2100, 2550], def: [1800, 2150], matk: [1700, 2050], spd: [1550, 1850] },
    skills: [], canLearnSkill: true, canTransform: true, catchRate: 0.60,
    avatarName: '【九头蛇原身】', avatarTalent: 'avatar_jiutouchong', avatarTalentDesc: '变身期间内死亡后直接复活并回复少量气血'
  }
};

// =========================================================================
// 旧版 ID 非枚举向后兼容别名 (防历史存档/遗留调用报错，不污染 Object.values 统计)
// =========================================================================
const legacyAliases = {
  dahai_gui: 'clam_jing',
  ju_wa: 'shuo_shu',
  ye_zhu: 'shuo_shu',
  baihua_she: 'sha_wujing',
  heixiong_jing: 'heixiong_guai_mob',
  chihuo_niao: 'zengzhang_tianwang',
  songlin_linglu: 'chiguo_tianwang',
  taohua_xian: 'change',
  xixue_gui: 'sha_seng',
  ruyi_xianzi: 'tieshan_gongzhu',
  jiuweilinghu: 'baigu_jing',
  gudai_ruishou: 'zhu_bajie',
  zhenyuanzi: 'niumowang',
  qitian_dasheng: 'nezha'
};

for (const [legacyId, targetId] of Object.entries(legacyAliases)) {
  if (!window.GAME_DATA.PETS[legacyId] && window.GAME_DATA.PETS[targetId]) {
    Object.defineProperty(window.GAME_DATA.PETS, legacyId, {
      value: window.GAME_DATA.PETS[targetId],
      enumerable: false, // 保证 Object.values(PETS) 严密仅统计 77 种
      writable: true,
      configurable: true
    });
  }
}

// 九大正统技能与对应门派职业
window.GAME_DATA.NINE_CLASS_SKILLS = [
  // 金刚系
  { id: 'sk_jg_shesheng', name: '舍生取义', classId: 'jingang', className: '金刚', icon: '⚔️', desc: '单体伤害巨大，自身消耗15%气血，无视目标部分防御' },
  { id: 'sk_jg_foguang', name: '佛光普照', classId: 'jingang', className: '金刚', icon: '✨', desc: '纯阳佛光单体重创，百分比扣除目标气血并焚毁精力' },
  { id: 'sk_jg_huti', name: '金刚护体', classId: 'jingang', className: '金刚', icon: '🛡️', desc: '佛光护体，大幅提升己方防御与各项技能抗性' },

  // 妖魔系
  { id: 'sk_ym_leiting', name: '雷霆万钧', classId: 'yaomo', className: '妖魔', icon: '⚡', desc: '单体九天神雷狂轰，单体伤害极高但精力消耗较大' },
  { id: 'sk_ym_feisha', name: '飞沙走石', classId: 'yaomo', className: '妖魔', icon: '🌪️', desc: '三昧神风漫天飞沙，对敌方全体造成多重狂暴物理+法术轰击' },
  { id: 'sk_ym_sanmei', name: '三昧真火', classId: 'yaomo', className: '妖魔', icon: '🔥', desc: '引动万年真火群攻爆裂，焚尽万物并附加灼烧伤害' },

  // 神仙系
  { id: 'sk_xr_fengyin', name: '封印咒', classId: 'xianren', className: '神仙', icon: '📿', desc: '玄门金光大封印！强行封锁单体3回合，使其完全无法行动' },
  { id: 'sk_xr_dingshen', name: '定身咒', classId: 'xianren', className: '神仙', icon: '🧿', desc: '金光绳索禁锢，使目标无法进行攻击与施法，但允许使用药品' },
  { id: 'sk_xr_yinshen', name: '隐身咒', classId: 'xianren', className: '神仙', icon: '🌫️', desc: '遁入虚空隐匿属性不可查，获得极高闪避与暴击加成' }
];

/**
 * 获取生灵标准化【初始属性与上下边界对照表】(专供山海经国风玉简展示)
 * 严格支持：两列表格 (初始属性、上下边界)，包含成长率、生命值、法力值、攻击力、出手速度
 * 初值彻底拒绝两三百虚高乱设，严格遵照西游经典标尺。
 */
window.GAME_DATA.getPetInitialBounds = function(petOrId) {
  const p = (typeof petOrId === 'string') ? window.GAME_DATA.PETS[petOrId] : petOrId;
  if (!p) return null;

  if (p.initialStats) {
    return [
      { key: 'growth', name: '📈 成长率', init: p.initialStats.growth.init, range: p.initialStats.growth.range },
      { key: 'hp', name: '🩸 生命值', init: p.initialStats.hp.init, range: p.initialStats.hp.range },
      { key: 'mp', name: '✨ 法力值', init: p.initialStats.mp.init, range: p.initialStats.mp.range },
      { key: 'atk', name: '⚔️ 攻击力', init: p.initialStats.atk.init, range: p.initialStats.atk.range },
      { key: 'spd', name: '🌪️ 出手速度', init: p.initialStats.spd.init, range: p.initialStats.spd.range }
    ];
  }

  // 兜底派生标准化两列初始属性与边界 (合理初值 50 ~ 110 区间)
  const gMin = p.growthRange ? p.growthRange[0] : 0.70;
  const gMax = p.growthRange ? p.growthRange[1] : 0.85;
  const initGrowth = Number(((gMin + gMax) * 0.5).toFixed(2));
  const isOrdinary = (p.quality === 'ordinary');
  const isSanxian = (p.quality === 'sanxian');
  const qMult = isOrdinary ? 1.0 : (isSanxian ? 1.2 : 1.35);

  const initHp = Math.round((55 + (p.reqLevel || 0) * 0.6) * qMult);
  const hpMin = Math.round(initHp * 0.90);
  const hpMax = Math.round(initHp * 1.15);

  const initMp = Math.round((45 + (p.reqLevel || 0) * 0.5) * qMult);
  const mpMin = Math.round(initMp * 0.90);
  const mpMax = Math.round(initMp * 1.18);

  const initAtk = Math.round((28 + (p.reqLevel || 0) * 0.7) * qMult);
  const atkMin = Math.max(15, Math.round(initAtk * 0.85));
  const atkMax = Math.round(initAtk * 1.25);

  const initSpd = Math.round((8 + (p.reqLevel || 0) * 0.4) * qMult);
  const spdMin = Math.max(3, Math.round(initSpd * 0.7));
  const spdMax = Math.round(initSpd * 1.4);

  return [
    { key: 'growth', name: '📈 成长率', init: initGrowth.toFixed(2), range: `${gMin.toFixed(2)} ~ ${gMax.toFixed(2)}` },
    { key: 'hp', name: '🩸 生命值', init: initHp, range: `${hpMin} ~ ${hpMax}` },
    { key: 'mp', name: '✨ 法力值', init: initMp, range: `${mpMin} ~ ${mpMax}` },
    { key: 'atk', name: '⚔️ 攻击力', init: initAtk, range: `${atkMin} ~ ${atkMax}` },
    { key: 'spd', name: '🌪️ 出手速度', init: initSpd, range: `${spdMin} ~ ${spdMax}` }
  ];
};
