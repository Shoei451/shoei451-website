# Todo — shoei451-website

最終更新: 2026-03-26

---

## 優先度: 高

### 1. `wh_dates` 移行の完了（出題側）

現状、管理画面は `wh_dates` ベースだが、出題・年表のフロントは旧テーブル参照が残っている。

- [ ] `history/world/index.html` の `TABLES.WH_QUIZ` 依存を `TABLES.WH_DATES` に移行
- [ ] `history/world/year-to-event/quiz.js` を `wh_dates` 参照に移行
- [ ] `history/world/event-to-year/quiz.js` を `wh_dates` 参照に移行
- [ ] `history/world/timeline.html` を `wh_dates` 参照に移行
- [ ] `history/china/index.html` / `history/china/timeline.html` を `TABLES.CHINESE` から `TABLES.WH_DATES` へ移行

### 2. `history/world/admin/script.js` の重複ロジック整理

同ファイルに「旧モーダル実装」と「ウィザード実装」が共存しており、同名関数上書きで成立している状態。

- [ ] 旧実装ブロック（上部）を削除し、ウィザード実装のみへ一本化
- [ ] 一次・二次関数の衝突がない形で再構成
- [ ] `npm run check` + 手動操作（追加・編集・削除）で回帰確認

### 3. Project 2 の publishable key 更新

`js/supabase_config.js` の `SUPABASE_KEY_2` はプレースホルダーのまま。

- [ ] `SUPABASE_KEY_2 = 'YOUR_PROJECT2_PUBLISHABLE_KEY'` を実値に差し替え

---

## 優先度: 中

### 4. 提出箱モデルの実装（build + 配信）

- [ ] `wh_dates` から静的JSONを生成する build スクリプトを作成
- [ ] GitHub Actions で定期/手動ビルドを実行
- [ ] フロントは JSON 読み込みを第一経路にし、DB 直読を縮小

### 5. クリーンアップ（未参照ファイル）

- [ ] `templates/back-links.html`
- [ ] `templates/blog_template.html`
- [ ] `templates/gitub-icons.html`
- [ ] `templates/migration.html`
- [ ] `templates/sekaishi_mini_data.js`
- [ ] `templates/under-construction.html`

### 6. 共通ユーティリティの最終統一

- [ ] `seikei/timeline/quiz.html` 内の `escapeHtml` / `shuffleArray` を `js/wh-utils.js` に寄せる
- [ ] `history/world/year-to-event/quiz.js` / `event-to-year/quiz.js` のローカル `shuffleArray` を共通化するか方針決定

---

## 優先度: 低

### 7. docs 生成スクリプトのカテゴリラベル更新

`docs/build.js` の `DIR_LABELS` に旧パス名（例: `informatics1`, `home_economics`）が残っている。

- [ ] 実ディレクトリ（`informatics`, `home-economics`）に合わせて修正

---

## 直近で完了した項目

- [x] 全HTMLへの `sendBeacon('/api/sw?...')` 挿入運用
- [x] `js/wh-utils.js` の作成（`formatYear` / `formatYearRange` / `escapeHtml` / `shuffleArray`）
- [x] 世界史管理画面を `wh_dates` ベースへ移行（`history/world/admin/main.html` + `script.js`）
- [x] サブインデックスを `sub-index.html?slug=...` 共通エンジンへ統一

---

## やらないこと（現時点の方針）

- **全ページを即時フレームワーク化しない**: 現行の静的HTML構成を維持し、段階的に共通化する
- **admin 系ページへの `common.css` 強制適用はしない**: レイアウト衝突を避けるため独自 `style.css` を優先
