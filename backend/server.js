/*
  HP乙游模拟器后端（Supabase 持久存档版）
  - 直接运行：node backend/server.js
  - 打开：http://localhost:3000
  - 有 SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY 时：存档写入 Supabase 数据库，重新部署也不会丢。
  - 没有 Supabase 环境变量时：自动回退到本地文件存档，方便本地测试。
*/
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3000);
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data');
const USERS_DIR = path.join(DATA_DIR, 'users');
const MAX_BODY_BYTES = 80 * 1024 * 1024;

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '');
const USE_SUPABASE = !!(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

fs.mkdirSync(USERS_DIR, { recursive: true });

function send(res, status, data, headers = {}) {
  const isText = typeof data === 'string';
  const body = isText ? data : JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': isText ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
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

function normalizeSlots(list) {
  const out = [null, null, null, null];
  if (!Array.isArray(list)) return out;
  for (const item of list) {
    const slotRaw = item?.slot_id ?? item?.slot ?? item?.id;
    const slot = Number(slotRaw);
    if (slot >= 0 && slot <= 3) {
      const data = item?.save_data || item?.data || item;
      out[slot] = data || null;
    }
  }
  return out;
}

function readLocalSaves(userId) {
  const p = savesPath(userId);
  if (!fs.existsSync(p)) return [null, null, null, null];
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    return Array.isArray(data) ? [0,1,2,3].map(i => data[i] || null) : [null, null, null, null];
  } catch {
    return [null, null, null, null];
  }
}

function writeLocalSaves(userId, saves) {
  fs.writeFileSync(savesPath(userId), JSON.stringify(saves, null, 2), 'utf8');
}

async function supabaseRequest(method, endpoint, body) {
  if (!USE_SUPABASE) throw new Error('SUPABASE_NOT_CONFIGURED');
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const res = await fetch(url, {
    method,
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = typeof data === 'object' && data ? (data.message || data.error || data.details || JSON.stringify(data)) : String(data || res.statusText);
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function readSaves(userId) {
  if (USE_SUPABASE) {
    const uid = encodeURIComponent(userId);
    const rows = await supabaseRequest('GET', `player_saves?user_id=eq.${uid}&select=slot_id,save_data,updated_at&order=slot_id.asc`);
    return normalizeSlots(rows);
  }
  return readLocalSaves(userId);
}

async function writeSave(userId, slot, save) {
  if (USE_SUPABASE) {
    const record = {
      user_id: userId,
      slot_id: String(slot),
      save_name: save?.meta?.playerName || save?.state?.player?.name || `slot_${slot}`,
      save_data: save,
      updated_at: new Date().toISOString()
    };
    return supabaseRequest('POST', 'player_saves?on_conflict=user_id,slot_id', record);
  }
  const saves = readLocalSaves(userId);
  saves[slot] = save;
  writeLocalSaves(userId, saves);
  return save;
}

async function deleteSave(userId, slot) {
  if (USE_SUPABASE) {
    const uid = encodeURIComponent(userId);
    const sid = encodeURIComponent(String(slot));
    await supabaseRequest('DELETE', `player_saves?user_id=eq.${uid}&slot_id=eq.${sid}`);
    return true;
  }
  const saves = readLocalSaves(userId);
  saves[slot] = null;
  writeLocalSaves(userId, saves);
  return true;
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
      return send(res, 200, {
        ok: true,
        name: 'HP乙游模拟器后端',
        storage: USE_SUPABASE ? 'supabase' : 'local-file-fallback',
        time: new Date().toISOString()
      });
    }

    const saveListMatch = url.pathname.match(/^\/api\/users\/([^/]+)\/saves$/);
    if (saveListMatch && req.method === 'GET') {
      const userId = safeId(saveListMatch[1]);
      return send(res, 200, { ok: true, storage: USE_SUPABASE ? 'supabase' : 'local-file-fallback', saves: await readSaves(userId) });
    }

    const saveSlotMatch = url.pathname.match(/^\/api\/users\/([^/]+)\/saves\/(\d+)$/);
    if (saveSlotMatch) {
      const userId = safeId(saveSlotMatch[1]);
      const slot = Number(saveSlotMatch[2]);
      if (slot < 0 || slot > 3) return send(res, 400, { ok: false, error: 'BAD_SLOT' });

      if (req.method === 'PUT') {
        const body = await readBody(req);
        const save = {
          id: body.id || crypto.randomUUID(),
          realTime: body.realTime || new Date().toLocaleString(),
          state: body.state || null,
          meta: body.meta || {}
        };
        await writeSave(userId, slot, save);
        return send(res, 200, { ok: true, storage: USE_SUPABASE ? 'supabase' : 'local-file-fallback', slot, save });
      }

      if (req.method === 'DELETE') {
        await deleteSave(userId, slot);
        return send(res, 200, { ok: true, storage: USE_SUPABASE ? 'supabase' : 'local-file-fallback', slot });
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
    if (err.status === 404 || /relation .*player_saves.* does not exist/i.test(err.message)) {
      return send(res, 500, { ok: false, error: 'SUPABASE_TABLE_MISSING', message: 'Supabase 中还没有 player_saves 表，请先运行 README_SUPABASE.md 里的 SQL。' });
    }
    console.error(err);
    return send(res, 500, { ok: false, error: USE_SUPABASE ? 'SUPABASE_SAVE_ERROR' : 'SERVER_ERROR', message: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`HP乙游模拟器后端已启动：http://localhost:${PORT}`);
  console.log(`当前存档模式：${USE_SUPABASE ? 'Supabase 数据库' : '本地文件兜底'}`);
  if (!USE_SUPABASE) console.log(`本地玩家存档目录：${USERS_DIR}`);
});
