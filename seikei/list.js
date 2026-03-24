const sectionItems1 = [
    {
        icon: "📜",
        title: "日本国憲法クイズ",
        titleEN: "Japan Constituion Quiz",
        description: "日本国憲法の条文番号と内容を対応させて覚えるクイズアプリ",
        link: "japan-constitution-quiz.html",
        target: "_blank"
    },
];

const sectionItems2 = [
    {
        icon: "💰",
        title: "政治・経済 学習用年表",
        titleEN: "Political and Economic Timeline for Learning",
        description: "戦後経済史の年表です",
        link: "timeline/",
        target: "_blank"  
    },
    {
        icon: "💰",
        title: "政治・経済 学習用年表 クイズ版",
        titleEN: "Political and Economic Timeline for Learning - Quiz Version",
        description: "戦後経済史についてのクイズです",
        link: "timeline/quiz.html",
        target: "_blank"  
    }
];

const sectionItems3 = [
    {
        icon: "🗒️",
        title: "3学期期末試験対策用 一問一答",
        titleEN: "Politics and Economics Flashcards for 3rd Final Exam",
        description: "3学期期末試験対策用 政治経済の一問一答",
        link: "https://451-learning-box.netlify.app/flashcard.html?slug=seikei-3-exam",
        target: "_blank"  
    },
];

// ── PAGE_CONFIG（sub-index.html?slug=seikei から参照） ──
window.PAGE_CONFIG = {
      title:      "政治・経済ツール集 — Shoei451",
      h1:         "🏛️ Politics & Economics Tools",
      headerDesc: "政治・経済に関する学習ツール集",
      sections: [
        { title: "日本国憲法", desc: "日本国憲法に関する学習ツール", itemsVar: "sectionItems1", id: "container1" },
        { title: "戦後経済史年表", desc: "印刷対応のオンライン年表", itemsVar: "sectionItems2", id: "container2" },
        { title: "3学期期末試験対策用 一問一答", desc: "3学期期末試験の対策用クイズです", itemsVar: "sectionItems3", id: "container3" }
      ]
    };
