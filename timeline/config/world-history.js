// NOTE: world_history_quiz → wh_dates 移行完了後に有効になる。
//       現状は wh_dates の世界史データが1件のみのため動作確認用。

const { formatJapaneseYear, fetchWhDates } = window.TIMELINE_CONFIG_HELPERS;

window.TIMELINE_CONFIG = {
  title: "世界史年表",
  backLink: "../sub-index.html?slug=history",
  backLabel: "歴史ホーム",
  accentColor: "#1a2b3c",
  accentColorRgb: "26, 43, 60",
  showWikiLink: true,

  categories: [
    { id: "政治", label: "政治", bg: "#e8eaf6", fg: "#283593" },
    { id: "経済", label: "経済", bg: "#e8f5e9", fg: "#1b5e20" },
    { id: "文化・宗教", label: "文化・宗教", bg: "#fff3e0", fg: "#e65100" },
    { id: "社会", label: "社会", bg: "#e0f7fa", fg: "#006064" },
    { id: "外交・戦争", label: "外交・戦争", bg: "#ffebee", fg: "#b71c1c" },
  ],

  async fetchData() {
    return fetchWhDates(
      // region が china を含まない全レコードを取得
      // world_history_quiz 移行後は大量データが入る
      "id, year, year_end, date_type, full_date, event, description, wiki_url, field, region",
      (query) => query.not("region", "cs", '{"china"}'),
    );
  },

  formatYear(row) {
    return formatJapaneseYear(row);
  },

  getEvent(row) {
    return row.event;
  },
  getDescription(row) {
    return row.description;
  },
  getCategory(row) {
    return row.field || "その他";
  },
};
