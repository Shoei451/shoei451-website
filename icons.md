# /js/icons.jsについて

## 読み込み順（各HTML）:

```html
<!-- nav.js より前に置く -->
<script src="/js/icons.js"></script>
<script src="/js/nav.js"></script>
```

```js
sub-index-init.js の _resolveIcon() 内:
jsif (/^bi-[\w-]+$/.test(raw)) {
  const svg = window.getIcon(raw);
  return svg
    ? `<span class="site-card__bi-icon mb-3">${svg}</span>`
    : '';
}
```

nav.js のテンプレート文字列内（例）:

```js
// 変更前
`<i class="bi bi-chevron-left"></i>`
// 変更後
`${window.getIcon("bi-chevron-left")}`;
```

## 新しいアイコンを追加したいとき:

icons.js の ICONS マップに1行追加するだけ。SVGは icons.getbootstrap.com で検索してコピー。class="bi bi-xxx" 属性は削除してから貼る（aria-hidden="true" は追加する）。
未定義のアイコン名を渡すと console.warn が出るので、呼び出し側の typo にも気づきやすい。
