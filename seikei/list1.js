const sectionItems1 = [
    {
        icon: "../images/favicon.png",  // Using image
        iconType: "image",
        title: "画像アイコンの例",
        titleEN: "Image Icon Example",
        description: "PNG/JPGアイコンを使った例",
        link: "item2.html"
    },
    {
        icon: "🌐",
        title: "外部リンクの例",
        titleEN: "External Link Example",
        description: "外部サイトへのリンク（自動で新しいタブで開く）",
        link: "https://github.com"  // External links auto-open in new tab
    },
    {
        icon: "🚀",
        title: "政治・経済 学習用年表",
        titleEN: "Political and Economic Timeline for Learning",
        description: "target指定で新しいタブで開く",
        link: "seikei-timeline.html",
        target: "_blank"  // Force new tab even for internal links
    }
];