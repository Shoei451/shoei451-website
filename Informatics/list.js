const sectionItems1 = [
    {
        icon: "../images/hex-quiz.svg",  
        iconType: "image",
        title: "16進数クイズ",
        titleEN: "Hexadecimal Quiz",
        description: "16進数/2進数についての計算クイズです",
        link: "hex-quiz/" ,
        target : "_blank"
    },
    {
        icon: "🧩",
        title: "Sudoku JS note",
        titleEN: "Sudoku JS note",
        description: "数独ソルバーのロジックから、Javascriptを学ぶ",
        link: "sudoku-programming-guide/" ,
        target : "_blank"
    },
];
// ── PAGE_CONFIG（sub-index.html?slug=Informatics から参照） ──
window.PAGE_CONFIG = {
      title:      "Informatics_1 — Shoei451",
      h1:         "💻 Informatics_1",
      headerDesc: "\"Informatics one\" learning tools",
      sections: [
        { title: "共通テスト対策", desc: "情報Ⅰ 共通テスト対策のための学習ツール集です", itemsVar: "sectionItems1", id: "container1" },
      ]
    };
