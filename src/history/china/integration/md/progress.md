# chinese-history-note 進捗・実装計画

> 更新日: 2026-03-07

---

## 1. 完成したもの

### ファイル構成（現在）

```
chinese-history-note/
├── index.html            ✅ 王朝カードグリッド（era別グループ表示・強力検索）
├── map.html              ✅ 王朝変遷図（円ノード・サイドパネル・▼タイムライン・検索バー）
├── timeline.html         ✅ 年表（events.js 静的データ・カテゴリフィルタ・検索）
├── dynasty.html          ✅ 王朝詳細（まとめ/年表/人物 3タブ）
├── culture-quiz.html     🔲 既存のまま（未統合）
│
├── css/
│   ├── index.css         ✅ index.html 専用スタイル（外部化済み）
│   ├── map.css           ✅ map.html 専用スタイル（外部化済み）
│   ├── timeline.css      ✅ timeline.html 専用スタイル
│   └── dynasty.css       ✅ dynasty.html 専用スタイル
│
├── js/
│   ├── common/
│   │   ├── dynasties.js  ✅ 王朝マスターデータ（全サイト共通・17エントリ）
│   │   ├── icons.js      ✅ 共通SVGアイコン定数（SVG.*）
│   │   ├── events.js     ✅ 静的イベントデータ（226件・Supabase依存ゼロ）
│   │   ├── quizdata.js   ✅ 文化人物クイズデータ
│   │   └── search.js     ✅ 共通フルテキスト検索エンジン（SearchEngine）
│   ├── card-render.js    ✅ index.html 用カードレンダラー（SearchEngine統合）
│   ├── timeline.js       ✅ timeline.html 用ロジック
│   └── dynasty.js        ✅ dynasty.html 用ロジック
│
├── logics/
│   └── map.js            ✅ map.html 用ロジック（検索アドオン済み）
│
└── notes/
    └── （各王朝の .md）  🔲 未作成
```

---

### 各ファイルの詳細

#### `js/common/dynasties.js` ✅

全サイト共通の王朝マスターデータ。17エントリ、全フィールド定義済み。

| era            | 王朝                                            |
| -------------- | ----------------------------------------------- |
| 古代           | 夏 / 殷 / 西周 / 東周（春秋・戦国）/ 秦 / 漢    |
| 分裂の時代     | 三国時代 / 西晋 / 東晋・五胡十六国 / 南北朝時代 |
| 隋・唐の時代   | 隋 / 唐                                         |
| 五代十国       | 五代十国                                        |
| 宋と異民族国家 | 宋と異民族国家                                  |
| 元・明・清     | 元 / 明 / 清                                    |

各エントリのフィールド:

- `slug` / `name` / `era` / `start` / `end` / `capital` / `color`
- `nameAlts` — search.js との照合用
- `quizMatch` — quizdata.js との照合用（夏・殷・西周・新は対象外）
- `territories` — 変遷図の円ノード分割表示用
- `systems` / `figures` / `culture` / `notes` — 変遷図サイドパネル・検索インデックス用
- `timeline{}` — ▼ボタンで展開する帯タイムライン定義（8エントリが保有）

▼タイムライン保有エントリ: 東周 / 漢 / 三国時代 / 東晋・五胡十六国 / 南北朝時代 / 五代十国 / 宋と異民族国家 / 清

#### `js/common/search.js` ✅

3つのデータソースを統合した共通フルテキスト検索エンジン。

- **公開 API**: `SearchEngine.buildIndex()` / `SearchEngine.search(query)` / `SearchEngine.highlight(str, q)`
- **インデックス構成**:
  - `dynasties.js` — name / nameAlts / capital / era / systems / figures / culture / notes
  - `events.js` — title / description（年代で王朝に紐づけ）
  - `quizdata.js` — name / works（quizMatch で王朝に紐づけ）
- 同期・即時構築（非同期fetch不要）

#### `map.html` ✅

- データソースを `js/common/` 配下に統一
- ヘッダーに検索バー（`.header-search`）を追加
  - 検索クエリに応じてノードを dimming（`opacity: 0.13`）
  - サイドパネルにヒット一覧（王朝名・期間・マッチスニペット）を表示
  - ヒット結果クリックで王朝選択 → 詳細パネルに遷移
  - ⌘K でフォーカス、Escape でクリア／選択解除
- 円クリック → サイドパネル（従来通り）
- ▼ボタンクリック → `position:fixed` オーバーレイで帯タイムラインを表示

#### `index.html` ✅

- `js/common/` 配下のデータ（dynasties / events / quizdata / search）を読み込み
- SearchEngine を使った強力な全文検索（events / quizdata のフィールドもヒット）
- ヒット理由スニペットをカード下部に表示（name/era 以外でマッチした場合のみ）
- ⌘K でフォーカス、Escape でクリア
- `notes/{slug}.md` の HEAD リクエストでノート有無バッジを動的更新

#### `timeline.html` ✅

- `events.js` 静的データを直接参照（Supabase 依存ゼロ）
- カテゴリフィルター（pill toggle 8種）
- キーワード検索（title / description）
- 王朝グループ折りたたみ

#### `dynasty.html` ✅

- `?slug=tang` 形式のルーティング
- 3タブ: まとめ / 年表 / 人物
- 年表タブ: `EVENTS.filter()` で静的データから絞り込み
- 人物タブ: `quizdata.js` の `quizMatch` フィルタ

#### `js/common/icons.js` ✅

共通SVGアイコン定数 `SVG.*`。`note` / `quiz` / `culture` / `back` / `clock` / `map` / `timeline` / `chevron` / `search` / `close` の10種。

---

## 2. 次にやること

### 優先度 高

#### A. `map.html` のera区切りラベル

現状は王朝が時系列順にフラットに並んでいる。「古代」「分裂の時代」などのセクションラベルをキャンバス内に挿入すると読みやすくなる。
実装方法: `logics/map.js` の `renderCanvas()` 内で ERA_ORDER をループし、era 変わり目に `grid-column: 1/-1` のラベル行を挿入。

---

### 優先度 中

#### B. Markdownノートの作成

学習優先度順（受験上の重要度）:

| 優先 | slug                      | 王朝               | ユニット数（目安） |
| ---- | ------------------------- | ------------------ | ------------------ |
| 1    | `qin`                     | 秦                 | 3〜4               |
| 2    | `han`                     | 漢                 | 5                  |
| 3    | `tang`                    | 唐                 | 5                  |
| 4    | `song_and_steppe_empires` | 宋と異民族国家     | 6                  |
| 5    | `yuan`                    | 元                 | 3                  |
| 6    | `ming`                    | 明                 | 4                  |
| 7    | `qing`                    | 清                 | 5                  |
| 8    | `eastern_zhou`            | 東周（春秋・戦国） | 5                  |
| 9    | `three_kingdoms`          | 三国〜南北朝       | 4                  |

記法は learning-box と同じ。`⟦⟦重要語句⟧⟧` で穴埋めトグル。`notes/{slug}.md` を作成する。

---

### 優先度 低（将来）

#### C. `culture-quiz.html` の統合

現在は `shoei451-website` の実装をそのまま使用。`quizdata.js` が `js/common/` に配置済みなので、ナビを共通ヘッダーに差し替えるだけで統合できる見込み。

#### D. ダークモード

CSS変数がすでに整理されているので、`prefers-color-scheme: dark` のメディアクエリで変数を上書きするだけで対応可能。コンテンツが一通り揃ったあとに着手。

#### E. `notes/` の充実

MDコンテンツは継続作業。全9スラッグ × 4〜6ユニットが目標。

---

## 3. データフロー（確定版）

```
js/common/dynasties.js ──→  index.html     （カードグリッド）
                       ──→  map.html       （変遷図・サイドパネル・▼タイムライン）
                       ──→  timeline.html  （王朝グループ分類）
                       ──→  dynasty.html   （ヘッダー・年表タブの範囲フィルタ）

js/common/events.js    ──→  timeline.html  （全年表）
                       ──→  dynasty.html   （年表タブ）
                       ──→  search.js      （検索インデックス）

js/common/quizdata.js  ──→  dynasty.html   （人物タブ）
                       ──→  culture-quiz.html（クイズ）
                       ──→  search.js      （検索インデックス）

js/common/search.js    ──→  index.html     （SearchEngine）
                       ──→  map.html       （SearchEngine）

notes/{slug}.md        ──→  dynasty.html   （まとめタブ）
```

Supabase 依存ゼロ（完了）。

---

## 4. 廃止ファイル

| ファイル                           | 理由                                                   |
| ---------------------------------- | ------------------------------------------------------ |
| `js/data.js`                       | `dynasties.js` に統合済み。削除可                      |
| `js/dynasties.js`（旧パス）        | `js/common/dynasties.js` に移行済み。削除可            |
| `js/events.js`（旧パス）           | `js/common/events.js` に移行済み。削除可               |
| `build.js`                         | ビルドステップ廃止。削除可                             |
| `csv_to_events_js.gs`              | `events.js` 生成済みにつき不要。削除可                 |
| `dynasties/detail.css`             | `dynasty.html` は `css/dynasty.css` に移行済み。削除可 |
| `dynasties/*.html`（旧詳細ページ） | `dynasty.html?slug=` に統一。削除可                    |
