// ============================================================
// history/china/modules/chinaDynastyGraph.js
//
// 王朝遷移図の初期化モジュール。
// map.js のうち新設計への対応が必要な2点を担う:
//   1. サイドパネルの「まとめノートを開く」リンクを 451-docs に変える
//   2. 検索インデックスを chinaData.js ベースで構築する
//
// map.js 本体（renderCanvas / renderDetail / buildTimelineHtml 等）は
// そのまま流用する。このファイルは map.js の前に読み込むこと。
//
// 読み込み順:
//   <script src="dynasties.js"></script>     ← 静的マスターデータ
//   <script type="module" src="modules/chinaDynastyGraph.js"></script>
//   <script src="map.js"></script>           ← レンダラー本体
//
// ============================================================

import { getChinaEvents, getChinaPersons } from "./chinaData.js";

// ── 451-docs リンク生成 ───────────────────────────────────────

/**
 * 王朝 slug に対応する 451-docs の記事 URL を返す。
 * 記事が存在しない王朝（slug）は null を返す。
 *
 * 命名規則:
 *   451-docs.netlify.app/?site=shoei451-website&slug=china/{slug}
 *   例: china/tang → 唐の解説記事
 *
 * @param {string} slug
 * @returns {string|null}
 */
export function getDocsUrl(slug) {
  return `https://451-docs.netlify.app/?site=shoei451-website&slug=china/${slug}`;
}

// map.js の renderDetail() から参照できるようグローバルに公開する。
// map.js は ES module ではないため window 経由で渡す。
window.getDocsUrl = getDocsUrl;

// ── 検索インデックス（chinaData.js ベース） ───────────────────

/**
 * wh_dates の中国史データから検索インデックスを構築する。
 * map.js の SearchEngine.buildIndex() の代替として使う。
 *
 * インデックス構造:
 *   Map<slug, { slug, terms: string[] }>
 *   terms = event / description / field の文字列群
 *
 * slug への紐付けは dynasties.js の nameAlts を使って行う:
 *   wh_dates.event が DYNASTIES[i].nameAlts のいずれかを含む
 *   → その王朝の slug に紐付ける
 *
 * @returns {Promise<Map<string, {slug: string, terms: string[]}>>}
 */
export async function buildDynastyIndex() {
  const [events, persons] = await Promise.all([
    getChinaEvents(),
    getChinaPersons(),
  ]);

  const allRows = [...events, ...persons];

  // nameAlts → slug の逆引きマップを構築
  // 例: "唐" → "tang", "則天武后" → "tang"（figuresは別途対応）
  const altToSlug = new Map();
  for (const d of DYNASTIES) {
    for (const alt of d.nameAlts ?? []) {
      altToSlug.set(alt, d.slug);
    }
  }

  // slug → terms の集約
  const index = new Map();

  // DYNASTIES の各王朝を初期エントリとして登録
  for (const d of DYNASTIES) {
    index.set(d.slug, {
      slug: d.slug,
      terms: [
        d.name,
        ...(d.nameAlts ?? []),
        ...(d.systems ?? []),
        ...(d.figures ?? []),
        d.culture ?? "",
        d.notes ?? "",
      ].filter(Boolean),
    });
  }

  // wh_dates のイベント・人物を nameAlts で王朝に紐付けて terms に追加
  for (const row of allRows) {
    const text = `${row.event ?? ""} ${row.description ?? ""}`;

    // どの王朝に紐付くか判定（nameAlts の部分一致）
    let matchedSlug = null;
    for (const [alt, slug] of altToSlug) {
      if (text.includes(alt)) {
        matchedSlug = slug;
        break;
      }
    }

    if (!matchedSlug) continue;

    const entry = index.get(matchedSlug);
    if (!entry) continue;

    if (row.event) entry.terms.push(row.event);
    if (row.description) entry.terms.push(row.description);
  }

  return index;
}

// ── 検索関数（map.js の SearchEngine.search() 代替） ─────────

let _index = null; // buildDynastyIndex() の結果をキャッシュ

/**
 * インデックスを初期化する。ページロード時に一度だけ呼ぶ。
 * map.js の SearchEngine.buildIndex() の代わりに呼ぶこと。
 * @returns {Promise<void>}
 */
export async function initDynastySearch() {
  try {
    _index = await buildDynastyIndex();
  } catch (err) {
    console.warn(
      "chinaDynastyGraph: 検索インデックス構築失敗。静的データのみで動作します。",
      err,
    );
    // フォールバック: DYNASTIES の静的データだけでインデックスを作る
    _index = new Map();
    for (const d of DYNASTIES) {
      _index.set(d.slug, {
        slug: d.slug,
        terms: [d.name, ...(d.nameAlts ?? []), ...(d.figures ?? [])].filter(
          Boolean,
        ),
      });
    }
  }
  // map.js から window.dynastySearch() として呼べるようにする
  window.dynastySearch = searchDynasties;
}

/**
 * クエリ文字列で王朝を検索する。
 * map.js の handleSearch() から window.dynastySearch() として呼ぶ。
 *
 * @param {string} query
 * @returns {{ slug: string, dynasty: Object, matches: string[] }[]}
 */
export function searchDynasties(query) {
  if (!_index || !query.trim()) return [];

  const q = query.trim().toLowerCase();

  const results = [];
  for (const [slug, entry] of _index) {
    const matchedTerms = entry.terms.filter((t) => t.toLowerCase().includes(q));
    if (matchedTerms.length === 0) continue;

    const dynasty = DYNASTY_MAP[slug];
    if (!dynasty) continue;

    results.push({
      slug,
      dynasty,
      matches: [...new Set(matchedTerms)].slice(0, 3), // 上位3件
    });
  }

  // 王朝の start 順（時代順）でソート
  results.sort((a, b) => a.dynasty.start - b.dynasty.start);
  return results;
}

// ── 初期化エントリポイント ────────────────────────────────────

/**
 * ページロード時に呼ぶ。
 * map.js の renderCanvas() / renderDetail() より前に完了させる必要はないが、
 * 検索機能は initDynastySearch() 完了後に有効になる。
 */
export async function initDynastyGraph() {
  await initDynastySearch();
  console.info(
    `chinaDynastyGraph: 検索インデックス構築完了 (${_index?.size ?? 0} 王朝)`,
  );
}
