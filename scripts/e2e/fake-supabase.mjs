// A tiny stand-in for Supabase's REST API (PostgREST), backed by a real local
// Postgres running supabase/setup.sql, for end-to-end tests of band sharing.
// Usage: node scripts/e2e/fake-supabase.mjs <postgres-url> [port]
import http from 'node:http';
import pg from 'pg';

const [, , dbUrl = 'postgres://postgres@localhost:54329/band?host=/tmp', port = '54400'] = process.argv;
const pool = new pg.Pool({ connectionString: dbUrl });
const TABLES = new Set(['band_setlists', 'band_songs']);
const RPCS = new Set(['band_check_pin', 'band_save_setlist', 'band_delete_setlist', 'band_save_song', 'band_delete_song']);

function send(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'apikey, authorization, content-type, prefer',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
  });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

function isoDate(v) {
  if (!v) return v;
  if (v instanceof Date) return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`;
  return v;
}

http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204);
  const url = new URL(req.url, 'http://x');
  if (req.headers.apikey !== 'test-anon-key') return send(res, 401, { message: 'Invalid API key' });
  const client = await pool.connect();
  try {
    await client.query('set role anon');
    const m = url.pathname.match(/^\/rest\/v1\/(rpc\/)?([a-z_]+)$/);
    if (!m) return send(res, 404, { message: 'not found' });
    if (!m[1] && req.method === 'GET' && TABLES.has(m[2])) {
      const r = await client.query(`select * from public.${m[2]}`);
      return send(res, 200, r.rows.map((row) => ('service_date' in row ? { ...row, service_date: isoDate(row.service_date) } : row)));
    }
    if (m[1] && req.method === 'POST' && RPCS.has(m[2])) {
      let body = '';
      for await (const c of req) body += c;
      const args = JSON.parse(body || '{}');
      const names = Object.keys(args);
      const sql = `select to_jsonb(public.${m[2]}(${names.map((n, i) => `${n} => $${i + 1}`).join(', ')})) as result`;
      const r = await client.query(sql, names.map((n) => (typeof args[n] === 'object' ? JSON.stringify(args[n]) : args[n])));
      return send(res, 200, r.rows[0].result);
    }
    return send(res, 405, { message: 'not allowed' });
  } catch (e) {
    return send(res, e.code === '28P01' ? 401 : 400, { code: e.code, message: e.message });
  } finally {
    await client.query('reset role').catch(() => {});
    client.release();
  }
}).listen(Number(port), () => console.log('fake supabase on', port));
