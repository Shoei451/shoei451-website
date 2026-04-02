// ── API helpers ───────────────────────────────────────────
async function apiFetch(path, extra = {}) {
  const params = new URLSearchParams({ path, ...extra });
  const res = await fetch(`/.netlify/functions/raindrop?${params}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function fetchCollections() {
  const data = await apiFetch("/collections");
  return data.items || [];
}

async function fetchRaindrops(collectionId) {
  const data = await apiFetch(`/raindrops/${collectionId}`, {
    perpage: CONFIG.PER_PAGE,
  });
  return data.items || [];
}

// ── URL helpers ───────────────────────────────────────────
function getSlug() {
  return new URLSearchParams(location.search).get("slug");
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getFaviconUrl(url) {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
  } catch {
    return "";
  }
}

// ── HTML helpers ──────────────────────────────────────────
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function highlight(text, query) {
  if (!query) return esc(text);
  const safe = esc(text);
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safe.replace(
    new RegExp(`(${escaped})`, "gi"),
    '<mark class="ll-mark">$1</mark>',
  );
}

// ── Render: index (collection list) ──────────────────────
function renderIndex(collections) {
  // header
  document.getElementById("ll-header").innerHTML = `
          <div class="page-header">
            <a href="/index.html" class="back-link" style="margin-bottom:0.5rem;">
              <i class="bi bi-chevron-left"></i> ホーム
            </a>
            <h1 class="page-header__title">Links for Learning</h1>
            <p class="page-header__desc">コレクションを選んでリンク一覧を表示。</p>
          </div>
        `;

  if (!collections.length) {
    document.getElementById("ll-content").innerHTML = `
            <div class="ll-no-results">
              表示できるコレクションがありません。<code>config.js</code> の
              <code>ALLOWED_COLLECTIONS</code> を確認してください。
            </div>`;
    return;
  }

  // section header + grid
  const cardsHTML = collections
    .map(
      (col) => `
          <button
            class="index-card"
            onclick="navigateTo(${col._id})"
          >
            <div class="index-card__title">${esc(col.title)}</div>
            <div class="index-card__desc">${col.count ?? "?"} items</div>
          </button>
        `,
    )
    .join("");

  document.getElementById("ll-content").innerHTML = `
          <div class="index-section-header" style="margin-top:0;">
            <h2 class="index-section-header__title">コレクション</h2>
          </div>
          <div class="index-card-grid" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));">
            ${cardsHTML}
          </div>
        `;
}

// ── Render: collection detail ─────────────────────────────
function renderCollection(collection, items) {
  document.title = `${collection.title} — Links for Learning`;

  document.getElementById("ll-header").innerHTML = `
          <div class="page-header" style="padding-bottom:0.75rem;">
            <button class="ll-back" style="margin-bottom:0.5rem;" onclick="navigateTo(null)">
              <i class="bi bi-chevron-left"></i> コレクション一覧
            </button>
            <h1 class="page-header__title">${esc(collection.title)}</h1>
            <p class="page-header__desc" style="font-size:0.82rem;">${items.length} items</p>
          </div>
        `;

  const content = document.getElementById("ll-content");

  // search bar
  content.innerHTML = `
          <div class="d-flex align-items-center gap-3 flex-wrap mb-3">
            <div class="ll-search-wrap flex-1 min-w-0">
              <svg viewBox="0 0 24 24" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="search"
                id="ll-search"
                placeholder="${esc(collection.title)} 内を検索…"
                autocomplete="off"
                aria-label="リンク検索"
              />
            </div>
          </div>
          <div id="ll-grid" class="card-grid--2"></div>
          <div id="ll-empty" class="ll-no-results" style="display:none;">
            該当するリンクがありません。
          </div>
        `;

  // debounced search
  let timer;
  document.getElementById("ll-search").addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => renderLinks(items, e.target.value.trim()), 220);
  });

  renderLinks(items, "");
}

function renderLinks(items, query) {
  const q = query.toLowerCase();
  const filtered = q
    ? items.filter(
        (item) =>
          (item.title || "").toLowerCase().includes(q) ||
          (item.note || "").toLowerCase().includes(q) ||
          (item.tags || []).some((t) => t.toLowerCase().includes(q)) ||
          getDomain(item.link).toLowerCase().includes(q),
      )
    : items;

  const grid = document.getElementById("ll-grid");
  const empty = document.getElementById("ll-empty");

  if (!filtered.length) {
    grid.innerHTML = "";
    empty.style.display = "";
    return;
  }

  empty.style.display = "none";

  grid.innerHTML = filtered
    .map((item) => {
      const domain = getDomain(item.link);
      const favicon = getFaviconUrl(item.link);
      const tags = (item.tags || []).slice(0, 6);
      const note = item.note
        ? item.note.slice(0, 120) + (item.note.length > 120 ? "…" : "")
        : "";

      const thumbHTML = favicon
        ? `<img
                  class="link-card__thumb"
                  src="${esc(favicon)}"
                  alt=""
                  loading="lazy"
                  onerror="this.replaceWith(makePlaceholder())"
                >`
        : makePlaceholderHTML();

      const tagsHTML = tags.length
        ? `<div class="link-card__tags">
                  ${tags.map((t) => `<span class="link-card__tag">${highlight(t, query)}</span>`).join("")}
                </div>`
        : "";

      const noteHTML = note
        ? `<div class="link-card__note">${highlight(note, query)}</div>`
        : "";

      return `
              <a
                href="${esc(item.link)}"
                class="link-card"
                target="_blank"
                rel="noopener noreferrer"
              >
                ${thumbHTML}
                <div class="link-card__body">
                  <div class="link-card__title">${highlight(item.title || domain, query)}</div>
                  <span class="link-card__url">${esc(domain)}</span>
                  ${noteHTML}
                  ${tagsHTML}
                </div>
              </a>
            `;
    })
    .join("");
}

function makePlaceholderHTML() {
  return `<div class="link-card__thumb-placeholder">
          <i class="bi bi-link-45deg"></i>
        </div>`;
}

// used in onerror (called from inline attr — returns DOM node)
window.makePlaceholder = function () {
  const d = document.createElement("div");
  d.className = "link-card__thumb-placeholder";
  d.innerHTML = '<i class="bi bi-link-45deg"></i>';
  return d;
};

// ── Navigation ────────────────────────────────────────────
function navigateTo(collectionId) {
  const url = collectionId
    ? `${location.pathname}?slug=${collectionId}`
    : location.pathname;
  history.pushState({}, "", url);
  boot();
}

window.addEventListener("popstate", boot);

// ── Boot ─────────────────────────────────────────────────
let _collectionsCache = null;

async function boot() {
  const slug = getSlug();
  const content = document.getElementById("ll-content");

  // skeleton
  content.innerHTML = `
          <div class="ll-skeleton">
            <div class="ll-skel-item"></div>
            <div class="ll-skel-item"></div>
            <div class="ll-skel-item"></div>
            <div class="ll-skel-item"></div>
          </div>`;

  try {
    // fetch & cache collection list
    if (!_collectionsCache) {
      let cols = await fetchCollections();
      if (CONFIG.ALLOWED_COLLECTIONS.length > 0) {
        cols = cols.filter((c) => CONFIG.ALLOWED_COLLECTIONS.includes(c._id));
      }
      _collectionsCache = cols;
    }

    if (!slug) {
      renderIndex(_collectionsCache);
      return;
    }

    // collection detail
    const colId = parseInt(slug, 10);
    const collection = _collectionsCache.find((c) => c._id === colId) || {
      title: "Collection",
      _id: colId,
    };
    const items = await fetchRaindrops(colId);
    renderCollection(collection, items);
  } catch (err) {
    content.innerHTML = `
            <div class="ll-state">
              ⚠️ データの取得に失敗しました: ${esc(err.message)}
            </div>`;
    console.error(err);
  }
}

boot();
