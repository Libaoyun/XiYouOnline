/**
 * 汉风西游 - 仙宠养成与转职学技核心引擎 (PetSystem 2.0)
 * 严格支持：
 * 1. 普通、散仙、金仙三大品质分层生成
 * 2. 普通无技能只普攻；散仙10级学技；金仙最高成长与属性
 * 3. 散仙与金仙一键领悟9大神技之一，自动确立职业(金刚/妖魔/神仙)并激活对应门派技能抗性+5%
 * 4. 独立抗性与血量持久化存储
 */
class PetSystem {
  static createPet(petId, isWild = false, level = 0, isMutated = null) {
    const template = window.GAME_DATA.PETS[petId];
    if (!template) return null;

    const quality = template.quality || 'ordinary';
    const qualityName = template.qualityName || '普通';

    // 变异判定 (普通 3%, 散仙 6%, 金仙 8%)
    const mutRate = quality === 'jinxian' ? 0.08 : (quality === 'sanxian' ? 0.06 : 0.03);
    const mutated = isMutated !== null ? isMutated : Math.random() < mutRate;

    const growthMin = template.growthRange[0];
    const growthMax = template.growthRange[1];
    let growth = Number((growthMin + Math.random() * (growthMax - growthMin)).toFixed(3));
    if (mutated) growth = Number((growth * 1.06).toFixed(3));

    // 资质生成
    const rollApt = (range) => {
      const base = Math.floor(range[0] + Math.random() * (range[1] - range[0]));
      return mutated ? Math.floor(base * 1.1) : base;
    };

    const aptitudes = {
      hp: rollApt(template.aptitudes.hp),
      atk: rollApt(template.aptitudes.atk),
      def: rollApt(template.aptitudes.def),
      matk: rollApt(template.aptitudes.matk),
      spd: rollApt(template.aptitudes.spd)
    };

    const pet = {
      instanceId: 'pet_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
      templateId: petId,
      name: mutated ? `变异${template.name}` : template.name,
      icon: template.icon,
      quality: quality, // 'ordinary' | 'sanxian' | 'jinxian'
      qualityName: qualityName,
      classId: null, // 'jingang' | 'yaomo' | 'xianren'
      className: '无门派',
      isMutated: mutated,
      level: level,
      exp: 0,
      loyalty: 100,
      growth: growth,
      aptitudes: aptitudes,
      skills: [], // 领悟后的技能对象数组 [{ id, name, classId, level, proficiency, icon, desc, costMp, costHpRatio }]
      // 抗性字典
      resistances: {
        res_phy: 0,
        res_shesheng: 0,
        res_foguang: 0,
        res_leiting: 0,
        res_feisha: 0,
        res_sanmei: 0,
        res_fengyin: 0,
        res_dingshen: 0,
        res_yinshen: 0
      },
      // 基础属性点
      attrs: {
        con: 10 + level * 2,
        str: 10 + level * 2,
        int: 10 + level * 1,
        dex: 10 + level * 1,
        sta: 10 + level * 1
      },
      hp: 0,
      maxHp: 0,
      mp: 0,
      maxMp: 0,
      atk: 0,
      def: 0,
      matk: 0,
      mdef: 0,
      spd: 0
    };

    this.recalculatePet(pet, true);
    return pet;
  }

  // 重新计算宠物全属性与抗性
  static recalculatePet(pet, healToFull = false) {
    const apt = pet.aptitudes;
    const g = pet.growth;
    const lvl = pet.level;

    // 品质加成倍率
    let qMult = 1.0;
    if (pet.quality === 'sanxian') qMult = 1.15;
    if (pet.quality === 'jinxian') qMult = 1.35;

    let maxHp = Math.floor((lvl * 18 + pet.attrs.con * (apt.hp / 800) * 1.6) * qMult);
    let maxMp = Math.floor((lvl * 10 + pet.attrs.int * (apt.matk / 900) * 1.3) * qMult);
    let atk = Math.floor((lvl * 7 + pet.attrs.str * (apt.atk / 700) * g) * qMult);
    let def = Math.floor((lvl * 5 + pet.attrs.sta * (apt.def / 800) * g) * qMult);
    let matk = Math.floor((lvl * 6 + pet.attrs.int * (apt.matk / 850) * g) * qMult);
    let mdef = Math.floor((lvl * 4 + pet.attrs.sta * 0.9 + pet.attrs.int * 0.6) * qMult);
    let spd = Math.floor((pet.attrs.dex * (apt.spd / 900) * 1.3) * qMult);

    pet.maxHp = Math.max(90, maxHp);
    pet.maxMp = Math.max(60, maxMp);
    pet.atk = Math.max(25, atk);
    pet.def = Math.max(20, def);
    pet.matk = Math.max(20, matk);
    pet.mdef = Math.max(15, mdef);
    pet.spd = Math.max(15, spd);

    // 重置并计算抗性
    pet.resistances = {
      res_phy: 0,
      res_shesheng: 0,
      res_foguang: 0,
      res_leiting: 0,
      res_feisha: 0,
      res_sanmei: 0,
      res_fengyin: 0,
      res_dingshen: 0,
      res_yinshen: 0
    };

    // 门派专精抗性加成规则：确立门派后对应门派技能抗性 +5% (0.05)
    if (pet.classId === 'jingang') {
      pet.resistances.res_shesheng += 0.05;
      pet.resistances.res_foguang += 0.05;
      pet.resistances.res_phy += 0.05;
    } else if (pet.classId === 'yaomo') {
      pet.resistances.res_leiting += 0.05;
      pet.resistances.res_feisha += 0.05;
      pet.resistances.res_sanmei += 0.05;
    } else if (pet.classId === 'xianren') {
      pet.resistances.res_fengyin += 0.05;
      pet.resistances.res_dingshen += 0.05;
      pet.resistances.res_yinshen += 0.05;
    }

    if (healToFull || pet.hp === 0) {
      pet.hp = pet.maxHp;
      pet.mp = pet.maxMp;
    } else {
      pet.hp = Math.min(pet.hp, pet.maxHp);
      pet.mp = Math.min(pet.mp, pet.maxMp);
    }
  }

  // 散仙 / 金仙一键领悟技能与自动转职
  static learnSkill(pet) {
    if (pet.quality === 'ordinary') {
      return {
        success: false,
        msg: `【${pet.name}】属于普通仙宠，天资平庸无法领悟门派绝技，仅能进行普通物理攻击！`
      };
    }

    if (pet.quality === 'sanxian' && pet.level < 10) {
      return {
        success: false,
        msg: `【${pet.name}】当前等级为 Lv.${pet.level}，散仙仙宠需修行达到 10 级方可开启灵窍领悟神技！`
      };
    }

    // 从九大技能中随机领悟 1 种
    const skillPool = window.GAME_DATA.NINE_CLASS_SKILLS;
    const chosen = skillPool[Math.floor(Math.random() * skillPool.length)];

    pet.skills = [
      {
        id: chosen.id,
        name: chosen.name,
        classId: chosen.classId,
        className: chosen.className,
        icon: chosen.icon,
        desc: chosen.desc,
        level: 1,
        proficiency: 100
      }
    ];

    pet.classId = chosen.classId;
    pet.className = chosen.className;

    // 重新计算属性并激活门派抗性+5%
    this.recalculatePet(pet, false);

    return {
      success: true,
      skill: chosen,
      msg: `🎉【神技顿悟】${pet.name}灵光冲霄，一键领悟了【${chosen.className}】门派绝技【${chosen.name}】！并获得本门派技能抗性永久+5%！`
    };
  }

  // 获得经验升级
  static gainExp(pet, amount) {
    pet.exp += amount;
    const reqExp = pet.level * pet.level * 50 + pet.level * 40 + 60;
    let leveledUp = false;
    while (pet.exp >= reqExp && pet.level < 100) {
      pet.exp -= reqExp;
      pet.level += 1;
      pet.attrs.con += 2;
      pet.attrs.str += 2;
      pet.attrs.int += 1;
      pet.attrs.dex += 1;
      pet.attrs.sta += 1;
      leveledUp = true;
    }
    if (leveledUp) {
      this.recalculatePet(pet, true);
    }
    return leveledUp;
  }
}

window.PetSystem = PetSystem;
