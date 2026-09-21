const fs = require('fs');
global.window = {};
require('../js/data/maps2d.js');
console.log('Map IDs:', Object.keys(global.window.GAME_DATA.MAPS_2D));
for (const [id, m] of Object.entries(global.window.GAME_DATA.MAPS_2D)) {
  console.log(`\nMap: ${id} (${m.name})`);
  if (m.npcs && m.npcs.length > 0) {
    console.log('  NPCs:', m.npcs.map(n => `${n.name} (id:${n.id}, app:${n.appearance})`).join(', '));
  }
  if (m.monsters && m.monsters.length > 0) {
    console.log('  Monsters:', m.monsters.map(n => `${n.name} (id:${n.id}, app:${n.appearance})`).join(', '));
  }
}
