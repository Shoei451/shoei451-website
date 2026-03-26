# shoei451-website

Personal learning tools site by Shoei451.  
Production: [shoei451.netlify.app](https://shoei451.netlify.app)

---

## Overview

`shoei451-website` is a static HTML/CSS/JS repository with Supabase-backed data pages.

- Frontend: Vanilla HTML/CSS/JS
- Data: Supabase (Project 1 is active in this repo)
- Hosting: Netlify
- Docs viewer: `docs/index.html` (renders markdown files in the repo)

No framework build step is required to author pages.  
A small Node script (`build.js`) injects access-log beacons into HTML before deploy.

---

## Current Status (2026-03-26)

### Already implemented

- Unified sub-index engine via `sub-index.html?slug=...` + `js/sub-index-init.js`
- Access logging pipeline: `sendBeacon` -> Netlify Edge Function (`/api/sw`) -> Supabase `access_logs`
- Shared utility helpers in `js/wh-utils.js`
- `wh_dates` admin UI in `history/world/admin/` (`index.html`, `main.html`, `memo.html`)
- Quiz component modules under `quiz-components/` (used by world split quizzes and idiom quiz)

### In progress / pending

- World/China frontend migration from legacy tables to `wh_dates`
- Static JSON build pipeline for the "submission box" model
- Cleanup of legacy/unused template files

---

## Repository Layout

Main directories:

- `history/` - history tools (world/china/admin)
- `geography/`
- `home-economics/`
- `informatics/`
- `koten/`
- `seikei/`
- `others/`
- `projects/`
- `quiz-components/` - reusable quiz UI modules
- `docs/` - markdown viewer + docs tooling
- `netlify/edge-functions/` - Edge Function handlers

Root pages:

- `index.html` - top page
- `sub-index.html` - shared category index renderer
- `learning-links.html`
- `404.html`

---

## Sub-index Routing

Category pages are rendered by one shared template:

- `/sub-index.html?slug=history`
- `/sub-index.html?slug=geography`
- `/sub-index.html?slug=home-economics`
- `/sub-index.html?slug=seikei`
- `/sub-index.html?slug=koten`
- `/sub-index.html?slug=informatics`
- `/sub-index.html?slug=others`
- `/sub-index.html?slug=projects`

`js/sub-index-init.js` loads `{slug}/list.js`, reads `window.PAGE_CONFIG`, and builds the page dynamically.

---

## Supabase Configuration

Shared config file: `js/supabase_config.js`

- `db` (Project 1): used by this repository's learning pages
- `db2` (Project 2): key placeholder may remain if unused in this repo

Table constants are centralized in `TABLES` (e.g. `WH_QUIZ`, `WH_DATES`, `CHINESE`, `SEIKEI`, `ACCESS_LOG`).

---

## Access Log Architecture

Flow:

1. HTML page sends beacon: `navigator.sendBeacon('/api/sw?...')`
2. Netlify Edge Function: `netlify/edge-functions/sw.js`
3. Supabase insert into `access_logs`

Netlify routing is configured in `netlify.toml`:

- Edge path: `/api/sw`
- Build command: `node build.js`

---

## Local Development

### Install dependencies (for checks/tools)

```bash
npm install
```

### Quality checks

```bash
npm run check
```

This runs:

- `npm run check:js` -> syntax check for all `.js`
- `npm run check:links` -> local link/path checks across `.html`

### Optional utility scripts

```bash
# Replace legacy inline theme toggle blocks with container placeholder
npm run inject:theme

# Regenerate docs/file-tree.js (after adding/removing markdown files)
node docs/build.js

# Sync markdown with Obsidian (requires docs/sync-config.js)
npm run sync

# Inject sendBeacon snippet into html files (used in deploy too)
node build.js
```

---

## Documentation Workflow (`docs/`)

- Markdown source of truth: `docs/md/`
- Viewer: `docs/index.html`
- Generated file tree: `docs/file-tree.js`
- Generator script: `docs/build.js`
- Optional sync tool: `docs/sync.js`

If markdown files are added/removed, run `node docs/build.js`.

---

## Known Technical Debt

- `history/world/admin/script.js` contains both old modal logic and new wizard logic in one file
- World/China frontend pages still read legacy tables (`WH_QUIZ`, `CHINESE`) while admin is already `WH_DATES`
- `templates/` includes files that are not referenced by production pages

Tracked in: `docs/md/todo.md` and `docs/md/cleanup.md`

---

## Contact

okamotoshoei451@gmail.com
