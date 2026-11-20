import { createReadStream, realpathSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = realpathSync(fileURLToPath(new URL('./app/', import.meta.url)));
const flag = process.argv.indexOf('--port');
const port = flag < 0 ? 8080 : Number(process.argv[flag + 1]);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Choose a port from 1 to 65535.');
const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};
createServer((request, response) => {
  let path: string;
  try {
    path = decodeURIComponent((request.url ?? '/').split('?')[0]);
  } catch {
    response.writeHead(400).end('Invalid path');
    return;
  }
  const candidate = resolve(root, '.' + (path.endsWith('/') ? path + 'index.html' : path));
  if (!candidate.startsWith(root + sep)) {
    response.writeHead(403).end('Outside app directory');
    return;
  }
  try {
    const file = realpathSync(candidate);
    if (!file.startsWith(root + sep)) {
      response.writeHead(403).end('Outside app directory');
      return;
    }
    const stats = statSync(file);
    if (!stats.isFile()) throw new Error('Expected a file');
    response.writeHead(200, {
      'Content-Type': mime[extname(file)] ?? 'application/octet-stream',
      'Content-Length': stats.size,
      'Cache-Control': 'no-store',
    });
    if (request.method === 'HEAD') response.end();
    else createReadStream(file).on('error', () => response.destroy()).pipe(response);
  } catch {
    response.writeHead(404).end('File unavailable');
  }
}).listen(port, '127.0.0.1', () => console.log('Vice Royale Studio · http://localhost:' + port));
