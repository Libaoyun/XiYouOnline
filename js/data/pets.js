/**
 * 汉风西游 - 仙宠（召唤兽）数据库 (Pets 2.0)
 * 严格按照用户需求划分三大品质：
 * 1. 普通：无技能只能普攻，初始属性与成长率较低 (1.00 ~ 1.06)
 * 2. 散仙：成长率与属性中高 (1.12 ~ 1.18)，10级可一键领悟9大神技之一，自动转职金刚/妖魔/神仙
 * 3. 金仙：最高资质与成长率 (1.25 ~ 1.35)，可一键领悟9大神技之一，自动转职
 */
window.GAME_DATA = window.GAME_DATA || {};

window.GAME_DATA.PETS = {
  // =========================================================================
  // 1. 【普通】仙宠系列 (无技能，仅物理普通攻击，成长资质较低)
  // =========================================================================
  dahai_gui: {
    id: 'dahai_gui',
    name: '大海龟',
    quality: 'ordinary',
    qualityName: '普通',
    reqLevel: 0,
    icon: '🐢',
    desc: '【普通仙宠】东海滩边随处可见的慢吞吞小海龟，壳体坚韧，只能进行普通攻击。',
    growthRange: [1.01, 1.05],
    aptitudes: {
      hp: [2600, 3200],
      atk: [700, 900],
      def: [1100, 1350],
      matk: [600, 800],
      spd: [500, 700]
    },
    skills: [], // 普通仙宠无技能
    catchRate: 0.80
  },

  ju_wa: {
    id: 'ju_wa',
    name: '巨蛙',
    quality: 'ordinary',
    qualityName: '普通',
    reqLevel: 0,
    icon: '🐸',
    desc: '【普通仙宠】水洼湿地常见的硕大青蛙，呱呱乱叫，仅能进行普通舌击。',
    growthRange: [1.02, 1.06],
    aptitudes: {
      hp: [2400, 3000],
      atk: [800, 1000],
      def: [750, 950],
      matk: [700, 900],
      spd: [700, 950]
    },
    skills: [],
    catchRate: 0.80
  },

  ye_zhu: {
    id: 'ye_zhu',
    name: '野猪',
    quality: 'ordinary',
    qualityName: '普通',
    reqLevel: 0,
    icon: '🐗',
    desc: '【普通仙宠】双叉岭山林里横冲直撞的野猪，獠牙锋利，力道粗莽。',
    growthRange: [1.02, 1.06],
    aptitudes: {
      hp: [2700, 3300],
      atk: [950, 1150],
      def: [800, 1000],
      matk: [500, 700],
      spd: [650, 850]
    },
    skills: [],
    catchRate: 0.80
  },

  xiaohua_she: {
    id: 'xiaohua_she',
    name: '小花蛇',
    quality: 'ordinary',
    qualityName: '普通',
    reqLevel: 5,
    icon: '🐍',
    desc: '【普通仙宠】草莽杂草丛中的青鳞小蛇，行动敏捷，普通咬击。',
    growthRange: [1.03, 1.07],
    aptitudes: {
      hp: [2300, 2900],
      atk: [900, 1100],
      def: [700, 900],
      matk: [650, 850],
      spd: [900, 1150]
    },
    skills: [],
    catchRate: 0.80
  },

  // =========================================================================
  // 2. 【散仙】仙宠系列 (成长较高，10级可一键领悟9大神技之一并转职，招降需银葫芦)
  // =========================================================================
  baihua_she: {
    id: 'baihua_she',
    name: '白花灵蛇',
    quality: 'sanxian',
    qualityName: '散仙',
    reqLevel: 10,
    icon: '🐍',
    desc: '【散仙仙宠】得日月之光华修炼百年的白花仙蛇，10级可一键领悟门派通天绝技！',
    growthRange: [1.12, 1.18],
    aptitudes: {
      hp: [3500, 4200],
      atk: [1350, 1600],
      def: [1050, 1300],
      matk: [1300, 1550],
      spd: [1400, 1700]
    },
    skills: [], // 达到10级后一键学习
    catchRate: 0.70
  },

  heixiong_jing: {
    id: 'heixiong_jing',
    name: '黑风怪熊',
    quality: 'sanxian',
    qualityName: '散仙',
    reqLevel: 15,
    icon: '🐻',
    desc: '【散仙仙宠】黑风山洞府巡山力士，体魄健硕，力抗山岳，10级可领悟绝技。',
    growthRange: [1.13, 1.19],
    aptitudes: {
      hp: [4600, 5400],
      atk: [1500, 1800],
      def: [1350, 1650],
      matk: [900, 1200],
      spd: [850, 1100]
    },
    skills: [],
    catchRate: 0.70
  },

  xia_bing: {
    id: 'xia_bing',
    name: '巡海神将·虾兵',
    quality: 'sanxian',
    qualityName: '散仙',
    reqLevel: 20,
    icon: '🦐',
    desc: '【散仙仙宠】东海龙宫亲军骁卫，手持玄铁尖戟，水陆两栖，10级可领悟绝技。',
    growthRange: [1.14, 1.20],
    aptitudes: {
      hp: [4000, 4800],
      atk: [1450, 1750],
      def: [1300, 1600],
      matk: [1250, 1550],
      spd: [1200, 1450]
    },
    skills: [],
    catchRate: 0.70
  },

  chihuo_niao: {
    id: 'chihuo_niao',
    name: '赤火灵雀',
    quality: 'sanxian',
    qualityName: '散仙',
    reqLevel: 12,
    icon: '🪶',
    desc: '【散仙仙宠】火山灵穴所出赤羽玄雀，双翼生风，速度超凡，10级可领悟绝技。',
    growthRange: [1.14, 1.20],
    aptitudes: {
      hp: [3300, 4000],
      atk: [1400, 1680],
      def: [950, 1200],
      matk: [1500, 1850],
      spd: [1550, 1900]
    },
    skills: [],
    catchRate: 0.70
  },

  // =========================================================================
  // 3. 【金仙】仙宠系列 (最高成长与极品初始，一键领悟9大神技之一，招降需金葫芦)
  // =========================================================================
  gudai_ruishou: {
    id: 'gudai_ruishou',
    name: '古代瑞兽',
    quality: 'jinxian',
    qualityName: '金仙',
    reqLevel: 25,
    icon: '🦁',
    desc: '【金仙圣兽】洪荒开天辟地祥瑞化身，独角流转乾坤太极金芒，一键领悟通天神技！',
    growthRange: [1.25, 1.32],
    aptitudes: {
      hp: [4800, 5800],
      atk: [1500, 1850],
      def: [1500, 1850],
      matk: [1900, 2400],
      spd: [1350, 1650]
    },
    skills: [],
    catchRate: 0.60
  },

  xixue_gui: {
    id: 'xixue_gui',
    name: '九幽夜叉王',
    quality: 'jinxian',
    qualityName: '金仙',
    reqLevel: 30,
    icon: '🧛',
    desc: '【金仙圣兽】幽冥黄泉深处的罗刹首领，双爪撕裂虚空，攻速登峰造极！',
    growthRange: [1.26, 1.34],
    aptitudes: {
      hp: [4500, 5500],
      atk: [1950, 2400],
      def: [1400, 1750],
      matk: [1450, 1800],
      spd: [1600, 2000]
    },
    skills: [],
    catchRate: 0.60
  },

  ruyi_xianzi: {
    id: 'ruyi_xianzi',
    name: '玉净如意仙子',
    quality: 'jinxian',
    qualityName: '金仙',
    reqLevel: 35,
    icon: '🧚‍♀️',
    desc: '【金仙圣兽】九天琼霄仙宫落凡的如意仙姝，法力滔天，心念一动天翻地覆！',
    growthRange: [1.28, 1.35],
    aptitudes: {
      hp: [4600, 5600],
      atk: [1400, 1700],
      def: [1500, 1850],
      matk: [2100, 2600],
      spd: [1500, 1850]
    },
    skills: [],
    catchRate: 0.60
  },

  jiuweilinghu: {
    id: 'jiuweilinghu',
    name: '青丘九尾灵狐',
    quality: 'jinxian',
    qualityName: '金仙',
    reqLevel: 40,
    icon: '🦊',
    desc: '【金仙圣兽】青丘仙山至高九尾妖尊，千载化形，颠倒众生，全属性卓越完满！',
    growthRange: [1.30, 1.36],
    aptitudes: {
      hp: [5000, 6000],
      atk: [2000, 2500],
      def: [1600, 2000],
      matk: [2000, 2500],
      spd: [1800, 2200]
    },
    skills: [],
    catchRate: 0.60
  },

  qitian_dasheng: {
    id: 'qitian_dasheng',
    name: '齐天灵猴',
    quality: 'jinxian',
    qualityName: '金仙',
    reqLevel: 0,
    icon: '🐒',
    desc: '【金仙圣兽】齐天大圣一缕真灵法身，金猴奋起千钧棒，玉宇澄清万里埃！',
    growthRange: [1.35, 1.38],
    aptitudes: {
      hp: [5600, 6200],
      atk: [2400, 2600],
      def: [1900, 2100],
      matk: [1900, 2100],
      spd: [1800, 2000]
    },
    skills: [],
    catchRate: 0.50
  }
};

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
