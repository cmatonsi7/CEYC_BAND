// Serves dist/ under /<base>/ exactly like GitHub Pages does, and logs 404s.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const [,, dir = 'dist', base = '/ceyc-music-library/', port = 4173] = process.argv;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
export const misses = [];
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  let p = decodeURIComponent(url.pathname);
  if (!p.startsWith(base)) { misses.push(p); console.log('404', p); res.writeHead(404); return res.end('Not found'); }
  p = p.slice(base.length);
  if (p === '' || p.endsWith('/')) p += 'index.html';
  const file = path.join(dir, p);
  try {
    await stat(file);
    res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  } catch { console.log('404', url.pathname); res.writeHead(404); res.end('Not found'); }
}).listen(Number(port), () => console.log('listening', port));
