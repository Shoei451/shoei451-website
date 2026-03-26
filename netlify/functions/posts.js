const REPO = 'Shoei451/md-contents';
const BASE = 'shoei451-website/public_posts';
const API  = 'https://api.github.com';

function ghHeaders() {
  const token = process.env.GITHUB_TOKEN;
  return {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function listFiles() {
  const res = await fetch(`${API}/repos/${REPO}/contents/${BASE}?ref=main`, { headers: ghHeaders() });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const items = await res.json();
  return items.filter(item => item.name.endsWith('.md'));
}

async function fetchRaw(slug) {
  const res = await fetch(`${API}/repos/${REPO}/contents/${BASE}/${slug}.md?ref=main`, { headers: ghHeaders() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return Buffer.from(json.content, 'base64').toString('utf-8');
}

const DEFAULT_COMPONENTS = { katex: false, highlight: false };

function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };

  const meta = {};
  let block = null;

  for (const line of match[1].split('\n')) {
    if (/^\s+\S/.test(line)) {
      if (!block) continue;
      const c = line.indexOf(':');
      if (c === -1) continue;
      const k = line.slice(0, c).trim();
      const v = line.slice(c + 1).trim();
      if (k) meta[block][k] = v === 'true' ? true : v === 'false' ? false : v;
      continue;
    }
    block = null;
    const c = line.indexOf(':');
    if (c === -1) continue;
    const k = line.slice(0, c).trim();
    const v = line.slice(c + 1).trim();
    if (!k) continue;
    if (v === '') { meta[k] = {}; block = k; } else { meta[k] = v; }
  }

  return { meta, content: match[2] };
}

function buildMeta(filename, rawMd) {
  const slug = filename.replace(/\.md$/i, '');
  const { meta } = parseFrontmatter(rawMd);
  return {
    slug,
    title:       meta.title       || slug,
    date:        meta.date        || '',
    description: meta.description || '',
    thumbnail:   meta.thumbnail   || '',
    category:    meta.category    || '',
    components:  Object.assign({}, DEFAULT_COMPONENTS,
                   typeof meta.components === 'object' ? meta.components : {}),
  };
}

let cache = null;
const CACHE_TTL_MS = 60 * 1000;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };

  if (cache && Date.now() - cache.cachedAt < CACHE_TTL_MS) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify(cache.data) };
  }

  try {
    const files = await listFiles();
    const metaList = (await Promise.all(
      files.map(async (file) => {
        const slug = file.name.replace(/\.md$/i, '');
        const raw  = await fetchRaw(slug);
        return raw ? buildMeta(file.name, raw) : null;
      })
    ))
      .filter(Boolean)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    cache = { data: metaList, cachedAt: Date.now() };
    return { statusCode: 200, headers: CORS, body: JSON.stringify(metaList) };
  } catch (err) {
    console.error('[posts]', err);
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Failed to fetch posts.' }) };
  }
};