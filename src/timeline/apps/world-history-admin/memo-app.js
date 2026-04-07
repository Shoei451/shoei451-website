import { db, tables } from "/js/supabase_config.js";

export function createWorldHistoryMemoApp() {
  let allRecords = [];
  let filtered = [];
  let currentRecord = null;
  let filterMemoOnly = false;
  let searchQuery = "";
  let fieldQuery = "";
  let searchTimer = null;
  let toastTimer = null;
  let touchStartY = 0;
  let initialized = false;

  return {
    init,
    loadRecords,
  };

  function init() {
    if (initialized) return;
    initialized = true;

    document
      .getElementById("memoSearchInput")
      .addEventListener("input", handleSearchInput);
    document
      .getElementById("memoFilterBtn")
      .addEventListener("click", toggleMemoOnly);
    document
      .getElementById("memoFieldFilter")
      .addEventListener("change", handleFieldChange);
    document
      .getElementById("memoSheetBackdrop")
      .addEventListener("click", closeSheet);
    document
      .getElementById("memoTabEdit")
      .addEventListener("click", () => switchTab("edit"));
    document
      .getElementById("memoTabPreview")
      .addEventListener("click", () => switchTab("preview"));
    document
      .getElementById("memoSaveBtn")
      .addEventListener("click", saveMemo);
    document
      .getElementById("memoClearBtn")
      .addEventListener("click", clearMemo);
    document
      .getElementById("memoCancelBtn")
      .addEventListener("click", closeSheet);

    const sheet = document.getElementById("memoSheet");
    sheet.addEventListener(
      "touchstart",
      (e) => {
        touchStartY = e.touches[0].clientY;
      },
      { passive: true },
    );
    sheet.addEventListener(
      "touchend",
      (e) => {
        if (e.changedTouches[0].clientY - touchStartY > 80) {
          closeSheet();
        }
      },
      { passive: true },
    );
  }

  async function loadRecords() {
    const list = document.getElementById("memoRecordList");
    list.innerHTML = '<div class="loading">読み込み中...</div>';

    const { data, error } = await db
      .from(tables.WH_DATES)
      .select("id, year, year_end, event, region, field, record_type, memo")
      .order("year", { ascending: true, nullsFirst: false });

    if (error) {
      list.innerHTML = `
        <div class="empty-state">
          <p>データの読み込みに失敗しました</p>
          <p style="font-size:0.85rem;margin-top:6px;">${escapeHtml(error.message)}</p>
        </div>
      `;
      return;
    }

    allRecords = data ?? [];
    applyFilter();
  }

  function handleSearchInput(e) {
    searchQuery = e.target.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilter, 220);
  }

  function toggleMemoOnly() {
    filterMemoOnly = !filterMemoOnly;
    document
      .getElementById("memoFilterBtn")
      .classList.toggle("active", filterMemoOnly);
    applyFilter();
  }

  function handleFieldChange(e) {
    fieldQuery = e.target.value;
    applyFilter();
  }

  function applyFilter() {
    const q = searchQuery.toLowerCase();
    filtered = allRecords.filter((row) => {
      if (filterMemoOnly && !row.memo) return false;
      if (fieldQuery && row.field !== fieldQuery) return false;
      if (!q) return true;
      return (
        (row.event ?? "").toLowerCase().includes(q) ||
        (row.region ?? []).join(" ").toLowerCase().includes(q) ||
        (row.field ?? "").toLowerCase().includes(q)
      );
    });

    document.getElementById("memoStatTotal").textContent = allRecords.length;
    document.getElementById("memoStatMemo").textContent = allRecords.filter(
      (row) => row.memo,
    ).length;
    document.getElementById("memoStatFiltered").textContent = filtered.length;

    renderList();
  }

  function renderList() {
    const el = document.getElementById("memoRecordList");

    if (!filtered.length) {
      el.innerHTML = `
        <div class="empty-state">
          <p>該当するレコードがありません</p>
        </div>
      `;
      return;
    }

    el.innerHTML = filtered
      .map((row) => {
        const hasMemo = !!row.memo;
        const preview = hasMemo
          ? row.memo
              .replace(/[#*`_>\[\]\n]/g, " ")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 90)
          : "";
        const regionTags = (row.region ?? [])
          .map((key) => `<span class="region-tag">${escapeHtml(key)}</span>`)
          .join("");
        const fieldTag = row.field
          ? `<span class="category-chip">${escapeHtml(row.field)}</span>`
          : "";
        const recordLabel =
          { event: "出来事", period: "期間", person: "人物" }[
            row.record_type
          ] ?? "";

        return `
          <article class="memo-card ${hasMemo ? "has-memo" : ""}" data-record-id="${row.id}">
            <div class="card-body">
              <div class="card-year">${formatYear(row)}</div>
              <div class="card-event">${escapeHtml(row.event)}</div>
              <div class="card-tag-row">
                <span class="category-chip record-chip record-chip--${escapeHtml(row.record_type)}">${escapeHtml(recordLabel)}</span>
                ${regionTags}
                ${fieldTag}
              </div>
              ${hasMemo ? `<div class="card-memo-preview">${escapeHtml(preview)}</div>` : ""}
            </div>
            <div class="card-actions">
              ${hasMemo ? '<div class="memo-indicator" title="メモあり"></div>' : ""}
              <button class="btn-edit" type="button" data-record-edit="${row.id}">編集</button>
            </div>
          </article>
        `;
      })
      .join("");

    el.querySelectorAll("[data-record-id]").forEach((card) => {
      card.addEventListener("click", () => {
        openSheet(Number(card.dataset.recordId));
      });
    });
    el.querySelectorAll("[data-record-edit]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openSheet(Number(btn.dataset.recordEdit));
      });
    });
  }

  function openSheet(id) {
    currentRecord = allRecords.find((row) => row.id === id);
    if (!currentRecord) return;

    document.getElementById("memoSheetYear").textContent = formatYear(currentRecord);
    document.getElementById("memoSheetEvent").textContent =
      currentRecord.event ?? "";
    document.getElementById("memoSheetTags").innerHTML = (currentRecord.region ?? [])
      .map((key) => `<span class="region-tag">${escapeHtml(key)}</span>`)
      .join("");
    document.getElementById("memoTextarea").value = currentRecord.memo ?? "";
    document.getElementById("memoClearBtn").style.display = currentRecord.memo
      ? ""
      : "none";

    switchTab("edit");

    const backdrop = document.getElementById("memoSheetBackdrop");
    const sheet = document.getElementById("memoSheet");
    backdrop.classList.add("visible");
    requestAnimationFrame(() => backdrop.classList.add("in"));
    sheet.style.display = "flex";
    requestAnimationFrame(() =>
      requestAnimationFrame(() => sheet.classList.add("open")),
    );
    setTimeout(() => document.getElementById("memoTextarea").focus(), 320);
  }

  function closeSheet() {
    const sheet = document.getElementById("memoSheet");
    const backdrop = document.getElementById("memoSheetBackdrop");
    sheet.classList.remove("open");
    backdrop.classList.remove("in");
    setTimeout(() => {
      sheet.style.display = "none";
      backdrop.classList.remove("visible");
      currentRecord = null;
    }, 300);
  }

  function switchTab(tab) {
    const textarea = document.getElementById("memoTextarea");
    const preview = document.getElementById("memoMdPreview");
    document
      .getElementById("memoTabEdit")
      .classList.toggle("active", tab === "edit");
    document
      .getElementById("memoTabPreview")
      .classList.toggle("active", tab === "preview");

    if (tab === "edit") {
      textarea.style.display = "";
      preview.style.display = "none";
      textarea.focus();
      return;
    }

    const md = textarea.value.trim();
    preview.innerHTML = md
      ? renderMarkdown(md)
      : '<p class="md-empty">まだメモがありません</p>';
    textarea.style.display = "none";
    preview.style.display = "";
  }

  async function saveMemo() {
    if (!currentRecord) return;

    const btn = document.getElementById("memoSaveBtn");
    const memo = document.getElementById("memoTextarea").value.trim() || null;
    btn.disabled = true;
    btn.textContent = "保存中...";

    const { error } = await db
      .from(tables.WH_DATES)
      .update({ memo })
      .eq("id", currentRecord.id);

    btn.disabled = false;
    btn.textContent = "保存";

    if (error) {
      showToast("保存失敗: " + error.message, 3500);
      return;
    }

    const idx = allRecords.findIndex((row) => row.id === currentRecord.id);
    if (idx !== -1) allRecords[idx].memo = memo;
    showToast("保存しました");
    closeSheet();
    applyFilter();
  }

  async function clearMemo() {
    if (!currentRecord) return;
    if (!confirm(`「${currentRecord.event}」のメモを削除しますか？`)) {
      return;
    }

    const { error } = await db
      .from(tables.WH_DATES)
      .update({ memo: null })
      .eq("id", currentRecord.id);

    if (error) {
      showToast("削除失敗: " + error.message, 3500);
      return;
    }

    const idx = allRecords.findIndex((row) => row.id === currentRecord.id);
    if (idx !== -1) allRecords[idx].memo = null;
    showToast("削除しました");
    closeSheet();
    applyFilter();
  }

  function showToast(msg, ms = 2000) {
    const toast = document.getElementById("memoToast");
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), ms);
  }
}

function renderMarkdown(markdown) {
  if (window.marked?.parse) {
    return window.marked.parse(markdown, { breaks: true, gfm: true });
  }
  return `<pre>${escapeHtml(markdown)}</pre>`;
}

function formatYear(row) {
  const year = row.year;
  if (year == null) return "年不明";
  return year < 0 ? `前${Math.abs(year)}年` : `${year}年`;
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}
