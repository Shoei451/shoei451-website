

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