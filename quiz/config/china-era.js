// quiz/config/china-era.js
// 中国王朝史 年代クイズ【出来事 → 年号】

window.QUIZ_CONFIG = {
  title: "中国王朝史 年代クイズ",
  subtitle: "出来事 → 年号",
  backLink: "/sub-index.html?slug=history",
  backLabel: "歴史ホーム",
  accentColor: "#dfbc5e",
  answerType: "text",

  rangeMode: "multi",
  rangeLabel: "出題カテゴリ",
  ranges: [
    { id: "王朝成立", label: "王朝成立" },
    { id: "王朝滅亡", label: "王朝滅亡" },
    { id: "反乱", label: "反乱" },
    { id: "戦争", label: "戦争" },
    { id: "外交", label: "外交" },
    { id: "内政", label: "内政" },
    { id: "経済", label: "経済" },
    { id: "文化", label: "文化" },
    { id: "その他", label: "その他" },
  ],
  countMode: "slider",
  countMin: 5,
  countMax: 50,
  countDefault: 10,

  inputLabel: "この出来事は何年？",
  inputPlaceholder: "例: -221 / 618",
  inputHint: "紀元前は負の数で入力（例：-221 = 前221年）",
  inputMaxLength: 6,

  async fetchData(selectedCategories, count) {
    const { data, error } = await window._db
      .from(window.SUPABASE_TABLES.CHINESE)
      .select("*")
      .in("category", selectedCategories);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return [];

    const shuffled = window._quizShuffle(data);
    const total = parseInt(count);
    return isNaN(total) ? shuffled : shuffled.slice(0, total);
  },

  formatQuestion(row) {
    return {
      text: row.title,
      category: row.category,
      sub: row.description || null,
    };
  },

  formatCorrectLabel(row) {
    return window._quizFormatYear(row.year);
  },

  getCorrectValue(row) {
    return row.year;
  },

  validate(raw, row) {
    if (!/^-?\d+$/.test(raw.trim())) {
      return {
        ok: false,
        message: "年を数字で入力してください（紀元前は負の数）",
      };
    }
    const value = parseInt(raw, 10);
    return { ok: true, value, isCorrect: value === row.year };
  },

  renderMistake(item) {
    const chip = item.category
      ? `<span class="qz-category-chip" style="font-size:0.7rem;">${_esc(item.category)}</span>`
      : "";
    const desc = item._raw?.description
      ? `<p style="color:var(--qz-text-sub);font-size:0.88rem;margin-top:6px;">${_esc(item._raw.description)}</p>`
      : "";
    return `
      <div class="qz-review-item__header">
        ${chip}
        <p class="qz-review-item__question">${_esc(item.questionText)}</p>
      </div>
      ${desc}
      <div class="qz-review-item__answers">
        <span class="qz-review-item__user">あなた：${_esc(item.userAnswer)}</span>
        <span class="qz-review-item__correct">正解：<strong>${_esc(item.correctAnswer)}</strong></span>
      </div>
    `;
  },

  buildDistractors: null,
  onAnswer: null,
  extraRenderer: null,
};

function _esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
