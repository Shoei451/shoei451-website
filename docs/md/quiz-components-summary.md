# quiz-components 設計・適用状況

最終更新: 2026-03-26

---

## 1. 目的

クイズUIの共通部品を `quiz-components/` に集約し、クイズごとの実装差分を最小化する。

---

## 2. コンポーネント構成

```
quiz-components/
├── quiz-shell.css
├── start/
│   ├── start-screen.js
│   └── start-screen.css
├── progress/
│   ├── progress.js
│   └── progress.css
├── question/
│   ├── question-area.js
│   └── question-area.css
├── answer/
│   ├── choice-buttons.js
│   ├── text-input.js
│   └── answer.css
├── feedback/
│   ├── feedback.js
│   └── feedback.css
├── result/
│   ├── result.js
│   └── result.css
└── demo.html
```

---

## 3. 適用状況（現行）

| 対象 | 状態 | 備考 |
|---|---|---|
| `history/world/year-to-event/index.html` | ✅ | 4択形式。`choice-buttons.js` を使用 |
| `history/world/event-to-year/index.html` | ✅ | 入力形式。`text-input.js` を使用 |
| `others/idiom_quiz/index.html` | ✅ | 4択 + 独自フィードバックUI |
| `history/world/index.html` | ❌ | 旧実装（component 非依存） |
| `history/china/index.html` | ❌ | 旧実装（component 非依存） |
| `seikei/timeline/quiz.html` | ❌ | 旧実装（component 非依存） |

---

## 4. 既知の論点

- `history/world/year-to-event/quiz.js` と `event-to-year/quiz.js` は `shuffleArray` をローカル実装している
- `history/world/index.html`（旧版）と split 版が並行運用されている
- 画面遷移・データ取得ロジックはページごとに差分があるため、完全共通化は段階的に進める

---

## 5. 次の実装候補

1. `history/china/index.html` を component 方式へ移行
2. `seikei/timeline/quiz.html` を component 方式へ移行
3. `history/world/index.html` の役割を整理（廃止 or split 版への誘導ページ化）
4. `shuffleArray` の統一方針を決める（`wh-utils` or local の維持）

---

## 6. 実装時の最小テンプレート

```html
<link rel="stylesheet" href="../../quiz-components/quiz-shell.css">
<link rel="stylesheet" href="../../quiz-components/start/start-screen.css">
<link rel="stylesheet" href="../../quiz-components/progress/progress.css">
<link rel="stylesheet" href="../../quiz-components/question/question-area.css">
<link rel="stylesheet" href="../../quiz-components/answer/answer.css">
<link rel="stylesheet" href="../../quiz-components/feedback/feedback.css">
<link rel="stylesheet" href="../../quiz-components/result/result.css">

<script src="../../quiz-components/start/start-screen.js"></script>
<script src="../../quiz-components/progress/progress.js"></script>
<script src="../../quiz-components/question/question-area.js"></script>
<script src="../../quiz-components/answer/choice-buttons.js"></script>
<script src="../../quiz-components/answer/text-input.js"></script>
<script src="../../quiz-components/feedback/feedback.js"></script>
<script src="../../quiz-components/result/result.js"></script>
```

相対パスは配置階層に合わせて調整する。
