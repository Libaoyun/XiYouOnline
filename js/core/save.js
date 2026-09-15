/**
 * 汉风西游 - 存档与持久化管理系统 (SaveManager)
 * LocalStorage 本地存储、多槽位、自动即时存档、导出与导入 JSON
 */
class SaveManager {
  static SAVE_KEY_PREFIX = 'hanfeng_xy_save_';

  // 保存数据到指定槽位
  static saveGame(slotIndex = 1, stateData) {
    try {
      const payload = {
        version: '1.0.0',
        timestamp: Date.now(),
        saveTime: new Date().toLocaleString(),
        data: stateData
      };
      localStorage.setItem(this.SAVE_KEY_PREFIX + slotIndex, JSON.stringify(payload));
      return { success: true, msg: '游戏进度已成功保存在本地！' };
    } catch (e) {
      console.error('存档失败:', e);
      return { success: false, msg: '存档失败，可能是存储空间已满或权限不足。' };
    }
  }

  // 加载指定槽位数据
  static loadGame(slotIndex = 1) {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY_PREFIX + slotIndex);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.data;
    } catch (e) {
      console.error('读档失败:', e);
      return null;
    }
  }

  // 检查是否有存档
  static hasSave(slotIndex = 1) {
    return !!localStorage.getItem(this.SAVE_KEY_PREFIX + slotIndex);
  }

  // 保存 2D 汉风西游完整历练状态 (自动存档专用)
  static saveGameFullState(stateData) {
    try {
      const payload = {
        version: '2.0.0',
        timestamp: Date.now(),
        saveTime: new Date().toLocaleString(),
        data: stateData
      };
      localStorage.setItem(this.SAVE_KEY_PREFIX + 'auto_progress', JSON.stringify(payload));
      return { success: true, msg: '历练进度已自动保存在本地！' };
    } catch (e) {
      console.error('自动保存异常:', e);
      return { success: false, msg: '存储受限或异常。' };
    }
  }

  // 加载 2D 完整历练进度
  static loadGameFullState() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY_PREFIX + 'auto_progress');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.data || null;
    } catch (e) {
      console.error('读档异常:', e);
      return null;
    }
  }

  // 检查是否存在 2D 自动历练存档
  static hasAutoSave() {
    return !!localStorage.getItem(this.SAVE_KEY_PREFIX + 'auto_progress');
  }

  // 清空历练存档（重新启程）
  static clearProgress() {
    try {
      localStorage.removeItem(this.SAVE_KEY_PREFIX + 'auto_progress');
      return { success: true, msg: '历练存档已清空，正在为您重新开启西行长卷！' };
    } catch (e) {
      return { success: false, msg: '清空失败。' };
    }
  }

  // 清除指定槽位存档
  static deleteSave(slotIndex = 1) {
    localStorage.removeItem(this.SAVE_KEY_PREFIX + slotIndex);
  }

  // 导出存档为 JSON 字符串
  static exportSaveJson(slotIndex = 1) {
    const raw = localStorage.getItem(this.SAVE_KEY_PREFIX + slotIndex);
    return raw || '';
  }

  // 导入 JSON 字符串恢复存档
  static importSaveJson(slotIndex = 1, jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.data || !parsed.data.player) {
        return { success: false, msg: '存档格式错误，无法识别核心数据！' };
      }
      localStorage.setItem(this.SAVE_KEY_PREFIX + slotIndex, jsonStr);
      return { success: true, msg: '外部存档导入成功！正在为您重新载入游戏……' };
    } catch (e) {
      return { success: false, msg: '导入失败，JSON 解析异常！' };
    }
  }
}

window.SaveManager = SaveManager;
