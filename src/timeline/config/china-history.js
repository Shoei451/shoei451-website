import { formatJapaneseYear, fetchWhDates } from "./common.js";

const timelineConfig = {
  title: "中国王朝史年表",
  backLink: "../sub-index.html?slug=history",
  backLabel: "歴史ホーム",
  accentColor: "#d73c37",
  accentColorRgb: "215, 60, 55",
  showWikiLink: true,

  // ── タイムライン表示設定 ──────────────────────────────────
  accentLineColor: "#d73c37", // period/person ラインの色
  showPeriodLines: true,

  categories: [
    { id: "王朝成立", label: "王朝成立", fg: "#92400e" },
    { id: "王朝滅亡", label: "王朝滅亡", fg: "#991b1b" },
    { id: "反乱", label: "反乱", fg: "#9d174d" },
    { id: "戦争", label: "戦争", fg: "#9f1239" },
    { id: "外交", label: "外交", fg: "#1e40af" },
    { id: "内政", label: "内政", fg: "#075985" },
    { id: "経済", label: "経済", fg: "#065f46" },
    { id: "文化", label: "文化", fg: "#4c1d95" },
    { id: "その他", label: "その他", fg: "#374151" },
  ],

  async fetchData() {
    return fetchWhDates(
      "id, year, year_end, date_type, full_date, event, description, wiki_url, field, region, record_type",
      (query) => query.contains("region", ["china"]),
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

export default timelineConfig;
