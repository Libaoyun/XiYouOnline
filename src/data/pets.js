/**
 * 汉风西游 - 召唤兽（宠物）数据库
 */

export const PETS = {
  // 0级携带 - 东海湾 & 新手村
  dahai_gui: {
    id: 'dahai_gui',
    name: '大海龟',
    reqLevel: 0,
    icon: '🐢',
    desc: '东海湾随处可见的小海龟，虽然动作慢吞吞，但壳极其坚硬，忠诚度极高。',
    growthRange: [1.02, 1.08],
    aptitudes: {
      hp: [3800, 4600],
      atk: [800, 1050],
      def: [1200, 1550],
      matk: [1100, 1400],
      spd: [600, 850]
    },
    skills: ['防御', '反震', '水属性弱点'],
    catchRate: 0.85
  },

  ju_wa: {
    id: 'ju_wa',
    name: '巨蛙',
    reqLevel: 0,
    icon: '🐸',
    desc: '喜欢在湿润水泽出没的大青蛙，呱呱叫声中暗含水流冲击力。',
    growthRange: [1.03, 1.09],
    aptitudes: {
      hp: [3200, 4000],
      atk: [950, 1200],
      def: [900, 1200],
      matk: [1200, 1500],
      spd: [900, 1200]
    },
    skills: ['水攻', '泥足'],
    catchRate: 0.8
  },

  ye_zhu: {
    id: 'ye_zhu',
    name: '野猪',
    reqLevel: 0,
    icon: '🐗',
    desc: '江南野地里横冲直撞的野猪，獠牙锋利，力道惊人。',
    growthRange: [1.04, 1.10],
    aptitudes: {
      hp: [3500, 4200],
      atk: [1200, 1450],
      def: [1000, 1300],
      matk: [700, 950],
      spd: [850, 1100]
    },
    skills: ['强力', '偷袭'],
    catchRate: 0.75
  },

  // 15级携带 - 双叉岭野外
  baihua_she: {
    id: 'baihua_she',
    name: '白花蛇',
    reqLevel: 15,
    icon: '🐍',
    desc: '通体如白玉的灵蛇，剧毒无比，动作敏捷如闪电。',
    growthRange: [1.08, 1.14],
    aptitudes: {
      hp: [3400, 4100],
      atk: [1250, 1500],
      def: [1100, 1350],
      matk: [1200, 1550],
      spd: [1200, 1500]
    },
    skills: ['毒', '高级敏捷', '感知'],
    catchRate: 0.65
  },

  heixiong_jing: {
    id: 'heixiong_jing',
    name: '黑熊精',
    reqLevel: 15,
    icon: '🐻',
    desc: '皮糙肉厚的黑熊成精，力大无穷，能硬撼千斤巨石。',
    growthRange: [1.09, 1.15],
    aptitudes: {
      hp: [4200, 5100],
      atk: [1400, 1680],
      def: [1300, 1600],
      matk: [800, 1100],
      spd: [750, 1000]
    },
    skills: ['迟钝', '强力', '反击', '必杀'],
    catchRate: 0.6
  },

  // 45级携带 - 五行山与大雁塔
  ruishou: {
    id: 'ruishou',
    name: '古代瑞兽',
    reqLevel: 45,
    icon: '🦁',
    desc: '【法宠天花板】头生双角的祥瑞神兽，天生自带泰山压顶与高级神佑复生！',
    growthRange: [1.14, 1.20],
    aptitudes: {
      hp: [4000, 4800],
      atk: [1000, 1250],
      def: [1250, 1500],
      matk: [1700, 2100],
      spd: [1100, 1350]
    },
    skills: ['泰山压顶', '高级神佑复生', '冥思', '驱鬼'],
    catchRate: 0.4
  },

  xixue_gui: {
    id: 'xixue_gui',
    name: '吸血鬼',
    reqLevel: 55,
    icon: '🦇',
    desc: '【攻宠王者】幽冥界修罗鬼卒，天生拥有极高几率的五技能胚子！',
    growthRange: [1.16, 1.23],
    aptitudes: {
      hp: [3900, 4600],
      atk: [1550, 1850],
      def: [1200, 1480],
      matk: [1100, 1400],
      spd: [1250, 1550]
    },
    skills: ['吸血', '鬼魂术', '高级土属性吸收', '弱点火', '偷袭'],
    catchRate: 0.35
  },

  // 终极神兽
  super_wukong: {
    id: 'super_wukong',
    name: '齐天大圣 (神级伙伴)',
    reqLevel: 0,
    icon: '🐒',
    desc: '【三界无双】天生石猴，身如玄铁，火眼金睛，一棒震碎九霄！',
    growthRange: [1.30, 1.30],
    aptitudes: {
      hp: [6000, 6000],
      atk: [2400, 2400],
      def: [2000, 2000],
      matk: [2000, 2000],
      spd: [1800, 1800]
    },
    skills: ['如意金箍棒', '七十二变', '筋斗云', '高级神佑复生', '高级必杀'],
    catchRate: 0
  }
};
