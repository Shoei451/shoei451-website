# Noto Sans JP 削除手順

作成: 2026-04-01
更新: 2026-04-01

---

## 現状の問題

Noto Sans JP（+ Zen Kaku Gothic New）は **2か所から二重に読み込まれている**。

| 読み込み箇所        | 内容                                                              |
| ------------------- | ----------------------------------------------------------------- |
| `css/base.css` 先頭 | `@import url("https://fonts.googleapis.com/...")`                 |
| 各 HTML の `<head>` | `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` |

`@import` はCSSのパース中にブロックされるため、`<link>` より遅い。二重になっているページではリクエストが2本発行されるうえ、片方が必ずブロッキングになっている。

**影響ファイル一覧:**

- `css/base.css` — `@import` で Noto Sans JP + Zen Kaku Gothic New
- `index.html` — `<link>` で同上
- `sub-index.html` — `<link>` で同上
- `timeline/index.html` — `<link>` で同上
- `learning-links/index.html` — `<link>` で Noto Sans JP + Zen Kaku + **JetBrains Mono** も追加
- `seikei/print.html` — インラインCSSの `font-family` に `"Noto Sans JP"` の文字列参照のみ（`<link>` は無し）

---

## フォントスタックの方針

Noto Sans JP を削除し、OS標準の日本語フォントにフォールバックさせる。

```css
/* 変更前 */
font-family:
  "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Segoe UI", sans-serif;

/* 変更後 */
font-family:
  "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "YuGothic",
  "Meiryo", sans-serif;
```

| OS            | 使われるフォント                           |
| ------------- | ------------------------------------------ |
| macOS         | ヒラギノ角ゴシック（システム標準、高品質） |
| Windows 10/11 | 游ゴシック                                 |
| Windows 7/8   | メイリオ                                   |
| Android       | Noto Sans CJK（OS同梱）                    |
| iOS           | ヒラギノ角ゴシック                         |

学習ツールとして問題になるフォント差分はない。

### Zen Kaku Gothic New の扱い

ナビバーのブランド名 `Shoei451` と一部見出しの `font-family: "Zen Kaku Gothic New"` に使用。

**選択肢:**

- A. Zen Kaku も削除し、ヒラギノ/游ゴシックで代替（ほぼ視覚差なし）
- B. Zen Kaku だけ残し `wght@700` の1ウェイトに絞る（~15KB削減に留まる）

本手順では **A（Zen Kaku も削除）** を前提とする。Bを選ぶ場合はStep 1の`@import`のURLを `family=Zen+Kaku+Gothic+New:wght@700` だけに書き換えること。

### JetBrains Mono（learning-links のみ）

`learning-links/style.css` で `.link-domain` と `.folder-count` に使用。ドメイン名とバッジの数字表示のみなので、`monospace` または `"Courier New", monospace` で代替できる。削除対象に含める。

---

## 作業手順

### Step 1: `css/base.css` の `@import` を削除

**変更箇所:** ファイル先頭1行

```css
/* 削除する行 */
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Zen+Kaku+Gothic+New:wght@400;700&display=swap");
```

この1行を丸ごと削除する。

### Step 2: `css/base.css` の `font-family` を書き換える

**変更箇所:** `:root` のカスタムプロパティと `body` のスタイル

```css
/* 変更前 */
:root {
  ...
}

body {
  font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Segoe UI", sans-serif;
  ...
}

h1, h2, h3, h4, h5, h6 {
  font-family: "Zen Kaku Gothic New", "Noto Sans JP", sans-serif;
  ...
}
```

```css
/* 変更後 */
body {
  font-family: "Hiragino Kaku Gothic ProN", "Hiragino Sans",
               "Yu Gothic", "YuGothic", "Meiryo", sans-serif;
  ...
}

h1, h2, h3, h4, h5, h6 {
  font-family: "Hiragino Kaku Gothic ProN", "Hiragino Sans",
               "Yu Gothic", "YuGothic", "Meiryo", sans-serif;
  ...
}
```

`#site-nav .navbar-brand` にも `font-family: "Zen Kaku Gothic New", sans-serif` があるので同様に書き換える。

### Step 3: 各 HTML の `<link>` と `<meta preconnect>` を削除

対象ファイルと削除する行:

**`index.html`**

```html
<!-- 削除 -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Zen+Kaku+Gothic+New:wght@400;700&display=swap"
/>
```

※ `base.css` が `@import` を持っていたため、`index.html` には `<link>` が **無い**（base.css の @import だけで読み込まれていた）。よって `index.html` の HTML 側変更は不要。

**`sub-index.html`** — HTMLに`<link>`は無い（base.css経由のみ）

**`timeline/index.html`**

```html
<!-- 削除 -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Zen+Kaku+Gothic+New:wght@400;700&display=swap"
  rel="stylesheet"
/>
```

**`learning-links/index.html`**

```html
<!-- 削除 -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Zen+Kaku+Gothic+New:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

### Step 4: `quiz-shell.css` の `font-family` を書き換える

```css
/* 変更前 */
body {
  font-family:
    "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Segoe UI", sans-serif;
}
```

```css
/* 変更後 */
body {
  font-family:
    "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "YuGothic",
    "Meiryo", sans-serif;
}
```

### Step 5: `timeline/style.css` の `font-family` を書き換える

```css
/* 変更前 */
body {
  font-family:
    "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Segoe UI", sans-serif;
}

.tl-header__title {
  font-family: "Zen Kaku Gothic New", "Noto Sans JP", sans-serif;
}
```

```css
/* 変更後 */
body {
  font-family:
    "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "YuGothic",
    "Meiryo", sans-serif;
}

.tl-header__title {
  font-family:
    "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "YuGothic",
    "Meiryo", sans-serif;
}
```

### Step 6: `learning-links/style.css` の JetBrains Mono を置き換える

```css
/* 変更前 */
.link-domain {
  font-family: "JetBrains Mono", monospace;
}
.folder-count {
  font-family: "JetBrains Mono", monospace;
}
```

```css
/* 変更後 */
.link-domain {
  font-family: "Courier New", monospace;
}
.folder-count {
  font-family: "Courier New", monospace;
}
```

### Step 7: `seikei/print.html` のフォント文字列参照を書き換える

`<link>` は無い（インラインCSSの参照のみ）。

```css
/* 変更前（インラインstyle内） */
font-family: "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif;
```

```css
/* 変更後 */
font-family:
  "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "YuGothic",
  "Meiryo", sans-serif;
```

### Step 8: `my-html/SKILL.md` の Font Loading セクションを更新（任意）

スキルファイルにGoogleFontsの読み込みスニペットが残っているので、次回ページ作成時に誤って再追加しないよう、フォントスタック方針を更新しておく。

---

## 削減効果まとめ

| 項目                                    | 変更前                                                 | 変更後 |
| --------------------------------------- | ------------------------------------------------------ | ------ |
| 外部リクエスト（フォント関連）          | `fonts.googleapis.com` + `fonts.gstatic.com` で 3〜5本 | 0本    |
| 転送量（フォント）                      | woff2ファイル合計 推定 300〜500KB                      | 0KB    |
| レンダーブロッキング                    | `base.css` の `@import` でブロッキング発生             | 解消   |
| `timeline/index.html` の余分な `<link>` | 2本（preconnect + stylesheet）                         | 0本    |

---

## 注意点

- `font-feature-settings: "pkna"` はヒラギノ/游ゴシックでも有効なので残す。
- `quiz-components/` 以下の各コンポーネントCSSには `font-family` の直書きはないが、`quiz-shell.css` で `body` に適用されているので Step 4 だけで全クイズページに反映される。
- `seikei/japan-constitution-quiz.html` は `base.css` を読まず独立したCSSを持っているが、Google Fontsの `<link>` は無い（`<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP&display=swap" rel="stylesheet">` のみ）。このファイルも同様に削除・フォントスタック更新が必要。

---

## 実装結果（検証済み）

- `src/css/base.css` の `@import` を削除し、共通フォントを system stack に置き換えた。
- `timeline` / `learning-links` / `about` / `geography/china` / `geography/africa-independence-atlas` / `miscellaneous/sudoku-programming-guide` / `seikei` の対象ページから、`Noto Sans JP` / `Zen Kaku Gothic New` を読む Google Fonts の `<link>` を削除した。
- `JetBrains Mono` を使っていた `learning-links` / `about` / `geography/africa-independence-atlas` / `miscellaneous/sudoku-programming-guide` は `"Courier New", monospace` に置き換えた。
- `miscellaneous/care-symbols` は `Noto Sans JP` だけを外し、`Shrikhand` と `DM Mono` の読み込みは維持した。
- 文書初版に未記載だった `about` / `geography/china` / `geography/africa-independence-atlas` / `miscellaneous/sudoku-programming-guide` も同方針で更新した。
- 検索確認時点で、`src/` 配下の `Noto Sans JP` / `Zen Kaku Gothic New` の参照は 0 件。
- `src/playground/dodge-game` の `JetBrains Mono` は、今回の Noto Sans JP 削除作業の対象外として未変更。

## 検証

- `npm run check`
- `npm run build`
