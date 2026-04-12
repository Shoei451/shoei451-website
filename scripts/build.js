// build.js
// ビルドパイプライン:
//   1. dist/ クリーン & src/ コピー
//   2. quiz-bundle.css 生成（コンポーネントCSS結合）
//   3. esbuild（JS/CSS minify）
//   4. purgecss

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// ── 1. dist クリーン & コピー ─────────────────────────────

console.log("[1/5] Cleaning dist/ and copying src/...");
execSync("shx rm -rf dist && shx cp -r src dist", { stdio: "inherit" });

// ── 2. quiz-bundle.css 生成 ───────────────────────────────

console.log("[2/5] Bundling quiz component CSS...");

const QUIZ_CSS_FILES = [
  "dist/quiz/components/quiz-shell.css",
  "dist/quiz/components/start/start-screen.css",
  "dist/quiz/components/progress/progress.css",
  "dist/quiz/components/question/question-area.css",
  "dist/quiz/components/answer/answer.css",
  "dist/quiz/components/answer/table-input.css",
  "dist/quiz/components/feedback/feedback.css",
  "dist/quiz/components/result/result.css",
  "dist/quiz/components/modal/modal.css",
];

const bundled = QUIZ_CSS_FILES.map((f) => {
  if (!fs.existsSync(f)) {
    console.warn(`  WARNING: ${f} not found, skipping`);
    return "";
  }
  return fs.readFileSync(f, "utf8");
}).join("\n");

const bundleOut = "dist/quiz/components/quiz-bundle.css";
fs.writeFileSync(bundleOut, bundled, "utf8");
console.log(`  → ${bundleOut} (${(bundled.length / 1024).toFixed(1)} KB)`);

// ── 3. esbuild ────────────────────────────────────────────

console.log("[3/5] Running esbuild (minify JS/CSS)...");
execSync(
  'esbuild "dist/**/*.js" "dist/**/*.css" --minify --outdir=dist --allow-overwrite',
  { stdio: "inherit" },
);

// ── 4. purgecss ───────────────────────────────────────────

console.log("[4/5] Running purgecss...");
execSync(
  [
    "purgecss",
    "--css dist/css/base.css dist/css/utils.css dist/quiz/components/quiz-shell.css",
    "--content 'dist/**/*.html' 'dist/**/*.js'",
    "--output dist/css/",
    "--safelist /^qz-/ /^tl-/ /^bi/ show is-correct is-incorrect is-locked hidden is-active is-selected is-fallback is-open is-expanded is-visible dark fade",
  ].join(" "),
  { stdio: "inherit" },
);

// html minify

// ── 5. HTML minify ────────────────────────────────────────
console.log("[5/5] Minifying HTML...");

import { minify } from "html-minifier-terser";

const htmlFiles = fs
  .readdirSync("dist", { recursive: true })
  .filter((f) => f.endsWith(".html"))
  .map((f) => path.join("dist", f));

for (const file of htmlFiles) {
  const input = fs.readFileSync(file, "utf-8");
  const output = await minify(input, {
    collapseWhitespace: true,
    conservativeCollapse: false,   // 追加: 連続空白を1つに
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: false, // alt="" を守る
    minifyCSS: true,
    minifyJS: true,
  });
  fs.writeFileSync(file, output);
}
console.log(`  → ${htmlFiles.length} HTML files minified`);
console.log("\nBuild complete.");
