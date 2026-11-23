// Builds index.html from src/shell.html + src/game/*.js (in file-name order).
// The game stays one self-contained page (works from file:// and as an artifact); the source is split by topic.
//   node tools/build.mjs          write index.html
//   node tools/build.mjs --check  fail if index.html is out of date with src/
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const shell = readFileSync(join(root, 'src/shell.html'), 'utf8');
const dir = join(root, 'src/game');
const parts = readdirSync(dir).filter(f => f.endsWith('.js')).sort().map(f => readFileSync(join(dir, f), 'utf8').replace(/\n$/, ''));
if (!shell.includes('/*@@GAME@@*/')) throw new Error('src/shell.html has no /*@@GAME@@*/ placeholder');
const out = shell.replace('/*@@GAME@@*/', () => parts.join('\n'));
const target = join(root, 'index.html');

if (process.argv.includes('--check')) {
  const cur = readFileSync(target, 'utf8');
  if (cur !== out) { console.error('index.html is out of date: run `npm run build`'); process.exit(1); }
  console.log('index.html is up to date');
} else {
  writeFileSync(target, out);
  console.log(`index.html built from ${parts.length} source files`);
}
