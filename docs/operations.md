# Website Operation Guide

## Update Flow
1. Edit or add `list*.js` data in each subject directory.
2. Confirm the target page uses shared scripts:
   - `../js/theme-toggle.js`
   - `../js/card-generator.js`
   - `../js/cards-page-init.js`
3. Configure sections with `initCardsPage([...])` at the bottom of each index page.

## New Subject Page Checklist
1. Copy `templates/index.html`.
2. Prepare `list1.js` (and `list2.js`, `list3.js` if needed).
3. Set containers in HTML (`container1`, `container2`, ...).
4. Set corresponding `itemsVar` in `initCardsPage`.
5. Add a card entry from top page data to link the new subject.

## Local Checks
Run before push:

```bash
npm run check
```

This runs:
- `check:js`: syntax check for all `.js` files (`node --check`)
- `check:links`: internal link check for `href` and `src` in all `.html` files

## CI
- GitHub Actions workflow: `.github/workflows/ci.yml`
- Triggered on pushes to `main` and all pull requests.
