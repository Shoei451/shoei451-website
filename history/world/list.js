const sectionItems1 = [
  {
    icon: "../images/worldhistoryquiz.png",
    iconType: "image",
    title: "年号 → 出来事",
    titleEN: "Year to Event",
    description: "表示された年号に対応する出来事を4択で選ぶ。フィルタ：時代区分",
    link: "year-to-event/",
  },
  {
    icon: "../images/worldhistoryquiz.png",
    iconType: "image",
    title: "出来事 → 年号",
    titleEN: "Event to Year",
    description: "表示された出来事の年号を直接入力する。フィルタ：章（第1章〜第11章）",
    link: "event-to-year/",
  },
];

// ── PAGE_CONFIG（sub-index.html?slug=history/world から参照） ──
window.PAGE_CONFIG = {
  title:      "世界史年代クイズ — Shoei451",
  h1:         "📅 世界史年代クイズ",
  headerDesc: "出題形式を選んでください",
  backLink:   "../sub-index.html?slug=history",
  sections: [
    { title: "出題形式", desc: ""},
  ],
};