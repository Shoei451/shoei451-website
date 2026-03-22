# sync.js 使い方ガイド

Obsidian と shoei451-website の `docs/md/` フォルダを同期するスクリプト。

---

## ファイル構成

リポジトリのルートに2ファイルを置く。

```
shoei451-website/
├── sync.js          # 同期スクリプト本体（編集不要）
├── sync-config.js   # 設定ファイル（パスや動作をここで変える）
└── docs/
    └── md/          # website 側の md フォルダ
```

`sync-config.js` を別の場所に置きたい場合は `--config` オプションで指定できる（後述）。

---

## セットアップ

### 1. sync-config.js を編集する

最低限、以下の3箇所を自分の環境に合わせて書き換える。

```js
obsidianDir: "C:/Users/YourName/Documents/Obsidian/Vault/website-docs",
websiteDir:  "C:/Users/YourName/Projects/shoei451-website/docs/md",
buildScript: "C:/Users/YourName/Projects/shoei451-website/docs/build.js",
```

パスの区切り文字は Windows でも `/` で書いてよい。

### 2. 動作確認（dry-run）

実際にはコピーせず、何が起きるかだけ確認する。

```bash
node sync.js --dry-run
```

問題なければ本番実行へ。

---

## 基本的な使い方

```bash
# 確認プロンプトあり（推奨）
node sync.js

# 確認なし・一発実行
node sync.js --yes
```

実行すると以下の順で動く。

1. `obsidianDir` と `websiteDir` の `.md` ファイルを列挙
2. `exclude` に一致するファイルを除外
3. 差分をプレビュー表示
4. 確認後にコピー
5. `buildScript` が設定されていれば `docs/build.js` を実行して `file-tree.js` を再生成

---

## オプション一覧

| オプション | 説明 |
|---|---|
| `--dry-run` | コピーせず差分だけ表示する |
| `--yes` | 確認プロンプトをスキップして即実行 |
| `--no-build` | 同期後の `build.js` 実行をスキップ |
| `--config <path>` | 使う config ファイルを指定 |
| `--direction <mode>` | config の `direction` を一時的に上書き |

```bash
# config を別の場所に置く場合
node sync.js --config ../my-sync.config.js

# direction だけ上書きして obsidian→website の一方向で実行
node sync.js --direction obsidian-to-website --yes
```

---

## sync-config.js 設定リファレンス

### パス設定

```js
obsidianDir: "...",   // Obsidian 側のフォルダ
websiteDir:  "...",   // website 側の docs/md フォルダ
buildScript: "...",   // docs/build.js のパス。null にするとスキップ
```

### direction（同期の方向）

```js
direction: "bidirectional"        // 新しいタイムスタンプを優先する双方向（推奨）
direction: "obsidian-to-website"  // Obsidian → website の一方向
direction: "website-to-obsidian"  // website → Obsidian の一方向
```

### include / exclude（ファイルフィルタ）

```js
// include が空配列 → obsidianDir 内の全 .md が対象
include: [],

// include にファイル名を列挙 → そのファイルだけが対象（拡張子は省略可）
include: ["status", "todo", "changelog"],

// exclude はプレフィックス一致で除外（include より低優先）
exclude: ["_private", "draft-"],
// → "_private.md", "draft-backup.md" などが除外される

// ファイル名の完全一致でも除外できる
exclude: ["secret.md", "_template"],
```

`include` と `exclude` を組み合わせた場合、`include` に含まれていても `exclude` に一致すれば除外される。

### conflictResolution（双方向時の競合解決）

```js
conflictResolution: "newer"          // タイムスタンプが新しい方を使う（推奨）
conflictResolution: "obsidian-wins"  // 常に Obsidian 側を正とする
conflictResolution: "website-wins"   // 常に website 側を正とする
```

`newer` モードでは、タイムスタンプの差が1秒未満のファイルは「同一」とみなしてスキップする。

### その他

```js
dryRunDefault: false,     // true にすると --yes なしでは常に dry-run になる
runBuildAfterSync: true,  // false にすると build.js を常にスキップ
```

---

## package.json に登録する（任意）

毎回 `node sync.js` と打つのが面倒な場合は `package.json` の `scripts` に追加する。

```json
{
  "scripts": {
    "sync":       "node sync.js --yes",
    "sync:check": "node sync.js --dry-run"
  }
}
```

```bash
npm run sync        # 確認なし即実行
npm run sync:check  # dry-run で確認
```

---

## よくあるケース

### Obsidian で書いた新しいノートを website に反映したい

```bash
node sync.js --yes
```

`bidirectional` + `newer` なら Obsidian 側が新しければ自動的に website にコピーされる。

### website の md を直接編集した後、Obsidian に戻したい

同じく `node sync.js --yes` でよい。website 側のタイムスタンプが新しければ Obsidian 方向にコピーされる。

### build.js だけ走らせたい（同期はしない）

```bash
node docs/build.js
```

sync.js は経由しなくてよい。

### 特定のファイルだけ同期したい

`sync-config.js` の `include` に対象ファイルを列挙して実行する。終わったら `include: []` に戻す。

```js
include: ["status", "changelog"],
```

### .gitignore に追加すべきか

`sync-config.js` にはローカルの絶対パスが含まれるため、`.gitignore` に追加することを推奨する。

```
sync-config.js
```

代わりに `sync-config.example.js` をリポジトリに含めてテンプレートとして使うとよい。