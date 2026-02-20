// ═══════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════
const DATA = [
  { name:"む",             setsuzo:"未然形",                    katsuyo:"四段型",     imi:"推量・意志・適当・勧誘・仮定・婉曲",    mizen:"○",        renyo:"－",             shushi:"む",       rentai:"む・ん",      kizen:"め",            meirei:"－" },
  { name:"べし",           setsuzo:"終止形（ラ変は連体形）",    katsuyo:"形容詞型",   imi:"推量・意志・可能・当然・命令・適当",    mizen:"べかろ",   renyo:"べく・べかり",   shushi:"べし",     rentai:"べき・べかる",kizen:"べけれ",        meirei:"－" },
  { name:"まし",           setsuzo:"未然形",                    katsuyo:"特殊型",     imi:"反実仮想・ためらいの意志",              mizen:"ましか",   renyo:"－",             shushi:"まし",     rentai:"まし",        kizen:"ましか",        meirei:"－" },
  { name:"じ",             setsuzo:"未然形",                    katsuyo:"無変化型",   imi:"打消推量・打消意志",                    mizen:"－",       renyo:"－",             shushi:"じ",       rentai:"じ",          kizen:"－",            meirei:"－" },
  { name:"まじ",           setsuzo:"終止形（ラ変は連体形）",    katsuyo:"形容詞型",   imi:"打消推量・打消意志・打消当然・不可能",  mizen:"まじかろ", renyo:"まじく・まじかり",shushi:"まじ",    rentai:"まじき・まじかる",kizen:"まじけれ",    meirei:"－" },
  { name:"ず",             setsuzo:"未然形",                    katsuyo:"特殊型",     imi:"打消",                                  mizen:"ず・ざら", renyo:"ず・ざり",       shushi:"ず",       rentai:"ぬ・ざる",    kizen:"ね・ざれ",      meirei:"ざれ" },
  { name:"き",             setsuzo:"連用形",                    katsuyo:"特殊型",     imi:"過去（直接体験）",                      mizen:"せ",       renyo:"－",             shushi:"き",       rentai:"し",          kizen:"しか",          meirei:"－" },
  { name:"けり",           setsuzo:"連用形",                    katsuyo:"ラ変型",     imi:"過去（間接体験）・詠嘆",                mizen:"けら",     renyo:"－",             shushi:"けり",     rentai:"ける",        kizen:"けれ",          meirei:"－" },
  { name:"つ",             setsuzo:"連用形",                    katsuyo:"下二段型",   imi:"完了・強意",                            mizen:"て",       renyo:"て",             shushi:"つ",       rentai:"つる",        kizen:"つれ",          meirei:"てよ" },
  { name:"ぬ",             setsuzo:"連用形",                    katsuyo:"ナ変型",     imi:"完了・強意",                            mizen:"な",       renyo:"に",             shushi:"ぬ",       rentai:"ぬる",        kizen:"ぬれ",          meirei:"ね" },
  { name:"たり（完了）",   setsuzo:"連用形",                    katsuyo:"ラ変型",     imi:"完了・存続",                            mizen:"たら",     renyo:"たり・て",       shushi:"たり",     rentai:"たる",        kizen:"たれ",          meirei:"たれ" },
  { name:"り",             setsuzo:"サ変未然形・四段已然形",    katsuyo:"ラ変型",     imi:"完了・存続",                            mizen:"ら",       renyo:"り",             shushi:"り",       rentai:"る",          kizen:"れ",            meirei:"れ" },
  { name:"らむ",           setsuzo:"終止形（ラ変は連体形）",    katsuyo:"四段型",     imi:"現在推量・原因推量・伝聞・婉曲",        mizen:"－",       renyo:"－",             shushi:"らむ",     rentai:"らむ",        kizen:"らめ",          meirei:"－" },
  { name:"けむ",           setsuzo:"連用形",                    katsuyo:"四段型",     imi:"過去推量・原因推量・伝聞・婉曲",        mizen:"－",       renyo:"－",             shushi:"けむ",     rentai:"けむ",        kizen:"けめ",          meirei:"－" },
  { name:"なり（断定）",   setsuzo:"体言・連体形",              katsuyo:"ラ変型",     imi:"断定・存在",                            mizen:"なら",     renyo:"なり・に",       shushi:"なり",     rentai:"なる",        kizen:"なれ",          meirei:"なれ" },
  { name:"なり（伝聞）",   setsuzo:"終止形（ラ変は連体形）",    katsuyo:"ラ変型",     imi:"伝聞・推定",                            mizen:"－",       renyo:"なり",           shushi:"なり",     rentai:"なる",        kizen:"なれ",          meirei:"－" },
  { name:"たり（断定）",   setsuzo:"体言",                      katsuyo:"ラ変型",     imi:"断定",                                  mizen:"たら",     renyo:"たり・と",       shushi:"たり",     rentai:"たる",        kizen:"たれ",          meirei:"たれ" },
  { name:"す・さす",       setsuzo:"未然形",                    katsuyo:"下二段型",   imi:"使役・尊敬",                            mizen:"せ・させ", renyo:"せ・させ",       shushi:"す・さす", rentai:"する・さする",kizen:"すれ・さすれ",  meirei:"せよ・させよ" },
  { name:"しむ",           setsuzo:"未然形",                    katsuyo:"下二段型",   imi:"使役・尊敬",                            mizen:"しめ",     renyo:"しめ",           shushi:"しむ",     rentai:"しむる",      kizen:"しむれ",        meirei:"しめよ" },
  { name:"ゆ・らゆ",       setsuzo:"未然形",                    katsuyo:"下二段型",   imi:"受身・自発・可能・尊敬",                mizen:"ゆ・らゆ", renyo:"ゆ・らゆ",       shushi:"ゆ・らゆ", rentai:"ゆる・らゆる",kizen:"ゆれ・らゆれ",  meirei:"よ・らよ" },
];

const COL_KEYS   = ['setsuzo','katsuyo','imi','mizen','renyo','shushi','rentai','kizen','meirei'];
const COL_LABELS = { setsuzo:"接続", katsuyo:"活用の種類", imi:"意味", mizen:"未然形", renyo:"連用形", shushi:"終止形", rentai:"連体形", kizen:"已然形", meirei:"命令形" };

const HINTS = {
  setsuzo: r => `ヒント：活用の種類は「${r.katsuyo}」。`,
  katsuyo: r => `ヒント：終止形は「${r.shushi}」。`,
  imi:     r => `ヒント：接続は「${r.setsuzo}」に付く。`,
  mizen:   r => `ヒント：活用の種類は「${r.katsuyo}」型に準じる。`,
  renyo:   r => `ヒント：活用の種類は「${r.katsuyo}」型に準じる。`,
  shushi:  r => `ヒント：この助動詞の基本形（辞書形）。`,
  rentai:  r => `ヒント：活用の種類は「${r.katsuyo}」型。`,
  kizen:   r => `ヒント：已然形は「〜ば」などに接続する形。`,
  meirei:  r => `ヒント：命令形がない助動詞は「－」と答えよう。`,
};