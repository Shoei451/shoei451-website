// ========== MARKDOWN記事データ ==========
// この形式なら、サーバーなしでも動作します

const markdownPosts = {
    "2024-12-26-markdown-sample": {
        metadata: {
            title: "Markdownで書くブログの始め方",
            titleEN: "Getting Started with Markdown Blogging",
            date: "2024-12-26",
            category: "Tutorial",
            categoryJP: "チュートリアル"
        },
        content: `# はじめに

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

- **太字** は \`**太字**\` と書く
- *斜体* は \`*斜体*\` と書く
- ~~取り消し線~~ は \`~~取り消し線~~\` と書く

### 見出し

\`\`\`markdown
# 見出し1
## 見出し2
### 見出し3
\`\`\`

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

形式: \`[リンクテキスト](URL)\`

## コードの書き方

### インラインコード

文中にコードを書く時は \`const x = 10;\` のようにバッククォートで囲みます。

### コードブロック

長いコードは以下のように書きます:

\`\`\`javascript
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
\`\`\`

Pythonの例:

\`\`\`python
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)

print(factorial(5))  # 120
\`\`\`

## 引用

> "シンプルであることは、究極の洗練である"  
> — レオナルド・ダ・ヴィンチ

引用は \`>\` で始めます。

## 表

Markdownで表も作れます:

| 言語 | 難易度 | 用途 |
|------|--------|------|
| Python | 易 | AI、データ分析 |
| JavaScript | 中 | Web開発 |
| C++ | 難 | システム開発 |

## まとめ

Markdownを使えば:

✅ HTMLを書かずに記事が作れる  
✅ シンプルで読みやすい  
✅ バージョン管理がしやすい  
✅ 書くことに集中できる

これからはMarkdownでブログを書いてみましょう！`
    }
};

// ========== HTML記事リスト（従来通り） ==========
const blogPosts = [
    // Markdown記事（サーバー不要版）
    {
        title: "Markdownで書いたサンプル記事",
        titleEN: "Sample Markdown Post",
        date: "2024-12-26",
        category: "Tutorial",
        categoryJP: "チュートリアル",
        excerpt: "Markdownで簡単にブログ記事を書く方法を紹介します。サーバー不要で動作します。",
        link: "markdown-blog-inline.html?post=2024-12-26-markdown-sample",
        image: "../images/favicon.png"
    },
    
    // HTML記事（既存）
    {
        title: "タイトル1",
        titleEN: "My First Blog Post",
        date: "2024-12-01",
        category: "Personal",
        categoryJP: "日記",
        excerpt: "このウェブサイトを作り始めた経緯について書きます。",
        link: "posts/2024-12-01-first-post.html",
        image: "../images/favicon.png"
    },
    {
        title: "タイトル2",
        titleEN: "Tips for Learning Biology",
        date: "2024-12-15",
        category: "Study Tips",
        categoryJP: "勉強法",
        excerpt: "編集中です",
        link: "posts/2024-12-15-learning-biology.html",
        image: "../images/favicon.png"
    }
];

// ========== 新しい記事の追加方法 ==========
// 
// 【方法1: JavaScript内に直接書く（サーバー不要）】
// 1. この markdownPosts オブジェクトに新しい記事を追加:
//    "2024-12-27-new-post": {
//        metadata: { ... },
//        content: `...Markdownで書く...`
//    }
// 2. blogPosts 配列に追加:
//    {
//        title: "...",
//        link: "markdown-blog-inline.html?post=2024-12-27-new-post",
//        ...
//    }
//
// 【方法2: 別ファイル（サーバー必要）】
// - posts/ に .md ファイルを作成
// - link: "markdown-blog.html?post=..." を使う
// - ローカルサーバーが必要
