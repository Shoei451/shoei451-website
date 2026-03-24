const sectionItems1 = [
    {
        icon: "🗽",  
        title: "アメリカ州の場所クイズ",
        titleEN: "US state location quiz",
        description: "アメリカ各州の正しい場所を地図上でクリックして答えるクイズです。",
        link: "us-state-location-quiz.html",
    },
    {
        icon: "🏙️",  
        title: "首都クイズ",
        titleEN: "World Capitals' Quiz",
        description: "世界各国・地域の首都名を答えるクイズです",
        link: "capitals_quiz/",
        target: "_blank"
    },
    {
        icon: "🗺️",
        title: "3学期期末試験対策用 Frashcards",
        titleEN: "Frashcards for Final Exam",
        description: "期末テスト対策用のフラッシュカードです。",
        link: "https://451-learning-box.netlify.app/flashcard.html?slug=geo-3-exam",
    },
    {
        icon: "🌍",
        title: "戦後アフリカ史地図",
        titleEN: "Africa Independence Atlas",
        description: "戦後のアフリカの独立と国境の変遷を示すインタラクティブな地図",
        link: "africa_independence_atlas/",
        target: "_blank"
    },
    {
        icon: "❓",
        title: "アフリカ独立クイズ",
        titleEN: "Africa Independence Quiz",
        description: "戦後のアフリカの独立と旧宗主国に関するクイズ",
        link: "africa_independence_atlas/quiz.html",
        target: "_blank"
    },
    
];
// ── PAGE_CONFIG（sub-index.html?slug=geography から参照） ──
window.PAGE_CONFIG = {
      title:      "Geography Tools — Shoei451",
      h1:         "🧭 Geography",
      headerDesc: "地理の学習ツール集です。",
      sections: [
        { title: "地理関連クイズ", desc: "首都名や州名など、地理に関連したもののクイズです。"}
      ]
    };
