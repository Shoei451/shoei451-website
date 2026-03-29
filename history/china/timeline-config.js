// history/china/timeline-config.js
// timeline.html?slug=history/china 用設定
// window._db は timeline.html が CDN Supabase から生成して設定済み。

window.TIMELINE_CONFIG = {
  title: "中国王朝史年表",
  backLink: "../../sub-index.html?slug=history",
  backLabel: "歴史ホーム",
  accentColor: "#d73c37",
  accentColorRgb: "215, 60, 55",
  showWikiLink: true,

  categories: [
    { id: "王朝成立", label: "王朝成立", bg: "#fef3c7", fg: "#92400e" },
    { id: "王朝滅亡", label: "王朝滅亡", bg: "#fee2e2", fg: "#991b1b" },
    { id: "反乱", label: "反乱", bg: "#fce7f3", fg: "#9d174d" },
    { id: "戦争", label: "戦争", bg: "#fecdd3", fg: "#9f1239" },
    { id: "外交", label: "外交", bg: "#dbeafe", fg: "#1e40af" },
    { id: "内政", label: "内政", bg: "#e0f2fe", fg: "#075985" },
    { id: "経済", label: "経済", bg: "#d1fae5", fg: "#065f46" },
    { id: "文化", label: "文化", bg: "#ede9fe", fg: "#4c1d95" },
    { id: "その他", label: "その他", bg: "#f3f4f6", fg: "#374151" },
  ],

  async fetchData() {
    const { data, error } = await window._db
      .from("wh_dates")
      .select(
        "id, year, year_end, date_type, full_date, event, description, wiki_url, field",
      )
      .contains("region", ["china"])
      .order("year", { ascending: true, nullsFirst: false });
    if (error) throw new Error(error.message);
    return data;
  },

  formatYear(row) {
    if (row.date_type === "full" && row.full_date) return row.full_date;
    const y = row.year;
    if (y == null) return "不明";
    const base = y < 0 ? `前${Math.abs(y)}年` : `${y}年`;
    return row.date_type === "circa" ? base + "頃" : base;
  },

  getEvent(row) {
    return row.event;
  },
  getDescription(row) {
    return row.description;
  },

  // chinese_history 移行データは field=null。カテゴリタブは
  // 今後 admin で field を付与した後に有効になる。暫定で 'その他' 扱い。
  getCategory(row) {
    return row.field || "その他";
  },
};
