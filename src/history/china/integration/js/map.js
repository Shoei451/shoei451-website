// ─────────────────────────────────────
//  状態
// ─────────────────────────────────────
const state = {
  selectedSlug: null, // サイドパネルで選択中の王朝 slug
  expandedSlug: null, // 帯タイムラインが開いている王朝 slug
};

// ─────────────────────────────────────
//  ユーティリティ
// ─────────────────────────────────────
function esc(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function splitLabelHtml(text) {
  return Array.from(String(text))
    .map((ch) => `<span class="seg-char">${esc(ch)}</span>`)
    .join("");
}

const CHEVRON_SVG = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M4 6l4 4 4-4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

// ─────────────────────────────────────
//  帯タイムラインのレンダリング
// ─────────────────────────────────────

// ─────────────────────────────────────
//  帯タイムライン HTML 生成
// ─────────────────────────────────────
function buildTimelineHtml(d) {
  const tl = d.timeline;
  const allTracks = tl.groups.flatMap((g) => g.tracks);
  const minYear = Math.min(...allTracks.map((t) => t.start));
  const maxYear = Math.max(...allTracks.map((t) => t.end));
  const span = maxYear - minYear || 1;

  const pct = (y) => (((y - minYear) / span) * 100).toFixed(2);
  const width = (s, e) => (((e - s) / span) * 100).toFixed(2);

  // 軸ティック（5本程度、きりのよい数字）
  const rawStep = span / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step = Math.ceil(rawStep / magnitude) * magnitude;
  const ticks = [];
  for (let y = Math.ceil(minYear / step) * step; y <= maxYear; y += step)
    ticks.push(y);
  if (!ticks.includes(minYear)) ticks.unshift(minYear);
  if (!ticks.includes(maxYear)) ticks.push(maxYear);

  const axisHtml = `
        <div class="tl-axis" style="grid-template-columns:${ticks
          .map((y, i) => (i === 0 ? "0fr" : `${pct(y) - pct(ticks[i - 1])}fr`))
          .join(" ")}">
          ${ticks.map((y) => `<div class="tl-axis-tick">${y < 0 ? "前" + Math.abs(y) : y}</div>`).join("")}
        </div>`;

  const groupsHtml = tl.groups
    .map((g) => {
      const labelHtml = g.label
        ? `<div class="tl-group-label">${esc(g.label)}</div>`
        : "";
      const rowsHtml = g.tracks
        .map((t) => {
          const l = pct(t.start);
          const w = width(t.start, t.end);
          const showLabel = parseFloat(w) >= 6;
          const yearRange = `${t.start < 0 ? "前" + Math.abs(t.start) : t.start}–${t.end < 0 ? "前" + Math.abs(t.end) : t.end}`;
          return `<div class="tl-row">
            <div style="position:relative;width:100%;height:28px;">
              <div class="tl-bar"
                   style="position:absolute;left:${l}%;width:${w}%;background:${esc(t.color)};"
                   title="${esc(t.name)} (${yearRange})">
                ${showLabel ? `<span class="tl-bar-label">${esc(t.name)}</span>` : ""}
              </div>
            </div>
          </div>`;
        })
        .join("");
      return `<div class="tl-group">${labelHtml}<div class="tl-grid">${rowsHtml}</div></div>`;
    })
    .join("");

  return `
        <div class="tl-overlay-header">
          <span class="tl-overlay-title">${esc(d.name)} —  Timeline</span>
          <button class="tl-overlay-close" id="tlClose" aria-label="閉じる">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M4 4l8 8M12 4l-8 8" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        ${groupsHtml}
        ${axisHtml}`;
}

// ─────────────────────────────────────
//  オーバーレイの表示位置を計算して開く
// ─────────────────────────────────────
const tlOverlay = document.getElementById("tlOverlay");

function openOverlay(slug, anchorEl) {
  const d = DYNASTY_MAP[slug];
  if (!d?.timeline) return;

  state.expandedSlug = slug;

  // 中身を描画
  tlOverlay.innerHTML = buildTimelineHtml(d);
  tlOverlay.className = "tl-overlay open";

  // 閉じるボタン
  tlOverlay.querySelector("#tlClose").addEventListener("click", closeOverlay);

  // アンカーノードの座標を取得してオーバーレイを配置
  positionOverlay(anchorEl);

  // 外側クリックで閉じる（次フレームで登録して即発火を防ぐ）
  requestAnimationFrame(() => {
    document.addEventListener("click", onOutsideClick, { once: true });
  });
}

function positionOverlay(anchorEl) {
  const rect = anchorEl.getBoundingClientRect();
  const ovW = tlOverlay.offsetWidth || 380;
  const ovH = tlOverlay.offsetHeight || 200;
  const margin = 12;
  const viewH = window.innerHeight;
  const viewW = window.innerWidth;

  // 三角の左端を anchor の中央に合わせる
  let left = rect.left + rect.width / 2 - 32;
  left = Math.max(margin, Math.min(left, viewW - ovW - margin));

  // デフォルトはノードの下
  const spaceBelow = viewH - rect.bottom - margin;
  const spaceAbove = rect.top - margin;
  const showAbove = spaceBelow < ovH && spaceAbove > spaceBelow;

  let top;
  if (showAbove) {
    top = rect.top - ovH - margin;
    tlOverlay.classList.add("above");
  } else {
    top = rect.bottom + margin;
    tlOverlay.classList.remove("above");
  }

  tlOverlay.style.left = `${left}px`;
  tlOverlay.style.top = `${top}px`;

  // 三角の水平位置を anchor 中央に合わせる（::before/::after の left を更新）
  const arrowLeft = Math.round(rect.left + rect.width / 2 - left - 8);
  tlOverlay.style.setProperty("--arrow-left", `${arrowLeft}px`);
}

function closeOverlay() {
  state.expandedSlug = null;
  tlOverlay.classList.remove("open");
  // ▼ボタンのスタイルをリセット
  document.querySelectorAll(".expand-btn.open").forEach((b) => {
    b.classList.remove("open");
    b.setAttribute("aria-expanded", "false");
  });
}

function onOutsideClick(e) {
  if (!tlOverlay.contains(e.target) && !e.target.closest(".expand-btn")) {
    closeOverlay();
  }
}

// ─────────────────────────────────────
//  キャンバス描画
// ─────────────────────────────────────
function renderCanvas() {
  const canvas = document.getElementById("canvas");

  canvas.innerHTML = DYNASTIES.map((d) => {
    const selected = state.selectedSlug === d.slug;
    const multi = d.territories && d.territories.length > 1;
    const manyClass = multi && d.territories.length >= 5 ? "multi-many" : "";
    const nodeClass = [
      selected ? "highlight" : "",
      multi ? "multi" : "",
      manyClass,
    ]
      .filter(Boolean)
      .join(" ");

    const body = multi
      ? `<div class="split-wrap">
               <div class="segments">${d.territories
                 .map(
                   (t) => `<div class="seg" style="flex:${t.ratio} 1 0"></div>`,
                 )
                 .join("")}</div>
               <div class="seg-labels">${d.territories
                 .map(
                   (t) =>
                     `<span class="seg-label" style="flex:${t.ratio} 1 0">
                     <span class="seg-label-text">${splitLabelHtml(t.name)}</span>
                   </span>`,
                 )
                 .join("")}</div>
             </div>`
      : `<span>${esc(d.name)}</span>`;

    const expandBtn = d.timeline
      ? `<button class="expand-btn" data-slug="${d.slug}"
                     aria-label="Open timeline" aria-expanded="false">
               ${CHEVRON_SVG}
             </button>`
      : "";

    return `
          <div class="node ${nodeClass}" data-slug="${d.slug}">
            <button class="circle dynasty-btn" type="button"
                    aria-label="${esc(d.name)} ${esc(formatPeriod(d))}">
              ${body}
            </button>
            <div class="period">${esc(formatPeriod(d))}</div>
            ${expandBtn}
          </div>`;
  }).join("");

  // 円クリック → サイドパネル
  canvas.querySelectorAll(".dynasty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slug = btn.closest(".node").dataset.slug;
      state.selectedSlug = state.selectedSlug === slug ? null : slug;
      renderDetail();
      canvas.querySelectorAll(".node").forEach((n) => {
        n.classList.toggle("highlight", n.dataset.slug === state.selectedSlug);
      });
    });
  });

  // ▼ボタンクリック → オーバーレイ
  canvas.querySelectorAll(".expand-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const slug = btn.dataset.slug;
      const isOpen = state.expandedSlug === slug;

      if (isOpen) {
        closeOverlay();
      } else {
        // 既存を閉じてから開く
        closeOverlay();
        btn.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        openOverlay(slug, btn.closest(".node"));
      }
    });
  });
}

// ─────────────────────────────────────
//  サイドパネル描画
// ─────────────────────────────────────
function listHtml(items) {
  return `<ul>${items.map((v) => `<li>${esc(v)}</li>`).join("")}</ul>`;
}

function renderDetail() {
  const panel = document.getElementById("rightPanel");
  const root = document.getElementById("detail");
  const overlay = document.getElementById("mobileOverlay");
  const isMobile = window.matchMedia("(max-width: 960px)").matches;
  const d = DYNASTY_MAP[state.selectedSlug];

  if (!d) {
    if (isMobile) {
      panel.classList.remove("open");
      overlay.classList.remove("open");
    } else {
      panel.classList.add("open");
    }
    document.body.classList.remove("lock-scroll");
    root.innerHTML = `<div class="empty-detail">王朝をクリックすると詳細情報を表示します。</div>`;
    return;
  }

  panel.classList.add("open");
  if (isMobile) {
    overlay.classList.add("open");
    document.body.classList.add("lock-scroll");
  } else {
    overlay.classList.remove("open");
    document.body.classList.remove("lock-scroll");
  }

  const detailHref = `dynasty.html?slug=${d.slug}`;

  root.innerHTML = `
        <button class="close" id="closeBtn">← 閉じる</button>
        <h2>${esc(d.name)}</h2>
        <div class="period-label">${esc(formatPeriod(d))}</div>
        <div class="detail-actions">
          <a class="link-btn prominent" href="${detailHref}">まとめノートを開く</a>
        </div>
        <div class="card">
          <h4>都城</h4>
          <div style="font-size:14px;color:var(--title);">${esc(d.capital || "-")}</div>
        </div>
        ${d.systems?.length ? `<div class="card"><h4>制度</h4>${listHtml(d.systems)}</div>` : ""}
        ${
          d.figures?.length
            ? `<div class="card"><h4>主要人物</h4>
          <div class="chips">${d.figures.map((f) => `<span class="chip">${esc(f)}</span>`).join("")}</div>
          </div>`
            : ""
        }
        ${
          d.culture
            ? `<div class="card"><h4>文化</h4>
          <div style="font-size:14px;line-height:1.6;color:var(--title);">${esc(d.culture)}</div>
          </div>`
            : ""
        }
        ${d.notes ? `<div class="note">${esc(d.notes)}</div>` : ""}
      `;

  document.getElementById("closeBtn").addEventListener("click", () => {
    state.selectedSlug = null;
    renderDetail();
    document
      .querySelectorAll(".node")
      .forEach((n) => n.classList.remove("highlight"));
  });
}

// ─────────────────────────────────────
//  イベント
// ─────────────────────────────────────
document.getElementById("mobileOverlay").addEventListener("click", () => {
  state.selectedSlug = null;
  renderDetail();
  document
    .querySelectorAll(".node")
    .forEach((n) => n.classList.remove("highlight"));
});

window.addEventListener("resize", () => {
  if (!state.selectedSlug) {
    renderDetail();
    return;
  }
  const overlay = document.getElementById("mobileOverlay");
  if (!window.matchMedia("(max-width: 960px)").matches) {
    overlay.classList.remove("open");
    document.body.classList.remove("lock-scroll");
  } else {
    overlay.classList.add("open");
    document.body.classList.add("lock-scroll");
  }
});

// ─────────────────────────────────────
//  初期化
// ─────────────────────────────────────
renderCanvas();
renderDetail();
// ─────────────────────────────────────
//  検索（logics/map.js の末尾に追記するブロック）
//  renderCanvas(); renderDetail(); の直後に置く
// ─────────────────────────────────────

// SearchEngine インデックスをページロード時に即時構築
SearchEngine.buildIndex();

let _searchTimer = null;
let _searchActive = false; // 検索モード中フラグ

// input イベントから呼ばれる（map.html の oninput 属性）
function handleSearch(val) {
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(() => _execSearch(val), 120);
}

function _execSearch(val) {
  const q = val.trim();
  // クリアボタンの表示切替
  document.getElementById("searchClear").classList.toggle("show", q.length > 0);

  if (!q) {
    // ─── 検索解除 ───
    _searchActive = false;
    // dimming を全解除
    document
      .querySelectorAll(".node")
      .forEach((n) => n.classList.remove("dimmed"));
    // サイドパネルを通常状態に戻す
    if (!state.selectedSlug) renderDetail();
    return;
  }

  _searchActive = true;
  const results = SearchEngine.search(q);
  const hitSlugs = new Set(results.map((r) => r.slug));

  // ─── ノードの dimming ───
  document.querySelectorAll(".node").forEach((n) => {
    n.classList.toggle("dimmed", !hitSlugs.has(n.dataset.slug));
  });

  // ─── サイドパネルに結果一覧 ───
  _renderSearchResults(q, results);
}

function _renderSearchResults(q, results) {
  const root = document.getElementById("detail");

  // rightPanel を開く
  const panel = document.getElementById("rightPanel");
  panel.classList.add("open");

  if (!results.length) {
    root.innerHTML = `<div class="empty-detail">「${_esc(q)}」に一致する王朝が見つかりませんでした</div>`;
    return;
  }

  const rows = results
    .map(
      ({ dynasty: d, matches }) => `
    <div class="search-result-item" onclick="_selectFromSearch('${d.slug}')">
      <div class="sri-circle">${_esc(d.name.slice(0, 2))}</div>
      <div class="sri-info">
        <div class="sri-name">${SearchEngine.highlight(_esc(d.name), q)}</div>
        <div class="sri-period">${_esc(formatPeriod(d))}</div>
        ${matches
          .map(
            (m) =>
              `<div class="sri-match">${SearchEngine.highlight(_esc(m), q)}</div>`,
          )
          .join("")}
      </div>
    </div>`,
    )
    .join("");

  root.innerHTML = `
    <p class="search-result-count">${results.length} 件ヒット</p>
    <div class="search-results">${rows}</div>`;
}

// 検索結果の王朝をクリック → 選択状態にしてから検索をクリア
function _selectFromSearch(slug) {
  clearSearch();
  state.selectedSlug = slug;
  renderDetail();
  document.querySelectorAll(".node").forEach((n) => {
    n.classList.toggle("highlight", n.dataset.slug === slug);
  });
}

function clearSearch() {
  const inp = document.getElementById("searchInput");
  if (inp) inp.value = "";
  _execSearch("");
}

// esc はすでに logics/map.js 内で定義済みのため _esc としてラップ
function _esc(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// ─── キーボードショートカット ───
document.addEventListener("keydown", (e) => {
  // ⌘K / Ctrl+K でサーチフォーカス
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    document.getElementById("searchInput")?.focus();
    return;
  }
  // Escape
  if (e.key === "Escape") {
    if (_searchActive) {
      clearSearch();
    } else if (state.selectedSlug) {
      state.selectedSlug = null;
      renderDetail();
      document
        .querySelectorAll(".node")
        .forEach((n) => n.classList.remove("highlight"));
    }
  }
});
