const sectionItems1 = [
  {
    icon: "../images/bio-favicon.png", // Using image
    iconType: "image",
    title: "生物基礎語句確認用 Forms",
    titleEN: "Biology Quiz Forms",
    description: "2024年度生物基礎の語句確認用フォーム",
    link: "biology-quiz-forms/",
    target: "_blank",
  },
  {
    icon: "🦴",
    iconType: "",
    title: "地質年代クイズ",
    titleEN: "Geological Eras & Life",
    description:
      "生物の進化と地質年代の変遷を、インタラクティブな年表とクイズで学ぶ",
    link: "geology-quiz",
    target: "_blank",
  },
];

const sectionItems2 = [
  {
    icon: "💬",
    title: "Vintage イディオムクイズ",
    titleEN: "English Idiom Quiz",
    description: "Vintage 冬季課題範囲の暗記用クイズです。",
    link: "idiom-quiz",
    target: "_blank",
  },
];

// ── PAGE_CONFIG（sub-index.html?slug=others から参照） ──
window.PAGE_CONFIG = {
  title: "Others — Shoei451",
  h1: "🗂️ Miscellaneous",
  headerDesc: "単発の学習ツール集です。",
  sections: [
    { title: "理科基礎", desc: "生物基礎・地学基礎の知識を確認" },
    { title: "論理・表現", desc: "論理・表現（英語）の学習ツールです。" },
  ],
};
