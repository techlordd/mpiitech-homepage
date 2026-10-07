// Content model and defaults. Shared by the public site, the admin dashboard and the API.
// Safe to import from client components: no server-only code here.

export type Branding = {
  siteName: string;
  tagline: string;
  logoUrl: string;
  logoAlt: string;
  faviconUrl: string;
  heroImageUrl: string;
  heroImageAlt: string;
  heroCaption: string;
  heroCaptionLabel: string;
  topbarText: string;
  footerText: string;
  stickyHeader: boolean;
};

export type PageSeo = {
  title: string;
  description: string;
  focusKeyphrase: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  noindex: boolean;
};

export type SeoPageKey = 'home' | 'hire' | 'contact';

export type Seo = {
  siteUrl: string;
  titleSeparator: string;
  allowIndexing: boolean;
  defaultOgImageUrl: string;
  twitterHandle: string;
  googleVerification: string;
  bingVerification: string;
  pages: Record<SeoPageKey, PageSeo>;
  schema: {
    enabled: boolean;
    type: string;
    name: string;
    telephone: string;
    email: string;
    streetAddress: string;
    locality: string;
    region: string;
    country: string;
    sameAs: string[];
  };
};

export type CustomCode = { head: string; bodyStart: string; bodyEnd: string };

export const SKILL_ICONS = ['auto', 'computer', 'documents', 'internet', 'code', 'network', 'data', 'ai', 'security', 'design', 'book'] as const;
export type SkillIcon = typeof SKILL_ICONS[number];
export type PathwaySkill = { title: string; description: string; icon: SkillIcon };
export const PATHWAY_COLORS = ['auto', 'blue', 'green', 'purple', 'orange', 'teal', 'pink'] as const;
export type PathwayColor = typeof PATHWAY_COLORS[number];
export const PATHWAY_ART = ['auto', 'web', 'network', 'data', 'ai', 'general'] as const;
export type PathwayArt = typeof PATHWAY_ART[number];

export type Pathway = {
  id: string;
  title: string;
  headline: string;
  description: string;
  details: string;
  skills: PathwaySkill[];
  image: string;
  imageAlt: string;
  color: PathwayColor;
  art: PathwayArt;
  featured: boolean;
  visible: boolean;
  notify: boolean;
  /** Open for applications: shows “Apply now” instead of the “Email me when this programme starts” form. */
  active: boolean;
  applyUrl: string;
};

export type FieldType = 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox';

export type FormField = {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  placeholder: string;
  help: string;
  required: boolean;
  visible: boolean;
  options: string[];
  width: 'half' | 'full';
  min?: number | null;
  max?: number | null;
  locked?: boolean;
};

export type FormSection = { id: string; title: string; fields: FormField[] };

export type FormId = 'enquiry' | 'contact';

export type FormDef = {
  id: FormId;
  eyebrow: string;
  title: string;
  intro: string;
  sections: FormSection[];
  consentText: string;
  submitLabel: string;
  successMessage: string;
  subject: string;
  recipients: string;
  checkDateOrder: boolean;
  autoReply: { enabled: boolean; subject: string; body: string };
};

export type ContactInfo = {
  eyebrow: string;
  heading: string;
  intro: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  hours: string;
  showMap: boolean;
  mapEmbedUrl: string;
};

export type EmailTemplate = { enabled: boolean; subject: string; body: string };

/** Emails sent to subscribers. {programme}, {siteName} and {applyLink} are filled in when sending. */
export type SubscriberMessages = {
  programmeConfirm: EmailTemplate;
  newsletterConfirm: EmailTemplate;
  programmeNotice: EmailTemplate;
};

export type SiteContent = {
  branding: Branding;
  seo: Seo;
  code: CustomCode;
  pathways: Pathway[];
  forms: Record<FormId, FormDef>;
  contact: ContactInfo;
  messages: SubscriberMessages;
};

export type ContentKey = keyof SiteContent;
export const CONTENT_KEYS: ContentKey[] = ['branding', 'seo', 'code', 'pathways', 'forms', 'contact', 'messages'];

export type EmailSettings = {
  fromName: string;
  fromEmail: string;
  recipients: string;
  apiKey: string;
};

const page = (p: Partial<PageSeo>): PageSeo => ({ title: '', description: '', focusKeyphrase: '', ogTitle: '', ogDescription: '', ogImageUrl: '', noindex: false, ...p });

const field = (f: Partial<FormField> & Pick<FormField, 'key' | 'label'>): FormField => ({
  id: f.key, type: 'text', placeholder: '', help: '', required: false, visible: true, options: [], width: 'half', min: null, max: null, ...f
});

export const DEFAULT_CONTENT: SiteContent = {
  branding: {
    siteName: 'MPIITECH',
    tagline: 'Learn, Build & Grow',
    logoUrl: '/logo.png',
    logoAlt: 'MPIITECH',
    faviconUrl: '/favicon.png',
    heroImageUrl: '/center.jpg',
    heroImageAlt: 'The MPIITECH training center in Modakeke at sunset',
    heroCaption: 'A place to learn. A community to grow.',
    heroCaptionLabel: 'MPIITECH center, Modakeke',
    topbarText: 'An initiative of MPI, USA & Canada',
    footerText: 'An initiative of MPI, USA & Canada.',
    stickyHeader: true
  },
  seo: {
    siteUrl: '',
    titleSeparator: '|',
    allowIndexing: true,
    defaultOgImageUrl: '/center.jpg',
    twitterHandle: '',
    googleVerification: '',
    bingVerification: '',
    pages: {
      home: page({
        title: '%%sitename%% %%sep%% %%tagline%%',
        description: 'Learn practical digital skills at MPIITECH in Modakeke, Osun State. Explore training programmes and enquire about center hire.',
        focusKeyphrase: 'digital skills Modakeke'
      }),
      hire: page({
        title: 'Hire a training center in Modakeke %%sep%% %%sitename%%',
        description: 'Hire the MPIITECH center in Modakeke for corporate training, school sessions, computer-based testing, and certification. Send an enquiry today.',
        focusKeyphrase: 'training center hire Modakeke'
      }),
      contact: page({
        title: 'Contact us %%sep%% %%sitename%%',
        description: 'Contact MPIITECH in Modakeke, Osun State. Send us a message, call, or visit the center for programme and center hire enquiries.',
        focusKeyphrase: 'contact MPIITECH'
      })
    },
    schema: {
      enabled: true,
      type: 'EducationalOrganization',
      name: 'MPIITECH',
      telephone: '',
      email: '',
      streetAddress: 'Inside Old Akinola Estate, opposite Our Lady’s Girls High School',
      locality: 'Modakeke',
      region: 'Osun State',
      country: 'NG',
      sameAs: []
    }
  },
  code: { head: '', bodyStart: '', bodyEnd: '' },
  pathways: [
    {
      id: 'digital-foundations', title: 'Digital Foundations', headline: 'Get comfortable with computers.',
      description: 'Build confidence using a computer for school, work, and everyday life. A practical foundation for secondary school students and beginners.',
      details: '', image: '', imageAlt: '', color: 'auto', art: 'auto',
      skills: [
        { title: 'Computer parts, files, and folders', description: 'Learn the basic parts of a computer and how to manage your files.', icon: 'computer' },
        { title: 'Microsoft Office and productivity tools', description: 'Create documents, spreadsheets, and presentations with ease.', icon: 'documents' },
        { title: 'Using the internet and staying safe online', description: 'Explore the internet, find useful information, and learn how to stay safe.', icon: 'internet' },
        { title: 'An introduction to programming', description: 'Understand the basics of coding and start building simple projects.', icon: 'code' }
      ],
      featured: true, visible: true, notify: true, active: false, applyUrl: ''
    },
    {
      id: 'full-stack-web-development', title: 'Full-Stack Web Development', headline: '',
      description: 'Explore how websites work, from what a visitor sees to the systems behind the page.',
      details: 'Learn the foundations of HTML, CSS, JavaScript, databases, and full-stack development through practical projects.', image: '', imageAlt: '', color: 'blue', art: 'web',
      skills: [
        { title: 'HTML & CSS', description: 'Build and style your own web pages.', icon: 'code' },
        { title: 'JavaScript', description: 'Make pages interactive with buttons, games, and forms.', icon: 'code' },
        { title: 'Databases', description: 'Store and organise the information behind a website.', icon: 'data' }
      ],
      featured: false, visible: true, notify: true, active: false, applyUrl: ''
    },
    {
      id: 'network-administration-security', title: 'Network Administration & Security', headline: '',
      description: 'Develop skills to connect computers, support networks, and protect digital systems.',
      details: 'Explore computer networks, administration, troubleshooting, and the fundamentals of digital security.', image: '', imageAlt: '', color: 'green', art: 'network',
      skills: [
        { title: 'Computer Networks', description: 'See how computers connect and share information.', icon: 'network' },
        { title: 'System Administration', description: 'Set up, manage, and troubleshoot computers and users.', icon: 'computer' },
        { title: 'Cyber Security', description: 'Protect devices, data, and people from online threats.', icon: 'security' }
      ],
      featured: false, visible: true, notify: true, active: false, applyUrl: ''
    },
    {
      id: 'data-analytics-python', title: 'Data Analytics with Python', headline: '',
      description: 'Learn how to work with data and turn information into useful insights.',
      details: 'Build skills in Python, data preparation, analysis, and communicating findings through practical exercises.', image: '', imageAlt: '', color: 'purple', art: 'data',
      skills: [
        { title: 'Python Basics', description: 'Write your first programs with a beginner-friendly language.', icon: 'code' },
        { title: 'Data Analysis', description: 'Clean, sort, and explore real data to find answers.', icon: 'data' },
        { title: 'Data Visualization', description: 'Turn numbers into clear charts and stories.', icon: 'data' }
      ],
      featured: false, visible: true, notify: true, active: false, applyUrl: ''
    },
    {
      id: 'ai-engineering', title: 'AI Engineering', headline: '',
      description: 'Build the programming and practical AI skills to create useful intelligent applications and agents.',
      details: 'Explore programming foundations, AI applications, and practical projects that solve everyday problems.', image: '', imageAlt: '', color: 'orange', art: 'ai',
      skills: [
        { title: 'AI Fundamentals', description: 'Understand what AI is, how it learns, and how to use it responsibly.', icon: 'ai' },
        { title: 'Prompt Engineering', description: 'Give AI tools clear instructions to get useful results.', icon: 'ai' },
        { title: 'Build AI Projects', description: 'Create simple apps and assistants that solve real problems.', icon: 'code' }
      ],
      featured: false, visible: true, notify: true, active: false, applyUrl: ''
    }
  ],
  forms: {
    enquiry: {
      id: 'enquiry',
      eyebrow: 'Tell us what you need',
      title: 'Enquire about center hire',
      intro: 'Share a few details about your training or assessment. Tell us what you need, then we’ll confirm the capacity, arrangements, and pricing before a booking is agreed.',
      sections: [
        { id: 'contact', title: '1. Your organisation and contact', fields: [
          field({ key: 'organisation', label: 'Organisation / school name', required: true }),
          field({ key: 'name', label: 'Contact person', required: true, locked: true }),
          field({ key: 'email', label: 'Email address', type: 'email', required: true, locked: true }),
          field({ key: 'phone', label: 'Phone / WhatsApp number', type: 'tel', placeholder: 'e.g. +234…', required: true })
        ] },
        { id: 'purpose', title: '2. What will you use the center for?', fields: [
          field({ key: 'purpose', label: 'Training or assessment type', type: 'select', required: true, width: 'full', placeholder: 'Select a use',
            options: ['Corporate training', 'School training sessions', 'Computer-based testing', 'Certification programmes', 'Employee upskilling', 'Other'] }),
          field({ key: 'topic', label: 'Training topic / assessment name', placeholder: 'Tell us the subject or programme', required: true, width: 'full' })
        ] },
        { id: 'timing', title: '3. Group size and timing', fields: [
          field({ key: 'participants', label: 'Number of participants', type: 'number', required: true, min: 1, max: 10000, help: 'Attendance limit: capacity will be confirmed by the team.' }),
          field({ key: 'times', label: 'Preferred session times', placeholder: 'e.g. 9am–3pm, three Saturdays' }),
          field({ key: 'startDate', label: 'Preferred start date', type: 'date', required: true }),
          field({ key: 'endDate', label: 'Preferred end date', type: 'date', required: true }),
          field({ key: 'flexibleDates', label: 'My dates and/or session times are flexible.', type: 'checkbox', width: 'full' })
        ] },
        { id: 'support', title: '4. Equipment and support', fields: [
          field({ key: 'support', label: 'What support do you need?', type: 'select', required: true, placeholder: 'Select an arrangement',
            options: ['Single session', 'Multiple sessions', 'Weekly programme', 'Other'] }),
          field({ key: 'computers', label: 'Computer systems required', type: 'number', min: 0, max: 10000, help: 'Enter 0 if you will bring your own computers.' }),
          field({ key: 'equipment', label: 'Other equipment / access needs (optional)', type: 'textarea', width: 'full', placeholder: 'e.g. projector, sound system, internet, specific software, accessibility requirements' }),
          field({ key: 'budget', label: 'Budget range in NGN', placeholder: 'e.g. ₦100,000–₦150,000 (optional)' }),
          field({ key: 'notes', label: 'Anything else we should know? (optional)', type: 'textarea', width: 'full', placeholder: 'Learning goals, frequency, deadlines, or special arrangements' })
        ] }
      ],
      consentText: 'I agree that MPIITECH may use these details to respond to and manage my enquiry. This does not subscribe me to the newsletter.',
      submitLabel: 'Submit this enquiry',
      successMessage: 'Thank you! Your enquiry has been received. The MPIITECH team will contact you to discuss availability and next steps.',
      subject: 'MPIITECH — New center hire enquiry',
      recipients: '',
      checkDateOrder: true,
      autoReply: {
        enabled: false,
        subject: 'We received your center hire enquiry',
        body: 'Hello {name},\n\nThank you for your enquiry about hiring the MPIITECH center. Our team will review your request and contact you to confirm availability, arrangements, and pricing.\n\nMPIITECH'
      }
    },
    contact: {
      id: 'contact',
      eyebrow: 'Send us a message',
      title: 'How can we help?',
      intro: 'Ask about programmes, intakes, center hire, or anything else. We usually reply within two working days.',
      sections: [
        { id: 'details', title: '', fields: [
          field({ key: 'name', label: 'Your name', required: true, locked: true }),
          field({ key: 'email', label: 'Email address', type: 'email', required: true, locked: true }),
          field({ key: 'phone', label: 'Phone / WhatsApp number (optional)', type: 'tel', placeholder: 'e.g. +234…' }),
          field({ key: 'topic', label: 'What is this about?', type: 'select', required: true, placeholder: 'Select a topic',
            options: ['Programmes and intakes', 'Center hire', 'Learner portal', 'Partnerships', 'Something else'] }),
          field({ key: 'message', label: 'Message', type: 'textarea', required: true, width: 'full', placeholder: 'How can we help?' })
        ] }
      ],
      consentText: 'I agree that MPIITECH may use these details to respond to my message.',
      submitLabel: 'Send message',
      successMessage: 'Thank you! Your message has been sent. The MPIITECH team will get back to you soon.',
      subject: 'MPIITECH — New contact message',
      recipients: '',
      checkDateOrder: false,
      autoReply: {
        enabled: false,
        subject: 'Thanks for contacting MPIITECH',
        body: 'Hello {name},\n\nThank you for getting in touch. We have received your message and will reply as soon as we can.\n\nMPIITECH'
      }
    }
  },
  contact: {
    eyebrow: 'Contact us',
    heading: 'We’d love to hear from you.',
    intro: 'Questions about a programme, the next intake, or hiring the center? Send us a message or visit us in Modakeke.',
    address: 'Inside Old Akinola Estate,\nopposite Our Lady’s Girls High School,\nModakeke, Osun State, Nigeria.',
    phone: '',
    whatsapp: '',
    email: '',
    hours: 'Monday – Friday: 9am – 5pm\nSaturday: by appointment',
    showMap: true,
    mapEmbedUrl: ''
  },
  messages: {
    programmeConfirm: {
      enabled: true,
      subject: 'You’re on the list for {programme}',
      body: 'Hello,\n\nThank you for your interest in {programme} at {siteName}. You’re on the list, and we’ll email you as soon as applications open.\n\nYou’re receiving this because this email address was entered on our website. If that wasn’t you, you can ignore this message, or reply and we’ll remove it.\n\n{siteName}'
    },
    newsletterConfirm: {
      enabled: true,
      subject: 'Welcome to {siteName} updates',
      body: 'Hello,\n\nThank you for subscribing to updates from {siteName}. We’ll send you programme announcements, learning opportunities, and news from the center.\n\nYou’re receiving this because this email address was entered on our website. If that wasn’t you, or you change your mind, just reply and we’ll remove it.\n\n{siteName}'
    },
    programmeNotice: {
      enabled: true,
      subject: '{programme} is now open for applications',
      body: 'Hello,\n\nGood news! You asked us to let you know when {programme} starts at {siteName}. Applications are now open.\n\nApply here: {applyLink}\n\nPlaces may be limited, so we recommend applying soon. Reply to this email if you have any questions.\n\n{siteName}'
    }
  }
};

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = { fromName: '', fromEmail: '', recipients: '', apiKey: '' };

const isPlainObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Deep-merges stored data onto defaults so new fields keep working with older saved content. Arrays are replaced. */
export function withDefaults<T>(defaults: T, stored: unknown): T {
  if (stored === undefined || stored === null) return defaults;
  if (defaults === null || defaults === undefined) return stored as T;
  if (isPlainObject(defaults)) {
    if (!isPlainObject(stored)) return defaults;
    const out: Record<string, unknown> = { ...defaults };
    for (const [key, value] of Object.entries(stored)) out[key] = key in defaults ? withDefaults(defaults[key], value) : value;
    return out as T;
  }
  if (Array.isArray(defaults)) return (Array.isArray(stored) ? stored : defaults) as T;
  return (typeof stored === typeof defaults ? stored : defaults) as T;
}

export function slugify(text: string) {
  return text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'item';
}

/** Replaces Yoast-style variables in SEO titles and descriptions. */
export function seoVars(text: string, c: Pick<SiteContent, 'branding' | 'seo'>) {
  return text.replace(/%%sitename%%/g, c.branding.siteName).replace(/%%tagline%%/g, c.branding.tagline).replace(/%%sep%%/g, c.seo.titleSeparator || '|').replace(/\s+/g, ' ').trim();
}

export function splitList(value: string) {
  return value.split(/[,;\n]/).map(x => x.trim()).filter(Boolean);
}

export const visibleFields = (def: FormDef) => def.sections.flatMap(s => s.fields).filter(f => f.visible || f.locked);

/** Older saved content stored skills as plain strings. */
export function normaliseSkill(skill: unknown): PathwaySkill {
  if (typeof skill === 'string') return { title: skill, description: '', icon: 'auto' };
  const s = (skill ?? {}) as Partial<PathwaySkill>;
  return { title: String(s.title ?? ''), description: String(s.description ?? ''), icon: SKILL_ICONS.includes(s.icon as SkillIcon) ? s.icon as SkillIcon : 'auto' };
}

const ICON_KEYWORDS: [Exclude<SkillIcon, 'auto'>, RegExp][] = [
  ['security', /secur|safe|protect|cyber/i], ['internet', /internet|online|web brows|email/i], ['code', /program|cod|html|css|javascript|software|develop/i],
  ['documents', /office|word|excel|document|spreadsheet|presentation|productiv/i], ['network', /network|router|cabl|server/i],
  ['data', /data|analy|statist|chart|python/i], ['ai', /\bai\b|artificial|machine learning|agent/i], ['design', /design|graphic|ui|ux/i],
  ['computer', /computer|hardware|file|folder|typing|keyboard/i]
];
export function skillIcon(skill: PathwaySkill): Exclude<SkillIcon, 'auto'> {
  if (skill.icon !== 'auto') return skill.icon;
  return ICON_KEYWORDS.find(([, re]) => re.test(skill.title))?.[0] ?? 'book';
}

const ART_KEYWORDS: [Exclude<PathwayArt, 'auto'>, RegExp][] = [
  ['ai', /\bai\b|artificial|machine learning|intelligen/i], ['data', /data|analy|python|statist/i],
  ['network', /network|secur|cyber|cloud|system admin/i], ['web', /web|full.?stack|front.?end|back.?end|software|app|program|cod/i]
];
export function pathwayArt(p: Pick<Pathway, 'art' | 'title'>): Exclude<PathwayArt, 'auto'> {
  if (p.art !== 'auto' && PATHWAY_ART.includes(p.art)) return p.art;
  return ART_KEYWORDS.find(([, re]) => re.test(p.title))?.[0] ?? 'general';
}
const AUTO_COLORS: Exclude<PathwayColor, 'auto'>[] = ['blue', 'green', 'purple', 'orange'];
export function pathwayColor(p: Pick<Pathway, 'color'>, index: number): Exclude<PathwayColor, 'auto'> {
  return p.color !== 'auto' && PATHWAY_COLORS.includes(p.color) ? p.color : AUTO_COLORS[index % AUTO_COLORS.length];
}

/**
 * A page on the portal, from the one setting that says where the portal is.
 * Built from the setting's origin, so it works whether NEXT_PUBLIC_PORTAL_URL
 * was entered as the bare address or with a path on the end. Null when it is
 * not set (or is not an address), so callers fall back rather than link nowhere.
 */
export function portalPage(path: string): string | null {
  const base = process.env.NEXT_PUBLIC_PORTAL_URL;
  if (!base) return null;
  try { return new URL(path, new URL(base).origin).toString(); } catch { return null; }
}

/**
 * Where “Apply now” goes: the pathway’s own link, else the portal’s application
 * form, else the contact page. The form, not the portal’s front door — that is
 * a sign-in screen, and somebody applying for the first time has nothing to
 * sign in with.
 */
export function applyLink(p: Pick<Pathway, 'applyUrl'>) {
  return p.applyUrl || portalPage('/apply') || '/contact';
}

/** Fills {programme}, {siteName}, {applyLink} and {name} in a subscriber email. */
export function fillTemplate(text: string, values: { programme?: string; siteName: string; applyLink?: string; name?: string }) {
  return text
    .replace(/\{programme\}/g, values.programme ?? '')
    .replace(/\{siteName\}/g, values.siteName)
    .replace(/\{applyLink\}/g, values.applyLink ?? '')
    .replace(/\{name\}/g, values.name || 'there');
}
