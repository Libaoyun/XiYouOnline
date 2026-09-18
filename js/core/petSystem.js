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
      passives: [], // 研习魔兽要诀领悟的被动特技列表 [{ id, name, icon, desc }]
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
      spd: 0,
      critRate: 0.08,
      comboRate: 0.05,
      fatalRate: 0.02,
      dodgeRate: 0.05
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
    // 高级敏捷被动加成 +30 速度
    if (pet.passives && pet.passives.some(p => p.id === 'high_speed')) {
      spd += 30;
    }

    let critRate = 0.08;
    let comboRate = 0.05;
    let fatalRate = 0.02;
    let dodgeRate = 0.05;
    if (pet.passives && Array.isArray(pet.passives)) {
      if (pet.passives.some(p => p.id === 'high_critical')) critRate += 0.20;
      if (pet.passives.some(p => p.id === 'high_combo')) comboRate += 0.25;
      if (pet.passives.some(p => p.id === 'high_sneak')) dodgeRate += 0.15;
    }
    pet.critRate = Math.min(0.85, Number(critRate.toFixed(3)));
    pet.comboRate = Math.min(0.75, Number(comboRate.toFixed(3)));
    pet.fatalRate = Math.min(0.50, Number(fatalRate.toFixed(3)));
    pet.dodgeRate = Math.min(0.70, Number(dodgeRate.toFixed(3)));

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

  // 金柳露洗炼：随机生成新资质与成长预览
  static generateWashResult(pet) {
    const template = window.GAME_DATA.PETS[pet.templateId] || window.GAME_DATA.PETS['dahai_gui'];
    const quality = pet.quality || template.quality || 'ordinary';
    
    // 金柳露洗炼出变异概率大幅提升
    const mutRate = quality === 'jinxian' ? 0.16 : (quality === 'sanxian' ? 0.10 : 0.05);
    const isMutated = Math.random() < mutRate;

    const growthMin = template.growthRange[0];
    const growthMax = template.growthRange[1];
    let growth = Number((growthMin + Math.random() * (growthMax - growthMin)).toFixed(3));
    if (isMutated) growth = Number((growth * 1.08).toFixed(3));

    const rollApt = (range) => {
      const base = Math.floor(range[0] + Math.random() * (range[1] - range[0]));
      return isMutated ? Math.floor(base * 1.12) : base;
    };

    const aptitudes = {
      hp: rollApt(template.aptitudes.hp),
      atk: rollApt(template.aptitudes.atk),
      def: rollApt(template.aptitudes.def),
      matk: rollApt(template.aptitudes.matk),
      spd: rollApt(template.aptitudes.spd)
    };

    return {
      level: 1,
      exp: 0,
      isMutated: isMutated,
      name: isMutated ? `变异${template.name}` : template.name,
      growth: growth,
      aptitudes: aptitudes
    };
  }

  // 确认替换金柳露洗炼新属性
  static applyWashResult(pet, washResult) {
    pet.level = washResult.level || 1;
    pet.exp = 0;
    pet.isMutated = washResult.isMutated;
    pet.name = washResult.name;
    pet.growth = washResult.growth;
    pet.aptitudes = JSON.parse(JSON.stringify(washResult.aptitudes));
    pet.skills = [];
    pet.classId = null;
    pet.className = '无门派';
    pet.attrs = {
      con: 12,
      str: 12,
      int: 11,
      dex: 11,
      sta: 11
    };
    this.recalculatePet(pet, true);
    return pet;
  }

  // 魔兽要诀打书研习系统 (最多4个被动槽位，开格或顶替)
  static learnPetSkillBook(pet, bookItemId) {
    const book = window.GAME_DATA.ITEMS[bookItemId];
    if (!book || book.type !== 'pet_book') {
      return { success: false, msg: '所选物品非仙家魔兽要诀！' };
    }

    if (!pet.passives) pet.passives = [];

    // 检查是否已经学会了相同特技
    if (pet.passives.some(p => p.id === book.skillId)) {
      return { success: false, msg: `【${pet.name}】早已参悟了【${book.skillName}】，无需重复打书！` };
    }

    const newPassive = {
      id: book.skillId,
      name: book.skillName,
      icon: book.icon,
      desc: book.desc
    };

    let replaced = null;
    if (pet.passives.length < 4) {
      // 拥有空槽位时，80% 概率直接开槽领悟，20% 概率顶替已有特技
      if (pet.passives.length > 0 && Math.random() < 0.20) {
        const repIdx = Math.floor(Math.random() * pet.passives.length);
        replaced = pet.passives[repIdx];
        pet.passives[repIdx] = newPassive;
      } else {
        pet.passives.push(newPassive);
      }
    } else {
      // 4个技能槽已满，100% 顶替随机一个特技
      const repIdx = Math.floor(Math.random() * pet.passives.length);
      replaced = pet.passives[repIdx];
      pet.passives[repIdx] = newPassive;
    }

    // 重新计算全属性（如高级敏捷影响速度）
    this.recalculatePet(pet, false);

    let msg = `✨【魔兽顿悟】仙宠【${pet.name}】成功研习了《${book.name}》，领悟了被动绝技【${newPassive.name}】！`;
    if (replaced) {
      msg += `（旧绝技【${replaced.name}】已被新绝技融会贯通顶替）`;
    }

    return {
      success: true,
      replacedSkill: replaced,
      newSkill: newPassive,
      msg: msg
    };
  }
}

window.PetSystem = PetSystem;
