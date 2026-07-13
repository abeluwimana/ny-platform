const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'src');
const exts = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.json']);

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!exts.has(path.extname(entry.name).toLowerCase())) continue;
    const text = fs.readFileSync(fullPath, 'utf8');
    const cleaned = text.replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF\uFE0F\u200D]/gu, '');
    if (cleaned !== text) {
      fs.writeFileSync(fullPath, cleaned, 'utf8');
      console.log('cleaned', path.relative(root, fullPath));
    }
  }
}

walk(root);
console.log('emoji cleanup complete');
