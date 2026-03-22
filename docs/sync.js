#!/usr/bin/env node
// sync.js
// 使い方:
//   node sync.js                       # sync-config.js を自動検出
//   node sync.js --config ./my.config.js
//   node sync.js --dry-run             # 実際にはコピーしない（確認用）
//   node sync.js --yes                 # 確認プロンプトをスキップ
//   node sync.js --no-build            # build.js を実行しない
//   node sync.js --direction obsidian-to-website  # config の direction を上書き

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { createInterface } from "node:readline";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── CLI 引数パース ─────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
};
const hasFlag = (flag) => args.includes(flag);

const configPath = getArg("--config")
  ? path.resolve(getArg("--config"))
  : path.resolve(__dirname, "sync-config.js");

const isDryRun = hasFlag("--dry-run");
const skipConfirm = hasFlag("--yes");
const noBuild = hasFlag("--no-build");
const directionOverride = getArg("--direction");

// ── Config 読み込み ────────────────────────────────────────
if (!fs.existsSync(configPath)) {
  console.error(`❌  Config not found: ${configPath}`);
  console.error(`    Run with --config <path> or create sync-config.js next to sync.js`);
  process.exit(1);
}

const { default: config } = await import(pathToFileURL(configPath).href);
const direction = directionOverride ?? config.direction ?? "obsidian-to-website";

// ── ユーティリティ ─────────────────────────────────────────
function resolveMd(name) {
  // "status" → "status.md"、"status.md" → そのまま
  return name.endsWith(".md") ? name : `${name}.md`;
}

function matchExclude(filename, patterns) {
  return patterns.some((p) => filename.startsWith(p) || filename === resolveMd(p));
}

function collectMdFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ name: f, full: path.join(dir, f) }));
}

function mtimeMs(filepath) {
  try {
    return fs.statSync(filepath).mtimeMs;
  } catch {
    return 0;
  }
}

function ask(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

function copyFile(src, dest) {
  if (isDryRun) {
    console.log(`  [dry-run] COPY  ${src}  →  ${dest}`);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

// ── 同期ロジック ───────────────────────────────────────────
function buildFileList() {
  const obsFiles = collectMdFiles(config.obsidianDir);
  const webFiles = collectMdFiles(config.websiteDir);

  const obsMap = new Map(obsFiles.map((f) => [f.name, f.full]));
  const webMap = new Map(webFiles.map((f) => [f.name, f.full]));

  // include フィルタ
  const includeSet =
    config.include?.length > 0
      ? new Set(config.include.map(resolveMd))
      : null;

  const filterFile = (name) => {
    if (includeSet && !includeSet.has(name)) return false;
    if (matchExclude(name, config.exclude ?? [])) return false;
    return true;
  };

  const actions = []; // { action: "copy"|"skip"|"conflict", src, dest, reason }

  if (direction === "obsidian-to-website") {
    for (const [name, srcPath] of obsMap) {
      if (!filterFile(name)) continue;
      const destPath = path.join(config.websiteDir, name);
      actions.push({ action: "copy", src: srcPath, dest: destPath, label: `Obsidian → website` });
    }
  } else if (direction === "website-to-obsidian") {
    for (const [name, srcPath] of webMap) {
      if (!filterFile(name)) continue;
      const destPath = path.join(config.obsidianDir, name);
      actions.push({ action: "copy", src: srcPath, dest: destPath, label: `website → Obsidian` });
    }
  } else if (direction === "bidirectional") {
    // 全ファイル名の union を作る
    const allNames = new Set([...obsMap.keys(), ...webMap.keys()]);
    for (const name of allNames) {
      if (!filterFile(name)) continue;
      const obsPath = obsMap.get(name);
      const webPath = webMap.get(name);

      if (obsPath && !webPath) {
        actions.push({
          action: "copy",
          src: obsPath,
          dest: path.join(config.websiteDir, name),
          label: `Obsidian only → website`,
        });
      } else if (!obsPath && webPath) {
        actions.push({
          action: "copy",
          src: webPath,
          dest: path.join(config.obsidianDir, name),
          label: `website only → Obsidian`,
        });
      } else {
        // 両方に存在 → 競合解決
        const resolution = config.conflictResolution ?? "newer";
        let src, dest, label;

        if (resolution === "obsidian-wins") {
          src = obsPath; dest = path.join(config.websiteDir, name);
          label = `[obsidian-wins] Obsidian → website`;
        } else if (resolution === "website-wins") {
          src = webPath; dest = path.join(config.obsidianDir, name);
          label = `[website-wins] website → Obsidian`;
        } else {
          // newer
          const obsMtime = mtimeMs(obsPath);
          const webMtime = mtimeMs(webPath);
          if (Math.abs(obsMtime - webMtime) < 1000) {
            // 1秒以内の差は同一とみなしてスキップ
            actions.push({ action: "skip", src: obsPath, dest: webPath, label: `same (< 1s diff)` });
            continue;
          }
          if (obsMtime > webMtime) {
            src = obsPath; dest = path.join(config.websiteDir, name);
            label = `[newer: Obsidian] Obsidian → website`;
          } else {
            src = webPath; dest = path.join(config.obsidianDir, name);
            label = `[newer: website] website → Obsidian`;
          }
        }
        actions.push({ action: "copy", src, dest, label });
      }
    }
  }

  return actions;
}

// ── メイン実行 ─────────────────────────────────────────────
const actions = buildFileList();

const copies = actions.filter((a) => a.action === "copy");
const skips  = actions.filter((a) => a.action === "skip");

console.log(`\n📂  Sync direction  : ${direction}`);
console.log(`    Obsidian dir    : ${config.obsidianDir}`);
console.log(`    Website dir     : ${config.websiteDir}`);
if (isDryRun) console.log(`    ⚠️  DRY RUN MODE — nothing will be written\n`);

if (copies.length === 0) {
  console.log("\n✅  Nothing to sync.");
  process.exit(0);
}

// 差分プレビュー
console.log(`\n📋  Files to copy (${copies.length}):`);
for (const { src, dest, label } of copies) {
  const srcShort = src.replace(config.obsidianDir, "<obsidian>").replace(config.websiteDir, "<website>");
  const destShort = dest.replace(config.obsidianDir, "<obsidian>").replace(config.websiteDir, "<website>");
  console.log(`  ${label}`);
  console.log(`    ${srcShort}  →  ${destShort}`);
}
if (skips.length > 0) {
  console.log(`\n⏭️  Skipped (no change, ${skips.length} files)`);
}

// 確認プロンプト
if (!skipConfirm && !isDryRun && (config.dryRunDefault || copies.length > 0)) {
  const answer = await ask(`\n❓  Proceed with copy? [y/N] `);
  if (answer !== "y" && answer !== "yes") {
    console.log("Aborted.");
    process.exit(0);
  }
}

// コピー実行
let copied = 0;
for (const { src, dest } of copies) {
  copyFile(src, dest);
  copied++;
}

if (!isDryRun) {
  console.log(`\n✅  Copied ${copied} file(s).`);
}

// ── build.js 実行 ──────────────────────────────────────────
if (!noBuild && config.runBuildAfterSync && config.buildScript && !isDryRun) {
  const buildPath = path.resolve(config.buildScript);
  if (fs.existsSync(buildPath)) {
    console.log(`\n🔨  Running build: ${buildPath}`);
    try {
      execSync(`node "${buildPath}"`, { stdio: "inherit", cwd: path.dirname(buildPath) });
    } catch (e) {
      console.error(`❌  Build failed: ${e.message}`);
      process.exit(1);
    }
  } else {
    console.warn(`⚠️  buildScript not found: ${buildPath} (skipping build)`);
  }
} else if (noBuild) {
  console.log(`\n⏭️  Build skipped (--no-build).`);
}