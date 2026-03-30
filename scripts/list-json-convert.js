// scripts/convert-list-js.js
//
// list.js → list.json 変換スクリプト
//
// 使い方（リポジトリルートから）:
//   node scripts/convert-list-js.js
//   node scripts/convert-list-js.js --dry-run   # 変換内容を表示するだけ
//
// 対象: **/list.js（node_modules, templates, .git を除外）
// 出力: 同ディレクトリに list.json を生成（list.js は残す）
// 注意: PAGE_CONFIG を持たない list.js はスキップ

const { readFileSync, writeFileSync, readdirSync } = require("node:fs");
const { join, dirname, relative } = require("node:path");

const ROOT = process.cwd();
const DRY_RUN = process.argv.includes("--dry-run");
const IGNORE_DIRS = new Set([".git", "node_modules", "templates", "dist"]);

// ── list.js を収集 ──────────────────────────────────────────────
function collectListFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        files.push(...collectListFiles(join(dir, entry.name)));
      }
    } else if (entry.name === "list.js") {
      files.push(join(dir, entry.name));
    }
  }
  return files;
}

// ── list.js を「実行」して PAGE_CONFIG と sectionItems* を取得 ──
// PAGE_CONFIG がなければ null を返す（スキップ対象）
function evalListJs(filePath) {
  const src = readFileSync(filePath, "utf8");
  const mockWindow = {};
  const collectedVars = {};

  try {
    const fn = new Function(
      "window",
      "collectedVars",
      src.replace(
        /(?:const|let|var)\s+(sectionItems\w+)\s*=/g,
        "collectedVars.$1 ="
      )
    );
    fn(mockWindow, collectedVars);
  } catch (e) {
    throw new Error(`Failed to eval ${filePath}: ${e.message}`);
  }

  if (!mockWindow.PAGE_CONFIG) return null;
  return { cfg: mockWindow.PAGE_CONFIG, collectedVars };
}

// ── PAGE_CONFIG + sectionItems* → list.json 構造に変換 ──────────
function buildJson(cfg, collectedVars) {
  const sections = (cfg.sections || []).map((section, i) => {
    let items = [];
    if (Array.isArray(section.items)) {
      items = section.items;
    } else {
      const varName = section.itemsVar || `sectionItems${i + 1}`;
      if (collectedVars[varName]) items = collectedVars[varName];
    }

    const normalizedItems = items.map((item) => {
      const out = {
        title: item.title || "",
        link: item.link || "",
      };
      if (item.titleEN) out.titleEN = item.titleEN;
      if (item.description) out.description = item.description;
      if (item.icon) out.icon = item.icon;
      if (item.iconType) out.iconType = item.iconType;
      if (item.target) out.target = item.target;
      return out;
    });

    return {
      title: section.title || "",
      ...(section.desc ? { desc: section.desc } : {}),
      ...(section.id ? { id: section.id } : {}),
      items: normalizedItems,
    };
  });

  return {
    title: cfg.title || "",
    h1: cfg.h1 || "",
    ...(cfg.headerDesc ? { headerDesc: cfg.headerDesc } : {}),
    ...(cfg.backLink ? { backLink: cfg.backLink } : {}),
    sections,
  };
}

// ── メイン ─────────────────────────────────────────────────────
const listFiles = collectListFiles(ROOT);

if (listFiles.length === 0) {
  console.log("No list.js files found.");
  process.exit(0);
}

let successCount = 0;
let errorCount = 0;

for (const filePath of listFiles) {
  const rel = relative(ROOT, filePath).replace(/\\/g, "/");
  const outPath = join(dirname(filePath), "list.json");
  const outRel = relative(ROOT, outPath).replace(/\\/g, "/");

  try {
    const result = evalListJs(filePath);
    if (!result) {
      console.log(`- ${rel}: PAGE_CONFIG なし、スキップ`);
      continue;
    }
    const { cfg, collectedVars } = result;
    const json = buildJson(cfg, collectedVars);
    const jsonStr = JSON.stringify(json, null, 2) + "\n";

    if (DRY_RUN) {
      console.log(`\n--- ${rel} → ${outRel} ---`);
      console.log(jsonStr);
    } else {
      writeFileSync(outPath, jsonStr, "utf8");
      console.log(`✓ ${rel} → ${outRel}`);
    }
    successCount++;
  } catch (e) {
    console.error(`✗ ${rel}: ${e.message}`);
    errorCount++;
  }
}

console.log(
  `\nDone: ${successCount} converted, ${errorCount} failed.${DRY_RUN ? " (dry-run)" : ""}`
);