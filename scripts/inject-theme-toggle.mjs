#!/usr/bin/env node
// scripts/inject-theme-toggle.mjs
//
// Replace existing HTML theme toggle markup:
// <span class="logo-switches">...<button id="theme-toggle">...</button></span>
// with:
// <span class="logo-switches" id="theme-toggle-container"></span>
//
// Usage:
//   node scripts/inject-theme-toggle.mjs
//   node scripts/inject-theme-toggle.mjs --dry-run

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const DRY_RUN = process.argv.includes("--dry-run");

const SKIP_PATHS = new Set([
  "history/world/admin/index.html",
  "history/world/admin/main.html",
  "history/world/admin/memo.html",
  "history/world/admin/wh-admin-v2.html",
]);

const SKIP_DIRS = new Set([".git", "node_modules", "netlify"]);

const PLACEHOLDER = '<span class="logo-switches" id="theme-toggle-container"></span>';
const PATTERN = /<span class="logo-switches">\s*<button id="theme-toggle"[\s\S]*?<\/button>\s*<\/span>/g;

function collectHtmlFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        files.push(...collectHtmlFiles(full));
      }
    } else if (entry.name.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

let replaced = 0;
let skipped = 0;
let noMatch = 0;

for (const abs of collectHtmlFiles(ROOT)) {
  const rel = relative(ROOT, abs).replaceAll("\\", "/");

  if (SKIP_PATHS.has(rel)) {
    skipped++;
    continue;
  }

  const html = readFileSync(abs, "utf8");
  PATTERN.lastIndex = 0;
  if (!PATTERN.test(html)) {
    noMatch++;
    continue;
  }

  PATTERN.lastIndex = 0;
  const updated = html.replace(PATTERN, PLACEHOLDER);

  if (DRY_RUN) {
    console.log(`[dry-run] would replace: ${rel}`);
  } else {
    writeFileSync(abs, updated, "utf8");
    console.log(`replaced: ${rel}`);
  }
  replaced++;
}

console.log(`\nReplaced ${DRY_RUN ? "(planned)" : ""}: ${replaced} / skipped: ${skipped} / no match: ${noMatch}`);
