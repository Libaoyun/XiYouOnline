const fs = require('node:fs');
const path = require('node:path');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const gameUrl = process.env.GAME_QA_URL || 'http://127.0.0.1:5174/';
const cdpUrl = 'http://localhost:' + (process.env.BROWSER_CDP_PORT || '9339');
let activeSocket;

(async () => {
  const targets = await (await fetch(cdpUrl + '/json')).json();
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  activeSocket = ws;
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let seq = 0; const pending = new Map(); const errors = [];
  ws.onmessage = event => {
    const msg = JSON.parse(event.data);
    if (msg.id) {
      const p = pending.get(msg.id); pending.delete(msg.id);
      msg.error ? p.reject(msg.error) : p.resolve(msg.result);
    }
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push(msg.params.args.map(a=>a.value || a.description || '').join(' '));
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params }));
  });
  const run = async expression => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {width:1280,height:820,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate', { url: gameUrl });
  for (let i = 0; i < 100 && !await run('Boolean(window.App2D?.playerChar && window.App2D?.playerData)'); i++) await sleep(100);
  await run(`(() => {
    Sound.enabled=false; Dialogue.close(); App2D.shownChapterSet=new Set(Object.keys(GAME_DATA.CHAPTER_CONFIGS));
    document.querySelectorAll('.chapter-opening-overlay').forEach(e=>e.remove());
    window.qaRead = () => { let n=0; while(Dialogue.currentDialogue && n++<30) {
      if(Dialogue.isTyping) Dialogue.next();
      const step=Dialogue.currentDialogue?.steps[Dialogue.currentStep];
      if(step?.options?.length) break;
      Dialogue.next();
    } return n; };
    return true;
  })()`);
  const result = {};
  result.dialogue = await run(`(() => {
    const app=App2D; app.storyPhase='heaven_prologue'; app.loadMap('tiangong_palace',null,{duration:0});
    app.triggerNpcDialogue(app.npcs.find(n=>n.id==='npc_taibai')); qaRead();
    const phase=app.storyPhase;
    app.autoMovePath=[{x:app.playerChar.x,y:app.playerChar.y}];
    app.autoMoveTargetCallback=()=>app.triggerNpcDialogue(app.npcs.find(n=>n.id==='npc_taibai'));
    app.triggerNpcDialogue(app.npcs.find(n=>n.id==='npc_taibai'));
    const repeated=Dialogue.currentDialogue===GAME_DATA.STORY_DIALOGUES.pantao_intro;
    qaRead();app.update(); const reopened=Boolean(Dialogue.currentDialogue); Dialogue.close();
    app.storyPhase='heaven_tiangong_trial';app.refreshMapNpcs();
    app.triggerNpcDialogue(app.npcs.find(n=>n.id==='npc_taibai'));
    const trialCorrect=Dialogue.currentDialogue===GAME_DATA.STORY_DIALOGUES.tiangong_banishment_scene;
    Dialogue.close();return {phase,repeated,reopened,trialCorrect};
  })()`);
  result.transition = await run(`(async()=>{
    App2D.storyPhase='changan_arrived';App2D.loadMap('liujiacun',null,{duration:0.75});
    await new Promise(r=>setTimeout(r,80)); App2D.loadMap('changan_city',null,{duration:0.75});
    await new Promise(r=>setTimeout(r,1100));
    return {map:App2D.currentMapId,locked:App2D.isTransitioning,overlay:document.getElementById('scene-transition-overlay')?.className};
  })()`);
  result.battle = await run(`(async()=>{
    const app=App2D;app.playerData.level=50;app.playerData.recalculateStats(true);app.pets=[];app.companions=[];app.activeCombatPets=[];
    let wins=0,heldUntilImpact=false; app.start2DBattle([{id:'qa_weak',name:'试炼',hp:1,maxHp:1,atk:1,def:0,spd:1}],()=>wins++);
    const originalStep=app.playBattleStep;
    app.playBattleStep=async function(step,battle){
      if(battle.enemies.every(e=>e.hp<=0)){
        this.renderBattleInterface();this.endBattle('victory');heldUntilImpact=this.currentBattle===battle && wins===0;
      }
      return originalStep.call(this,step,battle);
    };
    try{app.combatSpeedMultiplier=2;for(let i=0;i<10 && app.currentBattle;i++)await app.executeCombatRound();}finally{app.playBattleStep=originalStep;}
    const victory={wins,heldUntilImpact,closed:app.currentBattle===null,paused:app.isPaused,layer:document.getElementById('battle-screen-layer').style.display};
    app.playerData.recalculateStats(true);let losses=0;
    app.start2DBattle([{id:'qa_strong',name:'强敌',hp:10000,maxHp:10000,atk:999999,def:100,spd:99999}],()=>{},()=>losses++);
    app.combatSpeedMultiplier=2;for(let i=0;i<10 && app.currentBattle;i++)await app.executeCombatRound();
    return {victory,defeat:{losses,closed:app.currentBattle===null,paused:app.isPaused,hp:app.playerData.hp}};
  })()`);
  result.prologue = await run(`(async()=>{
    const app=App2D;
    if(app.currentBattle)throw new Error('previous battle fixture was not closed');
    Dialogue.close();app.cancelStoryDialogue();app.isPaused=false;app.isAnimatingCombat=false;
    app.playerData=new Player({name:'威灵大将',classId:'jingang',level:50,silver:15000});
    app.playerData.equipItem('weapon',{itemId:'eq_wp_bawangqiang',star:5,sockets:['gem_hongmanao',null,null]});
    app.playerData.equipItem('armor',{itemId:'eq_am_huangjin',star:5,sockets:['gem_jingang',null,null]});
    app.pets=[];app.activeCombatPets=[];app.companions=[];app.interactedNpcSet=new Set();
    app.playerChar.appearance='heaven_general';app.storyPhase='heaven_prologue';
    app.loadMap('tiangong_palace',null,{duration:0,forceTransition:true});
    const trace=[];
    const pause=ms=>new Promise(r=>setTimeout(r,ms));
    let failure=null;
    for(let i=0;i<80;i++){
      await pause(20);
      if(app.isTransitioning){await pause(1100);continue;}
      const before={map:app.currentMapId,phase:app.storyPhase,battle:app.currentBattle?.enemies[0]?.name};
      trace.push(before);
      if(app.currentBattle){
        app.combatSpeedMultiplier=2;
        for(let round=0;round<25 && app.currentBattle;round++){
          await app.executeCombatRound();
          if(app.currentBattle?.status==='player_input' && round===24)throw new Error('battle did not finish');
        }
        continue;
      }
      if(Dialogue.currentDialogue){
        qaRead();
        const step=Dialogue.currentDialogue?.steps[Dialogue.currentStep];
        if(step?.options?.length===1)Dialogue.chooseOption(0);
        else if(step?.options?.length>1){failure='unexpected choice';break;}
        continue;
      }
      if(app.storyPhase==='liujiacun_find_mushrooms')break;
      const target=app.minimap.getCurrentQuestTarget(app.currentMapId,app.storyPhase,GAME_DATA.MAPS_2D[app.currentMapId]);
      if(!target){failure='missing quest target';break;}
      app.handleClickCanvas(target.x-app.camera.x,target.y-app.camera.y);
      for(let frame=0;frame<2000 && app.autoMovePath.length && !app.isTransitioning && !Dialogue.currentDialogue && !app.currentBattle;frame++) app.update();
      app.update();
      if(before.map===app.currentMapId && before.phase===app.storyPhase && !app.currentBattle && !Dialogue.currentDialogue && !app.isTransitioning){
        app.interactNearby();
        if(!Dialogue.currentDialogue && !app.currentBattle){failure={reason:'navigation stalled',target,pos:{x:app.playerChar.x,y:app.playerChar.y},path:app.autoMovePath.length};break;}
      }
    }
    return {phase:app.storyPhase,map:app.currentMapId,locked:app.isTransitioning,paused:app.isPaused,failure,trace};
  })()`);
  result.laterChapter = await run(`(async()=>{
    const app=App2D;Dialogue.close();app.cancelStoryDialogue();
    app.playerData.level=50;app.playerData.recalculateStats(true);
    app.playerData.equipItem('weapon',{itemId:'eq_wp_bawangqiang',star:5,sockets:[]});
    app.playerData.equipItem('armor',{itemId:'eq_am_huangjin',star:5,sockets:[]});
    app.storyPhase='yingchou_cleared';app.loadMap('gaolaozhuang',null,{duration:0});
    app.triggerBajieBattle();app.combatSpeedMultiplier=2;
    for(let i=0;i<25 && app.currentBattle;i++)await app.executeCombatRound();
    app.update();app.saveAutoProgress();
    const saved=SaveManager.loadGameFullState();
    return {closed:!app.currentBattle,checkpoint:saved.pendingStoryDialogue?.key,phase:app.storyPhase};
  })()`);
  await send('Page.navigate', { url: gameUrl });
  await sleep(1500);
  result.reload = await run(`(()=>{
    const app=App2D;Sound.enabled=false;app.update();
    const recovered=Dialogue.currentDialogue===GAME_DATA.STORY_DIALOGUES.bajie_post_battle;
    const qaRead=()=>{for(let i=0;i<30 && Dialogue.currentDialogue;i++){
      if(Dialogue.isTyping)Dialogue.next();
      if(Dialogue.currentDialogue?.steps[Dialogue.currentStep]?.options?.length)break;
      Dialogue.next();
    }};
    qaRead();const step=Dialogue.currentDialogue?.steps[Dialogue.currentStep];if(step?.options?.length===1)Dialogue.chooseOption(0);
    app.update();const state=SaveManager.loadGameFullState();
    return {recovered,phase:app.storyPhase,joined:app.companions.some(p=>p.id==='companion_bajie'),checkpoint:state.pendingStoryDialogue,reopened:!!Dialogue.currentDialogue};
  })()`);
  result.escape = await run(`(async()=>{
    const app=App2D;let rewards=0;app.start2DBattle([{id:'qa_flee',name:'脱身试炼',hp:1000,maxHp:1000,atk:1,def:1,spd:1}],()=>rewards++);
    app.currentBattle.setAllyAction('player',{type:'flee'});const originalRandom=Math.random;
    try{Math.random=()=>0.1;app.combatSpeedMultiplier=2;await app.executeCombatRound();}finally{Math.random=originalRandom;}
    return {closed:!app.currentBattle,paused:app.isPaused,rewards,cooldown:app._encounterCooldownUntil>Date.now()};
  })()`);
  result.keyboard = await run(`(()=>{
    const app=App2D;app.storyPhase='heaven_prologue';app.interactedNpcSet=new Set();
    app.loadMap('tiangong_palace',null,{duration:0,forceTransition:true});
    app.triggerNpcDialogue(app.npcs.find(n=>n.id==='npc_taibai'));Dialogue.completeAllAndClose();
    window.dispatchEvent(new KeyboardEvent('keydown',{key:' ',repeat:true}));
    return {phase:app.storyPhase,reopened:!!Dialogue.currentDialogue};
  })()`);
  if(process.argv.includes('--capture')){
    await run(`Dialogue.start(GAME_DATA.STORY_DIALOGUES.pantao_intro);Dialogue.next();`);
    await sleep(100);
    const desktop=await send('Page.captureScreenshot',{format:'png'});
    fs.writeFileSync(path.join(__dirname,'flow-dialogue-desktop.png'),Buffer.from(desktop.data,'base64'));
    await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    await run(`if(document.body.classList.contains('modern-mode'))document.getElementById('toggle-mode-btn').click();`);
    await run(`showGameMessage('太白已交代值守方向，阅读后可继续巡视。','info');`);
    await sleep(350);
    result.mobileLayout=await run(`(()=>{
      const v=document.getElementById('game-viewport').getBoundingClientRect();
      const items=[...document.querySelectorAll('.game-toast-item')];
      const fits=items.every(e=>{const r=e.getBoundingClientRect();return r.left>=v.left && r.right<=v.right;});
      const d=document.querySelector('.dialogue-box').getBoundingClientRect();
      return {toasts:items.length,fits,dialogueFits:d.left>=v.left && d.right<=v.right && d.top>=v.top && d.bottom<=v.bottom};
    })()`);
    const mobile=await send('Page.captureScreenshot',{format:'png'});
    fs.writeFileSync(path.join(__dirname,'flow-dialogue-mobile.png'),Buffer.from(mobile.data,'base64'));
  }
  result.errors=errors;
  fs.writeFileSync(path.join(__dirname, process.argv[2] || 'flow-browser.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2)); ws.close();
  if(result.errors.length || result.dialogue.repeated || result.dialogue.reopened || !result.dialogue.trialCorrect ||
    result.transition.map!=='changan_city' || result.transition.locked || !result.battle.victory.closed ||
    result.battle.victory.wins!==1 || !result.battle.defeat.closed || result.battle.defeat.losses!==1 ||
    !result.battle.victory.heldUntilImpact || result.prologue.phase!=='liujiacun_find_mushrooms' || result.prologue.failure ||
    result.laterChapter.checkpoint!=='bajie_post_battle' || !result.reload.recovered || !result.reload.joined || result.reload.reopened ||
    result.reload.phase!=='gaolao_cleared' || result.reload.checkpoint || !result.escape.closed || result.escape.rewards || result.escape.paused || result.keyboard.reopened ||
    (result.mobileLayout && (!result.mobileLayout.fits || !result.mobileLayout.dialogueFits || result.mobileLayout.toasts>2))) process.exitCode=1;
})().catch(e => { console.error(e); activeSocket?.close(); process.exitCode=1; });
