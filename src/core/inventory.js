/**
 * 汉风西游 - 背包物品管理系统
 * 物品堆叠、使用、出售、穿戴与卸下
 */
import { ITEMS } from '../data/items.js';

export class Inventory {
  constructor(initSlots = []) {
    this.maxSlots = 36;
    this.slots = initSlots;
  }

  getItems() {
    return this.slots;
  }

  getItemCount(itemId) {
    return this.slots
      .filter(s => s.itemId === itemId)
      .reduce((sum, s) => sum + (s.count || 1), 0);
  }

  addItem(itemId, count = 1, customData = null) {
    const itemData = ITEMS[itemId];
    if (!itemData) return false;

    if (itemData.type === 'equip') {
      for (let i = 0; i < count; i++) {
        if (this.slots.length >= this.maxSlots) return false;
        this.slots.push({
          instanceId: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          itemId: itemId,
          count: 1,
          equipData: customData || { star: 0 }
        });
      }
      return true;
    }

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
        instanceId: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        itemId: itemId,
        count: addCount
      });
      remaining -= addCount;
    }

    return true;
  }

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

  useItem(instanceId, player, currentPet = null) {
    const slot = this.slots.find(s => s.instanceId === instanceId);
    if (!slot) return { success: false, msg: '物品不存在！' };

    const item = ITEMS[slot.itemId];
    if (!item) return { success: false, msg: '未知物品！' };

    if (item.type === 'equip') {
      if (player.level < item.reqLevel) {
        return { success: false, msg: `佩戴需要等级达到 ${item.reqLevel} 级！` };
      }
      const oldEquip = player.equipItem(item.slot, {
        itemId: slot.itemId,
        star: (slot.equipData && slot.equipData.star) || 0
      });
      this.removeSlotByInstanceId(instanceId);
      if (oldEquip) {
        this.addItem(oldEquip.itemId, 1, { star: oldEquip.star });
      }
      return { success: true, msg: `成功佩戴了【${item.name}】！` };
    }

    if (item.type === 'consumable') {
      if (item.effect.hp) {
        const heal = Math.min(item.effect.hp, player.maxHp - player.hp);
        player.hp += heal;
        this.removeItem(slot.itemId, 1);
        return { success: true, msg: `使用了【${item.name}】，恢复了 ${heal} 点气血！` };
      }
      if (item.effect.mp) {
        const restore = Math.min(item.effect.mp, player.maxMp - player.mp);
        player.mp += restore;
        this.removeItem(slot.itemId, 1);
        return { success: true, msg: `使用了【${item.name}】，恢复了 ${restore} 点法力！` };
      }
      if (item.effect.teleport) {
        this.removeItem(slot.itemId, 1);
        return { success: true, teleportMap: item.effect.teleport, msg: `神符光华一闪，瞬息传送至【长安城】！` };
      }
    }

    return { success: false, msg: '该物品无法直接在当前状态下使用。' };
  }
}
