/**
 * 汉风西游 - 玩家角色核心系统
 * 属性五维加点、门派技能加载、装备属性动态结算与升级
 */
import { CLASSES } from '../data/classes.js';
import { ITEMS } from '../data/items.js';

export class Player {
  constructor(initData = {}, mountSystem = null) {
    this.name = initData.name || '威灵显赫大将';
    this.classId = initData.classId || 'jingang'; // jingang | xianren | yaomo
    this.gender = initData.gender || 'male'; // male | female
    this.level = initData.level || 1;
    this.exp = initData.exp || 0;
    this.silver = initData.silver !== undefined ? initData.silver : 500;
    this.ingots = initData.ingots !== undefined ? initData.ingots : 50; // 仙玉
    this.mountSystem = mountSystem;

    // 五维自由潜能加点 (每升1级获得5点自由潜能)
    this.potentialPoints = initData.potentialPoints || 0;
    this.attributes = initData.attributes || {
      con: 10, // 体质 (气血)
      str: 10, // 力量 (物理伤害)
      int: 10, // 法力 (精力、法伤、法抗)
      dex: 10, // 敏捷 (速度)
      sta: 10  // 耐力 (防御)
    };

    // 装备栏六大部位
    this.equipment = initData.equipment || {
      weapon: null,
      head: null,
      armor: null,
      belt: null,
      boots: null,
      necklace: null
    };

    // 状态
    this.hp = 0;
    this.mp = 0;
    this.maxHp = 0;
    this.maxMp = 0;
    this.atk = 0;
    this.def = 0;
    this.matk = 0;
    this.mdef = 0;
    this.spd = 0;

    this.recalculateStats(true);
  }

  setMountSystem(mountSystem) {
    this.mountSystem = mountSystem;
    this.recalculateStats(false);
  }

  // 升级所需经验公式：level^2 * 120 + level * 80
  getNextLevelExp() {
    return Math.floor(this.level * this.level * 120 + this.level * 80);
  }

  // 获得经验与升级判定
  gainExp(amount) {
    this.exp += amount;
    const levelUpEvents = [];
    while (this.exp >= this.getNextLevelExp()) {
      this.exp -= this.getNextLevelExp();
      this.level += 1;
      this.potentialPoints += 5;
      // 门派基础五维成长自动各+1
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

  // 重新计算战斗总属性
  recalculateStats(healToFull = false) {
    const classData = CLASSES[this.classId] || CLASSES.jingang;
    const w = classData.attrWeights;

    // 基础裸装属性计算公式
    let baseMaxHp = Math.floor(100 + this.level * 30 + this.attributes.con * w.hp + this.attributes.sta * 2);
    let baseMaxMp = Math.floor(80 + this.level * 15 + this.attributes.int * w.mp);
    let baseAtk = Math.floor(25 + this.level * 8 + this.attributes.str * w.atk);
    let baseDef = Math.floor(20 + this.level * 6 + this.attributes.sta * w.def + this.attributes.con * 0.3);
    let baseMatk = Math.floor(20 + this.level * 7 + this.attributes.int * w.matk);
    let baseMdef = Math.floor(15 + this.level * 5 + this.attributes.int * 1.2 + this.attributes.sta * 0.8);
    let baseSpd = Math.floor(10 + this.level * 2 + this.attributes.dex * w.spd);

    // 叠加穿戴装备的属性
    Object.values(this.equipment).forEach(equip => {
      if (!equip) return;
      const baseItem = ITEMS[equip.itemId];
      if (!baseItem || !baseItem.attrs) return;

      const star = equip.star || 0;
      const starMult = 1 + star * 0.12; // 每强化1星增幅 12% 基础属性

      if (baseItem.attrs.atk) baseAtk += Math.floor(baseItem.attrs.atk * starMult);
      if (baseItem.attrs.def) baseDef += Math.floor(baseItem.attrs.def * starMult);
      if (baseItem.attrs.matk) baseMatk += Math.floor(baseItem.attrs.matk * starMult);
      if (baseItem.attrs.mdef) baseMdef += Math.floor(baseItem.attrs.mdef * starMult);
      if (baseItem.attrs.hp) baseMaxHp += Math.floor(baseItem.attrs.hp * starMult);
      if (baseItem.attrs.mp) baseMaxMp += Math.floor(baseItem.attrs.mp * starMult);
      if (baseItem.attrs.spd) baseSpd += Math.floor(baseItem.attrs.spd * starMult);
    });

    // 叠加坐骑属性增益 (生命上限与攻击力)
    if (this.mountSystem) {
      const mountBonus = this.mountSystem.getStatsBonus();
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

    if (healToFull) {
      this.hp = this.maxHp;
      this.mp = this.maxMp;
    } else {
      this.hp = Math.min(this.hp, this.maxHp);
      this.mp = Math.min(this.mp, this.maxMp);
    }
  }

  // 获取当前职业拥有的技能列表
  getSkills() {
    const classData = CLASSES[this.classId] || CLASSES.jingang;
    if (!classData || !classData.skills) return [];
    const skillList = classData.skills[this.gender] || classData.skills.male;
    return skillList.filter(s => this.level >= s.levelReq);
  }

  // 加点
  allocatePoints(attrName, points = 1) {
    if (this.potentialPoints < points || points <= 0) return false;
    if (!this.attributes[attrName] && this.attributes[attrName] !== 0) return false;
    this.attributes[attrName] += points;
    this.potentialPoints -= points;
    this.recalculateStats(false);
    return true;
  }

  // 穿装备
  equipItem(slot, equipInstance) {
    const oldEquip = this.equipment[slot];
    this.equipment[slot] = equipInstance;
    this.recalculateStats(false);
    return oldEquip;
  }

  // 脱下装备
  unequipItem(slot) {
    const oldEquip = this.equipment[slot];
    this.equipment[slot] = null;
    this.recalculateStats(false);
    return oldEquip;
  }
}
