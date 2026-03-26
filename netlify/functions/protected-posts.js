'use strict';

/**
 * Netlify Function: protected-posts
 * Route: GET /api/protected-posts
 * Returns metadata list of protected posts (no content, no password).
 */

const { listFiles, fetchRaw }     = require('./_lib/github');
const { buildProtectedMeta }      = require('./_lib/frontmatter');
const { CORS, handleOptions }     = require('./_lib/cors');
const { REPO, BASE_PROTECTED }    = require('./_lib/config');   // ← was hardcoded

let cache = null;
const CACHE_TTL_MS = 60 * 1000;

exports.handler = async (event) => {
  const preflight = handleOptions(event);
  if (preflight) return preflight;

  if (cache && Date.now() - cache.cachedAt < CACHE_TTL_MS) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify(cache.data) };
  }

  try {
    const files = await listFiles(REPO, BASE_PROTECTED);

    const metaList = (await Promise.all(
      files.map(async ({ path }) => {
        const slug = path.replace(`${BASE_PROTECTED}/`, '').replace(/\.md$/i, '');
        const raw  = await fetchRaw(REPO, BASE_PROTECTED, slug);
        return raw ? buildProtectedMeta(slug, raw) : null;
      })
    ))
      .filter(Boolean)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    cache = { data: metaList, cachedAt: Date.now() };
    return { statusCode: 200, headers: CORS, body: JSON.stringify(metaList) };

  } catch (err) {
    console.error('[protected-posts]', err);
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Failed to fetch protected posts.' }) };
  }
};