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

- `../../css/quiz.css`
- `../../js/quiz.js`

---

## 現在の状態

- `index.html` と `print.html` は Supabase から年表データを読み込む
- `quiz.html` は共通の `css/quiz.css` / `js/quiz.js` を使っている
- ただし `quiz.html` 内には `escapeHtml` と `shuffleArray` のローカル実装が残っている

---

## 次に触るなら

1. `quiz.html` のローカル `escapeHtml` / `shuffleArray` を `js/wh-utils.js` に寄せる
2. タイムライン本体とクイズの共通部品の境界を明確にする
3. 必要なら印刷ページの役割を `index.html` から分離して説明を追加する
