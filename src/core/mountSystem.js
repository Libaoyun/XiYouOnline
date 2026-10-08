/**
 * 汉风西游 - 御马监坐骑系统 (MountSystem)
 */
class MountSystem {
  constructor(initData = null) {
    this.mounts = initData?.mounts || [];
    this.activeMountId = initData?.activeMountId || null;
    this.isRiding = initData?.isRiding || false;
  }

  getActiveMount() {
    return this.mounts.find(m => m.id === this.activeMountId) || null;
  }

  addMount(templateId, customName = null) {
    const tpl = MountSystem.TEMPLATES[templateId];
    if (!tpl) return null;

    const mount = {
      id: 'mount_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      templateId: templateId,
      name: customName || tpl.name,
      icon: tpl.icon,
      tier: tpl.tier,
      level: 1,
      exp: 0,
      maxLevel: 50,
      baseHp: tpl.baseHp,
      baseAtk: tpl.baseAtk,
      speedBonus: tpl.speedBonus || 0.35,
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

  trainMount(mountId, player, trainTimes = 1) {
    const mount = this.mounts.find(m => m.id === mountId);
    if (!mount) return { success: false, msg: '未找到指定坐骑！' };

    if (mount.level >= mount.maxLevel) {
      return { success: false, msg: '该坐骑已达当前最高等级！' };
    }

    const costPerTrain = 500 + mount.level * 150;
    const totalCost = costPerTrain * trainTimes;

    if (player.silver < totalCost) {
      return { success: false, msg: `银两不足！训练需要 ${totalCost} 两银子。` };
    }

    player.silver -= totalCost;

    for (let i = 0; i < trainTimes; i++) {
      if (mount.level < mount.maxLevel) {
        mount.level += 1;
      }
    }

    mount.currentHp = Math.floor(mount.baseHp + mount.level * 45);
    mount.currentAtk = Math.floor(mount.baseAtk + mount.level * 8);

    player.recalculateStats(false);
    return {
      success: true,
      level: mount.level,
      msg: `【御马驯化】消耗 ${totalCost} 银两，【${mount.name}】升至 Lv.${mount.level}！气血加成 +${mount.currentHp}，攻击加成 +${mount.currentAtk}！`
    };
  }

  toggleRiding() {
    const cur = this.getActiveMount();
    if (!cur) return false;
    this.isRiding = !this.isRiding;
    return this.isRiding;
  }

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

MountSystem.TEMPLATES = {
  long_ma: {
    id: 'long_ma',
    name: '天界龙马',
    tier: '金刚专属',
    reqClass: 'jingang',
    reqClassName: '金刚',
    icon: '🐎',
    desc: '通灵龙马，雪白龙鳞，坚如金刚，金刚门派专属神驹。',
    baseHp: 380,
    baseAtk: 40,
    speedBonus: 0.60
  },
  feijian: {
    id: 'feijian',
    name: '青云飞剑',
    tier: '神仙专属',
    reqClass: 'xianren',
    reqClassName: '神仙',
    icon: '🗡️',
    desc: '通天飞剑，御剑凌虚，出尘飘逸，神仙门派专属坐骑。',
    baseHp: 300,
    baseAtk: 55,
    speedBonus: 0.65
  },
  yan_shi: {
    id: 'yan_shi',
    name: '狂焰赤狮',
    tier: '妖魔专属',
    reqClass: 'yaomo',
    reqClassName: '妖魔',
    icon: '🦁',
    desc: '烈火金睛狮，四蹄生赤焰，凶煞威武，妖魔门派专属异兽。',
    baseHp: 320,
    baseAtk: 65,
    speedBonus: 0.65
  },
  qitian_shenlong: {
    id: 'qitian_shenlong',
    name: '九天翱翔五爪金龙',
    tier: '上古神龙',
    icon: '🐉',
    desc: '三界至尊神龙，龙啸九天，万妖臣服。',
    baseHp: 1200,
    baseAtk: 180,
    speedBonus: 0.85
  }
};

MountSystem.TEMPLATES.xuelong_ma = MountSystem.TEMPLATES.long_ma;
MountSystem.TEMPLATES.tahuo_ju = MountSystem.TEMPLATES.yan_shi;
MountSystem.TEMPLATES.zhuri_cong = MountSystem.TEMPLATES.feijian;

export default MountSystem;
