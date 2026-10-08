const fs = require('node:fs');
const path = require('node:path');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const targets = await (await fetch('http://localhost:9339/json')).json();
  const target = targets.find(t => t.type === 'page');
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let nextId = 1;
  const pending = new Map();
  const errors = [];
  socket.onmessage = event => {
    const msg = JSON.parse(event.data);
    if (msg.id) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(msg.error) : p.resolve(msg.result); }
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.text + ': ' + (msg.params.exceptionDetails.exception?.description || ''));
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId++; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 820, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://127.0.0.1:5173/?map=changan_city' });
  for (let i = 0; i < 60; i++) {
    if (await evaluate('Boolean(window.App2D?.playerData && window.App2D?.playerChar)')) break;
    await sleep(100);
  }
  await evaluate(`(() => {
    const app = window.App2D;
    window.SaveManager.saveGameFullState = () => ({success:true});
    window.Sound.enabled = false;
    window.Dialogue.close();
    document.querySelectorAll('.chapter-banner-overlay,.chapter-opening-overlay').forEach(e=>e.remove());
    app.playerData.level=50; app.playerData.recalculateStats(true);
    app.playerChar.appearance='martial_hero'; app.companions=[]; app.pets=[]; app.activeCombatPets=[];
    app.start2DBattle([0,1,2].map(i=>({id:'qa_'+i,name:['巡山虎卒','青丘妖狐','巡海夜叉'][i],appearance:['hu_xianfeng','fox','yecha'][i],level:30,hp:3000,maxHp:3000,mp:1200,maxMp:1200,atk:100,def:70,spd:20})),()=>{});
    app.stopBattleCountdown(); return true;
  })()`);
  await sleep(180);
  const shot = async filename => {
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, filename), Buffer.from(data, 'base64'));
  };
  await shot('polish-battle-base.png');
  for (const type of ['thunder', 'palm', 'sand', 'sacrifice']) {
    await evaluate(`(() => {
      const app=App2D; app.stopBattleLoop(); app.activeBattleEffects=[];
      const pos=app.currentBattle.enemies[1]._battlePos;
      app.spawnBattleSkillEffect('${type}',pos.x,pos.y,1000);
      const fx=app.activeBattleEffects[0]; fx.startTime=Date.now()-550;
      if('${type}'==='sacrifice'){fx.phase='energy_detonate';fx.impactTime=Date.now()-120;fx.blastDuration=400;}
      app.battleCastCue={text:'${type === 'thunder' ? '雷霆万钧' : type === 'palm' ? '如来神掌' : type === 'sand' ? '飞沙走石' : '舍生取义'}',until:Date.now()+5000};
      app.renderBattleCanvasFrame(); return true;
    })()`);
    await shot('polish-' + type + '.png');
  }
  const smoke = await evaluate(`(async () => {
    const app=App2D; app.activeBattleEffects=[];app.battleCastCue=null;app.startBattleLoop();
    const battle=app.currentBattle;const victim=battle.enemies[0];const ally=battle.allies[0];
    app.combatSpeedMultiplier=2; app.prepareBattlePresentation(battle);
    victim.hp=0;let visibleBefore=victim._displayHp>0;
    await app.playBattleStep({type:'damage',attacker:ally.id,targetIndex:0,damage:3000,text:'-3000'},battle);
    const lethal={visibleBefore,visibleAfter:victim._displayHp,reset:ally._dashOffset.x===0};
    app.clearBattlePresentation(battle);app.stopBattleLoop();app.stopBattleCountdown();
    return {lethal,canvas:{width:document.getElementById('battle-scene-canvas').width,height:document.getElementById('battle-scene-canvas').height}};
  })()`);
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await evaluate('App2D.renderBattleInterface();App2D.renderBattleCanvasFrame();true');
  await shot('polish-battle-mobile.png');
  const overflow = await evaluate('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 820, deviceScaleFactor: 1, mobile: false });
  const visualResults = await evaluate(`(() => {
    const app=App2D; app.stopBattleLoop();app.stopBattleCountdown();app.currentBattle=null;
    document.getElementById('battle-screen-layer').style.display='none';
    app.isPaused=false;app.loadMap('changan_city');
    document.querySelectorAll('.chapter-opening-overlay').forEach(e=>e.remove());
    const ids=['changan_girl','changan_scholar','baoxiang_king','baihuaxiu','rulai'];
    const results=ids.map(roleId=>({roleId,normalized:Portraits.normalizeRoleId(roleId),image:Portraits.getAvatarDataUrl(roleId,78).startsWith('data:image/')}));
    Dialogue.start(GAME_DATA.STORY_DIALOGUES.changan_girl_talk);
    return results;
  })()`);
  await sleep(650);
  await shot('polish-dialogue.png');
  await evaluate(`(() => {
    Dialogue.close();
    const panel=document.createElement('div');panel.id='qa-portraits';
    panel.style.cssText='position:fixed;top:100px;left:30%;z-index:99999;background:#241c19;padding:25px;display:flex;gap:18px;color:#ecd6ab';
    panel.innerHTML=['changan_girl','changan_scholar','baoxiang_king','baihuaxiu','rulai'].map(id=>'<div>'+Portraits.getPortraitSvg(id,78)+'<div>'+id+'</div></div>').join('');
    document.body.appendChild(panel);return true;
  })()`);
  await shot('polish-portraits.png');
  await evaluate("document.getElementById('qa-portraits').remove();true");
  console.log(JSON.stringify({smoke,overflow,visualResults,errors},null,2));
  socket.close();
  if (!smoke.lethal.visibleBefore || smoke.lethal.visibleAfter !== 0 || !smoke.lethal.reset ||
      overflow.width !== overflow.scrollWidth || visualResults.some(v => !v.image || v.normalized !== v.roleId) || errors.length) {
    throw new Error('Browser QA failed; inspect the result above.');
  }
})().catch(e => { console.error(e); process.exitCode=1; });
