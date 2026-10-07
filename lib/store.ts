// Persistent storage for site settings, uploads, form submissions and the email delivery log.
// Uses Postgres (Neon / Vercel Postgres) when DATABASE_URL or POSTGRES_URL is set, otherwise
// a local JSON file in .data/ for development. On Vercel without a database, storage is read-only.
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

export type EmailStatus = 'sent' | 'failed' | 'not_configured';
export type EmailLogEntry = {
  id: string; createdAt: string; kind: string; to: string[]; subject: string;
  status: EmailStatus; providerId: string; error: string; lastEvent: string; updatedAt: string;
};
export type SubmissionStatus = 'new' | 'in_progress' | 'notified' | 'closed' | 'spam';
export type SubmissionField = { key: string; label: string; value: string };
export type Submission = {
  id: string; createdAt: string; form: string; status: SubmissionStatus; name: string; email: string;
  summary: string; fields: SubmissionField[]; notes: string; emailStatus: string; updatedAt: string;
};
export type StoredFile = { id: string; name: string; contentType: string; size: number; data: Buffer; createdAt: string };
export type StorageKind = 'postgres' | 'file' | 'none';

export class StorageUnavailableError extends Error {
  constructor() { super('Storage is not configured. Connect a Postgres database (DATABASE_URL) to save changes.'); }
}

const dbUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
export function storageKind(): StorageKind {
  const mode = process.env.MPIITECH_STORAGE;
  if (mode === 'none') return 'none';
  if (mode !== 'file' && dbUrl()) return 'postgres';
  if (mode === 'file' || !process.env.VERCEL) return 'file';
  return 'none';
}

type ListOptions = { form?: string; status?: string; q?: string; limit?: number; offset?: number };
interface Backend {
  getDocs(keys: string[]): Promise<Record<string, unknown>>;
  setDoc(key: string, value: unknown): Promise<void>;
  putFile(file: StoredFile): Promise<void>;
  getFile(id: string): Promise<StoredFile | null>;
  addEmailLog(entry: EmailLogEntry): Promise<void>;
  updateEmailLog(id: string, patch: Partial<EmailLogEntry>): Promise<void>;
  listEmailLog(o: { status?: string; limit?: number; offset?: number }): Promise<{ items: EmailLogEntry[]; total: number }>;
  clearEmailLog(): Promise<void>;
  addSubmission(s: Submission): Promise<void>;
  getSubmission(id: string): Promise<Submission | null>;
  updateSubmission(id: string, patch: Partial<Pick<Submission, 'status' | 'notes' | 'emailStatus'>>): Promise<void>;
  deleteSubmissions(ids: string[]): Promise<void>;
  listSubmissions(o: ListOptions): Promise<{ items: Submission[]; total: number }>;
  submissionCounts(): Promise<{ form: string; status: string; count: number }[]>;
}

/* ---------------- Postgres ---------------- */
const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : '');
const toLog = (r: Record<string, unknown>): EmailLogEntry => ({
  id: String(r.id), createdAt: iso(r.created_at), kind: String(r.kind ?? ''), to: (r.recipients as string[]) ?? [], subject: String(r.subject ?? ''),
  status: r.status as EmailStatus, providerId: String(r.provider_id ?? ''), error: String(r.error ?? ''), lastEvent: String(r.last_event ?? ''), updatedAt: iso(r.updated_at)
});
const toSubmission = (r: Record<string, unknown>): Submission => ({
  id: String(r.id), createdAt: iso(r.created_at), form: String(r.form), status: r.status as SubmissionStatus, name: String(r.name ?? ''), email: String(r.email ?? ''),
  summary: String(r.summary ?? ''), fields: (r.fields as SubmissionField[]) ?? [], notes: String(r.notes ?? ''), emailStatus: String(r.email_status ?? ''), updatedAt: iso(r.updated_at)
});

function postgresBackend(): Backend {
  const sql = neon(dbUrl());
  const q = async (text: string, params: unknown[] = []) => (await sql.query(text, params)) as Record<string, unknown>[];
  let ready: Promise<void> | null = null;
  const init = () => (ready ??= (async () => {
    for (const statement of [
      'create table if not exists mpi_kv (key text primary key, value jsonb not null, updated_at timestamptz not null default now())',
      'create table if not exists mpi_files (id text primary key, name text, content_type text not null, size integer not null, data text not null, created_at timestamptz not null default now())',
      'create table if not exists mpi_email_log (id text primary key, created_at timestamptz not null default now(), kind text, recipients jsonb, subject text, status text, provider_id text, error text, last_event text, updated_at timestamptz)',
      'create index if not exists mpi_email_log_created on mpi_email_log (created_at desc)',
      "create table if not exists mpi_submissions (id text primary key, created_at timestamptz not null default now(), form text not null, status text not null default 'new', name text, email text, summary text, fields jsonb, notes text not null default '', email_status text, updated_at timestamptz)",
      'create index if not exists mpi_submissions_form on mpi_submissions (form, created_at desc)'
    ]) await q(statement);
  })().catch(error => { ready = null; throw error; }));
  const run = async (text: string, params: unknown[] = []) => { await init(); return q(text, params); };
  return {
    async getDocs(keys) {
      const rows = await run('select key, value from mpi_kv where key = any($1)', [keys]);
      return Object.fromEntries(rows.map(r => [r.key as string, r.value]));
    },
    async setDoc(key, value) {
      await run('insert into mpi_kv (key, value, updated_at) values ($1, $2::jsonb, now()) on conflict (key) do update set value = excluded.value, updated_at = now()', [key, JSON.stringify(value)]);
    },
    async putFile(f) {
      await run('insert into mpi_files (id, name, content_type, size, data) values ($1, $2, $3, $4, $5)', [f.id, f.name, f.contentType, f.size, f.data.toString('base64')]);
    },
    async getFile(id) {
      const [r] = await run('select id, name, content_type, size, data, created_at from mpi_files where id = $1', [id]);
      return r ? { id, name: String(r.name ?? ''), contentType: String(r.content_type), size: Number(r.size), data: Buffer.from(String(r.data), 'base64'), createdAt: iso(r.created_at) } : null;
    },
    async addEmailLog(e) {
      await run('insert into mpi_email_log (id, created_at, kind, recipients, subject, status, provider_id, error, last_event, updated_at) values ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10)',
        [e.id, e.createdAt, e.kind, JSON.stringify(e.to), e.subject, e.status, e.providerId, e.error, e.lastEvent, e.updatedAt]);
    },
    async updateEmailLog(id, p) {
      await run('update mpi_email_log set last_event = coalesce($2, last_event), status = coalesce($3, status), error = coalesce($4, error), updated_at = now() where id = $1',
        [id, p.lastEvent ?? null, p.status ?? null, p.error ?? null]);
    },
    async listEmailLog({ status, limit = 50, offset = 0 }) {
      const where = status ? 'where status = $1' : '';
      const params = status ? [status] : [];
      const items = await run(`select * from mpi_email_log ${where} order by created_at desc limit ${Number(limit)} offset ${Number(offset)}`, params);
      const [{ count }] = await run(`select count(*)::int as count from mpi_email_log ${where}`, params);
      return { items: items.map(toLog), total: Number(count) };
    },
    async clearEmailLog() { await run('delete from mpi_email_log'); },
    async addSubmission(s) {
      await run('insert into mpi_submissions (id, created_at, form, status, name, email, summary, fields, notes, email_status, updated_at) values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11)',
        [s.id, s.createdAt, s.form, s.status, s.name, s.email, s.summary, JSON.stringify(s.fields), s.notes, s.emailStatus, s.updatedAt]);
    },
    async getSubmission(id) {
      const [r] = await run('select * from mpi_submissions where id = $1', [id]);
      return r ? toSubmission(r) : null;
    },
    async updateSubmission(id, p) {
      await run('update mpi_submissions set status = coalesce($2, status), notes = coalesce($3, notes), email_status = coalesce($4, email_status), updated_at = now() where id = $1',
        [id, p.status ?? null, p.notes ?? null, p.emailStatus ?? null]);
    },
    async deleteSubmissions(ids) { await run('delete from mpi_submissions where id = any($1)', [ids]); },
    async listSubmissions({ form, status, q: search, limit = 50, offset = 0 }) {
      const clauses: string[] = []; const params: unknown[] = [];
      if (form) { params.push(form); clauses.push(`form = $${params.length}`); }
      if (status) { params.push(status); clauses.push(`status = $${params.length}`); }
      if (search) { params.push(`%${search}%`); clauses.push(`(name ilike $${params.length} or email ilike $${params.length} or summary ilike $${params.length} or fields::text ilike $${params.length})`); }
      const where = clauses.length ? `where ${clauses.join(' and ')}` : '';
      const items = await run(`select * from mpi_submissions ${where} order by created_at desc limit ${Number(limit)} offset ${Number(offset)}`, params);
      const [{ count }] = await run(`select count(*)::int as count from mpi_submissions ${where}`, params);
      return { items: items.map(toSubmission), total: Number(count) };
    },
    async submissionCounts() {
      const rows = await run('select form, status, count(*)::int as count from mpi_submissions group by form, status');
      return rows.map(r => ({ form: String(r.form), status: String(r.status), count: Number(r.count) }));
    }
  };
}

/* ---------------- Local JSON file (development) ---------------- */
type FileDb = { kv: Record<string, unknown>; emailLog: EmailLogEntry[]; submissions: Submission[]; files: Record<string, Omit<StoredFile, 'data'>> };
function fileBackend(): Backend {
  const dir = path.resolve(/*turbopackIgnore: true*/ process.env.MPIITECH_DATA_DIR || path.join(process.cwd(), '.data'));
  const dbFile = path.join(dir, 'store.json');
  let queue: Promise<unknown> = Promise.resolve();
  const read = async (): Promise<FileDb> => {
    try { return { kv: {}, emailLog: [], submissions: [], files: {}, ...JSON.parse(await fs.readFile(dbFile, 'utf8')) }; }
    catch { return { kv: {}, emailLog: [], submissions: [], files: {} }; }
  };
  const mutate = <T>(fn: (db: FileDb) => T | Promise<T>): Promise<T> => {
    const next = queue.then(async () => {
      const db = await read(); const result = await fn(db);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(`${dbFile}.tmp`, JSON.stringify(db, null, 1)); await fs.rename(`${dbFile}.tmp`, dbFile);
      return result;
    });
    queue = next.catch(() => undefined);
    return next;
  };
  const filter = (items: Submission[], { form, status, q }: ListOptions) => items.filter(s =>
    (!form || s.form === form) && (!status || s.status === status) &&
    (!q || JSON.stringify([s.name, s.email, s.summary, s.fields]).toLowerCase().includes(q.toLowerCase())));
  const sortDesc = <T extends { createdAt: string }>(a: T[]) => [...a].sort((x, y) => y.createdAt.localeCompare(x.createdAt));
  return {
    async getDocs(keys) { const db = await read(); return Object.fromEntries(keys.filter(k => k in db.kv).map(k => [k, db.kv[k]])); },
    async setDoc(key, value) { await mutate(db => { db.kv[key] = value; }); },
    async putFile(f) {
      await fs.mkdir(path.join(dir, 'files'), { recursive: true });
      await fs.writeFile(path.join(dir, 'files', f.id), f.data);
      await mutate(db => { const { data: _data, ...meta } = f; db.files[f.id] = meta; });
    },
    async getFile(id) {
      const meta = (await read()).files[id]; if (!meta) return null;
      try { return { ...meta, data: await fs.readFile(path.join(dir, 'files', id)) }; } catch { return null; }
    },
    async addEmailLog(e) { await mutate(db => { db.emailLog.push(e); db.emailLog = db.emailLog.slice(-2000); }); },
    async updateEmailLog(id, p) { await mutate(db => { const e = db.emailLog.find(x => x.id === id); if (e) Object.assign(e, Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined)), { updatedAt: new Date().toISOString() }); }); },
    async listEmailLog({ status, limit = 50, offset = 0 }) {
      const all = sortDesc((await read()).emailLog).filter(e => !status || e.status === status);
      return { items: all.slice(offset, offset + limit), total: all.length };
    },
    async clearEmailLog() { await mutate(db => { db.emailLog = []; }); },
    async addSubmission(s) { await mutate(db => { db.submissions.push(s); }); },
    async getSubmission(id) { return (await read()).submissions.find(s => s.id === id) ?? null; },
    async updateSubmission(id, p) { await mutate(db => { const s = db.submissions.find(x => x.id === id); if (s) Object.assign(s, Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined)), { updatedAt: new Date().toISOString() }); }); },
    async deleteSubmissions(ids) { await mutate(db => { db.submissions = db.submissions.filter(s => !ids.includes(s.id)); }); },
    async listSubmissions(o) {
      const all = filter(sortDesc((await read()).submissions), o);
      const offset = o.offset ?? 0;
      return { items: all.slice(offset, offset + (o.limit ?? 50)), total: all.length };
    },
    async submissionCounts() {
      const counts = new Map<string, { form: string; status: string; count: number }>();
      for (const s of (await read()).submissions) {
        const k = `${s.form}:${s.status}`; const c = counts.get(k) ?? { form: s.form, status: s.status, count: 0 }; c.count++; counts.set(k, c);
      }
      return [...counts.values()];
    }
  };
}

/* ---------------- No storage (read-only defaults) ---------------- */
const unavailable = async (): Promise<never> => { throw new StorageUnavailableError(); };
const noneBackend: Backend = {
  getDocs: async () => ({}), setDoc: unavailable, putFile: unavailable, getFile: async () => null,
  addEmailLog: async () => undefined, updateEmailLog: async () => undefined, listEmailLog: async () => ({ items: [], total: 0 }), clearEmailLog: unavailable,
  addSubmission: unavailable, getSubmission: async () => null, updateSubmission: unavailable, deleteSubmissions: unavailable,
  listSubmissions: async () => ({ items: [], total: 0 }), submissionCounts: async () => []
};

let cached: { kind: StorageKind; url: string; backend: Backend } | null = null;
export function store(): Backend {
  const kind = storageKind(); const url = kind === 'postgres' ? dbUrl() : process.env.MPIITECH_DATA_DIR || '';
  if (!cached || cached.kind !== kind || cached.url !== url) cached = { kind, url, backend: kind === 'postgres' ? postgresBackend() : kind === 'file' ? fileBackend() : noneBackend };
  return cached.backend;
}

export const newId = () => randomUUID();
