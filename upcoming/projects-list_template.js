const upcomingProjects = [
    {
        icon: "🧪",
        title: "化学基礎クイズアプリ",
        titleEN: "Chemistry Quiz App",
        description: "化学基礎の問題を楽しく学べるインタラクティブなクイズアプリ。元素記号、化学反応式、計算問題など幅広くカバーします。",
        status: "developing",           // planning, designing, developing, testing, launching
        statusText: "Developing",
        progress: 65,                   // 0-100
        targetDate: "2025年1月",
        estimatedTime: "2 weeks",
        tags: ["Chemistry", "Quiz", "Interactive"]
    },
    {
        icon: "📖",
        title: "英単語暗記ツール",
        titleEN: "Vocabulary Memorization Tool",
        description: "スペースドリピティションアルゴリズムを使った効率的な英単語学習アプリ。TOEFL・英検対応の単語リスト付き。",
        status: "testing",
        statusText: "Testing",
        progress: 85,
        targetDate: "2025年1月中旬",
        estimatedTime: "1 week",
        tags: ["English", "Vocabulary", "SRS"]
    },
    {
        icon: "🗺️",
        title: "世界地理クイズ",
        titleEN: "World Geography Quiz",
        description: "世界の国々、首都、地形を学べるインタラクティブマップクイズ。ゲーム感覚で楽しく地理を覚えられます。",
        status: "designing",
        statusText: "Designing",
        progress: 40,
        targetDate: "2025年2月",
        estimatedTime: "3 weeks",
        tags: ["Geography", "Interactive Map", "Quiz"]
    },
    {
        icon: "📊",
        title: "成績管理ダッシュボード",
        titleEN: "Grade Tracking Dashboard",
        description: "テストの点数や勉強時間を記録・可視化できる学習管理ツール。グラフで進捗を確認できます。",
        status: "planning",
        statusText: "Planning",
        progress: 20,
        targetDate: "2025年3月",
        estimatedTime: "4 weeks",
        tags: ["Productivity", "Data Visualization", "Tracking"]
    },
    {
        icon: "🎯",
        title: "数学問題ジェネレーター",
        titleEN: "Math Problem Generator",
        description: "ランダムに数学問題を生成するツール。難易度調整可能で、計算練習に最適。",
        status: "launching",
        statusText: "Launching Soon",
        progress: 95,
        targetDate: "2024年12月末",
        estimatedTime: "Few days",
        tags: ["Math", "Generator", "Practice"]
    },
    {
        icon: "🎨",
        title: "ノートテンプレート作成ツール",
        titleEN: "Note Template Creator",
        description: "授業ノートや勉強ノート用のテンプレートを簡単に作成・ダウンロードできるツール。PDF出力対応。",
        status: "planning",
        statusText: "Planning",
        progress: 10,
        targetDate: "2025年4月",
        estimatedTime: "5 weeks",
        tags: ["Productivity", "Templates", "PDF"]
    }
];

// 💡 STATUS OPTIONS:
// - planning: 企画・設計段階
// - designing: デザイン作成中
// - developing: コーディング中
// - testing: テスト・デバッグ中
// - launching: もうすぐ公開

// 💡 TIPS:
// - progress: 0-100 の数値で進捗を表示
// - tags: 最大3-4個が見やすい
// - 新しいプロジェクトは配列の先頭に追加（最新が上に表示される）