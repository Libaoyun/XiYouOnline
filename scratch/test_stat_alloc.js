const assert = require('assert');
const fs = require('fs');

// Mock browser environment
global.window = global;
global.document = {
  activeElement: null,
  body: {
    insertAdjacentHTML(pos, html) {
      this._lastHtml = html;
    }
  },
  querySelectorAll(sel) {
    return [];
  },
  getElementById(id) {
    return {
      style: {},
      width: 120,
      height: 96,
      innerText: '',
      innerHTML: '',
      value: '20',
      min: '10',
      max: '30',
      getContext(type) {
        return {
          clearRect() {},
          beginPath() {},
          arc() {},
          fill() {},
          stroke() {},
          moveTo() {},
          lineTo() {},
          closePath() {},
          fillText() {},
          save() {},
          restore() {},
          clip() {}
        };
      }
    };
  }
};

window.GAME_DATA = {
  CLASSES: {
    jingang: { name: '金刚', attrWeights: { hp: 14, atk: 2.0, def: 2.0, spd: 1.0, mp: 8, matk: 1.0 } }
  },
  PETS: {
    dahai_gui: { name: '大海龟', growth: 1.05, aptitudes: { hp: [1000, 1200], atk: [800, 900], def: [1100, 1300], spd: [500, 700] } }
  }
};

window.Portraits = {
  getPortraitSvg() { return '<svg></svg>'; }
};

window.Sound = {
  playBeep() {},
  playSuccess() {},
  playLevelUp() {}
};

window.showGameMessage = function(msg, type) {
  this.lastMsg = { msg, type };
};

// Load Player and App2D
require('../js/core/player.js');

// Create mock App2D with the new methods
const app2dCode = fs.readFileSync('./js/app2d.js', 'utf8');

// Extract the methods: showLevelUpModal, getPreviewStats, getHeroPreviewStats, getPetPreviewStats, renderAllocRadar, openStatAllocationModal, adjustAlloc, setAllocDirect, resetAlloc, saveAlloc, updateAllocModalUI
const player = new window.Player({ name: '测试少侠', classId: 'jingang' });
player.level = 10;
player.potentialPoints = 8;
player.attributes = { con: 20, int: 15, str: 25, dex: 18, sta: 15 };
player.hp = 500;
player.maxHp = 500;
player.mp = 300;
player.maxMp = 300;
player.atk = 80;
player.def = 65;
player.spd = 35;

console.log('--- 测试 1: Player.gainExp 触发升级奖励银两与 4 点潜能 ---');
let modalCalled = false;
let modalArgs = null;
window.App2D = {
  playerData: player,
  pets: [],
  activeCombatPets: [],
  updatePlayerHud() {},
  saveAutoProgress() {},
  showLevelUpModal(lvl, silver, points) {
    modalCalled = true;
    modalArgs = { lvl, silver, points };
  }
};

const initialSilver = player.silver || 0;
const initialPoints = player.potentialPoints;
const nextExp = player.getNextLevelExp();
player.gainExp(nextExp);

assert.strictEqual(modalCalled, true, '升级时应调用 showLevelUpModal');
assert.strictEqual(modalArgs.points, 4, '每次升级应奖励 4 点潜能');
assert.strictEqual(player.potentialPoints, initialPoints + 4, '潜能点应增加 4');
assert.strictEqual(player.silver > initialSilver, true, '升级应奖励银两');
console.log('✅ 测试 1 通过！获得了 4 点潜能并奖励了银两');

console.log('--- 测试 2: 动态加载 App2D 加点方法进行加点锁定逻辑验证 ---');
// Evaluate App2D class from code
const dummyObj = {};
const extractMethod = (name) => {
  const reg = new RegExp(`^\\s*${name}\\s*\\([^{]*\\)\\s*\\{`, 'm');
  const match = reg.exec(app2dCode);
  if (!match) throw new Error(`Method ${name} not found`);
  const startIdx = match.index;
  let braceCount = 0;
  let endIdx = -1;
  for (let i = startIdx; i < app2dCode.length; i++) {
    if (app2dCode[i] === '{') braceCount++;
    else if (app2dCode[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        endIdx = i + 1;
        break;
      }
    }
  }
  const fnStr = app2dCode.slice(startIdx, endIdx);
  const evalStr = `(function() { return { ${fnStr} }; })()`;
  return eval(evalStr)[name];
};

const methods = [
  'showLevelUpModal',
  'getPreviewStats',
  'getHeroPreviewStats',
  'getPetPreviewStats',
  'renderAllocRadar',
  'openStatAllocationModal',
  'adjustAlloc',
  'setAllocDirect',
  'resetAlloc',
  'saveAlloc',
  'updateAllocModalUI'
];

methods.forEach(m => {
  window.App2D[m] = extractMethod(m).bind(window.App2D);
});

// Test openStatAllocationModal
window.App2D.openStatAllocationModal('hero');
const sess = window.App2D._allocSession;
assert.ok(sess, '会话状态应存在');
assert.strictEqual(sess.baseAttrs.sheng, player.attributes.con);
assert.strictEqual(sess.tempPoints, player.potentialPoints);
console.log('✅ 成功开启会话，基础血量属性:', sess.baseAttrs.sheng, '待分配点数:', sess.tempPoints);

// Adjust +1 to sheng
const initialPot = sess.tempPoints;
window.App2D.adjustAlloc('sheng', 1);
assert.strictEqual(sess.tempAttrs.sheng, sess.baseAttrs.sheng + 1, '临时属性应 +1');
assert.strictEqual(sess.tempPoints, initialPot - 1, '待分配点数应 -1');

// Adjust -1 to sheng (reverting)
window.App2D.adjustAlloc('sheng', -1);
assert.strictEqual(sess.tempAttrs.sheng, sess.baseAttrs.sheng, '临时属性应恢复');
assert.strictEqual(sess.tempPoints, initialPot, '待分配点数应恢复');

// Try reducing below baseAttrs (MUST BE BLOCKED)
window.App2D.adjustAlloc('sheng', -1);
assert.strictEqual(sess.tempAttrs.sheng, sess.baseAttrs.sheng, '不得低于保存前基础属性');
assert.strictEqual(sess.tempPoints, initialPot, '待分配点数不得增加');
console.log('✅ 成功拦截减至保存前数值以下');

// Allocate 2 to sheng, 1 to li, and save
window.App2D.adjustAlloc('sheng', 2);
window.App2D.adjustAlloc('li', 1);
assert.strictEqual(sess.tempPoints, initialPot - 3);

// Save allocation
window.App2D.saveAlloc();
assert.strictEqual(player.attributes.con, sess.baseAttrs.sheng, '玩家属性已永久写入');
assert.strictEqual(sess.baseAttrs.sheng, sess.tempAttrs.sheng, '新基础属性已更新为加点后数值');
assert.strictEqual(sess.basePoints, initialPot - 3, '剩余潜能点已更新');

// Now verify that user CANNOT reduce below this newly saved value!
window.App2D.adjustAlloc('sheng', -1);
assert.strictEqual(sess.tempAttrs.sheng, sess.baseAttrs.sheng, '保存后已分配点数永久锁定，无法撤减');
console.log('✅ 保存后点数永久固化锁定验证通过！');

// Test Preview Stats calculation
const preview = window.App2D.getPreviewStats('hero', 0, sess.tempAttrs);
assert.ok(preview.maxHp > 0, '预览最大生命必须大于0');
assert.ok(preview.atk > 0, '预览攻击力必须大于0');
assert.ok(preview.def > 0, '预览防御力必须大于0');
assert.ok(preview.spd > 0, '预览速度必须大于0');
assert.strictEqual(preview.growth, '1.00', '主角成长率为 1.00');
console.log('✅ 综合属性实时预览计算验证通过:', preview);

console.log('\n========================================');
console.log('🎉 所有新增加点、升级提示与锁定逻辑测试全部通过！');
console.log('========================================');
