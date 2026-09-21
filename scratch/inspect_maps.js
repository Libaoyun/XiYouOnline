global.window = {};
require('../js/data/maps2d.js');
function inspectMap(mapId) {
  const m = global.window.GAME_DATA.MAPS_2D[mapId];
  if (!m) return console.log('not found', mapId);
  console.log(`\nMap: ${mapId} (${m.name}), Size: ${m.width}x${m.height}`);
  const counts = {};
  for (const row of m.tiles) {
    for (const t of row) {
      counts[t] = (counts[t] || 0) + 1;
    }
  }
  console.log('Tile counts:', counts);
}
inspectMap('liujiacun');
inspectMap('gaolaozhuang');
inspectMap('wuxingshan');
inspectMap('huaguoshan');
inspectMap('huaguoshan_shuilien');
