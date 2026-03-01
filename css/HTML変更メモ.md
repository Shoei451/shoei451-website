# CSS Refactor - HTML変更メモ

## 新規ファイル
- `css/theme-wh.css`      ← 世界史・政経タイムライン共通
- `css/theme-chinese.css` ← 中国史ページ共通

---

## 各HTMLの <link> 変更

### history/worldhistory/timeline.html
```html
<!-- 変更前 -->
<link rel="stylesheet" href="../../css/history-styles/wh-timeline.css">

<!-- 変更後: theme-wh.css を先に読み込む -->
<link rel="stylesheet" href="../../css/theme-wh.css">
<link rel="stylesheet" href="../../css/history-styles/wh-timeline.css">
```

### seikei/seikei-timeline.html
```html
<!-- 変更後 -->
<link rel="stylesheet" href="../css/theme-wh.css">
<link rel="stylesheet" href="../css/specific-styles/seikei-timeline.css">
```

### history/china/timeline.html
```html
<!-- 変更後 -->
<link rel="stylesheet" href="../../css/theme-chinese.css">
<link rel="stylesheet" href="../../css/history-styles/chinese-timeline.css">
```

### history/china/culture_quiz/index.html
```html
<!-- 変更後 -->
<link rel="stylesheet" href="../../../css/theme-chinese.css">
<link rel="stylesheet" href="../../../css/history-styles/chinese-quiz.css">
```

### history/worldhistory/index.html  (wh-era-quiz)
```html
<!-- common.css は既に読み込み済みのはず。変更なし。 -->
<link rel="stylesheet" href="../../css/common.css">
<link rel="stylesheet" href="../../css/history-styles/wh-era-quiz.css">
```

### home_economics/care-symbols/index.html
```html
<!-- common.css は既に読み込み済みのはず。変更なし。 -->
<link rel="stylesheet" href="../../css/common.css">
<link rel="stylesheet" href="../../css/specific-styles/care-symbols-style.css">
```

### informatics1/hex-quiz/index.html
```html
<!-- common.css は既に読み込み済みのはず。変更なし。 -->
<link rel="stylesheet" href="../../css/common.css">
<link rel="stylesheet" href="../../css/specific-styles/hex-quiz-style.css">
```

---

## 行数比較 (削減効果)

| ファイル                | 変更前 | 変更後 | 削減 |
|------------------------|--------|--------|------|
| theme-wh.css           | (新規) |  ~240  |  -   |
| theme-chinese.css      | (新規) |  ~120  |  -   |
| wh-timeline.css        |   552  |  ~120  | -78% |
| seikei-timeline.css    |   588  |  ~150  | -74% |
| chinese-timeline.css   |   534  |  ~300  | -44% |
| chinese-quiz.css       |   467  |  ~230  | -51% |
| wh-era-quiz.css        |   309  |  ~200  | -35% |
| care-symbols-style.css |  1202  |  ~700  | -42% |
| hex-quiz-style.css     |   862  |  ~600  | -30% |

新規2ファイル追加(+360行) / 既存削除(-2136行) = 実質 **-1776行** の削減
