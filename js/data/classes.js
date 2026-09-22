/**
 * 汉风西游 - 正统三大职业门派与全量技能配置 (Classes 3.0)
 * 
 * 核心规范（遵循 rules/skills.md 策划白皮书）：
 * 1. 三大职业：妖魔 (法系爆发高蓝耗)、金刚 (肉盾/物理输出/自损/打蓝)、仙人 (控制/辅助)
 * 2. 技能结构：每个职业拥有 3 个技能 = 1 个性别专属技能 + 2 个全职业通用技能
 * 3. 初始等级均为 1 级 (Lv.1)，初始熟练度均为 0，满级 5 级，满熟练度 25000。
 * 4. 人物角色绝对没有任何治疗技能！
 */

window.GAME_DATA = window.GAME_DATA || {};

window.GAME_DATA.CLASSES = {
  // =========================================================================
  // 1. 金刚门派 (佛门正宗 · 坚如磐石 · 绝境反击)
  // =========================================================================
  jingang: {
    id: 'jingang',
    name: '金刚',
    title: '【佛门大力金刚】',
    desc: '佛门正宗，金刚怒目。擅长近战肉搏与坚不可摧的体魄，具有损己轰敌的极限爆发、强力守护与焚蓝压制能力。',
    attrWeights: { hp: 16, atk: 2.3, def: 2.2, spd: 1.0, mp: 6, matk: 0.8 },
    // 职业天生自带初始抗性：天生对本职业有亲和与抗性 (装备无法提供抗玄击，仅金刚天生拥有)
    innateResistances: {
      res_physical: 0.20, // 20% 物理抗性
      res_shesheng: 0.10, // 10% 舍生抗性
      res_xuanji: 0.05    // 5% 玄击抗性 (全游戏唯一抗玄击来源)
    },
    
    // 门派专属与通用技能集合 (按性别分发)
    skills: [
      // 男金刚专属技能
      {
        id: 'sk_jg_foguang',
        name: '佛光普照',
        genderReq: 'male', // 男专属
        type: 'active',
        targetType: 'single_enemy',
        level: 1,
        mastery: 0,
        maxLevel: 5,
        icon: '✨',
        desc: '男金刚专属单体玄击！造成【伤害基数 + 敌方当前生命百分比】伤害，并扣除【敌方当前法力百分比】！受抗玄击减免，装备无法提供抗玄击。',
        getFormula: (user, target, level = 1, mastery = 0) => {
          return window.SkillMasteryEngine.calculateMpDrainAttack(false, user, target, level, mastery);
        }
      },
      // 女金刚专属技能
      {
        id: 'sk_jg_ruxiang',
        name: '如来神掌',
        genderReq: 'female', // 女专属
        type: 'active',
        targetType: 'multi_enemy',
        level: 1,
        mastery: 0,
        maxLevel: 5,
        icon: '✋',
        desc: '女金刚专属群体玄击！造成【伤害基数 + 敌方当前生命百分比】伤害并扣除当前法力百分比。单体威力低于佛光，升级覆盖多达4人！受抗玄击减免。',
        getFormula: (user, target, level = 1, mastery = 0) => {
          return window.SkillMasteryEngine.calculateMpDrainAttack(true, user, target, level, mastery);
        }
      },
      // 金刚通用 1：舍生取义 (核心神技，自损换爆发)
      {
        id: 'sk_jg_shesheng',
        name: '舍生取义',
        genderReq: 'all', // 通用
        type: 'active',
        targetType: 'single_enemy',
        level: 1,
        mastery: 0,
        maxLevel: 5,
        icon: '⚔️',
        desc: '金刚核心神技！以自身气血反噬换取绝杀真伤(气血低于10%无法施展，不足扣血留1血)。1级0熟练度伤害500，满级满熟练度约16000伤害(自伤8000)！',
        getFormula: (user, target, level = 1, mastery = 0) => {
          return window.SkillMasteryEngine.calculateShesheng(user, target, level, mastery);
        }
      },
      // 金刚通用 2：金刚护体 (团队双抗加持)
      {
        id: 'sk_jg_huti',
        name: '金刚护体',
        genderReq: 'all', // 通用
        type: 'buff',
        targetType: 'ally_multi',
        level: 1,
        mastery: 0,
        maxLevel: 5,
        icon: '🛡️',
        desc: '召唤罗汉金身护持队友，同时大幅提升物理防御与法术抗性！随等级提升作用人数增加至全队！',
        getFormula: (user, target, level = 1, mastery = 0) => {
          return window.SkillMasteryEngine.calculateHutiBuff(level, mastery);
        }
      }
    ]
  },

  // =========================================================================
  // 2. 妖魔门派 (深渊魔道 · 狂暴群伤 · 蚀骨焚天)
  // =========================================================================
  yaomo: {
    id: 'yaomo',
    name: '妖魔',
    title: '【九幽修罗妖尊】',
    desc: '深渊魔道，狂傲桀骜。精通引动天雷、飞沙走石与三昧真火，群体轰杀冠绝三界，技能高蓝耗高威力，群法必定命中！',
    attrWeights: { hp: 12, atk: 1.8, def: 1.3, spd: 1.4, mp: 12, matk: 2.3 },
    // 妖魔天生自带初始抗性：10%物理抗性 + 本门派四大法术技能各10%抗性
    innateResistances: {
      res_physical: 0.10, // 10% 物理抗性
      res_leiting: 0.10,  // 10% 雷霆抗性
      res_feisha: 0.10,   // 10% 飞沙走石抗性
      res_sanmei: 0.10,   // 10% 三昧真火抗性
      res_wandu: 0.10     // 10% 万毒攻心抗性
    },
    
    skills: [
      // 男妖魔专属：雷霆万钧
      {
        id: 'sk_ym_leiting',
        name: '雷霆万钧',
        genderReq: 'male', // 男专属
        type: 'active',
        targetType: 'single_enemy',
        level: 1,
        mastery: 0,
        maxLevel: 5,
        icon: '⚡',
        desc: '男妖魔专属！引动九霄魔雷单体轰杀！高法力消耗(Lv.1需300MP)，0熟练度伤害420，满级满熟练度高达12608魔雷真伤！',
        getFormula: (user, target, level = 1, mastery = 0) => {
          return window.SkillMasteryEngine.calculateLeiting(user, target, level, mastery);
        }
      },
      // 女妖魔专属：万毒攻心
      {
        id: 'sk_ym_wandu',
        name: '万毒攻心',
        genderReq: 'female', // 女专属
        type: 'active',
        targetType: 'multi_enemy',
        level: 1,
        mastery: 0,
        maxLevel: 5,
        icon: '🧪',
        desc: '女妖魔专属！给敌方施加蚀骨剧毒，持续多回合掉血，后续每回合毒伤按上回合75%衰减，可叠层破肉！',
        getFormula: (user, target, level = 1, mastery = 0) => {
          return window.SkillMasteryEngine.calculateWandu(user, target, level, mastery);
        }
      },
      // 妖魔通用 1：三昧真火 (必中群火)
      {
        id: 'sk_ym_sanmei',
        name: '三昧真火',
        genderReq: 'all', // 通用
        type: 'active',
        targetType: 'multi_enemy',
        level: 1,
        mastery: 0,
        maxLevel: 5,
        icon: '🔥',
        desc: '妖魔通用群火！群体火系法术，绝对必中！攻击目标随技能等级增加 (1->2->3->4)，不可闪避！',
        getFormula: (user, targetCount = 1, level = 1, mastery = 0) => {
          return window.SkillMasteryEngine.calculateGroupSpell('三昧真火', user, targetCount, level, mastery);
        }
      },
      // 妖魔通用 2：飞沙走石 (必中群风)
      {
        id: 'sk_ym_feisha',
        name: '飞沙走石',
        genderReq: 'all', // 通用
        type: 'active',
        targetType: 'multi_enemy',
        level: 1,
        mastery: 0,
        maxLevel: 5,
        icon: '🌪️',
        desc: '妖魔通用群风！掀起狂暴飞沙风刃，群体必中！攻击目标随技能等级增加 (1->2->3->4)！',
        getFormula: (user, targetCount = 1, level = 1, mastery = 0) => {
          return window.SkillMasteryEngine.calculateGroupSpell('飞沙走石', user, targetCount, level, mastery);
        }
      }
    ]
  },

  // =========================================================================
  // 3. 仙人门派 (阐教玄门 · 控场封印 · 玄通莫测)
  // =========================================================================
  xianren: {
    id: 'xianren',
    name: '仙人',
    title: '【九天太虚神仙】',
    desc: '阐教玄门，深谙天地法则。精通乱魂神术、大封印咒、定身咒与隐身迷雾，绝对控制逆转战局！',
    attrWeights: { hp: 11, atk: 1.4, def: 1.5, spd: 1.7, mp: 15, matk: 1.9 },
    // 仙人天生自带初始抗性：10%物理抗性 + 本门派三大控制技能各10%抗性
    innateResistances: {
      res_physical: 0.10, // 10% 物理抗性
      res_fengyin: 0.10,  // 10% 封印抗性
      res_luanhun: 0.10,  // 10% 乱魂抗性
      res_dingshen: 0.10  // 10% 定身抗性
    },
    
    skills: [
      // 男仙人专属：乱魂咒
      {
        id: 'sk_xr_luanhun',
        name: '乱魂咒',
        genderReq: 'male', // 男专属
        type: 'control',
        targetType: 'multi_enemy',
        level: 1,
        mastery: 0,
        maxLevel: 5,
        icon: '🌀',
        desc: '男仙人专属！使目标神魂混乱，随机攻击场上任意单位(包括其队友)！无法放法用药，队友可为其喂药！',
        getFormula: (level = 1, mastery = 0) => {
          return window.SkillMasteryEngine.calculateControlSpell('luanhun', level, mastery);
        }
      },
      // 女仙人专属：封印咒
      {
        id: 'sk_xr_fengyin',
        name: '封印咒',
        genderReq: 'female', // 女专属
        type: 'control',
        targetType: 'multi_enemy',
        level: 1,
        mastery: 0,
        maxLevel: 5,
        icon: '📜',
        desc: '女仙人专属！全服最强刚性硬控！初始命中率62%，满级满熟练度高达95%！封印下完全无法行动或自用药，队友可为其喂药！',
        getFormula: (level = 1, mastery = 0) => {
          return window.SkillMasteryEngine.calculateControlSpell('fengyin', level, mastery);
        }
      },
      // 仙人通用 1：定身咒
      {
        id: 'sk_xr_dingshen',
        name: '定身咒',
        genderReq: 'all', // 通用
        type: 'control',
        targetType: 'multi_enemy',
        level: 1,
        mastery: 0,
        maxLevel: 5,
        icon: '✨',
        desc: '仙人通用半控！封印物理攻击与法术，初始命中率33%，满级满熟练度单体75%！允许吃药召宠，受伤害立即破封苏醒！',
        getFormula: (level = 1, mastery = 0) => {
          return window.SkillMasteryEngine.calculateControlSpell('dingshen', level, mastery);
        }
      },
      // 仙人通用 2：隐身咒
      {
        id: 'sk_xr_yinshen',
        name: '隐身咒',
        genderReq: 'all', // 通用
        type: 'buff',
        targetType: 'ally_multi',
        level: 1,
        mastery: 0,
        maxLevel: 5,
        icon: '🌫️',
        desc: '仙人通用战术隐身！遁入虚无，隐藏自身与队友的血条与出手时序面板，极大干扰敌方判断，并提升闪避率！',
        getFormula: (level = 1, mastery = 0) => {
          return window.SkillMasteryEngine.calculateControlSpell('yinshen', level, mastery);
        }
      }
    ]
  }
};

/**
 * 根据职业 ID 与性别，获取合法的 3 个技能配置 (1 专属 + 2 通用)
 */
window.GAME_DATA.getSkillsForClassAndGender = function(classId, gender = 'male') {
  const cls = window.GAME_DATA.CLASSES[classId];
  if (!cls) return [];
  const g = (gender === 'female') ? 'female' : 'male';
  return cls.skills.filter(s => s.genderReq === 'all' || s.genderReq === g).map(s => ({
    id: s.id,
    name: s.name,
    genderReq: s.genderReq,
    type: s.type,
    targetType: s.targetType,
    level: 1,
    mastery: 0,
    maxLevel: 5,
    icon: s.icon,
    desc: s.desc
  }));
};
