/**
 * 汉风西游 - 玩家角色核心系统 (Player 2.0)
 * 属性五维加点、门派技能加载、装备3孔宝石属性/抗性结算、职业技能抗性专精、仙宠出战上限控制
 */
class Player {
  constructor(initData = {}) {
    this.name = initData.name || '逍遥生';
    this.classId = initData.classId || 'jingang'; // jingang | yaomo | xianren
    this.gender = initData.gender || 'male';
    this.level = initData.level || 1;
    this.exp = initData.exp || 0;
    this.silver = initData.silver !== undefined ? initData.silver : 500;
    this.ingots = initData.ingots !== undefined ? initData.ingots : 50; // 仙玉
    this.bankSilver = initData.bankSilver || 0; // 钱庄存款
    this.homeResidence = initData.homeResidence || null; // 定居地（如 'changan_city'）

    // 五维自由潜能加点
    this.potentialPoints = initData.potentialPoints || 0;
    this.attributes = initData.attributes || {
      con: 10,
      str: 10,
      int: 10,
      dex: 10,
      sta: 10
    };

    // 装备栏六大部位 (每个部位装备支持 3 个宝石孔)
    this.equipment = initData.equipment || {
      weapon: null,
      head: null,
      armor: null,
      belt: null,
      boots: null,
      necklace: null
    };

    // 基础属性
    this.hp = 0;
    this.mp = 0;
    this.maxHp = 0;
    this.maxMp = 0;
    this.atk = 0;
    this.def = 0;
    this.matk = 0;
    this.mdef = 0;
    this.spd = 0;

    // 完备抗性字典
    this.resistances = {
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

    // 核心战斗法则四维进阶率
    this.critRate = initData.critRate || 0.08; // 暴击率 1.5倍伤害
    this.comboRate = initData.comboRate || 0.05; // 连击率 连续追击1~3次，每次伤害减半
    this.fatalRate = initData.fatalRate || 0.02; // 致命一击率 按生命上限真伤无视防御抗性
    this.dodgeRate = initData.dodgeRate || 0.05; // 闪避率 完全规避伤害并打断连击

    this.recalculateStats(true);
  }

  // 仙宠最大可出战数量 (20、30、40级分别解锁 1、2、3)
  getMaxCombatPets() {
    if (this.level >= 40) return 3;
    if (this.level >= 30) return 2;
    if (this.level >= 20) return 1;
    return 0;
  }

  getNextLevelExp() {
    return Math.floor(this.level * this.level * 120 + this.level * 80);
  }

  gainExp(amount) {
    this.exp += amount;
    const levelUpEvents = [];
    while (this.exp >= this.getNextLevelExp()) {
      this.exp -= this.getNextLevelExp();
      this.level += 1;
      this.potentialPoints += 5;
      this.attributes.con += 1;
      this.attributes.str += 1;
      this.attributes.int += 1;
      this.attributes.dex += 1;
      this.attributes.sta += 1;
      levelUpEvents.push(this.level);
    }
    this.recalculateStats(levelUpEvents.length > 0);
    return levelUpEvents;
  }

  // 重新计算总属性与抗性
  recalculateStats(healToFull = false) {
    const classData = window.GAME_DATA.CLASSES[this.classId];
    const w = (classData && classData.attrWeights) || { hp: 14, atk: 2.0, def: 2.0, spd: 1.0, mp: 8, matk: 1.0 };

    let baseMaxHp = Math.floor(120 + this.level * 32 + this.attributes.con * w.hp + this.attributes.sta * 2);
    let baseMaxMp = Math.floor(90 + this.level * 16 + this.attributes.int * w.mp);
    let baseAtk = Math.floor(28 + this.level * 8 + this.attributes.str * w.atk);
    let baseDef = Math.floor(22 + this.level * 6 + this.attributes.sta * w.def + this.attributes.con * 0.3);
    let baseMatk = Math.floor(22 + this.level * 7 + this.attributes.int * w.matk);
    let baseMdef = Math.floor(16 + this.level * 5 + this.attributes.int * 1.2 + this.attributes.sta * 0.8);
    let baseSpd = Math.floor(12 + this.level * 2 + this.attributes.dex * w.spd);

    // 重置抗性字典为 0
    this.resistances = {
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

    // 门派专精抗性：拥有门派后对本门派技能抗性 +5% (0.05)
    if (this.classId === 'jingang') {
      this.resistances.res_shesheng += 0.05;
      this.resistances.res_foguang += 0.05;
      this.resistances.res_phy += 0.05;
    } else if (this.classId === 'yaomo') {
      this.resistances.res_leiting += 0.05;
      this.resistances.res_feisha += 0.05;
      this.resistances.res_sanmei += 0.05;
    } else if (this.classId === 'xianren') {
      this.resistances.res_fengyin += 0.05;
      this.resistances.res_dingshen += 0.05;
      this.resistances.res_yinshen += 0.05;
    }

    let baseCritRate = 0.08;
    let baseComboRate = 0.05;
    let baseFatalRate = 0.02;
    let baseDodgeRate = 0.05;

    // 叠加穿戴装备的属性与镶嵌宝石孔属性/抗性
    Object.values(this.equipment).forEach(equip => {
      if (!equip) return;
      const baseItem = window.GAME_DATA.ITEMS[equip.itemId];
      if (!baseItem) return;

      const star = equip.star || 0;
      const starMult = 1 + star * 0.12;

      if (baseItem.attrs) {
        if (baseItem.attrs.atk) baseAtk += Math.floor(baseItem.attrs.atk * starMult);
        if (baseItem.attrs.def) baseDef += Math.floor(baseItem.attrs.def * starMult);
        if (baseItem.attrs.matk) baseMatk += Math.floor(baseItem.attrs.matk * starMult);
        if (baseItem.attrs.mdef) baseMdef += Math.floor(baseItem.attrs.mdef * starMult);
        if (baseItem.attrs.hp) baseMaxHp += Math.floor(baseItem.attrs.hp * starMult);
        if (baseItem.attrs.mp) baseMaxMp += Math.floor(baseItem.attrs.mp * starMult);
        if (baseItem.attrs.spd) baseSpd += Math.floor(baseItem.attrs.spd * starMult);
        if (baseItem.attrs.critRate) baseCritRate += baseItem.attrs.critRate * starMult;
        if (baseItem.attrs.comboRate) baseComboRate += baseItem.attrs.comboRate * starMult;
        if (baseItem.attrs.fatalRate) baseFatalRate += baseItem.attrs.fatalRate * starMult;
        if (baseItem.attrs.dodgeRate) baseDodgeRate += baseItem.attrs.dodgeRate * starMult;
      }

      // 遍历装备镶嵌的宝石 (最多3孔)
      if (equip.sockets && Array.isArray(equip.sockets)) {
        equip.sockets.forEach(gemId => {
          if (!gemId) return;
          const gemItem = window.GAME_DATA.ITEMS[gemId];
          if (!gemItem || !gemItem.bonus) return;

          // 属性加成
          if (gemItem.bonus.atk) baseAtk += gemItem.bonus.atk;
          if (gemItem.bonus.def) baseDef += gemItem.bonus.def;
          if (gemItem.bonus.hp) baseMaxHp += gemItem.bonus.hp;
          if (gemItem.bonus.spd) baseSpd += gemItem.bonus.spd;
          if (gemItem.bonus.critRate) baseCritRate += gemItem.bonus.critRate;
          if (gemItem.bonus.comboRate) baseComboRate += gemItem.bonus.comboRate;
          if (gemItem.bonus.fatalRate) baseFatalRate += gemItem.bonus.fatalRate;
          if (gemItem.bonus.dodgeRate) baseDodgeRate += gemItem.bonus.dodgeRate;

          // 抗性加成
          if (gemItem.bonus.res_phy) this.resistances.res_phy += gemItem.bonus.res_phy;
          if (gemItem.bonus.res_shesheng) this.resistances.res_shesheng += gemItem.bonus.res_shesheng;
          if (gemItem.bonus.res_leiting) this.resistances.res_leiting += gemItem.bonus.res_leiting;
          if (gemItem.bonus.res_feisha) this.resistances.res_feisha += gemItem.bonus.res_feisha;
          if (gemItem.bonus.res_fengyin) this.resistances.res_fengyin += gemItem.bonus.res_fengyin;
          if (gemItem.bonus.res_dingshen) this.resistances.res_dingshen += gemItem.bonus.res_dingshen;
        });
      }
    });

    // 叠加坐骑增益
    if (window.App2D && window.App2D.mountSystem) {
      const mountBonus = window.App2D.mountSystem.getStatsBonus();
      baseMaxHp += mountBonus.hp;
      baseAtk += mountBonus.atk;
    }

    this.maxHp = baseMaxHp;
    this.maxMp = baseMaxMp;
    this.atk = baseAtk;
    this.def = baseDef;
    this.matk = baseMatk;
    this.mdef = baseMdef;
    this.spd = baseSpd;

    this.critRate = Math.min(0.85, Number(baseCritRate.toFixed(3)));
    this.comboRate = Math.min(0.75, Number(baseComboRate.toFixed(3)));
    this.fatalRate = Math.min(0.50, Number(baseFatalRate.toFixed(3)));
    this.dodgeRate = Math.min(0.70, Number(baseDodgeRate.toFixed(3)));

    if (healToFull) {
      this.hp = this.maxHp;
      this.mp = this.maxMp;
    } else {
      this.hp = Math.min(this.hp, this.maxHp);
      this.mp = Math.min(this.mp, this.maxMp);
    }
  }

  // 穿戴装备
  equipItem(slot, equipData) {
    const oldEquip = this.equipment[slot];
    // 保证至少有 sockets 数组与 instanceId
    const newEquip = {
      instanceId: equipData.instanceId || ('worn_' + slot),
      itemId: equipData.itemId,
      star: equipData.star || 0,
      sockets: equipData.sockets || [null, null, null]
    };
    this.equipment[slot] = newEquip;
    this.recalculateStats(false);
    return oldEquip;
  }

  // 卸下装备
  unequipItem(slot) {
    const oldEquip = this.equipment[slot];
    if (!oldEquip) return null;
    this.equipment[slot] = null;
    this.recalculateStats(false);
    return oldEquip;
  }

  getSkills() {
    const classData = window.GAME_DATA.CLASSES[this.classId];
    if (!classData || !classData.skills) return [];
    const skillList = Array.isArray(classData.skills) ? classData.skills : (classData.skills[this.gender] || classData.skills.male || []);
    return skillList.filter(s => this.level >= (s.levelReq || 1));
  }

  switchClass(classId) {
    if (!window.GAME_DATA.CLASSES[classId]) return { success: false, msg: '无效门派！' };
    this.classId = classId;
    this.recalculateStats(false);
    const cData = window.GAME_DATA.CLASSES[classId];
    return {
      success: true,
      className: cData.name,
      title: cData.title
    };
  }

  allocatePoints(attrName, points = 1) {
    if (this.potentialPoints < points || points <= 0) return false;
    if (this.attributes[attrName] === undefined) return false;
    this.attributes[attrName] += points;
    this.potentialPoints -= points;
    this.recalculateStats(false);
    return true;
  }
}

window.Player = Player;
