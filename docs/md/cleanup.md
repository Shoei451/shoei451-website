# サイト内クリーンアップ対象一覧

最終更新: 2026-03-24

---

## 1. 未参照 HTML ファイル

|ファイル|状況|対処|
|---|---|---|
|`history/world/index2.html`|`history/list.js` の `sectionItems3` から `world/sub-index.html` 経由でリンクされているが、`index2.html` 自体への直接リンクはなし。`quiz2.js` を読み込む旧統合版。|`sub-index.html` ルートを整理して削除|
|`under-construction.html`|どこからもリンクされていない|削除|
|`templates/back-links.html`|本番ページから参照なし|削除 or アーカイブ|
|`templates/blog_template.html`|同上|削除 or アーカイブ|
|`templates/gitub-icons.html`|同上|削除 or アーカイブ|
|`templates/migration.html`|同上|削除 or アーカイブ|

---

## 2. 未参照 JS ファイル

|ファイル|状況|対処|
|---|---|---|
|`history/world/quiz2.js`|`index2.html` が読み込んでいるが、`index2.html` 自体が参照されていない|`index2.html` と一緒に削除|
|`templates/sekaishi_mini_data.js`|`templates/` 内のみで参照、本番から未使用|削除 or アーカイブ|

---

## 3. 移行後に不要になる JS ファイル

|ファイル|現状|廃止条件|
|---|---|---|
|`js/wh-era-quiz_logic.js`|`history/world/index.html`（旧版）が読み込んでいる。`year-to-event/quiz.js` と `event-to-year/quiz.js` に機能移植済み。`parseYearInput` / `determinePeriod` は `wh_dates` 移行後に不要と `docs/md/wh-utils.md` に明記。|`history/world/index.html` 廃止後|
|`history/styles/wh-era-quiz.css`|同じく `history/world/index.html`（旧版）のみが使用。新版クイズは `quiz-components/quiz-shell.css` に移行済み。|同上|

---

## 4. 使われていない変数・定数

|場所|変数|状況|対処|
|---|---|---|---|
|`js/supabase_config.js`|`SUPABASE_KEY_2`, `db2`|`YOUR_PROJECT2_PUBLISHABLE_KEY` のプレースホルダーのまま。Project 2 を参照するページはこのリポジトリ内に存在しない（東進トラッカーは別リポジトリ）。|別リポジトリ専用と割り切るか、このリポジトリから削除|
|`js/wh-era-quiz_logic.js`|`parseYearInput()`, `determinePeriod()`|`is_bc` フラグ + 正数年号の旧テーブル仕様専用。`wh_dates` 移行後は負数統一になるため不要。|`wh_dates` 移行完了後に `wh-era-quiz_logic.js` ごと削除|

---

## 5. コードの残骸（コメントアウト / 上書き）

|ファイル|箇所|内容|対処|
|---|---|---|---|
|`seikei/timeline/index.html`|`tbody` 内の削除ボタン|`<!--<button class="btn-delete" ...>削除</button>-->` がコメントアウトのまま残っている|削除|
|`history/world/admin/script.js`|`handleFormSubmit`, `editEvent`, `openAddModal`（旧版）|ウィザード版の同名関数でファイル下部に再定義されており、上部の旧版は実質デッドコード|旧版3関数を削除|
|`history/china/culture_quiz/quizdata.js`|`商鞅`, `程頤・程顥`|コメントアウト済み。意図的な除外か放置か不明|意図的なら削除してコメントに理由を記載|

---

## 6. 命名の不統一（動作上の問題はないが保守コスト）

|箇所|内容|
|---|---|
|`js/cards-data.js` の `cardsList`|`index.html` トップページ専用。他の `list.js` は `sectionItems*` + `PAGE_CONFIG` の構造だが、ここだけ独自形式。`index.html` の特殊性を考えると許容範囲だが、コメントで明記しておくと混乱が減る。|

---

## 対処の優先順位

### すぐ削除できる

- `under-construction.html`
- `templates/` 配下の4HTML + 1JS
- `seikei/timeline/index.html` の削除ボタンコメントアウト残骸

### `history/world/index.html` の廃止と同時に

- `index2.html`
- `quiz2.js`
- `js/wh-era-quiz_logic.js`
- `history/styles/wh-era-quiz.css`

### `wh_dates` 移行完了後

- `js/wh-era-quiz_logic.js`（上と重複、どちらのタイミングでも可）

### 判断が必要なもの

- `js/supabase_config.js` の `db2` — 別リポジトリから参照される可能性があるなら残す
- `history/world/admin/script.js` の旧版3関数 — 削除前に admin 画面の動作確認を忘れずに