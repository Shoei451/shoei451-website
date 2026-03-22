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
