const fs = require('node:fs');
const path = require('node:path');
const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\26cfd301-5756-49c9-acb8-ec1ba79b2bfc';
const { spawn } = require('node:child_process');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=d:/Extends/antigravityProj/XiYouOnline/scratch/chrome-retro-profile2',
    '--no-first-run',
    'about:blank'
  ]);
  let targets = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json');
      targets = await res.json();
      if (targets && targets.length > 0) break;
    } catch(e) { await sleep(200); }
  }
  const page = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let seq = 0; const pending = new Map();
  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.id) { const p = pending.get(msg.id); pending.delete(msg.id); p && (msg.error ? p.reject(msg.error) : p.resolve(msg.result)); }
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
  await send('Emulation.setDeviceMetricsOverride', { width: 480, height: 860, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: 'http://127.0.0.1:5173/?map=liujiacun' });
  for (let i = 0; i < 60; i++) {
    if (await run('Boolean(window.App2D?.playerChar && window.App2D?.playerData)')) break;
    await sleep(200);
  }
  await run(`(() => {
    if (window.Sound) window.Sound.enabled = false;
    document.querySelectorAll('.map-title-banner, .map-transition-overlay, .chapter-opening-overlay, .modal-overlay').forEach(e => e.remove());
    document.body.classList.remove('modern-mode');
    window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.pantao_tudi_talk);
    if (window.Dialogue.typeInterval) clearInterval(window.Dialogue.typeInterval);
    window.Dialogue.currentStep = 1;
    window.Dialogue.isTyping = false;
    window.Dialogue.displayedText = window.Dialogue.currentDialogue.steps[1].text;
    window.Dialogue.render();
    return true;
  })()`);
  await sleep(300);
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_pantao_tudi_retro.png'), Buffer.from(data, 'base64'));
  console.log('Retro screenshot captured!');
  ws.close();
  chromeProc.kill();
  process.exit(0);
})();
