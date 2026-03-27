# 中国史ページ概要

最終更新: 2026-03-27

---

## 現在の構成

```text
history/china/
├── index.html
├── timeline.html
├── README.md
└── culture_quiz/
    ├── index.html
    ├── quiz-logic.js
    ├── quizdata.js
    └── style.css
```

---

## データソース

- `index.html`: `TABLES.CHINESE`
- `timeline.html`: `TABLES.CHINESE`
- `culture_quiz/`: ローカル `quizdata.js`

まだ `wh_dates` には移行していない。

---

## 共通資産

- `../../js/wh-utils.js`
- `../../js/supabase_config.js`
- `../../css/quiz.css`
- `../../css/theme-toggle.css`
- `../styles/theme-chinese.css`

`index.html` は共通クイズスタイルを使っているが、データ取得は中国史専用テーブルのまま。

---

## 現在の状態

- UI は共通化が進んでいる
- データ面は旧構成のまま
- `culture_quiz/` は独立運用で、共通UIや `wh_dates` には乗っていない

---

## 次に触るなら

1. `chinese_history` の必要データを `wh_dates` に寄せる
2. `index.html` の取得先を `TABLES.WH_DATES` に変更する
3. `timeline.html` も同様に変更する
4. `culture_quiz/` を独立運用のまま残すか別途整理する
