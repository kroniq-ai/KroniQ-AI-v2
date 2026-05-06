const fs = require('fs');
const path = require('path');
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.tsx')) {
      const content = fs.readFileSync(p, 'utf8');
      if (content.includes('.cmo')) {
        const lines = content.split('\n');
        lines.forEach((l, i) => {
          if (l.includes('.cmo')) console.log(`${p}:${i+1}: ${l.trim()}`);
        });
      }
    }
  });
}
walk(path.resolve('..', '..', 'VOYD MVP', '.next', 'static'));
walk(path.resolve('..', '..', 'VOYD MVP', '.next', 'server'));
