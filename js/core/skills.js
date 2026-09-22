/**
 * 汉风西游 - 技能体系与熟练度核心引擎 (Skills & Mastery Engine)
 * 
 * 核心法则（策划标准白皮书 rules/skills.md）：
 * 1. 任何玩家或者仙宠获取技能初始熟练度为 0。
 * 2. 所有技能分为 5 级 (Lv.1 ~ Lv.5)，每级跨度 5000 熟练度，满级满熟练度为 25000。
 * 3. 锁级机制：Lv.1 熟练度上限为 5000，达到后即便再使用也不会增加 1 点熟练度，必须升至 2 级才可继续提升。
 * 4. 1/5 突破法则：允许在当前等级满熟练度的 1/5 (即 1000 点跨度) 时提前升级技能：
 *    - 升 Lv.2：最少需 1000 熟练度
 *    - 升 Lv.3：最少需 6000 熟练度
 *    - 升 Lv.4：最少需 11000 熟练度
 *    - 升 Lv.5：最少需 16000 熟练度
 * 5. 长安城左上角神坛场景内有【菩提老祖】，所有技能学习、仙宠 10 级授法、技能升级突破必须与他交互进行。
 * 6. 舍生取义数值与气血限制：
 *    - Lv.1 0熟练度：伤害 500，反噬 0，蓝耗 220
 *    - Lv.1 <=10熟练度：无副作用 (反噬 0)
 *    - Lv.1 >10熟练度：伤害 501 起步，反噬 1 起步，蓝耗 220
 *    - Lv.1 1000熟练度：伤害 650，反噬 40，蓝耗 250
 *    - 1000熟练度提前升 Lv.2：伤害 1600，反噬 400，蓝耗 350
 *    - Lv.5 25000 满熟练度：伤害约 16000，单次自损反噬 8000 血！
 *    - 气血限制：低于 10% 无法使用；若刚好 10% 或不够扣血保留 1 点濒死，下次无法使用。
 * 7. 妖魔技能高蓝耗与伤害：
 *    - 雷霆万钧：1级耗蓝 300，0熟练度伤害 420；满级满熟练度高达 12608！
 *    - 飞沙走石 / 三昧真火：群体必中法术，攻击目标 1->4 个
 * 8. 佛门玄击与【抗玄击】法则：
 *    - 佛光普照与如来神掌伤害为【伤害基数 + 敌方当前生命百分比 + 扣除敌方当前法力百分比】
 *    - 统一称为【抗玄击】，全服没有任何宝物、装备或宝石可以增加抗玄击
 *    - 金刚天生自带 5% 抗玄击，为全服唯一来源
 * 9. 三大职业天生自带初始抗性体系：
 *    - 金刚：20% 物理抗性、10% 舍生抗性、5% 玄击抗性
 *    - 妖魔：10% 物理抗性、10% 雷霆抗性、10% 飞沙抗性、10% 三昧真火抗性、10% 万毒攻心抗性
 *    - 神仙：10% 物理抗性、10% 封印抗性、10% 乱魂抗性、10% 定身抗性
 */

(function() {
  window.GAME_DATA = window.GAME_DATA || {};

  const SkillMasteryEngine = {
    MAX_LEVEL: 5,
    SPAN_PER_LEVEL: 5000,
    MAX_MASTERY: 25000,
    BREAKTHROUGH_RATIO: 0.20, // 1/5 法则

    /**
     * 获取指定技能等级的基础熟练度与上限
     */
    getLevelBounds(level) {
      const clampedLevel = Math.max(1, Math.min(this.MAX_LEVEL, level || 1));
      const minMastery = (clampedLevel - 1) * this.SPAN_PER_LEVEL;
      const maxMastery = clampedLevel * this.SPAN_PER_LEVEL;
      return { minMastery, maxMastery };
    },

    /**
     * 获取升至下一级所需的最少熟练度门槛 (1/5 规则)
     */
    getMinMasteryForUpgrade(currentLevel) {
      if (currentLevel >= this.MAX_LEVEL) return null;
      // 当前等级基础熟练度 + 当前等级跨度 5000 的 1/5 (即 1000)
      return (currentLevel - 1) * this.SPAN_PER_LEVEL + (this.SPAN_PER_LEVEL * this.BREAKTHROUGH_RATIO);
    },

    /**
     * 检查技能当前是否被锁级 (到达该级最高 5000 封顶)
     */
    isLevelLocked(level, mastery) {
      const clampedLevel = Math.max(1, Math.min(this.MAX_LEVEL, level || 1));
      if (clampedLevel >= this.MAX_LEVEL) {
        return mastery >= this.MAX_MASTERY;
      }
      const cap = clampedLevel * this.SPAN_PER_LEVEL;
      return mastery >= cap;
    },

    /**
     * 检查技能是否已满足提前突破或正常升级的熟练度门槛
     */
    canUpgrade(level, mastery) {
      if (level >= this.MAX_LEVEL) return false;
      const minRequired = this.getMinMasteryForUpgrade(level);
      return mastery >= minRequired;
    },

    /**
     * 战斗中释放技能累加熟练度
     * @param {Object} skill 技能实例 { id, level, mastery, ... }
     * @param {number} gainAmount 获得的熟练度点数，默认 10
     * @returns {Object} { success, oldMastery, newMastery, locked, reason }
     */
    gainMastery(skill, gainAmount = 10) {
      if (!skill) return { success: false, reason: '技能不存在' };
      skill.level = skill.level || 1;
      skill.mastery = (skill.mastery !== undefined) ? skill.mastery : (skill.proficiency || 0);

      const levelCap = skill.level * this.SPAN_PER_LEVEL;

      // 如果当前已经达到本级上限，直接锁定，无法增加
      if (skill.mastery >= levelCap) {
        skill.proficiency = skill.mastery;
        return {
          success: false,
          oldMastery: skill.mastery,
          newMastery: skill.mastery,
          locked: true,
          reason: `该技能已达 ${skill.level} 级熟练度极境(${levelCap})，需前往长安城左上角【神坛】拜谒【菩提老祖】突破升至 ${skill.level + 1} 级！`
        };
      }

      const oldMastery = skill.mastery;
      skill.mastery = Math.min(levelCap, skill.mastery + gainAmount);
      skill.proficiency = skill.mastery;

      const isNowLocked = skill.mastery >= levelCap && skill.level < this.MAX_LEVEL;
      return {
        success: true,
        oldMastery,
        newMastery: skill.mastery,
        locked: isNowLocked,
        reachedCap: isNowLocked
      };
    },

    /**
     * 技能突破升级 (必须在神坛菩提老祖处交互触发)
     * @param {Object} skill 技能实例
     * @param {boolean} isMasterInteraction 是否由菩提老祖亲传
     */
    upgradeSkill(skill, isMasterInteraction = false) {
      if (!skill) return { success: false, message: '无效技能' };
      if (!isMasterInteraction) {
        return { success: false, message: '天地大衍道法不可私授！必须前往长安城左上角【神坛】由【菩提老祖】点化传道方可突破！' };
      }
      skill.level = skill.level || 1;
      skill.mastery = skill.mastery || 0;

      if (skill.level >= this.MAX_LEVEL) {
        return { success: false, message: '该技能已修至九重极境 (Lv.5 登峰造极)，无法继续晋升！' };
      }

      const minReq = this.getMinMasteryForUpgrade(skill.level);
      if (skill.mastery < minReq) {
        return { success: false, message: `道行未足！升至 ${skill.level + 1} 级需至少 ${minReq} 点熟练度 (当前: ${skill.mastery})！` };
      }

      skill.level += 1;
      return {
        success: true,
        newLevel: skill.level,
        currentMastery: skill.mastery,
        message: `【道法顿悟】在菩提老祖点化下，【${skill.name}】成功突破晋升为 Lv.${skill.level}！`
      };
    },

    // =========================================================================
    // 核心技能威力与数值计算公式
    // =========================================================================

    /**
     * 检查当前角色是否满足释放【舍生取义】的气血门槛 (生命值必须 >= 10%)
     */
    canCastShesheng(user) {
      if (!user) return { canCast: true };
      const maxHp = user.maxHp || 100;
      const minHpThreshold = Math.ceil(maxHp * 0.1);
      if (user.hp < minHpThreshold) {
        return {
          canCast: false,
          minHpThreshold,
          reason: `气血不足 10% (${user.hp}/${maxHp})，无力施展【舍生取义】！`
        };
      }
      return { canCast: true, minHpThreshold };
    },

    /**
     * 【舍生取义】数值公式推导 (官方最新基准规范)
     * 策划定型：
     * - Lv.1, 0 熟练度: 伤害 500, 反噬 0, 蓝耗 220
     * - Lv.1, <=10 熟练度: 无副作用 (反噬 0)
     * - Lv.1, >10 熟练度: 伤害 501 起步, 反噬 1 起步, 蓝耗 220
     * - Lv.1, 1000 熟练度: 伤害 650, 反噬 40, 蓝耗 250
     * - Lv.2, 1000 熟练度(提前突破): 伤害 1600, 反噬 400, 蓝耗 350
     * - Lv.5, 25000 满熟练度: 伤害约 16000, 单次自损反噬 8000 血！
     * - 血量限制法则：生命值低于 10% 无法使用；若刚好 10% 或不够单次扣血，气血保持在 1，下次因低于 10% 无法使用(除非恢复至 10% 以上)。
     */
    calculateShesheng(user, target, level = 1, mastery = 0) {
      const lvl = Math.max(1, Math.min(5, level));
      const m = Math.max(0, Math.min(25000, mastery));

      let damage = 500;
      let selfDamage = 0;
      let costMp = 220;

      if (lvl === 1) {
        if (m <= 10) {
          damage = 500;
          selfDamage = 0;
          costMp = 220;
        } else {
          // m 从 11 开始，damage 从 501 线性增加到 1000 时的 650，满 5000 达到 1000
          if (m <= 1000) {
            const progress = m - 10;
            damage = Math.floor(501 + (progress / 990) * 149);
            selfDamage = Math.max(1, Math.floor(1 + (progress / 990) * 39));
            costMp = Math.floor(220 + (progress / 990) * 30);
          } else {
            const progress = m - 1000;
            damage = Math.floor(650 + (progress / 4000) * 350);
            selfDamage = Math.floor(40 + (progress / 4000) * 60);
            costMp = Math.floor(250 + (progress / 4000) * 50);
          }
        }
      } else if (lvl === 2) {
        // Lv.2 在 1000 熟练度提前突破：1600 伤害，400 反伤，350 蓝耗；满 10000 达到 3000 伤害，1200 反伤，420 蓝耗
        const extraM = Math.max(0, m - 1000);
        damage = Math.floor(1600 + (extraM / 9000) * 1400);
        selfDamage = Math.floor(400 + (extraM / 9000) * 800);
        costMp = Math.floor(350 + (extraM / 9000) * 70);
      } else if (lvl === 3) {
        // Lv.3 在 6000 熟练度提前突破：3500 伤害，1500 反伤，450 蓝耗；满 15000 达到 6000 伤害，3000 反伤，540 蓝耗
        const extraM = Math.max(0, m - 6000);
        damage = Math.floor(3500 + (extraM / 9000) * 2500);
        selfDamage = Math.floor(1500 + (extraM / 9000) * 1500);
        costMp = Math.floor(450 + (extraM / 9000) * 90);
      } else if (lvl === 4) {
        // Lv.4 在 11000 熟练度提前突破：7000 伤害，3500 反伤，560 蓝耗；满 20000 达到 10500 伤害，5500 反伤，660 蓝耗
        const extraM = Math.max(0, m - 11000);
        damage = Math.floor(7000 + (extraM / 9000) * 3500);
        selfDamage = Math.floor(3500 + (extraM / 9000) * 2000);
        costMp = Math.floor(560 + (extraM / 9000) * 100);
      } else {
        // Lv.5 满级：在 16000 熟练度为 12000 伤害，6000 反伤；满 25000 熟练度精准达到 16000 伤害，8000 反伤！
        const extraM = Math.max(0, m - 16000);
        damage = Math.floor(12000 + (extraM / 9000) * 4000);
        selfDamage = Math.floor(6000 + (extraM / 9000) * 2000);
        costMp = Math.floor(700 + (extraM / 9000) * 150);
      }

      // 如果有 user 与 target 实体，可附加小幅攻击力加成
      if (user && user.atk) {
        damage += Math.floor(user.atk * 0.1);
      }

      return {
        damage,
        selfDamage,
        costMp,
        text: selfDamage > 0 
          ? `舍身成仁！自损 ${selfDamage} 点气血与 ${costMp} 点法力，悍然爆发 ${damage} 点破甲绝杀伤害！`
          : `舍生取义！初悟杀伐神威，消耗 ${costMp} 点法力，造成 ${damage} 点强劲物理伤害！`
      };
    },

    /**
     * 【雷霆万钧】数值公式推导 (官方最新基准规范)
     * 策划定型：
     * - Lv.1 蓝耗 300，0 熟练度伤害 420
     * - Lv.5 满 25000 熟练度伤害精准达到 12608！
     */
    calculateLeiting(user, target, level = 1, mastery = 0) {
      const lvl = Math.max(1, Math.min(5, level));
      const m = Math.max(0, Math.min(25000, mastery));

      const baseMpTable = [300, 450, 600, 750, 900];
      const costMp = baseMpTable[lvl - 1];

      let damage = 420;
      if (lvl === 1) {
        damage = Math.floor(420 + (m / 5000) * 780); // 420 -> 1200
      } else if (lvl === 2) {
        damage = Math.floor(1500 + ((m - 1000) / 9000) * 1700); // 1500 -> 3200
      } else if (lvl === 3) {
        damage = Math.floor(4000 + ((m - 6000) / 9000) * 2200); // 4000 -> 6200
      } else if (lvl === 4) {
        damage = Math.floor(7200 + ((m - 11000) / 9000) * 2300); // 7200 -> 9500
      } else {
        // Lv.5: 16000熟练度时 10500 伤害，满 25000 熟练度时精准达到 12608！
        damage = Math.floor(10500 + ((m - 16000) / 9000) * 2108); // 10500 + 2108 = 12608!
      }

      if (user && (user.matk || user.atk)) {
        damage += Math.floor((user.matk || user.atk) * 0.2);
      }

      return {
        damage,
        costMp,
        text: `九霄雷霆万钧！雷云翻滚狂暴轰鸣，消耗 ${costMp} 点法力，重创目标 ${damage} 点极高魔雷伤害！`
      };
    },

    /**
     * 【万毒攻心】毒素公式推导 (首回合结算，后续 75% 衰减)
     */
    calculateWandu(user, target, level = 1, mastery = 0) {
      const lvl = Math.max(1, Math.min(5, level));
      const m = Math.max(0, Math.min(25000, mastery));

      const baseMpTable = [260, 380, 520, 680, 820];
      const targetCountTable = [1, 2, 2, 3, 3];
      const durationTable = [3, 3, 4, 4, 5];

      const costMp = baseMpTable[lvl - 1];
      const maxTargets = targetCountTable[lvl - 1];
      const duration = durationTable[lvl - 1];

      // 基础命中率 65% ~ 96%
      const hitRate = Math.min(0.96, 0.65 + (m / 25000) * 0.31);
      const baseDmg = 300 + (lvl - 1) * 350 + Math.floor((m / 5000) * 100);

      return {
        costMp,
        maxTargets,
        duration,
        hitRate,
        firstRoundDmg: baseDmg,
        decayRatio: 0.75, // 后续每回合为上回合 75%
        text: `万毒攻心！黑烟腐骨，目标中毒持续 ${duration} 回合，毒性逐回合 75% 衰减！`
      };
    },

    /**
     * 【三昧真火 / 飞沙走石】群法必中机制
     */
    calculateGroupSpell(spellName, user, targetCount = 1, level = 1, mastery = 0) {
      const lvl = Math.max(1, Math.min(5, level));
      const m = Math.max(0, Math.min(25000, mastery));

      // 目标数随等级 1->4 (Lv.1: 1, Lv.2: 2, Lv.3: 3, Lv.4: 3, Lv.5: 4)
      const maxTargetsTable = [1, 2, 3, 3, 4];
      const maxTargets = maxTargetsTable[lvl - 1];
      const actualTargets = Math.min(maxTargets, Math.max(1, targetCount));

      // 蓝耗按目标递增
      const baseCost = 280 + (lvl - 1) * 140;
      const costMp = baseCost + (actualTargets - 1) * 40;

      // 必中人均伤害
      let perTargetDmg = 350;
      if (lvl === 1) {
        perTargetDmg = Math.floor(350 + (m / 5000) * 350);
      } else if (lvl === 2) {
        perTargetDmg = Math.floor(750 + ((m - 1000) / 9000) * 650);
      } else if (lvl === 3) {
        perTargetDmg = Math.floor(1500 + ((m - 6000) / 9000) * 1100);
      } else if (lvl === 4) {
        perTargetDmg = Math.floor(2800 + ((m - 11000) / 9000) * 1400);
      } else {
        perTargetDmg = Math.floor(4500 + ((m - 16000) / 9000) * 1500);
      }

      // 多目标伤害系数衰减
      const countPenalty = actualTargets === 1 ? 1.0 : (1.05 - actualTargets * 0.08);
      const finalPerDmg = Math.max(30, Math.floor(perTargetDmg * countPenalty));

      return {
        costMp,
        maxTargets,
        actualTargets,
        isSureHit: true, // 绝对必中
        perTargetDamage: finalPerDmg,
        totalDamage: finalPerDmg * actualTargets,
        text: `${spellName}！神法必中席卷敌阵 ${actualTargets} 人，人均遭受 ${finalPerDmg} 点狂暴伤害！`
      };
    },

    // =========================================================================
    // 职业天生自带初始抗性体系 (Innate Class Resistances)
    // 设定法则：我是这个职业的我自然会对本职业某些技能有天生抗性。
    // 游戏中没有任何装备、宝物可以增加【抗玄击】，金刚天生自带 5% 抗玄击！
    // =========================================================================
    INNATE_CLASS_RESISTANCES: {
      // 金刚：天生自带 20% 物理抗性、10% 舍生抗性、5% 玄击抗性
      jingang: {
        res_physical: 0.20,
        res_shesheng: 0.10,
        res_xuanji: 0.05
      },
      // 妖魔：天生自带 10% 物理抗性、10% 雷霆抗性、10% 飞沙抗性、10% 三昧真火抗性、10% 万毒攻心抗性
      yaomo: {
        res_physical: 0.10,
        res_leiting: 0.10,
        res_feisha: 0.10,
        res_sanmei: 0.10,
        res_wandu: 0.10
      },
      // 神仙：天生自带 10% 物理抗性、10% 封印抗性、10% 乱魂抗性、10% 定身抗性
      shenxian: {
        res_physical: 0.10,
        res_fengyin: 0.10,
        res_luanhun: 0.10,
        res_dingshen: 0.10
      }
    },

    /**
     * 获取指定职业的天生初始抗性字典
     */
    getInnateResistances(classId) {
      return Object.assign({}, this.INNATE_CLASS_RESISTANCES[classId] || {});
    },

    /**
     * 【佛光普照】(男金刚单体) / 【如来神掌】(女金刚群体)
     * 官方玄击机制：
     * 1. 伤害 = 伤害基数 + 敌方当前生命值百分比 + 扣除敌方当前法力值百分比。
     * 2. 如来神掌因升级后可攻击群体(1~4人)，单体百分比与威力低于佛光普照单体。
     * 3. 针对这两个技能的抗性在全服统一称为【抗玄击】，装备和宝物无法提供抗玄击，仅金刚天生自带 5% 抗玄击。
     */
    calculateMpDrainAttack(isGroup, user, target, level = 1, mastery = 0) {
      const lvl = Math.max(1, Math.min(5, level));
      const m = Math.max(0, Math.min(25000, mastery));

      const costMp = isGroup ? (180 + (lvl - 1) * 80) : (120 + (lvl - 1) * 60);
      const maxTargetsTable = [1, 2, 3, 3, 4];
      const maxTargets = isGroup ? maxTargetsTable[lvl - 1] : 1;

      let baseDmg = 150;
      let hpRatio = 0.20; // 默认扣当前生命百分比
      let mpRatio = 0.10; // 默认扣当前法力百分比

      if (!isGroup) {
        // 男金刚专属【佛光普照】(极强单体玄击，主打百分比伤害，基数辅助)
        // 熟练度推移：基数 150 -> 1500，生命百分比 20% -> 38%，法力百分比 10% -> 20%
        baseDmg = Math.floor(150 + (lvl - 1) * 250 + (m / 25000) * 350);
        hpRatio = Number((0.20 + (lvl - 1) * 0.035 + (m / 25000) * 0.04).toFixed(3)); // 20% ~ 38%
        mpRatio = Number((0.10 + (lvl - 1) * 0.02 + (m / 25000) * 0.02).toFixed(3)); // 10% ~ 20%
      } else {
        // 女金刚专属【如来神掌】(群体玄击，随等级覆盖 1~4 人，单体基数与百分比低于佛光)
        // 熟练度推移：基数 100 -> 1000 / 每位，生命百分比 12% -> 24%，法力百分比 6% -> 13%
        baseDmg = Math.floor(100 + (lvl - 1) * 160 + (m / 25000) * 260);
        hpRatio = Number((0.12 + (lvl - 1) * 0.02 + (m / 25000) * 0.04).toFixed(3)); // 12% ~ 24%
        mpRatio = Number((0.06 + (lvl - 1) * 0.01 + (m / 25000) * 0.03).toFixed(3)); // 6% ~ 13%
      }

      // 如果提供了实际目标，计算针对该目标的实际扣除值
      const curHp = (target && target.hp !== undefined) ? target.hp : 2000;
      const curMp = (target && target.mp !== undefined) ? target.mp : 1000;
      const resXuanji = (target && target.resistances && target.resistances.res_xuanji) || 0;

      const hpPercentDmg = Math.floor(curHp * hpRatio);
      const totalHpDmgBeforeRes = baseDmg + hpPercentDmg;
      const finalHpDmg = Math.max(10, Math.floor(totalHpDmgBeforeRes * (1 - resXuanji)));

      const mpPercentDrain = Math.floor(curMp * mpRatio);
      const finalMpDrain = Math.max(0, Math.floor(mpPercentDrain * (1 - resXuanji)));

      return {
        isGroup,
        costMp,
        maxTargets,
        baseDmg,
        hpRatio,
        mpRatio,
        damage: finalHpDmg,
        mpDrain: finalMpDrain,
        resXuanjiApplied: resXuanji,
        text: isGroup 
          ? `如来神掌！群体玄击轰击敌方 ${maxTargets} 人，造成【基数${baseDmg} + 当前生命${(hpRatio * 100).toFixed(0)}%】伤害，并扣除目标当前法力 ${(mpRatio * 100).toFixed(0)}%！`
          : `佛光普照！纯阳玄击重创目标，造成【基数${baseDmg} + 当前生命${(hpRatio * 100).toFixed(0)}%】(${finalHpDmg}伤)，并蒸发其 ${(mpRatio * 100).toFixed(0)}% (${finalMpDrain}MP) 法力！`
      };
    },

    /**
     * 【金刚护体】双抗提升
     */
    calculateHutiBuff(level = 1, mastery = 0) {
      const lvl = Math.max(1, Math.min(5, level));
      const m = Math.max(0, Math.min(25000, mastery));

      const targetCountTable = [1, 2, 3, 3, 4];
      const targetCount = targetCountTable[lvl - 1];
      const costMp = 150 + (lvl - 1) * 75;
      const resRate = Math.min(0.60, 0.12 + (lvl - 1) * 0.10 + (m / 25000) * 0.15);
      const duration = lvl >= 5 ? 5 : (lvl >= 3 ? 4 : 3);

      return {
        costMp,
        targetCount,
        duration,
        resRate,
        text: `金刚护体！璀璨琉璃金钟罩护体，全队物理与法术双抗暴涨 ${(resRate * 100).toFixed(0)}%，持续 ${duration} 回合！`
      };
    },

    /**
     * 仙人三大控制：乱魂、封印、定身
     */
    calculateControlSpell(spellType, level = 1, mastery = 0) {
      const lvl = Math.max(1, Math.min(5, level));
      const m = Math.max(0, Math.min(25000, mastery));

      let hitRate = 0.50;
      let duration = 2;
      let costMp = 200;
      let maxTargets = 1;

      if (spellType === 'luanhun') {
        // 乱魂咒 (男仙人)：初始单体命中率 45%，满级满熟练度 85%
        costMp = 200 + (lvl - 1) * 95;
        maxTargets = lvl >= 4 ? 3 : (lvl >= 2 ? 2 : 1);
        hitRate = Number((0.45 + (0.85 - 0.45) * (m / 25000)).toFixed(4));
        duration = lvl >= 5 ? 4 : (lvl >= 3 ? 3 : 2);
        return {
          costMp,
          maxTargets,
          hitRate,
          duration,
          state: 'luanhun',
          canCastSkill: false,
          canUseItemSelf: false,
          canTeammateFeed: true, // 允许队友喂药
          text: `乱魂咒！神识紊乱，目标不分敌我随机攻击，无法施法用药，持续 ${duration} 回合！`
        };
      } else if (spellType === 'fengyin') {
        // 封印咒 (女仙人)：官方白皮书标准：初始命中率 62%，满级满熟练度 95%！
        costMp = 220 + (lvl - 1) * 100;
        maxTargets = lvl >= 4 ? 3 : (lvl >= 2 ? 2 : 1);
        hitRate = Number((0.62 + (0.95 - 0.62) * (m / 25000)).toFixed(4));
        duration = lvl >= 4 ? 4 : (lvl >= 2 ? 3 : 2);
        return {
          costMp,
          maxTargets,
          hitRate,
          duration,
          state: 'fengyin',
          blocksAllActions: true, // 完全无法行动
          canTeammateFeed: true,
          text: `八卦封印咒！金锁封身，完全无法动弹与施法，持续 ${duration} 回合！`
        };
      } else if (spellType === 'dingshen') {
        // 定身咒 (仙人通用)：官方白皮书标准：每个目标初始命中率 33%，满级满熟练度 75%！
        costMp = 140 + (lvl - 1) * 60;
        maxTargets = lvl >= 4 ? 3 : (lvl >= 2 ? 2 : 1);
        hitRate = Number((0.33 + (0.75 - 0.33) * (m / 25000)).toFixed(4));
        duration = lvl >= 4 ? 3 : 2;
        return {
          costMp,
          maxTargets,
          hitRate,
          duration,
          state: 'dingshen',
          canCastSkill: false,
          canAttack: false,
          canUseItemSelf: true, // 可以自己吃药
          canSummonPet: true, // 可以召唤宠物
          breakOnDamage: true, // 受到伤害立即破封解除！
          text: `定身咒！身陷泥泞无法移动攻击，允许吃药召宠，受到伤害立即解除！`
        };
      } else {
        // 隐身咒 (仙人通用)
        costMp = 160 + (lvl - 1) * 60;
        duration = 3 + Math.floor(lvl / 2);
        return {
          costMp,
          duration,
          state: 'yinshen',
          hideHud: true, // 隐藏血量与速度面板
          dodgeBonus: 0.30 + (lvl - 1) * 0.05,
          text: `隐身咒！遁入虚无法界，血条与出手时序完全隐匿，闪避提升！`
        };
      }
    }
  };

  window.SkillMasteryEngine = SkillMasteryEngine;
})();
