/*
  HP乙游模拟器后端（无数据库依赖版）
  - 直接运行：node backend/server.js
  - 打开：http://localhost:3000
  - 负责：托管前端、保存玩家存档、提供 database 文件、避免浏览器本地存储容量限制导致丢档。
*/
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3000);
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data');
const USERS_DIR = path.join(DATA_DIR, 'users');
const MAX_BODY_BYTES = 80 * 1024 * 1024; // 80MB，足够保存较长剧情与压缩图片。需要更大可改这里。

fs.mkdirSync(USERS_DIR, { recursive: true });

function send(res, status, data, headers = {}) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': typeof data === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...headers
  });
  res.end(body);
}

function safeId(s) {
  return String(s || 'default').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || 'default';
}

function userDir(userId) {
  const dir = path.join(USERS_DIR, safeId(userId));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function savesPath(userId) {
  return path.join(userDir(userId), 'saves.json');
}

function readSaves(userId) {
  const p = savesPath(userId);
  if (!fs.existsSync(p)) return [null, null, null, null];
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    return Array.isArray(data) ? [0,1,2,3].map(i => data[i] || null) : [null, null, null, null];
  } catch {
    return [null, null, null, null];
  }
}

function writeSaves(userId, saves) {
  fs.writeFileSync(savesPath(userId), JSON.stringify(saves, null, 2), 'utf8');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('REQUEST_TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch { reject(new Error('INVALID_JSON')); }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.resolve(ROOT, '.' + pathname);
  if (!filePath.startsWith(ROOT)) return send(res, 403, 'Forbidden');
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return send(res, 404, 'Not found');
  const ext = path.extname(filePath).toLowerCase();
  const type = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml; charset=utf-8'
  }[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'OPTIONS') return send(res, 204, '');

  try {
    if (url.pathname === '/api/health') {
      return send(res, 200, { ok: true, name: 'HP乙游模拟器后端', time: new Date().toISOString() });
    }

    const saveListMatch = url.pathname.match(/^\/api\/users\/([^/]+)\/saves$/);
    if (saveListMatch && req.method === 'GET') {
      const userId = safeId(saveListMatch[1]);
      return send(res, 200, { ok: true, saves: readSaves(userId) });
    }

    const saveSlotMatch = url.pathname.match(/^\/api\/users\/([^/]+)\/saves\/(\d+)$/);
    if (saveSlotMatch) {
      const userId = safeId(saveSlotMatch[1]);
      const slot = Number(saveSlotMatch[2]);
      if (slot < 0 || slot > 3) return send(res, 400, { ok: false, error: 'BAD_SLOT' });
      const saves = readSaves(userId);

      if (req.method === 'PUT') {
        const body = await readBody(req);
        saves[slot] = {
          id: body.id || crypto.randomUUID(),
          realTime: body.realTime || new Date().toLocaleString(),
          state: body.state || null,
          meta: body.meta || {}
        };
        writeSaves(userId, saves);
        return send(res, 200, { ok: true, slot, save: saves[slot] });
      }

      if (req.method === 'DELETE') {
        saves[slot] = null;
        writeSaves(userId, saves);
        return send(res, 200, { ok: true, slot });
      }
    }

    const dbMatch = url.pathname.match(/^\/api\/database\/(.+)$/);
    if (dbMatch && req.method === 'GET') {
      const file = dbMatch[1].replace(/\.\./g, '').replace(/[^a-zA-Z0-9_\-.\/]/g, '');
      const dbPath = path.resolve(ROOT, 'database', file);
      if (!dbPath.startsWith(path.resolve(ROOT, 'database'))) return send(res, 403, { ok: false });
      if (!fs.existsSync(dbPath)) return send(res, 404, { ok: false, error: 'NOT_FOUND' });
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      return fs.createReadStream(dbPath).pipe(res);
    }

    return serveStatic(req, res, url);
  } catch (err) {
    if (err.message === 'REQUEST_TOO_LARGE') return send(res, 413, { ok: false, error: 'REQUEST_TOO_LARGE', message: '存档过大，请压缩图片或减少超大数据。' });
    if (err.message === 'INVALID_JSON') return send(res, 400, { ok: false, error: 'INVALID_JSON' });
    console.error(err);
    return send(res, 500, { ok: false, error: 'SERVER_ERROR', message: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`HP乙游模拟器后端已启动：http://localhost:${PORT}`);
  console.log(`玩家存档目录：${USERS_DIR}`);
});
