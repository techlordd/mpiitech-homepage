// Sends email through Resend and records every attempt in the delivery log.
import { Resend } from 'resend';
import { z } from 'zod';
import { splitList } from './content';
import { getEmailSettings } from './site';
import { newId, store, type EmailLogEntry } from './store';

export type EmailConfig = {
  apiKey: string; from: string; recipients: string[];
  sources: { apiKey: 'dashboard' | 'environment' | 'missing'; from: 'dashboard' | 'environment' | 'missing'; recipients: 'dashboard' | 'environment' | 'missing' };
  problems: string[];
};

export const isEmail = (value: string) => z.email().safeParse(value).success;
const addressOf = (from: string) => (from.match(/<([^>]+)>\s*$/)?.[1] ?? from).trim();

export async function getEmailConfig(): Promise<EmailConfig> {
  const s = await getEmailSettings();
  const env = process.env;
  const name = s.fromName.replace(/[<>"\r\n]/g, '').trim();
  const from = s.fromEmail ? (name ? `${name} <${s.fromEmail.trim()}>` : s.fromEmail.trim()) : env.RESEND_FROM_EMAIL?.trim() || '';
  const recipients = splitList(s.recipients || env.CONTACT_TO_EMAIL || '');
  const apiKey = s.apiKey || env.RESEND_API_KEY || '';
  const problems: string[] = [];
  if (!apiKey) problems.push('No Resend API key is set.');
  if (!from) problems.push('No sender (from) address is set.');
  else if (!isEmail(addressOf(from))) problems.push('The sender address is not a valid email address.');
  if (!recipients.length) problems.push('No recipient inbox is set.');
  else if (recipients.some(x => !isEmail(x))) problems.push('One or more recipient addresses are invalid.');
  return {
    apiKey, from, recipients, problems,
    sources: {
      apiKey: s.apiKey ? 'dashboard' : env.RESEND_API_KEY ? 'environment' : 'missing',
      from: s.fromEmail ? 'dashboard' : env.RESEND_FROM_EMAIL ? 'environment' : 'missing',
      recipients: s.recipients ? 'dashboard' : env.CONTACT_TO_EMAIL ? 'environment' : 'missing'
    }
  };
}

type Message = { kind: string; subject: string; text: string; to?: string[]; replyTo?: string; idempotencyKey?: string };
export type SendResult = { ok: true; id: string } | { ok: false; reason: 'not_configured' | 'failed'; error: string };

async function log(entry: Omit<EmailLogEntry, 'id' | 'createdAt' | 'updatedAt' | 'lastEvent'>) {
  const now = new Date().toISOString();
  try { await store().addEmailLog({ ...entry, id: newId(), createdAt: now, updatedAt: now, lastEvent: entry.status === 'sent' ? 'sent' : '' }); }
  catch (error) { console.error('Could not write email log:', error instanceof Error ? error.message : error); }
}

/** Sends one plain-text email. `to` defaults to the configured recipient inboxes. */
export async function sendEmail(message: Message, config?: EmailConfig): Promise<SendResult> {
  const c = config ?? await getEmailConfig();
  const to = message.to?.length ? message.to : c.recipients;
  const base = { kind: message.kind, to, subject: message.subject };
  const problems = [...c.problems.filter(p => !(message.to?.length && p.includes('recipient'))), ...(to.some(x => !isEmail(x)) ? ['Invalid recipient address.'] : [])];
  if (problems.length || !to.length) {
    await log({ ...base, status: 'not_configured', providerId: '', error: problems.join(' ') || 'No recipients.' });
    return { ok: false, reason: 'not_configured', error: problems.join(' ') };
  }
  try {
    const { data, error } = await new Resend(c.apiKey).emails.send(
      { from: c.from, to, subject: message.subject, text: message.text, ...(message.replyTo ? { replyTo: message.replyTo } : {}) },
      message.idempotencyKey ? { idempotencyKey: message.idempotencyKey } : undefined
    );
    if (error) {
      console.error('Resend email delivery failed:', error.name);
      await log({ ...base, status: 'failed', providerId: '', error: `${error.name}: ${error.message}` });
      return { ok: false, reason: 'failed', error: error.message };
    }
    await log({ ...base, status: 'sent', providerId: data?.id ?? '', error: '' });
    return { ok: true, id: data?.id ?? '' };
  } catch (error) {
    const text = error instanceof Error ? error.message : 'Unknown error';
    await log({ ...base, status: 'failed', providerId: '', error: text });
    return { ok: false, reason: 'failed', error: text };
  }
}

/** Asks Resend for the latest delivery event (delivered, bounced, opened…) of logged emails. */
export async function refreshDeliveryStatus(entries: EmailLogEntry[]) {
  const { apiKey } = await getEmailConfig();
  if (!apiKey) return 0;
  const resend = new Resend(apiKey);
  let updated = 0;
  for (const entry of entries.filter(e => e.providerId).slice(0, 25)) {
    try {
      const { data } = await resend.emails.get(entry.providerId);
      if (data?.last_event && data.last_event !== entry.lastEvent) { await store().updateEmailLog(entry.id, { lastEvent: data.last_event }); updated++; }
    } catch (error) { console.error('Could not refresh email status:', error instanceof Error ? error.message : error); }
  }
  return updated;
}
