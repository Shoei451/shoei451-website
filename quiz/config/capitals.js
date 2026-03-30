// quiz/config/capitalsz.js
// 世界首都クイズ（Supabase不使用、countries_data.js の静的データを使用）

window.QUIZ_CONFIG = {
  title: "World Capitals Quiz",
  subtitle: "Test your knowledge of world capitals",
  backLink: "/sub-index.html?slug=geography",
  backLabel: "Geography",
  answerType: "choice",
  startLabel: "START",

  rangeMode: "single",
  rangeLabel: "地域",
  ranges: [
    { id: "all", label: "全世界" },
    { id: "asia", label: "アジア" },
    { id: "europe", label: "ヨーロッパ" },
    { id: "africa", label: "アフリカ" },
    { id: "americas", label: "アメリカ大陸" },
    { id: "oceania", label: "オセアニア" },
  ],
  countMode: "select",
  countDefault: 10,
  countOptions: [5, 10, 20, 30],

  async fetchData(selectedRanges, count) {
    const region = selectedRanges[0];
    // window.countries は countries_data.js が定義している
    const source = window.countries ?? [];
    const filtered =
      region === "all" ? source : source.filter((c) => c.region === region);
    const shuffled = window._quizShuffle(filtered);
    return shuffled.slice(0, parseInt(count));
  },

  formatQuestion(row) {
    return {
      text: row.country,
      imageUrl: `https://flagcdn.com/w320/${row.code}.png`,
      imageAlt: `Flag of ${row.country}`,
    };
  },

  formatCorrectLabel(row) {
    return row.capital;
  },

  buildDistractors(current, allData) {
    // allData は fetchData が返した quizSet ではなく全データが必要なので
    // window.countries から取得する
    const source = window.countries ?? allData;
    return window
      ._quizShuffle(source.filter((r) => r.capital !== current.capital))
      .slice(0, 3);
  },

  // 首都名と日本語名を両方表示する
  renderChoice(opt, i) {
    const country = (window.countries ?? []).find((c) => c.capital === opt);
    const jp = country?.capitalJP ?? "";
    return `
      <span class="qz-choice__text">
        ${_esc(opt)}${jp ? `<br><small style="font-weight:400;color:var(--qz-text-sub);">${_esc(jp)}</small>` : ""}
      </span>
    `;
  },

  getCorrectValue: null,
  validate: null,
  onAnswer: null,
  extraRenderer: null,
  renderMistake: null,
};

// countries_data.js を動的ロード（まだロードされていない場合）
(function () {
  if (window.countries) return;
  const s = document.createElement("script");
  s.src = "/geography/capitals-quiz/countries_data.js";
  document.head.appendChild(s);
})();

function _esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
