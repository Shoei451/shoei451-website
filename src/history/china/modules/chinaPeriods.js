// ============================================================
// history/china/modules/chinaPeriods.js
//
// year → 時代ラベル変換の純ロジック層。
//
// データ戦略:
//   1. getChinaPeriods() (chinaData.js) で Supabase から取得を試みる
//   2. データが空の場合（未登録）は FALLBACK_PERIODS を使う
//   3. Supabase にデータが入り次第、自動的にそちらが優先される
//
// 依存: chinaData.js (getChinaPeriods)
//
// 使い方:
//   import { loadPeriods, getPeriodLabel, getPeriodByYear } from './chinaPeriods.js';
//
//   await loadPeriods();                    // 初期化（一度だけ呼ぶ）
//   getPeriodLabel(-100);                   // → "帝国の形成"
//   getPeriodByYear(618);                   // → { label: "律令の時代", start: 589, end: 907, ... }
//
// ============================================================

import { getChinaPeriods } from "./chinaData.js";

// ── フォールバック定数 ────────────────────────────────────────
// status-0410.md の確定版時代区分。
// Supabase の period レコードが 0 件のときに使う。
// Supabase にデータが入ったらこちらは参照されなくなる。
//
// start / end は「この時代を代表する年代の目安」であり、
// 王朝の厳密な境界ではなく学習上の区分として定義する。
const FALLBACK_PERIODS = [
  {
    label: "封建制の時代",
    dynasties: ["夏", "殷", "西周", "東周"],
    start: -2000,
    end: -221,
  },
  {
    label: "帝国の形成",
    dynasties: ["秦", "漢"],
    start: -221,
    end: 220,
  },
  {
    label: "魏晋南北朝",
    dynasties: ["魏", "晋", "南北朝"],
    start: 220,
    end: 589,
  },
  {
    label: "律令の時代",
    dynasties: ["隋", "唐"],
    start: 589,
    end: 907,
  },
  {
    label: "五代十国",
    dynasties: ["五代十国"],
    start: 907,
    end: 960,
  },
  {
    label: "多極並立の時代",
    dynasties: ["宋", "遼", "金", "西夏"],
    start: 960,
    end: 1279,
  },
  {
    label: "元・明・清",
    dynasties: ["元", "明", "清"],
    start: 1271,
    end: 1912,
  },
];

// ── 内部状態 ──────────────────────────────────────────────────
// loadPeriods() 呼び出し後に確定する。
let _periods = null; // 正規化済み period 配列
let _loaded = false;

// ── 正規化 ───────────────────────────────────────────────────

/**
 * Supabase の period レコードをフォールバック形式に揃える。
 * wh_dates の period レコードは:
 *   event  → ラベル
 *   year   → start
 *   year_end → end
 * @param {Object[]} rows
 * @returns {Object[]}
 */
function _normalizeSupabasePeriods(rows) {
  return rows
    .filter((r) => r.year !== null && r.year_end !== null)
    .map((r) => ({
      label: r.event,
      start: r.year,
      end: r.year_end,
      field: r.field ?? null,
      id: r.id,
      // Supabase 由来のデータには dynasties 配列はないので省略
      dynasties: [],
    }))
    .sort((a, b) => a.start - b.start);
}

// ── パブリック API ────────────────────────────────────────────

/**
 * period データを初期化する。アプリ起動時に一度だけ呼ぶ。
 * 二度目以降の呼び出しは何もしない（冪等）。
 *
 * @returns {Promise<void>}
 */
export async function loadPeriods() {
  if (_loaded) return;

  try {
    const rows = await getChinaPeriods();
    if (rows.length > 0) {
      _periods = _normalizeSupabasePeriods(rows);
    } else {
      // Supabase に period データが未登録 → フォールバック使用
      _periods = FALLBACK_PERIODS;
      console.info(
        "chinaPeriods: Supabase に period レコードがないため、ローカル定数を使用します。",
      );
    }
  } catch (err) {
    // 通信エラーでもフォールバックで動かす
    _periods = FALLBACK_PERIODS;
    console.warn(
      "chinaPeriods: Supabase 取得失敗。ローカル定数にフォールバック。",
      err,
    );
  }

  _loaded = true;
}

/**
 * loadPeriods() 済みの period 配列をそのまま返す。
 * ソート順: start 昇順。
 *
 * @returns {Object[]}
 * @throws {Error} loadPeriods() 未呼び出しの場合
 */
export function getPeriods() {
  if (!_loaded)
    throw new Error("chinaPeriods: loadPeriods() を先に呼んでください。");
  return _periods;
}

/**
 * 任意の年が属する時代オブジェクトを返す。
 * 複数の時代に跨る場合（並立期など）は start が最も近いものを返す。
 * 該当なしの場合は null。
 *
 * @param {number} year - BC は負数
 * @returns {Object|null}
 */
export function getPeriodByYear(year) {
  if (!_loaded)
    throw new Error("chinaPeriods: loadPeriods() を先に呼んでください。");

  // year が範囲内に収まる period を全て拾い、その中で start が最大（最も近い）ものを返す
  const candidates = _periods.filter((p) => p.start <= year && year <= p.end);
  if (candidates.length === 0) return null;
  return candidates.reduce((best, p) => (p.start > best.start ? p : best));
}

/**
 * 任意の年の時代ラベル文字列を返す。
 * 該当なしの場合は "不明"。
 *
 * @param {number} year - BC は負数
 * @returns {string}
 */
export function getPeriodLabel(year) {
  const p = getPeriodByYear(year);
  return p ? p.label : "不明";
}

/**
 * 現在ロード済みのデータが Supabase 由来か、フォールバックかを返す。
 * データ整備の進捗確認・デバッグ用。
 *
 * @returns {"supabase"|"fallback"|"unloaded"}
 */
export function getPeriodSource() {
  if (!_loaded) return "unloaded";
  // フォールバック定数には dynasties 配列がある（Supabase 版には持たせない）
  return _periods[0]?.dynasties?.length > 0 ? "fallback" : "supabase";
}
