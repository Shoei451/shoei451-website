# shoei451-website

Personal learning tools site by Shoei451 — hosted at **[shoei451.netlify.app](https://shoei451.netlify.app)**.

---

## Overview

A collection of interactive study tools targeting university entrance exams, built with vanilla HTML/CSS/JS + Supabase + Netlify. No build frameworks — every page is a plain HTML file that opens directly in a browser.

---

## Site Structure

> FIlETREE.mdを参照

---

## Tech Stack

| レイヤー | 使用技術 |
|---|---|
| フロントエンド | HTML / CSS / Vanilla JS |
| バックエンド | Supabase（PostgreSQL + Auth + RLS） |
| ホスティング | Netlify（CDN + Edge Functions） |
| バージョン管理 | GitHub（`main` push → 自動デプロイ） |

---

## Supabase Projects

| プロジェクト | 用途 |
|---|---|
| Project 1 `gjuqsyaugrsshmjerhme` | 学習コンテンツ DB（世界史・中国史・古文常識・英語イディオム・アクセスログ） |
| Project 2 `qmtlsxuoewdajgnjxfkb` | 生産性・東進トラッカー（別リポジトリから参照） |

接続設定は `js/supabase_config.js` に一元化。各ページはこのファイルを読み込み、`db` / `db2` / `TABLES` を使う。**ページ内で `createClient` を直接呼ばない。**

```html
<!-- 読み込みパターン（パスは深さに応じて調整） -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../../js/supabase_config.js"></script>
<script src="logic.js"></script>
```

**注意:** Supabase 無料プランではアクセスがない期間が続くと自動凍結（Pause）される。凍結中はメタデータが不正確になるため、レコード数は `SELECT COUNT(*)` で確認すること。

---

## Key Design Principles

### 提出箱モデル（Submission Box Model）

Supabase を「常時参照する DB」ではなく「書き込みの正本」として扱い、フロントへの配信は build 時に生成した静的 JSON を CDN から返す。**Supabase が凍結・停止しても学習ページは動き続ける。**

```
管理者が admin/ からデータ追加
        ↓
Supabase に INSERT（書き込みの正本）
        ↓
GitHub Actions が build（Supabase → 静的 JSON 生成）
        ↓
Netlify CDN で配信
        ↓
フロント（クイズ・年表）は JSON を読むだけ
```

> **現状（2026-03 時点）:** `wh_dates` テーブルへの移行作業中。世界史・中国史のフロントページはまだ直接 Supabase を参照している。build スクリプト整備が次の優先タスク。

### CSS 設計

| ファイル | 役割 |
|---|---|
| `css/common.css` | サイト全体のベース（変数・カード・ヘッダー・フッター） |
| `css/theme-toggle.css` | テーマトグルボタン。`common.css` から `@import`。独自 CSS のページは個別に `<link>` |
| `css/timeline.css` | 世界史・政経タイムライン系ページの共通スタイル |
| `history/styles/theme-chinese.css` | 中国史ページのテーマ |
| ページ固有 CSS | 各ディレクトリ内に配置 |

`common.css` は `header` タグに `overflow: hidden` と `position: relative` を適用する。**admin/ 系ページは `common.css` を読み込まず独自 `style.css` を持つ**（ボタン配置が崩れるのを防ぐため）。

---

## サブインデックス（sub-index）の仕組み

各カテゴリのインデックスページは、**ルートの `sub-index.html` を共通テンプレートとして使用し、`slug` パラメータで内容を動的生成する**。

### アクセス方法

```
/sub-index.html?slug=history
/sub-index.html?slug=koten
/sub-index.html?slug=seikei
/sub-index.html?slug=others
/sub-index.html?slug=informatics
/sub-index.html?slug=geography
```

### 動作フロー

1. `sub-index.html` が `js/sub-index-init.js` を読み込む
2. `sub-index-init.js` が URL の `?slug=xxx` を読み取り、`{slug}/list.js` を動的ロード
3. `list.js` の `window.PAGE_CONFIG`（タイトル・セクション定義）と各 `sectionItems` 配列からカードと DOM を組み立てる
4. リンクパス・アイコンパスをルート基準に自動補正する

### list.js の書き方

```js
// {slug}/list.js

const sectionItems1 = [
  {
    icon: "📚",            // 絵文字 or 画像パス（フォルダ内相対で書く）
    iconType: "image",     // 画像ファイルの場合のみ指定
    title: "ツール名",
    titleEN: "Tool Name",
    description: "説明文",
    link: "worldhistory/", // フォルダ内相対パスで書く（補正は init.js が行う）
    target: "_blank"       // 新タブで開く場合
  },
];

window.PAGE_CONFIG = {
  title:      "ページ <title>",
  h1:         "表示する <h1>",
  headerDesc: "ヘッダー内の説明文",
  sections: [
    { title: "セクション名", desc: "説明" }
  ]
};
```

---

## テーマトグルの仕組み

`js/theme-toggle.js` が2つの役割を担う。

1. **テーマ即時適用（フラッシュ防止）:** ページ描画前に `localStorage` を読み取り、`<body>` に `.dark` クラスを付与する。
2. **ボタン注入:** `id="theme-toggle-container"` の要素が存在する場合、SVG ボタンを自動挿入する。

新規ページでは SVG を手書きせず、以下の1行だけ書けばよい。

```html
<span class="logo-switches" id="theme-toggle-container"></span>
```

**例外:** `history/world/admin/` 配下のページはインライン実装を維持する（`common.css` 非依存のため）。

---

## アクセスログ

Google Analytics などの外部サービスを使わず、自前で Supabase にアクセスログを記録する。広告ブロッカーに対しても堅牢な設計を目指している。

### アーキテクチャ

```
各 HTML ページ（navigator.sendBeacon）
        ↓  GET /api/sw?path=...&ref=...
Netlify Edge Function（netlify/edge-functions/sw.js）
        ↓  POST
Supabase Project 1 → access_logs テーブル
```

`/api/sw` という名称は意図的に目的を読みにくくしてある。`/api/track` や `/api/analytics` はブロッカーのリストに載りやすいパターンのため回避している。

### 各ページへの挿入

ルートの `build.js` を実行すると、全 HTML の `</body>` 直前に以下が自動挿入される。

```js
navigator.sendBeacon(
  '/api/sw?path=' + encodeURIComponent(location.pathname) +
  '&ref=' + encodeURIComponent(document.referrer)
);
```

### access_logs テーブルスキーマ

| カラム | 型 | 内容 |
|---|---|---|
| `path` | text | アクセスされたパス |
| `referrer` | text | 参照元 URL（直接アクセスは null） |
| `user_agent` | text | ブラウザの User-Agent 文字列 |
| `country` | text | 国コード（Netlify Geo から取得） |
| `created_at` | timestamptz | 記録日時（自動） |

RLS: INSERT は anon 全員に許可、SELECT / UPDATE / DELETE は許可なし。

---

## wh_dates テーブル設計（世界史データ統合）

旧テーブル（`world_history_quiz` / `world_history_events` / `chinese_history`）を廃止し、1テーブルで全サイトに対応する新設計に移行中。

### テーブル概要

```sql
CREATE TABLE wh_dates (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  year        integer,          -- 負数でBC統一（前221年 → -221）、不明なら NULL
  year_end    integer,          -- 期間終了年・没年（nullable）
  date_type   text DEFAULT 'year' CHECK (date_type IN ('year', 'full', 'circa')),
  full_date   date,
  event       text NOT NULL,    -- 名詞形・短く
  description text,             -- フラッシュカード裏面
  region      text[] DEFAULT '{}',  -- 配列型、GIN インデックス済み
  field       text CHECK (field IN ('政治','経済','文化・宗教','社会','外交・戦争')),
  record_type text DEFAULT 'event' CHECK (record_type IN ('event','period','person')),
  wiki_url    text,
  memo        text,             -- Markdown 形式
  wiki_score  smallint CHECK (wiki_score BETWEEN 1 AND 5),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()  -- trigger で自動更新
);
```

### wh_regions テーブル（地域マスタ、13件）

`west_europe`, `east_europe`, `islam`, `china`, `mongol`, `india`, `southeast_asia`, `korea_japan`, `orient`, `africa`, `americas`, `prehistory`, `other`

### RLS

| 操作 | 許可対象 |
|---|---|
| SELECT | `public`（anon 含む全員） |
| INSERT / UPDATE / DELETE | `authenticated`（ログイン済みのみ） |

### 管理画面（history/world/admin/）

- `index.html`: ログイン + ページ選択ナビ（Supabase Auth）
- `main.html`: データ一覧・追加・編集・削除（ウィザード形式、Wikipedia API 連携）
- `memo.html`: Markdown メモ編集（ボトムシート UI）

---

## Docs ビューア

`docs/index.html` はリポジトリ内の `.md` ファイルを2カラムレイアウトで閲覧できる Markdown ビューア。

`.md` ファイルを追加・削除したときは以下を実行して `docs/file-tree.js` を再生成する。

```bash
node docs/build.js
```

---

## Obsidian ↔ Website 同期

`docs/sync.js` + `docs/sync-config.js` で Obsidian のノートフォルダと `docs/md/` を同期できる。

```bash
node docs/sync.js --dry-run   # 差分確認
node docs/sync.js --yes       # 実行
```

設定テンプレートは `docs/sync-config-example.js`。ローカルの絶対パスが含まれるため `docs/sync-config.js` は `.gitignore` に追加済み。

---

## Local Development

ビルドステップなし。HTML ファイルをそのままブラウザで開けば動作する。

```bash
# 依存インストール
npm install

# JS 構文チェック + ローカルリンク切れチェック
npm run check

# docs/file-tree.js の再生成（.md ファイルを追加・削除したとき）
node docs/build.js

# 全 HTML に sendBeacon スニペットを挿入（新規ページ追加後）
node build.js
```

---

## 既知の落とし穴

| 問題 | 対処 |
|---|---|
| `common.css` が `header` タグに `overflow: hidden` を適用 | admin/ 系ページは `common.css` を読まない独自 `style.css` を持つ |
| `theme-toggle.js` はパスずれでエラーになる場合がある | admin/ 系ページではテーマトグルをインライン実装 |
| Supabase `list_tables` の row 数が 0 と表示される | 凍結中はメタデータ不信頼。`SELECT COUNT(*)` で確認 |
| `wh_dates.year` が NOT NULL だと人物の生没年不明に対応できない | nullable 化済み。`ORDER BY year NULLS LAST` を忘れずに |
| marked.js v5+ の `code` レンダラー | `(code, lang)` → `({ text, lang })` のオブジェクト形式に変更済み |

---

## ロードマップ（2026-03 時点）

### 優先度：高

1. **提出箱モデル移行**（worldhistory・china）— `history/worldhistory/build.js` 作成、GitHub Actions ジョブ追加、クイズ・年表ページを JSON 読み込みに変更、旧3テーブル DROP
2. **Project 2 publishable key 更新**（手動）— `supabase_config.js` の `YOUR_PROJECT2_PUBLISHABLE_KEY` を差し替える

### 優先度：中

3. **wiki_score 月次 cron**— Wikipedia Pageviews API → パーセンタイル正規化 → UPDATE（`service_role key` は GitHub Secrets で管理）
4. **Supabase 凍結対策（暫定）**— 毎週 SELECT を投げる keep_alive ワークフロー

---

## Contact

okamotoshoei451@gmail.com
