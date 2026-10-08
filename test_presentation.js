/** 主套件内运行：覆盖弹窗生命周期、稳定物种身份与洗炼预览绑定。 */
module.exports = async function (assert) {
  console.log('\n▶️ [测试 57] 展示与操作边界回归');
  const original = window.App2D;
  const app = Object.assign(Object.create(Object.getPrototypeOf(original)), original, {
    pets: [], activeCombatPets: [], currentBattle: null, isTransitioning: false,
    shanhai: new window.ShanhaiSystem(), keysDown: {}, npcs: [], monsters: []
  });
  const wolf = window.PetSystem.createPet('wolf_wild', true, 10, false);
  const rat = window.PetSystem.createPet('shuo_shu', true, 3, false);
  // 仙宠显示名可以改变，不能因此冒充另一种物种。
  rat.name = window.GAME_DATA.PETS.wolf_wild.name;
  app.pets = [wolf, rat];
  app.openShanhaiPetPickerModal('wolf_wild');
  let modal = document.getElementById('shanhai-pet-picker-modal');
  assert((modal.innerHTML.match(/class="shanhai-candidate-card is-match"/g) || []).length === 1, '献录按模板 ID 匹配，同名其他物种不可误选');
  assert(!app.renderShanhaiCollection(window.GAME_DATA.PETS.wolf_wild).includes(`confirmShanhaiCollection('${rat.instanceId}')`), '详情献录入口也拒绝同名不同种');
  assert(app.renderShanhaiCollection(window.GAME_DATA.PETS.wolf_wild).includes('尚未遇见'), '尚未遇见的档案使用准确的状态文案');
  app.shanhai.observe({templateId:'wolf_wild'});
  assert(app.renderShanhaiCollection(window.GAME_DATA.PETS.wolf_wild).includes('见闻待录'), '遇见后的档案显示见闻待录');
  app.closeShanhaiPetPickerModal();
  app.currentBattle = {};
  app.openShanhaiPetPickerModal('wolf_wild');
  assert(!document.getElementById('shanhai-pet-picker-modal'), '战斗中不能打开献录挑选');
  app.currentBattle = null; app.isTransitioning = true;
  app.openShanhaiPetPickerModal('wolf_wild');
  assert(!document.getElementById('shanhai-pet-picker-modal'), '切图时不能打开献录挑选');
  app.isTransitioning = false; app.shanhai.entries.wolf_wild = {time:Date.now()};
  app.openShanhaiPetPickerModal('wolf_wild');
  assert(!document.getElementById('shanhai-pet-picker-modal'), '已收录的物种不再开放挑选消耗入口');
  delete app.shanhai.entries.wolf_wild;
  app.renderSceneRosterModal('wolf_wild','ordinary');
  app.openShanhaiPetPickerModal('wolf_wild');
  app.toggleSceneRosterModal(false);
  assert(!document.getElementById('scene-roster-modal') && !document.getElementById('shanhai-pet-picker-modal'), '关闭山海经同时清理其献录子窗口');

  const preview = window.PetSystem.generateWashResult(wolf);
  app.tempWashResult = preview;
  let rendered = 0; app.openPetWashModal = () => rendered++;
  const before = JSON.stringify(rat);
  app.confirmPetWash(rat.instanceId);
  assert(JSON.stringify(rat) === before, '跨仙宠确认洗炼不改变另一只仙宠');
  assert(app.tempWashResult === preview && rendered === 0, '错误确认保留原预览且不误报洗炼成功');
  app.confirmPetWash(wolf.instanceId);
  assert(wolf.level === 1 && app.tempWashResult === null && rendered === 1, '回到原仙宠后可正确确认并清除洗炼预览');

  let renders = 0;
  app.currentBattle = {allies:[], enemies:[{enemyIndex:0,hp:10},{enemyIndex:1,hp:10}]};
  app.pendingCombatAction = {targetSide:'enemy'};app.targetFocusIndex=0;
  app.renderBattleInterface = () => renders++;
  for (const idx of [0.5,NaN,Infinity,-1,2]) app.setCombatFocusedTarget(idx);
  assert(app.targetFocusIndex === 0 && renders === 0, '非法、越界、非整数的目标索引不抛异常、不改变选择');
  app.setCombatFocusedTarget('1');
  assert(app.targetFocusIndex === 1 && app.selectedTargetIndex === 1 && renders === 1, '正常目标索引仍可聚焦预览');

  app.battleCanvasWidth=400;app.battleTargetMenuOpen=true;app.selectedAllyId='player';
  app.currentBattle.enemies=[{enemyIndex:0,hp:10,_battlePos:{x:80,y:50}},{enemyIndex:1,hp:10,_battlePos:{x:80,y:150}}];
  app.currentBattle.allies=[{id:'player',hp:10,_battlePos:{x:320,y:50}},{id:'pet',hp:10,_battlePos:{x:320,y:150}}];
  let committed=0;app.confirmCombatSkillTarget=()=>committed++;
  app.selectAlly=()=>committed++;
  app.handleBattleCanvasClick(80,150);
  assert(app.targetFocusIndex===1 && committed===0, '目标选择中点敌方模型只预览，不能跳过显式确认');
  app.pendingCombatAction={targetSide:'ally'};app.targetFocusIndex=0;
  app.handleBattleCanvasClick(80,150);
  assert(app.targetFocusIndex===0 && committed===0, '友军技能选择中点敌方模型不改变目标');
  app.handleBattleCanvasClick(320,150);
  assert(app.targetFocusIndex===1 && committed===0 && app.selectedAllyId==='player', '点友军模型只预览受术者，不改动正在下令的角色');

  const getEl=document.getElementById;let rect={width:240,height:150};
  const canvas={width:400,height:300};
  app.battleCanvasWidth=400;app.battleCanvasHeight=300;
  app.currentBattle.enemies[0]._roundBattlePos={x:100,y:200};
  document.getElementById=id=>id==='battle-stage-area'?{getBoundingClientRect:()=>rect}:getEl(id);
  try {
    app.resizeBattleCanvas(canvas);
    assert(canvas.width===240 && canvas.height===150, '战斗画布适配窄屏、矮屏，不再强制 280 像素后挤压变形');
    assert(app.currentBattle.enemies[0]._roundBattlePos.x===60 && app.currentBattle.enemies[0]._roundBattlePos.y===100, '转屏同步缩放回合中缓存的演出坐标');
    app.resizeBattleCanvas(canvas);
    assert(app.currentBattle.enemies[0]._roundBattlePos.x===60, '尺寸未变时不重复缩放演出坐标');
    app.resizeBattleCanvas({width:300,height:150});
    assert(app.currentBattle.enemies[0]._roundBattlePos.x===60, '重建 Canvas 不拿默认尺寸重复缩放已缓存的演出坐标');
    rect={width:0,height:0};app.resizeBattleCanvas(canvas);
    assert(canvas.width===240 && canvas.height===150, '隐藏舞台不把画布缩成零尺寸');
  } finally {document.getElementById=getEl;}
};
