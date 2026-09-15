/**
 * 汉风西游 - 储物背包与宝石镶嵌核心系统 (Inventory 2.0)
 * 严格支持：
 * 1. 药品、装备、宝石、杂物四大独立分类
 * 2. 装备绝不自动穿上，需用户主动选择穿戴或卸下
 * 3. 装备最多支持3个宝石孔，支持将宝石镶嵌至装备孔位
 * 4. 堆叠与格子满容校验
 */
class Inventory {
  constructor(initSlots = []) {
    this.maxSlots = 36;
    // slots: [{ instanceId, itemId, count, equipData: { star: 0, sockets: [null, null, null] } }]
    this.slots = initSlots.map(s => {
      const it = window.GAME_DATA.ITEMS[s.itemId];
      if (it && it.type === 'equip') {
        const ed = s.equipData || {};
        return {
          ...s,
          equipData: {
            star: ed.star || 0,
            sockets: ed.sockets || [null, null, null]
          }
        };
      }
      return s;
    });
  }

  // 获取全部物品
  getItems() {
    return this.slots;
  }

  // 按分类获取物品
  getItemsByCategory(category = 'all') {
    if (category === 'all') return this.slots;
    return this.slots.filter(s => {
      const it = window.GAME_DATA.ITEMS[s.itemId];
      if (!it) return false;
      return it.type === category;
    });
  }

  // 获取特定物品数量
  getItemCount(itemId) {
    return this.slots
      .filter(s => s.itemId === itemId)
      .reduce((sum, s) => sum + (s.count || 1), 0);
  }

  // 添加物品（新装备绝不自动穿戴，直接入包）
  addItem(itemId, count = 1, customData = null) {
    const itemData = window.GAME_DATA.ITEMS[itemId];
    if (!itemData) return false;

    // 装备不可堆叠，独立占一格，初始保证3孔
    if (itemData.type === 'equip') {
      for (let i = 0; i < count; i++) {
        if (this.slots.length >= this.maxSlots) return false;
        const ed = customData || {};
        this.slots.push({
          instanceId: 'it_eq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          itemId: itemId,
          count: 1,
          equipData: {
            star: ed.star || 0,
            sockets: ed.sockets || [null, null, null]
          }
        });
      }
      return true;
    }

    // 药品、宝石、杂物类支持堆叠 (单格上限 99)
    let remaining = count;
    for (const slot of this.slots) {
      if (slot.itemId === itemId && slot.count < 99) {
        const canAdd = Math.min(remaining, 99 - slot.count);
        slot.count += canAdd;
        remaining -= canAdd;
        if (remaining <= 0) break;
      }
    }

    while (remaining > 0) {
      if (this.slots.length >= this.maxSlots) return false;
      const addCount = Math.min(remaining, 99);
      this.slots.push({
        instanceId: 'it_misc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        itemId: itemId,
        count: addCount
      });
      remaining -= addCount;
    }

    return true;
  }

  // 扣减指定物品
  removeItem(itemId, count = 1) {
    if (this.getItemCount(itemId) < count) return false;

    let remaining = count;
    for (let i = this.slots.length - 1; i >= 0; i--) {
      const slot = this.slots[i];
      if (slot.itemId === itemId) {
        if (slot.count <= remaining) {
          remaining -= slot.count;
          this.slots.splice(i, 1);
        } else {
          slot.count -= remaining;
          remaining = 0;
        }
        if (remaining <= 0) break;
      }
    }
    return true;
  }

  removeSlotByInstanceId(instanceId) {
    const idx = this.slots.findIndex(s => s.instanceId === instanceId);
    if (idx !== -1) {
      this.slots.splice(idx, 1);
      return true;
    }
    return false;
  }

  // 手动穿戴装备
  equip(instanceId, player) {
    const slotIdx = this.slots.findIndex(s => s.instanceId === instanceId);
    if (slotIdx === -1) return { success: false, msg: '物品不存在！' };

    const slotData = this.slots[slotIdx];
    const item = window.GAME_DATA.ITEMS[slotData.itemId];
    if (!item || item.type !== 'equip') return { success: false, msg: '该物品不可穿戴！' };

    if (player.level < item.reqLevel) {
      return { success: false, msg: `穿戴需要角色等级达到 ${item.reqLevel} 级！` };
    }

    // 从背包移除当前装备
    this.slots.splice(slotIdx, 1);

    // 装备到身上，并换下旧装备
    const oldEquip = player.equipItem(item.slot, {
      itemId: slotData.itemId,
      star: (slotData.equipData && slotData.equipData.star) || 0,
      sockets: (slotData.equipData && slotData.equipData.sockets) || [null, null, null]
    });

    // 旧装备入包
    if (oldEquip) {
      this.addItem(oldEquip.itemId, 1, {
        star: oldEquip.star || 0,
        sockets: oldEquip.sockets || [null, null, null]
      });
    }

    window.Sound.playSuccess();
    return { success: true, msg: `成功佩戴了【${item.name}】！` };
  }

  // 手动脱下装备
  unequip(partSlot, player) {
    if (this.slots.length >= this.maxSlots) {
      return { success: false, msg: '储物背包已满，无法卸下装备！' };
    }

    const oldEquip = player.unequipItem(partSlot);
    if (!oldEquip) return { success: false, msg: '该部位未穿戴任何装备！' };

    const item = window.GAME_DATA.ITEMS[oldEquip.itemId];
    this.addItem(oldEquip.itemId, 1, {
      star: oldEquip.star || 0,
      sockets: oldEquip.sockets || [null, null, null]
    });

    window.Sound.playSuccess();
    return { success: true, msg: `已卸下【${(item && item.name) || '装备'}】并放入背包！` };
  }

  // 宝石镶嵌 (装备最多3孔)
  socketGem(equipInstanceId, gemItemId, socketIdx, player) {
    const equipSlot = this.slots.find(s => s.instanceId === equipInstanceId);
    if (!equipSlot) return { success: false, msg: '未在背包中找到对应装备！' };

    const equipItem = window.GAME_DATA.ITEMS[equipSlot.itemId];
    if (!equipItem || equipItem.type !== 'equip') return { success: false, msg: '目标物品并非有效装备！' };

    if (socketIdx < 0 || socketIdx >= 3) return { success: false, msg: '无效的宝石孔位编号！' };

    equipSlot.equipData = equipSlot.equipData || { star: 0, sockets: [null, null, null] };
    equipSlot.equipData.sockets = equipSlot.equipData.sockets || [null, null, null];

    if (equipSlot.equipData.sockets[socketIdx]) {
      return { success: false, msg: `该孔位已镶嵌有【${window.GAME_DATA.ITEMS[equipSlot.equipData.sockets[socketIdx]].name}】！需先拆除！` };
    }

    const gemItem = window.GAME_DATA.ITEMS[gemItemId];
    if (!gemItem || gemItem.type !== 'gem') return { success: false, msg: '所选物品并非宝石！' };

    if (this.getItemCount(gemItemId) < 1) return { success: false, msg: `背包中【${gemItem.name}】数量不足！` };

    // 扣减宝石
    this.removeItem(gemItemId, 1);
    equipSlot.equipData.sockets[socketIdx] = gemItemId;

    if (player) {
      player.recalculateStats(false);
    }

    window.Sound.playMagic();
    return {
      success: true,
      msg: `🎉 成功将【${gemItem.name}】镶嵌至【${equipItem.name}】第 ${socketIdx + 1} 孔！神力已灌注！`
    };
  }

  // 宝石摘除
  unsocketGem(equipInstanceId, socketIdx, player) {
    if (this.slots.length >= this.maxSlots) {
      return { success: false, msg: '背包已满，无法摘除宝石！' };
    }

    const equipSlot = this.slots.find(s => s.instanceId === equipInstanceId);
    if (!equipSlot || !equipSlot.equipData || !equipSlot.equipData.sockets) {
      return { success: false, msg: '装备不存在！' };
    }

    const gemItemId = equipSlot.equipData.sockets[socketIdx];
    if (!gemItemId) return { success: false, msg: '该孔位为空，无宝石可拆除！' };

    const gemItem = window.GAME_DATA.ITEMS[gemItemId];
    equipSlot.equipData.sockets[socketIdx] = null;
    this.addItem(gemItemId, 1);

    if (player) {
      player.recalculateStats(false);
    }

    window.Sound.playSuccess();
    return {
      success: true,
      msg: `已将第 ${socketIdx + 1} 孔中的【${gemItem ? gemItem.name : '宝石'}】摘除放回背包！`
    };
  }
}

window.Inventory = Inventory;
