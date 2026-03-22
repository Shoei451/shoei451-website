#!/usr/bin/env node
// scripts/migrate-sub-index.mjs

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT    = fileURLToPath(new URL('..', import.meta.url));
const DRY_RUN = process.argv.includes('--dry-run');
const ONLY    = (() => {
  const i = process.argv.indexOf('--only');
  if (i === -1) return null;
  const out = [];
  for (let j = i + 1; j < process.argv.length; j++) {
    if (process.argv[j].startsWith('--')) break;
    out.push(process.argv[j]);
  }
  return out.length ? out : null;
})();

const SKIP_DIRS = new Set([
  '.git', 'node_modules', 'netlify', 'css', 'js',
  'images', 'scripts', 'docs', 'templates',
]);

// ============================================================
// 自動検出
// ============================================================
function isSubIndexPage(html) {
  return (
    html.includes('sub-index.css') &&
    html.includes('common.css') &&
    html.includes('initCardsPage') &&
    !html.includes('PAGE_CONFIG')
  );
}

function collectCandidates(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;
    const folder    = join(dir, entry.name);
    const indexPath = join(folder, 'index.html');
    const listPath  = join(folder, 'list.js');
    if (!existsSync(indexPath) || !existsSync(listPath)) continue;
    const html   = readFileSync(indexPath, 'utf8');
    const listJs = readFileSync(listPath,  'utf8');
    if (isSubIndexPage(html) && !listJs.includes('PAGE_CONFIG')) {
      results.push(folder);
    }
  }
  return results;
}

// ============================================================
// HTML パース
// ============================================================
function extract(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function parseH1(html) {
  const header = html.match(/<header[\s\S]*?<\/header>/i)?.[0] ?? '';
  return extract(header, /<h1>([\s\S]*?)<\/h1>/i);
}

function parseHeaderDesc(html) {
  const header  = html.match(/<header[\s\S]*?<\/header>/i)?.[0] ?? '';
  const afterH1 = header.replace(/<h1>[\s\S]*?<\/h1>/i, '');
  return extract(afterH1, /<p>([\s\S]*?)<\/p>/i);
}

function parseTitle(html) {
  return extract(html, /<title>([\s\S]*?)<\/title>/i);
}

function parseSections(html) {
  const sections = [];
  const re = /class="section-divider"[\s\S]*?(?=class="section-divider"|<\/body>|<nav\b|<footer\b)/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const block = m[0];
    const title = extract(block, /class="section-title"[^>]*>([\s\S]*?)<\/h2>/i) ?? '';
    const desc  = extract(block, /class="section-description"[^>]*>([\s\S]*?)<\/p>/i) ?? '';
    sections.push({ title: title.trim(), desc: desc.trim() });
  }
  return sections;
}

function parseContainerIds(html) {
  const ids = [];
  for (const re of [
    /class="cards-container"\s+id="([^"]+)"/g,
    /id="([^"]+)"\s+class="cards-container"/g,
  ]) {
    let m;
    while ((m = re.exec(html)) !== null) {
      if (!ids.includes(m[1])) ids.push(m[1]);
    }
  }
  return ids;
}

function parseInitCardsPage(html) {
  const m = html.match(/initCardsPage\s*\(\s*\[([\s\S]*?)\]\s*\)/);
  if (!m) return [];
  const inner = m[1];
  const entries = [];
  const re1 = /\{[\s\S]*?itemsVar\s*:\s*["']([^"']+)["'][\s\S]*?containerId\s*:\s*["']([^"']+)["'][\s\S]*?\}/g;
  let em;
  while ((em = re1.exec(inner)) !== null) entries.push({ itemsVar: em[1], containerId: em[2] });
  if (entries.length) return entries;
  const re2 = /\{[\s\S]*?containerId\s*:\s*["']([^"']+)["'][\s\S]*?itemsVar\s*:\s*["']([^"']+)["'][\s\S]*?\}/g;
  while ((em = re2.exec(inner)) !== null) entries.push({ itemsVar: em[2], containerId: em[1] });
  return entries;
}

// ============================================================
// PAGE_CONFIG 文字列を生成
// ============================================================
function buildPageConfig(html, folderName) {
  const rawTitle     = parseTitle(html);
  const h1           = parseH1(html) ?? folderName;
  const headerDesc   = parseHeaderDesc(html) ?? '';
  const sectionDefs  = parseSections(html);
  const containerIds = parseContainerIds(html);
  const mappings     = parseInitCardsPage(html);

  const sections = sectionDefs.map((s, i) => {
    const map = mappings.find(m => m.containerId === containerIds[i])
             ?? mappings[i]
             ?? { itemsVar: `sectionItems${i + 1}`, containerId: containerIds[i] ?? `c${i + 1}` };
    return { title: s.title, desc: s.desc, itemsVar: map.itemsVar, id: map.containerId };
  });

  const esc = s => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

  const plainH1      = h1.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const defaultTitle = plainH1 + ' — Shoei451';
  const titleLine    = rawTitle && rawTitle !== defaultTitle
    ? `\n  title:      "${esc(rawTitle)}",` : '';

  const sectionsStr = sections.map(s =>
    `    { title: "${esc(s.title)}", desc: "${esc(s.desc)}", itemsVar: "${s.itemsVar}", id: "${s.id}" }`
  ).join(',\n');

  return (
    `\n// ── PAGE_CONFIG（sub-index.html?slug=${folderName} から参照） ──\n` +
    `window.PAGE_CONFIG = {${titleLine}\n` +
    `  h1:         "${esc(h1)}",\n` +
    `  headerDesc: "${esc(headerDesc)}",\n` +
    `  sections: [\n${sectionsStr}\n  ]\n` +
    `};\n`
  );
}

// ============================================================
// エントリポイント
// ============================================================
let targets;
if (ONLY) {
  targets = ONLY
    .map(name => join(ROOT, name))
    .filter(p => existsSync(join(p, 'index.html')));
  if (!targets.length) {
    console.error('指定したフォルダが見つかりません:', ONLY.join(', '));
    process.exit(1);
  }
} else {
  targets = collectCandidates(ROOT);
}

if (!targets.length) {
  console.log('変換対象が見つかりませんでした。');
  process.exit(0);
}

console.log(`\n対象: ${targets.length} フォルダ${DRY_RUN ? '（dry-run）' : ''}\n`);

let ok = 0, skipped = 0;

for (const folder of targets) {
  const indexPath = join(folder, 'index.html');
  const rel       = relative(ROOT, folder).replaceAll('\\', '/');
  const html      = readFileSync(indexPath, 'utf8');
  const listPath  = join(folder, 'list.js');

  if (!existsSync(listPath)) {
    console.warn(`  ⚠ ${rel}/list.js が見つかりません（スキップ）`);
    skipped++;
    continue;
  }

  let config;
  try {
    config = buildPageConfig(html, rel);
  } catch (e) {
    console.error(`  ✗ パース失敗: ${rel}\n    ${e.message}`);
    skipped++;
    continue;
  }

  if (DRY_RUN) {
    console.log(`[dry-run] ${rel}/list.js に追記予定:`);
    console.log('─'.repeat(60));
    console.log(config);
    console.log('─'.repeat(60) + '\n');
  } else {
    const existing = readFileSync(listPath, 'utf8');
    writeFileSync(listPath, existing + config, 'utf8');
    console.log(`  ✓ ${rel}/list.js`);
  }
  ok++;
}

console.log(`\n完了: ${ok} 件${skipped ? ` / スキップ: ${skipped} 件` : ''}`);

if (!DRY_RUN && ok > 0) {
  console.log('\n次のステップ:');
  console.log('  1. 各フォルダの index.html をルートの sub-index.html の内容に差し替える');
  console.log('  2. ブラウザで /sub-index.html?slug=history などを確認する');
  console.log('  3. npm run check でリンク・構文チェック');
}