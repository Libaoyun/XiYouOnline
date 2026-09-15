/**
 * 汉风西游 - 正统三大职业门派与技能系统 (Classes 2.0)
 * 严格按照玩家指令设计：
 * 1. 金刚：舍生取义 (单体巨伤自损HP)、佛光普照 (单体百分比扣HP/MP)、金刚护体 (大幅增物法抗性，随等级多目标)
 * 2. 妖魔：雷霆万钧 (单体高伤高耗蓝)、飞沙走石 (群伤最多4目标)、三昧真火 (群伤真火最多4目标)
 * 3. 神仙：封印咒 (单一强封3回合无法行动)、定身咒 (定身最多4目标，无法攻法但可吃药)、隐身咒 (隐匿属性不可见并高闪避)
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
    desc: '佛门正宗，金刚怒目。擅长近战肉搏与坚不可摧的体魄，具有损己轰敌的极限爆发与强力守护能力。',
    attrWeights: { hp: 16, atk: 2.3, def: 2.2, spd: 1.0, mp: 6, matk: 0.8 },
    skills: [
      {
        id: 'sk_jg_shesheng',
        name: '舍生取义',
        type: 'active',
        targetType: 'single_enemy',
        costMp: 30,
        costHpRatio: 0.15, // 自损当前15%气血
        levelReq: 1,
        skillLevel: 10,
        proficiency: 250, // 熟练度
        icon: '⚔️',
        desc: '单体伤害巨大！对自身消耗15%气血，无视目标部分防御，伤害随技能等级与熟练度大幅提升！',
        formula: (user, target, skillLvl = 10, prof = 250) => {
          const selfDmg = Math.floor(user.hp * 0.15);
          // 伤害受自身气血、攻击力、技能等级与熟练度多重加成
          const bonus = skillLvl * 12 + Math.floor(prof * 0.4);
          const dmg = Math.max(30, Math.floor((user.atk * 2.5 + selfDmg * 1.8 + bonus) - target.def * 0.25));
          return {
            damage: dmg,
            selfDamage: selfDmg,
            isCrit: Math.random() < 0.25,
            text: `舍身成仁！自损${selfDmg}点气血，悍然轰出${dmg}点破甲巨力伤害！`
          };
        }
      },
      {
        id: 'sk_jg_foguang',
        name: '佛光普照',
        type: 'active',
        targetType: 'single_enemy',
        costMp: 45,
        levelReq: 5,
        skillLevel: 10,
        proficiency: 200,
        icon: '✨',
        desc: '纯阳佛光破晓，按百分比重创单个目标气血（HP）并焚毁其大量精力（MP）！',
        formula: (user, target, skillLvl = 10, prof = 200) => {
          // 百分比扣除：目标当前生命18% + 技能加成
          const hpPercent = 0.18 + (skillLvl * 0.005);
          const rawDmg = Math.floor(target.hp * hpPercent + user.atk * 0.8);
          const dmg = Math.max(25, rawDmg);
          // 焚烧精力
          const mpBurn = Math.floor(target.maxMp * 0.2 + skillLvl * 8);
          return {
            damage: dmg,
            mpDrain: mpBurn,
            text: `佛光普照！引动西天佛火，扣除目标${dmg}点真实气血，并焚毁其${mpBurn}点精力！`
          };
        }
      },
      {
        id: 'sk_jg_huti',
        name: '金刚护体',
        type: 'buff',
        targetType: 'ally_multi',
        costMp: 40,
        levelReq: 15,
        skillLevel: 10,
        proficiency: 180,
        icon: '🛡️',
        desc: '召唤罗汉金身护持队友，大幅提升物理防御与法术抗性！随技能等级提升，可选目标变多（最多全队）！',
        getTargetCount: (skillLvl = 10) => {
          // 技能等级>=20为3人，>=35为全队，基础1-2人
          if (skillLvl >= 35) return 4;
          if (skillLvl >= 20) return 3;
          if (skillLvl >= 10) return 2;
          return 1;
        },
        buff: {
          name: '金刚护体',
          duration: 3,
          defBonusRate: 0.5,
          mdefBonusRate: 0.45,
          text: '周身泛起璀璨琉璃罗汉金身，物理防御与法术抗性大幅激增！'
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
    desc: '深渊魔道，狂傲桀骜。精通引动天雷、飞沙走石与三昧真火，群体轰杀能力冠绝三界！',
    attrWeights: { hp: 12, atk: 1.8, def: 1.3, spd: 1.4, mp: 12, matk: 2.3 },
    skills: [
      {
        id: 'sk_ym_leiting',
        name: '雷霆万钧',
        type: 'active',
        targetType: 'single_enemy',
        costMp: 70, // 精力消耗稍高
        levelReq: 1,
        skillLevel: 10,
        proficiency: 300,
        icon: '⚡',
        desc: '引动九霄狂暴魔雷单体重击！单体爆发伤害极高，精力消耗稍高。',
        formula: (user, target, skillLvl = 10, prof = 300) => {
          const bonus = skillLvl * 16 + Math.floor(prof * 0.5);
          const dmg = Math.max(35, Math.floor((user.matk * 2.8 + bonus) - target.mdef * 0.35));
          return {
            damage: dmg,
            isCrit: Math.random() < 0.2,
            text: `雷霆万钧！黑云压顶狂雷炸裂，对目标造成${dmg}点极高单体魔雷轰杀！`
          };
        }
      },
      {
        id: 'sk_ym_feisha',
        name: '飞沙走石',
        type: 'active',
        targetType: 'multi_enemy',
        costMp: 55,
        levelReq: 10,
        skillLevel: 15,
        proficiency: 280,
        icon: '🌪️',
        desc: '掀起狂暴风沙巨石群攻敌阵！随技能等级熟练度提高，打击目标最多达 4 个！',
        getMaxTargets: (skillLvl = 15, prof = 280) => {
          // 随等级与熟练度提升：最多4个
          const score = skillLvl * 10 + prof;
          if (score >= 350) return 4;
          if (score >= 200) return 3;
          if (score >= 100) return 2;
          return 1;
        },
        formula: (user, target, count = 1, skillLvl = 15) => {
          const penalty = count > 1 ? (1.05 - count * 0.08) : 1.0;
          const dmg = Math.max(20, Math.floor(((user.matk * 1.6 + skillLvl * 10) * penalty) - target.mdef * 0.35));
          return {
            damage: dmg,
            text: `飞沙走石！漫天砂石如暴雨倾泻，轰击造成${dmg}点土系群伤！`
          };
        }
      },
      {
        id: 'sk_ym_sanmei',
        name: '三昧真火',
        type: 'active',
        targetType: 'multi_enemy',
        costMp: 65,
        levelReq: 20,
        skillLevel: 15,
        proficiency: 320,
        icon: '🔥',
        desc: '吐出万载不灭的三昧真火群攻！随技能等级熟练度提高，打击目标最多达 4 个！',
        getMaxTargets: (skillLvl = 15, prof = 320) => {
          const score = skillLvl * 10 + prof;
          if (score >= 350) return 4;
          if (score >= 200) return 3;
          if (score >= 100) return 2;
          return 1;
        },
        formula: (user, target, count = 1, skillLvl = 15) => {
          const penalty = count > 1 ? (1.1 - count * 0.08) : 1.0;
          const dmg = Math.max(25, Math.floor(((user.matk * 1.8 + skillLvl * 12) * penalty) - target.mdef * 0.3));
          return {
            damage: dmg,
            isCrit: Math.random() < 0.22,
            text: `三昧真火！熊熊烈焰焚尽八荒，烈焰灼烧造成${dmg}点纯火伤害！`
          };
        }
      }
    ]
  },

  // =========================================================================
  // 3. 神仙门派 (阐教玄门 · 控场封印 · 玄通莫测)
  // =========================================================================
  xianren: {
    id: 'xianren',
    name: '神仙',
    title: '【九天太虚神仙】',
    desc: '阐教玄门，深谙天地法则。精通大封印咒、定身咒与隐身避气，控场逆转乾坤！',
    attrWeights: { hp: 11, atk: 1.4, def: 1.5, spd: 1.7, mp: 15, matk: 1.9 },
    skills: [
      {
        id: 'sk_xr_fengyin',
        name: '封印咒',
        type: 'control',
        targetType: 'single_enemy',
        costMp: 50,
        levelReq: 1,
        skillLevel: 10,
        proficiency: 350,
        icon: '📜',
        desc: '单一强力封印！随熟练度越高命中率越高；命中后目标 3 回合内不能做任何操作！',
        getHitRate: (user, target, skillLvl = 10, prof = 350) => {
          // 基础命中率 65%，随熟练度与等级可提升至 90%
          const baseRate = 0.65;
          const profBonus = (prof / 1000) * 0.25;
          return Math.min(0.92, baseRate + profBonus);
        },
        debuff: {
          id: 'fengyin',
          name: '大封印',
          duration: 3,
          blocksAllActions: true, // 不能做任何操作！
          text: '被先天金光封印镇住！陷入大封印状态，整整 3 回合无法进行任何操作！'
        }
      },
      {
        id: 'sk_xr_dingshen',
        name: '定身咒',
        type: 'control',
        targetType: 'multi_enemy',
        costMp: 60,
        levelReq: 10,
        skillLevel: 15,
        proficiency: 300,
        icon: '✨',
        desc: '定身群敌！随技能等级熟练度提高最多可定身 4 个目标！定身后无法攻击和技能，但可以使用药品！',
        getMaxTargets: (skillLvl = 15, prof = 300) => {
          const score = skillLvl * 10 + prof;
          if (score >= 350) return 4;
          if (score >= 200) return 3;
          if (score >= 100) return 2;
          return 1;
        },
        getHitRate: (user, target, skillLvl = 15, prof = 300) => {
          return Math.min(0.85, 0.60 + (prof / 1000) * 0.2);
        },
        debuff: {
          id: 'dingshen',
          name: '定身',
          duration: 2,
          blocksAttackAndSkill: true, // 无法攻击与施法
          allowItem: true, // 但允许使用药品给队友回血！
          text: '中玄门定身术！无法进行物理攻击与法术，但允许使用药品回血！'
        }
      },
      {
        id: 'sk_xr_yinshen',
        name: '隐身咒',
        type: 'buff',
        targetType: 'ally_multi',
        costMp: 55,
        levelReq: 15,
        skillLevel: 10,
        proficiency: 260,
        icon: '🌫️',
        desc: '隐匿自身及队友气机！隐藏自身与队友属性使对方不可见，并赋予 50% 额外闪避率！',
        buff: {
          id: 'yinshen',
          name: '隐身潜行',
          duration: 3,
          hideAttributes: true, // 属性对方不可见
          dodgeRate: 0.50, // 50% 闪避率
          text: '化身虚无遁入烟霞，身形与属性隐匿不见，闪避几率暴增50%！'
        }
      }
    ]
  }
};
