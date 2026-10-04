# Verification

- Production build: passed (`npm run build`).
- TypeScript: passed (`npm run typecheck`).
- Form and email contract checks: passed (`npm run verify:email`). Covers validation, consent, date order, dropdown options, number ranges, origin rejection, missing configuration with and without storage, all four form types, default and per-form recipients, hidden questions, automatic replies, reply-to, idempotency, retried submissions, honeypot, provider failure and the delivery log. Resend is mocked; no real emails are sent. Uses local file storage in a temporary folder.
- Browser check (Chromium, production build, local file storage): home and contact pages at desktop and mobile widths, mobile menu, contact and programme form submissions, admin sign-in (wrong and right password), every admin page, adding/hiding a pathway, adding a form question, logo upload and site title change, SEO site address and Search Console code, custom head/footer scripts executing on the public site, submission status change, CSV export, and the test-email error when email is not configured.
- Not verified here: the Postgres (Neon) storage backend against a real database, and live Resend delivery and delivery-status refresh. Connect a database and Resend key, then send a test email from Admin → Email & delivery log.
