# 🔐 Supabase Authentication セットアップガイド

## 📖 概要

このガイドでは、Supabase Authenticationを使った本格的な認証システムのセットアップ方法を説明します。

### 何が変わったか？

**Before (JavaScript埋め込みパスワード)**
```javascript
const PASSWORD = 'shoei2027';  // ← DevToolsで丸見え
```

**After (Supabase Authentication)**
- メールアドレス + パスワードで認証
- パスワードはハッシュ化されサーバー側で管理
- セッション管理で自動ログイン
- Row Level Security (RLS) で各ユーザーのデータを完全分離

---

## 🚀 セットアップ手順

### Step 1: Supabase RLS設定

1. Supabaseダッシュボードにログイン
2. **SQL Editor** を開く
3. `private/mock-test-manager/auth-setup.sql` の内容をコピー＆ペースト
4. **Run** をクリック

これで以下が完了します：
- 全テーブルに `user_id` カラム追加
- RLSポリシー作成（各ユーザーは自分のデータのみアクセス可能）
- RLS有効化

### Step 2: Email Confirmation設定（開発時）

開発中はメール確認を無効にすると便利です：

1. **Authentication** → **Settings**
2. **Enable email confirmations** を **OFF**
3. **Save**

### Step 3: テストユーザー作成

1. **Authentication** → **Users** → **Add user**
2. 以下を入力：
   - Email: `your-email@example.com`
   - Password: `test123456`
   - **Auto Confirm User** にチェック ✓
3. **Create User**

### Step 4: ファイル配置

```bash
website/
├── private/
│   ├── index.html              # 認証ゲート
│   ├── auth.js                 # 認証ロジック
│   ├── private-data.js         # ツールリスト
│   └── mock-test-manager/
│       ├── index.html
│       ├── mock-app.js         # RLS対応済み
│       ├── mock-style.css
│       └── auth-setup.sql
├── css/
├── images/
└── index.html
```

### Step 5: 動作確認

1. ローカルサーバーを起動：
   ```bash
   python -m http.server 8000
   ```

2. ブラウザで開く：
   ```
   http://localhost:8000/private/
   ```

3. ログイン：
   - Email: `your-email@example.com`
   - Password: `test123456`

4. 「模試成績管理」をクリック

5. 成績を入力して保存

6. 別のブラウザで別ユーザーを作成し、データが分離されていることを確認

---

## 🔒 セキュリティの仕組み

### 1. 認証フロー

```
ユーザー
  ↓
メール + パスワード入力
  ↓
Supabase Auth (サーバー側で検証)
  ↓
JWTトークン発行
  ↓
クライアントに返送 (localStorageに自動保存)
  ↓
以降のリクエストで自動的に送信
```

### 2. Row Level Security (RLS)

各SQLクエリに自動的にフィルタが追加されます：

```sql
-- ユーザーが SELECT を実行すると...
SELECT * FROM mock_exams;

-- 実際には以下が実行される
SELECT * FROM mock_exams WHERE user_id = '現在のユーザーID';
```

**つまり**：
- ユーザーAは自分のデータのみ取得
- ユーザーBは自分のデータのみ取得
- データベースレベルで完全分離

### 3. パスワード管理

- パスワードはbcryptでハッシュ化
- 平文は保存されない
- データベース管理者でも見れない

---

## ✨ 機能一覧

### 実装済み機能

✅ **新規登録**
- メールアドレス + パスワード
- パスワード確認（一致チェック）
- Email confirmation（設定で有効/無効化可能）

✅ **ログイン**
- メールアドレス + パスワード
- セッション管理（ブラウザを閉じても維持）

✅ **パスワードリセット**
- メールでリセットリンク送信
- 新しいパスワード設定

✅ **ログアウト**
- セッション破棄
- 再ログイン必要

✅ **データ分離**
- 各ユーザーのデータは完全に分離
- 他人のデータは一切見えない

### 追加可能な機能

🔜 **ソーシャルログイン**
- Google
- GitHub
- etc.

🔜 **2段階認証 (MFA)**
- TOTPコード
- SMS

🔜 **プロフィール編集**
- 表示名
- アバター

---

## 🐛 トラブルシューティング

### ログインできない

**症状**: "Invalid login credentials"

**解決策**:
1. メールアドレスが正しいか確認
2. Supabase Dashboard → Authentication → Users でユーザーが存在するか確認
3. パスワードを再設定

---

### データが表示されない

**症状**: ログインできるが、データが空

**原因**: RLSによってフィルタされている

**解決策**:
```sql
-- 既存データにuser_idを設定
-- まず、ユーザーIDを取得
SELECT id, email FROM auth.users;

-- データに紐付け（自分のUIDに置き換える）
UPDATE mock_exams SET user_id = 'YOUR-USER-UUID';
UPDATE mock_goals SET user_id = 'YOUR-USER-UUID';
UPDATE mock_reflections SET user_id = 'YOUR-USER-UUID';
UPDATE mock_review_tasks SET user_id = 'YOUR-USER-UUID';
```

---

### Email confirmationメールが届かない

**解決策**:
1. **Authentication** → **Settings**
2. **Enable email confirmations** を **OFF**
3. または、Supabase Dashboard → Users → ユーザーを選択 → **Confirm email**

---

## 📊 データ構造

### Before (Public access)

```
mock_exams
├── id
├── exam_type
├── name
├── date
└── scores
```

### After (RLS enabled)

```
mock_exams
├── id
├── user_id  ← NEW
├── exam_type
├── name
├── date
└── scores
```

---

## 🔄 既存データの移行

既にデータがある場合：

```sql
-- 1. 自分のユーザーIDを取得
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- 2. 既存データに紐付け
UPDATE mock_exams SET user_id = 'YOUR-UUID-HERE';
UPDATE mock_goals SET user_id = 'YOUR-UUID-HERE';
UPDATE mock_reflections SET user_id = 'YOUR-UUID-HERE';
UPDATE mock_review_tasks SET user_id = 'YOUR-UUID-HERE';
```

---

## 🎓 学習リソース

- [Supabase Auth公式ドキュメント](https://supabase.com/docs/guides/auth)
- [Row Level Security解説](https://supabase.com/docs/guides/auth/row-level-security)
- [JWT入門](https://jwt.io/introduction)

---

## 📝 注意事項

### 本番環境では

1. **Email confirmationを有効化**
2. **SMTP設定** (独自ドメインからメール送信)
3. **Rate limiting** (ログイン試行回数制限)
4. **CAPTCHA** (ボット対策)

### 開発環境では

1. Email confirmation無効でOK
2. テストユーザーは手動作成
3. パスワードは簡単なもので問題なし

---

**作成日**: 2024-12-28  
**認証方式**: Supabase Authentication + RLS  
**セキュリティレベル**: Production-ready ✅
