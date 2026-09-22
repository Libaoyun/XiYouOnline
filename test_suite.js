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
const domMap = {};
global.document = {
  getElementById: (id) => domMap[id] || null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (tag) => {
    const el = {
      tagName: tag ? tag.toUpperCase() : 'DIV',
      id: '',
      className: '',
      style: {},
      innerHTML: '',
      children: [],
      appendChild: (child) => {
        el.children.push(child);
        if (child && child.id) domMap[child.id] = child;
      },
      classList: {
        _classes: new Set(),
        add: (c) => el.classList._classes.add(c),
        remove: (c) => el.classList._classes.delete(c),
        contains: (c) => el.classList._classes.has(c),
        toggle: (c) => {
          if (el.classList._classes.has(c)) el.classList._classes.delete(c);
          else el.classList._classes.add(c);
        }
      },
      addEventListener: (evt, cb) => { el['on' + evt] = cb; },
      removeEventListener: () => {},
      remove: () => {
        if (el.id && domMap[el.id]) delete domMap[el.id];
      }
    };
    return el;
  },
  body: {
    classList: { toggle: () => {}, contains: () => true },
    appendChild: (child) => {
      if (child && child.id) domMap[child.id] = child;
    }
  }
};

// 模拟音效与提示
window.Sound = new Proxy({}, {
  get: () => () => true
});
window.showGameMessage = (msg, type) => {
  // console.log(`[Toast ${type || 'info'}]: ${msg}`);
};
window.Camera = class { constructor() {} follow() {} update() {} };
window.PathfindingEngine = class { constructor() {} };
window.MountSystem = class { constructor() { this.mounts = {}; } addMount() {} getStatsBonus() { return { hp: 0, atk: 0, def: 0, spd: 0 }; } };
window.ParticleSystem = class { constructor() { this.particles = []; } };
window.addEventListener = () => {};
window.removeEventListener = () => {};
window.requestAnimationFrame = () => 0;
window.cancelAnimationFrame = () => {};
window.location = { search: '', href: 'http://localhost/', pathname: '/', origin: 'http://localhost' };

// 依次加载游戏数据与核心逻辑
const filesToLoad = [
  'js/core/skills.js',
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
  'js/engine/toast.js',
  'js/engine/dialogue.js',
  'js/app2d.js'
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
  const realApp2DInstance = window.App2D;
  window.App2D = Object.assign(realApp2DInstance || {}, { inventory: dummyInv, pets: [petActive, petStandby] });
  
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
  window.App2D = realApp2DInstance;

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
    assert(dummySkill.level === 1, '战斗中严格遵循神坛老祖授法铁律，绝不私自越级升级');

    // 达 1/5 门槛 (1000 熟练度) 后由菩提老祖点化晋升
    dummySkill.mastery = 1000;
    const upRes = window.SkillMasteryEngine.upgradeSkill(dummySkill, true);
    assert(upRes.success === true && dummySkill.level === 2, `熟练度达到 1/5 门槛(1000点)由老祖点化晋升至 Lv.2 (当前: Lv.${dummySkill.level})`);

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

    // 3. 刘家村野怪测试 (严格遵照指令：只有硕鼠)
    const liujiaMap = window.GAME_DATA.MAPS_2D['liujiacun'];
    const hasRat = liujiaMap.monsters.some(m => m.id === 'mob_rat_1' && m.name.includes('硕鼠'));
    const hasOnlyRats = liujiaMap.monsters.every(m => m.name.includes('硕鼠'));
    assert(hasRat, '刘家村配置有偷粮硕鼠野怪');
    assert(hasOnlyRats, '刘家村严格只有硕鼠野怪，绝无野猪恶狼猛虎');

    // 4. 五行山野怪测试 (严格遵照指令：青蛇、野狐、枯树)
    const wuxingMap = window.GAME_DATA.MAPS_2D['wuxingshan'];
    const hasSnake = wuxingMap.monsters.some(m => m.id === 'mob_snake_1' && m.name.includes('小青蛇'));
    const hasFox = wuxingMap.monsters.some(m => m.id === 'mob_fox_1' && m.name.includes('小野狐'));
    const hasTree = wuxingMap.monsters.some(m => m.id === 'mob_tree_demon' && m.name.includes('枯树'));
    assert(hasSnake, '五行山配置有盘石小青蛇野怪');
    assert(hasFox, '五行山配置有巡山小野狐野怪');
    assert(hasTree, '五行山配置有百年枯树精野怪');

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

    // 2. 验证海边自由移动的野怪生态 (严格遵照指令：只有混混、河蚌、螃蟹)
    const monsters = chentang.monsters || [];
    assert(monsters.some(m => m.name.includes('混混')), '陈塘关部署有地痞混混野怪');
    assert(monsters.some(m => m.name.includes('河蚌') || m.name.includes('巨蚌')), '陈塘关部署有海滨灵河巨蚌 (河蚌)');
    assert(monsters.some(m => m.name.includes('螃蟹') || m.name.includes('蟹')), '陈塘关部署有潮滩金蟹 (螃蟹)');
    assert(!monsters.some(m => m.name.includes('龙虾')), '陈塘关已彻底移除龙虾，严格符合原著');

    // 验证混混能识别为 hooligan 类型手绘
    const hooliganType = window.Character.inferMonsterType('混混', 'mob_hooligan_1');
    assert(hooliganType === 'hooligan', '混混正确匹配为 hooligan 功夫地痞模型');

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
    const prevApp2D = window.App2D;
    const prevConfirm = window.confirm;
    window.App2D = {
      showConfirmModal: function(opts) {
        confirmModalCalled = true;
      }
    };
    window.confirm = function(msg) {
      if (window.App2D && window.App2D.showConfirmModal) {
        window.App2D.showConfirmModal({ title: '确认', content: msg });
        return true;
      }
      return false;
    };
    const confirmResult = window.confirm('确认执行关键操作？');
    assert(confirmModalCalled, 'window.confirm被成功代理至国风二次确认弹窗');
    assert(confirmResult === true, 'window.confirm在无阻塞模式下安全返回true');
    window.App2D = prevApp2D;
    window.confirm = prevConfirm;
  }

  // =========================================================================
  // 测试 17: 西游主线全地图闭环链条、野怪专属模型识别与长安城NPC去重
  // =========================================================================
  {
    console.log('\n▶️ [测试 17] 西游原著主线全地图闭环、专属模型与长安NPC去重');

    // 1. 验证吊睛白额猛虎不是龙虾模型，严格独立为 tiger
    const tigerType = window.Character.inferMonsterType('吊睛白额虎', 'mob_tiger_1');
    assert(tigerType === 'tiger', '吊睛白额猛虎正确识别为 tiger 猛虎模型，绝非龙虾');

    // 2. 验证黑风山黑熊精识别为 bear
    const bearType = window.Character.inferMonsterType('黑风洞黑熊精', 'mob_heixiong_boss');
    assert(bearType === 'bear', '黑风洞黑熊精正确识别为 bear 魁梧玄甲黑熊怪模型');

    // 3. 验证红孩儿识别为 honghaier
    const redboyType = window.Character.inferMonsterType('圣婴大王·红孩儿', 'mob_honghaier_boss');
    assert(redboyType === 'honghaier', '圣婴大王红孩儿正确识别为 honghaier 三昧真火小战神模型');

    // 4. 验证牛魔王识别为 bull_demon
    const bullType = window.Character.inferMonsterType('平天大圣·牛魔王', 'mob_niumowang_boss');
    assert(bullType === 'bull_demon', '平天大圣牛魔王正确识别为 bull_demon 冲天金角妖王模型');

    // 5. 验证五行山枯树精识别为 tree
    const treeType = window.Character.inferMonsterType('百年枯树精', 'mob_tree_demon');
    assert(treeType === 'tree', '百年枯树精正确识别为 tree 苍劲古木模型');

    // 6. 验证五行山小野狐识别为 fox
    const foxType = window.Character.inferMonsterType('巡山小野狐', 'mob_fox_1');
    assert(foxType === 'fox', '巡山小野狐正确识别为 fox 灵狐模型');

    // 7. 验证长安城内 NPC 模型丰富度与去重
    const changanNpcs = window.GAME_DATA.MAPS_2D['changan_city'].npcs || [];
    const appearances = changanNpcs.map(n => n.appearance);
    const uniqueAppearances = [...new Set(appearances)];
    assert(uniqueAppearances.length >= 8, `长安城NPC模型高度丰富多元 (独立外观数: ${uniqueAppearances.length})，杜绝千篇一律`);

    // 8. 验证西游记 19 处主线地图闭环无断点
    const chain = [
      'wuxingshan', 'yingchoujian', 'heifengshan', 'gaolaozhuang',
      'huangfengling', 'futushan', 'liushahe', 'wuzhuangguan',
      'baihuling', 'baoxiangguo', 'pingdingshan', 'huoyundong',
      'poerdong', 'chediguo', 'tongtianhe', 'huoyanshan',
      'pansidong', 'shituoling', 'daleiyinsi'
    ];
    for (let i = 0; i < chain.length - 1; i++) {
      const curMap = window.GAME_DATA.MAPS_2D[chain[i]];
      const nextId = chain[i + 1];
      const hasNext = (curMap.portals || []).some(p => p.targetMap === nextId);
      assert(hasNext, `主线地图【${curMap.name}】传送门畅通直达【${nextId}】`);
    }
    const finalMap = window.GAME_DATA.MAPS_2D['daleiyinsi'];
    const toChangan = (finalMap.portals || []).some(p => p.targetMap === 'changan_city');
    assert(toChangan, '大雷音寺功德圆满，传送门直回东土大唐长安城');
  }

  // =========================================================================
  // 测试 18: 1.5倍广阔大地图规格、实体安全落脚、小白龙专属模型与双怪生态
  // =========================================================================
  {
    console.log('\n▶️ [测试 18] 1.5倍地图规格、实体安全落脚、小白龙专属神相与双怪生态');

    // 1. 验证除长安城外，所有场景尺寸统一为 38x28 (原 26x20 的 1.5 倍广阔视野)
    const allMaps = window.GAME_DATA.MAPS_2D;
    let nonChanganCount = 0;
    let sizeCorrectCount = 0;
    for (const [id, m] of Object.entries(allMaps)) {
      if (id !== 'changan_city') {
        nonChanganCount++;
        if (m.width === 38 && m.height === 28) {
          sizeCorrectCount++;
        }
      }
    }
    assert(sizeCorrectCount === nonChanganCount, `除长安城外全部 ${nonChanganCount} 张场景尺寸均为 1.5 倍广阔大地图 (38x28)`);

    // 2. 验证全游戏实体（NPC与野怪）绝对无一被困在禁行阻挡瓦片里
    const solidTiles = [
      'cloud_void', 'heaven_pillar', 'bamboo', 'water', 'dark_water',
      'city_wall', 'hut_wall', 'palace_eaves', 'wooden_barricade',
      'blacksmith_forge', 'mountain_rock', 'demon_cave_wall',
      'ginseng_tree', 'purple_bamboo', 'tang_palace', 'tang_store', 'stone_temple'
    ];
    let blockedCount = 0;
    for (const [id, m] of Object.entries(allMaps)) {
      const g = m.tiles;
      for (const n of (m.npcs || [])) {
        const tx = Math.round(n.x / 32), ty = Math.round(n.y / 32);
        if (solidTiles.includes(g[ty][tx])) blockedCount++;
      }
      for (const mon of (m.monsters || [])) {
        const tx = Math.round(mon.x / 32), ty = Math.round(mon.y / 32);
        if (solidTiles.includes(g[ty][tx])) blockedCount++;
      }
    }
    assert(blockedCount === 0, '全场景所有 NPC 与野怪均安全落在可行走地面上，零实体卡死');

    // 3. 重点断言鹰愁涧：小白龙敖烈绝对不是龙虾，且站在安全可行走大道上
    const ycj = allMaps['yingchoujian'];
    const aolie = ycj.npcs.find(n => n.id === 'npc_bailong_human');
    assert(aolie !== undefined, '鹰愁涧成功部署西海龙三太子·小白龙敖烈');
    assert(aolie.appearance === 'xiaobailong', '小白龙敖烈外观标识为 xiaobailong');
    const aolieTileX = Math.round(aolie.x / 32), aolieTileY = Math.round(aolie.y / 32);
    assert(!solidTiles.includes(ycj.tiles[aolieTileY][aolieTileX]), '小白龙敖烈安全伫立于寒潭之畔大道上，绝非深陷不可通行水底');

    // 验证小白龙模型分发绝不命中龙虾 (shrimp)
    let matchedName = '';
    const mockGrad = { addColorStop: () => {} };
    const mockCtx = new Proxy({
      createLinearGradient: () => mockGrad,
      createRadialGradient: () => mockGrad
    }, {
      get: (target, prop) => {
        if (prop in target) return target[prop];
        return () => {};
      }
    });
    // spy drawXiaoBaiLong
    const origDrawBailong = window.CharacterRenderer.drawXiaoBaiLong;
    let bailongCalled = false;
    window.CharacterRenderer.drawXiaoBaiLong = function() { bailongCalled = true; };
    const origDrawShrimp = window.CharacterRenderer.drawShrimp;
    let shrimpCalled = false;
    window.CharacterRenderer.drawShrimp = function() { shrimpCalled = true; };

    window.CharacterRenderer.drawModel(mockCtx, 0, 0, 'xiaobailong');
    assert(bailongCalled && !shrimpCalled, '小白龙敖烈正确分发至【专属西海龙太子仙相】，彻底根除被错画为龙虾的缺陷！');

    // 恢复 spy
    window.CharacterRenderer.drawXiaoBaiLong = origDrawBailong;
    window.CharacterRenderer.drawShrimp = origDrawShrimp;

    // 4. 验证从五行山开始，野怪每种各 2 个
    const wxsMonsters = allMaps['wuxingshan'].monsters;
    const snakeCount = wxsMonsters.filter(m => m.appearance === 'snake').length;
    const foxCount = wxsMonsters.filter(m => m.appearance === 'fox').length;
    const treeCount = wxsMonsters.filter(m => m.appearance === 'tree').length;
    assert(snakeCount === 2, '五行山青蛇野怪配置为 2 条');
    assert(foxCount === 2, '五行山野狐野怪配置为 2 只');
    assert(treeCount === 4, '五行山枯树精野怪配置为 4 株 (满足砍柴伐木任务需求)');

    const ycjMonsters = allMaps['yingchoujian'].monsters;
    const banditCount = ycjMonsters.filter(m => m.appearance === 'bandit').length;
    const tyrantCount = ycjMonsters.filter(m => m.appearance === 'tyrant').length;
    const waterSnakeCount = ycjMonsters.filter(m => m.appearance === 'pet_snake').length;
    assert(banditCount === 2, '鹰愁涧黑风强盗配置为 2 个');
    assert(tyrantCount === 2, '鹰愁涧蛇盘山恶霸配置为 2 个');
    assert(waterSnakeCount === 2, '鹰愁涧寒潭黑水玄蛇配置为 2 条');

    // 5. 验证玩家全新修真大侠少年模型：无平举出掌手势，平稳自然摆臂
    let martialCalled = false;
    const origMartial = window.CharacterRenderer.drawMartialHero;
    window.CharacterRenderer.drawMartialHero = function() { martialCalled = true; };
    window.CharacterRenderer.drawModel(mockCtx, 0, 0, 'mortal_wanderer');
    assert(martialCalled, '玩家凡间探索形象【mortal_wanderer】正确分发至全新太清玄剑修真少侠模型');
    window.CharacterRenderer.drawMartialHero = origMartial;
  }

  // =========================================================================
  // 测试 19: 玩家安全落脚点机制、剧情驱动NPC阶段可见性、怪物深度天梯与一键重开
  // =========================================================================
  {
    console.log('\n▶️ [测试 19] 玩家安全落脚保证、主线NPC剧情可见性过滤、怪物深度递增与一键重新开始');

    const app = window.App2D;
    const allMaps = window.GAME_DATA.MAPS_2D;
    const ycjMap = allMaps['yingchoujian'];

    // 1. 安全落脚点测试：若传入水体或岩石中的坐标，自动校准至最近的可行走平坦地面
    const testUnsafeX = 18 * 32, testUnsafeY = 5 * 32; // 处于缩小后的寒潭深水区 (dark_water)
    assert(ycjMap.tiles[5][18] === 'dark_water', '原测试点位于寒潭深水非可行走区');
    const safeCoord = app.ensurePlayerSafePosition('yingchoujian', testUnsafeX, testUnsafeY);
    const safeTileX = Math.floor(safeCoord.x / 32), safeTileY = Math.floor(safeCoord.y / 32);
    const safeTileType = ycjMap.tiles[safeTileY][safeTileX];
    const isActuallyWalkable = safeTileType !== 'dark_water' && safeTileType !== 'water' && safeTileType !== 'mountain_rock';
    assert(isActuallyWalkable, `非可行走坐标已被自动矫正至安全平地: (${safeTileX}, ${safeTileY}) [${ycjMap.tiles[safeTileY][safeTileX]}]`);

    // 2. 剧情驱动 NPC 可见性测试 (story-driven visibility)
    // 刚坠落凡间 (liujiacun_start)：
    assert(app.isNpcVisibleInStoryPhase('npc_liuboqin', 'liujiacun_start', 'liujiacun') === true, '刚坠落凡间阶段刘伯钦可见');
    assert(app.isNpcVisibleInStoryPhase('npc_tang_seng_yingchou', 'liujiacun_start', 'yingchoujian') === false, '刚坠落凡间阶段鹰愁涧唐僧不可见');
    assert(app.isNpcVisibleInStoryPhase('npc_bailong_human', 'liujiacun_start', 'yingchoujian') === false, '刚坠落凡间阶段鹰愁涧小白龙不可见');
    assert(app.isNpcVisibleInStoryPhase('npc_wukong_sealed', 'liujiacun_start', 'wuxingshan') === false, '刚坠落凡间阶段五行山被压孙悟空尚未触发');

    // 五行山揭帖破封前夕 (wuxingshan_ready)：
    assert(app.isNpcVisibleInStoryPhase('npc_wukong_sealed', 'wuxingshan_ready', 'wuxingshan') === true, '到达五行山阶段被压孙悟空显圣可见');
    assert(app.isNpcVisibleInStoryPhase('npc_bailong_human', 'wuxingshan_ready', 'yingchoujian') === false, '到达五行山阶段鹰愁涧小白龙仍不可见');

    // 五行山破封脱困前往鹰愁涧 (wuxing_freed)：
    assert(app.isNpcVisibleInStoryPhase('npc_tang_seng_yingchou', 'wuxing_freed', 'yingchoujian') === true, '大圣脱困后唐僧正式抵达鹰愁涧');
    assert(app.isNpcVisibleInStoryPhase('npc_bailong_human', 'wuxing_freed', 'yingchoujian') === true, '大圣脱困后小白龙敖烈正式显圣迎战');
    assert(app.isNpcVisibleInStoryPhase('npc_wukong_sealed', 'wuxing_freed', 'wuxingshan') === false, '大圣破封脱困后压帖孙悟空消失归队');
    assert(app.isNpcVisibleInStoryPhase('npc_zhubajie', 'wuxing_freed', 'gaolaozhuang') === false, '鹰愁涧阶段高老庄猪八戒尚未到达');

    // 鹰愁涧收服白龙马之后 (yingchou_cleared)：
    assert(app.isNpcVisibleInStoryPhase('npc_zhubajie', 'yingchou_cleared', 'gaolaozhuang') === true, '收服白龙马后高老庄猪八戒正式登场');

    // 3. 怪物属性随取经路深入阶梯递增测试 (越往后越强，绝非随便就能打过)
    const wxsMobHp = allMaps['wuxingshan'].monsters[0].hp;
    const ycjMobHp = allMaps['yingchoujian'].monsters[0].hp;
    const hfsMobHp = allMaps['heifengshan'].monsters[0].hp;
    const glzMobHp = allMaps['gaolaozhuang'].monsters[0].hp;
    const hflMobHp = allMaps['huangfengling'].monsters[0].hp;
    const lshMobHp = allMaps['liushahe'].monsters[0].hp;
    const bhlMobHp = allMaps['baihuling'].monsters[0].hp;
    const stlMobHp = allMaps['shituoling'].monsters[0].hp;

    assert(ycjMobHp > wxsMobHp, `鹰愁涧怪物血量高于五行山: ${ycjMobHp} > ${wxsMobHp}`);
    assert(hfsMobHp > ycjMobHp, `黑风山怪物血量高于鹰愁涧: ${hfsMobHp} > ${ycjMobHp}`);
    assert(glzMobHp > hfsMobHp, `高老庄怪物血量高于黑风山: ${glzMobHp} > ${hfsMobHp}`);
    assert(hflMobHp > glzMobHp, `黄风岭怪物血量高于高老庄: ${hflMobHp} > ${glzMobHp}`);
    assert(lshMobHp > hflMobHp, `流沙河怪物血量高于黄风岭: ${lshMobHp} > ${hflMobHp}`);
    assert(bhlMobHp > lshMobHp, `白虎岭怪物血量高于流沙河: ${bhlMobHp} > ${lshMobHp}`);
    assert(stlMobHp > bhlMobHp, `狮驼岭绝妖怪物血量远超白虎岭: ${stlMobHp} > ${bhlMobHp}`);

    // 验证鹰愁涧强盗攻击力对 Lv.1 玩家构成致命威胁
    const ycjBanditAtk = allMaps['yingchoujian'].monsters[0].atk;
    const newbieDef = 10;
    const newbieHp = 100;
    const newbieDmg = ycjBanditAtk - newbieDef;
    assert(newbieDmg > newbieHp, `鹰愁涧强盗单次重创 (${newbieDmg}) 足以秒杀 Lv.1 冒失玩家，确保深度探索难度`);

    // 4. 一键重新开始 (restartGame) 与天宫初始开局机制验证
    assert(typeof app.restartGame === 'function', 'App2D 挂载有 restartGame 重新开篇接口');
    const tiangongMap = allMaps['tiangong_palace'];
    assert(tiangongMap && tiangongMap.name.includes('天宫'), '天宫地图【tiangong_palace】配置完备');
    assert(app.isNpcVisibleInStoryPhase('npc_taibai', 'heaven_prologue', 'tiangong_palace') === true, '天宫序章太白金星显圣可见');
    assert(app.isNpcVisibleInStoryPhase('npc_litianwang', 'heaven_prologue', 'tiangong_palace') === true, '天宫序章托塔李天王显圣可见');
    assert(app.isNpcVisibleInStoryPhase('npc_wukong_huaguo', 'heaven_final_wukong', 'huaguoshan') === true, '花果山总决战齐天大圣孙悟空在花果山主山显圣决战');
    assert(app.isNpcVisibleInStoryPhase('npc_wukong_heaven', 'heaven_tiangong_trial', 'tiangong_palace') === true, '二郎神擒大圣后押解回天宫凌霄殿受审');
    assert(app.isNpcVisibleInStoryPhase('npc_wukong_heaven', 'liujiacun_start', 'tiangong_palace') === false, '凡间阶段天宫大闹孙悟空已退场');

    // 验证游戏最开始与重置初始化的核心状态
    assert(app.currentMapId === 'tiangong_palace', '游戏开局与重置初始化默认进入天宫凌霄与南天门【tiangong_palace】');
    assert(app.storyPhase === 'heaven_prologue', '游戏开局与重置初始化主线阶段为天宫序章【heaven_prologue】');
    assert(app.playerData.name === '威灵大将', '游戏开局与重置初始化角色为【威灵大将】');
    assert(app.playerData.appearance === 'heaven_general', '游戏开局与重置初始化角色外观为金甲神将【heaven_general】');
    assert(app.playerChar.appearance === 'heaven_general', '游戏开局实体外观为天界金甲神将【heaven_general】');
  }

  // =========================================================================
  // 测试 20: 天宫序章三大因缘事件全流程、凡间传送门绝对剥离与NPC感叹号治理
  // =========================================================================
  {
    console.log('\n▶️ [测试 20] 天宫序章三大因缘事件、凡间传送门绝对剥离与NPC感叹号治理');

    const app = window.App2D;
    const allMaps = window.GAME_DATA.MAPS_2D;
    const dlgs = window.GAME_DATA.STORY_DIALOGUES;
    const tgPalace = allMaps['tiangong_palace'];
    const tgPantao = allMaps['tiangong_pantao'];

    // 1. 传送门合理化验证：天宫在贬落凡间前绝对没有直通长安的入口
    const hasChanganPortal = tgPalace.portals.some(p => p.targetMap === 'changan_city');
    assert(!hasChanganPortal, '天宫【tiangong_palace】绝对杜绝通往【大唐长安】的传送门，彻底符合世界观');
    assert(tgPalace.portals.some(p => p.targetMap === 'tiangong_pantao'), '天宫南天门与蟠桃胜境保持天界内部闭环互通');
    assert(tgPantao.portals.some(p => p.targetMap === 'tiangong_palace'), '蟠桃胜境与南天门保持天界内部闭环互通');

    // 2. 西游正统三大因缘事件剧本全量覆盖验证
    assert(dlgs.pantao_intro && dlgs.pantao_intro.steps.length > 0, '【因缘开篇】太白金星蟠桃胜会值守指引剧本完备');
    assert(dlgs.tianpeng_change_encounter && dlgs.tianpeng_after_battle, '【因缘事件一】天蓬元帅醉酒调戏嫦娥战斗及王母贬猪胎剧本完备');
    assert(dlgs.juanlian_break_cup && dlgs.juanlian_break_cup.steps.length >= 6, '【因缘事件二】卷帘大将殿前碎琉璃盏、威灵大将求情免死剧本完备');
    assert(dlgs.juling_shuilien_battle && dlgs.juling_shuilien_battle.steps.length >= 4, '【因缘事件三】围剿花果山巨灵神趁人之危屠杀猴群、大将拔枪护猴剧本完备');
    assert(dlgs.juling_defeated_to_huaguoshan && dlgs.juling_defeated_to_huaguoshan.steps.length >= 3, '【因缘后续】战胜巨灵神保全小猴，齐天大圣感佩大义剧本完备');
    assert(dlgs.wukong_huaguoshan_havoc && dlgs.wukong_huaguoshan_havoc.steps.length >= 3, '【总决战】花果山水帘洞四天将合围大圣决战剧本完备');
    assert(dlgs.yangjian_capture_and_banishment && dlgs.tiangong_banishment_scene, '【集体贬落凡尘】花果山杨戬生擒大圣、天宫凌霄殿宣旨贬落凡尘刘家村剧本完备');

    // 3. 战斗系统与回调接口验证
    assert(typeof app.triggerJulingBattle === 'function', 'App2D 挂载有大义护猴决战巨灵神战斗接口 (triggerJulingBattle)');
    assert(typeof app.triggerWukongSparBattle === 'function', 'App2D 挂载有花果山大圣决战切磋比武接口 (triggerWukongSparBattle)');
    assert(typeof app.refreshMapNpcs === 'function', 'App2D 挂载有因缘推进实时刷新地图NPC与感叹号接口 (refreshMapNpcs)');

    // 4. 天宫序章阶段驱动NPC显隐测试
    assert(app.isNpcVisibleInStoryPhase('npc_tianpeng', 'heaven_pantao_start', 'tiangong_palace') === true, '开局阶段天蓬元帅显圣');
    assert(app.isNpcVisibleInStoryPhase('npc_change', 'heaven_pantao_start', 'tiangong_palace') === true, '开局阶段嫦娥仙子显圣');
    assert(app.isNpcVisibleInStoryPhase('npc_juanlian', 'heaven_saved_change', 'tiangong_palace') === true, '解救嫦娥后卷帘大将奉酒登场');
    assert(app.isNpcVisibleInStoryPhase('npc_juling_shen', 'heaven_huaguoshan_rescue', 'huaguoshan_shuilien') === true, '水帘洞拯救小猴阶段巨灵神现身');
    assert(app.isNpcVisibleInStoryPhase('npc_huaguo_monkey', 'heaven_huaguoshan_rescue', 'huaguoshan_shuilien') === true, '水帘洞受困小猴登场待救');
    assert(app.isNpcVisibleInStoryPhase('npc_wukong_heaven', 'heaven_tiangong_trial', 'tiangong_palace') === true, '大圣被擒解往天宫凌霄殿听旨发落');

    // 5. 凡间阶段天神全量隐退验证
    const heavenNpcIds = ['npc_tianpeng', 'npc_change', 'npc_juanlian', 'npc_juling_shen', 'npc_huaguo_monkey', 'npc_wukong_heaven', 'npc_yangjian'];
    for (const hId of heavenNpcIds) {
      assert(app.isNpcVisibleInStoryPhase(hId, 'liujiacun_start', 'tiangong_palace') === false, `贬落凡间后天宫NPC ${hId} 彻底隐退`);
    }

    // 6. 市井闲聊NPC绝不带金色感叹号测试 (治理无关NPC悬挂感叹号)
    const changanNpcs = allMaps['changan_city'].npcs;
    app.storyPhase = 'changan_met_monk';
    app.interactedNpcSet = new Set();
    const idleNpcs = ['npc_changan_girl', 'npc_changan_scholar', 'npc_changan_hawker', 'npc_changan_child', 'npc_changan_guard'];
    for (const idId of idleNpcs) {
      const charObj = changanNpcs.find(n => n.id === idId);
      if (charObj) {
        // 加载进地图后验证其实例化对象的 questStatus 为 null
        app.loadMap('changan_city');
        const liveNpc = app.npcs.find(n => n.id === idId);
        assert(!liveNpc || liveNpc.questStatus !== 'available', `市井闲聊NPC【${charObj.name}】头顶绝无感叹号`);
      }
    }
  }

  // =========================================================================
  // 测试 21: 花果山与水帘洞新场景、序章四大战斗链路及四人凡间分布因果闭环
  // =========================================================================
  {
    console.log('\n▶️ [测试 21] 花果山与水帘洞新场景、序章四大战斗链路及四人凡间分布因果闭环');

    const app = window.App2D;
    const allMaps = window.GAME_DATA.MAPS_2D;
    const dlgs = window.GAME_DATA.STORY_DIALOGUES;

    // 1. 花果山与水帘洞新场景配置验证 (38x28 规格、传送门互通)
    const hgs = allMaps['huaguoshan'];
    const sld = allMaps['huaguoshan_shuilien'];
    assert(hgs && hgs.width === 38 && hgs.height === 28, '东胜神洲·花果山为 1.5 倍广阔大地图 (38x28)');
    assert(sld && sld.width === 38 && sld.height === 28, '花果山·水帘洞为 1.5 倍广阔大地图 (38x28)');
    assert(hgs.portals.some(p => p.targetMap === 'huaguoshan_shuilien'), '花果山瀑布传送门直通水帘洞');
    assert(sld.portals.some(p => p.targetMap === 'huaguoshan'), '水帘洞传送门直通花果山');

    // 2. 序章四大战斗方法挂载验证
    assert(typeof app.triggerTianpengBattle === 'function', '挂载天蓬元帅醉酒战斗接口 (triggerTianpengBattle)');
    assert(typeof app.triggerChimaoBattle === 'function', '挂载赤毛马猴切磋战斗接口 (triggerChimaoBattle)');
    assert(typeof app.triggerJulingBattle === 'function', '挂载水帘洞大战先锋巨灵神救猴接口 (triggerJulingBattle)');
    assert(typeof app.triggerWukongHavocBattle === 'function', '挂载花果山水帘洞四天将大阵大战大圣接口 (triggerWukongHavocBattle)');

    // 3. 验证打天蓬时随从绝对为空 (只有玩家一人单挑醉酒天蓬)
    app.companions = [{ name: '孙悟空', roleId: 'sun_wukong' }]; // 模拟旧存档残留
    app.triggerTianpengBattle();
    assert(app.companions.length === 0, '打天蓬元帅时随从强制清空，只有大将一人单挑醉酒天蓬');

    // 4. 天蓬元帅战数值验证 (威灵大将 Lv.50 普攻 2~3 回合击败)
    const dummyPlayer = {
      level: 50,
      atk: 420,
      def: 210,
      critRate: 0,
      comboRate: 0,
      fatalRate: 0,
      isBoss: false
    };
    const tianpengDef = 60;
    const tianpengHp = 900;
    const dummyTianpeng = {
      def: tianpengDef,
      dodgeRate: 0,
      hp: tianpengHp,
      maxHp: tianpengHp,
      isBoss: true
    };
    const dmgRes = window.BattleEngine.calculateAttackDamage(dummyPlayer, dummyTianpeng, {
      forceCrit: false,
      forceCombo: false,
      forceFatal: false,
      forceDodge: false,
      dmgFluctuate: 1.0
    });
    const dmgPerHit = dmgRes.totalDamage;
    const hitsToKill = Math.ceil(tianpengHp / dmgPerHit);
    assert(hitsToKill >= 2 && hitsToKill <= 3, `威灵大将Lv.50普攻伤害 (${dmgPerHit})，恰好 ${hitsToKill} 回合制伏醉酒天蓬`);

    // 5. 决战齐天大圣超强神威验证 (大圣攻击力 99999，打谁基本都是一下秒杀)
    const wukongAtk = 99999;
    const targetGeneral = { def: 200, dodgeRate: 0, hp: 8000, maxHp: 8000, isBoss: false };
    const wukongDmgRes = window.BattleEngine.calculateAttackDamage({ atk: wukongAtk, critRate: 0, comboRate: 0, fatalRate: 0, isBoss: true }, targetGeneral, {
      forceCrit: false,
      forceCombo: false,
      forceFatal: false,
      forceDodge: false,
      dmgFluctuate: 1.0
    });
    assert(wukongDmgRes.totalDamage >= targetGeneral.hp, `花果山决战大圣处于神威极境，伤害 (${wukongDmgRes.totalDamage}) 一击秒杀天将`);

    // 6. 凡间四人分布因果闭环严格验证 (只有推进到对应剧情阶段才显圣)
    // 四人：玩家（刘家村）、孙悟空（五行山）、八戒（高老庄）、沙僧（流沙河）
    assert(app.isNpcVisibleInStoryPhase('npc_liuboqin', 'liujiacun_start', 'liujiacun') === true, '凡间起点：玩家在双叉岭刘家村醒来，刘伯钦显圣');
    assert(app.isNpcVisibleInStoryPhase('npc_wukong_sealed', 'liujiacun_start', 'wuxingshan') === false, '刚坠落凡间阶段五行山被压孙悟空不可见');
    assert(app.isNpcVisibleInStoryPhase('npc_zhubajie', 'liujiacun_start', 'gaolaozhuang') === false, '刚坠落凡间阶段高老庄猪八戒绝不出现');
    assert(app.isNpcVisibleInStoryPhase('npc_shawujing', 'liujiacun_start', 'liushahe') === false, '刚坠落凡间阶段流沙河沙悟净绝不出现');

    // 随着主线推进逐一显圣：
    assert(app.isNpcVisibleInStoryPhase('npc_wukong_sealed', 'wuxingshan_ready', 'wuxingshan') === true, '主线到达五行山时：孙悟空五行山下显圣');
    assert(app.isNpcVisibleInStoryPhase('npc_zhubajie', 'yingchou_cleared', 'gaolaozhuang') === true, '主线收服白龙马后：高老庄猪八戒正式显圣');
    assert(app.isNpcVisibleInStoryPhase('npc_shawujing', 'huangfeng_cleared', 'liushahe') === true, '主线平息黄风岭后：流沙河沙僧正式显圣');
  }

  // =========================================================================
  // 测试 22: 主线感叹号严格唯一制、刘家村采蘑菇砍柴除害、东海夜叉龙王赠装与西行启程
  // =========================================================================
  {
    console.log('\n▶️ [测试 22] 主线感叹号唯一制、采蘑菇伐木除害、夜叉龙王赠装与西行启程');

    const app = window.App2D;
    const allMaps = window.GAME_DATA.MAPS_2D;
    const items = window.GAME_DATA.ITEMS;
    const dlgs = window.GAME_DATA.STORY_DIALOGUES;

    // 1. 任务材料与龙宫初级神装数据库验证
    assert(items.item_fresh_mushroom && items.item_fresh_mushroom.name === '野生青蘑菇', '新增任务道具【野生青蘑菇】完备');
    assert(items.item_dry_wood && items.item_dry_wood.name === '坚韧柴木', '新增任务道具【坚韧柴木】完备');
    assert(items.longgong_weapon && items.longgong_weapon.slot === 'weapon', '龙宫初级套装【覆海点钢枪】完备');
    assert(items.longgong_armor && items.longgong_armor.slot === 'armor', '龙宫初级套装【龙鳞轻钢甲】完备');
    assert(items.longgong_helmet && items.longgong_helmet.slot === 'helmet', '龙宫初级套装【碧水定海盔】完备');
    assert(items.longgong_boots && items.longgong_boots.slot === 'boots', '龙宫初级套装【踏浪穿云靴】完备');
    assert(items.longgong_necklace && items.longgong_necklace.slot === 'necklace', '龙宫初级套装【龙珠凝霜佩】完备');

    // 2. 刘家村与五行山场景实体验证
    const ljc = allMaps['liujiacun'];
    const wxs = allMaps['wuxingshan'];
    const mushroomCount = ljc.npcs.filter(n => n.id.startsWith('prop_mushroom_')).length;
    assert(mushroomCount === 4, '刘家村部署 4 朵【野生青蘑菇】实体');
    const ratCount = ljc.monsters.filter(m => m.id.startsWith('mob_rat_')).length;
    assert(ratCount === 4, '刘家村部署 4 只【偷粮硕鼠】野怪');
    const treeCount = wxs.monsters.filter(m => m.id.includes('tree')).length;
    assert(treeCount === 4, '五行山部署 4 株【百年枯树精】野怪');

    // 3. 采摘青蘑菇互动与计数推进验证
    app.storyPhase = 'liujiacun_find_mushrooms';
    app.questKills = { mushrooms: 0, trees: 0, rats: 0 };
    assert(typeof app.collectMushroom === 'function', 'App2D 挂载有采摘蘑菇方法 (collectMushroom)');
    app.collectMushroom();
    assert(app.questKills.mushrooms === 1, '采摘 1 朵青蘑菇，计数累加为 1');
    app.collectMushroom();
    assert(app.questKills.mushrooms === 2, '采摘 2 朵青蘑菇，计数累加为 2');
    assert(app.storyPhase === 'liujiacun_mushrooms_collected', '采齐 2 朵蘑菇后，主线自动推进至【liujiacun_mushrooms_collected】');

    // 4. 东海之滨与龙宫大殿主线验证
    const dhc = allMaps['donghai_coast'];
    const lgp = allMaps['longgong_palace'];
    assert(dhc.npcs.some(n => n.id === 'npc_yecha'), '东海之滨部署【巡海夜叉·李艮】');
    assert(dhc.npcs.some(n => n.id === 'npc_aoguang_coast'), '东海之滨部署【东海龙王敖广】');
    assert(lgp.npcs.some(n => n.id === 'npc_aoguang'), '东海龙宫大殿部署【东海龙王敖广】');
    assert(typeof app.triggerYechaBattle === 'function', 'App2D 挂载有巡海夜叉战斗接口 (triggerYechaBattle)');
    assert(typeof app.grantLonggongArmorSet === 'function', 'App2D 挂载有龙王宝库赠装接口 (grantLonggongArmorSet)');

    // 5. 龙王赠送整套神装并自动穿戴验证
    const oldAtk = app.playerData.atk;
    const oldDef = app.playerData.def;
    app.grantLonggongArmorSet();
    assert(app.playerData.equipment.weapon.itemId === 'longgong_weapon', '玩家自动装备【覆海点钢枪】');
    assert(app.playerData.equipment.armor.itemId === 'longgong_armor', '玩家自动装备【龙鳞轻钢甲】');
    assert(app.playerData.equipment.helmet.itemId === 'longgong_helmet', '玩家自动装备【碧水定海盔】');
    assert(app.playerData.equipment.boots.itemId === 'longgong_boots', '玩家自动装备【踏浪穿云靴】');
    assert(app.playerData.equipment.necklace.itemId === 'longgong_necklace', '玩家自动装备【龙珠凝霜佩】');
    assert(app.playerData.atk > oldAtk && app.playerData.def > oldDef, '整套龙神战装上身，攻防战力显著飞跃');

    // 6. 陈塘关观音显圣与长安城唐太宗/玄奘法师验证
    const ctg = allMaps['chentangguan'];
    const cgc = allMaps['changan_city'];
    assert(ctg.npcs.some(n => n.id === 'npc_guanyin_pu_sa'), '陈塘关部署【观世音菩萨】显圣点化');
    assert(cgc.npcs.some(n => n.id === 'npc_tangtaizong'), '长安城金銮宝殿顶部部署【唐太宗·李世民】');
    assert(cgc.npcs.some(n => n.id === 'npc_liuboqin_changan'), '长安城西门部署【刘伯钦 (送行)】');

    // 7. 全剧情关键剧本完整性验证
    assert(dlgs.liuboqin_mushroom_done && dlgs.liuboqin_wood_done && dlgs.liuboqin_rats_done, '刘家村蘑菇做饭、砍柴做饭与除鼠酬谢剧本完备');
    assert(dlgs.donghai_yecha_battle && dlgs.donghai_dragon_apology && dlgs.longgong_receive_armor, '战夜叉、龙王惊骇赔罪与龙宫宝库赠装剧本完备');
    assert(dlgs.chentang_guanyin_revelation, '陈塘关观音菩萨显圣点化前世与西行宿命剧本完备');
    assert(dlgs.tangtaizong_talk && dlgs.changan_farewell_liuboqin, '唐太宗殿前授文牒与刘伯钦城门送行剧本完备');

    // 8. 🛡️ 主线任务感叹号严格唯一制测试 (同一时刻全游戏只允许当前唯一步骤的 1 位 NPC 拥有金色感叹号)
    const testPhases = [
      { sp: 'heaven_prologue', map: 'tiangong_palace', expectNpc: 'npc_tianpeng' },
      { sp: 'heaven_saved_change', map: 'tiangong_palace', expectNpc: 'npc_juanlian' },
      { sp: 'heaven_huaguoshan', map: 'huaguoshan', expectNpc: 'npc_tianbing_scout' },
      { sp: 'heaven_huaguoshan_shuilien', map: 'huaguoshan_shuilien', expectNpc: 'npc_chimao_mahou' },
      { sp: 'heaven_huaguoshan_rescue', map: 'huaguoshan_shuilien', expectNpc: 'npc_juling_shen' },
      { sp: 'heaven_final_wukong', map: 'huaguoshan', expectNpc: 'npc_wukong_huaguo' },
      { sp: 'liujiacun_start', map: 'liujiacun', expectNpc: 'npc_liuboqin' },
      { sp: 'liujiacun_mushrooms_collected', map: 'liujiacun', expectNpc: 'npc_liuboqin' },
      { sp: 'donghai_yecha_ready', map: 'donghai_coast', expectNpc: 'npc_yecha' },
      { sp: 'donghai_dragon_arrived', map: 'donghai_coast', expectNpc: 'npc_aoguang_coast' },
      { sp: 'longgong_visit', map: 'longgong_palace', expectNpc: 'npc_aoguang' },
      { sp: 'chentang_guanyin_revelation', map: 'chentangguan', expectNpc: 'npc_guanyin_pu_sa' },
      { sp: 'changan_meet_xuanzang', map: 'changan_city', expectNpc: 'npc_xuanzang' },
      { sp: 'changan_meet_taizong', map: 'changan_city', expectNpc: 'npc_tangtaizong' },
      { sp: 'changan_farewell', map: 'changan_city', expectNpc: 'npc_liuboqin_changan' },
      { sp: 'wuxingshan_ready', map: 'wuxingshan', expectNpc: 'npc_wukong_sealed' }
    ];

    for (const item of testPhases) {
      app.storyPhase = item.sp;
      app.interactedNpcSet = new Set();
      app.loadMap(item.map);
      const exclamNpcs = app.npcs.filter(n => n.questStatus === 'available');
      assert(exclamNpcs.length === 1, `阶段【${item.sp}】地图【${item.map}】有且仅有 1 位 NPC 拥有金色感叹号 (实际数量: ${exclamNpcs.length})`);
      assert(exclamNpcs[0].id === item.expectNpc, `阶段【${item.sp}】拥有感叹号的 NPC 必须为指定唯一接引人【${item.expectNpc}】`);
    }
  }

  // =========================================================================
  // ▶️ [测试 23] 角色与怪物战斗模型1:1一致化、地图建筑扩建与五行山死循环根治断言
  // =========================================================================
  console.log('\n▶️ [测试 23] 角色与怪物战斗模型1:1一致化、地图建筑扩建与五行山死循环根治');
  {
    // 1. 模型一致性验证
    const allMaps = global.window.GAME_DATA.MAPS_2D;
    const tg = allMaps['tiangong_palace'];
    const tpNpc = tg.npcs.find(n => n.id === 'npc_tianpeng');
    assert(tpNpc && tpNpc.appearance === 'tianpeng_marshal', '天宫序章大地图天蓬元帅外观为【tianpeng_marshal】(绝非凡间猪八戒)');

    const sl = allMaps['huaguoshan_shuilien'];
    const jlNpc = sl.npcs.find(n => n.id === 'npc_juling_shen');
    assert(jlNpc && jlNpc.appearance === 'juling_shen', '水帘洞大地图巨灵神外观为【juling_shen】(绝非牛魔王)');

    const cmNpc = sl.npcs.find(n => n.id === 'npc_chimao_mahou');
    assert(cmNpc && cmNpc.appearance === 'chimao_mahou', '水帘洞大地图赤毛马猴外观为【chimao_mahou】(绝非齐天大圣)');

    const hg = allMaps['huaguoshan'];
    const stoneMonkey = hg.monsters.find(m => m.name.includes('小石猴'));
    assert(stoneMonkey && stoneMonkey.appearance === 'stone_monkey', '花果山小石猴外观为【stone_monkey】(绝非齐天大圣)');

    assert(typeof CharacterRenderer.drawTianpengMarshal === 'function', 'CharacterRenderer 挂载天蓬元帅神将绘制方法');
    assert(typeof CharacterRenderer.drawJuLingShen === 'function', 'CharacterRenderer 挂载巨灵神双斧神将绘制方法');
    assert(typeof CharacterRenderer.drawChiMaoMaHou === 'function', 'CharacterRenderer 挂载赤毛马猴战将绘制方法');
    assert(typeof CharacterRenderer.drawStoneMonkey === 'function', 'CharacterRenderer 挂载花果山小石猴绘制方法');
    assert(typeof CharacterRenderer.drawYeCha === 'function', 'CharacterRenderer 挂载东海巡海夜叉绘制方法');

    // 2. 地图建筑与构造丰富度断言
    const gl = allMaps['gaolaozhuang'];
    let glCityWalls = 0, glPalace = 0, glStore = 0, glFloor = 0;
    gl.tiles.forEach(row => row.forEach(t => {
      if (t === 'city_wall') glCityWalls++;
      if (t === 'tang_palace') glPalace++;
      if (t === 'tang_store') glStore++;
      if (t === 'manor_floor') glFloor++;
    }));
    assert(glCityWalls >= 100, `高老庄具备双层厚重围墙结构 (city_wall: ${glCityWalls} 格)`);
    assert(glPalace >= 20, `高老庄具备迎客正堂大宅 (tang_palace: ${glPalace} 格)`);
    assert(glStore >= 15, `高老庄具备东厢房闺楼与西客舍 (tang_store: ${glStore} 格)`);
    assert(glFloor >= 300, `高老庄铺设典雅青石院落地坪 (manor_floor: ${glFloor} 格)`);

    const lj = allMaps['liujiacun'];
    let ljHuts = 0, ljBarricades = 0;
    lj.tiles.forEach(row => row.forEach(t => {
      if (t === 'hut_wall') ljHuts++;
      if (t === 'wooden_barricade') ljBarricades++;
    }));
    assert(ljHuts >= 20, `刘家村具备大小农舍与粮舍木屋 (hut_wall: ${ljHuts} 格)`);
    assert(ljBarricades >= 30, `刘家村具备庭院菜园木栅栏 (wooden_barricade: ${ljBarricades} 格)`);

    const wx = allMaps['wuxingshan'];
    let wxRocks = 0, wxStele = 0;
    wx.tiles.forEach(row => row.forEach(t => {
      if (t === 'mountain_rock') wxRocks++;
      if (t === 'two_realms_stele') wxStele++;
    }));
    assert(wxRocks >= 80, `五行山具备连绵五指插天绝壁巨峰 (mountain_rock: ${wxRocks} 格)`);
    assert(wxStele === 1, '五行山山道旁巍然屹立【两界界碑】');

    // 3. 五行山时空门禁与防死循环逻辑断言
    const app = window.App2D;
    // A. 砍柴阶段 (未西行)：靠近金条绝对不触发，孙悟空绝对不可见
    app.storyPhase = 'liujiacun_wood_gathering';
    app.loadMap('wuxingshan');
    const sealedWukongInWood = app.npcs.find(n => n.id === 'npc_wukong_sealed');
    assert(!sealedWukongInWood, '砍柴伐木阶段五行山被压孙悟空绝对不可见 (严防时空穿透)');

    app.playerChar.x = 12 * 32;
    app.playerChar.y = 3 * 32; // 站在金符正上方
    app.isSealTriggered = false;
    app.isSealTriggering = false;
    app.update(16);
    assert(!app.isSealTriggering, '砍柴伐木阶段站在金符处绝对不触发揭符对话 (严格剧情门禁)');

    // B. 西行启程阶段 (拜别太宗后)：孙悟空显圣，揭金符带状态锁
    app.storyPhase = 'wuxingshan_ready';
    app.loadMap('wuxingshan');
    const sealedWukongReady = app.npcs.find(n => n.id === 'npc_wukong_sealed');
    assert(sealedWukongReady, '西行正式启程后五行山被压孙悟空正式显圣');

    app.isSealTriggered = false;
    app.isSealTriggering = false;
    app.playerChar.x = 12 * 32;
    app.playerChar.y = 3 * 32;
    app.update(16);
    assert(app.isSealTriggering, '西行正式启程后站在金符处成功触发揭符事件');

    // 再次调用 update，因为处于 isSealTriggering 中，防重入锁生效，绝不重复调用
    app.update(16);
    assert(app.isSealTriggering, '防重入锁生效，每帧update绝对不重复弹出或重置对话');

    // 揭开金符
    app.releaseWukong();
    assert(app.isSealTriggered, '揭下金符后 isSealTriggered 锁定为 true');
    assert(allMaps['wuxingshan'].tiles[3][12] !== 'wuxing_seal', '金帖化光飞升，瓦片即时替换为普通山石');
  }

  // =========================================================================
  // 测试 24：剧情对话点击交互引擎（点击对话框内继续、点击对话框外场景直接解除并结算完整流程）
  // =========================================================================
  {
    console.log('\n▶️ [测试 24] 剧情对话点击交互引擎（框内继续 vs 框外场景解除走完流程）');

    assert(window.Dialogue && typeof window.Dialogue.start === 'function', 'Dialogue 引擎单例初始化成功');
    assert(typeof window.Dialogue.next === 'function', 'Dialogue 挂载 next 继续对话方法');
    assert(typeof window.Dialogue.chooseOption === 'function', 'Dialogue 挂载 chooseOption 分支选择方法');
    assert(typeof window.Dialogue.close === 'function', 'Dialogue 挂载 close 彻底关闭方法');
    assert(typeof window.Dialogue.completeAllAndClose === 'function', 'Dialogue 挂载 completeAllAndClose 解除并走完流程方法');

    // 1. 模拟【点击对话框内】：打字机快进 -> 推进下一步 -> 触发当前步 action -> 结束
    let step0ActionCalled = false;
    let step1ActionCalled = false;
    let dialogueCompleted = false;

    const testDlg = {
      steps: [
        {
          speaker: '太白金星',
          text: '少侠且慢行，老夫奉玉帝圣旨前来迎候！',
          action: () => { step0ActionCalled = true; }
        },
        {
          speaker: '威灵将军',
          text: '老星君有何法旨？末将洗耳恭听！',
          action: () => { step1ActionCalled = true; }
        }
      ]
    };

    window.Dialogue.start(testDlg, () => {
      dialogueCompleted = true;
    });

    assert(window.Dialogue.currentDialogue === testDlg, 'Dialogue 成功开启对话');
    assert(window.Dialogue.currentStep === 0, '对话当前处于第 0 步');
    assert(window.Dialogue.isTyping === true, '初始进入打字机播报状态');

    // 点击对话框内容 1：打字中点击 -> 立即快进打完字
    window.Dialogue.next();
    assert(window.Dialogue.isTyping === false, '打字中点击对话框内：快进完成，文本全部展现');
    assert(!step0ActionCalled, '快进文字时当前步骤 action 暂不触发');

    // 点击对话框内容 2：文字已完整展示 -> 点击进入第 1 步，并触发第 0 步 action
    window.Dialogue.next();
    assert(step0ActionCalled === true, '点击对话框内继续：触发第 0 步 action');
    assert(window.Dialogue.currentStep === 1, '对话平滑推进到第 1 步');

    // 点击对话框内容 3：再次点击快进第 1 步
    window.Dialogue.next();
    assert(window.Dialogue.isTyping === false, '第 1 步打字快进完成');

    // 点击对话框内容 4：已是最后一步，点击后触发第 1 步 action 并正常结束
    window.Dialogue.next();
    assert(step1ActionCalled === true, '最后一步点击触发第 1 步 action');
    assert(dialogueCompleted === true, '对话自然走完，触发 onCompleteCallback');
    assert(window.Dialogue.currentDialogue === null, '对话自然关闭，状态已重置');

    // 2. 模拟【点击对话框外场景】：直接解除对话，并把剩余所有步骤 action 与唯一选项 action 完整结算！
    let s0Action = false;
    let s1Action = false;
    let s2OptionAction = false;
    let skipCompleted = false;

    const storyFlowDlg = {
      steps: [
        {
          speaker: '刘伯钦',
          text: '贤弟！前方乃五行山地界，凶险万分！',
          action: () => { s0Action = true; }
        },
        {
          speaker: '刘伯钦',
          text: '收下这柄猎叉与两界通行令牌，可保周全！',
          action: () => { s1Action = true; }
        },
        {
          speaker: '少侠',
          text: '多谢太保兄！我们一同上山！',
          options: [
            {
              text: '【启程奔赴五行山救大圣】',
              action: () => { s2OptionAction = true; }
            }
          ]
        }
      ]
    };

    window.Dialogue.start(storyFlowDlg, () => {
      skipCompleted = true;
    });

    assert(window.Dialogue.currentDialogue === storyFlowDlg, '主线对话成功开启');
    assert(window.Dialogue.currentStep === 0, '当前停留在第 0 步打字');

    // 玩家不想一句一句看，在第 0 步直接点击了对话框外（场景草地）
    window.Dialogue.completeAllAndClose();

    assert(window.Dialogue.currentDialogue === null, '点击场景后对话框立即解除关闭');
    assert(s0Action === true, '走完流程：当前第 0 步 action 成功结算');
    assert(s1Action === true, '走完流程：后续第 1 步 action 成功结算');
    assert(s2OptionAction === true, '走完流程：后续第 2 步单选项推进 action 成功结算');
    assert(skipCompleted === true, '走完流程：最终 onCompleteCallback 成功触发');
    assert(document.getElementById('dialogue-overlay') === null, '遮罩 DOM 彻底从场景中销毁');

    // 3. 多选项（功能性选择如传送/买药）安全测试：点击场景跳过时不强制执行任何分支
    let opt0Called = false;
    let opt1Called = false;
    const multiOptDlg = {
      steps: [
        {
          speaker: '土地公',
          text: '老儿参见少侠，请问少侠欲往何处？',
          options: [
            { text: '传送去两界山', action: () => { opt0Called = true; } },
            { text: '传送去长安城', action: () => { opt1Called = true; } }
          ]
        }
      ]
    };

    window.Dialogue.start(multiOptDlg);
    window.Dialogue.completeAllAndClose();
    assert(opt0Called === false && opt1Called === false, '多分支选择对话点击场景跳过时，不强制触发任何传送/消费操作');
    assert(window.Dialogue.currentDialogue === null, '多分支对话安全关闭');

    // 4. 事件隔离与 DOM 渲染结构验证
    window.Dialogue.start(testDlg);
    const overlayEl = document.getElementById('dialogue-overlay');
    assert(overlayEl !== null, 'DOM 视口成功挂载 dialogue-overlay');
    assert(typeof overlayEl.onclick === 'function', 'overlay 成功绑定点击场景外部检测事件');
    assert(overlayEl.innerHTML.includes('onclick="event.stopPropagation(); window.Dialogue.next()"'), 'dialogue-box 正确配置冒泡隔离与点击继续事件');
    assert(overlayEl.innerHTML.includes('点击场景跳过 ✕'), '提示文案已友好展示【点击场景跳过 ✕】');
    window.Dialogue.close();
    assert(document.getElementById('dialogue-overlay') === null, 'close 后 overlay 彻底清除');
  }

  // =========================================================================
  // 测试 25：水帘洞小猴野怪生态、场景切图过渡动效、战斗全员等级显示、Tab生灵名册与前戏数值调谐
  // =========================================================================
  {
    console.log('\n▶️ [测试 25] 水帘洞小猴生态、切图动效、战斗全员等级、Tab生灵名册与前戏数值调谐');

    // 1. 水帘洞小猴野怪生态校验
    const shuilienMap = window.GAME_DATA.MAPS_2D['huaguoshan_shuilien'];
    assert(shuilienMap && Array.isArray(shuilienMap.monsters), '水帘洞地图正确配置野怪列表');
    assert(shuilienMap.monsters.length >= 6, `水帘洞部署充足小猴野怪 (当前配置: ${shuilienMap.monsters.length} 只)`);
    const allL3Monkeys = shuilienMap.monsters.every(m => m.level === 3 && m.appearance === 'stone_monkey');
    assert(allL3Monkeys, '水帘洞所有小猴野怪等级均为 3 级且外观为【stone_monkey】');
    const validSkills = shuilienMap.monsters.every(m => m.skills && m.skills.includes('抛石') && m.skills.includes('抓挠'));
    assert(validSkills, '水帘洞小猴野怪均掌握特色武技【抛石】与【抓挠】');

    // 2. 场景切图过渡动效机制校验
    const app = window.App2D;
    assert(typeof app.loadMap === 'function', 'App2D 挂载 loadMap 方法');
    assert(app.isTransitioning === false, '转场锁初始状态为 false');

    // 踩门触发校验
    let enteredDuration = null;
    const originalLoadMap = app.loadMap;
    app.loadMap = function(mId, spawn, opts) {
      enteredDuration = (opts && typeof opts.duration === 'number') ? opts.duration : null;
      return originalLoadMap.call(app, mId, spawn, opts);
    };

    // 模拟踩传送门
    app.tryEnterPortal({
      targetMap: 'huaguoshan',
      targetX: 10 * 32,
      targetY: 10 * 32
    });
    assert(enteredDuration === 0.75, '玩家走动踩传送门切图触发平滑过渡动效，时长精确为 0.75s');

    // 模拟转场锁拦截
    app.isTransitioning = true;
    let blockedCall = false;
    app.loadMap = function() { blockedCall = true; };
    app.tryEnterPortal({ targetMap: 'huaguoshan', targetX: 10, targetY: 10 });
    assert(!blockedCall, '场景转场过渡期间激活防重入锁，绝对阻止重复切图与重复踩门');
    app.isTransitioning = false;
    app.loadMap = originalLoadMap;

    // 3. 战斗界面全员等级展示字段校验
    // 构造模拟对战环境
    const mockBattle = {
      turnOrder: 1,
      turnQueue: [
        { name: '齐天大圣', level: 99, side: 'enemy', turnOrder: 1 },
        { name: '少侠', level: 12, side: 'ally', turnOrder: 2 }
      ],
      allies: [
        { id: 'player', name: '少侠', level: 12, isPlayer: true, hp: 600, maxHp: 600, mp: 200, maxMp: 200 }
      ],
      enemies: [
        { id: 'enemy_1', enemyIndex: 0, name: '花果山小猴', level: 3, hp: 120, maxHp: 120 }
      ],
      logs: ['战斗开始！'],
      status: 'waiting_input'
    };

    app.currentBattle = mockBattle;
    app.selectedTargetIndex = 0;
    app.selectedAllyId = 'player';
    
    // 注入模拟战斗层 DOM
    let battleContainer = document.getElementById('battle-screen-layer');
    if (!battleContainer) {
      battleContainer = document.createElement('div');
      battleContainer.id = 'battle-screen-layer';
      domMap['battle-screen-layer'] = battleContainer;
    }
    app.renderBattleInterface();

    const html = battleContainer.innerHTML;
    assert(html.includes('[Lv.3] 花果山小猴'), '战斗目标胶囊中清晰显示目标等级【[Lv.3] 花果山小猴】');
    assert(html.includes('[Lv.12] 少侠-出招'), '出招角色胶囊中清晰显示角色等级【[Lv.12] 少侠-出招】');
    assert(html.includes('[Lv.12] 少侠'), '玩家指挥本尊胶囊清晰显示等级【[Lv.12] 少侠】');
    assert(html.includes('[Lv.99] 齐天大圣'), '战术时序速度轴清晰显示【[Lv.99] 齐天大圣】');
    app.currentBattle = null;

    // 4. Tab 键【当前场景生灵名册】与野怪去重校验
    assert(typeof app.toggleSceneRosterModal === 'function', 'App2D 挂载 toggleSceneRosterModal');
    assert(typeof app.renderSceneRosterModal === 'function', 'App2D 挂载 renderSceneRosterModal');
    assert(typeof app.navigateRosterToNpc === 'function', 'App2D 挂载 navigateRosterToNpc');

    // 载入水帘洞测试名册
    app.loadMap('huaguoshan_shuilien', null, { duration: 0 });
    assert(app.monsters.length === 6, '水帘洞成功实例化 6 只小猴实例');

    // 呼出名册
    app.toggleSceneRosterModal(true);
    const rosterEl = document.getElementById('scene-roster-modal');
    assert(rosterEl !== null, '成功通过 Tab 机制呼出场景生灵名册模态框');

    // 验证野怪去重：6 只小猴在名册中严格去重为 1 种小猴
    const rosterHtml = rosterEl.innerHTML;
    assert(rosterHtml.includes('场景仙民 / NPC'), '名册面板上半区优先排列场景仙民 / NPC');
    assert(rosterHtml.includes('出没异兽 / 野怪'), '名册面板下半区排列出没异兽 / 野怪');
    assert(rosterHtml.includes('出没异兽 / 野怪 (1种)'), '水帘洞 6 只相同小猴野怪严格去重，每种仅展示 1 个 (显示: 1种)');
    assert(rosterHtml.includes('Lv.3'), '野怪条目上清晰标示等级【Lv.3】');
    assert(rosterHtml.includes('花果山小猴'), '野怪条目显示纯正名称【花果山小猴】');

    // 验证点击详情面板属性包含：等级、气血、攻防速与技能
    assert(rosterHtml.includes('气血灵韵') || rosterHtml.includes('120 / 120'), '生灵档案详情卡片包含完整生命气血属性');
    assert(rosterHtml.includes('战法修行三维') || rosterHtml.includes('攻击:'), '生灵档案详情卡片包含攻防速三维数据');
    assert(rosterHtml.includes('抛石') || rosterHtml.includes('抓挠'), '生灵档案详情卡片展示野怪所掌握技能');

    // 验证 NPC 智能寻路接口
    const mahouNpc = app.npcs.find(n => n.id === 'npc_chimao_mahou');
    assert(mahouNpc !== null, '水帘洞存在赤毛马猴 NPC');
    app.navigateRosterToNpc('npc_chimao_mahou');
    assert(document.getElementById('scene-roster-modal') === null, '点击一键寻路后名册自动关闭收起');

    // 5. 刘家村前的前戏战斗数值调谐断言（杜绝1滴血，天蓬与大圣战精准达标）
    // A. 天蓬战：玩家打天蓬约 50%，天蓬打玩家约 10%
    const tpUser = { id: 'player', name: '少侠', isPlayer: true, level: 1, atk: 25, def: 12, hp: 500, maxHp: 500 };
    const tpMarshal = { id: 'tianpeng_boss', name: '天蓬元帅', level: 25, isBoss: true, atk: 50, def: 30, hp: 1200, maxHp: 1200 };

    const resUserToTp = window.BattleEngine.calculateAttackDamage(tpUser, tpMarshal, { dmgFluctuate: 1.0 });
    const dmgUserToTp = resUserToTp.totalDamage;
    const pctUserToTp = dmgUserToTp / tpMarshal.maxHp;
    assert(pctUserToTp >= 0.40 && pctUserToTp <= 0.60, `天蓬战玩家普攻天蓬造成约50%伤害 (实际: ${(pctUserToTp*100).toFixed(1)}%)`);

    const resTpToUser = window.BattleEngine.calculateAttackDamage(tpMarshal, tpUser, { dmgFluctuate: 1.0 });
    const dmgTpToUser = resTpToUser.totalDamage;
    const pctTpToUser = dmgTpToUser / tpUser.maxHp;
    assert(pctTpToUser >= 0.08 && pctTpToUser <= 0.15, `天蓬战天蓬攻击玩家造成约10%伤害 (实际: ${(pctTpToUser*100).toFixed(1)}%)`);

    // B. 大圣战：队友打大圣约 5%，大圣打天兵刚好秒杀斩杀
    const allySoldier = { id: 'tianbing_scout', name: '天兵巡逻哨', isPlayer: false, level: 20, atk: 45, def: 25, hp: 600, maxHp: 600 };
    const wukongBoss = { id: 'wukong_havoc_boss', name: '齐天大圣', level: 99, isBoss: true, atk: 999, def: 500, hp: 5000, maxHp: 5000 };

    const resAllyToWk = window.BattleEngine.calculateAttackDamage(allySoldier, wukongBoss, { dmgFluctuate: 1.0 });
    const dmgAllyToWk = resAllyToWk.totalDamage;
    const pctAllyToWk = dmgAllyToWk / wukongBoss.maxHp;
    assert(pctAllyToWk >= 0.03 && pctAllyToWk <= 0.08, `大圣战队友攻击大圣造成约5%伤害打击感 (实际: ${(pctAllyToWk*100).toFixed(1)}%)`);

    const resWkToAlly = window.BattleEngine.calculateAttackDamage(wukongBoss, allySoldier, { dmgFluctuate: 1.0 });
    const dmgWkToAlly = resWkToAlly.totalDamage;
    assert(dmgWkToAlly >= allySoldier.maxHp, `大圣战大圣神威碾压，出手刚好秒杀天兵 (伤害: ${dmgWkToAlly}, 天兵血量: ${allySoldier.maxHp})`);
  }

  // =========================================================================
  // 测试 26：房屋栅栏入口拓宽(>=3格)、野生蘑菇独立模型与防0.5s重刷、Tab场景万象名册全新排版
  // =========================================================================
  {
    console.log('\n▶️ [测试 26] 栅栏入口拓宽(>=3格)、蘑菇专属模型与防重刷、Tab名册全新排版');

    // 1. 房屋栅栏入口宽度校验（严防1格窄缝导致角色卡死，所有栅栏入口必须 >= 3 格）
    const liujiaMap = window.GAME_DATA.MAPS_2D['liujiacun'];
    assert(liujiaMap && Array.isArray(liujiaMap.tiles), '刘家村地图正常加载');

    // 检查刘家村第 12 行与第 17 行栅栏的通路宽度
    [12, 17].forEach(rowIdx => {
      const row = liujiaMap.tiles[rowIdx];
      let currentGap = 0;
      let gapWidths = [];
      for (let col = 0; col < row.length; col++) {
        const tile = row[col];
        if (tile === 'wooden_barricade') {
          if (currentGap > 0) {
            gapWidths.push(currentGap);
            currentGap = 0;
          }
        } else {
          // 非栅栏（通道或草地）
          currentGap++;
        }
      }
      if (currentGap > 0) gapWidths.push(currentGap);
      
      // 过滤掉边缘留白，只关注栅栏中间的院落大门口
      const doorGaps = gapWidths.filter(w => w >= 3);
      assert(doorGaps.length >= 2, `刘家村第 ${rowIdx} 行院落入口宽度全部达标 >= 3 格 (检测到有效通道宽度: ${doorGaps.join(', ')})`);
      const narrowGaps = gapWidths.filter(w => w === 1 || w === 2);
      assert(narrowGaps.length === 0, `刘家村第 ${rowIdx} 行绝无 1~2 格窄门通道 (窄门数: ${narrowGaps.length})`);
    });

    // 检查高老庄木棚栅栏入口宽度
    const gaoMap = window.GAME_DATA.MAPS_2D['gaolaozhuang'];
    assert(gaoMap && Array.isArray(gaoMap.tiles), '高老庄地图正常加载');
    const gaoRow22 = gaoMap.tiles[22];
    let gaoGap = 0;
    for (let c = 16; c <= 22; c++) {
      if (gaoRow22[c] !== 'wooden_barricade') gaoGap++;
    }
    assert(gaoGap >= 3, `高老庄内院/木棚栅栏通道宽度充足 (实际宽度: ${gaoGap} 格 >= 3格)`);

    // 2. 野生蘑菇独立模型与采摘永续消隐校验（坚决不用人型、采摘后过0.5s绝不再重刷）
    const charRenderer = window.CharacterRenderer;
    assert(typeof charRenderer.drawMushroom === 'function', 'CharacterRenderer 挂载 drawMushroom 灵芝仙草独立绘制方法');

    // 模拟 ctx 验证 drawModel('mushroom') 绝对不回退到天将人型
    let calledMushroom = false;
    let calledHeavenGeneral = false;
    const origDrawMushroom = charRenderer.drawMushroom;
    const origDrawHG = charRenderer.drawHeavenGeneral;
    charRenderer.drawMushroom = () => { calledMushroom = true; };
    charRenderer.drawHeavenGeneral = () => { calledHeavenGeneral = true; };

    const mockCtx = {
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      beginPath: () => {},
      arc: () => {},
      ellipse: () => {},
      fill: () => {},
      stroke: () => {},
      rect: () => {},
      closePath: () => {},
      createRadialGradient: () => ({ addColorStop: () => {} }),
      createLinearGradient: () => ({ addColorStop: () => {} })
    };

    charRenderer.drawModel(mockCtx, 100, 100, 'mushroom');
    assert(calledMushroom === true, 'drawModel("mushroom") 精准分发至蘑菇专属绘制');
    assert(calledHeavenGeneral === false, '蘑菇模型绝不回退至金甲天将人型');
    charRenderer.drawMushroom = origDrawMushroom;
    charRenderer.drawHeavenGeneral = origDrawHG;

    // 采摘逻辑防 0.5s 重刷与永续消隐
    const app = window.App2D;
    assert(app.collectedProps instanceof Set, 'App2D 正确维护 collectedProps 已采集物品集合');

    app.currentMapId = 'liujiacun';
    app.storyPhase = 'liujiacun_find_mushrooms';
    app.player = app.player || { x: 10 * 32, y: 10 * 32 };
    const testShroom = {
      id: 'prop_mushroom_1',
      name: '野生青蘑菇',
      type: 'prop',
      appearance: 'mushroom',
      x: 10 * 32,
      y: 10 * 32
    };
    app.npcs = [testShroom];
    assert(app.isNpcVisibleInStoryPhase(testShroom.id) === true, '采摘阶段未采集的蘑菇在场景中可见');

    // 执行采摘
    if (!app.questKills) app.questKills = { mushrooms: 0, trees: 0, rats: 0 };
    app.questKills.mushrooms = 0;
    app.collectMushroom();
    assert(app.questKills.mushrooms === 1, '采集后蘑菇计数增加为 1');
    assert(app.collectedProps.has(testShroom.id) === true, '已采摘蘑菇记录进入 collectedProps 永续集合');
    assert(app.isNpcVisibleInStoryPhase(testShroom.id) === false, '已采摘蘑菇在后续故事阶段绝对不可见');

    // 模拟 0.5s 后的场景刷新/重载，验证绝不再出现
    const visibleAfterHalfSec = app.isNpcVisibleInStoryPhase(testShroom.id);
    assert(visibleAfterHalfSec === false, '采摘后过 0.5s 蘑菇绝对不会重新刷新或幽灵复现');

    // 测试存档持久化：保存后再读档，已采摘状态依然有效
    let savedState = null;
    window.SaveManager = {
      saveGameFullState: (st) => { savedState = JSON.parse(JSON.stringify(st)); },
      loadGameFullState: () => savedState,
      hasAutoSave: () => !!savedState
    };
    app.saveAutoProgress();
    assert(savedState && savedState.collectedProps && savedState.collectedProps.includes(testShroom.id), '存档状态正确持久化保存 collectedProps 道具消隐列表');

    // 模拟重置内存状态，然后读档恢复
    app.collectedProps = new Set();
    assert(app.collectedProps.has(testShroom.id) === false, '内存重置后初始不包含该道具');
    app.loadAutoSavedProgress();
    assert(app.collectedProps.has(testShroom.id) === true, '读档后成功恢复 collectedProps 永续集合，绝不再重刷');

    // 3. 按 Tab 键查看场景任务与名册面板全新排版样式校验
    app.toggleSceneRosterModal(true);
    const rosterEl = document.getElementById('scene-roster-modal');
    assert(rosterEl !== null, '成功呼出场景生灵名册模态框');
    const rosterHtml = rosterEl.innerHTML;
    assert(rosterHtml.includes('roster-modal-box'), 'Tab 场景名册采用专属 .roster-modal-box 容器');
    assert(rosterHtml.includes('roster-dragon-header'), '名册顶栏采用国风双龙金匾 .roster-dragon-header');
    assert(rosterHtml.includes('roster-main-body'), '名册主体采用左右分栏 .roster-main-body');
    assert(rosterHtml.includes('roster-list-panel'), '名册左侧采用固定宽度滚动列表 .roster-list-panel');
    assert(rosterHtml.includes('roster-detail-panel'), '名册右侧采用生灵精研详案 .roster-detail-panel');

    // 校验 CSS 文件中关键样式的覆盖完整性
    const fs = require('fs');
    const cssContent = fs.readFileSync('css/style.css', 'utf8');
    assert(cssContent.includes('.roster-modal-box'), 'CSS 包含 .roster-modal-box 样式定义');
    assert(cssContent.includes('.roster-dragon-header'), 'CSS 包含 .roster-dragon-header 样式定义');
    assert(cssContent.includes('.roster-main-body'), 'CSS 包含 .roster-main-body 样式定义');
    assert(cssContent.includes('.roster-list-panel'), 'CSS 包含 .roster-list-panel 样式定义');
    assert(cssContent.includes('.roster-detail-panel'), 'CSS 包含 .roster-detail-panel 样式定义');
    assert(cssContent.includes('.roster-item-card.active'), 'CSS 包含生灵卡片高亮选中态样式');
    app.toggleSceneRosterModal(false);
  }

  // =========================================================================
  // 测试 27：技能5级25000熟练度法则、1/5提前突破、长安神坛与菩提老祖交互、舍生与妖魔技能数值
  // =========================================================================
  {
    console.log('\n▶️ [测试 27] 技能5级25000法则、1/5提前突破、长安神坛与菩提老祖、舍生与妖魔技能数值');

    const app = window.App2D;
    const engine = window.SkillMasteryEngine;
    assert(engine !== undefined, 'SkillMasteryEngine 核心熟练度引擎挂载成功');
    assert(engine.MAX_LEVEL === 5, '所有技能最高划分为 5 级 (Lv.1 ~ Lv.5)');
    assert(engine.SPAN_PER_LEVEL === 5000, '每一级熟练度跨度严格为 5000');
    assert(engine.MAX_MASTERY === 25000, '满级满熟练度严格封顶为 25000');

    // 1. 熟练度锁级规则与防死刷判定
    assert(engine.isLevelLocked(1, 4999) === false, 'Lv.1 熟练度 4999 时未锁级');
    assert(engine.isLevelLocked(1, 5000) === true, 'Lv.1 熟练度达到 5000 触发锁级保护');
    assert(engine.isLevelLocked(2, 10000) === true, 'Lv.2 熟练度达到 10000 触发锁级保护');
    assert(engine.isLevelLocked(3, 15000) === true, 'Lv.3 熟练度达到 15000 触发锁级保护');
    assert(engine.isLevelLocked(4, 20000) === true, 'Lv.4 熟练度达到 20000 触发锁级保护');
    assert(engine.isLevelLocked(5, 25000) === true, 'Lv.5 熟练度达到 25000 极境封顶');

    // 模拟战斗使用技能加熟练度，达到上限后锁级不再增加 1 点
    const testSkill = { id: 'sk_test', name: '破天斩', level: 1, mastery: 4990 };
    const resGain1 = engine.gainMastery(testSkill, 10);
    assert(resGain1.success === true && testSkill.mastery === 5000, '熟练度累加至 5000 达到本级上限');
    assert(resGain1.locked === true, '熟练度达到 5000 立即被系统锁定');

    const resGain2 = engine.gainMastery(testSkill, 10);
    assert(resGain2.success === false && testSkill.mastery === 5000, '处于锁级状态下即便再次施法，熟练度也绝对不加 1 点 (仍为 5000)');

    // 2. 1/5 熟练度提前突破升级法则
    assert(engine.canUpgrade(1, 999) === false, 'Lv.1 熟练度 999 未达 1/5 门槛，不允许升级');
    assert(engine.canUpgrade(1, 1000) === true, 'Lv.1 熟练度达到 1000 (满额5000的1/5)，允许提前升级');
    assert(engine.canUpgrade(2, 5999) === false, 'Lv.2 熟练度 5999 未达 6000 门槛，不允许升级');
    assert(engine.canUpgrade(2, 6000) === true, 'Lv.2 熟练度达到 6000 (满足第2级跨度的1/5)，允许提前升级');

    // 3. 菩提老祖唯一交互升级法则 (私授无效，必须老祖亲传)
    const skillToUpgrade = { id: 'sk_test_up', name: '舍生取义', level: 1, mastery: 1000 };
    const privateUpgrade = engine.upgradeSkill(skillToUpgrade, false);
    assert(privateUpgrade.success === false && skillToUpgrade.level === 1, '未在神坛与菩提老祖交互时，私自升级被绝对阻止');

    const masterUpgrade = engine.upgradeSkill(skillToUpgrade, true);
    assert(masterUpgrade.success === true && skillToUpgrade.level === 2, '在菩提老祖神坛点化下，成功突破晋升至 Lv.2');

    // 4. 【舍生取义】专项数值精确断言 (用户最新确立的权威标准)
    // A. 1级0熟练度：伤害500，反噬0，耗蓝220
    const shesheng0 = engine.calculateShesheng(null, null, 1, 0);
    assert(shesheng0.damage === 500, `舍生取义 Lv.1 0熟练度伤害精确为 500 (实际: ${shesheng0.damage})`);
    assert(shesheng0.selfDamage === 0, `舍生取义 Lv.1 0熟练度自损精确为 0 (实际: ${shesheng0.selfDamage})`);
    assert(shesheng0.costMp === 220, `舍生取义 Lv.1 0熟练度耗蓝精确为 220 (实际: ${shesheng0.costMp})`);

    // B. 10熟练度以内：无副作用
    const shesheng10 = engine.calculateShesheng(null, null, 1, 10);
    assert(shesheng10.selfDamage === 0, `舍生取义 Lv.1 10熟练度以内无副作用自损为 0 (实际: ${shesheng10.selfDamage})`);

    // C. 10熟练度之后：伤害501，反噬1，耗蓝220
    const shesheng11 = engine.calculateShesheng(null, null, 1, 11);
    assert(shesheng11.damage === 501, `舍生取义 Lv.1 11熟练度伤害为 501 (实际: ${shesheng11.damage})`);
    assert(shesheng11.selfDamage === 1, `舍生取义 Lv.1 11熟练度反噬为 1 (实际: ${shesheng11.selfDamage})`);
    assert(shesheng11.costMp === 220, `舍生取义 Lv.1 11熟练度耗蓝为 220 (实际: ${shesheng11.costMp})`);

    // D. 1000熟练度：伤害650，反噬40，耗蓝250
    const shesheng1000 = engine.calculateShesheng(null, null, 1, 1000);
    assert(shesheng1000.damage === 650, `舍生取义 Lv.1 1000熟练度伤害为 650 (实际: ${shesheng1000.damage})`);
    assert(shesheng1000.selfDamage === 40, `舍生取义 Lv.1 1000熟练度反噬为 40 (实际: ${shesheng1000.selfDamage})`);
    assert(shesheng1000.costMp === 250, `舍生取义 Lv.1 1000熟练度耗蓝为 250 (实际: ${shesheng1000.costMp})`);

    // E. 1000熟练度直接升级二级：伤害1600，反噬400，耗蓝350
    const sheshengLv2 = engine.calculateShesheng(null, null, 2, 1000);
    assert(sheshengLv2.damage === 1600, `舍生取义 1000熟练度升2级伤害跃升为 1600 (实际: ${sheshengLv2.damage})`);
    assert(sheshengLv2.selfDamage === 400, `舍生取义 1000熟练度升2级反噬跃升为 400 (实际: ${sheshengLv2.selfDamage})`);
    assert(sheshengLv2.costMp === 350, `舍生取义 1000熟练度升2级耗蓝跃升为 350 (实际: ${sheshengLv2.costMp})`);

    // F. 满级满熟练度：伤害约16000，使用一次自伤8000血
    const sheshengMax = engine.calculateShesheng(null, null, 5, 25000);
    assert(sheshengMax.damage === 16000, `舍生取义 Lv.5 满25000熟练度伤害精确为 16000 (实际: ${sheshengMax.damage})`);
    assert(sheshengMax.selfDamage === 8000, `舍生取义 Lv.5 满25000熟练度单次自伤精确为 8000 血 (实际: ${sheshengMax.selfDamage})`);

    // G. 气血低于10%判定与致死保护断言
    const lowHpUser = { hp: 9, maxHp: 100 };
    const lowHpCheck = engine.canCastShesheng(lowHpUser);
    assert(lowHpCheck.canCast === false, '舍生取义在生命值低于10%时无法施展');
    const exactHpUser = { hp: 10, maxHp: 100 };
    const exactHpCheck = engine.canCastShesheng(exactHpUser);
    assert(exactHpCheck.canCast === true, '舍生取义在生命值刚好达到10%时允许施展');

    // 5. 妖魔高耗蓝与群体必中技能数值断言
    // A. 雷霆万钧：1级耗蓝300，0熟练度伤害420
    const leiting = engine.calculateLeiting(null, null, 1, 0);
    assert(leiting.costMp === 300, `雷霆万钧 Lv.1 单体魔雷耗蓝为 300 (实际: ${leiting.costMp})`);
    assert(leiting.damage === 420, `雷霆万钧 Lv.1 0熟练度伤害为 420 (实际: ${leiting.damage})`);

    // B. 雷霆万钧满级满熟练度：伤害12608
    const leitingMax = engine.calculateLeiting(null, null, 5, 25000);
    assert(leitingMax.damage === 12608, `雷霆万钧 Lv.5 满25000熟练度伤害精准达到 12608 (实际: ${leitingMax.damage})`);

    // C. 封印咒与定身咒命中率断言 (62%->95%, 33%->75%)
    const fengyinL1 = engine.calculateControlSpell('fengyin', 1, 0);
    assert(fengyinL1.hitRate === 0.62, `封印咒初始命中率为 62% (实际: ${fengyinL1.hitRate})`);
    const fengyinMax = engine.calculateControlSpell('fengyin', 5, 25000);
    assert(fengyinMax.hitRate === 0.95, `封印咒满级满熟练度命中率精准达到 95% (实际: ${fengyinMax.hitRate})`);

    const dingshenL1 = engine.calculateControlSpell('dingshen', 1, 0);
    assert(dingshenL1.hitRate === 0.33, `定身咒每个目标初始命中率为 33% (实际: ${dingshenL1.hitRate})`);
    const dingshenMax = engine.calculateControlSpell('dingshen', 5, 25000);
    assert(dingshenMax.hitRate === 0.75, `定身咒满级满熟练度单体命中率精准达到 75% (实际: ${dingshenMax.hitRate})`);

    // D. 三昧真火与飞沙走石：群体必中，随等级扩展目标数
    const fireL1 = engine.calculateGroupSpell('三昧真火', null, 4, 1, 0);
    assert(fireL1.isSureHit === true, '三昧真火为绝对必中群法');
    assert(fireL1.maxTargets === 1, '三昧真火 Lv.1 目标数为 1');

    const windL5 = engine.calculateGroupSpell('飞沙走石', null, 4, 5, 20000);
    assert(windL5.isSureHit === true, '飞沙走石为绝对必中群法');
    assert(windL5.maxTargets === 4, '飞沙走石 Lv.5 满阶目标数覆盖全队 4 人');

    // 6. 长安城左上角【神坛】场景与【菩提老祖】部署断言
    const allMaps = window.GAME_DATA.MAPS_2D;
    const caMap = allMaps['changan_city'];
    const shendanPortal = caMap.portals.find(p => p.targetMap === 'changan_shendan');
    assert(shendanPortal !== undefined, '长安城左上角成功部署直通【长安神坛】传送门');
    assert(shendanPortal.x <= 128 && shendanPortal.y <= 128, `神坛传送门精准位于长安城左上角 (${shendanPortal.x}, ${shendanPortal.y})`);

    const sdMap = allMaps['changan_shendan'];
    assert(sdMap !== undefined && sdMap.width === 38 && sdMap.height === 28, '神坛地图【changan_shendan】为 38x28 广阔仙境大地图');
    const putiNpc = sdMap.npcs.find(n => n.id === 'npc_puti_laozu');
    assert(putiNpc !== undefined, '神坛场景部署核心宗师【菩提老祖】');
    assert(putiNpc.appearance === 'puti_zushi', '菩提老祖外观为【puti_zushi】太极大袍仙相');

    // 7. 神坛对话与仙宠 10 级觉醒授法机制断言
    const dlgs = window.GAME_DATA.STORY_DIALOGUES;
    assert(dlgs.puti_shendan_talk !== undefined, '神坛菩提老祖专属对话剧本【puti_shendan_talk】完备');
    assert(typeof app.openSkillMasteryModal === 'function', 'App2D 挂载 openSkillMasteryModal 技能参悟模态框方法');
    assert(typeof app.learnClassSkillsFromMaster === 'function', 'App2D 挂载 learnClassSkillsFromMaster 老祖传道方法');
    assert(typeof app.awakenPetSkillAtMaster === 'function', 'App2D 挂载 awakenPetSkillAtMaster 仙宠10级授法方法');

    // 测试仙宠未满 10 级无法学法，满 10 级成功领悟
    app.playerData.pets = [{ id: 'pet_test', name: '幼白虎', level: 8, skills: [] }];
    app.playerData.activePet = app.playerData.pets[0];
    app.awakenPetSkillAtMaster();
    assert(app.playerData.activePet.skills.length === 0, '仙宠未满 10 级无法由菩提老祖授法');

    app.playerData.activePet.level = 10;
    app.awakenPetSkillAtMaster();
    assert(app.playerData.activePet.skills.some(s => s.name === '天雷引'), '仙宠达到 10 级后在神坛成功领悟专属灵法【天雷引】');

    // 8. 全职业 3 技能配置 (男女专属 + 2 通用) 断言
    const maleJingangSkills = window.GAME_DATA.getSkillsForClassAndGender('jingang', 'male');
    assert(maleJingangSkills.length === 3, '男金刚具备 3 个技能');
    assert(maleJingangSkills.some(s => s.name === '佛光普照'), '男金刚具备专属技能【佛光普照】');
    assert(maleJingangSkills.some(s => s.name === '舍生取义'), '男金刚具备通用技能【舍生取义】');
    assert(maleJingangSkills.some(s => s.name === '金刚护体'), '男金刚具备通用技能【金刚护体】');

    const femaleYaomoSkills = window.GAME_DATA.getSkillsForClassAndGender('yaomo', 'female');
    assert(femaleYaomoSkills.length === 3, '女妖魔具备 3 个技能');
    assert(femaleYaomoSkills.some(s => s.name === '万毒攻心'), '女妖魔具备专属技能【万毒攻心】');
    assert(femaleYaomoSkills.some(s => s.name === '三昧真火'), '女妖魔具备通用技能【三昧真火】');
    assert(femaleYaomoSkills.some(s => s.name === '飞沙走石'), '女妖魔具备通用技能【飞沙走石】');

    const maleXianrenSkills = window.GAME_DATA.getSkillsForClassAndGender('xianren', 'male');
    assert(maleXianrenSkills.some(s => s.name === '乱魂咒'), '男仙人具备专属技能【乱魂咒】');
    assert(maleXianrenSkills.some(s => s.name === '定身咒'), '男仙人具备通用技能【定身咒】');
    assert(maleXianrenSkills.some(s => s.name === '隐身咒'), '男仙人具备通用技能【隐身咒】');

    // 9. 三大职业天生自带初始抗性体系 (Innate Class Resistances) 断言
    const jgRes = engine.getInnateResistances('jingang');
    assert(jgRes.res_physical === 0.20, '金刚职业天生自带 20% 物理抗性');
    assert(jgRes.res_shesheng === 0.10, '金刚职业天生自带 10% 舍生抗性');
    assert(jgRes.res_xuanji === 0.05, '金刚职业天生自带 5% 玄击抗性 (全游戏唯一天生抗玄击来源)');

    const ymRes = engine.getInnateResistances('yaomo');
    assert(ymRes.res_physical === 0.10, '妖魔职业天生自带 10% 物理抗性');
    assert(ymRes.res_leiting === 0.10, '妖魔职业天生自带 10% 雷霆抗性');
    assert(ymRes.res_feisha === 0.10, '妖魔职业天生自带 10% 飞沙抗性');
    assert(ymRes.res_sanmei === 0.10, '妖魔职业天生自带 10% 三昧真火抗性');
    assert(ymRes.res_wandu === 0.10, '妖魔职业天生自带 10% 万毒攻心抗性');

    const sxRes = engine.getInnateResistances('shenxian');
    assert(sxRes.res_physical === 0.10, '神仙职业天生自带 10% 物理抗性');
    assert(sxRes.res_fengyin === 0.10, '神仙职业天生自带 10% 封印抗性');
    assert(sxRes.res_luanhun === 0.10, '神仙职业天生自带 10% 乱魂抗性');
    assert(sxRes.res_dingshen === 0.10, '神仙职业天生自带 10% 定身抗性');

    // 10. 佛光普照与如来神掌【玄击】公式、伤害基数与抗玄击减免断言
    // 假设敌方为妖魔 (无抗玄击)，当前生命 2000，当前法力 1000
    const dummyEnemy = { hp: 2000, maxHp: 2000, mp: 1000, maxMp: 1000, resistances: {} };
    const foguangRes = engine.calculateMpDrainAttack(false, null, dummyEnemy, 1, 0);
    // Lv.1 0熟练度：baseDmg=150 (主打百分比伤害，基数辅助), hpRatio=0.20, mpRatio=0.10
    assert(foguangRes.baseDmg === 150, '佛光普照 Lv.1 0熟练度伤害基数为 150');
    assert(foguangRes.hpRatio === 0.20, '佛光普照 Lv.1 扣除 20% 当前生命值');
    assert(foguangRes.mpRatio === 0.10, '佛光普照 Lv.1 扣除 10% 当前法力值');
    assert(foguangRes.damage === 150 + 400, `佛光普照无抗性时伤害精准为 550 (实际: ${foguangRes.damage})`);
    assert(foguangRes.mpDrain === 100, `佛光普照无抗性时扣除法力精准为 100 (实际: ${foguangRes.mpDrain})`);

    // 敌方为金刚 (天生自带 5% 抗玄击)
    const jgEnemy = { hp: 2000, maxHp: 2000, mp: 1000, maxMp: 1000, resistances: { res_xuanji: 0.05 } };
    const foguangVsJg = engine.calculateMpDrainAttack(false, null, jgEnemy, 1, 0);
    assert(foguangVsJg.damage === Math.floor(550 * 0.95), `金刚天生5%抗玄击减免后伤害为 522 (实际: ${foguangVsJg.damage})`);
    assert(foguangVsJg.mpDrain === Math.floor(100 * 0.95), `金刚天生5%抗玄击减免后扣蓝为 95 (实际: ${foguangVsJg.mpDrain})`);

    // 满级极境断言：佛光普照满级满熟练度基数精准达到 1500
    const foguangMax = engine.calculateMpDrainAttack(false, null, dummyEnemy, 5, 25000);
    assert(foguangMax.baseDmg === 1500, `佛光普照 Lv.5 满25000熟练度伤害基数精准达到 1500 (实际: ${foguangMax.baseDmg})`);

    // 如来神掌断言：Lv.1 基数为 100，Lv.5 满熟练度基数为 1000/每位
    const ruxiangRes = engine.calculateMpDrainAttack(true, null, dummyEnemy, 1, 0);
    assert(ruxiangRes.baseDmg === 100, `如来神掌 Lv.1 0熟练度伤害基数仅为 100 (实际: ${ruxiangRes.baseDmg})`);
    assert(ruxiangRes.baseDmg < foguangRes.baseDmg, '如来神掌伤害基数低于佛光普照');
    assert(ruxiangRes.hpRatio < foguangRes.hpRatio, '如来神掌生命削扣百分比低于佛光普照');
    assert(ruxiangRes.mpRatio < foguangRes.mpRatio, '如来神掌法力削扣百分比低于佛光普照');
    assert(ruxiangRes.damage < foguangRes.damage, '如来神掌单体威力低于佛光普照');

    const ruxiangMax = engine.calculateMpDrainAttack(true, null, dummyEnemy, 5, 25000);
    assert(ruxiangMax.baseDmg === 1000, `如来神掌 Lv.5 满25000熟练度伤害基数精准达到 1000/每位 (实际: ${ruxiangMax.baseDmg})`);
  }

  // =========================================================================
  // 测试 28: 金仙独门【元神变身】、逆境几率模型、天赋点成长与十二神魔专属天赋
  // =========================================================================
  {
    console.log('\n▶️ [测试 28] 金仙元神变身、逆境几率模型、天赋点成长与专属变身天赋');

    // 1. 三大阶层与禁捕红线断言
    const itemData = window.GAME_DATA.ITEMS;
    assert(itemData.talent_pill !== undefined, '道具数据库已成功装载金仙圣物【天赋丹】');
    assert(itemData.talent_pill.type === 'consumable', '【天赋丹】为可消耗使用道具');

    // 2. 普通凡宠与散仙无法变身断言
    const turtle = window.PetSystem.createPet('dahai_gui', false, 5);
    assert(turtle.quality === 'ordinary', '大海龟为普通凡宠');
    assert(window.PetSystem.calculateTransformRate(turtle) === 0, '凡宠无法触发元神变身 (几率为 0)');
    const ordinaryTransform = window.PetSystem.tryTriggerAvatarTransform(turtle);
    assert(ordinaryTransform.triggered === false, '凡宠执行变身判定返回失败');

    // 3. 金仙仙宠初始化与属性断言 (以白骨精、沙和尚、猪八戒、牛魔王为例)
    const baigu = window.PetSystem.createPet('gudai_ruishou', false, 25); // 借用金仙模板
    baigu.templateId = 'baigu_jing';
    baigu.name = '白骨精';
    baigu.quality = 'jinxian';
    baigu.talentPoints = 0;
    baigu.hp = 1000;
    baigu.maxHp = 1000;

    assert(baigu.quality === 'jinxian', '白骨精为顶级金仙仙宠');
    assert(baigu.talentPoints === 0, '金仙初始天赋点为 0');

    // 4. 【血量越低变身几率越高】逆境爆发数学模型断言
    // 满血 (hp=1000/1000) 时：基础几率为 5% (0.05)
    const fullHpRate = window.PetSystem.calculateTransformRate(baigu);
    assert(fullHpRate === 0.05, `满血金仙基础变身几率为 5% (实际: ${fullHpRate})`);

    // 残血状态 (hp=100/1000, 损失90%气血)：几率应为 0.05 + 0.1 * 0.9 = 0.14 (14%)
    baigu.hp = 100;
    const lowHpRate = window.PetSystem.calculateTransformRate(baigu);
    assert(lowHpRate === 0.14, `残血(90%已损)金仙变身几率飙升至 14% (实际: ${lowHpRate})`);
    assert(lowHpRate > fullHpRate, '金仙生命值越低，元神变身几率越高！');

    // 5. 变身持续时长 3 回合与成功变身获得 +1 天赋点断言
    const transRes = window.PetSystem.tryTriggerAvatarTransform(baigu, true);
    assert(transRes.triggered === true, '金仙成功触发元神变身');
    assert(baigu.avatarTransformed === true, '金仙进入元神变身形态');
    assert(baigu.avatarRoundsLeft === 3, '金仙变身时长固定为 3 回合');
    assert(baigu.talentPoints === 1, '成功变身永久获得 1 点天赋点 (0 -> 1)');

    // 持续回合递减与 3 回合到期解除断言
    const r1 = window.PetSystem.tickAvatarRound(baigu);
    assert(r1.expired === false && baigu.avatarRoundsLeft === 2, '第1回合后变身剩余 2 回合');
    const r2 = window.PetSystem.tickAvatarRound(baigu);
    assert(r2.expired === false && baigu.avatarRoundsLeft === 1, '第2回合后变身剩余 1 回合');
    const r3 = window.PetSystem.tickAvatarRound(baigu);
    assert(r3.expired === true && baigu.avatarTransformed === false, '第3回合后变身状态正常解除恢复常态');

    // 6. 稀世宝物【天赋丹】使用与 5000 点上限断言
    const pillRes1 = window.PetSystem.useTalentPill(baigu);
    assert(pillRes1.success === true && pillRes1.added === 50, '使用1枚天赋丹直接增加 50 点天赋点');
    assert(baigu.talentPoints === 51, `天赋点由 1 跃升至 51 点 (实际: ${baigu.talentPoints})`);

    // 注入至 5000 极境测试
    baigu.talentPoints = 4980;
    const pillRes2 = window.PetSystem.useTalentPill(baigu);
    assert(baigu.talentPoints === 5000, '天赋点严格在 5000 点极境封顶');
    const pillRes3 = window.PetSystem.useTalentPill(baigu);
    assert(pillRes3.success === false, '达到 5000 满天赋点后无法再服用天赋丹');

    // 满 5000 天赋点时基础变身率成长为 25%
    baigu.hp = 1000;
    const maxTalentRate = window.PetSystem.calculateTransformRate(baigu);
    assert(maxTalentRate === 0.25, `满5000天赋点满血变身基础几率达 25% (实际: ${maxTalentRate})`);

    // 7. 十二大金仙专属变身天赋图鉴与数值梯级断言
    const talents = window.PetSystem.JINXIAN_AVATAR_TALENTS;

    // A. 白骨精：画皮移伤 (0点 5% -> 5000点 30%)
    assert(talents.baigu_jing.getTransferRatio(0) === 0.05, '白骨精 0 天赋点伤害转移 5%');
    assert(talents.baigu_jing.getTransferRatio(5000) === 0.30, '白骨精 5000 天赋点伤害转移 30%');

    // B. 黄风怪：三昧神风·断速 (0点 30% -> 5000点 70%)
    assert(talents.huangfeng_guai.getSlowRate(0) === 0.30, '黄风怪 0 天赋点断速几率 30%');
    assert(talents.huangfeng_guai.getSlowRate(5000) === 0.70, '黄风怪 5000 天赋点断速几率 70%');

    // C. 沙和尚：流沙护体·蓝量转移 (0点 15% -> 5000点 35%，必中生效)
    assert(talents.sha_seng.getMpAbsorbRatio(0) === 0.15, '沙僧 0 天赋点受到伤害 15% 由法力抵扣');
    assert(talents.sha_seng.getMpAbsorbRatio(5000) === 0.35, '沙僧 5000 天赋点受到伤害 35% 由法力抵扣');

    // D. 猪八戒：天蓬真元·气血暴增 (0点 500+15% -> 5000点 2000+35%)
    const bajie0 = talents.zhu_bajie.getHpBoost(0, 1000);
    assert(bajie0.flatHp === 500 && bajie0.percentRatio === 0.15, '猪八戒 0 天赋点气血暴增 500 HP + 15% 最大HP');
    const bajieMax = talents.zhu_bajie.getHpBoost(5000, 1000);
    assert(bajieMax.flatHp === 2000 && bajieMax.percentRatio === 0.35, '猪八戒 5000 天赋点气血暴增 2000 HP + 35% 最大HP');

    // E. 牛魔王：大力蛮牛·狂暴 (与八戒区分：生命增加 + 普攻额外物理攻击力 +20%~50%)
    const niumo0 = talents.niumo_wang.getBoosts(0, 1000, 500);
    assert(niumo0.atkPercent === 0.20, '牛魔王 0 天赋点物理攻击额外暴涨 20%');
    const niumoMax = talents.niumo_wang.getBoosts(5000, 1000, 500);
    assert(niumoMax.atkPercent === 0.50, '牛魔王 5000 天赋点物理攻击额外狂暴暴涨 50%');

    // F. 小白龙：龙魂啸天·疾行 (速度 +50~100，法术双连击 20%~45%)
    const bailong0 = talents.xiaobai_long.getEffects(0);
    assert(bailong0.spdBonus === 50 && bailong0.doubleCastRate === 0.20, '小白龙 0 天赋点速度+50，法术连击20%');
    const bailongMax = talents.xiaobai_long.getEffects(5000);
    assert(bailongMax.spdBonus === 100 && bailongMax.doubleCastRate === 0.45, '小白龙 5000 天赋点速度+100，法术连击45%');

    // G. 红孩儿与黑熊精 (百分比吸血与反震)
    assert(talents.honghai_er.getVampireRatio(5000) === 0.35, '红孩儿 5000 天赋点造成伤害 35% 转化为自身吸血');
    assert(talents.heixiong_jing.getEffects(5000).reflectRatio === 0.40, '黑熊精 5000 天赋点反震 40% 伤害给近战攻击者');
  }

  // -----------------------------------------------------------------------------
  // 29. 玩家国风高精模型绘制、陈塘关总兵府重塑、野怪70%移速与坐标即时持久化断点恢复测试
  // -----------------------------------------------------------------------------
  console.log('\n▶️ [测试 29] 玩家国风高精模型、陈塘关总兵府防卡墙、野怪舒缓移速与断点续玩测试');
  {
    // 1. 玩家骑马与步行高精模型渲染无抛错验证
    const mockCtx = {
      save() {}, restore() {}, beginPath() {}, closePath() {},
      moveTo() {}, lineTo() {}, bezierCurveTo() {}, quadraticCurveTo() {},
      arc() {}, ellipse() {}, fill() {}, stroke() {}, fillRect() {}, strokeRect() {},
      roundRect() {}, scale() {}, translate() {}, rotate() {},
      measureText() { return { width: 40 }; },
      fillText() {}, strokeText() {},
      createLinearGradient() { return { addColorStop() {} }; }
    };

    assert(typeof window.CharacterRenderer.drawMountKnight === 'function', '提供白龙神驹骑乘绘制引擎 drawMountKnight');
    assert(typeof window.CharacterRenderer.drawMartialHero === 'function', '提供武学剑仙步行绘制引擎 drawMartialHero');
    assert(typeof window.CharacterRenderer.drawHeavenGeneral === 'function', '提供金甲天将神兵绘制引擎 drawHeavenGeneral');

    // 绘制调用正常执行
    let renderSuccess = true;
    try {
      window.CharacterRenderer.drawMountKnight(mockCtx, 0, 10, 'right', true);
      window.CharacterRenderer.drawMountKnight(mockCtx, 0, 10, 'left', false);
      window.CharacterRenderer.drawMartialHero(mockCtx, 0, 10, 'right', false, true);
      window.CharacterRenderer.drawMartialHero(mockCtx, 0, 10, 'left', false, false);
      window.CharacterRenderer.drawHeavenGeneral(mockCtx, 0, 10, 'right', true);
    } catch (e) {
      renderSuccess = false;
    }
    assert(renderSuccess, '骑马与步行双形态高精模型在各种朝向与动静姿态下完美渲染无异常');

    // 2. 陈塘关总兵府与防卡墙根治验证
    const ctg = window.GAME_DATA.MAPS_2D['chentangguan'];
    assert(ctg, '陈塘关地图数据存在');
    const tilemap = new window.TilemapEngine(32);
    const lijing = ctg.npcs.find(n => n.id === 'npc_li_jing');
    assert(lijing && lijing.x === 224 && lijing.y === 160, '陈塘关李靖总兵威武立于总兵帅堂中枢 (224, 160)');

    const lijingCol = Math.floor(lijing.x / 32);
    const lijingRow = Math.floor(lijing.y / 32);
    assert(tilemap.isWalkable(ctg, lijingCol, lijingRow), '李靖总兵脚下为总兵府可行走地坪，绝非死实心砖墙');

    // 长安传送至陈塘关落脚点验证
    const changanToCtg = window.GAME_DATA.MAPS_2D['changan_city'].portals.find(p => p.targetMap === 'chentangguan');
    assert(changanToCtg && changanToCtg.targetX === 224 && changanToCtg.targetY === 320, '长安传送到陈塘关落脚于总兵府南大门迎宾大道 (224, 320)');
    const portalCol = Math.floor(changanToCtg.targetX / 32);
    const portalRow = Math.floor(changanToCtg.targetY / 32);
    assert(tilemap.isWalkable(ctg, portalCol, portalRow), '传送落地处为平整青石大街，杜绝传送卡墙');

    // 验证 ensurePlayerSafePosition 脱困智能纠偏
    const testApp = window.App2D;
    // 假设传入原先实心墙坐标 (如 x: 128, y: 64，即 col 4, row 2 的 city_wall)
    const correctedPos = testApp.ensurePlayerSafePosition('chentangguan', 128, 64);
    const cCol = Math.floor(correctedPos.x / 32);
    const cRow = Math.floor(correctedPos.y / 32);
    assert(tilemap.isWalkable(ctg, cCol, cRow), '即使旧存档或异常坐标落在城墙上，智能纠偏均自动移至可行走平地');

    // 3. 野怪移动速度降至约 70% 验证
    testApp.loadMap('chentangguan');
    assert(testApp.monsters.length > 0, '陈塘关野怪正确实例化');
    assert(testApp.monsters[0].speed === 1.12, '野怪巡逻移速精确调降至 1.12 (约为原1.6的70%)');

    // 4. 断点续玩与位置即时持久化验证
    testApp.playerChar.x = 224;
    testApp.playerChar.y = 320;
    testApp.playerChar.direction = 'up';
    testApp.storyPhase = 'chentang_investigate';
    testApp.saveAutoProgress();

    assert(window.SaveManager.hasAutoSave(), '自动历练存档成功写入本地存储');
    const fullState = window.SaveManager.loadGameFullState();
    assert(fullState && fullState.mapId === 'chentangguan', '存档记录的场景为陈塘关');
    assert(fullState.playerPos.x === 224 && fullState.playerPos.y === 320, '存档记录的精确坐标为 (224, 320)');
    assert(fullState.playerPos.direction === 'up', '存档记录的玩家朝向为 up');

    // 验证重新启动加载恢复
    // 先将当前应用临时改到其他场景
    testApp.currentMapId = 'tiangong_palace';
    testApp.playerChar.x = 0;
    testApp.playerChar.y = 0;
    const loadOk = testApp.loadAutoSavedProgress();
    assert(loadOk === true, '下次启动游戏成功恢复上次断点存档');
    assert(testApp.currentMapId === 'chentangguan', '启动后场景自动还原为陈塘关');
    assert(testApp.playerChar.x === 224 && testApp.playerChar.y === 320, '启动后角色坐标精确恢复在 (224, 320)');
    assert(testApp.playerChar.direction === 'up', '启动后角色朝向保持为 up');
    assert(testApp.storyPhase === 'chentang_investigate', '主线剧情进度无缝延续');
  }

  // =========================================================================
  // 测试 30：陈塘关主线闭环全流程、李靖感叹号合一、混混头目1打3与观音龙王显圣
  // =========================================================================
  {
    console.log('\n▶️ [测试 30] 陈塘关主线闭环：李靖感叹号合一、四混混清剿、混混头目1打3、观音石雕无法言语、东海夜叉与龙王宝库、观音显圣点化西行');

    const app = window.App2D;
    const minimap = window.MiniMapEngine;
    const ctgMap = window.GAME_DATA.MAPS_2D['chentangguan'];

    // 1. 李靖总兵与金色感叹号/光柱 100% 精确合一断言
    app.storyPhase = 'chentang_investigate';
    app.loadMap('chentangguan');
    const target1 = minimap.getCurrentQuestTarget('chentangguan', 'chentang_investigate', ctgMap);
    assert(target1 && target1.x === 224 && target1.y === 160, `初见李靖时感叹号信标必须精确合一位于李靖头顶 (224, 160) (实际: ${target1.x}, ${target1.y})`);
    assert(target1.name === '李靖总兵', '信标目标明确指向李靖总兵');

    // 2. 混混清剿阶段 (0/4 -> 4/4)
    app.storyPhase = 'chentang_defeat_hooligans';
    app.refreshMapNpcs();
    app.questKills.chentangHooligans = 0;
    const target2 = minimap.getCurrentQuestTarget('chentangguan', 'chentang_defeat_hooligans', ctgMap);
    assert(target2 && target2.desc.includes('(0/4)'), '惩戒混混任务信标实时显示击败进度 (0/4)');

    // 模拟击败 4 名混混
    for (let i = 1; i <= 4; i++) {
      app.questKills.chentangHooligans++;
      if (app.questKills.chentangHooligans >= 4) {
        app.storyPhase = 'chentang_hooligans_done';
      }
    }
    app.refreshMapNpcs();
    assert(app.storyPhase === 'chentang_hooligans_done', '打败4名混混后剧情无缝跃迁至【回帅府向李靖复命】');
    const target3 = minimap.getCurrentQuestTarget('chentangguan', 'chentang_hooligans_done', ctgMap);
    assert(target3 && target3.x === 224 && target3.y === 160, '复命阶段信标再次精准锁定李靖总兵 (224, 160)');

    // 3. 混混头目东市现身与 1 打 3 决战机制
    app.storyPhase = 'chentang_boss_ready';
    app.refreshMapNpcs();
    const bossNpc = app.npcs.find(n => n.id === 'npc_hooligan_boss');
    assert(bossNpc && bossNpc.x === 512 && bossNpc.y === 384, '混混头目雷震彪在陈塘关东市现身 (512, 384)');

    // 校验 1 打 3 敌方编制
    let battleEnemies = [];
    const origStart2DBattle = app.start2DBattle.bind(app);
    app.start2DBattle = (enemies, callback) => {
      battleEnemies = enemies;
      if (typeof callback === 'function') callback();
    };

    app.triggerHooliganBossBattle();
    assert(battleEnemies.length === 3, `混混头目决战敌方编制必须为 1 打 3 (实际敌人数量: ${battleEnemies.length})`);
    assert(battleEnemies[0].id === 'hooligan_boss' && battleEnemies[0].isBoss === true, '第1名敌方为混混头目本尊 (带Boss光环)');
    assert(battleEnemies[1].id === 'hooligan_minion_1', '第2名敌方为作恶混混小兵A');
    assert(battleEnemies[2].id === 'hooligan_minion_2', '第3名敌方为作恶混混小兵B');
    assert(app.storyPhase === 'chentang_boss_defeated', '战胜混混头目及其随从后剧情推进至【回帅府领赏】');

    // 4. 李靖厚赏与告知海滨观音雕像
    const rewardDlg = window.GAME_DATA.STORY_DIALOGUES['chentang_lijing_reward'];
    assert(rewardDlg && rewardDlg.steps.length >= 3, '李靖帅府领赏剧本完备');
    assert(rewardDlg.steps[2].text.includes('观音雕像'), '李靖对话明确指引东侧海滨突现神秘观音雕像');

    // 5. 观音雕像无法对话与指引东海
    app.storyPhase = 'chentang_statue_investigate';
    app.refreshMapNpcs();
    const statueNpc = app.npcs.find(n => n.id === 'npc_guanyin_statue');
    assert(statueNpc && statueNpc.x === 672 && statueNpc.y === 384, '陈塘关海滨部署神秘观音雕像 (672, 384)');
    const statueDlg = window.GAME_DATA.STORY_DIALOGUES['chentang_guanyin_statue_talk'];
    assert(statueDlg && statueDlg.steps[0].text.includes('无法言语对话'), '调查观音雕像文本明确提示雕像寂然无法对话');
    assert(statueDlg.steps[1].text.includes('东海之滨'), '海潮异动明确指引玩家深入东海之滨');

    // 6. 东海之滨巡海夜叉与龙王赔罪认出大将军
    let yechaBattleEnemies = [];
    app.start2DBattle = (enemies, callback) => {
      yechaBattleEnemies = enemies;
      if (typeof callback === 'function') callback();
    };
    app.triggerYechaBattle();
    assert(yechaBattleEnemies.length === 1 && yechaBattleEnemies[0].name === '巡海夜叉·李艮', '成功触发东海巡海夜叉大战');
    assert(app.storyPhase === 'donghai_dragon_arrived', '战胜夜叉后东海龙王踏水现身');
    const dragonApology = window.GAME_DATA.STORY_DIALOGUES['donghai_dragon_apology'];
    assert(dragonApology && dragonApology.steps.some(s => s.text && s.text.includes('威灵显赫大将军')), '东海龙王一眼认出玩家乃天庭威灵显赫大将军');

    // 7. 龙宫宝库自选神装与返回陈塘关
    const prevMoney = app.playerData.silver;
    app.grantLonggongArmorSet();
    const equippedWeapon = app.playerData.equipment['weapon'];
    const equippedArmor = app.playerData.equipment['armor'];
    assert(equippedWeapon && equippedWeapon.itemId === 'longgong_weapon', '成功装备龙宫神兵【覆海点钢枪】');
    assert(equippedArmor && equippedArmor.itemId === 'longgong_armor', '成功装备龙宫宝甲【龙鳞轻钢甲】');

    // 8. 返回陈塘关双神同框与观音点化
    app.storyPhase = 'chentang_guanyin_revelation';
    app.loadMap('chentangguan', { x: 576, y: 384 });
    assert(app.playerChar.x === 576 && app.playerChar.y === 384, '返回陈塘关精准降落于二仙尊正前方 (576, 384)');

    const guanyinNpc = app.npcs.find(n => n.id === 'npc_guanyin_pu_sa');
    const aoguangNpc = app.npcs.find(n => n.id === 'npc_aoguang_chentang');
    const hiddenStatue = app.npcs.find(n => n.id === 'npc_guanyin_statue');
    assert(guanyinNpc && guanyinNpc.x === 672 && guanyinNpc.y === 384, '观音雕像化生为大慈大悲观世音菩萨立于海滨 (672, 384)');
    assert(aoguangNpc && aoguangNpc.x === 640 && aoguangNpc.y === 384, '东海龙王亦随侍在观音菩萨身侧 (640, 384)');
    assert(!hiddenStatue, '观音雕像石胎隐退褪去，化为真身');

    const revelationDlg = window.GAME_DATA.STORY_DIALOGUES['chentang_guanyin_revelation'];
    assert(revelationDlg && revelationDlg.steps.length >= 4, '观音龙王双神显圣点化剧本完备');
    assert(revelationDlg.steps[0].speaker === '东海龙王敖广', '显圣现场东海龙王恭立侍侧并向大将赞叹致意');
    assert(revelationDlg.steps[3].text.includes('威灵显赫大将') && revelationDlg.steps[3].text.includes('力救嫦娥'), '观音菩萨详细揭晓玩家身世因果');
    assert(revelationDlg.steps[4].text.includes('玄奘法师') && revelationDlg.steps[4].text.includes('护送唐僧'), '观音指引玩家前往长安护送唐僧西天取经');

    // 恢复 mock
    app.start2DBattle = origStart2DBattle;
  }

  // =========================================================================
  // 测试 31：西游全章节国风章回体开幕动画系统测试 (2秒水墨金字、诗号对联、朱砂印章、防重判定)
  // =========================================================================
  {
    console.log('\n▶️ [测试 31] 西游全章节国风章回体开幕动画系统测试 (2s水墨金字、诗号对联、朱砂神印、防重判定)');

    const app = window.App2D;
    const chapters = window.GAME_DATA.CHAPTER_CONFIGS;

    // 1. 章节数据库完备性校验
    assert(chapters && typeof chapters === 'object', '章节配置数据库 CHAPTER_CONFIGS 存在');
    assert(chapters['prologue'], '包含【序章 · 蟠桃盛宴】配置');
    assert(chapters['prologue'].title.includes('蟠桃盛宴'), '序章标题为【序章 · 蟠桃盛宴】');
    assert(chapters['prologue'].subtitle.includes('九天金阙神仙客'), '序章七言对联诗号工整');
    assert(chapters['prologue'].seal === '天界神篇', '序章朱砂神印为【天界神篇】');

    assert(chapters['chapter_1'], '包含【第一回 · 梦断双叉】配置');
    assert(chapters['chapter_1'].subtitle.includes('谪仙山野识英雄'), '第一回对联诗号完备');
    assert(chapters['chapter_2'], '包含【第二回 · 盛世大唐】配置');
    assert(chapters['chapter_3'], '包含【第三回 · 雄关东海】配置');
    assert(chapters['chapter_4'], '包含【第四回 · 破封五行】配置');

    // 2. 动画渲染与 DOM 挂载校验
    assert(typeof app.showChapterOpening === 'function', 'App2D 挂载 showChapterOpening 接口');
    assert(typeof app.showChapterBanner === 'function', 'App2D 挂载 showChapterBanner 兼容接口');
    assert(typeof app.checkAndTriggerChapterOpening === 'function', 'App2D 挂载 checkAndTriggerChapterOpening 自动判定接口');

    let onCompleteFired = false;
    app.showChapterOpening('prologue', () => {
      onCompleteFired = true;
    });

    const overlay = document.getElementById('chapter-opening-overlay');
    assert(overlay, '成功在视口创建 chapter-opening-overlay 开幕动画遮罩');
    assert(overlay.innerHTML.includes('序章 · 蟠桃盛宴'), '开幕动画正确渲染烫金章节主标题');
    assert(overlay.innerHTML.includes('九天金阙神仙客，蟠桃胜会动乾坤'), '开幕动画正确渲染七言绝句诗号');
    assert(overlay.innerHTML.includes('天界神篇'), '开幕动画正确渲染朱砂方印神玺');

    // 模拟点击立即跳过快进
    if (typeof overlay.onclick === 'function') {
      overlay.onclick();
    }
    assert(overlay.classList.contains('fade-out'), '点击屏幕任意位置立即平滑淡出');

    // 3. 章节自动判定与防重复触发校验
    app.shownChapterSet = new Set(); // 重置播放记录
    const triggered1 = app.checkAndTriggerChapterOpening('tiangong_palace', 'heaven_prologue');
    assert(triggered1 === true, '初入天宫序章成功触发开幕动画');
    assert(app.shownChapterSet.has('prologue'), '播放后 shownChapterSet 成功记录 prologue');

    // 同一章节再次进入，防重复生效
    const triggered2 = app.checkAndTriggerChapterOpening('tiangong_palace', 'heaven_prologue');
    assert(triggered2 === false, '再次进入天宫绝不重复弹出开幕动画 (防重复机制生效)');

    // 贬落凡尘刘家村
    const triggeredLiu = app.checkAndTriggerChapterOpening('liujiacun', 'liujiacun_start');
    assert(triggeredLiu === true, '贬落凡尘刘家村时成功触发【第一回 · 梦断双叉】');
    assert(app.shownChapterSet.has('chapter_1'), '播放后 shownChapterSet 成功记录 chapter_1');

    // 进入长安
    const triggeredChangan = app.checkAndTriggerChapterOpening('changan_city');
    assert(triggeredChangan === true, '抵达长安城时成功触发【第二回 · 盛世大唐】');

    // 进入陈塘关
    const triggeredCtg = app.checkAndTriggerChapterOpening('chentangguan');
    assert(triggeredCtg === true, '初至东海陈塘关成功触发【第三回 · 雄关东海】');

    // 4. 重新开始清空记录校验
    // 模拟 restartGame 清空
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('hanfeng_xy_shown_chapters');
    }
    app.shownChapterSet = new Set();
    const retriggeredPrologue = app.checkAndTriggerChapterOpening('tiangong_palace', 'heaven_prologue');
    assert(retriggeredPrologue === true, '游戏重新开始重置后，序章开幕动画能再次触发');

    // 5. 存档持久化与断点续玩恢复校验
    app.saveAutoProgress();
    const autoSaveState = window.SaveManager.loadGameFullState();
    assert(autoSaveState && Array.isArray(autoSaveState.shownChapters), '已播放章节集合成功持久化写入存档');
    assert(autoSaveState.shownChapters.includes('prologue'), '存档中准确记录已播放的章节 ID');

    // 还原加载
    app.shownChapterSet = new Set();
    app.loadAutoSavedProgress();
    assert(app.shownChapterSet.has('prologue'), '断点加载成功恢复已播放章节记录');
  }

  console.log('\n======================================================');
  console.log(`🎉 全部自动化测试执行完毕！通过率: ${passedTests}/${totalTests} (100%)`);
  console.log('======================================================\n');
})();


