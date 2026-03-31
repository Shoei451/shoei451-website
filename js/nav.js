// ============================================================
// js/nav.js
//
// サイト共通ナビバーとフッターを inject する。
// theme-toggle.js より先に実行すること。
//
// 使い方（各HTMLのbody先頭に配置）:
//   <div id="nav-container"></div>
//   ...コンテンツ...
//   <footer id="site-footer"></footer>
//
//   <!-- body閉じタグ直前 -->
//   <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
//   <script src="/js/nav.js"></script>
//   <script src="/js/theme-toggle.js"></script>
// ============================================================

(function () {
  // ── ナビバー HTML ────────────────────────────────────────
  const NAV_HTML = `
    <nav class="navbar navbar-expand-md sticky-top" id="site-nav">
      <div class="container">

        <a class="navbar-brand" href="/index.html">Shoei451</a>

        <button class="navbar-toggler border-0" type="button"
                data-bs-toggle="collapse" data-bs-target="#navMenu"
                aria-controls="navMenu" aria-expanded="false"
                aria-label="メニューを開く">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav me-auto mb-2 mb-md-0">
            <li class="nav-item">
              <a class="nav-link" href="/sub-index.html?slug=history">歴史</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/sub-index.html?slug=geography">地理</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/sub-index.html?slug=seikei">政治・経済</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/sub-index.html?slug=miscellaneous">その他</a>
            </li>
          </ul>

          <div class="d-flex align-items-center gap-2">
            <a class="nav-link" href="/about.html"
               style="font-size:0.85rem; padding:0.3rem 0.5rem;">About</a>
            <div id="theme-toggle-container" class="logo-switches"></div>
          </div>
        </div>

      </div>
    </nav>
  `;

  // ── フッター HTML ─────────────────────────────────────────
  const FOOTER_HTML = `
    <footer class="site-footer py-4 mt-auto">
      <div class="container">
        <div class="row align-items-center g-2">
          <div class="col-md-8">
            <span class="text-secondary" style="font-size:0.85rem;">
              © 2026 Shoei Okamoto &nbsp;·&nbsp;
              <a href="/privacy-policy.html">プライバシーポリシー</a> &nbsp;·&nbsp;
              <a href="/about.html">About</a> &nbsp;·&nbsp;
              <a href="/sitemap.html">サイトマップ</a>
            </span>
          </div>
          <div class="col-md-4 text-md-end">
            <a href="mailto:okamotoshoei451@gmail.com"
               style="font-size:0.85rem; color:var(--color-text-secondary);">
              okamotoshoei451@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  `;

  // ── ナビバー inject ───────────────────────────────────────
  const navContainer = document.getElementById("nav-container");
  if (navContainer) {
    navContainer.innerHTML = NAV_HTML;
    _setActiveLink();
  }

  // ── フッター inject ───────────────────────────────────────
  const footerEl = document.getElementById("site-footer");
  if (footerEl) {
    footerEl.innerHTML = FOOTER_HTML;
    // <footer> が site-footer クラスを持つよう付与
    footerEl.classList.add("site-footer");
  }

  // ── アクティブリンクの自動検出 ────────────────────────────
  function _setActiveLink() {
    const path = location.pathname + location.search;

    document.querySelectorAll("#site-nav .nav-link").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href === "/index.html") return;

      // slug パラメータを持つリンクは search も含めて比較
      if (href.includes("?slug=")) {
        if (path.includes(href)) link.classList.add("active");
        return;
      }

      // 通常パス：パスが前方一致
      if (path.startsWith(href)) link.classList.add("active");
    });

    // トップページ
    if (path === "/" || path === "/index.html") {
      const brand = document.querySelector("#site-nav .navbar-brand");
      if (brand) brand.style.color = "var(--color-accent-text)";
    }
  }
})();
