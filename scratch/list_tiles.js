const fs = require('fs');
const content = fs.readFileSync('js/engine/tilemap.js', 'utf8');
const cases = content.match(/case '([a-zA-Z0-9_]+)':/g) || [];
console.log('Supported Tiles:', cases.map(c => c.replace("case '", "").replace("':", "")));
