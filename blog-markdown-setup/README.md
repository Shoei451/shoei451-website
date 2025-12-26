# Markdown Blog Setup Guide

## 📁 File Structure

```
blogs/
├── index.html              # Main blog listing page
├── markdown-blog.html      # Template for rendering markdown posts
├── posts-list.js          # Post metadata (for index page)
└── posts/
    └── 2024-12-26-first-markdown-post.md  # Your markdown posts
```

## ✍️ Writing a New Blog Post

### 1. Create a new markdown file

Create a file in the `posts/` folder with this naming convention:
```
YYYY-MM-DD-title.md
```

Example: `2024-12-26-my-second-post.md`

### 2. Add frontmatter (metadata)

Start your markdown file with metadata between `---` lines:

```markdown
---
title: ブログ記事のタイトル
titleEN: English Title
date: 2024-12-26
category: Personal
categoryJP: 日記
---

# Your content starts here

Write your blog post using markdown...
```

### 3. Write your content

Use standard markdown syntax:

#### Headers
```markdown
# H1 Header
## H2 Header
### H3 Header
```

#### Emphasis
```markdown
**bold text**
*italic text*
***bold and italic***
```

#### Lists
```markdown
- Unordered item 1
- Unordered item 2

1. Ordered item 1
2. Ordered item 2
```

#### Links
```markdown
[Link text](https://example.com)
```

#### Images
```markdown
![Alt text](../images/image.png)
```

#### Code
Inline code: `const x = 10;`

Code blocks:
````markdown
```javascript
function hello() {
    console.log("Hello!");
}
```
````

#### Blockquotes
```markdown
> This is a quote
> - Author
```

### 4. Add to posts-list.js

After creating your markdown file, add an entry to `posts-list.js`:

```javascript
{
    title: "ブログ記事のタイトル",
    titleEN: "English Title",
    date: "2024-12-26",
    category: "Personal",
    categoryJP: "日記",
    excerpt: "Short description of your post...",
    link: "markdown-blog.html?post=2024-12-26-filename",  // ⚠️ No .md extension!
    image: "../images/favicon.png"  // Optional
}
```

**Important:** The `link` should be:
```
markdown-blog.html?post=FILENAME-WITHOUT-EXTENSION
```

## 📋 Example Markdown Post

```markdown
---
title: 英語学習の方法
titleEN: How I Learn English
date: 2024-12-26
category: Study Tips
categoryJP: 勉強法
---

# Introduction

英語学習について書きます。

## My Methods

1. **Reading** - Lots of articles and books
2. **Writing** - Daily journaling
3. **Listening** - Podcasts and videos

### Useful Resources

- [BBC Learning English](https://www.bbc.co.uk/learningenglish)
- [Cambridge Dictionary](https://dictionary.cambridge.org/)

## Code Example

```python
def practice_english(hours):
    return hours * 60  # minutes
```

## Conclusion

Consistent practice is key!
```

## 🚀 How It Works

1. **markdown-blog.html** reads the `?post=` parameter from the URL
2. It fetches the corresponding `.md` file from the `posts/` folder
3. The frontmatter is parsed for metadata (title, date, category)
4. The markdown content is converted to HTML using [marked.js](https://marked.js.org/)
5. The rendered HTML is displayed with your site's styling

## 🎨 Customization

You can customize the appearance by editing the CSS in `markdown-blog.html`:
- Change colors (search for `var(--accent)`, `var(--primary)`)
- Adjust spacing and typography
- Modify the post header layout

## 📝 Tips

- Use descriptive filenames
- Keep frontmatter consistent
- Write excerpts that accurately describe your posts
- Test locally by opening `markdown-blog.html?post=your-post-name` in a browser

## 🔄 Workflow

1. Write post in markdown → `posts/2024-12-26-my-post.md`
2. Add entry to → `posts-list.js`
3. View at → `markdown-blog.html?post=2024-12-26-my-post`

That's it! Enjoy writing in markdown! ✨
