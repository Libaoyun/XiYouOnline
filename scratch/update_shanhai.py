from pathlib import Path

root = Path(__file__).resolve().parents[1]
def edit(file, old, new):
    path = root / file
    text = path.read_text(encoding='utf-8')
    if old not in text:
        raise RuntimeError(f'Missing anchor: {file}: {old[:60]}')
    path.write_text(text.replace(old, new, 1), encoding='utf-8')

path = root / 'js/core/battle.js'
text = path.read_text(encoding='utf-8')
start = text.index('    // 招降野怪 (面对非Boss)')
end = text.index('    // 普通物理攻击', start)
text = text[:start] + '''    // 招降保留实际物种、五行、性别与变异身份，不使用默认仙宠冒充目标。
    if (action.type === 'capture') {
      let targetEnemy = this.enemies[action.targetIndex];
      if (!targetEnemy || targetEnemy.hp <= 0) targetEnemy = this.getAliveEnemies()[0];
      if (!targetEnemy || targetEnemy.hp <= 0) return;
      const templateId = window.ShanhaiSystem.resolveSpecies(targetEnemy, window.App2D?.currentMapId);
      const template = window.GAME_DATA.PETS[templateId];
      if (!template || !window.ShanhaiSystem.isCollectible({ ...targetEnemy, templateId })) {
        this.log('【招降失败】首领、剧情神佛或尚未定义的物种无法招降。');
        if (cb) await cb({ type: 'capture_fail', text: '此生灵无法招降！' });
        return;
      }
      const q = template.quality;
      const app = window.App2D;
      if (!Array.isArray(app?.pets)) return;
      const itemId = q === 'sanxian' ? 'silver_gourd' : q === 'jinxian' ? 'gold_gourd' : null;
      const itemName = itemId ? window.GAME_DATA.ITEMS[itemId].name : '';
      if (itemId && !app.inventory?.removeItem(itemId, 1)) {
        this.log(`【法宝不足】需携带【${itemName}】才能招降。`);
        if (cb) await cb({ type: 'capture_fail', text: `缺少${itemName}！` });
        return;
      }
      const success = Math.random() < (q === 'jinxian' ? 0.60 : q === 'sanxian' ? 0.70 : 0.80);
      if (!success) {
        this.log(`【招降未成】${targetEnemy.name}挣脱了招引${itemId ? '，消耗一只' + itemName : ''}。`);
        if (cb) await cb({ type: 'capture_fail', text: '挣脱招引！' });
        return;
      }
      const pet = window.PetSystem.createPet(templateId, true, targetEnemy.level ?? 1, !!targetEnemy.isMutated);
      if (targetEnemy.gender) pet.gender = targetEnemy.gender;
      targetEnemy.hp = 0;
      targetEnemy.isCaptured = true;
      app.pets.push(pet);
      app.getShanhai?.().observe(pet);
      this.log(`【招降成功】${pet.name}已随行，山海经增添见闻。`);
      BattleEngine.playSound('playSuccess');
      if (cb) await cb({ type: 'capture_success', targetIndex: targetEnemy.enemyIndex, pet, text: '招降成功！' });
      this.checkBattleEnd();
      return;
    }

''' + text[end:]
path.write_text(text, encoding='utf-8')

path = root / 'js/app2d.js'
text = path.read_text(encoding='utf-8')
start = text.index('  // 仙宠 10 级觉醒授法')
end = text.index('  // 打开【神坛', start)
text = text[:start] + '''  // 祖师授法使用实际随行仙宠库，不再访问 playerData 中不存在的仙宠字段。
  awakenPetSkillAtMaster() {
    if (this.currentMapId !== 'changan_shendan' || this.currentBattle || this.isTransitioning) {
      window.showGameMessage('请在长安旁神坛拜谒菩提祖师。', 'info');
      return;
    }
    const eligible = (this.pets || []).filter(p => ['sanxian', 'jinxian'].includes(p.quality) &&
      p.level >= 10 && !p.masterLessonLearned && !p.skills?.length && !p.classId);
    if (!eligible.length) {
      window.showGameMessage('祖师道：带未受过传法的10级散仙或金仙来，每只免费传法一次。', 'info');
      return;
    }
    this.openPetManageModal();
    window.showGameMessage('请在仙宠面板选择要受法的仙宠；随机门派与技能均遵循其性别。', 'info');
  }

''' + text[end:]
text = text.replace('⚡ 领悟', '✨ 祖师传法（免费一次）').replace('散仙需修行至 Lv.10 开启灵窍', '10级后到神坛免费传法一次').replace(" : '未领悟绝技'", " : '10级后到神坛免费传法一次'")
text = text.replace('65%几率收降', '70%几率收降')
path.write_text(text, encoding='utf-8')

edit('js/core/battle.js', "      if (unit.equipment && unit.equipment.necklace) {", "      const equipment = unit.equipment || unit.entity?.equipment;\n      if (equipment && equipment.necklace) {")
edit('js/core/battle.js', "const itemId = unit.equipment.necklace.itemId || unit.equipment.necklace.id;", "const itemId = equipment.necklace.itemId || equipment.necklace.id;")
edit('js/core/battle.js', '|| unit.equipment.necklace;', '|| equipment.necklace;')
edit('js/core/battle.js', '      return unit.element || null;', '      return null;')
edit('js/core/battle.js', "      e.quality = e.quality || 'ordinary';", "      e.templateId = e.templateId || window.ShanhaiSystem.resolveSpecies(e, window.App2D?.currentMapId);\n      const species = window.GAME_DATA.PETS[e.templateId];\n      e.quality = species?.quality || e.quality || 'ordinary';\n      e.element = species?.element || e.element;\n      e.gender = e.gender || species?.gender || 'male';")

edit('js/engine/character.js', "    const s = `${name || ''}_${id || ''}`.toLowerCase();\n    // 1. 木属性", "    const template = window.GAME_DATA?.PETS?.[id] || Object.values(window.GAME_DATA?.PETS || {}).find(p => p.name === window.GAME_DATA.cleanShanhaiSpeciesName?.(name));\n    if (template?.element) return template.element;\n    const s = `${name || ''}_${id || ''}`.toLowerCase();\n    if (/野猪|wildpig|ye_zhu/.test(s)) return 'earth';\n    // 1. 木属性")
edit('js/engine/character.js', "s.includes('gui') || s.includes('龟') || s.includes('wa') ||", "s.includes('turtle') || s.includes('龟') || s.includes('ju_wa') ||")

# 原测试中无物种身份的虚构灵猿不能冒充白花蛇；保留法宝与招降测试，使用真实物种。
edit('test_suite.js', "  'js/data/storyQuests.js',", "  'js/data/shanhaiSpecies.js',\n  'js/data/storyQuests.js',")
edit('test_suite.js', "  'js/core/petSystem.js',", "  'js/core/petSystem.js',\n  'js/core/shanhai.js',")
edit('test_suite.js', "createPet('gudai_ruishou', false, 5);\n  assert(jinxianPet.growth", "createPet('gudai_ruishou', false, 10);\n  assert(jinxianPet.growth")
edit('test_suite.js', '金仙无视等级直接领悟顶级神技', '金仙满10级免费领悟一次门派神技')
edit('test_suite.js', "    name: '通臂灵猿',", "    name: '白花灵蛇',\n    templateId: 'baihua_she',")
edit('test_suite.js', "p.name === '通臂灵猿'", "p.templateId === 'baihua_she'")
# 图鉴改为见闻解锁，旧成长展示回归先模拟真正遇见。
edit('test_suite.js', "    app.renderSceneRosterModal('shuo_shu', 'ordinary');", "    app.getShanhai().observe({ templateId: 'shuo_shu' });\n    app.renderSceneRosterModal('shuo_shu', 'ordinary');")
