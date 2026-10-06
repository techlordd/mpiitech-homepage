// Checks form handling and email delivery using a mocked provider and temporary local storage. Does not send email.
const fs = require('fs'); const os = require('os'); const path = require('path'); const Module = require('module');
const assert = require('node:assert/strict'); const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mpiitech-verify-'));
let sent = []; let providerError = false;
class FakeResend { emails = { send: async (message, options) => { sent.push({ message, options }); return providerError ? { data: null, error: { name: 'validation_error', message: 'Invalid' } } : { data: { id: `re-${sent.length}` }, error: null }; } }; }
const stubs = { resend: { Resend: FakeResend }, 'next/cache': { unstable_cache: fn => fn, updateTag() {}, revalidateTag() {} }, react: { cache: fn => fn } };

// Load TypeScript sources directly, resolving the "@/" alias.
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith('@/')) request = path.join(root, request.slice(2));
  return resolve.call(this, request, ...rest);
};
const load = Module._load;
Module._load = function (request, ...rest) { return stubs[request] ?? load.call(this, request, ...rest); };
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, filename) =>
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename);
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  try { return originalResolve.call(this, request, parent, ...rest); }
  catch (error) { for (const ext of ['.ts', '.tsx']) { try { return originalResolve.call(this, request + ext, parent, ...rest); } catch { /* next */ } } throw error; }
};

for (const key of ['RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'CONTACT_TO_EMAIL', 'DATABASE_URL', 'POSTGRES_URL', 'VERCEL']) delete process.env[key];
process.env.MPIITECH_DATA_DIR = dataDir;
console.error = () => {};
const { POST } = require(path.join(root, 'app/api/contact/route.ts'));
const { store } = require(path.join(root, 'lib/store.ts'));

const uuid = () => require('crypto').randomUUID();
const base = () => ({ email: 'visitor@example.com', consent: 'yes', submissionId: uuid() });
const enquiry = () => ({ ...base(), kind: 'enquiry', organisation: 'Test School', name: 'Test Visitor', phone: '+2348012345678', purpose: 'School training sessions', topic: 'Digital skills', participants: '12', startDate: '2026-11-10', endDate: '2026-11-11', support: 'Single session', computers: '0', notes: '<test> & text' });
const contact = () => ({ ...base(), kind: 'contact', name: 'Ada', topic: 'Center hire', message: 'Hello there' });
const post = (payload, origin = 'http://localhost:3000') => POST(new Request('http://localhost:3000/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', origin }, body: JSON.stringify(payload) }));

(async () => {
  // Validation
  assert.equal((await post({ ...base(), kind: 'newsletter', email: 'bad' })).status, 400);
  assert.equal((await post({ ...base(), kind: 'newsletter', consent: '' })).status, 400);
  assert.equal((await post({ ...enquiry(), endDate: '2026-11-09' })).status, 400);
  assert.equal((await post({ ...enquiry(), purpose: 'Not an option' })).status, 400);
  assert.equal((await post({ ...enquiry(), participants: '0' })).status, 400);
  assert.equal((await post({ ...contact(), message: '' })).status, 400);
  assert.equal((await post({ ...base(), kind: 'programme', programme: 'Unknown course' })).status, 400);
  assert.equal((await post({ ...base(), kind: 'newsletter' }, 'https://foreign.example')).status, 403);

  // No storage and no email configuration: the visitor is told delivery failed.
  process.env.MPIITECH_STORAGE = 'none';
  assert.equal((await post(enquiry())).status, 503);
  // With storage, the submission is kept even when email is not configured.
  delete process.env.MPIITECH_STORAGE;
  const kept = enquiry();
  assert.equal((await post(kept)).status, 200);
  const saved = await store().getSubmission(kept.submissionId);
  assert.equal(saved.emailStatus, 'not_configured'); assert.equal(saved.name, 'Test Visitor'); assert.equal(saved.summary, 'Test School');
  assert.equal(sent.length, 0);

  Object.assign(process.env, { RESEND_API_KEY: 'test-only', RESEND_FROM_EMAIL: 'MPIITECH <hello@example.com>', CONTACT_TO_EMAIL: 'admin@example.com,second@example.com' });
  const first = enquiry();
  for (const payload of [first, contact(), { ...base(), kind: 'programme', programme: 'Digital Foundations' }, { ...base(), kind: 'newsletter' }]) assert.equal((await post(payload)).status, 200);
  assert.equal(sent.length, 4);
  assert.deepEqual(JSON.parse(JSON.stringify(sent[0].message.to)), ['admin@example.com', 'second@example.com']);
  assert.equal(sent[0].message.replyTo, 'visitor@example.com');
  assert.ok(sent[0].message.text.includes('Computer systems required: 0'));
  assert.ok(sent[0].message.text.includes('Anything else we should know? (optional): <test> & text'));
  assert.ok(sent[0].message.text.includes('My dates and/or session times are flexible.: No'));
  assert.equal(sent[0].options.idempotencyKey, `mpiitech-${first.submissionId}`);
  assert.equal((await store().getSubmission(first.submissionId)).emailStatus, 'sent');

  // A retried submission is not sent twice; the honeypot sends nothing.
  assert.equal((await post(first)).status, 200); assert.equal(sent.length, 4);
  assert.equal((await post({ ...base(), kind: 'newsletter', website: 'spam' })).status, 200); assert.equal(sent.length, 4);

  // Admin-edited forms: per-form recipients, hidden fields and automatic replies.
  const { DEFAULT_CONTENT } = require(path.join(root, 'lib/content.ts'));
  const form = structuredClone(DEFAULT_CONTENT.forms.contact);
  form.recipients = 'office@example.com'; form.autoReply.enabled = true;
  form.sections[0].fields.find(f => f.key === 'topic').visible = false;
  await store().setDoc('forms', { ...DEFAULT_CONTENT.forms, contact: form });
  assert.equal((await post({ ...contact(), topic: '' })).status, 200);
  assert.deepEqual(JSON.parse(JSON.stringify(sent[4].message.to)), ['office@example.com']);
  assert.ok(!sent[4].message.text.includes('What is this about?'));
  assert.deepEqual(JSON.parse(JSON.stringify(sent[5].message.to)), ['visitor@example.com']);
  assert.ok(sent[5].message.text.startsWith('Hello Ada,'));

  // Active programmes take applications instead of update requests.
  const pathways = structuredClone(DEFAULT_CONTENT.pathways); pathways[1].active = true;
  await store().setDoc('pathways', pathways);
  assert.equal((await post({ ...base(), kind: 'programme', programme: pathways[1].title })).status, 409);
  assert.equal((await post({ ...base(), kind: 'programme', programme: pathways[2].title })).status, 200);

  // Provider failure is logged; the stored submission is still accepted.
  providerError = true;
  assert.equal((await post({ ...base(), kind: 'newsletter' })).status, 200);
  process.env.MPIITECH_STORAGE = 'none';
  assert.equal((await post({ ...base(), kind: 'newsletter' })).status, 502);
  delete process.env.MPIITECH_STORAGE;
  const log = await store().listEmailLog({ limit: 100 });
  assert.ok(log.items.some(e => e.status === 'failed') && log.items.some(e => e.status === 'not_configured') && log.items.some(e => e.status === 'sent' && e.providerId));

  fs.rmSync(dataDir, { recursive: true, force: true });
  process.stdout.write('PASS: validation, consent, dates, options, origin, missing config, storage fallback, four form types, recipients, per-form routing, hidden fields, auto-reply, active programmes, reply-to, zero computers, idempotency, retries, honeypot, provider failure and delivery log. No emails sent.\n');
})().catch(error => { fs.rmSync(dataDir, { recursive: true, force: true }); process.stderr.write(String(error.stack || error) + '\n'); process.exitCode = 1; });
