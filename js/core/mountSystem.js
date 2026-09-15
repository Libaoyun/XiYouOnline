/**
 * 汉风西游 - 御马监坐骑系统 (MountSystem)
 * 还原正统汉风西游OL特色：
 * 1. 御马监弼马温处领取初始坐骑 (天界龙马/踏火神驹/逐日青骢)
 * 2. 坐骑等级与训练系统 (消耗银两训练升级，大幅增加角色气血生命值与物理/法术攻击力)
 * 3. 坐骑骑乘状态与外观光环 (大幅增加地图移动速度)
 */

class MountSystem {
  constructor(initData = null) {
    // 坐骑基础配置
    this.mounts = initData?.mounts || [];
    this.activeMountId = initData?.activeMountId || null;
    this.isRiding = initData?.isRiding || false; // 是否处于骑乘状态
  }

  // 获取当前出战/骑乘的坐骑
  getActiveMount() {
    return this.mounts.find(m => m.id === this.activeMountId) || null;
  }

  // 获得新坐骑
  addMount(templateId, customName = null) {
    const tpl = MountSystem.TEMPLATES[templateId];
    if (!tpl) return null;

    const mount = {
      id: 'mount_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      templateId: templateId,
      name: customName || tpl.name,
      icon: tpl.icon,
      tier: tpl.tier, // 阶位
      level: 1,
      exp: 0,
      maxLevel: 50,
      // 基础属性
      baseHp: tpl.baseHp,
      baseAtk: tpl.baseAtk,
      speedBonus: tpl.speedBonus || 0.35, // 移动速度加成 35%
      // 当前提供的属性
      currentHp: tpl.baseHp,
      currentAtk: tpl.baseAtk
    };

    this.mounts.push(mount);
    if (!this.activeMountId) {
      this.activeMountId = mount.id;
      this.isRiding = true;
    }

    return mount;
  }

  // 训练坐骑 (消耗银两升级)
  trainMount(mountId, player, trainTimes = 1) {
    const mount = this.mounts.find(m => m.id === mountId);
    if (!mount) return { success: false, msg: '未找到指定坐骑！' };

    if (mount.level >= mount.maxLevel) {
      return { success: false, msg: '该坐骑已达当前最高等级，灵力已臻圆满！' };
    }

    const costPerTrain = 500 + mount.level * 150;
    const totalCost = costPerTrain * trainTimes;

    if (player.silver < totalCost) {
      return { success: false, msg: `银两不足！训练需要 ${totalCost} 两银子。` };
    }

    // 扣减银两
    player.silver -= totalCost;

    // 提升等级
    let levelUps = 0;
    for (let i = 0; i < trainTimes; i++) {
      if (mount.level < mount.maxLevel) {
        mount.level += 1;
        levelUps += 1;
      }
    }

    // 重新结算坐骑带来的生命与攻击加成
    mount.currentHp = Math.floor(mount.baseHp + mount.level * 45);
    mount.currentAtk = Math.floor(mount.baseAtk + mount.level * 8);

    player.recalculateStats(false);
    window.Sound.playSuccess();

    return {
      success: true,
      level: mount.level,
      msg: `【御马驯化】消耗 ${totalCost} 两银两，【${mount.name}】等级提升至 Lv.${mount.level}！气血加成 +${mount.currentHp}，攻击加成 +${mount.currentAtk}！`
    };
  }

  // 切换骑乘/步行
  toggleRiding() {
    const cur = this.getActiveMount();
    if (!cur) return false;
    this.isRiding = !this.isRiding;
    window.Sound.playBeep();
    return this.isRiding;
  }

  // 获取坐骑赋予角色的属性增益
  getStatsBonus() {
    const active = this.getActiveMount();
    if (!active) return { hp: 0, atk: 0, speedBonus: 0 };
    return {
      hp: active.currentHp,
      atk: active.currentAtk,
      speedBonus: this.isRiding ? active.speedBonus : 0
    };
  }
}

// 经典西游坐骑图鉴
MountSystem.TEMPLATES = {
  xuelong_ma: {
    id: 'xuelong_ma',
    name: '天界雪龙马',
    tier: '灵品龙驹',
    icon: '🐎',
    desc: '产自天庭御马监的通灵神驹，身披雪白龙鳞，脚踏流云，不仅迅捷无比，更能护主御敌。',
    baseHp: 300,
    baseAtk: 40,
    speedBonus: 0.35
  },
  tahuo_ju: {
    id: 'tahuo_ju',
    name: '踏火赤焰兽',
    tier: '狂品异兽',
    icon: '🦁',
    desc: '四蹄生烈焰的洪荒奇兽，性格狂烈暴虐，大幅增强乘骑者的杀伐攻伐之威。',
    baseHp: 220,
    baseAtk: 65,
    speedBonus: 0.38
  },
  zhuri_cong: {
    id: 'zhuri_cong',
    name: '避水金睛金骢',
    tier: '厚土神驹',
    icon: '🦄',
    desc: '传说中拥有麒麟血脉的金骢宝马，鬃毛金黄，生机浩荡，具有强大的护元增血之效。',
    baseHp: 480,
    baseAtk: 30,
    speedBonus: 0.32
  },
  qitian_shenlong: {
    id: 'qitian_shenlong',
    name: '九天翱翔五爪金龙',
    tier: '上古神龙',
    icon: '🐉',
    desc: '【三界至尊神骑】龙啸九天，万妖臣服！赋予乘骑者排山倒海般的神力和无尽生机！',
    baseHp: 1200,
    baseAtk: 180,
    speedBonus: 0.50
  }
};

window.MountSystem = MountSystem;
