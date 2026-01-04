// 衣類取り扱い表示記号のデータ
// 画像URLは ICOMPO からダウンロードした画像のパスに置き換えてください
// 例: "images/care-symbols/wash-30.png"

const careSymbolsData = [
    // === 洗濯処理 ===
    {
        id: 1,
        category: "washing",
        categoryJP: "洗濯処理",
        symbol: "wash-30-normal",
        imageUrl: "/images/care-symbols/wash-30-normal.svg", // 要置換
        meaning: "洗濯機30℃",
        description: "液温は30℃を限度とし、洗濯機で洗濯ができる",
        choices: [
            "洗濯機30℃",
            "洗濯機40℃",
            "手洗い30℃",
            "洗濯機60℃"
        ],
        correctAnswer: 0,
        relatedMaterials: ["綿", "ポリエステル混紡"],
        difficulty: "easy"
    },
    {
        id: 2,
        category: "washing",
        categoryJP: "洗濯処理",
        symbol: "wash-30-weak",
        imageUrl: "/images/care-symbols/wash-30-weak.svg",
        meaning: "洗濯機30℃（弱）",
        description: "液温は30℃を限度とし、洗濯機の弱い洗濯ができる",
        choices: [
            "洗濯機30℃",
            "洗濯機30℃（弱）",
            "洗濯機40℃（弱）",
            "手洗い30℃"
        ],
        correctAnswer: 1,
        relatedMaterials: ["ウール", "アクリル"],
        difficulty: "medium"
    },
    {
        id: 3,
        category: "washing",
        categoryJP: "洗濯処理",
        symbol: "wash-30-very-weak",
        imageUrl: "/images/care-symbols/wash-30-very-weak.svg",
        meaning: "洗濯機30℃（弱弱）",
        description: "液温は30℃を限度とし、洗濯機の非常に弱い洗濯ができる",
        choices: [
            "洗濯機30℃（弱）",
            "洗濯機30℃（弱弱）",
            "手洗い30℃",
            "洗濯禁止"
        ],
        correctAnswer: 1,
        relatedMaterials: ["カシミヤ", "シルク混紡"],
        difficulty: "hard"
    },
    {
        id: 4,
        category: "washing",
        categoryJP: "洗濯処理",
        symbol: "wash-40-normal",
        imageUrl: "/images/care-symbols/wash-40-normal.svg",
        meaning: "洗濯機40℃",
        description: "液温は40℃を限度とし、洗濯機で洗濯ができる",
        choices: [
            "洗濯機30℃",
            "洗濯機40℃",
            "洗濯機50℃",
            "手洗い40℃"
        ],
        correctAnswer: 1,
        relatedMaterials: ["綿", "麻"],
        difficulty: "easy"
    },
    {
        id: 5,
        category: "washing",
        categoryJP: "洗濯処理",
        symbol: "hand-wash-30",
        imageUrl: "/images/care-symbols/hand-wash-30.svg",
        meaning: "手洗い30℃",
        description: "液温は30℃を限度とし、手洗いができる",
        choices: [
            "洗濯機30℃（弱弱）",
            "手洗い30℃",
            "手洗い40℃",
            "洗濯禁止"
        ],
        correctAnswer: 1,
        relatedMaterials: ["シルク", "ウール（デリケート）"],
        difficulty: "easy"
    },
    {
        id: 6,
        category: "washing",
        categoryJP: "洗濯処理",
        symbol: "wash-prohibited",
        imageUrl: "/images/care-symbols/wash-prohibited.svg",
        meaning: "家庭での洗濯禁止",
        description: "家庭での洗濯はできない（クリーニング店へ）",
        choices: [
            "手洗いのみ可",
            "洗濯機使用禁止",
            "家庭での洗濯禁止",
            "温水洗濯禁止"
        ],
        correctAnswer: 2,
        relatedMaterials: ["レザー", "スーツ"],
        difficulty: "easy"
    },

    // === 漂白処理 ===
    {
        id: 7,
        category: "bleaching",
        categoryJP: "漂白処理",
        symbol: "bleach-ok",
        imageUrl: "/images/care-symbols/bleach-ok.svg",
        meaning: "漂白剤OK",
        description: "塩素系・酸素系漂白剤での漂白ができる",
        choices: [
            "漂白剤OK",
            "酸素系漂白剤のみOK",
            "漂白剤使用禁止",
            "塩素系漂白剤のみOK"
        ],
        correctAnswer: 0,
        relatedMaterials: ["白い綿製品", "タオル"],
        difficulty: "easy"
    },
    {
        id: 8,
        category: "bleaching",
        categoryJP: "漂白処理",
        symbol: "bleach-oxygen-only",
        imageUrl: "/images/care-symbols/bleach-oxygen-only.svg",
        meaning: "酸素系の漂白剤OK",
        description: "酸素系漂白剤での漂白はできるが、塩素系は使用不可",
        choices: [
            "漂白剤OK",
            "酸素系の漂白剤OK",
            "漂白剤使用禁止",
            "塩素系の漂白剤OK"
        ],
        correctAnswer: 1,
        relatedMaterials: ["色柄物", "ポリエステル"],
        difficulty: "medium"
    },
    {
        id: 9,
        category: "bleaching",
        categoryJP: "漂白処理",
        symbol: "bleach-prohibited",
        imageUrl: "/images/care-symbols/bleach-prohibited.svg",
        meaning: "漂白剤使用禁止",
        description: "塩素系・酸素系ともに漂白剤の使用はできない",
        choices: [
            "酸素系の漂白剤OK",
            "漂白剤使用禁止",
            "塩素系の漂白剤OK",
            "希釈すればOK"
        ],
        correctAnswer: 1,
        relatedMaterials: ["ウール", "シルク", "色落ちしやすい衣類"],
        difficulty: "easy"
    },

    // === 乾燥処理 ===
    {
        id: 10,
        category: "drying",
        categoryJP: "乾燥処理",
        symbol: "tumble-dry-60",
        imageUrl: "/images/care-symbols/tumble-dry-60.svg",
        meaning: "タンブル乾燥60℃",
        description: "タンブル乾燥ができる（排気温度上限60℃）",
        choices: [
            "タンブル乾燥60℃",
            "タンブル乾燥80℃",
            "タンブル乾燥禁止",
            "自然乾燥のみ"
        ],
        correctAnswer: 0,
        relatedMaterials: ["綿タオル"],
        difficulty: "medium"
    },
    {   
        id: 11,
        category: "drying",
        categoryJP: "乾燥処理",
        symbol: "tumble-dry-80",
        imageUrl: "/images/care-symbols/tumble-dry-80.svg",
        meaning: "タンブル乾燥80℃",
        description: "タンブル乾燥ができる（排気温度上限80℃）",
        choices: [  
            "タンブル乾燥60℃",
            "タンブル乾燥80℃",
            "高温乾燥禁止",
            "自然乾燥推奨"
        ],
        correctAnswer: 1,
        relatedMaterials: ["厚手の綿製品"],
        difficulty: "medium"
    },
    {
        id: 12,
        category: "drying",
        categoryJP: "乾燥処理",
        symbol: "tumble-dry-prohibited",
        imageUrl: "/images/care-symbols/tumble-dry-prohibited.svg",
        meaning: "タンブル乾燥禁止",
        description: "タンブル乾燥はできない（自然乾燥）",
        choices: [
            "低温タンブル乾燥OK",
            "タンブル乾燥禁止",
            "タンブル乾燥60℃",
            "短時間ならOK"
        ],
        correctAnswer: 1,
        relatedMaterials: ["ウール", "デリケート素材"],
        difficulty: "easy"
    },
    {
        id: 13,
        category: "drying",
        categoryJP: "乾燥処理",
        symbol: "hang-dry",
        imageUrl: "/images/care-symbols/hang-dry.svg",
        meaning: "つり干し",
        description: "ハンガーなどを使ってつり干しする",
        choices: [
            "つり干し",
            "平干し",
            "ぬれつり干し",
            "日陰干し"
        ],
        correctAnswer: 0,
        relatedMaterials: ["シャツ", "Tシャツ"],
        difficulty: "easy"
    },
    {
        id: 14,
        category: "drying",
        categoryJP: "乾燥処理",
        symbol: "drip-hang-dry",
        imageUrl: "/images/care-symbols/drip-hang-dry.svg",
        meaning: "ぬれつり干し",
        description: "脱水せず、ぬれたままつり干しする",
        choices: [
            "つり干し",
            "ぬれつり干し",
            "日陰でつり干し",
            "平干し"
        ],
        correctAnswer: 1,
        relatedMaterials: ["型崩れしやすいニット"],
        difficulty: "medium"
    },
    {
        id: 15,
        category: "drying",
        categoryJP: "乾燥処理",
        symbol: "flat-dry",
        imageUrl: "/images/care-symbols/flat-dry.svg",
        meaning: "平干し",
        description: "平らな状態で干す",
        choices: [
            "つり干し",
            "平干し",
            "ぬれ平干し",
            "日陰で平干し"
        ],
        correctAnswer: 1,
        relatedMaterials: ["セーター", "ニット"],
        difficulty: "easy"
    },
    {
        id: 16,
        category: "drying",
        categoryJP: "乾燥処理",
        symbol: "shade-hang-dry",
        imageUrl: "/images/care-symbols/shade-hang-dry.svg",
        meaning: "日陰でつり干し",
        description: "直射日光を避けてつり干しする",
        choices: [
            "つり干し",
            "日陰でつり干し",
            "日陰で平干し",
            "ぬれつり干し"
        ],
        correctAnswer: 1,
        relatedMaterials: ["色褪せしやすい衣類", "デリケート素材"],
        difficulty: "medium"
    },

    // === アイロン仕上げ ===
    {
        id: 17,
        category: "ironing",
        categoryJP: "アイロン仕上げ",
        symbol: "iron-210",
        imageUrl: "/images/care-symbols/iron-210.svg",
        meaning: "アイロン仕上げ210℃",
        description: "底面温度210℃を限度としてアイロン仕上げができる（高温）",
        choices: [
            "アイロン120℃",
            "アイロン160℃",
            "アイロン210℃",
            "アイロン禁止"
        ],
        correctAnswer: 2,
        relatedMaterials: ["綿", "麻"],
        difficulty: "easy"
    },
    {
        id: 18,
        category: "ironing",
        categoryJP: "アイロン仕上げ",
        symbol: "iron-160",
        imageUrl: "/images/care-symbols/iron-160.svg",
        meaning: "アイロン仕上げ160℃",
        description: "底面温度160℃を限度としてアイロン仕上げができる（中温）",
        choices: [
            "アイロン120℃",
            "アイロン160℃",
            "アイロン210℃",
            "スチーム禁止"
        ],
        correctAnswer: 1,
        relatedMaterials: ["ポリエステル", "ウール"],
        difficulty: "medium"
    },
    {
        id: 19,
        category: "ironing",
        categoryJP: "アイロン仕上げ",
        symbol: "iron-120",
        imageUrl: "/images/care-symbols/iron-120.svg",
        meaning: "アイロン仕上げ120℃",
        description: "底面温度120℃を限度としてアイロン仕上げができる（低温）",
        choices: [
            "アイロン120℃",
            "アイロン160℃",
            "アイロン禁止",
            "当て布使用"
        ],
        correctAnswer: 0,
        relatedMaterials: ["アクリル", "ナイロン"],
        difficulty: "medium"
    },
    {
        id: 20,
        category: "ironing",
        categoryJP: "アイロン仕上げ",
        symbol: "iron-120-no-steam",
        imageUrl: "/images/care-symbols/iron-120-no-steam.svg",
        meaning: "アイロン120℃スチーム禁止",
        description: "底面温度120℃を限度とし、スチームなしでアイロン仕上げができる",
        choices: [
            "アイロン120℃",
            "アイロン120℃スチーム禁止",
            "アイロン禁止",
            "低温のみ可"
        ],
        correctAnswer: 1,
        relatedMaterials: ["ポリウレタン混紡"],
        difficulty: "hard"
    },
    {
        id: 21,
        category: "ironing",
        categoryJP: "アイロン仕上げ",
        symbol: "iron-prohibited",
        imageUrl: "/images/care-symbols/iron-prohibited.svg",
        meaning: "アイロン仕上げ禁止",
        description: "アイロン仕上げはできない",
        choices: [
            "低温アイロンのみ可",
            "スチーム禁止",
            "アイロン仕上げ禁止",
            "当て布使用"
        ],
        correctAnswer: 2,
        relatedMaterials: ["ナイロン", "一部の化学繊維"],
        difficulty: "easy"
    },

    // === クリーニング ===
    {
        id: 22,
        category: "cleaning",
        categoryJP: "クリーニング",
        symbol: "dry-clean-ok",
        imageUrl: "/images/care-symbols/dry-clean-ok.svg",
        meaning: "ドライクリーニングOK",
        description: "パークロロエチレン及び石油系溶剤によるドライクリーニングができる",
        choices: [
            "ドライクリーニングOK",
            "ドライクリーニングOK（弱）",
            "石油系のみOK",
            "クリーニング禁止"
        ],
        correctAnswer: 0,
        relatedMaterials: ["スーツ", "コート"],
        difficulty: "easy"
    },
    {
        id: 23,
        category: "cleaning",
        categoryJP: "クリーニング",
        symbol: "dry-clean-weak",
        imageUrl: "/images/care-symbols/dry-clean-weak.svg",
        meaning: "ドライクリーニングOK（弱）",
        description: "パークロロエチレン及び石油系溶剤による弱いドライクリーニングができる",
        choices: [
            "ドライクリーニングOK",
            "ドライクリーニングOK（弱）",
            "石油系のみOK（弱）",
            "ウェットクリーニング推奨"
        ],
        correctAnswer: 1,
        relatedMaterials: ["デリケートな素材のスーツ"],
        difficulty: "hard"
    },
    {
        id: 24,
        category: "cleaning",
        categoryJP: "クリーニング",
        symbol: "petroleum-only",
        imageUrl: "/images/care-symbols/petroleum-only.svg",
        meaning: "ドライクリーニング石油系のみOK",
        description: "石油系溶剤によるドライクリーニングができる",
        choices: [
            "ドライクリーニングOK",
            "ドライクリーニング石油系のみOK",
            "ドライクリーニング禁止",
            "ウェットクリーニングOK"
        ],
        correctAnswer: 1,
        relatedMaterials: ["レザー製品", "合成皮革"],
        difficulty: "hard"
    },
    {
        id: 25,
        category: "cleaning",
        categoryJP: "クリーニング",
        symbol: "dry-clean-prohibited",
        imageUrl: "/images/care-symbols/dry-clean-prohibited.svg",
        meaning: "ドライクリーニング禁止",
        description: "ドライクリーニングはできない",
        choices: [
            "石油系のみOK",
            "弱いドライクリーニングOK",
            "ドライクリーニング禁止",
            "ウェットクリーニングのみ"
        ],
        correctAnswer: 2,
        relatedMaterials: ["一部のデリケート素材"],
        difficulty: "easy"
    },
    {
        id: 26,
        category: "cleaning",
        categoryJP: "クリーニング",
        symbol: "wet-clean-ok",
        imageUrl: "/images/care-symbols/wet-clean-ok.svg",
        meaning: "ウェットクリーニングOK",
        description: "ウェットクリーニングができる",
        choices: [
            "ウェットクリーニングOK",
            "ウェットクリーニングOK（弱）",
            "ドライクリーニングOK",
            "水洗いOK"
        ],
        correctAnswer: 0,
        relatedMaterials: ["ウール", "シルク"],
        difficulty: "medium"
    },
    {
        id: 27,
        category: "cleaning",
        categoryJP: "クリーニング",
        symbol: "wet-clean-weak",
        imageUrl: "/images/care-symbols/wet-clean-weak.svg",
        meaning: "ウェットクリーニングOK（弱）",
        description: "弱いウェットクリーニングができる",
        choices: [
            "ウェットクリーニングOK",
            "ウェットクリーニングOK（弱）",
            "ウェットクリーニング禁止",
            "手洗い推奨"
        ],
        correctAnswer: 1,
        relatedMaterials: ["カシミヤ", "デリケートなウール"],
        difficulty: "hard"
    },
    {
        id: 28,
        category: "cleaning",
        categoryJP: "クリーニング",
        symbol: "wet-clean-prohibited",
        imageUrl: "/images/care-symbols/wet-clean-prohibited.svg",
        meaning: "ウェットクリーニング禁止",    
        description: "ウェットクリーニングはできない",
        choices: [
            "ウェットクリーニングOK（弱）",
            "ウェットクリーニング禁止",
            "ドライクリーニングのみ",
            "水洗い禁止"
        ],
        correctAnswer: 1,
        relatedMaterials: ["レザー", "一部の装飾品付き衣類"],
        difficulty: "easy"
    }
];

// カテゴリー名の日本語対応
const categoryNames = {
    "washing": "洗濯処理",
    "bleaching": "漂白処理",
    "drying": "乾燥処理",
    "ironing": "アイロン仕上げ",
    "cleaning": "クリーニング"
};


// ========================================
// 素材特定用のシンボルセット（拡張版）
// care-symbols-data.js の末尾に追加または置き換え
// ========================================

// 素材特定用のシンボルセット（全記号対応）
const materialIdentificationSymbols = [
    // === 洗濯処理 ===
    { 
        id: "wash-30-normal", 
        label: "洗濯機30℃", 
        imageUrl: "/images/care-symbols/wash-30-normal.svg",
        category: "washing"
    },
    { 
        id: "wash-30-weak", 
        label: "洗濯機30℃（弱）", 
        imageUrl: "/images/care-symbols/wash-30-weak.svg",
        category: "washing"
    },
    { 
        id: "wash-30-very-weak", 
        label: "洗濯機30℃（弱弱）", 
        imageUrl: "/images/care-symbols/wash-30-very-weak.svg",
        category: "washing"
    },
    { 
        id: "wash-40-normal", 
        label: "洗濯機40℃", 
        imageUrl: "/images/care-symbols/wash-40-normal.svg",
        category: "washing"
    },
    { 
        id: "wash-40-weak", 
        label: "洗濯機40℃（弱）", 
        imageUrl: "/images/care-symbols/wash-40-weak.svg",
        category: "washing"
    },
    { 
        id: "wash-40-very-weak", 
        label: "洗濯機40℃（弱弱）", 
        imageUrl: "/images/care-symbols/wash-40-very-weak.svg",
        category: "washing"
    },
    { 
        id: "wash-50-normal", 
        label: "洗濯機50℃", 
        imageUrl: "/images/care-symbols/wash-50-normal.svg",
        category: "washing"
    },
    { 
        id: "wash-50-weak", 
        label: "洗濯機50℃（弱）", 
        imageUrl: "/images/care-symbols/wash-50-weak.svg",
        category: "washing"
    },
    { 
        id: "wash-60-normal", 
        label: "洗濯機60℃", 
        imageUrl: "/images/care-symbols/wash-60-normal.svg",
        category: "washing"
    },
    { 
        id: "wash-60-weak", 
        label: "洗濯機60℃（弱）", 
        imageUrl: "/images/care-symbols/wash-60-weak.svg",
        category: "washing"
    },
    { 
        id: "wash-70-normal", 
        label: "洗濯機70℃", 
        imageUrl: "/images/care-symbols/wash-70-normal.svg",
        category: "washing"
    },
    { 
        id: "wash-95-normal", 
        label: "洗濯機95℃", 
        imageUrl: "/images/care-symbols/wash-95-normal.svg",
        category: "washing"
    },
    { 
        id: "hand-wash-30", 
        label: "手洗い30℃", 
        imageUrl: "/images/care-symbols/hand-wash-30.svg",
        category: "washing"
    },
    { 
        id: "hand-wash-40", 
        label: "手洗い40℃", 
        imageUrl: "/images/care-symbols/hand-wash-40.svg",
        category: "washing"
    },
    { 
        id: "wash-prohibited", 
        label: "洗濯禁止", 
        imageUrl: "/images/care-symbols/wash-prohibited.svg",
        category: "washing"
    },

    // === 漂白処理 ===
    { 
        id: "bleach-ok", 
        label: "漂白剤OK", 
        imageUrl: "/images/care-symbols/bleach-ok.svg",
        category: "bleaching"
    },
    { 
        id: "bleach-oxygen-only", 
        label: "酸素系OK", 
        imageUrl: "/images/care-symbols/bleach-oxygen-only.svg",
        category: "bleaching"
    },
    { 
        id: "bleach-prohibited", 
        label: "漂白剤禁止", 
        imageUrl: "/images/care-symbols/bleach-prohibited.svg",
        category: "bleaching"
    },

    // === 乾燥処理 ===
    { 
        id: "tumble-dry-60", 
        label: "タンブル乾燥60℃", 
        imageUrl: "/images/care-symbols/tumble-dry-60.svg",
        category: "drying"
    },
    { 
        id: "tumble-dry-80", 
        label: "タンブル乾燥80℃", 
        imageUrl: "/images/care-symbols/tumble-dry-80.svg",
        category: "drying"
    },
    { 
        id: "tumble-dry-prohibited", 
        label: "タンブル乾燥禁止", 
        imageUrl: "/images/care-symbols/tumble-dry-prohibited.svg",
        category: "drying"
    },
    { 
        id: "hang-dry", 
        label: "つり干し", 
        imageUrl: "/images/care-symbols/hang-dry.svg",
        category: "drying"
    },
    { 
        id: "drip-hang-dry", 
        label: "ぬれつり干し", 
        imageUrl: "/images/care-symbols/drip-hang-dry.svg",
        category: "drying"
    },
    { 
        id: "flat-dry", 
        label: "平干し", 
        imageUrl: "/images/care-symbols/flat-dry.svg",
        category: "drying"
    },
    { 
        id: "drip-flat-dry", 
        label: "ぬれ平干し", 
        imageUrl: "/images/care-symbols/drip-flat-dry.svg",
        category: "drying"
    },
    { 
        id: "shade-hang-dry", 
        label: "日陰つり干し", 
        imageUrl: "/images/care-symbols/shade-hang-dry.svg",
        category: "drying"
    },
    { 
        id: "shade-drip-hang-dry", 
        label: "日陰ぬれつり干し", 
        imageUrl: "/images/care-symbols/shade-drip-hang-dry.svg",
        category: "drying"
    },
    { 
        id: "shade-flat-dry", 
        label: "日陰平干し", 
        imageUrl: "/images/care-symbols/shade-flat-dry.svg",
        category: "drying"
    },
    { 
        id: "shade-drip-flat-dry", 
        label: "日陰ぬれ平干し", 
        imageUrl: "/images/care-symbols/shade-drip-flat-dry.svg",
        category: "drying"
    },

    // === アイロン仕上げ ===
    { 
        id: "iron-210", 
        label: "高温210℃", 
        imageUrl: "/images/care-symbols/iron-210.svg",
        category: "ironing"
    },
    { 
        id: "iron-160", 
        label: "中温160℃", 
        imageUrl: "/images/care-symbols/iron-160.svg",
        category: "ironing"
    },
    { 
        id: "iron-120", 
        label: "低温120℃", 
        imageUrl: "/images/care-symbols/iron-120.svg",
        category: "ironing"
    },
    { 
        id: "iron-120-no-steam", 
        label: "低温120℃スチーム禁止", 
        imageUrl: "/images/care-symbols/iron-120-no-steam.svg",
        category: "ironing"
    },
    { 
        id: "iron-prohibited", 
        label: "アイロン禁止", 
        imageUrl: "/images/care-symbols/iron-prohibited.svg",
        category: "ironing"
    },

    // === クリーニング ===
    { 
        id: "dry-clean-ok", 
        label: "ドライクリーニングOK", 
        imageUrl: "/images/care-symbols/dry-clean-ok.svg",
        category: "cleaning"
    },
    { 
        id: "dry-clean-weak", 
        label: "ドライクリーニングOK（弱）", 
        imageUrl: "/images/care-symbols/dry-clean-weak.svg",
        category: "cleaning"
    },
    { 
        id: "petroleum-only", 
        label: "石油系のみOK", 
        imageUrl: "/images/care-symbols/petroleum-only.svg",
        category: "cleaning"
    },
    { 
        id: "petroleum-only-weak", 
        label: "石油系のみOK（弱）", 
        imageUrl: "/images/care-symbols/petroleum-only-weak.svg",
        category: "cleaning"
    },
    { 
        id: "dry-clean-prohibited", 
        label: "ドライクリーニング禁止", 
        imageUrl: "/images/care-symbols/dry-clean-prohibited.svg",
        category: "cleaning"
    },
    { 
        id: "wet-clean-ok", 
        label: "ウェットクリーニングOK", 
        imageUrl: "/images/care-symbols/wet-clean-ok.svg",
        category: "cleaning"
    },
    { 
        id: "wet-clean-weak", 
        label: "ウェットクリーニングOK（弱）", 
        imageUrl: "/images/care-symbols/wet-clean-weak.svg",
        category: "cleaning"
    },
    { 
        id: "wet-clean-very-weak", 
        label: "ウェットクリーニングOK（弱弱）", 
        imageUrl: "/images/care-symbols/wet-clean-very-weak.svg",
        category: "cleaning"
    },
    { 
        id: "wet-clean-prohibited", 
        label: "ウェットクリーニング禁止", 
        imageUrl: "/images/care-symbols/wet-clean-prohibited.svg",
        category: "cleaning"
    }
];

// カテゴリー名の定義（記号選択画面での表示用）
const symbolCategoryNames = {
    washing: "🧺 洗濯処理",
    bleaching: "🧴 漂白処理",
    drying: "🌤️ 乾燥処理",
    ironing: "🔥 アイロン仕上げ",
    cleaning: "🧼 クリーニング"
};

// カテゴリーごとに記号を取得する関数
function getSymbolsByCategory() {
    const grouped = {
        washing: [],
        bleaching: [],
        drying: [],
        ironing: [],
        cleaning: []
    };
    
    materialIdentificationSymbols.forEach(symbol => {
        if (grouped[symbol.category]) {
            grouped[symbol.category].push(symbol);
        }
    });
    
    return grouped;
}
