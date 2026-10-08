const fs = require('node:fs');
const path = require('node:path');

module.exports = async function (assert) {
  console.log('\n▶️ [视觉身份回归] 物种 ID、改名仙宠、人物与阶段资产');
  const oldPortraits = window.Portraits;
  eval(fs.readFileSync(path.join(__dirname, 'js/engine/portraits.js'), 'utf8'));
  const app = window.App2D, art = window.VisualIdentity, portraits = window.Portraits;
  try {
  for (const [templateId, expected] of Object.entries({
    sha_wujing: 'yecha', sha_seng: 'sha_wujing', honghai_er: 'honghaier',
    tieshan_gongzhu: 'tieshan', niumowang: 'bull_demon', bailong_ma: 'xiaobailong',
    cat_demon: 'cat_demon', duxie: 'scorpion', hongliyu: 'red_carp'
  })) {
    // 战斗的 ally 是包装对象，旧档宠物可能没有 modelId。
    const pet = { templateId, name: '孙悟空', modelId: 'rat' };
    assert(app.getUnitVisualId(pet) === expected && app.getUnitVisualId({ entity: pet, name: pet.name }) === expected,
      `${templateId} 在仙宠与战斗包装中按物种绘制，昵称不替换身份`);
  }
  assert(portraits.normalizeRoleId('sha_wujing') === 'sha_wujing' && app.getUnitVisualId({ templateId: 'sha_wujing' }) === 'yecha',
    '沙悟净对白旧 ID 与巡海夜叉物种旧 ID 按上下文区分');
  const ordinary = Object.values(window.GAME_DATA.PETS).filter(p => p.quality === 'ordinary');
  assert(ordinary.length === 50 && ordinary.every(p => portraits.normalizeRoleId(app.getUnitVisualId({ templateId: p.id })) !== 'heaven_general'),
    '50 种凡兽的图鉴／仙宠入口均不错误回退天将');

  for (const [npcId, model] of Object.entries(art.npcAppearances)) {
    const npc = Object.values(window.GAME_DATA.MAPS_2D).flatMap(m => m.npcs || []).find(n => n.id === npcId);
    assert(npc && npc.appearance === model && portraits.normalizeRoleId(window.Dialogue.inferRoleId(npc.name, npc.title)) === portraits.normalizeRoleId(model),
      `${npcId} 地图与对白识别为同一人物`);
  }
  const monkeyIds = ['mihou','mihou_bing','mihou_jiang','yuanhou','yuanhou_bing','yuanhou_jiang'];
  const models = monkeyIds.map(id => window.CharacterRenderer.getCustomMonsterAsset(id));
  assert(new Set(models).size === 6 && models.every(file => file.endsWith('.svg') && fs.existsSync(path.join(__dirname, file))),
    '六阶猴族全身各用独立透明矢量模型，不把圆框画像当身体');
  assert(new Set(monkeyIds.map(id => portraits.customMonsterImages[id])).size === 6,
    '六阶猴族头像资产不同，原两张将级画作仍保留');

  for (const [name, roleId] of [['送斋饭的村姑','baigu_maiden'],['寻女的老妪','baigu_granny'],['拄杖的老翁','baigu_oldman']]) {
    const npc = new window.Character({id:'npc_baigujing',type:'npc',name,appearance:roleId});
    assert(npc.appearance === roleId && app.getNpcPortraitRoleId(npc) === roleId &&
      portraits.normalizeRoleId(window.Dialogue.inferRoleId(name,'【白虎岭山道】')) === roleId,
      `${name} 保持画皮村民身份，地图、名册、对白不借用神职模型`);
    assert(window.Dialogue.getRoleBadge(roleId).includes('seal-mortal'), `${name} 未识破前不标妖印`);
  }
  const tilemap = new window.TilemapEngine(), grove = window.GAME_DATA.MAPS_2D.wuzhuangguan;
  const trees = [];
  grove.tiles.forEach((row,r)=>row.forEach((tile,c)=>{if(tile==='ginseng_tree')trees.push([c,r]);}));
  assert(trees.length === 4 && new Set(trees.map(([c,r])=>JSON.stringify(tilemap.getGinsengTreeBounds(grove,c,r)))).size === 1,
    '四块人参果树瓦片共享一棵树的锚点，镜头裁切时不拆成四棵');
  assert(trees.every(([c,r])=>!tilemap.isWalkable(grove,c,r)), '救树视觉不改碰撞与通行路径');

  const stories = window.GAME_DATA.STORY_DIALOGUES;
  for (const [key, firstChoice] of [['hermit_talk', 3], ['baigu_lampkeeper_talk', 2]]) {
    const data = stories[key], visited = new Set();
    const visit = index => {
      if (visited.has(index)) return true;
      visited.add(index);
      const step = data.steps[index];
      if (!step || step.action) return false;
      return !!step.options?.length && step.options.every(option => !option.action &&
        (option.nextStep == null || visit(option.nextStep)));
    };
    assert(visit(data.steps[0].options[firstChoice].nextStep), `${key} 新话题各分支有出口且不执行奖励或阶段动作`);
  }

  console.log('\n▶️ [五庄观事件回归] 满包、重试、读档与一次性赠礼');
  const fixture = Object.create(app);
  fixture.playerData = new window.Player({level:30}); fixture.inventory = new window.Inventory();
  fixture.storyPhase='liusha_cleared'; fixture.currentMapId='wuzhuangguan'; fixture.currentBattle=null;
  fixture.isTransitioning=false; fixture._pendingStoryDialogue=null; fixture._activeStoryDialogue=null;
  fixture.interactedNpcSet=new Set(); fixture.updatePlayerHud=()=>{};
  fixture.npcs=[{id:'npc_zhenyuanzi',name:'镇元大仙',appearance:'zhenyuanzi'}];
  let saves=0; fixture.saveAutoProgress=()=>{saves++;return {success:true};};
  assert(fixture.getWuzhuangTreeState()==='fallen' && !fixture.restoreWuzhuangTree(), '交手前宝树倒伏，不能提前救树领赏');
  assert(!fixture.getOrdealAndQuestInfo().isDone && fixture.getOrdealAndQuestInfo().stepName.includes('五庄观'),
    '流沙河结束后任务簿展示五庄观当前目标');
  fixture.grantZhenyuanziGift();
  assert(!fixture.inventory.slots.length && !fixture.playerData.storyRewards.wuzhuang_gift, '未经救树不能直接调用领取接口拿奖励');
  let battleStarts=0, postBattleKey;
  fixture.start2DBattle=(_enemies,onWin)=>{battleStarts++;onWin();};
  fixture.scheduleStoryDialogue=key=>{postBattleKey=key;fixture.saveAutoProgress();};
  fixture.triggerZhenyuanziBattle(); fixture.triggerZhenyuanziBattle();
  assert(battleStarts===1 && postBattleKey==='zhenyuanzi_post_battle' && fixture.playerData.storyEvents.wuzhuang_trial_won,
    '战胜镇元后保存交手事件，再次触发不重打');
  const originalApp=window.App2D;
  try {window.App2D=fixture;stories.zhenyuanzi_post_battle.steps[0].action();} finally {window.App2D=originalApp;}
  assert(fixture.getWuzhuangTreeState()==='restored', '真实救树对白的动作改变场景');
  assert(fixture.getOrdealAndQuestInfo().stepTarget.includes('整理行囊') && !fixture.getOrdealAndQuestInfo().isDone,
    '救树后任务簿明确赠礼待领取，满包不会显示已完成');
  const treeSaveCount=saves; fixture.restoreWuzhuangTree();
  assert(saves===treeSaveCount, '重复救树不重复提交事件');
  fixture.inventory.maxSlots=1;
  const before=JSON.stringify(fixture.playerData);
  fixture.grantZhenyuanziGift();
  assert(fixture.inventory.slots.length===0 && JSON.stringify(fixture.playerData)===before &&
    fixture.storyPhase==='liusha_cleared' && fixture.npcs.length===1,
    '只能装下一种物品时整批失败，经验银两、领取键和章节均不变');
  assert(fixture.getWuzhuangTreeState()==='restored', '满包不把救活的宝树重新画倒');
  fixture.playerData=new window.Player(JSON.parse(JSON.stringify(fixture.playerData)));
  const originalStart=window.Dialogue.start;
  try {
    let opened;window.Dialogue.close();window.Dialogue.start=data=>{opened=data;};
    fixture.triggerNpcDialogue(fixture.npcs[0]);
    assert(opened===stories.zhenyuanzi_gift_ready, '待领奖事件序列化后再次交谈仍提供领取入口');
  } finally {window.Dialogue.start=originalStart;}
  fixture.inventory.maxSlots=4;
  try {window.App2D=fixture;stories.zhenyuanzi_gift_ready.steps[0].options[0].action();} finally {window.App2D=originalApp;}
  assert(fixture.storyPhase==='wuzhuang_cleared' && fixture.playerData.storyRewards.wuzhuang_gift &&
    fixture.inventory.getItemCount('renshen_guo')===2 && fixture.inventory.getItemCount('eq_am_hunyuan')===1,
    '真实重试选项一次发放整份赠礼，到账才进入下一章');
  fixture.minimap=window.MiniMapEngine;
  assert(fixture.minimap.getCurrentQuestTarget('wuzhuangguan','wuzhuang_cleared',grove)===null,
    '五庄观通关后不在旧树坐标保留虚假主线目标');
  const guide = fixture.minimap.getCurrentQuestTarget('wuzhuangguan','liusha_cleared',grove);
  const elder=grove.npcs.find(n=>n.id==='npc_zhenyuanzi');
  assert(guide.npcId===elder.id && guide.x===elder.x && guide.y===elder.y,
    '五庄观引路绑定镇元真实坐标，不能指向树或墙');
  fixture.npcs=[];fixture.currentMapId='liushahe';fixture.camera={x:0,y:0};
  let destination;fixture.guideToMap=mapId=>{destination=mapId;};
  for(const phase of ['liusha_cleared','baihu_first_cleared','baihu_second_cleared']){
    fixture.storyPhase=phase;destination=null;
    try {window.App2D=fixture;fixture.teleportToStoryLead();} finally {window.App2D=originalApp;}
    assert(destination===(phase==='liusha_cleared'?'wuzhuangguan':'baihuling'), `${phase} 跨地图追踪指向实际主线`);
  }
  for(const phase of ['wuzhuang_cleared','baihu_cleared','baoxiang_cleared','pingding_cleared','journey_completed']){
    fixture.storyPhase=phase;const claimed=JSON.stringify(fixture.playerData),items=JSON.stringify(fixture.inventory.slots);
    fixture.grantZhenyuanziGift();if(phase!=='wuzhuang_cleared')fixture.triggerBaigujingBattle();
    assert(fixture.storyPhase===phase && JSON.stringify(fixture.playerData)===claimed && JSON.stringify(fixture.inventory.slots)===items,
      `${phase} 回访旧章不重复领赏或退回白骨岭`);
  }

  fixture.playerChar={x:608,y:384,direction:'down'};fixture.mountSystem={mounts:{},isRiding:false};
  fixture.currentMapId='wuzhuangguan';fixture.updateSaveIndicator=()=>{};
  fixture.loadMap=()=>{};fixture.ensurePlayerSafePosition=undefined;
  const originalSave=window.SaveManager.saveGameFullState,originalLoad=window.SaveManager.loadGameFullState;
  try {
    let snapshot;window.SaveManager.saveGameFullState=state=>{snapshot=JSON.parse(JSON.stringify(state));return {success:true};};
    app.saveAutoProgress.call(fixture);
    assert(snapshot.playerData.storyEvents.wuzhuang_tree_restored, '完整自动存档包含剧情事件');
    fixture.playerData=new window.Player();
    window.SaveManager.loadGameFullState=()=>snapshot;
    assert(fixture.loadAutoSavedProgress() && fixture.getWuzhuangTreeState()==='restored', '完整读档恢复宝树状态');
    window.SaveManager.loadGameFullState=()=>({mapId:'baoxiangguo',storyPhase:'baoxiang_cleared',playerData:{storyRewards:{},storyEvents:{}}});
    assert(fixture.loadAutoSavedProgress() && fixture.playerData.storyRewards.wuzhuang_gift && fixture.getWuzhuangTreeState()==='restored',
      '明确完成五庄观的旧档补齐领取记录与救树状态');
    fixture.playerData=new window.Player();
    window.SaveManager.loadGameFullState=()=>({mapId:'wuzhuangguan',storyPhase:'liusha_cleared',
      pendingStoryDialogue:{key:'zhenyuanzi_post_battle'},playerData:{}});
    assert(fixture.loadAutoSavedProgress() && fixture.playerData.storyEvents.wuzhuang_trial_won &&
      !fixture.playerData.storyRewards.wuzhuang_gift && fixture.getWuzhuangTreeState()==='fallen',
      '旧档战后断点恢复资格，尚未救树领赏不凭空补奖');
  } finally {window.SaveManager.saveGameFullState=originalSave;window.SaveManager.loadGameFullState=originalLoad;}
  } finally { window.Portraits = oldPortraits; }
};
