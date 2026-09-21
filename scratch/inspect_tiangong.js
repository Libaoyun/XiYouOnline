const fs = require('fs');
window = global;
require('../js/data/maps2d.js');
require('../js/data/storyQuests.js');
require('../js/data/classes.js');
require('../js/core/player.js');
require('../js/core/petSystem.js');
require('../js/core/inventory.js');
require('../js/core/peachGarden.js');
require('../js/engine/character.js');
require('../js/engine/tilemap.js');
require('../js/app2d.js');

const app = window.App2D;
const maps = window.GAME_DATA.MAPS_2D;
const dlgs = window.GAME_DATA.STORY_DIALOGUES;

console.log('--- 检查天宫所有 NPC 与对话 ---');
for (let mId of ['tiangong_palace', 'tiangong_pantao', 'tiangong_yuma']) {
  const map = maps[mId];
  console.log(`地图 ${mId} (${map.name}):`);
  for (let n of map.npcs || []) {
    console.log(`  NPC: ${n.id} (${n.name}) -> dlgKey: ${n.dialogueKey}, hasDlg: ${!!dlgs[n.dialogueKey]}`);
  }
}
