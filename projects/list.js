const sectionItems1 = [
    {
        icon: "https://451-toshin-tracker.netlify.app/images/favicon.svg",  // Using image
        iconType: "image",
        title: "東進受講管理ツール",
        titleEN: "Toshin Tracker",
        description: "東進の受講管理を支援するツールです。",
        link: "https://451-toshin-tracker.netlify.app/"
    },
    {
        icon: "https://451-docs.netlify.app/images/s-docs.svg",
        iconType: "image",
        title: "451-docs",
        titleEN: "Study Notes & Updates",
        description: "Learning notes, thoughts, and update posts(Markdown-based docs).",
        link: "https://451-docs.netlify.app"
    },
    {
        icon: "https://chinese-history-note.netlify.app/images/3dynasities_favicon.png",
        iconType: "image",
        title: "中国王朝変遷図+",
        titleEN: "Chinese History Notes",
        description: "A personal collection of notes and resources for Chinese history study. ",
        link: "https://chinese-history-note.netlify.app/"
    },
    {
        icon: "https://451-learning-box.netlify.app/images/451-lbox.svg",
        iconType: "image",
        title: "451-Learning Box",
        titleEN: "Learning Resources",
        description: "A collection of learning resources and materials.",
        link: "https://451-learning-box.netlify.app/"
    },
    {
        icon: "https://451-schedule-tracker.netlify.app/schedule_tracker.svg",
        iconType: "image",
        title: "451-Schedule Tracker",
        titleEN: "Schedule Tracker",
        description: "A tool for tracking and managing schedules.",
        link: "https://451-schedule-tracker.netlify.app/"
    }
];

// ── PAGE_CONFIG（sub-index.html?slug=projects から参照） ──
window.PAGE_CONFIG = {
      title:      "Projects | Shoei451",
      h1:         "Other Websites",
      headerDesc: "A list of my other websites and what each one is for.",
      sections: [
        { title: "Website List", desc: "Open any card to visit the site.", itemsVar: "sectionItems1", id: "container1" }
      ]
    };
