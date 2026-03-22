// sync-config.js
// Obsidian ↔ website の md ファイル同期設定
// sync.js と同じディレクトリに置くか、--config オプションでパスを指定する

export default {
  // ── パス設定 ──────────────────────────────────────────────
  // Obsidian 側のフォルダ（同期元 or 双方向の片方）
  obsidianDir: "C:/Users/dummy/Documents/obsidian_folder/for_website_md",

  // website 側の md フォルダ（docs/build.js が監視するフォルダ）
  websiteDir: "C:/Users/dummy/Documents/shoei451-website/docs/md",

  // docs/build.js のパス（同期後に実行してfile-tree.jsを再生成する）
  // null にするとビルドステップをスキップ
  buildScript: "C:/Users/dummy/Documents/shoei451-website/docs/build.js",

  // ── 同期モード ─────────────────────────────────────────────
  // "obsidian-to-website" : Obsidian → website への一方向
  // "website-to-obsidian" : website → Obsidian への一方向
  // "bidirectional"       : 新しいタイムスタンプを優先する双方向
  direction: "bidirectional",

  // ── ファイルフィルタ ───────────────────────────────────────
  // include を指定した場合 → そのファイル名のみコピー（拡張子なしでも可）
  // 空配列 [] にすると obsidianDir 内の全 .md ファイルが対象
  include: [],
  // 例: include: ["status", "todo", "changelog"]

  // exclude に含まれるファイル名は除外（include より優先度は低い）
  exclude: ["_private", "draft-"],
  // 名前の先頭一致で除外したい場合はプレフィックスで書く（後述の matchExclude 参照）

  // ── 競合解決（bidirectional のとき） ──────────────────────
  // "newer"  : より新しいタイムスタンプを使う
  // "obsidian-wins" : 常に Obsidian 側を正とする
  // "website-wins"  : 常に website 側を正とする
  conflictResolution: "newer",

  // ── その他 ────────────────────────────────────────────────
  // true にするとコピー前に差分を表示して確認を求める（--yes フラグで skip 可）
  dryRunDefault: false,

  // コピー後に Node で build.js を実行するかどうか（buildScript が null なら無視）
  runBuildAfterSync: true,
};