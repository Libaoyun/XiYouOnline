global.window = {};
require('../js/engine/tilemap.js');
require('../js/data/maps2d.js');
const te = new global.window.TilemapEngine(32);
const maps = global.window.GAME_DATA.MAPS_2D;

for (const [id, m] of Object.entries(maps)) {
  for (const n of (m.npcs || [])) {
    const col = Math.floor(n.x / 32);
    const row = Math.floor(n.y / 32);
    if (!te.isWalkable(m, col, row)) {
      console.log(`Map ${id}: NPC ${n.name} (${n.id}) at (${col}, ${row}) tile=${m.tiles[row]?.[col]} is NOT walkable!`);
    }
  }
  for (const mob of (m.monsters || [])) {
    const col = Math.floor(mob.x / 32);
    const row = Math.floor(mob.y / 32);
    if (!te.isWalkable(m, col, row)) {
      console.log(`Map ${id}: Monster ${mob.name} (${mob.id}) at (${col}, ${row}) tile=${m.tiles[row]?.[col]} is NOT walkable!`);
    }
  }
}
