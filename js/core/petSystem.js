/**
 * 汉风西游 - 仙宠养成与转职学技核心引擎 (PetSystem 2.0)
 * 严格支持：
 * 1. 普通、散仙、金仙三大品质分层生成
 * 2. 普通只普攻；散仙和金仙均10级后学技，每只免费一次
 * 3. 随机门派与符合性别的技能，门派技能抗性+5%
 * 4. 独立抗性与血量持久化存储
 */
class PetSystem {
  static createPet(petId, isWild = false, level = 0, isMutated = null) {
    const template = window.GAME_DATA.PETS[petId];
    if (!template) return null;
    level = Number.isFinite(level) ? Math.max(0, Math.min(100, Math.floor(level))) : 0;

    const quality = template.quality || 'ordinary';
    const qualityName = template.qualityName || '普通';

    // 变异判定 (普通 3%, 散仙 6%, 金仙 8%)
    const mutRate = quality === 'jinxian' ? 0.08 : (quality === 'sanxian' ? 0.06 : 0.03);
    const mutated = isMutated !== null ? isMutated : Math.random() < mutRate;

    const growthMin = template.growthRange[0];
    const growthMax = template.growthRange[1];
    let growth;
    if (isWild) {
      // 玩家招降后：成长率在固定区间内纯随机 roll 点，体现招降后属性与成长的随机性
      growth = Number((growthMin + Math.random() * (growthMax - growthMin)).toFixed(3));
    } else {
      // 战中野怪：成长率在区间内偏大（中等偏上约75%分位），属性相对固定
      growth = Number((growthMin + (growthMax - growthMin) * 0.75).toFixed(3));
    }
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

    // 四维分配点数 (生-气血、法-法力、力-攻防、速-速度敏捷)
    let shengPts, faPts, liPts, suPts;
    if (isWild) {
      // 招降后野怪属性不固定：四维加点趋于平均但带有随机浮动方差
      const totalPoints = level * 8;
      const basePer = Math.floor(totalPoints / 4);
      const distribution = [basePer, basePer, basePer, basePer];
      // 在四维间转移点数，低等级也守恒，不会因截断负数凭空增加潜能。
      for (let i = 0; i < 3; i++) {
        const delta = Math.floor((Math.random() - 0.5) * Math.min(6, basePer + 1));
        const moved = Math.max(-distribution[i], Math.min(distribution[3], delta));
        distribution[i] += moved;
        distribution[3] -= moved;
      }
      [shengPts, faPts, liPts, suPts] = distribution;
    } else {
      // 未招降的标准野怪：四维均匀均衡分布
      const per = Math.floor((level * 8) / 4);
      shengPts = per;
      faPts = per;
      liPts = per;
      suPts = per;
    }

    const pet = {
      instanceId: 'pet_' + Date.now() + '_' + (this._instanceSequence = (this._instanceSequence || 0) + 1) + '_' + Math.floor(Math.random() * 10000),
      templateId: petId,
      name: mutated ? `变异${template.name}` : template.name,
      icon: template.icon,
      quality: quality, // 'ordinary' | 'sanxian' | 'jinxian'
      qualityName: qualityName,
      gender: template.gender || (Math.random() < 0.5 ? 'male' : 'female'),
      masterLessonLearned: false,
      element: template.element || 'wood',
      elementName: template.elementName || (window.FiveElements ? window.FiveElements.NAMES[template.element || 'wood'] : '木'),
      classId: null, // 'jingang' | 'yaomo' | 'xianren'
      className: '无门派',
      isMutated: mutated,
      isWild: isWild,
      level: level,
      exp: 0,
      loyalty: 100,
      growth: growth,
      aptitudes: aptitudes,
      skills: [], // 领悟后的技能对象数组 [{ id, name, classId, level, proficiency, icon, desc, costMp, costHpRatio }]
      passives: [], // 研习魔兽要诀领悟的被动特技列表 [{ id, name, icon, desc }]
      // 自由潜能点与金仙独门元神变身
      potentialPoints: 0,
      talentPoints: quality === 'jinxian' ? 0 : 0,
      avatarTransformed: false,
      avatarRoundsLeft: 0,
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
      // 四维正统属性分配 (生、法、力、速)
      attrs: {
        sheng: 10 + shengPts,
        fa: 10 + faPts,
        li: 10 + liPts,
        su: 10 + suPts,
        // 兼容映射
        con: 10 + shengPts,
        str: 10 + liPts,
        int: 10 + faPts,
        dex: 10 + suPts,
        sta: 10 + Math.floor(liPts * 0.5)
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

    const shengVal = pet.attrs.sheng !== undefined ? pet.attrs.sheng : pet.attrs.con;
    const faVal = pet.attrs.fa !== undefined ? pet.attrs.fa : pet.attrs.int;
    const liVal = pet.attrs.li !== undefined ? pet.attrs.li : pet.attrs.str;
    const suVal = pet.attrs.su !== undefined ? pet.attrs.su : pet.attrs.dex;
    const staVal = pet.attrs.sta !== undefined ? pet.attrs.sta : Math.floor(liVal * 0.5);
    const template = window.GAME_DATA.PETS[pet.templateId];
    const aptitudeRatio = key => {
      const range = template?.aptitudes?.[key];
      if (!range || !Number.isFinite(apt?.[key])) return 1;
      return Math.max(0.5, Math.min(1.5, apt[key] / ((range[0] + range[1]) / 2)));
    };

    // 核心数值法则：生-气血值、法-法力值、力-攻击&防御力、速-速度&敏捷
    // 招降后在固定区间内纯随机roll点(普遍在400左右，很难达到450以上)；战中野怪成长偏大且属性相对固定(450左右，攻击60左右)
    const isCombatWild = (pet.isWild === false);
    const wildHpBonus = isCombatWild ? Math.floor(40 + lvl * 2) : 0;
    const wildAtkBonus = isCombatWild ? Math.floor(1 + lvl * 0.3) : 0;

    let maxHp = Math.floor((185 + lvl * 25 + shengVal * 11.5 * g * aptitudeRatio('hp')) * qMult) + wildHpBonus;
    let maxMp = Math.floor((120 + lvl * 15 + faVal * 8 * g) * qMult);
    let atk = Math.floor((18 + lvl * 5 + liVal * 2.1 * g * aptitudeRatio('atk')) * qMult) + wildAtkBonus;
    let def = Math.floor((15 + lvl * 4 + staVal * 1.8 * g * aptitudeRatio('def')) * qMult);
    let matk = Math.floor((15 + lvl * 4 + faVal * 2.0 * g * aptitudeRatio('matk')) * qMult);
    let mdef = Math.floor((12 + lvl * 3 + faVal * 1.5 * g) * qMult);
    let spd = Math.floor((15 + suVal * 1.8 * g * aptitudeRatio('spd')) * qMult);

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

    if (healToFull) {
      pet.hp = pet.maxHp;
      pet.mp = pet.maxMp;
    } else {
      pet.hp = Math.min(pet.hp, pet.maxHp);
      pet.mp = Math.min(pet.mp, pet.maxMp);
    }
  }

  // 散仙 / 金仙一键领悟技能与自动转职
  static learnSkill(pet) {
    if (!pet || !['sanxian', 'jinxian'].includes(pet.quality)) {
      return {
        success: false,
        msg: '普通仙宠只能进行普通物理攻击，散仙与金仙才可接受祖师传法。'
      };
    }

    if (pet.level < 10) {
      return {
        success: false,
        msg: `【${pet.name}】当前 Lv.${pet.level}，散仙与金仙都需达到10级方可受法。`
      };
    }

    if (pet.masterLessonLearned || pet.skills?.length || pet.classId) {
      return { success: false, msg: `【${pet.name}】已受过一次传法，祖师嘱咐：先把这一招练好。` };
    }
    const gender = pet.gender === 'female' ? 'female' : 'male';
    const classes = ['jingang', 'yaomo', 'xianren'];
    const classId = classes[Math.floor(Math.random() * classes.length)];
    const skillPool = window.GAME_DATA.getSkillsForClassAndGender(classId, gender);
    const chosen = { ...skillPool[Math.floor(Math.random() * skillPool.length)], classId,
      className: window.GAME_DATA.CLASSES[classId].name, level: 1, mastery: 0, proficiency: 0 };
    pet.skills = [chosen];
    pet.gender = gender;
    pet.masterLessonLearned = true;

    pet.classId = chosen.classId;
    pet.className = chosen.className;

    // 重新计算属性并激活门派抗性+5%
    this.recalculatePet(pet, false);

    return {
      success: true,
      skill: chosen,
      msg: `✨祖师传法：【${pet.name}】学会${chosen.className}·${chosen.name}，门派抗性+5%。`
    };
  }

  // 获得经验升级
  static gainExp(pet, amount) {
    if (!pet || !Number.isFinite(amount) || amount <= 0) return false;
    pet.exp = (pet.exp || 0) + amount;
    let leveledUp = false;
    while (pet.level < 100) {
      const reqExp = pet.level * pet.level * 50 + pet.level * 40 + 60;
      if (pet.exp < reqExp) break;
      pet.exp -= reqExp;
      pet.level += 1;
      pet.potentialPoints = (pet.potentialPoints || 0) + 5;
      pet.attrs.con += 2;
      pet.attrs.str += 2;
      pet.attrs.int += 1;
      pet.attrs.dex += 1;
      pet.attrs.sta += 1;
      if (pet.attrs.sheng !== undefined) pet.attrs.sheng += 2;
      if (pet.attrs.li !== undefined) pet.attrs.li += 2;
      if (pet.attrs.fa !== undefined) pet.attrs.fa += 1;
      if (pet.attrs.su !== undefined) pet.attrs.su += 1;
      leveledUp = true;
    }
    if (leveledUp) {
      this.recalculatePet(pet, true);
    }
    return leveledUp;
  }

  // 仙宠四维属性自由加点 (生、法、力、速)
  static allocatePetPoints(pet, attrKey, points = 1) {
    if (!pet || !Number.isSafeInteger(points) || points <= 0) return false;
    if (!Number.isSafeInteger(pet.potentialPoints) || pet.potentialPoints < points) return false;
    const map = {
      sheng: 'sheng',
      fa: 'fa',
      li: 'li',
      su: 'su',
      '生': 'sheng',
      '法': 'fa',
      '力': 'li',
      '速': 'su',
      '敏': 'su',
      con: 'sheng',
      int: 'fa',
      str: 'li',
      dex: 'su',
      sta: 'li'
    };
    if (!Object.hasOwn(map, attrKey)) return false;
    const key = map[attrKey];
    if (!pet.attrs) {
      pet.attrs = { sheng: 10, fa: 10, li: 10, su: 10, con: 10, int: 10, str: 10, dex: 10, sta: 10 };
    }
    const legacy = { sheng: 'con', fa: 'int', li: 'str', su: 'dex' };
    if (pet.attrs[key] === undefined) pet.attrs[key] = pet.attrs[legacy[key]] ?? 10;
    const previous = pet.attrs[key];
    pet.attrs[key] += points;

    // 保持传统属性映射同步
    if (key === 'sheng') pet.attrs.con = pet.attrs[key];
    if (key === 'fa') pet.attrs.int = pet.attrs[key];
    if (key === 'li') {
      pet.attrs.str = pet.attrs[key];
      pet.attrs.sta = (pet.attrs.sta ?? 10) + Math.floor(pet.attrs[key] * 0.5) - Math.floor(previous * 0.5);
    }
    if (key === 'su') pet.attrs.dex = pet.attrs[key];

    pet.potentialPoints -= points;
    this.recalculatePet(pet, false);
    return true;
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
      instanceId: pet.instanceId,
      templateId: pet.templateId,
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
    if (!pet || !washResult || washResult.instanceId !== pet.instanceId || washResult.templateId !== pet.templateId) return null;
    pet.level = washResult.level || 1;
    pet.exp = 0;
    pet.isMutated = washResult.isMutated;
    pet.name = washResult.name;
    pet.growth = washResult.growth;
    pet.aptitudes = JSON.parse(JSON.stringify(washResult.aptitudes));
    // 洗炼只重置成长与属性，不退回传法次数、不清除已修成的门派技能。
    pet.potentialPoints = 0;
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

  // =========================================================================
  // 金仙【元神变身】独门法则与十二大变身天赋系统 (Jinxian Primordial Avatar System)
  // 1. 每回合初几率判定，固定持续 3 回合
  // 2. 血量越低几率越高：P = P_base(TalentPoints) + 0.1 * (已损失生命百分比)
  // 3. 天赋点 0~5000，每次变身 +1，使用【天赋丹】+50
  // =========================================================================

  static JINXIAN_AVATAR_TALENTS = {
    // 1. 白龙马
    bailong_ma: {
      id: 'avatar_bailong',
      name: '八部天龙',
      desc: '变身后法术攻击有概率(25%~45%)触发法术连击。',
      type: 'spell_combo',
      getDoubleCastRate(talentPoints) {
        const p = Math.max(0, Math.min(5000, talentPoints || 0));
        return Number((0.25 + (p / 5000) * 0.20).toFixed(3)); // 25% ~ 45%
      },
      getEffects(talentPoints) {
        const p = Math.max(0, Math.min(5000, talentPoints || 0));
        return { spdBonus: 0, doubleCastRate: Number((0.25 + (p / 5000) * 0.20).toFixed(3)) };
      }
    },
    // 2. 白骨精
    baigu_jing: {
      id: 'avatar_baigu',
      name: '白骨夫人',
      desc: '变身后受到直接伤害时，将一定比例伤害(15%~30%)随机转移给场上一名其他单位。',
      type: 'damage_transfer',
      getTransferRatio(talentPoints) {
        const p = Math.max(0, Math.min(5000, talentPoints || 0));
        return Number((0.15 + (p / 5000) * 0.15).toFixed(3)); // 15% ~ 30%
      }
    },
    // 3. 猪八戒
    zhu_bajie: {
      id: 'avatar_bajie',
      name: '天蓬元帅',
      desc: '变身瞬间气血上限与当前血量暴增(+500~2000 HP 及 +25%~40% 最大气血)。',
      type: 'hp_boost',
      getHpBoost(talentPoints, maxHp) {
        const p = Math.max(0, Math.min(5000, talentPoints || 0));
        const flatHp = Math.floor(500 + (p / 5000) * 1500); // 500 ~ 2000
        const percentRatio = Number((0.25 + (p / 5000) * 0.15).toFixed(3)); // 25% ~ 40%
        const totalBonus = flatHp + Math.floor((maxHp || 1000) * percentRatio);
        return { flatHp, percentRatio, totalBonus };
      }
    },
    // 4. 红孩儿
    honghai_er: {
      id: 'avatar_honghaier',
      name: '圣婴大王',
      desc: '变身后三昧真火技能伤害提升(+35%~50%)。',
      type: 'fire_boost',
      getFireBoost(talentPoints) {
        const p = Math.max(0, Math.min(5000, talentPoints || 0));
        return Number((0.35 + (p / 5000) * 0.15).toFixed(3)); // 35% ~ 50%
      }
    },
    // 5. 铁扇公主
    tieshan_gongzhu: {
      id: 'avatar_tieshan',
      name: '罗刹女',
      desc: '变身后飞沙走石与三昧真火技能伤害提升(+30%~45%)。',
      type: 'wind_fire_boost',
      getWindFireBoost(talentPoints) {
        const p = Math.max(0, Math.min(5000, talentPoints || 0));
        return Number((0.30 + (p / 5000) * 0.15).toFixed(3)); // 30% ~ 45%
      }
    },
    // 6. 牛魔王
    niumowang: {
      id: 'avatar_niumo',
      name: '平天大圣',
      desc: '变身后增加气血(+30%)，物理攻击力狂暴暴增(+30%~50%，仅普攻生效)。',
      type: 'atk_boost',
      getBoosts(talentPoints, maxHp, baseAtk) {
        const p = Math.max(0, Math.min(5000, talentPoints || 0));
        const flatHp = Math.floor(400 + (p / 5000) * 800);
        const hpPercent = Number((0.20 + (p / 5000) * 0.10).toFixed(3)); // 20% ~ 30%
        const atkPercent = Number((0.30 + (p / 5000) * 0.20).toFixed(3)); // 30% ~ 50%
        return { flatHp, hpPercent, atkPercent };
      }
    },
    // 7. 沙僧
    sha_seng: {
      id: 'avatar_shaseng',
      name: '卷帘大将',
      desc: '变身后受到的直接伤害，30%~50%直接由法力值(MP)等额扣除抵免。',
      type: 'mp_absorb',
      getMpAbsorbRatio(talentPoints) {
        const p = Math.max(0, Math.min(5000, talentPoints || 0));
        return Number((0.30 + (p / 5000) * 0.20).toFixed(3)); // 30% ~ 50%
      }
    },
    // 8. 黄风怪
    huangfeng_guai: {
      id: 'avatar_huangfeng',
      name: '黄鼠原身',
      desc: '变身后增加法力上限(+35%)以及出手速度(+25%)。',
      type: 'mp_spd_boost',
      getBoosts(talentPoints, maxMp, baseSpd) {
        const p = Math.max(0, Math.min(5000, talentPoints || 0));
        const mpBonus = Math.floor((maxMp || 400) * (0.25 + (p / 5000) * 0.10));
        const spdBonus = Math.floor((baseSpd || 50) * (0.20 + (p / 5000) * 0.05));
        return { mpBonus, spdBonus };
      }
    },
    // 9. 黄袍怪
    huangpao_guai: {
      id: 'avatar_huangpao',
      name: '奎木狼星君',
      desc: '伤害会使敌方额外少量流血两回合，每回合流失受创者最大生命4%~6%，可叠加。',
      type: 'bleed_dot',
      getBleedRatio(talentPoints) {
        const p = Math.max(0, Math.min(5000, talentPoints || 0));
        return Number((0.04 + (p / 5000) * 0.02).toFixed(3)); // 4% ~ 6%
      }
    },
    // 10. 黑熊精
    heixiong_guai: {
      id: 'avatar_heixiong',
      name: '黑熊原身',
      desc: '变身后增加速度(+25%)以及物理攻击力(+30%)。',
      type: 'spd_atk_boost',
      getBoosts(talentPoints, baseSpd, baseAtk) {
        const p = Math.max(0, Math.min(5000, talentPoints || 0));
        const spdBonus = Math.floor((baseSpd || 50) * (0.20 + (p / 5000) * 0.05));
        const atkBonus = Math.floor((baseAtk || 90) * (0.25 + (p / 5000) * 0.05));
        return { spdBonus, atkBonus };
      }
    },
    // 11. 哪吒
    nezha: {
      id: 'avatar_nezha',
      name: '三头六臂',
      desc: '变身后攻击有30%~40%概率眩晕定身目标1回合。',
      type: 'stun_strike',
      getStunRate(talentPoints) {
        const p = Math.max(0, Math.min(5000, talentPoints || 0));
        return Number((0.30 + (p / 5000) * 0.10).toFixed(3)); // 30% ~ 40%
      }
    },
    // 12. 黄眉大王
    huangmei_dawang: {
      id: 'avatar_huangmei',
      name: '黄眉老祖',
      desc: '对目标造成伤害后会使下回合该目标造成的伤害降低20%；如果速度比该目标快，则当回合立即生效。',
      type: 'weaken_strike',
      getWeakenRatio(talentPoints) {
        return 0.20;
      }
    },
    // 13. 李靖（托塔天王）
    lijing: {
      id: 'avatar_lijing',
      name: '托塔天王',
      desc: '变身后提升神仙职业技能命中概率(+20%~35%)。',
      type: 'xianren_hit_boost',
      getHitBoost(talentPoints) {
        const p = Math.max(0, Math.min(5000, talentPoints || 0));
        return Number((0.20 + (p / 5000) * 0.15).toFixed(3)); // 20% ~ 35%
      }
    },
    // 14. 蝎子精
    xiezi_jing: {
      id: 'avatar_xiezi',
      name: '琵琶妖仙',
      desc: '变身后提升万毒攻心伤害(+40%~60%)。',
      type: 'poison_boost',
      getPoisonBoost(talentPoints) {
        const p = Math.max(0, Math.min(5000, talentPoints || 0));
        return Number((0.40 + (p / 5000) * 0.20).toFixed(3)); // 40% ~ 60%
      }
    },
    // 15. 九头虫
    jiutou_chong: {
      id: 'avatar_jiutouchong',
      name: '九头蛇原身',
      desc: '变身期间内死亡后直接复活并回复少量气血(25%~35%)，每战限一次。',
      type: 'reborn',
      getRebornRatio(talentPoints) {
        const p = Math.max(0, Math.min(5000, talentPoints || 0));
        return Number((0.25 + (p / 5000) * 0.10).toFixed(3)); // 25% ~ 35%
      }
    }
  };

  /**
   * 计算金仙变身几率 (血量越低变身几率越高)
   */
  static calculateTransformRate(pet) {
    if (!pet || pet.quality !== 'jinxian') return 0;
    const points = Math.max(0, Math.min(5000, pet.talentPoints || 0));
    // 基础变身几率 5% ~ 25%
    const baseRate = 0.05 + (points / 5000) * 0.20;
    // 逆境加成：0.1 * 已损失生命值百分比
    const curHp = pet.hp !== undefined ? pet.hp : (pet.maxHp || 100);
    const maxHp = pet.maxHp || 100;
    const lostHpRatio = Math.max(0, Math.min(1, 1 - (curHp / maxHp)));
    const adversityBonus = 0.10 * lostHpRatio;
    return Number((baseRate + adversityBonus).toFixed(4));
  }

  /**
   * 尝试在回合初触发金仙元神变身
   */
  static tryTriggerAvatarTransform(pet, force = null) {
    if (!pet || pet.quality !== 'jinxian') return { triggered: false, reason: 'not_jinxian' };

    // 如果当前正在变身状态中，持续回合维系
    if (pet.avatarRoundsLeft > 0) {
      return { triggered: true, roundsLeft: pet.avatarRoundsLeft, isNew: false };
    }

    const rate = this.calculateTransformRate(pet);
    const isSuccess = force !== null ? force : (Math.random() < rate);

    if (isSuccess) {
      pet.avatarTransformed = true;
      pet.avatarRoundsLeft = 3; // 固定变身时长 3 回合
      // 变身成功永久增加 1 点天赋点 (上限 5000)
      pet.talentPoints = Math.min(5000, (pet.talentPoints || 0) + 1);

      const talent = this.getPetAvatarTalent(pet);
      return {
        triggered: true,
        isNew: true,
        roundsLeft: 3,
        rate,
        talentPoints: pet.talentPoints,
        talent,
        text: `✨【真灵觉醒】金仙【${pet.name}】激发元神变身，法相真身降临！加持专属天赋【${talent ? talent.name : '至尊元神'}】，持续 3 回合！(天赋点 +1 -> ${pet.talentPoints})`
      };
    }

    return { triggered: false, rate, isNew: false };
  }

  /**
   * 回合结束时变身回合数递减
   */
  static tickAvatarRound(pet) {
    if (!pet || !pet.avatarTransformed) return { expired: false, roundsLeft: 0 };
    pet.avatarRoundsLeft = Math.max(0, (pet.avatarRoundsLeft || 0) - 1);
    if (pet.avatarRoundsLeft <= 0) {
      pet.avatarTransformed = false;
      return { expired: true, text: `【元神归位】金仙【${pet.name}】真灵收敛回归本相，变身状态解除。` };
    }
    return { expired: false, roundsLeft: pet.avatarRoundsLeft };
  }

  /**
   * 使用稀世宝物【天赋丹】
   */
  static useTalentPill(pet) {
    if (!pet || pet.quality !== 'jinxian') {
      return { success: false, msg: '只有【金仙】品阶仙宠方可使用【天赋丹】淬炼元神！' };
    }
    const oldPoints = pet.talentPoints || 0;
    if (oldPoints >= 5000) {
      return { success: false, msg: `【${pet.name}】的元神天赋点已达 5000 极境巅峰，无需再服用天赋丹！` };
    }
    const newPoints = Math.min(5000, oldPoints + 50);
    pet.talentPoints = newPoints;
    return {
      success: true,
      added: newPoints - oldPoints,
      currentPoints: newPoints,
      msg: `🔮【天赋灌顶】成功喂食【天赋丹】！金仙【${pet.name}】元神天赋点永久增加 50 点（当前: ${newPoints}/5000），变身几率与天赋神威大幅提升！`
    };
  }

  /**
   * 变身天赋物种别名：方向为「物种库ID → 策划天赋表键」。
   * 策划表沿用西游本名（niumo_wang），物种库使用统一ID（niumowang），
   * 未建立别名会让整条天赋永久失效（曾导致牛魔王狂暴、黑熊精反震形同虚设）。
   */
  static AVATAR_TALENT_ALIAS = {
    niumo_wang: 'niumowang',
    xiaobai_long: 'bailong_ma',
    jinjiao_dawang: 'huangmei_dawang',
    yinjiao_dawang: 'sha_seng'
  };

  /**
   * 获取该仙宠的天赋配置
   */
  static getPetAvatarTalent(pet) {
    if (!pet) return null;
    const tid = pet.templateId;
    const alias = this.AVATAR_TALENT_ALIAS[tid];
    return this.JINXIAN_AVATAR_TALENTS[tid] || (alias ? this.JINXIAN_AVATAR_TALENTS[alias] : null) || {
      id: 'avatar_generic',
      name: '金仙法相',
      desc: '变身后全属性提升 15%，受到伤害减免 10%。'
    };
  }
}

window.PetSystem = PetSystem;
