# chinese-history-note 統合計画

> 作成日：2026-03-06  
> 対象リポジトリ：`chinese-history-note`  
> 参照リポジトリ：`learning-box`（アーキテクチャ・CSS流用）  
> データソース：Supabase `chinese_history`（226行）、`quizdata.js`（54件）、MDファイル（新規）

---

## 0. 現状整理

### データソース 3種

| ソース                     | 場所                       | 件数      | 内容                                                                                                |
| -------------------------- | -------------------------- | --------- | --------------------------------------------------------------------------------------------------- |
| `chinese_history` テーブル | Supabase（ap-south-1）     | 226行     | 年表イベント。`year`, `title`, `category`（王朝成立/戦争/外交/文化/内政/反乱/経済/王朝滅亡/その他） |
| `quizdata.js`              | shoei451-websiteリポジトリ | 54件      | 文化史人物。`name`, `dynasty`, `works[]`, `category`（詩人/書家/哲学者/etc）, `era`                 |
| MDファイル                 | 新規作成（本計画で導入）   | 0→9〜10件 | 各王朝のまとめノート                                                                                |

### learning-boxから継承するもの

learning-boxのコードを全部読んだ結果、以下を**そのまま流用できる**ことが確定した。

- `css/note-style.css`：CSS変数体系・ヘッダー・サイドナビ・タブ・`.markdown-body`・`.cloze-word`・トースト等、全コンポーネント
- `note.html`のHTML骨格：ヘッダー・サイドナビ・2タブ（まとめ/穴埋め）構造
- `note-app.js`の関数群：`buildNav()`, `loadSummary()`, `renderQuiz()`, `switchTab()`, `navigateTo()`, cloze処理（`⟦⟦…⟧⟧`記法）
- `notes/<slug>/meta.js`パターン：`NOTE_META` + `UNITS_DATA`

**変更・拡張が必要なもの**

- `note-app.js`のスラッグローダー：現在は`notes/{slug}/meta.js`を読む設計 → chinese-history-noteでは王朝ごとにディレクトリを切る形に合わせる
- タブの拡張：`まとめ / 穴埋め` の2タブ → `まとめ / 穴埋め / 年表 / 人物` の4タブ（後述）
- `UNITS_DATA`の概念を「王朝」に置き換える

---

## 1. リポジトリ構造（確定版）

```
chinese-history-note/
│
├── index.html                  ← 王朝一覧ハブ（learning-boxのindex.htmlを参考）
├── dynasty.html                ← 王朝詳細（note.htmlを直接拡張）
├── timeline.html               ← 年表（Supabaseのみ）
├── quiz.html                   ← 文化史クイズ（quizdata.jsのみ）
│
├── css/
│   └── style.css               ← note-style.cssをベースにタブ拡張を追記
│
├── js/
│   ├── quizdata.js             ← shoei451-websiteからコピー（変更なし）
│   ├── dynasties.js            ← 王朝マスターデータ（新規・後述）
│   ├── dynasty-app.js          ← note-app.jsを拡張（後述）
│   └── supabase-client.js      ← Supabase初期化
│
└── notes/
    └── <slug>/
        ├── meta.js             ← learning-boxと同じ形式（NOTE_META + UNITS_DATA）
        └── 01.md, 02.md …      ← 王朝ノートのMarkdown（⟦⟦⟧⟧記法も使える）
```

`notes/<slug>/`をlearning-boxと同じ構造にする理由は、将来的にlearning-boxの`note-app.js`をほぼ変更なしで動かせる互換性を保つため。

---

## 2. `dynasties.js`：王朝マスターデータ

**設計の核心。** Supabaseのスキーマを変更せずに、年表・クイズの両データを王朝に紐づける。

```js
// js/dynasties.js

const DYNASTIES = [
  {
    slug: "shang",
    name: "殷",
    nameAlts: ["商"], // Supabase titleカラムへのilike照合用
    start: -1600,
    end: -1046,
    capital: "殷（安陽）",
    era: "古代", // index.htmlのグループ化用
    color: "#8B6914",
    quizMatch: ["殷"], // quizdata.jsのdynastyフィールドと完全一致照合
  },
  {
    slug: "zhou",
    name: "周",
    nameAlts: ["西周", "東周", "春秋", "戦国"],
    start: -1046,
    end: -221,
    capital: "鎬京 → 洛邑",
    era: "古代",
    color: "#5C4A8A",
    quizMatch: ["西周", "東周", "春秋", "戦国"],
    // 春秋・戦国は諸子百家が集中する時代なのでまとめて1スラッグ
  },
  {
    slug: "qin",
    name: "秦",
    nameAlts: [],
    start: -221,
    end: -206,
    capital: "咸陽",
    era: "古代",
    color: "#2F4F4F",
    quizMatch: ["秦"],
  },
  {
    slug: "han",
    name: "漢",
    nameAlts: ["前漢", "新", "後漢"],
    start: -202,
    end: 220,
    capital: "長安 / 洛陽",
    era: "古代",
    color: "#8B2500",
    quizMatch: ["前漢", "新", "後漢"],
  },
  {
    slug: "sangoku",
    name: "三国〜南北朝",
    nameAlts: [
      "三国",
      "西晋",
      "東晋",
      "前秦",
      "北魏",
      "（南北朝）宋",
      "（南北朝）梁",
    ],
    start: 220,
    end: 589,
    capital: "（諸都）",
    era: "中世",
    color: "#4A6741",
    quizMatch: [
      "三国",
      "西晋",
      "東晋",
      "前秦",
      "北魏",
      "（南北朝）宋",
      "（南北朝）梁",
    ],
  },
  {
    slug: "tang",
    name: "隋・唐",
    nameAlts: ["隋", "唐"],
    start: 581,
    end: 907,
    capital: "大興城 → 長安",
    era: "中世",
    color: "#C8860A",
    quizMatch: ["唐"],
  },
  {
    slug: "song",
    name: "五代〜元",
    nameAlts: ["北宋", "南宋", "金", "元"],
    start: 907,
    end: 1368,
    capital: "開封 → 臨安",
    era: "中世",
    color: "#2C6E8A",
    quizMatch: ["宋", "北宋", "南宋", "金", "元"],
  },
  {
    slug: "ming",
    name: "明",
    nameAlts: [],
    start: 1368,
    end: 1644,
    capital: "南京 → 北京",
    era: "近世",
    color: "#8B1A1A",
    quizMatch: ["明"],
  },
  {
    slug: "qing",
    name: "清",
    nameAlts: [],
    start: 1644,
    end: 1912,
    capital: "北京",
    era: "近世",
    color: "#1A4A5C",
    quizMatch: ["清"],
  },
];

// slug → dynasty オブジェクトの逆引き
const DYNASTY_MAP = Object.fromEntries(DYNASTIES.map((d) => [d.slug, d]));
```

### なぜこの設計か

`nameAlts`と`quizMatch`を分けている理由：Supabaseの年表検索は`title`カラムへの部分一致（`ilike`）なので王朝名のバリエーション文字列が必要。quizdata.jsのフィルタは`dynasty`フィールドへの完全一致なので別管理が正確。

Supabaseに`dynasty`カラムを追加しない理由：226行の手動タグ付けが不要になり、年代範囲による絞り込みで実用上十分。春秋・戦国の境界（-403年）のような細かい区切りは`sangoku`/`zhou`の`nameAlts`で吸収できる。

---

## 3. `dynasty.html`：4タブ拡張

learning-boxの`note.html`を直接拡張する。HTMLとCSSの差分は最小限に抑える。

### タブ構成

```
[まとめ]  [穴埋め]  [年表]  [人物]
```

- **まとめ**：`notes/{slug}/meta.js` → `UNITS_DATA` → MDをfetch・marked.jsでレンダリング（learning-box完全流用）
- **穴埋め**：`⟦⟦…⟧⟧`記法のclozeトグル（learning-box完全流用）
- **年表**：Supabase `chinese_history` を `year BETWEEN start AND end` で絞り込み → カテゴリアイコン付きリスト
- **人物**：`quizData.filter(q => dynasty.quizMatch.includes(q.dynasty))` → categoryでグループ化したカード

### ヘッダー変更点

```html
<!-- note.htmlのヘッダー右側（変更前）-->
<button class="tab-btn active" id="tabSummary" onclick="switchTab('summary')">
  まとめ
</button>
<button class="tab-btn" id="tabQuiz" onclick="switchTab('quiz')">穴埋め</button>

<!-- dynasty.html（変更後）-->
<button class="tab-btn active" id="tabSummary" onclick="switchTab('summary')">
  まとめ
</button>
<button class="tab-btn" id="tabQuiz" onclick="switchTab('quiz')">穴埋め</button>
<button class="tab-btn" id="tabTimeline" onclick="switchTab('timeline')">
  年表
</button>
<button class="tab-btn" id="tabFigures" onclick="switchTab('figures')">
  人物
</button>
```

### `dynasty-app.js`のコア：3データ並列fetch

```js
// note-app.jsのloadSlug()を拡張

async function loadDynastyData(dynasty) {
  // 1・2は非同期（並列）、3は同期
  const [events] = await Promise.all([
    supabase
      .from("chinese_history")
      .select("year, title, category, date_type")
      .gte("year", dynasty.start)
      .lte("year", dynasty.end)
      .order("year")
      .then(({ data }) => data ?? []),
  ]);

  // quizdata.jsはグローバル変数として読み込み済み → 同期で即フィルタ
  const figures = quizData.filter((q) => dynasty.quizMatch.includes(q.dynasty));

  return { events, figures };
  // MDはnote-app.jsのloadSummary()がUNITS_DATA経由でfetchするので別管理
}
```

`Promise.all`にSupabaseだけ入れてquizは同期にする理由：quizdata.jsはHTMLの`<script src>`で読み込んだ時点でメモリに全展開されているので非同期fetchコストがゼロ。無駄なawaitを増やさない。

### 年表タブのレンダリング

カテゴリ別のアイコンマップを定義し、イベントリストとして表示：

```js
const CATEGORY_ICON = {
  王朝成立: "👑",
  王朝滅亡: "💥",
  戦争: "⚔️",
  外交: "🤝",
  文化: "📚",
  内政: "🏛️",
  経済: "💰",
  反乱: "🔥",
  その他: "•",
};

function renderTimeline(events) {
  const wrap = document.getElementById("panelTimeline");
  if (!events.length) {
    wrap.innerHTML = '<p class="quiz-empty">年表データがありません。</p>';
    return;
  }
  wrap.innerHTML = events
    .map((ev) => {
      const yearStr = ev.year < 0 ? `前${Math.abs(ev.year)}年` : `${ev.year}年`;
      const icon = CATEGORY_ICON[ev.category] ?? "•";
      return `
      <div class="tl-item">
        <span class="tl-year">${yearStr}</span>
        <span class="tl-icon">${icon}</span>
        <span class="tl-title">${escHtml(ev.title)}</span>
        <span class="tl-cat">${escHtml(ev.category)}</span>
      </div>`;
    })
    .join("");
}
```

### 人物タブのレンダリング

categoryでグループ化し、各人物はクリックで作品リストを展開するカード形式：

```js
function renderFigures(figures) {
  if (!figures.length) {
    document.getElementById("panelFigures").innerHTML =
      '<p class="quiz-empty">この王朝の文化人物データがありません。</p>';
    return;
  }
  // categoryでグループ化
  const groups = {};
  figures.forEach((f) => {
    (groups[f.category] ??= []).push(f);
  });
  const html = Object.entries(groups)
    .map(
      ([cat, people]) => `
    <div class="fig-group">
      <p class="fig-group-label">${escHtml(cat)}</p>
      <div class="fig-cards">
        ${people
          .map(
            (p) => `
          <div class="fig-card" onclick="this.classList.toggle('open')">
            <p class="fig-name">${escHtml(p.name)}</p>
            <p class="fig-dynasty">${escHtml(p.dynasty)}</p>
            <ul class="fig-works">
              ${p.works.map((w) => `<li>${escHtml(w)}</li>`).join("")}
            </ul>
          </div>`,
          )
          .join("")}
      </div>
    </div>`,
    )
    .join("");
  document.getElementById("panelFigures").innerHTML = html;
}
```

---

## 4. MDファイル規約

learning-boxと完全に同じ記法を使う。フロントマター不使用（スラッグ→王朝情報は`DYNASTY_MAP`から取得するため）。

### `notes/tang/meta.js`

```js
const NOTE_META = {
  title: "隋・唐",
  subject: "中国史",
};

const UNITS_DATA = [
  {
    id: "u01",
    num: "01",
    title: "成立と太宗の治世",
    file: "notes/tang/01.md",
    color: "#C8860A",
  },
  {
    id: "u02",
    num: "02",
    title: "律令制と三省六部制",
    file: "notes/tang/02.md",
    color: "#B07A0E",
  },
  {
    id: "u03",
    num: "03",
    title: "対外関係と版図",
    file: "notes/tang/03.md",
    color: "#9A6C12",
  },
  {
    id: "u04",
    num: "04",
    title: "文化（詩・宗教・芸術）",
    file: "notes/tang/04.md",
    color: "#845E16",
  },
  {
    id: "u05",
    num: "05",
    title: "安史の乱と衰退",
    file: "notes/tang/05.md",
    color: "#6E501A",
  },
];
```

### `notes/tang/01.md`（記述例）

```markdown
## 隋の統一と崩壊

北周を継いだ楊堅（文帝）が ⟦⟦589年⟧⟧ に南朝の陳を滅ぼし...
大運河建設・高句麗遠征の失敗が民心を離れ、⟦⟦618年⟧⟧ に隋滅亡。

## 唐の建国

⟦⟦李淵（高祖）⟧⟧ が長安を都に唐を建てる。
二代 ⟦⟦太宗（李世民）⟧⟧ の「⟦⟦貞観の治⟧⟧」で安定。

## 政治制度

三省六部制：⟦⟦中書省⟧⟧（詔勅起草）・⟦⟦門下省⟧⟧（審議）・⟦⟦尚書省⟧⟧（執行）
科挙制の整備。均田制・租庸調制。
```

`⟦⟦…⟧⟧`で囲んだ語句はまとめタブでは下線ハイライト、穴埋めタブではクリックトグルになる（learning-box完全流用）。

---

## 5. `index.html`：王朝一覧ハブ

learning-boxの`index.html`（ツールカードグリッド）のパターンを踏襲し、`DYNASTIES`配列からカードを生成：

```js
function renderDynastyCard(d) {
  const hasNotes = /* notes/{slug}/meta.jsの存在チェック */;
  return `
    <a class="dynasty-card" href="dynasty.html?slug=${d.slug}"
       style="--unit-color:${d.color}; --unit-color-light:${hexToLight(d.color)}">
      <span class="dynasty-card__era">${d.era}</span>
      <p class="dynasty-card__name">${d.name}</p>
      <p class="dynasty-card__period">${d.start < 0 ? '前'+Math.abs(d.start) : d.start}–${d.end}</p>
      ${hasNotes ? '' : '<span class="dynasty-card__wip">準備中</span>'}
    </a>`;
}
```

---

## 6. 実装フェーズ

### Phase 1 — 土台（数時間・今すぐ可能）

1. `dynasties.js` を書く（全9スラッグのマスターデータ）
2. `quizdata.js` をchinese-history-noteにコピー
3. `supabase-client.js` を作成
4. `css/style.css` = learning-boxの`note-style.css` + 年表・人物タブ用スタイルを追記

この段階でquizdata.jsのデータと`DYNASTIES`マスターが揃う。

### Phase 2 — `dynasty.html`の骨格（半日）

1. `note.html`を`dynasty.html`にコピー、4タブに拡張
2. `dynasty-app.js` を作成（`note-app.js` + Supabase fetch + renderTimeline/renderFigures）
3. `notes/tang/` を作り、`meta.js` と `01.md`〜`05.md` を書く
4. `dynasty.html?slug=tang` で3タブ（まとめ/年表/人物）が動くことを確認

### Phase 3 — `index.html`・`timeline.html`・`quiz.html`（半日）

1. `index.html` に王朝カードグリッドを実装
2. `timeline.html` に全年表（Supabase 226件）をフィルタリング付きで表示
3. `quiz.html` に既存の文化史クイズUIを移植
4. 各ページから`dynasty.html`へのリンクを繋ぐ

### Phase 4 — MDコンテンツ整備（継続作業）

受験的に重要な順：**秦 → 漢 → 唐 → 宋（北宋・南宋） → 元 → 明 → 清 → 周（春秋・戦国）→ 三国〜南北朝**

各スラッグ4〜6ユニット想定。穴埋めは`⟦⟦…⟧⟧`で随時追加。

---

## 7. 技術スタック・依存関係

| 依存         | バージョン   | 用途                                                |
| ------------ | ------------ | --------------------------------------------------- |
| marked.js    | 9.1.6（CDN） | MDレンダリング（learning-boxと統一）                |
| Supabase JS  | 2.x（CDN）   | chinese_history テーブルアクセス                    |
| Google Fonts | —            | Noto Sans JP / Zen Kaku Gothic New / JetBrains Mono |

フレームワーク不使用。learning-boxと同じバニラHTML/CSS/JSスタック。

---

## 8. 未決事項

| 項目                                               | 現状                                   | 判断が必要なタイミング    |
| -------------------------------------------------- | -------------------------------------- | ------------------------- |
| `quiz.html`の既存UIはどの程度動いているか          | 不明（shoei451-websiteの実装を確認要） | Phase 3着手前             |
| 三国〜南北朝のslugを1つにまとめるか細分化するか    | 暫定で`sangoku`に統合                  | MDを書くときに再検討      |
| `timeline.html`と`dynasty.html`の年表タブの関係    | 別実装                                 | Phase 3で統一関数化を検討 |
| BC年の表示形式（`前221年` vs `-221` vs `221 BCE`） | `前XXX年`で統一予定                    | Phase 2でコード確定       |
