# 📝 Markdown記法チートシート

## 基本構文

### 見出し
```markdown
# 見出し1（最大）
## 見出し2
### 見出し3
#### 見出し4
##### 見出し5
###### 見出し6（最小）
```

### テキスト装飾
```markdown
**太字**
*斜体*
***太字かつ斜体***
~~取り消し線~~
`インラインコード`
```

### リスト

**番号なし:**
```markdown
- 項目1
- 項目2
  - サブ項目2-1
  - サブ項目2-2
- 項目3
```

**番号付き:**
```markdown
1. 最初
2. 次
3. 最後
```

**チェックリスト:**
```markdown
- [ ] 未完了タスク
- [x] 完了済みタスク
```

### リンク
```markdown
[表示テキスト](https://example.com)
[Google](https://google.com)
```

### 画像
```markdown
![代替テキスト](画像のパス)
![ロゴ](../images/favicon.png)
```

### 引用
```markdown
> これは引用です
> 複数行にわたって
> 引用できます

> "名言をここに"
> — 作者名
```

## コード

### インラインコード
```markdown
変数は `const x = 10;` のように宣言します。
```

### コードブロック

**シンタックスハイライト付き:**

````markdown
```javascript
function greet(name) {
    return `Hello, ${name}!`;
}
```
````

````markdown
```python
def factorial(n):
    return 1 if n == 0 else n * factorial(n - 1)
```
````

**言語指定なし:**
````markdown
```
普通のテキスト
コードではない
```
````

## 表

```markdown
| ヘッダー1 | ヘッダー2 | ヘッダー3 |
|----------|----------|----------|
| データ1  | データ2  | データ3  |
| データ4  | データ5  | データ6  |
```

**配置指定:**
```markdown
| 左寄せ | 中央 | 右寄せ |
|:-------|:----:|-------:|
| 左     | 中   | 右     |
```

## 水平線

```markdown
---
または
***
または
___
```

## エスケープ

特殊文字を表示したい時:
```markdown
\* アスタリスク
\_ アンダースコア
\` バッククォート
\# ハッシュ
```

## 改行

**段落:** 空行を1つ入れる
```markdown
段落1

段落2
```

**行内改行:** 行末にスペース2つ
```markdown
1行目  ← スペース2つ
2行目
```

## ブログ記事用 frontmatter

記事の**先頭**に必ず付ける:

```markdown
---
title: 記事のタイトル（日本語）
titleEN: English Title
date: 2024-12-26
category: Category Name
categoryJP: カテゴリー名
---

# ここから本文
```

### カテゴリー例
- Personal / 日記
- Study Tips / 勉強法
- Tutorial / チュートリアル
- Review / レビュー
- Thoughts / 考察

## よく使う組み合わせ

### セクションの始まり
```markdown
## セクションタイトル

簡単な説明を書きます。

### ポイント1
詳細...

### ポイント2
詳細...
```

### リスト + 強調
```markdown
重要なポイント:
- **最重要**: 毎日練習する
- *推奨*: 良い教材を選ぶ
- 復習を忘れずに
```

### コード + 説明
```markdown
以下のように書きます:

```python
def example():
    pass
```

このコードは...
```

### リンク付きリスト
```markdown
参考資料:
- [MDN Web Docs](https://developer.mozilla.org/)
- [GitHub](https://github.com)
- [Stack Overflow](https://stackoverflow.com/)
```

## 実践例

```markdown
---
title: Pythonの基礎
titleEN: Python Basics
date: 2024-12-26
category: Tutorial
categoryJP: チュートリアル
---

# Pythonの基礎

Pythonは**初心者に優しい**プログラミング言語です。

## 変数の宣言

変数は以下のように宣言します:

```python
name = "太郎"
age = 20
is_student = True
```

## リストの使い方

Pythonのリスト:
- 順序がある
- 変更可能
- 重複を許可

例:
```python
fruits = ["apple", "banana", "orange"]
print(fruits[0])  # apple
```

## まとめ

Pythonは:
1. 読みやすい
2. 書きやすい
3. 多機能

> "Life is short, use Python"
> — プログラマーの格言

詳しくは[公式ドキュメント](https://docs.python.org/)へ。
```

---

このチートシートを参考に、Markdownでブログを書いてください！
