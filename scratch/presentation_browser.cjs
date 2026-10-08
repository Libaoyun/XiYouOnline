const fs = require('node:fs');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
(async () => {
  const targets = await (await fetch('http://127.0.0.1:'+(process.env.BROWSER_CDP_PORT || 9339)+'/json', {signal:AbortSignal.timeout(8000)})).json();
  socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let sequence = 0; const pending = new Map(); const errors = [];
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) { const handler = pending.get(message.id); pending.delete(message.id); message.error ? handler.reject(message.error) : handler.resolve(message.result); }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args.map(a => a.value || a.description).join(' '));
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  const run = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const capture = async name => fs.writeFileSync(`scratch/presentation-${name}.png`, Buffer.from((await send('Page.captureScreenshot', {format:'png'})).data, 'base64'));
  const key = async (value, code = value) => { await send('Input.dispatchKeyEvent', {type:'keyDown', key:value, code}); await send('Input.dispatchKeyEvent', {type:'keyUp', key:value, code}); };
  const click = async selector => {
    const p=await run(`(() => {const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p});
  };
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {width:1280,height:820,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate', {url:(process.env.GAME_QA_URL || 'http://127.0.0.1:5174/')+'?map=liujiacun'});
  for (let i=0;i<100 && !await run('Boolean(window.App2D?.playerChar && window.ShanhaiSystem)');i++) await sleep(100);
  await run(`(() => {
    const app=App2D; Sound.enabled=false; Dialogue.close(); app.cancelStoryDialogue(); app.shownChapterSet=new Set(Object.keys(GAME_DATA.CHAPTER_CONFIGS));
    document.querySelectorAll('.chapter-opening-overlay,.modal-overlay').forEach(e=>e.remove());
    app.playerData=new Player({name:'界面巡查',level:40,classId:'jingang'});app.storyPhase='changan_arrived';app.companions=[];
    app.shanhai=new ShanhaiSystem();app.inventory=new Inventory([]);
    app.loadMap('liujiacun',null,{duration:0,forceTransition:true});
    app.pets=[PetSystem.createPet('wolf_wild',true,10,false),PetSystem.createPet('shuo_shu',true,3,false)];
    app.activeCombatPets=[app.pets[0]];app.renderSceneRosterModal('wolf_wild','ordinary');
  })()`);
  const report={};
  const geometry = () => run(`(() => {
    const rect=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,scrollW:e.scrollWidth,clientW:e.clientWidth,scrollH:e.scrollHeight,clientH:e.clientHeight};};
    return {viewport:rect('#game-viewport'),roster:rect('.roster-modal-box'),header:rect('.roster-dragon-header'),body:rect('.roster-main-body'),list:rect('.roster-list-panel'),detail:rect('.roster-detail-panel'),picker:rect('.shanhai-pet-picker-box'),target:rect('#battle-target-panel'),confirm:rect('.game-confirm-box'),documentW:document.documentElement.scrollWidth,screenW:innerWidth};
  })()`);
  for (const [name,width,height] of [['desktop',1280,820],['phone',390,844],['small',320,568],['landscape',844,390]]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await sleep(150);
    report[name]=await geometry();await capture(name+'-book');
    await run(`App2D.openShanhaiPetPickerModal('wolf_wild')`);report[name].pickerOpen=await geometry();await capture(name+'-picker');
    await run(`App2D.confirmShanhaiCollection(App2D.pets[0].instanceId)`);await sleep(280);report[name].confirmOpen=await geometry();await capture(name+'-confirm');
    report[name].confirmOnTop=await run(`(() => {const b=document.getElementById('confirm-modal-ok'),r=b.getBoundingClientRect();return !!document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('#global-confirm-modal');})()`);
    await key('Escape');report[name].cancelClosed=await run('!document.getElementById("global-confirm-modal")');
    await key('Escape');report[name].pickerClosed=await run('!document.getElementById("shanhai-pet-picker-modal")');
    report[name].bookRetained=await run('!!document.getElementById("scene-roster-modal")');
    await run(`App2D.closeShanhaiPetPickerModal();App2D.renderSceneRosterModal('wolf_wild','ordinary');`);
  }
  await run(`App2D.toggleSceneRosterModal(false);App2D.openShanhaiPetPickerModal('wolf_wild')`);
  const origin=await run('({x:App2D.playerChar.x,y:App2D.playerChar.y})');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight'});await sleep(450);
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight'});
  report.pickerFreezesMovement=await run(`App2D.playerChar.x===${origin.x} && App2D.playerChar.y===${origin.y}`);
  await key('Tab');report.pickerTabClosed=await run('!document.getElementById("shanhai-pet-picker-modal")');
  await run(`App2D.renderSceneRosterModal('wolf_wild','ordinary');document.querySelector('.roster-list-panel').scrollTop=400;App2D.renderSceneRosterModal('kushu_jing','ordinary');`);
  report.listScrollRetained=await run('document.querySelector(".roster-list-panel").scrollTop>=399');
  await run(`App2D.closeShanhaiPetPickerModal();App2D.toggleSceneRosterModal(false);App2D.storyPhase='liujiacun_rat_hunting';App2D.triggerMonsterBattle(App2D.monsters.find(m=>m.id==='mob_rat_2'));App2D.initiateCombatAction('attack');`);
  await sleep(300);
  for (const [name,width,height] of [['desktop',1280,820],['phone',390,844],['small',320,568],['landscape',844,390]]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await sleep(150);
    report[name].battle=await geometry();await capture(name+'-battle');
    report[name].battleConfirmVisible=await run(`(() => {const e=document.querySelector('.battle-target-confirm-btn'),r=e.getBoundingClientRect(),v=document.getElementById('game-viewport').getBoundingClientRect();return r.top>=v.top && r.bottom<=v.bottom && !!document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.battle-target-confirm-btn');})()`);
  }
  report.previewHasClick=await run('!!document.querySelector(".is-focused-single")?.getAttribute("onclick")');
  await run('App2D.setCombatFocusedTarget(1)');
  report.previewNoAction=await run('App2D.battleTargetMenuOpen && !App2D.currentBattle.actions?.player');
  await click('.is-focused-single');
  report.cardClickNoAction=await run('App2D.battleTargetMenuOpen && !App2D.currentBattle.actions?.player');
  await click('.battle-target-confirm-btn');await sleep(100);
  report.confirmSubmitted=await run('!App2D.battleTargetMenuOpen');
  await run(`App2D.stopBattleCountdown();App2D.stopBattleLoop();App2D.currentBattle=null;document.getElementById('battle-screen-layer').innerHTML='';App2D.combatRoundInFlight=false;`);
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
  for (const [name,call] of [['inventory',"App2D.openInventoryModal('all')"],['profile','App2D.openPlayerProfileModal()'],['pets','App2D.openPetManageModal()'],['quests','App2D.openQuestTrackerModal()']]) {
    await run(`document.querySelectorAll('.modal-overlay,.profile-v3-overlay').forEach(e=>e.remove());${call}`);await sleep(200);await capture('phone-'+name);
  }
  report.errors=errors;report.failures=[];
  for(const name of ['desktop','phone','small','landscape']) {
    const v=report[name];
    for(const check of ['cancelClosed','pickerClosed','bookRetained','confirmOnTop','battleConfirmVisible']) if(!v[check])report.failures.push(name+':'+check);
    if(v.detail.scrollW>v.detail.clientW+1)report.failures.push(name+':detailHorizontalOverflow');
  }
  for(const check of ['pickerFreezesMovement','pickerTabClosed','listScrollRetained','previewNoAction','cardClickNoAction','confirmSubmitted'])if(!report[check])report.failures.push(check);
  if(errors.length)report.failures.push('runtimeErrors');
  fs.writeFileSync('scratch/presentation-browser-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));socket.close();if(report.failures.length)process.exitCode=1;
})().catch(err=>{console.error(err);socket?.close();process.exitCode=1;});
