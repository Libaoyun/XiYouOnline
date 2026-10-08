/** 在主测试套件的浏览器模拟环境中运行，覆盖持久化、真实物种、献录与传法边界。 */
module.exports = async function (assert) {
  const data = window.GAME_DATA;
  const Pet = window.PetSystem;
  const Book = window.ShanhaiSystem;
  const app = window.App2D;
  const makeApp = () => ({ pets: [], activeCombatPets: [], inventory: new window.Inventory([]), currentBattle: null, isTransitioning: false });
  console.log('\n▶️ [测试 49] 山海经见闻与单实例献录');
  {
    const book = new Book(); const fixture = makeApp();
    assert(book.observe({ templateId: 'shuo_shu' }), '第一次见到物种留下见闻');
    assert(!book.observe({ templateId: 'shuo_shu', isMutated: true }), '同种变异也只记录一次见闻');
    assert(book.counts().ordinary === 0, '见闻不冒充正式收录');
    const a = Pet.createPet('shuo_shu', true, 3, false);
    const b = Pet.createPet('shuo_shu', true, 10, true);
    fixture.pets = [a, b]; fixture.activeCombatPets = [a, b];
    const survivor = JSON.stringify(b);
    assert(book.collect(fixture, a.instanceId).success, '选择一个实例献录成功');
    assert(fixture.pets.length === 1 && fixture.pets[0] === b, '只消耗选择的一只，保留同种其他实例');
    assert(fixture.activeCombatPets.length === 1 && fixture.activeCombatPets[0] === b, '出战阵列移除同一个献录实例');
    assert(JSON.stringify(b) === survivor, '保留宠的等级、变异、成长、技能等全部未变');
    assert(!book.collect(fixture, b.instanceId).success && fixture.pets.length === 1, '同种再献录拒绝，不再吃掉仙宠');
    assert(book.counts().ordinary === 1, '普通、变异只统计一个物种');
    const restored = new Book(JSON.parse(JSON.stringify(book)));
    assert(restored.entries.shuo_shu && restored.seen.shuo_shu, '收录和见闻可完整序列化恢复');
    assert(!new Book({ entries: { nonexistent: true } }).entries.nonexistent, '旧档中的未知物种不会污染统计');
    const turtle = Pet.createPet('dahai_gui', true, 3, false); fixture.pets.push(turtle);
    fixture.currentBattle = {};
    assert(!book.collect(fixture, turtle.instanceId).success, '战斗中禁止移除仙宠');
    fixture.currentBattle = null; fixture.isTransitioning = true;
    assert(!book.collect(fixture, turtle.instanceId).success, '转场中禁止献录');
    fixture.isTransitioning = false;
    assert(!book.collect(fixture, 'missing').success, '失效实例不会误删其他仙宠');
    assert(!Book.isCollectible({ ...turtle, isStoryCompanion: true }), '剧情同伴不能献录');
    assert(!Book.isCollectible({ templateId: 'qitian_dasheng', name: '孙悟空' }), '独立灵猴模板也不能冒充剧情孙悟空');
  }

  console.log('\n▶️ [测试 50] 收录里程、满包重试与奖励防重复');
  {
    const fixture = makeApp(); const book = new Book();
    const normal = Object.values(data.PETS).filter(p => p.quality === 'ordinary');
    assert(normal.length >= 50, '普通物种足够实现50种里程');
    const reachable = new Set(Object.values(data.SHANHAI_SPECIES_BY_MONSTER));
    Object.values(data.PETS).filter(p => !p.habitatMapId && p.quality === 'ordinary').forEach(p => reachable.add(p.id));
    assert(normal.filter(p => reachable.has(p.id)).length >= 50, '地图与偶遇池实际提供至少50种普通物种');
    for (let i = 0; i < 50; i++) {
      const pet = Pet.createPet(normal[i].id, true, 1, false); fixture.pets.push(pet);
      assert(book.collect(fixture, pet.instanceId).success, `不同普通物种第${i + 1}种可以收录`);
      if (i === 8) assert(!book.claim(fixture, 'ordinary_10').success, '9种无法提前领取10种赠礼');
      if (i === 9) {
        fixture.inventory.maxSlots = 0;
        assert(!book.claim(fixture, 'ordinary_10').success && !book.claimedRewards.ordinary_10, '满包领奖失败不扣领取资格');
        fixture.inventory.maxSlots = 50;
        assert(book.claim(fixture, 'ordinary_10').success, '首次10种获得收仙银壶');
        assert(fixture.inventory.getItemCount('silver_gourd') === 1, '银壶使用既有招降道具ID');
        assert(!book.claim(fixture, 'ordinary_10').success, '连点领奖不会重复获得银壶');
      }
    }
    assert(book.counts().ordinary === 50, '50种按物种准确累计');
    assert(book.claim(fixture, 'ordinary_15').success && fixture.inventory.getItemCount('silver_gourd') === 2, '后续增加5种再给银壶');
    const sx = book.claim(fixture, 'ordinary_30');
    assert(sx.success && sx.pet.quality === 'sanxian' && sx.pet.level === 1, '30种奖励独立1级随机散仙');
    const jx = book.claim(fixture, 'ordinary_50');
    assert(jx.success && jx.pet.quality === 'jinxian' && jx.pet.level === 1, '50种奖励独立1级随机金仙');
    assert(fixture.pets.includes(sx.pet) && fixture.pets.includes(jx.pet), '随机奖励实际加入仙宠库');
    assert(book.seen[sx.pet.templateId] && book.seen[jx.pet.templateId], '奖励仙宠会留下见闻');
    assert(!book.entries[sx.pet.templateId], '收到仙宠奖励不会自动消耗并收录');
    const copy = new Book(JSON.parse(JSON.stringify(book)));
    assert(!copy.claim(fixture, 'ordinary_50').success, '读档后仍然不能重复领取随机金仙');
    const sxList = Object.values(data.PETS).filter(p => p.quality === 'sanxian');
    assert(sxList.length >= 10, '散仙种类足够达成10种里程');
    for (const template of sxList.slice(0, 10)) {
      const pet = Pet.createPet(template.id, true, 1, false); fixture.pets.push(pet); book.collect(fixture, pet.instanceId);
    }
    assert(book.claim(fixture, 'sanxian_3').pet?.quality === 'sanxian', '3种散仙奖励随机散仙');
    assert(book.claim(fixture, 'sanxian_10').pet?.quality === 'jinxian', '10种散仙奖励随机金仙');
    const jxList = Object.values(data.PETS).filter(p => p.quality === 'jinxian' && Book.isCollectible(p));
    for (const template of jxList.slice(0, 6)) {
      const pet = Pet.createPet(template.id, true, 1, false); fixture.pets.push(pet); book.collect(fixture, pet.instanceId);
    }
    assert(book.claim(fixture, 'jinxian_3').pet?.quality === 'jinxian', '3种金仙奖励随机金仙');
    assert(book.claim(fixture, 'jinxian_6').pet?.quality === 'jinxian', '再增加3种金仙继续获得随机金仙');
    assert(!book.claim(fixture, 'jinxian_9').success, '6种金仙不能提前领9种奖励');
  }

  console.log('\n▶️ [测试 51] 招降物种、五行桥接、性别与变异身份');
  {
    const savedApp = window.App2D; const random = Math.random;
    const book = new Book(); const fixture = makeApp(); fixture.getShanhai = () => book;
    window.App2D = fixture;
    try {
      const hero = new window.Player({ level: 20 });
      hero.equipment.necklace = { itemId: 'eq_nk_gold' }; hero.recalculateStats(false);
      const enemy = { id: 'capture_identity', templateId: 'shuo_shu', name: '变异偷粮硕鼠', level: 3,
        isMutated: true, gender: 'female', hp: 300, maxHp: 300, quality: 'ordinary' };
      const battle = new window.BattleEngine(hero, [], [enemy]);
      assert(window.BattleEngine.getEntityElement(battle.allies[0]) === 'gold', '战斗玩家包装能从真实挂链读取五行');
      hero.equipment.necklace = null;
      assert(window.BattleEngine.getEntityElement(battle.allies[0]) === null, '卸下挂链恢复中立，不残留旧五行');
      Math.random = () => 0.1;
      const captured = await battle.captureMonster(0);
      const pet = fixture.pets[0];
      assert(captured.success && pet.templateId === 'shuo_shu', '招降硕鼠保留硕鼠身份，不变成默认海龟');
      assert(pet.element === 'earth' && pet.gender === 'female' && pet.isMutated, '招降保留种族五行、性别和变异');
      assert(enemy.isCaptured && book.seen.shuo_shu, '招降标记与见闻记录同步');
      assert(!book.entries.shuo_shu, '招降本身不自动献录');
      assert(!await battle.captureMonster(0).then(r => r.success), '同一敌人不能重复招降');
      const unregistered = new window.BattleEngine(hero, [], [{ name: '未定义妖怪', hp: 100, maxHp: 100 }]);
      assert(!(await unregistered.captureMonster(0)).success && unregistered.enemies[0].hp === 100, '未定义物种拒绝招降，保持活体');
      const god = new window.BattleEngine(hero, [], [{ templateId: 'qitian_dasheng', name: '孙悟空', hp: 100, maxHp: 100 }]);
      fixture.inventory.addItem('gold_gourd', 1);
      assert(!(await god.captureMonster(0)).success && fixture.inventory.getItemCount('gold_gourd') === 1, '剧情神佛拒绝招降，不消耗金壶');
      assert(window.Character.inferMonsterElement('野猪', 'ye_zhu') === 'earth', '野猪五行以种族定义为准');
      assert(window.Character.inferMonsterElement('多闻天王', 'duowen_tianwang') === 'gold', '天王不会被wa字符串误判为水');
      const id = data.SHANHAI_SPECIES_BY_MONSTER['liujiacun:mob_rat_2'];
      assert(id === 'shuo_shu', '同种野怪的地点与编号后缀不会制造新种类');
    } finally { Math.random = random; window.App2D = savedApp; }
  }

  console.log('\n▶️ [测试 52] 仙宠经验、属性守恒、非法加点与洗炼');
  {
    const pet = Pet.createPet('shuo_shu', true, 1, false);
    assert(Pet.gainExp(pet, 490) && pet.level === 3 && pet.exp === 0, '一次升级逐级重新计算经验门槛');
    const split = Pet.createPet('shuo_shu', true, 1, false);
    Pet.gainExp(split, 150); Pet.gainExp(split, 340);
    assert(split.level === pet.level && split.exp === pet.exp, '批量经验与分次经验产生相同等级');
    const snapshot = JSON.stringify(pet);
    for (const amount of [NaN, Infinity, -1, 0]) assert(!Pet.gainExp(pet, amount) && JSON.stringify(pet) === snapshot, '非法经验不修改仙宠');
    for (const points of [NaN, Infinity, -1, 0, 0.5]) assert(!Pet.allocatePetPoints(pet, 'li', points), '仙宠加点必须为正整数');
    for (const key of ['hp', 'growth', '__proto__', 'constructor']) assert(!Pet.allocatePetPoints(pet, key, 1), '仙宠拒绝四维之外的属性');
    const once = structuredClone(pet); const singles = structuredClone(pet);
    Pet.allocatePetPoints(once, 'li', 2); Pet.allocatePetPoints(singles, 'li', 1); Pet.allocatePetPoints(singles, 'li', 1);
    assert(once.def === singles.def && once.attrs.sta === singles.attrs.sta, '仙宠分次与批量加力得到相同防御');
    const hero = new window.Player({ level: 10 }); hero.potentialPoints = 10;
    const hero2 = new window.Player({ level: 10 }); hero2.potentialPoints = 10;
    hero.allocatePoints('li', 5); for (let i = 0; i < 5; i++) hero2.allocatePoints('li', 1);
    assert(hero.def === hero2.def && hero.attributes.sta === hero2.attributes.sta, '主角分次与批量加力得到相同防御');
    for (const points of [NaN, Infinity, 0.5, -1]) assert(!hero.allocatePoints('su', points), '主角拒绝非法加点');
    pet.hp = 0; pet.mp = 0; Pet.recalculatePet(pet, false);
    assert(pet.hp === 0 && pet.mp === 0, '属性重算不会复活阵亡仙宠');
    const random = Math.random;
    try {
      Math.random = () => 0;
      for (let level = 0; level <= 3; level++) {
        const low = Pet.createPet('shuo_shu', true, level, false);
        assert(['sheng', 'fa', 'li', 'su'].reduce((sum, key) => sum + low.attrs[key] - 10, 0) === level * 8, '低等级随机四维守恒');
      }
      const a = Pet.createPet('shuo_shu', true, 3, false), b = Pet.createPet('shuo_shu', true, 3, false);
      assert(a.instanceId !== b.instanceId, '同毫秒固定随机数也不会生成重复仙宠ID');
    } finally { Math.random = random; }
    const weak = Pet.createPet('shuo_shu', true, 10, false), strong = structuredClone(weak);
    weak.aptitudes.hp = data.PETS.shuo_shu.aptitudes.hp[0]; strong.aptitudes.hp = data.PETS.shuo_shu.aptitudes.hp[1];
    Pet.recalculatePet(weak, false); Pet.recalculatePet(strong, false);
    assert(strong.maxHp > weak.maxHp, '资质实际影响属性，不再只是面板数字');
    const other = Pet.createPet('dahai_gui', true, 10, false);
    const otherBefore = JSON.stringify(other);
    assert(!Pet.applyWashResult(other, Pet.generateWashResult(weak)) && JSON.stringify(other) === otherBefore, '洗炼预览绑定原实例，不能跨仙宠套用');
    const fighter = Pet.createPet('shuo_shu', true, 1, false);
    const reserve = Pet.createPet('baihua_she', true, 1, false);
    const fresh = Pet.createPet('dianmu', true, 1, false);
    const player = new window.Player({ level: 40 });
    const battle = new window.BattleEngine(player, [fighter], [{ name: '经验试炼', level: 2, hp: 0, maxHp: 100 }]);
    battle.trainingPetIds = [fighter.instanceId, reserve.instanceId];
    const fixture = { ...makeApp(), pets: [fighter, reserve, fresh], playerData: player, currentBattle: battle, isAnimatingCombat: false,
      stopBattleLoop() {}, stopBattleCountdown() {}, clearBattlePresentation() {}, updatePlayerHud() {}, saveAutoProgress() {} };
    assert(app.endBattle.call(fixture, 'victory'), '真实战斗结束入口正常完成经验结算');
    assert(fighter.exp === 100 && reserve.exp === 50, '参战获得全额经验，随行备战获得半额经验');
    assert(fresh.exp === 0, '本场新招降或奖励仙宠不追领本场经验');
    assert(!app.endBattle.call(fixture, 'victory') && fighter.exp === 100, '重复战斗结束不会重复发经验');
  }

  console.log('\n▶️ [测试 53] 祖师一次授法、男女技能与旧档兼容');
  {
    for (const quality of ['sanxian', 'jinxian']) {
      const pet = Pet.createPet(quality === 'sanxian' ? 'baihua_she' : 'gudai_ruishou', true, 9, false);
      assert(!Pet.learnSkill(pet).success && !pet.masterLessonLearned, '散仙和金仙均须达到10级');
    }
    const random = Math.random;
    try {
      for (const gender of ['male', 'female']) for (let cls = 0; cls < 3; cls++) {
        const pet = Pet.createPet('baihua_she', true, 10, false); pet.gender = gender;
        let calls = 0; Math.random = () => calls++ === 0 ? (cls + 0.1) / 3 : 0;
        const learned = Pet.learnSkill(pet);
        assert(learned.success && pet.skills.length === 1, `${gender}仙宠随机${cls}职业学技成功`);
        assert(pet.skills[0].genderReq === gender || pet.skills[0].genderReq === 'all', '学到的技能符合性别限制');
        assert(pet.skills[0].mastery === 0 && pet.skills[0].proficiency === 0, '初学熟练度严格为0');
        const learnedSkill = JSON.stringify(pet.skills);
        assert(!Pet.learnSkill(pet).success && JSON.stringify(pet.skills) === learnedSkill, '重复传法不重抽职业与技能');
        const wash = Pet.generateWashResult(pet); Pet.applyWashResult(pet, wash); pet.level = 10;
        assert(pet.masterLessonLearned && JSON.stringify(pet.skills) === learnedSkill && !Pet.learnSkill(pet).success, '洗炼保留学技，不重置免费授法资格');
      }
    } finally { Math.random = random; }
    const legacy = Pet.createPet('baihua_she', true, 10, false); legacy.skills = [{ id: 'sk_pet_tianlei', name: '天雷引' }];
    delete legacy.masterLessonLearned;
    assert(!Pet.learnSkill(legacy).success && legacy.skills[0].id === 'sk_pet_tianlei', '旧档已学技能不覆写，也不能重领一次授法');
    const source = data.PETS.dianmu;
    assert(Pet.createPet(source.id, true, 10, false).gender === 'female', '电母固定女性身份');
    const pet = Pet.createPet('baihua_she', true, 10, false);
    const fixture = { ...app, pets: [pet], currentBattle: null, isTransitioning: false, currentMapId: 'liujiacun',
      playerChar: { x: 608, y: 352 }, npcs: [{ id: 'npc_puti_laozu', x: 608, y: 320 }],
      openPetManageModal() {}, saveAutoProgress() { return { success: true }; } };
    fixture.learnSkillForPet = app.learnSkillForPet;
    fixture.learnSkillForPet(pet.instanceId);
    assert(!pet.skills.length, '其他地图不能远程免费学技');
    fixture.currentMapId = 'changan_shendan'; fixture.playerChar.x = 0;
    fixture.learnSkillForPet(pet.instanceId);
    assert(!pet.skills.length, '未到祖师身边不能隔空受法');
    fixture.playerChar.x = 608; fixture.learnSkillForPet(pet.instanceId);
    assert(pet.masterLessonLearned && pet.skills.length === 1, '到祖师身边能对实际仙宠实例免费受法');
    const originalLoad = window.SaveManager.loadGameFullState;
    const oldPet = Pet.createPet('baihua_she', true, 10, false);
    delete oldPet.gender; delete oldPet.masterLessonLearned;
    oldPet.skills = [{ id: 'sk_pet_tianlei', name: '天雷引', level: 1 }];
    const oldFixture = Object.assign(Object.create(app), { playerData: new window.Player(), playerChar: new window.Character({ type: 'player' }), pets: [],
      inventory: new window.Inventory([]), mountSystem: { mounts: {}, activeMountId: null, isRiding: false },
      loadMap() {}, ensurePlayerSafePosition(_map, x, y) { return { x, y }; } });
    try {
      window.SaveManager.loadGameFullState = () => ({ mapId: 'liujiacun', storyPhase: 'liujiacun_rat_hunting',
        pets: [oldPet], activeCombatPetIds: [oldPet.instanceId] });
      assert(app.loadAutoSavedProgress.call(oldFixture), '无山海经和传法标记的旧档可以读入');
      assert(oldFixture.shanhai.seen.baihua_she && !oldFixture.shanhai.entries.baihua_she, '旧档已有仙宠只补见闻，不擅自消耗并收录');
      assert(oldFixture.pets[0].masterLessonLearned && oldFixture.pets[0].skills[0].id === 'sk_pet_tianlei', '旧档技能保留并迁移一次授法状态');
    } finally { window.SaveManager.loadGameFullState = originalLoad; }
  }

  console.log('\n▶️ [测试 54] 山海经两列属性玉简与先选指令后选目标闭环');
  {
    // 1. 验证硕鼠与猿猴将等野怪数值与成长率边界
    const shuoShu = data.PETS.shuo_shu;
    assert(shuoShu, '包含偷粮硕鼠物种定义');
    assert(shuoShu.initialStats && shuoShu.initialStats.growth.init === '0.76', '硕鼠成长率初始为 0.76');
    assert(shuoShu.initialStats.growth.range === '0.70 ~ 0.85', '硕鼠成长率上下边界为 0.70 ~ 0.85');
    assert(shuoShu.initialStats.hp.init === 55 && shuoShu.initialStats.hp.range === '50 ~ 71', '硕鼠生命值初始55 (50~71)');
    assert(shuoShu.initialStats.mp.init === 45 && shuoShu.initialStats.mp.range === '42 ~ 68', '硕鼠法力值初始45 (42~68)');
    assert(shuoShu.initialStats.atk.init === 22 && shuoShu.initialStats.atk.range === '15 ~ 38', '硕鼠攻击力初始22 (15~38)');
    assert(shuoShu.initialStats.spd.init === 5 && shuoShu.initialStats.spd.range === '2 ~ 13', '硕鼠速度初始5 (2~13)');

    const yuanhouJiang = data.PETS.yuanhou_jiang;
    assert(yuanhouJiang.growthRange[1] === 0.97, '花果山猿猴将为普通野怪之冠，成长率封顶0.97');
    const ordinaryPets = Object.values(data.PETS).filter(p => p.quality === 'ordinary');
    assert(ordinaryPets.every(p => p.growthRange[1] <= 0.97), '所有普通野怪成长率上限均不超过猿猴将(0.97)');

    // 2. 验证标准化初始数值与上下边界对照表工具
    const bounds = data.getPetInitialBounds('shuo_shu');
    assert(Array.isArray(bounds) && bounds.length === 5, '两列表格严格提供5项标准属性');
    assert(bounds.every(b => b.name && b.init !== undefined && b.range !== undefined), '每项属性均包含初始属性与上下边界两列');

    // 3. 验证山海经模态框背景图与两列表格渲染
    app.loadMap('liujiacun', null, { duration: 0 });
    app.getShanhai().observe({ templateId: 'shuo_shu' });
    app.renderSceneRosterModal('shuo_shu', 'ordinary');
    const rosterModal = document.getElementById('scene-roster-modal');
    assert(rosterModal !== null, '图鉴普通野怪标签页正常呼出');
    assert(rosterModal.innerHTML.includes('is-shanhai'), '山海经标签页下模态框应用 is-shanhai 半透卷轴古风蒙层');
    assert(rosterModal.innerHTML.includes('shanhai-stat-table'), '山海经详情卡片内渲染专属国风两列表格');
    assert(rosterModal.innerHTML.includes('初始属性') && rosterModal.innerHTML.includes('上下边界'), '表格清晰包含【初始属性】与【上下边界】两列');
    assert(rosterModal.innerHTML.includes('招降法门 (如何招降)'), '卡片中清晰展示如何招降');

    // 4. 战斗指令选择时序：多敌方时，选指令后必须选择目标，严禁直接自动攻击
    const mockBattle = {
      status: 'waiting',
      allies: [{ id: 'player', name: '威灵大将', hp: 3500, maxHp: 4000, mp: 1200, isPlayer: true }],
      enemies: [
        { enemyIndex: 0, id: 'en_1', name: '偷粮硕鼠·甲', level: 3, hp: 55, maxHp: 55, mp: 45, maxMp: 45 },
        { enemyIndex: 1, id: 'en_2', name: '偷粮硕鼠·乙', level: 3, hp: 60, maxHp: 60, mp: 45, maxMp: 45 }
      ],
      actions: {},
      setAllyAction(id, act) { this.actions[id] = act; },
      executeRound: () => Promise.resolve()
    };
    app.currentBattle = mockBattle;
    app.battleSkillMenuOpen = false;
    app.battleTargetMenuOpen = false;
    app.pendingCombatAction = null;

    // 4.1 发起普通攻击
    app.initiateCombatAction('attack');
    assert(app.battleTargetMenuOpen === true, '敌方存活>=2时发起普攻必须展开目标选择面板，绝不自动出招');
    assert(app.pendingCombatAction && app.pendingCombatAction.type === 'attack', '正确暂存待确认的普通攻击指令');
    assert(app.pendingCombatAction.targetSide === 'enemy', '普攻目标侧为敌方');

    // 4.2 验证目标选择面板卡片内容：只能看到当前/最大生命值与当前/最大法力值，绝无攻击/防御/速度等信息
    let battleContainer = document.getElementById('battle-screen-layer');
    if (!battleContainer) {
      battleContainer = document.createElement('div');
      battleContainer.id = 'battle-screen-layer';
      if (global.domMap) global.domMap['battle-screen-layer'] = battleContainer;
    }
    app.renderBattleInterface();
    const battleHtml = battleContainer.innerHTML;
    assert(battleHtml.includes('id="battle-target-panel"'), '战场目标选择面板真实渲染');
    const cardHtml = battleHtml.split('battle-target-item-card')[1]?.split('</button>')[0] || '';
    assert(cardHtml.includes('气血') && cardHtml.includes('55/55'), '目标卡片展示敌方当前与最大气血');
    assert(cardHtml.includes('法力') && cardHtml.includes('45/45'), '目标卡片展示敌方当前与最大法力');
    assert(!cardHtml.includes('攻击') && !cardHtml.includes('防御') && !cardHtml.includes('速度') && !cardHtml.includes('抗性'), '目标选择卡片严格屏蔽攻击力、防御力、速度、抗性等机密属性');

    // 4.3 确认选定2号目标出招
    app.confirmCombatActionTarget(1);
    assert(app.battleTargetMenuOpen === false, '选定目标后目标面板自动关闭');
    assert(app.currentBattle.actions['player'].targetIndex === 1, '下达的指令正确锁定选择的1号敌人');

    // 4.4 友军增益指令测试：金刚护体只能选友军
    app.currentBattle.allies.push({ id: 'pet_ally_1', name: '守山灵兽', hp: 800, maxHp: 800, mp: 200, maxMp: 200, side: 'ally' });
    app.playerData.skills = [{ id: 'sk_jg_huti', name: '金刚护体', costMp: 10 }];
    app.onSkillButtonClick('sk_jg_huti');
    assert(app.battleTargetMenuOpen === true, '己方存活>=2时释放金刚护体必须展开友军目标选择面板');
    assert(app.pendingCombatAction && app.pendingCombatAction.targetSide === 'ally', '金刚护体目标侧严格限制为友军');
    app.cancelCombatTargetSelection();
    assert(app.battleTargetMenuOpen === false, '取消选择后平滑退出目标面板');

    // 4.5 存活目标仅为 1 时自动选定出招，无需弹出面板
    app.currentBattle.enemies[1].hp = 0; // 只剩1个敌人
    app.initiateCombatAction('attack');
    assert(app.battleTargetMenuOpen === false, '敌方仅剩1人时自动锁定出招，无需弹出面板');
    assert(app.currentBattle.actions['player'].targetIndex === 0, '自动锁定唯一的0号敌人');

    app.currentBattle = null;
  }

  // =========================================================================
  // 测试 55: 山海经全量野怪绿白灰三态、随行仙宠挑选与二次确认献录，以及战斗单目标聚焦切换与确认出招
  // =========================================================================
  console.log('\n▶️ [测试 55] 山海经全量野怪绿白灰三态、献录随行仙宠与战斗单目标切换确认');
  {
    const book = app.getShanhai();
    // 1. 设置三种野怪状态：
    // 绿：已收录
    book.entries['shuo_shu'] = { time: Date.now(), source: 'test' };
    // 白：已遇未收录
    book.seen['wolf_wild'] = true;
    delete book.entries['wolf_wild'];
    // 灰：未遇未收录 (确保枯树精既未见也未收录)
    delete book.seen['kushu_jing'];
    delete book.entries['kushu_jing'];

    // 1.1 渲染图鉴普通野怪卷
    app.renderSceneRosterModal('shuo_shu', 'ordinary');
    const rosterModal = document.getElementById('scene-roster-modal');
    assert(rosterModal !== null, '图鉴普通野怪卷正常呼出');
    const modalHtml = rosterModal.innerHTML;

    // 全量野怪均在图鉴中展现，未见野怪绝不被隐藏
    assert(modalHtml.includes('kushu_jing') || modalHtml.includes('百年枯树精'), '未遇见过的野怪也全量展示在山海经图鉴名册中');

    // 绿白灰三态名称与标签断言
    assert(modalHtml.includes('status-green'), '已收录野怪（硕鼠）呈现绿色名称 (status-green)');
    assert(modalHtml.includes('tag-green') && modalHtml.includes('已收录'), '已收录野怪具有绿色已收录标签');
    assert(modalHtml.includes('status-white'), '已遇未收录野怪（野狼）呈现白色名称 (status-white)');
    assert(modalHtml.includes('tag-white') && modalHtml.includes('已遇见'), '已遇未收录野怪具有白色已遇见标签');
    assert(modalHtml.includes('status-grey'), '未遇未收录野怪呈现灰色名称 (status-grey)');
    assert(modalHtml.includes('tag-grey') && modalHtml.includes('未遇见'), '未遇未收录野怪具有灰色未遇见标签');

    // 已收录项隐藏献录按钮，展示已收录徽章；未收录项展示献录按钮
    assert(modalHtml.includes('shanhai-collected-badge') && modalHtml.includes('已收录至《山海经》'), '已收录野怪详情展示已收录徽章');

    // 1.2 切换查看未收录野怪 (野狼)，验证出现【📥 献录至山海经】按钮
    app.renderSceneRosterModal('wolf_wild', 'ordinary');
    const wolfHtml = rosterModal.innerHTML;
    assert(wolfHtml.includes('shanhai-collect-trigger-btn') && wolfHtml.includes('献录至山海经'), '未收录野怪详情卡片展示【📥 献录至山海经】按钮');

    // 2. 随行仙宠献录弹窗与挑选流程测试
    const wolfPet = Pet.createPet('wolf_wild', true, 5, false);
    const turtlePet = Pet.createPet('dahai_gui', true, 8, false);
    app.pets = [wolfPet, turtlePet];
    app.activeCombatPets = [wolfPet];

    // 打开挑选弹框
    app.openShanhaiPetPickerModal('wolf_wild');
    const pickerOverlay = document.getElementById('shanhai-pet-picker-modal');
    assert(pickerOverlay !== null, '点击献录后弹出挑选随行仙宠模态框');
    const pickerHtml = pickerOverlay.innerHTML;
    assert(pickerHtml.includes('挑选随行仙宠 · 献录【巡山野狼】'), '弹框标头明确展示献录目标物种');
    assert(pickerHtml.includes('is-match') && pickerHtml.includes('选择献录'), '同种随行仙宠高亮为匹配项并提供选择献录按钮');
    assert(pickerHtml.includes('not-match') && pickerHtml.includes('种类不符'), '非同种随行仙宠提示种类不符');

    // 2.1 点击选择献录，弹出二次不可逆确认模态框
    let confirmModalCalled = false;
    let confirmContent = '';
    const origShowConfirm = app.showConfirmModal;
    app.showConfirmModal = function (opts) {
      confirmModalCalled = true;
      confirmContent = opts.content || '';
      opts.onConfirm(); // 模拟玩家点击二次确认
    };

    app.confirmShanhaiCollection(wolfPet.instanceId);
    assert(confirmModalCalled === true, '点击献录后触发二次确认弹窗');
    assert(confirmContent.includes('郑重提醒（不可逆）') && confirmContent.includes('永久离开队伍与背包'), '二次确认弹窗包含不可逆奉纳郑重警示');
    assert(book.entries['wolf_wild'] !== undefined, '二次确认后野狼物种成功收录至山海经');
    assert(!app.pets.some(p => p.instanceId === wolfPet.instanceId), '献录成功后该仙宠永久从随行仙宠中移出');
    assert(app.pets.length === 1 && app.pets[0].instanceId === turtlePet.instanceId, '保留同队伍中的其他仙宠');
    assert(document.getElementById('shanhai-pet-picker-modal') === null, '献录成功后自动关闭仙宠挑选弹窗');

    app.showConfirmModal = origShowConfirm;

    // 3. 战斗单目标聚焦预览、自由切换与确认出招时序闭环
    const combatBattle = {
      status: 'waiting',
      allies: [{ id: 'player', name: '威灵大将', hp: 3500, maxHp: 4000, mp: 1200, isPlayer: true }],
      enemies: [
        { enemyIndex: 0, id: 'foe_1', name: '偷粮硕鼠·甲', level: 3, hp: 55, maxHp: 55, mp: 45, maxMp: 45 },
        { enemyIndex: 1, id: 'foe_2', name: '偷粮硕鼠·乙', level: 4, hp: 80, maxHp: 80, mp: 60, maxMp: 60 }
      ],
      actions: {},
      setAllyAction(id, act) { this.actions[id] = act; },
      executeRound: () => Promise.resolve()
    };
    app.currentBattle = combatBattle;
    app.battleSkillMenuOpen = false;
    app.battleTargetMenuOpen = false;
    app.pendingCombatAction = null;

    // 3.1 发起攻击，展开目标选择面板
    app.initiateCombatAction('attack');
    assert(app.battleTargetMenuOpen === true, '发起普攻后进入目标选择阶段');
    assert(app.targetFocusIndex === 0, '默认聚焦第0号目标');

    let battleContainer = document.getElementById('battle-screen-layer');
    if (!battleContainer) {
      battleContainer = document.createElement('div');
      battleContainer.id = 'battle-screen-layer';
      if (global.domMap) global.domMap['battle-screen-layer'] = battleContainer;
    }
    app.renderBattleInterface();

    let curHtml = battleContainer.innerHTML;
    assert(curHtml.includes('target-picker-pills-row'), '目标面板展示纯名称目标切换标签行');
    assert(curHtml.includes('1. 偷粮硕鼠·甲') && curHtml.includes('2. 偷粮硕鼠·乙'), '标签行提供所有可选目标');
    assert(curHtml.includes('is-focused-single'), '仅渲染单个聚焦目标的状态卡片，绝非一股脑展示所有人血蓝');
    assert(curHtml.includes('55/55'), '聚焦展示0号目标的气血 55/55');
    assert(!curHtml.includes('80/80'), '聚焦0号目标时，绝不展示1号目标的血量 80/80');

    // 3.2 切换聚焦至1号目标
    app.setCombatFocusedTarget(1);
    assert(app.targetFocusIndex === 1, '目标聚焦成功切换至1号敌人');
    assert(combatBattle.actions['player'] === undefined, '切换目标期间仅预览状态，绝不提前执行出招');

    app.renderBattleInterface();
    curHtml = battleContainer.innerHTML;
    assert(curHtml.includes('80/80'), '切换聚焦后，状态卡片实时更新为1号目标的气血 80/80');
    assert(!curHtml.includes('55/55'), '切换后不再展示0号目标的气血');
    assert(curHtml.includes('battle-target-confirm-btn') && curHtml.includes('确认出招'), '提供明确的【确认出招】按钮');

    // 3.3 轮转切换目标 (支持键盘左右箭头/Tab键)
    app.cycleCombatFocusedTarget(-1);
    assert(app.targetFocusIndex === 0, '向前轮转聚焦回到0号目标');

    // 3.4 玩家点击确认出招
    app.confirmCurrentCombatAction();
    assert(app.battleTargetMenuOpen === false, '玩家确认后正式关闭目标面板');
    assert(combatBattle.actions['player'] && combatBattle.actions['player'].targetIndex === 0, '正式锁定并向0号目标下达出招指令');

    app.currentBattle = null;
  }
};

