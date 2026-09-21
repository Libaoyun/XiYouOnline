/**
 * 汉风西游 - 剧情对话与过场演绎引擎 (DialogueEngine 4.0)
 * 全面接入 MasterPortraitEngine 工笔重彩神级头像系统
 * 80px 浮雕鎏金法相神框、情绪粒子光晕、阵营神印徽记
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
    // 顶级神佛与师徒四人
    if (s.includes('孙悟空') || s.includes('大圣') || s.includes('弼马温') || s.includes('美猴王') || s.includes('齐天')) return 'sun_wukong';
    if (s.includes('哪吒') || s.includes('三太子')) return 'nezha';
    if (s.includes('李靖') || s.includes('托塔') || s.includes('李天王')) return 'litianwang';
    if (s.includes('观音') || s.includes('菩萨') || s.includes('落伽山')) return 'guanyin';
    if (s.includes('玄奘') || s.includes('唐僧') || s.includes('三藏') || s.includes('金蝉')) return 'xuanzang';
    if (s.includes('八戒') || s.includes('天蓬') || s.includes('猪刚鬣') || s.includes('悟能')) return 'zhu_bajie';
    if (s.includes('沙僧') || s.includes('悟净') || s.includes('卷帘')) return 'sha_wujing';
    if (s.includes('白龙') || s.includes('敖烈') || s.includes('龙马')) return 'xiaobailong';
    if (s.includes('龙王') || s.includes('敖广') || s.includes('水族之主')) return 'dragon_king';
    if (s.includes('菩提') || s.includes('斜月三星') || s.includes('方寸')) return 'puti_zushi';
    if (s.includes('镇元') || s.includes('五庄观') || s.includes('地仙之祖')) return 'zhenyuanzi';
    if (s.includes('太白') || s.includes('李长庚') || s.includes('老仙')) return 'taibai';
    if (s.includes('钟馗') || s.includes('降魔真君')) return 'zhongkui';
    if (s.includes('孟婆') || s.includes('奈何')) return 'mengpo';
    if (s.includes('阎罗') || s.includes('十殿阎君') || s.includes('地府')) return 'yanluowang';
    if (s.includes('仙女') || s.includes('侍女') || s.includes('瑶池')) return 'qixiannv';
    
    // 妖王魔怪
    if (s.includes('白骨') || s.includes('尸魔') || s.includes('骷髅')) return 'baigu_jing';
    if (s.includes('黄袍') || s.includes('奎木狼') || s.includes('波月洞')) return 'huangpao_guai';
    if (s.includes('虎先锋') || s.includes('黑风虎')) return 'hu_xianfeng';
    if (s.includes('黄风') || s.includes('三昧神风')) return 'huangfeng_guai';
    if (s.includes('乌巢') || s.includes('禅师')) return 'wuchao_chanshi';
    if (s.includes('狼') || s.includes('郊狼')) return 'wolf';
    if (s.includes('混混') || s.includes('恶霸') || s.includes('强盗') || s.includes('草寇') || s.includes('贼')) return 'hunhun';
    if (s.includes('巨蚌') || s.includes('蚌')) return 'clam';
    if (s.includes('金蟹') || s.includes('蟹')) return 'crab';
    if (s.includes('龙虾') || s.includes('虾兵') || s.includes('虾将')) return 'shrimp';

    // 人间市井名仕 NPC
    if (s.includes('药铺') || s.includes('济世堂') || s.includes('郎中') || s.includes('大夫')) return 'yaopu_boss';
    if (s.includes('当铺') || s.includes('聚宝阁') || s.includes('掌柜')) return 'dangpu_boss';
    if (s.includes('铁匠') || s.includes('神兵坊') || s.includes('铸造')) return 'tiejiang';
    if (s.includes('茶肆') || s.includes('阿婆') || s.includes('茶婆婆')) return 'teashop_granny';
    if (s.includes('渔翁') || s.includes('钓叟') || s.includes('渔夫')) return 'fisherman';
    if (s.includes('刘伯钦') || s.includes('猎户') || s.includes('太保')) return 'liu_boqin';

    // 神职仙官与少侠
    if (s.includes('威灵') || s.includes('神将') || s.includes('巨灵') || s.includes('天兵')) return 'heaven_general';
    if (s.includes('少侠') || s.includes('侠士') || s.includes('逍遥生') || s.includes('剑侠客') || s.includes('玩家')) return 'shaoxia';
    return 'shaoxia';
  }

  // 获取角色身份印章标签
  getRoleBadge(roleId, speaker) {
    if (['guanyin', 'sun_wukong', 'puti_zushi', 'zhenyuanzi', 'taibai', 'heaven_general', 'nezha', 'litianwang', 'dragon_king', 'qixiannv'].includes(roleId)) {
      return '<div class="dialogue-role-seal seal-immortal">仙</div>';
    }
    if (['baigu_jing', 'huangpao_guai', 'hu_xianfeng', 'huangfeng_guai', 'wolf', 'clam', 'crab', 'shrimp', 'hunhun'].includes(roleId)) {
      return '<div class="dialogue-role-seal seal-demon">妖</div>';
    }
    if (['yaopu_boss', 'dangpu_boss', 'tiejiang'].includes(roleId)) {
      return '<div class="dialogue-role-seal seal-merchant">商</div>';
    }
    if (['zhongkui', 'mengpo', 'yanluowang'].includes(roleId)) {
      return '<div class="dialogue-role-seal seal-ghost">幽</div>';
    }
    return '<div class="dialogue-role-seal seal-mortal">人</div>';
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

    this.typeInterval = setInterval(() => {
      if (charIdx < fullText.length) {
        this.displayedText += fullText[charIdx];
        if (charIdx % 3 === 0 && window.Sound) {
          window.Sound.playDialogueType();
        }
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

  // 选择分支选项
  chooseOption(optIndex) {
    const step = this.currentDialogue.steps[this.currentStep];
    if (!step.options || !step.options[optIndex]) return;

    const opt = step.options[optIndex];
    if (window.Sound) window.Sound.playSuccess();

    if (opt.nextStep !== undefined) {
      if (opt.action) opt.action();
      this.showStep(opt.nextStep);
    } else {
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

  // 点击对话框外场景时直接解除对话，并将当前NPC此次对话流程安全走完
  completeAllAndClose() {
    if (!this.currentDialogue) return;

    if (this.typeInterval) {
      clearInterval(this.typeInterval);
      this.typeInterval = null;
    }
    this.isTyping = false;

    const dialogue = this.currentDialogue;
    const startStep = this.currentStep;
    const onComplete = this.onCompleteCallback;

    // 清空状态与移除 DOM 遮罩，防止后续 action 启动新流程时产生冲突
    this.currentDialogue = null;
    this.onCompleteCallback = null;
    this.displayedText = '';

    const el = document.getElementById('dialogue-overlay');
    if (el) el.remove();

    // 从当前尚未执行完成的步骤开始，依次结算剩余所有步骤中的 action 与唯一选项 action
    if (dialogue && Array.isArray(dialogue.steps)) {
      for (let i = startStep; i < dialogue.steps.length; i++) {
        // 若中间某个 action 同步开启了新对话，则停止当前旧对话剩余结算
        if (this.currentDialogue !== null) {
          break;
        }

        const step = dialogue.steps[i];
        if (!step) continue;

        // 1. 结算当前步骤自带的 action（主线任务推进、发放奖励、开启下一幕等）
        if (typeof step.action === 'function') {
          try {
            step.action();
          } catch (err) {
            console.error(`[DialogueEngine] 执行第 ${i} 步 action 异常:`, err);
          }
        }

        // 2. 如果存在唯一的选择项（剧情推进/切磋开战/确认接受），执行该选项的 action
        if (step.options && step.options.length === 1) {
          const singleOpt = step.options[0];
          if (singleOpt && typeof singleOpt.action === 'function') {
            try {
              singleOpt.action();
            } catch (err) {
              console.error(`[DialogueEngine] 执行第 ${i} 步单选项 action 异常:`, err);
            }
          }
        }
      }
    }

    // 3. 执行最终整体完成回调
    if (typeof onComplete === 'function') {
      try {
        onComplete();
      } catch (err) {
        console.error('[DialogueEngine] 执行 onCompleteCallback 异常:', err);
      }
    }

    // 4. 恢复玩家行动
    if (window.Player) {
      window.Player.canMove = true;
    }
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

      const viewport = document.getElementById('game-viewport') || document.querySelector('.phone-screen-frame') || document.body;
      viewport.appendChild(overlay);
    }

    // 监听全屏遮罩点击：若点击落在对话框外的内容（如场景背景），直接解除对话并走完流程
    overlay.onclick = (e) => {
      if (!e.target.closest('.dialogue-box')) {
        e.stopPropagation();
        e.preventDefault();
        this.completeAllAndClose();
      }
    };

    const roleId = step.roleId || this.inferRoleId(step.speaker, step.speakerTitle);
    const portraitHtml = window.Portraits ? window.Portraits.getPortraitSvg(roleId, 78) : '🧙‍♂️';
    const roleBadgeHtml = this.getRoleBadge(roleId, step.speaker);

    // 情绪徽标
    let emotionHtml = '';
    const text = step.text || '';
    if (step.emotion === 'exclamation' || text.includes('！') || text.includes('哈') || text.includes('快看')) {
      emotionHtml = '<div class="dialogue-emotion-bubble exclamation">！</div>';
    } else if (step.emotion === 'question' || text.includes('？') || text.includes('何处') || text.includes('莫非')) {
      emotionHtml = '<div class="dialogue-emotion-bubble question">？</div>';
    } else if (['guanyin', 'puti_zushi', 'sun_wukong', 'heaven_general'].includes(roleId)) {
      emotionHtml = '<div class="dialogue-emotion-bubble divine">✨</div>';
    }

    overlay.innerHTML = `
      <div class="dialogue-box master-dialogue-box" onclick="event.stopPropagation(); window.Dialogue.next()">
        <!-- 国风殿堂级 80px 工笔重彩半身立绘金框 -->
        <div class="dialogue-avatar-container">
          <div class="dialogue-avatar-frame master-portrait-frame">
            ${portraitHtml}
            ${roleBadgeHtml}
            ${emotionHtml}
          </div>
          <div class="dialogue-avatar-pedestal"></div>
        </div>

        <div class="dialogue-body">
          <div class="dialogue-speaker-name">
            <span class="dialogue-name-text">${step.speaker}</span>
            <span class="dialogue-speaker-title">${step.speakerTitle || ''}</span>
          </div>

          <div class="dialogue-text-content">
            ${this.displayedText}
            ${this.isTyping ? '<span class="cursor-blink">|</span>' : ''}
          </div>

          <!-- 选项分支 -->
          ${(!this.isTyping && step.options && step.options.length > 0) ? `
            <div class="dialogue-options-row" onclick="event.stopPropagation()">
              ${step.options.map((opt, i) => `
                <button class="dialogue-opt-btn" onclick="event.stopPropagation(); window.Dialogue.chooseOption(${i})">
                  ${opt.text}
                </button>
              `).join('')}
            </div>
          ` : `
            <div class="dialogue-tip">点击继续 ▼ | 点击场景跳过 ✕</div>
          `}
        </div>
      </div>
    `;
  }
}

window.Dialogue = new DialogueEngine();

