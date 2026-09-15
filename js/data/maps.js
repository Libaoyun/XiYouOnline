/**
 * 汉风西游 - 地图场景与NPC数据库
 * 包含经典城镇、野外迷宫、NPC交互功能（商店、打造、领宠、抓鬼等）与暗雷遇怪
 */
window.GAME_DATA = window.GAME_DATA || {};

window.GAME_DATA.MAPS = {
  // === 1. 新手主城：东海渔村 / 建邺城 ===
  donghai_yucun: {
    id: 'donghai_yucun',
    name: '东海渔村',
    region: '建邺辖地',
    icon: '🏝️',
    bgTheme: 'sea',
    desc: '三面环水的美丽小渔村，海风阵阵，波涛微卷。这里是所有三界侠士最初踏上修仙取经之路的梦开始之地。',
    connected: [
      { mapId: 'donghai_wan', name: '前往【东海湾】(出村)' },
      { mapId: 'changan_cheng', name: '搭乘海船前往【长安城】(需5级)', reqLevel: 5 }
    ],
    npcs: [
      {
        id: 'npc_pet_fairy',
        name: '宠物仙子',
        title: '【灵兽引渡】',
        icon: '🧚‍♀️',
        desc: '笑靥如花的仙界使者，身边总是环绕着许多灵动的仙宠。',
        dialogs: [
          '这位少侠，初入三界旅途险恶，怎能没有一只心意相通的召唤兽相伴呢？',
          '我这里有刚刚破壳的大海龟和活泼的巨蛙，你挑选一只作为今后的本命战宠吧！'
        ],
        actionType: 'adopt_pet'
      },
      {
        id: 'npc_guide',
        name: '村长老汉',
        title: '【新手向导】',
        icon: '👴',
        desc: '渔村德高望重的老村长，对天下各门各派了如指掌。',
        dialogs: [
          '三界如今妖气四溢，听说西天取经之路凶险万分。',
          '少侠若要拜师，佛门有【金刚】，道门有【仙人】，大泽有【妖魔】。金刚肉厚威猛，仙人控魂拿人，妖魔焚天剧毒，各有通天造化！'
        ],
        actionType: 'quest_guide'
      },
      {
        id: 'npc_village_shop',
        name: '杂货掌柜',
        title: '【补给当铺】',
        icon: '🏮',
        desc: '笑眯眯的货郎，专卖出门在外的疗伤膏药和符箓。',
        dialogs: ['客官，出海打怪可别忘了带足金创药和佛手，关键时刻能保命呐！'],
        actionType: 'shop',
        goods: ['jinchuang_yao', 'foshou', 'feixing_fu']
      }
    ],
    wildEnemies: [] // 安全主城
  },

  // === 2. 新手野外：东海湾 ===
  donghai_wan: {
    id: 'donghai_wan',
    name: '东海湾',
    region: '郊外试炼',
    icon: '🌊',
    bgTheme: 'beach',
    desc: '碧海蓝天，金沙漫步。沙滩上爬满了温顺的大海龟和四处蹦跶的巨蛙，时常能听到海浪拍击沉船的轰鸣。',
    connected: [
      { mapId: 'donghai_yucun', name: '返回【东海渔村】' },
      { mapId: 'chenchuan', name: '深入【海底沉船】(需3级)', reqLevel: 3 },
      { mapId: 'jiangnan_yewai', name: '穿过古道前往【江南野外】(需8级)', reqLevel: 8 }
    ],
    npcs: [
      {
        id: 'npc_chulianyi',
        name: '楚恋依',
        title: '【痴情女子】',
        icon: '💃',
        desc: '静静伫立在海边远眺的女子，神情幽怨，似在等待远洋归来的情郎。',
        dialogs: ['海风虽轻，吹不散相思之苦……少侠若去往长安，能否帮我打听打听陆公子的音讯？'],
        actionType: 'quest_talk'
      }
    ],
    wildEnemies: [
      { petId: 'dahai_gui', weight: 45, levelRange: [1, 4] },
      { petId: 'ju_wa', weight: 40, levelRange: [2, 5] },
      { petId: 'ye_zhu', weight: 15, levelRange: [3, 6] }
    ]
  },

  // === 3. 探险副本：海底沉船 ===
  chenchuan: {
    id: 'chenchuan',
    name: '海底沉船',
    region: '古战场废墟',
    icon: '⚓',
    bgTheme: 'cave',
    desc: '一艘不知何年沉没的官船残骸，长满了珊瑚青苔。舱内水汽弥漫，隐隐有怨气凝结的水妖在暗处窥伺。',
    connected: [
      { mapId: 'donghai_wan', name: '离开沉船回到【东海湾】' }
    ],
    npcs: [
      {
        id: 'npc_ghost_sailor',
        name: '沉船水妖头领',
        title: '【精英首领】',
        icon: '🧟‍♂️',
        desc: '被怨念束缚的沉船船长化成的厉鬼，挥舞着锈迹斑斑的铜锚。',
        dialogs: ['入我幽冥沉船者，留下你的魂魄陪我们永沉海底吧！桀桀桀！'],
        actionType: 'boss_fight',
        bossId: 'boss_chenchuan'
      }
    ],
    wildEnemies: [
      { petId: 'dahai_gui', weight: 30, levelRange: [4, 7] },
      { petId: 'ju_wa', weight: 40, levelRange: [5, 8] },
      { petId: 'xia_bing', weight: 30, levelRange: [6, 9] }
    ]
  },

  // === 4. 历练野外：江南野外 ===
  jiangnan_yewai: {
    id: 'jiangnan_yewai',
    name: '江南野外',
    region: '长安南郊',
    icon: '🌾',
    bgTheme: 'forest',
    desc: '青石古道，枫林染红。这里是连接东海与大唐国都的要道，茂密灌木中常有野猪成群、毒蛇游走。',
    connected: [
      { mapId: 'donghai_wan', name: '向东返回【东海湾】' },
      { mapId: 'changan_cheng', name: '向北进入【长安城南门】' }
    ],
    npcs: [
      {
        id: 'npc_qiaofu',
        name: '砍柴樵夫',
        title: '【山野乡民】',
        icon: '🪓',
        desc: '背着沉重柴捆的中年樵夫，累得满头大汗。',
        dialogs: ['这江南野外的白花蛇毒性极大，黑熊精更是力大无穷，少侠若没几件趁手兵刃千万别招惹它们！'],
        actionType: 'chat'
      }
    ],
    wildEnemies: [
      { petId: 'ye_zhu', weight: 35, levelRange: [8, 12] },
      { petId: 'baihua_she', weight: 40, levelRange: [10, 14] },
      { petId: 'heixiong_jing', weight: 25, levelRange: [12, 16] }
    ]
  },

  // === 5. 核心繁华主城：长安城 ===
  changan_cheng: {
    id: 'changan_cheng',
    name: '长安城',
    region: '大唐王都',
    icon: '🏯',
    bgTheme: 'palace',
    desc: '九天阊阖开宫殿，万国衣冠拜冕旒！大唐盛世的巍峨雄都，街道宽阔，车水马龙，三界各路豪杰商贾云集于此。',
    connected: [
      { mapId: 'jiangnan_yewai', name: '出南门前往【江南野外】' },
      { mapId: 'datang_jingwai', name: '出西门前往【大唐境外】(需20级)', reqLevel: 20 },
      { mapId: 'tiangong', name: '登上天梯飞升【天宫】(需30级)', reqLevel: 30 },
      { mapId: 'donghai_yucun', name: '前往码头搭船回【东海渔村】' }
    ],
    npcs: [
      {
        id: 'npc_zhongkui',
        name: '钟馗',
        title: '【捉鬼大师】',
        icon: '👺',
        desc: '豹头环眼，铁面虬髯的天师钟馗，奉地府阎君之命在阳间惩处恶鬼。',
        dialogs: [
          '三界怨气大盛，地府逃窜出大量恶鬼作祟！',
          '少侠可愿替天行道？接下捉鬼令，降伏恶鬼可得巨额经验、银两以及天材地宝！'
        ],
        actionType: 'ghost_quest'
      },
      {
        id: 'npc_blacksmith',
        name: '李铁匠',
        title: '【神兵打造与强化】',
        icon: '🔨',
        desc: '赤膊上阵的大汉，炉火熊熊，手中巨锤叮当鸣响。',
        dialogs: [
          '只要材料管够，天底下的绝世神兵没有老李打不出来的！',
          '带来强化石，我能替你的装备升星淬火（最高+12），若是怕爆掉，记得带上定星石！'
        ],
        actionType: 'forge'
      },
      {
        id: 'npc_inn',
        name: '悦来客栈掌柜',
        title: '【住店修整】',
        icon: '🍶',
        desc: '满面红光的客栈老板，招呼着南来北往的侠客。',
        dialogs: ['客官一路风尘仆仆，花上百文银两吃顿酒菜睡个好觉，气血法力立马满血复活！'],
        actionType: 'rest_heal'
      },
      {
        id: 'npc_ca_shop',
        name: '万宝斋大掌柜',
        title: '【仙家商铺】',
        icon: '💰',
        desc: '手摇金丝折扇的富商，专收天下奇珍异宝，也出售三界秘籍。',
        dialogs: ['这里有洗练神兽的金柳露、高级强化石、还有绝世魔兽要诀！童叟无欺，价优物美！'],
        actionType: 'shop',
        goods: [
          'jinchuang_yao', 'dahuan_dan', 'foshou', 'biling_dan', 'jiuzhuan_dan', 'feixing_fu',
          'jinliu_lu', 'qianghua_shi', 'dingxing_shi',
          'book_bishai', 'book_lianji', 'book_xixue', 'book_shenyousheng',
          'eq_wp_longquan', 'eq_am_iron', 'eq_bt_zhuifeng', 'eq_bl_qixing'
        ]
      },
      {
        id: 'npc_xuanzang',
        name: '玄奘法师',
        title: '【西行主线】',
        icon: '🧘‍♂️',
        desc: '金山寺高僧，身披锦斓袈裟，手持九环锡杖，心怀苍生慈悲。',
        dialogs: [
          '阿弥陀佛，贫僧奉唐皇之命西天拜佛求取真经。奈何十万八千里路途妖魔遍地……',
          '善哉，若有少侠一路护持，天下苍生幸甚！'
        ],
        actionType: 'main_story'
      }
    ],
    wildEnemies: []
  },

  // === 6. 高阶险地：大唐境外 ===
  datang_jingwai: {
    id: 'datang_jingwai',
    name: '大唐境外',
    region: '西域风沙',
    icon: '🏜️',
    bgTheme: 'desert',
    desc: '走出阳关，大漠黄沙遮天蔽日。高老庄、五庄观与白骨洞掩映在黄沙深处，妖气冲天。',
    connected: [
      { mapId: 'changan_cheng', name: '东回【长安城】' },
      { mapId: 'huaguoshan', name: '翻越群山前往【花果山】(需35级)', reqLevel: 35 }
    ],
    npcs: [
      {
        id: 'npc_wuzhuang_daotong',
        name: '五庄观道童',
        title: '【仙山引路】',
        icon: '🎋',
        desc: '清风明月座下道童，身穿八卦道袍。',
        dialogs: ['万寿山福地，五庄观洞天！家师镇元大仙正在内殿参禅，外人不得喧哗。'],
        actionType: 'chat'
      }
    ],
    wildEnemies: [
      { petId: 'heixiong_jing', weight: 35, levelRange: [22, 28] },
      { petId: 'xia_bing', weight: 40, levelRange: [25, 30] },
      { petId: 'gudai_ruishou', weight: 25, levelRange: [28, 34] }
    ]
  },

  // === 7. 仙境胜地：花果山 ===
  huaguoshan: {
    id: 'huaguoshan',
    name: '花果山',
    region: '十洲祖脉',
    icon: '🐒',
    bgTheme: 'mountain',
    desc: '东胜神洲傲来国之灵山。丹崖怪石，削壁奇峰，飞瀑挂川。美猴王诞生之地，灵气最为浓郁。',
    connected: [
      { mapId: 'datang_jingwai', name: '下山前往【大唐境外】' },
      { mapId: 'changan_cheng', name: '使用筋斗云直飞【长安城】' }
    ],
    npcs: [
      {
        id: 'npc_monkey_king',
        name: '美猴王分身',
        title: '【齐天大圣】',
        icon: '👑',
        desc: '身穿黄金锁子甲，头戴凤翅紫金冠，目光如炬，傲视三界。',
        dialogs: [
          '俺老孙在此！三界群仙诸佛，谁敢奈我何？',
          '看少侠筋骨奇佳，若能接下俺老孙三招，定送你一桩天大的机缘造化！'
        ],
        actionType: 'monkey_challenge'
      }
    ],
    wildEnemies: [
      { petId: 'xia_bing', weight: 25, levelRange: [35, 42] },
      { petId: 'gudai_ruishou', weight: 45, levelRange: [38, 46] },
      { petId: 'xixue_gui', weight: 30, levelRange: [42, 50] }
    ]
  },

  // === 8. 仙宫极境：天宫 ===
  tiangong: {
    id: 'tiangong',
    name: '天宫·凌霄宝殿',
    region: '九重天阙',
    icon: '☁️',
    bgTheme: 'heaven',
    desc: '金光万道滚红霓，瑞气千条喷紫雾。南天门外神将巍然，凌霄宝殿内玉帝统御诸天。',
    connected: [
      { mapId: 'changan_cheng', name: '降下云头返回【长安城】' }
    ],
    npcs: [
      {
        id: 'npc_erlang_shen',
        name: '昭惠显圣二郎真君',
        title: '【天梯首席考官】',
        icon: '🦅',
        desc: '额生神目，手持三尖两刃枪，身伴哮天神犬，不怒自威。',
        dialogs: [
          '欲入凌霄，先过真君法眼！',
          '天梯乃三界至强试炼，每登一层，便可赢取无上积分与神级魔兽要诀！'
        ],
        actionType: 'tianti_challenge'
      }
    ],
    wildEnemies: [
      { petId: 'gudai_ruishou', weight: 40, levelRange: [45, 52] },
      { petId: 'xixue_gui', weight: 60, levelRange: [48, 55] }
    ]
  }
};
