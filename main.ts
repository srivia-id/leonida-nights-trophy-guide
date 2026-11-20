// LEONIDA NIGHTS hands in the guide: this program copies app/ and screenshots/
// from beside this file into /output (or MAKEFUN_OUTPUT_DIR outside the grader)
// and writes /output/dossier.json with the vendored make.fun library, exactly as
// the scorer rebuilds it. Node 22, standard library only, no network, no installs.
// Run it with: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The guide itself: plain static files under app/, plus the four screenshots.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The dossier is the summary the judge reads: screenshots, first-load files and
// bytes, and the source. The caps mirror the scorer's own (see the kit's RULES):
// 4 screenshots at most, each at most 256 KiB; app/ at most 993 files and 48 MiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
