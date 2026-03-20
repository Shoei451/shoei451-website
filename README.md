# shoei451-website

Personal learning tools site by Shoei451 — hosted at **[shoei451.netlify.app](https://shoei451.netlify.app)**.

---

## Overview

A collection of interactive study tools targeting university entrance exams, built with vanilla HTML/CSS/JS + Supabase + Netlify.

---

## Site Structure

```
shoei451-website/
├── history/          世界史・中国史クイズ・年表・管理画面
├── koten/            古典常識・助動詞クイズ
├── seikei/           政治経済年表・クイズ
├── geography/        地理クイズ
├── others/           英語イディオム・生物・地質など
├── home_economics/   家庭科（洗濯表示クイズ）
├── informatics/      情報I（進数変換・数独）
├── docs/             サイト内ドキュメントビューア
├── css/              共通スタイル（common.css・テーマファイル）
├── js/               共通スクリプト
│   └── supabase_config.js  Supabase接続設定（全ページ共通）
├── netlify/
│   └── edge-functions/track.js  アクセスログ収集
└── index.html        トップページ
```

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
| Project 1 `gjuqsyaugrsshmjerhme` | 学習コンテンツDB（世界史・中国史・古典・英語イディオム） |
| Project 2 `qmtlsxuoewdajgnjxfkb` | 生産性・東進トラッカー（別リポジトリから参照） |

接続設定は `js/supabase_config.js` に集約。各ページはこのファイルを読み込み、`db` / `TABLES` を使う。

---

## Key Design Principles

**提出箱モデル（Submission Box Model）**  
Supabase は書き込みの正本として使い、フロントへの配信は build 時に生成した静的 JSON を CDN から返す。Supabase が停止しても学習ページは動き続ける。

```
管理者 → Supabase（INSERT）→ GitHub Actions（build）→ 静的JSON → Netlify CDN → ユーザー
```

**CSS 設計**  
- `css/common.css` — サイト全体のベース（変数・カード・ヘッダーなど）
- `css/timeline.css` / `history/styles/theme-chinese.css` — テーマ別共通ファイル
- ページ固有スタイルは各ディレクトリ内に配置

---

## Local Development

ビルドステップなし。HTMLファイルをそのままブラウザで開けば動作する。

```bash
# リンク・JS構文チェック
npm install
npm run check
```

```bash
# docs/file-tree.js の再生成（.mdファイルを追加したとき）
node docs/build.js
```

---

## Documentation

| ドキュメント | 内容 |
|---|---|
| `project_status.md` | インフラ設計・完了済み事項・今後のロードマップ |
| `history/wh_table_renewal.md` | `wh_dates` テーブル設計仕様 |
| `docs/` | サイト内ドキュメントビューア（Markdownファイルを閲覧可能） |

---

## Contact

okamotoshoei451@gmail.com