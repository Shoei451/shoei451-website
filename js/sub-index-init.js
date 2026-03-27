// js/sub-index-init.js
//
// ルートの sub-index.html から呼ばれる共通エンジン。
// URL の ?slug=history のように slug を受け取り、
//   1. {slug}/list.js を動的ロード（PAGE_CONFIG + カードデータを取得）
//   2. DOM を構築
//   3. カードの link / icon パスをルート基準に補正
//   4. カードを生成
//
// list.js 側は従来通りフォルダ内相対パスで書いてよい。

(function () {
  // ── slug を URL から取得 ──────────────────────────────────
  const slug = new URLSearchParams(location.search).get("slug");
  if (!slug) {
    document.body.textContent =
      "slug パラメータが指定されていません（例: ?slug=history）";
    return;
  }

  // ── list.js をロード → PAGE_CONFIG を取得 ────────────────
  const listScript = document.createElement("script");
  listScript.src = slug + "/list.js";
  listScript.onerror = () => {
    document.body.textContent = slug + "/list.js が見つかりません。";
  };
  listScript.onload = () => {
    const cfg = window.PAGE_CONFIG;
    if (!cfg) {
      document.body.textContent =
        slug + "/list.js に PAGE_CONFIG が定義されていません。";
      return;
    }
    buildPage(cfg, slug);
  };
  document.head.appendChild(listScript);

  // ── パス補正ユーティリティ ───────────────────────────────
  function isAbsolute(s) {
    return (
      !s ||
      s.startsWith("http://") ||
      s.startsWith("https://") ||
      s.startsWith("/") ||
      s.startsWith("#") ||
      s.startsWith("mailto:")
    );
  }

  // カードの link: "worldhistory/" → "history/worldhistory/"
  function fixLink(link, slug) {
    if (isAbsolute(link)) return link;
    if (link.startsWith(slug + "/")) return link; // 二重付与防止
    return slug + "/" + link;
  }

  // カードの icon: "../images/x.svg" → "images/x.svg"
  function fixIcon(icon) {
    if (isAbsolute(icon)) return icon;
    if (icon.startsWith("../")) return icon.slice(3);
    return icon;
  }

  function fixItems(items, slug) {
    return items.map((item) =>
      Object.assign({}, item, {
        link: fixLink(item.link || "", slug),
        icon: fixIcon(item.icon || ""),
      }),
    );
  }

  // ── DOM 構築 ─────────────────────────────────────────────
  function buildPage(cfg, slug) {
    const plainH1 = cfg.h1
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    document.title = cfg.title || plainH1 + " — Shoei451";
    // list.jsの内容を読み取り、ページに注入
    const sectionsHTML = (cfg.sections || [])
      .map(
        (s, i) => `
    <div class="section-divider">
    <h2 class="section-title">${s.title}</h2>
    <p class="section-description">${s.desc || ""}</p>
    </div>
    <section class="cards-container" id="${s.id ?? `container${i + 1}`}"></section>
    `,
      )
      .join("");

    document.body.innerHTML = `
      <span class="logo-switches" id="theme-toggle-container"></span>
      <header>
        <h1>${cfg.h1}</h1>
        <p>${cfg.headerDesc || ""}</p>
      </header>
      <section class="intro">
        <a href="${cfg.backLink || "index.html"}" class="back-link">Back to Home</a>
      </section>
      ${sectionsHTML}
      <footer>
        <p>Get in touch: <a href="mailto:okamotoshoei451@gmail.com">okamotoshoei451@gmail.com</a></p>
      </footer>
    `;

    // sendBeacon
    navigator.sendBeacon(
      "/api/sw?path=" +
        encodeURIComponent(location.pathname + location.search) +
        "&ref=" +
        encodeURIComponent(document.referrer),
    );

    // ── 依存スクリプトを順次ロード → カード生成 ──────────────
    // ルート直下から参照するので js/ 固定
    const scripts = [
      "js/theme-toggle.js",
      "js/card-generator.js",
      "js/cards-page-init.js",
    ];
    let i = 0;
    function loadNext() {
      if (i >= scripts.length) {
        // 変更後
        (cfg.sections || []).forEach((s, i) => {
          const itemsVar = s.itemsVar ?? `sectionItems${i + 1}`;
          const id = s.id ?? `container${i + 1}`;
          let items;
          try {
            items = Function(
              `return (typeof ${itemsVar} !== "undefined") ? ${itemsVar} : undefined`,
            )();
          } catch (_) {
            items = undefined;
          }
          if (Array.isArray(items)) {
            generateCards(fixItems(items, slug), id);
          }
        });
        animateCardsOnScroll();
        return;
      }
      const el = document.createElement("script");
      el.src = scripts[i++];
      el.onload = loadNext;
      el.onerror = () =>
        console.error("sub-index-init.js: ロード失敗:", el.src);
      document.body.appendChild(el);
    }
    loadNext();
  }
})();
