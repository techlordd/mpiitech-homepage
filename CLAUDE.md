# Project instructions

## Git
- Commit as `Techlordd <techlordd@gmail.com>`. Before committing, set it for the repo:
  `git config user.name "Techlordd" && git config user.email "techlordd@gmail.com"`
- Never add Claude/AI attribution anywhere: no `Co-Authored-By` trailers, no `Claude-Session` links, and no "Generated with Claude Code" lines in commit messages, pull request titles or descriptions, or comments.

## Checks before pushing
- `npm run typecheck`, `npm run build` and `npm run verify:email` must pass.

## This site and the portal
- **mpiitech.com is for reading; portal.mpiitech.com is for doing.** Anything a person signs into or fills in for the centre (sign-in, applications, fees, results, membership cards, certificate checks) lives on the portal, a separate project (`techlordd/Mpiitech`). This site informs and links across.
- **Do not build a `/login` page here.** One sign-in for the whole centre is what keeps members and trainees from typing their portal password into the wrong box. This site's own admin stays at `/admin/login`.
- **The names in `PORTAL_PAGES` in `next.config.ts` are reserved.** Those addresses used to be the system's, so emails already sent link to them on this domain, and they are forwarded to the portal. A page built here with one of those names does show (the list is filtered against this site's own routes at build time), but every old link to it then stops reaching the portal. Pick a different name: `/programmes`, not `/apply`.
- **The list never needs to grow.** New portal pages only ever exist on the portal, so there are no old links to them on this domain.
- **Link to the portal through `portalPage()` in `lib/content.ts`**, which reads `NEXT_PUBLIC_PORTAL_URL`, never a typed address. If the portal moves, one setting changes. "Apply now" goes to the portal's `/apply` form, not its front page, which is a sign-in screen.
- **Never set a cookie on `.mpiitech.com`.** Each site keeps its sign-in to its own host, so signing out of one cannot affect the other.
