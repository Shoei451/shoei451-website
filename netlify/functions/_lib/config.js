'use strict';

/**
 * _lib/config.js
 * Site-specific constants.
 *
 * To reuse this Functions stack on another site:
 *   1. Copy the entire netlify/functions/ directory.
 *   2. Edit only this file — change REPO and BASE_*.
 *   3. The rest of _lib/ and all Function handlers are unchanged.
 *
 * md-contents repo layout (example):
 *   Shoei451/md-contents
 *   ├── 451-docs/
 *   │   ├── public_posts/
 *   │   └── protected_posts/
 *   └── shoei451-website/          ← another site's content lives here
 *       ├── public_posts/
 *       └── protected_posts/
 */

module.exports = {
  /** GitHub repository that holds Markdown content. */
  REPO: 'Shoei451/md-contents',

  /** Path inside REPO for public posts. */
  BASE_PUBLIC: 'shoei451-website/public_posts',

  /** Path inside REPO for password-protected posts. */
  BASE_PROTECTED: 'shoei451-website/protected_posts',
};