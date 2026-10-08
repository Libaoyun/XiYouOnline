const fs = require('node:fs');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
(async () => {
  const port = process.env.BROWSER_CDP_PORT || 9343;
  const url = process.env.GAME_QA_URL || 'http://127.0.0.1:5176/';
  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {socket.onopen=resolve;socket.onerror=reject;});
  let seq=0;const pending=new Map(),errors=[];
  socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const h=pending.get(m.id);pending.delete(m.id);m.error?h.reject(m.error):h.resolve(m.result);}
    if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
    if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value||a.description).join(' '));};
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  const run=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
  const capture=async (name,clip)=>fs.writeFileSync(`scratch/visual-${name}.png`,Buffer.from((await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,...(clip?{clip}: {})})).data,'base64'));
  await send('Runtime.enable');await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:850,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:url+'scratch/visual_review.html'});
  for(let i=0;i<50&&!await run('Boolean(window.Portraits && document.images.length && [...document.images].every(i=>i.complete))');i++)await pause(100);
  await pause(250);
  const broken = await run('([...document.images].filter(i=>!i.naturalWidth).map(i=>i.src))');
  for(const id of ['npcs','monkeys','creatures','players','disguises','trees']){
    const clip=await run(`(()=>{const r=document.getElementById('${id}').getBoundingClientRect();return {x:r.x,y:r.y+scrollY,width:r.width,height:r.height,scale:1}})()`);
    await capture(id,clip);
  }
  const report={errors,broken,checks:[]};
  await send('Page.navigate',{url:url+'?map=wuzhuangguan&px=608&py=384'});
  for(let i=0;i<70&&!await run('Boolean(window.App2D?.playerChar && window.App2D?.currentMapId==="wuzhuangguan")');i++)await pause(100);
  await run('App2D.storyPhase="liusha_cleared";App2D.loadMap("wuzhuangguan",{x:608,y:384},{duration:0});document.querySelectorAll(".chapter-opening-overlay").forEach(e=>e.click());');
  await pause(700);await capture('wuzhuang');
  await run('App2D.playerData.storyEvents.wuzhuang_trial_won=true;App2D.restoreWuzhuangTree();');
  await pause(300);await capture('wuzhuang-restored');
  report.checks.push(await run(`(()=>{const app=App2D,map=GAME_DATA.MAPS_2D.wuzhuangguan;let solid=true;
    map.tiles.forEach((row,r)=>row.forEach((tile,c)=>{if(tile==='ginseng_tree')solid=solid&&!app.tilemap.isWalkable(map,c,r);}));
    return {treeRestored:app.getWuzhuangTreeState()==='restored',treeCollisionIntact:solid};})()`));
  report.checks.push(await run(`(()=>{const a=document.createElement('canvas'),b=document.createElement('canvas');a.width=b.width=32;a.height=b.height=32;
    const ca=a.getContext('2d'),cb=b.getContext('2d'),t=new TilemapEngine();t.waterAnimTime=2;
    t.renderTile(ca,'water',0,0,5,5,{id:'liujiacun'});cb.translate(-37,-21);t.renderTile(cb,'water',37,21,5,5,{id:'liujiacun'});
    return {waterCameraStable:ca.getImageData(0,0,32,32).data.every((v,i)=>v===cb.getImageData(0,0,32,32).data[i])};})()`));
  // 只在独立测试浏览器中设置宠物夹具，检查正式 UI 的物种链。
  await run(`(()=>{const app=App2D;app.pets=['sha_wujing','sha_seng','honghai_er','cat_demon'].map(id=>PetSystem.createPet(id,true,20,false));app.pets[0].name='孙悟空';app.openPetManageModal();})()`);
  report.checks.push(await run(`(()=>{const html=document.body.innerHTML;return {petNightYaksha:html.includes('alt="yecha"'),petRedboy:html.includes('alt="honghaier"'),petCat:html.includes('alt="cat_demon"')};})()`));
  await capture('pets');
  await run('App2D.closePetManageModal?.();document.getElementById("pet-manage-modal")?.remove();');
  report.checks.push(await run(`(()=>{const app=App2D;const phases=['wuzhuang_cleared','baihu_first_cleared','baihu_second_cleared'];
    const roles=['baigu_maiden','baigu_granny','baigu_oldman'];let match=true;
    for(let i=0;i<phases.length;i++){app.storyPhase=phases[i];app.loadMap('baihuling',null,{duration:0});
      const npc=app.npcs.find(n=>n.id==='npc_baigujing');match=match&&!!npc&&npc.appearance===roles[i]&&app.getNpcPortraitRoleId(npc)===roles[i];}
    return {baiguStagesConsistent:match};})()`));
  fs.writeFileSync('scratch/visual-review-results.json',JSON.stringify(report,null,2));
  if(errors.length||broken.length||report.checks.some(c=>Object.values(c).some(v=>!v)))throw new Error('Visual QA failed: '+JSON.stringify(report));
  console.log(JSON.stringify(report));socket.close();
})().catch(e=>{console.error(e);socket?.close();process.exitCode=1;});
