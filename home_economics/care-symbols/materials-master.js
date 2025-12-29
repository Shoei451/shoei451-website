// ========================================
// 素材マスタデータ（拡張版）
// ========================================

// 素材の定義
const MATERIALS = {
    // === 天然繊維 - 植物繊維 ===
    cotton: {
        code: 'cotton',
        nameJa: '綿',
        nameEn: 'Cotton',
        category: 'natural_plant',
        color: '#E8F5E9',
        description: '吸湿性に優れ、肌触りが良い'
    },
    linen: {
        code: 'linen',
        nameJa: '麻',
        nameEn: 'Linen',
        category: 'natural_plant',
        color: '#F1F8E9',
        description: '通気性が良く、涼しい'
    },
    ramie: {
        code: 'ramie',
        nameJa: 'ラミー',
        nameEn: 'Ramie',
        category: 'natural_plant',
        color: '#F9FBE7',
        description: '麻の一種、シャリ感がある'
    },

    // === 天然繊維 - 動物繊維 ===
    wool: {
        code: 'wool',
        nameJa: 'ウール',
        nameEn: 'Wool',
        category: 'natural_animal',
        color: '#FFF3E0',
        description: '保温性が高く、弾力がある'
    },
    silk: {
        code: 'silk',
        nameJa: 'シルク',
        nameEn: 'Silk',
        category: 'natural_animal',
        color: '#FCE4EC',
        description: '光沢があり、肌触りが滑らか'
    },
    cashmere: {
        code: 'cashmere',
        nameJa: 'カシミヤ',
        nameEn: 'Cashmere',
        category: 'natural_animal',
        color: '#FFF8E1',
        description: '高級素材、非常に柔らかい'
    },
    mohair: {
        code: 'mohair',
        nameJa: 'モヘア',
        nameEn: 'Mohair',
        category: 'natural_animal',
        color: '#FFF9C4',
        description: 'アンゴラヤギの毛、光沢がある'
    },
    angora: {
        code: 'angora',
        nameJa: 'アンゴラ',
        nameEn: 'Angora',
        category: 'natural_animal',
        color: '#FFEBEE',
        description: 'アンゴラウサギの毛、柔らかい'
    },
    alpaca: {
        code: 'alpaca',
        nameJa: 'アルパカ',
        nameEn: 'Alpaca',
        category: 'natural_animal',
        color: '#EFEBE9',
        description: '南米産、保温性が高い'
    },
    down: {
        code: 'down',
        nameJa: 'ダウン',
        nameEn: 'Down',
        category: 'natural_animal',
        color: '#ECEFF1',
        description: '羽毛、軽くて保温性が高い'
    },
    feather: {
        code: 'feather',
        nameJa: 'フェザー',
        nameEn: 'Feather',
        category: 'natural_animal',
        color: '#E0F2F1',
        description: '羽根、ダウンより硬め'
    },

    // === 化学繊維 - 再生繊維 ===
    rayon: {
        code: 'rayon',
        nameJa: 'レーヨン',
        nameEn: 'Rayon',
        category: 'regenerated',
        color: '#FFF9C4',
        description: '植物由来の再生繊維'
    },
    cupro: {
        code: 'cupro',
        nameJa: 'キュプラ',
        nameEn: 'Cupro',
        category: 'regenerated',
        color: '#F0F4C3',
        description: '裏地によく使われる、滑らかな質感'
    },
    lyocell: {
        code: 'lyocell',
        nameJa: 'リヨセル',
        nameEn: 'Lyocell',
        category: 'regenerated',
        color: '#E8F5E9',
        description: '環境に優しい再生繊維（テンセル）'
    },
    modal: {
        code: 'modal',
        nameJa: 'モダール',
        nameEn: 'Modal',
        category: 'regenerated',
        color: '#F1F8E9',
        description: 'レーヨンの改良版、柔らかい'
    },
    acetate: {
        code: 'acetate',
        nameJa: 'アセテート',
        nameEn: 'Acetate',
        category: 'regenerated',
        color: '#FFF8E1',
        description: '光沢があり、ドレープ性が良い'
    },
    triacetate: {
        code: 'triacetate',
        nameJa: 'トリアセテート',
        nameEn: 'Triacetate',
        category: 'regenerated',
        color: '#FFFDE7',
        description: 'アセテートの改良版'
    },

    // === 化学繊維 - 合成繊維 ===
    polyester: {
        code: 'polyester',
        nameJa: 'ポリエステル',
        nameEn: 'Polyester',
        category: 'synthetic',
        color: '#E3F2FD',
        description: 'シワになりにくく、乾きやすい'
    },
    nylon: {
        code: 'nylon',
        nameJa: 'ナイロン',
        nameEn: 'Nylon',
        category: 'synthetic',
        color: '#E0F2F1',
        description: '強度が高く、軽い'
    },
    acrylic: {
        code: 'acrylic',
        nameJa: 'アクリル',
        nameEn: 'Acrylic',
        category: 'synthetic',
        color: '#F3E5F5',
        description: 'ウールに似た風合い'
    },
    polyurethane: {
        code: 'polyurethane',
        nameJa: 'ポリウレタン',
        nameEn: 'Polyurethane',
        category: 'synthetic',
        color: '#E8EAF6',
        description: '伸縮性がある（スパンデックス）'
    },
    polypropylene: {
        code: 'polypropylene',
        nameJa: 'ポリプロピレン',
        nameEn: 'Polypropylene',
        category: 'synthetic',
        color: '#E1F5FE',
        description: '軽量で速乾性がある'
    },

    // === その他 - 皮革類 ===
    leather: {
        code: 'leather',
        nameJa: 'レザー',
        nameEn: 'Leather',
        category: 'leather',
        color: '#D7CCC8',
        description: '本革、耐久性が高い'
    },
    suede: {
        code: 'suede',
        nameJa: 'スエード',
        nameEn: 'Suede',
        category: 'leather',
        color: '#BCAAA4',
        description: '起毛革、柔らかい質感'
    },
    faux_leather: {
        code: 'faux_leather',
        nameJa: '合成皮革',
        nameEn: 'Faux Leather',
        category: 'leather',
        color: '#CFD8DC',
        description: '人工皮革、手入れが簡単'
    }
};

// カテゴリー定義
const MATERIAL_CATEGORIES = {
    natural_plant: {
        code: 'natural_plant',
        nameJa: '天然繊維（植物）',
        icon: '🌿',
        order: 1
    },
    natural_animal: {
        code: 'natural_animal',
        nameJa: '天然繊維（動物）',
        icon: '🐑',
        order: 2
    },
    regenerated: {
        code: 'regenerated',
        nameJa: '再生繊維',
        icon: '♻️',
        order: 3
    },
    synthetic: {
        code: 'synthetic',
        nameJa: '合成繊維',
        icon: '🧪',
        order: 4
    },
    leather: {
        code: 'leather',
        nameJa: '皮革類',
        icon: '👜',
        order: 5
    }
};

// カテゴリーごとに素材をグループ化
function getMaterialsByCategory() {
    const grouped = {};
    
    Object.values(MATERIAL_CATEGORIES).forEach(category => {
        grouped[category.code] = Object.values(MATERIALS)
            .filter(m => m.category === category.code);
    });
    
    return grouped;
}

// 素材コードから素材情報を取得
function getMaterial(code) {
    return MATERIALS[code] || null;
}

// すべての素材コードを取得
function getAllMaterialCodes() {
    return Object.keys(MATERIALS);
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MATERIALS,
        MATERIAL_CATEGORIES,
        getMaterialsByCategory,
        getMaterial,
        getAllMaterialCodes
    };
}