// history/world/timeline-config.js
// timeline.html?slug=history/world 用設定
// NOTE: world_history_quiz → wh_dates 移行完了後に有効になる。
//       現状は wh_dates の世界史データが1件のみのため動作確認用。

window.TIMELINE_CONFIG = {
  title: '世界史年表',
  backLink: '../../sub-index.html?slug=history',
  backLabel: '歴史ホーム',
  accentColor: '#1a2b3c',
  accentColorRgb: '26, 43, 60',
  showWikiLink: true,

  categories: [
    { id: '政治',       label: '政治',       bg: '#e8eaf6', fg: '#283593' },
    { id: '経済',       label: '経済',       bg: '#e8f5e9', fg: '#1b5e20' },
    { id: '文化・宗教', label: '文化・宗教', bg: '#fff3e0', fg: '#e65100' },
    { id: '社会',       label: '社会',       bg: '#e0f7fa', fg: '#006064' },
    { id: '外交・戦争', label: '外交・戦争', bg: '#ffebee', fg: '#b71c1c' },
  ],

  async fetchData() {
    // region が china を含まない全レコードを取得
    // world_history_quiz 移行後は大量データが入る
    const { data, error } = await window._db
      .from('wh_dates')
      .select('id, year, year_end, date_type, full_date, event, description, wiki_url, field, region')
      .not('region', 'cs', '{"china"}')
      .order('year', { ascending: true, nullsFirst: false });
    if (error) throw new Error(error.message);
    return data;
  },

  formatYear(row) {
    if (row.date_type === 'full' && row.full_date) return row.full_date;
    const y = row.year;
    if (y == null) return '不明';
    const base = y < 0 ? `前${Math.abs(y)}年` : `${y}年`;
    return row.date_type === 'circa' ? base + '頃' : base;
  },

  getEvent(row)       { return row.event; },
  getDescription(row) { return row.description; },
  getCategory(row)    { return row.field || 'その他'; },
};