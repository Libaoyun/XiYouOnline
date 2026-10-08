const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\26cfd301-5756-49c9-acb8-ec1ba79b2bfc';
const profileDir = path.join(__dirname, 'chrome-clean-profile');

(async () => {
  console.log('1. Starting headless Chrome...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    'about:blank'
  ]);

  chromeProc.on('error', err => {
    console.error('Failed to start Chrome:', err);
  });

  // Wait for Chrome CDP port 9222
  let targets = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json');
      targets = await res.json();
      if (targets && targets.length > 0) break;
    } catch (e) {
      await sleep(200);
    }
  }

  if (!targets) {
    console.error('Chrome failed to respond on 9222');
    chromeProc.kill();
    process.exit(1);
  }

  console.log('2. Connected to Chrome CDP.');
  const page = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

  let seq = 0;
  const pending = new Map();
  ws.onmessage = event => {
    const msg = JSON.parse(event.data);
    if (msg.id) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(msg.error);
      else p.resolve(msg.result);
    }
  };

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

  const run = async expression => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) {
      throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    }
    return r.result.value;
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 820, deviceScaleFactor: 1, mobile: false });

  console.log('3. Navigating to game...');
  await send('Page.navigate', { url: 'http://127.0.0.1:5173/?map=liujiacun' });

  for (let i = 0; i < 60; i++) {
    const loaded = await run('Boolean(window.App2D?.playerChar && window.App2D?.playerData)');
    if (loaded) break;
    await sleep(200);
  }

  console.log('4. Game loaded, setting up test environment...');
  await run(`(() => {
    Sound.enabled = false;
    Dialogue.close();
    document.querySelectorAll('.chapter-opening-overlay, .modal-overlay').forEach(e => e.remove());
    App2D.playerData.name = '逍遥客';
    App2D.playerData.level = 25;
    App2D.playerData.silver = 88888;
    return true;
  })()`);

  const capture = async (name) => {
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(artifactDir, name);
    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
    console.log(`Saved screenshot: ${filePath}`);
  };

  // A. 刘家村土地公对话选项 (前往蟠桃园、前往御马监、返回居住地、打听地势)
  console.log('5. Triggering 刘家村土地公对话...');
  await run(`(() => {
    document.querySelectorAll('.map-title-banner, .map-transition-overlay, .chapter-opening-overlay, .modal-overlay').forEach(e => e.remove());
    Dialogue.start(GAME_DATA.STORY_DIALOGUES.liujia_tudi_talk);
    if (Dialogue.typeInterval) clearInterval(Dialogue.typeInterval);
    Dialogue.currentStep = 1;
    Dialogue.isTyping = false;
    Dialogue.displayedText = Dialogue.currentDialogue.steps[1].text;
    Dialogue.render();
    return true;
  })()`);
  await sleep(300);
  await capture('verify_liujiacun_tudi_clean.png');

  // B. 蟠桃园土地公对话选项 (返回、返回刘家村、返回居住地、前往御马监)
  console.log('6. Triggering 蟠桃园土地公对话...');
  await run(`(() => {
    document.querySelectorAll('.map-title-banner, .map-transition-overlay, .chapter-opening-overlay, .modal-overlay').forEach(e => e.remove());
    Dialogue.start(GAME_DATA.STORY_DIALOGUES.pantao_tudi_talk);
    if (Dialogue.typeInterval) clearInterval(Dialogue.typeInterval);
    Dialogue.currentStep = 1;
    Dialogue.isTyping = false;
    Dialogue.displayedText = Dialogue.currentDialogue.steps[1].text;
    Dialogue.render();
    return true;
  })()`);
  await sleep(300);
  await capture('verify_pantao_tudi_clean.png');

  // C. 打开乾坤行囊，点击金创药弹出物品详情卡片
  console.log('7. Opening Inventory and clicking item detail...');
  await run(`(() => {
    Dialogue.close();
    // 确保行囊里有金创药与神兵
    App2D.inventory.addItem('jinchuang_yao', 5);
    App2D.inventory.addItem('yitian_jian', 1);
    App2D.inventory.addItem('gem_atk_1', 2);
    App2D.openInventoryModal('all');
    // 点击金创药
    const jcSlot = App2D.inventory.slots.find(s => s.itemId === 'jinchuang_yao');
    if (jcSlot) {
      App2D.showInventoryItemDetail(jcSlot.instanceId);
    }
    return true;
  })()`);
  await sleep(300);
  await capture('verify_inventory_item_detail_clean.png');

  // D. 点击已穿戴的神兵，弹出已装备详情卡片
  console.log('8. Clicking equipped weapon detail...');
  await run(`(() => {
    document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
    App2D.openInventoryModal('all');
    App2D.showEquippedDetail('weapon');
    return true;
  })()`);
  await sleep(300);
  await capture('verify_equipped_weapon_detail_clean.png');

  console.log('Done captures!');
  ws.close();
  chromeProc.kill();
  process.exit(0);
})();
