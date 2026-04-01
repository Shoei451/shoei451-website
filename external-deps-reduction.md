# 外部依存削減 — 全ステップ

作成: 2026-04-01  
対象リポジトリ: `Shoei451/shoei451-website`

---

## 現状の外部依存と削減効果サマリー

| #   | リソース                                          | 転送量(概算)    | ステップ | 優先度 |
| --- | ------------------------------------------------- | --------------- | -------- | ------ |
| 1   | Google Fonts (Noto Sans JP + Zen Kaku Gothic New) | ~300–500 KB     | Step 1   | 高     |
| 2   | Bootstrap JS bundle (+ Popper.js)                 | ~46 KB gzip     | Step 2   | 高     |
| 3   | Bootstrap Icons CSS + woff2 フォント              | ~241 KB         | Step 3   | 高     |
| 4   | Bootstrap CSS                                     | ~30 KB gzip     | Step 4   | 中     |
| 5   | HTML minify (ビルド改善)                          | ~5–15% HTML削減 | Step 5   | 低     |

**削減合計（Step 1–3 完了時点）:** 外部リクエスト 8〜10本 → 0本、転送量 ~800 KB以上削減

---

## Step 1: Google Fonts を削除してシステムフォントへ切り替える（既に完了）

### 背景

- `css/base.css` 先頭の `@import` と、一部 HTML の `<link>` で**二重読み込み**になっている
- `@import` はCSSパース中にブロッキングするため `<link>` より遅い
- Noto Sans JP はmacOS（ヒラギノ）・Windows（游ゴシック）・Android（OS同梱Noto）でシステムフォントが代替できる
- Zen Kaku Gothic New はナビバーの `Shoei451` ブランド名と一部見出しにのみ使用
- JetBrains Mono は `learning-links` のドメイン名表示のみに使用

### 作業

**1-a. `css/base.css` — `@import` を削除し `font-family` を書き換える**

```css
/* 削除 */
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Zen+Kaku+Gothic+New:wght@400;700&display=swap");
```

```css
/* 変更後の font-family（:root 変数・body・見出し・navbar-brand すべて） */
font-family:
  "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "YuGothic",
  "Meiryo", sans-serif;
```

対象セレクタ: `body`, `h1–h6`, `#site-nav .navbar-brand`

**1-b. `src/quiz/components/quiz-shell.css` — `body` の `font-family` を同様に書き換える**

**1-c. `src/timeline/style.css` — `body` と `.tl-header__title` を書き換える**

**1-d. `timeline/index.html` — `<link>` と `<preconnect>` を削除する**

```html
<!-- 削除 -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Zen+Kaku+Gothic+New:wght@400;700&display=swap"
  rel="stylesheet"
/>
```

**1-e. `learning-links/index.html` — 同様に削除する**

```html
<!-- 削除 -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Zen+Kaku+Gothic+New:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

**1-f. `learning-links/style.css` — JetBrains Mono を置き換える**

```css
/* 変更前 */
font-family: "JetBrains Mono", monospace;

/* 変更後 */
font-family: "Courier New", monospace;
```

対象: `.link-domain`, `.folder-count`

**1-g. `seikei/japan-constitution-quiz.html` — `<link>` を削除し `font-family` 参照を書き換える**

このファイルは `base.css` を読まず独立しているため個別に対応する。

**1-h. `seikei/print.html` — インラインCSSの `font-family` 参照のみ書き換える（`<link>` は元々無い）**

### 注意点

- `index.html`, `sub-index.html`, `404.html` 等は `base.css` 経由の `@import` のみで読み込まれていたため HTML 側の変更は不要（1-a で `@import` を削除すれば完結する）
- `font-feature-settings: "pkna"` はヒラギノ・游ゴシックでも有効なので残す

---

## Step 2: Bootstrap JS を削除して Collapse / Modal を自前実装する

### 背景

Chromeの Coverage レポートより、Bootstrap JS bundle (+ Popper.js) の内訳:

| 使用中                              | 未使用                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| Collapse（navbar ハンバーガー）     | Tooltip, Dropdown, Carousel, Tab, Scrollspy, Offcanvas, Toast, Popover, Alert, Button |
| Modal（`timeline/index.html` のみ） | Popper.js 全体（Dropdown が消えれば不要）                                             |

実際に使っている機能は2つのみ。Collapse は ~10行、Modal は `<dialog>` 要素で置き換えられる。

### 作業

**2-a. すべての HTML から Bootstrap JS の `<script>` を削除する**

```html
<!-- 削除 -->
```

対象ファイル: `index.html`, `sub-index.html`, `timeline/index.html`, `history/rekisou-forms/index.html`, `learning-links/index.html`, `404.html`, その他全ページ

**2-b. `js/nav.js` に Collapse を自前実装する**

`navbar-toggler` は `data-bs-toggle="collapse"` と `data-bs-target="#navMenu"` 属性を使って Bootstrap に依存している。`nav.js` の NAV_HTML インジェクト後に以下を追加する:

```js
// nav.js の mountThemeToggle または init 相当の箇所に追加
function _initCollapse() {
  document.querySelectorAll('[data-bs-toggle="collapse"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.dataset.bsTarget);
      if (!target) return;
      const isOpen = target.classList.toggle("show");
      btn.setAttribute("aria-expanded", isOpen);
    });
  });
}
```

**2-c. `timeline/index.html` の Bootstrap Modal を `<dialog>` 要素に置き換える**

```html
<!-- 変更前: Bootstrap Modal -->
<div class="modal fade tl-modal" id="tl-detail-modal" tabindex="-1" ...>
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">...</div>
      <div class="modal-body" id="tl-modal-body"></div>
      <div class="modal-footer">...</div>
    </div>
  </div>
</div>

<!-- 変更後: ネイティブ <dialog> -->
<dialog id="tl-detail-modal" class="tl-dialog">
  <div class="tl-dialog__header">
    <h5 id="tl-modal-label">詳細</h5>
    <button type="button" class="tl-dialog__close" aria-label="閉じる">
      ✕
    </button>
  </div>
  <div class="tl-dialog__body" id="tl-modal-body"></div>
  <div class="tl-dialog__footer">
    <button type="button" class="tl-dialog__close">閉じる</button>
  </div>
</dialog>
```

`timeline/script.js` の `getModal()` と `getModal().show()` を以下に変更:

```js
// 変更前
let _bsModal = null;
function getModal() {
  if (!_bsModal) {
    const el = document.getElementById("tl-detail-modal");
    if (el) _bsModal = new bootstrap.Modal(el);
  }
  return _bsModal;
}
// 呼び出し: getModal().show()

// 変更後
function openModal(row, cfg) {
  // ... body を組み立てる既存ロジックはそのまま ...
  document.getElementById("tl-detail-modal").showModal();
}
```

閉じるボタンのイベント:

```js
document.querySelectorAll(".tl-dialog__close").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.getElementById("tl-detail-modal").close();
  });
});
// backdrop クリックで閉じる
document.getElementById("tl-detail-modal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) e.currentTarget.close();
});
```

`<dialog>` のスタイルは `timeline/style.css` に追加（Bootstrap `.modal-*` クラスの代替）:

```css
.tl-dialog {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0;
  max-width: min(520px, 90vw);
  background: var(--color-surface);
  color: var(--color-text-primary);
}
.tl-dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}
.tl-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 2px solid var(--tl-accent-ui);
}
.tl-dialog__body {
  padding: 1rem 1.25rem;
  overflow-y: auto;
  max-height: 60vh;
}
.tl-dialog__footer {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}
.tl-dialog__close {
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  padding: 4px 12px;
  color: var(--color-text-secondary);
  font-family: inherit;
}
```

**2-d. `base.css` の Bootstrap JS 依存スタイルを確認する**

Bootstrap CSS の `.collapse` と `.navbar-collapse` クラスは Bootstrap CSS 側で定義されているため、Bootstrap CSS を残している間は問題ない。Step 4 で Bootstrap CSS も削除する際に改めて対応する。

---

## Step 3: Bootstrap Icons を削除してインライン SVG に置き換える（完了）

2026-04-01 実装済み。`src/js/icons.js` を共通 SVG レイヤーとして追加し、既存の `<i class="bi ...">` を自動で inline SVG に置換する方式で対応した。これにより `sub-index-init.js` や各ページのテンプレート文字列を大きく崩さずに `bootstrap-icons` 依存を外している。`package.json` / `package-lock.json` から `bootstrap-icons` も削除済みで、`npm run check` と `npm run build` を通過している。

### 背景

Bootstrap Icons CSS (~11 KB gzip) + woff2 フォントファイル (~230 KB) が毎ページ読み込まれている。  
実際に使っているアイコンは以下の約15〜20個:

`bi-chevron-left`, `bi-chevron-right`, `bi-chevron-up`, `bi-chevron-down`,
`bi-calendar3`, `bi-book`, `bi-globe`, `bi-bank`, `bi-coin`,
`bi-file-earmark-text`, `bi-house`, `bi-arrow-left`, `bi-box-arrow-up-right`,
`bi-geo-alt`, `bi-exclamation-triangle`

### 作業

**3-a. すべての HTML から Bootstrap Icons の `<link>` を削除する**

```html
<!-- 削除 -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css"
/>
```

**3-b. `js/nav.js` の NAV_HTML 内の `<i class="bi ...">` をインライン SVG に置き換える**

nav.js 内で使われているアイコン: `bi-chevron-left`（back-link）, `bi-chevron-up/down`（countdown）

**3-c. `js/sub-index-init.js` の `_resolveIcon()` — `bi-xxx` 判定ロジックを維持しつつ SVG に切り替える**

`list.json` の `"icon": "bi-book"` のような参照がある。`_resolveIcon()` は現在 Bootstrap Icons のフォントクラスを `<i class="bi bi-book">` として出力しているが、アイコン名 → SVG文字列のマップ (`ICON_MAP`) を持つ関数に置き換える:

```js
const ICON_MAP = {
  "bi-book": "<svg ...>...</svg>",
  "bi-globe": "<svg ...>...</svg>",
  // ...
};

function _resolveIcon(raw, slug) {
  if (!raw) return "";
  if (/^bi-[\w-]+$/.test(raw)) {
    return ICON_MAP[raw]
      ? `<span class="site-card__bi-icon mb-3">${ICON_MAP[raw]}</span>`
      : ""; // 未定義のアイコンは非表示
  }
  // 画像パスの処理は既存のまま
}
```

**3-d. 各 HTML の `<i class="bi ...">` をインライン SVG に置き換える**

対象ファイル: `index.html`, `sub-index.html`, `404.html`, `history/rekisou-forms/index.html`, `learning-links/index.html` など

Bootstrap Icons の SVG は MIT ライセンスで [icons.getbootstrap.com](https://icons.getbootstrap.com) から個別にコピーできる。また `node_modules/bootstrap-icons/icons/*.svg` にもある。

**3-e. `list.json` の `icon` フィールドを画像パスへ移行する（段階的）**

`"icon": "bi-book"` のエントリは `"icon": "/images/icons/book.svg"` のように画像参照へ書き換えることもできる。ただし `sub-index-init.js` の `_resolveIcon()` が SVGマップ方式で対応するなら `list.json` の変更は不要。

### 注意点

- `base.css` の `.site-card__bi-icon` スタイルはインライン SVG でも適用されるので変更不要
- インライン SVG には `aria-hidden="true"` を付けること（スクリーンリーダー対策）
- ダークモードで `fill: currentColor` を使えば CSS変数でアイコン色が追従する

---

## Step 4: Bootstrap CSS を削除して自前 CSS に置き換える

### 背景

Bootstrap CSS 全体 (~30 KB gzip) のうち、実際に使っているのはグリッド・ユーティリティ・Navbarのスタイルのみ。`base.css` が Bootstrap の多くを上書きしており、独自スタイルで機能していることが多い。

### 作業

**4-a. すべての HTML から Bootstrap CSS の `<link>` を削除する**

```html
<!-- 削除 -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
/>
```

**4-b. `css/base.css` に最小グリッドを追加する**

Bootstrap から実際に使っているグリッドクラスを自前実装する。必要なのは以下のみ:

```css
/* Grid */
.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
}
.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -0.75rem;
}
.col-12 {
  flex: 0 0 100%;
  max-width: 100%;
  padding: 0 0.75rem;
}
.col-md-2 {
  /* ... */
}
/* ... 使っている col-* だけ定義 */
.g-3 {
  gap: 1rem;
}
/* など */
```

実際には Bootstrap CSS を PurgeCSS で削ぐ方が現実的（後述）。

**4-c. Bootstrap の `.collapse` と `.navbar-collapse` を自前で定義する**

Step 2 で Bootstrap JS を削除済みの場合、CSS 側の collapse も自前になる:

```css
.navbar-collapse {
  display: none;
}
.navbar-collapse.show {
  display: block;
}
@media (min-width: 768px) {
  .navbar-collapse {
    display: flex !important;
  }
}
```

**4-d. ユーティリティクラスを `base.css` に追加する**

`py-4`, `mb-2`, `mt-4`, `d-flex`, `align-items-center`, `text-secondary` など、使っているクラスを列挙して自前定義する。

### 代替案: PurgeCSS による自動削減

Bootstrap CSS を完全削除するのではなく、ビルド時に未使用クラスを自動削除する。

```json
// package.json の scripts に追加
"purge": "purgecss --css dist/css/base.css dist/bootstrap.min.css --content 'dist/**/*.html' 'dist/**/*.js' --output dist/css/ --safelist show collapse navbar-collapse is-correct is-incorrect is-locked hidden qz-*"
```

`netlify.toml`:

```toml
[build]
command = "npm run build && npm run purge"
```

Bootstrap CSS 30 KB → 推定 4〜6 KB まで削減できる。完全削除より安全でリグレッションリスクが低い。

**推奨はこちら（PurgeCSS）**。完全自前実装は工数に対してリターンが小さい。

---

## Step 5: HTML minify をビルドに追加する

### 背景

現状の `npm run build` は JS・CSS を esbuild でminifyするが、HTMLはそのまま。コメント・空白の削除で 5〜15% 削減できる。

### 作業

**5-a. `html-minifier-terser` をインストールする**

```bash
npm install --save-dev html-minifier-terser
```

**5-b. `package.json` の build コマンドを更新する**

```json
"build": "shx rm -rf dist && shx mkdir -p dist && shx cp -r src/* dist && esbuild \"dist/**/*.js\" \"dist/**/*.css\" --minify --outdir=dist --allow-overwrite && npx html-minifier-terser --input-dir dist --output-dir dist --file-ext html --collapse-whitespace --remove-comments --minify-css true --minify-js true"
```

### 注意点

- `--minify-js true` はインライン `<script>` を minify するが、テンプレートリテラルや正規表現が壊れることがある。問題が出た場合は `--minify-js false` に戻す
- esbuild の minify と html-minifier-terser の minify-css が二重になる場合があるが、冪等なので問題ない

---

## 作業順序と依存関係

```
Step 1 (Fonts)     → 独立。いつでも実施可能
Step 2 (BS JS)     → 独立。Step 4 より先に実施すること（CSS の collapse が依存）
Step 3 (BS Icons)  → 独立。ただし sub-index-init.js の変更を伴うため list.json の動作確認が必要
Step 4 (BS CSS)    → Step 2 完了後に実施。PurgeCSS 案なら Step 2 なしでも可
Step 5 (minify)    → 独立。最後に追加するだけでよい
```

---

## 完了後の外部リクエスト

| ページ種別                        | 残る外部リクエスト                    |
| --------------------------------- | ------------------------------------- |
| 標準ページ（index, sub-index 等） | Supabase JS（クイズ・年表ページのみ） |
| クイズページ                      | Supabase JS, marked.js                |
| 年表ページ                        | Supabase JS                           |
| learning-links                    | Raindrop API（自サーバー経由）        |

Google Fonts・Bootstrap 系の外部リクエストはすべてゼロになる。

---

## `description.md` の更新が必要な箇所

作業完了後、以下を更新する:

- スタック表の「スタイル基盤」: `css/base.css` + Bootstrap 5 (CDN) → `css/base.css`（自前グリッド）
- HTML ページテンプレートから Bootstrap 関連の `<link>` と `<script>` を削除
- CSS 読み込み順の記述を更新
