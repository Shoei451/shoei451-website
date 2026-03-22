// js/sub-index-init.js
// 使い方: 各サブフォルダの index.html で window.PAGE_CONFIG を定義してから
//         <script src="../js/sub-index-init.js"></script> で読み込む
//
// PAGE_CONFIG の形式:
// {
//   title:      "<title> タグに使う文字列（省略時は h1 から生成）",
//   h1:         "ヘッダーの大見出し（絵文字可）",
//   headerDesc: "ヘッダーの説明文",
//   backLink:   "Back to Home の href（省略時: '../'）",
//   sections: [
//     { title: "セクション見出し", desc: "説明文", itemsVar: "sectionItems1", id: "c1" },
//     ...
//   ]
// }

(function () {
  const cfg = window.PAGE_CONFIG;
  if (!cfg) {
    console.error('sub-index-init.js: window.PAGE_CONFIG が未定義です');
    return;
  }

  // ── <title> ─────────────────────────────────────────────
  const plainH1 = cfg.h1.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  document.title = cfg.title || (plainH1 + ' — Shoei451');

  // ── セクション HTML ──────────────────────────────────────
  const sectionsHTML = (cfg.sections || []).map(s => `
    <div class="section-divider">
      <h2 class="section-title">${s.title}</h2>
      <p class="section-description">${s.desc || ''}</p>
    </div>
    <section class="cards-container" id="${s.id}"></section>
  `).join('');

  // ── body を構築 ──────────────────────────────────────────
  document.body.innerHTML = `
    <span class="logo-switches" id="theme-toggle-container"></span>

    <header>
      <h1>${cfg.h1}</h1>
      <p>${cfg.headerDesc || ''}</p>
    </header>

    <section class="intro">
      <a href="${cfg.backLink || '../'}" class="back-link">Back to Home</a>
    </section>

    ${sectionsHTML}

    <footer>
      <p>Get in touch: <a href="mailto:okamotoshoei451@gmail.com">okamotoshoei451@gmail.com</a></p>
    </footer>
  `;

  // ── sendBeacon（build.js の代わりにここで送信） ──────────
  navigator.sendBeacon(
    '/api/sw?path=' + encodeURIComponent(location.pathname) +
    '&ref='         + encodeURIComponent(document.referrer)
  );

  // ── 依存スクリプトを順次ロード → カード初期化 ────────────
  // すべてのサブフォルダは depth=1 なので ../js/ 固定
  const scripts = [
    '../js/theme-toggle.js',
    '../js/card-generator.js',
    '../js/cards-page-init.js',
  ];

  // DOMContentLoaded はこの時点で発火済みなので initCardsPage() は使わず
  // generateCards / animateCardsOnScroll を直接呼ぶ。
  let i = 0;
  function loadNext() {
    if (i >= scripts.length) {
      (cfg.sections || []).forEach(s => {
        let items;
        try {
          items = Function(`return (typeof ${s.itemsVar} !== "undefined") ? ${s.itemsVar} : undefined`)();
        } catch (_) {
          items = undefined;
        }
        if (Array.isArray(items)) {
          generateCards(items, s.id);
        }
      });
      animateCardsOnScroll();
      return;
    }
    const el = document.createElement('script');
    el.src = scripts[i++];
    el.onload = loadNext;
    el.onerror = () => console.error('sub-index-init.js: ロード失敗:', el.src);
    document.body.appendChild(el);
  }
  loadNext();
})();