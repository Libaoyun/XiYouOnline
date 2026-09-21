const fs = require('fs');

const globalWindow = {
  GAME_DATA: {}
};
global.window = globalWindow;

const mapsContent = fs.readFileSync('js/data/maps2d.js', 'utf8');
eval(mapsContent);

const MAPS = window.GAME_DATA.MAPS_2D;
console.log('Total maps:', Object.keys(MAPS).length);

const targetMaps = [
  'tiangong_palace', 'tiangong_pantao', 'huaguoshan', 'huaguoshan_shuilien',
  'liujiacun', 'wuxingshan', 'changan_city', 'chentangguan', 'donghai_coast', 'longgong_palace'
];

targetMaps.forEach(id => {
  const m = MAPS[id];
  if (!m) { console.log(id, 'MISSING'); return; }
  console.log(`=== [${id}] ${m.name} (${m.width}x${m.height}) ===`);
  console.log('  Portals:', m.portals.map(p => `${p.name || 'Portal'} -> ${p.targetMap} (${p.x},${p.y})`));
  console.log('  NPCs:', m.npcs.map(n => `${n.id}: ${n.name} [${n.dialogueKey || 'no-key'}] (${n.x},${n.y})`));
  console.log('  Monsters:', m.monsters.map(x => `${x.id}: ${x.name} (${x.x},${x.y})`));
});
