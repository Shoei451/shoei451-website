# フラッシュカード テンプレート

どの教科にも使い回せる汎用フラッシュカードWebアプリです。

## ファイル構成

```
flashcard-template/
├── config.js   ★ ここだけ編集すればOK
├── app.js      エンジン（基本触らない）
├── index.html  HTMLシェル（基本触らない）
└── style.css   スタイル（基本触らない）
```

## カスタマイズ手順（`config.js` のみ編集）

### 1. タイトルを変える

```js
title:    '古典常識',       // 大きく表示される教科名
titleKana:'こてんじょうしき', // ルビ（小さく上に出る）
titleSub: 'KOTEN QUIZ',    // 英語サブタイトル
```

### 2. カテゴリを変える

```js
categories: {
  // key名（英字）: { label: '表示名', color: 'カラーコード' }
  rhetoric: { label: '和歌の修辞', color: '#7b5ea7' },
  rank:     { label: '貴族の位',   color: '#c07030' },
  lit:      { label: '文学史',    color: '#2a6641' },
},
```

カテゴリは2〜6個程度が見やすいです。

### 3. 問題を入れる

```js
defaultQuestions: [
  {
    id: 1,
    category: 'rhetoric',  // ← categories の key と一致させる
    question: '枕詞「あしひきの」がかかる語は？',
    answer:   '山',
    explanation: '補足説明（任意）',
    image_url: '',          // 画像URL（任意）
  },
  // ...
],
```

### 4. Supabase でクラウド保存する（任意）

```js
supabaseUrl:     'https://xxxx.supabase.co',
supabaseAnonKey: 'eyJ...',
tableName:       'flashcard_questions',
```

Supabase の SQL Editor で以下を実行してテーブルを作成：

```sql
CREATE TABLE flashcard_questions (
  id          SERIAL PRIMARY KEY,
  category    TEXT NOT NULL,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  explanation TEXT,
  image_url   TEXT
);
```

---

## 使い方（学習モード）

| 操作 | キーボード | タッチ |
|------|-----------|--------|
| 答えを見る | Space | カードをタップ |
| 次のカード | → | マスタリーボタンを押す |
| 前のカード | ← | ← ボタン |
| わからない | 1 | ✕ボタン |
| あやふや | 2 | △ボタン |
| わかった | 3 | ✓ボタン |

## 教科別カラーパレット例

| 教科 | カラー案 |
|------|---------|
| 古文・漢文 | `#7b5ea7` / `#c07030` / `#2a6641` |
| 世界史 | `#c0392b` / `#2980b9` / `#27ae60` |
| 生物 | `#16a085` / `#8e44ad` / `#f39c12` |
| 英単語 | `#2c3e50` / `#e74c3c` / `#3498db` |
| 数学 | `#1a5276` / `#117a65` / `#b9770e` |
