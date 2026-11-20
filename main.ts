// LEONIDA NIGHTS — the hand-in program for the GTA 6 trophy guide.
// Node 22, standard library only. It takes this repository's app/ folder
// (the offline guide: plain HTML, CSS, ES modules and the trophy data) and
// screenshots/ (four real renders of the guide in a browser) and copies both
// into the output directory, then writes dossier.json there with the kit's
// vendored library. The dossier is the summary the judge reads: the
// screenshots, the first load's files and bytes, and the guide's source.
//
// vendor/makefun-frontend.ts is the kit's own copy and must stay untouched:
// the scorer rebuilds the dossier with its own copy and compares the two
// byte for byte.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader's container MAKEFUN_OUTPUT_DIR is unset and /output is used.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the folder this file lives in; the output folder
// comes from the environment, defaulting to the grader's /output.
const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Caps mirror the scorer's own: at most 4 screenshots of at most 256 KiB
// each, at most 993 files and directories in app/ totalling at most 48 MiB,
// and the dossier text capped at 160 KiB. An entry past those limits is
// refused here with the library's own words, before the scorer sees it.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
