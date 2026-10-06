'use server';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { updateTag } from 'next/cache';
import { z } from 'zod';
import {
  SESSION_COOKIE, UnauthorisedError, checkCredentials, clearLoginAttempts, createSessionValue, loginRateLimited, requireAdmin, adminConfigured
} from '@/lib/auth';
import { PATHWAY_ART, PATHWAY_COLORS, SKILL_ICONS, splitList, type ContentKey, type SiteContent } from '@/lib/content';
import { getEmailConfig, isEmail, refreshDeliveryStatus, sendEmail } from '@/lib/email';
import { CONTENT_TAG, getEmailSettings, loadContent, saveContent, saveEmailSettings } from '@/lib/site';
import { StorageUnavailableError, store, type SubmissionStatus } from '@/lib/store';

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

/* ---------- Sign in / out ---------- */
export async function login(_prev: { error: string } | null, form: FormData): Promise<{ error: string } | null> {
  if (!adminConfigured()) return { error: 'Admin access is not set up. Add ADMIN_PASSWORD to the environment variables and redeploy.' };
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'local';
  if (loginRateLimited(ip)) return { error: 'Too many sign-in attempts. Please wait 15 minutes and try again.' };
  const ok = checkCredentials(String(form.get('username') ?? ''), String(form.get('password') ?? ''));
  if (!ok) { await new Promise(r => setTimeout(r, 400)); return { error: 'Incorrect username or password.' }; }
  clearLoginAttempts(ip);
  const session = createSessionValue();
  (await cookies()).set(SESSION_COOKIE, session.value, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires: session.expires });
  redirect('/admin');
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/admin/login');
}

/* ---------- Helpers ---------- */
/** An error whose message is safe to show in the dashboard. */
class ActionError extends Error {}

function describe(error: unknown): string {
  if (error instanceof z.ZodError) {
    const issue = error.issues[0];
    const where = issue.path.filter(p => typeof p === 'string').join(' › ');
    return where ? `${where}: ${issue.message}` : issue.message;
  }
  if (error instanceof StorageUnavailableError || error instanceof UnauthorisedError || error instanceof ActionError) return error.message;
  console.error('Admin action failed:', error);
  return 'Something went wrong. Please try again.';
}

async function guarded(fn: () => Promise<string | void>): Promise<ActionResult> {
  try { await requireAdmin(); const message = await fn(); return { ok: true, message: message || 'Saved.' }; }
  catch (error) { return { ok: false, error: describe(error) }; }
}

async function saveSection<K extends ContentKey>(key: K, value: SiteContent[K]) {
  await saveContent(key, value);
  updateTag(CONTENT_TAG);
}

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters`);
const required = (max: number) => text(max).min(1, 'This is required');
const link = z.string().trim().max(2000).refine(v => !v || v.startsWith('/') || /^https?:\/\/\S+$/i.test(v), 'Use a full https:// link or upload a file');
const emailOrEmpty = z.string().trim().max(254).refine(v => !v || isEmail(v), 'Enter a valid email address');
const emailList = z.string().trim().max(1000).refine(v => splitList(v).every(isEmail), 'Separate valid email addresses with commas');
// Accept either the verification code or the whole <meta … content="…"> tag.
const verification = text(400).transform(v => (v.match(/content\s*=\s*["']([^"']+)["']/i)?.[1] ?? v).trim()).pipe(text(200));

/* ---------- Branding ---------- */
const brandingSchema = z.object({
  siteName: required(80), tagline: text(120), logoUrl: link.pipe(z.string().min(1, 'A logo is required')), logoAlt: required(120),
  faviconUrl: link, heroImageUrl: link.pipe(z.string().min(1, 'A hero image is required')), heroImageAlt: required(200),
  heroCaption: text(120), heroCaptionLabel: text(80), aboutImageUrl: link, aboutImageAlt: text(200), hireImageUrl: link, hireImageAlt: text(200), topbarText: text(140), footerText: text(200)
});
export async function saveBranding(input: unknown) {
  return guarded(async () => { await saveSection('branding', brandingSchema.parse(input)); });
}

/* ---------- SEO ---------- */
const pageSeoSchema = z.object({
  title: text(200), description: text(400), focusKeyphrase: text(100), ogTitle: text(200), ogDescription: text(400), ogImageUrl: link, noindex: z.boolean()
});
const seoSchema = z.object({
  siteUrl: z.string().trim().max(200).refine(v => !v || /^https?:\/\/[^\s/]+\/?$/i.test(v), 'Enter the site address only, e.g. https://www.mpiitech.com').transform(v => v.replace(/\/$/, '')),
  titleSeparator: text(5), allowIndexing: z.boolean(), defaultOgImageUrl: link, twitterHandle: text(50),
  googleVerification: verification, bingVerification: verification,
  pages: z.object({ home: pageSeoSchema, hire: pageSeoSchema, contact: pageSeoSchema }),
  schema: z.object({
    enabled: z.boolean(), type: text(60), name: text(120), telephone: text(60), email: emailOrEmpty, streetAddress: text(300),
    locality: text(120), region: text(120), country: text(60), sameAs: z.array(link.pipe(z.string().min(1))).max(20)
  })
});
export async function saveSeo(input: unknown) {
  return guarded(async () => { await saveSection('seo', seoSchema.parse(input)); });
}

/* ---------- Custom code ---------- */
const codeSchema = z.object({ head: z.string().max(30000), bodyStart: z.string().max(30000), bodyEnd: z.string().max(30000) });
export async function saveCode(input: unknown) {
  return guarded(async () => { await saveSection('code', codeSchema.parse(input)); });
}

/* ---------- Pathways ---------- */
const pathwaySchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9-]{1,80}$/), title: required(120), headline: text(160), description: required(600), details: text(2000),
  skills: z.array(z.object({ title: text(200), description: text(300), icon: z.enum(SKILL_ICONS) })).max(20).transform(list => list.filter(x => x.title)),
  image: link, imageAlt: text(200), color: z.enum(PATHWAY_COLORS), art: z.enum(PATHWAY_ART), featured: z.boolean(), visible: z.boolean(), notify: z.boolean(), active: z.boolean(), applyUrl: link
});
const pathwaysSchema = z.array(pathwaySchema).max(30).superRefine((items, ctx) => {
  const titles = new Set<string>(); const ids = new Set<string>();
  items.forEach((p, i) => {
    if (titles.has(p.title.toLowerCase())) ctx.addIssue({ code: 'custom', message: `Two pathways are called “${p.title}”. Each title must be unique.`, path: [i, 'title'] });
    if (ids.has(p.id)) ctx.addIssue({ code: 'custom', message: 'Duplicate pathway id.', path: [i, 'id'] });
    titles.add(p.title.toLowerCase()); ids.add(p.id);
  });
});
export async function savePathways(input: unknown) {
  return guarded(async () => { await saveSection('pathways', pathwaysSchema.parse(input)); });
}

/* ---------- Forms ---------- */
const RESERVED = ['kind', 'consent', 'website', 'submissionId', 'programme'];
const fieldSchema = z.object({
  id: z.string().trim().min(1).max(80), key: z.string().trim().regex(/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/, 'Field keys use letters, numbers and underscores only'),
  label: required(300), type: z.enum(['text', 'email', 'tel', 'number', 'date', 'textarea', 'select', 'checkbox']),
  placeholder: text(200), help: text(300), required: z.boolean(), visible: z.boolean(),
  options: z.array(text(120)).max(50).transform(list => list.filter(Boolean)), width: z.enum(['half', 'full']),
  min: z.number().int().nullable().optional().default(null), max: z.number().int().nullable().optional().default(null), locked: z.boolean().optional().default(false)
});
const formSchema = z.object({
  id: z.enum(['enquiry', 'contact']), eyebrow: text(80), title: text(120), intro: text(1000),
  sections: z.array(z.object({ id: z.string().trim().min(1).max(80), title: text(120), fields: z.array(fieldSchema).max(40) })).min(1).max(10),
  consentText: required(500), submitLabel: required(60), successMessage: required(500), subject: required(200), recipients: emailList,
  checkDateOrder: z.boolean(), autoReply: z.object({ enabled: z.boolean(), subject: text(200), body: text(5000) })
}).superRefine((form, ctx) => {
  const fields = form.sections.flatMap(s => s.fields);
  const keys = new Set<string>();
  for (const f of fields) {
    if (keys.has(f.key)) ctx.addIssue({ code: 'custom', message: `The field key “${f.key}” is used twice.`, path: ['sections'] });
    if (RESERVED.includes(f.key)) ctx.addIssue({ code: 'custom', message: `“${f.key}” is a reserved field key.`, path: ['sections'] });
    if (f.type === 'select' && !f.options.length) ctx.addIssue({ code: 'custom', message: `Add at least one option to “${f.label}”.`, path: ['sections'] });
    keys.add(f.key);
  }
  for (const key of ['name', 'email']) if (!keys.has(key)) ctx.addIssue({ code: 'custom', message: `The form must keep its “${key}” field.`, path: ['sections'] });
  if (form.autoReply.enabled && !form.autoReply.subject) ctx.addIssue({ code: 'custom', message: 'Add a subject for the automatic reply.', path: ['autoReply', 'subject'] });
});
export async function saveForm(input: unknown) {
  return guarded(async () => {
    const form = formSchema.parse(input);
    // The name and email fields are needed for replies and the submissions inbox.
    for (const f of form.sections.flatMap(s => s.fields)) {
      if (f.key === 'email') Object.assign(f, { type: 'email', required: true, visible: true, locked: true });
      if (f.key === 'name') Object.assign(f, { required: true, visible: true, locked: true });
    }
    const forms = (await loadContent()).forms;
    await saveSection('forms', { ...forms, [form.id]: form });
  });
}

/* ---------- Contact page ---------- */
const contactSchema = z.object({
  eyebrow: text(80), heading: required(160), intro: text(600), address: text(500), phone: text(60), whatsapp: text(60), email: emailOrEmpty, hours: text(500),
  showMap: z.boolean(),
  mapEmbedUrl: z.string().trim().max(3000).transform(v => (v.match(/src\s*=\s*["']([^"']+)["']/i)?.[1] ?? v).replace(/&amp;/g, '&').trim())
    .refine(v => !v || /^https:\/\/\S+$/i.test(v), 'Paste a Google Maps “Embed a map” link or iframe code')
});
export async function saveContact(input: unknown) {
  return guarded(async () => { await saveSection('contact', contactSchema.parse(input)); });
}

/* ---------- Email ---------- */
const emailSettingsSchema = z.object({
  fromName: text(80), fromEmail: emailOrEmpty, recipients: emailList, apiKey: text(200).optional(), clearApiKey: z.boolean().optional()
});
export async function saveEmail(input: unknown) {
  return guarded(async () => {
    const v = emailSettingsSchema.parse(input);
    if (v.apiKey && !v.apiKey.startsWith('re_')) throw new ActionError('Resend API keys start with “re_”.');
    const current = await getEmailSettings();
    await saveEmailSettings({ fromName: v.fromName, fromEmail: v.fromEmail, recipients: v.recipients, apiKey: v.clearApiKey ? '' : v.apiKey || current.apiKey });
  });
}

export async function sendTestEmail(to: string) {
  return guarded(async () => {
    const config = await getEmailConfig();
    const recipients = to.trim() ? [to.trim()] : config.recipients;
    if (!recipients.length || !recipients.every(isEmail)) throw new ActionError('Enter a valid address to send the test to.');
    const result = await sendEmail({ kind: 'test', to: recipients, subject: 'MPIITECH — Test email', text: `This is a test email from the MPIITECH website admin dashboard.\n\nIf you can read this, email sending is working.\n\nSender: ${config.from}\nSent: ${new Date().toISOString()}` }, config);
    if (!result.ok) throw new ActionError(result.reason === 'not_configured' ? `Email is not configured: ${result.error}` : `Resend rejected the email: ${result.error}`);
    return `Test email accepted by Resend for ${recipients.join(', ')}. Check the inbox and the delivery log.`;
  });
}

export async function refreshEmailLog() {
  return guarded(async () => {
    const { items } = await store().listEmailLog({ limit: 25 });
    const updated = await refreshDeliveryStatus(items);
    return updated ? `Updated ${updated} email${updated === 1 ? '' : 's'}.` : 'Delivery statuses are up to date.';
  });
}

export async function clearEmailLog() {
  return guarded(async () => { await store().clearEmailLog(); return 'Delivery log cleared.'; });
}

/* ---------- Submissions ---------- */
const statusSchema = z.enum(['new', 'in_progress', 'closed', 'spam']);
export async function updateSubmission(id: string, patch: { status?: SubmissionStatus; notes?: string }) {
  return guarded(async () => {
    const v = z.object({ status: statusSchema.optional(), notes: text(5000).optional() }).parse(patch);
    await store().updateSubmission(z.string().min(1).max(80).parse(id), v);
  });
}

export async function deleteSubmissions(ids: string[]) {
  return guarded(async () => {
    const list = z.array(z.string().min(1).max(80)).min(1).max(500).parse(ids);
    await store().deleteSubmissions(list);
    return `Deleted ${list.length} submission${list.length === 1 ? '' : 's'}.`;
  });
}
