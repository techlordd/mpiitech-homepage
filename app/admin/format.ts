export const FORM_LABELS: Record<string, string> = { enquiry: 'Center hire', contact: 'Contact', programme: 'Programme', newsletter: 'Newsletter' };
export const STATUS_LABELS: Record<string, string> = { new: 'New', in_progress: 'In progress', closed: 'Closed', spam: 'Spam' };

export function formatDate(iso: string) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' }).format(new Date(iso));
}
