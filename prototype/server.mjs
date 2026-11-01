import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.argv[2] || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const previewRunId = randomUUID();

createServer(async (request, response) => {
  try {
    const requested = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
    // A fresh local-server visit always begins on the sign-in screen.
    const file = resolve(root, requested === '/' ? 'login.html' : requested.slice(1));
    if (relative(root, file).startsWith('..')) throw new Error('Outside site');
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-PEL-Preview-Run': previewRunId });
    response.end(body);
  } catch {
    if (response.headersSent || response.writableEnded) return;
    try {
      const body = await readFile(resolve(root, '404.html'));
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-PEL-Preview-Run': previewRunId });
      response.end(body);
    } catch { response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); response.end('Page not found'); }
  }
}).listen(port, '127.0.0.1', () => console.log(`PEL preview: http://localhost:${port}/`));
