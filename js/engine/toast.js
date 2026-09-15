/**
 * 汉风西游 - 国风西游沉浸式消息浮层组件 (GameToast)
 * 彻底替换浏览器原生 alert！
 * 挂载在游戏视口内部，紫檀金边卷轴质感，支持微光渐隐与队列管理
 */

class GameToastEngine {
  constructor() {
    this.container = null;
    this.timer = null;
  }

  ensureContainer() {
    if (!this.container || !this.container.parentElement) {
      const viewport = document.getElementById('game-viewport') || document.body;
      this.container = document.getElementById('game-toast-container');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'game-toast-container';
        this.container.className = 'game-toast-container';
        viewport.appendChild(this.container);
      }
    }
    return this.container;
  }

  // 显示提示：type 可以为 'gold' | 'success' | 'danger' | 'info'
  show(text, type = 'gold', duration = 2800) {
    const container = this.ensureContainer();

    const toast = document.createElement('div');
    toast.className = `game-toast-item toast-${type}`;

    let icon = '📜';
    if (type === 'gold' || type === 'level') icon = '🌟';
    else if (type === 'success') icon = '✨';
    else if (type === 'danger') icon = '⚔️';
    else if (type === 'mount') icon = '🐎';
    else if (type === 'peach') icon = '🍑';

    toast.innerHTML = `
      <div class="toast-inner">
        <span class="toast-icon">${icon}</span>
        <span class="toast-text">${text}</span>
      </div>
    `;

    container.appendChild(toast);

    // 播放提示音
    if (window.Sound) {
      if (type === 'danger') window.Sound.playHit();
      else window.Sound.playSuccess();
    }

    // 入场动画
    setTimeout(() => {
      toast.classList.add('toast-show');
    }, 10);

    // 定时淡出并移除
    setTimeout(() => {
      toast.classList.remove('toast-show');
      toast.classList.add('toast-hide');
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, duration);
  }
}

window.GameToast = new GameToastEngine();

// 全局便捷调用，全面替换 alert
window.showGameMessage = function(text, type = 'gold', duration = 2800) {
  window.GameToast.show(text, type, duration);
};

// 彻底拦截并覆盖原生 alert，确保全系统无任何原生弹窗
window.alert = function(msg) {
  window.showGameMessage(String(msg), 'gold');
};
