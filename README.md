# shoei451-website

Personal learning tools site by Shoei451.
Production: [shoei451.netlify.app](https://shoei451.netlify.app)

---

## Overview

`shoei451-website` is a static HTML/CSS/JS repository for study tools, category landing pages, and site-wide utility pages.

- Frontend: Vanilla HTML/CSS/JS
- Hosting: Netlify
- Shared category routing: `sub-index.html?slug=...` + `js/sub-index-init.js`
- Shared runtimes: `quiz/` for quizzes, `timeline/` for timelines
- Data-backed pages: Supabase (`js/supabase_config.js`)
- Repo checks: `scripts/check-js.mjs`, `scripts/check-links.mjs`
- Deploy model: static site + Netlify functions/edge functions, no checked-in site build step required

---

## Current Status (2026-03-31)

### Working now

- Shared sub-index routing via `sub-index.html?slug=...` + `js/sub-index-init.js`
- Shared quiz runtime under `quiz/` with configs in `quiz/config/`
- Shared timeline runtime under `timeline/` with configs in `timeline/config/`
- Access logging via `sendBeacon('/api/sw?...')` -> `netlify/edge-functions/sw.js`
- Top-level site pages include `404.html`, `privacy-policy.html`, `sitemap.html`, and `about/`
- Active category/content roots are `history/`, `geography/`, `seikei/`, `miscellaneous/`, `projects/`, `learning-links/`, and `playground/`

### Legacy / transitional areas

- `history/index.html` remains the legacy world-history timeline alongside `timeline/?slug=world-history`
- `history/list.json` still describes the new world-history timeline as "旧データ移行中"
- `timeline/admin/wh-admin-legacy.html` is still kept as a legacy admin page
- `archives/` stores retired scripts/assets that are no longer part of the active runtime

---

## Repository Layout

- `about/` - profile page, structured bio data, and styles
- `archives/` - archived scripts/assets kept for reference
- `history/`, `geography/`, `seikei/`, `miscellaneous/` - category content and `list.json` data
- `quiz/` - reusable quiz runtime and configs
- `timeline/` - shared timeline runtime and admin pages
- `learning-links/` - curated external learning links
- `playground/` - standalone experiments and mini-apps
- `projects/` - external project listing data
- `js/`, `css/` - shared site assets
- `netlify/` - Edge Functions and Netlify Functions
- `scripts/` - local repository checks

Root pages:

- `index.html`
- `sub-index.html`
- `404.html`
- `privacy-policy.html`
- `sitemap.html`

---

## Tooling

Install dependencies:

```bash
npm install
```

Quality checks:

```bash
npm run check
```

Other useful commands:

```bash
npm run tree
```

---

## Supabase Tables Used In This Repo

Defined in `js/supabase_config.js`:

- `WH_QUIZ`
- `WH_DATES`
- `WH_REGIONS`
- `CHINESE`
- `SEIKEI`
- `ACCESS_LOG`
- `ENGLISH_IDIOMS`

The checked-in client exports both module bindings and `window.SUPABASE_TABLES` / `window._db` for non-module scripts.

---

## Contact

okamotoshoei451@gmail.com
