# 開発進捗ログ

shoei451-website のインフラ・機能開発の記録。設計の意思決定と作業履歴をここに残す。

---

## 2026-03-20

### Supabase 読み込みロジックの統一

**背景**  
ページごとに `createClient` の呼び出し方や変数名（`apiClient` / `quizApiClient` / `timelineApiClient` など）がバラバラだった。ページ数が増えると保守コストが指数的に増えるため、早期に手を打つことにした。

**対応**  
- `js/supabase_config.js` を single source of truth として確立
- 変数名を `db`（Project 1）/ `db2`（Project 2）/ `TABLES`（テーブル名定数）に統一
- 全ページのエイリアス変数（`const apiClient = db` 等）を削除

**ルール（今後も維持）**  
各ページで `createClient` を直接呼ばない。`supabase_config.js` 経由のみ。

---

### Supabase publishable key への移行（Project 1）

**背景**  
Supabase が anon key（`eyJ...` 形式）を2026年末に廃止予定とアナウンス。

**対応**  
- Project 1 の publishable key を MCP で取得し `supabase_config.js` に反映
- Project 2 は MCP 権限外のため手動更新が必要（未完了）

**設計判断**  
スキルファイル（`my-backend/SKILL.md`）にキーを直書きするのではなく「MCP で動的取得する」と記述してプレースホルダー化。キーの変更にスキルファイルの更新が追随しなくなる問題を回避。

---

### `wh_dates` テーブル設計・構築

**背景**  
旧テーブル（`world_history_quiz` / `world_history_events` / `chinese_history`）は設計が古く、以下の問題があった。

- `world_history_events` の「その他」カテゴリが全体の60%を占め、フィルタが機能していない
- 中国史・世界史・政経のデータが別テーブルに分散しており、横断的なクイズ・フラッシュカードが作れない
- `world_history_quiz` の `is_bc` boolean は `year` を負数にすれば不要

**設計ゴール**  
1テーブル（`wh_dates`）で全地域・全時代を扱えるようにする。`region` を配列型にすることで「モンゴル帝国のような複数地域にまたがる事件」も表現できる。

**追加カラム（今セッション中に決定）**

| カラム | 理由 |
|---|---|
| `year_end` | WWI（1914〜1918）のような期間を表現するため |
| `record_type` | 出来事・期間・人物を同一テーブルで管理するため |
| `wiki_url` | wiki_score cron の参照先を明示的に指定するため |
| `year` nullable 化 | 人物の生没年が不明なケースに対応するため |

**RLS**  
SELECT は public（anon 含む全員）、INSERT/UPDATE/DELETE は `authenticated` のみ。管理画面は Supabase Auth でログインが必要。

---

### 管理画面（`history/worldhistory/admin/`）のリニューアル

**背景**  
旧管理画面（`world_history_quiz` 向け）は `wh_dates` の新スキーマに対応していなかった。

**実装内容**  
- Supabase Auth によるログイン・ログアウト
- 種別タブ（出来事 / 期間 / 人物）+ 地域・分野フィルタ + 全文検索
- サーバーサイドページネーション（50件/ページ）
- Wikipedia REST API（`/api/rest_v1/page/summary/{title}`）による `wiki_url` 自動取得パネル
- テーマトグル完全インライン化（`theme-toggle.js` への依存を排除）

**設計判断：テーマトグルのインライン化**  
`common.css` は `header` タグに `overflow: hidden` を適用するため、外部 `theme-toggle.js` を読み込むと管理画面のボタン配置が崩れる。管理画面は `common.css` を読まない独立した CSS を持つことにし、テーマトグルもインライン化した。

---

## バックログ（未着手・今後対応）

### 優先度：高

- **Project 2 publishable key 更新**（手動）
- **提出箱モデル移行**（worldhistory・china）
  - `history/worldhistory/build.js` 作成（Supabase → 静的JSON）
  - GitHub Actions ビルドジョブ
  - クイズ・年表ページを JSON 読み込みに変更
  - 旧3テーブル DROP

### 優先度：中

- **Supabase 凍結対策 cron**（毎週 SELECT を投げる keep_alive ジョブ）
- **wiki_score 月次更新 cron**（Wikipedia Pageviews API → パーセンタイル正規化 → UPDATE）
- **テーマトグル SVG の重複解消**（多くのページに同じマークアップが散在）

### 優先度：低

- `seikei_events` / `english_idioms` / `koten_questions` の提出箱モデル化検討