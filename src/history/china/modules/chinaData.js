// ============================================================
// history/china/modules/chinaData.js
//
// 中国史データ取得の唯一の入口。
// wh_dates テーブルから region に "china" を含む行を取得する。
//
// 依存:
//   window._db             — supabase_config.js が設定する Supabase クライアント
//   window.SUPABASE_TABLES — supabase_config.js が設定するテーブル名定数
//
// 使い方（ES module）:
//   import { getChinaEvents, getChinaPeriods, getChinaPersons } from './chinaData.js';
//
//   const events  = await getChinaEvents();
//   const events  = await getChinaEvents({ field: '政治', yearRange: [-221, 220] });
//   const periods = await getChinaPeriods();
//   const persons = await getChinaPersons({ field: '文化・宗教' });
//
// ============================================================

// ── 取得カラム ────────────────────────────────────────────────
// memo は UI では直接表示しないが、将来の全文検索インデックス構築を見越して含める。
const SELECT =
  "id, year, year_end, date_type, full_date, event, description, field, region, record_type, wiki_url, wiki_score, memo";

// ── 型定義 (JSDoc) ────────────────────────────────────────────
/**
 * @typedef {Object} ChinaQueryOptions
 * @property {string}   [field]      - 分野フィルタ
 *                                     "政治" | "経済" | "文化・宗教" | "社会" | "外交・戦争"
 * @property {number[]} [yearRange]  - [startYear, endYear] 両端を含む
 *                                     例: [-221, 220] = 秦〜後漢
 *                                     BC は負数。
 */

// ── 内部共通クエリ ────────────────────────────────────────────

/**
 * wh_dates から中国史レコードを取得する内部共通関数。
 * @param {"event"|"period"|"person"} recordType
 * @param {ChinaQueryOptions} options
 * @returns {Promise<Object[]>}
 */
async function _fetchChina(recordType, options = {}) {
  const db = window._db;
  if (!db) {
    throw new Error(
      "chinaData: window._db が未定義です。supabase_config.js を先に読み込んでください。",
    );
  }

  const table = window.SUPABASE_TABLES?.WH_DATES ?? "wh_dates";

  let query = db
    .from(table)
    .select(SELECT)
    .contains("region", ["china"])
    .eq("record_type", recordType)
    .order("year", { ascending: true, nullsFirst: false });

  if (options.field) {
    query = query.eq("field", options.field);
  }

  if (options.yearRange) {
    const [from, to] = options.yearRange;
    // year が null のレコードは yearRange 指定時は除外する（.gte/.lte は null を除外する）
    query = query.gte("year", from).lte("year", to);
  }

  const { data, error } = await query;
  if (error) throw new Error(`chinaData: ${error.message}`);
  return data ?? [];
}

// ── パブリック API ────────────────────────────────────────────

/**
 * 中国史イベントを取得する。
 * @param {ChinaQueryOptions} [options]
 * @returns {Promise<Object[]>}
 */
export async function getChinaEvents(options = {}) {
  return _fetchChina("event", options);
}

/**
 * 中国史の時代・王朝レコード（period）を取得する。
 * chinaPeriods.js の year → 時代ラベル変換で使用する。
 * @param {ChinaQueryOptions} [options]
 * @returns {Promise<Object[]>}
 */
export async function getChinaPeriods(options = {}) {
  return _fetchChina("period", options);
}

/**
 * 中国史の人物レコードを取得する。
 * @param {ChinaQueryOptions} [options]
 * @returns {Promise<Object[]>}
 */
export async function getChinaPersons(options = {}) {
  return _fetchChina("person", options);
}

/**
 * イベント・期間・人物を一括取得する。
 * chinaTimeline.js など複数 record_type を同時に必要とする場合に使う。
 * @param {ChinaQueryOptions} [options]
 * @returns {Promise<{events: Object[], periods: Object[], persons: Object[]}>}
 */
export async function getChinaAll(options = {}) {
  const [events, periods, persons] = await Promise.all([
    getChinaEvents(options),
    getChinaPeriods(options),
    getChinaPersons(options),
  ]);
  return { events, periods, persons };
}
