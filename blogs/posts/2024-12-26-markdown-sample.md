---
title: Markdownで書くブログの始め方
titleEN: Getting Started with Markdown Blogging
date: 2024-12-26
category: Tutorial
categoryJP: チュートリアル
---

# はじめに

この記事は**Markdown**で書かれています。HTMLを書く必要がなく、シンプルな記法で美しい記事を作成できます。

## Markdownとは？

Markdownは軽量マークアップ言語の一つで、プレーンテキストで書かれた文書を簡単にHTMLに変換できます。

### Markdownの利点

1. **シンプル** - 覚えやすい記法
2. **高速** - 書くのが速い
3. **可読性** - テキストファイルのまま読みやすい
4. **汎用性** - 多くのプラットフォームで使える

## 基本的な書き方

### テキストの装飾

- **太字** は `**太字**` と書く
- *斜体* は `*斜体*` と書く
- ~~取り消し線~~ は `~~取り消し線~~` と書く

### 見出し

```markdown
# 見出し1
## 見出し2
### 見出し3
```

### リスト

番号なしリスト:
- 項目1
- 項目2
- 項目3

番号付きリスト:
1. 最初
2. 次
3. 最後

### リンク

[Googleへのリンク](https://google.com)

形式: `[リンクテキスト](URL)`

### 画像

```markdown
![画像の説明](../images/favicon.png)
```

## コードの書き方

### インラインコード

文中にコードを書く時は `const x = 10;` のようにバッククォートで囲みます。

### コードブロック

長いコードは以下のように書きます:

```javascript
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
```

Pythonの例:

```python
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)

print(factorial(5))  # 120
```

## 引用

> "シンプルであることは、究極の洗練である"  
> — レオナルド・ダ・ヴィンチ

引用は `>` で始めます。

## 表

Markdownで表も作れます:

| 言語 | 難易度 | 用途 |
|------|--------|------|
| Python | 易 | AI、データ分析 |
| JavaScript | 中 | Web開発 |
| C++ | 難 | システム開発 |

## 数式（オプション）

LaTeX形式で数式を書くこともできます（適切なライブラリが必要）:

インライン: $E = mc^2$

ブロック:
$$
\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

## まとめ

Markdownを使えば:

✅ HTMLを書かずに記事が作れる  
✅ シンプルで読みやすい  
✅ バージョン管理がしやすい  
✅ 書くことに集中できる

これからはMarkdownでブログを書いてみましょう！

---

**注意:** この記事の.mdファイルを`posts/`フォルダから見れば、Markdownの生のコードが確認できます。
