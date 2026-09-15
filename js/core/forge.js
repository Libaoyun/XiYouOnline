/**
 * 汉风西游 - 铁匠铺神兵淬火强化系统
 * 支持装备+1到+12升星强化、成功率计算、定星石保护防降级与发光特效
 */
class ForgeSystem {
  static getEnhanceInfo(currentStar) {
    const table = [
      { star: 1, rate: 1.0, costStones: 1, costSilver: 500, penalty: 'none' },
      { star: 2, rate: 1.0, costStones: 1, costSilver: 800, penalty: 'none' },
      { star: 3, rate: 0.95, costStones: 1, costSilver: 1200, penalty: 'none' },
      { star: 4, rate: 0.80, costStones: 2, costSilver: 2000, penalty: 'none' },
      { star: 5, rate: 0.70, costStones: 2, costSilver: 3500, penalty: 'none' },
      { star: 6, rate: 0.60, costStones: 2, costSilver: 5000, penalty: 'none' },
      { star: 7, rate: 0.50, costStones: 3, costSilver: 8000, penalty: 'down_1' },
      { star: 8, rate: 0.42, costStones: 3, costSilver: 12000, penalty: 'down_1' },
      { star: 9, rate: 0.35, costStones: 4, costSilver: 18000, penalty: 'down_1' },
      { star: 10, rate: 0.28, costStones: 5, costSilver: 30000, penalty: 'down_2' },
      { star: 11, rate: 0.22, costStones: 6, costSilver: 50000, penalty: 'down_2' },
      { star: 12, rate: 0.15, costStones: 8, costSilver: 88888, penalty: 'down_2' }
    ];

    if (currentStar >= 12) return null; // 已达到强化最高峰
    return table[currentStar];
  }

  // 执行强化
  static enhance(equipObj, inventory, player, useProtectStone = false) {
    const curStar = equipObj.star || 0;
    if (curStar >= 12) {
      return { success: false, msg: '该装备已强化至最高 +12 星，已达天道极限！' };
    }

    const info = this.getEnhanceInfo(curStar);
    if (!info) return { success: false, msg: '未知强化参数！' };

    // 检查银两
    if (player.silver < info.costSilver) {
      return { success: false, msg: `银两不足！强化需要 ${info.costSilver} 两银子。` };
    }

    // 检查强化石
    if (inventory.getItemCount('qianghua_shi') < info.costStones) {
      return { success: false, msg: `强化石不足！需要 ${info.costStones} 颗强化石。` };
    }

    // 检查定星石
    if (useProtectStone && inventory.getItemCount('dingxing_shi') < 1) {
      return { success: false, msg: '包裹中未发现【定星石】，无法开启防降星保护！' };
    }

    // 扣减资源
    player.silver -= info.costSilver;
    inventory.removeItem('qianghua_shi', info.costStones);
    if (useProtectStone) {
      inventory.removeItem('dingxing_shi', 1);
    }

    // 几率判定
    const isSuccess = Math.random() < info.rate;
    const baseItem = window.GAME_DATA.ITEMS[equipObj.itemId];
    const equipName = baseItem ? baseItem.name : '神秘装备';

    if (isSuccess) {
      equipObj.star = curStar + 1;
      player.recalculateStats(false);
      window.Sound.playSuccess();
      return {
        success: true,
        star: equipObj.star,
        msg: `【锻造通灵】火光冲天，金石交鸣！恭喜少侠，【${equipName}】成功淬炼升星至 +${equipObj.star}！`
      };
    } else {
      // 失败惩罚
      let dropText = '';
      if (!useProtectStone) {
        if (info.penalty === 'down_1') {
          equipObj.star = Math.max(0, curStar - 1);
          dropText = `装备不幸滑落降级为 +${equipObj.star}！`;
        } else if (info.penalty === 'down_2') {
          equipObj.star = Math.max(0, curStar - 2);
          dropText = `器灵震荡，装备重挫滑落至 +${equipObj.star}！`;
        }
      } else {
        dropText = `定星石发挥无上法力，虽淬火失败但保住了星级不降！`;
      }
      player.recalculateStats(false);
      window.Sound.playFailure();
      return {
        success: false,
        star: equipObj.star,
        msg: `【淬火失手】炉温不均，强化遗憾失败……${dropText}`
      };
    }
  }

  // 获取光效样式类名
  static getGlowClass(star) {
    if (star >= 12) return 'glow-gold';
    if (star >= 9) return 'glow-purple';
    if (star >= 6) return 'glow-blue';
    if (star >= 3) return 'glow-green';
    return '';
  }
}

window.ForgeSystem = ForgeSystem;
