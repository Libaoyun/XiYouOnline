/**
 * 汉风西游 - 天庭蟠桃园系统 (PeachGarden)
 * 还原正统汉风西游特色：
 * 每天前往蟠桃园采摘仙品蟠桃，食用后天地灵气灌顶，获得海量角色升级经验与天材地宝！
 */

class PeachGarden {
  constructor(initData = null) {
    this.dailyTotalChances = 3;
    this.usedChancesToday = initData?.usedChancesToday || 0;
    this.lastResetDate = initData?.lastResetDate || new Date().toDateString();

    this.checkDailyReset();
  }

  // 跨天自动重置每日3次免费机会
  checkDailyReset() {
    const today = new Date().toDateString();
    if (this.lastResetDate !== today) {
      this.usedChancesToday = 0;
      this.lastResetDate = today;
    }
  }

  // 获取剩余采摘吃桃次数
  getRemainingChances() {
    this.checkDailyReset();
    return Math.max(0, this.dailyTotalChances - this.usedChancesToday);
  }

  // 品尝采摘蟠桃
  eatPeach(peachTier, player, inventory) {
    this.checkDailyReset();

    if (this.getRemainingChances() <= 0) {
      return { success: false, msg: '今日天庭蟠桃采摘灵气已耗尽，明日卯时仙露重新滋养后再来吧！' };
    }

    const tierInfo = PeachGarden.TIERS[peachTier];
    if (!tierInfo) return { success: false, msg: '未知的蟠桃品类！' };

    this.usedChancesToday += 1;

    // 给予经验奖励与物品
    const expGain = Math.floor(tierInfo.baseExp * (1 + player.level * 0.08));
    const lvlUps = player.gainExp(expGain);

    if (tierInfo.bonusItem) {
      inventory.addItem(tierInfo.bonusItem, 1);
    }

    window.Sound.playLevelUp();

    let msg = `【蟠桃仙露入腹】你摘下一枚【${tierInfo.name}】咽下，顿觉琼浆流转通达四肢百骸，获得【${expGain}】点浩瀚经验！`;
    if (lvlUps.length > 0) {
      msg += `\n🌟 仙气磅礴！等级直接提升至 Lv.${player.level}，获得 5 点潜能点！`;
    }
    if (tierInfo.bonusItem) {
      const it = window.GAME_DATA.ITEMS[tierInfo.bonusItem];
      msg += ` 顺带拾得天宫仙缘造化：【${it?.name || '天材地宝'}】！`;
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
    desc: '人吃了成仙了道，体健身轻。凡人食之洗髓伐脉，得享阳寿。',
    baseExp: 2200,
    bonusItem: 'jinchuang_yao'
  },
  tier_6000: {
    id: 'tier_6000',
    name: '六千年一熟·层花甘实大蟠桃',
    icon: '🍑',
    desc: '人吃了霞举飞升，长生不老。仙气充盈，内蕴万千玄功妙法。',
    baseExp: 6800,
    bonusItem: 'qianghua_shi'
  },
  tier_9000: {
    id: 'tier_9000',
    name: '九千年一熟·紫纹缃核绝品仙桃',
    icon: '✨🍑',
    desc: '与天地齐寿，日月同庚！王母娘娘瑶池胜会之至高仙珍，夺天地之造化！',
    baseExp: 18000,
    bonusItem: 'dingxing_shi'
  }
};

window.PeachGarden = PeachGarden;
