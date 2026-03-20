// ═══════════════════════════════════════════════════════════════
// config.js — フラッシュカード設定ファイル
//
// ★ このファイルだけ編集すれば、どの教科にも使い回せます ★
// ═══════════════════════════════════════════════════════════════

const APP_CONFIG = {

  // ── アプリ見出し ──────────────────────────────────────────────
  title:    '世界史',
  titleKana:'せかいし',
  titleSub: 'WORLD HISTORY QUIZ',

  // ── カテゴリ定義 ──────────────────────────────────────────────
  // key: コード名（英字・短め）
  // label: 表示名
  // color: バッジ・ドットのアクセントカラー（CSSカラー値）
  categories: {
    ancient:  { label: '古代文明',  color: '#7b5ea7' },
    medieval: { label: '中近世',   color: '#c07030' },
    modern:   { label: '近現代',   color: '#2a6641' },
  },

  // ── Supabase（任意） ──────────────────────────────────────────
  supabaseUrl:     '',   // 例: 'https://xxxx.supabase.co'
  supabaseAnonKey: '',
  tableName:       'flashcard_questions',   // テーブル名を自由に変更可

  // ── デフォルト問題（Supabase未設定時のサンプル） ──────────────
  // id: 一意の数値
  // category: 上のcategoriesのkeyと一致させる
  // question / answer / explanation / image_url
  defaultQuestions: [
    // 古代文明
    { id:1,  category:'ancient',  question:'四大文明のうち、チグリス・ユーフラテス川流域に栄えたのは？',    answer:'メソポタミア文明',       explanation:'現在のイラク周辺。シュメール人が楔形文字を発明。ハンムラビ法典で有名。', image_url:'' },
    { id:2,  category:'ancient',  question:'古代エジプトで死者の書に登場する冥界の神は？',                 answer:'オシリス',               explanation:'ホルスの父。妻イシスに復活させられた。審判の神として魂を量る。', image_url:'' },
    { id:3,  category:'ancient',  question:'アレクサンドロス大王が建設した最大の都市は？',                 answer:'アレクサンドリア（エジプト）', explanation:'現在のエジプト北部。ムセイオン（図書館）で知られるヘレニズム文化の中心。', image_url:'' },
    { id:4,  category:'ancient',  question:'ローマの「内乱の一世紀」を終結させた初代皇帝は？',             answer:'アウグストゥス（オクタウィアヌス）', explanation:'前27年、元老院よりアウグストゥスの称号を受けた。プリンキパトス（元首政）開始。', image_url:'' },
    { id:5,  category:'ancient',  question:'秦の始皇帝が行った統一政策を2つ挙げよ。',                     answer:'文字・度量衡・貨幣の統一（例：小篆・半両銭）', explanation:'郡県制も実施。万里の長城を整備し北方遊牧民に対抗した。', image_url:'' },
    { id:6,  category:'ancient',  question:'インダス文明の代表的な都市2つは？',                           answer:'モヘンジョ＝ダロとハラッパー', explanation:'紀元前2600年頃繁栄。整備された排水施設・計画都市が特徴。', image_url:'' },
    { id:7,  category:'ancient',  question:'ギリシアのポリスで民主政を確立した政治家は（前5世紀）？',     answer:'ペリクレス',             explanation:'民会中心の直接民主政。アクロポリスにパルテノン神殿を建設。', image_url:'' },

    // 中近世
    { id:8,  category:'medieval', question:'イスラーム教が成立したのはいつ、誰によって？',                 answer:'7世紀初頭・ムハンマド（マホメット）', explanation:'610年頃、メッカ近郊で啓示を受ける。622年のヒジュラ（聖遷）がイスラーム暦元年。', image_url:'' },
    { id:9,  category:'medieval', question:'封建制度において「御恩と奉公」の関係を結ぶのは誰と誰か？',   answer:'国王（上位の主君）と騎士（家臣）', explanation:'主君は土地（采地）を与え、家臣は軍役・忠誠を誓う双務的契約関係。', image_url:'' },
    { id:10, category:'medieval', question:'十字軍遠征の直接的きっかけとなった教皇の呼びかけは？',       answer:'クレルモン公会議（1095年）・教皇ウルバヌス2世', explanation:'セルジューク朝のビザンツ侵攻に対し聖地奪還を宣言。第1回十字軍へ。', image_url:'' },
    { id:11, category:'medieval', question:'モンゴル帝国最大版図を実現した人物は？',                     answer:'フビライ・ハン（元の世祖）', explanation:'祖父チンギス・ハンの基礎の上に宋を滅ぼし元朝を成立。日本へ元寇。', image_url:'' },
    { id:12, category:'medieval', question:'ルネサンスが最初に開花したイタリアの都市は？',               answer:'フィレンツェ（メディチ家の保護）', explanation:'14〜15世紀。ダンテ・ボッティチェリ・レオナルド・ダ・ヴィンチらが活躍。', image_url:'' },
    { id:13, category:'medieval', question:'宗教改革の端緒となったルターの行動は？',                     answer:'1517年、95か条の論題の公表', explanation:'贖宥状（免罪符）販売批判。聖書中心主義・信仰義認説を主張。プロテスタントの源流。', image_url:'' },
    { id:14, category:'medieval', question:'オスマン帝国がコンスタンティノープルを征服した年は？',       answer:'1453年',               explanation:'メフメト2世がビザンツ帝国を滅ぼす。東ローマ帝国の終焉。', image_url:'' },

    // 近現代
    { id:15, category:'modern',   question:'フランス革命のきっかけとなった1789年の民衆の行動は？',       answer:'バスティーユ牢獄の襲撃（7月14日）', explanation:'旧体制（アンシャン・レジーム）への不満が爆発。現在もフランス革命記念日。', image_url:'' },
    { id:16, category:'modern',   question:'産業革命を最初に経験した国はどこか？またその背景は？',       answer:'イギリス。豊富な石炭・鉄・資本・植民地市場が背景', explanation:'18世紀後半〜蒸気機関（ワット）・紡績機の発明が連鎖的技術革新を生む。', image_url:'' },
    { id:17, category:'modern',   question:'南北戦争（1861〜65年）でリンカン大統領が出した宣言は？',   answer:'奴隷解放宣言（1863年）',  explanation:'南部の反乱州の奴隷を解放。戦後第13条修正で奴隷制度を全廃。', image_url:'' },
    { id:18, category:'modern',   question:'第一次世界大戦の引き金となった事件は？',                     answer:'サライェボ事件（1914年）', explanation:'オーストリア皇太子夫妻暗殺。同盟・協商の連鎖で総力戦に拡大。', image_url:'' },
    { id:19, category:'modern',   question:'ロシア革命（1917年）で権力を握った指導者は？',              answer:'レーニン（ボリシェヴィキ）', explanation:'十月革命で臨時政府を打倒。世界初の社会主義国家・ソヴィエト政権樹立。', image_url:'' },
    { id:20, category:'modern',   question:'冷戦終結を象徴するベルリンの壁崩壊は何年か？',              answer:'1989年11月9日',         explanation:'東欧革命の連鎖の一環。翌1991年にソ連崩壊し冷戦体制が終わる。', image_url:'' },
    { id:21, category:'modern',   question:'国際連合が設立されたのはいつ、前身の組織は？',              answer:'1945年。前身は国際連盟（1920年〜）', explanation:'二次大戦後、サンフランシスコ会議で国連憲章採択。安全保障理事会が中心機関。', image_url:'' },
    { id:22, category:'modern',   question:'インドの独立（1947年）を指導した非暴力・不服従運動の指導者は？', answer:'マハトマ・ガンジー',     explanation:'塩の行進（1930）など。パキスタンとの分離独立も同年。', image_url:'' },
  ],
};
