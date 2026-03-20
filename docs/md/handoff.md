# Handoff: アクセスログ/鍵管理の現状（2026-03-20時点）

## 結論（現状の実態）

- アクセスログ基盤（`sendBeacon -> /api/track -> Supabase access_logs`）は実装済み。
- `build.js` は**sendBeacon挿入のみ**対応。旧handoffにあった「anon key置換機能」は未実装。
- `netlify.toml` は**Edge Functionのルーティングのみ**。`node build.js` のビルド設定は未記載。
- anon keyの管理は現在、`js/supabase_config.js` に集約されているが、値自体はリポジトリ内に存在。

---

## 現在の構成

```text
shoei451-website/
├── netlify/
│   └── edge-functions/
│       └── track.js        # /api/track で Supabase access_logs にPOST
├── netlify.toml            # edge_functions の path/function 定義のみ
├── build.js                # HTMLへsendBeaconを挿入（key置換なし）
└── js/
    └── supabase_config.js  # Supabase URL/anon keyの共通設定
```

---

## 実装済み（確認済み）

### 1) Edge Function

- `netlify/edge-functions/track.js` あり
- `GET /api/track` を受けて `access_logs` へ書き込み
- `SUPABASE_ANON_KEY` は `Deno.env.get(...)` で参照

### 2) Netlify設定

`netlify.toml` の現物:

```toml
[[edge_functions]]
  path = "/api/track"
  function = "track"
```

### 3) sendBeacon挿入状況（実測）

- 対象HTML: `55`
- `'/api/track?path='` を含むHTML: `52`
- 未挿入: `3`

未挿入ファイル:

- `history/worldhistory/admin/wh-admin-v2.html`
- `learning-links/index.html`（空ファイル）
- `templates/back-links.html`（テンプレート断片）

### 4) Supabase設定の共通化

- `js/supabase_config.js` を読み込む形へ移行済みページ: `10` ページ
- 旧「10ファイルに個別直書き」状態からは改善済み

主な読み込み先:

- `history/china/index.html`
- `history/china/timeline.html`
- `history/worldhistory/index.html`
- `history/worldhistory/timeline.html`
- `history/worldhistory/admin/index.html`
- `koten/joushiki/index.html`
- `others/idiom_quiz/index.html`
- `seikei/timeline/index.html`
- `seikei/timeline/print.html`
- `seikei/timeline/quiz.html`

---

## 旧handoffからの差分（修正点）

1. `build.js` の役割
- 旧: sendBeacon挿入 + anon key置換
- 現: **sendBeacon挿入のみ**

2. `netlify.toml`
- 旧: `[build] command = "node build.js"` 記載あり
- 現: **`[[edge_functions]]` のみ**

3. 「全HTMLへのsendBeacon挿入は未実施」
- 現: **52/55で挿入済み**

4. 「anon key直書き10ファイル」
- 現: 直接直書きの多重分散はほぼ解消し、`js/supabase_config.js` に集約

---

## セキュリティメモ（現時点）

- anon keyは公開前提キーだが、現状リポジトリ内に値がある。
- `service_role` は未露出（この方針は維持必須）。
- `history/worldhistory/admin/integration-chapter4.html` には `dummy_key_for_local_development` が残っている（実キーではない）。

---

## 次アクション（優先順）

1. `build.js` を「key置換対応まで拡張するか」方針決定  
   （現状は `supabase_config.js` 集約方式で運用中）
2. 自動化するなら `netlify.toml` にビルドコマンドを復帰
3. `wh-admin-v2.html` にもアクセスログを入れるか判断
4. 本番環境で `access_logs` への到達を実測確認

---

## 関連

- Netlify: `shoei451.netlify.app`
- Repo: `Shoei451/shoei451-website`
- Supabase Project 1: `gjuqsyaugrsshmjerhme`
