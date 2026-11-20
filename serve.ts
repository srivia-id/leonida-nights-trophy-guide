// LEONIDA NIGHTS — a tiny static server for the guide's app/ folder, so the
// guide can be tried locally with no build step: `node serve.ts` serves app/ on
// http://localhost:8080 (or `--port <n>` for another port). Standard library
// only. It sends the MIME types a browser needs, refuses any path that escapes
// app/, logs each request's status, and otherwise does nothing clever: this is
// a development convenience, not a web server for the internet.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('./app', import.meta.url)));

const args = process.argv.slice(2);
const portFlag = args.indexOf('--port');
const wanted = portFlag === -1 ? 8080 : Number(args[portFlag + 1]);
const port = Number.isInteger(wanted) && wanted > 0 && wanted < 65536 ? wanted : 8080;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function resolveInsideApp(pathname: string): string | null {
  const cleaned = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
  const file = resolve(join(appRoot, normalize(cleaned)));
  if (file !== appRoot && !file.startsWith(appRoot + sep)) return null;
  return file;
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  let pathname: string;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end('bad request');
    console.log('400', request.url);
    return;
  }
  const file = resolveInsideApp(pathname);
  if (file === null) {
    response.writeHead(403).end('forbidden');
    console.log('403', request.url);
    return;
  }
  let size: number;
  try {
    const stats = statSync(file);
    if (!stats.isFile()) throw new Error('not a file');
    size = stats.size;
  } catch {
    response.writeHead(404).end('not found');
    console.log('404', request.url);
    return;
  }
  response.writeHead(200, {
    'content-type': MIME_TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'content-length': size,
    'cache-control': 'no-store',
  });
  // A HEAD request gets the headers only, no body.
  if (request.method === 'HEAD') {
    response.end();
    console.log('200', request.url);
    return;
  }
  createReadStream(file).pipe(response);
  console.log('200', request.url);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`LEONIDA NIGHTS app/ is on http://localhost:${port}`);
});
