# Todo — shoei451-website

最終更新: 2026-03-20

---

## 優先度：高（直近でやること）

### 1. `js/supabase-config.js` を作成する ← 最優先

Netlify build が不安定な間は `__SUPABASE_ANON_KEY__` プレースホルダーに依存できないため、
まず anon key 直書きで重複排除のメリットだけ先に取る。
build.js による key 置換は Netlify が安定したあとで上乗せする。

```js
// js/supabase-config.js
const SUPABASE_URL = 'https://gjuqsyaugrsshmjerhme.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGci...（実際のキー）';

const TABLES = {
  WH_QUIZ:    'world_history_quiz',
  WH_DATES:   'wh_dates',
  WH_REGIONS: 'wh_regions',
  CHINESE:    'chinese_history',
  SEIKEI:     'seikei_events',
  ACCESS_LOG: 'access_logs',
};

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

- [ ] `js/supabase-config.js` を作成（anon key 直書き）
- [ ] 各ページの `createClient` 呼び出しをこのファイルに差し替え
- [ ] 対象ファイル（10件）: `history/china/index.html`、`history/china/timeline.html`、`history/worldhistory/admin/script.js`、`history/worldhistory/timeline.html`、`seikei/timeline/index.html`、`seikei/timeline/print.html`、`seikei/timeline/quiz.html`、`koten/joushiki/app.js`、`others/idiom_quiz/quiz-logic.js`、`js/wh-era-quiz_logic.js`

### 2. アクセスログ実装の完了（`handoff.md` より継続・Netlify 安定後）

`build.js` は既にあるが未実行。

- [ ] `build.js` を実行して全HTMLに `sendBeacon` スニペットを挿入
- [ ] 全ファイルの anon key 直書きを `__SUPABASE_ANON_KEY__` に置換（`build.js` 拡張）
- [ ] `netlify.toml` の `command = "node build.js"` を確認して push
- [ ] Netlify の Environment Variables に `SUPABASE_ANON_KEY` が設定されていることを確認
- [ ] `access_logs` テーブルへの書き込みを実際のアクセスで確認

---

## 優先度：中（モジュール化）


### 3. `js/wh-utils.js` を作成する（`wh_dates` 移行と同時にやる）

以下の関数が3箇所に重複している: `formatYear`、`parseYearInput`、`determinePeriod`。
`wh_dates` では `year` が負数統一になるため、このタイミングで関数の仕様も変わる。移行作業と抱き合わせで切り出す。

- [ ] `wh_dates` 移行が決まったタイミングで `js/wh-utils.js` を作成
- [ ] `wh-era-quiz_logic.js`、`admin/script.js`、`worldhistory/timeline.html` から重複を除去

### 4. `escapeHtml` を共通化する

`admin/script.js`、`worldhistory/timeline.html`、`seikei/timeline/index.html` などに同一実装。

- [ ] `js/wh-utils.js` か `js/supabase-config.js` に追加するか検討
- [ ] ページ側から重複を除去

---

## 優先度：中（`wh_dates` 移行 — 5フェーズロードマップ）

`history/wh_table_renewal.md` に詳細スキーマあり。

### Phase 1: admin HTML ← 完了済み

### Phase 2: worldhistory 移行

- [ ] `world_history_quiz` のデータを `wh_dates` に入力（ゼロから、旧データは品質不足のため移行しない）
- [ ] `wh-era-quiz_logic.js` を `wh_dates` ベースに書き換え（`year` 負数統一、`region` フィルタ）
- [ ] `worldhistory/timeline.html` を `wh_dates` ベースに書き換え
- [ ] admin 管理画面を `wh_dates` に対応させる

### Phase 3: 中国史サイトを `wh_dates` に統合

- [ ] `chinese_history` テーブルのデータを `wh_dates`（`region: ['china']`）に移行
- [ ] `history/china/timeline.html`、`history/china/index.html` を `wh_dates` ベースに書き換え

### Phase 4: `wiki_score` 月次 cron

- [ ] GitHub Actions のワークフローを作成
- [ ] Wikipedia Pageviews API（日本語版 → 英語版フォールバック）でスコア取得
- [ ] パーセンタイルで 1〜5 に正規化して `wh_dates.wiki_score` を UPDATE

### Phase 5: 全体確認

- [ ] 全ページで `npm run check`（JS syntax + リンクチェック）
- [ ] Supabase が停止しても静的JSONから出題できることを確認（提出箱モデルの検証）
- [ ] Simple Analytics 拡張の削除（保留中）

---

## 優先度：低（後回しでいい）

- [ ] テーマトグルSVGスニペットを `templates/` に明文化（admin ページでの inline 化の理由も注記）
- `care-symbols/` の画像パスを `images\care-symbols` から `care-symbols/` フォルダ内に変更（`home_economics/care-symbols/` の件）

---

## やらないこと（意思決定済み）

- **タブ+テーブル UI の共通コンポーネント化**: カテゴリ名・カラム構成がページごとに違いすぎるため、設定オブジェクトが複雑になってメリットが薄い
- **`list1.js` / `list2.js` のモジュール化**: データと処理の分離として意図的な設計。変えない
- **SVG の外部ファイル化**: `stroke: currentColor` によるダークモード連動が壊れるため非推奨
- **anon key のローテート**: Supabase Auth 未使用のためセッション影響なし。将来 publishable key 移行時に旧 key を無効化する