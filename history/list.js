const sectionItems1 = [
    {
        icon: "../images/google-forms.png",  // Using image
        iconType: "image",
        title: "歴史総合語句確認用 Google Forms",
        titleEN: "Rekisou Google Forms",
        description: "歴史総合の語句確認用 Google Forms 一覧です。",
        link: "rekisou-forms",
    },
];

const sectionItems2 = [
    {
        icon: "../images/worldhistoryquiz.png",  // Using image
        iconType: "image",
        title: "世界史年代クイズ",
        titleEN: "World History Era Quiz",
        description: "世界史の年代と出来事を結び付けて覚えるクイズアプリ",
        link: "world/",
        target: "_blank"
    },
    {
        icon: "../images/worldhistoryquiz.png",  // Using image
        iconType: "image",
        title: "世界史年代クイズ 年表版",
        titleEN: "World History Time table",
        description: "世界史年代クイズのデータが、インタラクティブな年表になりました",
        link: "world/timeline.html",
        target: "_blank"
    },
    {
        icon: "../images/chinese-history.svg",  // Using image
        iconType: "image",
        title: "中国王朝史年表",
        titleEN: "Chinese Dynasities Timeline",
        description: "中国史のオンライン年表",
        link: "china/timeline.html",
        target: "_blank"
    },
    {
        icon: "../images/chinese-history.svg",  // Using image
        iconType: "image",
        title: "中国史年代クイズ",
        titleEN: "Chinese History Era quiz",
        description: "中国史における出来事の、西暦をマスター",
        link: "china/",
        target: "_blank"
    },
    {
        icon: "../images/chinese-history.svg",  // Using image
        iconType: "image",
        title: "中国文化史クイズ",
        titleEN: "Chinese Culture History Quiz",
        description: "中国の文化史に関するクイズアプリ",
        link: "china/culture_quiz/",
        target: "_blank"
    },
];

const sectionItems3 = [
    {
        icon: "../images/worldhistoryquiz.png",  // Using image
        iconType: "image",
        title: "世界史年代クイズ（移行版）",
        titleEN: "World History Era Quiz",
        description: "世界史の年代と出来事を結び付けて覚えるクイズアプリ",
        link: "world/sub-index.html"
    },
]

// ── PAGE_CONFIG（sub-index.html?slug=history から参照） ──
window.PAGE_CONFIG = {
      title:      "History tools — Shoei451",
      h1:         "📚 History",
      headerDesc: "世界史/歴史総合の学習ツール（Google Forms 確認問題など）",
      sections: [
        { title: "歴史総合", desc: "歴史総合の学習ツールです。", },
        { title: "世界史", desc: "世界史探究・世界史応用・世界史発展の学習ツールです。", },
        { title: "世界史クイズ改良版(beta)", desc: "世界史年代クイズを改良したバージョンです（現在移行中）",}
      ]
    };
