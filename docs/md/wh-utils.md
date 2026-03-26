# `js/wh-utils.js` 運用メモ

最終更新: 2026-03-26

---

## 1. 目的

世界史・中国史・政経ページで重複していた以下を共通化するためのユーティリティ。

- `formatYear(year)`
- `formatYearRange(row)`
- `escapeHtml(text)`
- `shuffleArray(array)`

実体: `js/wh-utils.js`

---

## 2. 現在の仕様

### `formatYear(year)`

- `null` / `undefined` は `"不明"`
- 負数は `"前{abs}年"`
- 正数は `"{year}年"`

### `formatYearRange(row)`

- `row.year` と `row.year_end` を連結
- `year_end` がない場合は開始年のみ

### `escapeHtml(text)`

- `textContent` 経由で HTML エスケープ
- `innerHTML` に差し込む直前の値に適用

### `shuffleArray(array)`

- Fisher-Yates
- 非破壊（コピー配列を返す）

---

## 3. 既に利用している主なページ

- `history/world/admin/main.html` + `script.js`
- `history/world/index.html`
- `history/world/timeline.html`
- `history/china/index.html`
- `history/china/timeline.html`
- `seikei/timeline/index.html`
- `seikei/timeline/print.html`

---

## 4. まだローカル実装が残る箇所

- `seikei/timeline/quiz.html` に `escapeHtml` / `shuffleArray` のローカル実装
- `history/world/year-to-event/quiz.js` に `shuffleArray` のローカル実装
- `history/world/event-to-year/quiz.js` に `shuffleArray` のローカル実装

この3箇所は今後の統一候補。

---

## 5. 読み込み順

`logic.js` / `quiz.js` より前で読み込む。

```html
<script src="../../js/wh-utils.js"></script>
<script src="../../js/supabase_config.js"></script>
<script src="logic.js"></script>
```

相対パスはページ階層に合わせて調整する。

---

## 6. 補足

`wh-utils.js` は `window` に関数を公開する設計（ESM ではない）。
ページ側では `window.` を付けずにそのまま呼べる。
