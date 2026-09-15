/**
 * 汉风西游 - 天庭蟠桃园系统 (PeachGarden)
 */
class PeachGarden {
  constructor(initData = null) {
    this.dailyTotalChances = 3;
    this.usedChancesToday = initData?.usedChancesToday || 0;
    this.lastResetDate = initData?.lastResetDate || new Date().toDateString();
    this.checkDailyReset();
  }

  checkDailyReset() {
    const today = new Date().toDateString();
    if (this.lastResetDate !== today) {
      this.usedChancesToday = 0;
      this.lastResetDate = today;
    }
  }

  getRemainingChances() {
    this.checkDailyReset();
    return Math.max(0, this.dailyTotalChances - this.usedChancesToday);
  }

  eatPeach(peachTier, player, inventory) {
    this.checkDailyReset();

    if (this.getRemainingChances() <= 0) {
      return { success: false, msg: '今日蟠桃采摘灵气已耗尽，明日卯时仙露重新滋养后再来吧！' };
    }

    const tierInfo = PeachGarden.TIERS[peachTier];
    if (!tierInfo) return { success: false, msg: '未知的蟠桃品类！' };

    this.usedChancesToday += 1;

    const expGain = Math.floor(tierInfo.baseExp * (1 + player.level * 0.08));
    const lvlUps = player.gainExp(expGain);

    if (tierInfo.bonusItem) {
      inventory.addItem(tierInfo.bonusItem, 1);
    }

    let msg = `【蟠桃仙露入腹】摘下一枚【${tierInfo.name}】咽下，顿觉琼浆流转，获得【${expGain}】点经验！`;
    if (lvlUps.length > 0) {
      msg += `\n🌟 仙气磅礴！人物等级提升至 Lv.${player.level}，获得 5 点潜能点！`;
    }

    return {
      success: true,
      expGained: expGain,
      levelUps: lvlUps,
      remaining: this.getRemainingChances(),
      msg: msg
    };
  }
}

PeachGarden.TIERS = {
  tier_3000: {
    id: 'tier_3000',
    name: '三千年一熟·花微果小蟠桃',
    icon: '🍑',
    desc: '人吃了成仙了道，体健身轻。洗髓伐脉，得享阳寿。',
    baseExp: 2200,
    bonusItem: 'jinchuang_yao'
  },
  tier_6000: {
    id: 'tier_6000',
    name: '六千年一熟·层花甘实大蟠桃',
    icon: '🍑',
    desc: '人吃了霞举飞升，长生不老。仙气充盈，内蕴万千法力。',
    baseExp: 6800,
    bonusItem: 'qianghua_shi'
  },
  tier_9000: {
    id: 'tier_9000',
    name: '九千年一熟·紫纹缃核绝品仙桃',
    icon: '✨🍑',
    desc: '与天地齐寿，日月同庚！王母娘娘瑶池胜会之至高仙珍！',
    baseExp: 18000,
    bonusItem: 'dingxing_shi'
  }
};

export default PeachGarden;
