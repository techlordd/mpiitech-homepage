// Validates submissions against the form definitions edited in the admin dashboard.
import { z } from 'zod';
import { visibleFields, type FormDef, type FormField } from './content';
import type { SubmissionField } from './store';

const date = z.iso.date();

function checkField(field: FormField, raw: unknown): { value: string } | { error: string } {
  const value = typeof raw === 'string' ? raw.trim() : raw === undefined || raw === null ? '' : String(raw).trim();
  const required = field.required || field.locked;
  if (field.type === 'checkbox') {
    if (value && value !== 'yes') return { error: field.label };
    if (required && !value) return { error: field.label };
    return { value: value ? 'Yes' : 'No' };
  }
  if (!value) return required ? { error: field.label } : { value: '' };
  const max = field.type === 'textarea' ? 3000 : field.type === 'email' ? 254 : 200;
  if (value.length > max) return { error: field.label };
  switch (field.type) {
    case 'email': return z.email().safeParse(value).success ? { value } : { error: field.label };
    case 'tel': return /^[+()\d\s.-]{5,30}$/.test(value) ? { value } : { error: field.label };
    case 'date': return date.safeParse(value).success ? { value } : { error: field.label };
    case 'select': return field.options.includes(value) ? { value } : { error: field.label };
    case 'number': {
      const n = Number(value);
      if (!Number.isInteger(n)) return { error: field.label };
      if (field.min != null && n < field.min) return { error: field.label };
      if (field.max != null && n > field.max) return { error: field.label };
      return { value: String(n) };
    }
    default: return { value };
  }
}

export type FormValidation =
  | { ok: true; fields: SubmissionField[]; values: Record<string, string> }
  | { ok: false; error: string };

export function validateForm(def: FormDef, body: Record<string, unknown>): FormValidation {
  const fields: SubmissionField[] = []; const values: Record<string, string> = {}; const invalid: string[] = [];
  for (const field of visibleFields(def)) {
    const result = checkField(field, body[field.key]);
    if ('error' in result) invalid.push(result.error);
    else { fields.push({ key: field.key, label: field.label, value: result.value }); values[field.key] = result.value; }
  }
  if (invalid.length) return { ok: false, error: `Please check: ${invalid.slice(0, 4).join(', ')}${invalid.length > 4 ? '…' : ''}.` };
  if (def.checkDateOrder && values.startDate && values.endDate && values.endDate < values.startDate)
    return { ok: false, error: 'Please check your dates: the end date must be on or after the start date.' };
  return { ok: true, fields, values };
}

export function submissionText(subject: string, fields: SubmissionField[], source: string) {
  return [subject, '', ...fields.map(f => `${f.label}: ${f.value === '' ? 'Not provided' : f.value}`), '', 'Consent: provided', `Source: ${source}`, `Submitted: ${new Date().toISOString()}`].join('\n');
}
