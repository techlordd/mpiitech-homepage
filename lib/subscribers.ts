// People who asked to be emailed when a programme starts.
import { store, type Submission } from './store';

const WAITING = new Set(['new', 'in_progress']);

export type ProgrammeSubscribers = {
  /** Unique addresses still waiting to hear about the programme. */
  waiting: string[];
  /** Their requests, to mark as notified once the email has gone out. */
  waitingRequests: Submission[];
  notified: number;
};

export async function programmeSubscribers(programme: string): Promise<ProgrammeSubscribers> {
  const { items } = await store().listSubmissions({ form: 'programme', limit: 10000 });
  const mine = items.filter(s => s.summary === programme);
  const waitingRequests = mine.filter(s => WAITING.has(s.status));
  const seen = new Map<string, string>();
  for (const s of waitingRequests) { const key = s.email.trim().toLowerCase(); if (key && !seen.has(key)) seen.set(key, s.email.trim()); }
  return { waiting: [...seen.values()], waitingRequests, notified: mine.filter(s => s.status === 'notified').length };
}

/** Waiting-subscriber counts for every programme, keyed by programme title. */
export async function waitingCounts(): Promise<Record<string, number>> {
  const { items } = await store().listSubmissions({ form: 'programme', limit: 10000 });
  const unique = new Map<string, Set<string>>();
  for (const s of items) {
    if (!WAITING.has(s.status)) continue;
    const set = unique.get(s.summary) ?? new Set<string>();
    set.add(s.email.trim().toLowerCase()); unique.set(s.summary, set);
  }
  return Object.fromEntries([...unique].map(([title, set]) => [title, set.size]));
}

/**
 * Whether this address is already signed up, so a second sign-up adds no new
 * request and sends no more emails. A closed request (or, for a programme, one
 * already notified) lets the person sign up again; one marked spam stays blocked.
 */
export async function alreadySubscribed(form: 'programme' | 'newsletter', email: string, programme = ''): Promise<boolean> {
  const address = email.trim().toLowerCase();
  const blocking = form === 'programme' ? new Set(['new', 'in_progress', 'spam']) : new Set(['new', 'in_progress', 'notified', 'spam']);
  const { items } = await store().listSubmissions({ form, q: address, limit: 200 });
  return items.some(s => s.email.trim().toLowerCase() === address && blocking.has(s.status) && (form === 'newsletter' || s.summary === programme));
}
