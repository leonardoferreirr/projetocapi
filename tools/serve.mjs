// Servidor local com gzip e URLs limpas, parecido com a Vercel (para medir Lighthouse sem distorção)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const port = +(process.argv[2] || 4310);
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json', '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.vtt': 'text/vtt' };
http.createServer((req, res) => {
  let u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(root, u);
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f = f + '.html';
  if (!fs.existsSync(f)) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('404'); }
  const ext = path.extname(f), tipo = tipos[ext] || 'application/octet-stream';
  const h = { 'content-type': tipo, 'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=3600', connection: 'keep-alive' };
  const comprime = /text|javascript|svg|json/.test(tipo) && /gzip/.test(req.headers['accept-encoding'] || '');
  if (ext === '.mp4' && req.headers.range) {
    const st = fs.statSync(f), [a, b] = req.headers.range.replace('bytes=', '').split('-');
    const ini = +a, fim = b ? +b : st.size - 1;
    res.writeHead(206, { ...h, 'content-range': `bytes ${ini}-${fim}/${st.size}`, 'accept-ranges': 'bytes', 'content-length': fim - ini + 1 });
    return fs.createReadStream(f, { start: ini, end: fim }).pipe(res);
  }
  if (comprime) { res.writeHead(200, { ...h, 'content-encoding': 'gzip' }); fs.createReadStream(f).pipe(zlib.createGzip()).pipe(res); }
  else { res.writeHead(200, h); fs.createReadStream(f).pipe(res); }
}).listen(port, () => console.log('projetocapi em http://localhost:' + port));
