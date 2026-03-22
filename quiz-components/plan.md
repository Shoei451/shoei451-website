# クイズUI 統合計画

**作成日:** 2026-03-23  
**対象リポジトリ:** `shoei451-website`  
**関連ファイル:** `quiz-designs-renewal.md`（要件定義元）

---

## 1. 背景と目的

### 問題

対象の4クイズファイルは、CSS変数名・要素ID・状態管理の構造がそれぞれ独自実装になっており、以下のコストが発生している。

- 同じUIパターン（進捗バー・範囲選択チップなど）が4箇所に重複
- 新規クイズ作成時にゼロから書き直しが必要
- デザインの一貫性が保ちにくい

### 目的

- 共通部品を `quiz-components/` に切り出し、1機能1ファイルで管理する
- 各クイズページは「固有のデータ・ロジック」だけを書けばよい状態にする
- 将来の新規クイズ作成コストを大幅に下げる

---

## 2. 対象ファイル

| ファイル | クイズタイプ | 範囲選択 | 解答方式 |
|---|---|---|---|
| `history/world/index.html` | 世界史年代 | 単一選択（時代 or 章） | 4択 |
| `history/china/index.html` | 中国王朝史年代 | 複数選択（カテゴリ） | テキスト入力 |
| `seikei/timeline/quiz.html` | 政治・経済年代 | 複数選択（カテゴリ） | テキスト入力 |
| `others/idiom_quiz/index.html` | 英語イディオム | 単一選択（モード） | 4択 |

> 地理クイズ2種（`geography/` 内）など `common.css` ヘッダーを流用している小規模クイズは対象外。

---

## 3. フォルダ構成

```
quiz-components/
├── quiz-shell.css          # 全クイズ共通の変数・基盤レイアウト
│
├── start/
│   ├── start-screen.js     # config駆動のスタート画面描画エンジン
│   └── start-screen.css    # スタート画面固有スタイル
│
├── progress/               # [未実装]
│   ├── progress-bar.js     # 進捗バー + 次へ/リセットボタン
│   └── progress-bar.css
│
├── question/               # [未実装]
│   ├── question-area.js    # 問題文・補足テキストの表示
│   └── question-area.css
│
├── answer/                 # [未実装]
│   ├── choice-buttons.js   # 4択ボタン（コールバック注入式）
│   ├── text-input.js       # 年号・記述入力フォーム
│   └── answer.css
│
├── result/                 # [未実装]
│   ├── result-screen.js    # 結果画面（スコア + 復習リスト）
│   └── result-screen.css
│
└── feedback/               # [未実装]
    ├── feedback.js         # 正解発表UI（ページ固有部分はコールバックで対応）
    └── feedback.css
```

---

## 4. 各ページの読み込みパターン

各クイズページの `<head>` は以下の順で統一する。

```html
<!-- 1. 共通基盤 -->
<link rel="stylesheet" href="../../quiz-components/quiz-shell.css">

<!-- 2. 使うコンポーネントのCSS -->
<link rel="stylesheet" href="../../quiz-components/start/start-screen.css">
<link rel="stylesheet" href="../../quiz-components/progress/progress-bar.css">
<!-- ... 必要なものだけ -->

<!-- 3. テーマ上書き（ページ固有の色がある場合のみ） -->
<style>
  :root { --qz-accent: #b51f09; }  /* 例: 中国史テーマのカラー */
</style>

<!-- 4. テーマトグル（既存の共通ファイルを使用） -->
<link rel="stylesheet" href="../../css/theme-toggle.css">
```

```html
<!-- </body> 直前 -->
<script src="../../quiz-components/start/start-screen.js"></script>
<!-- ... 使うコンポーネントのJS -->
<script src="page-logic.js"></script>  <!-- ページ固有ロジック -->
<script src="../../js/theme-toggle.js"></script>
```

テーマトグルのHTML:

```html
<span class="logo-switches" id="theme-toggle-container"></span>
```

`theme-toggle.js` が `#theme-toggle-container` にボタンを自動注入する。

---

## 5. CSS変数の設計

`quiz-shell.css` は `--qz-` プレフィックスで変数を定義する。既存の `common.css`（`--primary`、`--accent`）や `timeline.css`（`--accent-gold`）との衝突を避けるため。

### デフォルト値

| 変数 | 値 | 用途 |
|---|---|---|
| `--qz-accent` | `#FABA40` | ボタン・フォーカスリングなど |
| `--qz-accent-dark` | `#313A49` | ヘッダー・コントラストテキスト |
| `--qz-accent-light` | `rgba(250,186,64,0.12)` | 選択状態の背景 |
| `--qz-accent-ring` | `rgba(250,186,64,0.25)` | フォーカスリング |
| `--qz-correct` | `#16a34a` | 正解色 |
| `--qz-incorrect` | `#dc2626` | 不正解色 |

### テーマ上書きの例

中国史クイズ（赤テーマ）:

```css
:root {
  --qz-accent:       #d73c37;
  --qz-accent-dark:  #7c1a10;
  --qz-accent-light: rgba(215, 60, 55, 0.10);
  --qz-accent-ring:  rgba(215, 60, 55, 0.22);
}
```

---

## 6. `start-screen.js` の config API

### 型定義

```js
/**
 * @typedef {Object} QuizConfig
 * @property {string}   title
 * @property {string}   [subtitle]
 * @property {string}   [image]           - ヒーロー画像URL
 * @property {string}   [tutorialMd]      - チュートリアルMarkdownのURL
 * @property {"multi"|"single"|"none"} rangeMode
 * @property {Array<{id:string, label:string}>} [ranges]
 * @property {string}   [rangeLabel]      - デフォルト: "出題範囲"
 * @property {"slider"|"select"} countMode
 * @property {number}   [countMin]        - slider時のみ
 * @property {number}   [countMax]        - slider時のみ
 * @property {number}   [countDefault]
 * @property {Array<number|"all">} [countOptions]  - select時のみ
 * @property {string}   [startLabel]      - デフォルト: "クイズを開始"
 * @property {Function} onStart           - (selectedRanges: string[], count: number|"all") => void
 */
```

### 各ファイルへの適用

| ファイル | rangeMode | countMode | テーマ上書き |
|---|---|---|---|
| `world/index.html` | `single` | `select` | なし（デフォルトのまま） |
| `china/index.html` | `multi` | `slider` | あり（赤テーマ） |
| `seikei/quiz.html` | `multi` | `slider` | なし |
| `idiom/index.html` | `single` | `select` | なし |

### 呼び出し方

```html
<div id="start-screen" class="qz-screen hidden"></div>

<script>
const QUIZ_CONFIG = {
  title: "世界史年代クイズ",
  rangeMode: "single",
  ranges: [
    { id: "~0",     label: "紀元前" },
    { id: "1~1000", label: "1〜1000年" },
    // ...
  ],
  countMode: "select",
  countOptions: [10, 20, 30, "all"],
  onStart(selectedRanges, count) {
    // ここからページ固有のクイズ開始処理
    startQuiz(selectedRanges[0], count);
  }
};

initStartScreen(QUIZ_CONFIG);
</script>
```

---

## 7. 共通化する部品 / しない部品

### 共通化する

| 部品 | ファイル | 優先度 |
|---|---|---|
| スタート画面 | `start/start-screen.{js,css}` | ✅ 完了 |
| 基盤CSS変数・レイアウト | `quiz-shell.css` | ✅ 完了 |
| 進捗バー | `progress/progress-bar.{js,css}` | 高 |
| 次へボタン / リセットボタン | `progress/progress-bar.js` に含める | 高 |
| 結果画面の骨格 | `result/result-screen.{js,css}` | 中 |
| 4択ボタン | `answer/choice-buttons.js` | 中 |
| テキスト入力フォーム（年号系） | `answer/text-input.js` | 中 |

### ページ固有のまま残す

| 部品 | 理由 |
|---|---|
| Supabaseデータ取得 | テーブル・フィールド名がページごとに異なる |
| 問題生成ロジック | shuffle方法・選択肢の作り方がクイズ固有 |
| 正解発表UIの細部 | world の「不正解時に全選択肢へ年号追加表示」、idiom の詳細フィードバックカードなど |
| チュートリアルのMarkdown本文 | 内容はクイズ固有 |

---

## 8. 実装ロードマップ

### Phase 1 — スタート画面（完了）

- [x] `quiz-shell.css` 作成
- [x] `start/start-screen.css` 作成
- [x] `start/start-screen.js` 作成（config駆動）
- [x] `demo.html` で4クイズのconfig動作確認

### Phase 2 — クイズ進行系（次）

- [ ] `progress/progress-bar.css` 作成
- [ ] `progress/progress-bar.js` 作成
  - `initProgressBar(total)` — 進捗バーの初期化
  - `updateProgress(current)` — 進捗更新
  - `onNext(callback)` / `onReset(callback)` — ボタンのコールバック注入

### Phase 3 — 解答・フィードバック

- [ ] `answer/answer.css` 作成
- [ ] `answer/choice-buttons.js` 作成
  - `renderChoices(options, onAnswer)` — 4択ボタン生成
  - 正誤後の disabled 制御を内包
- [ ] `answer/text-input.js` 作成
  - `renderTextInput(onSubmit)` — 年号入力フォーム生成
  - Enter キー送信対応

### Phase 4 — 結果画面

- [ ] `result/result-screen.css` 作成
- [ ] `result/result-screen.js` 作成
  - `showResult({ correct, total, mistakes, onRetry, onReview })` — 結果画面の描画
  - `mistakes` は `[{ question, userAnswer, correctAnswer }]` の配列

### Phase 5 — 既存ページへの組み込み

各ページで以下の作業を行う。

1. `<link>` / `<script>` の読み込みを新方式に変更
2. インラインのCSS変数・スタイルを削除
3. スタート画面を `QUIZ_CONFIG` + `initStartScreen()` に置き換え
4. 進捗バー・解答UIを共通コンポーネントに置き換え
5. ページ固有部分（データ取得・問題生成・正解発表細部）はそのまま残す

組み込み順序（推奨）:

1. `seikei/timeline/quiz.html`（最もシンプル、スモークテストに最適）
2. `history/china/index.html`
3. `history/world/index.html`
4. `others/idiom_quiz/index.html`

---

## 9. チュートリアルサイドバーの仕様

`QUIZ_CONFIG.tutorialMd` にMarkdownファイルのURLを指定すると、`start-screen.js` が以下を自動生成する。

- 画面左上に固定された `?` ボタン（`position: fixed`）
- クリックで左側からスライドインするサイドバー
- オーバーレイクリック・Escキーで閉じる
- `marked.js` が読み込まれていればMarkdownをHTMLにパース、なければ `<pre>` フォールバック

```
quiz-components/
└── start/
    └── tutorial.md   ← 各クイズの使い方説明（クイズ固有ファイル）
```

実際のファイルはクイズのフォルダ内に置き、URLで指定する。

---

## 10. 既存ファイルとの互換性メモ

- `common.css` の `header` タグは `overflow: hidden` を持つため、**クイズページは `common.css` を読み込まない**。`quiz-shell.css` だけで完結する。
- `theme-toggle.css` は `--theme`・`--accent`・`--primary`・`--shadow` 変数を使う。`quiz-shell.css` の `--qz-*` とは独立しており衝突しない。
- `wh-era-quiz.css`（既存）と `quiz-shell.css` は**共存できる**が、最終的には `quiz-shell.css` に移行して `wh-era-quiz.css` は廃止する予定。

---

*このドキュメントは実装の進捗に合わせて更新すること。*