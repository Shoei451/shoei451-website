// ── Supabase クライアント（timeline.html 専用）────────────────
// 共通設定はルートの /js/supabase_config.js から読み込む。

import { db } from "/js/supabase_config.js";

window._db = db;

// _db がセットされてから slug ロードを開始する
// （module は defer 相当なので DOMContentLoaded 後に実行される）
const slug = new URLSearchParams(location.search).get("slug");
if (slug) {
  import(`./config/${slug}.js`)
    .then((module) => initTimeline(module.default))
    .catch(() => {
      document.getElementById("state-msg").textContent =
        "config/" + slug + ".js が見つかりません。";
    });
}

// ── メインロジック ─────────────────────────────────────────
async function initTimeline(cfg) {
  if (!cfg) {
    document.getElementById("state-msg").textContent =
      "TIMELINE_CONFIG が定義されていません。";
    return;
  }

  // ページ情報を適用
  document.title = cfg.title + " — Shoei451";
  document.getElementById("header-title").textContent = cfg.title;
  document.getElementById("back-link").href = cfg.backLink || "index.html";
  document.getElementById("back-label").textContent = cfg.backLabel || "ホーム";

  // timeline 固有のアクセントカラーを適用
  // base.css の --color-accent（ゴールド）とは独立した --timeline-accent を上書きする
  if (cfg.accentColor) {
    document.documentElement.style.setProperty(
      "--timeline-accent",
      cfg.accentColor,
    );
  }
  if (cfg.accentColorRgb) {
    document.documentElement.style.setProperty(
      "--timeline-accent-rgb",
      cfg.accentColorRgb,
    );
  }

  // テーブルヘッダ
  const head = document.getElementById("table-head");
  head.innerHTML = `
          <th style="width:110px;">年代</th>
          <th>出来事</th>
          <th style="width:120px;">カテゴリ</th>
          <th class="col-desc">説明</th>
          ${cfg.showWikiLink ? '<th style="width:60px;">Wiki</th>' : ""}
        `;

  // データ取得
  let data = [];
  try {
    data = await cfg.fetchData();
  } catch (e) {
    document.getElementById("state-msg").textContent =
      "データの読み込みに失敗しました: " + e.message;
    return;
  }

  // タブ生成
  buildTabs(cfg, data);

  // 初期レンダリング
  renderTable(cfg, data, "all", "");

  // 検索
  document.getElementById("search-input").addEventListener("input", (e) => {
    const activeTab = document.querySelector(".tab-btn.is-active");
    renderTable(cfg, data, activeTab?.dataset.cat || "all", e.target.value);
  });
}

function buildTabs(cfg, data) {
  const wrap = document.getElementById("tabs-wrap");
  const cats = cfg.categories || [];

  const allBtn = document.createElement("button");
  allBtn.className = "tab-btn is-active";
  allBtn.dataset.cat = "all";
  allBtn.textContent = "すべて";
  allBtn.addEventListener("click", () => switchTab("all", cfg, data));
  wrap.appendChild(allBtn);

  cats.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "tab-btn";
    btn.dataset.cat = cat.id;
    btn.textContent = cat.label;
    btn.addEventListener("click", () => switchTab(cat.id, cfg, data));
    wrap.appendChild(btn);
  });
}

function switchTab(catId, cfg, data) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.toggle("is-active", b.dataset.cat === catId));
  const searchVal = document.getElementById("search-input").value;
  renderTable(cfg, data, catId, searchVal);
}

function renderTable(cfg, data, catId, searchVal) {
  const q = searchVal.trim().toLowerCase();

  const filtered = data.filter((row) => {
    const catMatch = catId === "all" || cfg.getCategory(row) === catId;
    const searchMatch =
      !q ||
      (cfg.getEvent(row) || "").toLowerCase().includes(q) ||
      (cfg.getDescription(row) || "").toLowerCase().includes(q);
    return catMatch && searchMatch;
  });

  document.getElementById("stat-total").textContent = data.length;
  document.getElementById("stat-shown").textContent = filtered.length;

  const tbody = document.getElementById("table-body");
  const table = document.getElementById("timeline-table");
  const msg = document.getElementById("state-msg");

  if (filtered.length === 0) {
    table.style.display = "none";
    msg.textContent = "該当するデータがありません。";
    msg.style.display = "";
    return;
  }

  msg.style.display = "none";
  table.style.display = "";

  tbody.innerHTML = filtered
    .map((row) => {
      const year = cfg.formatYear(row);
      const event = esc(cfg.getEvent(row));
      const desc = esc(cfg.getDescription(row) || "");
      const cat = cfg.getCategory(row);
      const catDef = (cfg.categories || []).find((c) => c.id === cat);
      const chipStyle = catDef
        ? `background:${catDef.bg};color:${catDef.fg};`
        : "background:#e8e8e5;color:#555;";
      const chipLabel = catDef ? catDef.label : esc(cat || "");
      const wikiUrl = cfg.showWikiLink ? row.wiki_url || "" : "";

      return `<tr>
            <td class="cell-year">${year}</td>
            <td class="cell-event">${event}</td>
            <td><span class="cat-chip" style="${chipStyle}">${chipLabel}</span></td>
            <td class="cell-desc col-desc">${desc}</td>
            ${
              cfg.showWikiLink
                ? `<td>${
                    wikiUrl
                      ? `<a class="wiki-link" href="${esc(wikiUrl)}" target="_blank" rel="noopener">
                       <i class="bi bi-box-arrow-up-right"></i>
                     </a>`
                      : ""
                  }</td>`
                : ""
            }
          </tr>`;
    })
    .join("");
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}