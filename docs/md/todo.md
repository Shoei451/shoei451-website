# Todo — shoei451-website

最終更新: 2026-03-20  

---

## 優先度：高（直近でやること）

### 2. アクセスログ実装の完了（`handoff.md` より継続・Netlify 安定後）

`build.js` は既にあるが未実行。
- [ ] `build.js` を実行して全HTMLに `sendBeacon` スニペットを挿入
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

- [x] admin 管理画面を `wh_dates` に対応させる

  

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


---  

## やらないこと（意思決定済み）
- **タブ+テーブル UI の共通コンポーネント化**: カテゴリ名・カラム構成がページごとに違いすぎるため、設定オブジェクトが複雑になってメリットが薄い
- **SVG の外部ファイル化**: `stroke: currentColor` によるダークモード連動が壊れるため非推奨
- **anon key のローテート**: Supabase Auth 未使用のためセッション影響なし。将来 publishable key 移行時に旧 key を無効化する