import fs from 'fs';
import path from 'path';

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (full.endsWith('.tsx')) {
      let content = fs.readFileSync(full, 'utf8');
      if (content.includes('"use client"')) {
        content = content.replace(/"use client"(\n|\r)+/g, '');
        fs.writeFileSync(full, content);
      }
    }
  }
}

walk('artifacts/adem/src/components/ui');
