/**
 * 汉风西游 - 核心调度与视图渲染主程序 (App)
 * 串联场景、NPC交互、战斗、背包、宠物炼妖、装备强化、任务与公屏
 */

class GameApp {
  constructor() {
    this.player = null;
    this.inventory = null;
    this.pets = []; // 玩家拥有的宠物列表
    this.activePet = null; // 当前出战召唤兽
    this.currentMapId = 'donghai_yucun';
    this.currentBattle = null;

    // 任务状态
    this.currentMainQuestIndex = 0;
    this.activeGhostQuest = null; // { ghostType, mapId, targetCount: 1, currentCount: 0 }

    // 视图状态
    this.currentView = 'scene'; // 'scene' | 'battle'
    this.activeModal = null; // 'char' | 'pet' | 'bag' | 'forge' | 'shop' | 'quest' | 'save' | 'create_role'
    this.dialogState = null; // { npc, step: 0 }

    // 模式切换
    this.isModernMode = false;

    // 自动保存计时器
    this.autoSaveTimer = null;
  }

  // 启动入口
  init() {
    // 检查本地存档
    const savedData = window.SaveManager.loadGame(1);
    if (savedData && savedData.player) {
      this.loadFromData(savedData);
    } else {
      // 首次进入 -> 打开新角色创建窗口
      this.showCreateRoleModal();
    }

    this.bindEvents();
    this.render();

    // 启动自动保存 (每 20 秒)
    this.autoSaveTimer = setInterval(() => {
      if (this.player) {
        this.saveCurrentGame(false);
      }
    }, 20000);
  }

  // 创建新角色
  createNewCharacter(name, classId, gender) {
    this.player = new window.Player({
      name: name || '逍遥生',
      classId: classId || 'jingang',
      gender: gender || 'male',
      level: 1,
      silver: 1000,
      ingots: 100
    });

    this.inventory = new window.Inventory([
      { instanceId: 'init_1', itemId: 'jinchuang_yao', count: 10 },
      { instanceId: 'init_2', itemId: 'foshou', count: 10 },
      { instanceId: 'init_3', itemId: 'feixing_fu', count: 5 },
      { instanceId: 'init_4', itemId: 'jinliu_lu', count: 3 },
      { instanceId: 'init_5', itemId: 'qianghua_shi', count: 5 }
    ]);

    this.pets = [];
    this.activePet = null;
    this.currentMapId = 'donghai_yucun';
    this.currentMainQuestIndex = 0;

    this.closeModal();
    this.saveCurrentGame(false);
    window.Chat.addMessage('system', '系统', `欢迎侠士【${this.player.name}】踏上西行寻仙之路！请前往东海渔村向村长和宠物仙子请教！`);
    this.render();
  }

  // 从存档载入
  loadFromData(data) {
    this.player = new window.Player(data.player);
    this.inventory = new window.Inventory(data.inventory.slots);
    this.pets = data.pets || [];
    this.activePet = data.activePetId ? this.pets.find(p => p.instanceId === data.activePetId) : (this.pets[0] || null);
    this.currentMapId = data.currentMapId || 'donghai_yucun';
    this.currentMainQuestIndex = data.currentMainQuestIndex || 0;
    this.activeGhostQuest = data.activeGhostQuest || null;
  }

  // 获取保存结构体
  exportSaveData() {
    return {
      player: {
        name: this.player.name,
        classId: this.player.classId,
        gender: this.player.gender,
        level: this.player.level,
        exp: this.player.exp,
        silver: this.player.silver,
        ingots: this.player.ingots,
        potentialPoints: this.player.potentialPoints,
        attributes: this.player.attributes,
        equipment: this.player.equipment
      },
      inventory: {
        slots: this.inventory.getItems()
      },
      pets: this.pets,
      activePetId: this.activePet ? this.activePet.instanceId : null,
      currentMapId: this.currentMapId,
      currentMainQuestIndex: this.currentMainQuestIndex,
      activeGhostQuest: this.activeGhostQuest
    };
  }

  // 手动/自动保存
  saveCurrentGame(showNotify = true) {
    if (!this.player) return;
    const res = window.SaveManager.saveGame(1, this.exportSaveData());
    if (showNotify) {
      alert(res.msg);
    }
  }

  // 绑定全局事件（实体按键、九宫格、键盘响应）
  bindEvents() {
    // 监听键盘按键 1~9, Enter, Escape, 方向键
    window.addEventListener('keydown', (e) => {
      // 如果正在弹窗且处于输入框，则不劫持
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

      const key = e.key;
      if (key >= '1' && key <= '9') {
        this.handleNumberKey(parseInt(key, 10));
      } else if (key === 'Enter' || key === ' ') {
        this.handleConfirmKey();
      } else if (key === 'Escape') {
        this.handleBackKey();
      }
    });

    // 模式切换按钮
    const modeBtn = document.getElementById('toggle-mode-btn');
    if (modeBtn) {
      modeBtn.addEventListener('click', () => {
        this.isModernMode = !this.isModernMode;
        document.body.classList.toggle('modern-mode', this.isModernMode);
        modeBtn.innerHTML = this.isModernMode ? '📱 掌机模式' : '💻 大屏模式';
        window.Sound.playBeep();
      });
    }

    // 音效开关
    const soundBtn = document.getElementById('toggle-sound-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const enabled = window.Sound.toggle();
        soundBtn.innerHTML = enabled ? '🔊 音效:开' : '🔇 音效:关';
        if (enabled) window.Sound.playBeep();
      });
    }

    // 存档管理按钮
    const saveBtn = document.getElementById('manage-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.openModal('save');
      });
    }

    // 冒泡公屏监听
    window.Chat.subscribe(() => {
      this.renderChatMessages();
    });
  }

  // 处理九宫格数字按键 (1-9)
  handleNumberKey(num) {
    window.Sound.playBeep();
    // 寻找当前主视口或战斗中的编号动作元素
    const targetActionBtn = document.querySelector(`[data-key="${num}"]`);
    if (targetActionBtn) {
      targetActionBtn.click();
    }
  }

  handleConfirmKey() {
    window.Sound.playBeep();
    const okBtn = document.getElementById('key-ok') || document.querySelector('.default-confirm-btn');
    if (okBtn) okBtn.click();
  }

  handleBackKey() {
    window.Sound.playBeep();
    if (this.activeModal) {
      this.closeModal();
    } else if (this.dialogState) {
      this.dialogState = null;
      this.render();
    }
  }

  // =========================================================================
  // 场景与移动逻辑
  // =========================================================================
  switchMap(targetMapId) {
    const targetMap = window.GAME_DATA.MAPS[targetMapId];
    if (!targetMap) return;

    this.currentMapId = targetMapId;
    this.dialogState = null;
    window.Sound.playBeep();
    window.Chat.addMessage('system', '移动', `你信步迈入【${targetMap.name}】(${targetMap.region})。`);
    this.render();
  }

  // 野外暗雷遇怪巡逻
  triggerPatrol() {
    const map = window.GAME_DATA.MAPS[this.currentMapId];
    if (!map || !map.wildEnemies || map.wildEnemies.length === 0) {
      alert('当前区域风平浪静，并无妖邪怪物出没。');
      return;
    }

    // 随机抽取 1~3 只怪
    const enemyCount = Math.floor(Math.random() * 2) + 1; // 1~2 只
    const enemies = [];

    for (let i = 0; i < enemyCount; i++) {
      // 按权重抽取怪
      const totalWeight = map.wildEnemies.reduce((sum, e) => sum + e.weight, 0);
      let rand = Math.random() * totalWeight;
      let chosen = map.wildEnemies[0];
      for (const entry of map.wildEnemies) {
        if (rand < entry.weight) {
          chosen = entry;
          break;
        }
        rand -= entry.weight;
      }

      const tpl = window.GAME_DATA.PETS[chosen.petId];
      const lvl = Math.floor(chosen.levelRange[0] + Math.random() * (chosen.levelRange[1] - chosen.levelRange[0] + 1));
      // 变异几率 6%
      const isMutated = Math.random() < 0.06;
      const petInst = window.PetSystem.createPet(chosen.petId, true, lvl, isMutated);

      enemies.push({
        id: 'enemy_' + (i + 1),
        templateId: chosen.petId,
        name: petInst.name,
        icon: petInst.icon,
        isMutated: isMutated,
        isBoss: false,
        catchRate: tpl.catchRate,
        level: lvl,
        hp: petInst.maxHp,
        maxHp: petInst.maxHp,
        mp: petInst.maxMp,
        maxMp: petInst.maxMp,
        atk: petInst.atk,
        def: petInst.def,
        matk: petInst.matk,
        mdef: petInst.mdef,
        spd: petInst.spd,
        skills: petInst.skills
      });
    }

    this.startBattle(enemies);
  }

  // 发起战斗
  startBattle(enemies, options = {}) {
    if (this.currentPet && this.currentPet.hp <= 0) {
      this.currentPet.hp = Math.floor(this.currentPet.maxHp * 0.3); // 自动回微量血
    }

    this.currentBattle = new window.BattleEngine(
      this.player,
      this.activePet,
      enemies,
      { mapId: this.currentMapId, ...options }
    );

    this.currentView = 'battle';
    window.Sound.playCrit();
    this.render();
  }

  // 战斗回合执行
  async handleBattleCommand(actionType, extraData = {}) {
    if (!this.currentBattle || this.currentBattle.status !== 'player_input') return;

    let targetIdx = 0;
    const selectedEl = document.querySelector('.combatant-unit.selected-target');
    if (selectedEl) {
      targetIdx = parseInt(selectedEl.getAttribute('data-enemy-index') || '0', 10);
    }

    this.currentBattle.setPlayerAction({
      type: actionType,
      targetIndex: targetIdx,
      ...extraData
    });

    // 逐步执行动画与更新
    await this.currentBattle.executeRound(async (step) => {
      this.renderBattleArena();
      if (step.type === 'damage' && step.targetIndex !== undefined) {
        this.triggerDamageAnimation(step.targetIndex, step.damage, step.isCrit);
      }
      await new Promise(r => setTimeout(r, 450));
    });

    // 检查战斗状态
    const status = this.currentBattle.status;
    if (status === 'victory') {
      window.Sound.playVictory();
      this.handleBattleVictory();
    } else if (status === 'defeat') {
      window.Sound.playFailure();
      alert('【胜败乃兵家常事】你体力不支倒在血泊中，幸得路过游侠相救，送回东海渔村休养……');
      this.player.hp = Math.floor(this.player.maxHp * 0.5);
      this.currentMapId = 'donghai_yucun';
      this.currentView = 'scene';
      this.currentBattle = null;
      this.render();
    } else if (status === 'escaped') {
      this.currentView = 'scene';
      this.currentBattle = null;
      this.render();
    } else {
      this.render();
    }
  }

  // 战斗胜利结算
  handleBattleVictory() {
    let totalExp = 0;
    let totalSilver = 0;

    this.currentBattle.enemies.forEach(e => {
      totalExp += e.level * 45 + 30;
      totalSilver += e.level * 30 + 20;
    });

    // 掉落几率
    const drops = [];
    if (Math.random() < 0.4) drops.push('jinchuang_yao');
    if (Math.random() < 0.25) drops.push('qianghua_shi');
    if (Math.random() < 0.08) drops.push('jinliu_lu');

    // 给予玩家奖励
    totalExp = Math.floor(totalExp);
    totalSilver = Math.floor(totalSilver);
    this.player.silver += totalSilver;
    const lvlUps = this.player.gainExp(totalExp);

    // 宠物经验
    if (this.activePet && this.activePet.hp > 0) {
      const petLvlUp = window.PetSystem.gainExp(this.activePet, Math.floor(totalExp * 1.2));
      if (petLvlUp) {
        window.Chat.addMessage('system', '灵宠升级', `你的召唤兽【${this.activePet.name}】等级提升至 ${this.activePet.level} 级！`);
      }
    }

    drops.forEach(d => this.inventory.addItem(d, 1));

    let dropText = drops.map(d => window.GAME_DATA.ITEMS[d]?.name).join('、');
    let msg = `【战斗胜利】获得 ${totalExp} 点经验，${totalSilver} 两银子！` + (dropText ? ` 缴获战利品：【${dropText}】` : '');

    if (lvlUps.length > 0) {
      window.Sound.playLevelUp();
      msg += `\n🌟 恭喜升级！等级提升至 ${this.player.level} 级，获得 5 点潜能加点！`;
    }

    // 主线任务杀怪统计
    this.checkQuestProgress('kill_wild');

    // 捉鬼任务杀怪统计
    if (this.currentBattle.options.isGhost && this.activeGhostQuest) {
      this.activeGhostQuest.currentCount += 1;
      msg += `\n👺 降伏恶鬼成功！可前往长安城向钟馗天师复命领赏！`;
    }

    setTimeout(() => {
      alert(msg);
      this.currentView = 'scene';
      this.currentBattle = null;
      this.render();
    }, 400);
  }

  // 受击飘字震颤特效
  triggerDamageAnimation(enemyIdx, damage, isCrit) {
    const enemyEl = document.querySelector(`[data-enemy-index="${enemyIdx}"]`);
    if (!enemyEl) return;

    enemyEl.classList.add('hit-shake');
    setTimeout(() => enemyEl.classList.remove('hit-shake'), 300);

    const floatEl = document.createElement('div');
    floatEl.className = `floating-text ${isCrit ? 'float-crit' : 'float-damage'}`;
    floatEl.innerText = `${isCrit ? '暴击! ' : ''}-${damage}`;
    enemyEl.appendChild(floatEl);

    setTimeout(() => {
      if (floatEl.parentNode) floatEl.parentNode.removeChild(floatEl);
    }, 800);
  }

  // =========================================================================
  // NPC 对话与功能窗口
  // =========================================================================
  interactWithNpc(npc) {
    window.Sound.playBeep();
    if (npc.actionType === 'adopt_pet') {
      this.showAdoptPetModal();
      return;
    }
    if (npc.actionType === 'shop') {
      this.showShopModal(npc.goods);
      return;
    }
    if (npc.actionType === 'forge') {
      this.openModal('forge');
      return;
    }
    if (npc.actionType === 'rest_heal') {
      this.player.hp = this.player.maxHp;
      this.player.mp = this.player.maxMp;
      if (this.activePet) {
        this.activePet.hp = this.activePet.maxHp;
        this.activePet.mp = this.activePet.maxMp;
      }
      window.Sound.playMagic();
      alert('【悦来客栈】美美睡了一大觉，气血与法力已全部恢复充盈！');
      this.render();
      return;
    }
    if (npc.actionType === 'ghost_quest') {
      this.handleGhostNpcInteract();
      return;
    }

    // 默认剧情对话
    this.dialogState = {
      npc: npc,
      step: 0
    };
    this.render();
  }

  // 钟馗抓鬼任务处理
  handleGhostNpcInteract() {
    if (this.activeGhostQuest) {
      if (this.activeGhostQuest.currentCount >= this.activeGhostQuest.targetCount) {
        // 完成任务领奖
        const expReward = 3500 + this.player.level * 400;
        const silverReward = 6000 + this.player.level * 500;
        this.player.silver += silverReward;
        this.player.gainExp(expReward);
        this.inventory.addItem('qianghua_shi', 2);
        if (Math.random() < 0.35) this.inventory.addItem('jinliu_lu', 1);

        window.Sound.playSuccess();
        alert(`【钟馗赏赐】降妖除魔大功告成！奖励你 ${expReward} 经验、${silverReward} 两银子、强化石*2！`);
        this.activeGhostQuest = null;
        this.checkQuestProgress('complete_ghost');
        this.render();
      } else {
        alert(`钟馗道：恶鬼尚未诛灭！速去【${window.GAME_DATA.MAPS[this.activeGhostQuest.mapId]?.name}】寻出【${this.activeGhostQuest.ghost.name}】斩杀！`);
      }
    } else {
      // 领取抓鬼任务
      const randomGhost = window.GAME_DATA.GHOST_TYPES[Math.floor(Math.random() * window.GAME_DATA.GHOST_TYPES.length)];
      const randomMap = window.GAME_DATA.GHOST_MAPS[Math.floor(Math.random() * window.GAME_DATA.GHOST_MAPS.length)];
      this.activeGhostQuest = {
        ghost: randomGhost,
        mapId: randomMap,
        targetCount: 1,
        currentCount: 0
      };
      window.Sound.playSuccess();
      alert(`【领受捉鬼令】钟馗严肃道：地府恶鬼【${randomGhost.name}】逃往【${window.GAME_DATA.MAPS[randomMap]?.name}】，速去降伏！`);
      this.render();
    }
  }

  // 任务进度检测
  checkQuestProgress(targetType) {
    const q = window.GAME_DATA.MAIN_QUESTS[this.currentMainQuestIndex];
    if (!q) return;

    if (q.targetType === targetType) {
      // 达成任务
      this.currentMainQuestIndex += 1;
      this.player.silver += q.rewards.silver;
      this.player.gainExp(q.rewards.exp);
      q.rewards.items.forEach(it => this.inventory.addItem(it.id, it.count));

      window.Sound.playVictory();
      window.Chat.addMessage('system', '主线大捷', `恭喜少侠达成主线任务【${q.title}】！获得丰厚经验与装备奖励！`);
      this.render();
    }
  }

  // =========================================================================
  // 弹窗管理 (角色、宠物、背包、商店、强化、存档)
  // =========================================================================
  openModal(modalName) {
    window.Sound.playBeep();
    this.activeModal = modalName;
    this.render();
  }

  closeModal() {
    window.Sound.playBeep();
    this.activeModal = null;
    this.render();
  }

  // 领养新手宠弹窗
  showAdoptPetModal() {
    if (this.pets.length > 0) {
      alert('宠物仙子笑道：少侠已经拥有灵兽相伴，不可贪心哦！若是想捕获更多伙伴，可去野外战斗中使用【捕捉】神符！');
      return;
    }

    const choice = confirm('宠物仙子：“这位初入江湖的少侠，你更喜欢皮糙肉厚的大海龟（确定），还是精通水攻的巨蛙（取消）？”');
    const petId = choice ? 'dahai_gui' : 'ju_wa';
    const newPet = window.PetSystem.createPet(petId, false, 0);
    this.pets.push(newPet);
    this.activePet = newPet;

    window.Sound.playSuccess();
    alert(`【灵宠认主】成功认领了一只可爱的【${newPet.name}】！已指派为出战召唤兽！`);
    this.checkQuestProgress('adopt_pet');
    this.render();
  }

  // 商店买卖弹窗
  showShopModal(goodsList) {
    this.activeShopGoods = goodsList;
    this.openModal('shop');
  }

  // 角色创角弹窗
  showCreateRoleModal() {
    this.activeModal = 'create_role';
    this.render();
  }

  // =========================================================================
  // 主视图渲染调度 (HTML 模板引擎)
  // =========================================================================
  render() {
    const viewport = document.getElementById('game-viewport');
    if (!viewport) return;

    // 检查是否有角色
    if (!this.player) {
      this.renderCreateRoleModal(viewport);
      return;
    }

    // 渲染主视口
    if (this.currentView === 'battle') {
      this.renderBattleView(viewport);
    } else {
      this.renderSceneView(viewport);
    }

    // 渲染模态弹窗（如果有）
    this.renderActiveModal(viewport);
  }

  // 渲染场景视口
  renderSceneView(container) {
    const map = window.GAME_DATA.MAPS[this.currentMapId];
    const mainQuest = window.GAME_DATA.MAIN_QUESTS[this.currentMainQuestIndex];

    let actionKeyCounter = 1;

    let html = `
      <!-- 场景顶部状态条 -->
      <div class="scene-header">
        <div class="scene-location">
          <span>${map.icon}</span>
          <span>${map.name}</span>
          <span style="font-size:10px;color:#998;">(${map.region})</span>
        </div>
        <div class="player-status-compact">
          <span class="stat-pill">Lv.${this.player.level} ${this.player.name}</span>
          <span class="stat-pill" style="color:#e74c3c;">HP ${this.player.hp}/${this.player.maxHp}</span>
          <span class="stat-pill" style="color:#3498db;">MP ${this.player.mp}/${this.player.maxMp}</span>
          <span class="stat-pill" style="color:#f1c40f;">🪙 ${this.player.silver}两</span>
        </div>
      </div>

      <!-- 视口主内容 -->
      <div class="viewport-content">
        <!-- 场景原画与描述 -->
        <div class="scene-art-banner">
          <span class="scene-art-icon">${map.icon}</span>
          <div class="scene-desc">${map.desc}</div>
        </div>

        <!-- NPC 对话框（如果正在对话中） -->
        ${this.dialogState ? `
          <div style="background:#22180f;border:2px solid #b88628;border-radius:4px;padding:8px;margin-bottom:6px;">
            <div style="color:#fef0cd;font-weight:bold;margin-bottom:4px;font-size:12px;">
              ${this.dialogState.npc.icon} ${this.dialogState.npc.name} ${this.dialogState.npc.title}：
            </div>
            <div style="color:#d8cbb8;font-size:11px;line-height:1.5;">
              "${this.dialogState.npc.dialogs[this.dialogState.step] || '少侠保重！'}"
            </div>
            <div style="text-align:right;margin-top:6px;">
              <button class="nav-btn" onclick="window.App.dialogState = null; window.App.render();" style="padding:2px 8px;">离开</button>
            </div>
          </div>
        ` : ''}

        <!-- 任务速览 -->
        <div style="background:#1b150f;border:1px solid #4a3a29;border-radius:4px;padding:5px 8px;font-size:11px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <span style="color:#ffd700;font-weight:bold;">【当前主线】</span>
            <span style="color:#ddd;">${mainQuest ? mainQuest.title : '已完成目前所有主线！'}</span>
          </div>
          <span style="font-size:10px;color:#a89;">${mainQuest ? mainQuest.desc : '期待后续更新'}</span>
        </div>

        <!-- 抓鬼任务追踪（如果已接） -->
        ${this.activeGhostQuest ? `
          <div style="background:#25110f;border:1px solid #8e2b20;border-radius:4px;padding:5px 8px;font-size:11px;display:flex;justify-content:space-between;align-items:center;">
            <span style="color:#ff6b6b;font-weight:bold;">👺 钟馗捉鬼令：前往【${window.GAME_DATA.MAPS[this.activeGhostQuest.mapId]?.name}】斩杀【${this.activeGhostQuest.ghost.name}】(${this.activeGhostQuest.currentCount}/${this.activeGhostQuest.targetCount})</span>
            <button class="nav-btn" onclick="window.App.switchMap('${this.activeGhostQuest.mapId}')" style="padding:1px 6px;font-size:10px;">前往</button>
          </div>
        ` : ''}

        <!-- 交互列表 -->
        <div class="interact-panel">
          <!-- 野外巡逻打怪 -->
          ${map.wildEnemies && map.wildEnemies.length > 0 ? `
            <div class="action-card" data-key="${actionKeyCounter}" onclick="window.App.triggerPatrol()">
              <div class="action-left">
                <span class="action-key-tag">[${actionKeyCounter++}]</span>
                <span>⚔️ 在此巡逻除妖 (暗雷遇怪)</span>
              </div>
              <div class="action-right">拔刀切磋 ▶</div>
            </div>
          ` : ''}

          <!-- 抓鬼遇怪按钮 (当处于指定地图且未完成时) -->
          ${this.activeGhostQuest && this.activeGhostQuest.mapId === this.currentMapId && this.activeGhostQuest.currentCount < this.activeGhostQuest.targetCount ? `
            <div class="action-card" style="border-color:#ff4444;" data-key="${actionKeyCounter}" onclick="window.App.triggerGhostBattle()">
              <div class="action-left">
                <span class="action-key-tag" style="background:#550000;color:#fff;">[${actionKeyCounter++}]</span>
                <span style="color:#ff6666;font-weight:bold;">👺 发现逃窜恶鬼【${this.activeGhostQuest.ghost.name}】！</span>
              </div>
              <div class="action-right" style="color:#ff4444;">捉拿恶鬼 ▶</div>
            </div>
          ` : ''}

          <!-- NPC 列表 -->
          <div class="section-label">📜 此地人物：</div>
          ${map.npcs.map(npc => `
            <div class="action-card" data-key="${actionKeyCounter}" onclick="window.App.interactWithNpc(window.GAME_DATA.MAPS['${this.currentMapId}'].npcs.find(n => n.id === '${npc.id}'))">
              <div class="action-left">
                <span class="action-key-tag">[${actionKeyCounter++}]</span>
                <span>${npc.icon} ${npc.name}</span>
                <span style="font-size:10px;color:#998;">${npc.title}</span>
              </div>
              <div class="action-right">互动 ▶</div>
            </div>
          `).join('')}

          <!-- 连接传送点列表 -->
          <div class="section-label">🚪 通往他处：</div>
          ${map.connected.map(conn => `
            <div class="action-card" data-key="${actionKeyCounter}" onclick="window.App.switchMap('${conn.mapId}')">
              <div class="action-left">
                <span class="action-key-tag">[${actionKeyCounter++}]</span>
                <span>🚶 ${conn.name}</span>
              </div>
              <div class="action-right">启程 ▶</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 底部快捷功能导航栏 -->
      <div class="bottom-dock">
        <div class="dock-btn" onclick="window.App.openModal('char')">
          <span class="dock-icon">👤</span>
          <span>角色</span>
        </div>
        <div class="dock-btn" onclick="window.App.openModal('pet')">
          <span class="dock-icon">🦁</span>
          <span>灵宠</span>
        </div>
        <div class="dock-btn" onclick="window.App.openModal('bag')">
          <span class="dock-icon">🎒</span>
          <span>包裹</span>
        </div>
        <div class="dock-btn" onclick="window.App.openModal('forge')">
          <span class="dock-icon">🔨</span>
          <span>强化</span>
        </div>
        <div class="dock-btn" onclick="window.App.openModal('quest')">
          <span class="dock-icon">📜</span>
          <span>任务</span>
        </div>
        <div class="dock-btn" onclick="window.App.openModal('save')">
          <span class="dock-icon">💾</span>
          <span>存档</span>
        </div>
      </div>

      <!-- 仿冒泡世界聊天室抽屉 -->
      ${this.renderChatDrawer()}
    `;

    container.innerHTML = html;
  }

  // 触发抓鬼专属战斗
  triggerGhostBattle() {
    if (!this.activeGhostQuest) return;
    const ghostData = this.activeGhostQuest.ghost;
    const lvl = this.player.level + 2;

    const ghostBoss = {
      id: 'ghost_boss',
      templateId: 'xixue_gui',
      name: ghostData.name,
      icon: ghostData.icon,
      isMutated: false,
      isBoss: true,
      catchRate: 0,
      level: lvl,
      hp: Math.floor((120 + lvl * 40) * ghostData.hpMult),
      maxHp: Math.floor((120 + lvl * 40) * ghostData.hpMult),
      mp: 200,
      maxMp: 200,
      atk: Math.floor((30 + lvl * 10) * ghostData.atkMult),
      def: Math.floor((20 + lvl * 8) * ghostData.defMult),
      matk: Math.floor(25 + lvl * 9),
      mdef: Math.floor(20 + lvl * 7),
      spd: Math.floor((15 + lvl * 3) * ghostData.spdMult),
      skills: ['吸血', '高级反震']
    };

    this.startBattle([ghostBoss], { isGhost: true });
  }

  // 渲染回合战斗视口
  renderBattleView(container) {
    let html = `
      <div class="battle-container">
        <!-- 战斗竞技擂台 -->
        <div class="battle-arena" id="battle-arena">
          <!-- 敌方单位排布 (顶部) -->
          <div class="enemy-formation">
            ${this.currentBattle.enemies.map((e, idx) => `
              <div class="combatant-unit ${idx === 0 ? 'selected-target' : ''}" data-enemy-index="${idx}" onclick="window.App.selectBattleTarget(${idx})">
                <div class="combatant-sprite">${e.hp > 0 ? e.icon : '💨'}</div>
                <div class="combatant-info">
                  <div class="combatant-name">${e.name} Lv.${e.level}</div>
                  <div class="bar-track">
                    <div class="bar-fill-hp" style="width:${Math.max(0, (e.hp / e.maxHp) * 100)}%;"></div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- 我方单位排布 (底部) -->
          <div class="ally-formation">
            <!-- 玩家单位 -->
            <div class="combatant-unit" style="cursor:default;">
              <div class="combatant-sprite">
                ${this.player.gender === 'male' ? '🧙‍♂️' : '🧝‍♀️'}
              </div>
              <div class="combatant-info">
                <div class="combatant-name">${this.player.name}</div>
                <div class="bar-track">
                  <div class="bar-fill-hp" style="width:${Math.max(0, (this.player.hp / this.player.maxHp) * 100)}%;"></div>
                </div>
                <div class="bar-track">
                  <div class="bar-fill-mp" style="width:${Math.max(0, (this.player.mp / this.player.maxMp) * 100)}%;"></div>
                </div>
              </div>
            </div>

            <!-- 出战召唤兽单位 -->
            ${this.activePet ? `
              <div class="combatant-unit" style="cursor:default;">
                <div class="combatant-sprite">${this.activePet.hp > 0 ? this.activePet.icon : '🪦'}</div>
                <div class="combatant-info">
                  <div class="combatant-name">${this.activePet.name}</div>
                  <div class="bar-track">
                    <div class="bar-fill-hp" style="width:${Math.max(0, (this.activePet.hp / this.activePet.maxHp) * 100)}%;"></div>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- 战斗操作指令矩阵 (九宫格快捷指令) -->
        <div class="battle-cmd-grid">
          <button class="battle-cmd-btn" data-key="1" onclick="window.App.handleBattleCommand('attack')">
            <span>[1] ⚔️ 普攻</span>
          </button>
          <button class="battle-cmd-btn" data-key="2" onclick="window.App.showBattleSkillMenu()">
            <span>[2] ✨ 技能法术</span>
          </button>
          <button class="battle-cmd-btn" data-key="3" onclick="window.App.handleBattleCommand('capture')">
            <span>[3] 🕸️ 捕捉灵兽</span>
          </button>
          <button class="battle-cmd-btn" data-key="4" onclick="window.App.showBattleItemMenu()">
            <span>[4] 💊 药品道具</span>
          </button>
          <button class="battle-cmd-btn" data-key="5" onclick="window.App.handleBattleCommand('defend')">
            <span>[5] 🛡️ 凝神防御</span>
          </button>
          <button class="battle-cmd-btn" data-key="6" onclick="window.App.handleBattleCommand('flee')">
            <span>[6] 🏃 撤退逃跑</span>
          </button>
        </div>

        <!-- 战斗日志窗口 -->
        <div class="battle-log-box" id="battle-log-box">
          ${this.currentBattle.logs.slice(-6).map(l => `<div>${l}</div>`).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;

    // 滚动战报到底部
    const logBox = document.getElementById('battle-log-box');
    if (logBox) logBox.scrollTop = logBox.scrollHeight;
  }

  // 局部仅更新战斗竞技场血条
  renderBattleArena() {
    const arena = document.getElementById('battle-arena');
    if (!arena || !this.currentBattle) return;

    // 更新敌方血条
    this.currentBattle.enemies.forEach((e, idx) => {
      const el = arena.querySelector(`[data-enemy-index="${idx}"]`);
      if (el) {
        const hpBar = el.querySelector('.bar-fill-hp');
        if (hpBar) hpBar.style.width = `${Math.max(0, (e.hp / e.maxHp) * 100)}%`;
        if (e.hp <= 0) {
          const sprite = el.querySelector('.combatant-sprite');
          if (sprite) sprite.innerText = '💨';
        }
      }
    });

    // 更新日志
    const logBox = document.getElementById('battle-log-box');
    if (logBox) {
      logBox.innerHTML = this.currentBattle.logs.slice(-6).map(l => `<div>${l}</div>`).join('');
      logBox.scrollTop = logBox.scrollHeight;
    }
  }

  selectBattleTarget(idx) {
    window.Sound.playBeep();
    const units = document.querySelectorAll('.combatant-unit[data-enemy-index]');
    units.forEach(u => u.classList.remove('selected-target'));
    const target = document.querySelector(`.combatant-unit[data-enemy-index="${idx}"]`);
    if (target) target.classList.add('selected-target');
  }

  // 战斗施法技能菜单
  showBattleSkillMenu() {
    const skills = this.player.getSkills();
    if (skills.length === 0) {
      alert('少侠尚未领悟任何可用法术！');
      return;
    }

    let menuHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:280px;">
          <div class="modal-header">
            <span class="modal-title">✨ 选择释放法术</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body">
            ${skills.map((s, i) => `
              <div class="action-card" onclick="window.App.handleBattleCommand('skill', { skillId: '${s.id}' }); this.closest('.modal-overlay').remove();" style="margin-bottom:6px;">
                <div class="action-left">
                  <span>${s.icon} ${s.name}</span>
                </div>
                <div class="action-right" style="font-size:10px;color:#3498db;">
                  ${s.costMp ? `消耗 ${s.costMp} MP` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', menuHtml);
  }

  // 战斗使用药品菜单
  showBattleItemMenu() {
    const items = this.inventory.getItems().filter(s => {
      const it = window.GAME_DATA.ITEMS[s.itemId];
      return it && it.type === 'consumable' && (it.effect.hp || it.effect.mp);
    });

    if (items.length === 0) {
      alert('背包中没有可在战斗中疗伤恢复的灵药！');
      return;
    }

    let menuHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:280px;">
          <div class="modal-header">
            <span class="modal-title">💊 使用战斗药品</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body">
            ${items.map(slot => {
              const it = window.GAME_DATA.ITEMS[slot.itemId];
              return `
                <div class="action-card" onclick="window.App.handleBattleCommand('item', { itemId: '${it.id}' }); this.closest('.modal-overlay').remove();" style="margin-bottom:6px;">
                  <div class="action-left">
                    <span>${it.icon} ${it.name} x${slot.count}</span>
                  </div>
                  <div class="action-right" style="font-size:10px;color:#2ecc71;">
                    使用 ▶
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', menuHtml);
  }

  // 渲染冒泡社区公屏
  renderChatDrawer() {
    return `
      <div class="chat-drawer">
        <div class="chat-tab-row">
          <div class="chat-tab active" onclick="window.App.switchChatChannel('all')">综合</div>
          <div class="chat-tab" onclick="window.App.switchChatChannel('world')">世界</div>
          <div class="chat-tab" onclick="window.App.switchChatChannel('rumor')">传闻</div>
        </div>
        <div class="chat-messages" id="chat-messages-container">
          ${window.Chat.messages.slice(-8).map(m => `
            <div class="chat-line ${m.channel}">
              <span style="color:#777;">[${m.time}]</span>
              <span style="font-weight:bold;">${m.sender}:</span>
              <span>${m.content}</span>
            </div>
          `).join('')}
        </div>
        <div class="chat-input-row">
          <input type="text" id="chat-input-box" class="chat-input" placeholder="输入世界喊话内容..." maxlength="40" onkeydown="if(event.key==='Enter') window.App.sendChatMessage();">
          <button class="chat-send-btn" onclick="window.App.sendChatMessage()">发送</button>
        </div>
      </div>
    `;
  }

  renderChatMessages() {
    const box = document.getElementById('chat-messages-container');
    if (!box) return;
    box.innerHTML = window.Chat.messages.slice(-8).map(m => `
      <div class="chat-line ${m.channel}">
        <span style="color:#777;">[${m.time}]</span>
        <span style="font-weight:bold;">${m.sender}:</span>
        <span>${m.content}</span>
      </div>
    `).join('');
    box.scrollTop = box.scrollHeight;
  }

  sendChatMessage() {
    const input = document.getElementById('chat-input-box');
    if (!input || !input.value.trim()) return;
    window.Chat.sendPlayerMessage(this.player, input.value.trim());
    input.value = '';
    window.Sound.playBeep();
  }

  // =========================================================================
  // 模态弹窗渲染器 (角色、宠物、背包、强化、商城、任务、存档)
  // =========================================================================
  renderActiveModal(container) {
    if (!this.activeModal) return;

    let modalContent = '';
    if (this.activeModal === 'char') modalContent = this.renderCharModal();
    if (this.activeModal === 'pet') modalContent = this.renderPetModal();
    if (this.activeModal === 'bag') modalContent = this.renderBagModal();
    if (this.activeModal === 'forge') modalContent = this.renderForgeModal();
    if (this.activeModal === 'shop') modalContent = this.renderShopModal();
    if (this.activeModal === 'quest') modalContent = this.renderQuestModal();
    if (this.activeModal === 'save') modalContent = this.renderSaveModal();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = modalContent;
    container.appendChild(overlay);
  }

  // 1. 角色面板
  renderCharModal() {
    const p = this.player;
    const cls = window.GAME_DATA.CLASSES[p.classId];

    return `
      <div class="modal-window">
        <div class="modal-header">
          <span class="modal-title">👤 角色属性与加点</span>
          <button class="modal-close-btn" onclick="window.App.closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;background:#1b150f;padding:6px;border-radius:4px;">
            <div style="font-size:32px;">${p.gender === 'male' ? '🧙‍♂️' : '🧝‍♀️'}</div>
            <div>
              <div style="font-size:13px;font-weight:bold;color:#ffd700;">${p.name} (Lv.${p.level})</div>
              <div style="font-size:10px;color:#bbb;">门派：${cls.name} · 性别：${p.gender === 'male' ? '乾(男)' : '坤(女)'}</div>
              <div style="font-size:10px;color:#aaa;">升级经验：${p.exp} / ${p.getNextLevelExp()}</div>
            </div>
          </div>

          <!-- 六维战力数值 -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;background:#18120d;padding:6px;border-radius:4px;font-size:11px;">
            <div>气血上限：<span style="color:#2ecc71;">${p.maxHp}</span></div>
            <div>法力上限：<span style="color:#3498db;">${p.maxMp}</span></div>
            <div>物理攻击：<span style="color:#e67e22;">${p.atk}</span></div>
            <div>物理防御：<span style="color:#95a5a6;">${p.def}</span></div>
            <div>法术伤害：<span style="color:#9b59b6;">${p.matk}</span></div>
            <div>出手速度：<span style="color:#1abc9c;">${p.spd}</span></div>
          </div>

          <!-- 五维潜能自由分配 -->
          <div style="background:#201710;border:1px solid #4a3828;border-radius:4px;padding:6px;margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="font-weight:bold;color:#f1c40f;">五维加点分配</span>
              <span style="color:#ffd700;">剩余潜能点：${p.potentialPoints}</span>
            </div>
            ${[
              { id: 'con', name: '体质 (气血)', val: p.attributes.con },
              { id: 'str', name: '力量 (物攻)', val: p.attributes.str },
              { id: 'int', name: '法力 (法伤)', val: p.attributes.int },
              { id: 'dex', name: '敏捷 (速度)', val: p.attributes.dex },
              { id: 'sta', name: '耐力 (防御)', val: p.attributes.sta }
            ].map(attr => `
              <div style="display:flex;justify-content:space-between;align-items:center;margin:3px 0;font-size:11px;">
                <span>${attr.name}：${attr.val}</span>
                <button class="nav-btn" ${p.potentialPoints <= 0 ? 'disabled style="opacity:0.4;"' : ''} onclick="window.App.allocatePoint('${attr.id}')" style="padding:1px 6px;">+1点</button>
              </div>
            `).join('')}
          </div>

          <!-- 六大装备栏 -->
          <div style="background:#1b140e;border:1px solid #443221;border-radius:4px;padding:6px;">
            <div style="font-weight:bold;color:#e6c88b;margin-bottom:4px;">穿戴装备</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:10px;">
              ${['weapon', 'head', 'armor', 'belt', 'boots', 'necklace'].map(slot => {
                const eq = p.equipment[slot];
                const baseItem = eq ? window.GAME_DATA.ITEMS[eq.itemId] : null;
                return `
                  <div style="background:#140e08;border:1px solid #36281a;padding:4px;border-radius:3px;display:flex;justify-content:space-between;align-items:center;">
                    <span>${baseItem ? `${baseItem.icon} ${baseItem.name} ${eq.star ? `+${eq.star}` : ''}` : '【空部位】'}</span>
                    ${eq ? `<button class="nav-btn" onclick="window.App.unequipSlot('${slot}')" style="padding:0 4px;font-size:9px;">卸下</button>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  allocatePoint(attrName) {
    if (this.player.allocatePoints(attrName, 1)) {
      window.Sound.playSuccess();
      this.render();
    }
  }

  unequipSlot(slot) {
    const unequipped = this.player.unequipItem(slot);
    if (unequipped) {
      this.inventory.addItem(unequipped.itemId, 1, { star: unequipped.star });
      window.Sound.playSuccess();
      this.render();
    }
  }

  // 2. 召唤兽（宠物）面板
  renderPetModal() {
    if (this.pets.length === 0) {
      return `
        <div class="modal-window">
          <div class="modal-header">
            <span class="modal-title">🦁 召唤兽栏</span>
            <button class="modal-close-btn" onclick="window.App.closeModal()">✕</button>
          </div>
          <div class="modal-body" style="text-align:center;padding:30px 10px;">
            <div style="font-size:36px;margin-bottom:10px;">🐾</div>
            <div style="color:#aaa;margin-bottom:10px;">少侠囊中空空，尚未捕获任何召唤兽！</div>
            <div style="font-size:10px;color:#777;">前往东海渔村向宠物仙子领养，或在野外战斗中使用【捕捉】神符！</div>
          </div>
        </div>
      `;
    }

    const cur = this.activePet || this.pets[0];

    return `
      <div class="modal-window">
        <div class="modal-header">
          <span class="modal-title">🦁 召唤兽 (携带: ${this.pets.length}/8)</span>
          <button class="modal-close-btn" onclick="window.App.closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <!-- 宠物选择栏 -->
          <div style="display:flex;gap:4px;overflow-x:auto;margin-bottom:8px;padding-bottom:4px;">
            ${this.pets.map(p => `
              <div onclick="window.App.selectActivePet('${p.instanceId}')" style="padding:4px 8px;border-radius:4px;background:${p.instanceId === cur.instanceId ? '#b88628' : '#221910'};border:1px solid #4a3a2a;cursor:pointer;white-space:nowrap;font-size:10px;">
                ${p.icon} ${p.name} ${p.instanceId === this.activePet?.instanceId ? '【参战】' : ''}
              </div>
            `).join('')}
          </div>

          <!-- 选定宠物详细属性 -->
          <div style="background:#1b150f;border:1px solid #453424;border-radius:4px;padding:8px;margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-size:13px;font-weight:bold;color:#f39c12;">${cur.icon} ${cur.name} (Lv.${cur.level})</span>
              <span style="font-size:10px;color:#2ecc71;">成长率: ${cur.growth}</span>
            </div>

            <!-- 资质 -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:10px;background:#140e08;padding:4px;border-radius:3px;margin-bottom:6px;">
              <div>气血资质：${cur.aptitudes.hp}</div>
              <div>攻击资质：${cur.aptitudes.atk}</div>
              <div>防御资质：${cur.aptitudes.def}</div>
              <div>法力资质：${cur.aptitudes.matk}</div>
              <div>速度资质：${cur.aptitudes.spd}</div>
              <div>当前忠诚：${cur.loyalty}/100</div>
            </div>

            <!-- 技能 -->
            <div style="font-size:10px;margin-bottom:6px;">
              <div style="color:#e6b85c;font-weight:bold;margin-bottom:2px;">技能掌握 (${cur.skills.length}个)：</div>
              <div style="display:flex;flex-wrap:wrap;gap:4px;">
                ${cur.skills.map(sk => `<span style="background:#3d2f21;color:#ffde59;padding:2px 6px;border-radius:3px;border:1px solid #5a4531;">${sk}</span>`).join('')}
              </div>
            </div>

            <!-- 养成互动快捷键 -->
            <div style="display:flex;gap:6px;margin-top:8px;">
              <button class="nav-btn" onclick="window.App.setActivePet('${cur.instanceId}')" style="flex:1;">
                ${cur.instanceId === this.activePet?.instanceId ? '已在参战中' : '⚔️ 指派参战'}
              </button>
              <button class="nav-btn" onclick="window.App.quickWashPet('${cur.instanceId}')" style="flex:1;">
                🏺 金柳露洗髓
              </button>
              <button class="nav-btn" onclick="window.App.showFusePetModal('${cur.instanceId}')" style="flex:1;">
                🔥 炼妖合成
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  selectActivePet(instanceId) {
    this.activePet = this.pets.find(p => p.instanceId === instanceId) || this.activePet;
    window.Sound.playBeep();
    this.render();
  }

  setActivePet(instanceId) {
    this.activePet = this.pets.find(p => p.instanceId === instanceId);
    window.Sound.playSuccess();
    alert(`【召唤兽出战】已指派【${this.activePet.name}】协助你作战！`);
    this.render();
  }

  quickWashPet(instanceId) {
    const pet = this.pets.find(p => p.instanceId === instanceId);
    if (!pet) return;

    if (this.inventory.getItemCount('jinliu_lu') < 1) {
      alert('背包中未发现【金柳露】！可在长安城万宝斋商铺购买！');
      return;
    }

    const res = this.inventory.useItem(
      this.inventory.getItems().find(s => s.itemId === 'jinliu_lu').instanceId,
      this.player,
      pet
    );
    alert(res.msg);
    this.render();
  }

  showFusePetModal(petAInstanceId) {
    const otherPets = this.pets.filter(p => p.instanceId !== petAInstanceId && !p.isGodPet);
    if (otherPets.length === 0) {
      alert('炼妖需要至少两只可熔铸的召唤兽胚子！请先捕获更多宠物！');
      return;
    }

    const petA = this.pets.find(p => p.instanceId === petAInstanceId);
    let selectHtml = otherPets.map((p, i) => `${i + 1}. ${p.name} (Lv.${p.level}, 技能数:${p.skills.length})`).join('\n');
    const pick = prompt(`【太上老君炼妖炉】\n主胚子：${petA.name}\n请选择要融合的副胚子序号：\n${selectHtml}`);

    const idx = parseInt(pick, 10) - 1;
    if (isNaN(idx) || idx < 0 || idx >= otherPets.length) return;

    const petB = otherPets[idx];
    const res = window.PetSystem.fuse(petA, petB);
    if (res.success) {
      // 移除原有的两只，加入全新的一只
      this.pets = this.pets.filter(p => p.instanceId !== petA.instanceId && p.instanceId !== petB.instanceId);
      this.pets.push(res.newPet);
      this.activePet = res.newPet;
      window.Sound.playSuccess();
      alert(res.msg);
      this.render();
    } else {
      alert(res.msg);
    }
  }

  // 3. 背包面板
  renderBagModal() {
    const slots = this.inventory.getItems();

    return `
      <div class="modal-window">
        <div class="modal-header">
          <span class="modal-title">🎒 行囊包裹 (${slots.length}/${this.inventory.maxSlots})</span>
          <button class="modal-close-btn" onclick="window.App.closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div style="font-size:10px;color:#aaa;margin-bottom:6px;">点击物品进行佩戴、使用或查阅属性：</div>
          <div class="inventory-grid">
            ${slots.map(s => {
              const it = window.GAME_DATA.ITEMS[s.itemId];
              const star = (s.equipData && s.equipData.star) || 0;
              const glowClass = window.ForgeSystem.getGlowClass(star);

              return `
                <div class="item-slot ${glowClass}" onclick="window.App.inspectInventoryItem('${s.instanceId}')">
                  <div class="item-slot-icon">${it ? it.icon : '❓'}</div>
                  ${s.count > 1 ? `<div class="item-slot-count">${s.count}</div>` : ''}
                  ${star > 0 ? `<div class="item-slot-star">+${star}</div>` : ''}
                </div>
              `;
            }).join('')}
            ${Array(Math.max(0, this.inventory.maxSlots - slots.length)).fill(0).map(() => `
              <div class="item-slot" style="opacity:0.3;cursor:default;"></div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  inspectInventoryItem(instanceId) {
    const slot = this.inventory.getItems().find(s => s.instanceId === instanceId);
    if (!slot) return;
    const it = window.GAME_DATA.ITEMS[slot.itemId];
    const star = (slot.equipData && slot.equipData.star) || 0;

    let detail = `【${it.name}】${star > 0 ? ` (+${star}星)` : ''}\n${it.desc}\n`;
    if (it.attrs) {
      detail += `属性加成：` + Object.entries(it.attrs).map(([k, v]) => `${k}+${Math.floor(v * (1 + star * 0.12))}`).join(' ') + '\n';
    }

    const action = confirm(`${detail}\n是否立即使用或穿戴？`);
    if (action) {
      const res = this.inventory.useItem(instanceId, this.player, this.activePet);
      alert(res.msg);
      if (res.teleportMap) {
        this.switchMap(res.teleportMap);
      }
      this.render();
    }
  }

  // 4. 铁匠铺神兵强化面板
  renderForgeModal() {
    // 找出背包与身上的所有装备
    const equipOptions = [];

    // 穿戴中的
    Object.entries(this.player.equipment).forEach(([slot, eq]) => {
      if (eq) {
        const it = window.GAME_DATA.ITEMS[eq.itemId];
        equipOptions.push({ source: 'player', slot: slot, equipObj: eq, name: `[身上] ${it.name} (+${eq.star || 0})` });
      }
    });

    // 背包里的
    this.inventory.getItems().forEach(slot => {
      const it = window.GAME_DATA.ITEMS[slot.itemId];
      if (it && it.type === 'equip') {
        const star = (slot.equipData && slot.equipData.star) || 0;
        equipOptions.push({ source: 'inventory', slotInstanceId: slot.instanceId, equipObj: slot.equipData, name: `[包裹] ${it.name} (+${star})` });
      }
    });

    const stonesCount = this.inventory.getItemCount('qianghua_shi');
    const protectCount = this.inventory.getItemCount('dingxing_shi');

    return `
      <div class="modal-window">
        <div class="modal-header">
          <span class="modal-title">🔨 长安铁匠铺 · 神兵淬火</span>
          <button class="modal-close-btn" onclick="window.App.closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div style="background:#1a130c;padding:6px;border-radius:4px;margin-bottom:8px;font-size:10px;line-height:1.4;color:#bbb;">
            🔥 强化可大幅提升装备各项词条威力，最高强化至 +12 星！<br>
            拥有强化石：<span style="color:#ffd700;">${stonesCount}</span> 颗 · 拥有定星石：<span style="color:#3498db;">${protectCount}</span> 颗
          </div>

          ${equipOptions.length === 0 ? `
            <div style="text-align:center;padding:20px 0;color:#888;">身上与行囊中暂无装备可供淬火强化！</div>
          ` : `
            <div style="margin-bottom:8px;">
              <label style="font-size:11px;color:#e6c88b;">请选择要淬火强化的神兵：</label>
              <select id="forge-select" style="width:100%;background:#150f09;color:#fff;border:1px solid #5a4531;padding:5px;border-radius:4px;margin-top:4px;">
                ${equipOptions.map((opt, i) => `<option value="${i}">${opt.name}</option>`).join('')}
              </select>
            </div>

            <div style="margin-bottom:10px;">
              <label style="font-size:11px;color:#3498db;display:flex;align-items:center;gap:4px;cursor:pointer;">
                <input type="checkbox" id="forge-protect-chk">
                使用【定星石】保护防降级 (失败不掉星)
              </label>
            </div>

            <button class="nav-btn" onclick="window.App.executeForge()" style="width:100%;justify-content:center;padding:8px 0;font-size:12px;background:#962d22;border-color:#e74c3c;">
              🔥 开始淬火强化
            </button>
          `}
        </div>
      </div>
    `;
  }

  executeForge() {
    const sel = document.getElementById('forge-select');
    if (!sel) return;
    const idx = parseInt(sel.value, 10);
    const useProtect = !!document.getElementById('forge-protect-chk')?.checked;

    // 获取选定装备
    const equipOptions = [];
    Object.entries(this.player.equipment).forEach(([slot, eq]) => {
      if (eq) equipOptions.push({ source: 'player', slot: slot, equipObj: eq });
    });
    this.inventory.getItems().forEach(slot => {
      const it = window.GAME_DATA.ITEMS[slot.itemId];
      if (it && it.type === 'equip') {
        equipOptions.push({ source: 'inventory', slotInstanceId: slot.instanceId, equipObj: slot.equipData });
      }
    });

    const chosen = equipOptions[idx];
    if (!chosen) return;

    const res = window.ForgeSystem.enhance(chosen.equipObj, this.inventory, this.player, useProtect);
    alert(res.msg);

    if (res.success && res.star >= 1) {
      this.checkQuestProgress('forge_enhance');
    }

    this.render();
  }

  // 5. 商店购买面板
  renderShopModal() {
    const goods = this.activeShopGoods || [];

    return `
      <div class="modal-window">
        <div class="modal-header">
          <span class="modal-title">🏮 商铺货架 (现有银两: ${this.player.silver}两)</span>
          <button class="modal-close-btn" onclick="window.App.closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div style="display:flex;flex-direction:column;gap:6px;">
            ${goods.map(itemId => {
              const it = window.GAME_DATA.ITEMS[itemId];
              if (!it) return '';
              return `
                <div class="action-card" onclick="window.App.buyShopItem('${it.id}')">
                  <div class="action-left">
                    <span style="font-size:18px;">${it.icon}</span>
                    <div>
                      <div style="font-weight:bold;color:#ffd700;">${it.name}</div>
                      <div style="font-size:9px;color:#aaa;">${it.desc}</div>
                    </div>
                  </div>
                  <div class="action-right" style="color:#2ecc71;">
                    🪙 ${it.price}两 购买
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  buyShopItem(itemId) {
    const it = window.GAME_DATA.ITEMS[itemId];
    if (!it) return;

    if (this.player.silver < it.price) {
      alert('银两不足，快去降妖伏魔或抓鬼赚取赏银吧！');
      return;
    }

    this.player.silver -= it.price;
    this.inventory.addItem(itemId, 1);
    window.Sound.playSuccess();
    alert(`成功购入了【${it.name}】！`);
    this.render();
  }

  // 6. 任务面板
  renderQuestModal() {
    const mainQuest = window.GAME_DATA.MAIN_QUESTS[this.currentMainQuestIndex];

    return `
      <div class="modal-window">
        <div class="modal-header">
          <span class="modal-title">📜 任务卷轴</span>
          <button class="modal-close-btn" onclick="window.App.closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <!-- 主线 -->
          <div style="background:#1e160e;border:1px solid #5a4531;border-radius:4px;padding:8px;margin-bottom:8px;">
            <div style="color:#ffd700;font-weight:bold;margin-bottom:4px;">西行主线剧情</div>
            ${mainQuest ? `
              <div style="font-size:12px;color:#fff;font-weight:bold;">${mainQuest.title}</div>
              <div style="font-size:11px;color:#ccc;margin:4px 0;">${mainQuest.desc}</div>
              <div style="font-size:10px;color:#2ecc71;">奖励：经验 +${mainQuest.rewards.exp}，银两 +${mainQuest.rewards.silver}</div>
            ` : `
              <div style="color:#aaa;">少侠威震三界，已圆满完成当期所有主线！</div>
            `}
          </div>

          <!-- 抓鬼 -->
          <div style="background:#1e160e;border:1px solid #5a4531;border-radius:4px;padding:8px;">
            <div style="color:#e74c3c;font-weight:bold;margin-bottom:4px;">钟馗捉鬼日常</div>
            ${this.activeGhostQuest ? `
              <div style="font-size:11px;color:#ddd;">
                目标：前往【${window.GAME_DATA.MAPS[this.activeGhostQuest.mapId]?.name}】斩杀【${this.activeGhostQuest.ghost.name}】<br>
                进度：${this.activeGhostQuest.currentCount} / ${this.activeGhostQuest.targetCount}
              </div>
            ` : `
              <div style="font-size:11px;color:#aaa;">暂未领取捉鬼令。可前往【长安城】寻找天师钟馗领命！</div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  // 7. 存档管理与导出导入面板
  renderSaveModal() {
    return `
      <div class="modal-window">
        <div class="modal-header">
          <span class="modal-title">💾 存档与数据备份</span>
          <button class="modal-close-btn" onclick="window.App.closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div style="margin-bottom:8px;">
            <button class="nav-btn" onclick="window.App.saveCurrentGame(true)" style="width:100%;justify-content:center;padding:7px 0;margin-bottom:6px;">
              💾 立即手动保存进度到本地
            </button>
            <button class="nav-btn" onclick="window.App.exportSaveText()" style="width:100%;justify-content:center;padding:7px 0;margin-bottom:6px;">
              📤 导出当前存档数据 (复制JSON)
            </button>
            <button class="nav-btn" onclick="window.App.importSaveText()" style="width:100%;justify-content:center;padding:7px 0;margin-bottom:6px;background:#382218;">
              📥 导入外部存档恢复进度
            </button>
            <button class="nav-btn" onclick="window.App.resetGameConfirm()" style="width:100%;justify-content:center;padding:7px 0;background:#631818;border-color:#e74c3c;">
              ⚠️ 重置存档重新开局
            </button>
          </div>
          <div style="font-size:9px;color:#777;text-align:center;">
            游戏每隔 20 秒会自动即时保存，放心闯荡三界！
          </div>
        </div>
      </div>
    `;
  }

  exportSaveText() {
    const json = JSON.stringify(this.exportSaveData(), null, 2);
    navigator.clipboard?.writeText(json);
    prompt('已将存档复制到剪贴板，您也可以直接复制下方内容保存：', json);
  }

  importSaveText() {
    const input = prompt('请粘贴您之前导出的完整存档 JSON 字符串：');
    if (!input) return;
    try {
      const data = JSON.parse(input);
      this.loadFromData(data);
      this.saveCurrentGame(false);
      window.Sound.playSuccess();
      alert('【存档载入成功】欢迎重返汉风西游世界！');
      this.closeModal();
    } catch (e) {
      alert('存档数据有误，解析失败！');
    }
  }

  resetGameConfirm() {
    if (confirm('警告：确定要彻底清除当前进度、重新创建角色吗？该操作无法撤销！')) {
      window.SaveManager.deleteSave(1);
      location.reload();
    }
  }

  // 8. 创角向导弹窗
  renderCreateRoleModal(container) {
    let html = `
      <div class="modal-overlay">
        <div class="modal-window" style="max-width:320px;">
          <div class="modal-header">
            <span class="modal-title">📜 踏足三界 · 创立名号</span>
          </div>
          <div class="modal-body">
            <div style="text-align:center;margin-bottom:8px;">
              <span style="font-size:36px;">🌅</span>
              <div style="font-size:12px;color:#fef0cd;font-weight:bold;margin-top:2px;">汉风西游 · 冒泡怀旧复刻</div>
              <div style="font-size:10px;color:#aaa;">梦回当年神机少年时</div>
            </div>

            <div style="margin-bottom:6px;">
              <label style="font-size:10px;color:#ccc;">侠士大名：</label>
              <input type="text" id="role-name-input" value="逍遥生" maxlength="6" style="width:100%;background:#18110a;border:1px solid #4a3828;color:#ffd700;padding:5px;border-radius:3px;font-size:12px;font-weight:bold;">
            </div>

            <div style="margin-bottom:6px;">
              <label style="font-size:10px;color:#ccc;">选择门派宗脉：</label>
              <select id="role-class-select" style="width:100%;background:#18110a;border:1px solid #4a3828;color:#fff;padding:5px;border-radius:3px;font-size:11px;">
                <option value="jingang">【金刚】佛门罗汉·舍生取义·近战肉搏</option>
                <option value="xianren">【仙人】玄门妙法·乱魂定身·控场大师</option>
                <option value="yaomo">【妖魔】焚天剧毒·飞砂走石·暴力群攻</option>
              </select>
            </div>

            <div style="margin-bottom:12px;">
              <label style="font-size:10px;color:#ccc;">选择角色阴阳：</label>
              <select id="role-gender-select" style="width:100%;background:#18110a;border:1px solid #4a3828;color:#fff;padding:5px;border-radius:3px;font-size:11px;">
                <option value="male">乾位 (男儿身 - 仗剑天下)</option>
                <option value="female">坤位 (女儿身 - 巾帼豪杰)</option>
              </select>
            </div>

            <button class="nav-btn default-confirm-btn" onclick="window.App.submitCreateRole()" style="width:100%;justify-content:center;padding:8px 0;background:#c0392b;border-color:#ffd700;font-size:13px;font-weight:bold;">
              ✨ 踏上修仙取经路
            </button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  submitCreateRole() {
    const name = document.getElementById('role-name-input')?.value.trim() || '逍遥生';
    const classId = document.getElementById('role-class-select')?.value || 'jingang';
    const gender = document.getElementById('role-gender-select')?.value || 'male';
    window.Sound.playSuccess();
    this.createNewCharacter(name, classId, gender);
  }
}

window.App = new GameApp();
window.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});
