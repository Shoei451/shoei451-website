# docs/sync.js 使い方ガイド

最終更新: 2026-03-26

Obsidian と `shoei451-website/docs/md/` を同期するスクリプトの運用メモ。

---

## 対象ファイル

このリポジトリで使う同期関連ファイルは `docs/` 配下。

```
shoei451-website/
└── docs/
    ├── sync.js
    ├── sync-config-example.js
    ├── sync-config.js          # ローカル専用（.gitignore）
    ├── build.js
    └── md/
```

---

## セットアップ

### 1. 設定ファイルを作る

```bash
cp docs/sync-config-example.js docs/sync-config.js
```

Windows で `cp` が使えない場合はエクスプローラーでコピーしてよい。

### 2. `docs/sync-config.js` を編集

最低限、以下を自分の環境に合わせる。

```js
obsidianDir: "C:/Users/YourName/Documents/Obsidian/Vault/website-docs",
websiteDir:  "C:/Users/YourName/Documents/Github/shoei451-website/docs/md",
buildScript: "C:/Users/YourName/Documents/Github/shoei451-website/docs/build.js",
```

---

## 実行コマンド

### npm scripts（推奨）

```bash
npm run sync
```

`package.json` では `node docs/sync.js` を実行する設定になっている。

### 直接実行

```bash
node docs/sync.js --dry-run
node docs/sync.js --yes
node docs/sync.js --direction obsidian-to-website --yes
node docs/sync.js --no-build --yes
```

---

## オプション一覧

| オプション | 内容 |
|---|---|
| `--dry-run` | コピーせず差分だけ表示 |
| `--yes` | 確認プロンプトをスキップ |
| `--no-build` | 同期後の `docs/build.js` 実行をスキップ |
| `--config <path>` | 使用する config ファイルを指定 |
| `--direction <mode>` | config の `direction` を一時上書き |

`direction` は `obsidian-to-website` / `website-to-obsidian` / `bidirectional`。

---

## 運用フロー（推奨）

1. `node docs/sync.js --dry-run` で差分確認
2. 問題なければ `npm run sync`（または `node docs/sync.js --yes`）
3. 同期後に `docs/build.js` が自動実行され、`docs/file-tree.js` が更新される
4. 必要なら `npm run check` で全体確認

---

## 注意点

- `docs/sync-config.js` は `.gitignore` 対象（ローカル絶対パスが含まれるため）
- `include` と `exclude` を同時指定した場合、`exclude` に一致したファイルは除外される
- `bidirectional + newer` では、更新時刻差が 1 秒未満のファイルは同一としてスキップされる
