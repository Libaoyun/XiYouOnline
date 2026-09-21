const fs = require('fs');
const lines = fs.readFileSync('js/data/maps2d.js', 'utf8').split('\n');
const targets = [
  '"huaguoshan":',
  '"huaguoshan_shuilien":',
  '"liujiacun":',
  '"wuxingshan":',
  '"changan_city":',
  '"chentangguan":',
  '"donghai_coast":',
  '"longgong_palace":'
];

lines.forEach((line, idx) => {
  targets.forEach(t => {
    if (line.includes(t)) {
      console.log(t, idx + 1);
    }
  });
});
