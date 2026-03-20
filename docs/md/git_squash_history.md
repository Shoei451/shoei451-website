# Gitのコミット履歴を全削除する手順

リポジトリのコミット履歴を消去し、現在のファイル状態だけを残した1コミットの状態にする方法。

---

## やること・やらないこと

- **やること：** コミット履歴を削除し、ファイルの内容はそのまま残す
- **やらないこと：** ファイルの削除・変更

---

## 前提

- Git Bashがインストール済み（https://git-scm.com/download/win）
- GitHubのPersonal Access Tokenを持っている（後述）
- 対象リポジトリが **アーカイブされていない**こと（アーカイブ後は書き込み不可）

---

## 手順

### 1. リポジトリをクローン

作業したいディレクトリに移動してからクローンする。

```bash
cd ~/Documents/Github
git clone https://github.com/<ユーザー名>/<リポジトリ名>.git
cd <リポジトリ名>
```

**注意：** `cd <リポジトリ名>` は必ず単独の行で実行する。他のコマンドと同じ行に貼り付けない。

---

### 2. 孤立ブランチを作成して全ファイルをコミット

```bash
git checkout --orphan fresh
```
```bash
git add -A
```
```bash
git commit -m "archive: squash history"
```

`--orphan` は親コミットを持たない新しいブランチを作るオプション。これにより履歴が完全にリセットされる。

---

### 3. 旧mainを削除し、freshをmainにリネーム

```bash
git branch -D main
```
```bash
git branch -m main
```

---

### 4. GitHubに強制プッシュ

```bash
git push origin main --force
```

ここで認証を求められた場合は次のセクションを参照。

---

### 5. 確認

`https://github.com/<ユーザー名>/<リポジトリ名>/commits` を開き、コミットが1件だけになっていればOK。

---

## 認証エラーが出た場合（Personal Access Token）

GitHubはパスワード認証を廃止しているため、`git push` 時にパスワードを求められたらトークンが必要。

1. GitHub → 右上アイコン → **Settings**
2. 左メニュー最下部 **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. **Generate new token (classic)**
5. `repo` にチェックを入れて生成
6. 表示されたトークン（`ghp_...`）をコピー
7. Git Bashの「Password」欄に貼り付け（画面には表示されないが入力されている）

---

## トラブルシューティング

### `cd: too many arguments` と出た

`cd <リポジトリ名>` と次のコマンドを同じ行に貼り付けてしまっている。1行ずつ実行する。

### `warning: adding embedded git repository` と出た

クローンしたフォルダの**外側**で `git add -A` を実行している。`cd <リポジトリ名>` でリポジトリの中に入ってから実行する。

もし誤って `git add -A` してしまった場合はリセット：

```bash
git reset --hard HEAD~1
rm -rf <リポジトリ名>
```

その後 `git checkout --orphan fresh` からやり直す。

### `error: cannot delete branch 'main' used by worktree` と出た

`git checkout --orphan fresh` を実行する前に `git branch -D main` をしようとしている。手順通り、`fresh` ブランチに移動してから `main` を削除する。

---

## コマンドまとめ（コピー用）

1行ずつ実行すること。

```bash
cd ~/Documents/Github
git clone https://github.com/<ユーザー名>/<リポジトリ名>.git
cd <リポジトリ名>
git checkout --orphan fresh
git add -A
git commit -m "archive: squash history"
git branch -D main
git branch -m main
git push origin main --force
```