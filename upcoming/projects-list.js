const upcomingProjects = [
    
    {
        icon: "📊",
        title: "成績管理ダッシュボード",
        titleEN: "Grade Tracking Dashboard",
        description: "テスト・模試の点数や目標設定、振り返りを記録・可視化できる学習管理ツール。グラフで進捗を確認できます。",
        status: "designing",
        statusText: "designing",
        progress: 20,
        targetDate: "2026年2月",
        
        tags: ["Productivity", "Data Visualization", "Tracking"]
    },
    {
        icon: "💻",
        title: "情報Ⅰ 共テ自作問題",
        titleEN: "Information I: Practice for the Common Test",
        description: "情報Ⅰ の共通テストのプログラミング問題に似せた問題演習。テーマは「所得税計算」、「モンテカルロ法による円周率導出」「完全数」などを予定しています。",
        status: "planning",
        statusText: "planning",
        progress: 5,
        targetDate: "2026年3月末",
        
        tags: ["Information Ⅰ", "Programming", "Practice"]
    },
    {
        icon: "📑",
        title: "歴史総合ノート",
        titleEN: "Integrated History: Comprehensive Digital Note",
        description: "歴史総合のノートを再整理して、webサイト化する予定です。",
        status: "planning",
        statusText: "Planning",
        progress: 0,
        targetDate: "未定",
        tags: ["History", "Notebook", ]
    },
    {
        icon: "🏔️",
        title: "地理総合 定期テスト過去問データベース",
        titleEN: "Geography past term-exams questions",
        description: "地理総合のテスト過去問をオンラインで閲覧できるようにします。<br><b>（学校専用公開）</b>",
        status: "launching",
        statusText: "もうすぐ公開",
        progress: 93,
        targetDate: "2026年1月末",
        tags: ["Geography", "Term exams","PDF"]
    },
    {
        icon: "🧵/❤️",
        title: "家庭基礎/保健 定期テスト過去問データベース",
        titleEN: "Home economics / Healthcare past term-exams questions",
        description: "家庭基礎/保健の定期テストは年3回といえど油断できません。テスト過去問を解いて効率的に対策しましょう。<br><b>（学校専用公開）</b>",
        status: "launching",
        statusText: "もうすぐ公開",
        progress: 80,
        targetDate: "2026年1月末",
        tags: ["Home economics","Healthcare", "Term exams","PDF"]
    },
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