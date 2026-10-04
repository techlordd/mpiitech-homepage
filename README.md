# MPIITECH homepage — Vercel ready

One-page responsive Next.js / TypeScript recreation of the supplied MPIITECH screenshot, with server-side Resend email delivery. Built by Techlordd Konsult.

## Local development

Requires Node.js 20.9 or newer.

```bash
npm ci
cp .env.example .env.local   # set at least ADMIN_PASSWORD
npm run dev
```

Open http://localhost:3000 for the website and http://localhost:3000/admin for the dashboard. Without `DATABASE_URL`, local development stores everything in a `.data/` folder (git-ignored). Production checks: `npm run build`, `npm run typecheck` and `npm run verify:email`.

## Deploy on Vercel

1. Import the GitHub repository in Vercel. Next.js is detected automatically.
2. Add a Postgres database: Vercel → Storage → Marketplace → **Neon** → connect it to this project. This sets `DATABASE_URL`. Tables are created automatically on first use.
3. Add the environment variables below for Production (and Preview if needed), then deploy. Redeploy after changing environment variables.
4. Visit `/admin`, sign in, and work through the setup checklist on the Overview page.

| Variable | Value |
| --- | --- |
| `ADMIN_PASSWORD` | Required to sign in to `/admin`. Use a long, unique password. |
| `ADMIN_USERNAME` | Optional, defaults to `admin`. |
| `ADMIN_SESSION_SECRET` | Optional extra secret for signing sessions. Changing it (or the password) signs everyone out. |
| `DATABASE_URL` | Postgres connection string (set automatically by the Neon integration). `POSTGRES_URL` also works. |
| `RESEND_API_KEY` | Resend API key. Can instead be entered in the dashboard. |
| `RESEND_FROM_EMAIL` | `MPIITECH <hello@your-verified-domain.com>` — verify that domain in Resend first. Can be set in the dashboard. |
| `CONTACT_TO_EMAIL` | Inbox(es) that receive submissions, comma-separated. Can be set in the dashboard. |
| `NEXT_PUBLIC_PORTAL_URL` | Optional existing application / learner portal URL. |

On Vercel without a database the public site still works with the default content, but the dashboard cannot save changes and submissions are only emailed.

## Admin dashboard (`/admin`)

- **Overview** — new submissions, failed emails and a setup checklist.
- **Pathways** — add, edit, reorder, hide or remove programmes; choose the featured “Start here” card; turn the “email me when this programme starts” form on or off; see how many people are interested in each.
- **Forms** — edit the center hire enquiry and contact forms: wording, questions, answer types, dropdown choices, required/hidden questions, new questions and sections, per-form notification recipients and subject, and an optional automatic reply to the visitor.
- **Inbox** — every submission (center hire, contact, programme interest, newsletter) is saved. Filter, search, set a status, add internal notes, reply by email or WhatsApp, bulk close/delete, and download CSV.
- **Contact page** — heading, address, phone, WhatsApp, email, opening hours and map.
- **Site branding** — site title, tagline, logo, favicon, hero image and captions, top bar and footer text. Images are uploaded to the database and served from `/media/…`.
- **SEO** — Yoast-style per-page SEO title (with `%%sitename%%`, `%%tagline%%`, `%%sep%%`), meta description, focus keyphrase analysis, Google and social previews, noindex, social images, site-wide indexing switch, Google Search Console and Bing verification, and Organisation structured data. `/sitemap.xml` and `/robots.txt` are generated automatically.
- **Email & delivery log** — sender, recipients and API key (stored server-side, never shown again), test email, and a log of every send attempt with Resend delivery status (delivered, opened, bounced…).
- **Custom code** — snippets for `<head>`, after `<body>` and before `</body>` on public pages (Google Analytics, Tag Manager, Meta Pixel, chat widgets, verification tags).

## Forms and delivery

- Every submission is validated on the server against the form definition, stored in the database, then emailed to the configured inbox with reply-to set to the visitor.
- If email is not configured or fails, the submission is still saved and the failure appears in the delivery log. Without a database, a failed email is reported to the visitor.
- A honeypot and browser origin check provide basic abuse protection. Resend idempotency keys and submission IDs prevent duplicates. Add a Vercel Firewall rate-limit rule on POST `/api/contact` before a high-traffic launch.
- Programme and newsletter requests are collected in the dashboard; they do not automatically enrol people in a Resend audience.

## Design and content

The logo (`public/logo.png`, transparent for the white header; `public/logo-dark.png` for dark backgrounds), favicon (`public/favicon.*`) and hero photo (`public/center.jpg`) come from the supplied originals. They are the defaults and can be replaced from **Admin → Site branding**.

The authenticated reference site was not accessible in the available browser session. Small copy that was unreadable in the screenshot has been reconstructed; check it, the address, programme wording, privacy notice, and portal URL before publishing. No fees or intake dates are invented.

Main files:
- `app/(site)/` — public pages (home, contact) and their layout
- `app/admin/` — dashboard pages, server actions and styles
- `app/api/contact/route.ts` — validated form submissions
- `lib/content.ts` — editable content model and defaults
- `lib/store.ts` — Postgres / local file storage
- `lib/email.ts` — Resend sending and delivery log
- `components/` — header, footer and forms

## Verification

See `VERIFICATION.md`.
