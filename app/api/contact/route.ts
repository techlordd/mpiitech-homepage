import { NextResponse } from 'next/server';
import { z } from 'zod';
import { applyLink, fillTemplate, splitList } from '@/lib/content';
import { sendEmail } from '@/lib/email';
import { absoluteUrl } from '@/lib/seo';
import { submissionText, validateForm } from '@/lib/form-validation';
import { getContent } from '@/lib/site';
import { store, storageKind, type Submission, type SubmissionField } from '@/lib/store';
import { alreadySubscribed } from '@/lib/subscribers';

export const runtime = 'nodejs';

const envelope = z.object({
  kind: z.enum(['newsletter', 'programme', 'enquiry', 'contact']),
  email: z.email().max(254),
  consent: z.literal('yes'),
  website: z.string().max(200).optional().default(''),
  submissionId: z.uuid(),
  programme: z.string().trim().max(200).optional()
});

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(request: Request) {
  try {
    // Reject browser submissions from a different origin. Keep API key and recipients server-side.
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return fail('Please submit using this website.', 403);
    if (!request.headers.get('content-type')?.includes('application/json')) return fail('Invalid request format.', 415);
    const raw = await request.text();
    if (Buffer.byteLength(raw, 'utf8') > 20000) return fail('Your message is too long.', 413);
    let body: Record<string, unknown>;
    try { body = JSON.parse(raw); } catch { return fail('Invalid request.', 400); }
    if (!body || typeof body !== 'object') return fail('Invalid request.', 400);

    const parsed = envelope.safeParse(body);
    if (!parsed.success) return fail('Please complete the required fields with valid details and agree to the consent notice.', 400);
    const data = parsed.data;
    if (data.website) return NextResponse.json({ success: true }); // Honeypot: nothing stored or sent.

    const content = await getContent();
    let subject: string, fields: SubmissionField[], name = '', summary = '', recipients: string[] = [];
    let autoReply: { subject: string; body: string } | null = null;
    let programme = '', programmeApply = '';

    if (data.kind === 'enquiry' || data.kind === 'contact') {
      const def = content.forms[data.kind];
      const result = validateForm(def, body);
      if (!result.ok) return fail(result.error, 400);
      fields = result.fields; name = result.values.name ?? '';
      summary = result.values.organisation || result.values.topic || result.values.purpose || '';
      subject = def.subject; recipients = splitList(def.recipients);
      if (def.autoReply.enabled && def.autoReply.subject.trim()) autoReply = def.autoReply;
    } else if (data.kind === 'programme') {
      const pathway = content.pathways.find(p => p.visible && p.title === data.programme);
      if (pathway?.active) return fail('Good news: this programme is now open for applications. Please refresh the page and use “Apply now”.', 409);
      if (!pathway?.notify) return fail('This programme is not currently accepting update requests.', 400);
      subject = `${content.branding.siteName} — Programme notification request: ${pathway.title}`;
      fields = [{ key: 'email', label: 'Email address', value: data.email }, { key: 'programme', label: 'Programme', value: pathway.title }];
      summary = pathway.title;
      programme = pathway.title; programmeApply = absoluteUrl(content, applyLink(pathway), new URL(request.url).origin);
      // The subscriber gets their own "you're on the list" email, as well as the team's notification.
      if (content.messages.programmeConfirm.enabled && content.messages.programmeConfirm.subject.trim()) autoReply = content.messages.programmeConfirm;
    } else {
      subject = `${content.branding.siteName} — Newsletter subscription request`;
      fields = [{ key: 'email', label: 'Email address', value: data.email }];
      if (content.messages.newsletterConfirm.enabled && content.messages.newsletterConfirm.subject.trim()) autoReply = content.messages.newsletterConfirm;
    }

    const id = data.submissionId;
    const now = new Date().toISOString();
    let stored = false;
    if (storageKind() !== 'none') {
      try {
        if (await store().getSubmission(id)) return NextResponse.json({ success: true }); // Already received (retry).
        // Signing up twice adds nothing and sends no more emails.
        if ((data.kind === 'programme' || data.kind === 'newsletter') && await alreadySubscribed(data.kind, data.email, summary)) return NextResponse.json({ success: true, duplicate: true });
        const submission: Submission = { id, createdAt: now, updatedAt: now, form: data.kind, status: 'new', name, email: data.email, summary, fields, notes: '', emailStatus: 'pending' };
        await store().addSubmission(submission);
        stored = true;
      } catch (error) { console.error('Could not store submission:', error instanceof Error ? error.message : error); }
    }

    const text = submissionText(subject, fields, `${content.branding.siteName} website`);
    const sent = await sendEmail({ kind: data.kind, subject, text, to: recipients, replyTo: data.email, idempotencyKey: `mpiitech-${id}` });
    if (stored) await store().updateSubmission(id, { emailStatus: sent.ok ? 'sent' : sent.reason }).catch(() => undefined);
    if (!sent.ok && !stored) {
      return sent.reason === 'not_configured'
        ? fail('Email delivery is not configured yet. Please contact the center directly.', 503)
        : fail('We could not send your request. Please try again shortly.', 502);
    }

    if (autoReply) {
      const fill = (t: string) => fillTemplate(t, { name, programme, applyLink: programmeApply, siteName: content.branding.siteName });
      await sendEmail({ kind: `${data.kind}-autoreply`, to: [data.email], subject: fill(autoReply.subject), text: fill(autoReply.body), idempotencyKey: `mpiitech-${id}-ack` });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Form submission failed:', error instanceof Error ? error.message : error);
    return fail('We could not send your request. Please try again shortly.', 500);
  }
}
