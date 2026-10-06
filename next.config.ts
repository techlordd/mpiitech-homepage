import type { NextConfig } from 'next';

/**
 * The management system lives at portal.mpiitech.com. It used to answer at
 * mpiitech.com, so emails already sent (password resets, "your account is
 * ready", fee and result notices), bookmarks and anything printed carry links
 * to its pages on this domain. Each of those addresses is forwarded to the
 * same page on the portal, query string included, so a reset link still works.
 *
 * Only the system's own addresses are listed. This site's pages (/, /contact,
 * /hire-the-center, /privacy, /admin, /api/contact, /media) are not on it, so
 * nothing here can take over a page of the landing site.
 *
 * Temporary (307), so browsers do not remember it: if this site later wants
 * one of these addresses for itself, taking it off the list is enough.
 */
const PORTAL = 'https://portal.mpiitech.com';

const PORTAL_PAGES = [
  // Signing in, and the public pages
  'login', 'forgot-password', 'reset-password', 'change-password', 'no-access',
  'apply', 'verify', 'm', 'pay', 'sit',
  // Everything behind the sign-in
  'dashboard', 'my', 'inbox', 'academics', 'admissions', 'announcements', 'assessments',
  'attendance', 'audit-logs', 'certificates', 'classes', 'cohorts', 'committees',
  'contributions', 'departments', 'documents', 'dues', 'enrollments', 'examinations',
  'exams', 'expenses', 'facilities', 'fees', 'finance', 'governance', 'innovation',
  'maintenance', 'meetings', 'members', 'messages', 'newsletters', 'offices', 'partners',
  'partnerships', 'payslips', 'people', 'placements', 'programs', 'question-bank',
  'receipts', 'recruitment', 'reports', 'resolutions', 'results', 'roles', 'settings',
  'sponsors', 'staff', 'summary', 'users', 'visitors',
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() { return [{ source: '/(.*)', headers: [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Frame-Options', value: 'DENY' }
  ] }]; },
  async redirects() {
    return [
      {
        source: `/:page(${PORTAL_PAGES.join('|')})/:rest*`,
        destination: `${PORTAL}/:page/:rest*`,
        permanent: false,
      },
      // The system's two outside-facing endpoints. The landing site's own
      // /api/contact and /api/admin are not touched.
      {
        source: '/api/:area(paystack|files)/:rest*',
        destination: `${PORTAL}/api/:area/:rest*`,
        permanent: false,
      },
    ];
  },
};
export default nextConfig;
