# Markdownブログシステム 使い方ガイド

## 📁 ファイル構成

```
your-website/
├── blog-index.html           # ブログ一覧ページ
├── blog/
│   ├── post-1.html          # 記事ページ（HTML）
│   ├── post-1.md            # 記事内容（Markdown）
│   ├── post-2.html          # 別の記事ページ
│   ├── post-2.md            # 別の記事内容
│   └── post-template.html   # 新規記事作成用のテンプレート
├── css/
│   └── common.css
└── js/
    └── theme-toggle.js
```

## ✍️ 新しい記事を追加する方法

### ステップ1: Markdownファイルを作成

`blog/post-X.md` というファイルを作成し、Markdown形式で記事を書く：

```markdown
# 記事タイトル

記事の本文をここに書きます...

## 見出し

内容...
```

### ステップ2: HTMLページを作成

`blog/post-template.html` をコピーして `blog/post-X.html` にリネーム。

以下の部分を編集：

```javascript
// 記事のメタ情報（33行目あたり）
const postMeta = {
  title: "あなたの記事タイトル",
  date: "2026-01-13",
  tags: ["タグ1", "タグ2"],
  markdownFile: "post-X.md"  // あなたが作成したMarkdownファイル
};
```

### ステップ3: blog-index.html に追加

`blog-index.html` の `blogPosts` 配列に新しい記事を追加：

```javascript
const blogPosts = [
  // 既存の記事...
  {
    id: "post-X",
    title: "あなたの記事タイトル",
    date: "2026-01-13",
    tags: ["tag1", "tag2"],
    excerpt: "記事の要約を100文字程度で...",
    file: "blog/post-X.html"
  }
];
```

## 🏷️ タグシステム

### タグの定義

`blog-index.html` の `tagLabels` オブジェクトで日本語表示を設定：

```javascript
const tagLabels = {
  math: '数学',
  english: '英語',
  history: '歴史',
  programming: 'プログラミング',
  // 新しいタグを追加
  physics: '物理',
  chemistry: '化学'
};
```

### フィルターボタンの追加

タグでフィルタリングできるボタンを追加：

```html
<button class="filter-btn" data-filter="physics">物理</button>
```

## 🎨 カスタマイズ

### 色の変更

`common.css` の変数を変更：

```css
:root {
  --accent: #FABA40;  /* アクセントカラー */
  --primary: #313A49; /* メインテキスト */
}
```

### カードのレイアウト

`blog-index.html` のグリッド設定：

```css
.blog-grid {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}
```

## 📝 Markdownの書き方

### 見出し

```markdown
# H1 見出し
## H2 見出し
### H3 見出し
```

### 強調

```markdown
**太字**
*イタリック*
```

### リスト

```markdown
- 項目1
- 項目2
  - サブ項目

1. 番号付き1
2. 番号付き2
```

### コードブロック

````markdown
```javascript
const x = 10;
console.log(x);
```
````

### 表

```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| A   | B   | C   |
```

### リンク

```markdown
[表示テキスト](https://example.com)
```

### 画像

```markdown
![代替テキスト](images/photo.jpg)
```

### 引用

```markdown
> これは引用文です。
```

## 🚀 デプロイ

### GitHub Pages にデプロイ

1. GitHubリポジトリにpush
2. Settings → Pages → Source を `main` ブランチに設定
3. `https://username.github.io/repository-name/blog-index.html` でアクセス可能

### ローカルでテスト

```bash
# プロジェクトフォルダで
python -m http.server 8000

# ブラウザで開く
http://localhost:8000/blog-index.html
```

## 💡 便利な Tips

### 記事の順序

`blogPosts` 配列の順序で表示されます。最新の記事を一番上に配置しましょう。

### SEO対策

各記事ページの `<title>` タグと `<meta name="description">` を設定すると良いです。

### 読了時間の計算

記事の文字数から自動計算するスクリプトを追加できます：

```javascript
const wordCount = markdown.split(/\s+/).length;
const readTime = Math.ceil(wordCount / 200); // 1分200語として計算
```

### アナリティクス

Google Analyticsなどを追加する場合は、各HTMLファイルの `<head>` に追加します。

## 🔧 トラブルシューティング

### Markdownが表示されない

- ファイルパスが正しいか確認
- ブラウザのコンソールでエラーを確認
- ローカルサーバーを使用しているか確認

### CORSエラー

- ローカルでテストする場合は必ずサーバーを起動
- `python -m http.server` または Live Server拡張機能を使用

### スタイルが反映されない

- `common.css` のパスが正しいか確認
- 相対パスに注意（`../css/common.css` など）

---

質問があれば: okamotoshoei451@gmail.com