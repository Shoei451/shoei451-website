// ============================================================
//  quiz-components/wh-utils.js
// wh_dates ベースのページで共有するユーティリティ関数
//
// 対象ページ:
//   history/worldhistory/index.html
//   history/worldhistory/timeline.html
//   history/worldhistory/admin/script.js
//   history/china/index.html
//   history/china/timeline.html
//   seikei/timeline/index.html      ← escapeHtml のみ
//   seikei/timeline/print.html      ← escapeHtml のみ
//
// 読み込み順:
//   <script src="../../js/wh-utils.js"></script>
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script type="module" src="logic.js"></script>
//
// ============================================================

// ── 年表示 ────────────────────────────────────────────────────
/**
 * wh_dates の year（負数統一）を表示文字列に変換する。
 * @param {number|null} year  - 負数なら紀元前、null なら「不明」
 * @returns {string}
 *
 * 例:
 *   formatYear(-221)  → "前221年"
 *   formatYear(1789)  → "1789年"
 *   formatYear(null)  → "不明"
 */
function formatYear(year) {
  if (year === null || year === undefined) return "不明";
  return year < 0 ? `前${Math.abs(year)}年` : `${year}年`;
}

/**
 * wh_dates の year / year_end を使った範囲表示。
 * @param {object} row  - { year, year_end }
 * @returns {string}
 *
 * 例:
 *   formatYearRange({ year: -221, year_end: -206 })  → "前221年 ～ 前206年"
 *   formatYearRange({ year: 1789, year_end: null })   → "1789年"
 */
function formatYearRange(row) {
  const start = formatYear(row.year);
  if (row.year_end !== null && row.year_end !== undefined) {
    return `${start} ～ ${formatYear(row.year_end)}`;
  }
  return start;
}

// ── XSSエスケープ ─────────────────────────────────────────────
/**
 * HTML特殊文字をエスケープする。
 * innerHTML への文字列挿入時に必ず通すこと。
 * @param {*} text
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = String(text ?? "");
  return div.innerHTML;
}

// ── シャッフル ────────────────────────────────────────────────
/**
 * 配列をFisher-Yatesアルゴリズムでシャッフルして返す（非破壊）。
 * @param {Array} array
 * @returns {Array}
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── グローバルに公開 ──────────────────────────────────────────
// window.xxx に代入しているので、どのページからでも参照可能。
window.formatYear = formatYear;
window.formatYearRange = formatYearRange;
window.escapeHtml = escapeHtml;
window.shuffleArray = shuffleArray;
