# サイト内クリーンアップ対象一覧

最終更新: 2026-03-26

---

## 1. 未参照ファイル（2026-03-26 時点）

`rg` で HTML/JS 参照を確認した結果、以下は本番ページから参照されていない。

| ファイル | 現状 | 推奨対応 |
|---|---|---|
| `templates/back-links.html` | テンプレート置き場のみ | 使わないなら削除、残すなら `templates/README.md` を作って用途明記 |
| `templates/blog_template.html` | 同上 | 同上 |
| `templates/gitub-icons.html` | 同上（ファイル名 typo あり） | 同上 + 必要なら `github-icons.html` に改名 |
| `templates/migration.html` | 同上 | 同上 |
| `templates/sekaishi_mini_data.js` | テンプレート内のみ | 使わないなら削除 |
| `templates/under-construction.html` | 参照なし | 削除候補 |

---

## 2. 旧実装が同居している箇所

| ファイル | 状態 | 推奨対応 |
|---|---|---|
| `history/world/admin/script.js` | 旧モーダル実装とウィザード実装が同ファイルで共存（同名関数上書き） | 旧実装を削除してウィザード実装へ一本化 |

---

## 3. 要判断（意図的に残すか）

| ファイル | 状態 | 判断ポイント |
|---|---|---|
| `history/world/index.html` | 旧世界史クイズ（`TABLES.WH_QUIZ`） | split版（`year-to-event` / `event-to-year`）に完全移行後、残すか削除かを決定 |
| `history/styles/wh-era-quiz.css` | `history/world/index.html` 側で使用 | 上記と同時に廃止可否を判断 |
| `js/supabase_config.js` の `db2` | Project 2 用キーが未設定 | このリポジトリで使わないなら削除検討、使うならキー設定 |

---

## 4. 優先順位

### すぐ対応できる

- `templates/` 配下の未参照ファイル整理
- `gitub-icons.html` の命名見直し（必要なら）

### 機能移行とセットで対応

- `history/world/index.html` と関連CSS/JSの整理
- `history/world/admin/script.js` の重複実装削除

---

## 5. チェックコマンド

```bash
# 参照切れ確認（リンク整合）
npm run check

# 未参照ファイルの追加調査（必要に応じて）
rg -n "back-links\.html|blog_template\.html|gitub-icons\.html|migration\.html|sekaishi_mini_data\.js|under-construction\.html" -g "*.html" -g "*.js"
```
