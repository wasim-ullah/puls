// Test double for Supabase: proxies /rest/v1 to a local PostgREST, fakes /auth/v1
// (magic links are written to links.log) and /storage/v1 (files kept in ./files).
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const SECRET = 'super-secret-jwt-token-with-at-least-32-characters-long';
const PORT = 54321;
const REST = 'http://127.0.0.1:3001';
const FILES = path.resolve('files');
const db = new pg.Pool({ host: '/tmp/pgtest', port: 5499, user: 'postgres', database: 'puls_e2e' });

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
export function sign(payload) {
  const h = b64({ alg: 'HS256', typ: 'JWT' });
  const p = b64(payload);
  const s = crypto.createHmac('sha256', SECRET).update(`${h}.${p}`).digest('base64url');
  return `${h}.${p}.${s}`;
}
function verify(token) {
  const [h, p, s] = (token || '').split('.');
  if (!s) return null;
  const want = crypto.createHmac('sha256', SECRET).update(`${h}.${p}`).digest('base64url');
  if (want !== s) return null;
  return JSON.parse(Buffer.from(p, 'base64url').toString());
}
const users = new Map(); // id -> {id,email,user_metadata}
const refresh = new Map(); // refresh token -> user id

function session(user) {
  const now = Math.floor(Date.now() / 1000);
  const access_token = sign({ sub: user.id, role: 'authenticated', aud: 'authenticated', email: user.email, exp: now + 3600, iat: now });
  const refresh_token = crypto.randomBytes(16).toString('hex');
  refresh.set(refresh_token, user.id);
  return { access_token, refresh_token, token_type: 'bearer', expires_in: 3600, expires_at: now + 3600, user: userJson(user) };
}
function userJson(u) {
  return { id: u.id, aud: 'authenticated', role: 'authenticated', email: u.email, user_metadata: u.user_metadata,
    app_metadata: { provider: 'email' }, created_at: new Date().toISOString() };
}
const body = (req) => new Promise((resolve) => { const c = []; req.on('data', (d) => c.push(d)); req.on('end', () => resolve(Buffer.concat(c))); });
const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'access-control-expose-headers': 'content-range, content-profile, x-supabase-api-version',
};
function json(res, code, obj) { res.writeHead(code, { ...cors, 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); }

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
  try {
    // ── REST → PostgREST
    if (url.pathname.startsWith('/rest/v1')) {
      const target = REST + url.pathname.replace('/rest/v1', '') + url.search;
      const headers = { ...req.headers }; delete headers.host; delete headers['content-length'];
      const auth = (headers.authorization || '').replace(/^Bearer /, '');
      if (!verify(auth)) headers.authorization = `Bearer ${sign({ role: 'anon' })}`;
      const payload = ['GET', 'HEAD'].includes(req.method) ? undefined : await body(req);
      const r = await fetch(target, { method: req.method, headers, body: payload });
      const out = Buffer.from(await r.arrayBuffer());
      const h = { ...cors };
      r.headers.forEach((v, k) => { if (!['content-encoding', 'transfer-encoding', 'connection'].includes(k)) h[k] = v; });
      res.writeHead(r.status, h); return res.end(out);
    }
    // ── Auth
    if (url.pathname === '/auth/v1/otp' && req.method === 'POST') {
      const b = JSON.parse((await body(req)).toString());
      const email = b.email.toLowerCase();
      let u = [...users.values()].find((x) => x.email === email);
      if (!u) {
        const { rows } = await db.query('select id from auth.users where email = $1', [email]);
        const id = rows[0]?.id ?? crypto.randomUUID();
        u = { id, email, user_metadata: b.data || {} };
        if (!rows[0]) await db.query('insert into auth.users (id, email, raw_user_meta_data) values ($1,$2,$3)', [id, email, JSON.stringify(b.data || {})]);
        users.set(id, u);
      }
      const s = session(u);
      const redirect = url.searchParams.get('redirect_to') || b.redirect_to || 'http://localhost:4173/';
      const link = `${redirect}#access_token=${s.access_token}&refresh_token=${s.refresh_token}&expires_in=3600&expires_at=${s.expires_at}&token_type=bearer&type=magiclink`;
      fs.appendFileSync('links.log', `${email} ${link}\n`);
      return json(res, 200, {});
    }
    if (url.pathname === '/auth/v1/user') {
      const p = verify((req.headers.authorization || '').replace(/^Bearer /, ''));
      const u = p && users.get(p.sub);
      return u ? json(res, 200, userJson(u)) : json(res, 401, { msg: 'invalid' });
    }
    if (url.pathname === '/auth/v1/token') {
      const b = JSON.parse((await body(req)).toString());
      const id = refresh.get(b.refresh_token);
      return id ? json(res, 200, session(users.get(id))) : json(res, 400, { error: 'invalid_grant' });
    }
    if (url.pathname === '/auth/v1/logout') { res.writeHead(204, cors); return res.end(); }
    // ── Storage
    const pub = url.pathname.match(/^\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (pub && req.method === 'GET') {
      const f = path.join(FILES, pub[1], decodeURIComponent(pub[2]));
      if (!f.startsWith(FILES) || !fs.existsSync(f)) return json(res, 404, { error: 'not found' });
      res.writeHead(200, { ...cors, 'content-type': fs.readFileSync(f + '.type', 'utf8') }); return res.end(fs.readFileSync(f));
    }
    const up = url.pathname.match(/^\/storage\/v1\/object\/([^/]+)\/(.+)$/);
    if (up && req.method === 'POST') {
      const p = verify((req.headers.authorization || '').replace(/^Bearer /, ''));
      const key = decodeURIComponent(up[2]);
      if (!p?.sub || key.split('/')[0] !== p.sub) return json(res, 403, { statusCode: '403', error: 'Unauthorized', message: 'new row violates row-level security policy' });
      const f = path.join(FILES, up[1], key);
      fs.mkdirSync(path.dirname(f), { recursive: true });
      let data = await body(req); let type = req.headers['content-type'] || 'application/octet-stream';
      if (type.startsWith('multipart/form-data')) {
        const form = await new Request('http://x', { method: 'POST', headers: { 'content-type': type }, body: data }).formData();
        const file = [...form.values()].find((v) => typeof v !== 'string');
        data = Buffer.from(await file.arrayBuffer()); type = file.type;
      }
      fs.writeFileSync(f, data); fs.writeFileSync(f + '.type', type);
      return json(res, 200, { Key: `${up[1]}/${key}`, Id: crypto.randomUUID() });
    }
    const del = url.pathname.match(/^\/storage\/v1\/object\/([^/]+)$/);
    if (del && req.method === 'DELETE') {
      const p = verify((req.headers.authorization || '').replace(/^Bearer /, ''));
      const b = JSON.parse((await body(req)).toString());
      const done = [];
      for (const k of b.prefixes || []) {
        if (k.split('/')[0] !== p?.sub) continue;
        const f = path.join(FILES, del[1], k);
        if (fs.existsSync(f)) { fs.rmSync(f); fs.rmSync(f + '.type', { force: true }); done.push({ name: k }); }
      }
      fs.appendFileSync('deletes.log', done.map((d) => d.name).join('\n') + '\n');
      return json(res, 200, done);
    }
    json(res, 404, { error: `not faked: ${req.method} ${url.pathname}` });
  } catch (e) {
    console.error(e); json(res, 500, { error: String(e) });
  }
});

if (process.argv[2] === 'anon-key') { console.log(sign({ role: 'anon', iss: 'test' })); process.exit(0); }
server.listen(PORT, () => console.log(`fake supabase on ${PORT}`));
