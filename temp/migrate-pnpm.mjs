import fs from 'fs';
import path from 'path';

const pnpmWorkspaceYaml = fs.readFileSync(path.join(process.cwd(), 'temp', 'pnpm-workspace.yaml'), 'utf8');

const catalogLines = pnpmWorkspaceYaml.split('\ncatalog:\n')[1].split('\n\n')[0].split('\n');
const catalog = {};
for (const line of catalogLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  
  let match = trimmed.match(/^['"]?([^'":]+)['"]?:\s*['"]?(.+?)['"]?$/);
  if (match) {
    catalog[match[1]] = match[2];
  }
}

console.log('Parsed Catalog:', catalog);

function replaceInPackageJson(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  for (const depType of ['dependencies', 'devDependencies', 'peerDependencies']) {
    if (content[depType]) {
      for (const [pkg, ver] of Object.entries(content[depType])) {
        if (ver === 'catalog:') {
          if (catalog[pkg]) {
            content[depType][pkg] = catalog[pkg];
          } else {
            console.warn(`Missing catalog entry for ${pkg} in ${filePath}`);
          }
        }
        if (ver.startsWith('workspace:')) {
          content[depType][pkg] = '*'; // npm generic workspace link
        }
      }
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
  console.log(`Updated ${filePath}`);
}

const globPatterns = [
  'temp/package.json',
  'temp/artifacts/adem/package.json',
  'temp/artifacts/api-server/package.json',
  'temp/artifacts/mockup-sandbox/package.json',
  'temp/lib/api-client-react/package.json',
  'temp/lib/api-spec/package.json',
  'temp/lib/api-zod/package.json',
  'temp/lib/db/package.json',
  'temp/scripts/package.json'
];

for (const p of globPatterns) {
  replaceInPackageJson(path.join(process.cwd(), p));
}

// Write a root package.json for npm workspaces
const rootPackageJson = {
  name: "root-workspace",
  private: true,
  workspaces: [
    "artifacts/*",
    "lib/*",
    "scripts"
  ],
  scripts: {
    "dev": "npm run dev --workspace=@workspace/adem",
    "build": "npm run build --workspaces --if-present",
    "start": "npm run start --workspace=@workspace/api-server"
  }
};

fs.writeFileSync(path.join(process.cwd(), 'temp', 'package.json'), JSON.stringify(rootPackageJson, null, 2));
console.log('Created workspace package.json');
