// ============================================================
//  Config — ここだけ編集
// ============================================================
const CONFIG = {
  // Token はここに書かない。
  // Netlify → Site configuration → Environment variables に
  // RAINDROP_TOKEN = <test token> を設定すること。

  // 公開するコレクションIDのホワイトリスト
  // RaindropのコレクションURL末尾の数字、またはAPIの _id
  // 空配列 [] にすると全コレクション表示（非推奨）
  ALLOWED_COLLECTIONS: [
    // 12345678,
    // 87654321,
  ],

  // 各コレクションから取得する最大件数（API上限50）
  PER_PAGE: 50,
};
