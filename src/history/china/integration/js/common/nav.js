/* ============================================================
   js/common/nav.js
   共通ナビゲーションバーの注入スクリプト

   対象ページ: index.html / map.html / timeline.html
   非対象:     dynasty.html / culture-quiz.html
               （独自ヘッダーを持つため自前でナビを実装している）

   使い方:
     <script src="js/common/nav.js"></script>
     <script>Nav.init('map');</script>  ← 現在のページIDを渡す
   
   ページID一覧:
     'index'    → 一覧
     'map'      → 変遷図
     'timeline' → 年表
     'quiz'     → クイズ
   ============================================================ */

const Nav = (() => {

  const LINKS = [
    { id: 'index',    label: '一覧',   href: 'index.html' },
    { id: 'map',      label: '変遷図', href: 'map.html' },
    { id: 'timeline', label: '年表',   href: 'timeline.html' },
    { id: 'quiz',     label: 'クイズ', href: 'culture-quiz.html' },
  ];

  /**
   * ナビゲーションを <body> の先頭に注入する。
   * 既存の .site-header がある場合は何もしない（map.html のように
   * HTML側で <header> を持つページも安全に呼び出せる）。
   *
   * @param {string} activeId - 現在のページID（'index'|'map'|'timeline'|'quiz'）
   * @param {{ extraHTML?: string }} [opts]
   *   extraHTML: ロゴとナビの間に挿入する追加HTML（map.htmlの検索バーなど）
   */
  function init(activeId, opts = {}) {
    // 既存ヘッダーがあればスキップ（二重注入防止）
    if (document.querySelector('.site-header')) return;

    const navLinks = LINKS.map(l => {
      const cls = l.id === activeId ? ' class="active"' : '';
      return `<a href="${l.href}"${cls}>${l.label}</a>`;
    }).join('');

    const extra = opts.extraHTML ? `<div class="header-extra">${opts.extraHTML}</div>` : '';

    const html = `
<header class="site-header" id="siteHeader">
  <a class="header-logo" href="index.html">
    <span class="header-logo__dot"></span>中国史ノート
  </a>
  ${extra}
  <nav class="header-nav">
    ${navLinks}
  </nav>
</header>`;

    document.body.insertAdjacentHTML('afterbegin', html);
  }

  return { init };
})();