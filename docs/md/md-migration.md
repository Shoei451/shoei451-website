# Markdown 運用方針（Obsidian 連携）

最終更新: 2026-03-26

---

## 1. 現在の正本

このリポジトリでは、`docs/md/` を Markdown の正本として扱う。

- 公開ドキュメント: `docs/md/`
- ビューア: `docs/index.html`
- ツリー生成: `docs/build.js` -> `docs/file-tree.js`

旧メモで扱っていた「md-space を中央リポジトリにする案」は、現時点では採用していない。

---

## 2. 運用フロー

1. `docs/md/*.md` を編集
2. 必要なら Obsidian と同期（`docs/sync.js`）
3. `node docs/build.js` で `docs/file-tree.js` を再生成
4. `docs/index.html` で表示確認
5. コミット

---

## 3. Obsidian との同期

同期は任意。使う場合のみ `docs/sync-config.js` を作成する。

```bash
node docs/sync.js --dry-run
node docs/sync.js --yes
```

`docs/sync-config.js` はローカル絶対パスを含むため `.gitignore` 対象。

---

## 4. ドキュメント分類ルール

### 運用ドキュメント（更新継続）

- `docs/md/todo.md`
- `docs/md/cleanup.md`
- `docs/md/sync-guide.md`
- `docs/md/wh-utils.md`
- `docs/md/wh_table_renewal.md`

### 設計メモ・履歴（必要時のみ更新）

- `docs/md/quiz-components-summary.md`
- `docs/md/wh_cron_plan.md`
- `docs/md/changelogs/*.md`
- `docs/md/451-docs-*.md`（別リポジトリ向け参照メモ）

---

## 5. 更新時のチェックポイント

- 実在しないファイル名・ディレクトリ名を書かない
- 旧パス（例: `history/worldhistory`）を残さない
- 「完了 / 未完了」は実装を見て更新する
- 変更後に `npm run check` を実行する
