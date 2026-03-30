window.TIMELINE_CONFIG_HELPERS = {
  formatJapaneseYear(row) {
    if (row.date_type === "full" && row.full_date) return row.full_date;
    const y = row.year;
    if (y == null) return "不明";
    const base = y < 0 ? `前${Math.abs(y)}年` : `${y}年`;
    return row.date_type === "circa" ? base + "頃" : base;
  },

  async fetchRows(tableName, selectClause, filterFn) {
    let query = window._db
      .from(tableName)
      .select(selectClause)
      .order("year", { ascending: true, nullsFirst: false });

    if (typeof filterFn === "function") {
      query = filterFn(query);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  },

  async fetchWhDates(selectClause, filterFn) {
    return this.fetchRows(window.SUPABASE_TABLES.WH_DATES, selectClause, filterFn);
  },
};
