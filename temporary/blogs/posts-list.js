const blogPosts = [
    // ========== MARKDOWN記事 ==========
    // markdownで書いた記事は "markdown-blog.html?post=ファイル名" の形式でリンク
    {
        title: "Markdownで書いたサンプル記事",
        titleEN: "Sample Markdown Post",
        date: "2024-12-26",
        category: "Tutorial",
        categoryJP: "チュートリアル",
        excerpt: "Markdownで簡単にブログ記事を書く方法を紹介します。",
        link: "markdown-blog.html?post=2024-12-26-markdown-sample",
        image: "../images/favicon.png"
    },
    
    // ========== HTML記事（既存） ==========
    // HTMLで書いた記事は "posts/ファイル名.html" の形式でリンク
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
    
    // ========== 新しい記事を追加する時は... ==========
    // 
    // 【Markdownで書く場合】
    // 1. posts/ に "YYYY-MM-DD-title.md" というファイルを作成
    // 2. ファイルの先頭に以下のfrontmatterを追加:
    //    ---
    //    title: タイトル
    //    titleEN: English Title
    //    date: 2024-12-26
    //    category: Category
    //    categoryJP: カテゴリー
    //    ---
    // 3. その下にMarkdownで記事を書く
    // 4. このファイルに以下のような項目を追加:
    //    {
    //        title: "タイトル",
    //        titleEN: "English Title",
    //        date: "2024-12-26",
    //        category: "Category",
    //        categoryJP: "カテゴリー",
    //        excerpt: "記事の概要...",
    //        link: "markdown-blog.html?post=2024-12-26-title",  // ⚠️ .md は不要！
    //        image: "../images/favicon.png"
    //    }
    //
    // 【HTMLで書く場合（従来通り）】
    // 1. posts/ に "YYYY-MM-DD-title.html" というファイルを作成
    // 2. templates/blog_template.html をコピーして編集
    // 3. このファイルに以下のような項目を追加:
    //    {
    //        title: "タイトル",
    //        titleEN: "English Title",
    //        date: "2024-12-26",
    //        category: "Category",
    //        categoryJP: "カテゴリー",
    //        excerpt: "記事の概要...",
    //        link: "posts/2024-12-26-title.html",
    //        image: "../images/favicon.png"
    //    }
];
