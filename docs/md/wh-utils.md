各ファイルの実装を比較すると：

**`formatYear`**
- `wh-era-quiz_logic.js`: `q.is_bc ? \`前${q.year}年\` : \`${q.year}年\`` — オブジェクトを受け取る
- `admin/script.js`: `year < 0 ? \`前${Math.abs(year)}\`年 : \`${year}年\`` — 数値を受け取る（`wh_dates` 仕様）
- `worldhistory/timeline.html`: `event.is_bc ? ...` — オブジェクト受け取り（旧仕様）

`wh_dates` 移行後は **負数統一** なので `admin/script.js` の仕様に統一すればよい。

**`escapeHtml`** は全箇所で完全に同一実装。即座に共通化できる。

**`parseYearInput` / `determinePeriod`** は `wh-era-quiz_logic.js` にのみ存在し、旧テーブル（`is_bc` boolean + 正数の年号）前提。`wh_dates` 移行後は不要になる（管理画面では負数で直接入力）。全実装を確認できたので、`wh-utils.js` を作成します。これを `js/wh-utils.js` に配置した後、各ページで以下の対応をすれば完了です。

---

**削除・置き換えの対応表**

| ファイル                         | 削除する実装                                                       | 置き換え後                       |
| ---------------------------- | ------------------------------------------------------------ | --------------------------- |
| `wh-era-quiz_logic.js`       | `shuffle()` 関数（Fisher-Yates版）                                | `shuffleArray()` に統一        |
| `wh-era-quiz_logic.js`       | `formatYear(q)` ← オブジェクト受け取り版                                | 削除（旧テーブル専用、`wh_dates`移行後不要） |
| `admin/script.js`            | `formatYear(year)` / `formatYearRange(row)` / `escapeHtml()` | すべて削除                       |
| `worldhistory/timeline.html` | `formatYear(event)` / `escapeHtml()` / `shuffleArray()`      | すべて削除                       |
| `china/timeline.html`        | `escapeHtml()`                                               | 削除                          |
| `china/index.html`           | `escapeHtml()` / `shuffleArray()`                            | 削除                          |
| `seikei/timeline/index.html` | `escapeHtml()`                                               | 削除                          |
| `seikei/timeline/print.html` | `escapeHtml()`                                               | 削除                          |

**読み込み順の注意点**: `wh-utils.js` は `supabase_config.js` より前に読み込む必要はないですが、`logic.js` より前に置くこと。

```html
<script src="../../js/wh-utils.js"></script>
<script src="../../js/supabase_config.js"></script>
<script src="logic.js"></script>
```

`parseYearInput` と `determinePeriod` は `wh_dates` 移行後は不要（管理画面で負数を直接入力する設計になっているため）なので、移行完了のタイミングで `wh-era-quiz_logic.js` ごと廃棄でOKです。