// ─── STATE ───
let allEvents = [];
let currentCat = "all";
let currentQuery = "";

// ─── UTILS ───
function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function yearStr(year) {
  return year < 0 ? `前${Math.abs(year)}` : String(year);
}

// イベントの year からどの dynasty slug か判定
function slugForYear(year) {
  // DYNASTIES は time-ascending で定義されているので find で先勝ち
  const d = DYNASTIES.find((d) => year >= d.start && year <= d.end);
  return d ? d.slug : null;
}

// ─── FILTER ───
function filtered() {
  return allEvents.filter((ev) => {
    const catOk = currentCat === "all" || ev.category === currentCat;
    if (!catOk) return false;
    if (!currentQuery) return true;
    const q = currentQuery.toLowerCase();
    return (
      (ev.title ?? "").toLowerCase().includes(q) ||
      (ev.description ?? "").toLowerCase().includes(q)
    );
  });
}

// ─── RENDER ───
function render() {
  const events = filtered();
  const container = document.getElementById("tlContainer");
  document.getElementById("resultCount").textContent = `${events.length} 件`;

  if (events.length === 0) {
    container.innerHTML =
      '<div class="empty-state">条件に一致するイベントがありません。</div>';
    return;
  }

  // 王朝グループに振り分け
  // グループ順は DYNASTIES の定義順を維持
  const groups = new Map(); // slug → { dynasty, events[] }
  DYNASTIES.forEach((d) => groups.set(d.slug, { dynasty: d, events: [] }));
  const ungrouped = [];

  events.forEach((ev) => {
    const slug = slugForYear(ev.year);
    if (slug && groups.has(slug)) {
      groups.get(slug).events.push(ev);
    } else {
      ungrouped.push(ev);
    }
  });

  let html = "";
  groups.forEach(({ dynasty: d, events: evs }) => {
    if (!evs.length) return;
    html += renderGroup(d, evs);
  });
  if (ungrouped.length) {
    html += renderUngrouped(ungrouped);
  }

  container.innerHTML = html;
  updateCount(events.length);

  // グループ折りたたみ
  container.querySelectorAll(".dynasty-group__header").forEach((header) => {
    header.addEventListener("click", () => {
      header.closest(".dynasty-group").classList.toggle("collapsed");
    });
  });
}

function renderGroup(d, evs) {
  const periodStr = formatPeriod(d);
  const evRows = evs.map((ev) => renderItem(ev)).join("");
  return `
      <div class="dynasty-group" data-slug="${d.slug}">
        <div class="dynasty-group__header">
          <div class="dynasty-group__bar" style="background:${d.color}"></div>
          <span class="dynasty-group__name">${escHtml(d.name)}</span>
          <span class="dynasty-group__period">${escHtml(periodStr)}</span>
          <span class="dynasty-group__count">${evs.length}</span>
          <span class="dynasty-group__chevron">${SVG.chevron}</span>
        </div>
        <div class="dynasty-group__events">${evRows}</div>
      </div>`;
}

function renderUngrouped(evs) {
  return `
      <div class="dynasty-group" data-slug="other">
        <div class="dynasty-group__header">
          <div class="dynasty-group__bar" style="background:#aaa"></div>
          <span class="dynasty-group__name">その他</span>
          <span class="dynasty-group__count">${evs.length}</span>
          <span class="dynasty-group__chevron">▼</span>
        </div>
        <div class="dynasty-group__events">
          ${evs.map((ev) => renderItem(ev)).join("")}
        </div>
      </div>`;
}

function renderItem(ev) {
  const slug = slugForYear(ev.year);
  const href = slug ? `dynasty.html?slug=${slug}` : null;
  const tag = href ? "a" : "div";
  const linkAttr = href ? `href="${href}"` : "";
  const icon = CATEGORY_ICON[ev.category] ?? "•";
  const cat = ev.category ?? "その他";

  // 検索クエリのハイライト
  let title = escHtml(ev.title ?? "");
  if (currentQuery) {
    const re = new RegExp(`(${escRe(currentQuery)})`, "gi");
    title = title.replace(
      re,
      '<mark style="background:var(--color-accent-light);color:var(--color-accent)">$1</mark>',
    );
  }

  return `
      <${tag} class="tl-item" ${linkAttr}>
        <span class="tl-year">${escHtml(yearStr(ev.year))}年</span>
        <span class="tl-icon">${icon}</span>
        <span class="tl-title">${title}</span>
        <span class="tl-cat" data-cat="${escHtml(cat)}">${escHtml(cat)}</span>
      </${tag}>`;
}

function escRe(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function updateCount(n) {
  document.getElementById("resultCount").textContent = `${n} 件`;
}

// ─── CONTROLS ───
function setCategory(cat) {
  currentCat = cat;
  document.querySelectorAll(".pill-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.cat === cat);
  });
  render();
}

let searchTimer = null;
function handleSearch(val) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentQuery = val.trim();
    render();
  }, 150);
}

// ─── FETCH ───
// 変更後
function init() {
  allEvents = EVENTS;
  document.getElementById("pageSubtitle").textContent =
    `全 ${allEvents.length} 件・前1600年〜1912年`;
  render();
}
init();
