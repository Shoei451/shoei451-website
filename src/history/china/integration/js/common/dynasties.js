// js/dynasties.js
// 全サイト共通の王朝マスターデータ
//
// フィールド一覧:
//   slug        notes/{slug}.md / dynasty.html?slug= に対応
//   name        表示名
//   era         era グループ（index.html カードグリッドのセクション見出し）
//   start/end   年（BC は負数）。timeline.html / dynasty.html の年代フィルタ用
//   capital     都城（変遷図サイドパネル・dynasty.html ヘッダー用）
//   color       テーマカラー（index.html カード・タイムライン帯）
//   nameAlts    events.js の dynasty フィールドへの照合用（部分一致も含む）
//   quizMatch   quizdata.js の dynasty フィールドへの完全一致照合用
//   territories 変遷図の円ノード分割表示用（ratio の合計 = 1）
//   systems     変遷図サイドパネル「制度」
//   figures     変遷図サイドパネル「人物」（chip 表示）
//   culture     変遷図サイドパネル「文化」
//   notes       変遷図サイドパネル「補足」（斜体テキスト）
//   timeline    存在する場合 → 変遷図に ▼ ボタンを表示し、帯タイムラインを展開
//     .groups[].label   グループラベル（null でラベルなし）
//     .groups[].tracks  { name, start, end, color }

const DYNASTIES = [
  // ════════════════════════════════════
  //  古代
  // ════════════════════════════════════

  {
    slug: "xia",
    name: "夏",
    era: "古代",
    start: -2070,
    end: -1600,
    capital: "斟鄩",
    color: "#7A6A50",
    nameAlts: ["夏"],
    quizMatch: [], // クイズ対象外
    territories: [{ name: "夏", ratio: 1 }],
    systems: [],
    figures: ["禹"],
    culture: "青銅器文化の萌芽期",
    notes: "伝説的王朝。考古学的証拠は限られる。",
  },

  {
    slug: "shang",
    name: "殷",
    era: "古代",
    start: -1600,
    end: -1046,
    capital: "亳 → 殷墟（安陽）",
    color: "#8B6914",
    nameAlts: ["殷", "商"],
    quizMatch: [], // クイズ対象外
    territories: [{ name: "殷", ratio: 1 }],
    systems: ["甲骨文字", "青銅器祭祀"],
    figures: ["湯王", "盤庚", "紂王"],
    culture: "甲骨文、発達した青銅器文化",
    notes: null,
  },

  {
    slug: "western_zhou",
    name: "西周",
    era: "古代",
    start: -1046,
    end: -770,
    capital: "鎬京",
    color: "#6A5490",
    nameAlts: ["西周"],
    quizMatch: [], // クイズ対象外
    territories: [{ name: "周", ratio: 1 }],
    systems: ["封建制", "宗法制", "井田制"],
    figures: ["武王", "周公旦", "幽王"],
    culture: "礼楽制度の確立、詩経の時代",
    notes: null,
  },

  {
    slug: "eastern_zhou",
    name: "東周",
    era: "古代",
    start: -770,
    end: -221,
    capital: "洛邑",
    color: "#5C4A8A",
    nameAlts: ["東周", "春秋", "戦国"],
    quizMatch: ["春秋", "戦国"],
    territories: [{ name: "東周", ratio: 1 }],
    systems: ["諸侯分立", "郡県制萌芽"],
    figures: ["孔子", "孟子", "荀子", "老子", "荘子", "韓非子", "商鞅"],
    culture: "諸子百家、春秋五覇・戦国七雄",
    notes: "前403年の三家分晋を境に春秋→戦国。",
    timeline: {
      groups: [
        {
          label: null,
          tracks: [
            { name: "春秋時代", start: -770, end: -403, color: "#7A6AAA" },
            { name: "戦国時代", start: -403, end: -221, color: "#5C4A8A" },
          ],
        },
      ],
    },
  },

  {
    slug: "qin",
    name: "秦",
    era: "古代",
    start: -221,
    end: -206,
    capital: "咸陽",
    color: "#2F4F4F",
    nameAlts: ["秦"],
    quizMatch: ["秦"],
    territories: [{ name: "秦", ratio: 1 }],
    systems: ["郡県制", "度量衡統一", "法家思想", "焚書坑儒"],
    figures: ["始皇帝", "李斯", "趙高", "蒙恬"],
    culture: "文字・度量衡の統一、万里の長城増築",
    notes: null,
  },

  // ─────────────────────────────────────────
  //  前漢  Former Han
  // ─────────────────────────────────────────
  {
    slug: "former_han",
    name: "前漢",
    era: "古代",
    start: -206,
    end: 8,
    capital: "長安",
    color: "#A03000",
    nameAlts: ["前漢", "西漢"],
    quizMatch: ["前漢"],
    territories: [{ name: "前漢", ratio: 1 }],
    systems: ["郡国制", "儒教国教化（武帝）", "察挙制", "塩鉄専売", "刺史制"],
    figures: ["劉邦（高祖）", "呂后", "文帝", "景帝", "武帝", "司馬遷", "班固"],
    culture: "儒教の官学化（董仲舒）、シルクロード開通（張騫）、太学設置",
    notes: "高祖劉邦が秦滅亡後に建国。武帝期に最盛。王莽の簒奪で終わる。",
  },

  // ─────────────────────────────────────────
  //  新  Xin Dynasty
  //  ※ small:true → map.html で小ノード表示
  // ─────────────────────────────────────────
  {
    slug: "xin",
    name: "新",
    era: "古代",
    start: 8,
    end: 23,
    capital: "長安",
    color: "#6A4020",
    small: true, // map.html で縮小ノードとして表示
    nameAlts: ["新朝"],
    quizMatch: [], // 受験クイズ対象外
    territories: [{ name: "新", ratio: 1 }],
    systems: ["王田制（土地改革）", "五均六筦（商業統制）"],
    figures: ["王莽"],
    culture: "儒家的復古主義改革。急進的政策が混乱を招く。",
    notes: "王莽が前漢の外戚から帝位を簒奪。農民反乱（赤眉の乱）で崩壊。",
  },

  // ─────────────────────────────────────────
  //  後漢  Later Han
  // ─────────────────────────────────────────
  {
    slug: "later_han",
    name: "後漢",
    era: "古代",
    start: 25,
    end: 220,
    capital: "洛陽",
    color: "#8B2500",
    nameAlts: ["後漢", "東漢"],
    quizMatch: ["後漢"],
    territories: [{ name: "後漢", ratio: 1 }],
    systems: ["豪族連合政権", "外戚・宦官の対立", "察挙制継続", "党錮の禁"],
    figures: ["光武帝", "班固", "班超", "蔡倫", "張仲景", "張角"],
    culture: "紙の実用化（蔡倫）、仏教伝来、後漢書・漢書の編纂",
    notes: "光武帝が赤眉の乱を平定し再建。黄巾の乱（184年）で実質崩壊。",
    timeline: {
      groups: [
        {
          label: null,
          tracks: [
            { name: "前漢", start: -206, end: 8, color: "#A03000" },
            { name: "新", start: 8, end: 23, color: "#6A4020" },
            { name: "後漢", start: 25, end: 220, color: "#8B2500" },
          ],
        },
      ],
    },
  },

  // ════════════════════════════════════
  //  分裂の時代
  // ════════════════════════════════════

  {
    slug: "three_kingdoms",
    name: "三国時代",
    era: "分裂の時代",
    start: 220,
    end: 280,
    capital: "魏:洛陽 / 蜀:成都 / 呉:建業",
    color: "#4A6741",
    nameAlts: ["三国", "魏", "呉", "蜀", "西晋"],
    quizMatch: ["三国"],
    territories: [
      { name: "魏", ratio: 0.34 },
      { name: "蜀", ratio: 0.33 },
      { name: "呉", ratio: 0.33 },
    ],
    systems: ["九品中正法（魏）", "屯田制", "租調制"],
    figures: ["曹操", "曹丕", "劉備", "孫権", "諸葛亮", "司馬懿"],
    culture: "三国志演義の舞台。群雄割拠と英雄時代。",
    notes: "263年魏が蜀を滅ぼし、265年西晋へ。280年西晋が呉を平定。",
    timeline: {
      groups: [
        {
          label: null,
          tracks: [
            { name: "魏", start: 220, end: 265, color: "#5C7A5C" },
            { name: "蜀", start: 221, end: 263, color: "#8A6A4A" },
            { name: "呉", start: 229, end: 280, color: "#5C6A7A" },
            { name: "西晋", start: 265, end: 280, color: "#8B7355" },
          ],
        },
      ],
    },
  },

  {
    slug: "western_jin",
    name: "西晋",
    era: "分裂の時代",
    start: 265,
    end: 316,
    capital: "洛陽",
    color: "#8B7355",
    nameAlts: ["西晋"],
    quizMatch: ["西晋"],
    territories: [{ name: "晋", ratio: 1 }],
    systems: ["占田・課田法", "九品中正法継続"],
    figures: ["司馬炎", "王羲之"],
    culture: "短期統一。貴族社会の発展。",
    notes: "291–306年の八王の乱で弱体化。316年に匈奴に滅ぼされる。",
  },

  {
    slug: "eastern_jin_and_sixteen_kingdoms",
    name: "東晋・五胡十六国",
    era: "分裂の時代",
    start: 304,
    end: 439,
    capital: "建康（東晋） / 各地（諸国）",
    color: "#6A7A5A",
    nameAlts: [
      "東晋",
      "五胡",
      "十六国",
      "前趙",
      "後趙",
      "前秦",
      "後秦",
      "前燕",
    ],
    quizMatch: ["東晋"],
    territories: [
      { name: "東晋", ratio: 0.4 },
      { name: "五胡", ratio: 0.6 },
    ],
    systems: ["門閥貴族制（東晋）", "僑州僑郡制", "胡漢融合", "仏教興隆"],
    figures: ["司馬睿", "王導", "謝安", "苻堅", "劉裕"],
    culture: "六朝文化の基盤。民族大移動と文化融合。",
    notes: "淝水の戦い（383年）で前秦が敗れ、華北再び分裂。",
    timeline: {
      groups: [
        {
          label: "江南",
          tracks: [{ name: "東晋", start: 317, end: 420, color: "#7A8A6A" }],
        },
        {
          label: "華北（代表）",
          tracks: [
            { name: "前趙", start: 304, end: 329, color: "#9A7A5A" },
            { name: "後趙", start: 319, end: 351, color: "#8A6A4A" },
            { name: "前秦", start: 351, end: 394, color: "#7A5A3A" },
            { name: "後秦", start: 384, end: 417, color: "#6A4A2A" },
            { name: "北魏", start: 386, end: 439, color: "#5A7A8A" },
          ],
        },
      ],
    },
  },

  {
    slug: "northern_and_southern_dynasties",
    name: "南北朝時代",
    era: "分裂の時代",
    start: 420,
    end: 589,
    capital: "建康（南朝） / 平城→洛陽（北朝）",
    color: "#5A7080",
    nameAlts: [
      "南朝",
      "北朝",
      "北魏",
      "東魏",
      "西魏",
      "北斉",
      "北周",
      "宋",
      "斉",
      "梁",
      "陳",
    ],
    quizMatch: ["南北朝", "北魏"],
    territories: [
      { name: "北朝", ratio: 0.5 },
      { name: "南朝", ratio: 0.5 },
    ],
    systems: [
      "均田制（北朝）",
      "府兵制",
      "三長制",
      "九品中正法（南朝）",
      "漢化政策",
    ],
    figures: ["孝文帝", "達磨", "陶弘景", "蕭衍（梁武帝）"],
    culture: "胡漢融合。雲岡・龍門石窟。六朝文学。",
    notes: null,
    timeline: {
      groups: [
        {
          label: "北朝",
          tracks: [
            { name: "北魏", start: 386, end: 534, color: "#5C7A8A" },
            { name: "東魏", start: 534, end: 550, color: "#4A6878" },
            { name: "北斉", start: 550, end: 577, color: "#3A5868" },
            { name: "西魏", start: 535, end: 557, color: "#6A7A8A" },
            { name: "北周", start: 557, end: 581, color: "#7A8A9A" },
          ],
        },
        {
          label: "南朝",
          tracks: [
            { name: "宋", start: 420, end: 479, color: "#8A5C6A" },
            { name: "斉", start: 479, end: 502, color: "#7A4A5A" },
            { name: "梁", start: 502, end: 557, color: "#6A3A4A" },
            { name: "陳", start: 557, end: 589, color: "#5A2A3A" },
          ],
        },
      ],
    },
  },

  // ════════════════════════════════════
  //  隋・唐の時代
  // ════════════════════════════════════

  {
    slug: "sui",
    name: "隋",
    era: "隋・唐の時代",
    start: 581,
    end: 618,
    capital: "大興城（長安）",
    color: "#A07830",
    nameAlts: ["隋"],
    quizMatch: ["隋"],
    territories: [{ name: "隋", ratio: 1 }],
    systems: ["科挙制創設", "均田制継続", "租庸調制", "三省六部制整備"],
    figures: ["楊堅（文帝）", "楊広（煬帝）"],
    culture: "南北統一。大運河建設。",
    notes: "高句麗遠征の失敗と重税で農民反乱。37年で滅亡。",
  },

  {
    slug: "tang",
    name: "唐",
    era: "隋・唐の時代",
    start: 618,
    end: 907,
    capital: "長安",
    color: "#C8860A",
    nameAlts: ["唐"],
    quizMatch: ["唐"],
    territories: [{ name: "唐", ratio: 1 }],
    systems: [
      "三省六部制",
      "科挙制発展",
      "律令制完成",
      "均田制→両税法",
      "節度使",
    ],
    figures: [
      "李淵",
      "李世民（太宗）",
      "則天武后",
      "玄宗",
      "李白",
      "杜甫",
      "白居易",
      "玄奘",
    ],
    culture: "国際都市長安。詩文最盛期。仏教・道教・ゾロアスター教が共存。",
    notes: "755–763年の安史の乱が転換点。節度使の割拠で衰退。",
  },

  // ════════════════════════════════════
  //  五代十国
  // ════════════════════════════════════

  {
    slug: "five_dynasties",
    name: "五代十国",
    era: "五代十国",
    start: 907,
    end: 979,
    capital: "開封（五代） / 各地（十国）",
    color: "#707060",
    nameAlts: ["五代", "後梁", "後唐", "後晋", "後漢", "後周", "十国"],
    quizMatch: [],
    territories: [
      { name: "後梁", ratio: 0.2 },
      { name: "後唐", ratio: 0.2 },
      { name: "後晋", ratio: 0.2 },
      { name: "後漢", ratio: 0.2 },
      { name: "後周", ratio: 0.2 },
    ],
    systems: ["藩鎮割拠", "武人政権"],
    figures: ["朱全忠", "李存勗", "柴栄", "趙匡胤"],
    culture: "分裂混乱期。南方十国では経済・文化が継続発展。",
    notes: "華北で五つの短命王朝が交替。江南では十国が並立。",
    timeline: {
      groups: [
        {
          label: "華北（五代）",
          tracks: [
            { name: "後梁", start: 907, end: 923, color: "#807060" },
            { name: "後唐", start: 923, end: 936, color: "#706050" },
            { name: "後晋", start: 936, end: 947, color: "#605040" },
            { name: "後漢", start: 947, end: 951, color: "#504030" },
            { name: "後周", start: 951, end: 960, color: "#908070" },
          ],
        },
        {
          label: "江南（十国・代表）",
          tracks: [
            { name: "呉越", start: 907, end: 978, color: "#6A7A6A" },
            { name: "南唐", start: 937, end: 975, color: "#5A6A5A" },
            { name: "前蜀", start: 907, end: 925, color: "#7A6A5A" },
            { name: "後蜀", start: 934, end: 965, color: "#6A5A4A" },
          ],
        },
      ],
    },
  },

  // ════════════════════════════════════
  //  宋と異民族国家
  // ════════════════════════════════════

  {
    slug: "song_and_steppe_empires",
    name: "宋と異民族国家",
    era: "宋と異民族国家",
    start: 916,
    end: 1279,
    capital: "開封（北宋）→ 臨安（南宋）/ 上京（遼）/ 中都（金）",
    color: "#2C6E8A",
    nameAlts: ["北宋", "南宋", "遼", "西夏", "金"],
    quizMatch: ["北宋", "南宋", "宋"],
    territories: [
      { name: "北宋", ratio: 0.34 },
      { name: "遼", ratio: 0.33 },
      { name: "西夏", ratio: 0.33 },
    ],
    systems: [
      "文治主義",
      "科挙拡大",
      "募兵制",
      "澶淵の盟",
      "海上貿易",
      "市舶司",
      "猛安謀克制（金）",
    ],
    figures: [
      "趙匡胤",
      "王安石",
      "司馬光",
      "朱熹",
      "岳飛",
      "耶律阿保機",
      "完顔阿骨打",
    ],
    culture: "宋学（朱子学）。活版印刷・火薬・羅針盤。江南経済の発展。",
    notes: "遼→金→元という北方勢力の交替が宋の命運を左右した。",
    timeline: {
      groups: [
        {
          label: "中原・江南",
          tracks: [
            { name: "北宋", start: 960, end: 1127, color: "#3A7A9A" },
            { name: "南宋", start: 1127, end: 1279, color: "#2A6A8A" },
          ],
        },
        {
          label: "北方",
          tracks: [
            { name: "遼", start: 916, end: 1125, color: "#7A6A4A" },
            { name: "西夏", start: 1038, end: 1227, color: "#8A7A5A" },
            { name: "金", start: 1115, end: 1234, color: "#6A5A3A" },
          ],
        },
      ],
    },
  },

  // ════════════════════════════════════
  //  元・明・清
  // ════════════════════════════════════

  {
    slug: "yuan",
    name: "元",
    era: "元・明・清",
    start: 1271,
    end: 1368,
    capital: "大都（北京）",
    color: "#4A7A6A",
    nameAlts: ["元", "モンゴル"],
    quizMatch: ["元"],
    territories: [{ name: "元", ratio: 1 }],
    systems: [
      "モンゴル第一主義",
      "四等人制",
      "色目人優遇",
      "駅伝制（ジャムチ）",
    ],
    figures: ["チンギス・ハン", "フビライ・ハン", "マルコ・ポーロ"],
    culture: "東西交流の活発化。元曲（演劇）。交鈔（紙幣）。",
    notes: "1271年フビライが国号を元と定める。1279年南宋滅亡で中国統一。",
  },

  {
    slug: "ming",
    name: "明",
    era: "元・明・清",
    start: 1368,
    end: 1644,
    capital: "南京 → 北京",
    color: "#8B1A1A",
    nameAlts: ["明"],
    quizMatch: ["明"],
    territories: [{ name: "明", ratio: 1 }],
    systems: [
      "六部直属制（宰相廃止）",
      "里甲制",
      "一条鞭法",
      "海禁→朝貢貿易",
      "東林党",
    ],
    figures: ["朱元璋（洪武帝）", "永楽帝", "鄭和", "王陽明", "張居正"],
    culture: "陽明学。紫禁城建設。鄭和の南海遠征（1405–1433）。",
    notes: "後期は宦官専横・財政悪化。1644年李自成の乱で滅亡。",
  },

  {
    slug: "qing",
    name: "清",
    era: "元・明・清",
    start: 1616,
    end: 1912,
    capital: "北京",
    color: "#1A4A5C",
    nameAlts: ["清", "後金"],
    quizMatch: ["清"],
    territories: [{ name: "清", ratio: 1 }],
    systems: ["八旗制", "六部", "理藩院", "地丁銀制", "軍機処"],
    figures: ["ヌルハチ", "康熙帝", "雍正帝", "乾隆帝", "林則徐"],
    culture: "満洲族支配。最大版図。考証学。アヘン戦争以降の半植民地化。",
    notes: "1616年後金建国 → 1636年清に改称 → 1644年北京入城。",
    timeline: {
      groups: [
        {
          label: null,
          tracks: [
            { name: "後金", start: 1616, end: 1636, color: "#2A5A6C" },
            { name: "清", start: 1636, end: 1912, color: "#1A4A5C" },
          ],
        },
      ],
    },
  },
];

// ─────────────────────────────────────
//  ユーティリティ
// ─────────────────────────────────────

// slug → dynasty オブジェクトの逆引き
const DYNASTY_MAP = Object.fromEntries(DYNASTIES.map((d) => [d.slug, d]));

// era でグループ化（index.html のカードグリッド生成用）
// era の表示順を固定する
const ERA_ORDER = [
  "古代",
  "分裂の時代",
  "隋・唐の時代",
  "五代十国",
  "宋と異民族国家",
  "元・明・清",
];

const DYNASTIES_BY_ERA = ERA_ORDER.reduce((acc, era) => {
  const items = DYNASTIES.filter((d) => d.era === era);
  if (items.length) acc[era] = items;
  return acc;
}, {});

// 年 → 所属する dynasty を返す（timeline.html のグループ化用）
// 複数マッチの場合は最初にヒットしたものを返す
function dynastyForYear(year) {
  return DYNASTIES.find((d) => year >= d.start && year <= d.end) ?? null;
}

// 年を表示文字列に変換
function formatYear(year) {
  return year < 0 ? `前${Math.abs(year)}` : String(year);
}

// 王朝の期間文字列（例: 「前206–8」「618–907」）
function formatPeriod(d) {
  return `${formatYear(d.start)}–${formatYear(d.end)}`;
}
