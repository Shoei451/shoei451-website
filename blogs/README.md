# ✅ ブログ統合完了！

## 📦 作成したファイル一覧

**場所:** C:\Users\user\Documents\blog-integrated

### 1. コアファイル
- ✅ **markdown-blog.html** - Markdown記事を表示するページ
- ✅ **posts-list.js** - 更新版（HTML/Markdown両対応）

### 2. サンプル・テンプレート
- ✅ **posts/2024-12-26-markdown-sample.md** - Markdownのサンプル記事
- ✅ **posts/_template.md** - 新規記事用テンプレート

### 3. ドキュメント
- ✅ **統合ガイド.md** - 詳細な使い方
- ✅ **Markdownチートシート.md** - Markdown記法一覧

---

## 🚀 次のステップ

### 1. ファイルをコピー

以下のファイルをあなたのwebサイトの `blogs/` フォルダにコピー:

```
blogs/
├── markdown-blog.html      ← 新しく追加
├── posts-list.js          ← 既存のものと置き換え
└── posts/
    ├── 2024-12-26-markdown-sample.md  ← サンプル
    └── _template.md                   ← テンプレート
```

**既存の index.html はそのまま使えます！**

### 2. テスト

1. `blogs/index.html` を開く
2. 「Markdownで書いたサンプル記事」をクリック
3. 正しく表示されることを確認

### 3. 新しい記事を書く

#### Markdownで書く場合（推奨）:

1. **ファイル作成:**
   ```
   blogs/posts/2024-12-26-my-new-post.md
   ```

2. **frontmatter追加:**
   ```markdown
   ---
   title: タイトル
   titleEN: English Title
   date: 2024-12-26
   category: Personal
   categoryJP: 日記
   ---

   # 本文開始

   内容を書く...
   ```

3. **posts-list.js に追加:**
   ```javascript
   {
       title: "タイトル",
       titleEN: "English Title",
       date: "2024-12-26",
       category: "Personal",
       categoryJP: "日記",
       excerpt: "概要...",
       link: "markdown-blog.html?post=2024-12-26-my-new-post",  // ⚠️ .mdなし！
       image: "../images/favicon.png"
   }
   ```

#### HTMLで書く場合（従来通り）:

従来通りHTMLファイルを作成して、posts-list.js にリンクを追加するだけです。

---

## 💡 重要なポイント

### ✅ 両方使える
- **Markdown記事** → `markdown-blog.html?post=ファイル名`
- **HTML記事** → `posts/ファイル名.html`
- 両方が同じ `index.html` に表示される

### ✅ リンクの書き方
```javascript
// Markdown記事の場合
link: "markdown-blog.html?post=2024-12-26-title"  // .md は付けない！

// HTML記事の場合
link: "posts/2024-12-26-title.html"  // 従来通り
```

### ✅ frontmatter必須
Markdown記事には必ずfrontmatterを書く:
```markdown
---
title: タイトル
titleEN: English Title
date: 2024-12-26
category: Personal
categoryJP: 日記
---
```

---

## 📚 参考ドキュメント

詳しい情報は同じフォルダ内のファイルを参照:

1. **統合ガイド.md** - 完全な使い方ガイド
2. **Markdownチートシート.md** - Markdown記法一覧

---

## 🎯 メリット

✅ **簡単** - HTMLを書かなくていい  
✅ **柔軟** - Markdown/HTML両方使える  
✅ **互換性** - 既存の記事はそのまま  
✅ **管理しやすい** - テキストファイルで管理  

---

## 🔧 トラブルシューティング

**記事が表示されない？**
→ `posts-list.js` のリンクに `.md` が付いていないか確認

**スタイルが崩れる？**
→ `markdown-blog.html` が `../css/common.css` を読めているか確認

**その他の問題？**
→ ブラウザのデベロッパーツール（F12）でエラーを確認

---

**準備完了！** Markdownでブログを書き始めましょう 🎉

C:\Users\user\Documents\blog-integrated にすべてのファイルがあります。
