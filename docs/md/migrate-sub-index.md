# migrate-sub-index.mjs — サブインデックス変換スクリプト

**配置先:** `scripts/migrate-sub-index.mjs`  
**関連ファイル:** `js/sub-index-init.js`

---

## 概要

既存の sub-index 形式 `index.html`（`common.css` + `sub-index.css` + `initCardsPage()` の組み合わせ）を、`PAGE_CONFIG` ベースのスリム版に自動変換するスクリプト。

変換後は各 `index.html` が `window.PAGE_CONFIG` の定義だけを持ち、DOM構築・スクリプトロード・sendBeacon送信はすべて `js/sub-index-init.js` が担う。

---

## 使い方

```bash
# 自動検出して dry-run（書き込みなし・確認用）
node scripts/migrate-sub-index.mjs --dry-run

# フォルダ指定 + dry-run
node scripts/migrate-sub-index.mjs --dry-run --only history seikei

# 実行
node scripts/migrate-sub-index.mjs

# フォルダ指定して実行
node scripts/migrate-sub-index.mjs --only history koten others seikei projects
```

`package.json` に追加する場合:

```json
"migrate:sub-index": "node scripts/migrate-sub-index.mjs"
```

---

## 自動検出条件

以下を**すべて満たす**フォルダ直下の `index.html` が対象になる。

|条件|内容|
|---|---|
|`sub-index.css` を読み込んでいる|sub-index 専用ページと判定|
|`common.css` を読み込んでいる|同上|
|`initCardsPage` の呼び出しが含まれる|カード生成ページと判定|
|`PAGE_CONFIG` が含まれていない|変換済みをスキップ|

---

## 変換後の index.html の形

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="../images/favicon.ico" />
  <link rel="stylesheet" href="../css/common.css">
  <link rel="stylesheet" href="../css/sub-index.css">
  <!-- api/sw -->
  <script>
    window.PAGE_CONFIG = {
      h1:         "📚 History",
      headerDesc: "世界史/歴史総合の学習ツール",
      sections: [
        { title: "歴史総合", desc: "歴史総合の学習ツールです。", itemsVar: "sectionItems1", id: "c1" },
        { title: "世界史",   desc: "世界史探究の学習ツールです。", itemsVar: "sectionItems2", id: "c2" }
      ]
    };
  </script>
</head>
<body>
  <script src="list.js"></script>
  <script src="../js/sub-index-init.js"></script>
</body>
</html>
```

---

## スクリプト本体

```js
#!/usr/bin/env node
// scripts/migrate-sub-index.mjs
//
// 既存の sub-index 形式 index.html を PAGE_CONFIG ベースのスリム版に変換する。
//
// 使い方:
//   node scripts/migrate-sub-index.mjs              # 自動検出して実行
//   node scripts/migrate-sub-index.mjs --dry-run    # 変換内容の確認のみ（書き込みなし）
//   node scripts/migrate-sub-index.mjs --only history seikei  # フォルダ指定
//
// 自動検出条件:
//   - index.html が存在する
//   - common.css と sub-index.css の両方を読み込んでいる
//   - initCardsPage() の呼び出しが含まれている
//   - すでに PAGE_CONFIG が含まれていない（変換済みをスキップ）

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT    = fileURLToPath(new URL('..', import.meta.url));
const DRY_RUN = process.argv.includes('--dry-run');
const ONLY    = (() => {
  const i = process.argv.indexOf('--only');
  if (i === -1) return null;
  const targets = [];
  for (let j = i + 1; j < process.argv.length; j++) {
    if (process.argv[j].startsWith('--')) break;
    targets.push(process.argv[j]);
  }
  return targets.length > 0 ? targets : null;
})();

const SKIP_DIRS = new Set(['.git', 'node_modules', 'netlify', 'css', 'js', 'images', 'scripts', 'docs', 'templates']);

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
    if (!entry.isDirectory()) continue;
    if (SKIP_DIRS.has(entry.name)) continue;
    const candidate = join(dir, entry.name);
    const indexPath = join(candidate, 'index.html');
    if (existsSync(indexPath)) {
      const html = readFileSync(indexPath, 'utf8');
      if (isSubIndexPage(html)) results.push(candidate);
    }
  }
  return results;
}

// ============================================================
// HTML パース
// ============================================================

function extract(html, pattern) {
  const m = html.match(pattern);
  return m ? m[1].trim() : null;
}

function parseTitle(html) {
  return extract(html, /<title>([\s\S]*?)<\/title>/i);
}

function parseH1(html) {
  const headerBlock = html.match(/<header[\s\S]*?<\/header>/i)?.[0] ?? '';
  return extract(headerBlock, /<h1>([\s\S]*?)<\/h1>/i);
}

function parseHeaderDesc(html) {
  const headerBlock = html.match(/<header[\s\S]*?<\/header>/i)?.[0] ?? '';
  const afterH1 = headerBlock.replace(/<h1>[\s\S]*?<\/h1>/i, '');
  return extract(afterH1, /<p>([\s\S]*?)<\/p>/i);
}

function parseBackLink(html) {
  return extract(html, /class="back-link"\s+href="([^"]+)"/)
      ?? extract(html, /href="([^"]+)"\s+class="back-link"/);
}

function parseSections(html) {
  const sections = [];
  const dividerRe = /class="section-divider"[\s\S]*?(?=class="section-divider"|<\/body>|<nav\b|<footer\b)/g;
  let m;
  while ((m = dividerRe.exec(html)) !== null) {
    const block = m[0];
    const title = extract(block, /class="section-title"[^>]*>([\s\S]*?)<\/h2>/i) ?? '';
    const desc  = extract(block, /class="section-description"[^>]*>([\s\S]*?)<\/p>/i) ?? '';
    sections.push({ title: title.trim(), desc: desc.trim() });
  }
  return sections;
}

function parseContainerIds(html) {
  const ids = [];
  const re = /class="cards-container"\s+id="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) ids.push(m[1]);
  const re2 = /id="([^"]+)"\s+class="cards-container"/g;
  while ((m = re2.exec(html)) !== null) {
    if (!ids.includes(m[1])) ids.push(m[1]);
  }
  return ids;
}

function parseInitCardsPage(html) {
  const m = html.match(/initCardsPage\s*\(\s*\[([\s\S]*?)\]\s*\)/);
  if (!m) return [];

  const inner = m[1];
  const entries = [];
  const entryRe = /\{[\s\S]*?itemsVar\s*:\s*["']([^"']+)["'][\s\S]*?containerId\s*:\s*["']([^"']+)["'][\s\S]*?\}/g;
  let em;
  while ((em = entryRe.exec(inner)) !== null) {
    entries.push({ itemsVar: em[1], containerId: em[2] });
  }
  if (entries.length === 0) {
    const entryRe2 = /\{[\s\S]*?containerId\s*:\s*["']([^"']+)["'][\s\S]*?itemsVar\s*:\s*["']([^"']+)["'][\s\S]*?\}/g;
    while ((em = entryRe2.exec(inner)) !== null) {
      entries.push({ itemsVar: em[2], containerId: em[1] });
    }
  }
  return entries;
}

function parseListScripts(html) {
  const scripts = [];
  const re = /<script\s+src="([^"]*list[^"]*\.js)"/gi;
  let m;
  while ((m = re.exec(html)) !== null) scripts.push(m[1]);
  return scripts;
}

function parseFavicon(html) {
  return extract(html, /<link[^>]+rel="icon"[^>]+href="([^"]+)"/i);
}

// ============================================================
// 変換
// ============================================================
function convert(html, folderName) {
  const rawTitle      = parseTitle(html);
  const h1            = parseH1(html) ?? folderName;
  const headerDesc    = parseHeaderDesc(html) ?? '';
  const backLink      = parseBackLink(html);
  const sectionDefs   = parseSections(html);
  const containerIds  = parseContainerIds(html);
  const cardsMappings = parseInitCardsPage(html);
  const listScripts   = parseListScripts(html);
  const favicon       = parseFavicon(html);

  const sections = sectionDefs.map((s, i) => {
    const mapping = cardsMappings.find(m => m.containerId === containerIds[i])
                 ?? cardsMappings[i]
                 ?? { itemsVar: `sectionItems${i + 1}`, containerId: containerIds[i] ?? `c${i + 1}` };
    return {
      title:    s.title,
      desc:     s.desc,
      itemsVar: mapping.itemsVar,
      id:       mapping.containerId,
    };
  });

  const plainH1 = h1.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const defaultTitle = plainH1 + ' — Shoei451';
  const titleLine    = rawTitle && rawTitle !== defaultTitle
    ? `\n      title:      "${rawTitle.replace(/"/g, '\\"')}",` : '';
  const backLinkLine = backLink && backLink !== '../'
    ? `\n      backLink:   "${backLink}",` : '';

  const sectionsJSON = sections.map(s =>
    `        { title: "${s.title.replace(/"/g, '\\"')}", desc: "${s.desc.replace(/"/g, '\\"')}", itemsVar: "${s.itemsVar}", id: "${s.id}" }`
  ).join(',\n');

  const faviconLine   = favicon ? `  <link rel="icon" href="${favicon}" />\n` : '';
  const listScriptTags = listScripts.map(src => `  <script src="${src}"></script>`).join('\n');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
${faviconLine}  <link rel="stylesheet" href="../css/common.css">
  <link rel="stylesheet" href="../css/sub-index.css">
  <!-- api/sw -->
  <script>
    window.PAGE_CONFIG = {${titleLine}${backLinkLine}
      h1:         "${h1.replace(/"/g, '\\"')}",
      headerDesc: "${headerDesc.replace(/"/g, '\\"')}",
      sections: [
${sectionsJSON}
      ]
    };
  </script>
</head>
<body>
${listScriptTags}
  <script src="../js/sub-index-init.js"></script>
</body>
</html>
`;
}

// ============================================================
// エントリポイント
// ============================================================
let targets;
if (ONLY) {
  targets = ONLY.map(name => join(ROOT, name)).filter(p => existsSync(join(p, 'index.html')));
  if (targets.length === 0) {
    console.error('指定したフォルダが見つかりません:', ONLY.join(', '));
    process.exit(1);
  }
} else {
  targets = collectCandidates(ROOT);
}

if (targets.length === 0) {
  console.log('変換対象のページが見つかりませんでした。');
  process.exit(0);
}

console.log(`\n変換対象: ${targets.length} ページ${DRY_RUN ? '（dry-run）' : ''}\n`);

let ok = 0, skipped = 0;

for (const targetDir of targets) {
  const indexPath = join(targetDir, 'index.html');
  const rel       = relative(ROOT, indexPath).replaceAll('\\', '/');
  const html      = readFileSync(indexPath, 'utf8');
  const folderName = relative(ROOT, targetDir).replaceAll('\\', '/');

  let converted;
  try {
    converted = convert(html, folderName);
  } catch (e) {
    console.error(`  ✗ パース失敗: ${rel}\n    ${e.message}`);
    skipped++;
    continue;
  }

  if (DRY_RUN) {
    console.log(`[dry-run] ${rel}`);
    console.log('─'.repeat(60));
    console.log(converted);
    console.log('─'.repeat(60) + '\n');
  } else {
    writeFileSync(indexPath, converted, 'utf8');
    console.log(`  ✓ ${rel}`);
  }
  ok++;
}

console.log(`\n完了: ${ok} 件${skipped > 0 ? ` / スキップ: ${skipped} 件` : ''}`);
if (!DRY_RUN && ok > 0) {
  console.log('\n次のステップ:');
  console.log('  1. js/sub-index-init.js をリポジトリに追加');
  console.log('  2. npm run check でリンク・構文チェック');
}
```

---

## 注意点

パースは正規表現ベースなので、以下のケースは dry-run で目視確認すること。

- `section-divider` ブロックがコメントアウトされている（`others/index.html` の Section 2 など）
- `initCardsPage` の呼び出しが複数行に極端に分散している
- `list.js` 以外の命名規則のスクリプト（`list1.js` は対応済み）