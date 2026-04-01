// ============================================================
//  API（Netlify Functionプロキシ経由）
// ============================================================
async function apiFetch(path, extraParams = {}) {
  const params = new URLSearchParams({ path, ...extraParams });
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

// ============================================================
//  Helpers
// ============================================================
function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getFaviconUrl(url) {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;
  } catch {
    return "";
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function highlight(text, query) {
  if (!query) return escapeHtml(text);
  const safe = escapeHtml(text);
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safe.replace(new RegExp(`(${escaped})`, "gi"), "<mark>$1</mark>");
}

// ============================================================
//  Build DOM
// ============================================================
function buildLinkItem(item, index, query) {
  const a = document.createElement("a");
  a.className = "link-item";
  a.href = item.link;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.style.animationDelay = `${Math.min(index, 20) * 25}ms`;

  const domain = getDomain(item.link);
  const favicon = getFaviconUrl(item.link);
  const tags = (item.tags || []).slice(0, 5);
  const rawTitle = item.title || domain;
  const noteText = item.note
    ? escapeHtml(item.note.slice(0, 70)) + (item.note.length > 70 ? "…" : "")
    : "";

  const faviconHtml = favicon
    ? `<img class="link-favicon" src="${favicon}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'link-favicon-placeholder'}))">`
    : `<div class="link-favicon-placeholder"></div>`;

  const tagsHtml = tags.length
    ? `<div class="link-tags">${tags.map((t) => `<span class="link-tag">${escapeHtml(t)}</span>`).join("")}</div>`
    : "";

  a.innerHTML = `
      ${faviconHtml}
      <div class="link-body">
        <p class="link-title">${highlight(rawTitle, query)}</p>
        <div class="link-meta">
          <span class="link-domain">${escapeHtml(domain)}</span>
          ${noteText ? `<span class="link-note">— ${noteText}</span>` : ""}
        </div>
        ${tagsHtml}
      </div>
      <svg class="link-arrow" viewBox="0 0 24 24" stroke-width="2">
        <path d="M7 17 17 7M7 7h10v10"/>
      </svg>
    `;
  return a;
}

function buildFolder(collection, items, query) {
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

  const details = document.createElement("details");
  details.className = "folder";
  // 検索中は結果のあるフォルダだけ開く、通常は全部閉じた状態
  if (query && filtered.length > 0) details.open = true;

  const countLabel = query
    ? `${filtered.length} / ${items.length}`
    : String(items.length);

  details.innerHTML = `
      <summary>
        <svg class="folder-chevron" viewBox="0 0 24 24" stroke-width="2.5">
          <path d="m9 18 6-6-6-6"/>
        </svg>
        <span class="folder-title">${escapeHtml(collection.title)}</span>
        <span class="folder-count">${countLabel}</span>
      </summary>
    `;

  const list = document.createElement("div");
  list.className = "link-list";

  if (!filtered.length) {
    list.innerHTML = `<p class="no-results">該当するリンクがありません</p>`;
  } else {
    filtered.forEach((item, i) =>
      list.appendChild(buildLinkItem(item, i, query)),
    );
  }

  details.appendChild(list);
  return details;
}

// ============================================================
//  Skeleton
// ============================================================
function showSkeleton(count = 3) {
  document.getElementById("skeleton").innerHTML = Array.from(
    { length: count },
    () => `
      <div class="skeleton-folder">
        <div class="skeleton-header">
          <div class="sk" style="width:15px;height:15px;border-radius:3px;flex-shrink:0;"></div>
          <div class="sk" style="width:130px;height:13px;"></div>
          <div class="sk" style="width:24px;height:13px;margin-left:auto;border-radius:100px;"></div>
        </div>
      </div>
    `,
  ).join("");
}

function hideSkeleton() {
  const el = document.getElementById("skeleton");
  el.innerHTML = "";
  el.style.display = "none";
}

// ============================================================
//  Render
// ============================================================
let collectionData = []; // [{ collection, items }]

function renderFolders(query = "") {
  document.querySelectorAll(".folder").forEach((f) => f.remove());
  const list = document.getElementById("folder-list");
  collectionData.forEach(({ collection, items }) => {
    list.appendChild(buildFolder(collection, items, query));
  });
}

// ============================================================
//  Init
// ============================================================
async function init() {
  showSkeleton();

  // Search (debounced)
  let timer;
  document.getElementById("search-input").addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => renderFolders(e.target.value.trim()), 280);
  });

  try {
    let collections = await fetchCollections();

    // ホワイトリストフィルタ
    if (CONFIG.ALLOWED_COLLECTIONS.length > 0) {
      collections = collections.filter((c) =>
        CONFIG.ALLOWED_COLLECTIONS.includes(c._id),
      );
    }

    if (!collections.length) {
      hideSkeleton();
      document.getElementById("state-error").style.display = "";
      document.getElementById("error-msg").textContent =
        "表示するコレクションが見つかりません。ALLOWED_COLLECTIONS を確認してください。";
      return;
    }

    // 各コレクションのブックマークを並列取得
    const results = await Promise.all(
      collections.map(async (col) => ({
        collection: col,
        items: await fetchRaindrops(col._id),
      })),
    );

    collectionData = results;
    hideSkeleton();
    renderFolders();
  } catch (err) {
    hideSkeleton();
    document.getElementById("state-error").style.display = "";
    document.getElementById("error-msg").textContent =
      `データの取得に失敗しました（${err.message}）`;
    console.error(err);
  }
}

init();
