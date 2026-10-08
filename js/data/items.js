/**
 * 汉风西游 - 物品与装备数据库
 * 包含消耗品、材料、宝石、金柳露、魔兽要诀以及六大部位装备
 */
window.GAME_DATA = window.GAME_DATA || {};

window.GAME_DATA.ITEMS = {
  // === 消耗药品 ===
  jinchuang_yao: {
    id: 'jinchuang_yao',
    name: '金创药',
    type: 'consumable',
    icon: '💊',
    price: 80,
    desc: '止血伤药，使用后恢复 300 点气血。',
    effect: { hp: 300 }
  },
  dahuan_dan: {
    id: 'dahuan_dan',
    name: '大还丹',
    type: 'consumable',
    icon: '🔴',
    price: 350,
    desc: '名贵秘药，使用后恢复 1200 点气血。',
    effect: { hp: 1200 }
  },
  foshou: {
    id: 'foshou',
    name: '佛手',
    type: 'consumable',
    icon: '🍃',
    price: 60,
    desc: '灵果甘露，使用后恢复 150 点法力。',
    effect: { mp: 150 }
  },
  biling_dan: {
    id: 'biling_dan',
    name: '碧灵丹',
    type: 'consumable',
    icon: '🔵',
    price: 400,
    desc: '纯阳金丹，使用后恢复 600 点法力。',
    effect: { mp: 600 }
  },
  jiuzhuan_dan: {
    id: 'jiuzhuan_dan',
    name: '九转还魂丹',
    type: 'consumable',
    icon: '⭐',
    price: 2000,
    desc: '极品金丹，复活倒地目标并恢复 800 点气血。',
    effect: { revive: true, hp: 800 }
  },
  feixing_fu: {
    id: 'feixing_fu',
    name: '飞行符',
    type: 'consumable',
    icon: '📜',
    price: 150,
    desc: '仙家神符，使用后瞬移返回长安城。',
    effect: { teleport: 'changan' }
  },

  // === 炼妖养成材料 ===
  jinliu_lu: {
    id: 'jinliu_lu',
    name: '金柳露',
    type: 'pet_item',
    icon: '🏺',
    price: 1500,
    desc: '观音圣水，洗髓仙宠，重置为0级并刷新资质技能。',
    effect: { washPet: true }
  },
  qianghua_shi: {
    id: 'qianghua_shi',
    name: '强化石',
    type: 'forge_item',
    icon: '💎',
    price: 1000,
    desc: '地脉精金，装备升星强化（+1 ~ +12）。',
    effect: { enhance: true }
  },
  dingxing_shi: {
    id: 'dingxing_shi',
    name: '定星石',
    type: 'forge_item',
    icon: '🔮',
    price: 3000,
    desc: '古老神石，强化时防止装备掉星或破损。',
    effect: { protect: true }
  },

  // === 魔兽要诀（打书） ===
  book_bishai: {
    id: 'book_bishai',
    name: '魔兽要诀：必杀',
    type: 'book',
    icon: '📕',
    price: 5000,
    skill: '必杀',
    desc: '魔兽残卷，领悟【必杀】技能。'
  },
  book_lianji: {
    id: 'book_lianji',
    name: '魔兽要诀：连击',
    type: 'book',
    icon: '📘',
    price: 8000,
    skill: '连击',
    desc: '神卷步法，领悟【连击】技能。'
  },
  book_xixue: {
    id: 'book_xixue',
    name: '魔兽要诀：吸血',
    type: 'book',
    icon: '📙',
    price: 7500,
    skill: '吸血',
    desc: '修罗功法，领悟【吸血】技能。'
  },
  book_shenyousheng: {
    id: 'book_shenyousheng',
    name: '魔兽要诀：高神佑',
    type: 'book',
    icon: '👑',
    price: 20000,
    skill: '高级神佑复生',
    desc: '顶级神书，领悟【高级神佑复生】。'
  },

  // 更多仙家秘药
  xuelian_dan: {
    id: 'xuelian_dan',
    name: '天山雪莲丹',
    type: 'consumable',
    icon: '❄️',
    price: 1200,
    desc: '天山雪莲，使用后恢复 3000 点气血。',
    effect: { hp: 3000 }
  },
  zisang_lu: {
    id: 'zisang_lu',
    name: '紫桑玉露',
    type: 'consumable',
    icon: '🧪',
    price: 1000,
    desc: '瑶池清露，使用后恢复 1200 点法力。',
    effect: { mp: 1200 }
  },

  // === 宝石系列 (可镶嵌于装备，最多3孔，加属性或专属抗性) ===
  gem_jingang: {
    id: 'gem_jingang',
    name: '金刚石',
    type: 'gem',
    icon: '💎',
    price: 3000,
    desc: '佛门神石，镶嵌增加抗物理普攻 +5%。',
    bonus: { res_phy: 0.05 }
  },
  gem_sheli: {
    id: 'gem_sheli',
    name: '舍利子',
    type: 'gem',
    icon: '📿',
    price: 3200,
    desc: '高僧舍利，镶嵌增加抗舍生 +6%。',
    bonus: { res_shesheng: 0.06 }
  },
  gem_pilei: {
    id: 'gem_pilei',
    name: '辟雷珠',
    type: 'gem',
    icon: '⚡',
    price: 3200,
    desc: '雷纹神珠，镶嵌增加抗雷霆 +6%。',
    bonus: { res_leiting: 0.06 }
  },
  gem_dingfeng: {
    id: 'gem_dingfeng',
    name: '定风珠',
    type: 'gem',
    icon: '🌪️',
    price: 3200,
    desc: '定风宝珠，镶嵌增加抗飞沙 +6%。',
    bonus: { res_feisha: 0.06 }
  },
  gem_qingxin: {
    id: 'gem_qingxin',
    name: '清心玉',
    type: 'gem',
    icon: '🪷',
    price: 3500,
    desc: '凝神寒玉，镶嵌增加抗封印 +8%。',
    bonus: { res_fengyin: 0.08 }
  },
  gem_dingshen: {
    id: 'gem_dingshen',
    name: '定身符玉',
    type: 'gem',
    icon: '🧿',
    price: 3500,
    desc: '破禁宝玉，镶嵌增加抗定身 +8%。',
    bonus: { res_dingshen: 0.08 }
  },
  gem_hongmanao: {
    id: 'gem_hongmanao',
    name: '红玛瑙',
    type: 'gem',
    icon: '🔴',
    price: 2500,
    desc: '纯阳玛瑙，镶嵌增加物理攻击 +25。',
    bonus: { atk: 25 }
  },
  gem_yueliang: {
    id: 'gem_yueliang',
    name: '月亮石',
    type: 'gem',
    icon: '🌕',
    price: 2500,
    desc: '月华灵石，镶嵌增加物理防御 +20。',
    bonus: { def: 20 }
  },
  gem_guangmang: {
    id: 'gem_guangmang',
    name: '光芒石',
    type: 'gem',
    icon: '✨',
    price: 2600,
    desc: '生生灵石，镶嵌增加气血上限 +150。',
    bonus: { hp: 150 }
  },
  gem_heibaoshi: {
    id: 'gem_heibaoshi',
    name: '黑宝石',
    type: 'gem',
    icon: '⚫',
    price: 2800,
    desc: '暗夜灵石，镶嵌增加出手速度 +8。',
    bonus: { spd: 8 }
  },

  // === 杂物与法宝道具系列 ===
  silver_gourd: {
    id: 'silver_gourd',
    name: '收仙银壶（紫竹银葫芦）',
    type: 'misc',
    icon: '🍶',
    price: 800,
    desc: '紫竹法宝，招降【散仙】灵物成功率高。'
  },
  gold_gourd: {
    id: 'gold_gourd',
    name: '紫金红葫芦',
    type: 'misc',
    icon: '🏺',
    price: 2500,
    desc: '上古至宝，招降【金仙】神兽成功率高。'
  },
  talent_pill: {
    id: 'talent_pill',
    name: '天赋丹',
    type: 'consumable',
    icon: '🔮',
    price: 3500,
    effect: { talentPoints: 50, target: 'jinxian_pet' },
    desc: '上古九转仙气淬炼的天赋宝丹！喂食【金仙】品阶仙宠使用，单次永久增加 50 点元神变身天赋点 (上限 5000 点)！'
  },
  changan_huji: {
    id: 'changan_huji',
    name: '大唐长安户籍簿',
    type: 'misc',
    icon: '📜',
    price: 0,
    desc: '大唐户籍，在土地神处可一键返回居住地。'
  },
  jin_liu_lu: {
    id: 'jin_liu_lu',
    name: '金柳露',
    type: 'misc',
    icon: '🧴',
    price: 1500,
    desc: '琼浆圣水，洗髓仙宠，重置为1级并刷新资质。'
  },
  meteor_iron: {
    id: 'meteor_iron',
    name: '天外陨铁',
    type: 'misc',
    icon: '🪨',
    price: 800,
    desc: '星辰神铁，在李铁匠处精炼装备提升攻防。'
  },
  bishui_zhu: {
    id: 'bishui_zhu',
    name: '避水神珠',
    type: 'misc',
    icon: '🔮',
    price: 5000,
    desc: '龙宫至宝，受水系法术伤害减免 30%。'
  },
  // 1. 武器
  dinghai_shenzhen: {
    id: 'dinghai_shenzhen',
    name: '定海神针铁·仿',
    type: 'equip',
    slot: 'weapon',
    reqLevel: 30,
    icon: '🦯',
    price: 12000,
    quality: 'gold',
    attrs: { atk: 160, matk: 95, hp: 650, spd: 18 },
    desc: '大禹治水测江海深浅之天河定底神珍！重一万三千五百斤，神芒破霄，横扫乾坤！'
  },
  eq_wp_wood: {
    id: 'eq_wp_wood',
    name: '青铜短剑',
    type: 'equip',
    slot: 'weapon',
    reqLevel: 0,
    icon: '🗡️',
    price: 200,
    quality: 'white',
    attrs: { atk: 18, matk: 10 },
    desc: '普通青铜铸就的短剑，虽不锋锐，但也足堪防身。'
  },
  eq_wp_longquan: {
    id: 'eq_wp_longquan',
    name: '龙泉古剑',
    type: 'equip',
    slot: 'weapon',
    reqLevel: 10,
    icon: '⚔️',
    price: 1200,
    quality: 'green',
    attrs: { atk: 52, matk: 35, spd: 4 },
    desc: '欧冶子传世之作，剑气森然，出鞘隐有龙吟之声。'
  },
  eq_wp_jinshe: {
    id: 'eq_wp_jinshe',
    name: '金蛇神锥',
    type: 'equip',
    slot: 'weapon',
    reqLevel: 25,
    icon: '🐍',
    price: 4500,
    quality: 'blue',
    attrs: { atk: 118, matk: 85, spd: 12 },
    desc: '以万年玄铁混杂剧毒金蛇牙所铸，刁钻狠辣，破甲诛心。'
  },
  eq_wp_lengyue: {
    id: 'eq_wp_lengyue',
    name: '冷月狂刀',
    type: 'equip',
    slot: 'weapon',
    reqLevel: 40,
    icon: '🌙',
    price: 15000,
    quality: 'purple',
    attrs: { atk: 245, matk: 160, spd: 18 },
    desc: '九天冷月之精魄凝聚成刃，刀锋过处寒霜四溢，斩妖除魔如摧枯拉朽。'
  },
  eq_wp_bawangqiang: {
    id: 'eq_wp_bawangqiang',
    name: '破军霸王枪',
    type: 'equip',
    slot: 'weapon',
    reqLevel: 55,
    icon: '🔱',
    price: 50000,
    quality: 'orange',
    attrs: { atk: 480, matk: 320, spd: 35 },
    desc: '【上古神器】西楚霸王破釜沉舟之无上神枪，煞气冲霄，横扫三界！'
  },

  // 2. 衣服
  eq_am_cloth: {
    id: 'eq_am_cloth',
    name: '青布道袍',
    type: 'equip',
    slot: 'armor',
    reqLevel: 0,
    icon: '🥋',
    price: 150,
    quality: 'white',
    attrs: { def: 12, hp: 60 },
    desc: '寻常布匹缝制的道袍，轻便朴素。'
  },
  eq_am_iron: {
    id: 'eq_am_iron',
    name: '精铁轻甲',
    type: 'equip',
    slot: 'armor',
    reqLevel: 15,
    icon: '🛡️',
    price: 1500,
    quality: 'green',
    attrs: { def: 42, hp: 260 },
    desc: '由精铁细细密织的锁甲，可有效御防刀剑劈砍。'
  },
  eq_am_huangjin: {
    id: 'eq_am_huangjin',
    name: '锁子黄金甲',
    type: 'equip',
    slot: 'armor',
    reqLevel: 35,
    icon: '🦺',
    price: 9000,
    quality: 'purple',
    attrs: { def: 125, hp: 950, mdef: 60 },
    desc: '相传东海龙宫秘宝，通体纯金丝线交织，防御坚固，水火不侵。'
  },

  // 3. 头部
  eq_hd_bcap: {
    id: 'eq_hd_bcap',
    name: '逍遥纶巾',
    type: 'equip',
    slot: 'head',
    reqLevel: 0,
    icon: '🧢',
    price: 100,
    quality: 'white',
    attrs: { def: 6, mp: 40 },
    desc: '文人游历时喜戴的纶巾，清爽舒适。'
  },
  eq_hd_zijin: {
    id: 'eq_hd_zijin',
    name: '紫金凤翅冠',
    type: 'equip',
    slot: 'head',
    reqLevel: 30,
    icon: '👑',
    price: 6800,
    quality: 'blue',
    attrs: { def: 58, mp: 380, matk: 45 },
    desc: '两根雉鸡翎迎风摇曳，神采奕奕，能大幅蕴养头窍元神。'
  },

  // 4. 鞋子
  eq_bt_straw: {
    id: 'eq_bt_straw',
    name: '行路草鞋',
    type: 'equip',
    slot: 'boots',
    reqLevel: 0,
    icon: '🥾',
    price: 80,
    quality: 'white',
    attrs: { spd: 6, def: 4 },
    desc: '麻绳编织的草鞋，结实耐穿。'
  },
  eq_bt_zhuifeng: {
    id: 'eq_bt_zhuifeng',
    name: '追风踏云靴',
    type: 'equip',
    slot: 'boots',
    reqLevel: 25,
    icon: '👢',
    price: 4000,
    quality: 'blue',
    attrs: { spd: 32, def: 24, hp: 120 },
    desc: '铭刻御风法阵的长靴，行走如奔马，脚底生风。'
  },

  // 5. 腰带
  eq_bl_leather: {
    id: 'eq_bl_leather',
    name: '兽皮束腰',
    type: 'equip',
    slot: 'belt',
    reqLevel: 0,
    icon: '📿',
    price: 120,
    quality: 'white',
    attrs: { hp: 80, def: 5 },
    desc: '野兽生皮缝就的腰带，坚固耐拉扯。'
  },
  eq_bl_qixing: {
    id: 'eq_bl_qixing',
    name: '七星照夜带',
    type: 'equip',
    slot: 'belt',
    reqLevel: 30,
    icon: '🎗️',
    price: 5500,
    quality: 'purple',
    attrs: { hp: 550, def: 35, mp: 180 },
    desc: '镶嵌北斗七星石髓，光华流转，蕴藏磅礴生机元气。'
  },

  // 6. 项链 (挂链装备：赋予玩家五行属性，附加法力值与抗性、暴击、致命、反震、反击等属性)
  eq_nk_gold: {
    id: 'eq_nk_gold',
    name: '【金】破天纯金链',
    type: 'equip',
    slot: 'necklace',
    element: 'gold',
    reqLevel: 0,
    icon: '📿',
    price: 450,
    quality: 'green',
    attrs: { mp: 180, matk: 30, mdef: 15 },
    resists: { phy: 8, shesheng: 8 },
    critRate: 0.06,
    fatalRate: 0.03,
    counterAttackRate: 0.05,
    desc: '【金属性挂链】纯阳庚金淬炼神链，佩戴后赋予主人五行【金】属性！加法力值与物理抗性、抗舍生、暴击率与致命率！'
  },
  eq_nk_yu: {
    id: 'eq_nk_yu',
    name: '【木】苍玉碧波坠',
    type: 'equip',
    slot: 'necklace',
    element: 'wood',
    reqLevel: 0,
    icon: '📿',
    price: 150,
    quality: 'white',
    attrs: { mp: 160, matk: 20, mdef: 12 },
    resists: { phy: 6, shesheng: 6 },
    critRate: 0.04,
    counterAttackRate: 0.05,
    desc: '【木属性挂链】东海神木温玉雕琢而成的古朴挂坠，佩戴后赋予主人五行【木】属性！增加法力元海、抗性与反击率。'
  },
  eq_nk_water: {
    id: 'eq_nk_water',
    name: '【水】沧浪避水珠',
    type: 'equip',
    slot: 'necklace',
    element: 'water',
    reqLevel: 5,
    icon: '📿',
    price: 650,
    quality: 'green',
    attrs: { mp: 200, hp: 120, matk: 25 },
    resists: { phy: 8, shesheng: 8 },
    counterShockRate: 0.06,
    critRate: 0.04,
    desc: '【水属性挂链】东海灵蚌孕育的避水宝珠，佩戴后赋予主人五行【水】属性！提升法力气血与反震率！'
  },
  eq_nk_fire: {
    id: 'eq_nk_fire',
    name: '【火】离火朱雀锁',
    type: 'equip',
    slot: 'necklace',
    element: 'fire',
    reqLevel: 10,
    icon: '📿',
    price: 1500,
    quality: 'blue',
    attrs: { mp: 240, matk: 45, mdef: 25 },
    resists: { phy: 8, shesheng: 10 },
    critRate: 0.08,
    fatalRate: 0.04,
    counterShockRate: 0.05,
    desc: '【火属性挂链】天界离火灵髓精炼挂饰，佩戴后赋予主人五行【火】属性！大幅提升法力、暴击率与反震率！'
  },
  eq_nk_earth: {
    id: 'eq_nk_earth',
    name: '【土】戊土玄黄坠',
    type: 'equip',
    slot: 'necklace',
    element: 'earth',
    reqLevel: 10,
    icon: '📿',
    price: 1500,
    quality: 'blue',
    attrs: { mp: 260, hp: 200, def: 25 },
    resists: { phy: 12, shesheng: 12 },
    counterShockRate: 0.08,
    counterAttackRate: 0.05,
    desc: '【土属性挂链】昆仑神山厚土精魄所铸挂坠，佩戴后赋予主人五行【土】属性！极大提升气血法力与反震抗性！'
  },
  eq_nk_dinghun: {
    id: 'eq_nk_dinghun',
    name: '【土】九转定魂珠',
    type: 'equip',
    slot: 'necklace',
    element: 'earth',
    reqLevel: 35,
    icon: '🔮',
    price: 8500,
    quality: 'purple',
    attrs: { matk: 95, mdef: 80, mp: 400 },
    resists: { phy: 14, shesheng: 15, fengyin: 10 },
    counterShockRate: 0.10,
    desc: '【土属性挂链】地府泰山石敢当所炼魂珠，佩戴后赋予主人五行【土】属性！牢锁神魂，大幅激发元神法力与反震抗性。'
  },

  // === 剧情战利特级神装 ===
  eq_ring_baigu: {
    id: 'eq_ring_baigu',
    name: '【金】千年白骨幽魂戒',
    type: 'equip',
    slot: 'necklace',
    element: 'gold',
    reqLevel: 40,
    icon: '💍',
    price: 15000,
    quality: 'gold',
    attrs: { matk: 85, mdef: 70, hp: 350, mp: 350 },
    resists: { phy: 8, shesheng: 8, leiting: 8, fengyin: 8 },
    critRate: 0.10,
    fatalRate: 0.05,
    counterShockRate: 0.06,
    desc: '【金属性挂链】白虎岭白骨夫人万年尸骨精元凝结之宝戒，佩戴赋予五行【金】属性！令佩戴者全技能抗性、法力与体魄大幅提升！'
  },
  eq_wp_lengyue: {
    id: 'eq_wp_lengyue',
    name: '冷月追魂宝刀',
    type: 'equip',
    slot: 'weapon',
    reqLevel: 45,
    icon: '🗡️',
    price: 22000,
    quality: 'gold',
    attrs: { atk: 195, spd: 15, hp: 400 },
    desc: '西方奎木狼黄袍怪随身劈山神刃，寒气逼人，出鞘如冷月裂空，斩金断铁！'
  },

  // === 仙家魔兽要诀 (打书学习被动特技) ===
  book_high_critical: {
    id: 'book_high_critical',
    name: '魔兽要诀·高级必杀',
    type: 'pet_book',
    skillId: 'high_critical',
    skillName: '高级必杀',
    icon: '📕',
    price: 8000,
    quality: 'gold',
    desc: '研习领悟【高级必杀】，25%几率触发暴击（1.8倍伤害）。'
  },
  book_high_vampire: {
    id: 'book_high_vampire',
    name: '魔兽要诀·高级吸血',
    type: 'pet_book',
    skillId: 'high_vampire',
    skillName: '高级吸血',
    icon: '📗',
    price: 8500,
    quality: 'gold',
    desc: '研习领悟【高级吸血】，物理攻击将 35% 伤害转化为气血。'
  },
  book_high_rebirth: {
    id: 'book_high_rebirth',
    name: '魔兽要诀·高级神佑',
    type: 'pet_book',
    skillId: 'high_rebirth',
    skillName: '高级神佑',
    icon: '📘',
    price: 12000,
    quality: 'gold',
    desc: '研习领悟【高级神佑】，阵亡时 40% 几率满血复活。'
  },
  book_high_speed: {
    id: 'book_high_speed',
    name: '魔兽要诀·高级敏捷',
    type: 'pet_book',
    skillId: 'high_speed',
    skillName: '高级敏捷',
    icon: '📙',
    price: 6000,
    quality: 'purple',
    desc: '研习领悟【高级敏捷】，基础出手速度提升 30 点。'
  },
  book_high_sneak: {
    id: 'book_high_sneak',
    name: '魔兽要诀·高级偷袭',
    type: 'pet_book',
    skillId: 'high_sneak',
    skillName: '高级偷袭',
    icon: '📜',
    price: 7000,
    quality: 'purple',
    desc: '研习领悟【高级偷袭】，物理伤害提升 15%，免受反击反震。'
  },

  // === 运镖任务信物 ===
  biao_letter: {
    id: 'biao_letter',
    name: '大唐朝廷军饷镖银',
    type: 'quest_item',
    icon: '📦',
    price: 0,
    quality: 'blue',
    desc: '大唐朝廷军饷信物，需护送至前方关隘。'
  },

  // === 主线任务道具 ===
  item_fresh_mushroom: {
    id: 'item_fresh_mushroom',
    name: '野生青蘑菇',
    type: 'misc',
    icon: '🍄',
    price: 10,
    quality: 'white',
    desc: '刘家村野生青蘑菇，鲜嫩食材。'
  },
  item_dry_wood: {
    id: 'item_dry_wood',
    name: '坚韧柴木',
    type: 'misc',
    icon: '🪵',
    price: 15,
    quality: 'white',
    desc: '五行山百年枯树硬柴，耐烧火旺。'
  },

  // === 东海龙宫初级神装全套 (东海龙王敖广赔罪所赠) ===
  longgong_weapon: {
    id: 'longgong_weapon',
    name: '覆海点钢枪',
    type: 'equip',
    slot: 'weapon',
    reqLevel: 5,
    icon: '🔱',
    price: 1800,
    quality: 'blue',
    attrs: { atk: 68, matk: 42, spd: 8 },
    desc: '东海龙王特赠宝兵！枪身点钢冷冽，枪头龙须飘拂，刺出隐有狂澜怒涛之声！'
  },
  longgong_armor: {
    id: 'longgong_armor',
    name: '龙鳞轻钢甲',
    type: 'equip',
    slot: 'armor',
    reqLevel: 5,
    icon: '🥋',
    price: 1500,
    quality: 'blue',
    attrs: { def: 48, hp: 380 },
    desc: '以深海蛟龙蜕鳞密密织就的战甲，轻便坚韧，水火不侵！'
  },
  longgong_helmet: {
    id: 'longgong_helmet',
    name: '碧水定海盔',
    type: 'equip',
    slot: 'helmet',
    reqLevel: 5,
    icon: '🪖',
    price: 1200,
    quality: 'blue',
    attrs: { def: 32, mdef: 28, mp: 200 },
    desc: '龙宫匠师萃取深海寒铁精淬的战盔，清心护顶，神识大增！'
  },
  longgong_boots: {
    id: 'longgong_boots',
    name: '踏浪穿云靴',
    type: 'equip',
    slot: 'boots',
    reqLevel: 5,
    icon: '👢',
    price: 1200,
    quality: 'blue',
    attrs: { spd: 18, def: 22 },
    desc: '附着避水龙咒的皮靴，踏浪无痕，步履如疾风掠影！'
  },
  longgong_necklace: {
    id: 'longgong_necklace',
    name: '【水】龙珠凝霜佩',
    type: 'equip',
    slot: 'necklace',
    element: 'water',
    reqLevel: 5,
    icon: '📿',
    price: 1600,
    quality: 'blue',
    attrs: { hp: 220, matk: 38, mp: 250 },
    resists: { phy: 10, shesheng: 10 },
    critRate: 0.05,
    counterShockRate: 0.06,
    desc: '【水属性挂链】嵌有深渊千年水龙宝珠，佩戴后赋予主人五行【水】属性！极大拓宽气血与法力元海，提升抗舍生与反震率！'
  },

  // === 流沙河行李清缴奇珍与信物 ===
  qingquan_jiu: {
    id: 'qingquan_jiu',
    name: '清泉酒',
    type: 'consumable',
    icon: '🍶',
    price: 150,
    quality: 'blue',
    desc: '八戒私藏陈年美酒，使用后恢复 250 点法力。',
    effect: { mp: 250 }
  },
  liusha_speed_boots: {
    id: 'liusha_speed_boots',
    name: '流沙逐风靴',
    type: 'equip',
    slot: 'boots',
    reqLevel: 25,
    icon: '🥾',
    price: 3600,
    quality: 'blue',
    attrs: { spd: 45, def: 28, hp: 160 },
    desc: '从沉重经担底层清理出的行军长靴，经八戒多年试穿磨合，虽有些旧却被加持了神速法咒，穿上后身轻如燕，大幅提升出手速度与防御！'
  },
  wukong_eyelash: {
    id: 'wukong_eyelash',
    name: '大圣防风假睫毛',
    type: 'misc',
    icon: '✨',
    price: 999,
    quality: 'purple',
    desc: '傲来国订制纯金防风假睫毛，大圣趣怪奇珍。'
  },

  // === 万寿山五庄观至宝 ===
  renshen_guo: {
    id: 'renshen_guo',
    name: '草还丹·人参果',
    type: 'consumable',
    icon: '👶',
    price: 30000,
    quality: 'gold',
    desc: '五庄观人参果。永久提升 1500 气血与 800 法力上限，并补满状态。',
    effect: { hp: 99999, mp: 99999, maxHpBonus: 1500, maxMpBonus: 800 }
  },
  eq_am_hunyuan: {
    id: 'eq_am_hunyuan',
    name: '混元一气锦襕道袍',
    type: 'equip',
    slot: 'armor',
    reqLevel: 35,
    icon: '🥋',
    price: 18000,
    quality: 'gold',
    attrs: { def: 145, hp: 1200, mdef: 110, mp: 450 },
    desc: '地仙之祖镇元子亲赐的混元乾坤道袍！混元一气流转全身，刀枪不入，万法难侵，防御与体魄大幅跃升！'
  },

  // === 平顶山莲花洞至宝与老君金丹 ===
  jiuzhuan_xuandu_dan: {
    id: 'jiuzhuan_xuandu_dan',
    name: '九转玄都金丹',
    type: 'consumable',
    icon: '💊',
    price: 50000,
    quality: 'gold',
    desc: '兜率宫九转圣丹。永久提升 2000 气血与 1000 法力上限，并补满状态。',
    effect: { hp: 99999, mp: 99999, maxHpBonus: 2000, maxMpBonus: 1000 }
  },
  eq_wp_qixing: {
    id: 'eq_wp_qixing',
    name: '七星伏魔宝剑',
    type: 'equip',
    slot: 'weapon',
    reqLevel: 45,
    icon: '⚔️',
    price: 28000,
    quality: 'gold',
    attrs: { atk: 185, matk: 140, hit: 55, crit: 12, hp: 600 },
    desc: '太上老君炼魔随身神兵！剑身镂刻北斗七星玄奥古篆，挥动间星煞罡气纵横，大幅提升物理狂攻、法术威能与暴击率！'
  },
  zijin_hulu: {
    id: 'zijin_hulu',
    name: '紫金红葫芦·仙葫灵蕴',
    type: 'misc',
    icon: '🍶',
    price: 8888,
    quality: 'gold',
    desc: '老君紫金红葫芦灵蕴，降伏金角后所留信物。'
  },

  // === 苍茫三岭支线伏魔战利与道具 ===
  eq_peishi_heifeng: {
    id: 'eq_peishi_heifeng',
    name: '黑风辟邪玉佩',
    type: 'equip',
    slot: 'necklace',
    reqLevel: 30,
    icon: '📿',
    price: 12000,
    quality: 'purple',
    attrs: { hp: 450, def: 38, mdef: 42, mp: 200 },
    desc: '玄风道长珍藏多年的辟邪温玉，曾浸染过三岭正气。佩戴后可凝神御煞，大幅增加体魄生命与双抗！'
  },
  qingqiu_hudan: {
    id: 'qingqiu_hudan',
    name: '青丘妖狐内丹',
    type: 'quest_item',
    icon: '🔮',
    price: 500,
    quality: 'blue',
    desc: '青丘妖狐内丹，向玄风道长复命的凭据。'
  },
  shangren_jinnang: {
    id: 'shangren_jinnang',
    name: '残破的行商锦囊',
    type: 'quest_item',
    icon: '💼',
    price: 800,
    quality: 'blue',
    desc: '客商失落行囊，交付玄风道长可破狼患。'
  }
};

// 确保所有装备均具备最多 3 个宝石镶嵌孔位
Object.values(window.GAME_DATA.ITEMS).forEach(it => {
  if (it.type === 'equip') {
    it.maxSockets = 3;
  }
});
