# テーマトグル部品化 — 作業チェックリスト

## 概要

各HTMLに散在していたテーマトグルのSVGマークアップを外部化する。
完了後、新しいページでは `<span class="logo-switches" id="theme-toggle-container"></span>` の1行だけ書けばよくなる。

---

## 新規作成ファイル（3つ）

| ファイル | 内容 |
|---|---|
| `css/theme-toggle.css` | トグルボタンの共通スタイル |
| `js/theme-toggle.js` | テーマ即時適用 + SVG注入ロジック（上書き） |
| `scripts/inject-theme-toggle.mjs` | 既存ページの一括置換スクリプト |

上記3ファイルは今回の出力に含まれている。配置したら以下の手順を進める。

---

## inject-theme-toggle.mjs の内容（参考）

```js
#!/usr/bin/env node
// scripts/inject-theme-toggle.mjs
//
// 既存HTMLの <span class="logo-switches">...<button id="theme-toggle">...</button></span>
// を <span class="logo-switches" id="theme-toggle-container"></span> に置換する。
//
// 使い方:
//   node scripts/inject-theme-toggle.mjs          # 実際に置換
//   node scripts/inject-theme-toggle.mjs --dry-run # 確認のみ（書き込みなし）

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT    = process.cwd();
const DRY_RUN = process.argv.includes("--dry-run");

const SKIP_PATHS = new Set([
    "history/world/admin/index.html",
    "history/world/admin/main.html",
    "history/world/admin/memo.html",
    "history/world/admin/wh-admin-v2.html",
]);

const SKIP_DIRS = new Set([".git", "node_modules", "netlify"]);

const PLACEHOLDER = `<span class="logo-switches" id="theme-toggle-container"></span>`;
const PATTERN = /<span class="logo-switches">\s*<button id="theme-toggle"[\s\S]*?<\/button>\s*<\/span>/g;

function collectHtmlFiles(dir) {
    const files = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!SKIP_DIRS.has(entry.name)) files.push(...collectHtmlFiles(full));
        } else if (entry.name.endsWith(".html")) {
            files.push(full);
        }
    }
    return files;
}

let replaced = 0, skipped = 0, noMatch = 0;

for (const abs of collectHtmlFiles(ROOT)) {
    const rel = relative(ROOT, abs).replaceAll("\\", "/");
    if (SKIP_PATHS.has(rel)) { skipped++; continue; }

    const html = readFileSync(abs, "utf8");
    PATTERN.lastIndex = 0;
    if (!PATTERN.test(html)) { noMatch++; continue; }

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

console.log(`\n置換${DRY_RUN ? "予定" : "済み"}: ${replaced} / スキップ: ${skipped} / 対象外: ${noMatch}`);
```

---

## 手順

### Step 1 — ファイルを配置する

3ファイルをリポジトリの所定の場所に置く。

```
css/theme-toggle.css
js/theme-toggle.js
scripts/inject-theme-toggle.mjs
```

---

### Step 2 — `common.css` に import を追加する

`common.css` の先頭（既存スタイルより前）に1行追加する。

```css
@import './theme-toggle.css';
```

これで `common.css` を読んでいる全ページ（`index.html`, `history/`, `koten/`, `seikei/`, `others/` 等）は自動的に適用される。

---

### Step 3 — 独自テーマCSS 4ファイルを修正する

`common.css` を読まず独自変数を持つCSSから、テーマトグル関連の記述を**削除**し、代わりに `<link>` を追加する。

#### 3-1. `css/timeline.css`

削除するブロック:
```css
.logo-switches { ... }
#theme-toggle { ... }
#theme-toggle:hover { ... }
#theme-toggle svg { ... }
#moon, #sun { ... }
body.dark #sun { ... }
body:not(.dark) #moon { ... }
```

対応するHTMLに `<link>` を追加（パスは各ファイルの深さに合わせる）:
- `seikei/timeline/index.html` → `<link rel="stylesheet" href="../../css/theme-toggle.css">`
- `seikei/timeline/print.html` → 同上
- `seikei/timeline/quiz.html` → 同上（このファイルはインラインCSSなので `<style>` 内の該当ブロックを削除）
- `history/world/timeline.html` → `<link rel="stylesheet" href="../../css/theme-toggle.css">`

#### 3-2. `history/styles/theme-chinese.css`

削除するブロック（`timeline.css` と同様）。

対応するHTMLに `<link>` を追加:
- `history/china/timeline.html` → `<link rel="stylesheet" href="../../css/theme-toggle.css">`
- `history/china/index.html` → 同上
- `history/china/culture_quiz/index.html` → `<link rel="stylesheet" href="../../../css/theme-toggle.css">`

#### 3-3. `Informatics/hex-quiz/style.css`

削除するブロック:
```css
.logo-switches { ... }
#theme-toggle { ... }
#theme-toggle:hover { ... }
#moon, #sun { ... }
body.dark #sun { ... }
body:not(.dark) #moon { ... }
#theme-toggle:hover #moon,
#theme-toggle:hover #sun { ... }
```

対応するHTMLに追加:
- `Informatics/hex-quiz/index.html` → `<link rel="stylesheet" href="../../css/theme-toggle.css">`

#### 3-4. `koten/joushiki/style.css`

このページはテーマトグルのスタイルが `common.css` 系ではなく独自CSSに入っている可能性がある（`style.css` を確認）。
→ 該当ブロックがあれば削除し、`index.html` に `<link rel="stylesheet" href="../../css/theme-toggle.css">` を追加。

---

### Step 4 — 既存HTMLを一括置換する

```bash
# まず dry-run で確認
node scripts/inject-theme-toggle.mjs --dry-run

# 問題なければ実行
node scripts/inject-theme-toggle.mjs
```

置換後の各ページのトグル部分は以下の1行になる:

```html
<span class="logo-switches" id="theme-toggle-container"></span>
```

---

### Step 5 — `package.json` に npm script を追加する

```json
"scripts": {
  "check:js":     "node scripts/check-js.mjs",
  "check:links":  "node scripts/check-links.mjs",
  "check":        "npm run check:js && npm run check:links",
  "inject:theme": "node scripts/inject-theme-toggle.mjs"
}
```

---

### Step 6 — 動作確認

- [ ] ライトモード / ダークモードの切り替えが各ページで正常に動作する
- [ ] ページリロード後にテーマが保持される
- [ ] `admin/` 系ページのトグルが壊れていない（対象外なので変化なし）
- [ ] `seikei/timeline/quiz.html` のインラインCSSが正しく削除されている
- [ ] `npm run check` がパスする

---

## 対象外ページ（変更しない）

| パス | 理由 |
|---|---|
| `history/world/admin/index.html` | 独自 `style.css` にトグルスタイルあり。インライン維持が正解 |
| `history/world/admin/main.html` | 同上 |
| `history/world/admin/memo.html` | 同上 |
| `history/world/admin/wh-admin-v2.html` | 同上 |

---

## 将来の新規ページの作り方

SVGは一切書かず、以下の1行だけ置く。

```html
<span class="logo-switches" id="theme-toggle-container"></span>
```

`js/theme-toggle.js` の読み込みと、`css/theme-toggle.css` の読み込み（または `common.css` 経由）があれば自動的に動作する。