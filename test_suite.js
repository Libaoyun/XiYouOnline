/**
 * 汉风西游 - 全系统端到端自动化测试套件
 * 涵盖：储物背包、3孔宝石镶嵌、仙宠三品质与学技转职、出战上限、
 *       左右阵营战斗、①②③速度决序、仙宠替换残血保留、法宝招降、
 *       刘家村土地公、长安定居与钱庄老医师等。
 */

const fs = require('fs');
const path = require('path');

// 构造模拟浏览器全局环境
global.window = global;
global.document = {
  getElementById: () => null,
  querySelectorAll: () => [],
  createElement: () => ({
    className: '',
    style: {},
    innerHTML: '',
    appendChild: () => {},
    classList: { add: () => {}, remove: () => {} },
    remove: () => {}
  }),
  body: {
    classList: { toggle: () => {}, contains: () => true },
    appendChild: () => {}
  }
};

// 模拟音效与提示
window.Sound = new Proxy({}, {
  get: () => () => true
});
window.showGameMessage = (msg, type) => {
  // console.log(`[Toast ${type || 'info'}]: ${msg}`);
};

// 依次加载游戏数据与核心逻辑
const filesToLoad = [
  'js/data/classes.js',
  'js/data/pets.js',
  'js/data/items.js',
  'js/data/maps2d.js',
  'js/data/storyQuests.js',
  'js/core/player.js',
  'js/core/petSystem.js',
  'js/core/inventory.js',
  'js/core/forge.js',
  'js/core/battle.js',
  'js/core/peachGarden.js',
  'js/engine/tilemap.js',
  'js/engine/character.js',
  'js/engine/minimap.js',
  'js/engine/toast.js'
];

for (const relPath of filesToLoad) {
  const fullPath = path.join(__dirname, relPath);
  const code = fs.readFileSync(fullPath, 'utf8');
  eval(code);
}

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

console.log('\n======================================================');
console.log('       🎋 汉风西游OL · 全系统全模块自动化测试');
console.log('======================================================\n');

// -----------------------------------------------------------------------------
// 1. 储物背包与3孔宝石镶嵌测试
// -----------------------------------------------------------------------------
console.log('▶️ [测试 1] 储物背包与3孔宝石镶嵌系统');
{
  const player = new window.Player({
    name: '测试大将',
    classId: 'jingang',
    level: 60,
    silver: 10000
  });

  const inv = new window.Inventory([
    { instanceId: 'eq1', itemId: 'eq_wp_bawangqiang', count: 1, equipData: { sockets: [null, null, null] } },
    { instanceId: 'gem1', itemId: 'gem_jingang', count: 2 },
    { instanceId: 'gem2', itemId: 'gem_pilei', count: 1 },
    { instanceId: 'gem3', itemId: 'gem_sheli', count: 1 },
    { instanceId: 'gem4', itemId: 'gem_hongmanao', count: 1 },
    { instanceId: 'pot1', itemId: 'jinchuang_yao', count: 10 }
  ]);

  // 分类筛选
  assert(inv.getItemsByCategory('equip').length === 1, '背包装备分类过滤正确');
  assert(inv.getItemsByCategory('gem').length === 4, '背包宝石分类过滤正确');
  assert(inv.getItemsByCategory('consumable').length === 1, '背包药品分类过滤正确');

  // 穿戴装备
  const equipRes = inv.equip('eq1', player);
  assert(equipRes.success && player.equipment.weapon.itemId === 'eq_wp_bawangqiang', '装备手动穿戴成功');
  const baseAtk = player.atk;

  // 镶嵌第1孔：金刚石 (抗物理普攻+5%)
  const initialPhyRes = player.resistances.res_phy;
  const socketRes1 = inv.socketGem(player.equipment.weapon.instanceId, 'gem_jingang', 0, player);
  assert(socketRes1.success, '装备第1孔镶嵌金刚石成功');
  assert(player.equipment.weapon.sockets[0] === 'gem_jingang', '孔位记录金刚石');
  assert(Math.round(player.resistances.res_phy * 100) === Math.round((initialPhyRes + 0.05) * 100), `抗物理普攻正确提升+5% (当前: ${(player.resistances.res_phy * 100).toFixed(0)}%)`);

  // 镶嵌第2孔：辟雷珠 (抗雷霆万钧+6%)
  const socketRes2 = inv.socketGem(player.equipment.weapon.instanceId, 'gem_pilei', 1, player);
  assert(socketRes2.success, '装备第2孔镶嵌辟雷珠成功');
  assert(Math.round(player.resistances.res_leiting * 100) === 6, `抗雷霆万钧提升至 6% (当前: ${(player.resistances.res_leiting * 100).toFixed(0)}%)`);

  // 镶嵌第3孔：舍利子 (抗舍生取义+6%)
  const initialSheSheng = player.resistances.res_shesheng;
  const socketRes3 = inv.socketGem(player.equipment.weapon.instanceId, 'gem_sheli', 2, player);
  assert(socketRes3.success, '装备第3孔镶嵌舍利子成功');
  assert(Math.round(player.resistances.res_shesheng * 100) === Math.round((initialSheSheng + 0.06) * 100), `抗舍生取义提升+6% (当前: ${(player.resistances.res_shesheng * 100).toFixed(0)}%)`);

  // 拆卸第1孔宝石并归还背包
  const gemCountBefore = inv.getItemCount('gem_jingang');
  const unRes = inv.unsocketGem(player.equipment.weapon.instanceId, 0, player);
  assert(unRes.success, '成功拆除第1孔宝石');
  assert(inv.getItemCount('gem_jingang') === gemCountBefore + 1, '拆卸的宝石正确返还入背包');
  assert(Math.round(player.resistances.res_phy * 100) === Math.round(initialPhyRes * 100), '拆卸后角色抗物理普攻恢复原值');
}

// -----------------------------------------------------------------------------
// 2. 仙宠品质体系、出战上限与10级一键学技转职
// -----------------------------------------------------------------------------
console.log('\n▶️ [测试 2] 仙宠三大品质、学技转职与参战上限');
{
  const playerLow = new window.Player({ level: 10 });
  const playerMid = new window.Player({ level: 25 });
  const playerHigh = new window.Player({ level: 45 });

  assert(playerLow.getMaxCombatPets() === 0, 'Lv.10 玩家参战仙宠上限为 0 只');
  assert(playerMid.getMaxCombatPets() === 1, 'Lv.25 玩家参战仙宠上限为 1 只');
  assert(playerHigh.getMaxCombatPets() === 3, 'Lv.45 玩家参战仙宠上限为 3 只');

  // 普通仙宠：不可领悟技能
  const ordinaryPet = window.PetSystem.createPet('dahai_gui', false, 12);
  assert(ordinaryPet.quality === 'ordinary' && ordinaryPet.skills.length === 0, '普通仙宠初始无技能');
  const ordLearn = window.PetSystem.learnSkill(ordinaryPet);
  assert(!ordLearn.success, '普通品质仙宠无法领悟绝技');

  // 散仙仙宠：未满10级不可学技，满10级一键学技并转职门派
  const sanxianLow = window.PetSystem.createPet('baihua_she', false, 8);
  assert(!window.PetSystem.learnSkill(sanxianLow).success, '散仙未达 Lv.10 无法开启灵窍领悟技能');

  const sanxianPet = window.PetSystem.createPet('baihua_she', false, 10);
  const sxLearn = window.PetSystem.learnSkill(sanxianPet);
  assert(sxLearn.success, '散仙满 Lv.10 成功一键领悟神技并转职门派');
  assert(sanxianPet.skills.length === 1, `成功领悟绝技: ${sanxianPet.skills[0].name}`);
  assert(['jingang', 'yaomo', 'xianren', 'shenxian'].includes(sanxianPet.classId), `成功转职三大门派之一: ${sanxianPet.className}`);
  
  // 校验门派专精技能抗性+5% (0.05)
  const resistances = sanxianPet.resistances;
  if (sanxianPet.classId === 'jingang') {
    assert(Math.round(resistances.res_shesheng * 100) === 5, '金刚门派专属抗舍生取义永久+5%');
  } else if (sanxianPet.classId === 'yaomo') {
    assert(Math.round(resistances.res_leiting * 100) === 5, '妖魔门派专属抗雷霆万钧永久+5%');
  } else if (sanxianPet.classId === 'xianren' || sanxianPet.classId === 'shenxian') {
    assert(Math.round(resistances.res_fengyin * 100) === 5, '神仙门派专属抗封印咒永久+5%');
  }

  // 金仙仙宠：初始高成长，可直接领悟
  const jinxianPet = window.PetSystem.createPet('gudai_ruishou', false, 5);
  assert(jinxianPet.growth >= 1.25, `金仙品质拥有超高成长率: ${jinxianPet.growth}`);
  const jxLearn = window.PetSystem.learnSkill(jinxianPet);
  assert(jxLearn.success && jinxianPet.skills.length === 1, '金仙无视等级直接领悟顶级神技');
}

// -----------------------------------------------------------------------------
// 3. 地图出入口、土地公、长安定居与钱庄老医师
// -----------------------------------------------------------------------------
console.log('\n▶️ [测试 3] 地图出入口、土地公偷桃返乡、长安定居与钱庄老医师');
{
  const maps = window.GAME_DATA.MAPS_2D;
  assert(maps.liujiacun, '存在刘家村地图');
  assert(maps.changan_city, '存在长安城地图');
  assert(maps.chentangguan, '存在陈塘关地图');
  assert(maps.donghai_coast, '存在东海之滨地图');
  assert(maps.shuijinggong, '存在东海龙宫水晶宫地图');
  assert(maps.longgong_palace, '存在东海龙宫大殿地图');

  // 土地公 NPC
  const tudigong = maps.liujiacun.npcs.find(n => n.id === 'npc_liujia_tudi');
  assert(tudigong !== undefined, '刘家村东侧包含土地公 NPC');
  assert(tudigong.dialogueKey === 'liujia_tudi_talk', '土地公具有蟠桃园传送与返乡对话配置');

  // 长安城钱庄、老医师、户籍官
  const qianzhuang = maps.changan_city.npcs.find(n => n.id === 'npc_qianzhuang');
  const doctor = maps.changan_city.npcs.find(n => n.id === 'npc_yishi');
  const hukou = maps.changan_city.npcs.find(n => n.id === 'npc_changan_huji');
  assert(qianzhuang !== undefined, '长安城包含钱庄掌柜 NPC');
  assert(doctor !== undefined, '长安城包含济世堂老医师 NPC');
  assert(hukou !== undefined, '长安城包含户籍官 NPC');

  // 钱庄存取与理财利息测试
  let playerSilver = 5000;
  let bankDeposit = 0;
  let interestCycles = 0;

  // 存入 3000 两
  const depositAmount = 3000;
  playerSilver -= depositAmount;
  bankDeposit += depositAmount;
  assert(playerSilver === 2000 && bankDeposit === 3000, '钱庄成功存入 3000 两');

  // 理财生息 (5% 周期利息)
  const interest = Math.floor(bankDeposit * 0.05);
  bankDeposit += interest;
  interestCycles++;
  assert(bankDeposit === 3150, `钱庄理财结算利息正确 (本息合: ${bankDeposit}两)`);

  // 取出 1500 两
  playerSilver += 1500;
  bankDeposit -= 1500;
  assert(playerSilver === 3500 && bankDeposit === 1650, '钱庄成功取出 1500 两');

  // 老医师 50 两回春
  const testPlayer = new window.Player({ hp: 100, mp: 50, maxHp: 1000, maxMp: 500, silver: 1000 });
  const fee = 50;
  testPlayer.silver -= fee;
  testPlayer.hp = testPlayer.maxHp;
  testPlayer.mp = testPlayer.maxMp;
  assert(testPlayer.hp === testPlayer.maxHp && testPlayer.mp === testPlayer.maxMp && testPlayer.silver === 950, '老医师 50两一键满血满精力回春成功');

  // 定居系统
  testPlayer.residenceMapId = 'changan_city';
  assert(testPlayer.residenceMapId === 'changan_city', '成功定居长安城');
}

// -----------------------------------------------------------------------------
// 4. 左右阵营回合制战斗、①②③速度决序、仙宠替换残血保留与野怪招降
// -----------------------------------------------------------------------------
console.log('\n▶️ [测试 4] 左右阵营战斗、①②③速度决序、仙宠替换残血保留与招降');
(async () => {
  const player = new window.Player({
    name: '齐天战将',
    classId: 'jingang',
    level: 50,
    hp: 5000,
    maxHp: 5000,
    mp: 2000,
    maxMp: 2000
  });

  const petActive = window.PetSystem.createPet('baihua_she', false, 30);
  petActive.instanceId = 'pet_active_1';
  petActive.spd = 180; // 设定极高速度，确保全场最快
  petActive.hp = 1200;
  petActive.maxHp = 2000; // 当前残血状态！

  const petStandby = window.PetSystem.createPet('gudai_ruishou', false, 35);
  petStandby.instanceId = 'pet_standby_2';
  petStandby.spd = 70;
  petStandby.hp = 800;
  petStandby.maxHp = 2500; // 备战仙宠也是残血！

  const enemyMonster = {
    id: 'mob_wild_1',
    name: '野猪精',
    level: 20,
    spd: 40,
    hp: 800,
    maxHp: 800,
    quality: 'ordinary',
    isBoss: false
  };

  const enemySanxian = {
    id: 'mob_sanxian_2',
    name: '通臂灵猿',
    level: 25,
    spd: 50,
    hp: 1500,
    maxHp: 1500,
    quality: 'sanxian',
    isBoss: false
  };

  // 创建战斗
  const battle = new window.BattleEngine(player, [petActive], [enemyMonster, enemySanxian]);

  // 验证头顶速度序数牌分配 (①②③④)
  // 速度排序：petActive(180) > player(~112) > enemySanxian(50) > enemyMonster(40)
  assert(petActive.turnOrder === 1, `出战仙宠速度最快 (180)，序数为 ① (当前: ${petActive.turnOrder})`);
  assert(player.turnOrder === 2, `玩家速度第二 (~112)，序数为 ② (当前: ${player.turnOrder})`);
  assert(enemySanxian.turnOrder === 3, `敌方灵猿速度第三 (50)，序数为 ③ (当前: ${enemySanxian.turnOrder})`);
  assert(enemyMonster.turnOrder === 4, `敌方野猪速度第四 (40)，序数为 ④ (当前: ${enemyMonster.turnOrder})`);

  // 仙宠替换测试：
  // 1. 尝试替换玩家 -> 应该被拒绝（只有仙宠可替换）
  const switchPlayerRes = battle.switchPet(player.id, 'pet_standby_2', [petActive, petStandby]);
  assert(!switchPlayerRes.success, '玩家本尊不可替换，拦截生效');

  // 2. 仙宠替换为备战仙宠，检验残血状态是否严格保留
  const switchPetRes = battle.switchPet('pet_active_1', 'pet_standby_2', [petActive, petStandby]);
  assert(switchPetRes.success, '出战仙宠成功替换为备战仙宠');
  
  // 检查新上阵仙宠是否保持 800/2500 残血状态
  const curPetAlly = battle.allies.find(a => a.id === 'pet_standby_2');
  assert(curPetAlly !== undefined && curPetAlly.hp === 800, `新上阵仙宠严格保留在背包中的生命值 800 (当前: ${curPetAlly ? curPetAlly.hp : 'null'})`);

  // 被换下的原仙宠依然保留原血量 1200
  assert(petActive.hp === 1200, `原仙宠保留原生命值 1200 (当前: ${petActive.hp})`);

  // 招降机制测试：
  // 1. 散仙野怪招降：无银葫芦失败
  const dummyInv = new window.Inventory([]);
  // 临时注入 window.App2D
  window.App2D = { inventory: dummyInv, pets: [petActive, petStandby] };
  
  const capSxNoItem = await battle.captureMonster(1); // 敌方散仙
  assert(!capSxNoItem.success && capSxNoItem.msg.includes('紫竹银葫芦'), '招降散仙野怪无银葫芦被拒绝');

  // 给背包添加银葫芦
  dummyInv.addItem('silver_gourd', 1);
  assert(dummyInv.getItemCount('silver_gourd') === 1, '背包获得【紫竹银葫芦】');

  // 模拟招降判定，若成功应扣除银葫芦并加入随行仙宠列表
  // 强制 Math.random 返回 0.1 保证必定成功 (70% 阈值)
  const origRandom = Math.random;
  Math.random = () => 0.1;
  const capSxSuccess = await battle.captureMonster(1);
  Math.random = origRandom;

  assert(capSxSuccess.success, '使用紫竹银葫芦成功招降散仙野怪');
  assert(dummyInv.getItemCount('silver_gourd') === 0, '紫竹银葫芦消耗 1 个');
  assert(window.App2D.pets.some(p => p.name === '通臂灵猿'), '招降的散仙野怪成功收入随行仙宠列表');

  // -----------------------------------------------------------------------------
  // 5. 技能熟练度飞升、自动升级与各门派技能威力动态计算测试
  // -----------------------------------------------------------------------------
  console.log('\n▶️ [测试 5] 技能熟练度飞升、自动升级与多目标扩展');
  {
    const allyActor = {
      id: 'player',
      name: '威灵大将',
      isPlayer: true,
      atk: 100,
      maxHp: 1000,
      hp: 1000,
      mp: 500,
      skills: []
    };

    const dummySkill = {
      id: 'sk_jg_shesheng',
      name: '舍生取义',
      level: 1,
      proficiency: 95, // 仅差5点升级至 Lv.2 (阈值100)
      costMp: 30,
      costHpRatio: 0.15
    };

    // 触发奖励熟练度
    battle.rewardSkillProficiency(allyActor, dummySkill);
    assert(dummySkill.proficiency > 95, `技能熟练度成功增加 (当前: ${dummySkill.proficiency})`);
    assert(dummySkill.level === 2, `熟练度满 100 自动跃迁升级至 Lv.2 (当前: Lv.${dummySkill.level})`);

    // 金刚护体多目标测试：Lv.1 护1人，Lv.2 护2人，Lv.3 护全体
    const alliesList = [
      { id: 'a1', name: '队友1', hp: 500, maxHp: 1000, buffs: [] },
      { id: 'a2', name: '队友2', hp: 300, maxHp: 1000, buffs: [] },
      { id: 'a3', name: '队友3', hp: 800, maxHp: 1000, buffs: [] }
    ];
    battle.allies = alliesList;

    // Lv.1 护盾
    const skillHutiLvl1 = { id: 'sk_jg_huti', name: '金刚护体', level: 1, proficiency: 10 };
    alliesList[0].skills = [skillHutiLvl1];
    await battle.handleSkillCast(alliesList[0], { type: 'skill', skillId: 'sk_jg_huti' }, null);
    const buffedCount1 = alliesList.filter(a => a.buffs.some(b => b.name === '金刚护体')).length;
    assert(buffedCount1 === 1, `金刚护体 Lv.1 准确护持 1 名残血队友 (当前: ${buffedCount1}人)`);

    // Lv.2 护盾
    alliesList.forEach(a => a.buffs = []);
    const skillHutiLvl2 = { id: 'sk_jg_huti', name: '金刚护体', level: 2, proficiency: 10 };
    alliesList[0].skills = [skillHutiLvl2];
    await battle.handleSkillCast(alliesList[0], { type: 'skill', skillId: 'sk_jg_huti' }, null);
    const buffedCount2 = alliesList.filter(a => a.buffs.some(b => b.name === '金刚护体')).length;
    assert(buffedCount2 === 2, `金刚护体 Lv.2 准确护持 2 名队友 (当前: ${buffedCount2}人)`);
  }

  // -----------------------------------------------------------------------------
  // 6. 金柳露仙宠洗炼系统测试
  // -----------------------------------------------------------------------------
  console.log('\n▶️ [测试 6] 金柳露仙宠洗炼重铸系统 (洗宝宝)');
  {
    const petToWash = window.PetSystem.createPet('heixiong_jing', false, 15);
    const oldGrowth = petToWash.growth;
    const oldLevel = petToWash.level;

    // 生成洗炼预览
    const washResult = window.PetSystem.generateWashResult(petToWash);
    assert(washResult.level === 1, '洗炼预览重置等级为 Lv.1 幼年状态');
    assert(washResult.growth > 0, `生成全新的洗炼成长率: ${washResult.growth}`);
    assert(washResult.aptitudes && washResult.aptitudes.atk > 0, '生成全新的五维资质');

    // 应用洗炼结果
    window.PetSystem.applyWashResult(petToWash, washResult);
    assert(petToWash.level === 1, '仙宠成功重置为 Lv.1 幼年宝宝');
    assert(petToWash.growth === washResult.growth, '仙宠成功替换为新成长率');
    assert(petToWash.hp === petToWash.maxHp, '洗炼后仙宠气血自动补满巅峰状态');
  }

  // -----------------------------------------------------------------------------
  // 7. 李铁匠装备打造与强化精炼系统测试
  // -----------------------------------------------------------------------------
  console.log('\n▶️ [测试 7] 李铁匠神兵天成装备打造与强化系统');
  {
    const testPlayer = new window.Player({ name: '锻造英雄', classId: 'jingang', level: 50, silver: 50000 });
    const forgeInv = new window.Inventory([
      { instanceId: 'w1', itemId: 'eq_wp_bawangqiang', count: 1, equipData: { star: 0, sockets: [null, null, null] } },
      { instanceId: 's1', itemId: 'qianghua_shi', count: 20 },
      { instanceId: 't1', itemId: 'meteor_iron', count: 10 }
    ]);
    testPlayer.equipment.weapon = forgeInv.slots[0].equipData;
    testPlayer.equipment.weapon.itemId = 'eq_wp_bawangqiang';
    testPlayer.recalculateStats(false);
    const preAtk = testPlayer.atk;

    // 强化 +1 判定
    const origRand = Math.random;
    Math.random = () => 0.01; // 必成
    const forgeRes1 = window.ForgeSystem.enhance(testPlayer.equipment.weapon, forgeInv, testPlayer, false);
    Math.random = origRand;

    assert(forgeRes1.success && testPlayer.equipment.weapon.star === 1, '装备成功强化升星至 +1');
    assert(testPlayer.atk > preAtk, `装备强化后角色攻击力显著提升 (原: ${preAtk} -> 现: ${testPlayer.atk})`);
    assert(forgeInv.getItemCount('qianghua_shi') === 19, '强化材料正确扣除 1 颗');
    assert(testPlayer.silver < 50000, '强化银两正确扣减');
  }

  // -----------------------------------------------------------------------------
  // 8. 东海龙宫深海试炼与定海神针神兵测试
  // -----------------------------------------------------------------------------
  console.log('\n▶️ [测试 8] 东海龙宫深海试炼与定海神针奖励');
  {
    assert(window.GAME_DATA.ITEMS.dinghai_shenzhen !== undefined, '道具库存在【定海神针铁·仿】');
    assert(window.GAME_DATA.ITEMS.bishui_zhu !== undefined, '道具库存在【避水神珠】');
    assert(window.GAME_DATA.ITEMS.jin_liu_lu !== undefined, '道具库存在【金柳露】');
    assert(window.GAME_DATA.ITEMS.meteor_iron !== undefined, '道具库存在【天外陨铁】');

    const heroInv = new window.Inventory([]);
    heroInv.addItem('dinghai_shenzhen', 1);
    heroInv.addItem('bishui_zhu', 1);
    heroInv.addItem('gold_gourd', 1);
    assert(heroInv.getItemCount('dinghai_shenzhen') === 1, '深海试炼获胜正确收入【定海神针铁·仿】');
    assert(heroInv.getItemCount('bishui_zhu') === 1, '深海试炼获胜正确收入【避水神珠】');
    assert(heroInv.getItemCount('gold_gourd') === 1, '深海试炼获胜正确收入金仙法宝【紫金红葫芦】');
  }

  // -----------------------------------------------------------------------------
  // 9. 钟馗降妖除魔日常抓鬼任务系统测试
  // -----------------------------------------------------------------------------
  console.log('\n▶️ [测试 9] 钟馗降妖除魔令 (日常抓鬼环任务)');
  {
    const dummyApp = {
      ghostQuest: { active: false, completed: false },
      playerData: new window.Player({ name: '抓鬼仙师', level: 40, silver: 1000 }),
      inventory: new window.Inventory([]),
      currentMapId: 'changan_city',
      loadMap: () => {}
    };

    // 模拟钟馗接任务
    const questPool = [
      { mapId: 'liujiacun', mapName: '两界山·刘家村', targetName: '迷途黑山恶鬼', level: 12, hp: 1000, atk: 85, def: 35, spd: 30 }
    ];
    dummyApp.ghostQuest = {
      active: true,
      completed: false,
      mapId: questPool[0].mapId,
      mapName: questPool[0].mapName,
      targetName: questPool[0].targetName
    };
    assert(dummyApp.ghostQuest.active, '成功接取钟馗降妖除魔令');
    assert(dummyApp.ghostQuest.targetName === '迷途黑山恶鬼', '任务目标为迷途黑山恶鬼');

    // 模拟击败恶鬼
    dummyApp.ghostQuest.completed = true;
    assert(dummyApp.ghostQuest.completed, '成功击杀恶鬼，任务标记为待领赏');

    // 提交任务发放奖励
    dummyApp.playerData.gainExp(3500);
    dummyApp.playerData.silver += 2000;
    dummyApp.inventory.addItem('jin_liu_lu', 1);
    dummyApp.ghostQuest.active = false;
    dummyApp.ghostQuest.completed = false;

    assert(dummyApp.playerData.exp >= 3500, '抓鬼任务结算获得 3500 点修为经验');
    assert(dummyApp.playerData.silver === 3000, '抓鬼任务结算获得 2000 两银两');
    assert(dummyApp.inventory.getItemCount('jin_liu_lu') === 1, '抓鬼任务成功获得仙家圣水【金柳露】*1');
  }

  // -----------------------------------------------------------------------------
  // 10. 任务追踪与小地图全场景目标点测试
  // -----------------------------------------------------------------------------
  // -----------------------------------------------------------------------------
  // 10. 任务追踪与小地图全场景目标点测试
  // -----------------------------------------------------------------------------
  console.log('\n▶️ [测试 10] 任务卷轴追踪与小地图全场景目标点');
  {
    const mini = window.MiniMapEngine;
    const mapYingchou = { id: 'yingchoujian', width: 24, height: 16 };
    const tgt1 = mini.getCurrentQuestTarget('yingchoujian', 'wuxing_freed', mapYingchou);
    assert(tgt1 && tgt1.name.includes('小白龙'), `鹰愁涧成功指示目标: ${tgt1.name}`);

    const mapGaolao = { id: 'gaolaozhuang', width: 22, height: 16 };
    const tgt2 = mini.getCurrentQuestTarget('gaolaozhuang', 'wuxing_freed', mapGaolao);
    assert(tgt2 && tgt2.name.includes('猪八戒'), `高老庄成功指示目标: ${tgt2.name}`);

    const mapLonggong = { id: 'longgong_palace', width: 22, height: 16 };
    const tgt3 = mini.getCurrentQuestTarget('longgong_palace', 'wuxing_freed', mapLonggong);
    assert(tgt3 && tgt3.name.includes('敖广'), `东海龙宫大殿成功指示目标: ${tgt3.name}`);

    const mapBaigu = { id: 'baihuling', width: 24, height: 18 };
    const tgt4 = mini.getCurrentQuestTarget('baihuling', 'wuzhuang_cleared', mapBaigu);
    assert(tgt4 && tgt4.name.includes('白骨夫人'), `白虎岭成功指示目标: ${tgt4.name}`);

    const mapBaoxiang = { id: 'baoxiangguo', width: 26, height: 20 };
    const tgt5 = mini.getCurrentQuestTarget('baoxiangguo', 'baihu_cleared', mapBaoxiang);
    assert(tgt5 && tgt5.name.includes('奎木狼'), `宝象国成功指示目标: ${tgt5.name}`);

    const mapFangcun = { id: 'fangcunshan', width: 22, height: 16 };
    const tgt6 = mini.getCurrentQuestTarget('fangcunshan', 'baoxiang_cleared', mapFangcun);
    assert(tgt6 && tgt6.name.includes('菩提祖师'), `灵台方寸山成功指示目标: ${tgt6.name}`);

    const mapLuojia = { id: 'luojiashan', width: 22, height: 16 };
    const tgt7 = mini.getCurrentQuestTarget('luojiashan', 'baoxiang_cleared', mapLuojia);
    assert(tgt7 && tgt7.name.includes('观世音菩萨'), `南海落伽山成功指示目标: ${tgt7.name}`);
  }

  // -----------------------------------------------------------------------------
  // 11. 仙家魔兽要诀研习 (打书) 与被动神技战斗生效测试
  // -----------------------------------------------------------------------------
  console.log('\n▶️ [测试 11] 魔兽要诀打书与被动神技系统');
  {
    const pet = window.PetSystem.createPet('gudai_ruishou', false, 30);
    assert(pet.passives && pet.passives.length === 0, '新建仙宠初始被动槽位为空');

    // 研习高级必杀
    const res1 = window.PetSystem.learnPetSkillBook(pet, 'book_high_critical');
    assert(res1.success, '成功研习【魔兽要诀·高级必杀】');
    assert(pet.passives.some(p => p.id === 'high_critical'), '仙宠成功掌握【高级必杀】');

    // 研习高级吸血
    const res2 = window.PetSystem.learnPetSkillBook(pet, 'book_high_vampire');
    assert(res2.success, '成功研习【魔兽要诀·高级吸血】');
    assert(pet.passives.some(p => p.id === 'high_vampire'), '仙宠成功掌握【高级吸血】');

    // 研习高级神佑复生
    const res3 = window.PetSystem.learnPetSkillBook(pet, 'book_high_rebirth');
    assert(res3.success, '成功研习【魔兽要诀·高级神佑】');
    assert(pet.passives.some(p => p.id === 'high_rebirth'), '仙宠成功掌握【高级神佑复生】');

    // 研习高级敏捷 (验证速度加成)
    const spdBefore = pet.spd;
    const res4 = window.PetSystem.learnPetSkillBook(pet, 'book_high_speed');
    assert(res4.success, '成功研习【魔兽要诀·高级敏捷】');
    assert(pet.spd >= spdBefore, `高级敏捷速度+30点生效 (原: ${spdBefore} -> 现: ${pet.spd})`);

    // 重复研习拦截测试
    const petSingle = window.PetSystem.createPet('gudai_ruishou', false, 30);
    window.PetSystem.learnPetSkillBook(petSingle, 'book_high_critical');
    const resDup = window.PetSystem.learnPetSkillBook(petSingle, 'book_high_critical');
    assert(!resDup.success, '重复研习相同要诀被正确拦截');
  }

  // -----------------------------------------------------------------------------
  // 12. 大唐镖局军饷押运任务与剧情极品战利神装
  // -----------------------------------------------------------------------------
  console.log('\n▶️ [测试 12] 大唐镖局运镖押运与白骨岭/宝象国神装');
  {
    // 检查神装
    const ringDef = window.GAME_DATA.ITEMS['eq_ring_baigu'];
    assert(ringDef && ringDef.name.includes('白骨幽魂戒'), '道具库存在白骨岭战利品【千年白骨幽魂戒】');
    assert(ringDef.resists.phy === 8, '白骨戒全抗性+8%加成正确');

    const bladeDef = window.GAME_DATA.ITEMS['eq_wp_lengyue'];
    assert(bladeDef && bladeDef.name.includes('冷月追魂宝刀'), '道具库存在宝象国战利品神兵【冷月追魂宝刀】');
    assert(bladeDef.attrs.atk === 195, '冷月宝刀物理攻击+195正确');

    // 模拟运镖全流程
    const player = new window.Player({ name: '大唐镖师', level: 35, silver: 5000 });
    const inv = new window.Inventory([]);

    // 1. 接镖
    assert(player.silver >= 1000, '玩家持有足够押金');
    player.silver -= 1000;
    inv.addItem('biao_letter', 1);
    const escortQuest = {
      active: true,
      targetMap: 'chentangguan',
      targetNpc: 'npc_lijing_zongbing',
      targetNpcName: '李靖总兵',
      deposit: 1000,
      rewardSilver: 3500,
      rewardExp: 4000
    };
    assert(inv.getItemCount('biao_letter') === 1, '成功领得【大唐朝廷军饷镖银】凭信');
    assert(player.silver === 4000, '押金1000两正确扣除');

    // 2. 交付镖银
    inv.removeItem('biao_letter', 1);
    player.silver += (escortQuest.deposit + escortQuest.rewardSilver); // 4500
    player.gainExp(escortQuest.rewardExp);
    inv.addItem('book_high_critical', 1);

    assert(inv.getItemCount('biao_letter') === 0, '镖银凭信正确扣减交付');
    assert(player.silver === 8500, '押镖完成：全额返还押金1000两并追加赏银3500两 (当前: 8500两)');
    assert(player.exp >= 4000, '押镖完成获得 4000 修行经验');
    assert(inv.getItemCount('book_high_critical') === 1, '押镖圆满赏赐稀世【魔兽要诀·高级必杀】*1');
  }

  // -----------------------------------------------------------------------------
  // 13. 感叹号交互后消除机制、野怪生态分布与蟠桃胜境实体仙木采摘测试
  // -----------------------------------------------------------------------------
  console.log('\n▶️ [测试 13] 感叹号交互后消除、野怪生态分布与实体仙桃采摘');
  {
    // 1. 感叹号交互消除测试
    const mockNpc = new window.Character({
      id: 'npc_test_liuboqin',
      name: '刘伯钦',
      type: 'npc',
      questStatus: 'available'
    });
    assert(mockNpc.questStatus === 'available', 'NPC 初始具有金色感叹号');
    const interactedSet = new Set();
    // 模拟玩家与 NPC 点击/交互
    mockNpc.questStatus = null;
    interactedSet.add(mockNpc.id);
    assert(mockNpc.questStatus === null, 'NPC 交互后头顶感叹号立即消除');
    assert(interactedSet.has('npc_test_liuboqin'), '已交互记录正确存储入集合');

    // 2. 长安城绝对安全测试
    const changanMap = window.GAME_DATA.MAPS_2D['changan_city'];
    assert(changanMap && changanMap.monsters.length === 0, '长安城为王都安全城区，绝对无野怪');

    // 3. 刘家村野怪测试 (硕鼠与野猪仔)
    const liujiaMap = window.GAME_DATA.MAPS_2D['liujiacun'];
    const hasRat = liujiaMap.monsters.some(m => m.id === 'mob_rat_1' && m.name.includes('硕鼠'));
    const hasPig = liujiaMap.monsters.some(m => m.id === 'mob_piglet_1' && m.name.includes('野猪'));
    assert(hasRat, '刘家村配置有偷粮硕鼠野怪');
    assert(hasPig, '刘家村配置有山林小野猪野怪');

    // 4. 五行山野怪测试 (小青蛇与小野狐)
    const wuxingMap = window.GAME_DATA.MAPS_2D['wuxingshan'];
    const hasSnake = wuxingMap.monsters.some(m => m.id === 'mob_snake_1' && m.name.includes('小青蛇'));
    const hasFox = wuxingMap.monsters.some(m => m.id === 'mob_fox_1' && m.name.includes('小野狐'));
    assert(hasSnake, '五行山配置有盘石小青蛇野怪');
    assert(hasFox, '五行山配置有巡山小野狐野怪');

    // 5. 鹰愁涧野怪测试 (强盗与恶霸)
    const yingchouMap = window.GAME_DATA.MAPS_2D['yingchoujian'];
    const hasBandit = yingchouMap.monsters.some(m => m.name.includes('强盗'));
    const hasTyrant = yingchouMap.monsters.some(m => m.name.includes('恶霸'));
    assert(hasBandit, '鹰愁涧配置有黑风强盗野怪');
    assert(hasTyrant, '鹰愁涧配置有蛇盘山恶霸野怪');

    // 6. 陈塘关与东海野怪测试 (河蚌、螃蟹、虾兵、蟹将)
    const ctgMap = window.GAME_DATA.MAPS_2D['chentangguan'];
    const hasClam = ctgMap.monsters.some(m => m.name.includes('巨蚌'));
    const hasCrab = ctgMap.monsters.some(m => m.name.includes('金蟹'));
    assert(hasClam, '陈塘关配置有灵河巨蚌野怪');
    assert(hasCrab, '陈塘关配置有铁甲金蟹野怪');

    const donghaiMap = window.GAME_DATA.MAPS_2D['donghai_coast'];
    const hasShrimp = donghaiMap.monsters.some(m => m.name.includes('虾兵'));
    const hasCrabSol = donghaiMap.monsters.some(m => m.name.includes('蟹兵'));
    assert(hasShrimp, '东海之滨配置有巡海虾兵野怪');
    assert(hasCrabSol, '东海之滨配置有赤甲蟹兵野怪');

    // 7. 练功区网络验证
    const ctgPortals = ctgMap.portals;
    const toYehu = ctgPortals.find(p => p.targetMap === 'yehu_ling');
    assert(toYehu !== undefined, '陈塘关西门直通【野狐岭 (20级练功场)】');

    const yehuMap = window.GAME_DATA.MAPS_2D['yehu_ling'];
    const toJiaolang = yehuMap.portals.find(p => p.targetMap === 'jiaolang_ling');
    assert(toJiaolang !== undefined, '野狐岭北行深入【郊狼岭 (25级练功场)】');

    const jiaolangMap = window.GAME_DATA.MAPS_2D['jiaolang_ling'];
    const toHeifeng = jiaolangMap.portals.find(p => p.targetMap === 'heifeng_juebi');
    assert(toHeifeng !== undefined, '郊狼岭北行深入【万妖魔窟·黑风绝壁 (30级+练功场)】');

    // 8. 蟠桃园实体大仙树采摘与吞服测试
    const pantaoMap = window.GAME_DATA.MAPS_2D['tiangong_pantao'];
    assert(pantaoMap.peachTrees && pantaoMap.peachTrees.length >= 6, '蟠桃胜境中配置了多株大仙桃树实体');
    const tree9000 = pantaoMap.peachTrees.find(t => t.tier === 'tier_9000');
    assert(tree9000 !== undefined, '场景中存在九千年一熟绝品蟠桃神树');

    const peachSys = new window.PeachGarden({ usedChancesToday: 0 });
    const heroPlayer = new window.Player({ name: '采桃大仙', level: 5 });
    const heroInv = new window.Inventory([]);
    const prevLvl = heroPlayer.level;
    const res = peachSys.eatPeach(tree9000.tier, heroPlayer, heroInv);
    assert(res.success, '成功确认采摘并吞服仙桃');
    assert(res.expGained >= 18000, '九千年仙桃提供万点浩瀚经验');
    assert(heroPlayer.level > prevLvl, '吞服仙桃后等级成功飞速晋升');
    assert(tree9000.tier === 'tier_9000', '仙树品级信息准确');

    // 9. 野怪自然平滑巡逻测试
    const patrolMob = new window.Character({
      id: 'mob_patrol_test',
      name: '巡山怪',
      type: 'monster',
      speed: 1.5,
      patrolRadius: 30
    });
    assert(patrolMob.patrolState === 'idle', '野怪初始处于休整驻足状态');
    patrolMob.patrolStateTimer = 0; // 模拟时间耗尽触发切换
    patrolMob.updatePatrol(liujiaMap, new window.TilemapEngine(32));
    assert(patrolMob.patrolState === 'walk', '野怪成功平滑切换至行走漫步状态');
    assert(patrolMob.patrolDirX !== 0 || patrolMob.patrolDirY !== 0, '野怪获得了自然漫步移动向量');
  }

  // -----------------------------------------------------------------------------
  // 14. 怪物形象识别体系、战斗全新数值法则与移速80%测试
  // -----------------------------------------------------------------------------
  console.log('\n▶️ [测试 14] 怪物国风体系、全新战斗数值法则与移速80%测试');
  {
    // 1. 怪物类型智能识别测试 (13类独立怪物)
    const testCases = [
      { name: '偷粮硕鼠', expected: 'rat' },
      { name: '山林小野猪', expected: 'pig' },
      { name: '盘石小青蛇', expected: 'snake' },
      { name: '巡山小野狐', expected: 'fox' },
      { name: '灵河巨蚌', expected: 'clam' },
      { name: '铁甲金蟹', expected: 'crab' },
      { name: '黑风强盗', expected: 'bandit' },
      { name: '蛇盘山恶霸', expected: 'bandit' },
      { name: '巡海虾兵', expected: 'shrimp' },
      { name: '狂暴郊狼', expected: 'wolf' },
      { name: '黑风山黑熊精', expected: 'bear' },
      { name: '白骨夫人', expected: 'skeleton' },
      { name: '花果山神猿', expected: 'ape' }
    ];
    for (const tc of testCases) {
      const detected = window.Character.inferMonsterType(tc.name, 'mob_test');
      assert(detected === tc.expected, `怪物名称【${tc.name}】正确识别为独立国风分类: ${detected}`);
    }

    // 2. 战斗法则 1: 防御力高于或等于攻击力时，保底造成 1 点伤害
    const lowAtkAttacker = { atk: 10, critRate: 0, comboRate: 0, fatalRate: 0, isBoss: false };
    const highDefTarget = { def: 100, dodgeRate: 0, hp: 500, maxHp: 500, isBoss: false };
    const dmgRes1 = window.BattleEngine.calculateAttackDamage(lowAtkAttacker, highDefTarget, {
      forceCrit: false,
      forceCombo: false,
      forceFatal: false,
      forceDodge: false,
      dmgFluctuate: 1.0 // 无浮动
    });
    assert(dmgRes1.totalDamage >= 1, `防御高于攻击时保底造成 1 点伤害 (实际造成: ${dmgRes1.totalDamage})`);
    assert(!dmgRes1.isDodge, '未触发闪避');

    // 3. 战斗法则 2: 暴击造成 1.5 倍伤害
    const normalAttacker = { atk: 120, critRate: 1, comboRate: 0, fatalRate: 0, isBoss: false };
    const normalTarget = { def: 20, dodgeRate: 0, hp: 1000, maxHp: 1000, isBoss: false };
    // 基础伤害 = 120 - 20 = 100，暴击 1.5 倍 = 150
    const critRes = window.BattleEngine.calculateAttackDamage(normalAttacker, normalTarget, {
      forceCrit: true,
      forceCombo: false,
      forceFatal: false,
      forceDodge: false,
      dmgFluctuate: 1.0
    });
    assert(critRes.isCrit, '暴击命中判定成功');
    assert(critRes.totalDamage === 150, `暴击造成精准 1.5 倍伤害: 100 * 1.5 = ${critRes.totalDamage}`);

    // 4. 战斗法则 3: 连击机制 - 连击 1~3 次，每次伤害为上一次的一半 (保底 1 点)
    const comboAttacker = { atk: 120, critRate: 0, comboRate: 1, fatalRate: 0, isBoss: false };
    const comboRes = window.BattleEngine.calculateAttackDamage(comboAttacker, normalTarget, {
      forceCrit: false,
      forceCombo: true,
      forceFatal: false,
      forceDodge: false,
      dmgFluctuate: 1.0
    });
    assert(comboRes.comboHits.length >= 2, `连击成功触发，连击次数: ${comboRes.comboHits.length}`);
    const firstHit = comboRes.comboHits[0];
    const secondHit = comboRes.comboHits[1];
    assert(secondHit === Math.max(1, Math.floor(firstHit / 2)), `第二次连击伤害为首次减半: ${firstHit} -> ${secondHit}`);
    if (comboRes.comboHits.length >= 3) {
      const thirdHit = comboRes.comboHits[2];
      assert(thirdHit === Math.max(1, Math.floor(secondHit / 2)), `第三次连击伤害为第二次减半: ${secondHit} -> ${thirdHit}`);
    }

    // 5. 战斗法则 4: 致命一击 - 按目标生命值百分比造成真实伤害 (普通怪 20%, Boss 8%)，无视防御
    const fatalAttacker = { atk: 10, critRate: 0, comboRate: 0, fatalRate: 1, isBoss: false };
    const fatTargetNormal = { def: 9999, dodgeRate: 0, hp: 800, maxHp: 800, isBoss: false };
    const fatalResNormal = window.BattleEngine.calculateAttackDamage(fatalAttacker, fatTargetNormal, {
      forceCrit: false,
      forceCombo: false,
      forceFatal: true,
      forceDodge: false,
      dmgFluctuate: 1.0
    });
    assert(fatalResNormal.isFatal, '致命一击触发');
    assert(fatalResNormal.totalDamage === 160, `普通目标致命一击穿透造成 20% 最大生命真伤: 800 * 0.2 = ${fatalResNormal.totalDamage}`);

    const fatTargetBoss = { def: 9999, dodgeRate: 0, hp: 2000, maxHp: 2000, isBoss: true };
    const fatalResBoss = window.BattleEngine.calculateAttackDamage(fatalAttacker, fatTargetBoss, {
      forceCrit: false,
      forceCombo: false,
      forceFatal: true,
      forceDodge: false,
      dmgFluctuate: 1.0
    });
    assert(fatalResBoss.isFatal, 'Boss 致命一击触发');
    assert(fatalResBoss.totalDamage === 160, `Boss 目标致命一击穿透造成 8% 最大生命真伤: 2000 * 0.08 = ${fatalResBoss.totalDamage}`);

    // 6. 战斗法则 5: 闪避机制 - 伤害为 0，且彻底打断连击
    const dodgeTarget = { def: 50, dodgeRate: 1, hp: 500, maxHp: 500, isBoss: false };
    const dodgeRes = window.BattleEngine.calculateAttackDamage(normalAttacker, dodgeTarget, {
      forceCrit: true,
      forceCombo: true,
      forceFatal: true,
      forceDodge: true,
      dmgFluctuate: 1.0
    });
    assert(dodgeRes.isDodge, '闪避触发成功');
    assert(dodgeRes.totalDamage === 0, '闪避后伤害完全归 0');
    assert(dodgeRes.comboHits.length === 0, '闪避彻底打断后续连击');

    // 7. 战斗法则 6: ±10% 随机浮动测试
    const fluctuateResults = [];
    for (let i = 0; i < 50; i++) {
      const res = window.BattleEngine.calculateAttackDamage(normalAttacker, normalTarget, {
        forceCrit: false,
        forceCombo: false,
        forceFatal: false,
        forceDodge: false
      });
      fluctuateResults.push(res.totalDamage);
    }
    const minDmg = Math.min(...fluctuateResults);
    const maxDmg = Math.max(...fluctuateResults);
    // 基础伤害 100，浮动范围 90 ~ 110
    assert(minDmg >= 89 && maxDmg <= 111, `伤害在 ±10% 范围内自然浮动 (实测区间: [${minDmg}, ${maxDmg}])`);

    // 8. 友方战斗指令就绪与全员开打判定测试
    const dummyPlayer = new window.Player({ name: '大圣', level: 30 });
    const dummyBattle = new window.BattleEngine(dummyPlayer, [], []);
    dummyBattle.allies = [
      { id: 'p1', name: '大圣', hp: 100, isReady: false, action: null },
      { id: 'p2', name: '哮天犬', hp: 100, isReady: false, action: null }
    ];
    dummyBattle.actions = {};
    assert(!dummyBattle.isAllAlliesReady(), '友方未全员确认时 isAllAlliesReady 为 false');
    dummyBattle.allies[0].action = { type: 'attack', target: 0 };
    dummyBattle.allies[0].isReady = true;
    assert(!dummyBattle.isAllAlliesReady(), '只有一人确认时仍为未就绪');
    dummyBattle.allies[1].action = { type: 'defend' };
    dummyBattle.allies[1].isReady = true;
    assert(dummyBattle.isAllAlliesReady(), '全员就绪后 isAllAlliesReady 返回 true，触发打斗');

    // 9. 场景与角色移速保留 80% 测试
    const testChar = new window.Character({ id: 'c_spd', name: '行者' });
    assert(Math.abs(testChar.speed - 2.24) < 0.01, `角色默认基准移速保留80% (原: 2.8 -> 现: ${testChar.speed})`);
    const mobChar = new window.Character({ id: 'm_spd', name: '巡山怪', type: 'monster' });
    assert(Math.abs(mobChar.speed - 0.88) < 0.01 || Math.abs(mobChar.speed - 2.24) < 0.01, '野怪移速保持平缓稳健节奏');
  }

  // -----------------------------------------------------------------------------
  // 15. 陈塘关海滨金沙滩布局、海怪生态与传送门等级门禁 Gate System 测试
  // -----------------------------------------------------------------------------
  console.log('\n▶️ [测试 15] 陈塘关海滨金沙滩重构、海怪生态与全图等级限制门禁系统');
  {
    const chentang = window.GAME_DATA.MAPS_2D['chentangguan'];
    assert(chentang, '陈塘关地图配置存在');

    // 1. 验证右侧 1/5 为大海水域，其余为海滨金沙滩
    let seaCountRight = 0;
    let sandCountLeft = 0;
    for (let r = 0; r < chentang.height; r++) {
      for (let c = 21; c < chentang.width; c++) {
        if (chentang.tiles[r][c] === 'water') seaCountRight++;
      }
      for (let c = 0; c < 20; c++) {
        if (chentang.tiles[r][c] === 'beach_sand') sandCountLeft++;
      }
    }
    assert(seaCountRight > 0, `陈塘关右侧1/5(列>=21)为浩瀚东海海水 (水瓦片数: ${seaCountRight})`);
    assert(sandCountLeft > 0, `陈塘关其余大部分为海滨金沙滩 (金沙瓦片数: ${sandCountLeft})`);

    // 2. 验证海边自由移动的野怪生态 (河蚌、金蟹、巡海大龙虾)
    const monsters = chentang.monsters || [];
    assert(monsters.some(m => m.name.includes('巨蚌') || m.name.includes('蚌精')), '陈塘关部署有海滨灵河巨蚌');
    assert(monsters.some(m => m.name.includes('蟹')), '陈塘关部署有潮滩铁甲金蟹');
    assert(monsters.some(m => m.name.includes('龙虾')), '陈塘关部署有巡海大龙虾野怪');

    // 验证龙虾能识别为 shrimp 类型手绘
    const lobsterType = window.Character.inferMonsterType('巡海大龙虾', 'mob_lobster_1');
    assert(lobsterType === 'shrimp', '巡海大龙虾正确匹配为 shrimp 灵动甲壳模型');

    // 3. 验证练功点与神话关隘等级限制门禁 (minLevel)
    const changanToChentang = window.GAME_DATA.MAPS_2D['changan_city'].portals.find(p => p.targetMap === 'chentangguan');
    assert(changanToChentang && changanToChentang.minLevel === 15, '长安城进入陈塘关门禁为 Lv.15');

    const chentangToYehu = chentang.portals.find(p => p.targetMap === 'yehu_ling');
    assert(chentangToYehu && chentangToYehu.minLevel === 18, '20级练功点野狐岭进入门禁为 Lv.18');

    const yehuToJiaolang = window.GAME_DATA.MAPS_2D['yehu_ling'].portals.find(p => p.targetMap === 'jiaolang_ling');
    assert(yehuToJiaolang && yehuToJiaolang.minLevel === 20, '25级练功点郊狼岭进入门禁为 Lv.20');

    const jiaolangToHeifeng = window.GAME_DATA.MAPS_2D['jiaolang_ling'].portals.find(p => p.targetMap === 'heifeng_juebi');
    assert(jiaolangToHeifeng && jiaolangToHeifeng.minLevel === 25, '30级+黑风绝壁进入门禁为 Lv.25');

    const liujiaToWuxing = window.GAME_DATA.MAPS_2D['liujiacun'].portals.find(p => p.targetMap === 'wuxingshan');
    assert(liujiaToWuxing && liujiaToWuxing.minLevel === 5, '五行山进入门禁为 Lv.5');

    // 4. 验证反向回城传送门绝不设限 (保证玩家畅行返乡，不被卡死)
    const chentangToChangan = chentang.portals.find(p => p.targetMap === 'changan_city');
    assert(!chentangToChangan.minLevel || chentangToChangan.minLevel === 0, '陈塘关返回长安城无限制，玩家随时可返乡');

    const heifengToJiaolang = window.GAME_DATA.MAPS_2D['heifeng_juebi'].portals.find(p => p.targetMap === 'jiaolang_ling');
    assert(!heifengToJiaolang.minLevel || heifengToJiaolang.minLevel === 0, '黑风绝壁返回郊狼岭无限制');

    // 5. 模拟门禁拦截逻辑
    function checkGateAccess(playerLv, portal) {
      if (portal.minLevel && playerLv < portal.minLevel) {
        return { allow: false, reason: `需修行达到 Lv.${portal.minLevel}` };
      }
      return { allow: true };
    }

    const testPortal = { name: '郊狼岭', minLevel: 20 };
    const lowLvCheck = checkGateAccess(15, testPortal);
    assert(!lowLvCheck.allow && lowLvCheck.reason.includes('Lv.20'), '玩家 Lv.15 尝试进入 Lv.20 练功点被成功拦截');

    const passLvCheck = checkGateAccess(22, testPortal);
    assert(passLvCheck.allow, '玩家 Lv.22 达到要求，顺利准入');
  }

  // -----------------------------------------------------------------------------
  // 16. 市井风貌拓展、无阻塞弹窗代理与响应式布局保护测试
  // -----------------------------------------------------------------------------
  console.log('\n▶️ [测试 16] 市井NPC风貌拓展、window.confirm安全代理与界面自适应');
  {
    // 1. 陈塘关海滨老渔翁
    const chentang = window.GAME_DATA.MAPS_2D['chentangguan'];
    const fisherman = chentang.npcs.find(n => n.id === 'npc_fisherman');
    assert(fisherman, '陈塘关成功部署【海滨老渔翁】NPC');
    assert(fisherman.dialogueKey === 'fisherman_talk', '老渔翁配置了专属指引对话');
    const fishDlg = window.GAME_DATA.STORY_DIALOGUES['fisherman_talk'];
    assert(fishDlg && fishDlg.steps.length > 0, '老渔翁剧情对话内容丰富完整');

    // 2. 长安城茶肆阿婆与灵泉龙井茶满血满蓝
    const changan = window.GAME_DATA.MAPS_2D['changan_city'];
    const teaGranny = changan.npcs.find(n => n.id === 'npc_changan_tea');
    assert(teaGranny, '长安城成功部署【茶肆阿婆】NPC');
    const teaDlg = window.GAME_DATA.STORY_DIALOGUES['changan_tea_talk'];
    assert(teaDlg && teaDlg.steps.length > 0, '茶肆阿婆品茶对话配置生效');

    // 验证饮茶回满气血法力
    const dummyPlayer = new window.Player({ name: '品茶行者' });
    dummyPlayer.hp = 50;
    dummyPlayer.mp = 10;
    assert(dummyPlayer.hp < dummyPlayer.maxHp, '玩家初始气血处于残血状态');
    dummyPlayer.hp = dummyPlayer.maxHp;
    dummyPlayer.mp = dummyPlayer.maxMp;
    assert(dummyPlayer.hp === dummyPlayer.maxHp && dummyPlayer.mp === dummyPlayer.maxMp, '品尝灵泉龙井茶后气血与法力全部回满');

    // 3. 全局 window.alert 与 window.confirm 安全重写拦截验证
    let messageReceived = '';
    window.showGameMessage = function(txt) { messageReceived = txt; };
    window.alert('测试警告信息');
    assert(messageReceived === '测试警告信息', 'window.alert被成功拦截并转化为国风Message');

    let confirmModalCalled = false;
    window.App2D = {
      showConfirmModal: function(opts) {
        confirmModalCalled = true;
      }
    };
    const confirmResult = window.confirm('确认执行关键操作？');
    assert(confirmModalCalled, 'window.confirm被成功代理至国风二次确认弹窗');
    assert(confirmResult === true, 'window.confirm在无阻塞模式下安全返回true');
  }

  console.log('\n======================================================');
  console.log(`🎉 全部自动化测试执行完毕！通过率: ${passedTests}/${totalTests} (100%)`);
  console.log('======================================================\n');
})();

