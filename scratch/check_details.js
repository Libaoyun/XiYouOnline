const fs = require('fs');
const path = require('path');

global.window = global;
global.document = {
  getElementById: () => null,
  querySelectorAll: () => [],
  createElement: () => ({ className: '', style: {}, innerHTML: '', appendChild: () => {}, classList: { add: () => {}, remove: () => {} }, remove: () => {} }),
  body: { classList: { toggle: () => {}, contains: () => true }, appendChild: () => {} }
};
window.Sound = new Proxy({}, { get: () => () => true });
window.showGameMessage = () => {};
window.Camera = class { constructor() {} follow() {} update() {} };
window.PathfindingEngine = class { constructor() {} };
window.MountSystem = class { constructor() { this.mounts = {}; } addMount() {} getStatsBonus() { return { hp: 0, atk: 0, def: 0, spd: 0 }; } };
window.ParticleSystem = class { constructor() { this.particles = []; } };
window.addEventListener = () => {};
window.removeEventListener = () => {};
window.requestAnimationFrame = () => 0;
window.cancelAnimationFrame = () => {};
window.location = { search: '', href: 'http://localhost/', pathname: '/', origin: 'http://localhost' };

const filesToLoad = [
  'js/data/classes.js',
  'js/data/pets.js',
  'js/data/items.js',
  'js/data/maps2d.js',
  'js/data/storyQuests.js',
  'js/core/player.js',
  'js/core/petSystem.js',
  'js/core/inventory.js',
  'js/core/forge.js',
  'js/core/battle.js',
  'js/core/peachGarden.js',
  'js/engine/tilemap.js',
  'js/engine/character.js',
  'js/engine/minimap.js',
  'js/engine/toast.js',
  'js/app2d.js'
];

for (const relPath of filesToLoad) {
  const fullPath = path.join(__dirname, '..', relPath);
  eval(fs.readFileSync(fullPath, 'utf8'));
}

const maps = window.GAME_DATA.MAPS_2D;
const dlgs = window.GAME_DATA.STORY_DIALOGUES;
const app = window.App2D;

console.log('=== 天宫地图检查 ===');
for (let mId of ['tiangong_palace', 'tiangong_pantao', 'tiangong_yuma']) {
  const m = maps[mId];
  console.log(`地图 [${mId}] (${m.name}):`);
  console.log('  Portals:', m.portals.map(p => `${p.name} -> ${p.targetMap} (${p.x},${p.y})`));
  console.log('  NPCs:');
  for (let n of m.npcs || []) {
    const d = dlgs[n.dialogueKey];
    console.log(`    ${n.id} (${n.name}): dlgKey=${n.dialogueKey}, found=${!!d}, questStatus=${n.questStatus}`);
  }
}

console.log('\n=== 全图 NPC 感叹号与空话检查 ===');
for (let mId in maps) {
  const m = maps[mId];
  for (let n of m.npcs || []) {
    const d = dlgs[n.dialogueKey];
    const stepsLen = d && d.steps ? d.steps.length : 0;
    const hasOpts = d && d.steps && d.steps.some(s => s.options && s.options.length > 0);
    // 判断该 NPC 是否在某阶段被给了感叹号
    const givesExclaimInAnyPhase = ['heaven_prologue', 'liujiacun_start', 'liujiacun_hunted', 'changan_met_monk', 'wuxingshan_ready', 'wuxing_freed', 'yingchou_cleared'].some(phase => {
      app.storyPhase = phase;
      app.interactedNpcSet = new Set();
      // 模拟 shouldShowQuestExclamation
      if (n.id === 'npc_guanyin_pusa' || n.id === 'npc_guanyin' || n.questStatus === 'available') return true;
      if (phase === 'heaven_prologue' && (n.id === 'npc_taibai' || n.id === 'npc_litianwang' || n.id === 'npc_wukong_heaven')) return true;
      if (phase === 'liujiacun_start' && n.id === 'npc_liuboqin') return true;
      if (phase === 'liujiacun_hunted' && (n.id === 'npc_liuboqin' || n.id === 'npc_liujia_tudi')) return true;
      if (phase === 'changan_met_monk' && (n.id === 'npc_xuanzang' || n.id === 'npc_guanyin')) return true;
      if (phase === 'wuxingshan_ready' && (n.id === 'npc_wukong_sealed' || n.id === 'npc_mountain_god')) return true;
      if (mId === 'tiangong_pantao' && n.id === 'npc_pantao_tudi') return true;
      return false;
    });

    if (givesExclaimInAnyPhase && (!d || (!hasOpts && stepsLen <= 1))) {
      console.log(`  [空话却带感叹号的NPC!] 地图:${mId}, NPC:${n.id}(${n.name}), dlgKey:${n.dialogueKey}, text:${d ? d.steps[0].text : '无'}`);
    }
  }
}
