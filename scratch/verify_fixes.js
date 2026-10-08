const assert = require('assert');

// 模拟完整浏览器与测试环境
global.window = global;
const domMap = {};
global.document = {
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
      querySelector: (sel) => {
        if (!sel) return null;
        if (!el._queryCache) el._queryCache = {};
        if (el._queryCache[sel]) return el._queryCache[sel];
        const cls = sel.startsWith('.') ? sel.slice(1) : sel;
        const found = el.children.find(c => (c.className && c.className.includes(cls)) || (c.tagName && c.tagName.toLowerCase() === sel.toLowerCase()));
        if (found) {
          el._queryCache[sel] = found;
          return found;
        }
        if (el.innerHTML && el.innerHTML.includes(cls)) {
          const fakeChild = global.document.createElement('button');
          fakeChild.className = cls;
          fakeChild.parentElement = el;
          el._queryCache[sel] = fakeChild;
          return fakeChild;
        }
        return null;
      },
      querySelectorAll: (sel) => {
        if (!sel) return [];
        const cls = sel.startsWith('.') ? sel.slice(1) : sel;
        return el.children.filter(c => (c.className && c.className.includes(cls)) || (c.tagName && c.tagName.toLowerCase() === sel.toLowerCase()));
      },
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

window.Sound = new Proxy({}, {
  get: () => () => true
});
window.showGameMessage = (msg, type) => {};
window.Camera = class { constructor() {} follow() {} update() {} screenToWorld(x, y) { return { x, y }; } };
window.PathfindingEngine = class { constructor() {} findPath() { return []; } };
window.MountSystem = class { constructor() { this.mounts = {}; } addMount() {} getStatsBonus() { return { hp: 0, atk: 0, def: 0, spd: 0 }; } };
window.ParticleSystem = class { constructor() { this.particles = []; } update() {} render() {} };
window.addEventListener = () => {};
window.removeEventListener = () => {};
window.requestAnimationFrame = () => 0;
window.cancelAnimationFrame = () => {};
window.location = { search: '', href: 'http://localhost/', pathname: '/', origin: 'http://localhost' };

const fs = require('fs');
const path = require('path');

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

async function runTests() {
  console.log('▶️ 开始针对性回归测试：技能施放、战斗终结与场景切换');

  // 1. 验证 Lv.1 玩家在初始刘家村或转职后的法力池与门派专属技能
  console.log('  1. 验证 Lv.1 玩家的技能与法力池...');
  const maleJingang = new window.Player({ name: '大力和尚', classId: 'jingang', gender: 'male', level: 1 });
  const femaleJingang = new window.Player({ name: '金刚神女', classId: 'jingang', gender: 'female', level: 1 });
  
  assert(maleJingang.maxMp >= 300, `男金刚1级法力上限充足 (实际: ${maleJingang.maxMp})`);
  assert(maleJingang.mp === maleJingang.maxMp, '初始气血法力满额');
  
  const maleSkills = maleJingang.getSkills();
  assert(maleSkills.some(s => s.name === '佛光普照' || s.id === 'sk_jg_foguang'), '男金刚包含佛光普照');
  assert(!maleSkills.some(s => s.name === '如来神掌' || s.id === 'sk_jg_ruxiang'), '男金刚绝不含如来神掌');
  assert(maleSkills.some(s => s.name === '舍生取义'), '男金刚包含舍生取义');
  assert(maleSkills.some(s => s.name === '金刚护体'), '男金刚包含金刚护体');

  const femaleSkills = femaleJingang.getSkills();
  assert(femaleSkills.some(s => s.name === '如来神掌'), '女金刚包含如来神掌');
  assert(!femaleSkills.some(s => s.name === '佛光普照'), '女金刚绝不含佛光普照');

  // 妖魔与仙人
  const yaomo = new window.Player({ name: '黑风怪', classId: 'yaomo', gender: 'male', level: 1 });
  assert(yaomo.maxMp >= 360, `妖魔1级法力上限充足支持雷霆万钧/三昧真火 (实际: ${yaomo.maxMp})`);
  const yaomoSkills = yaomo.getSkills();
  assert(yaomoSkills.some(s => s.name === '雷霆万钧'), '男妖魔包含雷霆万钧');
  assert(!yaomoSkills.some(s => s.name === '万毒攻心'), '男妖魔绝不含万毒攻心');

  console.log('  ✅ [PASS] 玩家技能性别过滤与Lv.1法力池满足核心神技消耗');

  // 2. 验证 BattleEngine rebuildAllies 挂载 player.skills 与 handleSkillCast
  console.log('  2. 验证战斗中技能正常施放...');
  const enemy = { id: 'test_enemy', name: '捣蛋山精', hp: 300, maxHp: 300, mp: 100, maxMp: 100, atk: 20, def: 10, spd: 5 };
  const battle = new window.BattleEngine(maleJingang, [], [enemy]);

  const pAlly = battle.allies[0];
  assert(pAlly.skills && pAlly.skills.length === 3, '己方主角阵列已正确携带门派绝技');

  // 释放舍生取义
  const prevMp = pAlly.mp;
  let eventReceived = null;
  await battle.handleSkillCast(pAlly, { skillId: '舍生取义', targetIndex: 0 }, (e) => { eventReceived = e; });
  assert(pAlly.mp < prevMp, '舍生取义正常扣除法力');
  assert(enemy.hp < 300, '舍生取义正常造成伤害');
  assert(eventReceived && eventReceived.skillName === '舍生取义', '回调事件携带技能名称');

  // 法力不足保护
  enemy.hp = 300;
  pAlly.mp = 10;
  let blockedEvent = null;
  await battle.handleSkillCast(pAlly, { skillId: '舍生取义', targetIndex: 0 }, (e) => { blockedEvent = e; });
  assert(blockedEvent && blockedEvent.type === 'status_block' && blockedEvent.text === '法力不足！', '法力不足时正常向表现层派发状态提示');

  console.log('  ✅ [PASS] 技能施放结算、伤害生效、法力扣除及法力不足保护均正常');

  // 3. 验证战斗自动结束
  console.log('  3. 验证打完以后战斗是否自动结束...');
  // A. 敌人血量归0
  enemy.hp = 0;
  assert(battle.checkBattleEnd() === true, '所有敌人死亡后 checkBattleEnd 返回 true');
  assert(battle.status === 'victory', '战斗状态置为 victory');

  // B. 招降野怪致胜
  const captureEnemy = { id: 'capture_test', name: '小蚌精', hp: 50, maxHp: 50, mp: 50, maxMp: 50, quality: 'ordinary', atk: 10, def: 5, spd: 5 };
  const captureBattle = new window.BattleEngine(maleJingang, [], [captureEnemy]);
  const origRandom = Math.random;
  try {
    Math.random = () => 0.1; // 确保 80% 几率成功
    await captureBattle.handleAllyTurn(captureBattle.allies[0], { type: 'capture', targetIndex: 0 }, null);
    assert(captureEnemy.hp === 0, '招降成功后目标血量归0');
    assert(captureBattle.status === 'victory', '捕获最后一只怪后战斗立即判定 victory');
  } finally {
    Math.random = origRandom;
  }

  // C. App2D executeCombatRound 自动结算保障
  let victoryCalled = false;
  window.App2D.currentBattle = captureBattle;
  captureBattle.status = 'player_input';
  captureEnemy.hp = 0; // 敌方已全灭
  window.App2D.battleVictoryCallback = () => { victoryCalled = true; };
  await window.App2D.executeCombatRound();
  assert(victoryCalled === true, '敌方已全灭时 executeCombatRound 自动终结战斗并触发回调');
  assert(window.App2D.currentBattle === null, '战斗实例安全清理归 null');
  assert(window.App2D.isPaused === false, '场景暂停状态已恢复');

  console.log('  ✅ [PASS] 敌人阵亡或被招降后战斗百分之百自动结束');

  // 4. 验证场景切换防卡死机制
  console.log('  4. 验证场景切换与贬谪凡尘...');
  window.App2D.isTransitioning = false;
  window.App2D.keysDown = { 'ArrowRight': true };
  window.App2D.loadMap('liujiacun');
  assert(Object.keys(window.App2D.keysDown).length === 0, '切换地图时清空按键残留');
  assert(window.App2D.currentMapId === 'liujiacun', '成功载入刘家村');

  // 验证 executeBanishment 重置状态
  window.App2D.playerData = maleJingang;
  maleJingang.level = 50;
  maleJingang.hp = 10;
  maleJingang.mp = 5;
  window.App2D.executeBanishment();
  assert(window.App2D.playerData.level === 1, '贬谪后等级重置为 1');
  assert(window.App2D.playerData.hp === window.App2D.playerData.maxHp, '贬谪后满血苏醒');
  assert(window.App2D.playerData.mp === window.App2D.playerData.maxMp, '贬谪后满蓝苏醒');
  assert(window.App2D.playerData.maxMp >= 300, '凡尘Lv.1法力值充盈可放绝技');

  // 验证 update() 在 isTransitioning 时安全阻止移动与传送门重复触发
  window.App2D.isTransitioning = true;
  let moveAttempted = false;
  window.App2D.playerChar.move = () => { moveAttempted = true; };
  window.App2D.keysDown = { 'ArrowUp': true };
  window.App2D.update();
  assert(moveAttempted === false, '过渡动画期间 update() 立即返回，杜绝移动与传送门重入');
  window.App2D.isTransitioning = false;

  console.log('  ✅ [PASS] 场景切换容错、按键清理、凡尘初始化与过渡阻断验证全部通过！');
}

runTests().then(() => {
  console.log('\n🎉 所有专项测试全部通过！');
}).catch(err => {
  console.error('\n❌ 测试失败:', err);
  process.exit(1);
});
