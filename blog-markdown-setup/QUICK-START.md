# Markdown Blog Setup - Complete Guide

## ✅ What I've Created for You

I've set up a complete markdown blogging system in:
**C:\Users\user\Documents\blog-markdown-setup**

## 📁 Files Created

1. **markdown-blog.html** - Main template that renders your markdown posts
2. **posts-list.js** - Update this when you add new posts
3. **README.md** - Full documentation
4. **posts/2024-12-26-first-markdown-post.md** - Example post
5. **posts/_template.md** - Template for new posts

## 🚀 How to Use

### Step 1: Copy to Your Website
Copy these files to your existing `blogs/` folder:
- `markdown-blog.html` → `blogs/markdown-blog.html`
- `posts-list.js` → `blogs/posts-list.js` (merge with existing)
- Create `blogs/posts/` folder if it doesn't exist
- Copy markdown files to `blogs/posts/`

### Step 2: Write a New Post

1. Create a file: `blogs/posts/2024-12-26-my-post.md`

2. Add frontmatter at the top:
```markdown
---
title: 記事のタイトル
titleEN: English Title
date: 2024-12-26
category: Personal
categoryJP: 日記
---

# Your content here

Write in markdown...
```

3. Add to `posts-list.js`:
```javascript
{
    title: "記事のタイトル",
    titleEN: "English Title",
    date: "2024-12-26",
    category: "Personal",
    categoryJP: "日記",
    excerpt: "Brief description...",
    link: "markdown-blog.html?post=2024-12-26-my-post",  // NO .md!
    image: "../images/favicon.png"
}
```

### Step 3: View Your Post
Open: `markdown-blog.html?post=2024-12-26-my-post`

## 📝 Markdown Syntax Quick Reference

### Headers
```markdown
# H1
## H2
### H3
```

### Emphasis
```markdown
**bold**
*italic*
***bold italic***
```

### Lists
```markdown
- Item 1
- Item 2

1. First
2. Second
```

### Links & Images
```markdown
[Link text](https://example.com)
![Alt text](../images/image.png)
```

### Code
Inline: `code here`

Block:
````markdown
```python
def hello():
    print("Hello!")
```
````

### Blockquotes
```markdown
> Quote text
> - Author
```

## 💡 Key Points

1. **Filename format:** `YYYY-MM-DD-title.md`
2. **Always include frontmatter** (metadata between `---`)
3. **In posts-list.js:** Link should be `markdown-blog.html?post=FILENAME` (without .md)
4. **Test locally** before deploying

## 🎯 Benefits of This System

- Write in simple markdown format
- No need to manually create HTML for each post
- Consistent styling automatically applied
- Easy to manage and version control
- Fast and lightweight

## 📖 Example Post Structure

```markdown
---
title: 英語の勉強法
titleEN: How to Study English
date: 2024-12-26
category: Study
categoryJP: 勉強
---

# Introduction

Here's how I study...

## Method 1

Details...

## Method 2

More details...

## Conclusion

Final thoughts...
```

## 🔧 Troubleshooting

**Post doesn't load?**
- Check the filename matches the link in posts-list.js
- Make sure there's no .md in the link
- Verify frontmatter is properly formatted

**Styling looks wrong?**
- Make sure markdown-blog.html can find ../css/common.css
- Check that the theme toggle script is working

**Need to customize?**
- Edit CSS in markdown-blog.html
- Modify the marked.js rendering options if needed

---

**Everything is ready!** Just copy the files to your website and start writing in markdown. 

Check README.md for detailed documentation.
