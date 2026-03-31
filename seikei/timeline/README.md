# 政治・経済タイムライン概要

最終更新: 2026-03-27

---

## 現在の構成

```text
seikei/timeline/
├── index.html
├── print.html
├── quiz.html
├── README.md
└── seikei-timeline.css
```

---

## データソース

- `index.html`: `TABLES.SEIKEI`
- `print.html`: `TABLES.SEIKEI`
- `quiz.html`: `TABLES.SEIKEI`

---

## 共通資産

タイムライン系:

- `../../js/wh-utils.js`
- `../../js/supabase_config.js`
- `../../css/timeline.css`
- `../../css/theme-toggle.css`

クイズ系:

- `../../js/wh-utils.js`
- `../../quiz-components/quiz-shell.css`
- `../../quiz-components/start/start-screen.css`
- `../../quiz-components/progress/progress.css`
- `../../quiz-components/question/question-area.css`
- `../../quiz-components/answer/answer.css`
- `../../quiz-components/feedback/feedback.css`
- `../../quiz-components/result/result.css`
- `./quiz.js`

---

## 現在の状態

- `index.html` と `print.html` は Supabase から年表データを読み込む
- `quiz.html` は `quiz-components/` ベースに移行済み
- `quiz.html` の `escapeHtml` / `shuffleArray` は `js/wh-utils.js` を使う

---

## 次に触るなら

1. タイムライン本体とクイズの共通部品の境界を明確にする
2. 必要なら印刷ページの役割を `index.html` から分離して説明を追加する
