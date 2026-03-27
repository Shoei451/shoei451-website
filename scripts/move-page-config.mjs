#!/usr/bin/env node
// scripts/move-page-config.mjs
//
// index.html にインラインで書かれた window.PAGE_CONFIG = {...} を
// list.js の末尾に移動し、index.html をスリム版に置き換える。

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DRY_RUN = process.argv.includes("--dry-run");
const ONLY = (() => {
  const i = process.argv.indexOf("--only");
  if (i === -1) return null;
  const out = [];
  for (let j = i + 1; j < process.argv.length; j++) {
    if (process.argv[j].startsWith("--")) break;
    out.push(process.argv[j]);
  }
  return out.length ? out : null;
})();

const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "netlify",
  "css",
  "js",
  "images",
  "scripts",
  "docs",
  "templates",
]);

// ============================================================
// 自動検出
// ============================================================
function collectCandidates(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;
    const folder = join(dir, entry.name);
    const indexPath = join(folder, "index.html");
    const listPath = join(folder, "list.js");
    if (!existsSync(indexPath) || !existsSync(listPath)) continue;
    const html = readFileSync(indexPath, "utf8");
    const listJs = readFileSync(listPath, "utf8");
    if (
      html.includes("window.PAGE_CONFIG") &&
      !listJs.includes("PAGE_CONFIG")
    ) {
      results.push(folder);
    }
  }
  return results;
}

// ============================================================
// PAGE_CONFIG ブロックを抽出
// ============================================================
function extractPageConfig(html) {
  // <script> タグ内の window.PAGE_CONFIG = { ... }; を丸ごと取り出す
  // ネストした {} に対応するため括弧カウンタで終端を探す
  const start = html.indexOf("window.PAGE_CONFIG");
  if (start === -1) return null;

  // '=' の後の '{' を探す
  let braceStart = html.indexOf("{", start);
  if (braceStart === -1) return null;

  let depth = 0;
  let end = -1;
  for (let i = braceStart; i < html.length; i++) {
    if (html[i] === "{") depth++;
    else if (html[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) return null;

  // セミコロンまで含める
  const afterBrace = html.slice(end + 1).match(/^\s*;/);
  const fullEnd = end + 1 + (afterBrace ? afterBrace[0].length : 0);

  return html.slice(start, fullEnd).trim();
}

// ============================================================
// スリム版 index.html を生成
// ============================================================
const SLIM_HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="../images/favicon.ico" />
  <link rel="stylesheet" href="../css/common.css">
  <link rel="stylesheet" href="../css/sub-index.css">
  <!-- api/sw -->
</head>
<body>
  <script src="list.js"></script>
  <script src="../js/sub-index-init.js"></script>
</body>
</html>
`;

// ============================================================
// エントリポイント
// ============================================================
let targets;
if (ONLY) {
  targets = ONLY.map((name) => join(ROOT, name)).filter((p) =>
    existsSync(join(p, "index.html")),
  );
  if (!targets.length) {
    console.error("指定したフォルダが見つかりません:", ONLY.join(", "));
    process.exit(1);
  }
} else {
  targets = collectCandidates(ROOT);
}

if (!targets.length) {
  console.log("対象が見つかりませんでした。");
  process.exit(0);
}

console.log(
  `\n対象: ${targets.length} フォルダ${DRY_RUN ? "（dry-run）" : ""}\n`,
);

let ok = 0,
  skipped = 0;

for (const folder of targets) {
  const rel = relative(ROOT, folder).replaceAll("\\", "/");
  const indexPath = join(folder, "index.html");
  const listPath = join(folder, "list.js");
  const html = readFileSync(indexPath, "utf8");

  const configBlock = extractPageConfig(html);
  if (!configBlock) {
    console.warn(
      `  ⚠ ${rel}/index.html から PAGE_CONFIG を抽出できませんでした（スキップ）`,
    );
    skipped++;
    continue;
  }

  const appendStr = `\n// ── PAGE_CONFIG（sub-index.html?slug=${rel} から参照） ──\n${configBlock}\n`;

  if (DRY_RUN) {
    console.log(`[dry-run] ${rel}/list.js に追記予定:`);
    console.log("─".repeat(60));
    console.log(appendStr);
    console.log("─".repeat(60));
    console.log(`[dry-run] ${rel}/index.html → スリム版に置き換え予定\n`);
  } else {
    const existing = readFileSync(listPath, "utf8");
    writeFileSync(listPath, existing + appendStr, "utf8");
    writeFileSync(indexPath, SLIM_HTML, "utf8");
    console.log(`  ✓ ${rel}/list.js に PAGE_CONFIG を追記`);
    console.log(`  ✓ ${rel}/index.html をスリム版に置き換え`);
  }
  ok++;
}

console.log(`\n完了: ${ok} 件${skipped ? ` / スキップ: ${skipped} 件` : ""}`);
