# アクセスログ機能

**最終更新:** 2026-03-22

---

## 概要

訪問者のページアクセスを自前でSupabaseに記録する仕組み。Google Analyticsなどの外部サービスを使わず、広告ブロッカーに対しても堅牢な設計を目指している。

---

## アーキテクチャ

```
ブラウザ（各HTMLページ）
  └─ navigator.sendBeacon('/api/sw?path=...&ref=...')
          ↓
  Netlify Edge Function（netlify/edge-functions/sw.js）
          ↓
  Supabase Project 1 → access_logs テーブル
```

### なぜsendBeaconか

- ページ離脱時でも確実に送信される（fetchと違いページ終了をブロックしない）
- GETリクエストなので実装がシンプル
- ブラウザが非同期でバックグラウンド送信するためUXへの影響がない

---

## 実装詳細

### エンドポイント

`/api/sw`

意図的に目的が読みにくい名前にしている。`/api/track` や `/api/analytics` はuBlock Origin等のブロックリストに載っているパターンなので避けた。

### Netlify Edge Function

**ファイル:** `netlify/edge-functions/sw.js`

```js
export default async (request, context) => {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const url = new URL(request.url);
  const path = url.searchParams.get("path") || "/";
  const referrer = url.searchParams.get("ref") || null;
  const userAgent = request.headers.get("user-agent") || null;
  const country = context.geo?.country?.code || null;

  // publishable keyを直書き（環境変数依存なし）
  const SUPABASE_URL = "https://gjuqsyaugrsshmjerhme.supabase.co";
  const SUPABASE_KEY = "sb_publishable_K-TVhPlOAGY7cLhanI9Tag_kKIDoIGU";

  await fetch(`${SUPABASE_URL}/rest/v1/access_logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({ path, referrer, user_agent: userAgent, country }),
  });

  return new Response("OK", { status: 200 });
};

export const config = { path: "/api/sw" };
```

**`netlify.toml`:**

```toml
[[edge_functions]]
  path = "/api/sw"
  function = "sw"
```

### フロントエンド側（各HTMLページ）

**`build.js`** を実行することで全HTMLの `</body>` 直前に自動挿入される。

```html
<script>
  navigator.sendBeacon(
    '/api/sw?path=' + encodeURIComponent(location.pathname) +
    '&ref=' + encodeURIComponent(document.referrer)
  );
</script>
```

`build.js` は既存の `/api/track`（旧パス）を検出した場合は `/api/sw` に置換し、未挿入のファイルには新規挿入する。

---

## Supabaseテーブル

**テーブル名:** `access_logs`（Project 1: `gjuqsyaugrsshmjerhme`）

| カラム | 型 | 内容 |
|---|---|---|
| `id` | bigint | 自動採番 |
| `path` | text | アクセスされたパス（例: `/history/china/`） |
| `referrer` | text | 参照元URL（直接アクセスの場合はnull） |
| `user_agent` | text | ブラウザのUser-Agent文字列 |
| `country` | text | 国コード（Netlify Geoから取得、例: `JP`） |
| `created_at` | timestamptz | 記録日時（自動） |

**RLSポリシー:**

| 操作 | 許可対象 |
|---|---|
| INSERT | anon（全員） |
| SELECT / UPDATE / DELETE | なし（フロントから読めない） |

---

## 設計上の注意点

**環境変数を使わない理由**
publishable keyはフロントエンドコードに公開されるキーであり、秘匿する必要がない。Netlifyの環境変数に設定しなかった場合に `undefined` になって無音でログが取れなくなるリスクを避けるため、直書きを選択している。service role keyは絶対に書かない。

**外部サービスを使わない理由**
Google AnalyticsはuBlock等でブロックされる率が高く、また広告エコシステムと連動したデータ収集になる。自前実装であれば収集項目を最小限（パス・リファラー・国・UA）に抑えられ、第三者への送信もない。

---

## トラブルシューティング

### ログが記録されない場合

1. `access_logs` テーブルのレコード数を確認: `SELECT COUNT(*) FROM access_logs;`
2. Netlify Functions のログを確認（Netlify Dashboard → Functions → sw）
3. ブラウザのDevTools → Networkタブで `/api/sw` へのリクエストが飛んでいるか確認
4. Edge Functionが正しくデプロイされているか確認（`netlify.toml` の `function = "sw"` とファイル名が一致しているか）

### 過去の障害

**2026-03-22:** ログが0件であることが判明。原因は `Deno.env.get("SUPABASE_ANON_KEY")` がNetlifyの環境変数に設定されておらず `undefined` になっていたため。publishable keyの直書きに変更し、同時にエンドポイント名を `/api/track` → `/api/sw` に変更して対応。