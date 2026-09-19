/**
 * 汉风西游 - 2D自由探索与正统西游主线调度引擎 (App2D 2.0)
 * 全面整合：
 * 1. 彻底修复对话选项全屏遮挡卡死Bug
 * 2. 彻底抛弃 Emoji，全场景与战斗采用 Portraits 国风高精立绘
 * 3. 默认 760×480 宽屏神话沉浸画卷，隐藏实体按键
 * 4. 左上角雷达小地图系统 (MiniMap) 与主线金色感叹号指引
 * 5. 场景鼠标点击 A* 避障自动寻路与智能交互 (点击空地走过去并播放金色光圈，点击NPC寻路至身旁并自动对话)
 * 6. 天庭御马监坐骑培养与蟠桃胜境吃桃升级
 */

class GameApp2D {
  constructor() {
    this.canvas = null;
    this.ctx = null;

    this.tilemap = new window.TilemapEngine(32);
    this.camera = new window.Camera(760, 480);
    this.pathfinding = new window.PathfindingEngine(32);
    this.minimap = window.MiniMapEngine;

    // 主线进度: 'heaven_prologue' | 'liujiacun_start' | 'liujiacun_hunted' | 'changan_met_monk' | 'wuxingshan_ready' | 'wuxing_freed'
    this.storyPhase = 'heaven_prologue';

    this.currentMapId = 'tiangong_palace';
    this.playerChar = null;
    this.playerData = null;
    this.inventory = null;

    // 坐骑与蟠桃系统
    this.mountSystem = new window.MountSystem();
    this.peachGarden = new window.PeachGarden();

    // 实体与同伴
    this.npcs = [];
    this.monsters = [];
    this.companions = [];

    // 粒子系统
    this.particleSystem = new window.ParticleSystem();

    // 仙宠系统 (随行仙宠与出战队伍)
    this.pets = [];
    this.activeCombatPets = [];

    // 自动寻路与点击特效
    this.autoMovePath = [];
    this.autoMoveTargetCallback = null;
    this.clickRipples = [];

    // 输入与循环状态
    this.keysDown = {};
    this.isPaused = false;
    this.currentBattle = null;
  }

  // 初始化入口
  init() {
    this.canvas = document.getElementById('game-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // 默认设置为大屏高清画质
    this.canvas.width = 760;
    this.canvas.height = 480;
    this.camera.viewportWidth = 760;
    this.camera.viewportHeight = 480;

    // 1. 初始化玩家数据 (天将开局)
    this.playerData = new window.Player({
      name: '威灵大将',
      classId: 'jingang',
      gender: 'male',
      level: 50,
      silver: 15000
    });

    this.inventory = new window.Inventory([
      // 装备
      { instanceId: 'it_tian1', itemId: 'eq_wp_bawangqiang', count: 1, equipData: { star: 5, sockets: ['gem_hongmanao', null, null] } },
      { instanceId: 'it_tian2', itemId: 'eq_am_huangjin', count: 1, equipData: { star: 5, sockets: ['gem_jingang', null, null] } },
      { instanceId: 'it_eq3', itemId: 'eq_hd_zijin', count: 1, equipData: { star: 3, sockets: [null, null, null] } },
      { instanceId: 'it_eq4', itemId: 'eq_bt_zhuifeng', count: 1, equipData: { star: 3, sockets: [null, null, null] } },
      // 药品
      { instanceId: 'it_tian3', itemId: 'jinchuang_yao', count: 20 },
      { instanceId: 'it_tian3_2', itemId: 'dahuan_dan', count: 5 },
      { instanceId: 'it_tian3_3', itemId: 'jiuzhuan_dan', count: 2 },
      { instanceId: 'it_tian3_4', itemId: 'foshou', count: 15 },
      // 宝石 (可镶嵌于装备，最多3孔)
      { instanceId: 'it_gem1', itemId: 'gem_jingang', count: 2 },
      { instanceId: 'it_gem2', itemId: 'gem_sheli', count: 1 },
      { instanceId: 'it_gem3', itemId: 'gem_pilei', count: 2 },
      { instanceId: 'it_gem4', itemId: 'gem_hongmanao', count: 2 },
      { instanceId: 'it_gem5', itemId: 'gem_guangmang', count: 2 },
      // 杂物与法宝 (用于野怪招降等)
      { instanceId: 'it_misc1', itemId: 'silver_gourd', count: 3 },
      { instanceId: 'it_misc2', itemId: 'gold_gourd', count: 1 },
      { instanceId: 'it_tian4', itemId: 'qianghua_shi', count: 15 }
    ]);

    // 穿戴初始神兵与铠甲 (带孔位)
    this.playerData.equipItem('weapon', { itemId: 'eq_wp_bawangqiang', star: 5, sockets: ['gem_hongmanao', null, null] });
    this.playerData.equipItem('armor', { itemId: 'eq_am_huangjin', star: 5, sockets: ['gem_jingang', null, null] });

    // 初始仙宠系列 (包含金仙、散仙、普通三大品质)
    const pet1 = window.PetSystem.createPet('qitian_dasheng', false, 50);
    if (pet1) {
      pet1.skills = [{ id: 'sk_jg_shesheng', name: '舍生取义', classId: 'jingang', className: '金刚', icon: '⚔️', desc: '单体伤害巨大，自身消耗15%气血', level: 5, proficiency: 300 }];
      pet1.classId = 'jingang';
      pet1.className = '金刚';
      window.PetSystem.recalculatePet(pet1, true);
    }
    const pet2 = window.PetSystem.createPet('baihua_she', false, 15);
    if (pet2) {
      pet2.skills = [{ id: 'sk_ym_leiting', name: '雷霆万钧', classId: 'yaomo', className: '妖魔', icon: '⚡', desc: '单体九天神雷狂轰，伤害极高', level: 3, proficiency: 200 }];
      pet2.classId = 'yaomo';
      pet2.className = '妖魔';
      window.PetSystem.recalculatePet(pet2, true);
    }
    const pet3 = window.PetSystem.createPet('dahai_gui', false, 5); // 普通仙宠无技能

    this.pets = [pet1, pet2, pet3].filter(Boolean);
    this.activeCombatPets = [pet1, pet2].filter(Boolean); // 初始出战2只

    // 初始获得御马监龙马坐骑并骑乘
    this.mountSystem.addMount('xuelong_ma', '威灵踏雪龙马');
    this.mountSystem.isRiding = true;
    this.playerData.recalculateStats(true);

    // 2. 玩家 2D 实体
    this.playerChar = new window.Character({
      id: 'player',
      name: this.playerData.name,
      type: 'player',
      appearance: 'martial_hero',
      speed: 3.2
    });

    const urlParams = new URLSearchParams(window.location.search);
    const hasExplicitParam = urlParams.get('map') || urlParams.get('combat') || urlParams.get('dialogue') || urlParams.get('modal');

    let loadedSave = false;
    if (!hasExplicitParam && window.SaveManager && window.SaveManager.hasAutoSave()) {
      loadedSave = this.loadAutoSavedProgress();
    }

    if (!loadedSave) {
      const initMap = urlParams.get('map') || 'tiangong_palace';
      this.loadMap(initMap);
    }

    this.bindInputs();

    // 绑定离开页面自动保存与定时静默保存
    window.addEventListener('beforeunload', () => this.saveAutoProgress());
    setInterval(() => this.saveAutoProgress(), 15000);

    // 启动 60FPS 渲染主循环
    requestAnimationFrame((t) => this.gameLoop(t));

    // 支持通过 URL 快速体验任意篇章剧情或 Boss 战
    const testDialogue = urlParams.get('dialogue');
    const testCombat = urlParams.get('combat');
    const testModal = urlParams.get('modal');

    if (testModal === 'class') {
      setTimeout(() => {
        this.openClassSelectModal();
      }, 50);
    } else if (testCombat === 'bailong') {
      setTimeout(() => {
        this.triggerYingchouBattle();
      }, 50);
    } else if (testCombat === 'wolf') {
      this.playerData.name = '铁扇公主';
      this.playerChar.appearance = 'tieshan';
      setTimeout(() => {
        this.triggerWolfBattle();
      }, 50);
    } else if (testCombat === 'bajie') {
      // 加入孙悟空同伴并进入猪八戒战斗
      this.companions = [{ name: '孙悟空', title: '【齐天大圣】', roleId: 'sun_wukong', hp: 3500, maxHp: 3500, atk: 450, skillName: '大闹天宫' }];
      setTimeout(() => {
        this.triggerBajieBattle();
      }, 50);
    } else if (testDialogue && window.GAME_DATA.STORY_DIALOGUES[testDialogue]) {
      setTimeout(() => {
        window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES[testDialogue]);
      }, 50);
    } else if (!loadedSave && (!urlParams.get('map') || urlParams.get('map') === 'tiangong_palace')) {
      // 仅在无存档新建时触发序章大闹天宫剧本开篇
      setTimeout(() => {
        window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.taibai_intro);
      }, 50);
    }
  }

  // =========================================================================
  // 自动存档与断点续玩体系 (绝不让玩家进度丢失)
  // =========================================================================
  saveAutoProgress() {
    if (!this.playerData || !this.playerChar) return;
    try {
      const state = {
        mapId: this.currentMapId,
        playerPos: {
          x: Math.round(this.playerChar.x),
          y: Math.round(this.playerChar.y),
          direction: this.playerChar.direction
        },
        storyPhase: this.storyPhase,
        playerAppearance: this.playerChar.appearance,
        playerData: {
          name: this.playerData.name,
          level: this.playerData.level,
          exp: this.playerData.exp,
          silver: this.playerData.silver,
          bankSilver: this.playerData.bankSilver || 0,
          homeResidence: this.playerData.homeResidence || null,
          classId: this.playerData.classId,
          title: this.playerData.title,
          hp: this.playerData.hp,
          maxHp: this.playerData.maxHp,
          mp: this.playerData.mp,
          maxMp: this.playerData.maxMp,
          potentialPoints: this.playerData.potentialPoints || 0,
          attributes: this.playerData.attributes,
          equipment: this.playerData.equipment,
          resistances: this.playerData.resistances
        },
        inventorySlots: this.inventory ? this.inventory.slots : [],
        pets: this.pets || [],
        activeCombatPetIds: (this.activeCombatPets || []).map(p => p.instanceId),
        mountState: {
          mounts: this.mountSystem.mounts,
          activeMountId: this.mountSystem.activeMountId,
          isRiding: this.mountSystem.isRiding
        },
        companions: this.companions
      };
      if (window.SaveManager) {
        window.SaveManager.saveGameFullState(state);
      }
      this.updateSaveIndicator(true);
    } catch (e) {
      console.error('自动保存异常:', e);
    }
  }

  loadAutoSavedProgress() {
    if (!window.SaveManager) return false;
    const state = window.SaveManager.loadGameFullState();
    if (!state || !state.mapId) return false;

    try {
      if (state.playerData) {
        Object.assign(this.playerData, state.playerData);
      }
      if (state.inventorySlots && this.inventory) {
        this.inventory.slots = state.inventorySlots;
      }
      if (state.pets && Array.isArray(state.pets)) {
        this.pets = state.pets;
        const activeIds = state.activeCombatPetIds || [];
        this.activeCombatPets = this.pets.filter(p => activeIds.includes(p.instanceId));
      }
      if (state.mountState) {
        this.mountSystem.mounts = state.mountState.mounts || {};
        this.mountSystem.activeMountId = state.mountState.activeMountId || null;
        this.mountSystem.isRiding = !!state.mountState.isRiding;
      }
      if (state.companions) {
        this.companions = state.companions;
      }
      if (state.storyPhase) {
        this.storyPhase = state.storyPhase;
      }
      if (state.playerAppearance) {
        this.playerChar.appearance = state.playerAppearance;
        this.playerChar.name = this.playerData.name;
        this.playerChar.title = this.playerData.title;
      }
      this.playerData.recalculateStats(true);

      const targetMap = (state.mapId && window.GAME_DATA.MAPS_2D[state.mapId]) ? state.mapId : 'tiangong_palace';
      const spawn = state.playerPos || null;
      this.loadMap(targetMap, spawn);
      this.playerChar.isRiding = this.mountSystem.isRiding;

      const mapName = window.GAME_DATA.MAPS_2D[targetMap]?.name || '西游三界';
      window.showGameMessage(`📜 欢迎归来！已自动载入【${mapName}】历练进度 (Lv.${this.playerData.level})`, 'success', 3500);
      return true;
    } catch (e) {
      console.error('载入存档失败:', e);
      return false;
    }
  }

  // 更新界面右上角存档指示器
  updateSaveIndicator(isSaved = true) {
    const el = document.getElementById('save-status-indicator');
    if (el) {
      el.innerHTML = isSaved ? '●' : '⏳';
      el.style.color = isSaved ? '#2ed573' : '#ffd700';
    }
  }

  // 展开或收起乾坤折叠主菜单 (快捷键 M 或界面按钮)
  toggleFoldableMenu(forceState) {
    const menuEl = document.getElementById('foldable-menu-modal');
    if (!menuEl) return;
    const shouldOpen = (forceState !== undefined) ? forceState : (menuEl.style.display === 'none' || !menuEl.classList.contains('active'));

    if (shouldOpen) {
      if (window.Dialogue) window.Dialogue.close();
      document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
      menuEl.style.display = 'flex';
      void menuEl.offsetHeight; // 强制重绘激活过渡动画
      menuEl.classList.add('active');
      this.isMenuOpen = true;
      this.updateMenuSoundLabel();
      if (window.Sound) window.Sound.playBeep();
    } else {
      menuEl.classList.remove('active');
      this.isMenuOpen = false;
      setTimeout(() => {
        if (!this.isMenuOpen) menuEl.style.display = 'none';
      }, 220);
    }
  }

  // 同步主菜单中的音效开关状态文案
  updateMenuSoundLabel() {
    const labelEl = document.getElementById('menu-sound-label');
    if (labelEl && window.Sound) {
      labelEl.innerText = window.Sound.enabled ? '八音仙乐: 开' : '八音仙乐: 关';
    }
  }

  // 重新启程（清空存档回到序章）
  restartGame() {
    if (confirm('确定要清空当前的西行历练存档，重新启程回到开篇吗？')) {
      if (window.SaveManager) {
        window.SaveManager.clearProgress();
      }
      window.location.href = window.location.pathname;
    }
  }

  // 载入指定地图
  loadMap(mapId, customSpawn = null) {
    const mapData = window.GAME_DATA.MAPS_2D[mapId];
    if (!mapData) return;

    this.currentMapId = mapId;
    this.autoMovePath = [];
    this.autoMoveTargetCallback = null;

    const spawn = customSpawn || mapData.playerSpawn;
    this.playerChar.x = spawn.x;
    this.playerChar.y = spawn.y;
    this.playerChar.direction = spawn.direction || 'down';

    // 实例化 NPC (拒绝 Emoji，外观配置清晰)
    this.npcs = mapData.npcs.map(n => new window.Character({
      id: n.id,
      name: n.name,
      title: n.title,
      type: 'npc',
      x: n.x,
      y: n.y,
      appearance: n.appearance,
      dialogueKey: n.dialogueKey,
      questStatus: 'available'
    }));

    // 实例化怪物
    this.monsters = (mapData.monsters || []).map(m => new window.Character({
      id: m.id,
      name: m.name,
      type: 'monster',
      x: m.x,
      y: m.y,
      speed: 1.2,
      appearance: m.appearance || m.id,
      patrolRadius: m.patrolRadius || 30
    }));

    window.Sound.playBeep();
    this.updateLocationHeader(mapData.name, mapData.region);
    this.updatePlayerHud();

    // 每次过图或进入新场景，自动持久化历练进度
    this.saveAutoProgress();
  }

  updateLocationHeader(name, region) {
    const el = document.getElementById('scene-location-text');
    if (el) el.innerText = `🏯 ${name} (${region})`;
  }

  updatePlayerHud() {
    const nameEl = document.getElementById('hud-player-name');
    if (nameEl) nameEl.innerText = `${this.playerData.name} (Lv.${this.playerData.level})`;
    const hpEl = document.getElementById('hud-hp-bar');
    if (hpEl) hpEl.style.width = `${Math.max(0, (this.playerData.hp / this.playerData.maxHp) * 100)}%`;
    const silverEl = document.getElementById('hud-silver');
    if (silverEl) silverEl.innerText = `${this.playerData.silver} 两`;
  }

  // 输入监听
  bindInputs() {
    window.addEventListener('keydown', (e) => {
      this.keysDown[e.key] = true;
      if (this.currentBattle) {
        if (e.key === ' ' || e.key === 'Enter') {
          if (this.battleSkillMenuOpen) {
            const skills = this.playerData ? this.playerData.getSkills() : [];
            if (skills.length > 0) this.chooseCombatAction('skill', skills[0].id);
          } else {
            this.chooseCombatAction('attack');
          }
          return;
        } else if (e.key === 'q' || e.key === 'Q') {
          this.toggleSkillMenu(!this.battleSkillMenuOpen);
          return;
        } else if (e.key === 'w' || e.key === 'W') {
          this.chooseCombatAction('defend');
          return;
        } else if (e.key === 'e' || e.key === 'E') {
          this.chooseCombatAction('item');
          return;
        } else if (e.key === 'r' || e.key === 'R') {
          this.chooseCombatAction('capture');
          return;
        }
      }

      if (e.key === ' ' || e.key === 'Enter') {
        this.interactNearby();
      } else if (e.key === 'r' || e.key === 'R') {
        this.toggleMountRiding();
      } else if (e.key === 'm' || e.key === 'M') {
        this.toggleFoldableMenu();
      } else if (e.key === 'k' || e.key === 'K') {
        this.openClassSelectModal();
      } else if (e.key === 'c' || e.key === 'C') {
        this.openPlayerProfileModal();
      } else if (e.key === 'b' || e.key === 'B') {
        this.openInventoryModal('all');
      } else if (e.key === '1') {
        this.openPeachModal();
      } else if (e.key === '3') {
        this.openMountModal();
      } else if (e.key === 'Escape') {
        if (this.isMenuOpen) {
          this.toggleFoldableMenu(false);
        }
        if (window.Dialogue) window.Dialogue.close();
        document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown[e.key] = false;
    });

    // 画布鼠标点击 -> 智能触发 A* 寻路或交互
    if (this.canvas) {
      this.canvas.addEventListener('click', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const clickY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        this.handleClickCanvas(clickX, clickY);
      });
    }

    // 模式切换按钮
    const modeBtn = document.getElementById('toggle-mode-btn');
    if (modeBtn) {
      modeBtn.addEventListener('click', () => {
        document.body.classList.toggle('modern-mode');
        const isModern = document.body.classList.contains('modern-mode');
        modeBtn.innerHTML = isModern ? '📱 切换掌机' : '💻 切换大屏';

        if (isModern) {
          this.canvas.width = 760;
          this.canvas.height = 480;
          this.camera.viewportWidth = 760;
          this.camera.viewportHeight = 480;
        } else {
          this.canvas.width = 320;
          this.canvas.height = 380;
          this.camera.viewportWidth = 320;
          this.camera.viewportHeight = 380;
        }
        window.Sound.playBeep();
      });
    }

    // 音效开关
    const soundBtn = document.getElementById('toggle-sound-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const enabled = window.Sound.toggle();
        soundBtn.innerHTML = enabled ? '🔊 音效:开' : '🔇 音效:关';
        this.updateMenuSoundLabel();
        if (enabled) window.Sound.playBeep();
      });
    }
  }

  // 场景鼠标点击智能分发
  handleClickCanvas(screenX, screenY) {
    if (this.isPaused || window.Dialogue.currentDialogue || this.currentBattle) return;

    const worldPos = this.camera.screenToWorld(screenX, screenY);
    const mapData = window.GAME_DATA.MAPS_2D[this.currentMapId];
    if (!mapData) return;

    // 1. 是否点击在 NPC 附近 (半径 36px)
    for (const npc of this.npcs) {
      const dist = Math.hypot(npc.x - worldPos.x, npc.y - worldPos.y);
      if (dist < 36) {
        const playerDist = Math.hypot(npc.x - this.playerChar.x, npc.y - this.playerChar.y);
        // 如果身旁已在交互范围内，立即触发对话
        if (playerDist < npc.interactRadius) {
          this.triggerNpcDialogue(npc);
          return;
        }
        // 否则规划 A* 寻路走到身旁并自动对话
        const path = this.pathfinding.findPath(
          mapData, this.tilemap,
          this.playerChar.x, this.playerChar.y,
          npc.x, npc.y
        );
        if (path.length > 0) {
          this.autoMovePath = path;
          this.autoMoveTargetCallback = () => this.triggerNpcDialogue(npc);
          this.spawnClickRipple(npc.x, npc.y);
          window.Sound.playBeep();
        }
        return;
      }
    }

    // 2. 是否点击在传送门附近
    if (mapData.portals) {
      for (const p of mapData.portals) {
        const dist = Math.hypot(p.x - worldPos.x, p.y - worldPos.y);
        if (dist < 32) {
          const path = this.pathfinding.findPath(
            mapData, this.tilemap,
            this.playerChar.x, this.playerChar.y,
            p.x, p.y
          );
          if (path.length > 0) {
            this.autoMovePath = path;
            this.autoMoveTargetCallback = () => this.loadMap(p.targetMap, { x: p.targetX, y: p.targetY });
            this.spawnClickRipple(p.x, p.y);
            window.Sound.playBeep();
          }
          return;
        }
      }
    }

    // 3. 点击空地 -> A* 避障自动走过去
    const path = this.pathfinding.findPath(
      mapData, this.tilemap,
      this.playerChar.x, this.playerChar.y,
      worldPos.x, worldPos.y
    );
    if (path.length > 0) {
      this.autoMovePath = path;
      this.autoMoveTargetCallback = null;
      this.spawnClickRipple(worldPos.x, worldPos.y);
      window.Sound.playBeep();
    }
  }

  // 生成点击金色仙气光圈涟漪
  spawnClickRipple(worldX, worldY) {
    this.clickRipples.push({
      x: worldX,
      y: worldY,
      radius: 4,
      maxRadius: 22,
      alpha: 0.95
    });
  }

  // 游戏主循环
  gameLoop(timestamp) {
    this.update();
    this.render();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  // 状态更新
  update() {
    if (this.isPaused || window.Dialogue.currentDialogue || this.currentBattle) return;

    const mapData = window.GAME_DATA.MAPS_2D[this.currentMapId];
    if (!mapData) return;

    // 1. 坐骑移速与骑乘状态
    const baseSpeed = this.playerChar.appearance === 'heaven_general' ? 3.0 : 2.5;
    const speedBonus = this.mountSystem.getStatsBonus().speedBonus;
    this.playerChar.speed = baseSpeed * (1 + speedBonus);
    this.playerChar.isRiding = this.mountSystem.isRiding;

    // 2. 键盘手动移动检测
    let dx = 0;
    let dy = 0;
    if (this.keysDown['ArrowUp'] || this.keysDown['w'] || this.keysDown['W']) dy -= 1;
    if (this.keysDown['ArrowDown'] || this.keysDown['s'] || this.keysDown['S']) dy += 1;
    if (this.keysDown['ArrowLeft'] || this.keysDown['a'] || this.keysDown['A']) dx -= 1;
    if (this.keysDown['ArrowRight'] || this.keysDown['d'] || this.keysDown['D']) dx += 1;

    // 键盘有输入时，立刻打断自动寻路！
    if (dx !== 0 || dy !== 0) {
      this.autoMovePath = [];
      this.autoMoveTargetCallback = null;
      if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
      }
      this.playerChar.move(dx, dy, mapData, this.tilemap);
    } else if (this.autoMovePath.length > 0) {
      // 3. 执行 A* 自动寻路步进
      const targetPoint = this.autoMovePath[0];
      const dist = Math.hypot(targetPoint.x - this.playerChar.x, targetPoint.y - this.playerChar.y);
      if (dist < 5) {
        this.autoMovePath.shift();
        if (this.autoMovePath.length === 0 && this.autoMoveTargetCallback) {
          const cb = this.autoMoveTargetCallback;
          this.autoMoveTargetCallback = null;
          cb();
        }
      } else {
        const moveDx = (targetPoint.x - this.playerChar.x) / dist;
        const moveDy = (targetPoint.y - this.playerChar.y) / dist;
        this.playerChar.move(moveDx, moveDy, mapData, this.tilemap);
      }
    }

    // 4. 摄像机跟随
    const mapPixelW = mapData.width * this.tilemap.tileSize;
    const mapPixelH = mapData.height * this.tilemap.tileSize;
    this.camera.follow(this.playerChar.x, this.playerChar.y, mapPixelW, mapPixelH);

    // 5. 怪物巡逻与碰撞
    this.monsters.forEach(m => {
      m.updatePatrol(mapData, this.tilemap);
      const dist = Math.hypot(m.x - this.playerChar.x, m.y - this.playerChar.y);
      if (dist < 22) {
        this.triggerMonsterBattle(m);
      }
    });

    // 6. 传送门检测
    if (mapData.portals) {
      for (const p of mapData.portals) {
        const pDist = Math.hypot(p.x - this.playerChar.x, p.y - this.playerChar.y);
        if (pDist < 20) {
          this.loadMap(p.targetMap, { x: p.targetX, y: p.targetY });
          break;
        }
      }
    }

    // 7. 五行山金符压帖检测
    if (this.currentMapId === 'wuxingshan' && this.storyPhase !== 'wuxing_freed') {
      const sealDist = Math.hypot(12 * 32 - this.playerChar.x, 3 * 32 - this.playerChar.y);
      if (sealDist < 26) {
        window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.wuxing_seal_trigger);
      }
    }

    // 8. 更新环境粒子系统与马蹄踏云烟尘
    if (this.particleSystem) {
      this.particleSystem.update(this.currentMapId, this.canvas.width, this.canvas.height);
      if (this.playerChar.isMoving && this.playerChar.isRiding) {
        this.particleSystem.spawnHorseDust(this.playerChar.x, this.playerChar.y);
      }
    }

    // 9. 更新点击涟漪
    for (let i = this.clickRipples.length - 1; i >= 0; i--) {
      const rip = this.clickRipples[i];
      rip.radius += 1.2;
      rip.alpha -= 0.045;
      if (rip.alpha <= 0) {
        this.clickRipples.splice(i, 1);
      }
    }
  }

  // 附近 NPC 交互
  interactNearby() {
    if (window.Dialogue.currentDialogue) {
      window.Dialogue.next();
      return;
    }

    for (const npc of this.npcs) {
      const dist = Math.hypot(npc.x - this.playerChar.x, npc.y - this.playerChar.y);
      if (dist < npc.interactRadius) {
        this.triggerNpcDialogue(npc);
        return;
      }
    }
  }

  triggerNpcDialogue(npc) {
    window.Sound.playBeep();
    if (npc.dialogueKey && window.GAME_DATA.STORY_DIALOGUES[npc.dialogueKey]) {
      window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES[npc.dialogueKey]);
    } else {
      window.Dialogue.start({
        steps: [
          {
            speaker: npc.name,
            speakerTitle: npc.title,
            text: `阿弥陀佛，贫道见少侠步履从容，神采奕奕，必能扫尽十万八千里妖氛！`
          }
        ]
      });
    }
  }

  // 切换坐骑骑乘
  toggleMountRiding() {
    if (!this.mountSystem.getActiveMount()) {
      window.showGameMessage('少侠尚未获得坐骑！可在天宫【御马监】找弼马温挑选！', 'warning');
      return;
    }
    const isRiding = this.mountSystem.toggleRiding();
    this.playerChar.isRiding = isRiding;
    window.Sound.playSuccess();
    const btn = document.getElementById('quick-ride-btn');
    if (btn) btn.innerText = isRiding ? '🏇 状态:骑乘中' : '🚶 状态:步行中';
    window.showGameMessage(isRiding ? '🏇 已翻身上马疾驰，移动速度提升！' : '🚶 已翻身下马改为步行。', 'info');
  }

  // 挑选坐骑
  showChooseMountModal() {
    if (window.Dialogue) window.Dialogue.close();

    const modalHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:340px;">
          <div class="modal-header">
            <span class="modal-title">🐎 御马监 · 挑选天界神驹</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body">
            <div style="font-size:11px;color:#aaa;margin-bottom:8px;line-height:1.5;">
              弼马温孙悟空：“俺老孙精心调理的天马，各个龙精虎猛，挑一匹去驰骋三界吧！”
            </div>
            ${Object.values(window.MountSystem.TEMPLATES).filter(t => t.id !== 'qitian_shenlong').map(tpl => `
              <div class="action-card" style="margin-bottom:8px;" onclick="window.App2D.selectInitialMount('${tpl.id}'); this.closest('.modal-overlay').remove();">
                <div class="action-left" style="display:flex;align-items:center;gap:10px;">
                  <div style="width:36px;height:36px;background:#3d2f21;border:1px solid #ffd700;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#ffd700;font-size:12px;">
                    神驹
                  </div>
                  <div>
                    <div style="font-weight:bold;color:#ffd700;font-size:13px;">${tpl.name} <span style="font-size:9px;color:#2ecc71;">[${tpl.tier}]</span></div>
                    <div style="font-size:10px;color:#ddd;">气血+${tpl.baseHp} · 攻击+${tpl.baseAtk} · 移速+${Math.floor(tpl.speedBonus * 100)}%</div>
                  </div>
                </div>
                <div class="action-right" style="color:#f39c12;font-weight:bold;">
                  牵走领养 ▶
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    const viewport = document.getElementById('game-viewport') || document.body;
    viewport.insertAdjacentHTML('beforeend', modalHtml);
  }

  selectInitialMount(templateId) {
    const mount = this.mountSystem.addMount(templateId);
    this.mountSystem.isRiding = true;
    this.playerChar.isRiding = true;
    this.playerData.recalculateStats(false);
    window.Sound.playLevelUp();
    this.updatePlayerHud();
    window.showGameMessage(`🎉 恭喜获得天界神驹【${mount.name}】！气血上限+${mount.currentHp}，攻击+${mount.currentAtk}！移动速度大幅飙升！`, 'success', 4000);
  }

  // 坐骑面板
  openMountModal() {
    if (window.Dialogue) window.Dialogue.close();

    const mount = this.mountSystem.getActiveMount();
    if (!mount) {
      window.showGameMessage('暂无坐骑！可前往天宫御马监找弼马温挑选！', 'warning');
      return;
    }

    const modalHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:340px;">
          <div class="modal-header">
            <span class="modal-title">🐎 坐骑驯化与进阶</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body">
            <div style="text-align:center;margin-bottom:8px;">
              <div style="font-size:15px;font-weight:bold;color:#f39c12;margin-bottom:2px;">${mount.name} (Lv.${mount.level}/${mount.maxLevel})</div>
              <div style="font-size:10px;color:#2ecc71;">阶位：${mount.tier} · 状态：${this.mountSystem.isRiding ? '已乘骑' : '跟随'}</div>
            </div>

            <div style="background:#1b150f;padding:8px;border-radius:6px;border:1px solid #5c4732;font-size:11px;line-height:1.7;margin-bottom:8px;">
              <div>❤️ 为主人气血加成：<span style="color:#2ecc71;font-weight:bold;">+${mount.currentHp} HP</span></div>
              <div>⚔️ 为主人攻击加成：<span style="color:#e67e22;font-weight:bold;">+${mount.currentAtk} ATK</span></div>
              <div>💨 飞奔移动速度加成：<span style="color:#3498db;font-weight:bold;">+${Math.floor(mount.speedBonus * 100)}%</span></div>
              <div>🪙 现有银两：<span style="color:#ffd700;">${this.playerData.silver} 两</span></div>
            </div>

            <div style="display:flex;gap:6px;margin-bottom:8px;">
              <button class="dialogue-opt-btn" onclick="window.App2D.trainActiveMount(1); this.closest('.modal-overlay').remove();" style="flex:1;">
                驯化提升 1 级 (${500 + mount.level * 150}两)
              </button>
              <button class="dialogue-opt-btn" onclick="window.App2D.trainActiveMount(5); this.closest('.modal-overlay').remove();" style="flex:1;background:#5c1d18;">
                精训连升 5 级
              </button>
            </div>

            <button class="dialogue-opt-btn" onclick="window.App2D.toggleMountRiding(); this.closest('.modal-overlay').remove();" style="width:100%;">
              ${this.mountSystem.isRiding ? '🚶 下马改为步行' : '🏇 翻身上马疾驰'}
            </button>
          </div>
        </div>
      </div>
    `;
    const viewport = document.getElementById('game-viewport') || document.body;
    viewport.insertAdjacentHTML('beforeend', modalHtml);
  }

  trainActiveMount(times) {
    const mount = this.mountSystem.getActiveMount();
    if (!mount) return;
    const res = this.mountSystem.trainMount(mount.id, this.playerData, times);
    this.updatePlayerHud();
    window.showGameMessage(res.msg, res.success ? 'success' : 'warning');
    if (res.success) {
      this.openMountModal();
    }
  }

  // 蟠桃面板
  openPeachModal() {
    if (window.Dialogue) window.Dialogue.close();

    const remaining = this.peachGarden.getRemainingChances();

    const modalHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:340px;">
          <div class="modal-header">
            <span class="modal-title">🍑 天庭蟠桃胜境 · 仙品品尝</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body">
            <div style="background:#2b180d;padding:8px;border-radius:6px;font-size:11px;color:#fef0cd;margin-bottom:8px;border:1px solid #c59b27;line-height:1.6;">
              ✨ 今日免费采摘仙露充盈：<span style="color:#ffd700;font-weight:bold;font-size:13px;">${remaining} / 3 次</span><br>
              品尝后灵气洗髓，海量角色经验灌顶，直接提升人物等级！
            </div>

            ${Object.values(window.PeachGarden.TIERS).map(tier => `
              <div class="action-card" style="margin-bottom:8px;" onclick="window.App2D.eatPeach('${tier.id}'); this.closest('.modal-overlay').remove();">
                <div class="action-left" style="display:flex;align-items:center;gap:10px;">
                  <div style="width:36px;height:36px;background:#5c1d18;border:1px solid #ffd700;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#ffd700;font-size:12px;">
                    仙桃
                  </div>
                  <div>
                    <div style="font-weight:bold;color:#ff9f43;font-size:13px;">${tier.name}</div>
                    <div style="font-size:9px;color:#ccc;">${tier.desc}</div>
                    <div style="font-size:10px;color:#2ecc71;font-weight:bold;">基础修为经验 +${tier.baseExp} 点！</div>
                  </div>
                </div>
                <div class="action-right" style="color:#2ecc71;font-weight:bold;">
                  采摘品尝 ▶
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    const v2 = document.getElementById('game-viewport') || document.body;
    v2.insertAdjacentHTML('beforeend', modalHtml);
  }

  eatPeach(tierId) {
    const res = this.peachGarden.eatPeach(tierId, this.playerData, this.inventory);
    this.updatePlayerHud();
    window.showGameMessage(res.msg, res.success ? 'success' : 'warning');
  }

  // =========================================================================
  // 📜 角色仙籍面板 (五维潜能自由分配、门派绝技查看、装备抗性加成)
  // =========================================================================
  openPlayerProfileModal() {
    if (window.Dialogue) window.Dialogue.close();
    document.querySelectorAll('.modal-overlay').forEach(m => m.remove());

    const p = this.playerData;
    const cData = (window.GAME_DATA && window.GAME_DATA.CLASSES && window.GAME_DATA.CLASSES[p.classId]) || { name: '散仙', title: '三界游侠' };
    const nextExp = p.getNextLevelExp();
    const expPercent = Math.min(100, Math.floor((p.exp / nextExp) * 100));

    const attrDefs = [
      { key: 'con', name: '体质', desc: '增加气血上限与气血恢复', value: p.attributes.con },
      { key: 'str', name: '力量', desc: '提升强力物理攻击伤害', value: p.attributes.str },
      { key: 'int', name: '灵气', desc: '提升法术攻击与法力上限', value: p.attributes.int },
      { key: 'sta', name: '耐力', desc: '提升身躯硬度物理/法术防御', value: p.attributes.sta },
      { key: 'dex', name: '敏捷', desc: '提升回合出手速度与身法', value: p.attributes.dex },
    ];

    const modalHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:440px;width:92%;">
          <div class="modal-header">
            <span class="modal-title">📜 仙籍档案 · 人物五维与属性</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body" style="padding:10px;">
            <!-- 角色名片与门派 -->
            <div style="background:rgba(20,15,10,0.85);border:1px solid #5c4732;border-radius:8px;padding:8px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-size:14px;font-weight:bold;color:#ffd700;">${p.name} <span style="font-size:11px;color:#2ecc71;">Lv.${p.level}</span></div>
                <div style="font-size:11px;color:#aaa;margin-top:2px;">门派：<span style="color:#e67e22;font-weight:bold;">${cData.name}</span> (${cData.title || '齐天后裔'})</div>
              </div>
              <div style="text-align:right;font-size:11px;">
                <div>🪙 银两: <span style="color:#ffd700;">${p.silver}</span> 两</div>
                <div>✨ 仙玉: <span style="color:#00ffff;">${p.ingots}</span></div>
              </div>
            </div>

            <!-- 经验条 -->
            <div style="margin-bottom:10px;">
              <div style="display:flex;justify-content:space-between;font-size:10px;color:#bbb;margin-bottom:2px;">
                <span>修为经验: ${p.exp} / ${nextExp}</span>
                <span>${expPercent}%</span>
              </div>
              <div style="background:#222;border-radius:4px;height:7px;overflow:hidden;border:1px solid #444;">
                <div style="background:linear-gradient(90deg, #f1c40f, #e67e22);height:100%;width:${expPercent}%;"></div>
              </div>
            </div>

            <!-- 核心战斗面板 -->
            <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:6px;margin-bottom:10px;">
              <div style="background:rgba(25,18,12,0.7);padding:5px 8px;border-radius:6px;border:1px solid #4a3824;font-size:11px;">
                ❤️ 气血上限: <span style="color:#2ecc71;font-weight:bold;">${p.hp} / ${p.maxHp}</span>
              </div>
              <div style="background:rgba(25,18,12,0.7);padding:5px 8px;border-radius:6px;border:1px solid #4a3824;font-size:11px;">
                💧 法力上限: <span style="color:#3498db;font-weight:bold;">${p.mp} / ${p.maxMp}</span>
              </div>
              <div style="background:rgba(25,18,12,0.7);padding:5px 8px;border-radius:6px;border:1px solid #4a3824;font-size:11px;">
                ⚔️ 物理攻击: <span style="color:#e74c3c;font-weight:bold;">${p.atk}</span>
              </div>
              <div style="background:rgba(25,18,12,0.7);padding:5px 8px;border-radius:6px;border:1px solid #4a3824;font-size:11px;">
                🛡️ 物理防御: <span style="color:#f39c12;font-weight:bold;">${p.def}</span>
              </div>
              <div style="background:rgba(25,18,12,0.7);padding:5px 8px;border-radius:6px;border:1px solid #4a3824;font-size:11px;">
                🔮 法术伤害: <span style="color:#9b59b6;font-weight:bold;">${p.matk}</span>
              </div>
              <div style="background:rgba(25,18,12,0.7);padding:5px 8px;border-radius:6px;border:1px solid #4a3824;font-size:11px;">
                ⚡ 出手速度: <span style="color:#1abc9c;font-weight:bold;">${p.spd}</span>
              </div>
            </div>

            <!-- 五维自由潜能加点 -->
            <div style="background:rgba(20,15,10,0.85);border:1px solid #5c4732;border-radius:8px;padding:8px;margin-bottom:10px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span style="font-size:11px;font-weight:bold;color:#ffd700;">🌟 自由潜能点: <span style="color:#00ffcc;font-size:13px;">${p.potentialPoints}</span></span>
                ${p.potentialPoints > 0 ? `<span style="font-size:10px;color:#f39c12;">点击加号分配潜能点</span>` : `<span style="font-size:10px;color:#888;">升级可获潜能点</span>`}
              </div>
              <div style="display:flex;flex-direction:column;gap:5px;">
                ${attrDefs.map(attr => `
                  <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.3);padding:4px 8px;border-radius:4px;border:1px solid #3d2c1c;">
                    <div style="display:flex;flex-direction:column;">
                      <span style="font-size:11px;color:#f5f0e6;font-weight:bold;">${attr.name} <span style="color:#ffd700;">${attr.value}</span></span>
                      <span style="font-size:9px;color:#887766;">${attr.desc}</span>
                    </div>
                    <div>
                      ${p.potentialPoints > 0 ? `
                        <button class="dialogue-opt-btn" onclick="window.App2D.allocateStat('${attr.key}', 1)" style="padding:2px 8px;font-size:10px;margin-left:4px;">+1</button>
                        ${p.potentialPoints >= 5 ? `<button class="dialogue-opt-btn" onclick="window.App2D.allocateStat('${attr.key}', 5)" style="padding:2px 6px;font-size:10px;background:#5c1d18;margin-left:2px;">+5</button>` : ''}
                      ` : `
                        <span style="font-size:10px;color:#555;">已配置</span>
                      `}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- 抗性与仙宠限制 -->
            <div style="background:rgba(15,20,15,0.7);border:1px solid #325c42;border-radius:6px;padding:6px 8px;font-size:10px;line-height:1.6;color:#9ec5ab;">
              <div>🛡️ 门派专精抗性: 物抗+${Math.round((p.resistances.res_phy || 0)*100)}% · 佛光+${Math.round((p.resistances.res_foguang || 0)*100)}% · 舍生+${Math.round((p.resistances.res_shesheng || 0)*100)}%</div>
              <div>🐾 战宠出阵上限: 同时出战 <span style="color:#ffd700;font-weight:bold;">${p.getMaxCombatPets()}</span> 只仙宠 (随等级解锁更多)</div>
            </div>

            <div style="margin-top:10px;display:flex;gap:6px;">
              <button class="dialogue-opt-btn" onclick="window.App2D.openClassSelectModal();" style="flex:1;">☯️ 切换门派绝技 [K]</button>
              <button class="dialogue-opt-btn" onclick="window.App2D.openInventoryModal('equip');" style="flex:1;">🛡️ 查看佩戴装备</button>
              <button class="dialogue-opt-btn" onclick="this.closest('.modal-overlay').remove();" style="flex:1;background:#3a291a;">关闭</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const v = document.getElementById('game-viewport') || document.body;
    v.insertAdjacentHTML('beforeend', modalHtml);
    if (window.Sound) window.Sound.playBeep();
  }

  allocateStat(attrKey, amount = 1) {
    if (this.playerData.allocatePoints(attrKey, amount)) {
      this.updatePlayerHud();
      if (window.Sound) window.Sound.playBeep();
      window.showGameMessage(`✨ 潜能分配成功！当前 ${attrKey}: ${this.playerData.attributes[attrKey]}`, 'success', 2000);
      this.openPlayerProfileModal();
    } else {
      window.showGameMessage('潜能点不足！', 'warning', 2000);
    }
  }

  // =========================================================================
  // 🎒 储物背包系统 (药品/装备/宝石/杂物分类、手动穿脱、3孔宝石镶嵌)
  // =========================================================================
  openInventoryModal(activeCategory = 'all') {
    if (window.Dialogue) window.Dialogue.close();
    document.querySelectorAll('.modal-overlay').forEach(m => m.remove());

    const items = this.inventory.getItemsByCategory(activeCategory);
    const eq = this.playerData.equipment;

    const parts = [
      { key: 'weapon', name: '神兵' },
      { key: 'head', name: '冠盔' },
      { key: 'armor', name: '铠甲' },
      { key: 'necklace', name: '项坠' },
      { key: 'belt', name: '腰带' },
      { key: 'boots', name: '鞋靴' }
    ];

    const modalHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:440px;width:92%;">
          <div class="modal-header">
            <span class="modal-title">🎒 仙家乾坤储物袋 (${this.inventory.slots.length}/${this.inventory.maxSlots})</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body" style="padding:10px;">
            <!-- 身上穿戴装备概览 -->
            <div style="background:rgba(20,15,10,0.85);border:1px solid #5c4732;border-radius:8px;padding:8px;margin-bottom:10px;">
              <div style="font-size:11px;font-weight:bold;color:#ffd700;margin-bottom:6px;display:flex;justify-content:space-between;">
                <span>🛡️ 身上佩戴神装 (点击可卸下或查孔)</span>
                <span style="font-size:10px;color:#aaa;">银两: ${this.playerData.silver} 两</span>
              </div>
              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:6px;">
                ${parts.map(p => {
                  const itemSlot = eq[p.key];
                  if (!itemSlot) {
                    return `
                      <div style="background:rgba(0,0,0,0.4);border:1px dashed #554433;border-radius:6px;padding:4px;text-align:center;font-size:10px;color:#665544;">
                        <div>[${p.name}]</div>
                        <div style="margin-top:2px;">未佩戴</div>
                      </div>
                    `;
                  }
                  const baseIt = window.GAME_DATA.ITEMS[itemSlot.itemId] || {};
                  const sockets = itemSlot.sockets || [null, null, null];
                  const socketIcons = sockets.map(g => g ? '💎' : '⚪').join('');
                  return `
                    <div onclick="window.App2D.showEquippedDetail('${p.key}')" style="background:#2a1b0e;border:1px solid #c59b27;border-radius:6px;padding:4px;text-align:center;font-size:10px;cursor:pointer;">
                      <div style="color:#ffd700;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${baseIt.icon || '⚔️'}${baseIt.name || p.name}
                      </div>
                      <div style="font-size:9px;color:#2ecc71;">+${itemSlot.star || 0}星 ${socketIcons}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- 分类切换 Tabs -->
            <div style="display:flex;gap:4px;margin-bottom:8px;">
              <button class="dialogue-opt-btn" style="flex:1;padding:4px;font-size:10px;${activeCategory==='all'?'background:#c59b27;color:#000;font-weight:bold;':''}" onclick="window.App2D.openInventoryModal('all')">全部</button>
              <button class="dialogue-opt-btn" style="flex:1;padding:4px;font-size:10px;${activeCategory==='consumable'?'background:#c59b27;color:#000;font-weight:bold;':''}" onclick="window.App2D.openInventoryModal('consumable')">💊药品</button>
              <button class="dialogue-opt-btn" style="flex:1;padding:4px;font-size:10px;${activeCategory==='equip'?'background:#c59b27;color:#000;font-weight:bold;':''}" onclick="window.App2D.openInventoryModal('equip')">🛡️装备</button>
              <button class="dialogue-opt-btn" style="flex:1;padding:4px;font-size:10px;${activeCategory==='gem'?'background:#c59b27;color:#000;font-weight:bold;':''}" onclick="window.App2D.openInventoryModal('gem')">💎宝石</button>
              <button class="dialogue-opt-btn" style="flex:1;padding:4px;font-size:10px;${activeCategory==='misc'?'background:#c59b27;color:#000;font-weight:bold;':''}" onclick="window.App2D.openInventoryModal('misc')">📦杂物</button>
            </div>

            <!-- 物品列表格 -->
            <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:6px;max-height:220px;overflow-y:auto;padding-right:2px;">
              ${items.length === 0 ? `<div style="grid-column:1/-1;text-align:center;padding:20px;color:#887766;font-size:11px;">此分类下暂无物品</div>` : ''}
              ${items.map(slot => {
                const it = window.GAME_DATA.ITEMS[slot.itemId] || {};
                const isEq = it.type === 'equip';
                const sockets = (slot.equipData && slot.equipData.sockets) || [];
                const sockStr = isEq ? sockets.map(g => g ? '💎' : '⚪').join('') : '';
                return `
                  <div onclick="window.App2D.showInventoryItemDetail('${slot.instanceId}')" style="background:#20140b;border:1px solid #4a331c;border-radius:6px;padding:6px 4px;text-align:center;cursor:pointer;position:relative;" title="${it.name}">
                    <div style="font-size:22px;line-height:1;">${it.icon || '📦'}</div>
                    <div style="font-size:10px;color:#ffd700;font-weight:bold;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                      ${it.name || '物品'}
                    </div>
                    ${slot.count > 1 ? `<span style="position:absolute;bottom:2px;right:4px;font-size:9px;color:#7bed9f;font-weight:bold;">x${slot.count}</span>` : ''}
                    ${isEq ? `<div style="font-size:8px;color:#2ecc71;">${sockStr}</div>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    const v = document.getElementById('game-viewport') || document.body;
    v.insertAdjacentHTML('beforeend', modalHtml);
  }

  showInventoryItemDetail(instanceId) {
    const slot = this.inventory.slots.find(s => s.instanceId === instanceId);
    if (!slot) return;
    const it = window.GAME_DATA.ITEMS[slot.itemId];
    if (!it) return;

    let opButtons = '';
    if (it.type === 'equip') {
      opButtons = `
        <button class="dialogue-opt-btn" onclick="window.App2D.equipItemFromBag('${instanceId}'); this.closest('.modal-overlay').remove();" style="flex:1;">
          🛡️ 穿上装备
        </button>
      `;
    } else if (it.type === 'consumable') {
      opButtons = `
        <button class="dialogue-opt-btn" onclick="window.App2D.useConsumableItem('${instanceId}'); this.closest('.modal-overlay').remove();" style="flex:1;">
          💊 使用药品
        </button>
      `;
    } else if (it.type === 'gem') {
      opButtons = `
        <button class="dialogue-opt-btn" onclick="window.App2D.openGemSocketModal('${instanceId}'); this.closest('.modal-overlay').remove();" style="flex:1;background:#8e44ad;">
          💎 镶嵌到装备
        </button>
      `;
    }

    const modalHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:320px;">
          <div class="modal-header">
            <span class="modal-title">${it.icon || '📦'} ${it.name}</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body" style="font-size:11px;line-height:1.6;color:#fef0cd;">
            <div style="color:#aaa;margin-bottom:8px;">${it.desc || '一件三界秘宝。'}</div>
            ${it.attrs ? `
              <div style="background:#1b120a;padding:6px;border-radius:4px;border:1px solid #443322;margin-bottom:8px;">
                ${Object.entries(it.attrs).map(([k, v]) => `<div>${k.toUpperCase()}: +${v}</div>`).join('')}
              </div>
            ` : ''}
            ${it.bonus ? `
              <div style="background:#1b120a;padding:6px;border-radius:4px;border:1px solid #8e44ad;margin-bottom:8px;color:#d2a8ff;">
                【宝石孔位镶嵌属性】<br>
                ${Object.entries(it.bonus).map(([k, v]) => `<div>${k.replace('res_', '抗性 ')}: +${typeof v === 'number' && v < 1 ? (v*100)+'%' : v}</div>`).join('')}
              </div>
            ` : ''}
            <div style="display:flex;gap:6px;margin-top:10px;">
              ${opButtons}
              <button class="dialogue-opt-btn" onclick="this.closest('.modal-overlay').remove()" style="padding:4px 10px;">关闭</button>
            </div>
          </div>
        </div>
      </div>
    `;
    const v = document.getElementById('game-viewport') || document.body;
    v.insertAdjacentHTML('beforeend', modalHtml);
  }

  equipItemFromBag(instanceId) {
    const res = this.inventory.equip(instanceId, this.playerData);
    this.updatePlayerHud();
    window.showGameMessage(res.msg, res.success ? 'success' : 'warning');
    if (res.success) this.openInventoryModal('equip');
  }

  showEquippedDetail(slotKey) {
    const equip = this.playerData.equipment[slotKey];
    if (!equip) return;
    const it = window.GAME_DATA.ITEMS[equip.itemId] || {};
    const sockets = equip.sockets || [null, null, null];

    const modalHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:320px;">
          <div class="modal-header">
            <span class="modal-title">${it.icon || '🛡️'} ${it.name} (+${equip.star||0}星)</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body" style="font-size:11px;color:#fef0cd;line-height:1.6;">
            <div>部位：${it.slot || slotKey}</div>
            <div style="color:#aaa;margin-bottom:6px;">${it.desc || ''}</div>
            
            <div style="background:#1b120a;border:1px solid #c59b27;border-radius:6px;padding:6px;margin-bottom:8px;">
              <div style="color:#ffd700;font-weight:bold;margin-bottom:4px;">💎 宝石镶嵌孔 (${sockets.filter(Boolean).length}/3)</div>
              ${sockets.map((gemId, idx) => {
                if (gemId) {
                  const gIt = window.GAME_DATA.ITEMS[gemId] || {};
                  return `
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
                      <span>第${idx+1}孔: 💎 ${gIt.name}</span>
                      <button class="dialogue-opt-btn" style="padding:1px 6px;font-size:9px;" onclick="window.App2D.unsocketEquippedGem('${slotKey}', ${idx}); this.closest('.modal-overlay').remove();">拆除</button>
                    </div>
                  `;
                }
                return `<div style="color:#887766;">第${idx+1}孔: ⚪ 空孔位 (可镶嵌宝石)</div>`;
              }).join('')}
            </div>

            <div style="display:flex;gap:6px;">
              <button class="dialogue-opt-btn" style="flex:1;background:#c0392b;" onclick="window.App2D.unequipItemToBag('${slotKey}'); this.closest('.modal-overlay').remove();">
                卸下装备到背包
              </button>
              <button class="dialogue-opt-btn" onclick="this.closest('.modal-overlay').remove()">关闭</button>
            </div>
          </div>
        </div>
      </div>
    `;
    const v = document.getElementById('game-viewport') || document.body;
    v.insertAdjacentHTML('beforeend', modalHtml);
  }

  unequipItemToBag(slotKey) {
    const res = this.inventory.unequip(slotKey, this.playerData);
    this.updatePlayerHud();
    window.showGameMessage(res.msg, res.success ? 'success' : 'warning');
    if (res.success) this.openInventoryModal('equip');
  }

  useConsumableItem(instanceId) {
    const res = this.inventory.useItem(instanceId, this.playerData, this.activeCombatPets[0]);
    this.updatePlayerHud();
    window.showGameMessage(res.msg, res.success ? 'success' : 'warning');
    if (res.success) this.openInventoryModal('consumable');
  }

  openGemSocketModal(gemInstanceId) {
    const gemSlot = this.inventory.slots.find(s => s.instanceId === gemInstanceId);
    if (!gemSlot) return;
    const gemItem = window.GAME_DATA.ITEMS[gemSlot.itemId];
    const bagEquips = this.inventory.slots.filter(s => {
      const it = window.GAME_DATA.ITEMS[s.itemId];
      return it && it.type === 'equip';
    });

    const modalHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:340px;">
          <div class="modal-header">
            <span class="modal-title">💎 宝石镶嵌 · 注入神力</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body" style="font-size:11px;color:#fef0cd;line-height:1.6;">
            <div style="margin-bottom:8px;">
              即将镶嵌：<span style="color:#ffd700;font-weight:bold;">${gemItem.name}</span><br>
              请选择背包中带有空孔位的装备：
            </div>
            <div style="max-height:200px;overflow-y:auto;">
              ${bagEquips.length === 0 ? `<div style="color:#887766;text-align:center;padding:12px;">背包内暂无可镶嵌装备</div>` : ''}
              ${bagEquips.map(eqSlot => {
                const eqItem = window.GAME_DATA.ITEMS[eqSlot.itemId];
                const sockets = (eqSlot.equipData && eqSlot.equipData.sockets) || [null, null, null];
                const emptyIdx = sockets.findIndex(g => !g);
                return `
                  <div style="background:#20140b;border:1px solid #5c4732;border-radius:6px;padding:6px 8px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                      <div style="color:#ffd700;font-weight:bold;">${eqItem.name}</div>
                      <div style="font-size:10px;color:#aaa;">空孔位: ${sockets.filter(g => !g).length} / 3</div>
                    </div>
                    ${emptyIdx !== -1 ? `
                      <button class="dialogue-opt-btn" style="padding:3px 8px;font-size:10px;" onclick="window.App2D.doSocketGem('${eqSlot.instanceId}', '${gemSlot.itemId}', ${emptyIdx}); this.closest('.modal-overlay').remove();">
                        镶嵌于第${emptyIdx+1}孔
                      </button>
                    ` : `<span style="font-size:10px;color:#e74c3c;">已满孔</span>`}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    const v = document.getElementById('game-viewport') || document.body;
    v.insertAdjacentHTML('beforeend', modalHtml);
  }

  doSocketGem(equipInstanceId, gemItemId, socketIdx) {
    const res = this.inventory.socketGem(equipInstanceId, gemItemId, socketIdx, this.playerData);
    this.updatePlayerHud();
    window.showGameMessage(res.msg, res.success ? 'success' : 'warning');
    if (res.success) this.openInventoryModal('gem');
  }

  unsocketEquippedGem(slotKey, socketIdx) {
    const equip = this.playerData.equipment[slotKey];
    if (!equip || !equip.sockets) return;
    const gemId = equip.sockets[socketIdx];
    if (!gemId) return;

    if (this.inventory.slots.length >= this.inventory.maxSlots) {
      window.showGameMessage('背包已满，无法拆除宝石！', 'warning');
      return;
    }
    equip.sockets[socketIdx] = null;
    this.inventory.addItem(gemId, 1);
    this.playerData.recalculateStats(false);
    this.updatePlayerHud();
    window.Sound.playSuccess();
    window.showGameMessage(`已拆除第 ${socketIdx+1} 孔宝石并放入背包！`, 'success');
  }

  // =========================================================================
  // 🐾 仙宠管理系统 (普通/散仙/金仙品质、10级一键学技转职、参战上限控制)
  // =========================================================================
  openPetManageModal() {
    if (window.Dialogue) window.Dialogue.close();
    document.querySelectorAll('.modal-overlay').forEach(m => m.remove());

    const maxCombat = this.playerData.getMaxCombatPets();
    const curCombatCount = this.activeCombatPets.length;

    const modalHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:460px;width:94%;">
          <div class="modal-header">
            <span class="modal-title">🐾 随行仙宠管理 (${this.pets.length}只)</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body" style="padding:10px;font-size:11px;color:#fef0cd;line-height:1.6;">
            <!-- 参战上限提示 -->
            <div style="background:#20140b;border:1px solid #c59b27;border-radius:6px;padding:6px 10px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
              <div>
                参战阵列：<span style="color:#ffd700;font-weight:bold;">${curCombatCount} / ${maxCombat} 只</span>
                <span style="color:#aaa;font-size:10px;">(20/30/40级分别解锁1/2/3只)</span>
              </div>
              <span style="font-size:10px;color:#2ecc71;">角色等级: Lv.${this.playerData.level}</span>
            </div>

            <!-- 仙宠列表 -->
            <div style="max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;">
              ${this.pets.length === 0 ? `<div style="text-align:center;color:#887766;padding:20px;">暂无仙宠，可前往野外使用神符或法宝招降！</div>` : ''}
              ${this.pets.map(pet => {
                const isActive = this.activeCombatPets.some(p => p.instanceId === pet.instanceId);
                const qColor = pet.quality === 'jinxian' ? '#ffd700' : (pet.quality === 'sanxian' ? '#3498db' : '#aaa');
                const hasSkill = pet.skills && pet.skills.length > 0;
                const canLearn = (pet.quality === 'jinxian') || (pet.quality === 'sanxian' && pet.level >= 10);
                return `
                  <div style="background:#1a1109;border:1.5px solid ${isActive ? '#2ed573' : '#4a331c'};border-radius:8px;padding:8px 10px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                      <div style="display:flex;align-items:center;gap:6px;">
                        <span style="font-size:20px;">${pet.icon || '🐾'}</span>
                        <span style="font-weight:bold;color:#fef0cd;font-size:12px;">${pet.name} (Lv.${pet.level})</span>
                        <span style="color:${qColor};font-weight:bold;font-size:10px;border:1px solid ${qColor};border-radius:4px;padding:0 4px;">【${pet.qualityName || '普通'}】</span>
                        ${pet.className && pet.className !== '无门派' ? `<span style="color:#d4af37;font-size:10px;">[${pet.className}]</span>` : ''}
                      </div>
                      <label style="display:flex;align-items:center;gap:4px;font-size:10px;cursor:pointer;">
                        <input type="checkbox" ${isActive ? 'checked' : ''} onchange="window.App2D.togglePetCombat('${pet.instanceId}', this.checked)">
                        <span style="color:${isActive ? '#2ed573' : '#aaa'};font-weight:bold;">${isActive ? '⚔️已出战' : '备战'}</span>
                      </label>
                    </div>

                    <!-- 属性指标 -->
                    <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:4px;font-size:10px;color:#ccc;background:rgba(0,0,0,0.3);padding:4px 6px;border-radius:4px;margin-bottom:6px;">
                      <div>❤️ HP: <span style="color:${pet.hp<pet.maxHp?'#ff6b81':'#2ecc71'};font-weight:bold;">${pet.hp}/${pet.maxHp}</span></div>
                      <div>💧 MP: <span style="color:#70a1ff;">${pet.mp}/${pet.maxMp}</span></div>
                      <div>⚔️ 攻: ${pet.atk}</div>
                      <div>🛡️ 防: ${pet.def}</div>
                      <div>💨 速: ${pet.spd}</div>
                      <div>🌟 成长: ${pet.growth}</div>
                      <div style="grid-column:span 2;color:#ffd700;">
                        ${pet.classId ? `专精: ${pet.className}技能抗性+5%` : '暂无专精'}
                      </div>
                    </div>

                    <!-- 技能与学技 -->
                    <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;">
                      <div style="color:#bbb;">
                        ${hasSkill ? `绝技: <span style="color:#ffd700;font-weight:bold;">${pet.skills[0].name}</span> (${pet.skills[0].desc.slice(0, 18)}...)` : `
                          <span style="color:#887766;">${pet.quality==='ordinary' ? '普通仙宠无法领悟绝技，仅能物理攻击' : (pet.quality==='sanxian' ? '散仙需修行至 Lv.10 开启灵窍' : '未领悟绝技')}</span>
                        `}
                      </div>
                      ${(!hasSkill && canLearn) ? `
                        <button class="dialogue-opt-btn" style="padding:2px 8px;font-size:10px;background:#8e44ad;" onclick="window.App2D.learnSkillForPet('${pet.instanceId}')">
                          ⚡ 一键领悟神技
                        </button>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    const v = document.getElementById('game-viewport') || document.body;
    v.insertAdjacentHTML('beforeend', modalHtml);
  }

  togglePetCombat(instanceId, isChecked) {
    const pet = this.pets.find(p => p.instanceId === instanceId);
    if (!pet) return;

    if (isChecked) {
      const maxCombat = this.playerData.getMaxCombatPets();
      if (this.activeCombatPets.length >= maxCombat) {
        window.showGameMessage(`少侠当前等级最多只可携带 ${maxCombat} 只仙宠出战！(升级可扩容)`, 'warning');
        this.openPetManageModal();
        return;
      }
      if (!this.activeCombatPets.some(p => p.instanceId === instanceId)) {
        this.activeCombatPets.push(pet);
        window.showGameMessage(`【${pet.name}】已加入出战阵型！`, 'success');
      }
    } else {
      this.activeCombatPets = this.activeCombatPets.filter(p => p.instanceId !== instanceId);
      window.showGameMessage(`【${pet.name}】已转为待命备战。`, 'info');
    }
    this.openPetManageModal();
  }

  learnSkillForPet(instanceId) {
    const pet = this.pets.find(p => p.instanceId === instanceId);
    if (!pet) return;
    const res = window.PetSystem.learnSkill(pet);
    if (res.success) {
      window.Sound.playCrit();
      window.showGameMessage(res.msg, 'success', 4500);
      this.openPetManageModal();
    } else {
      window.showGameMessage(res.msg, 'warning');
    }
  }

  // =========================================================================
  // 钱庄与医馆系统 (存取银两、理财利息分红、一键满状态)
  // =========================================================================
  openBankModal() {
    if (window.Dialogue) window.Dialogue.close();
    document.querySelectorAll('.modal-overlay').forEach(m => m.remove());

    const bankSilver = this.playerData.bankSilver || 0;
    const modalHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:340px;">
          <div class="modal-header">
            <span class="modal-title">💰 大唐钱庄 · 汇通天下</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body" style="font-size:11px;color:#fef0cd;line-height:1.7;">
            <div style="background:#20140b;border:1px solid #c59b27;border-radius:6px;padding:8px;margin-bottom:8px;">
              <div>🪙 身上现有银两：<span style="color:#ffd700;font-weight:bold;">${this.playerData.silver} 两</span></div>
              <div>🏦 钱庄保险金库：<span style="color:#2ecc71;font-weight:bold;">${bankSilver} 两</span></div>
            </div>
            <div style="font-size:10px;color:#aaa;margin-bottom:8px;">
              钱庄理财：存入金库后，每次外出降妖历练皆可申领 5%~10% 的商业分红利息！
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
              <button class="dialogue-opt-btn" onclick="window.App2D.depositSilver(1000)">存入 1000 两</button>
              <button class="dialogue-opt-btn" onclick="window.App2D.withdrawSilver(1000)">取出 1000 两</button>
              <button class="dialogue-opt-btn" onclick="window.App2D.depositSilver(window.App2D.playerData.silver)">存入全部</button>
              <button class="dialogue-opt-btn" onclick="window.App2D.withdrawSilver(window.App2D.playerData.bankSilver||0)">取出全部</button>
            </div>
            <button class="dialogue-opt-btn" style="width:100%;background:#8e44ad;" onclick="window.App2D.claimBankInterest()">
              📈 申领理财利息分红
            </button>
          </div>
        </div>
      </div>
    `;
    const v = document.getElementById('game-viewport') || document.body;
    v.insertAdjacentHTML('beforeend', modalHtml);
  }

  depositSilver(amount) {
    amount = Math.min(amount, this.playerData.silver);
    if (amount <= 0) {
      window.showGameMessage('身上没有足够银两可存入！', 'warning');
      return;
    }
    this.playerData.silver -= amount;
    this.playerData.bankSilver = (this.playerData.bankSilver || 0) + amount;
    this.updatePlayerHud();
    window.Sound.playSuccess();
    window.showGameMessage(`成功存入 ${amount} 两银两至大唐钱庄金库！`, 'success');
    this.openBankModal();
  }

  withdrawSilver(amount) {
    amount = Math.min(amount, this.playerData.bankSilver || 0);
    if (amount <= 0) {
      window.showGameMessage('钱庄金库中暂无银两可支取！', 'warning');
      return;
    }
    this.playerData.bankSilver -= amount;
    this.playerData.silver += amount;
    this.updatePlayerHud();
    window.Sound.playSuccess();
    window.showGameMessage(`成功从钱庄金库支取 ${amount} 两银两！`, 'success');
    this.openBankModal();
  }

  claimBankInterest() {
    const bank = this.playerData.bankSilver || 0;
    if (bank < 500) {
      window.showGameMessage('钱庄存款不足 500 两，暂未产生理财分红！', 'warning');
      return;
    }
    const rate = 0.08;
    const interest = Math.max(50, Math.floor(bank * rate));
    this.playerData.silver += interest;
    this.updatePlayerHud();
    window.Sound.playLevelUp();
    window.showGameMessage(`🎉 恭喜申领钱庄理财红利 ${interest} 两银两！`, 'success', 3500);
    this.openBankModal();
  }

  healAllAtDoctor() {
    if (this.playerData.silver < 50) {
      window.showGameMessage('诊金不足！妙手回春需要 50 两银两。', 'warning');
      return;
    }
    this.playerData.silver -= 50;
    this.playerData.hp = this.playerData.maxHp;
    this.playerData.mp = this.playerData.maxMp;

    this.pets.forEach(p => {
      p.hp = p.maxHp;
      p.mp = p.maxMp;
    });

    this.updatePlayerHud();
    window.Sound.playLevelUp();
    window.showGameMessage('🏥【妙手回春】老医师银针度穴！全员气血、精力已悉数全满！伤势痊愈！', 'success', 4000);
  }

  openPharmacyModal() {
    if (window.Dialogue) window.Dialogue.close();
    document.querySelectorAll('.modal-overlay').forEach(m => m.remove());

    const meds = [
      { id: 'jinchuang_yao', name: '金创药', price: 80, desc: '气血 +300' },
      { id: 'dahuan_dan', name: '大还丹', price: 350, desc: '气血 +1200' },
      { id: 'foshou', name: '佛手', price: 60, desc: '精力 +150' },
      { id: 'biling_dan', name: '碧灵丹', price: 400, desc: '精力 +600' },
      { id: 'xuelian_dan', name: '天山雪莲丹', price: 1200, desc: '气血 +3000' },
      { id: 'jiuzhuan_dan', name: '九转还魂丹', price: 2000, desc: '复活并恢复 800 HP' },
      { id: 'silver_gourd', name: '紫竹银葫芦', price: 800, desc: '招降散仙野怪 (70%概率)' },
      { id: 'gold_gourd', name: '紫金红葫芦', price: 2500, desc: '招降金仙圣兽 (60%概率)' }
    ];

    const modalHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:360px;">
          <div class="modal-header">
            <span class="modal-title">💊 百草医馆药铺 · 救急仙药</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body" style="font-size:11px;color:#fef0cd;line-height:1.6;">
            <div style="margin-bottom:6px;color:#ffd700;">现有银两：${this.playerData.silver} 两</div>
            <div style="max-height:220px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;">
              ${meds.map(m => `
                <div style="background:#20140b;border:1px solid #5c4732;border-radius:6px;padding:6px 8px;display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <div style="color:#ffd700;font-weight:bold;">${m.name} <span style="font-size:10px;color:#2ecc71;">(${m.desc})</span></div>
                    <div style="font-size:9px;color:#aaa;">单价: ${m.price} 两</div>
                  </div>
                  <button class="dialogue-opt-btn" style="padding:3px 8px;font-size:10px;" onclick="window.App2D.buyMedicine('${m.id}', ${m.price})">购买进包</button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    const v = document.getElementById('game-viewport') || document.body;
    v.insertAdjacentHTML('beforeend', modalHtml);
  }

  buyMedicine(itemId, price) {
    if (this.playerData.silver < price) {
      window.showGameMessage('身上银两不足！', 'warning');
      return;
    }
    if (this.inventory.slots.length >= this.inventory.maxSlots && this.inventory.getItemCount(itemId) === 0) {
      window.showGameMessage('储物背包已满，无法容纳新物品！', 'warning');
      return;
    }
    this.playerData.silver -= price;
    this.inventory.addItem(itemId, 1);
    this.updatePlayerHud();
    window.Sound.playSuccess();
    const item = window.GAME_DATA.ITEMS[itemId];
    window.showGameMessage(`购买成功！获得【${item.name}】*1，已放入背包！`, 'success');
  }

  setHomeResidence(mapId) {
    this.playerData.homeResidence = mapId;
    window.Sound.playSuccess();
    window.showGameMessage('🏛️【户籍落定】已成功将【大唐王都·长安城】登记为您的永久居住地！各地土地神处可一键直达！', 'success', 4500);
  }

  teleportToResidence() {
    if (!this.playerData.homeResidence) {
      window.showGameMessage('少侠尚未在大唐长安户籍官处登记定居！请先前往长安城西门户籍官处办理！', 'warning');
      return;
    }
    const mapId = this.playerData.homeResidence;
    this.loadMap(mapId, { x: 3 * 32, y: 11 * 32 });
    window.Sound.playLevelUp();
    window.showGameMessage('🏠 催动归家神印！瞬息回到温馨的大唐长安家园！', 'success', 3500);
  }

  // =========================================================================
  // ☯️ 八卦乾坤引路法阵 (传送门光柱、旋转符文与悬浮云纹牌匾)
  // =========================================================================
  renderMagicPortals(portals) {
    const time = Date.now() / 1000;
    this.ctx.save();

    for (const p of portals) {
      const sx = p.x - this.camera.x;
      const sy = p.y - this.camera.y;

      // 1. 地面透视椭圆阴阳太极光晕
      this.ctx.save();
      this.ctx.translate(sx, sy + 6);
      this.ctx.scale(1.0, 0.45);

      const grad = this.ctx.createRadialGradient(0, 0, 4, 0, 0, 24);
      grad.addColorStop(0, 'rgba(255, 215, 0, 0.85)');
      grad.addColorStop(0.5, 'rgba(52, 152, 219, 0.55)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 24, 0, Math.PI * 2);
      this.ctx.fill();

      // 旋转符文光圈
      this.ctx.rotate(time * 1.5);
      this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.75)';
      this.ctx.lineWidth = 1.8;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
      this.ctx.stroke();

      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        const rx = Math.cos(ang) * 18;
        const ry = Math.sin(ang) * 18;
        this.ctx.fillStyle = '#ffd700';
        this.ctx.beginPath();
        this.ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();

      // 2. 垂直上升的仙气灵珠
      for (let i = 0; i < 3; i++) {
        const offset = ((time * 30 + i * 20) % 40);
        const pAlpha = 1 - offset / 40;
        this.ctx.fillStyle = `rgba(255, 230, 100, ${pAlpha})`;
        this.ctx.beginPath();
        this.ctx.arc(sx + Math.sin(time * 3 + i) * 8, sy - offset, 2.2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // 3. 悬浮在法阵上方 28px 的国风云纹木牌匾
      const labelText = p.name;
      this.ctx.font = 'bold 10px "Microsoft YaHei", sans-serif';
      const textMetrics = this.ctx.measureText(labelText);
      const boxW = textMetrics.width + 16;
      const boxH = 18;
      const boxX = sx - boxW / 2;
      const boxY = sy - 28 + Math.sin(time * 2) * 2;

      // 牌匾底框
      this.ctx.fillStyle = 'rgba(25, 16, 10, 0.9)';
      this.ctx.strokeStyle = '#ffd700';
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();
      this.ctx.roundRect(boxX, boxY, boxW, boxH, 4);
      this.ctx.fill();
      this.ctx.stroke();

      // 发光金字
      this.ctx.fillStyle = '#ffd700';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(labelText, sx, boxY + boxH / 2);
    }

    this.ctx.restore();
  }


  // =========================================================================
  // 剧情转场与战斗系统 (彻底修复遮蔽与卡死)
  // =========================================================================

  // 1. 天宫大闹天宫战斗
  triggerHeavenBattle() {
    // 强制关闭所有残留对话框！
    if (window.Dialogue) {
      window.Dialogue.close();
    }

    const heavenlyBoss = {
      id: 'heavenly_boss',
      templateId: 'juling_shen',
      name: '巨灵神天将',
      isMutated: false,
      isBoss: true,
      level: 45,
      hp: 1800,
      maxHp: 1800,
      mp: 500,
      maxMp: 500,
      atk: 140,
      def: 95,
      matk: 80,
      mdef: 75,
      spd: 35,
      skills: ['必杀', '金刚护体']
    };

    this.start2DBattle([heavenlyBoss], () => {
      setTimeout(() => {
        window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.heaven_banishment);
      }, 500);
    });
  }

  // 2. 贬落凡尘刘家村
  executeBanishment() {
    this.playerData.level = 1;
    this.playerData.exp = 0;
    this.playerData.name = '失忆行者';
    this.playerData.unequipItem('weapon');
    this.playerData.unequipItem('armor');
    this.playerChar.name = this.playerData.name;
    this.playerChar.appearance = 'mortal_wanderer';
    this.playerChar.speed = 2.6;

    this.storyPhase = 'liujiacun_start';

    const viewport = document.getElementById('game-viewport');
    if (viewport) {
      const flash = document.createElement('div');
      flash.style.position = 'absolute';
      flash.style.top = '0';
      flash.style.left = '0';
      flash.style.width = '100%';
      flash.style.height = '100%';
      flash.style.background = '#000';
      flash.style.zIndex = '999';
      flash.style.transition = 'opacity 1.2s';
      viewport.appendChild(flash);

      setTimeout(() => {
        this.loadMap('liujiacun');
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 1200);

        setTimeout(() => {
          window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.liuboqin_talk);
        }, 1000);
      }, 800);
    }
  }

  // 3. 刘伯钦资助
  grantStarterItems() {
    this.inventory.addItem('eq_wp_wood', 1);
    this.inventory.addItem('eq_bt_straw', 1);
    this.inventory.addItem('jinchuang_yao', 5);
    this.playerData.equipItem('weapon', { itemId: 'eq_wp_wood', star: 0 });
    window.Sound.playSuccess();
    this.updatePlayerHud();
    window.showGameMessage('【获得刘伯钦资助】已佩戴【青铜短剑】与【行路草鞋】，获得金创药*5！', 'success', 3500);
  }

  // 4. 触发猛兽战斗
  triggerMonsterBattle(monsterChar) {
    const mob = {
      id: monsterChar.id,
      name: monsterChar.name,
      modelId: monsterChar.appearance || monsterChar.id,
      isMutated: false,
      isBoss: false,
      level: monsterChar.level || 3,
      hp: monsterChar.maxHp || 150,
      maxHp: monsterChar.maxHp || 150,
      mp: 50,
      maxMp: 50,
      atk: monsterChar.atk || 32,
      def: monsterChar.def || 16,
      matk: 10,
      mdef: 10,
      spd: monsterChar.spd || 20,
      skills: ['连击']
    };

    this.start2DBattle([mob], () => {
      this.monsters = this.monsters.filter(m => m.id !== monsterChar.id);
      if (this.currentMapId === 'liujiacun' && this.storyPhase === 'liujiacun_start') {
        this.storyPhase = 'liujiacun_hunted';
        setTimeout(() => {
          window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.liuboqin_post_hunt);
        }, 600);
      }
    });
  }

  // 5. 观音赐宝
  grantGuanyinGift() {
    this.inventory.addItem('eq_nk_dinghun', 1);
    this.inventory.addItem('feixing_fu', 5);
    this.inventory.addItem('jiuzhuan_dan', 3);
    this.storyPhase = 'wuxingshan_ready';
    window.Sound.playSuccess();
    this.updatePlayerHud();
    window.showGameMessage('【菩萨赐宝】获得【九转定魂珠】、飞行神符*5、九转还魂丹*3！前往五行山解救大圣！', 'success', 4000);
  }

  // 6. 五行山金符揭下
  releaseWukong() {
    window.Sound.playCrit();
    const mapData = window.GAME_DATA.MAPS_2D['wuxingshan'];
    mapData.tiles[3][12] = 'grass';

    const vp = document.getElementById('game-viewport');
    if (vp) {
      vp.classList.add('hit-shake');
      setTimeout(() => vp.classList.remove('hit-shake'), 800);
    }

    setTimeout(() => {
      window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.wuxing_freed);
    }, 600);
  }

  // 7. 齐天大圣入队
  joinWukongToParty() {
    this.storyPhase = 'wuxing_freed';
    this.npcs = this.npcs.filter(n => n.id !== 'npc_wukong_sealed');

    const wukongPet = window.PetSystem.createPet('super_wukong', false, 35);
    wukongPet.name = '齐天大圣孙悟空';
    this.companions.push(wukongPet);

    window.Sound.playLevelUp();
    this.updatePlayerHud();
    window.showGameMessage('🎉【齐天大圣孙悟空】手持如意金箍棒，正式加入护法神队！扫平一切妖邪！', 'success', 4500);
  }

  // === 第四章：鹰愁涧小白龙战 ===
  triggerYingchouBattle() {
    if (window.Dialogue) window.Dialogue.close();
    const boss = {
      id: 'boss_xiaobailong',
      name: '小白龙敖烈',
      level: 18,
      hp: 3200,
      maxHp: 3200,
      mp: 800,
      maxMp: 800,
      atk: 120,
      def: 65,
      matk: 110,
      mdef: 60,
      spd: 36,
      skills: ['水攻', '飞沙走石']
    };
    this.start2DBattle([boss], () => {
      setTimeout(() => {
        window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.bailong_post_battle);
      }, 500);
    });
  }

  joinBailongma() {
    this.mountSystem.addMount('bailongma', '西海玉龙·白龙马');
    this.mountSystem.isRiding = true;
    this.playerChar.isRiding = true;
    this.playerData.recalculateStats(true);
    window.Sound.playLevelUp();
    this.updatePlayerHud();
    window.showGameMessage('🎉【小白龙敖烈】化为龙马神驹加入！气血大幅增加，坐骑奔驰如电！', 'success', 4500);
  }

  // === 经典野外演武战斗 (复刻图3：野狼 vs 铁扇公主与无敌黄飞鸿) ===
  triggerWolfBattle() {
    if (window.Dialogue) window.Dialogue.close();
    if (this.playerData) {
      this.playerData.name = '无敌黄飞鸿';
      this.playerData.level = Math.max(25, this.playerData.level);
    }
    // 添加铁扇公主为协同仙宠/同伴 (复刻图3仙宠1位)
    this.companions = [{
      id: 'companion_tieshan',
      name: '铁扇公主',
      modelId: 'tieshan',
      roleId: 'tieshan',
      level: 20,
      hp: 3600,
      maxHp: 3600,
      mp: 1200,
      maxMp: 1200,
      atk: 145,
      def: 80,
      skills: [{ id: 'bajiao_feng', name: '芭蕉狂风', costMp: 45 }]
    }];

    const wolf = {
      id: 'monster_wolf',
      modelId: 'wild_wolf',
      name: '野狼',
      level: 15,
      hp: 2200,
      maxHp: 2200,
      mp: 500,
      maxMp: 500,
      atk: 135,
      def: 65,
      matk: 40,
      mdef: 45,
      spd: 22,
      skills: ['撕咬', '扑击', '野性呼唤']
    };
    this.start2DBattle([wolf], () => {
      window.showGameMessage('🎉【斩妖降魔】降伏凶顽恶狼，获得大量修行道行与仙玉！', 'success', 3500);
    });
  }

  // === 第五章：高老庄天蓬元帅猪八戒战 ===
  triggerBajieBattle() {
    if (window.Dialogue) window.Dialogue.close();
    const boss = {
      id: 'boss_bajie',
      name: '猪刚鬣 (天蓬元帅)',
      level: 25,
      hp: 5800,
      maxHp: 5800,
      mp: 1200,
      maxMp: 1200,
      atk: 165,
      def: 90,
      matk: 80,
      mdef: 75,
      spd: 28,
      skills: ['泰山压顶', '金刚护体', '高级吸血']
    };
    this.start2DBattle([boss], () => {
      setTimeout(() => {
        window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.bajie_post_battle);
      }, 500);
    });
  }

  joinBajieToParty() {
    const bajiePet = {
      id: 'companion_bajie',
      name: '天蓬元帅猪八戒',
      portraitId: 'zhu_bajie',
      level: 25,
      hp: 3500,
      maxHp: 3500,
      mp: 800,
      maxMp: 800,
      atk: 170,
      def: 95,
      matk: 70,
      mdef: 70,
      spd: 28,
      skills: ['泰山压顶', '高级吸血', '高级必杀']
    };
    this.companions.push(bajiePet);
    window.Sound.playLevelUp();
    this.updatePlayerHud();
    window.showGameMessage('🎉【天蓬元帅猪八戒】扛起九齿钉耙，正式加入护法神队！', 'success', 4500);
  }

  // === 第六章：黄风岭虎先锋与黄风怪 ===
  triggerHuxianfengBattle() {
    if (window.Dialogue) window.Dialogue.close();
    const boss = {
      id: 'boss_hu_xianfeng',
      name: '巡山虎先锋',
      level: 28,
      hp: 4600,
      maxHp: 4600,
      mp: 800,
      maxMp: 800,
      atk: 180,
      def: 85,
      matk: 60,
      mdef: 60,
      spd: 38,
      skills: ['高级连击', '高级必杀']
    };
    this.start2DBattle([boss], () => {
      this.npcs = this.npcs.filter(n => n.id !== 'npc_hu_xianfeng');
      window.showGameMessage('【降妖伏魔】前部先锋虎先锋已被扫灭！速进洞降伏黄风怪！', 'success', 4000);
    });
  }

  triggerHuangfengBattle() {
    if (window.Dialogue) window.Dialogue.close();
    const boss = {
      id: 'boss_huangfeng',
      name: '黄风怪 (黄风大圣)',
      level: 34,
      hp: 9200,
      maxHp: 9200,
      mp: 2500,
      maxMp: 2500,
      atk: 210,
      def: 110,
      matk: 230,
      mdef: 120,
      spd: 42,
      skills: ['飞沙走石', '三昧真火', '封印咒']
    };
    this.start2DBattle([boss], () => {
      this.npcs = this.npcs.filter(n => n.id !== 'npc_huangfeng_boss');
      window.showGameMessage('🎉【灵宝止风】定风神丹止住三昧神风！黄风大圣现回黄毛貂鼠原形伏罪！', 'success', 4500);
    });
  }

  // === 第七章：流沙河沙悟净战 ===
  triggerShasengBattle() {
    if (window.Dialogue) window.Dialogue.close();
    const boss = {
      id: 'boss_shaseng',
      name: '沙悟净 (卷帘大将)',
      level: 38,
      hp: 11000,
      maxHp: 11000,
      mp: 2200,
      maxMp: 2200,
      atk: 225,
      def: 140,
      matk: 130,
      mdef: 135,
      spd: 35,
      skills: ['金刚护体', '水攻', '大闹天宫']
    };
    this.start2DBattle([boss], () => {
      setTimeout(() => {
        window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.shaseng_post_battle);
      }, 500);
    });
  }

  joinShasengToParty() {
    const shasengPet = {
      id: 'companion_shaseng',
      name: '卷帘大将沙和尚',
      portraitId: 'sha_wujing',
      level: 38,
      hp: 4200,
      maxHp: 4200,
      mp: 1200,
      maxMp: 1200,
      atk: 210,
      def: 150,
      matk: 120,
      mdef: 140,
      spd: 35,
      skills: ['金刚护体', '水攻', '高级神佑复生']
    };
    this.companions.push(shasengPet);
    window.Sound.playLevelUp();
    this.updatePlayerHud();
    window.showGameMessage('🎉【卷帘大将沙和尚】挑担入队！师徒四人同心圆满，飞渡八百里流沙河！', 'success', 4500);
  }

  // === 第八章：浮屠山乌巢禅师传心经 ===
  learnHeartSutra() {
    this.playerData.maxHp += 1500;
    this.playerData.hp = this.playerData.maxHp;
    this.playerData.maxMp += 800;
    this.playerData.mp = this.playerData.maxMp;
    this.playerData.def += 30;
    this.playerData.mdef += 30;
    window.Sound.playSuccess();
    this.updatePlayerHud();
    window.showGameMessage('📿 顿悟《般若波罗蜜多心经》！心无挂碍，最大气血+1500，最大精力+800，双抗大幅提升！', 'success', 4500);
  }

  // === 第九章：万寿山五庄观地仙之祖镇元子战 ===
  triggerZhenyuanziBattle() {
    if (window.Dialogue) window.Dialogue.close();
    const boss = {
      id: 'boss_zhenyuanzi',
      name: '镇元大仙 (地仙之祖)',
      level: 55,
      hp: 28000,
      maxHp: 28000,
      mp: 9999,
      maxMp: 9999,
      atk: 360,
      def: 220,
      matk: 380,
      mdef: 240,
      spd: 50,
      skills: ['金刚护体', '封印咒', '雷霆万钧', '大闹天宫']
    };
    this.start2DBattle([boss], () => {
      setTimeout(() => {
        window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.zhenyuanzi_post_battle);
      }, 500);
    });
  }

  grantZhenyuanziGift() {
    this.playerData.exp += 60000;
    this.playerData.silver += 50000;
    this.playerData.recalculateStats(false);
    window.Sound.playLevelUp();
    this.updatePlayerHud();
    window.showGameMessage('🎉 获赠万寿山【草还丹人参果】仙果！修为经验暴增60000，境界大幅突破！', 'success', 4500);
  }

  // === 第十章：白虎岭白骨夫人战 ===
  triggerBaigujingBattle() {
    if (window.Dialogue) window.Dialogue.close();
    const boss = {
      id: 'boss_baigujing',
      name: '白骨夫人 (幽冥尸魔)',
      level: 42,
      hp: 15000,
      maxHp: 15000,
      mp: 3500,
      maxMp: 3500,
      atk: 250,
      def: 130,
      matk: 260,
      mdef: 140,
      spd: 45,
      skills: ['隐身咒', '三昧真火', '连击']
    };
    this.start2DBattle([boss], () => {
      this.npcs = this.npcs.filter(n => n.id !== 'npc_baigujing');
      window.showGameMessage('🎉【火眼金睛破尸魔】三打白骨夫人大获全胜！妖氛尽散！', 'success', 4500);
    });
  }

  // === 第十一章：宝象国波月洞奎木狼黄袍怪战 ===
  triggerHuangpaoBattle() {
    if (window.Dialogue) window.Dialogue.close();
    const boss = {
      id: 'boss_huangpao',
      name: '黄袍怪 (奎木狼)',
      level: 48,
      hp: 19500,
      maxHp: 19500,
      mp: 4000,
      maxMp: 4000,
      atk: 310,
      def: 165,
      matk: 240,
      mdef: 150,
      spd: 44,
      skills: ['雷霆万钧', '舍生取义', '飞沙走石']
    };
    this.start2DBattle([boss], () => {
      this.npcs = this.npcs.filter(n => n.id !== 'npc_huangpao_boss');
      window.showGameMessage('🎉【大破波月洞】降伏奎木狼还朝！救出百花羞公主，宝象国大摆盛筵相庆！', 'success', 5000);
    });
  }

  // 战斗桥接与全屏渲染 (彻底消除卡死，国风立绘，战术时序与动作打击)
  // 战斗桥接与全屏渲染 (经典汉风三栏布局：左敌方竖排，中操作竖排，右我方四位竖排)
  start2DBattle(enemies, onVictoryCallback) {
    if (window.Dialogue) {
      window.Dialogue.close();
    }

    const battleEl = document.getElementById('battle-screen-layer');
    if (!battleEl) return;

    battleEl.style.display = 'flex';
    this.isPaused = true;

    // 仙宠出战规则：20级带1只、30级带2只、40级带3只
    const maxPets = this.playerData.getMaxCombatPets ? this.playerData.getMaxCombatPets() : 0;
    let combatAllies = [];
    if (this.activeCombatPets && this.activeCombatPets.length > 0) {
      combatAllies = this.activeCombatPets.slice(0, maxPets);
    } else if (this.pets && this.pets.length > 0) {
      combatAllies = this.pets.slice(0, maxPets);
    }

    // 剧情协同同伴（若仙宠槽位有余且非重复则出战助威）
    if (this.companions && this.companions.length > 0) {
      for (const comp of this.companions) {
        if (!combatAllies.some(p => p.name === comp.name) && combatAllies.length < 3) {
          combatAllies.push(comp);
        }
      }
    }

    this.currentBattle = new window.BattleEngine(
      this.playerData,
      combatAllies,
      enemies
    );

    this.selectedTargetIndex = 0;
    this.selectedAllyId = 'player';
    this.battleSkillMenuOpen = false;
    this.battleCountdown = 30;
    this.autoCombatEnabled = false;
    this.combatSpeedMultiplier = 1;
    this.battleVictoryCallback = onVictoryCallback;

    this.startBattleCountdown();
    this.renderBattleInterface();
    this.startBattleLoop();
  }

  startBattleCountdown() {
    this.stopBattleCountdown();
    this.battleCountdown = 30;
    this.battleCountdownTimer = setInterval(() => {
      if (!this.currentBattle) {
        this.stopBattleCountdown();
        return;
      }
      this.battleCountdown--;
      const pillTextEl = document.getElementById('battle-acting-countdown-text');
      if (pillTextEl) {
        pillTextEl.innerText = `(${this.battleCountdown})`;
      }
      if (this.battleCountdown <= 0) {
        this.battleCountdown = 30;
        this.executeCombatRound();
      }
    }, 1000);
  }

  stopBattleCountdown() {
    if (this.battleCountdownTimer) {
      clearInterval(this.battleCountdownTimer);
      this.battleCountdownTimer = null;
    }
  }

  startBattleLoop() {
    if (this.battleAnimId) {
      cancelAnimationFrame(this.battleAnimId);
      this.battleAnimId = null;
    }
    const loop = () => {
      if (!this.currentBattle) return;
      this.renderBattleCanvasFrame();
      this.battleAnimId = requestAnimationFrame(loop);
    };
    this.battleAnimId = requestAnimationFrame(loop);
  }

  stopBattleLoop() {
    if (this.battleAnimId) {
      cancelAnimationFrame(this.battleAnimId);
      this.battleAnimId = null;
    }
  }

  toggleSkillMenu(isOpen) {
    this.battleSkillMenuOpen = isOpen;
    const hexSvg = document.getElementById('battle-hex-svg');
    const skillPanel = document.getElementById('battle-skill-panel');
    if (hexSvg && skillPanel) {
      hexSvg.style.display = isOpen ? 'none' : 'block';
      skillPanel.style.display = isOpen ? 'flex' : 'none';
      if (window.Sound) window.Sound.playBeep();
      return;
    }
    this.renderBattleInterface();
  }

  selectTarget(idx) {
    if (!this.currentBattle) return;
    this.selectedTargetIndex = idx;
    if (window.Sound) window.Sound.playBeep();
    this.renderBattleInterface();
  }

  selectAlly(allyId) {
    if (!this.currentBattle) return;
    const targetAlly = this.currentBattle.allies.find(a => a.id === allyId);
    if (!targetAlly || targetAlly.hp <= 0) return;
    this.selectedAllyId = allyId;
    this.battleSkillMenuOpen = false;
    if (window.Sound) window.Sound.playBeep();
    this.renderBattleInterface();
  }

  handleHexCombatAction(action) {
    if (!this.currentBattle || this.currentBattle.status === 'executing') return;
    if (window.Sound) window.Sound.playBeep();
    if (action === 'attack') {
      this.chooseCombatAction('attack');
    } else if (action === 'skill') {
      this.toggleSkillMenu(!this.battleSkillMenuOpen);
    } else if (action === 'capture') {
      this.chooseCombatAction('capture');
    } else if (action === 'item') {
      this.chooseCombatAction('item');
    } else if (action === 'pet') {
      window.showGameMessage('🐾 仙宠正随你列阵战敌！点击右侧仙宠形象可直接指派出招。', 'info');
    } else if (action === 'flee') {
      this.chooseCombatAction('flee');
    } else if (action === 'defend') {
      this.chooseCombatAction('defend');
    }
  }

  toggleAutoCombat() {
    this.autoCombatEnabled = !this.autoCombatEnabled;
    window.showGameMessage(this.autoCombatEnabled ? '⚔️ 已开启全员自动施法出招！' : '🛑 已解除自动出招', 'info');
    this.renderBattleInterface();
    if (this.autoCombatEnabled && this.currentBattle && this.currentBattle.status !== 'executing') {
      this.executeCombatRound();
    }
  }

  toggleCombatSpeed() {
    this.combatSpeedMultiplier = (this.combatSpeedMultiplier === 2) ? 1 : 2;
    window.showGameMessage(`⏩ 战斗演武速度已切换为 ${this.combatSpeedMultiplier}x`, 'info');
    this.renderBattleInterface();
  }

  // 渲染经典MRP回合战场：顶部双龙金匾、中央全幅模型战场+六边形蜂窝阵、底部自动出招控制
  renderBattleInterface() {
    const layer = document.getElementById('battle-screen-layer');
    if (!layer || !this.currentBattle) return;

    const turnQueue = (this.currentBattle && this.currentBattle.turnQueue) || [];
    const curTarget = this.currentBattle.enemies[this.selectedTargetIndex] || this.currentBattle.enemies[0];
    const curAllyId = this.selectedAllyId || 'player';
    const curAlly = this.currentBattle.allies.find(a => a.id === curAllyId) || this.currentBattle.allies[0];
    const skills = curAlly?.isPlayer ? this.playerData.getSkills() : (curAlly?.skills || []);

    layer.innerHTML = `
      <div class="battle-container" id="battle-main-container" style="width:100%;height:100%;background:#0a0c09;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden;box-shadow:inset 0 0 35px #000;">

        <!-- 1. 顶部双龙金匾与战术信息横幅 (复刻图3标准) -->
        <div class="battle-dragon-header-bar">
          <div class="dragon-plaque-container">
            <span class="dragon-crest-icon">🐉</span>
            <div class="dragon-plaque-text">战 斗</div>
            <span class="dragon-crest-icon" style="transform: scaleX(-1);">🐉</span>
          </div>

          <div class="battle-banner-pills-row">
            <div class="battle-banner-pill" title="当前攻击目标">
              <span>🎯 目标:</span>
              <span style="color:#ff6b81;">${curTarget ? curTarget.name : '未指定'}</span>
            </div>

            <div class="battle-banner-pill acting-pill" title="当前指令角色与出招倒计时">
              <span>⚡ ${curAlly ? curAlly.name : '侠士'}-出招</span>
              <span id="battle-acting-countdown-text" style="color:#ffd700;font-weight:900;">(${this.battleCountdown || 30})</span>
            </div>

            <div class="battle-banner-pill" title="指挥玩家本尊">
              <span>👤 ${this.playerData ? this.playerData.name : '侠士'}</span>
            </div>
          </div>
        </div>

        <!-- 战术时序速度轴 -->
        <div class="battle-timeline-bar" style="margin: 3px 10px 1px 10px; padding: 2px 8px; font-size: 10px; border-radius: 4px;">
          <span class="timeline-title" style="font-size:10px;">📜 行动序:</span>
          ${turnQueue.map(item => `
            <div class="timeline-badge ${item.side === 'ally' ? 'timeline-ally' : 'timeline-enemy'}" style="padding: 1px 6px; font-size: 10px;">
              <span class="timeline-num">#${item.turnOrder}</span>
              <span class="timeline-name">${item.name}</span>
            </div>
          `).join('')}
        </div>

        <!-- 动效浮层 (飘字、刀光、雷霆) -->
        <div id="battle-fx-layer" class="battle-fx-layer"></div>

        <!-- 2. 战场主舞台：Canvas模型站立阵列 + 中央六边形蜂窝操作矩阵 -->
        <div class="battle-stage-area" id="battle-stage-area" style="flex:1;position:relative;width:100%;min-height:280px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
          <!-- 战场全景与角色模型 Canvas -->
          <canvas id="battle-scene-canvas"></canvas>

          <!-- 3. 中央：暗红漆金蜂窝六边形按键矩阵 (复刻图3核心按键) 与 绝技选择面板 (常驻DOM，稳定定位) -->
          <div class="battle-honeycomb-menu-container" id="battle-honeycomb-menu" style="${this.currentBattle.status === 'executing' ? 'opacity:0.35;pointer-events:none;' : 'opacity:1;pointer-events:auto;'}">
            <!-- 常驻七蜂窝指令矩阵 -->
            <svg viewBox="0 0 148 240" class="hex-btn-cluster" id="battle-hex-svg" style="display:${this.battleSkillMenuOpen ? 'none' : 'block'};width:142px;height:230px;">
              <defs>
                <linearGradient id="lacquerRedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#b32424" />
                  <stop offset="50%" stop-color="#7a1414" />
                  <stop offset="100%" stop-color="#3d0606" />
                </linearGradient>
                <linearGradient id="lacquerRedHoverGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#d63031" />
                  <stop offset="50%" stop-color="#991b1b" />
                  <stop offset="100%" stop-color="#550c0c" />
                </linearGradient>
              </defs>

              <!-- 左列: 4个六边形 (x: 4) -->
              <!-- 攻击 -->
              <g class="hex-svg-btn" onclick="window.App2D.handleHexCombatAction('attack')" transform="translate(4, 2)">
                <polygon points="28,0 56,16 56,48 28,64 0,48 0,16" class="hex-polygon-bg"/>
                <text x="28" y="27" class="hex-btn-label">攻击</text>
                <text x="28" y="44" class="hex-btn-key">[Space]</text>
              </g>
              <!-- 收服 -->
              <g class="hex-svg-btn" onclick="window.App2D.handleHexCombatAction('capture')" transform="translate(4, 58)">
                <polygon points="28,0 56,16 56,48 28,64 0,48 0,16" class="hex-polygon-bg"/>
                <text x="28" y="27" class="hex-btn-label">收服</text>
                <text x="28" y="44" class="hex-btn-key">[R]</text>
              </g>
              <!-- 仙宠 -->
              <g class="hex-svg-btn" onclick="window.App2D.handleHexCombatAction('pet')" transform="translate(4, 114)">
                <polygon points="28,0 56,16 56,48 28,64 0,48 0,16" class="hex-polygon-bg"/>
                <text x="28" y="27" class="hex-btn-label">仙宠</text>
                <text x="28" y="44" class="hex-btn-key">🐾</text>
              </g>
              <!-- 休息 -->
              <g class="hex-svg-btn" onclick="window.App2D.handleHexCombatAction('defend')" transform="translate(4, 170)">
                <polygon points="28,0 56,16 56,48 28,64 0,48 0,16" class="hex-polygon-bg"/>
                <text x="28" y="27" class="hex-btn-label">休息</text>
                <text x="28" y="44" class="hex-btn-key">[W]</text>
              </g>

              <!-- 右列: 3个六边形 (x: 52, y偏移28) -->
              <!-- 技能 -->
              <g class="hex-svg-btn" onclick="window.App2D.handleHexCombatAction('skill')" transform="translate(52, 30)">
                <polygon points="28,0 56,16 56,48 28,64 0,48 0,16" class="hex-polygon-bg"/>
                <text x="28" y="27" class="hex-btn-label">技能</text>
                <text x="28" y="44" class="hex-btn-key">[Q]</text>
              </g>
              <!-- 物品 -->
              <g class="hex-svg-btn" onclick="window.App2D.handleHexCombatAction('item')" transform="translate(52, 86)">
                <polygon points="28,0 56,16 56,48 28,64 0,48 0,16" class="hex-polygon-bg"/>
                <text x="28" y="27" class="hex-btn-label">物品</text>
                <text x="28" y="44" class="hex-btn-key">[E]</text>
              </g>
              <!-- 逃跑 -->
              <g class="hex-svg-btn" onclick="window.App2D.handleHexCombatAction('flee')" transform="translate(52, 142)">
                <polygon points="28,0 56,16 56,48 28,64 0,48 0,16" class="hex-polygon-bg"/>
                <text x="28" y="27" class="hex-btn-label">逃跑</text>
                <text x="28" y="44" class="hex-btn-key">💨</text>
              </g>
            </svg>

            <!-- 绝技选择面板 (常驻DOM，通过display互斥，不破坏布局，杜绝重叠与重排闪烁) -->
            <div class="battle-skill-popup-panel" id="battle-skill-panel" style="display:${this.battleSkillMenuOpen ? 'flex' : 'none'};">
              <div style="font-size:12px;font-weight:bold;color:#ffd700;border-bottom:1px solid #c59b27;padding-bottom:3px;display:flex;justify-content:space-between;align-items:center;">
                <span>✨ 施展门派绝技</span>
                <span style="font-size:10.5px;cursor:pointer;color:#ffd700;" onclick="window.App2D.toggleSkillMenu(false)">✕ 返回指令</span>
              </div>
              ${skills.length === 0 ? `<div style="font-size:10px;color:#888;text-align:center;padding:10px 0;">尚未领悟绝技</div>` : skills.map(sk => `
                <button class="battle-skill-item-btn" onclick="window.App2D.chooseCombatAction('skill', '${sk.id}')">
                  <div>
                    <div style="color:#ffd700;font-weight:bold;font-size:11.5px;">${sk.icon || '🔥'} ${sk.name}</div>
                    <div style="font-size:9px;color:#a8e6cf;">消耗: ${sk.costMp ? `${sk.costMp}精力` : '无'}</div>
                  </div>
                  <span style="font-size:10px;color:#f5cd79;">出招 ▶</span>
                </button>
              `).join('')}
              <button class="mrp-vertical-btn" style="padding:4px;font-size:11px;margin-top:2px;" onclick="window.App2D.toggleSkillMenu(false)">◀ 返回指令</button>
            </div>
          </div>
        </div>

        <!-- 4. 底部状态与操作控制栏 (复刻图3：开启自动出招、快进设置与区派商世标签) -->
        <div class="battle-bottom-controls-bar">
          <button class="auto-combat-btn ${this.autoCombatEnabled ? 'auto-active' : ''}" onclick="window.App2D.toggleAutoCombat()" title="切换全员自动普攻/绝技出手">
            ⚔️ ${this.autoCombatEnabled ? '正在自动出招...' : '开启自动出招'}
          </button>

          <div style="display:flex;align-items:center;gap:6px;">
            <button class="mrp-chat-tab-btn" onclick="window.App2D.toggleCombatSpeed()" title="切换战斗打击节奏倍速">
              ⏩ ${this.combatSpeedMultiplier || 1}x
            </button>
            <button class="mrp-chat-tab-btn" onclick="window.App2D.openPlayerProfileModal()" title="角色属性">
              ⚙️
            </button>
          </div>

          <div class="mrp-chat-tabs-bar">
            <button class="mrp-chat-tab-btn active">区</button>
            <button class="mrp-chat-tab-btn">派</button>
            <button class="mrp-chat-tab-btn">商</button>
            <button class="mrp-chat-tab-btn">世</button>
          </div>
        </div>

        <!-- 实时战斗日志框 (底部极简滚动条) -->
        <div class="battle-log-box" id="battle-log-box-2d" style="background:rgba(10,8,6,0.92);border-top:1px solid #4a3824;padding:3px 12px;font-size:11px;line-height:1.5;color:#fef0cd;max-height:42px;overflow-y:auto;">
          ${this.currentBattle.logs.slice(-2).map(l => `<div>${l}</div>`).join('')}
        </div>
      </div>
    `;

    // 初始化画布与交互事件
    this.initBattleCanvas();
  }

  // 初始化战场舞台画布
  initBattleCanvas() {
    const canvas = document.getElementById('battle-scene-canvas');
    if (!canvas) return;

    const container = document.getElementById('battle-stage-area');
    if (container) {
      const rect = container.getBoundingClientRect();
      canvas.width = Math.max(560, Math.floor(rect.width));
      canvas.height = Math.max(280, Math.floor(rect.height));
    } else {
      canvas.width = 640;
      canvas.height = 320;
    }

    canvas.onclick = (e) => {
      if (!this.currentBattle || this.currentBattle.status === 'executing') return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;
      this.handleBattleCanvasClick(clickX, clickY);
    };
  }

  // 点击画布判定选择目标与切换友方
  handleBattleCanvasClick(clickX, clickY) {
    if (!this.currentBattle) return;

    // 左侧区域：指定敌方目标
    if (clickX < this.battleCanvasWidth * 0.42 || clickX < 240) {
      const enemies = this.currentBattle.enemies;
      let closestIdx = -1;
      let minDis = 99999;
      enemies.forEach((e, idx) => {
        if (e.hp <= 0) return;
        const pos = e._battlePos;
        if (pos) {
          const d = Math.hypot(clickX - pos.x, clickY - pos.y);
          if (d < 65 && d < minDis) {
            minDis = d;
            closestIdx = idx;
          }
        }
      });
      if (closestIdx !== -1) {
        this.selectTarget(closestIdx);
      }
    }
    // 右侧区域：切换受指派友方角色
    else if (clickX > this.battleCanvasWidth * 0.58 || clickX > 360) {
      const allies = this.currentBattle.allies;
      let closestAlly = null;
      let minDis = 99999;
      allies.forEach(a => {
        if (a.hp <= 0) return;
        const pos = a._battlePos;
        if (pos) {
          const d = Math.hypot(clickX - pos.x, clickY - pos.y);
          if (d < 65 && d < minDis) {
            minDis = d;
            closestAlly = a;
          }
        }
      });
      if (closestAlly) {
        this.selectAlly(closestAlly.id);
      }
    }
  }

  // 绘制战场Canvas全景：草地绿茵、左侧真实站立怪物模型、右侧站立角色/仙宠模型、通天金黄光柱
  renderBattleCanvasFrame() {
    const canvas = document.getElementById('battle-scene-canvas');
    if (!canvas || !this.currentBattle) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    this.battleCanvasWidth = width;
    this.battleCanvasHeight = height;

    ctx.clearRect(0, 0, width, height);

    // 1. 绘制草地/仙境自然战场背景 (复刻图3：绿茵草地与远景光影)
    const groundGrad = ctx.createLinearGradient(0, 0, 0, height);
    groundGrad.addColorStop(0, '#557c2c');
    groundGrad.addColorStop(0.3, '#436820');
    groundGrad.addColorStop(0.7, '#345217');
    groundGrad.addColorStop(1, '#1e320d');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, 0, width, height);

    // 自然草地碎斑质感
    ctx.fillStyle = 'rgba(92, 138, 48, 0.35)';
    for (let i = 12; i < width; i += 28) {
      const py = ((i * 19) % (height - 35)) + 15;
      ctx.fillRect(i, py, 14, 4.5);
    }

    // 柔和圣境天光
    const radial = ctx.createRadialGradient(width * 0.5, -20, 30, width * 0.5, height * 0.5, width * 0.7);
    radial.addColorStop(0, 'rgba(255, 255, 225, 0.16)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0.22)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    const animTimer = Date.now() / 150;

    // 2. 左侧：敌方阵容 (竖排排列，真实全身模型站立于战场大地，非头像卡片)
    const enemies = this.currentBattle.enemies;
    const enemyX = Math.floor(width * 0.18);
    enemies.forEach((e, idx) => {
      if (e.hp <= 0) return;
      let ey;
      if (enemies.length === 1) ey = Math.floor(height * 0.52);
      else if (enemies.length === 2) ey = Math.floor(height * (idx === 0 ? 0.35 : 0.68));
      else ey = Math.floor(height * (0.22 + idx * 0.28));

      e._battlePos = { x: enemyX, y: ey };
      const isTargeted = (this.selectedTargetIndex === idx);

      // 若被锁定为攻击目标，脚底绘制赤金锁定法阵光环
      if (isTargeted) {
        ctx.save();
        const pulse = Math.sin(animTimer * 0.25) * 2.5;
        ctx.strokeStyle = '#ff4757';
        ctx.lineWidth = 2.4;
        ctx.shadowColor = '#ff4757';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(enemyX, ey + 12, 22 + pulse, 9 + pulse * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(enemyX, ey + 12, 15, 6, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 敌方全身模型派发
      let mId = e.modelId || e.appearance || e.id || '';
      if (e.name.includes('狼') || mId.includes('wolf') || mId.includes('huangpao')) mId = 'wild_wolf';
      else if (e.name.includes('虎') || mId.includes('tiger') || mId.includes('huxianfeng') || mId.includes('huangfeng')) mId = 'hu_xianfeng';
      else if (e.name.includes('蛇') || mId.includes('snake')) mId = 'pet_snake';
      else if (e.name.includes('骨') || e.name.includes('骷髅') || mId.includes('baigu')) mId = 'baigu_jing';
      else if (e.name.includes('八戒') || e.name.includes('猪') || mId.includes('bajie')) mId = 'zhu_bajie';
      else if (e.name.includes('鼠') || mId.includes('rat')) mId = 'giant_rat';
      else if (e.name.includes('龟') || mId.includes('gui') || mId.includes('turtle')) mId = 'turtle';
      else if (e.name.includes('沙') || mId.includes('wujing') || mId.includes('shaseng')) mId = 'sha_wujing';
      else if (e.name.includes('龙') || mId.includes('bailong')) mId = 'bailongma';
      else if (e.name.includes('猴') || e.name.includes('悟空') || mId.includes('wukong')) mId = 'sun_wukong';
      else if (e.name.includes('铁扇') || mId.includes('tieshan')) mId = 'tieshan';
      else if (e.name.includes('镇元') || mId.includes('zhenyuanzi')) mId = 'tang_seng';
      else if (e.name.includes('天神') || e.name.includes('天将') || mId.includes('heaven')) mId = 'heaven_general';

      if (window.CharacterRenderer) {
        window.CharacterRenderer.drawModel(ctx, enemyX, ey, mId, {
          direction: 'right',
          scale: 1.32,
          animTimer: animTimer + idx,
          isActing: false
        });
      }

      // 头顶醒目姓名 (粗白字 + 纯黑描边，复刻图3标准)
      ctx.save();
      ctx.font = 'bold 12.5px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;
      ctx.lineJoin = 'round';
      ctx.strokeText(e.name, enemyX, ey - 28);
      ctx.fillStyle = isTargeted ? '#ff4757' : (e.isBoss ? '#ffd700' : '#ffffff');
      ctx.fillText(e.name, enemyX, ey - 28);

      // 头顶锁定小红箭头指示
      if (isTargeted) {
        const arrowY = ey - 44 + Math.sin(Date.now() / 150) * 3;
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.moveTo(enemyX, arrowY);
        ctx.lineTo(enemyX - 5.5, arrowY - 8);
        ctx.lineTo(enemyX + 5.5, arrowY - 8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 脚底生命条与时序编号
      const barW = 48;
      const barH = 5;
      const barX = enemyX - barW / 2;
      const barY = ey + 20;
      const hpPct = Math.max(0, Math.min(1, e.hp / e.maxHp));

      ctx.fillStyle = 'rgba(12, 9, 6, 0.85)';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.strokeStyle = '#3d2503';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);

      ctx.fillStyle = '#ff4757';
      ctx.fillRect(barX + 0.5, barY + 0.5, (barW - 1) * hpPct, barH - 1);

      if (e.turnOrder) {
        ctx.fillStyle = 'rgba(231, 76, 60, 0.95)';
        ctx.fillRect(barX - 18, barY - 1, 16, 7);
        ctx.font = 'bold 8.5px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('#' + e.turnOrder, barX - 10, barY + 2.5);
      }
      ctx.restore();
    });

    // 3. 右侧：我方阵容 (竖排四位：玩家、仙宠1、仙宠2、仙宠3)
    const allyX = Math.floor(width * 0.82);
    const pLevel = this.playerData ? this.playerData.level : 1;
    const petAllies = this.currentBattle.allies.filter(a => !a.isPlayer);
    const slots = [
      { id: 'player', ally: this.currentBattle.allies.find(a => a.isPlayer) || this.currentBattle.allies[0], name: this.playerData.name, reqLvl: 1, y: Math.floor(height * 0.20) },
      { id: 'pet1', ally: petAllies[0], name: '仙宠1', reqLvl: 20, y: Math.floor(height * 0.42) },
      { id: 'pet2', ally: petAllies[1], name: '仙宠2', reqLvl: 30, y: Math.floor(height * 0.64) },
      { id: 'pet3', ally: petAllies[2], name: '仙宠3', reqLvl: 40, y: Math.floor(height * 0.84) }
    ];

    slots.forEach(slot => {
      const ay = slot.y;
      const isPlayerSlot = (slot.id === 'player');
      const ally = slot.ally;

      if (!isPlayerSlot && pLevel < slot.reqLvl) {
        // 未解锁槽位
        ctx.save();
        ctx.fillStyle = 'rgba(15, 10, 8, 0.45)';
        ctx.beginPath();
        ctx.ellipse(allyX, ay + 6, 20, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#4a3824';
        ctx.stroke();

        ctx.font = '10px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#776655';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`🔒 ${slot.reqLvl}级解锁`, allyX, ay + 4);
        ctx.restore();
        return;
      }

      if (!ally) {
        // 空闲槽位
        ctx.save();
        ctx.fillStyle = 'rgba(15, 10, 8, 0.38)';
        ctx.beginPath();
        ctx.ellipse(allyX, ay + 6, 20, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(197, 155, 39, 0.4)';
        ctx.stroke();

        ctx.font = '10px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#8e734c';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`🐾 空闲`, allyX, ay + 4);
        ctx.restore();
        return;
      }

      if (ally.hp <= 0) return;

      ally._battlePos = { x: allyX, y: ay };
      const isActing = (this.selectedAllyId === ally.id);

      // 若为当前出招者：先在底层绘制通天神圣金黄光柱！(完全复刻图3震撼效果)
      if (isActing && window.CharacterRenderer) {
        window.CharacterRenderer.drawActingLightPillar(ctx, allyX, ay, 58, 105);
      }

      // 确定角色模型 (无敌黄飞鸿武学宗师、铁扇公主、大圣、元帅或神将)
      let mId = ally.modelId || ally.appearance || '';
      if (isPlayerSlot) {
        mId = 'martial_hero';
      } else {
        if (ally.name.includes('悟空') || ally.name.includes('猴') || ally.roleId === 'sun_wukong') mId = 'sun_wukong';
        else if (ally.name.includes('八戒') || ally.name.includes('猪') || ally.roleId === 'zhu_bajie') mId = 'zhu_bajie';
        else if (ally.name.includes('沙') || ally.roleId === 'sha_wujing') mId = 'sha_wujing';
        else if (ally.name.includes('铁扇') || ally.roleId === 'tieshan' || mId.includes('tieshan')) mId = 'tieshan';
        else if (ally.name.includes('蛇') || ally.roleId === 'pet_snake' || mId.includes('she')) mId = 'pet_snake';
        else if (ally.name.includes('龟') || mId.includes('gui')) mId = 'turtle';
        else mId = mId || 'tieshan';
      }

      if (window.CharacterRenderer) {
        window.CharacterRenderer.drawModel(ctx, allyX, ay, mId, {
          direction: 'left',
          scale: 1.32,
          animTimer: animTimer + 2,
          isActing: isActing
        });
      }

      // 头顶清晰姓名 (加粗白色 + 黑色描边)
      ctx.save();
      ctx.font = 'bold 12px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;
      ctx.lineJoin = 'round';
      ctx.strokeText(ally.name, allyX, ay - 26);
      ctx.fillStyle = isActing ? '#fffa65' : (isPlayerSlot ? '#ffeaa7' : '#f5cd79');
      ctx.fillText(ally.name, allyX, ay - 26);

      // 脚底生命/精力槽与时序
      const barW = 48;
      const barH = 5;
      const barX = allyX - barW / 2;
      const barY = ay + 18;
      const hpPct = Math.max(0, Math.min(1, ally.hp / ally.maxHp));

      ctx.fillStyle = 'rgba(12, 9, 6, 0.85)';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.strokeStyle = '#3d2503';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);

      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(barX + 0.5, barY + 0.5, (barW - 1) * hpPct, barH - 1);

      if (ally.maxMp) {
        const mpPct = Math.max(0, Math.min(1, ally.mp / ally.maxMp));
        ctx.fillStyle = 'rgba(12, 9, 6, 0.85)';
        ctx.fillRect(barX, barY + 6, barW, 3);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(barX + 0.5, barY + 6.5, (barW - 1) * mpPct, 2);
      }

      if (ally.turnOrder) {
        ctx.fillStyle = 'rgba(39, 174, 96, 0.95)';
        ctx.fillRect(barX + barW + 2, barY - 1, 16, 7);
        ctx.font = 'bold 8.5px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('#' + ally.turnOrder, barX + barW + 10, barY + 2.5);
      }

      ctx.restore();
    });
  }

  // 触发战斗动作动效与伤害飘字
  spawnBattleFloatingText(targetEl, text, type = 'damage') {
    const fxLayer = document.getElementById('battle-fx-layer');
    if (!fxLayer) return;

    let posX = 150;
    let posY = 150;
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      const container = document.getElementById('battle-main-container');
      if (container) {
        const cRect = container.getBoundingClientRect();
        posX = rect.left - cRect.left + rect.width / 2 - 25;
        posY = rect.top - cRect.top + 6;
      }
    }

    const el = document.createElement('div');
    el.className = `floating-text ${type === 'crit' ? 'float-crit' : (type === 'heal' ? 'float-heal' : 'float-damage')}`;
    el.innerText = text;
    el.style.left = `${posX}px`;
    el.style.top = `${posY}px`;

    fxLayer.appendChild(el);
    setTimeout(() => el.remove(), 850);
  }

  spawnBattleFloatingTextAtCoords(posX, posY, text, type = 'damage') {
    const fxLayer = document.getElementById('battle-fx-layer');
    if (!fxLayer) return;

    const el = document.createElement('div');
    el.className = `floating-text ${type === 'crit' ? 'float-crit' : (type === 'heal' ? 'float-heal' : 'float-damage')}`;
    el.innerText = text;
    el.style.left = `${posX - 20}px`;
    el.style.top = `${posY - 30}px`;

    fxLayer.appendChild(el);
    setTimeout(() => el.remove(), 850);
  }

  // 选择当前角色的战斗指令，并自动推进或执行
  chooseCombatAction(type, skillId = null) {
    if (!this.currentBattle || this.currentBattle.status === 'executing') return;

    this.battleSkillMenuOpen = false;

    // 默认若选择药品，优先使用金创药
    const medicineItem = this.inventory ? this.inventory.getItems().find(s => s.itemId === 'jinchuang_yao' || s.itemId === 'dahuan_dan') : null;

    const curAllyId = this.selectedAllyId || 'player';
    const curAlly = this.currentBattle.allies.find(a => a.id === curAllyId) || this.currentBattle.allies[0];

    const actionData = {
      type: type,
      targetIndex: this.selectedTargetIndex || 0,
      skillId: skillId || (curAlly && curAlly.skills && curAlly.skills[0] ? curAlly.skills[0].id : null),
      itemId: medicineItem ? medicineItem.itemId : 'jinchuang_yao'
    };

    this.currentBattle.setAllyAction(curAlly.id, actionData);

    if (type === 'flee') {
      this.executeCombatRound();
      return;
    }

    // 检查是否还有存活友方未下指令
    const aliveAllies = this.currentBattle.allies.filter(a => a.hp > 0);
    const unassigned = aliveAllies.find(a => !this.currentBattle.actions[a.id]);

    if (unassigned) {
      this.selectedAllyId = unassigned.id;
      if (window.Sound) window.Sound.playBeep();
      this.renderBattleInterface();
    } else {
      // 全员指令就绪，执行交锋！
      this.executeCombatRound();
    }
  }

  // 执行战斗交锋回合与动作打击演算
  async executeCombatRound() {
    if (!this.currentBattle || this.currentBattle.status === 'executing') return;

    this.battleSkillMenuOpen = false;

    // 锁定指令菜单，杜绝交锋演算期间鼠标滑过触发重排与重叠
    const menuContainer = document.getElementById('battle-honeycomb-menu');
    if (menuContainer) {
      menuContainer.style.pointerEvents = 'none';
      menuContainer.style.opacity = '0.35';
    }

    // 为未指定行动的友方默认设置普攻
    this.currentBattle.allies.forEach(a => {
      if (a.hp > 0 && !this.currentBattle.actions[a.id]) {
        this.currentBattle.setAllyAction(a.id, {
          type: 'attack',
          targetIndex: this.selectedTargetIndex || 0
        });
      }
    });

    const speedDelay = (this.combatSpeedMultiplier === 2) ? 320 : 600;

    await this.currentBattle.executeRound(async (step) => {
      // 实时更新底部战报条，无需摧毁主舞台DOM
      const logBox = document.getElementById('battle-log-box-2d');
      if (logBox && this.currentBattle.logs) {
        logBox.innerHTML = this.currentBattle.logs.slice(-2).map(l => `<div>${l}</div>`).join('');
        logBox.scrollTop = logBox.scrollHeight;
      }

      const stage = document.getElementById('battle-stage-area');

      // 视觉打击感反馈
      if (step.type === 'damage') {
        const isAllyAttacker = !step.attacker.startsWith('enemy_');
        const targetEntity = isAllyAttacker
          ? this.currentBattle.enemies[step.targetIndex]
          : this.currentBattle.allies.find(a => a.id === step.target);

        if (targetEntity && targetEntity._battlePos) {
          this.spawnBattleFloatingTextAtCoords(targetEntity._battlePos.x, targetEntity._battlePos.y, step.text, step.isCrit ? 'crit' : 'damage');
        }

        if (stage) {
          stage.classList.add('arena-shake');
          setTimeout(() => stage.classList.remove('arena-shake'), 320);
        }
      } else if (step.type === 'heal' || step.type === 'mana') {
        const targetEntity = this.currentBattle.allies.find(a => a.id === step.target);
        if (targetEntity && targetEntity._battlePos) {
          this.spawnBattleFloatingTextAtCoords(targetEntity._battlePos.x, targetEntity._battlePos.y, step.text, 'heal');
        }
      } else if (step.text) {
        const targetEntity = this.currentBattle.enemies[step.targetIndex] || this.currentBattle.allies[0];
        if (targetEntity && targetEntity._battlePos) {
          this.spawnBattleFloatingTextAtCoords(targetEntity._battlePos.x, targetEntity._battlePos.y, step.text, 'damage');
        }
      }

      await new Promise(r => setTimeout(r, speedDelay));
    });

    if (this.currentBattle.status === 'victory') {
      this.stopBattleLoop();
      this.stopBattleCountdown();
      window.Sound.playVictory();
      window.showGameMessage('🎉【对决得胜】敌军溃败！斩妖除魔大获全胜！', 'success', 3500);
      const layer = document.getElementById('battle-screen-layer');
      if (layer) layer.style.display = 'none';

      this.isPaused = false;
      this.currentBattle = null;

      if (this.battleVictoryCallback) {
        this.battleVictoryCallback();
        this.battleVictoryCallback = null;
      }
    } else if (this.currentBattle.status === 'defeat') {
      this.stopBattleLoop();
      this.stopBattleCountdown();
      window.Sound.playFailure();
      window.showGameMessage('⚠️【气血枯竭】负伤败退，天界神泉已重新抚平体魄……', 'error', 3500);
      const layer = document.getElementById('battle-screen-layer');
      if (layer) layer.style.display = 'none';
      this.isPaused = false;
      this.playerData.hp = this.playerData.maxHp;
      this.currentBattle = null;
    } else if (this.currentBattle.status === 'escaped') {
      this.stopBattleLoop();
      this.stopBattleCountdown();
      window.Sound.playBeep();
      window.showGameMessage('💨【险象环生】施展遁地妙术成功脱离了战斗！', 'info', 2500);
      const layer = document.getElementById('battle-screen-layer');
      if (layer) layer.style.display = 'none';
      this.isPaused = false;
      this.currentBattle = null;
    } else {
      this.selectedAllyId = 'player';
      this.startBattleCountdown();
      this.renderBattleInterface();

      // 若开启了自动出招，自动进入下一回合
      if (this.autoCombatEnabled) {
        setTimeout(() => {
          if (this.currentBattle && this.autoCombatEnabled && this.currentBattle.status !== 'executing') {
            this.executeCombatRound();
          }
        }, 600);
      }
    }
  }

  // 兼容调用接口
  execCombat(type, skillId = null) {
    return this.chooseCombatAction(type, skillId);
  }

  // =========================================================================
  // 三大门派自由皈依与绝技研习面板 (金刚/妖魔/神仙)
  // =========================================================================
  openClassSelectModal() {
    if (window.Dialogue) window.Dialogue.close();

    const classesData = window.GAME_DATA.CLASSES || {};
    const curClassId = this.playerData.classId || 'jingang';

    const modalHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:540px;width:92%;">
          <div class="modal-header">
            <span class="modal-title">☯️ 三界门派正统与绝技神通</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body" style="max-height:75vh;overflow-y:auto;padding-right:6px;">
            <div style="font-size:11px;color:#c59b27;margin-bottom:12px;line-height:1.6;background:rgba(0,0,0,0.35);padding:8px;border-radius:6px;border:1px solid #5c4732;">
              三界浩瀚，道法万千。少侠可自由研习与皈依金刚、妖魔、神仙三大无上正统，各门派皆传承三门通天彻地的专属绝学！
            </div>

            ${Object.values(classesData).map(c => `
              <div style="background:rgba(20,15,10,0.85);border:1.5px solid ${c.id === curClassId ? '#ffd700' : '#5c4732'};border-radius:8px;padding:12px;margin-bottom:12px;box-shadow:0 4px 15px rgba(0,0,0,0.6);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                  <div>
                    <span style="font-size:15px;font-weight:bold;color:${c.id === 'jingang' ? '#f39c12' : (c.id === 'yaomo' ? '#ff4757' : '#1e90ff')};">
                      ${c.name}门派
                    </span>
                    <span style="font-size:11px;color:#ffd700;margin-left:6px;">${c.title}</span>
                  </div>
                  <div>
                    ${c.id === curClassId ? `
                      <span style="background:#27ae60;color:#fff;font-size:10px;padding:3px 8px;border-radius:4px;font-weight:bold;">已皈依当前门派</span>
                    ` : `
                      <button class="dialogue-opt-btn" onclick="window.App2D.changeClass('${c.id}'); this.closest('.modal-overlay').remove();" style="padding:4px 10px;font-size:11px;">
                        皈依入此门派 ▶
                      </button>
                    `}
                  </div>
                </div>

                <div style="font-size:11px;color:#aaa;margin-bottom:8px;line-height:1.5;">${c.desc}</div>

                <!-- 技能列表 -->
                <div style="display:grid;grid-template-columns:1fr;gap:6px;">
                  ${c.skills.map(sk => `
                    <div style="background:rgba(0,0,0,0.5);border:1px solid #443322;border-radius:6px;padding:6px 10px;display:flex;gap:10px;align-items:flex-start;">
                      <span style="font-size:18px;line-height:1;">${sk.icon || '✨'}</span>
                      <div style="flex:1;">
                        <div style="display:flex;justify-content:space-between;">
                          <span style="color:#ffd700;font-weight:bold;font-size:12px;">${sk.name}</span>
                          <span style="font-size:10px;color:#7bed9f;">
                            消耗: ${sk.costMp ? `${sk.costMp}精力` : '无'}${sk.costHpRatio ? ` + 自损${Math.floor(sk.costHpRatio*100)}%当前HP` : ''}
                          </span>
                        </div>
                        <div style="font-size:10px;color:#eee;margin-top:2px;line-height:1.4;">${sk.desc}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    const v3 = document.getElementById('game-viewport') || document.body;
    v3.insertAdjacentHTML('beforeend', modalHtml);
  }

  // 执行转职
  changeClass(classId) {
    const res = this.playerData.switchClass(classId);
    if (res.success) {
      this.playerChar.title = this.playerData.title;
      this.updatePlayerHud();
      window.Sound.playLevelUp();
      window.showGameMessage(`🎉 成功皈依【${res.className}】门派！已领悟全新门派通天绝技！`, 'success', 3500);
    }
  }

  // 画面主渲染
  render() {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const mapData = window.GAME_DATA.MAPS_2D[this.currentMapId];
    if (!mapData) return;

    // 1. 地图瓦片
    this.tilemap.render(this.ctx, mapData, this.camera);

    // 2. 主线任务世界大光柱与跳动感叹号指引
    if (this.minimap) {
      this.minimap.renderWorldQuestBeacon(this.ctx, this.camera, this.currentMapId, this.storyPhase, mapData);
    }

    // 3. 次世代动态粒子
    if (this.particleSystem) {
      this.particleSystem.render(this.ctx, this.camera);
    }

    // 4. 鼠标点击金色仙气涟漪
    this.renderClickRipples();

    // 5. NPC
    this.npcs.forEach(npc => {
      const isNear = Math.hypot(npc.x - this.playerChar.x, npc.y - this.playerChar.y) < npc.interactRadius;
      npc.render(this.ctx, this.camera, isNear);
    });

    // 6. 怪物
    this.monsters.forEach(m => {
      m.render(this.ctx, this.camera, false);
    });

    // 7. 玩家
    this.playerChar.render(this.ctx, this.camera, false);

    // 8. ☯️ 八卦乾坤引路法阵 (双层旋转符文、地面太极流光投影与悬浮云纹牌匾)
    if (mapData.portals) {
      this.renderMagicPortals(mapData.portals);
    }

    // 9. 渲染左上角雷达小地图系统
    if (this.minimap) {
      this.minimap.render(this.ctx, mapData, this.playerChar, this.storyPhase);
    }

    // 10. 电影级水墨暗角景深与古典环境光 (聚拢中央视野，增强神话画卷沉浸感)
    const w = this.canvas.width;
    const h = this.canvas.height;
    const vigGrad = this.ctx.createRadialGradient(w / 2, h / 2, w * 0.38, w / 2, h / 2, w * 0.78);
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(1, 'rgba(8, 6, 4, 0.42)');
    this.ctx.fillStyle = vigGrad;
    this.ctx.fillRect(0, 0, w, h);
  }

  // 绘制鼠标点击仙气波纹
  renderClickRipples() {
    this.ctx.save();
    for (const rip of this.clickRipples) {
      const sx = rip.x - this.camera.x;
      const sy = rip.y - this.camera.y;
      this.ctx.strokeStyle = `rgba(255, 215, 0, ${rip.alpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, rip.radius, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.strokeStyle = `rgba(243, 156, 18, ${rip.alpha * 0.6})`;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, rip.radius * 0.6, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }
}

window.App2D = new GameApp2D();
window.addEventListener('DOMContentLoaded', () => {
  window.App2D.init();
});
