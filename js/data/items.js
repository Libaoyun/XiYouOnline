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
    desc: '闯荡江湖必备的止血外伤药，使用后恢复 300 点气血。',
    effect: { hp: 300 }
  },
  dahuan_dan: {
    id: 'dahuan_dan',
    name: '大还丹',
    type: 'consumable',
    icon: '🔴',
    price: 350,
    desc: '名贵秘药，调理五脏六腑，使用后恢复 1200 点气血。',
    effect: { hp: 1200 }
  },
  foshou: {
    id: 'foshou',
    name: '佛手',
    type: 'consumable',
    icon: '🍃',
    price: 60,
    desc: '蕴含清凉甘露的灵果，使用后恢复 150 点法力精力。',
    effect: { mp: 150 }
  },
  biling_dan: {
    id: 'biling_dan',
    name: '碧灵丹',
    type: 'consumable',
    icon: '🔵',
    price: 400,
    desc: '道家纯阳真火炼制，使用后恢复 600 点法力。',
    effect: { mp: 600 }
  },
  jiuzhuan_dan: {
    id: 'jiuzhuan_dan',
    name: '九转还魂丹',
    type: 'consumable',
    icon: '⭐',
    price: 2000,
    desc: '太上老君兜率宫所出极品金丹！战斗中复活倒地目标并恢复 800 点气血。',
    effect: { revive: true, hp: 800 }
  },
  feixing_fu: {
    id: 'feixing_fu',
    name: '飞行符',
    type: 'consumable',
    icon: '📜',
    price: 150,
    desc: '仙家神符，念诵咒语可在弹指间瞬移返回繁华的【长安城】。',
    effect: { teleport: 'changan' }
  },

  // === 炼妖养成材料 ===
  jinliu_lu: {
    id: 'jinliu_lu',
    name: '金柳露',
    type: 'pet_item',
    icon: '🏺',
    price: 1500,
    desc: '观音菩萨玉净瓶中的圣水甘露。可对召唤兽进行彻底洗髓，重置等级为0并洗练出全新极品资质与技能！',
    effect: { washPet: true }
  },
  qianghua_shi: {
    id: 'qianghua_shi',
    name: '强化石',
    type: 'forge_item',
    icon: '💎',
    price: 1000,
    desc: '蕴含地脉精金之力的奇石，用于在长安铁匠铺对装备进行升星强化（+1 ~ +12）。',
    effect: { enhance: true }
  },
  dingxing_shi: {
    id: 'dingxing_shi',
    name: '定星石',
    type: 'forge_item',
    icon: '🔮',
    price: 3000,
    desc: '古老神石，强化高星级装备时使用，可防止强化失败时发生掉级或破损！',
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
    desc: '记载猛兽必杀绝技的残卷，可让召唤兽领悟【必杀】技能。'
  },
  book_lianji: {
    id: 'book_lianji',
    name: '魔兽要诀：连击',
    type: 'book',
    icon: '📘',
    price: 8000,
    skill: '连击',
    desc: '记载连续追击步法的神卷，可让召唤兽领悟【连击】技能。'
  },
  book_xixue: {
    id: 'book_xixue',
    name: '魔兽要诀：吸血',
    type: 'book',
    icon: '📙',
    price: 7500,
    skill: '吸血',
    desc: '记载修罗嗜血功法的秘籍，可让召唤兽领悟【吸血】技能。'
  },
  book_shenyousheng: {
    id: 'book_shenyousheng',
    name: '魔兽要诀：高神佑',
    type: 'book',
    icon: '👑',
    price: 20000,
    skill: '高级神佑复生',
    desc: '三界梦寐以求的顶级神书，死亡时有35%几率满血复活！'
  },

  // 更多仙家秘药
  xuelian_dan: {
    id: 'xuelian_dan',
    name: '天山雪莲丹',
    type: 'consumable',
    icon: '❄️',
    price: 1200,
    desc: '采自昆仑天山之巅万年雪莲，服用后迅速治愈重创，恢复 3000 点气血。',
    effect: { hp: 3000 }
  },
  zisang_lu: {
    id: 'zisang_lu',
    name: '紫桑玉露',
    type: 'consumable',
    icon: '🧪',
    price: 1000,
    desc: '蕴含西王母瑶池清气，服用后神清气爽，恢复 1200 点法力精力。',
    effect: { mp: 1200 }
  },

  // === 宝石系列 (可镶嵌于装备，最多3孔，加属性或专属抗性) ===
  gem_jingang: {
    id: 'gem_jingang',
    name: '金刚石',
    type: 'gem',
    icon: '💎',
    price: 3000,
    desc: '坚逾玄金的佛门神石，镶嵌后大幅提升抗物理普攻能力（抗普攻物理 +5%）。',
    bonus: { res_phy: 0.05 }
  },
  gem_sheli: {
    id: 'gem_sheli',
    name: '舍利子',
    type: 'gem',
    icon: '📿',
    price: 3200,
    desc: '高僧圆寂所化舍利，浩然清心，镶嵌后显著降低舍生取义受创（抗舍生 +6%）。',
    bonus: { res_shesheng: 0.06 }
  },
  gem_pilei: {
    id: 'gem_pilei',
    name: '辟雷珠',
    type: 'gem',
    icon: '⚡',
    price: 3200,
    desc: '蕴含导雷仙纹的神珠，镶嵌后有效削弱九天神雷伤害（抗雷霆 +6%）。',
    bonus: { res_leiting: 0.06 }
  },
  gem_dingfeng: {
    id: 'gem_dingfeng',
    name: '定风珠',
    type: 'gem',
    icon: '🌪️',
    price: 3200,
    desc: '西斯灵吉菩萨秘宝定风珠碎片，镶嵌后可抵御狂飙席卷（抗飞沙 +6%）。',
    bonus: { res_feisha: 0.06 }
  },
  gem_qingxin: {
    id: 'gem_qingxin',
    name: '清心玉',
    type: 'gem',
    icon: '🪷',
    price: 3500,
    desc: '万年寒玉髓雕琢，凝神定魄，镶嵌后降低被强行封印的几率（抗封印 +8%）。',
    bonus: { res_fengyin: 0.08 }
  },
  gem_dingshen: {
    id: 'gem_dingshen',
    name: '定身符玉',
    type: 'gem',
    icon: '🧿',
    price: 3500,
    desc: '铭刻破禁符咒的宝玉，镶嵌后降低被定身咒禁锢的几率（抗定身 +8%）。',
    bonus: { res_dingshen: 0.08 }
  },
  gem_hongmanao: {
    id: 'gem_hongmanao',
    name: '红玛瑙',
    type: 'gem',
    icon: '🔴',
    price: 2500,
    desc: '如烈火般绚烂的玛瑙，镶嵌后锋芒毕露，直接提升物理攻击力（攻击 +25）。',
    bonus: { atk: 25 }
  },
  gem_yueliang: {
    id: 'gem_yueliang',
    name: '月亮石',
    type: 'gem',
    icon: '🌕',
    price: 2500,
    desc: '吸收皎洁月华的灵石，坚硬如铁，镶嵌后提升厚重甲胄防御（防御 +20）。',
    bonus: { def: 20 }
  },
  gem_guangmang: {
    id: 'gem_guangmang',
    name: '光芒石',
    type: 'gem',
    icon: '✨',
    price: 2600,
    desc: '生生不息的光明之石，镶嵌后极大拓宽气血元海（气血上限 +150）。',
    bonus: { hp: 150 }
  },
  gem_heibaoshi: {
    id: 'gem_heibaoshi',
    name: '黑宝石',
    type: 'gem',
    icon: '⚫',
    price: 2800,
    desc: '深邃轻灵的暗夜灵石，镶嵌后身轻如燕抢占先机（出手速度 +8）。',
    bonus: { spd: 8 }
  },

  // === 杂物与法宝道具系列 ===
  silver_gourd: {
    id: 'silver_gourd',
    name: '紫竹银葫芦',
    type: 'misc',
    icon: '🍶',
    price: 800,
    desc: '落伽山紫竹灵木所铸法宝银葫芦！战斗中招降【散仙】级野怪必备法宝，成功率高达 70%！'
  },
  gold_gourd: {
    id: 'gold_gourd',
    name: '紫金红葫芦',
    type: 'misc',
    icon: '🏺',
    price: 2500,
    desc: '太上老君盛丹的上古通灵至宝！战斗中招降【金仙】级圣兽必备极品法宝，成功率高达 60%！'
  },
  talent_pill: {
    id: 'talent_pill',
    name: '天赋丹',
    type: 'consumable',
    icon: '🔮',
    price: 3500,
    desc: '上古九转仙气淬炼的天赋宝丹！喂食【金仙】品阶仙宠使用，单次永久增加 50 点元神变身天赋点 (上限 5000 点)！'
  },
  changan_huji: {
    id: 'changan_huji',
    name: '大唐长安户籍簿',
    type: 'misc',
    icon: '📜',
    price: 0,
    desc: '长安府衙所颁发的定居户籍文牒。持有可随时在各地土地神处“一键返回居住地”。'
  },
  jin_liu_lu: {
    id: 'jin_liu_lu',
    name: '金柳露',
    type: 'misc',
    icon: '🧴',
    price: 1500,
    desc: '三界通灵琼浆圣水！可在仙宠界面对任意仙宠进行【洗炼重铸】，将其重置为Lv.1幼年灵宠并彻底刷新资质与成长率，有机会洗出高成长绝品宝宝！'
  },
  meteor_iron: {
    id: 'meteor_iron',
    name: '天外陨铁',
    type: 'misc',
    icon: '🪨',
    price: 800,
    desc: '九天外坠落的星辰神铁，蕴含先天淬炼精气。可在长安城李铁匠处对装备进行【精炼强化】，大幅提升基础攻击与防御！'
  },
  bishui_zhu: {
    id: 'bishui_zhu',
    name: '避水神珠',
    type: 'misc',
    icon: '🔮',
    price: 5000,
    desc: '东海龙宫镇海至宝，佩之入汪洋深渊如履平地，散发温润水灵护罩，受水系法术伤害减免 30%。'
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

  // 6. 项链
  eq_nk_yu: {
    id: 'eq_nk_yu',
    name: '苍玉挂坠',
    type: 'equip',
    slot: 'necklace',
    reqLevel: 0,
    icon: '📿',
    price: 150,
    quality: 'white',
    attrs: { matk: 15, mdef: 10 },
    desc: '东海温玉雕琢而成的挂饰，平心静气。'
  },
  eq_nk_dinghun: {
    id: 'eq_nk_dinghun',
    name: '九转定魂珠',
    type: 'equip',
    slot: 'necklace',
    reqLevel: 35,
    icon: '🔮',
    price: 8500,
    quality: 'purple',
    attrs: { matk: 95, mdef: 80, mp: 300 },
    desc: '地府泰山石敢当所炼魂珠，牢锁神魂，大幅激发元神法力。'
  },

  // === 剧情战利特级神装 ===
  eq_ring_baigu: {
    id: 'eq_ring_baigu',
    name: '千年白骨幽魂戒',
    type: 'equip',
    slot: 'necklace',
    reqLevel: 40,
    icon: '💍',
    price: 15000,
    quality: 'gold',
    attrs: { matk: 85, mdef: 70, hp: 350 },
    resists: { phy: 8, shesheng: 8, leiting: 8, fengyin: 8 },
    desc: '白虎岭白骨夫人万年尸骨精元凝结之宝戒，通体幽光森森，令佩戴者全技能抗性与体魄大幅提升！'
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
    desc: '太古魔兽相传之秘卷！仙宠研习后领悟【高级必杀】，物理攻击时拥有 25% 几率触发暴击，造成 1.8 倍毁灭打击！'
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
    desc: '九幽修罗嗜血之术！仙宠研习后领悟【高级吸血】，物理攻击命中时将造成伤害的 35% 瞬间转化为自身气血！'
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
    desc: '瑶池神树涅槃之真谛！仙宠研习后领悟【高级神佑复生】，战斗中遭受致命伤害阵亡时有 40% 几率圣光涅槃，满血原地复活！'
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
    desc: '金翅大鹏御风神术！仙宠研习后领悟【高级敏捷】，基础出手速度额外提升 30 点，决胜抢占先机！'
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
    desc: '无形无相偷袭之妙法！仙宠研习后领悟【高级偷袭】，物理伤害额外永久提升 15%，且出手不受任何反击反震！'
  },

  // === 运镖任务信物 ===
  biao_letter: {
    id: 'biao_letter',
    name: '大唐朝廷军饷镖银',
    type: 'quest_item',
    icon: '📦',
    price: 0,
    quality: 'blue',
    desc: '长安总督衙门与大唐镖局所托之重金军饷，需沿陆路历经艰险送达前方要塞关隘，中途切莫遗失！'
  },

  // === 主线任务道具 ===
  item_fresh_mushroom: {
    id: 'item_fresh_mushroom',
    name: '野生青蘑菇',
    type: 'misc',
    icon: '🍄',
    price: 10,
    quality: 'white',
    desc: '在刘家村草地上采摘的新鲜野生青蘑菇，香气扑鼻，乃生火做饭的极佳食材。'
  },
  item_dry_wood: {
    id: 'item_dry_wood',
    name: '坚韧柴木',
    type: 'misc',
    icon: '🪵',
    price: 15,
    quality: 'white',
    desc: '五行山脚百年枯树精所掉落的干燥硬木，耐烧火旺，刘猎户烧柴做饭必不可少。'
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
    name: '龙珠凝霜佩',
    type: 'equip',
    slot: 'necklace',
    reqLevel: 5,
    icon: '📿',
    price: 1600,
    quality: 'blue',
    attrs: { hp: 220, matk: 38, mp: 150 },
    desc: '嵌有深渊千年水龙宝珠，温润凝神，极大拓宽气血与法力元海！'
  }
};

// 确保所有装备均具备最多 3 个宝石镶嵌孔位
Object.values(window.GAME_DATA.ITEMS).forEach(it => {
  if (it.type === 'equip') {
    it.maxSockets = 3;
  }
});
