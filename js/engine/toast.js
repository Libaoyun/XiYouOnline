/**
 * 汉风西游 - 国风西游沉浸式消息浮层组件 (GameToast)
 * 彻底替换浏览器原生 alert！
 * 挂载在游戏视口内部，紫檀金边卷轴质感，支持微光渐隐与队列管理
 */

class GameToastEngine {
  constructor() {
    this.container = null;
    this.timer = null;
    window.addEventListener('resize', () => this.trimQueue());
  }

  trimQueue(reserved = 0) {
    const container = this.container;
    if (!container) return;
    const maxItems = container.clientWidth > 0 && container.clientWidth < 400 ? 2 : 4;
    while (container.children && container.children.length > maxItems - reserved) {
      const oldest = container.firstElementChild || container.children[0];
      if (!oldest) break;
      if (oldest._dismissTimer) clearTimeout(oldest._dismissTimer);
      oldest.remove();
    }
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
      if (window.ResizeObserver) {
        this.resizeObserver?.disconnect();
        this.resizeObserver = new window.ResizeObserver(() => this.trimQueue());
        this.resizeObserver.observe(this.container);
      }
    }
    return this.container;
  }

  // 显示提示：type 可以为 'gold' | 'success' | 'danger' | 'warning' | 'info' | 'mount' | 'peach' | 'level'
  show(text, type = 'gold', duration = 2800) {
    const container = this.ensureContainer();

    // 智能提取正文前缀 Emoji 作为徽章图标，避免正文与图标双重堆叠
    let icon = null;
    let cleanText = String(text != null ? text : '').trim();
    const emojiRegex = /^(\p{Extended_Pictographic}|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83D[\uDE80-\uDEFF]|\uD83E[\uDD00-\uDDFF]|[\u2600-\u27BF])\s*/u;
    const match = cleanText.match(emojiRegex);
    if (match) {
      icon = match[1];
      cleanText = cleanText.replace(emojiRegex, '');
    }

    // 归一化类型与缺省图标
    let normType = type;
    if (type === 'error') normType = 'danger';
    else if (type === 'warn') normType = 'warning';

    if (!icon) {
      if (normType === 'gold' || normType === 'level') icon = '🌟';
      else if (normType === 'success') icon = '✨';
      else if (normType === 'danger') icon = '⚔️';
      else if (normType === 'warning') icon = '⚠️';
      else if (normType === 'mount') icon = '🐎';
      else if (normType === 'peach') icon = '🍑';
      else icon = '📜';
    }

    // 1. 去重逻辑：若同内容的旧提示已在展示，先移除旧提示再展示新提示；不同内容正常保留
    const existingItems = Array.from(container.children || []);
    for (const item of existingItems) {
      if (item && item.dataset && item.dataset.toastMsg === cleanText) {
        if (item._dismissTimer) clearTimeout(item._dismissTimer);
        item.remove();
      }
    }

    // 窄游戏窗口保留两条；同步移除超额项，连发提示也不能堆满对白区域。
    this.trimQueue(1);

    const toast = document.createElement('div');
    toast.className = `game-toast-item toast-${normType} toast-${type} game-toast-${normType}`;
    toast.dataset.toastMsg = cleanText;

    toast.innerHTML = `
      <div class="toast-inner">
        <span class="toast-icon">${icon}</span>
        <span class="toast-text">${cleanText}</span>
        <button class="toast-close-btn" type="button" aria-label="关闭提示" title="关闭">✕</button>
      </div>
    `;

    container.appendChild(toast);

    // 播放提示音
    if (window.Sound) {
      if (normType === 'danger') window.Sound.playHit();
      else window.Sound.playSuccess();
    }

    // 入场动画
    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });

    // 统一淡出并销毁逻辑
    const dismiss = () => {
      if (toast._dismissTimer) {
        clearTimeout(toast._dismissTimer);
        toast._dismissTimer = null;
      }
      toast.classList.remove('toast-show');
      toast.classList.add('toast-hide');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 280);
    };

    // 右侧叉号点击立即关闭
    const closeBtn = toast.querySelector('.toast-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dismiss();
      });
    }

    // 悬停暂停淡出支持
    let remainingTime = duration;
    let startTime = Date.now();

    const startDismissTimer = (ms) => {
      startTime = Date.now();
      remainingTime = ms;
      toast._dismissTimer = setTimeout(() => {
        dismiss();
      }, ms);
    };

    toast.addEventListener('mouseenter', () => {
      if (toast._dismissTimer) {
        clearTimeout(toast._dismissTimer);
        toast._dismissTimer = null;
        remainingTime = Math.max(800, remainingTime - (Date.now() - startTime));
      }
    });

    toast.addEventListener('mouseleave', () => {
      startDismissTimer(remainingTime);
    });

    startDismissTimer(duration);
  }
}

window.GameToast = new GameToastEngine();

// 全局便捷调用，全面替换 alert
window.showGameMessage = function(text, type = 'gold', duration = 2800) {
  window.GameToast.show(text, type, duration);
};

// 彻底拦截并覆盖原生 alert，确保全系统无任何原生弹窗
window.alert = function(msg) {
  window.showGameMessage(String(msg), 'gold', 3500);
};

// 彻底拦截并覆盖原生 confirm，杜绝任何阻塞式浏览器默认对话框
window.confirm = function(msg) {
  if (window.App2D && typeof window.App2D.showConfirmModal === 'function') {
    window.App2D.showConfirmModal({
      title: '西行提示',
      content: String(msg),
      confirmText: '确定',
      cancelText: '取消',
      onConfirm: () => {}
    });
    return true;
  }
  window.showGameMessage(String(msg), 'gold', 3500);
  return true;
};
