const fs = require('fs');
const path = require('path');
const assert = require('assert');

// 构造模拟浏览器全局环境
global.window = global;
const domMap = {};
global.document = {
  addEventListener: () => {},
  removeEventListener: () => {},
  getElementById: (id) => domMap[id] || null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (tag) => {
    const el = {
      tagName: tag ? tag.toUpperCase() : 'DIV',
      id: '',
      className: '',
      style: {},
      innerHTML: '',
      dataset: {},
      children: [],
      parentElement: null,
      appendChild: (child) => {
        el.children.push(child);
        if (child) child.parentElement = el;
        if (child && child.id) domMap[child.id] = child;
      },
      querySelector: (sel) => null,
      querySelectorAll: (sel) => [],
      classList: {
        _classes: new Set(),
        add: (c) => el.classList._classes.add(c),
        remove: (c) => el.classList._classes.delete(c),
        contains: (c) => el.classList._classes.has(c),
        toggle: (c) => {
          if (el.classList._classes.has(c)) el.classList._classes.delete(c);
          else el.classList._classes.add(c);
        }
      },
      addEventListener: (evt, cb) => { el['on' + evt] = cb; },
      removeEventListener: () => {},
      remove: () => {
        if (el.id && domMap[el.id]) delete domMap[el.id];
        if (el.parentElement && el.parentElement.children) {
          const idx = el.parentElement.children.indexOf(el);
          if (idx !== -1) el.parentElement.children.splice(idx, 1);
        }
      }
    };
    return el;
  },
  body: {
    classList: { toggle: () => {}, contains: () => true },
    appendChild: (child) => {
      if (child && child.id) domMap[child.id] = child;
    }
  }
};

window.Sound = new Proxy({}, { get: () => () => true });
window.showGameMessage = (msg, type) => {
  console.log(`  [Toast ${type || 'info'}]: ${msg}`);
};
window.Camera = class {
  constructor() { this.x = 0; this.y = 0; this.viewportWidth = 760; this.viewportHeight = 580; }
  follow(x, y) { this.x = x - 380; this.y = y - 290; }
  update() {}
  screenToWorld(sx, sy) { return { x: sx + this.x, y: sy + this.y }; }
};
window.PathfindingEngine = class {
  constructor() {}
  findPath() { return []; }
};
window.ParticleSystem = class { constructor() { this.particles = []; } update() {} render() {} };
window.addEventListener = () => {};
window.removeEventListener = () => {};
window.requestAnimationFrame = () => 0;
window.cancelAnimationFrame = () => {};
window.location = { search: '', href: 'http://localhost/', pathname: '/', origin: 'http://localhost' };

const filesToLoad = [
  'js/engine/visualIdentity.js',
  'js/engine/creatureArt.js',
  'js/engine/playerArt.js',
  'js/engine/npcArt.js',
  'js/core/skills.js',
  'js/data/classes.js',
  'js/data/pets.js',
  'js/data/items.js',
  'js/data/maps2d.js',
  'js/data/storyQuests.js',
  'js/core/player.js',
  'js/core/petSystem.js',
  'js/core/mountSystem.js',
  'js/core/inventory.js',
  'js/core/forge.js',
  'js/core/battle.js',
  'js/core/peachGarden.js',
  'js/engine/tilemap.js',
  'js/engine/character.js',
  'js/engine/minimap.js',
  'js/engine/toast.js',
  'js/engine/dialogue.js',
  'js/app2d.js'
];

for (const relPath of filesToLoad) {
  const fullPath = path.join(__dirname, '..', relPath);
  const code = fs.readFileSync(fullPath, 'utf8');
  eval(code);
}

const fakeCanvas = global.document.createElement('canvas');
fakeCanvas.id = 'game-canvas';
fakeCanvas.getContext = () => ({
  clearRect: () => {},
  save: () => {},
  restore: () => {},
  beginPath: () => {},
  closePath: () => {},
  fill: () => {},
  stroke: () => {},
  arc: () => {},
  fillRect: () => {},
  strokeRect: () => {},
  roundRect: () => {},
  fillText: () => {},
  strokeText: () => {},
  measureText: () => ({ width: 60 }),
  createRadialGradient: () => ({ addColorStop: () => {} }),
  createLinearGradient: () => ({ addColorStop: () => {} }),
  translate: () => {},
  scale: () => {},
  rotate: () => {}
});
domMap['game-canvas'] = fakeCanvas;

console.log('🚀 开始验证天宫开局对话与走动全流程...');

const app = window.App2D;
app.init();

// 1. 验证天宫初始阶段
console.log('1. 验证天宫初始开局状态...');
assert.strictEqual(app.currentMapId, 'tiangong_palace');
assert.strictEqual(app.storyPhase, 'heaven_prologue');
assert.strictEqual(app.isTransitioning, false, '开局转场锁必须为 false');

const taibaiNpc = app.npcs.find(n => n.id === 'npc_taibai');
assert(taibaiNpc, '太白金星存在');
assert.strictEqual(taibaiNpc.questStatus, 'available', '太白金星拥有主线感叹号');

const tianpengBefore = app.npcs.find(n => n.id === 'npc_tianpeng');
assert.strictEqual(tianpengBefore, undefined, '开局阶段天蓬未出场');

// 2. 模拟与太白金星对话
console.log('2. 模拟与太白金星对话并完成...');
app.triggerNpcDialogue(taibaiNpc);
assert(window.Dialogue.currentDialogue, '对话窗口成功打开');

// 快进并点击下一步
window.Dialogue.next(); // step 0 full text
window.Dialogue.next(); // advance to step 1
window.Dialogue.next(); // step 1 full text
window.Dialogue.next(); // finish step 1 (action executes and dialogue closes)

assert.strictEqual(window.Dialogue.currentDialogue, null, '对话已彻底关闭');
assert.strictEqual(app.storyPhase, 'heaven_to_water_pavilion', '剧情阶段推进到 heaven_to_water_pavilion');
assert.strictEqual(app.isTransitioning, false, '对话完成后绝对不能出现卡死或过场遮罩锁定 (isTransitioning 必须为 false)');

// 3. 验证主线目标与信标已变更为前往瑶池水阁
console.log('3. 验证前往瑶池水阁信标...');
const tgMap = window.GAME_DATA.MAPS_2D['tiangong_palace'];
const targetBeacon = app.minimap.getCurrentQuestTarget('tiangong_palace', app.storyPhase, tgMap);
assert(targetBeacon, '存在瑶池水阁巡视信标');
assert.strictEqual(targetBeacon.name, '瑶池水阁');
assert.strictEqual(targetBeacon.desc, '沿御道前往东侧水阁巡视');

// 4. 模拟玩家沿着御道下层 (r15, y=480, 正是截图中的走动位置) 往东走动
console.log('4. 模拟玩家沿御道下层 (y=480) 走动巡视...');
// 走到 x = 350
app.playerChar.x = 350;
app.playerChar.y = 480;
app.update();
assert.strictEqual(app.storyPhase, 'heaven_to_water_pavilion', '未到 x>=420 前保持水阁巡视中');

// 走到 x = 450 (超过 420 触发线，y=480)
app.playerChar.x = 450;
app.playerChar.y = 480;
app.update();

assert.strictEqual(app.storyPhase, 'heaven_pantao_start', '走在御道下层 (y=480) 必须顺利触发天蓬嫦娥事件！');
assert.strictEqual(app.isTransitioning, false, '触发事件就地刷新NPC，绝不锁屏卡顿！');

const tianpengNow = app.npcs.find(n => n.id === 'npc_tianpeng');
const changeNow = app.npcs.find(n => n.id === 'npc_change');
assert(tianpengNow, '天蓬元帅已现身水阁！');
assert(changeNow, '嫦娥仙子已现身水阁！');
assert.strictEqual(tianpengNow.questStatus, 'available', '天蓬头顶显示金色主线感叹号！');

const targetTianpeng = app.minimap.getCurrentQuestTarget('tiangong_palace', app.storyPhase, tgMap);
assert.strictEqual(targetTianpeng.name, '天蓬元帅');
assert.strictEqual(targetTianpeng.desc, '制止天蓬元帅调戏嫦娥仙子');

// 5. 模拟与天蓬对话、打斗与胜出发落
console.log('5. 模拟与天蓬对话、战斗并获胜...');
app.triggerNpcDialogue(tianpengNow);
assert(window.Dialogue.currentDialogue, '天蓬调戏嫦娥剧情对话展开');

let battleTriggered = false;
app.start2DBattle = (enemies, cb) => {
  battleTriggered = true;
  assert.strictEqual(enemies[0].id, 'tianpeng_boss', '进入醉酒天蓬元帅战斗');
  if (cb) cb();
};

app.triggerTianpengBattle();
assert(battleTriggered, '成功启动天蓬战斗');

// 模拟战后王母懿旨与嫦娥致谢
const afterDlg = window.GAME_DATA.STORY_DIALOGUES.tianpeng_after_battle;
window.Dialogue.start(afterDlg);
window.Dialogue.next();
window.Dialogue.next();
window.Dialogue.next();
window.Dialogue.next(); // 完成嫦娥致谢

assert.strictEqual(app.storyPhase, 'heaven_to_lingxiao', '天蓬受责后推进至返回凌霄殿值守');
assert.strictEqual(app.isTransitioning, false, '战后对白结束不锁屏');
assert(!app.npcs.some(n => n.id === 'npc_tianpeng'), '天蓬已押赴斩妖台');

// 6. 模拟玩家继续沿御道下层 (y=480) 往东前往凌霄殿前 (x=670, y=480)
console.log('6. 模拟玩家沿御道前往凌霄殿前 (y=480)...');
app.playerChar.x = 670;
app.playerChar.y = 480;
app.update();

assert.strictEqual(app.storyPhase, 'heaven_saved_change', '沿下层御道顺利触发卷帘失手打碎琉璃盏因缘！');
assert.strictEqual(app.isTransitioning, false, '卷帘登场无黑屏阻滞');

const juanlianNow = app.npcs.find(n => n.id === 'npc_juanlian');
assert(juanlianNow, '卷帘大将在凌霄殿前现身！');
assert.strictEqual(juanlianNow.questStatus, 'available', '卷帘头顶悬挂金色感叹号！');

console.log('✅ 天宫序章开局对话、御道走动、瑶池水阁、天蓬嫦娥、战后发落、凌霄殿卷帘全流程验证 100% 通过！零卡死，零卡顿！');
