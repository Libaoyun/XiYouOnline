const fs = require('node:fs');
const path = require('node:path');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
(async () => {
  const targets = await (await fetch('http://localhost:9339/json')).json();
  socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let sequence = 0; const pending = new Map(); const errors = [];
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const handler = pending.get(message.id); pending.delete(message.id);
      message.error ? handler.reject(message.error) : handler.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args.map(a => a.value || a.description).join(' '));
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params }));
  });
  const run = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 820, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://127.0.0.1:5174/?map=liujiacun' });
  for (let i = 0; i < 100 && !await run('Boolean(window.App2D?.playerChar && window.ShanhaiSystem)'); i++) await sleep(100);
  await sleep(300);
  const result = {};
  result.collection = await run(`(() => {
    const app=App2D; Sound.enabled=false; Dialogue.close(); app.cancelStoryDialogue();
    app.shownChapterSet=new Set(Object.keys(GAME_DATA.CHAPTER_CONFIGS));
    document.querySelectorAll('.chapter-opening-overlay,.modal-overlay').forEach(e=>e.remove());
    app.playerData=new Player({name:'山海游侠',level:40,classId:'jingang'});app.storyPhase='changan_arrived';
    app.companions=[]; app.shanhai=new ShanhaiSystem(); app.inventory=new Inventory([]);
    app.loadMap('liujiacun',null,{duration:0,forceTransition:true});
    const a=PetSystem.createPet('shuo_shu',true,3,false),b=PetSystem.createPet('shuo_shu',true,8,true);
    app.pets=[a,b];app.activeCombatPets=[a]; app.renderSceneRosterModal('shuo_shu','ordinary');
    const revealed=document.querySelectorAll('#scene-roster-modal .roster-item-card').length;
    document.querySelector('[onclick*="confirmShanhaiCollection"]').click();
    document.getElementById('confirm-modal-cancel').click(); const cancelPreserved=app.pets.length===2;
    document.querySelector('[onclick*="confirmShanhaiCollection"]').click();
    document.getElementById('confirm-modal-ok').click();
    const saved=SaveManager.loadGameFullState();
    return {revealed,cancelPreserved,pets:app.pets.length,survivor:app.pets[0].instanceId===b.instanceId,
      active:app.activeCombatPets.length,collected:app.shanhai.counts().ordinary,saved:!!saved.shanhai.entries.shuo_shu};
  })()`);
  result.capture = await run(`(async()=>{
    const app=App2D;app.toggleSceneRosterModal(false);app.storyPhase='liujiacun_rat_hunting';
    app._encounterCooldownUntil=0;app.loadMap('liujiacun',null,{duration:0});
    app.playerData.level=40;app.playerData.recalculateStats(true);app.activeCombatPets=[];
    app.triggerMonsterBattle(app.monsters.find(m=>m.id==='mob_rat_2'));app.combatSpeedMultiplier=2;
    const enemies=app.currentBattle.enemies;const ordinaryIdentity=enemies.every(e=>e.templateId==='shuo_shu'&&e.element==='earth');
    const noUnselectedPet=app.currentBattle.allies.length===1;
    app.currentBattle.setAllyAction('player',{type:'capture',targetIndex:0}); const random=Math.random;
    try{Math.random=()=>0.1;await app.executeCombatRound();}finally{Math.random=random;}
    const captured=enemies[0].isCaptured===true; const newPet=app.pets.find(p=>p.level===3&&!p.isMutated);
    for(let i=0;i<15&&app.currentBattle;i++)await app.executeCombatRound();
    return {ordinaryIdentity,noUnselectedPet,captured,closed:!app.currentBattle,petIsRat:newPet?.templateId==='shuo_shu',
      kills:app.questKills.rats,collected:app.shanhai.counts().ordinary};
  })()`);
  result.rewards = await run(`(()=>{
    const app=App2D;Dialogue.close();app.cancelStoryDialogue();app.isTransitioning=false;
    const species=Object.values(GAME_DATA.PETS).filter(p=>p.quality==='ordinary').slice(0,50);
    for(const template of species){if(app.shanhai.entries[template.id])continue;
      const pet=PetSystem.createPet(template.id,true,1,false);app.pets.push(pet);app.shanhai.collect(app,pet.instanceId);}
    app.renderSceneRosterModal('shuo_shu','ordinary');app.inventory.maxSlots=0;
    const button=()=>Array.from(document.querySelectorAll('[onclick*="claimShanhaiReward"]')).find(b=>b.getAttribute('onclick').includes('ordinary_10'));
    button().click();const fullPreserved=!app.shanhai.claimedRewards.ordinary_10;
    app.inventory.maxSlots=50;button().click();
    app.claimShanhaiReward('ordinary_30');app.claimShanhaiReward('ordinary_50');
    app.claimShanhaiReward('ordinary_50');
    return {fullPreserved,silver:app.inventory.getItemCount('silver_gourd'),
      sanxian:app.pets.filter(p=>p.quality==='sanxian').length,jinxian:app.pets.filter(p=>p.quality==='jinxian').length,
      count:app.shanhai.counts().ordinary,saved:SaveManager.loadGameFullState().shanhai.claimedRewards.ordinary_50};
  })()`);
  result.lesson = await run(`(()=>{
    const app=App2D;app.toggleSceneRosterModal(false);app.storyPhase='changan_arrived';
    const pet=PetSystem.createPet('dianmu',true,10,false);pet.potentialPoints=2;app.pets=[pet];app.activeCombatPets=[];
    app.loadMap('changan_shendan',{x:608,y:352},{duration:0});
    app.triggerNpcDialogue(app.npcs.find(n=>n.id==='npc_puti_laozu'));
    while(Dialogue.currentDialogue&&Dialogue.currentStep===0){if(Dialogue.isTyping)Dialogue.next();Dialogue.next();}
    if(Dialogue.isTyping)Dialogue.next();Dialogue.chooseOption(2);
    const petButton=document.querySelector('[onclick*="learnSkillForPet"]');const chooser=!!petButton;
    petButton?.click();
    const learned=pet.skills.length===1&&pet.masterLessonLearned;
    const femaleSkill=pet.skills[0]?.genderReq==='female'||pet.skills[0]?.genderReq==='all';
    const skillId=pet.skills[0]?.id;app.learnSkillForPet(pet.instanceId);
    const once=pet.skills.length===1&&pet.skills[0].id===skillId;
    document.querySelector('[onclick*="allocatePetAttribute"]').click();
    const allocated=pet.potentialPoints===1;
    app.saveAutoProgress();document.querySelectorAll('.modal-overlay').forEach(e=>e.remove());
    app.renderSceneRosterModal(pet.templateId,'sanxian');
    return {chooser,learned,femaleSkill,once,allocated,gender:pet.gender};
  })()`);
  await sleep(200);
  const desktop = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'shanhai-desktop.png'), Buffer.from(desktop.data, 'base64'));
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await run(`if(document.body.classList.contains('modern-mode'))document.getElementById('toggle-mode-btn').click();`);
  await sleep(200);
  result.mobile = await run(`(()=>{
    const app=App2D;const modal=document.getElementById('scene-roster-modal');const box=modal.querySelector('.roster-modal-box');
    const before={x:app.playerChar.x,y:app.playerChar.y};app.keysDown={ArrowRight:true};app.update();
    const viewport=document.getElementById('game-viewport').getBoundingClientRect(),r=box.getBoundingClientRect();
    const detail=modal.querySelector('.roster-detail-panel');
    return {fitsViewport:r.left>=viewport.left&&r.right<=viewport.right&&r.top>=viewport.top&&r.bottom<=viewport.bottom,
      fitsScreen:r.left>=0&&r.right<=390&&r.top>=0&&r.bottom<=844,
      detailOverflow:detail.scrollWidth>detail.clientWidth+2, paused:app.playerChar.x===before.x&&app.playerChar.y===before.y,
      rect:{x:r.x,y:r.y,width:r.width,height:r.height},viewport:{x:viewport.x,y:viewport.y,width:viewport.width,height:viewport.height}};
  })()`);
  const mobile = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'shanhai-mobile.png'), Buffer.from(mobile.data, 'base64'));
  await send('Page.navigate', { url: 'http://127.0.0.1:5174/' }); await sleep(1800);
  result.reload = await run(`(()=>{
    const app=App2D,pet=app.pets[0];return {map:app.currentMapId,collected:app.shanhai.counts().ordinary,
      rewardSaved:app.shanhai.claimedRewards.ordinary_50,learned:pet?.masterLessonLearned,gender:pet?.gender,
      potential:pet?.potentialPoints,skills:pet?.skills.length,active:app.activeCombatPets.length};
  })()`);
  result.errors = errors;
  fs.writeFileSync(path.join(__dirname, 'shanhai-browser.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2)); socket.close();
  if (errors.length || !result.collection.cancelPreserved || !result.collection.survivor || result.collection.active ||
    !result.capture.captured || !result.capture.closed || !result.capture.ordinaryIdentity || !result.capture.noUnselectedPet || result.capture.kills!==1 ||
    result.rewards.silver!==1 || result.rewards.sanxian!==1 || result.rewards.jinxian!==1 || !result.rewards.fullPreserved ||
    !result.lesson.learned || !result.lesson.femaleSkill || !result.lesson.once || !result.lesson.allocated ||
    !result.mobile.fitsScreen || !result.mobile.fitsViewport || result.mobile.detailOverflow || !result.mobile.paused ||
    !result.reload.learned || !result.reload.rewardSaved || result.reload.collected!==50 || result.reload.potential!==1) process.exitCode=1;
})().catch(error => { console.error(error); socket?.close(); process.exitCode=1; });
