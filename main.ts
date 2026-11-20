// LEONIDA NIGHTS — hand-in program for the GTA VI trophy guide (gta6-trophy-guide-01).
// Node 22, standard library only. It copies this repository's app/ and screenshots/
// into the output directory and writes /output/dossier.json with the vendored
// make.fun library (vendor/makefun-frontend.ts, left exactly as the kit ships it).
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The guide itself is plain static files under app/ (no build step, no network at
// runtime); the dossier is the summary the judge reads: our screenshots, the first
// load's files and bytes, and our source.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

// The entry is not handable-in without its guide and its screenshots.
if (!existsSync(join(appDir, 'index.html'))) fail('app/index.html is missing');
if (!existsSync(shotsDir)) fail('screenshots/ is missing');
const shots = readdirSync(shotsDir).filter((name) => {
  const file = join(shotsDir, name);
  return statSync(file).isFile() && !name.startsWith('.');
});
if (shots.length < 3 || shots.length > 4) {
  fail(`screenshots/ must hold 3 or 4 images, found ${shots.length}`);
}
// Each screenshot must be a whole JPEG or PNG inside the gate's size cap, so a
// bad render fails loudly here instead of in the scorer's dossier_matches row.
const imageBytes = { '.jpg': true, '.jpeg': true, '.png': true };
for (const name of shots) {
  const file = join(shotsDir, name);
  const lower = name.toLowerCase();
  const ext = lower.slice(lower.lastIndexOf('.'));
  if (!imageBytes[ext]) fail(`screenshots/${name} is not a JPEG or PNG`);
  const bytes = statSync(file).size;
  if (bytes > 262144) fail(`screenshots/${name} is ${bytes} bytes, over the 256 KiB cap`);
  if (bytes === 0) fail(`screenshots/${name} is empty`);
}

// Start from a clean output directory so a stale file from an earlier run can
// never leak into the dossier, and so both grader runs write the same bytes.
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(appDir, join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in app/
// or 48 MiB of app files: app/ counts beside /output's own 1000-entry cap,
// its screenshots/ and dossier.json).
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
const dossierBytes = Buffer.byteLength(dossier, 'utf8');
if (dossierBytes > 1572864) fail(`dossier.json is ${dossierBytes} bytes, over the 1.5 MiB cap`);
writeFileSync(join(out, 'dossier.json'), dossier);

console.log(`wrote ${join(out, 'dossier.json')} (${dossierBytes} bytes) from ${shots.length} screenshots`);
