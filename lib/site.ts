// Server-side loading and saving of editable site content.
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { store } from './store';
import {
  CONTENT_KEYS, DEFAULT_CONTENT, DEFAULT_EMAIL_SETTINGS, normaliseSkill, withDefaults,
  type ContentKey, type EmailSettings, type FormDef, type FormField, type FormId, type Pathway, type SiteContent
} from './content';

export const CONTENT_TAG = 'site-content';

const fieldDefaults: FormField = { id: '', key: '', label: '', type: 'text', placeholder: '', help: '', required: false, visible: true, options: [], width: 'half', min: null, max: null, locked: false };
const pathwayDefaults: Pathway = { id: '', title: '', headline: '', description: '', details: '', skills: [], image: '', imageAlt: '', color: 'auto', art: 'auto', featured: false, visible: true, notify: true, active: false, applyUrl: '' };

function normaliseForm(id: FormId, stored: unknown): FormDef {
  const form = withDefaults(DEFAULT_CONTENT.forms[id], stored);
  return {
    ...form, id,
    sections: form.sections.map(section => ({ ...section, fields: section.fields.map(f => withDefaults(fieldDefaults, f)) }))
  };
}

export function normaliseContent(docs: Record<string, unknown>): SiteContent {
  const forms = (docs.forms ?? {}) as Record<string, unknown>;
  return {
    branding: withDefaults(DEFAULT_CONTENT.branding, docs.branding),
    seo: withDefaults(DEFAULT_CONTENT.seo, docs.seo),
    code: withDefaults(DEFAULT_CONTENT.code, docs.code),
    pathways: Array.isArray(docs.pathways) ? docs.pathways.map(p => { const pathway = withDefaults(pathwayDefaults, p); return { ...pathway, skills: pathway.skills.map(normaliseSkill) }; }) : DEFAULT_CONTENT.pathways,
    forms: { enquiry: normaliseForm('enquiry', forms.enquiry), contact: normaliseForm('contact', forms.contact) },
    contact: withDefaults(DEFAULT_CONTENT.contact, docs.contact),
    messages: withDefaults(DEFAULT_CONTENT.messages, docs.messages)
  };
}

/** Uncached read, for the admin dashboard. */
export async function loadContent(): Promise<SiteContent> {
  return normaliseContent(await store().getDocs(CONTENT_KEYS));
}

// Errors are thrown inside the cached function so a failed read is never cached.
const cachedDocs = unstable_cache(() => store().getDocs(CONTENT_KEYS), ['mpiitech-site-content'], { tags: [CONTENT_TAG], revalidate: 3600 });

/** Cached read for public pages. Falls back to defaults if storage cannot be reached. */
export const getContent = cache(async (): Promise<SiteContent> => {
  try { return normaliseContent(await cachedDocs()); }
  catch (error) {
    console.error('Could not load site content; using defaults.', error instanceof Error ? error.message : error);
    return normaliseContent({});
  }
});

export async function saveContent<K extends ContentKey>(key: K, value: SiteContent[K]) {
  await store().setDoc(key, value);
}

export async function getEmailSettings(): Promise<EmailSettings> {
  try { return withDefaults(DEFAULT_EMAIL_SETTINGS, (await store().getDocs(['email'])).email); }
  catch (error) {
    console.error('Could not load email settings.', error instanceof Error ? error.message : error);
    return DEFAULT_EMAIL_SETTINGS;
  }
}

export async function saveEmailSettings(settings: EmailSettings) {
  await store().setDoc('email', settings);
}
