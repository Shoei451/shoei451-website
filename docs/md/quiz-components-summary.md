# quiz-components 設計・実装まとめ

**作成日:** 2026-03-23  
**対象リポジトリ:** `Shoei451/shoei451-website`

---

## 背景と目的

### 問題

- `history/world/index.html`、`history/china/index.html`、`seikei/timeline/quiz.html`、`others/idiom_quiz/index.html` の4ファイル間で CSS 変数・element id が不統一
- 新規クイズファイルを作るときに使える共通資源がなく、毎回ゼロから書く必要があった

### 方針

- **1機能1js/css** で完全に部品化する
- **config 駆動**：各クイズは設定オブジェクトを渡すだけでUIが生成される
- **固有処理はコールバック注入**：共通化できない部分（`onAnswer`、`extraRenderer` など）はページ側から関数を渡す
- `quiz-components/` フォルダをリポジトリルート直下に配置

---

## フォルダ構成

```
quiz-components/
├── quiz-shell.css              # 全クイズ共通の CSS 変数・基盤レイアウト
├── start/
│   ├── start-screen.js         # スタート画面（config 駆動の描画エンジン）
│   └── start-screen.css
├── progress/
│   ├── progress.js             # 進捗バー + 次へ/リセットボタン
│   └── progress.css
├── question/
│   ├── question-area.js        # 問題文・カテゴリチップ・補足テキスト・画像
│   └── question-area.css
├── answer/
│   ├── choice-buttons.js       # 4択ボタン（コールバック注入式）
│   ├── text-input.js           # 年号・記述入力フォーム
│   └── answer.css
├── feedback/
│   ├── feedback.js             # 正解・不正解バナー（追加表示スロット付き）
│   └── feedback.css
├── result/
│   ├── result.js               # 結果画面（スコア・統計・復習リスト）
│   └── result.css
└── demo.html                   # 4クイズ分の config を動かす動作確認用
```

---

## 各コンポーネントの仕様

### `quiz-shell.css`

全クイズ共通の CSS 変数・リセット・基盤スタイルを定義する。  
変数名には `--qz-` プレフィックスを付け、`common.css`（`--primary`、`--accent`）や `timeline.css`（`--accent-gold`）との衝突を防いでいる。

テーマ色の上書き例：
```css
/* 中国史クイズなど赤系にしたい場合 */
:root {
  --qz-accent:      #d73c37;
  --qz-accent-dark: #7c1a1a;
}
```

---

### `start-screen.js` — `initStartScreen(config, mountId?)`

config オブジェクトを渡すとスタート画面を描画する。

#### config の型

```js
{
  title:       string,           // クイズタイトル
  subtitle:    string?,          // サブタイトル
  image:       string?,          // ヒーロー画像 URL
  tutorialMd:  string?,          // チュートリアル Markdown の URL（省略可）

  rangeMode:   "multi" | "single" | "none",
  rangeLabel:  string?,          // デフォルト: "出題範囲"
  ranges:      { id, label }[],  // 選択肢リスト

  countMode:   "slider" | "select",
  countMin:    number?,          // slider 用
  countMax:    number?,
  countDefault: number,
  countOptions: (number|"all")[], // select 用

  startLabel:  string?,          // デフォルト: "クイズを開始"
  onStart:     (selectedRanges: string[], count: number|"all") => void,
}
```

#### 各クイズへの適用

| クイズ | rangeMode | countMode |
|---|---|---|
| world（世界史年代） | `single`（時代区分） | `select` |
| china（中国史年代） | `multi`（カテゴリ） | `slider` |
| seikei（政治経済） | `multi`（カテゴリ） | `slider` |
| idiom（英語イディオム） | `single`（モード選択） | `select` |

チュートリアルサイドバーは `tutorialMd` に Markdown ファイルの URL を渡すと有効化される。`marked.js` が読み込まれていれば Markdown をパースして表示し、なければ `<pre>` でフォールバックする。

---

### `progress.js` — `initProgress(config)` / `updateProgress(index)` / `enableNextButton()` / `disableNextButton()`

進捗バーとナビボタンを描画・更新する。

```js
initProgress({
  total:        number,
  lastLabel:    string?,   // 最終問題での「次へ」ラベル（デフォルト: "結果を見る"）
  resetConfirm: string?,   // null で確認ダイアログなし
  onNext:       (currentIndex: number) => void,
  onReset:      () => void,
});
```

`renderQuestion()` の先頭で `updateProgress(i)` を呼ぶ。回答確定後に `enableNextButton()` を呼ぶことで「次へ」が押せるようになる。

#### 修正済みバグ（実装中に発見）

**リスナーの累積**：`initProgress()` を複数回呼ぶ（通常クイズ→復習モードなど）ときに `addEventListener` が累積し、`onNext` が二重に呼ばれる問題があった。`innerHTML` の再生成で DOM ノードごと置き換えることで解決。

**テキストの蓄積**：`_updateNextLabel()` が `insertAdjacentText("afterbegin", ...)` でテキストノードを追記し続ける問題があった。ボタン内に `<span class="qz-next-label">` を設け、`textContent` を直接書き換える方式に変更して解決。

---

### `question-area.js` — `showQuestion(data, mountId?)`

```js
showQuestion({
  text:     string,   // 問題文
  sub:      string?,  // 補足テキスト（日本語訳など）
  category: string?,  // カテゴリチップ
  imageUrl: string?,  // 問題画像
});
```

---

### `choice-buttons.js` — `showChoices(config)`

4択ボタンを描画し、回答後の正誤色付けを行う。

```js
showChoices({
  options:  string[],   // 選択肢テキストの配列
  correct:  string,     // 正解テキスト
  onAnswer: ({ selected, correct, isCorrect, buttons }) => void,
});
```

ページ固有の追加表示（world の「不正解時に全選択肢へ年号を補足表示」など）は `onAnswer` コールバックの中で `buttons` 配列を操作して実装する。

---

### `text-input.js` — `showTextInput(config)` / `lockTextInput(mountId?)`

年号・記述入力フォームを描画する。

```js
showTextInput({
  label:       string?,
  placeholder: string?,
  hint:        string?,     // 入力欄下の補足テキスト
  validate:    (raw: string) => { ok: boolean, value: any, isCorrect?: boolean, message?: string },
  onAnswer:    ({ rawValue, value, isCorrect }) => void,
});
```

`validate` 関数でバリデーションと正誤判定を同時に行う。Enter キー送信に対応。回答確定後は `lockTextInput()` で入力欄を無効化する（`enableNextButton()` は内部で自動呼び出し）。

---

### `feedback.js` — `showFeedback(data)` / `hideFeedback(mountId?)`

正解・不正解バナーを表示する。

```js
showFeedback({
  isCorrect:     boolean,
  correctLabel:  string?,         // 正解の表示テキスト（不正解時のみ）
  userLabel:     string?,         // ユーザーの回答テキスト（不正解時のみ）
  extraRenderer: (el: HTMLElement) => void,  // 追加コンテンツのDOM操作
  extraHtml:     string?,         // 追加コンテンツのHTML（信頼済みのみ）
});
```

`extraRenderer` は world の「正解の出来事名を補足表示」や idiom の「フィードバックカード」など、クイズ固有の追加表示に使う。

---

### `result.js` — `showResult(config)`

結果画面を描画する。

```js
showResult({
  correct:            number,
  total:              number,
  mistakes:           Array<{ questionText, category, userAnswer, correctAnswer }>,
  renderMistake:      (item) => string?,   // 復習アイテムのカスタムレンダラー
  onRetry:            () => void,
  onRetryMistakes:    (mistakes) => void,  // 間違えた問題だけ再出題
});
```

`renderMistake` を省略するとデフォルトのレンダラーが使われる。idiom のようにレイアウトが特殊なクイズでは独自のHTMLを返す関数を渡す。

---

## world/index.html への適用（Phase 1 完了）

### 変更内容

| 旧 | 新 |
|---|---|
| `wh-era-quiz.css` | `quiz-components` の各 CSS に置き換え |
| `wh-era-quiz_logic.js` | `history/world/quiz.js` に分離・移植 |
| スタート3画面（start / section / settings） | `initStartScreen()` 1画面に統合 |
| 問題追加画面 | 廃止（RLS 設計変更により不要） |
| `location.reload()` のリセット | `onRetry` / `onReset` コールバックで制御 |
| 結果なし（リロードのみ） | `showResult()` で結果画面を追加 |

### `history/world/quiz.js` の設計

world 固有として `quiz.js` に残した処理：

- `loadQuestions()`：Supabase から `world_history_quiz` を取得（1000件バッチ）
- `buildDistractors_byEvent()`：yearToEvent 用の選択肢生成（同 period からシャッフル）
- `buildDistractors_byYear()`：eventToYear 用の選択肢生成（年号重複を排除）
- `appendYearAnnotations()`：eventToYear 不正解時に全選択肢へ年号を補足表示
- `toDisplayYear(q)`：旧テーブル（`is_bc` フラグ + 正数 year）→ 負数統一への変換

`wh_dates` への切り替え時は `loadQuestions()` と `buildDistractors_*()` の中身だけ変えれば済む。HTML・他コンポーネントは触らない。

---

## 各クイズへの組み込み状況

| ファイル | 状況 |
|---|---|
| `history/world/index.html` | ✅ 移行完了（`quiz.js` + `index.html` 作成済み） |
| `history/china/index.html` | 🔲 未着手 |
| `seikei/timeline/quiz.html` | 🔲 未着手 |
| `others/idiom_quiz/index.html` | 🔲 未着手 |

---

## HTML テンプレート（新規クイズ作成時）

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>クイズ名 — Shoei451</title>

  <link rel="stylesheet" href="../../css/theme-toggle.css">
  <link rel="stylesheet" href="../../quiz-components/quiz-shell.css">
  <link rel="stylesheet" href="../../quiz-components/start/start-screen.css">
  <link rel="stylesheet" href="../../quiz-components/progress/progress.css">
  <link rel="stylesheet" href="../../quiz-components/question/question-area.css">
  <link rel="stylesheet" href="../../quiz-components/answer/answer.css">
  <link rel="stylesheet" href="../../quiz-components/feedback/feedback.css">
  <link rel="stylesheet" href="../../quiz-components/result/result.css">

  <!-- テーマ色の上書きが必要な場合 -->
  <style>
    :root { --qz-accent: #d73c37; --qz-accent-dark: #7c1a1a; }
  </style>
</head>
<body>
  <span class="logo-switches" id="theme-toggle-container"></span>

  <main class="qz-container">
    <div id="start-screen"  class="qz-screen"></div>
    <div id="quiz-screen"   class="qz-screen hidden">
      <div id="qz-progress-bar"></div>
      <div id="qz-question-area"></div>
      <div id="qz-choices"></div>      <!-- 4択の場合 -->
      <div id="qz-text-input"></div>   <!-- 入力式の場合 -->
      <div id="qz-feedback" class="hidden"></div>
      <div id="qz-nav-buttons"></div>
    </div>
    <div id="result-screen" class="qz-screen hidden"></div>
  </main>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="../../js/supabase_config.js"></script>
  <script src="../../quiz-components/start/start-screen.js"></script>
  <script src="../../quiz-components/progress/progress.js"></script>
  <script src="../../quiz-components/question/question-area.js"></script>
  <script src="../../quiz-components/answer/choice-buttons.js"></script>
  <script src="../../quiz-components/answer/text-input.js"></script>
  <script src="../../quiz-components/feedback/feedback.js"></script>
  <script src="../../quiz-components/result/result.js"></script>
  <script src="quiz.js"></script>   <!-- ページ固有ロジック -->
  <script src="../../js/theme-toggle.js"></script>
  <script>
    navigator.sendBeacon(
      '/api/sw?path=' + encodeURIComponent(location.pathname) +
      '&ref='         + encodeURIComponent(document.referrer)
    );
  </script>
</body>
</html>
```

---

## 今後の作業

1. **`china/index.html` の移行**（4択ではなく年号入力式、`text-input.js` メイン）
2. **`seikei/timeline/quiz.html` の移行**（china とほぼ同構造）
3. **`idiom_quiz/index.html` の移行**（4択 + `renderMistake` のカスタマイズが必要）
4. **`wh_dates` への移行**（`world/quiz.js` の `loadQuestions()` を差し替えるだけ）