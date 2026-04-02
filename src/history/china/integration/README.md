# chinese-history-note

中国史を体系的に学ぶためのインタラクティブな学習ツール。年表・まとめノート・文化史クイズの3機能を統合したWebアプリ。

**[→ Live Demo](https://chinese-history-note.netlify.app)**

---

## 概要

世界史（中国史）の学習を効率化するために個人で開発している学習支援ツール。以下の3つのデータソースを一つのプラットフォームに統合することを目標としている。

| データソース               | 内容                                       | 件数   |
| -------------------------- | ------------------------------------------ | ------ |
| Supabase `chinese_history` | 政治・外交・文化イベントの年表             | 226件  |
| `quizdata.js`              | 文化人物（詩人・哲学者・宗教家など）データ | 54件   |
| Markdown ノート            | 各王朝の解説・穴埋め学習素材               | 作成中 |

---

## 機能

### 実装済み

**文化史クイズ** (`quiz.html`)

中国史の文化人物を対象にした5種類のクイズモード。

| モード         | 形式                 | 問題数 |
| -------------- | -------------------- | ------ |
| 人物 → 王朝    | 4択                  | 10問   |
| 王朝 → 人物    | 複数選択（checkbox） | 5問    |
| 人物と作品     | マッチング           | 6組    |
| ◯ / ✗ 問題     | 正誤判定             | 10問   |
| 時代順並べ替え | ↑↓ボタン操作         | 6人    |

**中国史年表** (`timeline.html`)

Supabaseから226件のイベントをフェッチし、カテゴリ別タブ・キーワード検索でフィルタリング。カテゴリは王朝成立 / 王朝滅亡 / 戦争 / 外交 / 内政 / 経済 / 文化 / 反乱の8種類。

### 開発中

**王朝詳細ページ** (`dynasty.html`)

王朝ごとの詳細ページ。以下の4タブ構成を予定。

- **まとめ** — Markdownで記述した解説を表示
- **穴埋め** — `⟦⟦重要語句⟧⟧` 記法によるクリックトグル式学習
- **年表** — 当該王朝の年代範囲でSupabaseをフィルタ
- **人物** — quizdata.jsの文化人物をカテゴリ別カード表示

**トップページ** (`index.html`)

王朝一覧カードグリッド。各カードから `dynasty.html?slug=tang` 形式の詳細ページへ遷移。

---

## 技術スタック

```
Frontend:  HTML / CSS / Vanilla JavaScript（フレームワークなし）
Database:  Supabase (PostgreSQL)
Deploy:    Netlify
Markdown:  marked.js v9.1.6
Fonts:     Noto Sans JP, Zen Kaku Gothic New, JetBrains Mono
```

ビルドステップなし。ブラウザで直接動作する。

---

## ファイル構成（予定）

```
chinese-history-note/
├── index.html              # 王朝一覧ハブ
├── dynasty.html            # 王朝詳細（4タブ）
├── timeline.html           # 年表（Supabase）
├── quiz.html               # 文化史クイズ        ← 実装済み
├── css/
│   └── style.css
├── js/
│   ├── quizdata.js         # 文化人物データ（54件）
│   ├── dynasties.js        # 王朝マスターデータ
│   ├── dynasty-app.js      # 王朝詳細ページロジック
│   └── supabase-client.js  # Supabase初期化
└── notes/
    └── <slug>/
        ├── meta.js         # ノートのメタ情報・ユニット定義
        ├── 01.md
        └── 02.md ...
```

---

## データ設計

### 王朝マスターデータ（`js/dynasties.js`）

Supabaseスキーマを変更せず、年代範囲（`start` / `end`）でイベントを自動紐づけする設計。

```js
const DYNASTIES = [
  {
    slug: "tang",
    name: "隋・唐",
    nameAlts: ["隋", "唐"], // Supabase ilike 検索用
    start: 581,
    end: 907,
    capital: "大興城 → 長安",
    era: "中世",
    color: "#C8860A",
    quizMatch: ["唐"], // quizdata.js の完全一致照合用
  },
  // ...
];
```

### Markdownノートの記法

```markdown
## 政治制度

三省六部制：⟦⟦中書省⟧⟧（詔勅起草）・⟦⟦門下省⟧⟧（審議）・⟦⟦尚書省⟧⟧（執行）
科挙制の整備。均田制・租庸調制。
```

`⟦⟦…⟧⟧` で囲んだ語句は「まとめ」タブでは下線ハイライト、「穴埋め」タブではクリックで表示/非表示をトグルする。

---

## Supabase テーブル

**`chinese_history`**（226件）

| カラム        | 型   | 内容                                                                   |
| ------------- | ---- | ---------------------------------------------------------------------- |
| `id`          | int  | PK                                                                     |
| `title`       | text | イベント名                                                             |
| `description` | text | 説明                                                                   |
| `year`        | int  | 年（BC は負の数）                                                      |
| `date_type`   | text | `'year'` or `'full'`                                                   |
| `full_date`   | date | 完全な日付（任意）                                                     |
| `category`    | text | 王朝成立 / 戦争 / 外交 / 文化 / 内政 / 反乱 / 経済 / 王朝滅亡 / その他 |

年代範囲フィルタ例：

```js
supabase
  .from("chinese_history")
  .select("year, title, category")
  .gte("year", 581)
  .lte("year", 907)
  .order("year");
```

---

## 参照プロジェクト

設計・UIの参考にしたプロジェクト。

| リポジトリ                                               | 参照箇所                                      |
| -------------------------------------------------------- | --------------------------------------------- |
| [learning-box](https://github.com/Shoei451/learning-box) | Markdownフェッチ・タブUI・穴埋め記法・CSS設計 |
| [451-docs](https://451-docs.netlify.app)                 | サイドバー挙動・カードコンポーネント          |

---

## 今後の実装予定

- [ ] `dynasties.js` — 全9スラッグのマスターデータ作成
- [ ] `dynasty.html` — 4タブ詳細ページの実装
- [ ] `index.html` — 王朝カードグリッド
- [ ] `notes/tang/` — 唐のMarkdownノート（優先）
- [ ] 各王朝ノートの整備（秦・漢・宋・元・明・清・周・三国）
- [ ] `quiz.html` — quizdata.jsの外部ファイル化（現在インライン）

---

## デザイン方針

- ベース：[learning-box](https://github.com/Shoei451/learning-box) のCSS設計を継承
- アクセントカラー：`#b51f09`（中国史らしい深紅、WCAG AA準拠）
- フォント：Noto Sans JP（本文）/ Zen Kaku Gothic New（見出し）/ JetBrains Mono（ラベル・メタ情報）
- ビルドステップなし、外部依存はCDNのみ

---

_個人の学習用プロジェクト。_
