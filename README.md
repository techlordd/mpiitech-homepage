# MPIITECH homepage — Vercel ready

One-page responsive Next.js / TypeScript recreation of the supplied MPIITECH screenshot, with server-side Resend email delivery. Built by Techlordd Konsult.

## Local development

Requires Node.js 20.9 or newer.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Production checks: `npm run build` and `npm run typecheck`.

## Deploy on Vercel

1. Unzip this project and push its contents into a GitHub repository.
2. In Vercel, import that repository. Next.js is detected automatically; use the directory containing `package.json` as the root.
3. Add the environment variables below in Project Settings → Environment Variables, for Production and Preview as needed.
4. Deploy. Redeploy after changing environment variables.

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | Your Resend API key. Server only; never prefix with NEXT_PUBLIC. |
| `RESEND_FROM_EMAIL` | `MPIITECH <hello@your-verified-domain.com>` — verify that domain in Resend first. |
| `CONTACT_TO_EMAIL` | Inbox that receives all enquiries and update requests. Comma-separated addresses are supported. |
| `NEXT_PUBLIC_PORTAL_URL` | Optional existing application / learner portal URL. Set this to enable the actual portal buttons. |

No Resend credentials or recipient address are included. Email delivery reports an honest setup error until configured. Resend's `onboarding@resend.dev` sender is restricted to testing with your own account email; use a verified sender domain for production.

## Forms and delivery

- Center hire enquiry: all contact, training, participant, date, equipment, budget, and notes fields are sent to the configured inbox.
- Programme notifications: email address, selected programme, and consent are emailed to the team.
- Newsletter: email address and consent are emailed to the team as a subscription request.
- These last two flows collect requests; they do not automatically enrol people in a Resend audience or send campaigns. The team manages requested updates separately.
- Replies to delivered enquiry emails go to the visitor's email address.
- Required fields, email format, lengths, numeric ranges, consent, and date order are checked on the server. A honeypot and browser origin check provide basic abuse protection. Resend idempotency keys prevent duplicates for the same submission ID. Add a Vercel Firewall rate-limit rule on POST `/api/contact` before making a high-traffic public deployment.
- Submissions are delivered by email; this app does not include a submissions database or dashboard.
- No automatic acknowledgement emails are sent to visitors. On-page success appears only after Resend accepts the message; acceptance does not guarantee inbox delivery.

## Design and content

The screenshot provides the section order, colours, layout, and visual reference. The attached screenshot is only 395 × 2048 pixels. The exact pictured logo and building illustration are extracted into `public/logo.png` and `public/center.png`, so their sharpness is limited. Replace them with high-resolution originals using the same filenames for a sharper result.

The authenticated reference site was not accessible in the available browser session. Small copy that was unreadable in the screenshot has been reconstructed; check it, the address, programme wording, privacy notice, and portal URL before publishing. No fees or intake dates are invented.

Main files:
- `app/page.tsx` — page sections and content
- `app/globals.css` — responsive design
- `components/forms.tsx` — AJAX forms and submission feedback
- `components/header.tsx` — navigation and mobile menu
- `app/api/contact/route.ts` — validated server-only Resend delivery
- `.env.example` — deployment configuration

## Verification

See `VERIFICATION.md` for the completed build and form checks. Live email delivery cannot be verified without configured Resend credentials.
