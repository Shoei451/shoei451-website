const sectionItems1 = [
    {
        icon: "🍽️",
        title: "食品・衛生分野 まとめノート",
        titleEN: "Food & Hygiene Summary Notes",
        description: "食品・衛生分野のまとめノートを配布します。",
        link: "../under-construction.html",
        target: "_blank"
    },
];

const sectionItems2 = [
    {
        icon: "👔",
        title: "衣類の取り扱い表示クイズ",
        titleEN: "Care Symbols Quiz",
        description: "衣類の取り扱い表示記号（JIS L 0001）を学習します。マークを見て、正しい意味を選びましょう。",
        link: "care-symbols",
        target: "_blank"
    },
    {
        icon: "📚",
        title: "社会保障制度+民法 フラッシュカード",
        titleEN: "Social Security System + Civil Law Flashcards",
        description: "社会保障制度と民法のフラッシュカードを配布します。",
        link: "https://451-learning-box.netlify.app/flashcard.html?slug=home-3-exam",
        target: "_blank"
    },
    {
        icon: "📝",
        title: "家庭基礎 3学期期末試験対策ノート",
        titleEN: "Home Economics 3rd Semester Final Exam Study Notes",
        description: "家庭基礎 3学期期末試験の対策ノートを配布します。",
        link: "https://451-learning-box.netlify.app/note.html?slug=home-3-exam",
        target: "_blank"
    }
];

// ── PAGE_CONFIG（sub-index.html?slug=home_economics から参照） ──
window.PAGE_CONFIG = {
      title:      "Home Economics — Shoei451",
      h1:         "🍳 Home Economics",
      headerDesc: "家庭基礎のテスト対策ツール集です。",
      sections: [
        { title: "2学期（食物・食品衛生）", desc: "テスト対策のためにつくったノートとミニツールを共有します。", itemsVar: "sectionItems1", id: "container1" },
        { title: "3学期（衣類・育児・家庭生活・社会保障）", desc: "テスト対策のためにつくったノートとミニツールを共有します。", itemsVar: "sectionItems2", id: "container2" }
      ]
    };
