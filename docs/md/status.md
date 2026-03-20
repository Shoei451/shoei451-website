# 451-website インフラ・設計ドキュメント

**最終更新:** 2026-03-20  
**リポジトリ:** `Shoei451/shoei451-website` → `shoei451.netlify.app`  
**Supabase Project 1:** `gjuqsyaugrsshmjerhme`（学習コンテンツ）  
**Supabase Project 2:** `qmtlsxuoewdajgnjxfkb`（生産性・東進トラッカー）

---

## 完了済み事項

### wh_dates / wh_regions テーブル設計・作成

旧テーブル（`world_history_quiz` / `world_history_events` / `chinese_history`）を廃止し、1テーブルで全サイトに対応できる新設計に移行中。

**`wh_regions`**（地域マスタ）— 作成済み・13件投入済み

**`wh_dates`**（本体）— 作成済み・データ入力中

```
id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY
year        integer                        -- 負数でBC統一（前221年 → -221）、nullable（不明なら NULL）
year_end    integer                        -- 期間終了年・没年（nullable）
date_type   text CHECK('year'|'full'|'circa')  DEFAULT 'year'
full_date   date                           -- date_type='full'のときのみ使用
event       text NOT NULL                  -- 名詞形・短く
description text                          -- 補足説明（フラッシュカード裏面）
region      text[]  DEFAULT '{}'          -- 複数地域対応、GINインデックス済み
field       text CHECK('政治'|'経済'|'文化・宗教'|'社会'|'外交・戦争')
record_type text NOT NULL DEFAULT 'event' CHECK('event'|'period'|'person')
wiki_url    text                           -- 参照するWikipediaページURL
memo        text                          -- Markdown形式
wiki_score  smallint CHECK(1-5)           -- 月1 cronでWikipedia APIから自動更新
created_at  timestamptz DEFAULT now()
updated_at  timestamptz DEFAULT now()     -- triggerで自動更新
```

RLS設定：

|操作|許可対象|
|---|---|
|SELECT|`public`（anon含む全員）|
|INSERT / UPDATE / DELETE|`authenticated`（ログイン済みのみ）|

### 管理HTML（`history/worldhistory/admin/`）

`index.html` / `script.js` / `style.css` を `wh_dates` 対応版に更新済み。

主な機能：

- Supabase Auth によるログイン・ログアウト
- 種別タブ（出来事 / 期間 / 人物）+ 地域・分野フィルタ + 全文検索
- サーバーサイドページネーション（50件/ページ）
- Wikipedia REST API による wiki_url 自動取得パネル
- テーマトグル完全インライン化（`theme-toggle.js` 非依存）

### Supabase キー移行（Project 1 完了・Project 2 未対応）

`js/supabase_config.js` を publishable key に更新済み。

```js
// Project 1（完了）
const SUPABASE_KEY  = 'sb_publishable_K-TVhPlOAGY7cLhanI9Tag_kKIDoIGU';
// Project 2（要手動更新）
const SUPABASE_KEY_2 = 'YOUR_PROJECT2_PUBLISHABLE_KEY';
```

Project 2 の publishable key は [Supabase Dashboard](https://supabase.com/dashboard/project/gjuqsyaugrsshmjerhme) > Settings > API から手動取得・更新が必要。

### Supabase 読み込みロジックの統一（完了）

全ページで `db` / `db2` / `TABLES` に一本化済み。エイリアス変数（`apiClient` / `quizApiClient` / `timelineApiClient` / `supabaseClient` など）はすべて削除。

**統一ルール（維持すること）：**

1. `js/supabase_config.js` を必ず読み込む。各ページで `createClient` を直接呼ばない
2. 変数名は `db`（Project 1）/ `db2`（Project 2）に固定。エイリアス禁止
3. テーブル名は `TABLES.XXX` 定数を使う。文字列リテラルで書かない
4. エラーは必ず `if (error)` でチェックし、UIにフィードバックする
5. `service_role key` は絶対にフロントに書かない

**読み込みパターン：**

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../../js/supabase_config.js"></script>  <!-- パスは深さに合わせて調整 -->
<script src="logic.js"></script>
```

---

## 進行中・未着手の作業

### 優先度：高

#### 1. Project 2 publishable key 更新（手動）

[Dashboard](https://supabase.com/dashboard/project/qmtlsxuoewdajgnjxfkb/settings/api) で `sb_publishable_...` 形式のキーを確認し、`supabase_config.js` の `YOUR_PROJECT2_PUBLISHABLE_KEY` を差し替える。

#### 2. 提出箱モデルへの移行（worldhistory・china サイト）

Supabase 凍結問題への根本対処。凍結しても⑥（フロント表示）は動き続ける構成にする。

```
① 管理者が admin/index.html からデータ追加
        ↓
② Supabase wh_dates に INSERT
        ↓
③ [月1 cron] GitHub Actions → Wikipedia Pageviews API → wiki_score UPDATE
        ↓
④ build時に Supabase から全データ取得
        ↓
⑤ 静的 JSON 生成 → Netlify CDN 配信
        ↓
⑥ フロント（クイズ・年表）は JSON を読むだけ
```

作業内容：

- `history/worldhistory/build.js`（Supabase → `data/wh_dates.json`）
- GitHub Actions ビルドジョブ追加
- `history/worldhistory/index.html`（クイズ）を JSON 読み込みに変更
- `history/worldhistory/timeline.html` 同様
- `history/china/index.html` / `timeline.html` を `region=['china']` フィルタで統合
- `world_history_quiz` / `world_history_events` / `chinese_history` DROP

#### 3. wiki_score 月1 cron

- `.github/scripts/update_wiki_score.js`
    - Wikipedia Pageviews API（日本語版・英語版フォールバック）
    - 過去12ヶ月 PV → 対数変換 → パーセンタイルで1〜5正規化
- `.github/workflows/update_wiki_score.yml`（毎月1日）
- `service_role key` は GitHub Secrets で管理

### 優先度：中

#### 4. Supabase 凍結対策（暫定）

提出箱モデル移行完了までの間の暫定対処：

```yaml
# .github/workflows/keep_alive.yml
on:
  schedule:
    - cron: '0 0 * * 0'  # 毎週日曜
```

軽量な SELECT を投げるだけで十分。

#### 5. テーマトグル重複問題

現状：多くのページが `<script src="../../js/theme-toggle.js">` と同じ SVG マークアップを個別に持つ。`theme-toggle.js` をより汎用化するか、SSG 時に HTML インクルードで解決するか検討。管理HTMLではインライン化で対処済み。

### 優先度：低

#### 6. 全サイト提出箱モデル化の検討

`seikei_events` / `english_idioms` / `koten_questions` も同様のモデルに移行するか検討。

---

## 既知の落とし穴

|問題|対処|
|---|---|
|`common.css` が `header` タグに `overflow:hidden`|管理 HTML の `style.css` で上書き（common.css 非依存なので問題なし）|
|`theme-toggle.js` はパスずれでエラー|管理 HTML ではインライン化（完了）|
|Supabase `list_tables` の row 数が 0 と表示|凍結中プロジェクトはメタデータ不信頼。`execute_sql SELECT COUNT(*)` で確認|
|`year NOT NULL` → nullable 化済み|`person` レコードの生没年不明に対応。`ORDER BY year NULLS LAST` を忘れずに|
|marked.js v5+ の `code` レンダラー|`(code, lang)` → `({ text, lang })` に変更済み|

---

_2026-03-20 時点のスナップショット。作業進捗に応じて随時更新。_