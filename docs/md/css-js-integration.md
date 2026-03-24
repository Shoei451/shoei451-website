## Audit of the 4 quiz pages

| | wh-era-quiz | seikei/quiz | china/index | idiom-quiz |
|---|---|---|---|---|
| **入力方式** | 4択ボタン | テキスト入力（年号） | テキスト入力（年号） | 4択ボタン |
| **画面構成** | start→section→settings→quiz→(result inline) | setup→quiz→result | setup→quiz→result | start→quiz→result |
| **カテゴリ選択UI** | タブ方式 | チップボタン（複数選択） | チップボタン（複数選択） | チェックボックス |
| **プログレスバー** | ✅ | ✅ | ❌ | ✅ |
| **スコア表示** | ✅ | ✅ | ✅ | ✅ |
| **不正解リスト** | ❌ | ✅ | ✅ | ❌（解説あり） |
| **CSS元ファイル** | `wh-era-quiz.css` | インライン | `chinese-quiz.css` | `quiz-style.css` |

---

## 設計方針

### `css/quiz.css` — 視覚コンポーネント

`common.css` の変数体系を前提として、以下の**コンポーネント単位**で定義する。

```
.quiz-wrapper          最大幅コンテナ
.quiz-screen           fadeInUp アニメーション + .hidden
.quiz-progress         プログレスバー外枠＋塗り
.question-card         出題カード（背景・角丸・影）
.choice-btn            4択ボタン基本形
.choice-btn.correct    正解ハイライト（緑）
.choice-btn.incorrect  不正解ハイライト（赤）
.quiz-result           結果画面カード
.mistake-item          不正解リスト各行
.score-display         大きいスコア数字
```

イディオムクイズ固有の金色カードは `others/idiom_quiz/idiom-quiz.css`（小さい上書きファイル）で `--card-bg` を再定義するだけにする。

### `js/quiz.js` — レンダリング・状態管理ユーティリティ

クイズ固有のロジック（問題生成、Supabase取得、モード切り替え）は各ページのロジックファイルに残す。`quiz.js` は**すべてのクイズが毎回同じように書いていた DOM 操作**を引き受ける。

```js
// 提案するAPI

// 画面切り替え
QuizUI.showScreen(id)
QuizUI.hideScreen(id)

// プログレスバー更新（0-indexed でも対応）
QuizUI.updateProgress(current, total, barEl, textEl)

// 4択ボタン生成・ハイライト
QuizUI.renderChoices(container, choices, onSelect)
QuizUI.highlightAnswer(buttons, correctAnswer, selectedAnswer)

// スコア更新
QuizUI.updateScore(correct, total, el)

// 結果画面生成
QuizUI.renderResult(container, { score, total, mistakes[] })
```

各クイズのロジックファイルはこのAPIを呼ぶだけになる。例えば：

```js
// 現在 wh-era-quiz_logic.js でやっていること
document.getElementById('progressBar').style.width = progress + '%';
// ↓
QuizUI.updateProgress(currentIndex + 1, total, progressBarEl, scoreEl);
```

---

## 対象ファイルの変更範囲

| ファイル | 変更内容 |
|---|---|
| `css/quiz.css` | **新規作成** |
| `js/quiz.js` | **新規作成** |
| `css/wh-era-quiz.css` | quiz.css と重複する定義を削除してスリム化 |
| `seikei/timeline/quiz.html` | インラインCSS削除、quiz.css + quiz.js を読む |
| `history/china/index.html` | quiz.css + quiz.js を読む（theme-chinese.css との共存） |
| `others/idiom_quiz/index.html` | quiz.css + quiz.js を読む |
| `others/idiom_quiz/quiz-logic.js` | QuizUI API を使うようにリファクタ |
| `others/idiom_quiz/idiom-quiz.css` | **新規作成**（gold カード上書きのみ） |
| `js/wh-era-quiz_logic.js` | QuizUI API を使うようにリファクタ |

中国史 quiz の `quiz-logic.js`（culture_quiz）はゲーム性が高すぎて共通化メリットが薄いので今回は対象外。

---

## 確認したい点 2つ

**① 画面切り替えの方式を統一してよいか？**

現状、`wh-era-quiz` は `.hidden` クラスではなく `document.getElementById().classList.add('hidden')` を各所でバラバラに書いている。`QuizUI.showScreen()` に統一すると各ロジックファイルのコードが大幅に短くなるが、既存の動作に細かい差異が出る可能性がある。

→統一する

**② `wh-era-quiz_logic.js` のリファクタ範囲**

このファイルはセクション選択→設定→クイズという多段フロー込みで複雑。今回は**クイズ画面内部**（進行・ハイライト・結果）だけ QuizUI に移して、画面遷移ロジック（`showSectionScreen()` など）はそのまま残す、という方針でよいか？それとも全面的に整理したい？

→全面整理

問題なければこの設計で実装に入る。

---



---

## `history/world/index.html` の `<link>` と `<script>` 変更部分

`wh-era-quiz.css` の読み込みの前後だけ変えます。

```diff
- <link rel="stylesheet" href="../styles/wh-era-quiz.css">
+ <link rel="stylesheet" href="../../css/quiz.css">
+ <link rel="stylesheet" href="../styles/wh-era-quiz.css">
```

`</body>` 直前のスクリプト群:

```diff
- <script src="../../js/wh-utils.js"></script>
- <script src="../../js/supabase_config.js"></script>
- <script src="../../js/wh-era-quiz_logic.js"></script>
+ <script src="../../js/wh-utils.js"></script>
+ <script src="../../js/supabase_config.js"></script>
+ <script src="../../js/quiz.js"></script>
+ <script src="../../js/wh-era-quiz_logic.js"></script>
```

HTML 内の `id` 変更（`progressBar` → `progressBar`、`choices` → `choices` はそのまま。ただし `#progressOuter` と `#progressBar` を quiz.css のクラス名に合わせます）:

```diff
- <div id="progressOuter">
-   <div id="progressBar"></div>
- </div>
+ <div class="quiz-progress-outer" id="progressOuter">
+   <div class="quiz-progress-bar" id="progressBar"></div>
+ </div>
```

`#score` → クラス `quiz-score` を追加:

```diff
- <div id="score">正解数: 0 / 0</div>
+ <div id="score" class="quiz-score">正解数: 0 / 0</div>
```

`#choices` 内のボタンは JS 側で `.choice-btn` クラスで生成されるので HTML 変更不要。

---

## `seikei/timeline/quiz.html` の変更

`<head>` のインライン `<style>` を丸ごと削除し、代わりに:

```html
<link rel="stylesheet" href="../../css/common.css">
<link rel="stylesheet" href="../../css/theme-toggle.css">
<link rel="stylesheet" href="../../css/quiz.css">
```

`<script>` の変更（`</body>` 前）:

```html
<script src="../../js/theme-toggle.js"></script>
<script src="../../js/quiz.js"></script>
```

既存ロジック内で使っているクラス名を置換:

| 旧（インライン） | 新（quiz.css） |
|---|---|
| `category-chip is-badge` | `quiz-chip is-badge` |
| `category-chip` (ボタン) | `quiz-chip` |
| `setup-screen` | `quiz-screen` |
| `quiz-screen` | `quiz-screen` |（そのまま）
| `result-screen` | `quiz-screen` |
| `score-summary` | `quiz-score-summary` |
| `score-card` | `quiz-score-card` |
| `.number` | `.number` |（そのまま）
| `.label` | `.qlabel` |
| `quiz-controls` | `quiz-controls` |（そのまま）
| `feedback` | `quiz-feedback` |
| `feedback.correct` | `quiz-feedback.correct` |
| `feedback.incorrect` | `quiz-feedback.incorrect` |
| `answer-input` | `quiz-answer-input` |
| `mistakes-list` | `quiz-mistakes-list` |
| `mistake-item` | `mistake-item` |（そのまま）
| `your-answer` | `mistake-your` |
| `correct-answer` | `mistake-correct` |

JS 内でも `startQuiz()` → `QuizUI.showScreen` を使うようリファクタします。ロジックの変更量が多いので JS 側の差分を示します（主要部分のみ）:

```js
// 画面切り替え
const ALL_SCREENS = ['setupScreen', 'quizScreen', 'resultScreen', 'loadingScreen'];

function showScreen(id) {
    QuizUI.showScreen(id, ALL_SCREENS);
}

// showResults 内のスコアカード生成を QuizUI に委ねる
function showResults() {
    QuizUI.renderResult(
        document.getElementById('scoreSummary'),
        document.getElementById('mistakesList'),
        {
            score: userAnswers.filter(a => a.isCorrect).length,
            total: userAnswers.length,
            mistakes: userAnswers.filter(a => !a.isCorrect).map(m => ({
                title:         m.question.title,
                category:      m.question.category,
                desc:          m.question.description,
                yourAnswer:    m.userAnswer + '年',
                correctAnswer: m.correctAnswer + '年',
            }))
        }
    );
    showScreen('resultScreen');
}
```

HTML 側で `<div class="score-summary" id="scoreSummary">` と `<div id="mistakesList" class="quiz-mistakes-list">` に変更。

---

## `others/idiom_quiz/index.html` の変更

`<head>`:
```diff
- <link rel="stylesheet" href="quiz-style.css">
+ <link rel="stylesheet" href="../../css/common.css">
+ <link rel="stylesheet" href="../../css/quiz.css">
+ <link rel="stylesheet" href="idiom-quiz.css">
```

`quiz-logic.js` で `feedback` の class 切り替えを `idiom-feedback` に変更:

```diff
- feedbackEl.innerHTML = `
-     <h3 class="${bannerClass}">${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</h3>
-     <div class="feedback-content"> ...`
+ feedbackEl.innerHTML = `
+     <div class="idiom-feedback">
+         <div class="idiom-feedback-banner ${bannerClass}">${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</div>
+         <div class="idiom-feedback-body"> ...`
```

既存の `quiz-style.css` は削除してよいですが、他のページが参照していないことを `check-links.mjs` で確認してから削除するのが安全です。

---

## 実装順序の推奨

1. `css/quiz.css` を配置
2. `js/quiz.js` を配置
3. `history/world/index.html` + `js/wh-era-quiz_logic.js` を更新して動作確認（データ読み込み量が一番多いのでここで動けば大丈夫）
4. `seikei/timeline/quiz.html` の CSS 差し替え（インライン削除）、JS に QuizUI 組み込み
5. `history/china/index.html` の CSS 差し替え（theme-chinese.css との共存確認）
6. `others/idiom_quiz/` の CSS 差し替え + `idiom-quiz.css` 配置
7. `npm run check` でリンク・構文チェック

`css/wh-era-quiz.css` の中身は空にするか最小化するだけ（削除ではなく `<link>` タグを残したままファイルを空にするのが安全 — 後で固有スタイルを追加する余地が残る）。
