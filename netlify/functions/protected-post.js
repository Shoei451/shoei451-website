'use strict';

/**
 * Netlify Function: protected-post
 * Route: GET /api/protected-post?slug={slug}&password={raw_password}
 * Verifies password server-side. Never returns the password field.
 */

const { fetchRaw }                    = require('./_lib/github');
const { buildProtectedPostData,
        checkPassword }               = require('./_lib/frontmatter');
const { CORS, handleOptions }         = require('./_lib/cors');
const { REPO, BASE_PROTECTED }        = require('./_lib/config');   // ← was hardcoded

const VALID_SLUG = /^[\w][\w/-]*$/;

exports.handler = async (event) => {
  const preflight = handleOptions(event);
  if (preflight) return preflight;

  const slug     = (event.queryStringParameters?.slug     || '').trim();
  const password = (event.queryStringParameters?.password || '').trim();

  if (!slug || slug.includes('..') || !VALID_SLUG.test(slug)) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid or missing slug.' }) };
  }
  if (!password) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Password required.' }) };
  }

  try {
    const raw = await fetchRaw(REPO, BASE_PROTECTED, slug);

    if (!raw || !checkPassword(raw, password)) {
      return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Invalid password or post not found.' }) };
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify(buildProtectedPostData(slug, raw)) };

  } catch (err) {
    console.error('[protected-post]', err);
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Failed to fetch post.' }) };
  }
};