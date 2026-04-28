import fs from 'fs';
import path from 'path';

function moveRecursive(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    for (const child of fs.readdirSync(src)) {
      moveRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.renameSync(src, dest);
  }
}

const root = process.cwd();
const temp = path.join(root, 'temp');

// Files to remove from root before moving
const toDelete = ['src', 'vite.config.ts', 'index.html', 'package.json'];
for (const f of toDelete) {
  const p = path.join(root, f);
  if (fs.existsSync(p)) {
    if (fs.statSync(p).isDirectory()) {
      fs.rmSync(p, { recursive: true, force: true });
    } else {
      fs.unlinkSync(p);
    }
  }
}

// Move from temp
for (const f of fs.readdirSync(temp)) {
  if (f === 'migrate-pnpm.mjs') continue;
  fs.renameSync(path.join(temp, f), path.join(root, f));
}

// Clean up temp
fs.rmSync(temp, { recursive: true, force: true });
console.log("Moved files to root and cleaned up");
