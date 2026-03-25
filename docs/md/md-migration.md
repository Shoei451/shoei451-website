# md-space / Obsidian + Webサイト運用 設計図

## 1. ディレクトリ構成

### md-space（中央リポジトリ）
```

md-space/
├── shoei451-website/       # Webサイト別フォルダ
│   ├── file1.md
│   ├── file2.md
│   └── file3.md
└── 451-docs/                # Obsidian編集用フォルダ
├── public_posts/        # 公開対象記事
│   ├── aaa.md
│   ├── aab.md
│   └── aac.md
└── protected_posts/     # パスワード付き記事 / 非公開
├── past-exam1.md
└── past-exam2.md

```

### Obsidian Vault
```

Obsidian Vault/
├── shoei451-website/       # md-spaceと同構成
│   ├── file1.md
│   ├── file2.md
│   └── file3.md
└── 451-docs/
├── public_posts/
│   ├── aaa.md
│   ├── aab.md
│   └── aac.md
└── protected_posts/
├── past-exam1.md
└── past-exam2.md

```

---

## 2. ワークフロー

1. **Obsidianで編集**
   - PC/スマホ問わず、Obsidian Vault内で執筆
   - draftや非公開記事は `protected_posts/` に保存
   - 公開対象記事は `public_posts/` に保存

2. **公開用.mdを md-space に同期**
   - `sync.js` または自動Pushで Obsidian → md-space
   - 公開対象のみ同期（非公開は除外）

3. **Edge Function / Webサイトへの配信**
   - md-space から記事を取得
   - 公開記事: Markdown → HTMLに変換してサイト表示
   - パスワード付き記事: slug 指定 + 認証付きで配信
   - 必要に応じてキャッシュやレート制御

4. **Webサイト側のビルド**
   - md-space から取得した記事のみを対象にビルド
   - draft → posts の移動不要
   - filetree.md や目次生成などの共通ロジックを適用

---

## 3. 公開・非公開管理

| フォルダ | 用途 | 同期先 | 備考 |
|-----------|------|--------|------|
| public_posts/ | 公開対象 | md-space / Webサイト | Edge FunctionでHTML変換 |
| protected_posts/ | パスワード付き記事・非公開 | md-space内の保管可 | Edge Functionで認証付き配信、外部公開なし |

---

## 4. 複数サイト対応

- md-space 内でサイト別フォルダに整理
- Edge FunctionやCIでサイトごとに必要な記事のみ取り込む
- 同じ記事を複数サイトで共有可能

---

## 5. メリット

1. 編集は完全に Obsidian に集中
2. 公開用のみ md-space で集約 → Webサイト反映
3. 複数デバイスでの執筆でも同期簡単
4. Edge Functionで安全にパスワード付き記事配信
5. ビルド・コミットコストを最小化

---

## 6. 今後の拡張案

- RSSフィード整備
- filetree.md自動生成
- JSやUIコンポーネントの共通化
- slug指定方式によるHTML一枚生成
- パスワード付き記事のEdge Functionによる強化
- 公開用.md以外の不要ファイルの整理・アーカイブ