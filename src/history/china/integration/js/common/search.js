// js/common/search.js
// 共通フルテキスト検索エンジン
// 依存: js/common/dynasties.js / events.js / quizdata.js（読み込み済みであること）
//
// 公開 API:
//   SearchEngine.buildIndex()        同期・即時でインデックス構築
//   SearchEngine.search(query)       → [{ slug, dynasty, matches[] }]
//   SearchEngine.highlight(str, q)   → マーク付きHTML文字列
//   SearchEngine.highlightSnip(str, q) → 同上（後方互換エイリアス）

const SearchEngine = (() => {
  // slug → { dynasty, snippets: string[] }
  const _index = new Map();

  function _escRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // str 中に q が含まれればスニペット文字列を返す、なければ null
  function _snip(str, q) {
    const s = String(str ?? "");
    const i = s.toLowerCase().indexOf(q);
    if (i === -1) return null;
    const start = Math.max(0, i - 18);
    const end = Math.min(s.length, i + q.length + 36);
    return (
      (start > 0 ? "…" : "") + s.slice(start, end) + (end < s.length ? "…" : "")
    );
  }

  function buildIndex() {
    _index.clear();

    // 1. dynasties.js — 全スラッグのエントリを作成
    DYNASTIES.forEach((d) => {
      const snippets = [
        d.name,
        ...(d.nameAlts ?? []),
        d.capital ?? "",
        d.era ?? "",
        ...(d.systems ?? []),
        ...(d.figures ?? []),
        d.culture ?? "",
        d.notes ?? "",
      ].filter(Boolean);
      _index.set(d.slug, { dynasty: d, snippets });
    });

    // 2. events.js — 年代で王朝に紐づけ
    if (typeof EVENTS !== "undefined") {
      EVENTS.forEach((ev) => {
        const d = DYNASTIES.find((d) => ev.year >= d.start && ev.year <= d.end);
        if (!d) return;
        const entry = _index.get(d.slug);
        if (!entry) return;
        if (ev.title) entry.snippets.push(ev.title);
        if (ev.description) entry.snippets.push(ev.description);
      });
    }

    // 3. quizdata.js — quizMatch で王朝に紐づけ
    if (typeof quizData !== "undefined") {
      quizData.forEach((p) => {
        const d = DYNASTIES.find(
          (d) => Array.isArray(d.quizMatch) && d.quizMatch.includes(p.dynasty),
        );
        if (!d) return;
        const entry = _index.get(d.slug);
        if (!entry) return;
        entry.snippets.push(p.name);
        (p.works ?? []).forEach((w) => entry.snippets.push(w));
      });
    }
  }

  function search(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const results = [];

    _index.forEach((entry, slug) => {
      const matches = [];
      entry.snippets.forEach((s) => {
        const hit = _snip(s, q);
        if (hit) matches.push(hit);
      });
      if (matches.length) {
        results.push({
          slug,
          dynasty: entry.dynasty,
          matches: [...new Set(matches)].slice(0, 3),
        });
      }
    });

    return results;
  }

  // マーク付きHTML（メインAPI）
  function highlight(str, q) {
    if (!q || !str) return str ?? "";
    const re = new RegExp(`(${_escRe(q)})`, "gi");
    return String(str).replace(re, "<mark>$1</mark>");
  }

  // 後方互換エイリアス
  const highlightSnip = highlight;

  return { buildIndex, search, highlight, highlightSnip };
})();
