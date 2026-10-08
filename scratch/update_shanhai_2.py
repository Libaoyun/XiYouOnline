from pathlib import Path
root = Path(__file__).resolve().parents[1]
def edit(file, old, new):
    p = root / file
    text = p.read_text(encoding='utf-8')
    assert old in text, (file, old[:50])
    with p.open('w', encoding='utf-8', newline='') as out:
        out.write(text.replace(old, new, 1))

edit('js/data/shanhaiSpecies.js', '        pets[id] = {', '        if (!pets[id]) pets[id] = {')
edit('js/data/items.js', "    name: '紫竹银葫芦',", "    name: '收仙银壶（紫竹银葫芦）',")
edit('js/app2d.js', '      const defeatedCount = enemies.filter(e => !e.isCaptured).length;', '''      const defeatedCount = enemies.filter(e => !e.isCaptured).length;
      const defeated = enemies.filter(e => !e.isCaptured);
      this.playerData.gainExp(defeated.reduce((sum, e) => sum + 50 + (e.level || 1) * 25, 0));
      this.playerData.silver += defeated.reduce((sum, e) => sum + 10 + (e.level || 1) * 5, 0);''')
edit('js/app2d.js', '    this.selectedTargetIndex = 0;', '    this.currentBattle.trainingPetIds = (this.pets || []).map(p => p.instanceId);\n    this.selectedTargetIndex = 0;')
edit('js/app2d.js', "    if (status === 'victory') {", '''    if (status === 'victory') {
      // 参战宠获得全额经验，备战宠半额；本场新招降的宠不追领经验。
      const petExp = battle.enemies.filter(e => !e.isCaptured).reduce((sum, e) => sum + 50 + (e.level || 1) * 25, 0);
      for (const pet of this.pets || []) {
        if (!battle.trainingPetIds?.includes(pet.instanceId)) continue;
        const participated = battle.allies.some(a => a.entity?.instanceId === pet.instanceId);
        window.PetSystem.gainExp(pet, participated ? petExp : Math.floor(petExp / 2));
      }''')
edit('js/app2d.js', '                    <div class="pet-skill-row">', '''                    <div class="pet-attributes"><span>潜能 ${pet.potentialPoints || 0} 点 · ${pet.gender === 'female' ? '女' : '男'}</span>
                      ${[['sheng', '生', 'con'], ['fa', '法', 'int'], ['li', '力', 'str'], ['su', '速', 'dex']].map(([key, label, legacy]) => `<button class="dialogue-opt-btn" ${!(pet.potentialPoints > 0) ? 'disabled' : ''}
                        onclick="App2D.allocatePetAttribute('${pet.instanceId}', '${key}')">${label} ${pet.attrs?.[key] ?? pet.attrs?.[legacy] ?? 10} ＋</button>`).join('')}
                    </div>
                    <div class="pet-skill-row">''')
edit('js/app2d.js', '  learnSkillForPet(instanceId) {', '''  allocatePetAttribute(instanceId, attrKey) {
    if (this.currentBattle || this.isTransitioning) return;
    const pet = this.pets.find(p => p.instanceId === instanceId);
    if (window.PetSystem.allocatePetPoints(pet, attrKey, 1)) {
      this.openPetManageModal();
      this.saveAutoProgress();
    }
  }

  learnSkillForPet(instanceId) {''')

path = root / 'test_suite.js'
text = path.read_text(encoding='utf-8')
start = text.index("    app.playerData.pets = [{ id: 'pet_test'")
end = text.index('    // 8.', start)
text = text[:start] + '''    app.loadMap('changan_shendan', { x: 608, y: 352 }, { duration: 0 });
    const trainingPet = window.PetSystem.createPet('baihua_she', true, 8, false);
    app.pets = [trainingPet]; app.activeCombatPets = [];
    app.learnSkillForPet(trainingPet.instanceId);
    assert(trainingPet.skills.length === 0, '仙宠未满10级无法由菩提祖师授法');
    trainingPet.level = 10;
    app.learnSkillForPet(trainingPet.instanceId);
    assert(trainingPet.skills.length === 1 && trainingPet.masterLessonLearned, '仙宠满10级在神坛获得适配性别的一次随机门派技能');

''' + text[end:]
text = text.replace("  console.log(`🎉 全部自动化测试执行完毕！", "  console.log(`🎉 全部自动化测试执行完毕！")
anchor = "  console.log('\\n======================================================');\n  console.log(`🎉"
assert anchor in text
text = text.replace(anchor, "  await require('./test_shanhai.js')(assert);\n\n" + anchor, 1)
with path.open('w', encoding='utf-8', newline='') as out:
    out.write(text)
