global.window = {};
require('../js/data/maps2d.js');
const targets = ['tiangong_pantao', 'tiangong_lingxiao', 'liujiacun', 'wuxingshan', 'gaolaozhuang'];
for (const id of targets) {
  const m = global.window.GAME_DATA.MAPS_2D[id];
  if (!m) continue;
  console.log(`\nMap: ${id} (${m.name})`);
  if (m.npcs) console.log('  NPCs:', m.npcs.map(n => `${n.name} (id:${n.id}, app:${n.appearance})`).join(', '));
  if (m.monsters) console.log('  Monsters:', m.monsters.map(n => `${n.name} (id:${n.id}, app:${n.appearance})`).join(', '));
}
