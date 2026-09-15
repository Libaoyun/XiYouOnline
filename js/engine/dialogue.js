/**
 * 汉风西游 - 剧情对话与过场演绎引擎 (DialogueEngine 2.0)
 * 彻底修复全屏拦截卡死 Bug，引入国风水墨立绘头像，告别 Emoji！
 */

class DialogueEngine {
  constructor() {
    this.currentDialogue = null;
    this.currentStep = 0;
    this.displayedText = '';
    this.isTyping = false;
    this.typeInterval = null;
    this.onCompleteCallback = null;
  }

  // 根据说话人姓名/称号推断角色立绘ID
  inferRoleId(speaker, speakerTitle) {
    const s = `${speaker || ''} ${speakerTitle || ''}`;
    if (s.includes('孙悟空') || s.includes('大圣') || s.includes('弼马温') || s.includes('猴')) return 'sun_wukong';
    if (s.includes('龙') || s.includes('敖烈') || s.includes('白龙马')) return 'xiaobailong';
    if (s.includes('八戒') || s.includes('猪刚鬣') || s.includes('天蓬') || s.includes('悟能')) return 'zhu_bajie';
    if (s.includes('沙') || s.includes('悟净') || s.includes('卷帘')) return 'sha_wujing';
    if (s.includes('虎先锋')) return 'hu_xianfeng';
    if (s.includes('黄风')) return 'huangfeng_guai';
    if (s.includes('乌巢') || s.includes('多心经')) return 'wuchao_chanshi';
    if (s.includes('镇元') || s.includes('大仙') || s.includes('清风') || s.includes('明月')) return 'zhenyuanzi';
    if (s.includes('白骨') || s.includes('尸魔')) return 'baigu_jing';
    if (s.includes('黄袍') || s.includes('奎木狼')) return 'huangpao_guai';
    if (s.includes('菩提') || s.includes('斜月三星')) return 'puti_zushi';
    if (s.includes('太白金星') || s.includes('老仙')) return 'taibai';
    if (s.includes('托塔') || s.includes('李天王')) return 'litianwang';
    if (s.includes('巨灵神') || s.includes('天将')) return 'heavenly_boss';
    if (s.includes('刘伯钦') || s.includes('猎户') || s.includes('太保')) return 'liu_boqin';
    if (s.includes('玄奘') || s.includes('唐僧') || s.includes('三藏') || s.includes('金山寺')) return 'xuanzang';
    if (s.includes('观音') || s.includes('菩萨')) return 'guanyin';
    if (s.includes('威灵') || s.includes('神将')) return 'heaven_general';
    if (s.includes('狼')) return 'wolf';
    return 'mortal_wanderer';
  }

  // 开启一段剧情对话
  start(dialogueData, onComplete = null) {
    if (!dialogueData || !dialogueData.steps || dialogueData.steps.length === 0) return;
    this.currentDialogue = dialogueData;
    this.currentStep = 0;
    this.onCompleteCallback = onComplete;
    this.showStep(0);
  }

  // 显示当前步骤
  showStep(index) {
    if (!this.currentDialogue || index >= this.currentDialogue.steps.length) {
      this.close();
      return;
    }

    this.currentStep = index;
    const step = this.currentDialogue.steps[index];
    const fullText = step.text;

    // 清除原有打字机定时器
    if (this.typeInterval) clearInterval(this.typeInterval);

    this.displayedText = '';
    this.isTyping = true;
    let charIdx = 0;

    window.Sound.playBeep();

    this.typeInterval = setInterval(() => {
      if (charIdx < fullText.length) {
        this.displayedText += fullText[charIdx];
        charIdx++;
        this.render();
      } else {
        this.isTyping = false;
        clearInterval(this.typeInterval);
        this.render();
      }
    }, 20);

    this.render();
  }

  // 点击快进或下一步
  next() {
    if (!this.currentDialogue) return;

    const step = this.currentDialogue.steps[this.currentStep];
    // 如果正在打字，直接显示全文
    if (this.isTyping) {
      clearInterval(this.typeInterval);
      this.isTyping = false;
      this.displayedText = step.text;
      this.render();
      return;
    }

    // 如果有选项分支，必须由玩家点击选项按钮
    if (step.options && step.options.length > 0) {
      return;
    }

    // 执行当前步的触发事件
    if (step.action) {
      step.action();
    }

    // 前进到下一步
    if (this.currentStep + 1 < this.currentDialogue.steps.length) {
      this.showStep(this.currentStep + 1);
    } else {
      this.close();
    }
  }

  // 选择分支选项 (核心Bug已彻底修复)
  chooseOption(optIndex) {
    const step = this.currentDialogue.steps[this.currentStep];
    if (!step.options || !step.options[optIndex]) return;

    const opt = step.options[optIndex];
    window.Sound.playSuccess();

    // 如果该选项有具体下一步对话
    if (opt.nextStep !== undefined) {
      if (opt.action) opt.action();
      this.showStep(opt.nextStep);
    } else {
      // 关键修复：这是终结选项（例如开启战斗、跳转地图等），立即彻底关闭对话框遮罩，绝不残留拦截事件！
      this.close();
      if (opt.action) {
        opt.action();
      }
    }
  }

  // 关闭对话，彻底移除 DOM 与遮罩
  close() {
    if (this.typeInterval) clearInterval(this.typeInterval);
    const cb = this.onCompleteCallback;
    this.currentDialogue = null;
    this.onCompleteCallback = null;

    const el = document.getElementById('dialogue-overlay');
    if (el) el.remove();

    if (cb) cb();
  }

  // 渲染对话视口
  render() {
    if (!this.currentDialogue) return;

    const step = this.currentDialogue.steps[this.currentStep];
    let overlay = document.getElementById('dialogue-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'dialogue-overlay';
      overlay.className = 'dialogue-overlay';

      // 严格挂载在游戏视口内部，绝不挂载到 document.body 覆盖整个浏览器
      const viewport = document.getElementById('game-viewport') || document.querySelector('.phone-screen-frame') || document.body;
      viewport.appendChild(overlay);
    }

    const roleId = step.roleId || this.inferRoleId(step.speaker, step.speakerTitle);
    const portraitHtml = window.Portraits ? window.Portraits.getPortraitSvg(roleId, 62) : '🧙‍♂️';

    overlay.innerHTML = `
      <div class="dialogue-box" onclick="window.Dialogue.next()">
        <!-- 国风半身立绘头像 -->
        <div class="dialogue-avatar-frame">
          ${portraitHtml}
        </div>

        <div class="dialogue-body">
          <div class="dialogue-speaker-name">
            <span style="color:#ffd700;">${step.speaker}</span>
            <span class="dialogue-speaker-title" style="color:#e6c88b;">${step.speakerTitle || ''}</span>
          </div>

          <div class="dialogue-text-content">
            ${this.displayedText}
            ${this.isTyping ? '<span class="cursor-blink">|</span>' : ''}
          </div>

          <!-- 选项分支 -->
          ${(!this.isTyping && step.options && step.options.length > 0) ? `
            <div class="dialogue-options-row" onclick="event.stopPropagation()">
              ${step.options.map((opt, i) => `
                <button class="dialogue-opt-btn" onclick="window.Dialogue.chooseOption(${i})">
                  ${opt.text}
                </button>
              `).join('')}
            </div>
          ` : `
            <div class="dialogue-tip">点击继续 ▼</div>
          `}
        </div>
      </div>
    `;
  }
}

window.Dialogue = new DialogueEngine();
