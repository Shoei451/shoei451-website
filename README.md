# shoei451-website

Personal learning tools site by Shoei451.
Production: [shoei451.netlify.app](https://shoei451.netlify.app)

---

## Overview

`shoei451-website` is a static HTML/CSS/JS repository with a mix of fully static pages and Supabase-backed study tools.

- Frontend: Vanilla HTML/CSS/JS
- Hosting: Netlify
- Data-backed pages: Supabase Project 1 (`js/supabase_config.js`)
- Build utility: `build.js` injects access-log beacons into HTML before deploy
- Note: 現在はbuild.jsを廃止し、Netlifyでの[Snippet injection](https://docs.netlify.com/build/post-processing/snippet-injection/)機能を利用

The old `docs/` viewer and sync flow were removed on 2026-03-26. Project notes now live outside the repo under `../md-contents/shoei451-website`(private). You can view docs on [my another website](https://451-docs.netlify.app/?site=shoei451-website)

---

## Current Status (2026-03-27)

### Working now

- Shared sub-index routing via `sub-index.html?slug=...` + `js/sub-index-init.js`
- Access logging via `sendBeacon('/api/sw?...')` -> `netlify/edge-functions/sw.js`
- `history/world/admin/` manages `wh_dates`
- `quiz-components/` is in use for:
  - `history/world/year-to-event/`
  - `history/world/event-to-year/`
  - `others/idiom_quiz/`
- `css/quiz.css` + `js/quiz.js` are in use for:
  - `history/china/index.html`
  - `seikei/timeline/quiz.html`

### Still open

- `history/world/index.html`, `history/world/timeline.html`, and the split world quizzes still read `TABLES.WH_QUIZ`
- `history/china/index.html` and `history/china/timeline.html` still read `TABLES.CHINESE`
- `history/world/admin/script.js` still contains overlapping old/new modal logic
- `templates/` still contains archived tooling and HTML templates that are not part of the active runtime

---

## Repository Layout

- `history/` - world history, China history, admin tools
- `geography/`
- `home-economics/`
- `informatics/`
- `koten/`
- `seikei/`
- `others/`
- `projects/`
- `quiz-components/` - reusable quiz UI modules
- `netlify/edge-functions/` - Edge handlers
- `scripts/` - repo checks and utility scripts

Root pages:

- `index.html`
- `sub-index.html`
- `learning-links.html`
- `404.html`

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
# Replace legacy theme-toggle blocks where needed
npm run inject:theme

# Regenerate the repository tree snapshot
npm run tree

```

---

## Supabase Tables Used In This Repo

Defined in `js/supabase_config.js`:

- `WH_QUIZ`
- `WH_DATES`
- `CHINESE`
- `SEIKEI`
- `ACCESS_LOG`

`db2` remains in the config, but Project 2 is not wired into the current checked-in pages.

---

## Contact

okamotoshoei451@gmail.com
