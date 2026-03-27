/* ============================================================
   DATA — ここを編集するだけでカードが増やせる
   各セクション: { id, title, restricted, items[] }
   各アイテム:   { label, url, keywords }
   ============================================================ */
const DATA = [
  {
    id: 1,
    title: "代謝・酵素・ATP",
    restricted: true,
    items: [
      {
        label: "代謝とATP",
        url: "https://docs.google.com/forms/d/e/1FAIpQLScX0ODmCN24_z0dCfsKMXkucM7-9B_gsRJPKlryMSMwueKGPw/viewform",
        keywords: "代謝 atp",
      },
      {
        label: "呼吸と光合成",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSfcV9SuJF0Lfs__DKXUshgJ0Dsm17Sgz12LQsDp3Y6Ref1G6Q/viewform",
        keywords: "呼吸 光合成",
      },
      {
        label: "酵素",
        url: "https://docs.google.com/forms/d/e/1FAIpQLScKTyPPPOBYWj8tUqUCyr4Q16pW-1XsW73xYtF41h_eBUQ33Q/viewform",
        keywords: "酵素",
      },
    ],
  },
  {
    id: 2,
    title: "遺伝子とDNA",
    restricted: true,
    items: [
      {
        label: "遺伝子の本体の証明",
        url: "https://docs.google.com/forms/d/e/1FAIpQLScJS31fdJf_l6wdU1ehkj_ergP0IfGVHLLpXNbr18VsP0CBuQ/viewform",
        keywords: "遺伝子 本体 証明",
      },
      {
        label: "DNAの構造",
        url: "https://docs.google.com/forms/d/e/1FAIpQLScMZN7PisMIpYbjGloWoxTFVQBLkkmFA6ckrwH4IjVwzCc-iA/viewform",
        keywords: "dna 構造",
      },
      {
        label: "遺伝情報の複製",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSdX4nUW_dlNDtIeKm1m139At9jDar_BRH9roGL06lXuTDvRCA/viewform",
        keywords: "遺伝情報 複製",
      },
      {
        label: "遺伝情報の分配（体細胞分裂）",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSdIifmFzYPx0byLtP2qtkgcmqaYa6ivDCivibHmjwBpcqviWQ/viewform",
        keywords: "遺伝情報 体細胞分裂 分配",
      },
    ],
  },
  {
    id: 3,
    title: "タンパク質の合成",
    restricted: true,
    items: [
      {
        label: "アミノ酸・タンパク質の構造",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSdBXAW1YpmMBkmVamN4XhUCWzZIyqY_6C5a31PAckEIkHRfFQ/viewform",
        keywords: "アミノ酸 タンパク質 構造",
      },
      {
        label: "転写",
        url: "https://forms.gle/hfE5FpKRCxVVz9389",
        keywords: "転写",
      },
      {
        label: "翻訳",
        url: "https://forms.gle/278TJirESMsoDRYRA",
        keywords: "翻訳 タンパク質合成",
      },
      {
        label: "全能性とゲノム",
        url: "https://forms.gle/7ZwmkFnPFiSKNMcy5",
        keywords: "全能性 ゲノム",
      },
    ],
  },
  {
    id: 4,
    title: "情報伝達・ホルモン系",
    restricted: true,
    items: [
      {
        label: "体内での情報伝達",
        url: "https://forms.gle/ZV9T7Jjgx32VsfWn9",
        keywords: "情報伝達 神経 ホルモン",
      },
      {
        label: "自律神経系",
        url: "https://forms.gle/h1tZrBvHzPTEx29Z7",
        keywords: "自律神経 系統",
      },
      {
        label: "内分泌腺とホルモン",
        url: "https://forms.gle/cUDjLfwLR26ea3nHA",
        keywords: "内分泌 ホルモン",
      },
    ],
  },
  {
    id: 5,
    title: "体内環境の維持",
    restricted: true,
    items: [
      {
        label: "体内環境維持のしくみ",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSeV7NmK7hKWEasM-Zm6hrMFDP2PyS74EinLLyu0IcOpR1AKXA/viewform",
        keywords: "体内環境 恒常性",
      },
      {
        label: "糖尿病と腎臓・尿",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSd2xtyZTLmHDt0d7o1JxiX2P_WIeamyQ_bniraeB2RTS7G96w/viewform",
        keywords: "糖尿病 腎臓 尿",
      },
    ],
  },
  {
    id: 6,
    title: "血液・体液・免疫",
    restricted: true,
    items: [
      {
        label: "血液の循環",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSdKX_NdvGaa3CWA0O_VhIqT1QYCm4FfLc-StaWXDmYikh7ktA/viewform",
        keywords: "血液 循環 体液",
      },
      {
        label: "血液凝固・浸透圧",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSdboAUni4JBtP55GGYnFqh_MO-Fjdmd-f672NFQenR5pB1uVQ/viewform",
        keywords: "血液凝固 浸透圧",
      },
      {
        label: "免疫",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSfh2fme01hcwpMzsBGXvL2vMWBCpOwANae8DBwI5nBOWoIssw/viewform",
        keywords: "免疫 仕組み",
      },
    ],
  },
  {
    id: 7,
    title: "生態系",
    restricted: false,
    items: [
      {
        label: "乾性遷移と湿性遷移",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSehJzajPNu0PsCTXKL8d0kVvr0HscakZMBbSdcYZjWBQEEY_A/viewform",
        keywords: "遷移 乾性 湿性",
      },
      {
        label: "バイオーム",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSd1op_ZaNSaqSDjh8IGGgm1VthADwqNKmL2wv2-XT5FJF_J0Q/viewform",
        keywords: "バイオーム 気候 植生",
      },
      {
        label: "生態系と物質の循環",
        url: "https://docs.google.com/forms/d/e/1FAIpQLScxp8oGm8aI4vSzzR1NHxhEB0udF2pGlaYiX-vNVRmlmexiEQ/viewform",
        keywords: "生態系 物質 循環",
      },
      {
        label: "生態系における物質収支",
        url: "https://docs.google.com/forms/d/e/1FAIpQLScNImBuaIHPG_4NcE5GH1aoy_kbGEeyFdcrQCOGYEU7mnJJeg/viewform",
        keywords: "生態系 収支 環境",
      },
    ],
  },
];
