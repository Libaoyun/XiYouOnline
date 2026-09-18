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

    // 钟馗日常抓鬼任务
    this.ghostQuest = {
      active: false,
      completed: false,
      mapId: null,
      mapName: '',
      targetName: '',
      level: 15,
      hp: 1200,
      atk: 90,
      def: 40,
      spd: 32
    };

    // 大唐镖局运镖押送任务
    this.escortQuest = null;

    // 仙宠洗炼暂存对比
    this.tempWashResult = null;

    // 已交互/已点击 NPC 记录集合 (点击后永久消除头顶感叹号)
    this.interactedNpcSet = new Set();

    // 输入与循环状态
    this.keysDown = {};
    this.isPaused = false;
    this.currentBattle = null;

    // 战斗界面全新交互状态 (轻量化、中央竖直指令与选目标直决)
    this.activeSelectedAllyId = null; // 当前正在下达指令的友方
    this.isSelectingTarget = false; // 是否处于待选目标状态
    this.pendingAction = null; // 暂存动作
    this.combatSubMenu = null; // null | 'skills' | 'items'
    this.isAnimatingCombat = false; // 是否正在播放打斗位移动画

    // 全局防呆拦截：彻底禁用原生 alert 与 confirm，杜绝浏览器丑陋弹窗，统一国风主题
    window.alert = (msg) => {
      if (window.showGameMessage) {
        window.showGameMessage(String(msg), 'info', 3000);
      } else {
        console.log('ALERT INTERCEPTED:', msg);
      }
    };
    window.confirm = (msg) => {
      console.warn('原生 confirm 遭到拦截，请调用 App2D.showConfirmModal:', msg);
      return false;
    };
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
      // 杂物与法宝 (用于野怪招降、仙宠洗炼、装备精炼等)
      { instanceId: 'it_jll1', itemId: 'jin_liu_lu', count: 6 },
      { instanceId: 'it_tie1', itemId: 'meteor_iron', count: 10 },
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
      appearance: 'heaven_general',
      speed: 2.56 // 保留80%移动速度 (原3.2)
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
      if (urlParams.get('px') && this.playerChar) {
        this.playerChar.x = parseInt(urlParams.get('px'));
        this.playerChar.y = parseInt(urlParams.get('py'));
        if (this.camera) {
          this.camera.follow(this.playerChar.x, this.playerChar.y);
          this.camera.update(window.GAME_DATA.MAPS_2D[this.currentMapId]);
        }
      }
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
    } else if (testModal === 'inventory') {
      setTimeout(() => {
        this.openInventoryModal();
      }, 50);
    } else if (testModal === 'pets') {
      setTimeout(() => {
        this.openPetManageModal();
      }, 50);
    } else if (testModal === 'forge') {
      setTimeout(() => {
        this.openForgeModal('weapon');
      }, 50);
    } else if (testModal === 'wash') {
      setTimeout(() => {
        if (!this.pets || this.pets.length === 0) {
          const pet = window.PetSystem.createPet('heixiong_jing', false, 15);
          this.pets.push(pet);
        }
        this.tempWashResult = window.PetSystem.generateWashResult(this.pets[0]);
        this.openPetWashModal(this.pets[0].instanceId);
      }, 50);
    } else if (testModal === 'quest') {
      setTimeout(() => {
        this.acceptZhongkuiGhostQuest();
        this.openQuestTrackerModal();
      }, 50);
    } else if (testModal === 'book') {
      setTimeout(() => {
        if (!this.pets || this.pets.length === 0) {
          const pet = window.PetSystem.createPet('gudai_ruishou', false, 25);
          this.pets.push(pet);
        }
        if (!this.pets[0].passives || this.pets[0].passives.length === 0) {
          window.PetSystem.learnPetSkillBook(this.pets[0], 'book_high_sneak');
        }
        if (this.inventory) {
          this.inventory.addItem('book_high_critical', 1);
          this.inventory.addItem('book_high_vampire', 1);
          this.inventory.addItem('book_high_rebirth', 1);
          this.inventory.addItem('book_high_speed', 1);
        }
        this.openPetBookModal(this.pets[0].instanceId);
      }, 50);
    } else if (testModal === 'escort') {
      setTimeout(() => {
        this.playerData.silver += 5000;
        this.acceptEscortQuest();
        this.openQuestTrackerModal();
      }, 50);
    } else if (testModal === 'baihu') {
      setTimeout(() => {
        this.loadMap('baihuling', { x: 13 * 32, y: 10 * 32 });
      }, 50);
    } else if (testModal === 'pick_peach') {
      setTimeout(() => {
        this.loadMap('tiangong_pantao', { x: 6 * 32, y: 7 * 32 });
        const mapData = window.GAME_DATA.MAPS_2D['tiangong_pantao'];
        if (mapData && mapData.peachTrees && mapData.peachTrees[0]) {
          this.confirmPickPeach(mapData.peachTrees[0]);
        }
      }, 80);
    } else if (testModal === 'dragon_shop') {
      setTimeout(() => {
        this.openDragonShopModal();
      }, 50);
    } else if (testCombat === 'donghai') {
      setTimeout(() => {
        this.triggerDonghaiTrialBattle();
      }, 50);
    } else if (testCombat === 'wild') {
      setTimeout(() => {
        if (!this.playerChar) {
          this.playerChar = { appearance: 'heaven_general' };
        }
        if (!this.activeCombatPets || this.activeCombatPets.length === 0) {
          const pet = window.PetSystem.createPet('gudai_ruishou', false, 35);
          if (pet) {
            pet.name = '齐天神灵兽';
            this.pets.push(pet);
            this.activeCombatPets = [pet];
          }
        }
        const mob1 = { id: 'mob_sanxian_2', name: '通臂灵猿', level: 25, spd: 45, hp: 1500, maxHp: 1500, quality: 'sanxian', isBoss: false };
        const mob2 = { id: 'mob_wild_1', name: '巡山野猪怪', level: 20, spd: 38, hp: 900, maxHp: 900, quality: 'ordinary', isBoss: false };
        this.start2DBattle([mob1, mob2], () => {});
      }, 50);
    } else if (testCombat === 'features') {
      setTimeout(() => {
        if (!this.playerChar) {
          this.playerChar = { appearance: 'heaven_general' };
        }
        if (!this.activeCombatPets || this.activeCombatPets.length === 0) {
          const pet = window.PetSystem.createPet('gudai_ruishou', false, 35);
          if (pet) {
            pet.name = '九尾仙狐';
            this.pets.push(pet);
            this.activeCombatPets = [pet];
          }
        }
        const mob1 = { id: 'mob_clam_1', name: '灵河巨蚌', level: 22, spd: 35, hp: 1200, maxHp: 1200, quality: 'ordinary', isBoss: false };
        const mob2 = { id: 'mob_shrimp_1', name: '巡海虾兵', level: 25, spd: 55, hp: 1400, maxHp: 1400, quality: 'ordinary', isBoss: false };
        const mob3 = { id: 'mob_snake_1', name: '盘石玄蛇', level: 24, spd: 60, hp: 1100, maxHp: 1100, quality: 'sanxian', isBoss: false };
        this.start2DBattle([mob1, mob2, mob3], () => {});
      }, 50);
    } else if (testCombat === 'ready') {
      setTimeout(() => {
        if (!this.playerChar) this.playerChar = { appearance: 'heaven_general' };
        if (!this.activeCombatPets || this.activeCombatPets.length === 0) {
          const pet = window.PetSystem.createPet('gudai_ruishou', false, 35);
          if (pet) {
            pet.name = '九尾仙狐';
            this.pets.push(pet);
            this.activeCombatPets = [pet];
          }
        }
        const mob1 = { id: 'mob_clam_1', name: '灵河巨蚌', level: 22, spd: 35, hp: 1200, maxHp: 1200, quality: 'ordinary', isBoss: false };
        const mob2 = { id: 'mob_shrimp_1', name: '巡海虾兵', level: 25, spd: 55, hp: 1400, maxHp: 1400, quality: 'ordinary', isBoss: false };
        this.start2DBattle([mob1, mob2], () => {});
        setTimeout(() => {
          if (this.currentBattle && this.currentBattle.allies && this.currentBattle.allies[0]) {
            this.confirmCurrentAllyAction(this.currentBattle.allies[0].id, { type: 'attack', target: 0 });
          }
        }, 200);
      }, 50);
    } else if (testCombat === 'v_menu') {
      setTimeout(() => {
        if (!this.playerChar) this.playerChar = { appearance: 'heaven_general' };
        this.pets = [
          { instanceId: 'p1', name: '齐天灵猴', type: 'sun_wukong', level: 35, hp: 2200, maxHp: 2200, mp: 600, maxMp: 600, spd: 58, passives: [] },
          { instanceId: 'p2', name: '九尾仙狐', type: 'fox_spirit', level: 32, hp: 1800, maxHp: 1800, mp: 850, maxMp: 850, spd: 65, passives: [] },
          { instanceId: 'p3', name: '巡海夜叉', type: 'sha_wujing', level: 30, hp: 2500, maxHp: 2500, mp: 400, maxMp: 400, spd: 42, passives: [] }
        ];
        this.activeCombatPets = [...this.pets];
        const mob1 = { id: 'mob_rat_1', name: '五行硕鼠', level: 20, spd: 35, hp: 1100, maxHp: 1100, quality: 'ordinary', isBoss: false };
        const mob2 = { id: 'mob_snake_1', name: '青花小蛇', level: 22, spd: 48, hp: 980, maxHp: 980, quality: 'ordinary', isBoss: false };
        const mob3 = { id: 'mob_fox_1', name: '赤尾野狐', level: 25, spd: 55, hp: 1400, maxHp: 1400, quality: 'sanxian', isBoss: false };
        this.start2DBattle([mob1, mob2, mob3], () => {});
        setTimeout(() => {
          this.activeSelectedAllyId = 'player';
          this.isSelectingTarget = false;
          this.pendingAction = null;
          this.combatSubMenu = null;
          this.renderBattleInterface();
        }, 150);
      }, 50);
    } else if (testCombat === 'v_target') {
      setTimeout(() => {
        if (!this.playerChar) this.playerChar = { appearance: 'heaven_general' };
        this.pets = [
          { instanceId: 'p1', name: '齐天灵猴', type: 'sun_wukong', level: 35, hp: 2200, maxHp: 2200, mp: 600, maxMp: 600, spd: 58, passives: [] },
          { instanceId: 'p2', name: '九尾仙狐', type: 'fox_spirit', level: 32, hp: 1800, maxHp: 1800, mp: 850, maxMp: 850, spd: 65, passives: [] }
        ];
        this.activeCombatPets = [...this.pets];
        const mob1 = { id: 'mob_rat_1', name: '五行硕鼠', level: 20, spd: 35, hp: 1100, maxHp: 1100, quality: 'ordinary', isBoss: false };
        const mob2 = { id: 'mob_snake_1', name: '青花小蛇', level: 22, spd: 48, hp: 980, maxHp: 980, quality: 'ordinary', isBoss: false };
        this.start2DBattle([mob1, mob2], () => {});
        setTimeout(() => {
          this.activeSelectedAllyId = 'player';
          this.chooseCombatAction('attack');
        }, 150);
      }, 50);
    } else if (testCombat === 'v_modal') {
      setTimeout(() => {
        if (!this.playerChar) this.playerChar = { appearance: 'heaven_general' };
        const mob1 = { id: 'mob_fox_1', name: '赤尾野狐', level: 25, spd: 55, hp: 1400, maxHp: 1400, quality: 'sanxian', isBoss: false };
        this.start2DBattle([mob1], () => {});
        setTimeout(() => {
          this.showConfirmModal({
            title: '招降仙宠',
            content: '确定要尝试招降野生仙兽【赤尾野狐】吗？<br><span style="color:#f59e0b;font-size:12px;">（需要消耗 1 回合行动，品质越高成功率受资质影响）</span>',
            confirmText: '确定招降',
            cancelText: '放弃',
            onConfirm: () => {}
          });
        }, 200);
      }, 50);
    } else if (testCombat === 'bailong') {
      setTimeout(() => {
        this.triggerYingchouBattle();
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
        companions: this.companions,
        ghostQuest: this.ghostQuest,
        escortQuest: this.escortQuest,
        interactedNpcIds: Array.from(this.interactedNpcSet || [])
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
      if (state.interactedNpcIds && Array.isArray(state.interactedNpcIds)) {
        this.interactedNpcSet = new Set(state.interactedNpcIds);
      }
      if (state.playerData) {
        Object.assign(this.playerData, state.playerData);
      }
      if (state.ghostQuest) {
        this.ghostQuest = state.ghostQuest;
      }
      if (state.escortQuest) {
        this.escortQuest = state.escortQuest;
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
      el.innerHTML = isSaved ? '💾 进度已保存' : '⏳ 正在保存...';
      el.style.color = isSaved ? '#2ed573' : '#ffd700';
    }
  }

  // 游戏内置国风水墨二次确认模态框
  showConfirmModal({ title = '仙界谕令', content = '', confirmText = '确认', cancelText = '取消', onConfirm = null, onCancel = null } = {}) {
    const old = document.getElementById('global-confirm-modal');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'global-confirm-modal';
    overlay.className = 'game-confirm-overlay';
    overlay.innerHTML = `
      <div class="game-confirm-box" onclick="event.stopPropagation()">
        <div class="game-confirm-header">
          <span>🏮 ${title}</span>
          <span id="confirm-modal-close" style="cursor:pointer;font-size:14px;color:#aaa;">✕</span>
        </div>
        <div class="game-confirm-body">
          ${content.replace(/\n/g, '<br/>')}
        </div>
        <div class="game-confirm-actions">
          <button class="game-confirm-btn cancel" id="confirm-modal-cancel">${cancelText}</button>
          <button class="game-confirm-btn confirm" id="confirm-modal-ok">${confirmText}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const closeSelf = () => {
      overlay.remove();
    };

    overlay.querySelector('#confirm-modal-close').onclick = () => {
      closeSelf();
      if (onCancel) onCancel();
    };
    overlay.querySelector('#confirm-modal-cancel').onclick = () => {
      closeSelf();
      if (onCancel) onCancel();
    };
    overlay.querySelector('#confirm-modal-ok').onclick = () => {
      closeSelf();
      if (onConfirm) onConfirm();
    };
  }

  // 重新启程（清空存档回到序章）
  restartGame() {
    this.showConfirmModal({
      title: '西行轮回归原',
      content: '少侠，确定要清空当前的西行历练存档，重新启程回到开篇吗？此举将重置所有历练进度！',
      confirmText: '重新启程',
      cancelText: '继续修行',
      onConfirm: () => {
        if (window.SaveManager) {
          window.SaveManager.clearProgress();
        }
        window.location.href = window.location.pathname;
      }
    });
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

    // 动态计算 NPC 是否应显示金色感叹号 (已交互/点击过的 NPC 永久清除感叹号，仅当前主线接引 NPC 显示)
    const shouldShowQuestExclamation = (n) => {
      if (this.interactedNpcSet && this.interactedNpcSet.has(n.id)) return false;
      if (this.storyPhase === 'heaven_prologue') {
        return n.id === 'npc_taibai' || n.id === 'npc_litianwang' || n.id === 'npc_wukong_heaven';
      }
      if (this.storyPhase === 'liujiacun_start') {
        return n.id === 'npc_liuboqin';
      }
      if (this.storyPhase === 'liujiacun_hunted') {
        return n.id === 'npc_liuboqin' || n.id === 'npc_liujia_tudi';
      }
      if (this.storyPhase === 'changan_met_monk') {
        return n.id === 'npc_xuanzang' || n.id === 'npc_guanyin';
      }
      if (this.storyPhase === 'wuxingshan_ready') {
        return n.id === 'npc_wukong_sealed' || n.id === 'npc_mountain_god';
      }
      if (mapId === 'tiangong_pantao') {
        return n.id === 'npc_pantao_tudi';
      }
      return false;
    };

    // 实例化 NPC (拒绝 Emoji，外观配置清晰，已点击/非任务 NPC 头顶绝不乱悬浮感叹号)
    this.npcs = mapData.npcs.map(n => new window.Character({
      id: n.id,
      name: n.name,
      title: n.title,
      type: 'npc',
      x: n.x,
      y: n.y,
      appearance: n.appearance,
      dialogueKey: n.dialogueKey,
      questStatus: shouldShowQuestExclamation(n) ? 'available' : null
    }));

    // 实例化怪物 (完整继承地图怪物全部属性、战斗技能与80%移速)
    this.monsters = (mapData.monsters || []).map(m => {
      const mobChar = new window.Character({
        id: m.id,
        name: m.name,
        type: 'monster',
        monsterType: m.monsterType || null,
        x: m.x,
        y: m.y,
        speed: Number(((m.speed || 1.1) * 0.8).toFixed(2)), // 80% 巡逻移速
        patrolRadius: m.patrolRadius || 35
      });
      mobChar.monsterData = {
        id: m.id,
        name: m.name,
        monsterType: m.monsterType || mobChar.monsterType,
        level: m.level || 5,
        hp: m.hp || 200,
        maxHp: m.maxHp || m.hp || 200,
        mp: m.mp || 100,
        maxMp: m.maxMp || m.mp || 100,
        atk: m.atk || 35,
        def: m.def !== undefined ? m.def : 18,
        spd: m.spd || 22,
        critRate: m.critRate !== undefined ? m.critRate : 0.08,
        comboRate: m.comboRate !== undefined ? m.comboRate : 0.05,
        fatalRate: m.fatalRate !== undefined ? m.fatalRate : 0.02,
        dodgeRate: m.dodgeRate !== undefined ? m.dodgeRate : 0.05,
        skills: m.skills || ['连击'],
        icon: m.icon || '👾'
      };
      return mobChar;
    });

    // 动态注入钟馗日常抓鬼任务恶鬼怪物
    if (this.ghostQuest && this.ghostQuest.active && !this.ghostQuest.completed && this.ghostQuest.mapId === mapId) {
      const gMob = new window.Character({
        id: 'ghost_quest_mob',
        name: `【恶鬼】${this.ghostQuest.targetName}`,
        type: 'monster',
        monsterType: 'skeleton',
        x: 12 * 32,
        y: 10 * 32,
        speed: 0.72, // 0.9 * 0.8
        appearance: 'yaomo_shadow'
      });
      gMob.isGhostTarget = true;
      gMob.monsterData = {
        id: 'ghost_quest_mob',
        name: this.ghostQuest.targetName,
        monsterType: 'skeleton',
        level: this.ghostQuest.level,
        hp: this.ghostQuest.hp,
        maxHp: this.ghostQuest.hp,
        mp: 150,
        maxMp: 150,
        atk: this.ghostQuest.atk,
        def: this.ghostQuest.def || 20,
        spd: 24,
        critRate: 0.12,
        comboRate: 0.08,
        fatalRate: 0.04,
        dodgeRate: 0.06,
        skills: ['雷霆万钧'],
        quality: 'sanxian',
        isBoss: true
      };
      this.monsters.push(gMob);
    }

    window.Sound.playBeep();
    this.updateLocationHeader(mapData.name, mapData.region);
    this.updatePlayerHud();

    // 每次过图或进入新场景，自动持久化历练进度
    this.saveAutoProgress();
  }

  updateLocationHeader(name, region) {
    const el = document.getElementById('scene-location-text');
    if (el) el.innerText = `🏯 ${name} (${region})`;
    const hudLoc = document.getElementById('hud-location-text');
    if (hudLoc) hudLoc.innerText = `📍 ${name}`;
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
      if (e.key === ' ' || e.key === 'Enter') {
        this.interactNearby();
      } else if (e.key === 'r' || e.key === 'R') {
        this.toggleMountRiding();
      } else if (e.key === 'k' || e.key === 'K') {
        this.openClassSelectModal();
      } else if (e.key === 'b' || e.key === 'B') {
        this.openInventoryModal();
      } else if (e.key === 'p' || e.key === 'P') {
        this.openPetManageModal();
      } else if (e.key === 'q' || e.key === 'Q') {
        this.openQuestTrackerModal();
      } else if (e.key === 'Escape') {
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

    // 1.5 是否点击在蟠桃园仙树附近 (半径 42px，点击靠近自动弹出确认采摘)
    if (this.currentMapId === 'tiangong_pantao' && mapData.peachTrees) {
      for (const tree of mapData.peachTrees) {
        const dist = Math.hypot(tree.x - worldPos.x, tree.y - worldPos.y);
        if (dist < 44) {
          const playerDist = Math.hypot(tree.x - this.playerChar.x, (tree.y + 10) - this.playerChar.y);
          if (playerDist < 58) {
            this.confirmPickPeach(tree);
            return;
          }
          // 规划寻路走到树身旁下方并自动触发确认采摘
          const targetWalkY = Math.min(mapData.height * 32 - 40, tree.y + 36);
          const path = this.pathfinding.findPath(
            mapData, this.tilemap,
            this.playerChar.x, this.playerChar.y,
            tree.x, targetWalkY
          );
          if (path.length > 0) {
            this.autoMovePath = path;
            this.autoMoveTargetCallback = () => this.confirmPickPeach(tree);
            this.spawnClickRipple(tree.x, tree.y);
            window.Sound.playBeep();
          }
          return;
        }
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
            this.autoMoveTargetCallback = () => this.tryEnterPortal(p);
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

  // 统一传送门进入与等级门禁校验
  tryEnterPortal(p) {
    if (!p) return;
    // 关隘与练功区等级限制校验
    if (p.minLevel && this.player && this.player.level < p.minLevel) {
      // 玩家向后轻微反弹 28px 防止贴门循环触发
      const bounceAngle = Math.atan2(this.playerChar.y - p.y, this.playerChar.x - p.x);
      this.playerChar.x = p.x + Math.cos(bounceAngle) * 28;
      this.playerChar.y = p.y + Math.sin(bounceAngle) * 28;
      this.autoMovePath = []; // 中断自动寻路
      this.autoMoveTargetCallback = null;

      const targetMapData = window.GAME_DATA.MAPS_2D[p.targetMap];
      const targetName = targetMapData?.name || p.name;
      window.showGameMessage(
        `⛔【修仙警令】前方【${targetName}】妖气极盛（野怪凶险，需修行达到 Lv.${p.minLevel}），少侠当前仅 Lv.${this.player.level}，恐有性命之忧，请先行历练！`,
        'warning',
        4500
      );
      if (window.Sound && window.Sound.playMiss) window.Sound.playMiss();
      return;
    }

    this.loadMap(p.targetMap, { x: p.targetX, y: p.targetY });
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

    // 1. 坐骑移速与骑乘状态 (保留80%移动速度，避免过快)
    const baseSpeed = this.playerChar.appearance === 'heaven_general' ? 2.4 : 2.0;
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
          this.tryEnterPortal(p);
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

  // 附近 NPC 与场景交互
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

    // 蟠桃仙木靠近快捷采摘交互 (按空格或回车)
    const mapData = window.GAME_DATA.MAPS_2D[this.currentMapId];
    if (this.currentMapId === 'tiangong_pantao' && mapData && mapData.peachTrees) {
      for (const tree of mapData.peachTrees) {
        const dist = Math.hypot(tree.x - this.playerChar.x, (tree.y + 10) - this.playerChar.y);
        if (dist < 58) {
          this.confirmPickPeach(tree);
          return;
        }
      }
    }
  }

  triggerNpcDialogue(npc) {
    window.Sound.playBeep();

    // 用户点击/交互过后，立即消除该 NPC 头顶的金色感叹号，并记录为已交互
    npc.questStatus = null;
    if (!this.interactedNpcSet) {
      this.interactedNpcSet = new Set();
    }
    this.interactedNpcSet.add(npc.id);

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

  // 神行直达天宫·蟠桃胜境实景采摘
  teleportToPeachGarden() {
    if (window.Dialogue) window.Dialogue.close();
    document.querySelectorAll('.modal-overlay').forEach(m => m.remove());

    if (this.currentMapId === 'tiangong_pantao') {
      window.showGameMessage('🍑 已身在蟠桃胜境！请移步走向园中大仙树，靠近即可确认采摘！', 'info');
      return;
    }

    window.Sound.playSuccess();
    this.loadMap('tiangong_pantao', { x: 13 * 32, y: 12 * 32 });
    window.showGameMessage('✨ 仙气腾腾！你已借遁法神行飞升进入天界【蟠桃胜境】！园中大仙树上挂有熟透仙桃，靠近确认即可采摘吞服！', 'success', 4500);
  }

  // 兼容旧入口：改为神行前往蟠桃园实景大仙树前采摘
  openPeachModal() {
    this.teleportToPeachGarden();
  }

  // 靠近实体大仙树弹出确认采摘交互
  confirmPickPeach(tree) {
    if (window.Dialogue) window.Dialogue.close();
    document.querySelectorAll('.modal-overlay').forEach(m => m.remove());

    const remaining = this.peachGarden.getRemainingChances();
    if (remaining <= 0) {
      window.showGameMessage('今日天庭蟠桃采摘仙露机缘已用尽（3/3次），明日卯时仙露重新滋养后再来采摘吧！', 'warning', 3500);
      return;
    }

    if (tree.isHarvested) {
      window.showGameMessage(`【${tree.name}】树上的仙桃方才已被采摘吞服，仙芽正萌润中！请移步采摘园中其他大仙树！`, 'info', 3500);
      return;
    }

    const tierInfo = window.PeachGarden.TIERS[tree.tier] || window.PeachGarden.TIERS['tier_3000'];

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-window" onclick="event.stopPropagation()" style="max-width:350px;border:2px solid #ff7675;background:linear-gradient(135deg, #2b1118 0%, #15090e 100%);">
        <div class="modal-header" style="border-bottom:1px solid #ff7675;">
          <span class="modal-title" style="color:#ff9ff3;">🍑 确认采摘先天蟠桃</span>
          <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
        </div>
        <div class="modal-body" style="text-align:center;padding:16px;">
          <div style="font-size:42px;margin-bottom:6px;animation:pulse 1.5s infinite;filter:drop-shadow(0 0 12px #ff6b81);">🍑</div>
          <div style="font-size:15px;font-weight:bold;color:#ffd700;margin-bottom:4px;">${tree.name}</div>
          <div style="font-size:11px;color:#ff9ff3;font-weight:bold;margin-bottom:8px;">${tierInfo.name}</div>
          <div style="background:rgba(0,0,0,0.45);border:1px solid #5a2636;border-radius:6px;padding:10px;margin-bottom:12px;text-align:left;font-size:11px;color:#f5cd79;line-height:1.6;">
            <div>📖 仙珍玄妙：<span style="color:#eee;">${tierInfo.desc}</span></div>
            <div>🌟 吞服收益：<span style="color:#2ecc71;font-weight:bold;">海量修为经验 +${tierInfo.baseExp} 点！</span></div>
            <div>🎁 伴生造化：<span style="color:#74b9ff;">天材地宝仙缘</span></div>
          </div>
          <div style="font-size:11px;color:#ffbe76;margin-bottom:14px;">
            今日剩余采摘吞服机缘：<span style="color:#ffd700;font-weight:bold;font-size:14px;">${remaining}</span> / 3 次
          </div>
          <div style="display:flex;gap:10px;justify-content:center;">
            <button class="dialogue-opt-btn" id="btn-do-pick-peach" style="background:linear-gradient(180deg,#e84393,#c0392b);border:1px solid #ff9ff3;padding:8px 18px;font-weight:bold;color:#fff;">
              ✨ 确认采摘并吞服
            </button>
            <button class="dialogue-opt-btn" onclick="this.closest('.modal-overlay').remove()" style="background:#34495e;padding:8px 14px;color:#ddd;">
              暂且留赏
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#btn-do-pick-peach').onclick = () => {
      modal.remove();
      this.executeEatPeach(tree);
    };
  }

  // 执行吃桃，大额增加经验与播放仙家光效
  executeEatPeach(tree) {
    const res = this.peachGarden.eatPeach(tree.tier, this.playerData, this.inventory);
    if (res.success) {
      tree.isHarvested = true;
      window.Sound.playLevelUp();
      this.updatePlayerHud();

      // 仙家祥云灵光飘落特效
      if (this.particleSystem) {
        for (let i = 0; i < 20; i++) {
          this.particleSystem.spawnCombatSpark(this.playerChar.x + (Math.random() - 0.5) * 60, this.playerChar.y + (Math.random() - 0.5) * 60);
        }
      }

      window.showGameMessage(res.msg, 'success', 5000);
      setTimeout(() => {
        window.showGameMessage('🌿 仙桃已入腹大增道行！采摘完毕可与蟠桃园土地公对话，遁法返回刘家村或居住地！', 'info', 4000);
      }, 2500);
    } else {
      window.showGameMessage(res.msg, 'warning');
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

                    <!-- 绝技与门派技能 -->
                    <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;margin-bottom:4px;">
                      <div style="color:#bbb;">
                        ${hasSkill ? `绝技: <span style="color:#ffd700;font-weight:bold;">${pet.skills[0].name}</span> (${pet.skills[0].desc.slice(0, 18)}...)` : `
                          <span style="color:#887766;">${pet.quality==='ordinary' ? '普通仙宠无法领悟绝技，仅能物理攻击' : (pet.quality==='sanxian' ? '散仙需修行至 Lv.10 开启灵窍' : '未领悟绝技')}</span>
                        `}
                      </div>
                      <div style="display:flex;gap:4px;">
                        <button class="dialogue-opt-btn" style="padding:2px 6px;font-size:9px;background:#c59b27;color:#000;font-weight:bold;" onclick="window.App2D.openPetWashModal('${pet.instanceId}')">
                          🧴 洗炼
                        </button>
                        <button class="dialogue-opt-btn" style="padding:2px 6px;font-size:9px;background:#27ae60;font-weight:bold;" onclick="window.App2D.openPetBookModal('${pet.instanceId}')">
                          📚 研习兽诀
                        </button>
                        ${(!hasSkill && canLearn) ? `
                          <button class="dialogue-opt-btn" style="padding:2px 6px;font-size:9px;background:#8e44ad;" onclick="window.App2D.learnSkillForPet('${pet.instanceId}')">
                            ⚡ 领悟
                          </button>
                        ` : ''}
                      </div>
                    </div>

                    <!-- 魔兽要诀被动特技槽位 (最多4槽) -->
                    <div style="display:flex;align-items:center;gap:4px;background:rgba(0,0,0,0.4);padding:3px 6px;border-radius:4px;font-size:9px;">
                      <span style="color:#ffd700;font-weight:bold;">被动神技:</span>
                      ${[0, 1, 2, 3].map(slotIdx => {
                        const pass = (pet.passives && pet.passives[slotIdx]);
                        if (pass) {
                          return `<span style="background:#2c3e50;border:1px solid #f39c12;border-radius:3px;padding:1px 4px;color:#f1c40f;" title="${pass.desc}">${pass.icon || '📖'} ${pass.name}</span>`;
                        } else {
                          return `<span style="border:1px dashed #555;border-radius:3px;padding:1px 4px;color:#666;">[空槽位]</span>`;
                        }
                      }).join('')}
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

      const isLocked = !!(p.minLevel && this.player && this.player.level < p.minLevel);

      // 1. 地面透视椭圆阴阳太极光晕
      this.ctx.save();
      this.ctx.translate(sx, sy + 6);
      this.ctx.scale(1.0, 0.45);

      const grad = this.ctx.createRadialGradient(0, 0, 4, 0, 0, 24);
      if (isLocked) {
        grad.addColorStop(0, 'rgba(255, 99, 71, 0.85)');
        grad.addColorStop(0.5, 'rgba(231, 76, 60, 0.55)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        grad.addColorStop(0, 'rgba(255, 215, 0, 0.85)');
        grad.addColorStop(0.5, 'rgba(52, 152, 219, 0.55)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 24, 0, Math.PI * 2);
      this.ctx.fill();

      // 旋转符文光圈
      this.ctx.rotate(time * 1.5);
      this.ctx.strokeStyle = isLocked ? 'rgba(255, 99, 71, 0.75)' : 'rgba(255, 215, 0, 0.75)';
      this.ctx.lineWidth = 1.8;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
      this.ctx.stroke();

      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        const rx = Math.cos(ang) * 18;
        const ry = Math.sin(ang) * 18;
        this.ctx.fillStyle = isLocked ? '#ff6b6b' : '#ffd700';
        this.ctx.beginPath();
        this.ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();

      // 2. 垂直上升的仙气灵珠
      for (let i = 0; i < 3; i++) {
        const offset = ((time * 30 + i * 20) % 40);
        const pAlpha = 1 - offset / 40;
        this.ctx.fillStyle = isLocked ? `rgba(255, 120, 100, ${pAlpha})` : `rgba(255, 230, 100, ${pAlpha})`;
        this.ctx.beginPath();
        this.ctx.arc(sx + Math.sin(time * 3 + i) * 8, sy - offset, 2.2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // 3. 悬浮在法阵上方 28px 的国风云纹木牌匾
      const labelText = isLocked ? `🔒 ${p.name} [需Lv.${p.minLevel}]` : p.name;
      this.ctx.font = 'bold 10px "Microsoft YaHei", sans-serif';
      const textMetrics = this.ctx.measureText(labelText);
      const boxW = textMetrics.width + 16;
      const boxH = 18;
      const boxX = sx - boxW / 2;
      const boxY = sy - 28 + Math.sin(time * 2) * 2;

      // 牌匾底框
      this.ctx.fillStyle = isLocked ? 'rgba(42, 12, 12, 0.92)' : 'rgba(25, 16, 10, 0.9)';
      this.ctx.strokeStyle = isLocked ? '#ff6b6b' : '#ffd700';
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();
      this.ctx.roundRect(boxX, boxY, boxW, boxH, 4);
      this.ctx.fill();
      this.ctx.stroke();

      // 发光金字或警示字
      this.ctx.fillStyle = isLocked ? '#ff9999' : '#ffd700';
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
    this.playerChar.speed = 2.08; // 80% 速度 (原2.6)

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

  // 4. 触发猛兽与恶鬼战斗
  triggerMonsterBattle(monsterChar) {
    const mob = monsterChar.monsterData || {
      id: 'mob_wolf_1',
      name: monsterChar.name,
      isMutated: false,
      isBoss: false,
      level: 3,
      hp: 150,
      maxHp: 150,
      mp: 50,
      maxMp: 50,
      atk: 32,
      def: 16,
      matk: 10,
      mdef: 10,
      spd: 20,
      skills: ['连击']
    };

    this.start2DBattle([mob], () => {
      this.monsters = this.monsters.filter(m => m.id !== monsterChar.id);
      if (monsterChar.isGhostTarget) {
        this.ghostQuest.completed = true;
        window.Sound.playCrit();
        window.showGameMessage(`🎉【伏魔告捷】成功诛灭作祟恶鬼【${this.ghostQuest.targetName}】！速回长安城向钟馗天师复命领赏！`, 'success', 5000);
      }
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
      this.storyPhase = 'baihu_cleared';
      this.playerData.gainExp(45000);
      this.playerData.silver += 8000;
      if (this.inventory) {
        this.inventory.addItem('eq_ring_baigu', 1);
        this.inventory.addItem('jin_liu_lu', 2);
      }
      this.updatePlayerHud();
      window.Sound.playLevelUp();
      window.showGameMessage('🎉【火眼金睛破尸魔】三打白骨夫人大获全胜！获赠【千年白骨幽魂戒】与【金柳露】*2！', 'success', 5000);
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
      this.storyPhase = 'baoxiang_cleared';
      this.playerData.gainExp(55000);
      this.playerData.silver += 12000;
      if (this.inventory) {
        this.inventory.addItem('eq_wp_lengyue', 1);
        this.inventory.addItem('book_high_critical', 1);
      }
      this.updatePlayerHud();
      window.Sound.playLevelUp();
      window.showGameMessage('🎉【大破波月洞】降伏奎木狼还朝！救出百花羞公主，获赠神兵【冷月追魂宝刀】与【高级必杀兽诀】！', 'success', 5000);
    });
  }

  // =========================================================================
  // ⚔️ 左右阵营回合制战斗系统 (轻量化去卡片、中央竖直指令、选目标即直决、对称双向打斗)
  // =========================================================================
  start2DBattle(enemies, onVictoryCallback) {
    if (window.Dialogue) {
      window.Dialogue.close();
    }

    const battleEl = document.getElementById('battle-screen-layer');
    if (!battleEl) return;

    battleEl.style.display = 'flex';
    this.isPaused = true;

    // 确保出战仙宠至少有数据
    const combatPets = (this.activeCombatPets && this.activeCombatPets.length > 0)
      ? this.activeCombatPets
      : (this.pets && this.pets.length > 0 ? [this.pets[0]] : []);

    this.currentBattle = new window.BattleEngine(
      this.playerData,
      combatPets,
      enemies
    );

    this.selectedTargetIndex = 0;
    this.isSelectingTarget = false;
    this.pendingAction = null;
    this.combatSubMenu = null;
    this.battleVictoryCallback = onVictoryCallback;
    this.isAnimatingCombat = false;

    // 默认当前操作友方为首个存活友方
    const firstAlive = this.currentBattle.getPendingAllyInputs()[0];
    this.activeSelectedAllyId = firstAlive ? firstAlive.id : 'player';

    this.renderBattleInterface();
  }

  // 点击友方轻量单位：切换正在操作的友方 (若已下令则允许重选)
  clickAllyUnit(allyId) {
    if (this.isAnimatingCombat || !this.currentBattle) return;

    const ally = this.currentBattle.allies.find(a => a.id === allyId);
    if (!ally || ally.hp <= 0) return;

    window.Sound.playBeep();
    // 取消可能正在进行的选敌状态
    this.isSelectingTarget = false;
    this.pendingAction = null;
    this.combatSubMenu = null;

    // 允许重新选择该友方指令 (从 actions 中撤销以便重选)
    if (this.currentBattle.actions[allyId]) {
      delete this.currentBattle.actions[allyId];
      window.showGameMessage(`🔄 重新为【${ally.name}】选择行动指令`, 'info', 1200);
    }

    this.activeSelectedAllyId = allyId;
    this.renderBattleInterface();
  }

  // 点击敌方轻量单位：如果正处于选目标状态，则直接下达确认；否则切换锁定焦点
  handleEnemyUnitClick(idx) {
    if (this.isAnimatingCombat || !this.currentBattle) return;

    const enemy = this.currentBattle.enemies[idx];
    if (!enemy || enemy.hp <= 0) return;

    if (this.isSelectingTarget && this.pendingAction && this.activeSelectedAllyId) {
      // 核心流转：用户点击敌方目标，立即默认确定该友方指令！
      window.Sound.playHit();
      const finalAction = Object.assign({}, this.pendingAction, {
        targetIndex: idx
      });
      this.finalizeAllyAction(this.activeSelectedAllyId, finalAction);
    } else {
      this.selectedTargetIndex = idx;
      window.Sound.playBeep();
      this.renderBattleInterface();
    }
  }

  // 选择操作类型 (普通攻击/绝技/防御/药品/逃跑/替换/招降)
  chooseCombatAction(type, param = null) {
    if (this.isAnimatingCombat || !this.currentBattle || !this.activeSelectedAllyId) return;

    const allyId = this.activeSelectedAllyId;
    const ally = this.currentBattle.allies.find(a => a.id === allyId);
    if (!ally || ally.hp <= 0) return;

    window.Sound.playHit();

    // 1. 普通攻击 -> 进入选择敌方目标状态 (点击目标直接下达)
    if (type === 'attack') {
      this.pendingAction = { type: 'attack' };
      this.isSelectingTarget = true;
      this.combatSubMenu = null;
      this.renderBattleInterface();
      return;
    }

    // 2. 施展绝技
    if (type === 'skill') {
      if (!param) {
        // 打开二级绝技竖直菜单
        this.combatSubMenu = 'skills';
        this.renderBattleInterface();
        return;
      }
      const skId = param;
      const skills = ally.isPlayer ? this.playerData.getSkills() : (ally.skills || []);
      const sk = skills.find(s => s.id === skId);

      // 群体攻击或自身护盾增益法术无需选敌，点击直接默认确认！
      const isAoEOrSelf = sk && (
        sk.targetType === 'all_enemy' ||
        sk.targetType === 'self' ||
        sk.targetType === 'all_ally' ||
        sk.id === 'sk_jg_huti' ||
        sk.name === '金刚护体' ||
        sk.name === '飞沙走石' ||
        sk.name === '三昧真火' ||
        sk.name === '隐身咒'
      );

      if (isAoEOrSelf) {
        this.finalizeAllyAction(allyId, { type: 'skill', skillId: skId, targetIndex: 0 });
      } else {
        // 单体法术/单体伤害/单体封印 -> 进入选择敌方目标状态
        this.pendingAction = { type: 'skill', skillId: skId };
        this.isSelectingTarget = true;
        this.combatSubMenu = null;
        this.renderBattleInterface();
      }
      return;
    }

    // 3. 凝神防御 -> 无需选目标，点击直接默认确认并流转！
    if (type === 'defend') {
      this.finalizeAllyAction(allyId, { type: 'defend' });
      return;
    }

    // 4. 随身药品
    if (type === 'item') {
      if (!param) {
        // 打开二级药品竖直菜单
        this.combatSubMenu = 'items';
        this.renderBattleInterface();
        return;
      }
      // 使用选定药品 (默认作用于自身)
      this.finalizeAllyAction(allyId, { type: 'item', itemId: param, targetAllyId: allyId });
      return;
    }

    // 5. 替换仙宠
    if (type === 'switch_pet') {
      this.openSwitchPetModal(allyId);
      return;
    }

    // 6. 招降野怪
    if (type === 'capture') {
      const targetIdx = this.selectedTargetIndex !== undefined ? this.selectedTargetIndex : 0;
      this.confirmCaptureTarget(allyId, targetIdx);
      return;
    }

    // 7. 遁走逃跑 -> 点击直接默认确认并流转！
    if (type === 'flee') {
      this.finalizeAllyAction(allyId, { type: 'flee' });
      return;
    }
  }

  // 完成并锁定某位友方的行动指令，并自动流转至下一位
  async finalizeAllyAction(allyId, action) {
    if (!this.currentBattle) return;

    const ally = this.currentBattle.allies.find(a => a.id === allyId);
    if (!ally) return;

    this.currentBattle.setAllyAction(allyId, action);
    window.Sound.playSuccess();
    window.showGameMessage(`✅【${ally.name}】指令已确认！`, 'success', 1200);

    // 重置选敌与子菜单状态
    this.isSelectingTarget = false;
    this.pendingAction = null;
    this.combatSubMenu = null;

    // 查找下一个尚未下令的存活友方
    const pending = this.currentBattle.getPendingAllyInputs();
    if (pending.length > 0) {
      this.activeSelectedAllyId = pending[0].id;
      this.renderBattleInterface();
    } else {
      // 全员指令均已确认下达！直接开战执行打斗位移动画！
      this.activeSelectedAllyId = null;
      this.renderBattleInterface();
      await this.runCombatTurnAnimations();
    }
  }

  // 渲染屏幕中央竖直单列指令面板
  renderCenterCombatMenu(activeAlly, actorSkills, bagPotions, selectedEnemy) {
    if (!activeAlly || this.isSelectingTarget || this.isAnimatingCombat) return '';

    let contentHtml = '';

    // 二级菜单：绝技列表
    if (this.combatSubMenu === 'skills') {
      contentHtml = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:11px;color:#ffd700;font-weight:bold;">✨ 选择施展神通绝技</span>
          <button class="combat-menu-btn-vertical" style="width:auto;padding:2px 8px;margin:0;font-size:10px;" onclick="window.App2D.combatSubMenu=null;window.App2D.renderBattleInterface();">↩️ 返回</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;max-height:160px;overflow-y:auto;padding-right:4px;">
          ${actorSkills.length === 0 ? '<div style="color:#aaa;font-size:11px;text-align:center;padding:10px;">暂无可施展绝技</div>' : ''}
          ${actorSkills.map(sk => `
            <button class="combat-menu-btn-vertical special" onclick="window.App2D.chooseCombatAction('skill', '${sk.id}')">
              <span>${sk.icon || '✨'} <b>${sk.name}</b></span>
              <span style="color:#7bed9f;font-size:10px;">消耗:${sk.costMp || 0}MP</span>
            </button>
          `).join('')}
        </div>
      `;
    }
    // 二级菜单：药品列表
    else if (this.combatSubMenu === 'items') {
      contentHtml = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:11px;color:#ffd700;font-weight:bold;">💊 选择使用丹药补品</span>
          <button class="combat-menu-btn-vertical" style="width:auto;padding:2px 8px;margin:0;font-size:10px;" onclick="window.App2D.combatSubMenu=null;window.App2D.renderBattleInterface();">↩️ 返回</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;max-height:160px;overflow-y:auto;padding-right:4px;">
          ${bagPotions.length === 0 ? '<div style="color:#aaa;font-size:11px;text-align:center;padding:10px;">背包内暂无可用药品</div>' : ''}
          ${bagPotions.map(slot => {
            const it = window.GAME_DATA.ITEMS[slot.itemId];
            return `
              <button class="combat-menu-btn-vertical" onclick="window.App2D.chooseCombatAction('item', '${slot.itemId}')">
                <span>${it.icon || '💊'} <b>${it.name}</b></span>
                <span style="color:#f5cd79;font-size:10px;">存量:${slot.count}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    }
    // 一级主菜单：每个操作独占一行竖着排列，宽大舒适告别拥挤！
    else {
      contentHtml = `
        <div class="combat-center-header">
          <span style="color:#ffd700;font-weight:bold;font-size:12px;">👉【${activeAlly.name}】选择行动</span>
          <span style="font-size:10px;color:#7bed9f;">(单选即生效)</span>
        </div>
        
        <button class="combat-menu-btn-vertical" onclick="window.App2D.chooseCombatAction('attack')">
          <span>⚔️ 普通攻击</span>
          <span style="font-size:10px;color:#aaa;">(点击选敌) ➔</span>
        </button>

        <button class="combat-menu-btn-vertical special" onclick="window.App2D.chooseCombatAction('skill')">
          <span>✨ 门派绝技</span>
          <span style="font-size:10px;color:#f368e0;">(法术列表) ➔</span>
        </button>

        <button class="combat-menu-btn-vertical" onclick="window.App2D.chooseCombatAction('defend')">
          <span>🛡️ 凝神防御</span>
          <span style="font-size:10px;color:#2ed573;">(直接就绪) ✔</span>
        </button>

        <button class="combat-menu-btn-vertical" onclick="window.App2D.chooseCombatAction('item')">
          <span>💊 随身药品</span>
          <span style="font-size:10px;color:#aaa;">(补气血法力) ➔</span>
        </button>

        ${!activeAlly.isPlayer ? `
          <button class="combat-menu-btn-vertical" style="border-color:#3498db;" onclick="window.App2D.chooseCombatAction('switch_pet')">
            <span>🔄 替换仙宠</span>
            <span style="font-size:10px;color:#74b9ff;">(换宠出战) ➔</span>
          </button>
        ` : `
          ${(!selectedEnemy?.isBoss) ? `
            <button class="combat-menu-btn-vertical" style="border-color:#e67e22;" onclick="window.App2D.chooseCombatAction('capture')">
              <span>📿 招降野怪</span>
              <span style="font-size:10px;color:#f39c12;">(法宝收服) ➔</span>
            </button>
          ` : ''}
          <button class="combat-menu-btn-vertical danger" onclick="window.App2D.chooseCombatAction('flee')">
            <span>🏃 遁走逃跑</span>
            <span style="font-size:10px;color:#ff7675;">(脱离战场) ✔</span>
          </button>
        `}
      `;
    }

    return `
      <div class="combat-center-menu" onclick="event.stopPropagation()">
        ${contentHtml}
      </div>
    `;
  }

  // 渲染回合战斗界面 (轻量去卡片化排布、屏幕中央竖直指令面板、选目标直决)
  renderBattleInterface() {
    const layer = document.getElementById('battle-screen-layer');
    if (!layer || !this.currentBattle) return;

    // 选中的敌方目标
    const aliveEnemies = this.currentBattle.getAliveEnemies();
    const selectedEnemy = this.currentBattle.enemies[this.selectedTargetIndex] || aliveEnemies[0];

    // 当前选中的操作友方
    const activeAlly = this.activeSelectedAllyId
      ? this.currentBattle.allies.find(a => a.id === this.activeSelectedAllyId && a.hp > 0 && !this.currentBattle.actions[a.id])
      : null;

    // 该友方可用技能与背包药品
    const actorSkills = activeAlly
      ? (activeAlly.isPlayer ? this.playerData.getSkills() : (activeAlly.skills || []))
      : [];
    const bagPotions = this.inventory ? this.inventory.getItemsByCategory('consumable') : [];

    layer.innerHTML = `
      <div class="battle-container" style="width:100%;height:100%;background:radial-gradient(circle at center, #26190f 0%, #0d0906 100%);padding:8px 12px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden;box-sizing:border-box;">
        
        <!-- 顶部战场状态栏 -->
        <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.65);border:1px solid #5c4732;border-radius:6px;padding:4px 12px;font-size:11px;z-index:10;">
          <span style="color:#ffd700;font-weight:bold;">⚔️ 第 ${this.currentBattle.round} 回合 · 国风阵营交锋</span>
          <span style="color:#7bed9f;">
            ${this.isAnimatingCombat
              ? '⚡ 正在按速度决序执行双方打斗冲刺！'
              : (this.isSelectingTarget
                ? '🎯 请直接点击敌方目标发动攻击！'
                : (activeAlly ? `👉 请在中央面板为【${activeAlly.name}】选择行动` : '⚡ 全员就绪，开始对决！'))}
          </span>
          <span style="color:#f5cd79;font-size:10px;">速度决序：① > ② > ③ > ④</span>
        </div>

        <!-- 选敌引导横幅 (仅在选目标时浮现) -->
        ${this.isSelectingTarget ? `
          <div class="combat-target-hint">
            <span>🎯 请直接点击左侧敌方目标发动攻击</span>
            <button style="background:#222;color:#eee;border:1px solid #666;border-radius:10px;padding:1px 8px;font-size:10px;cursor:pointer;pointer-events:auto;" onclick="window.App2D.isSelectingTarget=false;window.App2D.renderBattleInterface();">取消</button>
          </div>
        ` : ''}

        <!-- 战场双阵营对决区域 -->
        <div class="battle-arena" id="battle-arena-2d" style="display:flex;flex-direction:row;justify-content:space-between;align-items:center;padding:8px 10px;flex:1;width:100%;position:relative;box-sizing:border-box;">
          
          <!-- 左侧阵营：对方阵容 (轻量去卡片化，从容优雅排布) -->
          <div class="enemy-formation" style="display:flex;flex-direction:column;gap:8px;flex:1;max-width:40%;box-sizing:border-box;">
            <div style="font-size:11px;color:#ff6b81;font-weight:bold;margin-bottom:2px;">【敌方阵营】</div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
              ${this.currentBattle.enemies.map((e, idx) => {
                const isSelected = idx === this.selectedTargetIndex;
                const isDead = e.hp <= 0;
                const orderNum = e.turnOrder || '?';
                const isCandidate = this.isSelectingTarget && !isDead;
                return `
                  <div id="enemy_unit_${idx}" class="combatant-lightweight ${isCandidate ? 'target-candidate' : ''} ${isDead ? 'dead-unit' : ''}" onclick="window.App2D.handleEnemyUnitClick(${idx})">
                    <!-- 速度行动序号徽章 ①②③ -->
                    <div class="turn-order-badge enemy">${orderNum}</div>

                    <!-- 选中目标或待选目标准星标记 -->
                    ${(isCandidate || isSelected) ? `
                      <div style="position:absolute;top:-6px;right:-6px;background:#ff4757;color:#fff;border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:bold;box-shadow:0 0 8px #ff4757;z-index:6;">
                        🎯
                      </div>
                    ` : ''}

                    <div style="width:46px;height:46px;display:flex;align-items:center;justify-content:center;margin:2px 0;">
                      ${window.Portraits ? window.Portraits.getPortraitSvg(e.id || e.monsterType || 'rat', 44) : ''}
                    </div>
                    <div style="text-align:center;width:100%;">
                      <div style="color:#ff6b6b;font-weight:bold;font-size:10px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${e.name}
                      </div>
                      <div class="bar-track" style="width:68px;height:4px;background:#222;border-radius:2px;overflow:hidden;margin:0 auto 1px auto;">
                        <div style="width:${Math.max(0, (e.hp / e.maxHp) * 100)}%;height:100%;background:linear-gradient(90deg, #ff4757, #ff6b81);"></div>
                      </div>
                      <div style="font-size:8px;color:#bbb;">${isDead ? '倒地' : `${e.hp}/${e.maxHp}`}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 屏幕中央竖直单列指令面板 (若正处于选敌或打斗中则隐退) -->
          ${this.renderCenterCombatMenu(activeAlly, actorSkills, bagPotions, selectedEnemy)}

          <!-- 右侧阵营：己方阵容 (轻量去卡片化，支持玩家+3仙宠4人优雅列阵) -->
          <div class="ally-formation" style="display:flex;flex-direction:column;gap:8px;align-items:flex-end;flex:1;max-width:44%;box-sizing:border-box;">
            <div style="font-size:11px;color:#2ecc71;font-weight:bold;margin-bottom:2px;">【己方阵营】(点击切换)</div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end;align-items:center;">
              ${this.currentBattle.allies.map(a => {
                const isReady = !!this.currentBattle.actions[a.id];
                const isCurrentActive = activeAlly && activeAlly.id === a.id;
                const isDead = a.hp <= 0;
                const orderNum = a.turnOrder || '?';

                return `
                  <div id="ally_unit_${a.id}" class="combatant-lightweight ${isCurrentActive ? 'active-turn' : ''} ${isReady ? 'ready-unit' : ''} ${isDead ? 'dead-unit' : ''}" onclick="window.App2D.clickAllyUnit('${a.id}')">
                    
                    <!-- 速度行动序号徽章 ①②③ -->
                    <div class="turn-order-badge ally">${orderNum}</div>

                    <!-- 状态标签：已就绪 或 待命 -->
                    ${isReady ? `
                      <div class="ready-badge">✅就绪</div>
                    ` : (isCurrentActive ? `
                      <div style="position:absolute;top:-7px;right:-5px;font-size:8px;color:#fff;background:#2ecc71;border-radius:4px;padding:1px 4px;font-weight:bold;box-shadow:0 0 6px #2ecc71;z-index:6;">
                        待命
                      </div>
                    ` : '')}

                    <div style="width:46px;height:46px;display:flex;align-items:center;justify-content:center;margin:2px 0;">
                      ${window.Portraits ? window.Portraits.getPortraitSvg(a.isPlayer ? (this.playerChar ? this.playerChar.appearance : 'heaven_general') : (a.entity?.templateId || 'dahai_gui'), 44) : ''}
                    </div>
                    <div style="text-align:center;width:100%;">
                      <div style="color:#ffd700;font-weight:bold;font-size:10px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${a.name}
                      </div>
                      <div class="bar-track" style="width:68px;height:4px;background:#222;border-radius:2px;overflow:hidden;margin:0 auto 1px auto;">
                        <div style="width:${Math.max(0, (a.hp / a.maxHp) * 100)}%;height:100%;background:linear-gradient(90deg, #2ed573, #7bed9f);"></div>
                      </div>
                      <div class="bar-track" style="width:68px;height:3px;background:#222;border-radius:2px;overflow:hidden;margin:0 auto 1px auto;">
                        <div style="width:${Math.max(0, (a.mp / a.maxMp) * 100)}%;height:100%;background:linear-gradient(90deg, #1e90ff, #70a1ff);"></div>
                      </div>
                      <div style="font-size:8px;color:#bbb;">${isDead ? '倒地' : `${a.hp}/${a.maxHp}`}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- 底部战斗实时记录框 -->
        <div class="battle-log-box" id="battle-log-box-2d" style="background:rgba(0,0,0,0.72);border:1px solid #5c4732;border-radius:6px;padding:4px 10px;font-size:10px;line-height:1.5;color:#fef0cd;max-height:58px;overflow-y:auto;box-shadow:inset 0 0 8px rgba(0,0,0,0.8);">
          ${this.currentBattle.logs.slice(-3).map(l => `<div>${l}</div>`).join('')}
        </div>
      </div>
    `;
  }

  // 执行全场速度决序的打斗冲刺位移动画引擎
  async runCombatTurnAnimations() {
    this.isAnimatingCombat = true;
    this.renderBattleInterface();

    await this.currentBattle.executeRound(async (step) => {
      await this.playCombatActionAnimation(step);
      this.renderBattleInterface();
    });

    this.isAnimatingCombat = false;

    // 检查战斗胜负状态
    if (this.currentBattle.status === 'victory') {
      window.Sound.playVictory();
      window.showGameMessage('🎉【荡妖得胜】敌方尽伏！降妖伏魔大获全胜！', 'success', 3500);
      const layer = document.getElementById('battle-screen-layer');
      if (layer) layer.style.display = 'none';

      this.isPaused = false;
      this.currentBattle = null;

      if (this.battleVictoryCallback) {
        this.battleVictoryCallback();
        this.battleVictoryCallback = null;
      }
    } else if (this.currentBattle.status === 'defeat') {
      window.Sound.playFailure();
      window.showGameMessage('【气力衰竭】负伤败退，已被天宫仙泉救护调养……', 'error', 3500);
      const layer = document.getElementById('battle-screen-layer');
      if (layer) layer.style.display = 'none';
      this.isPaused = false;
      this.playerData.hp = this.playerData.maxHp;
      this.currentBattle = null;
    } else {
      // 下一回合：重置选中首个未就绪友方
      const pending = this.currentBattle.getPendingAllyInputs();
      this.activeSelectedAllyId = pending[0] ? pending[0].id : 'player';
      this.isSelectingTarget = false;
      this.pendingAction = null;
      this.combatSubMenu = null;
      this.renderBattleInterface();
    }
  }

  // 播放单步行动的打斗位移动画 (敌攻我 & 我攻敌 完全对称，冲锋滑步至目标面前 -> 击打震颤与多段飘字 -> 原路平滑返回)
  async playCombatActionAnimation(step) {
    if (!step) return;

    // 获取行动者与目标 DOM 节点
    let attackerEl = null;
    let targetEl = null;
    const isAttackerAlly = !String(step.attacker || '').startsWith('enemy_');

    if (isAttackerAlly) {
      attackerEl = document.getElementById(`ally_unit_${step.attacker}`);
      targetEl = document.getElementById(`enemy_unit_${step.targetIndex !== undefined ? step.targetIndex : 0}`);
    } else {
      const eIdx = String(step.attacker).replace('enemy_', '');
      attackerEl = document.getElementById(`enemy_unit_${eIdx}`);
      targetEl = document.getElementById(`ally_unit_${step.target || 'player'}`)
        || document.getElementById('ally_unit_player')
        || document.querySelector('.combatant-lightweight.ready-unit')
        || document.querySelector('.combatant-lightweight');
    }

    // 飘字辅助函数
    const spawnFloatText = (targetNode, text, color = '#ff4757', scale = 1.0) => {
      if (!targetNode) return;
      const rect = targetNode.getBoundingClientRect();
      const txt = document.createElement('div');
      txt.className = 'floating-dmg-text';
      txt.style.left = `${rect.left + rect.width / 2}px`;
      txt.style.top = `${rect.top}px`;
      txt.style.color = color;
      txt.style.fontSize = `${Math.floor(16 * scale)}px`;
      txt.innerText = text;
      document.body.appendChild(txt);
      setTimeout(() => txt.remove(), 900);
    };

    // 刀光裂缝与爆裂火星特效函数
    const spawnSlashFx = (targetNode) => {
      if (!targetNode) return;
      const rect = targetNode.getBoundingClientRect();
      const slash = document.createElement('div');
      slash.className = 'combat-slash-fx';
      slash.style.left = `${rect.left + rect.width / 2}px`;
      slash.style.top = `${rect.top + rect.height / 2}px`;
      document.body.appendChild(slash);
      setTimeout(() => slash.remove(), 320);

      // 生成 6 颗迸发火星
      for (let s = 0; s < 6; s++) {
        const spark = document.createElement('div');
        spark.className = 'combat-spark';
        spark.style.left = `${rect.left + rect.width / 2}px`;
        spark.style.top = `${rect.top + rect.height / 2}px`;
        const angle = Math.random() * Math.PI * 2;
        const dist = 18 + Math.random() * 28;
        spark.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
        spark.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 380);
      }
    };

    // 如果未获取到 DOM，执行备用飘字延时
    if (!attackerEl || !targetEl) {
      if (step.text) spawnFloatText(targetEl || attackerEl, step.text);
      await new Promise(r => setTimeout(r, 400));
      return;
    }

    // 1. 计算两节点相对位移 (敌我对称：友冲向敌停在敌方右前侧，敌冲向友停在友方左前侧)
    const r1 = attackerEl.getBoundingClientRect();
    const r2 = targetEl.getBoundingClientRect();
    const offsetX = isAttackerAlly ? 44 : -44;
    const moveX = (r2.left - r1.left) + offsetX;
    const moveY = (r2.top - r1.top);

    // 2. 行动者平滑冲锋滑步至目标面前 (220ms)
    attackerEl.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.2)';
    attackerEl.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.15)`;
    attackerEl.style.zIndex = '999';

    await new Promise(r => setTimeout(r, 230));

    // 3. 到达目标面前：执行击打动作、目标受击震颤抖动、闪避判定或飘字
    if (step.type === 'dodge') {
      // 闪避特效
      targetEl.style.transition = 'transform 0.15s ease-out';
      targetEl.style.transform = isAttackerAlly ? 'translateX(-12px)' : 'translateX(12px)';
      spawnFloatText(targetEl, '💨 闪避 MISS', '#7bed9f', 1.2);
      await new Promise(r => setTimeout(r, 180));
      targetEl.style.transform = 'translateX(0px)';
    } else {
      // 命中受击震颤抖动与刀光火花
      targetEl.classList.add('hit-shake-anim');
      spawnSlashFx(targetEl);

      // 主击伤害飘字
      const mainDmg = step.damage !== undefined ? step.damage : (step.damages ? step.damages[0] : 0);
      let mainText = `-${mainDmg}`;
      let textColor = '#ff4757';
      let fontScale = 1.0;

      if (step.isFatal) {
        mainText = `⚡ 致命一击 -${mainDmg}`;
        textColor = '#e056fd';
        fontScale = 1.4;
      } else if (step.isCrit) {
        mainText = `💥 暴击 1.5倍 -${mainDmg}`;
        textColor = '#ffd700';
        fontScale = 1.35;
      }

      // 暴击时震屏
      if (step.isCrit || step.isFatal) {
        const battleWrap = document.getElementById('battle-screen-layer');
        if (battleWrap) {
          battleWrap.classList.remove('screen-crit-shake');
          void battleWrap.offsetWidth;
          battleWrap.classList.add('screen-crit-shake');
        }
      }

      spawnFloatText(targetEl, mainText, textColor, fontScale);
      window.Sound.playHit();

      // 4. 若触发连击 (comboCount > 0)：行动者在目标面前快速连续补刀，受击者再次震颤并飘出递减减半伤害
      if (step.comboCount > 0 && step.damages && step.damages.length > 1) {
        const extraDamages = step.damages.slice(1);
        for (let i = 0; i < extraDamages.length; i++) {
          await new Promise(r => setTimeout(r, 150));
          // 行动者小幅度挥砍后坐力
          attackerEl.style.transform = `translate(${moveX + (isAttackerAlly ? -6 : 6)}px, ${moveY}px) scale(1.18)`;
          await new Promise(r => setTimeout(r, 50));
          attackerEl.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.15)`;

          // 目标再次抖动
          targetEl.classList.remove('hit-shake-anim');
          void targetEl.offsetWidth; // 触发 reflow
          targetEl.classList.add('hit-shake-anim');

          // 飘出连击递减减半伤害
          spawnFloatText(targetEl, `🔥 连击追击 -${extraDamages[i]}`, '#ff793f', 1.1);
          window.Sound.playHit();
        }
      }

      await new Promise(r => setTimeout(r, 160));
      targetEl.classList.remove('hit-shake-anim');
    }

    // 5. 行动者原路平滑后退滑步返回自身原战位起点 (200ms)
    attackerEl.style.transition = 'transform 0.2s ease-out';
    attackerEl.style.transform = 'translate(0px, 0px) scale(1)';
    attackerEl.style.zIndex = '1';

    await new Promise(r => setTimeout(r, 210));
  }

  // 仙宠专属：战斗中替换出战仙宠 (保留原血量)
  openSwitchPetModal(allyId) {
    const backupPets = this.pets.filter(p => !this.currentBattle.allies.some(a => a.entity?.instanceId === p.instanceId));

    const modalHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:360px;">
          <div class="modal-header">
            <span class="modal-title">🔄 替换参战仙宠</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body" style="font-size:11px;color:#fef0cd;line-height:1.6;">
            <div style="color:#aaa;margin-bottom:8px;">
              请选择要召唤上阵替换的随行仙宠 (出战将继承其当前血量与精力)：
            </div>
            <div style="max-height:220px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;">
              ${backupPets.length === 0 ? `<div style="text-align:center;color:#887766;padding:12px;">无备战仙宠可替换</div>` : ''}
              ${backupPets.map(p => `
                <div style="background:#20140b;border:1px solid #5c4732;border-radius:6px;padding:6px 8px;display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <div style="color:#ffd700;font-weight:bold;">${p.name} (Lv.${p.level})</div>
                    <div style="font-size:10px;color:${p.hp<p.maxHp?'#ff6b81':'#2ecc71'};">
                      气血: ${p.hp} / ${p.maxHp} · 法力: ${p.mp} / ${p.maxMp}
                    </div>
                  </div>
                  <button class="dialogue-opt-btn" style="padding:3px 8px;font-size:10px;" onclick="window.App2D.doSwitchPetInBattle('${allyId}', '${p.instanceId}'); this.closest('.modal-overlay').remove();">
                    召唤上阵
                  </button>
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

  doSwitchPetInBattle(allyId, petInstanceId) {
    if (!this.currentBattle) return;
    const res = this.currentBattle.switchPet(allyId, petInstanceId, this.pets);
    window.Sound.playLevelUp();
    window.showGameMessage(res.msg, res.success ? 'success' : 'warning');
    this.renderBattleInterface();
  }

  // 确认招降野怪
  confirmCaptureTarget(allyId, targetIdx) {
    if (!this.currentBattle) return;
    const targetEnemy = this.currentBattle.enemies[targetIdx];
    if (!targetEnemy) return;

    const q = targetEnemy.quality || 'ordinary';
    let reqText = '普通野怪，80% 概率招降成功！';
    if (q === 'sanxian') {
      const cnt = this.inventory.getItemCount('silver_gourd');
      reqText = `散仙级灵兽！需消耗【紫竹银葫芦】*1 (持有: ${cnt} 只)，成功率 70%！`;
    } else if (q === 'jinxian') {
      const cnt = this.inventory.getItemCount('gold_gourd');
      reqText = `金仙级圣兽！需消耗【紫金红葫芦】*1 (持有: ${cnt} 只)，成功率 60%！`;
    }

    this.showConfirmModal({
      title: '法宝招降真言',
      content: `确定要尝试招降【${targetEnemy.name}】吗？\n${reqText}`,
      confirmText: '降伏收纳',
      cancelText: '罢手收兵',
      onConfirm: () => {
        this.execAllyAction(allyId, 'capture', targetIdx);
      }
    });
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

    // 4.5 渲染天宫·蟠桃胜境中的实体仙木与发光仙桃
    if (this.currentMapId === 'tiangong_pantao' && mapData.peachTrees) {
      this.renderPeachTrees(mapData.peachTrees);
    }

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

  // 渲染蟠桃胜境中实体大仙树与结满的仙桃
  renderPeachTrees(peachTrees) {
    if (!peachTrees || !Array.isArray(peachTrees)) return;
    const ctx = this.ctx;
    const now = Date.now();

    for (const tree of peachTrees) {
      const sx = tree.x - this.camera.x;
      const sy = tree.y - this.camera.y;

      // 视锥体剔除
      if (sx < -80 || sx > this.camera.viewportWidth + 80 || sy < -80 || sy > this.camera.viewportHeight + 80) {
        continue;
      }

      ctx.save();

      // 1. 脚下深色苍劲古树投影与仙根地脉
      ctx.fillStyle = 'rgba(12, 10, 8, 0.45)';
      ctx.beginPath();
      ctx.ellipse(sx, sy + 22, 28, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. 粗壮仙木树干 (苍劲古朴双色树干)
      ctx.fillStyle = '#4a2c16';
      ctx.beginPath();
      ctx.moveTo(sx - 8, sy + 20);
      ctx.lineTo(sx - 5, sy - 8);
      ctx.lineTo(sx + 5, sy - 8);
      ctx.lineTo(sx + 8, sy + 20);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#6b4226';
      ctx.beginPath();
      ctx.moveTo(sx - 4, sy + 18);
      ctx.lineTo(sx - 2, sy - 6);
      ctx.lineTo(sx + 3, sy - 6);
      ctx.lineTo(sx + 5, sy + 18);
      ctx.closePath();
      ctx.fill();

      // 3. 繁茂层叠仙云树冠 (依品级带不同仙光：3000青碧，6000霞粉，9000金紫)
      let foliageColor = '#27ae60';
      let auraColor = 'rgba(46, 204, 113, 0.35)';
      if (tree.tier === 'tier_6000') {
        foliageColor = '#2980b9';
        auraColor = 'rgba(232, 67, 147, 0.45)';
      } else if (tree.tier === 'tier_9000') {
        foliageColor = '#8e44ad';
        auraColor = 'rgba(255, 215, 0, 0.55)';
      }

      // 树冠祥云外光晕
      const breathe = Math.sin(now / 350) * 2.5;
      ctx.fillStyle = auraColor;
      ctx.beginPath();
      ctx.arc(sx, sy - 16, 32 + breathe, 0, Math.PI * 2);
      ctx.fill();

      // 树冠层叠圆簇
      ctx.fillStyle = foliageColor;
      ctx.beginPath();
      ctx.arc(sx - 16, sy - 14, 18, 0, Math.PI * 2);
      ctx.arc(sx + 16, sy - 14, 18, 0, Math.PI * 2);
      ctx.arc(sx, sy - 26, 22, 0, Math.PI * 2);
      ctx.fill();

      // 树冠高光
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(sx - 6, sy - 28, 12, 0, Math.PI * 2);
      ctx.fill();

      // 4. 树梢挂着的大仙桃实体
      const peachY = sy - 16 + Math.sin(now / 220) * 2;
      if (!tree.isHarvested) {
        // 仙桃金粉光环
        ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(sx, peachY, 13, 0, Math.PI * 2);
        ctx.fill();

        // 仙桃本体 (粉红渐变饱满仙桃)
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🍑', sx, peachY);

        // 绝品仙桃额外紫金星芒
        if (tree.tier === 'tier_9000') {
          ctx.fillStyle = '#fffa65';
          ctx.font = '10px sans-serif';
          ctx.fillText('✨', sx + 10, peachY - 8);
        }
      } else {
        // 仙桃已摘，枝头微露嫩绿灵芽
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🍃', sx, peachY);
      }

      // 5. 树顶称号与木牌名
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.font = 'bold 11px "Microsoft YaHei", sans-serif';

      const tagText = `${tree.name} ${tree.isHarvested ? '(已采摘)' : '(成熟)'}`;
      const metrics = ctx.measureText(tagText);
      const bgW = metrics.width + 12;

      // 牌匾底色
      ctx.fillStyle = 'rgba(20, 15, 12, 0.78)';
      ctx.fillRect(sx - bgW / 2, sy - 52, bgW, 16);
      ctx.strokeStyle = tree.isHarvested ? '#7f8c8d' : (tree.tier === 'tier_9000' ? '#f1c40f' : '#e84393');
      ctx.lineWidth = 1;
      ctx.strokeRect(sx - bgW / 2, sy - 52, bgW, 16);

      ctx.fillStyle = tree.isHarvested ? '#bdc3c7' : (tree.tier === 'tier_9000' ? '#ffd700' : '#ff9ff3');
      ctx.fillText(tagText, sx, sy - 38);

      // 6. 玩家靠近提示 (当玩家走至仙树附近时，头顶跳出交互指引)
      const playerDist = Math.hypot(tree.x - this.playerChar.x, (tree.y + 10) - this.playerChar.y);
      if (playerDist < 58 && !tree.isHarvested) {
        const tipY = sy - 66 + Math.sin(now / 150) * 3;
        ctx.fillStyle = '#f39c12';
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.font = 'bold 12px "Microsoft YaHei", sans-serif';
        ctx.strokeText('🍑 [点击或空格确认采摘]', sx, tipY);
        ctx.fillStyle = '#fff200';
        ctx.fillText('🍑 [点击或空格确认采摘]', sx, tipY);
      }

      ctx.restore();
    }
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

  // =========================================================================
  // 1. 金柳露仙宠洗炼重铸系统 (经典洗宝宝)
  // =========================================================================
  openPetWashModal(instanceId) {
    if (window.Dialogue) window.Dialogue.close();
    document.querySelectorAll('.modal-overlay').forEach(m => m.remove());

    const pet = this.pets.find(p => p.instanceId === instanceId) || this.pets[0];
    if (!pet) {
      window.showGameMessage('身上暂无随行仙宠可洗炼！', 'warning');
      return;
    }

    const jllCount = this.inventory ? this.inventory.getItemCount('jin_liu_lu') : 0;
    const wash = this.tempWashResult;

    const modalHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:540px;width:95%;">
          <div class="modal-header">
            <span class="modal-title">🧴 三界通灵 · 金柳露仙宠洗炼仙鉴</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body" style="padding:12px;font-size:11px;color:#fef0cd;line-height:1.6;">
            <!-- 头部仙宠选择与金柳露存量 -->
            <div style="background:#20140b;border:1px solid #c59b27;border-radius:6px;padding:8px 12px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:24px;">${pet.icon || '🐾'}</span>
                <div>
                  <div style="font-weight:bold;font-size:13px;color:#ffd700;">${pet.name} (Lv.${pet.level})</div>
                  <div style="font-size:10px;color:#aaa;">品质: 【${pet.qualityName}】 | 门派: ${pet.className || '无'}</div>
                </div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:11px;">拥有金柳露: <span style="color:#2ed573;font-weight:bold;font-size:13px;">${jllCount}</span> 瓶</div>
                <div style="font-size:9px;color:#bbb;">每次洗炼消耗 1 瓶</div>
              </div>
            </div>

            <!-- 双栏资质对比面板 -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
              <!-- 当前资质 -->
              <div style="background:#150d06;border:1px solid #4a331c;border-radius:6px;padding:10px;">
                <div style="font-weight:bold;color:#ffd700;border-bottom:1px solid #332211;padding-bottom:4px;margin-bottom:8px;text-align:center;">
                  📜 当前资质与成长
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>等级:</span><span style="color:#aaa;">Lv.${pet.level}</span></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>状态:</span><span style="color:${pet.isMutated?'#ffd700':'#aaa'};">${pet.isMutated?'✨变异宝宝':'原版灵宠'}</span></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>成长率:</span><span style="color:#ffd700;font-weight:bold;">${pet.growth}</span></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>气血资质:</span><span>${pet.aptitudes.hp}</span></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>攻击资质:</span><span>${pet.aptitudes.atk}</span></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>防御资质:</span><span>${pet.aptitudes.def}</span></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>法力资质:</span><span>${pet.aptitudes.matk}</span></div>
                <div style="display:flex;justify-content:space-between;"><span>速度资质:</span><span>${pet.aptitudes.spd}</span></div>
              </div>

              <!-- 洗炼后新资质预览 -->
              <div style="background:#150d06;border:1px solid ${wash?'#2ed573':'#332211'};border-radius:6px;padding:10px;">
                <div style="font-weight:bold;color:${wash?'#2ed573':'#887766'};border-bottom:1px solid #332211;padding-bottom:4px;margin-bottom:8px;text-align:center;">
                  ✨ 洗炼预览结果
                </div>
                ${wash ? `
                  <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>洗后等级:</span><span style="color:#2ed573;">Lv.1 幼年</span></div>
                  <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>洗后形态:</span><span style="color:${wash.isMutated?'#ffd700':'#2ed573'};font-weight:bold;">${wash.name}</span></div>
                  <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <span>成长率:</span>
                    <span style="font-weight:bold;color:${wash.growth>=pet.growth?'#2ed573':'#ff4757'};">
                      ${wash.growth} ${wash.growth>=pet.growth?'▲':'▼'}
                    </span>
                  </div>
                  <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <span>气血资质:</span>
                    <span style="color:${wash.aptitudes.hp>=pet.aptitudes.hp?'#2ed573':'#ff4757'};">
                      ${wash.aptitudes.hp} ${wash.aptitudes.hp>=pet.aptitudes.hp?'▲':'▼'}
                    </span>
                  </div>
                  <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <span>攻击资质:</span>
                    <span style="color:${wash.aptitudes.atk>=pet.aptitudes.atk?'#2ed573':'#ff4757'};">
                      ${wash.aptitudes.atk} ${wash.aptitudes.atk>=pet.aptitudes.atk?'▲':'▼'}
                    </span>
                  </div>
                  <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <span>防御资质:</span>
                    <span style="color:${wash.aptitudes.def>=pet.aptitudes.def?'#2ed573':'#ff4757'};">
                      ${wash.aptitudes.def} ${wash.aptitudes.def>=pet.aptitudes.def?'▲':'▼'}
                    </span>
                  </div>
                  <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <span>法力资质:</span>
                    <span style="color:${wash.aptitudes.matk>=pet.aptitudes.matk?'#2ed573':'#ff4757'};">
                      ${wash.aptitudes.matk} ${wash.aptitudes.matk>=pet.aptitudes.matk?'▲':'▼'}
                    </span>
                  </div>
                  <div style="display:flex;justify-content:space-between;">
                    <span>速度资质:</span>
                    <span style="color:${wash.aptitudes.spd>=pet.aptitudes.spd?'#2ed573':'#ff4757'};">
                      ${wash.aptitudes.spd} ${wash.aptitudes.spd>=pet.aptitudes.spd?'▲':'▼'}
                    </span>
                  </div>
                ` : `
                  <div style="text-align:center;color:#665544;padding:40px 0;">
                    尚未洗炼<br>点击下方按钮消耗 1 瓶金柳露刷新资质！
                  </div>
                `}
              </div>
            </div>

            <!-- 操作按钮 -->
            <div style="display:flex;gap:10px;justify-content:center;">
              <button class="dialogue-opt-btn" style="flex:1;padding:8px;background:#c59b27;color:#000;font-weight:bold;font-size:12px;" onclick="window.App2D.rollPetWash('${pet.instanceId}')">
                🧴 催动金柳露洗炼 (消耗1瓶)
              </button>
              ${wash ? `
                <button class="dialogue-opt-btn" style="flex:1;padding:8px;background:#2ecc71;color:#000;font-weight:bold;font-size:12px;" onclick="window.App2D.confirmPetWash('${pet.instanceId}')">
                  ✅ 确认替换为新资质
                </button>
                <button class="dialogue-opt-btn" style="padding:8px 14px;background:#e74c3c;font-size:12px;" onclick="window.App2D.tempWashResult=null;window.App2D.openPetWashModal('${pet.instanceId}')">
                  ❌ 放弃
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    const v = document.getElementById('game-viewport') || document.body;
    v.insertAdjacentHTML('beforeend', modalHtml);
  }

  rollPetWash(instanceId) {
    const pet = this.pets.find(p => p.instanceId === instanceId);
    if (!pet) return;
    if (!this.inventory || this.inventory.getItemCount('jin_liu_lu') < 1) {
      window.showGameMessage('身上未持有【金柳露】，可前往东海龙宫珍宝阁选购！', 'warning');
      return;
    }
    this.inventory.removeItem('jin_liu_lu', 1);
    this.tempWashResult = window.PetSystem.generateWashResult(pet);
    window.Sound.playMagic();
    window.showGameMessage('🧴 金柳露甘霖洒下！仙宠灵根重塑，请检视右侧洗炼结果！', 'success');
    this.openPetWashModal(instanceId);
  }

  confirmPetWash(instanceId) {
    const pet = this.pets.find(p => p.instanceId === instanceId);
    if (!pet || !this.tempWashResult) return;
    window.PetSystem.applyWashResult(pet, this.tempWashResult);
    this.tempWashResult = null;
    window.Sound.playCrit();
    window.showGameMessage(`🎉【蜕变重生】${pet.name} 资质与成长已重铸完成，成为绝世宝宝！`, 'success', 4500);
    this.openPetWashModal(instanceId);
  }

  // 魔兽要诀打书研习界面
  openPetBookModal(instanceId) {
    if (window.Dialogue) window.Dialogue.close();
    document.querySelectorAll('.modal-overlay').forEach(m => m.remove());

    const pet = this.pets.find(p => p.instanceId === instanceId);
    if (!pet) return;

    if (!pet.passives) pet.passives = [];

    // 从背包中筛选所有的魔兽要诀
    const booksInBag = [];
    if (this.inventory && this.inventory.slots) {
      this.inventory.slots.forEach(s => {
        const itemDef = window.GAME_DATA.ITEMS[s.itemId];
        if (itemDef && itemDef.type === 'pet_book') {
          booksInBag.push({ def: itemDef, count: s.count || 1 });
        }
      });
    }

    const modalHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:440px;width:94%;">
          <div class="modal-header">
            <span class="modal-title">📚 仙宠研习魔兽要诀 · 打书</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body" style="padding:10px;font-size:11px;color:#fef0cd;line-height:1.6;">
            <!-- 当前仙宠信息 -->
            <div style="background:#20140b;border:1px solid #c59b27;border-radius:6px;padding:8px 10px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <span style="font-size:18px;">${pet.icon || '🐾'}</span>
                <span style="font-weight:bold;color:#ffd700;font-size:12px;margin-left:4px;">${pet.name} (Lv.${pet.level})</span>
              </div>
              <span style="font-size:10px;color:#bbb;">已参悟: ${pet.passives.length} / 4 槽位</span>
            </div>

            <!-- 当前已学被动神技 -->
            <div style="background:#150d06;border:1px solid #4a331c;border-radius:6px;padding:6px 10px;margin-bottom:10px;">
              <div style="color:#aaa;font-size:10px;margin-bottom:4px;">当前已领悟被动神技 (打书可能顶替旧技能)：</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                ${[0, 1, 2, 3].map(i => {
                  const p = pet.passives[i];
                  if (p) {
                    return `<span style="background:#2c3e50;border:1px solid #f39c12;border-radius:4px;padding:2px 6px;color:#f1c40f;font-size:10px;">${p.icon || '📖'} ${p.name}</span>`;
                  } else {
                    return `<span style="border:1px dashed #555;border-radius:4px;padding:2px 6px;color:#666;font-size:10px;">[空槽位]</span>`;
                  }
                }).join('')}
              </div>
            </div>

            <!-- 背包中的要诀列表 -->
            <div style="color:#ffd700;font-weight:bold;font-size:11px;margin-bottom:6px;">📦 背包中的魔兽要诀：</div>
            <div style="max-height:220px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;">
              ${booksInBag.length === 0 ? `
                <div style="text-align:center;color:#887766;padding:20px;background:#150d06;border-radius:6px;">
                  背包中暂无魔兽要诀！<br>
                  <span style="font-size:10px;color:#aaa;">可前往东海龙宫【四海珍宝阁】选购或降妖除魔获得！</span>
                </div>
              ` : booksInBag.map(b => `
                <div style="background:#1a1109;border:1px solid #4a331c;border-radius:6px;padding:6px 10px;display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <div style="font-weight:bold;color:#ffd700;font-size:11px;">
                      ${b.def.icon} ${b.def.name} <span style="color:#2ecc71;font-size:10px;">x${b.count}</span>
                    </div>
                    <div style="color:#bbb;font-size:9px;">${b.def.desc}</div>
                  </div>
                  <button class="dialogue-opt-btn" style="padding:4px 10px;font-size:10px;background:#27ae60;font-weight:bold;white-space:nowrap;" onclick="window.App2D.learnPetBook('${pet.instanceId}', '${b.def.id}')">
                    研习领悟
                  </button>
                </div>
              `).join('')}
            </div>

            <div style="display:flex;justify-content:flex-end;margin-top:10px;">
              <button class="dialogue-opt-btn" style="padding:4px 12px;background:#34495e;font-size:10px;" onclick="window.App2D.openPetManageModal()">
                返回仙宠列表
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const v = document.getElementById('game-viewport') || document.body;
    v.insertAdjacentHTML('beforeend', modalHtml);
  }

  // 研习魔兽要诀打书
  learnPetBook(instanceId, bookItemId) {
    const pet = this.pets.find(p => p.instanceId === instanceId);
    if (!pet || !this.inventory) return;

    if (this.inventory.getItemCount(bookItemId) < 1) {
      window.showGameMessage('背包中该魔兽要诀数量不足！', 'error');
      return;
    }

    const res = window.PetSystem.learnPetSkillBook(pet, bookItemId);
    if (!res.success) {
      window.showGameMessage(res.msg, 'warning');
      return;
    }

    // 扣除一本要诀
    this.inventory.removeItem(bookItemId, 1);
    window.Sound.playLevelUp();
    window.showGameMessage(res.msg, 'success', 4500);

    // 刷新打书界面
    this.openPetBookModal(instanceId);
  }
  openForgeModal(selectedSlotKey = 'weapon') {
    if (window.Dialogue) window.Dialogue.close();
    document.querySelectorAll('.modal-overlay').forEach(m => m.remove());

    const equip = this.playerData.equipment[selectedSlotKey];
    const baseItem = equip ? window.GAME_DATA.ITEMS[equip.itemId] : null;
    const curStar = (equip && equip.star) || 0;
    const info = window.ForgeSystem.getEnhanceInfo(curStar);

    const qianghuaCount = this.inventory ? this.inventory.getItemCount('qianghua_shi') : 0;
    const meteorCount = this.inventory ? this.inventory.getItemCount('meteor_iron') : 0;
    const totalStones = qianghuaCount + meteorCount;
    const dingxingCount = this.inventory ? this.inventory.getItemCount('dingxing_shi') : 0;

    const slotNames = {
      weapon: '⚔️ 武器',
      armor: '🥋 铠甲',
      head: '👑 头盔',
      boots: '🥾 鞋靴',
      belt: '🎗️ 腰带',
      necklace: '📿 项链'
    };

    const modalHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:560px;width:95%;">
          <div class="modal-header">
            <span class="modal-title">🔨 大唐名匠 · 神兵天成装备淬炼打造</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body" style="padding:12px;font-size:11px;color:#fef0cd;line-height:1.6;">
            <!-- 部位切换标签 -->
            <div style="display:flex;gap:4px;margin-bottom:12px;background:#150d06;padding:4px;border-radius:6px;">
              ${Object.keys(slotNames).map(k => `
                <button class="dialogue-opt-btn" style="flex:1;padding:4px;font-size:10px;${selectedSlotKey===k?'background:#c59b27;color:#000;font-weight:bold;':''}" onclick="window.App2D.openForgeModal('${k}')">
                  ${slotNames[k]}
                </button>
              `).join('')}
            </div>

            <!-- 装备详情与星级 -->
            <div style="background:#20140b;border:1px solid #c59b27;border-radius:6px;padding:12px;margin-bottom:12px;">
              ${equip && baseItem ? `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:32px;">${baseItem.icon || '⚔️'}</span>
                    <div>
                      <div style="font-size:14px;font-weight:bold;color:#ffd700;">
                        ${curStar > 0 ? `<span style="color:#e74c3c;font-size:16px;">+${curStar} </span>` : ''}${baseItem.name}
                      </div>
                      <div style="font-size:10px;color:#aaa;">品阶: ${baseItem.quality} | 装备槽位: ${slotNames[selectedSlotKey]}</div>
                    </div>
                  </div>
                  <div style="text-align:right;">
                    <div style="color:#ffd700;font-weight:bold;font-size:14px;">${'⭐'.repeat(Math.min(curStar, 6))}${curStar>6?` (+${curStar})`:''}</div>
                    <div style="font-size:9px;color:#aaa;">最高可强化至 +12 星</div>
                  </div>
                </div>

                <!-- 属性与提升对比 -->
                <div style="background:#150d06;border-radius:6px;padding:8px 12px;margin-bottom:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                  <div>
                    <div style="color:#aaa;font-size:10px;border-bottom:1px solid #332211;padding-bottom:2px;margin-bottom:4px;">当前装备属性</div>
                    ${baseItem.attrs.atk ? `<div>物理攻击: <span style="color:#ffd700;">+${Math.floor(baseItem.attrs.atk * (1 + curStar * 0.12))}</span></div>` : ''}
                    ${baseItem.attrs.def ? `<div>物理防御: <span style="color:#2ecc71;">+${Math.floor(baseItem.attrs.def * (1 + curStar * 0.12))}</span></div>` : ''}
                    ${baseItem.attrs.hp ? `<div>气血加成: <span style="color:#ff6b81;">+${Math.floor(baseItem.attrs.hp * (1 + curStar * 0.12))}</span></div>` : ''}
                    ${baseItem.attrs.spd ? `<div>出手速度: <span style="color:#70a1ff;">+${Math.floor(baseItem.attrs.spd * (1 + curStar * 0.12))}</span></div>` : ''}
                  </div>
                  <div>
                    <div style="color:#2ed573;font-size:10px;border-bottom:1px solid #332211;padding-bottom:2px;margin-bottom:4px;">强化 +${curStar + 1} 后预计</div>
                    ${info ? `
                      ${baseItem.attrs.atk ? `<div style="color:#2ed573;">物理攻击: +${Math.floor(baseItem.attrs.atk * (1 + (curStar + 1) * 0.12))} (+12%)</div>` : ''}
                      ${baseItem.attrs.def ? `<div style="color:#2ed573;">物理防御: +${Math.floor(baseItem.attrs.def * (1 + (curStar + 1) * 0.12))} (+12%)</div>` : ''}
                      ${baseItem.attrs.hp ? `<div style="color:#2ed573;">气血加成: +${Math.floor(baseItem.attrs.hp * (1 + (curStar + 1) * 0.12))} (+12%)</div>` : ''}
                      ${baseItem.attrs.spd ? `<div style="color:#2ed573;">出手速度: +${Math.floor(baseItem.attrs.spd * (1 + (curStar + 1) * 0.12))} (+12%)</div>` : ''}
                    ` : `<div style="color:#ffd700;">已达天道极限满星！</div>`}
                  </div>
                </div>

                <!-- 强化消耗与成功率 -->
                ${info ? `
                  <div style="background:rgba(0,0,0,0.3);border-radius:6px;padding:8px 12px;margin-bottom:10px;font-size:11px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                      <span>淬火成功率:</span>
                      <span style="color:#ffd700;font-weight:bold;">${Math.round(info.rate * 100)}%</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                      <span>需要强化材料:</span>
                      <span style="color:${totalStones>=info.costStones?'#2ecc71':'#e74c3c'};font-weight:bold;">
                        强化石/陨铁: ${totalStones} / ${info.costStones} 颗
                      </span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                      <span>所需锻造银两:</span>
                      <span style="color:${this.playerData.silver>=info.costSilver?'#2ecc71':'#e74c3c'};">
                        ${info.costSilver} 两 (拥有: ${this.playerData.silver}两)
                      </span>
                    </div>
                    ${info.penalty !== 'none' ? `
                      <div style="color:#ff6b81;font-size:10px;margin-top:4px;">
                        ⚠️ 淬火失手惩罚：若失败可能掉落 ${info.penalty==='down_1'?'1':'2'} 星！可使用定星石保护。
                      </div>
                    ` : ''}
                  </div>

                  <!-- 按钮 -->
                  <button class="dialogue-opt-btn" style="width:100%;padding:10px;background:#e67e22;color:#fff;font-weight:bold;font-size:13px;" onclick="window.App2D.executeForgeEnhance('${selectedSlotKey}')">
                    🔥 炉火纯青 · 立即淬炼升星
                  </button>
                ` : `
                  <div style="text-align:center;color:#ffd700;padding:10px;font-weight:bold;">✨ 此装备已达最高境界，神威盖世！</div>
                `}
              ` : `
                <div style="text-align:center;color:#887766;padding:30px;">当前部位未穿戴任何装备，请先在背包中穿戴！</div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    const v = document.getElementById('game-viewport') || document.body;
    v.insertAdjacentHTML('beforeend', modalHtml);
  }

  executeForgeEnhance(slotKey) {
    const equip = this.playerData.equipment[slotKey];
    if (!equip) return;
    const curStar = equip.star || 0;
    const info = window.ForgeSystem.getEnhanceInfo(curStar);
    if (!info) return;

    if (this.playerData.silver < info.costSilver) {
      window.showGameMessage(`银两不足！需要 ${info.costSilver} 两银子。`, 'warning');
      return;
    }

    const qCount = this.inventory.getItemCount('qianghua_shi');
    const mCount = this.inventory.getItemCount('meteor_iron');
    if (qCount + mCount < info.costStones) {
      window.showGameMessage(`强化材料不足！需要 ${info.costStones} 颗强化石或天外陨铁。`, 'warning');
      return;
    }

    // 优先扣强化石，不足扣天外陨铁
    let need = info.costStones;
    if (qCount > 0) {
      const takeQ = Math.min(qCount, need);
      this.inventory.removeItem('qianghua_shi', takeQ);
      need -= takeQ;
    }
    if (need > 0 && mCount > 0) {
      this.inventory.removeItem('meteor_iron', need);
    }
    this.playerData.silver -= info.costSilver;

    const isSuccess = Math.random() < info.rate;
    const baseItem = window.GAME_DATA.ITEMS[equip.itemId];
    const equipName = baseItem ? baseItem.name : '装备';

    if (isSuccess) {
      equip.star = curStar + 1;
      this.playerData.recalculateStats(false);
      window.Sound.playCrit();
      window.showGameMessage(`🎉【神兵淬火通灵】金石激荡！【${equipName}】成功升星至 +${equip.star}！基础属性大幅飙升！`, 'success', 4500);
    } else {
      if (info.penalty === 'down_1') equip.star = Math.max(0, curStar - 1);
      if (info.penalty === 'down_2') equip.star = Math.max(0, curStar - 2);
      this.playerData.recalculateStats(false);
      window.Sound.playFailure();
      window.showGameMessage(`【淬火失手】炉温不均，强化失败！装备星级变为 +${equip.star}`, 'warning', 4000);
    }

    this.updatePlayerHud();
    this.openForgeModal(slotKey);
  }

  // =========================================================================
  // 3. 东海龙宫珍宝阁 (选购金柳露、三阶宝石、陨铁)
  // =========================================================================
  openDragonShopModal() {
    if (window.Dialogue) window.Dialogue.close();
    document.querySelectorAll('.modal-overlay').forEach(m => m.remove());

    const shopItems = [
      { id: 'jin_liu_lu', price: 1500, tag: '洗宠圣水' },
      { id: 'meteor_iron', price: 800, tag: '装备强化' },
      { id: 'silver_gourd', price: 800, tag: '招降散仙' },
      { id: 'gold_gourd', price: 2500, tag: '招降金仙' },
      { id: 'gem_jingang', price: 2500, tag: '抗物理' },
      { id: 'gem_sheli', price: 2800, tag: '抗舍生' },
      { id: 'gem_pilei', price: 2600, tag: '抗雷霆' },
      { id: 'gem_qingxin', price: 3500, tag: '抗封印' },
      { id: 'gem_dingshen', price: 3500, tag: '抗定身' },
      { id: 'book_high_critical', price: 8000, tag: '高级兽诀' },
      { id: 'book_high_vampire', price: 8500, tag: '高级兽诀' },
      { id: 'book_high_rebirth', price: 12000, tag: '高级兽诀' },
      { id: 'book_high_speed', price: 6000, tag: '高级兽诀' },
      { id: 'book_high_sneak', price: 7000, tag: '高级兽诀' }
    ];

    const modalHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:520px;width:95%;">
          <div class="modal-header">
            <span class="modal-title">🐚 东海龙宫 · 四海珍宝阁 (龟丞相管事)</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body" style="padding:12px;font-size:11px;color:#fef0cd;line-height:1.6;">
            <div style="display:flex;justify-content:space-between;align-items:center;background:#150d06;padding:6px 12px;border-radius:6px;margin-bottom:10px;">
              <span>当前持有银两: <span style="color:#ffd700;font-weight:bold;">${this.playerData.silver} 两</span></span>
              <span style="color:#aaa;font-size:10px;">四海通宝，童叟无欺</span>
            </div>
            <div style="max-height:280px;overflow-y:auto;display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              ${shopItems.map(item => {
                const it = window.GAME_DATA.ITEMS[item.id];
                if (!it) return '';
                return `
                  <div style="background:#20140b;border:1px solid #4a331c;border-radius:6px;padding:8px;display:flex;flex-direction:column;justify-content:space-between;">
                    <div>
                      <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
                        <span style="font-size:18px;">${it.icon}</span>
                        <span style="font-weight:bold;color:#ffd700;">${it.name}</span>
                        <span style="font-size:9px;color:#2ecc71;border:1px solid #2ecc71;border-radius:3px;padding:0 2px;">${item.tag}</span>
                      </div>
                      <div style="font-size:9px;color:#bbb;margin-bottom:6px;">${it.desc.slice(0, 30)}...</div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="color:#ffd700;font-weight:bold;">${item.price} 两</span>
                      <button class="dialogue-opt-btn" style="padding:2px 8px;font-size:10px;background:#c59b27;color:#000;font-weight:bold;" onclick="window.App2D.buyDragonShopItem('${item.id}', ${item.price})">
                        购买
                      </button>
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

  buyDragonShopItem(itemId, price) {
    if (this.playerData.silver < price) {
      window.showGameMessage(`银两不足！购买该珍宝需 ${price} 两白银。`, 'warning');
      return;
    }
    this.playerData.silver -= price;
    this.inventory.addItem(itemId, 1);
    const it = window.GAME_DATA.ITEMS[itemId];
    window.Sound.playSuccess();
    window.showGameMessage(`🎉 成功从龙宫珍宝阁购得【${it ? it.name : '宝物'}】*1！`, 'success');
    this.updatePlayerHud();
    this.openDragonShopModal();
  }

  // =========================================================================
  // 4. 东海龙宫深海试炼 Boss 战 (战覆海蛟龙，夺定海神针)
  // =========================================================================
  triggerDonghaiTrialBattle() {
    const jiaolong = {
      id: 'boss_jiaolong_wang',
      name: '覆海蛟龙王',
      isBoss: true,
      quality: 'jinxian',
      level: 35,
      hp: 4200,
      maxHp: 4200,
      mp: 1200,
      maxMp: 1200,
      atk: 280,
      def: 110,
      matk: 240,
      mdef: 120,
      spd: 48,
      resistances: { res_feisha: 0.15, res_leiting: 0.15, res_phy: 0.10 }
    };

    const yecha = {
      id: 'mob_kuang_yecha',
      name: '巡海狂夜叉',
      isBoss: false,
      quality: 'sanxian',
      level: 30,
      hp: 2200,
      maxHp: 2200,
      mp: 600,
      maxMp: 600,
      atk: 210,
      def: 85,
      matk: 130,
      mdef: 70,
      spd: 40
    };

    this.start2DBattle([jiaolong, yecha], () => {
      this.inventory.addItem('dinghai_shenzhen', 1);
      this.inventory.addItem('gold_gourd', 1);
      this.inventory.addItem('bishui_zhu', 1);
      this.playerData.gainExp(8000);
      this.playerData.silver += 6000;
      window.Sound.playCrit();
      this.updatePlayerHud();
      window.showGameMessage('🎉【深海试炼通关】力斩覆海蛟龙王！龙王大喜，赠予神兵【定海神针铁·仿】、【紫金红葫芦】、【避水神珠】并赐银6000两！', 'success', 6000);
    });
  }

  // =========================================================================
  // 5. 钟馗降妖除魔日常悬赏抓鬼系统
  // =========================================================================
  acceptZhongkuiGhostQuest() {
    if (this.ghostQuest && this.ghostQuest.active && !this.ghostQuest.completed) {
      window.showGameMessage(`你已有伏魔令在身：速往【${this.ghostQuest.mapName}】斩杀恶鬼【${this.ghostQuest.targetName}】！`, 'info', 4000);
      return;
    }

    const questPool = [
      { mapId: 'liujiacun', mapName: '两界山·刘家村', targetName: '迷途黑山恶鬼', level: 12, hp: 1000, atk: 85, def: 35, spd: 30 },
      { mapId: 'wuxingshan', mapName: '两界山·五行山', targetName: '幽冥噬魂厉鬼', level: 18, hp: 1500, atk: 125, def: 52, spd: 36 },
      { mapId: 'yingchoujian', mapName: '蛇盘山·鹰愁涧', targetName: '黑水吸髓水鬼', level: 25, hp: 2100, atk: 180, def: 75, spd: 42 },
      { mapId: 'chentangguan', mapName: '陈塘关·九湾河', targetName: '翻江巡海煞鬼', level: 30, hp: 2800, atk: 230, def: 95, spd: 45 }
    ];

    const q = questPool[Math.floor(Math.random() * questPool.length)];
    this.ghostQuest = {
      active: true,
      completed: false,
      mapId: q.mapId,
      mapName: q.mapName,
      targetName: q.targetName,
      level: q.level,
      hp: q.hp,
      atk: q.atk,
      def: q.def,
      spd: q.spd
    };

    window.Sound.playSuccess();
    window.showGameMessage(`📜【接取伏魔令】钟馗天师有令：速往【${q.mapName}】降伏作祟恶鬼【${q.targetName}】！`, 'success', 5000);

    // 若当前就在该地图，立即刷新怪物列表
    if (this.currentMapId === q.mapId) {
      this.loadMap(q.mapId);
    }
  }

  submitZhongkuiGhostQuest() {
    if (!this.ghostQuest || !this.ghostQuest.active) {
      window.showGameMessage('钟馗：“少侠尚未接取任何伏魔通缉令，可先接取任务再行除魔！”', 'warning');
      return;
    }
    if (!this.ghostQuest.completed) {
      window.showGameMessage(`钟馗：“那【${this.ghostQuest.targetName}】仍在【${this.ghostQuest.mapName}】作恶，少侠切莫懈怠，速速前去诛之！”`, 'warning');
      return;
    }

    // 发放奖励
    this.playerData.gainExp(3500);
    this.playerData.silver += 2000;
    this.inventory.addItem('jin_liu_lu', 1);
    this.ghostQuest.active = false;
    this.ghostQuest.completed = false;

    window.Sound.playCrit();
    this.updatePlayerHud();
    window.showGameMessage('🎉【伏魔圆满】钟馗奏表天庭！获得修为经验+3500、纹银+2000两，并赏赐仙家圣水【金柳露】*1！', 'success', 5500);
  }

  trackZhongkuiGhostTarget() {
    if (!this.ghostQuest || !this.ghostQuest.active) {
      window.showGameMessage('当前暂无进行中的降妖除魔任务！', 'warning');
      return;
    }
    if (this.ghostQuest.completed) {
      // 恶鬼已死，自动返回长安城钟馗处
      this.loadMap('changan_city', { x: 18 * 32, y: 12 * 32 });
      window.showGameMessage('✨ 地灵神行！已带你返回长安城钟馗天师面前，请点击复命领赏！', 'success');
      return;
    }

    // 传送/寻路至目标场景
    this.loadMap(this.ghostQuest.mapId, { x: 10 * 32, y: 10 * 32 });
    window.showGameMessage(`✨ 神行金光闪烁！已抵达【${this.ghostQuest.mapName}】，恶鬼【${this.ghostQuest.targetName}】就在附近！`, 'success');
  }

  // =========================================================================
  // 5. 大唐镖局军饷押运系统 (运镖与劫镖战斗)
  // =========================================================================
  acceptEscortQuest() {
    if (this.escortQuest && this.escortQuest.active) {
      window.showGameMessage(`少侠身上已有押运任务：速将朝廷军饷送达【${this.escortQuest.targetMapName}·${this.escortQuest.targetNpcName}】！`, 'info', 4500);
      return;
    }

    if (this.playerData.silver < 1000) {
      window.showGameMessage('程咬金：“押运大唐军饷需缴纳 1000 两现银押金，少侠囊中羞涩，暂且无法领镖！”', 'warning', 4000);
      return;
    }

    const escortRoutes = [
      {
        targetMap: 'chentangguan',
        targetMapName: '东海要塞·陈塘关',
        targetNpc: 'npc_lijing_zongbing',
        targetNpcName: '李靖总兵',
        desc: '出长安南城门直达陈塘要塞李靖总兵府'
      },
      {
        targetMap: 'gaolaozhuang',
        targetMapName: '乌斯藏·高老庄',
        targetNpc: 'npc_gaotaigong',
        targetNpcName: '高太公',
        desc: '西出长安经刘家村与五行山、鹰愁涧直抵高老庄'
      },
      {
        targetMap: 'wuzhuangguan',
        targetMapName: '万寿山·五庄观',
        targetNpc: 'npc_zhenyuanzi',
        targetNpcName: '地仙之祖镇元子',
        desc: '长途跋涉历经流沙河与浮屠山直达万寿山五庄观'
      }
    ];

    const route = escortRoutes[Math.floor(Math.random() * escortRoutes.length)];
    this.playerData.silver -= 1000;
    if (this.inventory) {
      this.inventory.addItem('biao_letter', 1);
    }

    this.escortQuest = {
      active: true,
      completed: false,
      targetMap: route.targetMap,
      targetMapName: route.targetMapName,
      targetNpc: route.targetNpc,
      targetNpcName: route.targetNpcName,
      desc: route.desc,
      deposit: 1000,
      rewardSilver: 3500,
      rewardExp: 4000
    };

    window.Sound.playSuccess();
    this.updatePlayerHud();
    window.showGameMessage(`🚩【领取大唐军饷押运令】程咬金：“请少侠一路警惕，速将这批重金军饷送达【${route.targetMapName}】交付【${route.targetNpcName}】！”`, 'success', 5000);
  }

  submitEscortQuest(targetNpcId) {
    if (!this.escortQuest || !this.escortQuest.active) {
      window.showGameMessage('当前并无正在护送的朝廷军饷差事！', 'warning');
      return;
    }

    if (this.escortQuest.targetNpc !== targetNpcId) {
      window.showGameMessage(`此批军饷乃朝廷所拨付，指明由【${this.escortQuest.targetNpcName}】亲启，非此地所纳！`, 'warning', 4000);
      return;
    }

    if (!this.inventory || this.inventory.getItemCount('biao_letter') < 1) {
      window.showGameMessage('身上未见【大唐朝廷军饷镖银】凭信，莫非在途中遗失了？！', 'error', 4500);
      return;
    }

    // 扣除镖银凭信
    this.inventory.removeItem('biao_letter', 1);

    // 退还 1000 押金 + 额外发放 3500 赏银 = 4500 两
    this.playerData.silver += 4500;
    this.playerData.gainExp(this.escortQuest.rewardExp || 4000);

    // 随机赏赐一本稀世魔兽要诀！
    const bookPool = ['book_high_critical', 'book_high_vampire', 'book_high_rebirth', 'book_high_speed', 'book_high_sneak'];
    const rewardedBookId = bookPool[Math.floor(Math.random() * bookPool.length)];
    const bookDef = window.GAME_DATA.ITEMS[rewardedBookId] || { name: '魔兽要诀·高级必杀' };
    this.inventory.addItem(rewardedBookId, 1);

    const prevTargetName = this.escortQuest.targetNpcName;
    this.escortQuest = null;

    window.Sound.playCrit();
    this.updatePlayerHud();
    window.showGameMessage(`🎉【押镖大功告成】${prevTargetName} 喜收军饷！退还押金1000两并赏银3500两、修行经验+4000，并重金赐予《${bookDef.name}》！`, 'success', 5500);
  }

  checkEscortStatus() {
    if (!this.escortQuest || !this.escortQuest.active) {
      window.showGameMessage('程咬金：“少侠身上暂无押运差事，可随时支付 1000 两押金领取引信为朝廷效力！”', 'info');
      return;
    }
    window.showGameMessage(`🚩【运镖行进中】护送目标：【${this.escortQuest.targetMapName}·${this.escortQuest.targetNpcName}】！送达即享 4500 两现银与【魔兽要诀】！`, 'info', 5000);
  }

  // 触发运镖途中山贼劫镖战斗
  triggerEscortBanditBattle() {
    if (this.currentBattle || this.isPaused) return;
    const banditA = {
      id: 'mob_bandit_1',
      name: '截道响马首领',
      level: 28,
      hp: 3600,
      maxHp: 3600,
      mp: 1200,
      maxMp: 1200,
      atk: 180,
      def: 75,
      spd: 38,
      skills: ['舍生取义', '连击']
    };
    const banditB = {
      id: 'mob_bandit_2',
      name: '拦路截镖强盗',
      level: 25,
      hp: 2800,
      maxHp: 2800,
      mp: 800,
      maxMp: 800,
      atk: 140,
      def: 60,
      spd: 32,
      skills: []
    };

    window.showGameMessage('⚠️【警惕！山林劫镖】突然从道旁树丛杀出一伙截道山贼，欲抢夺大唐朝廷军饷！速速迎战！', 'warning', 4500);
    this.start2DBattle([banditA, banditB], () => {
      this.playerData.gainExp(2500);
      this.updatePlayerHud();
      window.Sound.playSuccess();
      window.showGameMessage('🎉【保镖大捷】击溃了截道山贼！镖银安然无恙，继续赶路！', 'success', 4500);
    });
  }

  // =========================================================================
  // 6. 任务卷轴追踪面板 (快捷键 Q 打开)
  // =========================================================================
  openQuestTrackerModal() {
    if (window.Dialogue) window.Dialogue.close();
    document.querySelectorAll('.modal-overlay').forEach(m => m.remove());

    const hasGhost = this.ghostQuest && this.ghostQuest.active;
    const hasEscort = this.escortQuest && this.escortQuest.active;

    const modalHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:540px;width:95%;">
          <div class="modal-header">
            <span class="modal-title">📜 西游降魔历练卷轴 · 任务大览</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body" style="padding:12px;font-size:11px;color:#fef0cd;line-height:1.6;">
            <!-- 主线任务卡片 -->
            <div style="background:#20140b;border:1px solid #c59b27;border-radius:6px;padding:10px;margin-bottom:10px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <span style="font-weight:bold;color:#ffd700;font-size:12px;">🌟【正统西游主线】</span>
                <span style="font-size:10px;color:#2ecc71;">进行中</span>
              </div>
              <div style="color:#eee;margin-bottom:4px;">
                当前主线阶段：<span style="color:#ffd700;">${this.storyPhase}</span>
              </div>
              <div style="font-size:10px;color:#bbb;margin-bottom:8px;">
                历经天宫大闹、两界山苏醒、五行山揭帖破封救大圣、鹰愁涧收白龙、高老庄降八戒、黄风岭借定风丹、流沙河收沙僧、五庄观人参果、白虎岭三打白骨精、宝象国降伏奎木狼、斜月三星洞菩提祖师与南海落伽山！
              </div>
              <button class="dialogue-opt-btn" style="padding:4px 10px;font-size:10px;background:#c59b27;color:#000;font-weight:bold;" onclick="window.App2D.teleportToStoryLead()">
                🎯 自动寻路 / 神行追踪主线目标
              </button>
            </div>

            <!-- 钟馗日常抓鬼卡片 -->
            <div style="background:#150d06;border:1px solid #4a331c;border-radius:6px;padding:10px;margin-bottom:10px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <span style="font-weight:bold;color:#e74c3c;font-size:12px;">👹【钟馗降妖除魔令】(每日抓鬼)</span>
                <span style="font-size:10px;color:${hasGhost?(this.ghostQuest.completed?'#2ecc71':'#ffd700'):'#888'};">
                  ${hasGhost ? (this.ghostQuest.completed ? '已击杀(待领赏)' : '除魔中') : '未接取'}
                </span>
              </div>
              ${hasGhost ? `
                <div style="font-size:11px;color:#fef0cd;margin-bottom:4px;">
                  目标恶鬼：<span style="color:#e74c3c;font-weight:bold;">${this.ghostQuest.targetName}</span> (位于: ${this.ghostQuest.mapName})
                </div>
                <div style="font-size:10px;color:#aaa;margin-bottom:8px;">
                  奖励：修行经验 +3500、纹银 +2000两、仙家洗宠圣水【金柳露】*1！
                </div>
                <button class="dialogue-opt-btn" style="padding:4px 10px;font-size:10px;background:#e74c3c;font-weight:bold;" onclick="window.App2D.trackZhongkuiGhostTarget()">
                  🎯 立即神行前往除妖地点
                </button>
              ` : `
                <div style="font-size:10px;color:#887766;margin-bottom:6px;">
                  前往长安城化生寺旁拜见【伏魔天师·钟馗】，即可领取今日除妖通缉令！
                </div>
                <button class="dialogue-opt-btn" style="padding:3px 8px;font-size:10px;background:#34495e;" onclick="window.App2D.loadMap('changan_city', {x:18*32, y:12*32})">
                  前往长安城钟馗处
                </button>
              `}
            </div>

            <!-- 大唐镖局运镖卡片 -->
            <div style="background:#150d06;border:1px solid #4a331c;border-radius:6px;padding:10px;margin-bottom:10px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <span style="font-weight:bold;color:#f39c12;font-size:12px;">🚩【大唐镖局军饷押运】(运镖赏金)</span>
                <span style="font-size:10px;color:${hasEscort?'#2ecc71':'#888'};">
                  ${hasEscort ? '护送运镖中' : '未接取'}
                </span>
              </div>
              ${hasEscort ? `
                <div style="font-size:11px;color:#fef0cd;margin-bottom:4px;">
                  护送目标：送达 <span style="color:#f1c40f;font-weight:bold;">【${this.escortQuest.targetMapName}·${this.escortQuest.targetNpcName}】</span>
                </div>
                <div style="font-size:10px;color:#aaa;margin-bottom:8px;">
                  路线指引：${this.escortQuest.desc}（返还1000两押金，追加3500两白银、4000经验与稀世【魔兽要诀】）！
                </div>
              ` : `
                <div style="font-size:10px;color:#887766;margin-bottom:6px;">
                  前往长安城拜见【大唐镖头·程咬金】，支付 1000 两押金即可开启押运大唐朝廷军饷！
                </div>
                <button class="dialogue-opt-btn" style="padding:3px 8px;font-size:10px;background:#34495e;" onclick="window.App2D.loadMap('changan_city', {x:12*32, y:11*32})">
                  前往长安城大唐镖局
                </button>
              `}
            </div>

            <!-- 每日蟠桃与龙宫试炼 -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <div style="background:#150d06;border:1px solid #4a331c;border-radius:6px;padding:8px;">
                <div style="font-weight:bold;color:#ff6b81;margin-bottom:4px;">🍑 每日蟠桃盛宴</div>
                <div style="font-size:9px;color:#aaa;margin-bottom:6px;">刘家村东侧土地公可直达蟠桃园大仙树前采摘仙桃加巨额经验！</div>
                <button class="dialogue-opt-btn" style="padding:2px 6px;font-size:9px;background:#e84393;" onclick="window.App2D.teleportToPeachGarden()">
                  前往蟠桃胜境采摘
                </button>
              </div>
              <div style="background:#150d06;border:1px solid #4a331c;border-radius:6px;padding:8px;">
                <div style="font-weight:bold;color:#3498db;margin-bottom:4px;">🌊 东海借宝神针</div>
                <div style="font-size:9px;color:#aaa;margin-bottom:6px;">东海龙宫大殿敖广借宝试炼，力战蛟龙夺神珍铁！</div>
                <button class="dialogue-opt-btn" style="padding:2px 6px;font-size:9px;background:#2980b9;" onclick="window.App2D.loadMap('longgong_palace')">
                  前往龙宫大殿
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const v = document.getElementById('game-viewport') || document.body;
    v.insertAdjacentHTML('beforeend', modalHtml);
  }

  // 寻路追踪当前主线
  teleportToStoryLead() {
    const mapData = window.GAME_DATA.MAPS_2D[this.currentMapId];
    const tgt = this.minimap.getCurrentQuestTarget(this.currentMapId, this.storyPhase, mapData);
    if (tgt) {
      this.handleClickCanvas(tgt.x - this.camera.x, tgt.y - this.camera.y);
      window.showGameMessage(`🎯 已开启自动寻路直指主线目标：【${tgt.name}】！`, 'success');
      return;
    }

    // 跨地图智能神行直达对应主线场景
    const phaseMapMap = {
      heaven_prologue: { mapId: 'tiangong_palace', name: '九重天阙' },
      liujiacun_start: { mapId: 'liujiacun', name: '两界山·刘家村' },
      liujiacun_hunted: { mapId: 'liujiacun', name: '刘家村东门' },
      changan_guided: { mapId: 'changan_city', name: '大唐都城长安' },
      wuxingshan_ready: { mapId: 'wuxingshan', name: '两界山·五行山' },
      wuxing_freed: { mapId: 'yingchoujian', name: '蛇盘山·鹰愁涧' },
      yingchou_cleared: { mapId: 'gaolaozhuang', name: '乌斯藏·高老庄' },
      gaolao_cleared: { mapId: 'huangfengling', name: '八百里·黄风岭' },
      huangfeng_cleared: { mapId: 'liushahe', name: '八百里·流沙河' },
      liusha_cleared: { mapId: 'futushan', name: '浮屠山·乌巢禅院' },
      wuzhuang_cleared: { mapId: 'baihuling', name: '白虎岭' },
      baihu_cleared: { mapId: 'baoxiangguo', name: '宝象国波月洞' },
      baoxiang_cleared: { mapId: 'fangcunshan', name: '灵台方寸山' }
    };

    const targetInfo = phaseMapMap[this.storyPhase];
    if (targetInfo) {
      this.loadMap(targetInfo.mapId);
      window.showGameMessage(`✨ 地脉神行引路！已带你抵达当前主线所在地：【${targetInfo.name}】！`, 'success');
    } else {
      window.showGameMessage('当前地图暂无主线标记，请沿八卦引路法阵前往临近地图！', 'info');
    }
  }
}

window.App2D = new GameApp2D();
window.addEventListener('DOMContentLoaded', () => {
  window.App2D.init();
});
