# `wh_dates` テーブル設計ドキュメント

**作成日:** 2026-03-18  
**プロジェクト:** Supabase Project 1 (`gjuqsyaugrsshmjerhme`)  
**対象サイト:** `shoei451.netlify.app`（`Shoei451/shoei451-website`）

---

## 1. 設計の背景と目的

### 旧テーブルの問題

| テーブル | 件数 | 問題 |
|---|---|---|
| `world_history_quiz` | 1,356件 | `chapter`/`period`で独自分類、他サイトで再利用不可 |
| `world_history_events` | 4,413件 | `category`に地域と時代が混在、「その他」が全体の60%（2,637件）、`keep`カラムが未使用のまま放置 |

### 新設計のゴール

- **1テーブルで全サイトに対応**：`region`フィルタで中国史・イスラーム史・ヨーロッパ史などを使い分ける
- **フラッシュカード・クイズUIに最適な構造**：`event`（短い名詞形）と`description`（補足説明）の二段構え
- **提出箱モデルとの親和性**：Supabaseは書き込みの正本、フロントはbuild生成JSONを読むだけ

---

## 2. アーキテクチャ（提出箱モデル）

```
① 管理者がモバイル等からイベントを追加
        ↓
② Supabaseに保存（wh_dates への INSERT）
        ↓
③ [月1 cron] GitHub Actions → Wikipedia Pageviews API → wiki_score を UPDATE
        ↓
④ build時にSupabaseから全データ取得
        ↓
⑤ 静的JSON生成 → Netlify CDN配信
        ↓
⑥ フロント（フラッシュカード・クイズ・年表）はJSONを読むだけ
```

**Supabaseが停止しても⑥は動き続ける**（提出箱モデルの本質）。

---

## 3. テーブルスキーマ

### `wh_regions`（地域マスタ）

```sql
CREATE TABLE wh_regions (
  key   text PRIMARY KEY,
  label text NOT NULL,
  sort  integer DEFAULT 0
);
```

| key | label | sort |
|---|---|---|
| `west_europe` | 西ヨーロッパ | 10 |
| `east_europe` | 東欧・ロシア | 20 |
| `islam` | イスラーム | 30 |
| `china` | 中国 | 40 |
| `mongol` | モンゴル・中央アジア | 50 |
| `india` | インド・南アジア | 60 |
| `southeast_asia` | 東南アジア | 70 |
| `korea_japan` | 朝鮮・日本 | 80 |
| `orient` | 古代オリエント | 90 |
| `africa` | アフリカ | 100 |
| `americas` | 南北アメリカ | 110 |
| `prehistory` | 先史・人類 | 120 |
| `other` | その他 | 130 |

`sort`で表示順を制御。ラベル変更はここだけ修正すれば全サイトに反映。

---

### `wh_dates`（本体）

```sql
CREATE TABLE wh_dates (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  year        integer      NOT NULL,
  date_type   text         NOT NULL DEFAULT 'year'
                CHECK (date_type = ANY (ARRAY['year', 'full', 'circa'])),
  full_date   date,
  event       text         NOT NULL,
  description text,
  region      text[]       DEFAULT '{}',
  field       text         CHECK (field = ANY (
                ARRAY['政治', '経済', '文化・宗教', '社会', '外交・戦争'])),
  memo        text,
  wiki_score  smallint     CHECK (wiki_score BETWEEN 1 AND 5),
  created_at  timestamptz  DEFAULT now(),
  updated_at  timestamptz  DEFAULT now()
);
```

#### カラム詳細

| カラム | 型 | 説明 |
|---|---|---|
| `year` | integer | **負数でBC統一**。前3000年 → `-3000`、1789年 → `1789`。`ORDER BY year`だけで時系列ソート完結 |
| `date_type` | text | `year`（年のみ）/ `full`（月日あり）/ `circa`（「頃」） |
| `full_date` | date | `date_type='full'`のときのみ使用。`2026-03-18`形式 |
| `event` | text | **名詞形で短く**。例：「フランス革命」「カノッサの屈辱」 |
| `description` | text | 補足説明。例：「三部会召集を契機に勃発。絶対王政の終焉」 |
| `region` | text[] | **配列型**。複数地域対応。`wh_regions.key`を参照 |
| `field` | text | 政治 / 経済 / 文化・宗教 / 社会 / 外交・戦争 |
| `memo` | text | **Markdown形式**。関連リンク・補足資料など自由記述 |
| `wiki_score` | smallint | 1〜5。月1 cronでWikipedia Pageviews APIから自動更新 |
| `updated_at` | timestamptz | triggerで自動更新（手動設定不要） |

#### `event` vs `description` の使い分け

フラッシュカードのUI設計に直結する。

```
┌─────────────────────────────┐
│          1789                │  ← year
└─────────────────────────────┘
              ↓ めくる
┌─────────────────────────────┐
│       フランス革命            │  ← event（名詞形・短く）
│                             │
│ 三部会召集を契機に勃発。       │  ← description（補足）
│ 絶対王政の終焉。人権宣言採択。 │
└─────────────────────────────┘
```

#### `region` 配列の活用例

モンゴル帝国のような複数地域にまたがる事件：

```json
{
  "year": 1206,
  "event": "モンゴル帝国成立",
  "region": ["mongol", "china", "east_europe"]
}
```

フロントでのフィルタ（Supabase JS）：

```js
// 中国に関係するイベントを取得
const { data } = await db
  .from('wh_dates')
  .select('*')
  .contains('region', ['china'])
  .order('year');
```

---

## 4. インデックス・制約

```sql
-- region配列フィルタ用（GIN）
CREATE INDEX wh_dates_region_gin ON wh_dates USING GIN (region);

-- wiki_score CHECK
-- CHECK (wiki_score BETWEEN 1 AND 5) → スキーマに内包済み

-- updated_at 自動更新 trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wh_dates_updated_at
BEFORE UPDATE ON wh_dates
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 5. RLS（Row Level Security）

```sql
ALTER TABLE wh_dates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE wh_regions ENABLE ROW LEVEL SECURITY;

-- 読み取りはanon（フロント）に許可
CREATE POLICY "anon read wh_dates"   ON wh_dates   FOR SELECT USING (true);
CREATE POLICY "anon read wh_regions" ON wh_regions FOR SELECT USING (true);

-- 書き込みは管理者のみ（Supabase Dashboardから直接操作）
```

`service_role key`はフロントに書かない。

---

## 6. wiki_score 更新フロー（月1 cron）

```
GitHub Actions（月1）
  ↓
① wh_dates から全レコード取得
  ↓
② event 名でWikipedia Pageviews API を叩く
   GET https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/
       ja.wikipedia/all-access/all-agents/{TITLE}/monthly/{START}/{END}
  ↓
③ 過去12ヶ月のPV合計を対数変換
  ↓
④ 全レコードのパーセンタイルで1〜5に正規化
  ↓
⑤ wh_dates.wiki_score を UPDATE
```

日本語Wikipediaタイトルが取れない場合は英語版にフォールバック。未取得は `NULL`（スコアなし）のまま。

---

## 7. 既存テーブルとの関係

| テーブル | 今後の扱い |
|---|---|
| `world_history_quiz` | **廃止予定**。データはゼロから `wh_dates` に入力し直す |
| `world_history_events` | **廃止予定**。同上 |
| `chinese_history` | **廃止予定**。`region=['china']`で統合 |

既存データの移行はしない（データ品質が低いため）。

---

## 8. データ入力ルール

- `event` は**名詞形**で記述（「〜が起きた」はNG）
- `year` は**負数でBC**（`is_bc`フラグは使わない）
- `circa`（頃）の場合は `date_type='circa'`、`year`はおおよその値を入れる
- `region` は最低1つ入れる（空配列のままにしない）
- `description` は空でもよいが、東大頻出事項は必ず入れる
- `memo` はMarkdown形式。リンクは `[y-history](https://...)` 形式で

---

*このドキュメントは設計確定時点（2026-03-18）のスナップショット。*  
*スキーマ変更時は必ず更新すること。*