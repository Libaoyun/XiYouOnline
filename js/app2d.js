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
    this.camera = new window.Camera(760, 580);
    this.pathfinding = new window.PathfindingEngine(32);
    this.minimap = window.MiniMapEngine;

    // 主线进度: 'heaven_prologue' | 'liujiacun_start' | 'liujiacun_hunted' | 'changan_met_monk' | 'wuxingshan_ready' | 'wuxing_freed'
    this.storyPhase = 'heaven_prologue';
    this.isSealTriggered = false;
    this.isSealTriggering = false;

    this.currentMapId = 'tiangong_palace';
    this.playerData = (typeof window !== 'undefined' && window.Player) ? new window.Player({
      name: '威灵大将',
      classId: 'jingang',
      gender: 'male',
      level: 50,
      silver: 15000,
      appearance: 'heaven_general'
    }) : null;
    this.playerChar = (typeof window !== 'undefined' && window.Character) ? new window.Character({
      id: 'player',
      name: '威灵大将',
      type: 'player',
      appearance: 'heaven_general',
      speed: 3.2
    }) : null;
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
    this.isTransitioning = false;

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
    this.collectedProps = new Set();

    // 收集与击杀任务计数器 (蘑菇、枯树精、硕鼠)
    this.questKills = { mushrooms: 0, trees: 0, rats: 0 };

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
    this.canvas.height = 580;
    this.camera.viewportWidth = 760;
    this.camera.viewportHeight = 580;

    // 初始化已播放章节记录
    this.initShownChapterSet();

    // 1. 初始化玩家数据 (序章：九重天阙威灵大将军开局)
    this.playerData = new window.Player({
      name: '威灵大将',
      classId: 'jingang',
      gender: 'male',
      level: 50,
      silver: 15000,
      appearance: 'heaven_general'
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

    // 初始获得御马监龙马坐骑 (按R键随时自由骑乘或下马)
    this.mountSystem.addMount('xuelong_ma', '威灵踏雪龙马');
    this.mountSystem.isRiding = false;
    this.playerData.recalculateStats(false);

    // 2. 玩家 2D 实体 (天界金甲威灵大将)
    this.playerChar = new window.Character({
      id: 'player',
      name: this.playerData.name,
      type: 'player',
      appearance: 'heaven_general',
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
      if (urlParams.get('px') && this.playerChar) {
        this.playerChar.x = parseInt(urlParams.get('px'));
        this.playerChar.y = parseInt(urlParams.get('py'));
        if (this.camera) {
          const map = window.GAME_DATA.MAPS_2D[this.currentMapId];
          this.camera.follow(
            this.playerChar.x,
            this.playerChar.y,
            map.width * this.tilemap.tileSize,
            map.height * this.tilemap.tileSize
          );
        }
      }
    }

    this.bindInputs();

    // 绑定离开页面、切后台、隐藏标签页多维即时自动保存与心跳静默保存
    window.addEventListener('beforeunload', () => this.saveAutoProgress());
    window.addEventListener('pagehide', () => this.saveAutoProgress());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.saveAutoProgress();
      }
    });
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
      // 仅在无存档新建时触发天宫蟠桃胜会序章开篇，确保随从绝对为空！
      this.companions = [];
      this.pets = [];
      this.activeCombatPets = [];
      setTimeout(() => {
        const introDlg = window.GAME_DATA.STORY_DIALOGUES.pantao_intro || window.GAME_DATA.STORY_DIALOGUES.taibai_intro;
        if (introDlg && window.Dialogue) {
          window.Dialogue.start(introDlg);
        }
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
        interactedNpcIds: Array.from(this.interactedNpcSet || []),
        collectedProps: Array.from(this.collectedProps || []),
        shownChapters: Array.from(this.shownChapterSet || []),
        questKills: this.questKills || { mushrooms: 0, trees: 0, rats: 0 }
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
      if (state.shownChapters && Array.isArray(state.shownChapters)) {
        this.shownChapterSet = new Set(state.shownChapters);
      }
      if (state.collectedProps && Array.isArray(state.collectedProps)) {
        this.collectedProps = new Set(state.collectedProps);
      }
      if (state.questKills) {
        this.questKills = Object.assign({ mushrooms: 0, trees: 0, rats: 0 }, state.questKills);
      }
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
      if (state.storyPhase && state.storyPhase.startsWith('heaven_')) {
        this.companions = [];
        this.pets = [];
        this.activeCombatPets = [];
      } else if (state.companions) {
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
      let spawn = state.playerPos || null;
      if (spawn && typeof this.ensurePlayerSafePosition === 'function') {
        const safe = this.ensurePlayerSafePosition(targetMap, spawn.x, spawn.y);
        spawn = { x: safe.x, y: safe.y, direction: spawn.direction || 'down' };
      }
      this.loadMap(targetMap, spawn);
      if (spawn && spawn.direction) {
        this.playerChar.direction = spawn.direction;
      }
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

  // 同步主菜单中的音效开关状态文案与图标
  updateMenuSoundLabel() {
    const labelEl = document.getElementById('menu-sound-label');
    if (labelEl && window.Sound) {
      labelEl.innerText = window.Sound.enabled ? '八音仙乐: 开' : '八音仙乐: 关';
      const card = labelEl.closest('.menu-tile-card');
      if (card) {
        const iconBox = card.querySelector('.tile-icon-box');
        if (iconBox) iconBox.innerText = window.Sound.enabled ? '🔊' : '🔇';
      }
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

  // 重新启程（清空存档彻底回到序章大将军起点：天宫·南天门与凌霄宝殿）
  restartGame() {
    this.showConfirmModal({
      title: '西行轮回 · 乾坤归原',
      content: '少侠，确定要清空当前的全部西行历练存档与修为属性吗？\n\n此举将格式化清空全部金两、仙宠、神兵与任务历练，重回九重天阙威灵大将军初始篇章！',
      confirmText: '确认格式化重置',
      cancelText: '继续当前修行',
      onConfirm: () => {
        try {
          if (window.SaveManager) {
            window.SaveManager.clearProgress();
          }
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('xiyou_2d_save');
            localStorage.removeItem('xiyou_online_save_v3');
            localStorage.removeItem('xiyou_story_progress');
            localStorage.removeItem('xiyou_pet_save');
            localStorage.removeItem('hanfeng_xy_save_auto_progress');
            localStorage.removeItem('hanfeng_xy_shown_chapters');
          }
        } catch (e) {
          console.warn('清空存档异常:', e);
        }

        // 内存状态立即同步复位至天宫序章
        this.shownChapterSet = new Set();
        this.storyPhase = 'heaven_prologue';
        this.isSealTriggered = false;
        this.isSealTriggering = false;
        this.currentMapId = 'tiangong_palace';
        this.companions = [];
        this.pets = [];
        this.activeCombatPets = [];
        if (this.playerData) {
          this.playerData.name = '威灵大将';
          this.playerData.level = 50;
          this.playerData.appearance = 'heaven_general';
          this.playerData.recalculateStats(false);
        }
        if (this.playerChar) {
          this.playerChar.name = '威灵大将';
          this.playerChar.appearance = 'heaven_general';
        }

        const originUrl = window.location && window.location.origin
          ? (window.location.origin + (window.location.pathname || ''))
          : (window.location && window.location.pathname ? window.location.pathname : '');

        if (typeof window !== 'undefined' && window.location && typeof window.location.assign === 'function') {
          window.location.href = originUrl ? (originUrl + '?map=tiangong_palace') : '?map=tiangong_palace';
        } else if (typeof window !== 'undefined' && window.location && 'href' in window.location) {
          window.location.href = originUrl ? (originUrl + '?map=tiangong_palace') : '?map=tiangong_palace';
        } else {
          this.loadMap('tiangong_palace');
        }
      }
    });
  }

  // 🛡️ 玩家安全落脚点保证：确保玩家坐标必须处于可行走平地，彻底根除出生卡水或卡墙 Bug
  ensurePlayerSafePosition(mapId, targetX, targetY) {
    const mapData = window.GAME_DATA.MAPS_2D[mapId];
    if (!mapData || !mapData.tiles) return { x: targetX, y: targetY };

    const ts = 32;
    const tileX = Math.floor(targetX / ts);
    const tileY = Math.floor(targetY / ts);

    const isTileWalkable = (tx, ty) => {
      if (this.tilemap && typeof this.tilemap.isWalkable === 'function') {
        return this.tilemap.isWalkable(mapData, tx, ty);
      }
      if (tx < 0 || ty < 0 || tx >= mapData.width || ty >= mapData.height) return false;
      if (!mapData.tiles[ty]) return false;
      const t = mapData.tiles[ty][tx];
      if (!t) return false;
      const solidTiles = [
        'cloud_void', 'heaven_pillar', 'bamboo', 'water', 'dark_water',
        'city_wall', 'hut_wall', 'palace_eaves', 'wooden_barricade',
        'blacksmith_forge', 'mountain_rock', 'demon_cave_wall',
        'ginseng_tree', 'purple_bamboo', 'tang_palace', 'tang_store',
        'stone_temple', 'two_realms_stele', 'wall', 'stone_wall', 'void', 'abyss'
      ];
      return !solidTiles.includes(t);
    };

    if (isTileWalkable(tileX, tileY)) {
      return { x: targetX, y: targetY };
    }

    console.warn(`[SafeSpawn] 检测到目标坐标 (${tileX}, ${tileY}) 不可行走，触发地脉神行自动矫正...`);

    // 螺旋扩散搜寻最近的可通行瓦片 (向外搜寻最多 10 格)
    for (let r = 1; r <= 10; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const nx = tileX + dx;
          const ny = tileY + dy;
          if (isTileWalkable(nx, ny)) {
            return { x: nx * ts + 16, y: ny * ts + 16 };
          }
        }
      }
    }

    // 终极保底：回退到地图官方 playerSpawn
    if (mapData.playerSpawn && isTileWalkable(Math.floor(mapData.playerSpawn.x / ts), Math.floor(mapData.playerSpawn.y / ts))) {
      return { x: mapData.playerSpawn.x, y: mapData.playerSpawn.y };
    }

    return { x: targetX, y: targetY };
  }

  // 📜 剧情驱动 NPC 可见性：未到达指定剧情阶段前，后续主线 NPC 绝不提前现身
  isNpcVisibleInStoryPhase(npcId, storyPhase, mapId) {
    const rawId = (typeof npcId === 'object' && npcId !== null) ? (npcId.id || '') : (npcId || '');
    storyPhase = storyPhase || this.storyPhase;
    mapId = mapId || this.currentMapId;
    npcId = String(rawId);

    // 采集品永续消隐校验：凡是已采集道具永久不可见
    if (this.collectedProps && this.collectedProps.has(npcId)) {
      return false;
    }

    const phaseWeights = {
      heaven_prologue: 0,
      liujiacun_start: 10,
      liujiacun_hunted: 20,
      changan_guided: 30,
      changan_met_monk: 30,
      wuxingshan_ready: 40,
      wuxing_freed: 50,
      yingchou_cleared: 60,
      gaolao_cleared: 70,
      huangfeng_cleared: 80,
      liusha_cleared: 90,
      wuzhuang_cleared: 100,
      baihu_first_cleared: 104,
      baihu_second_cleared: 107,
      baihu_cleared: 110,
      baoxiang_seek_princess: 112,
      baoxiang_boss_ready: 115,
      baoxiang_cleared: 120,
      pingding_cleared: 130,
      huoyun_cleared: 140,
      poer_cleared: 150,
      chedi_cleared: 160,
      tongtian_cleared: 170,
      huoyan_cleared: 180,
      pansi_cleared: 190,
      shituo_cleared: 200,
      journey_completed: 999
    };

    const currentWeight = phaseWeights[storyPhase] !== undefined ? phaseWeights[storyPhase] : 0;

    // 1. 五行山被压孙悟空：仅在前往五行山揭帖破封阶段 (wuxingshan_ready) 可见
    if (npcId === 'npc_wukong_sealed') {
      return storyPhase === 'wuxingshan_ready';
    }

    // 2. 蛇盘山鹰愁涧：唐僧与小白龙必须在五行山揭帖破封大圣脱困之后 (wuxing_freed 及之后) 才会到达！
    // 刚坠落凡间 (liujiacun_start)、刘家村、长安城阶段绝对不可见！
    if (npcId === 'npc_tang_seng_yingchou') {
      return currentWeight >= phaseWeights.wuxing_freed;
    }
    if (npcId === 'npc_bailong_human') {
      return currentWeight === phaseWeights.wuxing_freed;
    }

    // 3. 高老庄剧情 NPC：必须在收服白龙马之后 (yingchou_cleared 及之后) 才会出现
    if (npcId === 'npc_gaotaigong' || npcId === 'npc_gaocuilan') {
      return currentWeight >= phaseWeights.yingchou_cleared;
    }
    if (npcId === 'npc_zhubajie') {
      return currentWeight >= phaseWeights.yingchou_cleared && currentWeight < phaseWeights.gaolao_cleared;
    }

    // 4. 黄风岭剧情 NPC：必须在高老庄收猪八戒之后 (gaolao_cleared 及之后) 出现
    if (npcId === 'npc_lingji' || npcId === 'npc_huangfeng_boss') {
      return currentWeight >= phaseWeights.gaolao_cleared && currentWeight < phaseWeights.huangfeng_cleared;
    }

    // 5. 浮屠山与流沙河剧情 NPC：必须在黄风岭平息之后 (huangfeng_cleared 及之后) 出现
    if (npcId === 'npc_shawujing') {
      return currentWeight >= phaseWeights.huangfeng_cleared && currentWeight < phaseWeights.liusha_cleared;
    }
    if (npcId === 'npc_wuchao_master' || npcId === 'npc_muzhaxingzhe') {
      return currentWeight >= phaseWeights.huangfeng_cleared;
    }

    // 6. 五庄观：必须在流沙河平息之后 (liusha_cleared 及之后) 出现
    if (npcId === 'npc_zhenyuanzi') {
      return currentWeight >= phaseWeights.liusha_cleared && currentWeight < phaseWeights.wuzhuang_cleared;
    }
    if (npcId === 'npc_qingfeng' || npcId === 'npc_mingyue') {
      return currentWeight >= phaseWeights.liusha_cleared;
    }

    // 7. 白虎岭白骨夫人：必须在五庄观之后 (wuzhuang_cleared 及之后) 出现
    if (npcId === 'npc_baigujing' || npcId === 'npc_baigu_furen') {
      return currentWeight >= phaseWeights.wuzhuang_cleared && currentWeight < phaseWeights.baihu_cleared;
    }

    // 8. 宝象国黄袍怪与公主：必须在三打白骨精之后 (baihu_cleared 及之后) 出现
    if (npcId === 'npc_huangpao_guai' || npcId === 'npc_huangpao_boss') {
      return currentWeight >= phaseWeights.baihu_cleared && currentWeight < phaseWeights.baoxiang_cleared;
    }
    if (npcId === 'npc_baihuaxiu' || npcId === 'npc_baoxiang_king') {
      return currentWeight >= phaseWeights.baihu_cleared;
    }

    // 9. 东胜神洲·花果山与水帘洞：仅在天宫序章大圣反天、奉旨下界征剿阶段出现
    const isHeavenPhase = storyPhase && storyPhase.startsWith('heaven_');
    if (mapId === 'huaguoshan' || mapId === 'huaguoshan_shuilien') {
      if (!isHeavenPhase) return false;
      // 天庭前锋营神将：在花果山主山，指引大将前往水帘洞探查
      if (npcId === 'npc_tianbing_scout') {
        return storyPhase === 'heaven_saved_juanlian' || storyPhase === 'heaven_huaguoshan';
      }
      // 赤毛马猴：在水帘洞内入口迎敌切磋
      if (npcId === 'npc_chimao_mahou' || npcId === 'npc_chimaomahou') {
        return storyPhase === 'heaven_huaguoshan_shuilien';
      }
      // 巨灵神：在水帘洞深处赶尽杀绝幼猴，大战制伏后退场
      if (npcId === 'npc_juling_shen') {
        return storyPhase === 'heaven_huaguoshan_rescue';
      }
      // 受困啼哭小猴：水帘洞中
      if (npcId === 'npc_huaguo_monkey') {
        return storyPhase === 'heaven_huaguoshan_rescue' || storyPhase === 'heaven_juling_defeated';
      }
      // 齐天大圣：在花果山主山现身决战！
      if (npcId === 'npc_wukong_huaguo' || npcId === 'npc_wukong_shadow') {
        return storyPhase === 'heaven_final_wukong';
      }
      // 通臂猿猴：水帘洞前指路老猴
      if (npcId === 'npc_tongbi_yuan' || npcId === 'npc_tongbi_monkey') {
        return true;
      }
      return true;
    }

    // 10. 天宫序章的专属神仙NPC：仅在天宫序章出现，并按三大因缘事件逐步显隐
    if (mapId === 'tiangong_palace' || mapId === 'tiangong_pantao') {
      if (!isHeavenPhase) return false; // 贬落凡间后，天宫神仙退隐

      // 太白金星：天庭老仙，始终接引
      if (npcId === 'npc_taibai') return true;

      // 事件一：天蓬调戏嫦娥（开局出现，解围后天蓬被王母降旨贬猪胎退场）
      if (npcId === 'npc_tianpeng' || npcId === 'npc_change') {
        return storyPhase === 'heaven_prologue' || storyPhase === 'heaven_pantao_start';
      }

      // 事件二：卷帘失手打碎琉璃盏（救嫦娥后登场，求情免死贬流沙河后退场）
      if (npcId === 'npc_juanlian') {
        return storyPhase === 'heaven_saved_change';
      }

      // 押解大圣凯旋与玉帝发落因果阶段
      if (npcId === 'npc_wukong_heaven' || npcId === 'npc_yangjian') {
        return storyPhase === 'heaven_tiangong_trial';
      }

      if (npcId === 'npc_litianwang' || npcId === 'npc_nezha' || npcId === 'npc_leigong') {
        return storyPhase === 'heaven_prologue' || storyPhase === 'heaven_pantao_start' || storyPhase === 'heaven_saved_juanlian' || storyPhase === 'heaven_tiangong_trial';
      }

      return true;
    }

    // 11. 凡间刘家村：野生青蘑菇仅在采摘阶段可见，且已采集过的永久不再出现
    if (npcId.startsWith('prop_mushroom_')) {
      if (this.collectedProps && this.collectedProps.has(npcId)) return false;
      return storyPhase === 'liujiacun_find_mushrooms';
    }

    // 12. 东海之滨与东海龙宫主线 NPC 显隐
    if (npcId === 'npc_yecha') {
      return storyPhase === 'donghai_yecha_ready';
    }
    if (npcId === 'npc_aoguang_coast') {
      return storyPhase === 'donghai_dragon_arrived';
    }
    if (npcId === 'npc_aoguang') {
      return storyPhase === 'longgong_visit';
    }

    // 13. 陈塘关主线 NPC 显隐（混混头目、观音雕像、显圣观音、侍侧龙王）
    if (npcId === 'npc_hooligan_boss') {
      return storyPhase === 'chentang_boss_ready';
    }
    if (npcId === 'npc_guanyin_statue') {
      return storyPhase === 'chentang_statue_investigate' || storyPhase === 'donghai_yecha_ready' || storyPhase === 'donghai_dragon_arrived' || storyPhase === 'longgong_visit';
    }
    if (npcId === 'npc_guanyin_pu_sa') {
      return storyPhase === 'chentang_guanyin_revelation';
    }
    if (npcId === 'npc_aoguang_chentang') {
      return storyPhase === 'chentang_guanyin_revelation';
    }

    // 14. 长安城金銮殿唐太宗与城门刘伯钦送行
    if (npcId === 'npc_tangtaizong') {
      return storyPhase === 'changan_meet_taizong';
    }
    if (npcId === 'npc_liuboqin_changan') {
      return storyPhase === 'changan_farewell';
    }

    // 常规市井生活 NPC（长安商人、医馆、老渔翁、茶肆阿婆、土地公等）：始终驻扎提供服务
    return true;
  }

  // 刷新当前地图 NPC 显隐与感叹号状态
  refreshMapNpcs() {
    if (!this.playerChar) return;
    this.loadMap(this.currentMapId, { x: this.playerChar.x, y: this.playerChar.y });
  }

  // 载入指定地图（支持场景平滑过渡动效：走动切图约0.75s，对话剧情切图约1.0s，Node单测环境同步立即执行）
  loadMap(mapId, customSpawn = null, options = {}) {
    const isNodeTest = typeof process !== 'undefined' && process.release && process.release.name === 'node';
    let duration = 0;
    if (typeof options === 'number') {
      duration = options;
    } else if (options && typeof options.duration === 'number') {
      duration = options.duration;
    } else if (typeof document !== 'undefined' && options?.duration === undefined) {
      duration = (window.Dialogue && window.Dialogue.currentDialogue) ? 1.0 : 0.75;
    }

    let overlay = (typeof document !== 'undefined') ? document.getElementById('scene-transition-overlay') : null;
    if (!overlay && typeof document !== 'undefined' && document.body) {
      overlay = document.createElement('div');
      overlay.id = 'scene-transition-overlay';
      overlay.className = 'scene-transition-overlay';
      document.body.appendChild(overlay);
    }
    const targetMapData = window.GAME_DATA?.MAPS_2D?.[mapId];
    const targetName = targetMapData?.name || '未知圣境';
    const targetRegion = targetMapData?.region || '三界造化';

    if (overlay && duration > 0 && !this.isTransitioning) {
      overlay.innerHTML = `
        <div class="scene-transition-banner">
          <div class="scene-transition-taichi"></div>
          <div class="scene-transition-header">✦ 腾 云 御 风 · 穿 行 圣 境 ✦</div>
          <div class="scene-transition-title"><span>入</span> ${targetName}</div>
          <div class="scene-transition-sub">界属 · ${targetRegion}</div>
        </div>
      `;

      if (!isNodeTest) {
        this.isTransitioning = true;
        this.autoMovePath = [];
        this.autoMoveTargetCallback = null;
        const halfMs = Math.max(160, Math.round((duration * 1000) / 2));
        overlay.style.transition = `opacity ${halfMs / 1000}s ease-in-out`;
        overlay.classList.remove('fade-out');
        overlay.classList.add('active');

        if (window.Sound && window.Sound.playBeep) {
          try { window.Sound.playBeep(); } catch (e) {}
        }

        setTimeout(() => {
          this._applyMapData(mapId, customSpawn);
          setTimeout(() => {
            overlay.classList.remove('active');
            overlay.classList.add('fade-out');
            setTimeout(() => {
              overlay.classList.remove('fade-out');
              this.isTransitioning = false;
            }, halfMs);
          }, 80);
        }, halfMs);
        return;
      }
    }

    this._applyMapData(mapId, customSpawn);
    this.isTransitioning = false;
  }

  // 内部执行地图数据与生灵加载
  _applyMapData(mapId, customSpawn = null) {
    const mapData = window.GAME_DATA.MAPS_2D[mapId];
    if (!mapData) return;

    this.currentMapId = mapId;
    this.autoMovePath = [];
    this.autoMoveTargetCallback = null;

    const rawSpawn = customSpawn || mapData.playerSpawn;
    const safePos = this.ensurePlayerSafePosition(mapId, rawSpawn.x, rawSpawn.y);
    this.playerChar.x = safePos.x;
    this.playerChar.y = safePos.y;
    this.playerChar.direction = rawSpawn.direction || 'down';

    // 严格主线任务感叹号唯一制：同一时刻全游戏只允许当前唯一步骤的 1 位 NPC 拥有金色感叹号！
    const MAIN_QUEST_TARGETS = {
      // 天宫序章三大因缘
      'heaven_prologue': 'npc_tianpeng',
      'heaven_pantao_start': 'npc_tianpeng',
      'heaven_saved_change': 'npc_juanlian',
      'heaven_saved_juanlian': 'npc_tianbing_scout',
      'heaven_huaguoshan': 'npc_tianbing_scout',
      'heaven_huaguoshan_shuilien': 'npc_chimao_mahou',
      'heaven_huaguoshan_rescue': 'npc_juling_shen',
      'heaven_final_wukong': 'npc_wukong_huaguo',
      'heaven_yangjian_capture': 'npc_litianwang',
      'heaven_tiangong_trial': 'npc_taibai',

      // 凡间刘家村
      'liujiacun_start': 'npc_liuboqin',
      'liujiacun_find_mushrooms': null,           // 采蘑菇中
      'liujiacun_mushrooms_collected': 'npc_liuboqin',
      'liujiacun_go_cut_wood': 'npc_liuboqin',
      'liujiacun_wood_gathering': null,           // 砍柴中
      'liujiacun_wood_collected': 'npc_liuboqin',
      'liujiacun_rat_hunting': null,              // 打硕鼠中
      'liujiacun_rats_cleared': 'npc_liuboqin',
      'liujiacun_go_changan': 'npc_liuboqin',

      // 长安与陈塘关东海
      'changan_arrived': 'npc_changan_tea',
      'chentang_investigate': 'npc_li_jing',
      'chentang_defeat_hooligans': null,          // 街头惩戒4名混混中(李靖头顶无感叹号)
      'chentang_hooligans_done': 'npc_li_jing',   // 复命李靖总兵
      'chentang_boss_ready': 'npc_hooligan_boss', // 迎战混混头目雷震彪(1打3决战)
      'chentang_boss_defeated': 'npc_li_jing',    // 击败头目后回总兵府领赏
      'chentang_statue_investigate': 'npc_guanyin_statue', // 查探东侧海滨沉寂观音雕像
      'donghai_yecha_ready': 'npc_yecha',
      'donghai_dragon_arrived': 'npc_aoguang_coast',
      'longgong_visit': 'npc_aoguang',
      'chentang_guanyin_revelation': 'npc_guanyin_pu_sa',
      'changan_meet_xuanzang': 'npc_xuanzang',
      'changan_meet_taizong': 'npc_tangtaizong',
      'changan_farewell': 'npc_liuboqin_changan',

      // 西行正传
      'wuxingshan_ready': 'npc_wukong_sealed',
      'wuxing_freed': 'npc_wukong_sealed',
      'yingchou_cleared': 'npc_zhubajie',
      'gaolao_cleared': 'npc_lingji',
      'huangfeng_cleared': 'npc_shawujing',
      'liusha_cleared': 'npc_zhenyuanzi',
      'wuzhuang_cleared': 'npc_baigujing',
      'baihu_first_cleared': 'npc_baigujing',
      'baihu_second_cleared': 'npc_baigujing',
      'baihu_cleared': 'npc_baoxiang_king',
      'baoxiang_seek_princess': 'npc_baihuaxiu',
      'baoxiang_boss_ready': 'npc_huangpao_boss'
    };

    const shouldShowQuestExclamation = (n) => {
      // 1. 无关闲聊、或点开只是一两句空话的 NPC，绝不悬挂感叹号
      const chattyIdleNpcs = [
        'npc_changan_girl', 'npc_changan_scholar', 'npc_changan_hawker',
        'npc_changan_child', 'npc_changan_guard', 'npc_village_elder',
        'npc_qingfeng', 'npc_mingyue', 'npc_huaguo_monkey', 'npc_change',
        'npc_fisherman'
      ];
      if (chattyIdleNpcs.includes(n.id)) return false;

      // 2. 地面采摘物不显示感叹号
      if (n.id.startsWith('prop_mushroom_')) return false;

      // 3. 支线副本 NPC：如果有专属支线标识，可显示支线感叹号
      if (n.isSideQuest) {
        return !this.interactedNpcSet || !this.interactedNpcSet.has(n.id);
      }

      // 4. 主线感叹号严格唯一匹配：只有当前阶段指定的唯一 NPC 显示感叹号！
      const currentMainTarget = MAIN_QUEST_TARGETS[this.storyPhase];
      if (currentMainTarget && n.id === currentMainTarget) {
        return true;
      }

      return false;
    };

    // 实例化 NPC (拒绝 Emoji，外观配置清晰，已点击/非任务 NPC 头顶绝不乱悬浮感叹号；依据剧情进度过滤未到出场时机的人物)
    const visibleNpcList = (mapData.npcs || []).filter(n => this.isNpcVisibleInStoryPhase(n.id, this.storyPhase, mapId));
    this.npcs = visibleNpcList.map(n => new window.Character({
      id: n.id,
      name: n.id === 'npc_baigujing' ?
        (this.storyPhase === 'wuzhuang_cleared' ? '送斋饭的村姑' :
          this.storyPhase === 'baihu_first_cleared' ? '寻女的老妪' : '拄杖的老翁') : n.name,
      title: n.id === 'npc_baigujing' ? '【白虎岭行路人】' : n.title,
      type: 'npc',
      x: n.x,
      y: n.y,
      appearance: n.id === 'npc_baigujing' ?
        (this.storyPhase === 'wuzhuang_cleared' ? 'changan_girl' :
          this.storyPhase === 'baihu_first_cleared' ? 'tea_granny' : 'tudi_gong') : n.appearance,
      dialogueKey: n.dialogueKey,
      questStatus: shouldShowQuestExclamation(n) ? 'available' : null
    }));

    // 实例化怪物 (完整继承地图怪物全部属性、战斗技能与80%移速)
    this.monsters = (mapData.monsters || []).map(m => {
      const mobChar = new window.Character({
        id: m.id,
        name: m.name,
        type: 'monster',
        x: m.x,
        y: m.y,
        speed: 1.12, // 野怪舒缓巡逻速度 (由原先 1.6 调降至 70% 约 1.12)
        patrolRadius: m.patrolRadius !== undefined ? m.patrolRadius : 30,
        appearance: m.appearance || (window.Character ? window.Character.inferMonsterType(m.name, m.id) : 'wild_wolf'),
        dialogue: [`【${m.name}】(Lv.${m.level || 5}) 呲牙咧嘴，凶煞逼人！`]
      });
      mobChar.level = m.level || 5;
      mobChar.hp = m.hp || 100;
      mobChar.maxHp = m.maxHp || mobChar.hp;
      mobChar.atk = m.atk || 20;
      mobChar.def = m.def || 10;
      mobChar.spd = m.spd || 20;
      mobChar.skills = m.skills || ['普通攻击'];
      mobChar.monsterData = m;
      return mobChar;
    });

    window.Sound.playBeep();
    this.updateLocationHeader(mapData.name, mapData.region);
    this.updatePlayerHud();

    // 每次过图或进入新场景，自动持久化历练进度
    this.saveAutoProgress();

    // 🌟 检查并自动触发当前章节国风开幕动画 (每个章节每位玩家只开幕一次，持久化到存档)
    this.checkAndTriggerChapterOpening(mapId, this.storyPhase);
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

    const avatarCircleEl = document.getElementById('hud-avatar-circle');
    if (avatarCircleEl) {
      const isGeneral = this.playerData && (this.playerData.appearance === 'heaven_general' || (this.playerChar && this.playerChar.appearance === 'heaven_general'));
      const roleId = isGeneral ? 'heaven_general' : 'shaoxia';
      if (!avatarCircleEl.dataset.roleId || avatarCircleEl.dataset.roleId !== roleId) {
        avatarCircleEl.dataset.roleId = roleId;
        avatarCircleEl.innerHTML = window.Portraits ? window.Portraits.getPortraitSvg(roleId, 26) : '🧙‍♂️';
      }
    }
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

      if (e.key === 'Tab') {
        e.preventDefault();
        this.toggleSceneRosterModal();
        return;
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
        this.openInventoryModal();
      } else if (e.key === 'p' || e.key === 'P') {
        this.openPetManageModal();
      } else if (e.key === 'q' || e.key === 'Q') {
        this.openQuestTrackerModal();
      } else if (e.key === 'm' || e.key === 'M') {
        this.toggleFoldableMenu();
      } else if (e.key === 'Escape') {
        if (this.isMenuOpen) {
          this.toggleFoldableMenu(false);
        }
        this.toggleSceneRosterModal(false);
        if (window.Dialogue) window.Dialogue.close();
        document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
        document.querySelectorAll('.roster-modal-overlay').forEach(m => m.remove());
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

    // 名册顶部快捷按钮绑定
    const rosterBtn = document.getElementById('btn-scene-roster');
    if (rosterBtn) {
      rosterBtn.addEventListener('click', () => {
        this.toggleSceneRosterModal();
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
          this.canvas.height = 580;
          this.camera.viewportWidth = 760;
          this.camera.viewportHeight = 580;
        } else {
          this.canvas.width = 320;
          this.canvas.height = 380;
          this.camera.viewportWidth = 320;
          this.camera.viewportHeight = 380;
        }
        window.Sound.playBeep();
      });
    }

    // 音效一键开关 (默认关闭，支持随时一键开启/关闭)
    const soundBtn = document.getElementById('toggle-sound-btn');
    if (soundBtn) {
      soundBtn.innerHTML = (window.Sound && window.Sound.enabled) ? '🔊 音效:开' : '🔇 音效:关';
      soundBtn.addEventListener('click', () => {
        const enabled = window.Sound.toggle();
        soundBtn.innerHTML = enabled ? '🔊 音效:开' : '🔇 音效:关';
        this.updateMenuSoundLabel();
        if (enabled) {
          window.Sound.playBeep();
          window.showGameMessage('🔊 八音仙乐已开启', 'info');
        } else {
          window.showGameMessage('🔇 仙乐已静音关闭', 'info');
        }
      });
    }
  }

  // 场景鼠标点击智能分发
  handleClickCanvas(screenX, screenY) {
    if (this.isPaused || this.currentBattle) return;
    if (window.Dialogue && window.Dialogue.currentDialogue) {
      // 用户点击了场景画布，直接解除对话并走完流程
      window.Dialogue.completeAllAndClose();
      return;
    }

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
    if (!p || this.isTransitioning) return;
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

    this.loadMap(p.targetMap, { x: p.targetX, y: p.targetY }, { duration: 0.75 });
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
    if (this.isPaused || (window.Dialogue && window.Dialogue.currentDialogue) || this.currentBattle) return;

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

    // 3.5 移动停步检测与位置即时持久化防抖 (彻底确保玩家停下后的最新坐标100%存入本地)
    const isMovingNow = (dx !== 0 || dy !== 0 || this.autoMovePath.length > 0);
    if (this._wasPlayerMoving && !isMovingNow) {
      if (this._stopMoveSaveTimer) clearTimeout(this._stopMoveSaveTimer);
      this._stopMoveSaveTimer = setTimeout(() => {
        this.saveAutoProgress();
      }, 300);
    }
    this._wasPlayerMoving = isMovingNow;

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

    // 7. 五行山金符压帖检测 (严控时空门禁：仅在西行启程后且未破封前可交互，严防死循环)
    if (this.currentMapId === 'wuxingshan' && this.storyPhase === 'wuxingshan_ready' && !this.isSealTriggered && !this.isSealTriggering) {
      const sealDist = Math.hypot(12 * 32 - this.playerChar.x, 3 * 32 - this.playerChar.y);
      if (sealDist < 26) {
        this.isSealTriggering = true;
        window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.wuxing_seal_trigger);
      }
    }

    // 8. 更新环境粒子系统与马蹄踏云烟尘
    if (this.particleSystem && this.canvas) {
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

    if (npc.id === 'npc_baigujing') {
      npc.dialogueKey = this.storyPhase === 'baihu_first_cleared' ? 'baigujing_second_encounter' :
        this.storyPhase === 'baihu_second_cleared' ? 'baigujing_third_encounter' : 'baigujing_encounter';
    }
    if (this.storyPhase === 'baoxiang_cleared' && npc.id === 'npc_baihuaxiu') {
      npc.dialogueKey = 'baihuaxiu_homecoming';
    }
    if (this.storyPhase === 'baoxiang_cleared' && npc.id === 'npc_baoxiang_king') {
      npc.dialogueKey = 'baoxiang_king_reunion';
    }
    if (npc.id === 'npc_huangpao_boss' && this.storyPhase !== 'baoxiang_boss_ready') {
      window.Dialogue.start({ steps: [{
        speaker: '波月洞洞门', speakerTitle: '【妖雾锁关】',
        text: '洞中妖风与星光交错。先去王宫问明来龙去脉，再找到百花羞公主，才能直面奎木狼。'
      }] });
      return;
    }

    // 依据当前最新 storyPhase 动态匹配李靖总兵的剧情对话
    if (npc.id === 'npc_li_jing') {
      if (this.storyPhase === 'chentang_hooligans_done') {
        npc.dialogueKey = 'chentang_lijing_hooligans_done';
      } else if (this.storyPhase === 'chentang_boss_defeated') {
        npc.dialogueKey = 'chentang_lijing_reward';
      } else if (this.storyPhase === 'chentang_defeat_hooligans') {
        const count = (this.questKills && this.questKills.chentangHooligans) || 0;
        window.Dialogue.start({
          steps: [
            {
              speaker: '李靖总兵',
              speakerTitle: '【陈塘总兵】',
              speakerIcon: '👑',
              text: `壮士，街头作恶混混甚是猖獗，还请速速前去将其制伏！目前已惩戒 (${count}/4)。`
            }
          ]
        });
        return;
      } else if (this.storyPhase === 'chentang_boss_ready') {
        window.Dialogue.start({
          steps: [
            {
              speaker: '李靖总兵',
              speakerTitle: '【陈塘总兵】',
              speakerIcon: '👑',
              text: `壮士，混混头目雷震彪正带着随从直奔东市而来，事不宜迟，请速速前往截击将其一网打尽！`
            }
          ]
        });
        return;
      } else if (this.storyPhase === 'chentang_statue_investigate' || this.storyPhase === 'donghai_yecha_ready') {
        window.Dialogue.start({
          steps: [
            {
              speaker: '李靖总兵',
              speakerTitle: '【陈塘总兵】',
              speakerIcon: '👑',
              text: `东侧海滨那尊观音雕像佛光沉寂，无法言语对话。海潮正向东海翻涌，壮士可深入东海之滨探查一番！`
            }
          ]
        });
        return;
      } else if (this.storyPhase === 'chentang_investigate') {
        npc.dialogueKey = 'chentang_lijing_talk';
      }
    }

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
  // 📜 角色仙籍面板 (五维潜能自由分配、门派绝技查看、装备抗性加成)
  // =========================================================================
  // =========================================================================
  // 个人信息与状态面板 (1:1 像素级复刻图3：正统深紫褐暗纹锦缎、四极雷达罗盘、11项金菱条目)
  // =========================================================================
  openPlayerProfileModal() {
    if (window.Dialogue) window.Dialogue.close();
    document.querySelectorAll('.profile-v3-overlay, .modal-overlay').forEach(m => m.remove());

    const p = this.playerData;
    const nextExp = p.getNextLevelExp();
    const isPanda = p.name.includes('熊猫') || (this.playerChar && this.playerChar.appearance === 'panda_hero');

    const gold = Math.floor(p.silver / 1000);
    const taels = p.silver % 1000;

    const modalHtml = `
      <div class="profile-v3-overlay" onclick="this.remove()">
        <div class="profile-v3-window" onclick="event.stopPropagation()">
          <!-- 顶部金色中式门扣牌坊 -->
          <div class="profile-v3-top-crest"></div>
          <button class="profile-v3-close" onclick="this.closest('.profile-v3-overlay').remove()" title="关闭 (Esc)">✕</button>

          <!-- 1. 顶部身份与四极雷达上半区 (复刻图3左右双栏) -->
          <div class="profile-v3-header">
            <!-- 左侧身份名片 -->
            <div class="profile-v3-identity">
              <!-- 圆形金色双环发光头像 (支持点击一键切换少侠/熊猫大侠/天将造型) -->
              <div class="profile-v3-avatar-ring" onclick="window.App2D.togglePlayerAppearance()" style="cursor:pointer;" title="点击切换造型 (少侠 / 熊猫大侠 / 威灵神将)">
                <canvas id="profile-avatar-canvas" class="profile-v3-avatar-canvas" width="60" height="60"></canvas>
              </div>

              <!-- 身份文字信息 -->
              <div class="profile-v3-id-info">
                <div class="profile-v3-name">${p.name}</div>
                <div class="profile-v3-subid">ID: ${p.id || 2058}</div>
                <div class="profile-v3-subid" style="color:#ffd700;font-size:9.5px;cursor:pointer;" onclick="window.App2D.togglePlayerAppearance()">🔄 点击头像切换造型</div>
                <!-- 徽章三件套：LV胶囊 + 【仙】古印 + 五行水波印 -->
                <div class="profile-v3-badges-row">
                  <div class="profile-v3-lv-pill">
                    <span class="profile-v3-lv-txt">LV</span>
                    <span class="profile-v3-lv-num">${p.level}</span>
                  </div>
                  <div class="profile-v3-xian-seal" title="仙界正统仙籍">仙</div>
                  <div class="profile-v3-wuxing-icon" title="五行命属：天一生水">♒</div>
                </div>
                <!-- 红底金边【仙童】小牌匾 -->
                <div class="profile-v3-plaque">
                  <span class="profile-v3-plaque-dash">―</span>
                  <span class="profile-v3-plaque-text">${p.level >= 50 ? '大 将' : (p.level >= 30 ? '散 仙' : '仙 童')}</span>
                  <span class="profile-v3-plaque-dash">―</span>
                </div>
              </div>
            </div>

            <!-- 右侧四极潜能雷达罗盘 (体、力、敏、法) -->
            <div class="profile-v3-radar-box">
              <canvas id="profile-radar-canvas" class="profile-v3-radar-canvas" width="120" height="94"></canvas>
            </div>
          </div>

          <!-- 2. 下半区：11项深褐金角锦缎属性条目 (复刻图3金菱形条目) -->
          <div class="profile-v3-list">
            <div class="profile-v3-row" onclick="window.App2D.toggleMountRiding(); window.App2D.openPlayerProfileModal();">
              <span class="profile-v3-label">坐骑: ${this.playerChar && this.playerChar.isRiding ? '白龙神驹 (骑乘中)' : '暂无骑乘中坐骑'}</span>
              <span class="profile-v3-arrow">✦</span>
            </div>
            <div class="profile-v3-row" onclick="window.showGameMessage('🎖️ 至尊VIP仙府特权已激活，战斗与历练获享专属庇佑！', 'info');">
              <span class="profile-v3-label">会员等级: 非会员</span>
              <span class="profile-v3-arrow">✦</span>
            </div>
            <div class="profile-v3-row">
              <span class="profile-v3-label">升级: 需${Math.max(0, nextExp - p.exp)}经验</span>
              <span class="profile-v3-arrow">✦</span>
            </div>
            <div class="profile-v3-row">
              <span class="profile-v3-label">升级效率: 104%(官方包+5%)</span>
              <span class="profile-v3-arrow">✦</span>
            </div>
            <div class="profile-v3-row">
              <span class="profile-v3-label">体力值: 正常[0]</span>
              <span class="profile-v3-arrow">✦</span>
            </div>
            <div class="profile-v3-row">
              <span class="profile-v3-label">五行属性: 水</span>
              <span class="profile-v3-arrow">✦</span>
            </div>
            <div class="profile-v3-row">
              <span class="profile-v3-label">活力值: 40</span>
              <span class="profile-v3-arrow">✦</span>
            </div>
            <div class="profile-v3-row">
              <span class="profile-v3-label">钱: ${gold}金 ${taels}两</span>
              <span class="profile-v3-arrow">✦</span>
            </div>
            <div class="profile-v3-row">
              <span class="profile-v3-label">绑银: 7400两</span>
              <span class="profile-v3-arrow">✦</span>
            </div>
            <div class="profile-v3-row">
              <span class="profile-v3-label">居住地: ${this.currentMapId === 'tiangong_palace' ? '九天凌霄' : (this.currentMapId === 'changan_city' ? '大唐长安' : '刘家村')}</span>
              <span class="profile-v3-arrow">✦</span>
            </div>
            <div class="profile-v3-row" onclick="window.showGameMessage('🚩 仙门帮派广招豪杰，可在长安城大唐行馆创建或加入仙盟！', 'info');">
              <span class="profile-v3-label">帮派: 无</span>
              <span class="profile-v3-arrow">✦</span>
            </div>
          </div>

          <!-- 3. 底部微标与潜能分配入口 -->
          <div class="profile-v3-footer">
            <span class="profile-v3-foot-pill">9game.cn</span>
            <button class="profile-v3-pot-btn" onclick="window.App2D.openStatAllocationModal()">
              🌟 潜能分配 (${p.potentialPoints}点)
            </button>
          </div>
        </div>
      </div>
    `;

    const v = document.body;
    v.insertAdjacentHTML('beforeend', modalHtml);
    if (window.Sound) window.Sound.playBeep();

    // 绘制头像与四极潜能雷达
    this.renderProfileV3Avatar(isPanda);
    this.renderProfileV3Radar();
  }

  // 绘制图3左上角圆形头像 (工笔重彩神级特写)
  renderProfileV3Avatar(isPanda) {
    const cvs = document.getElementById('profile-avatar-canvas');
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    ctx.clearRect(0, 0, 60, 60);

    const isGeneral = this.playerData && (this.playerData.appearance === 'heaven_general' || (this.playerChar && this.playerChar.appearance === 'heaven_general'));
    const roleId = isPanda ? 'panda_warrior' : (isGeneral ? 'heaven_general' : 'shaoxia');

    if (window.Portraits && typeof window.Portraits.drawAvatarOnCanvas === 'function') {
      window.Portraits.drawAvatarOnCanvas(cvs, roleId);
    } else {
      // 优雅保底渲染
      const grad = ctx.createRadialGradient(30, 30, 5, 30, 30, 30);
      grad.addColorStop(0, '#5a1212');
      grad.addColorStop(0.7, '#2a0a0a');
      grad.addColorStop(1, '#150505');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 60, 60);
      ctx.save();
      if (isPanda) {
        CharacterRenderer.drawPandaHero(ctx, 42, 0, 'right', false, false);
      } else {
        CharacterRenderer.drawMartialHero(ctx, 42, 0, 'right', false, false);
      }
      ctx.restore();
    }
  }

  // 点击个人面板头像一键切换角色造型 (大唐少侠 / 蜀山功夫熊猫大侠 / 威灵显赫神将)
  togglePlayerAppearance() {
    if (!this.playerChar) return;
    const cur = this.playerChar.appearance;
    let nextApp = 'panda_hero';
    let nextName = '蜀山功夫熊猫大侠 (熊猫凶猛)';
    if (cur === 'panda_hero') {
      nextApp = 'heaven_general';
      nextName = '威灵显赫金甲神将';
    } else if (cur === 'heaven_general') {
      nextApp = 'martial_hero';
      nextName = '大唐仗剑少侠';
    } else {
      nextApp = 'panda_hero';
      nextName = '蜀山功夫熊猫大侠 (熊猫凶猛)';
    }

    this.playerChar.appearance = nextApp;
    if (this.playerData) {
      this.playerData.appearance = nextApp;
    }

    const isPanda = nextApp === 'panda_hero';
    this.renderProfileV3Avatar(isPanda);

    if (window.showGameMessage) {
      window.showGameMessage(`✨ 角色外貌已切换为：【${nextName}】！`, 'success');
    }
  }

  // =========================================================================
  // 🌟 汉风西游 - 2秒国风章回体震撼开幕动画系统 (ChapterOpeningSystem)
  // 水墨展卷、金光劈空裂痕、烫金流光大字、七言绝句对联、朱砂御篆神印
  // =========================================================================
  showChapterOpening(chapterInput, onComplete = null) {
    let config = null;
    if (typeof chapterInput === 'string') {
      if (window.GAME_DATA && window.GAME_DATA.CHAPTER_CONFIGS && window.GAME_DATA.CHAPTER_CONFIGS[chapterInput]) {
        config = window.GAME_DATA.CHAPTER_CONFIGS[chapterInput];
      } else {
        config = {
          title: chapterInput,
          subtitle: '西游万古弘誓愿，荡魔诛邪踏征程',
          seal: '西游正传'
        };
      }
    } else if (typeof chapterInput === 'object' && chapterInput) {
      config = chapterInput;
    } else {
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    const title = config.title || '西游正传';
    const subtitle = config.subtitle || '九万里西行求真经，荡魔斩妖立正果';
    const seal = config.seal || '西游正传';
    const duration = config.duration || 2000; // 精准 2 秒 (2000ms)

    if (typeof document === 'undefined') {
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    // 移除已有开幕节点（若有）
    const existing = document.getElementById('chapter-opening-overlay');
    if (existing && existing.parentNode) {
      existing.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'chapter-opening-overlay';
    overlay.className = 'chapter-opening-overlay';

    overlay.innerHTML = `
      <div class="chapter-opening-bar-top">✦ 汉 风 西 游 · 章 回 演 义 ✦</div>
      <div class="chapter-opening-box">
        <div class="chapter-opening-goldline"></div>
        <div class="chapter-opening-tag">✦ JOURNEY TO THE WEST ✦</div>
        <div class="chapter-opening-title">${title}</div>
        <div class="chapter-opening-poem">${subtitle}</div>
        <div class="chapter-opening-seal-wrap">
          <span class="chapter-opening-seal">【 ${seal} 】</span>
        </div>
      </div>
      <div class="chapter-opening-bar-bottom">✦ 西 天 取 经 · 功 德 圆 满 ✦</div>
      <div class="chapter-opening-skip">点击屏幕任意位置跳过</div>
    `;

    const viewport = document.getElementById('game-viewport') || document.querySelector('.phone-screen-frame') || document.body;
    viewport.appendChild(overlay);

    if (window.Sound) {
      try {
        if (typeof window.Sound.playSuccess === 'function') {
          window.Sound.playSuccess();
        }
      } catch (e) {}
    }

    let isClosed = false;
    const closeOpening = () => {
      if (isClosed) return;
      isClosed = true;
      overlay.classList.remove('active');
      overlay.classList.add('fade-out');
      setTimeout(() => {
        if (overlay && overlay.parentNode) {
          overlay.remove();
        }
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }, 400);
    };

    // 支持点击屏幕任意位置立即跳过
    if (typeof overlay.addEventListener === 'function') {
      overlay.addEventListener('click', () => {
        closeOpening();
      });
    } else {
      overlay.onclick = () => {
        closeOpening();
      };
    }

    // 动效启动
    setTimeout(() => {
      if (!isClosed && overlay) overlay.classList.add('active');
    }, 20);

    // 持续时间到达 (1600ms 开始淡出，2000ms 彻底完成)
    const fadeOutDelay = Math.max(800, duration - 400);
    setTimeout(() => {
      closeOpening();
    }, fadeOutDelay);
  }

  // 兼容老版本调用，直接复用全新 2s 开幕动画
  showChapterBanner(title, subtitle, seal = '西游正传', duration = 2000, onComplete = null) {
    this.showChapterOpening({ title, subtitle, seal, duration }, onComplete);
  }

  // 章节自动判定与触发器 (每章节每位玩家只开幕一次，严格跟随主线剧情进度，持久化到存档)
  checkAndTriggerChapterOpening(mapId, storyPhase, onDone = null) {
    if (!this.shownChapterSet) {
      this.initShownChapterSet();
    }

    const configs = (window.GAME_DATA && window.GAME_DATA.CHAPTER_CONFIGS) || {};
    let matchedChapterKey = null;
    const currentPhase = storyPhase || this.storyPhase || '';

    // 1. 序章：天宫蟠桃盛会 (天宫初始阶段)
    if (mapId === 'tiangong_palace' && (!currentPhase || currentPhase.startsWith('heaven_') || currentPhase === 'pantao_intro' || currentPhase.startsWith('tiangong_'))) {
      if (!this.shownChapterSet.has('prologue')) {
        matchedChapterKey = 'prologue';
      }
    }
    // 2. 第一回：凡尘刘家村 (凡间初醒/刘家村初期阶段)
    else if (mapId === 'liujiacun' && (!currentPhase || currentPhase === 'tiangong_fallen' || currentPhase.startsWith('liujiacun_'))) {
      if (!this.shownChapterSet.has('chapter_1')) {
        matchedChapterKey = 'chapter_1';
      }
    }
    // 3. 第二回：大唐长安城 (受托前往长安盛京或已到长安阶段，刘家村早期绝不触发)
    else if (mapId === 'changan_city' || mapId === 'changan_shendan') {
      const isLiuEarly = currentPhase.startsWith('liujiacun_') && currentPhase !== 'liujiacun_go_changan';
      if (!isLiuEarly && !this.shownChapterSet.has('chapter_2')) {
        matchedChapterKey = 'chapter_2';
      }
    }
    // 4. 第三回：东海陈塘关与东海龙宫
    else if (mapId === 'chentangguan' || mapId === 'donghai_coast' || mapId === 'longgong_palace' || mapId === 'shuijinggong') {
      if (!this.shownChapterSet.has('chapter_3')) {
        matchedChapterKey = 'chapter_3';
      }
    }
    // 5. 第四回：两界山五行山 (核心门禁：刘家村砍柴阶段走到五行山绝不展开！必须是刘家村与刘伯钦告别、西行正式启程后初入才展开)
    else if (mapId === 'wuxingshan') {
      const isLiuEarly = currentPhase.startsWith('liujiacun_') || currentPhase.startsWith('tiangong_');
      if (!isLiuEarly && !this.shownChapterSet.has('chapter_4')) {
        matchedChapterKey = 'chapter_4';
      }
    }
    // 6. 第五回：鹰愁涧 (五行山大圣脱困破封后初入才展开)
    else if (mapId === 'yingchoujian') {
      const isPreWuxing = currentPhase.startsWith('liujiacun_') || currentPhase.startsWith('tiangong_') || currentPhase === 'wuxingshan_ready';
      if (!isPreWuxing && !this.shownChapterSet.has('chapter_5')) {
        matchedChapterKey = 'chapter_5';
      }
    }
    // 7. 第六回：高老庄 (收服小白龙后初入才展开)
    else if (mapId === 'gaolaozhuang') {
      const isPreBailong = currentPhase.startsWith('liujiacun_') || currentPhase.startsWith('tiangong_') || currentPhase === 'wuxingshan_ready';
      if (!isPreBailong && !this.shownChapterSet.has('chapter_6')) {
        matchedChapterKey = 'chapter_6';
      }
    }
    // 8. 第七回：流沙河 (兼容 liushahe 与 liushaho)
    else if (mapId === 'liushahe' || mapId === 'liushaho') {
      const isPreLiusha = currentPhase.startsWith('liujiacun_') || currentPhase.startsWith('tiangong_') || currentPhase === 'wuxingshan_ready';
      if (!isPreLiusha && !this.shownChapterSet.has('chapter_7')) {
        matchedChapterKey = 'chapter_7';
      }
    }
    // 9. 第八回：五庄观
    else if (mapId === 'wuzhuangguan') {
      if (!this.shownChapterSet.has('chapter_8')) {
        matchedChapterKey = 'chapter_8';
      }
    }
    // 10. 第九回：白虎岭
    else if (mapId === 'baihuling') {
      if (!this.shownChapterSet.has('chapter_9')) {
        matchedChapterKey = 'chapter_9';
      }
    }
    // 11. 第十回：宝象国
    else if (mapId === 'baoxiangguo') {
      if (!this.shownChapterSet.has('chapter_10')) {
        matchedChapterKey = 'chapter_10';
      }
    }

    if (matchedChapterKey && configs[matchedChapterKey]) {
      this.shownChapterSet.add(matchedChapterKey);
      this.saveShownChapterSet();
      this.showChapterOpening(configs[matchedChapterKey], onDone);
      return true;
    }

    if (typeof onDone === 'function') onDone();
    return false;
  }

  initShownChapterSet() {
    this.shownChapterSet = new Set();
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('hanfeng_xy_shown_chapters');
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            arr.forEach(k => this.shownChapterSet.add(k));
          }
        }
      }
    } catch (e) {}
  }

  saveShownChapterSet() {
    try {
      if (typeof localStorage !== 'undefined' && this.shownChapterSet) {
        localStorage.setItem('hanfeng_xy_shown_chapters', JSON.stringify(Array.from(this.shownChapterSet)));
      }
    } catch (e) {}
  }

  // 绘制图3右上角四极雷达罗盘 (体、力、敏、法)
  renderProfileV3Radar() {
    const cvs = document.getElementById('profile-radar-canvas');
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const w = cvs.width;
    const h = cvs.height;
    ctx.clearRect(0, 0, w, h);

    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);
    const r = 28;

    // 1. 暗金星轨八卦同心圆背景
    ctx.strokeStyle = 'rgba(168, 120, 60, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.stroke();

    // 虚线十字轴
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = 'rgba(168, 120, 60, 0.45)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx, cy + r);
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. 四极端点发光赤金圆圈与文字 (上体、右力、下敏、左法)
    const axes = [
      { label: '体', x: cx, y: cy - r, key: 'con' },
      { label: '力', x: cx + r, y: cy, key: 'str' },
      { label: '敏', x: cx, y: cy + r, key: 'dex' },
      { label: '法', x: cx - r, y: cy, key: 'int' }
    ];

    axes.forEach(axis => {
      // 外层金圈
      ctx.fillStyle = '#120b13';
      ctx.beginPath();
      ctx.arc(axis.x, axis.y, 6.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 文字
      ctx.font = 'bold 8.5px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(axis.label, axis.x, axis.y + 0.5);
    });

    // 3. 计算玩家属性潜能雷达多边形
    const p = this.playerData;
    const con = (p.attributes && p.attributes.con) || 20;
    const str = (p.attributes && p.attributes.str) || 20;
    const dex = (p.attributes && p.attributes.dex) || 20;
    const intVal = (p.attributes && p.attributes.int) || 20;

    const maxVal = Math.max(con, str, dex, intVal, 30);
    const getRadius = (val) => r * (0.35 + (val / maxVal) * 0.55);

    const rCon = getRadius(con);
    const rStr = getRadius(str);
    const rDex = getRadius(dex);
    const rInt = getRadius(intVal);

    // 绘制发光青蓝半透明多边形网
    ctx.fillStyle = 'rgba(56, 189, 248, 0.32)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(cx, cy - rCon);        // 体 (上)
    ctx.lineTo(cx + rStr, cy);        // 力 (右)
    ctx.lineTo(cx, cy + rDex);        // 敏 (下)
    ctx.lineTo(cx - rInt, cy);        // 法 (左)
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;

    // 四个顶点晶莹光点
    ctx.fillStyle = '#ffffff';
    [[cx, cy - rCon], [cx + rStr, cy], [cx, cy + rDex], [cx - rInt, cy]].forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 自由潜能点分配专用弹窗 (点击个人面板底部潜能分配时呼出)
  openStatAllocationModal() {
    const p = this.playerData;
    const attrDefs = [
      { key: 'con', name: '体质 (体)', desc: '增加气血上限与气血恢复', value: p.attributes.con },
      { key: 'str', name: '力量 (力)', desc: '提升强力物理攻击伤害', value: p.attributes.str },
      { key: 'int', name: '灵气 (法)', desc: '提升法术攻击与法力上限', value: p.attributes.int },
      { key: 'sta', name: '耐力 (耐)', desc: '提升身躯硬度物理/法术防御', value: p.attributes.sta },
      { key: 'dex', name: '敏捷 (敏)', desc: '提升回合出手速度与身法', value: p.attributes.dex },
    ];

    const modalHtml = `
      <div class="modal-overlay" onclick="this.remove()">
        <div class="modal-window" onclick="event.stopPropagation()" style="max-width:380px;width:92%;">
          <div class="modal-header">
            <span class="modal-title">🌟 修为潜能点分配</span>
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
          </div>
          <div class="modal-body" style="padding:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;background:rgba(20,15,10,0.85);padding:6px 10px;border-radius:4px;border:1px solid #5c4732;">
              <span style="font-size:12px;color:#fef08a;">可用潜能点: <span style="font-size:14px;color:#00ffcc;font-weight:bold;">${p.potentialPoints}</span></span>
              <span style="font-size:10px;color:#aaa;">点击分配强化四极五维</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:5px;">
              ${attrDefs.map(attr => `
                <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.3);padding:6px 8px;border-radius:4px;border:1px solid #3d2c1c;">
                  <div>
                    <div style="font-size:11px;font-weight:bold;color:#ffd700;">${attr.name}: <span style="color:#ffffff;">${attr.value}</span></div>
                    <div style="font-size:9.5px;color:#887766;">${attr.desc}</div>
                  </div>
                  <div>
                    ${p.potentialPoints > 0 ? `
                      <button class="dialogue-opt-btn" onclick="window.App2D.allocateStat('${attr.key}', 1); window.App2D.openStatAllocationModal();" style="padding:2px 8px;font-size:10px;">+1</button>
                      ${p.potentialPoints >= 5 ? `<button class="dialogue-opt-btn" onclick="window.App2D.allocateStat('${attr.key}', 5); window.App2D.openStatAllocationModal();" style="padding:2px 6px;font-size:10px;background:#5c1d18;margin-left:2px;">+5</button>` : ''}
                    ` : `<span style="font-size:10px;color:#666;">已分配</span>`}
                  </div>
                </div>
              `).join('')}
            </div>
            <div style="margin-top:10px;text-align:right;">
              <button class="dialogue-opt-btn" onclick="this.closest('.modal-overlay').remove(); window.App2D.openPlayerProfileModal();" style="width:100%;">返回个人信息面板</button>
            </div>
          </div>
        </div>
      </div>
    `;
    const v = document.body;
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

                const getPetPortrait = (p, size = 32) => {
                  const pName = (p.name || '').toLowerCase();
                  let rId = 'rat';
                  if (pName.includes('龟') || pName.includes('玄武')) rId = 'turtle';
                  else if (pName.includes('蛇')) rId = 'snake';
                  else if (pName.includes('狐')) rId = 'fox';
                  else if (pName.includes('狼')) rId = 'wolf';
                  else if (pName.includes('虎')) rId = 'tiger';
                  else if (pName.includes('熊')) rId = 'bear';
                  else if (pName.includes('蚌')) rId = 'clam';
                  else if (pName.includes('蟹')) rId = 'crab';
                  else if (pName.includes('虾')) rId = 'shrimp';
                  else if (pName.includes('猪')) rId = 'pig';
                  else if (pName.includes('猿') || pName.includes('猴')) rId = 'ape';
                  else if (pName.includes('龙')) rId = 'xiaobailong';
                  return window.Portraits ? window.Portraits.getPortraitSvg(rId, size) : `<span style="font-size:20px;">${p.icon || '🐾'}</span>`;
                };

                return `
                  <div style="background:#1a1109;border:1.5px solid ${isActive ? '#2ed573' : '#4a331c'};border-radius:8px;padding:8px 10px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                      <div style="display:flex;align-items:center;gap:8px;">
                        <div style="width:34px;height:34px;border-radius:50%;border:1.5px solid #ffd700;overflow:hidden;background:#2d1a0d;box-shadow:0 0 8px rgba(255,215,0,0.3);flex-shrink:0;display:flex;align-items:center;justify-content:center;">
                          ${getPetPortrait(pet, 34)}
                        </div>
                        <div>
                          <div style="display:flex;align-items:center;gap:6px;">
                            <span style="font-weight:bold;color:#fef0cd;font-size:12px;">${pet.name} (Lv.${pet.level})</span>
                            <span style="color:${qColor};font-weight:bold;font-size:10px;border:1px solid ${qColor};border-radius:4px;padding:0 4px;">【${pet.qualityName || '普通'}】</span>
                            ${pet.className && pet.className !== '无门派' ? `<span style="color:#d4af37;font-size:10px;">[${pet.className}]</span>` : ''}
                          </div>
                        </div>
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

  // 1. 因缘事件一：天蓬调戏嫦娥，威灵大将出手制伏 (此时玩家随从为空，单挑醉酒天蓬，2~3回合制胜)
  triggerTianpengBattle() {
    if (window.Dialogue) {
      window.Dialogue.close();
    }

    // 确保打天蓬时随从绝对为空，只有玩家一人出战！
    this.companions = [];
    this.pets = [];
    this.activeCombatPets = [];

    const tianpengBoss = {
      id: 'tianpeng_boss',
      templateId: 'tianpeng_marshal',
      appearance: 'tianpeng_marshal',
      modelId: 'tianpeng_marshal',
      name: '天蓬元帅 (醉酒)',
      isMutated: false,
      isBoss: true,
      level: 42,
      hp: 900,       // 威灵大将Lv.50普攻约360~450，恰好2~3回合击败
      maxHp: 900,
      mp: 600,
      maxMp: 600,
      atk: 210,
      def: 60,
      matk: 80,
      mdef: 75,
      spd: 30,
      skills: ['九齿钉耙', '天罡三十六变']
    };

    this.start2DBattle([tianpengBoss], () => {
      this.storyPhase = 'heaven_saved_change';
      setTimeout(() => {
        if (window.Dialogue && window.GAME_DATA.STORY_DIALOGUES.tianpeng_after_battle) {
          window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.tianpeng_after_battle);
        }
      }, 500);
    });
  }

  // 2. 因缘事件三前哨：东胜神洲花果山与守山健将赤毛马猴切磋
  triggerChimaoBattle() {
    if (window.Dialogue) {
      window.Dialogue.close();
    }

    const chimaoBoss = {
      id: 'chimao_boss',
      templateId: 'chimao_mahou',
      appearance: 'chimao_mahou',
      modelId: 'chimao_mahou',
      name: '赤毛马猴 (花果山健将)',
      isMutated: false,
      isBoss: true,
      level: 40,
      hp: 2000,
      maxHp: 2000,
      mp: 500,
      maxMp: 500,
      atk: 180,
      def: 90,
      matk: 70,
      mdef: 70,
      spd: 32,
      skills: ['猴拳连打', '掷石']
    };

    this.start2DBattle([chimaoBoss], () => {
      this.storyPhase = 'heaven_huaguoshan_rescue';
      setTimeout(() => {
        if (window.Dialogue && window.GAME_DATA.STORY_DIALOGUES.chimao_shuilien_after) {
          window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.chimao_shuilien_after);
        }
      }, 500);
    });
  }

  // 3. 因缘事件三：水帘洞大战先锋巨灵神，拯救无辜幼小猴群
  triggerJulingBattle() {
    if (window.Dialogue) {
      window.Dialogue.close();
    }

    const heavenlyBoss = {
      id: 'juling_shen_boss',
      templateId: 'juling_shen',
      appearance: 'juling_shen',
      modelId: 'juling_shen',
      name: '征讨先锋·巨灵神',
      isMutated: false,
      isBoss: true,
      level: 48,
      hp: 3200,
      maxHp: 3200,
      mp: 800,
      maxMp: 800,
      atk: 220,
      def: 130,
      matk: 80,
      mdef: 80,
      spd: 35,
      skills: ['宣花开山劈', '神力狂暴']
    };

    this.start2DBattle([heavenlyBoss], () => {
      this.storyPhase = 'heaven_juling_defeated';
      setTimeout(() => {
        if (window.Dialogue && window.GAME_DATA.STORY_DIALOGUES.juling_defeated_to_huaguoshan) {
          window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.juling_defeated_to_huaguoshan);
        }
      }, 500);
    });
  }

  // 4. 花果山总决战：齐天大圣神威极境，四天将大阵合围 (大圣极强打谁基本都是一下秒杀！)
  triggerWukongHavocBattle() {
    if (window.Dialogue) {
      window.Dialogue.close();
    }

    // 四天将大阵同伴出战 (玩家 + 托塔李天王、哪吒三太子、九天雷公神将)
    this.companions = [
      {
        id: 'companion_litianwang',
        name: '托塔李天王',
        roleId: 'litianwang',
        modelId: 'litianwang',
        level: 50,
        hp: 8000,
        maxHp: 8000,
        mp: 2000,
        maxMp: 2000,
        atk: 280,
        def: 160,
        spd: 36,
        skills: [{ id: 'linglong_ta', name: '玲珑宝塔', costMp: 50 }]
      },
      {
        id: 'companion_nezha',
        name: '哪吒三太子',
        roleId: 'nezha',
        modelId: 'nezha',
        level: 50,
        hp: 7500,
        maxHp: 7500,
        mp: 2500,
        maxMp: 2500,
        atk: 320,
        def: 150,
        spd: 42,
        skills: [{ id: 'sanmei_zhenhuo', name: '三昧真火', costMp: 60 }]
      },
      {
        id: 'companion_leigong',
        name: '九天雷公神将',
        roleId: 'leigong',
        modelId: 'leigong',
        level: 48,
        hp: 6800,
        maxHp: 6800,
        mp: 1800,
        maxMp: 1800,
        atk: 300,
        def: 140,
        spd: 38,
        skills: [{ id: 'leiting_wanjun', name: '五雷轰顶', costMp: 55 }]
      }
    ];

    // 齐天大圣神威极境：实力通天彻地，打谁基本都是一下！
    const wukongBoss = {
      id: 'wukong_havoc_boss',
      templateId: 'sun_wukong',
      name: '齐天大圣·孙悟空 (神威极境)',
      isMutated: false,
      isBoss: true,
      level: 99,
      hp: 999999,
      maxHp: 999999,
      mp: 99999,
      maxMp: 99999,
      atk: 99999,      // 极强神威，打谁基本都是一下秒杀！
      def: 9999,
      matk: 99999,
      mdef: 9999,
      spd: 99,
      skills: ['大闹天宫', '千钧神棒', '法天象地']
    };

    const proceedToYangjian = () => {
      this.storyPhase = 'heaven_yangjian_capture';
      this.companions = []; // 清空临时助战天将
      setTimeout(() => {
        if (window.Dialogue && window.GAME_DATA.STORY_DIALOGUES.yangjian_capture_and_banishment) {
          window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.yangjian_capture_and_banishment);
        }
      }, 600);
    };

    this.start2DBattle([wukongBoss], proceedToYangjian, proceedToYangjian);
  }

  // 兼容旧接口
  triggerWukongSparBattle() {
    this.triggerWukongHavocBattle();
  }

  triggerHeavenBattle() {
    this.triggerJulingBattle();
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
    this.questKills = { mushrooms: 0, trees: 0, rats: 0 };

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
          if (window.Dialogue && window.GAME_DATA.STORY_DIALOGUES.liuboqin_talk) {
            window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.liuboqin_talk);
          }
        }, 2200);
      }, 800);
    }
  }

  // 3. 采摘野生青蘑菇 (生火做饭)
  collectMushroom() {
    if (window.Dialogue) window.Dialogue.close();
    if (!this.questKills) this.questKills = { mushrooms: 0, trees: 0, rats: 0 };
    this.questKills.mushrooms = (this.questKills.mushrooms || 0) + 1;
    this.inventory.addItem('item_fresh_mushroom', 1);
    if (window.Sound) window.Sound.playSuccess();

    // 拾取距离玩家最近的蘑菇实体并永久移除，绝不重复刷新
    let nearestMushroom = null;
    let minDist = 9999;
    for (const n of this.npcs) {
      if (n.id.startsWith('prop_mushroom_')) {
        const d = Math.hypot(n.x - this.playerChar.x, n.y - this.playerChar.y);
        if (d < minDist) {
          minDist = d;
          nearestMushroom = n;
        }
      }
    }
    if (nearestMushroom) {
      if (!this.collectedProps) this.collectedProps = new Set();
      this.collectedProps.add(nearestMushroom.id);
      this.npcs = this.npcs.filter(n => n.id !== nearestMushroom.id);
    }

    if (this.questKills.mushrooms >= 2) {
      this.storyPhase = 'liujiacun_mushrooms_collected';
      window.showGameMessage('🎉 2朵新鲜野生青蘑菇已采齐！快拿去给刘伯钦生火下锅！', 'success', 4500);
      const boqin = this.npcs.find(n => n.id === 'npc_liuboqin');
      if (boqin) boqin.questStatus = 'available';
    } else {
      window.showGameMessage(`🍄 采得野生青蘑菇！(${this.questKills.mushrooms}/2)`, 'info', 3000);
    }
    this.updatePlayerHud();
    this.saveAutoProgress();
  }

  // 4. 刘伯钦资助
  grantStarterItems() {
    this.inventory.addItem('eq_wp_wood', 1);
    this.inventory.addItem('eq_bt_straw', 1);
    this.inventory.addItem('jinchuang_yao', 5);
    this.playerData.equipItem('weapon', { itemId: 'eq_wp_wood', star: 0 });
    window.Sound.playSuccess();
    this.updatePlayerHud();
    window.showGameMessage('【获得刘伯钦资助】已佩戴【青铜短剑】与【行路草鞋】，获得金创药*5！', 'success', 3500);
  }

  // 5. 触发猛兽与恶鬼战斗 (支持砍柴伐树与刘家村除害计数)
  triggerMonsterBattle(monsterChar) {
    const md = monsterChar.monsterData || {};
    const mob = {
      id: monsterChar.id,
      name: monsterChar.name,
      modelId: monsterChar.appearance || md.appearance || monsterChar.id,
      isMutated: false,
      isBoss: false,
      level: monsterChar.level || md.level || 3,
      hp: monsterChar.maxHp || md.hp || 150,
      maxHp: monsterChar.maxHp || md.maxHp || 150,
      mp: md.mp || 50,
      maxMp: md.maxMp || 50,
      atk: monsterChar.atk || md.atk || 32,
      def: monsterChar.def || md.def || 16,
      matk: 10,
      mdef: 10,
      spd: monsterChar.spd || md.spd || 20,
      skills: md.skills || monsterChar.skills || ['连击']
    };

    this.start2DBattle([mob], () => {
      this.monsters = this.monsters.filter(m => m.id !== monsterChar.id);
      if (monsterChar.isGhostTarget) {
        this.ghostQuest.completed = true;
        window.Sound.playCrit();
        window.showGameMessage(`🎉【伏魔告捷】成功诛灭作祟恶鬼【${this.ghostQuest.targetName}】！速回长安城向钟馗天师复命领赏！`, 'success', 5000);
      }

      // 五行山砍柴伐树任务推进
      if (monsterChar.id.includes('tree') || (monsterChar.monsterData && monsterChar.monsterData.appearance === 'tree') || monsterChar.name.includes('枯树精')) {
        if (this.storyPhase === 'liujiacun_go_cut_wood' || this.storyPhase === 'liujiacun_wood_gathering') {
          this.storyPhase = 'liujiacun_wood_gathering';
          if (!this.questKills) this.questKills = { mushrooms: 0, trees: 0, rats: 0 };
          this.questKills.trees = (this.questKills.trees || 0) + 1;
          this.inventory.addItem('item_dry_wood', 1);
          if (this.questKills.trees >= 4) {
            this.storyPhase = 'liujiacun_wood_collected';
            if (window.Sound) window.Sound.playCrit();
            window.showGameMessage('🎉 4捆坚韧柴木已收集齐全！请回刘家村向刘伯钦交差！', 'success', 4500);
          } else {
            window.showGameMessage(`🪵 砍倒枯树精！获得坚韧柴木 (${this.questKills.trees}/4)`, 'info', 3000);
          }
          this.refreshMapNpcs();
        }
      }

      // 刘家村消灭硕鼠任务推进
      if (monsterChar.id.includes('rat') || (monsterChar.monsterData && monsterChar.monsterData.appearance === 'giant_rat') || monsterChar.name.includes('硕鼠')) {
        if (this.storyPhase === 'liujiacun_rat_hunting') {
          if (!this.questKills) this.questKills = { mushrooms: 0, trees: 0, rats: 0 };
          this.questKills.rats = (this.questKills.rats || 0) + 1;
          if (this.questKills.rats >= 4) {
            this.storyPhase = 'liujiacun_rats_cleared';
            if (window.Sound) window.Sound.playCrit();
            window.showGameMessage('🎉 4只偷粮硕鼠已全部消灭！村中粮仓平安，快向刘伯钦交差！', 'success', 4500);
          } else {
            window.showGameMessage(`🐀 击败偷粮硕鼠 (${this.questKills.rats}/4)`, 'info', 3000);
          }
          this.refreshMapNpcs();
        }
      }

      // 陈塘关清剿 4 名作恶混混主线推进
      if (monsterChar.name.includes('混混') || monsterChar.id.includes('hooligan') || (monsterChar.monsterData && monsterChar.monsterData.appearance === 'hooligan')) {
        if (this.storyPhase === 'chentang_defeat_hooligans') {
          if (!this.questKills) this.questKills = { mushrooms: 0, trees: 0, rats: 0, chentangHooligans: 0 };
          this.questKills.chentangHooligans = (this.questKills.chentangHooligans || 0) + 1;
          if (this.questKills.chentangHooligans >= 4) {
            this.storyPhase = 'chentang_hooligans_done';
            if (window.Sound) window.Sound.playCrit();
            window.showGameMessage('🎉 4名作恶混混已全部制伏！陈塘关街市初定，快回总兵府向李靖复命！', 'success', 4500);
          } else {
            window.showGameMessage(`🥋 制伏街头作恶混混 (${this.questKills.chentangHooligans}/4)`, 'info', 3000);
          }
          this.refreshMapNpcs();
        }
      }
    });
  }

  // 5.5 陈塘关混混头目 1 打 3 决战 (头目 + 两名小兵随从)
  triggerHooliganBossBattle() {
    if (window.Dialogue) {
      window.Dialogue.close();
    }
    const boss = {
      id: 'hooligan_boss',
      templateId: 'hooligan',
      appearance: 'hooligan_boss',
      modelId: 'hooligan_boss',
      name: '混混头目·雷震彪',
      isMutated: false,
      isBoss: true,
      level: 16,
      hp: 1500,
      maxHp: 1500,
      mp: 300,
      maxMp: 300,
      atk: 105,
      def: 48,
      matk: 20,
      mdef: 20,
      spd: 26,
      skills: ['破甲拳', '连击']
    };
    const minion1 = {
      id: 'hooligan_minion_1',
      templateId: 'hooligan',
      appearance: 'hooligan',
      modelId: 'hooligan',
      name: '地痞随从·恶犬',
      isMutated: false,
      isBoss: false,
      level: 12,
      hp: 500,
      maxHp: 500,
      mp: 100,
      maxMp: 100,
      atk: 60,
      def: 28,
      matk: 10,
      mdef: 10,
      spd: 22,
      skills: ['普通攻击']
    };
    const minion2 = {
      id: 'hooligan_minion_2',
      templateId: 'hooligan',
      appearance: 'hooligan',
      modelId: 'hooligan',
      name: '地痞随从·飞蝗',
      isMutated: false,
      isBoss: false,
      level: 12,
      hp: 500,
      maxHp: 500,
      mp: 100,
      maxMp: 100,
      atk: 60,
      def: 28,
      matk: 10,
      mdef: 10,
      spd: 22,
      skills: ['普通攻击']
    };

    this.start2DBattle([boss, minion1, minion2], () => {
      this.storyPhase = 'chentang_boss_defeated';
      if (window.Sound) window.Sound.playCrit();
      window.showGameMessage('🎉 混混头目携随从惨败求饶，落荒而逃！速回陈塘总兵帅府向李靖复命领赏！', 'success', 5000);
      this.refreshMapNpcs();
    });
  }

  // 6. 东海之滨：大战巡海夜叉李艮
  triggerYechaBattle() {
    if (window.Dialogue) {
      window.Dialogue.close();
    }
    const yechaBoss = {
      id: 'yecha_boss',
      templateId: 'yecha',
      appearance: 'yecha',
      modelId: 'yecha',
      name: '巡海夜叉·李艮',
      isMutated: false,
      isBoss: true,
      level: 12,
      hp: 1200,
      maxHp: 1200,
      mp: 400,
      maxMp: 400,
      atk: 95,
      def: 55,
      matk: 40,
      mdef: 40,
      spd: 28,
      skills: ['巨浪劈', '托天叉']
    };
    this.start2DBattle([yechaBoss], () => {
      this.storyPhase = 'donghai_dragon_arrived';
      setTimeout(() => {
        if (window.Dialogue && window.GAME_DATA.STORY_DIALOGUES.donghai_dragon_apology) {
          window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.donghai_dragon_apology);
        }
      }, 500);
    });
  }

  // 7. 东海龙王宝库：赠送整套初级龙神战装 (武器、铠甲、头盔、靴子、项链)
  grantLonggongArmorSet() {
    if (window.Dialogue) {
      window.Dialogue.close();
    }
    const setPieces = [
      'longgong_weapon',
      'longgong_armor',
      'longgong_helmet',
      'longgong_boots',
      'longgong_necklace'
    ];
    setPieces.forEach(itemId => {
      this.inventory.addItem(itemId, 1);
      const itemData = window.GAME_DATA.ITEMS[itemId];
      if (itemData && itemData.slot) {
        this.playerData.equipItem(itemData.slot, { itemId, star: 0, sockets: [null, null, null] });
      }
    });
    this.playerData.recalculateStats(true);
    this.playerData.hp = this.playerData.maxHp;
    this.playerData.mp = this.playerData.maxMp;
    this.playerData.gainExp(800);
    if (window.Sound) window.Sound.playCrit();
    this.updatePlayerHud();
    window.showGameMessage('💎【龙神神装全套】已装备【覆海点钢枪、龙鳞轻钢甲、碧水定海盔、踏浪穿云靴、龙珠凝霜佩】！战力与气血大幅飞跃！', 'success', 5000);

    setTimeout(() => {
      this.storyPhase = 'chentang_guanyin_revelation';
      this.loadMap('chentangguan', { x: 576, y: 384 });
      window.showGameMessage('☁️ 返回陈塘关！天际祥云缭绕，仙乐阵阵！', 'info', 3500);
      setTimeout(() => {
        if (window.Dialogue && window.GAME_DATA.STORY_DIALOGUES.chentang_guanyin_revelation) {
          window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.chentang_guanyin_revelation);
        }
      }, 600);
    }, 1200);
  }

  // 8. 观音赐宝 (五行山前)
  grantGuanyinGift() {
    this.inventory.addItem('eq_nk_dinghun', 1);
    this.inventory.addItem('feixing_fu', 5);
    this.inventory.addItem('jiuzhuan_dan', 3);
    this.storyPhase = 'wuxingshan_ready';
    window.Sound.playSuccess();
    this.updatePlayerHud();
    window.showGameMessage('【菩萨赐宝】获得【九转定魂珠】、飞行神符*5、九转还魂丹*3！前往五行山解救大圣！', 'success', 4000);
  }

  // 6. 五行山金符揭下 (防重入、即时瓦片置换、彻底杜绝死循环)
  releaseWukong() {
    this.isSealTriggered = true;
    this.isSealTriggering = false;
    window.Sound.playCrit();
    const mapData = window.GAME_DATA.MAPS_2D['wuxingshan'];
    if (mapData && mapData.tiles && mapData.tiles[3]) {
      mapData.tiles[3][12] = 'mountain_rock';
    }

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
    this.isSealTriggered = true;
    this.isSealTriggering = false;
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
    if (this.storyPhase === 'wuxing_freed') this.storyPhase = 'yingchou_cleared';
    this.mountSystem.addMount('bailongma', '西海玉龙·白龙马');
    this.mountSystem.isRiding = true;
    this.playerChar.isRiding = true;
    this.playerData.recalculateStats(true);
    window.Sound.playLevelUp();
    this.updatePlayerHud();
    this.saveAutoProgress();
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
    if (this.storyPhase === 'yingchou_cleared') this.storyPhase = 'gaolao_cleared';
    if (this.companions.some(p => p.id === 'companion_bajie')) return;
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
    this.saveAutoProgress();
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
      this.storyPhase = 'huangfeng_cleared';
      this.saveAutoProgress();
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
    if (this.storyPhase === 'huangfeng_cleared') this.storyPhase = 'liusha_cleared';
    if (this.companions.some(p => p.id === 'companion_shaseng')) return;
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
    this.saveAutoProgress();
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
    if (this.storyPhase === 'wuzhuang_cleared' || this.storyPhase === 'baihu_first_cleared' ||
        this.storyPhase === 'baihu_second_cleared' || this.storyPhase === 'baihu_cleared') return;
    this.storyPhase = 'wuzhuang_cleared';
    this.npcs = this.npcs.filter(n => n.id !== 'npc_zhenyuanzi');
    this.playerData.exp += 60000;
    this.playerData.silver += 50000;
    this.playerData.recalculateStats(false);
    window.Sound.playLevelUp();
    this.updatePlayerHud();
    this.saveAutoProgress();
    window.showGameMessage('🎉 获赠万寿山【草还丹人参果】仙果！修为经验暴增60000，境界大幅突破！', 'success', 4500);
  }

  advanceBaoxiangStory(nextPhase, targetNpcId) {
    if (!['baoxiang_seek_princess', 'baoxiang_boss_ready'].includes(nextPhase)) return;
    const allowed = nextPhase === 'baoxiang_seek_princess' ? this.storyPhase === 'baihu_cleared' :
      this.storyPhase === 'baoxiang_seek_princess';
    if (!allowed) return;
    this.storyPhase = nextPhase;
    const target = this.npcs.find(n => n.id === targetNpcId);
    if (target) target.questStatus = 'available';
    this.interactedNpcSet.delete(targetNpcId);
    this.saveAutoProgress();
  }

  // === 第十章：白虎岭白骨夫人战 ===
  triggerBaigujingBattle() {
    if (window.Dialogue) window.Dialogue.close();
    if (this.storyPhase === 'baihu_cleared' || this.storyPhase === 'baoxiang_cleared') return;
    const stage = this.storyPhase === 'baihu_first_cleared' ? 2 :
      this.storyPhase === 'baihu_second_cleared' ? 3 : 1;
    const boss = {
      id: 'boss_baigujing',
      name: stage === 1 ? '白骨精·村姑幻身' : stage === 2 ? '白骨精·老妪幻身' : '白骨夫人·幽冥真身',
      appearance: 'baigu_jing',
      modelId: 'baigu_jing',
      level: 42,
      hp: stage === 1 ? 6800 : stage === 2 ? 9600 : 15000,
      maxHp: stage === 1 ? 6800 : stage === 2 ? 9600 : 15000,
      mp: 3500,
      maxMp: 3500,
      atk: 250,
      def: 130,
      matk: 260,
      mdef: 140,
      spd: 45,
      skills: stage === 1 ? ['隐身咒', '连击'] :
        stage === 2 ? ['隐身咒', '三昧真火', '连击'] : ['隐身咒', '三昧真火', '连击', '白骨噬魂']
    };
    this.start2DBattle([boss], () => {
      if (stage < 3) {
        this.storyPhase = stage === 1 ? 'baihu_first_cleared' : 'baihu_second_cleared';
        const guide = this.npcs.find(n => n.id === 'npc_baigujing');
        if (guide) {
          guide.appearance = stage === 1 ? 'tea_granny' : 'tudi_gong';
          guide.name = stage === 1 ? '寻女的老妪' : '拄杖的老翁';
          guide.questStatus = 'available';
        }
        this.interactedNpcSet.delete('npc_baigujing');
        this.saveAutoProgress();
        setTimeout(() => window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES[
          stage === 1 ? 'baigujing_first_aftermath' : 'baigujing_second_aftermath'
        ]), 500);
        return;
      }
      this.npcs = this.npcs.filter(n => n.id !== 'npc_baigujing');
      this.storyPhase = 'baihu_cleared';
      this.playerData.gainExp(45000);
      this.playerData.silver += 8000;
      if (this.inventory) {
        this.inventory.addItem('eq_ring_baigu', 1);
        this.inventory.addItem('jin_liu_lu', 2);
      }
      this.updatePlayerHud();
      this.saveAutoProgress();
      window.Sound.playLevelUp();
      setTimeout(() => window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.baigujing_final_aftermath), 500);
      window.showGameMessage('🎉【三打白骨精】幽冥真身已破！获赠【千年白骨幽魂戒】与【金柳露】*2！', 'success', 5000);
    });
  }

  // === 第十一章：宝象国波月洞奎木狼黄袍怪战 ===
  triggerHuangpaoBattle() {
    if (window.Dialogue) window.Dialogue.close();
    const boss = {
      id: 'boss_huangpao',
      name: '黄袍怪 (奎木狼)',
      appearance: 'huangpao_guai',
      modelId: 'huangpao_guai',
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
      this.saveAutoProgress();
      window.Sound.playLevelUp();
      setTimeout(() => window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.huangpao_aftermath), 500);
      window.showGameMessage('🎉【大破波月洞】降伏奎木狼还朝！救出百花羞公主，获赠神兵【冷月追魂宝刀】与【高级必杀兽诀】！', 'success', 5000);
    });
  }

  // 兼容别名
  startCombat(nameOrEnemies, maybeEnemies, onVictoryCallback) {
    let enemies = [];
    let cb = onVictoryCallback;
    if (Array.isArray(nameOrEnemies)) {
      enemies = nameOrEnemies;
      cb = maybeEnemies;
    } else if (Array.isArray(maybeEnemies)) {
      enemies = maybeEnemies;
    }
    return this.start2DBattle(enemies, cb);
  }

  // 战斗桥接与全屏渲染 (彻底消除卡死，国风立绘，战术时序与动作打击)
  // 战斗桥接与全屏渲染 (经典汉风三栏布局：左敌方竖排，中操作竖排，右我方四位竖排)
  start2DBattle(enemies, onVictoryCallback, onDefeatCallback = null) {
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
    this.battleDefeatCallback = onDefeatCallback;

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

    const getBattleRoleId = (unit) => {
      if (!unit) return 'shaoxia';
      const name = unit.name || '';
      if (unit.isPlayer) {
        return (this.playerData && this.playerData.appearance === 'heaven_general') ? 'heaven_general' : 'shaoxia';
      }
      if (name.includes('大圣') || name.includes('悟空')) return 'sun_wukong';
      if (name.includes('八戒') || name.includes('猪刚鬣')) return 'zhu_bajie';
      if (name.includes('沙僧') || name.includes('悟净')) return 'sha_wujing';
      if (name.includes('龙马') || name.includes('小白龙') || name.includes('敖烈')) return 'xiaobailong';
      if (name.includes('白骨') || name.includes('尸魔')) return 'baigu_jing';
      if (name.includes('黄袍') || name.includes('奎木狼')) return 'huangpao_guai';
      if (name.includes('虎先锋')) return 'hu_xianfeng';
      if (name.includes('黄风')) return 'huangfeng_guai';
      if (name.includes('狼') || name.includes('郊狼')) return 'wolf';
      if (name.includes('混混') || name.includes('恶霸') || name.includes('盗') || name.includes('贼')) return 'hunhun';
      if (name.includes('蚌')) return 'clam';
      if (name.includes('蟹')) return 'crab';
      if (name.includes('虾')) return 'shrimp';
      if (name.includes('熊')) return 'bear';
      if (name.includes('蛇')) return 'snake';
      if (name.includes('狐')) return 'fox';
      if (name.includes('鼠')) return 'rat';
      if (name.includes('猪')) return 'pig';
      if (name.includes('天兵') || name.includes('天将') || name.includes('神将')) return 'heaven_general';
      return 'shaoxia';
    };

    const targetRoleId = getBattleRoleId(curTarget);
    const targetPortraitSvg = window.Portraits ? window.Portraits.getPortraitSvg(targetRoleId, 22) : '🎯';
    const allyRoleId = getBattleRoleId(curAlly);
    const allyPortraitSvg = window.Portraits ? window.Portraits.getPortraitSvg(allyRoleId, 22) : '⚡';
    const playerPortraitSvg = window.Portraits ? window.Portraits.getPortraitSvg(getBattleRoleId({ isPlayer: true }), 22) : '👤';

    layer.innerHTML = `
      <div class="battle-container" id="battle-main-container" style="width:100%;height:100%;background:#0a0c09;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden;box-shadow:inset 0 0 35px #000;">

        <!-- 1. 顶部双龙金匾与战术信息横幅 (复刻图3标准并接入精致头像) -->
        <div class="battle-dragon-header-bar">
          <div class="dragon-plaque-container">
            <span class="dragon-crest-icon">🐉</span>
            <div class="dragon-plaque-text">战 斗</div>
            <span class="dragon-crest-icon" style="transform: scaleX(-1);">🐉</span>
          </div>

          <div class="battle-banner-pills-row">
            <div class="battle-banner-pill" title="当前攻击目标" style="display:inline-flex;align-items:center;gap:5px;">
              <span style="display:inline-flex;width:20px;height:20px;border-radius:50%;border:1px solid #ff4757;overflow:hidden;vertical-align:middle;flex-shrink:0;">
                ${targetPortraitSvg}
              </span>
              <span>🎯 目标:</span>
              <span style="color:#ff6b81;font-weight:bold;">${curTarget ? `[Lv.${curTarget.level || 1}] ${curTarget.name}` : '未指定'}</span>
            </div>

            <div class="battle-banner-pill acting-pill" title="当前指令角色与出招倒计时" style="display:inline-flex;align-items:center;gap:5px;">
              <span style="display:inline-flex;width:20px;height:20px;border-radius:50%;border:1px solid #ffd700;overflow:hidden;vertical-align:middle;flex-shrink:0;">
                ${allyPortraitSvg}
              </span>
              <span>⚡ ${curAlly ? `[Lv.${curAlly.level || 1}] ${curAlly.name}` : '侠士'}-出招</span>
              <span id="battle-acting-countdown-text" style="color:#ffd700;font-weight:900;">(${this.battleCountdown || 30})</span>
            </div>

            <div class="battle-banner-pill" title="指挥玩家本尊" style="display:inline-flex;align-items:center;gap:5px;">
              <span style="display:inline-flex;width:20px;height:20px;border-radius:50%;border:1px solid #2ed573;overflow:hidden;vertical-align:middle;flex-shrink:0;">
                ${playerPortraitSvg}
              </span>
              <span>${this.playerData ? `[Lv.${this.playerData.level || 1}] ${this.playerData.name}` : '侠士'}</span>
            </div>
          </div>
        </div>

        <!-- 战术时序速度轴 (附带各单位神级微缩头像) -->
        <div class="battle-timeline-bar" style="margin: 3px 10px 1px 10px; padding: 2px 8px; font-size: 10px; border-radius: 4px; display:flex; align-items:center; gap:6px; overflow-x:auto;">
          <span class="timeline-title" style="font-size:10px;flex-shrink:0;">📜 行动序:</span>
          ${turnQueue.map(item => {
            const rId = getBattleRoleId(item);
            const pSvg = window.Portraits ? window.Portraits.getPortraitSvg(rId, 16) : '';
            return `
              <div class="timeline-badge ${item.side === 'ally' ? 'timeline-ally' : 'timeline-enemy'}" style="padding: 1px 6px; font-size: 10px; display:inline-flex; align-items:center; gap:4px; flex-shrink:0;">
                <span style="display:inline-block;width:14px;height:14px;border-radius:50%;overflow:hidden;border:1px solid ${item.side === 'ally' ? '#ffd700' : '#ff4757'};">
                  ${pSvg}
                </span>
                <span class="timeline-num">#${item.turnOrder}</span>
                <span class="timeline-name">[Lv.${item.level || 1}] ${item.name}</span>
              </div>
            `;
          }).join('')}
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

  // 绘制战场Canvas全景：草地绿茵、动态自适应居中站位、极速冲锋滑步与大号令旗血条
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

    // 2. 左侧：敌方阵容 (动态自适应居中排列：1人居中50%，2人居中38%与64%)
    const enemies = this.currentBattle.enemies;
    const aliveEnemies = enemies.filter(e => e.hp > 0);
    const enemyX = Math.floor(width * 0.18);

    aliveEnemies.forEach((e, idx) => {
      let ey;
      if (aliveEnemies.length === 1) {
        ey = Math.floor(height * 0.50); // 1人正中央
      } else if (aliveEnemies.length === 2) {
        ey = Math.floor(height * (idx === 0 ? 0.38 : 0.64)); // 2人居中
      } else if (aliveEnemies.length === 3) {
        ey = Math.floor(height * (0.28 + idx * 0.22));
      } else {
        ey = Math.floor(height * (0.18 + idx * 0.20));
      }

      e._baseBattlePos = { x: enemyX, y: ey };
      const dX = e._dashOffset ? e._dashOffset.x : 0;
      const dY = e._dashOffset ? e._dashOffset.y : 0;
      const sX = e._shakeOffset ? e._shakeOffset.x : 0;
      const sY = e._shakeOffset ? e._shakeOffset.y : 0;
      const renderX = enemyX + dX + sX;
      const renderY = ey + dY + sY;
      e._battlePos = { x: renderX, y: renderY };

      const isTargeted = (this.selectedTargetIndex === e.enemyIndex || (this.selectedTargetIndex === idx));

      // 若被锁定为攻击目标，脚底绘制赤金锁定法阵光环
      if (isTargeted) {
        ctx.save();
        const pulse = Math.sin(animTimer * 0.25) * 2.5;
        ctx.strokeStyle = '#ff4757';
        ctx.lineWidth = 2.4;
        ctx.shadowColor = '#ff4757';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(renderX, renderY + 14, 25 + pulse, 10 + pulse * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(renderX, renderY + 14, 16, 7, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 敌方全身模型派发：优先继承野外实体的原生 appearance / modelId / templateId，绝不粗暴篡改！
      let mId = e.appearance || e.modelId || e.templateId || '';

      // 仅在未配置外观或外观模糊时，才做精确推断，且严格区分齐天大圣与普通猴精、天蓬大将与凡间猪八戒、巨灵神与天兵
      if (!mId || mId === 'default' || mId === 'undefined') {
        const n = e.name || '';
        if (n.includes('混混') || n.includes('恶霸') || n.includes('地痞')) mId = 'hooligan';
        else if (n.includes('蚌')) mId = 'clam';
        else if (n.includes('蟹')) mId = 'crab';
        else if (n.includes('虾')) mId = 'shrimp';
        else if (n.includes('狼') || n.includes('huangpao')) mId = 'wild_wolf';
        else if (n.includes('虎') || n.includes('huxianfeng')) mId = 'hu_xianfeng';
        else if (n.includes('蛇')) mId = 'pet_snake';
        else if (n.includes('骨') || n.includes('骷髅')) mId = 'baigu_jing';
        else if (n.includes('天蓬') && !n.includes('八戒') && !n.includes('猪')) mId = 'tianpeng_marshal';
        else if (n.includes('巨灵神')) mId = 'juling_shen';
        else if (n.includes('赤毛') || n.includes('马猴')) mId = 'chimao_mahou';
        else if (n.includes('小石猴') || n.includes('小猴') || n.includes('通臂')) mId = 'stone_monkey';
        else if (n.includes('悟空') || n.includes('齐天大圣') || n.includes('美猴王')) mId = 'sun_wukong';
        else if (n.includes('八戒') || n.includes('猪刚鬣')) mId = 'zhu_bajie';
        else if (n.includes('夜叉')) mId = 'yecha';
        else if (n.includes('树精') || n.includes('枯树')) mId = 'tree';
        else if (n.includes('狐') || n.includes('灵狐') || n.includes('野狐')) mId = 'fox';
        else if (n.includes('鼠')) mId = 'giant_rat';
        else if (n.includes('龟')) mId = 'turtle';
        else if (n.includes('沙') || n.includes('卷帘')) mId = 'sha_wujing';
        else if (n.includes('小白龙') || n.includes('敖烈')) mId = 'xiaobailong';
        else if (n.includes('龙') || n.includes('龙王')) mId = 'longwang';
        else if (n.includes('熊')) mId = 'bear';
        else if (n.includes('牛魔王')) mId = 'bull_demon';
        else if (n.includes('铁扇')) mId = 'tieshan';
        else if (n.includes('天神') || n.includes('天将') || n.includes('天兵')) mId = 'heaven_general';
        else mId = (window.Character ? window.Character.inferMonsterType(n, e.id) : 'hooligan');
      }

      if (window.CharacterRenderer) {
        window.CharacterRenderer.drawModel(ctx, renderX, renderY, mId, {
          direction: 'right',
          scale: 1.35,
          animTimer: animTimer + idx,
          isActing: false
        });
      }

      // 头顶醒目姓名 (粗白字 + 纯黑描边，附带等级显示)
      const enemyDisplayName = `[Lv.${e.level || 1}] ${e.name}`;
      ctx.save();
      ctx.font = 'bold 13px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;
      ctx.lineJoin = 'round';
      ctx.strokeText(enemyDisplayName, renderX, renderY - 30);
      ctx.fillStyle = isTargeted ? '#ff4757' : (e.isBoss ? '#ffd700' : '#ffffff');
      ctx.fillText(enemyDisplayName, renderX, renderY - 30);

      // 头顶锁定小红箭头指示
      if (isTargeted) {
        const arrowY = renderY - 48 + Math.sin(Date.now() / 150) * 3.5;
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.moveTo(renderX, arrowY);
        ctx.lineTo(renderX - 6, arrowY - 9);
        ctx.lineTo(renderX + 6, arrowY - 9);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // 脚底大号立体水晶生命条 (加宽到 68px, 高度 9px, 彻底清晰明了)
      const barW = 68;
      const barH = 9;
      const barX = renderX - barW / 2;
      const barY = renderY + 22;
      const hpPct = Math.max(0, Math.min(1, e.hp / e.maxHp));

      // 底槽
      ctx.fillStyle = 'rgba(10, 8, 6, 0.9)';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 2);
      ctx.fill();
      ctx.strokeStyle = '#5a3c22';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 鲜红生命充填 (渐变色)
      if (hpPct > 0) {
        const hpGrad = ctx.createLinearGradient(barX, barY, barX, barY + barH);
        hpGrad.addColorStop(0, '#f87171');
        hpGrad.addColorStop(0.5, '#ef4444');
        hpGrad.addColorStop(1, '#991b1b');
        ctx.fillStyle = hpGrad;
        ctx.beginPath();
        ctx.roundRect(barX + 0.5, barY + 0.5, (barW - 1) * hpPct, barH - 1, 1.5);
        ctx.fill();
        // 上层微光高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(barX + 1, barY + 1, (barW - 2) * hpPct, 2);
      }

      // 醒目大号速度时序令旗 (直径 22px 发光令旗勋章，bold 12px 大字清晰展示出招顺位)
      if (e.turnOrder) {
        const badgeX = barX - 16;
        const badgeY = barY + 4;
        ctx.save();
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 6;
        ctx.stroke();

        ctx.font = 'bold 12px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText('#' + e.turnOrder, badgeX, badgeY + 0.5);
        ctx.restore();
      }
      ctx.restore();
    });

    // 3. 右侧：我方阵容 (动态自适应居中：1人居中50%，2人居中38%与64%，彻底消除任何锁槽位)
    const aliveAllies = this.currentBattle.allies.filter(a => a.hp > 0);
    const allyX = Math.floor(width * 0.82);

    aliveAllies.forEach((ally, idx) => {
      let ay;
      if (aliveAllies.length === 1) {
        ay = Math.floor(height * 0.50); // 1个人直接站右侧正中央！
      } else if (aliveAllies.length === 2) {
        ay = Math.floor(height * (idx === 0 ? 0.38 : 0.64)); // 2个人站2、3位置中央！
      } else if (aliveAllies.length === 3) {
        ay = Math.floor(height * (0.28 + idx * 0.22));
      } else {
        ay = Math.floor(height * (0.18 + idx * 0.20));
      }

      ally._baseBattlePos = { x: allyX, y: ay };
      const dX = ally._dashOffset ? ally._dashOffset.x : 0;
      const dY = ally._dashOffset ? ally._dashOffset.y : 0;
      const sX = ally._shakeOffset ? ally._shakeOffset.x : 0;
      const sY = ally._shakeOffset ? ally._shakeOffset.y : 0;
      const renderX = allyX + dX + sX;
      const renderY = ay + dY + sY;
      ally._battlePos = { x: renderX, y: renderY };

      const isPlayerSlot = ally.isPlayer;
      const isActing = (this.selectedAllyId === ally.id);

      // 若为当前出招者：先在底层绘制通天神圣金黄光柱！(复刻图3震撼效果)
      if (isActing && window.CharacterRenderer) {
        window.CharacterRenderer.drawActingLightPillar(ctx, renderX, renderY, 62, 110);
      }

      // 确定角色模型 (国风大侠、熊猫道长、白龙马神将、大圣等)
      let mId = ally.modelId || ally.appearance || '';
      if (isPlayerSlot) {
        if (this.playerChar && this.playerChar.appearance) {
          mId = this.playerChar.appearance;
        } else if (ally.name.includes('熊猫') || (this.playerData && this.playerData.name.includes('熊猫'))) {
          mId = 'panda_hero';
        } else {
          mId = 'martial_hero';
        }
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
        window.CharacterRenderer.drawModel(ctx, renderX, renderY, mId, {
          direction: 'left',
          scale: 1.35,
          animTimer: animTimer + 2,
          isActing: isActing
        });
      }

      // 头顶清晰姓名 (加粗白色 + 黑色描边，附带等级显示)
      const allyDisplayName = `[Lv.${ally.level || 1}] ${ally.name}`;
      ctx.save();
      ctx.font = 'bold 12.5px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;
      ctx.lineJoin = 'round';
      ctx.strokeText(allyDisplayName, renderX, renderY - 28);
      ctx.fillStyle = isActing ? '#fffa65' : (isPlayerSlot ? '#ffeaa7' : '#f5cd79');
      ctx.fillText(allyDisplayName, renderX, renderY - 28);

      // 脚底大号立体水晶生命/精力槽 (宽度68px, 高度9px)
      const barW = 68;
      const barH = 9;
      const barX = renderX - barW / 2;
      const barY = renderY + 20;
      const hpPct = Math.max(0, Math.min(1, ally.hp / ally.maxHp));

      // 生命底槽
      ctx.fillStyle = 'rgba(10, 8, 6, 0.9)';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 2);
      ctx.fill();
      ctx.strokeStyle = '#5a3c22';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 翠绿生命充填 (高质感水晶条)
      if (hpPct > 0) {
        const hpGrad = ctx.createLinearGradient(barX, barY, barX, barY + barH);
        hpGrad.addColorStop(0, '#4ade80');
        hpGrad.addColorStop(0.5, '#22c55e');
        hpGrad.addColorStop(1, '#15803d');
        ctx.fillStyle = hpGrad;
        ctx.beginPath();
        ctx.roundRect(barX + 0.5, barY + 0.5, (barW - 1) * hpPct, barH - 1, 1.5);
        ctx.fill();
        // 上层微光高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(barX + 1, barY + 1, (barW - 2) * hpPct, 2);
      }

      // 精力条 (高度 4.5px)
      if (ally.maxMp) {
        const mpPct = Math.max(0, Math.min(1, ally.mp / ally.maxMp));
        const mpY = barY + 10.5;
        ctx.fillStyle = 'rgba(10, 8, 6, 0.9)';
        ctx.beginPath();
        ctx.roundRect(barX, mpY, barW, 4.5, 1);
        ctx.fill();
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        if (mpPct > 0) {
          const mpGrad = ctx.createLinearGradient(barX, mpY, barX, mpY + 4.5);
          mpGrad.addColorStop(0, '#38bdf8');
          mpGrad.addColorStop(1, '#0284c7');
          ctx.fillStyle = mpGrad;
          ctx.fillRect(barX + 0.5, mpY + 0.5, (barW - 1) * mpPct, 3.5);
        }
      }

      // 醒目大号速度时序令旗 (直径 22px 发光令旗勋章，bold 12px 大字)
      if (ally.turnOrder) {
        const badgeX = barX + barW + 16;
        const badgeY = barY + 4;
        ctx.save();
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 6;
        ctx.stroke();

        ctx.font = 'bold 12px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText('#' + ally.turnOrder, badgeX, badgeY + 0.5);
        ctx.restore();
      }

      ctx.restore();
    });

    // 4. 绘制上层法术技能与刀光特效队列 (烈火炎柱、天雷霹雳、玄冰突刺、金刚护盾等)
    this.renderBattleCanvasEffects(ctx);
  }

  // 渲染正在生效的战斗法术特效
  renderBattleCanvasEffects(ctx) {
    if (!this.activeBattleEffects || this.activeBattleEffects.length === 0) return;
    const now = Date.now();

    this.activeBattleEffects = this.activeBattleEffects.filter(fx => {
      const elapsed = now - fx.startTime;
      if (elapsed > fx.duration) return false;
      const progress = elapsed / fx.duration;

      ctx.save();
      const x = fx.x;
      const y = fx.y;

      // 特效1：普通攻击·银白撕裂剑光 (半月刀光与金色碎星)
      if (fx.type === 'slash') {
        const slashAngle = -Math.PI / 4 + progress * Math.PI / 2;
        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress})`;
        ctx.lineWidth = 4.5 * (1 - progress);
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(x, y, 32 * (0.6 + progress * 0.5), slashAngle - 0.7, slashAngle + 0.7);
        ctx.stroke();

        // 金色火星迸溅
        for (let i = 0; i < 4; i++) {
          const spAngle = (i * Math.PI) / 2 + progress * 2;
          const spDist = 18 + progress * 24;
          ctx.fillStyle = '#fde047';
          ctx.fillRect(x + Math.cos(spAngle) * spDist, y + Math.sin(spAngle) * spDist, 3, 3);
        }
      }
      // 特效2：烈火咒 / 三昧真火 (冲天爆裂火焰光柱与火凰赤芒)
      else if (fx.type === 'fire') {
        const pillarW = 48 * (1 - progress * 0.3);
        const pillarH = 110 * (0.4 + progress * 0.6);
        const fGrad = ctx.createLinearGradient(x, y + 10, x, y - pillarH);
        fGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
        fGrad.addColorStop(0.3, 'rgba(249, 115, 22, 0.9)');
        fGrad.addColorStop(0.7, 'rgba(220, 38, 38, 0.75)');
        fGrad.addColorStop(1, 'rgba(153, 27, 27, 0)');

        ctx.fillStyle = fGrad;
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.ellipse(x, y - pillarH / 2, pillarW / 2, pillarH / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 环绕火球飞升
        for (let j = 0; j < 5; j++) {
          const fAng = j * (Math.PI * 2 / 5) + progress * 4;
          const fxX = x + Math.cos(fAng) * (pillarW * 0.7);
          const fxY = y - progress * pillarH * 0.9;
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(fxX, fxY, 4 * (1 - progress), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // 特效3：天雷斩 / 五雷轰顶 (苍穹降下蓝紫霹雳电弧)
      else if (fx.type === 'thunder') {
        ctx.strokeStyle = `rgba(224, 231, 255, ${1 - progress})`;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#818cf8';
        ctx.shadowBlur = 18;

        // 3道霹雳折线从天而降
        for (let b = -1; b <= 1; b++) {
          const bx = x + b * 16;
          ctx.beginPath();
          ctx.moveTo(bx, 0);
          ctx.lineTo(bx + (Math.random() - 0.5) * 20, y * 0.35);
          ctx.lineTo(bx + (Math.random() - 0.5) * 25, y * 0.7);
          ctx.lineTo(x, y);
          ctx.stroke();
        }

        // 目标地面雷电光圈
        ctx.fillStyle = 'rgba(129, 140, 248, 0.4)';
        ctx.beginPath();
        ctx.ellipse(x, y + 10, 30 * (1 - progress), 10 * (1 - progress), 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // 特效4：玄冰刺 / 覆海翻江 (地面突刺深蓝冰棱并碎裂)
      else if (fx.type === 'ice') {
        ctx.fillStyle = 'rgba(186, 230, 253, 0.88)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;

        // 3根尖锐晶莹冰锥
        [-16, 0, 16].forEach((ox, i) => {
          const h = (35 + (i === 1 ? 20 : 0)) * (0.3 + progress * 0.7);
          ctx.beginPath();
          ctx.moveTo(x + ox - 8, y + 10);
          ctx.lineTo(x + ox, y + 10 - h);
          ctx.lineTo(x + ox + 8, y + 10);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
      }
      // 特效5：金刚护体 / 舍生取义 (金色八卦太极金钟罩)
      else if (fx.type === 'shield' || fx.type === 'gold') {
        const ringR = 34 * (0.8 + progress * 0.25);
        ctx.strokeStyle = `rgba(250, 204, 21, ${1 - progress * 0.6})`;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(x, y - 10, ringR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(250, 204, 21, 0.2)';
        ctx.fill();
      }
      // 特效6：甘露回春 / 神佑仙法 (翠绿太极灵光与飞羽)
      else if (fx.type === 'heal') {
        ctx.strokeStyle = `rgba(74, 222, 128, ${1 - progress})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.ellipse(x, y + 10 - progress * 40, 24 * (1 - progress * 0.3), 12 * (1 - progress * 0.3), 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
      return true;
    });
  }

  // 触发战斗法术差异化特效
  spawnBattleSkillEffect(type, x, y, duration = 380) {
    this.activeBattleEffects = this.activeBattleEffects || [];
    this.activeBattleEffects.push({
      type: type,
      x: x,
      y: y,
      startTime: Date.now(),
      duration: duration
    });
  }

  // 播放攻击者极速冲锋滑步击打与平滑归位动画 (A冲B 或 B冲A)
  async playDashAttackAnimation(attacker, target, isAllyAttacker, skillType = 'slash') {
    if (!attacker || !target) return;
    const startX = attacker._baseBattlePos ? attacker._baseBattlePos.x : (attacker._battlePos?.x || 0);
    const startY = attacker._baseBattlePos ? attacker._baseBattlePos.y : (attacker._battlePos?.y || 0);
    const targetX = target._baseBattlePos ? target._baseBattlePos.x : (target._battlePos?.x || 0);
    const targetY = target._baseBattlePos ? target._baseBattlePos.y : (target._battlePos?.y || 0);

    // 计算冲锋突击终点 (在目标身前 46px 处急停挥砍)
    const hitPointX = isAllyAttacker ? (targetX + 46) : (targetX - 46);
    const hitPointY = targetY;
    const totalDistX = hitPointX - startX;
    const totalDistY = hitPointY - startY;

    // 1. 极速滑步漂移冲锋阶段 (80ms~100ms)
    const dashFrames = 5;
    for (let f = 1; f <= dashFrames; f++) {
      const ease = f / dashFrames;
      attacker._dashOffset = { x: totalDistX * ease, y: totalDistY * ease };
      await new Promise(r => setTimeout(r, 16));
    }

    // 2. 命中目标交锋打击与法术爆发阶段 (120ms~150ms)
    // 触发目标受击抖动
    target._shakeOffset = { x: (isAllyAttacker ? -7 : 7), y: (Math.random() - 0.5) * 4 };
    this.spawnBattleSkillEffect(skillType, targetX, targetY, 420);

    await new Promise(r => setTimeout(r, 60));
    target._shakeOffset = { x: (isAllyAttacker ? 4 : -4), y: 0 };
    await new Promise(r => setTimeout(r, 60));
    target._shakeOffset = { x: 0, y: 0 };

    // 3. 极速漂移倒退滑行归位阶段 (80ms~100ms)
    for (let f = dashFrames - 1; f >= 0; f--) {
      const ease = f / dashFrames;
      attacker._dashOffset = { x: totalDistX * ease, y: totalDistY * ease };
      await new Promise(r => setTimeout(r, 16));
    }
    attacker._dashOffset = { x: 0, y: 0 };
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

      // 视觉打击感与极速冲锋滑步漂移交锋反馈 (完美解决站桩无动效问题)
      if (step.type === 'damage' || step.type === 'dodge') {
        const isAllyAttacker = !step.attacker.startsWith('enemy_');
        const attackerEntity = isAllyAttacker
          ? (this.currentBattle.allies.find(a => a.id === step.attacker) || this.currentBattle.allies[0])
          : (this.currentBattle.enemies.find(e => ('enemy_' + e.enemyIndex) === step.attacker) || this.currentBattle.enemies[0]);

        const targetEntity = isAllyAttacker
          ? (this.currentBattle.enemies[step.targetIndex] || this.currentBattle.enemies[0])
          : (this.currentBattle.allies.find(a => a.id === step.target) || this.currentBattle.allies[0]);

        // 识别技能差异化法术特效类型
        let skillType = 'slash'; // 默认普攻白色剑光
        const logText = (step.text || '') + (this.currentBattle.logs.slice(-1)[0] || '');
        if (logText.includes('火') || logText.includes('炎') || logText.includes('凤')) skillType = 'fire';
        else if (logText.includes('雷') || logText.includes('电') || logText.includes('霹雳')) skillType = 'thunder';
        else if (logText.includes('冰') || logText.includes('水') || logText.includes('海') || logText.includes('霜')) skillType = 'ice';
        else if (logText.includes('佛光') || logText.includes('舍生') || logText.includes('金刚') || logText.includes('破甲')) skillType = 'shield';
        else if (logText.includes('吸血') || logText.includes('魔')) skillType = 'slash';

        // 极速冲锋突进到对方身前击打，并平滑倒退归位
        if (attackerEntity && targetEntity) {
          await this.playDashAttackAnimation(attackerEntity, targetEntity, isAllyAttacker, skillType);
        }

        // 受击飘字与震屏
        if (targetEntity && targetEntity._battlePos) {
          this.spawnBattleFloatingTextAtCoords(
            targetEntity._battlePos.x,
            targetEntity._battlePos.y,
            step.text,
            step.type === 'dodge' ? 'damage' : (step.isCrit ? 'crit' : 'damage')
          );
        }

        if (stage) {
          stage.classList.add('arena-shake');
          setTimeout(() => stage.classList.remove('arena-shake'), 280);
        }
      } else if (step.type === 'heal' || step.type === 'mana') {
        const targetEntity = this.currentBattle.allies.find(a => a.id === step.target);
        if (targetEntity && targetEntity._battlePos) {
          this.spawnBattleSkillEffect('heal', targetEntity._battlePos.x, targetEntity._battlePos.y, 400);
          this.spawnBattleFloatingTextAtCoords(targetEntity._battlePos.x, targetEntity._battlePos.y, step.text, 'heal');
        }
      } else if (step.text) {
        const targetEntity = this.currentBattle.enemies[step.targetIndex] || this.currentBattle.allies[0];
        if (targetEntity && targetEntity._battlePos) {
          this.spawnBattleFloatingTextAtCoords(targetEntity._battlePos.x, targetEntity._battlePos.y, step.text, 'damage');
        }
      }

      await new Promise(r => setTimeout(r, Math.max(120, Math.floor(speedDelay * 0.7))));
    });

    this.isAnimatingCombat = false;

    // 检查战斗胜负状态
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
        const vCb = this.battleVictoryCallback;
        this.battleVictoryCallback = null;
        this.battleDefeatCallback = null;
        vCb();
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
      const dCb = this.battleDefeatCallback;
      this.currentBattle = null;
      this.battleDefeatCallback = null;
      this.battleVictoryCallback = null;
      if (dCb) {
        dCb();
      }
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
              <div style="display:flex;align-items:center;gap:10px;">
                <div style="width:42px;height:42px;border-radius:50%;border:1.8px solid #ffd700;overflow:hidden;background:#2d1a0d;box-shadow:0 0 10px rgba(255,215,0,0.4);flex-shrink:0;display:flex;align-items:center;justify-content:center;">
                  ${(() => {
                    const pName = (pet.name || '').toLowerCase();
                    let rId = 'rat';
                    if (pName.includes('龟') || pName.includes('玄武')) rId = 'turtle';
                    else if (pName.includes('蛇')) rId = 'snake';
                    else if (pName.includes('狐')) rId = 'fox';
                    else if (pName.includes('狼')) rId = 'wolf';
                    else if (pName.includes('虎')) rId = 'tiger';
                    else if (pName.includes('熊')) rId = 'bear';
                    else if (pName.includes('蚌')) rId = 'clam';
                    else if (pName.includes('蟹')) rId = 'crab';
                    else if (pName.includes('虾')) rId = 'shrimp';
                    else if (pName.includes('猪')) rId = 'pig';
                    else if (pName.includes('猿') || pName.includes('猴')) rId = 'ape';
                    else if (pName.includes('龙')) rId = 'xiaobailong';
                    return window.Portraits ? window.Portraits.getPortraitSvg(rId, 42) : `<span style="font-size:24px;">${pet.icon || '🐾'}</span>`;
                  })()}
                </div>
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
      baihu_cleared: { mapId: 'baoxiangguo', name: '宝象国王都' },
      baoxiang_seek_princess: { mapId: 'baoxiangguo', name: '宝象国波月洞' },
      baoxiang_boss_ready: { mapId: 'baoxiangguo', name: '宝象国波月洞' },
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

  // 切换场景生灵名册模态框 (Tab 键或右上角快捷按钮呼出)
  toggleSceneRosterModal(forceState) {
    if (typeof document === 'undefined') return;
    const existing = document.getElementById('scene-roster-modal');
    if (existing) {
      if (forceState === true) return;
      existing.remove();
      if (window.Sound && window.Sound.playBeep) window.Sound.playBeep();
      return;
    }
    if (forceState === false) return;

    this.renderSceneRosterModal();
    if (window.Sound && window.Sound.playBeep) window.Sound.playBeep();
  }

  // 渲染场景生灵名册 (NPC 排在上面，野怪排在下面，同种野怪严格去重且显示等级，点击展开详细属性并可寻路)
  renderSceneRosterModal(selectedId = null) {
    if (typeof document === 'undefined') return;
    let modal = document.getElementById('scene-roster-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'scene-roster-modal';
      modal.className = 'roster-modal-overlay';
      modal.onclick = (e) => {
        if (e.target === modal) this.toggleSceneRosterModal(false);
      };
      const viewport = document.getElementById('game-viewport') || document.body;
      viewport.appendChild(modal);
    }

    const mapData = window.GAME_DATA?.MAPS_2D?.[this.currentMapId] || { name: '当前圣境', region: '三界' };
    const npcs = this.npcs || [];
    const rawMonsters = this.monsters || [];

    // 野怪严格去重：同种野怪只展示一个，提取纯净名称与首个实例
    const uniqueMonsters = [];
    const seenMobKeys = new Set();
    for (const m of rawMonsters) {
      const pureName = (m.name || '野怪').replace(/^[0-9一二三四五六七八九十]+号?/, '').trim();
      const mobKey = `${m.appearance || 'mob'}_${pureName}`;
      if (!seenMobKeys.has(mobKey)) {
        seenMobKeys.add(mobKey);
        uniqueMonsters.push({
          key: mobKey,
          pureName: pureName,
          instance: m
        });
      }
    }

    // 确定当前选中的生灵
    let selectedType = 'npc';
    let selectedObj = null;

    if (selectedId) {
      const foundNpc = npcs.find(n => n.id === selectedId);
      if (foundNpc) {
        selectedType = 'npc';
        selectedObj = foundNpc;
      } else {
        const foundMob = uniqueMonsters.find(um => um.key === selectedId || um.instance.id === selectedId);
        if (foundMob) {
          selectedType = 'monster';
          selectedObj = foundMob;
        }
      }
    }

    if (!selectedObj) {
      if (npcs.length > 0) {
        selectedType = 'npc';
        selectedObj = npcs[0];
      } else if (uniqueMonsters.length > 0) {
        selectedType = 'monster';
        selectedObj = uniqueMonsters[0];
      }
    }

    // 构建生灵与场景任务万象名册 HTML
    modal.innerHTML = `
      <div class="roster-modal-box" onclick="event.stopPropagation()">
        <!-- 顶栏双龙金匾 -->
        <div class="roster-dragon-header">
          <div class="roster-header-left">
            <span class="roster-dragon-crest">🐉</span>
            <div class="roster-header-title-box">
              <span class="roster-header-main-title">当前场景万灵名册 · 任务探寻</span>
              <span class="roster-scene-tag">🏯 ${mapData.name} (${mapData.region || '大唐'})</span>
            </div>
          </div>
          <div class="roster-header-right">
            <span class="roster-hotkey-tip">[Tab / Esc 关闭]</span>
            <button class="roster-close-btn" onclick="window.App2D.toggleSceneRosterModal(false)" title="关闭名册 (Esc/Tab)">✕</button>
          </div>
        </div>

        <!-- 主体：左侧名录 + 右侧生灵详案 -->
        <div class="roster-main-body">
          <!-- 左侧生灵两级列表 (固定宽 300px，自适应平滑滚动) -->
          <div class="roster-list-panel">
            <!-- 1. NPC 任务仙民分组 -->
            <div class="roster-group-title">
              <span class="roster-group-icon">🏛️</span>
              <span class="roster-group-name">场景仙民 / NPC (${npcs.length}位)</span>
            </div>
            <div class="roster-items-column">
              ${npcs.length === 0 ? `<div class="roster-empty-tip">当前场景暂无往来仙民</div>` : npcs.map(n => {
                const isSelected = (selectedType === 'npc' && selectedObj && selectedObj.id === n.id);
                const roleId = window.Dialogue ? window.Dialogue.inferRoleId(n.name, n.title) : 'shaoxia';
                const portraitSvg = window.Portraits ? window.Portraits.getPortraitSvg(roleId, 32) : '👤';
                const hasQuest = (n.questStatus === 'available');
                return `
                  <div class="roster-item-card ${isSelected ? 'active' : ''}" onclick="window.App2D.renderSceneRosterModal('${n.id}')">
                    <div class="roster-item-avatar-frame">${portraitSvg}</div>
                    <div class="roster-item-info">
                      <div class="roster-item-title-row">
                        <span class="roster-item-name-text">${n.name}</span>
                        ${hasQuest ? '<span class="roster-quest-pulse-tag">🌟 任务</span>' : ''}
                      </div>
                      <div class="roster-item-desc-text">${n.title || '驻留仙民'} · [${Math.round(n.x/32)}, ${Math.round(n.y/32)}]</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- 2. 野怪异兽分组 (每种严格只展示一个) -->
            <div class="roster-group-title" style="margin-top:12px;">
              <span class="roster-group-icon">🐾</span>
              <span class="roster-group-name">出没异兽 / 野怪 (${uniqueMonsters.length}种)</span>
            </div>
            <div class="roster-items-column">
              ${uniqueMonsters.length === 0 ? `<div class="roster-empty-tip">当前场景太平安谧，无恶煞出没</div>` : uniqueMonsters.map(um => {
                const m = um.instance;
                const isSelected = (selectedType === 'monster' && selectedObj && selectedObj.key === um.key);
                const mobType = m.appearance || (window.Character ? window.Character.inferMonsterType(um.pureName, m.id) : 'wild_wolf');
                const portraitSvg = window.Portraits ? window.Portraits.getPortraitSvg(mobType, 32) : '🐺';
                return `
                  <div class="roster-item-card ${isSelected ? 'active' : ''}" onclick="window.App2D.renderSceneRosterModal('${um.key}')">
                    <div class="roster-item-avatar-frame">${portraitSvg}</div>
                    <div class="roster-item-info">
                      <div class="roster-item-title-row">
                        <span class="roster-item-name-text">${um.pureName}</span>
                        <span class="roster-mob-level-pill">Lv.${m.level || 5}</span>
                      </div>
                      <div class="roster-item-desc-text">气血: ${m.hp}/${m.maxHp} · 攻击: ${m.atk}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 右侧生灵精研档案详情 (自适应弹性填充) -->
          <div class="roster-detail-panel">
            ${selectedObj ? this._renderRosterDetailCard(selectedType, selectedObj) : `<div class="roster-empty-tip">请选择左侧生灵查阅档案详案</div>`}
          </div>
        </div>
      </div>
    `;
  }

  // 内部辅助：渲染名册右侧详案卡片 (国风玉简极度精细排版)
  _renderRosterDetailCard(type, obj) {
    if (type === 'npc') {
      const npc = obj;
      const roleId = window.Dialogue ? window.Dialogue.inferRoleId(npc.name, npc.title) : 'shaoxia';
      const bigPortraitSvg = window.Portraits ? window.Portraits.getPortraitSvg(roleId, 68) : '👤';
      const roleSeal = window.Dialogue ? window.Dialogue.getRoleBadge(roleId, npc.name) : '<div class="dialogue-role-seal seal-mortal">人</div>';
      const coordX = Math.round(npc.x / 32);
      const coordY = Math.round(npc.y / 32);
      const hasQuest = (npc.questStatus === 'available');

      return `
        <div class="roster-card-content">
          <!-- 头部肖像与尊号 -->
          <div class="roster-card-header">
            <div class="roster-card-avatar-wrap">
              ${bigPortraitSvg}
              ${roleSeal}
            </div>
            <div class="roster-card-title-wrap">
              <div class="roster-card-name-row">
                <span class="roster-card-name">${npc.name}</span>
                <span class="roster-card-tag">${npc.title || '三界隐逸仙民'}</span>
              </div>
              <div class="roster-card-location">📍 场景罗盘坐标: [横向 ${coordX}, 纵向 ${coordY}]</div>
            </div>
          </div>

          <div class="roster-card-divider"></div>

          <!-- 任务机缘专区 -->
          <div class="roster-info-block ${hasQuest ? 'highlight-quest-block' : ''}">
            <div class="roster-block-label">
              <span>${hasQuest ? '🌟 核心任务机缘与交接' : '🎯 往来仙道机缘'}</span>
            </div>
            <div class="roster-block-desc">
              ${hasQuest 
                ? '【重要提示】当前少侠正处于此人主持的剧情因缘中！与之交谈将触发关键剧情推进、领取神装或进入全新冒险章节！' 
                : '闲暇神游于此方天地。少侠可前往与之探讨西行秘辛、市井风物或请教天地大道。'}
            </div>
          </div>

          <!-- 仙灵生平传记专区 -->
          <div class="roster-info-block">
            <div class="roster-block-label">
              <span>📖 仙家生平与三界因缘</span>
            </div>
            <div class="roster-block-desc">
              ${npc.dialogueKey 
                ? '西游大世中举足轻重之关键神佛仙灵，一言一行牵动九重天阙与幽冥六道。' 
                : '常年驻留于此的世外散仙凡灵，热心指引过往少侠历练修行。'}
            </div>
          </div>

          <!-- 底部快捷寻路按钮 -->
          <div class="roster-card-action-row">
            <button class="roster-action-nav-btn" onclick="window.App2D.navigateRosterToNpc('${npc.id}')">
              🚶 一键智能寻路前往拜会
            </button>
          </div>
        </div>
      `;
    } else {
      const um = obj;
      const mob = um.instance;
      const mobType = mob.appearance || (window.Character ? window.Character.inferMonsterType(um.pureName, mob.id) : 'wild_wolf');
      const bigPortraitSvg = window.Portraits ? window.Portraits.getPortraitSvg(mobType, 68) : '🐺';
      const hpPct = Math.round((mob.hp / mob.maxHp) * 100);

      return `
        <div class="roster-card-content">
          <!-- 头部肖像与等级 -->
          <div class="roster-card-header">
            <div class="roster-card-avatar-wrap">
              ${bigPortraitSvg}
              <div class="dialogue-role-seal seal-demon">妖</div>
            </div>
            <div class="roster-card-title-wrap">
              <div class="roster-card-name-row">
                <span class="roster-card-name">${um.pureName}</span>
                <span class="roster-mob-level-pill" style="font-size:12px;padding:2px 8px;">Lv.${mob.level || 5}</span>
              </div>
              <div class="roster-card-location" style="color:#ff7675;">⚔️ 巡逻警戒领地: 半径 ${mob.patrolRadius || 30} 步</div>
            </div>
          </div>

          <div class="roster-card-divider"></div>

          <!-- 气血与元神充盈度 -->
          <div class="roster-info-block">
            <div class="roster-block-label">
              <span>🩸 气血灵韵 (生命值)</span>
              <span style="font-size:11px;color:#fffa65;">${mob.hp} / ${mob.maxHp} (${hpPct}%)</span>
            </div>
            <div class="roster-bar-container">
              <div class="roster-bar-fill" style="width:${hpPct}%;"></div>
            </div>
          </div>

          <!-- 战法修持三维 -->
          <div class="roster-info-block">
            <div class="roster-block-label">
              <span>⚡ 战法修行三维能力</span>
            </div>
            <div class="roster-stats-triplet">
              <div class="roster-stat-box">
                <span class="stat-icon">⚔️</span>
                <span class="stat-name">物理攻击</span>
                <span class="stat-num" style="color:#ff6b6b;">${mob.atk}</span>
              </div>
              <div class="roster-stat-box">
                <span class="stat-icon">🛡️</span>
                <span class="stat-name">物理防御</span>
                <span class="stat-num" style="color:#48dbfb;">${mob.def}</span>
              </div>
              <div class="roster-stat-box">
                <span class="stat-icon">🌪️</span>
                <span class="stat-name">身法速度</span>
                <span class="stat-num" style="color:#1dd1a1;">${mob.spd}</span>
              </div>
            </div>
          </div>

          <!-- 掌握神通 -->
          <div class="roster-info-block">
            <div class="roster-block-label">
              <span>🔥 掌握神通武技</span>
            </div>
            <div class="roster-skills-wrap">
              ${(mob.skills || ['普通攻击']).map(sk => `<span class="roster-skill-badge">🥋 ${sk}</span>`).join('')}
            </div>
          </div>

          <!-- 异兽生息录与警示 -->
          <div class="roster-info-block">
            <div class="roster-block-label">
              <span>📜 异兽生息录</span>
            </div>
            <div class="roster-block-desc">
              ${mob.dialogue?.[0] || '游荡于此方胜境之天地凶兽精怪。斩灭可淬炼道行经验，战斗中亦可施展【收服】将其纳为护法仙宠。'}
            </div>
          </div>

          <div class="roster-card-action-row">
            <div class="roster-mob-warning-box">
              ⚠️ 靠近游荡野怪身旁将立即切入回合制对战，请备好仙药！
            </div>
          </div>
        </div>
      `;
    }
  }

  // 名册一键智能寻路到指定 NPC
  navigateRosterToNpc(npcId) {
    this.toggleSceneRosterModal(false);
    const npc = this.npcs.find(n => n.id === npcId);
    if (!npc) return;

    const mapData = window.GAME_DATA.MAPS_2D[this.currentMapId];
    if (!mapData) return;

    const playerDist = Math.hypot(npc.x - this.playerChar.x, npc.y - this.playerChar.y);
    if (playerDist < (npc.interactRadius || 42)) {
      this.triggerNpcDialogue(npc);
      return;
    }

    const path = this.pathfinding.findPath(
      mapData, this.tilemap,
      this.playerChar.x, this.playerChar.y,
      npc.x, npc.y
    );
    if (path && path.length > 0) {
      this.autoMovePath = path;
      this.autoMoveTargetCallback = () => this.triggerNpcDialogue(npc);
      this.spawnClickRipple(npc.x, npc.y);
      if (window.Sound && window.Sound.playBeep) window.Sound.playBeep();
      if (window.showGameMessage) {
        window.showGameMessage(`正在前往【${npc.name}】...`, 'info', 2000);
      }
    } else {
      if (window.showGameMessage) {
        window.showGameMessage(`已锁定【${npc.name}】方位，请径直前往！`, 'info', 2500);
      }
    }
  }

  // =========================================================================
  // 菩提老祖神坛交互：技能熟练度体系、1/5提前突破、全职业授业与仙宠10级觉醒
  // =========================================================================

  // 初始化或保障角色门派技能
  ensurePlayerClassSkills() {
    this.playerData = this.playerData || {};
    this.playerData.skills = this.playerData.skills || [];
    if (this.playerData.skills.length === 0) {
      const clsId = this.playerData.class || 'jingang';
      const gender = this.playerData.gender || 'male';
      if (window.GAME_DATA && typeof window.GAME_DATA.getSkillsForClassAndGender === 'function') {
        this.playerData.skills = window.GAME_DATA.getSkillsForClassAndGender(clsId, gender);
      }
    }
    return this.playerData.skills;
  }

  // 拜谒菩提老祖：领悟门派道法
  learnClassSkillsFromMaster() {
    const clsId = this.playerData.class || 'jingang';
    const gender = this.playerData.gender || 'male';
    if (window.GAME_DATA && typeof window.GAME_DATA.getSkillsForClassAndGender === 'function') {
      const newSkills = window.GAME_DATA.getSkillsForClassAndGender(clsId, gender);
      // 保留已有的熟练度和等级
      newSkills.forEach(ns => {
        const exist = (this.playerData.skills || []).find(s => s.id === ns.id);
        if (exist) {
          ns.level = exist.level || 1;
          ns.mastery = exist.mastery || 0;
        }
      });
      this.playerData.skills = newSkills;
      if (window.Sound && window.Sound.playSuccess) window.Sound.playSuccess();
      if (window.showGameMessage) {
        window.showGameMessage(`✨【老祖传道】菩提老祖拂尘点化，恭喜领悟本门三大正统神通技能！`, 'success', 4500);
      }
    }
  }

  // 仙宠 10 级觉醒授法
  awakenPetSkillAtMaster() {
    const activePet = this.playerData.activePet || (this.playerData.pets && this.playerData.pets[0]);
    if (!activePet) {
      if (window.showGameMessage) window.showGameMessage('菩提老祖温和道：“少侠身侧尚未唤出随行仙宠，请先唤出仙宠再来授业！”', 'info', 3500);
      return;
    }
    if ((activePet.level || 1) < 10) {
      if (window.showGameMessage) window.showGameMessage(`菩提老祖抚须道：“仙宠【${activePet.name}】当前仅 Lv.${activePet.level || 1}，需待其达 Lv.10 灵智开化方可受法！”`, 'warning', 4000);
      return;
    }

    activePet.skills = activePet.skills || [];
    if (!activePet.skills.some(s => s.id === 'sk_pet_tianlei' || s.name === '天雷引')) {
      activePet.skills.push({
        id: 'sk_pet_tianlei',
        name: '天雷引',
        level: 1,
        mastery: 0,
        maxLevel: 5,
        icon: '⚡',
        desc: '灵宠专属雷法！引动九霄天雷轰杀敌方单个目标，受熟练度增幅威力强盛！'
      });
      if (window.Sound && window.Sound.playSuccess) window.Sound.playSuccess();
      if (window.showGameMessage) {
        window.showGameMessage(`🌟【灵智觉醒】仙宠【${activePet.name}】得菩提老祖真传，领悟专属仙法【天雷引】！`, 'success', 5000);
      }
    } else {
      if (window.showGameMessage) {
        window.showGameMessage(`仙宠【${activePet.name}】已受老祖启智，可常在战斗中施展以积累熟练度！`, 'info', 3500);
      }
    }
  }

  // 打开【神坛·技能参悟与熟练度突破】模态框
  openSkillMasteryModal() {
    if (typeof document === 'undefined') return;
    const old = document.getElementById('skill-mastery-modal');
    if (old) old.remove();

    this.ensurePlayerClassSkills();
    const skills = this.playerData.skills || [];
    const isAtShendan = (this.currentMapId === 'changan_shendan');

    const html = `
      <div id="skill-mastery-modal" class="modal-overlay active" style="z-index:9999;display:flex;align-items:center;justify-content:center;">
        <div class="roster-modal-box" style="width:720px;max-width:96vw;height:520px;display:flex;flex-direction:column;background:radial-gradient(circle at center, #24140b 0%, #120904 100%);border:2px solid #ffd700;box-shadow:0 0 25px rgba(0,0,0,0.9), 0 0 15px rgba(255,215,0,0.3);border-radius:10px;overflow:hidden;font-family:'Noto Serif SC','SimSun',serif;">
          
          <!-- 顶栏金匾 -->
          <div class="roster-dragon-header" style="padding:10px 16px;background:linear-gradient(to right, #4a2810, #804e1c, #4a2810);border-bottom:2px solid #ffd700;display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:18px;">✨</span>
              <span style="font-size:16px;font-weight:bold;color:#ffd700;text-shadow:0 0 6px rgba(255,215,0,0.6);">长安神坛 · 菩提老祖道法参悟</span>
              <span style="font-size:11px;padding:1px 6px;border-radius:4px;background:#3a1c0c;border:1px solid #c59b27;color:#f5deb3;">五级熟练度法则</span>
            </div>
            <button onclick="document.getElementById('skill-mastery-modal').remove()" style="background:transparent;border:none;color:#ffd700;font-size:18px;cursor:pointer;">✕</button>
          </div>

          <!-- 法则提醒条 -->
          <div style="background:#1b0f07;padding:6px 16px;border-bottom:1px solid #5a3818;font-size:11px;color:#dcdcdc;display:flex;justify-content:space-between;align-items:center;">
            <span>📜 <strong>五级熟练度法则</strong>：每级跨度5000，满熟练度25000！当前品级达到 1/5(1000点) 即可找菩提老祖突破！</span>
            <span style="color:${isAtShendan ? '#2ed573' : '#ffa502'};font-weight:bold;">${isAtShendan ? '📍 现正处于长安神坛' : '⚠️ 需至长安神坛找菩提老祖突破'}</span>
          </div>

          <!-- 技能列表区 -->
          <div style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:12px;">
            ${skills.map(sk => {
              const lvl = sk.level || 1;
              const mastery = (sk.mastery !== undefined) ? sk.mastery : (sk.proficiency || 0);
              const isLocked = window.SkillMasteryEngine ? window.SkillMasteryEngine.isLevelLocked(lvl, mastery) : (mastery >= lvl * 5000);
              const canUp = window.SkillMasteryEngine ? window.SkillMasteryEngine.canUpgrade(lvl, mastery) : false;
              const minReq = window.SkillMasteryEngine ? window.SkillMasteryEngine.getMinMasteryForUpgrade(lvl) : 1000;
              const spanMax = lvl * 5000;
              const pct = Math.min(100, Math.floor((mastery / spanMax) * 100));

              // 预览数值
              let previewText = '';
              if (sk.name === '舍生取义' || sk.id === 'sk_jg_shesheng') {
                const c = window.SkillMasteryEngine.calculateShesheng(null, null, lvl, mastery);
                previewText = `破甲绝杀: ${c.damage} | 自损反噬: ${c.selfDamage} | 耗蓝: ${c.costMp} (气血需>=10%)`;
              } else if (sk.name === '雷霆万钧' || sk.id === 'sk_ym_leiting') {
                const c = window.SkillMasteryEngine.calculateLeiting(null, null, lvl, mastery);
                previewText = `单体法伤: ${c.damage} | 耗蓝: ${c.costMp} MP (极高魔雷)`;
              } else if (sk.name === '封印咒' || sk.id === 'sk_xr_fengyin') {
                const c = window.SkillMasteryEngine.calculateControlSpell('fengyin', lvl, mastery);
                previewText = `封印硬控 | 命中率: ${(c.hitRate * 100).toFixed(1)}% | 耗蓝: ${c.costMp} MP`;
              } else if (sk.name === '定身咒' || sk.id === 'sk_xr_dingshen') {
                const c = window.SkillMasteryEngine.calculateControlSpell('dingshen', lvl, mastery);
                previewText = `定身禁锢 | 命中率: ${(c.hitRate * 100).toFixed(1)}% | 受击即苏醒 | 耗蓝: ${c.costMp} MP`;
              } else if (sk.name === '乱魂咒' || sk.id === 'sk_xr_luanhun') {
                const c = window.SkillMasteryEngine.calculateControlSpell('luanhun', lvl, mastery);
                previewText = `混乱内讧 | 命中率: ${(c.hitRate * 100).toFixed(1)}% | 耗蓝: ${c.costMp} MP`;
              } else if (sk.name === '三昧真火' || sk.name === '飞沙走石') {
                const c = window.SkillMasteryEngine.calculateGroupSpell(sk.name, null, 4, lvl, mastery);
                previewText = `群法必中 | 目标: 1~${c.maxTargets}人 | 人均: ${c.perTargetDamage} | 耗蓝: ${c.costMp} MP`;
              } else if (sk.name === '佛光普照' || sk.name === '如来神掌') {
                const c = window.SkillMasteryEngine.calculateMpDrainAttack(sk.name === '如来神掌', null, null, lvl, mastery);
                previewText = `削血: ${c.damage} | 扣蓝: ${c.mpDrain} MP | 耗蓝: ${c.costMp} MP`;
              } else {
                previewText = sk.desc;
              }

              return `
                <div style="background:#1a0f07;border:1.5px solid ${isLocked ? '#ff4757' : (canUp ? '#ffd700' : '#4a2c16')};border-radius:8px;padding:12px;display:flex;align-items:center;gap:14px;box-shadow:0 3px 8px rgba(0,0,0,0.5);">
                  <div style="font-size:32px;width:52px;height:52px;background:#2d170a;border:1px solid #c59b27;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    ${sk.icon || '⚔️'}
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                      <span style="font-size:16px;font-weight:bold;color:#ffd700;">${sk.name}</span>
                      <span style="font-size:11px;padding:1px 6px;border-radius:4px;background:#502c11;color:#fff;border:1px solid #ffd700;">Lv.${lvl} / 5</span>
                      ${isLocked ? '<span style="font-size:10px;padding:1px 6px;border-radius:3px;background:#eb4d4b;color:#fff;">⚠️ 当前品级已锁级(满5000)</span>' : ''}
                      ${canUp && !isLocked ? '<span style="font-size:10px;padding:1px 6px;border-radius:3px;background:#27ae60;color:#fff;">✨ 达到1/5门槛可提前突破</span>' : ''}
                    </div>

                    <!-- 进度条 -->
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                      <div style="flex:1;height:8px;background:#0d0603;border:1px solid #5a361c;border-radius:4px;overflow:hidden;">
                        <div style="width:${pct}%;height:100%;background:linear-gradient(to right, #e67e22, #f1c40f);border-radius:4px;"></div>
                      </div>
                      <span style="font-size:11px;color:#f39c12;font-family:monospace;white-space:nowrap;">熟练度: ${mastery} / ${spanMax} (${pct}%)</span>
                    </div>

                    <div style="font-size:11px;color:#bdc3c7;display:flex;justify-content:space-between;">
                      <span>${previewText}</span>
                      <span style="color:#aaa;">升Lv.${lvl+1}最低门槛: ${minReq || 25000}</span>
                    </div>
                  </div>

                  <!-- 操作按钮 -->
                  <div style="flex-shrink:0;">
                    ${lvl >= 5 ? `
                      <button disabled style="padding:6px 12px;background:#333;color:#888;border:1px solid #555;border-radius:6px;font-size:12px;">已登峰造极</button>
                    ` : (canUp ? `
                      <button onclick="window.App2D.upgradeSkillAtMaster('${sk.id}')" style="padding:6px 14px;background:linear-gradient(to bottom, #f39c12, #d35400);color:#fff;font-weight:bold;border:1px solid #ffd700;border-radius:6px;font-size:12px;cursor:pointer;box-shadow:0 0 8px rgba(243,156,18,0.6);" ${!isAtShendan ? 'title="当前未在神坛，点击将由老祖神念传道"' : ''}>
                        🌟 老祖点化突破 (升Lv.${lvl+1})
                      </button>
                    ` : `
                      <button disabled style="padding:6px 12px;background:#221208;color:#777;border:1px solid #442512;border-radius:6px;font-size:11px;">
                        需熟练度 ${minReq}
                      </button>
                    `)}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- 底栏 -->
          <div style="padding:10px 16px;background:#140b05;border-top:1px solid #4a2810;display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:11px;color:#aaa;">长安城左上角入口直通神坛，凡技能初悟、突破与仙宠授法皆系于菩提老祖。</span>
            <button onclick="document.getElementById('skill-mastery-modal').remove()" style="padding:5px 16px;background:#3a1d0c;color:#ffd700;border:1px solid #ffd700;border-radius:4px;cursor:pointer;">关闭面板</button>
          </div>

        </div>
      </div>
    `;

    const v = document.getElementById('game-viewport') || document.body;
    v.insertAdjacentHTML('beforeend', html);
  }

  // 在菩提老祖处执行突破升级
  upgradeSkillAtMaster(skillId) {
    this.ensurePlayerClassSkills();
    const skill = (this.playerData.skills || []).find(s => s.id === skillId);
    if (!skill) return;

    if (!window.SkillMasteryEngine) return;
    const res = window.SkillMasteryEngine.upgradeSkill(skill, true);
    if (res.success) {
      if (window.Sound && window.Sound.playSuccess) window.Sound.playSuccess();
      if (window.showGameMessage) window.showGameMessage(res.message, 'success', 4500);
      this.openSkillMasteryModal(); // 刷新界面
    } else {
      if (window.showGameMessage) window.showGameMessage(res.message, 'warning', 3500);
    }
  }
}

window.App2D = new GameApp2D();
window.addEventListener('DOMContentLoaded', () => {
  window.App2D.init();
});

