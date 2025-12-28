# Supabase Authentication Setup Guide

## 🔧 Supabase側の設定手順

### 1. Email Authentication を有効化

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. 左サイドバー → **Authentication** → **Providers**
4. **Email** が有効になっていることを確認（デフォルトで有効）

### 2. Email Confirmationの設定（オプション）

**開発時は無効にすると便利**：

1. **Authentication** → **Settings**
2. **Enable email confirmations** をOFF
3. Save

これで、メール確認なしで即ログイン可能になります。

### 3. RLS (Row Level Security) の設定

以下のSQLを実行して、各ユーザーが自分のデータのみアクセスできるようにします：

```sql
-- ===== mock_exams テーブルに user_id カラムを追加 =====
ALTER TABLE mock_exams ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- ===== 既存のRLSポリシーを削除 =====
DROP POLICY IF EXISTS "Allow public read access" ON mock_exams;
DROP POLICY IF EXISTS "Allow public write access" ON mock_exams;

-- ===== 新しいRLSポリシーを作成 =====
-- ユーザーは自分のデータのみ読み取り可能
CREATE POLICY "Users can read own exams"
ON mock_exams FOR SELECT
USING (auth.uid() = user_id);

-- ユーザーは自分のデータのみ挿入可能
CREATE POLICY "Users can insert own exams"
ON mock_exams FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のデータのみ更新可能
CREATE POLICY "Users can update own exams"
ON mock_exams FOR UPDATE
USING (auth.uid() = user_id);

-- ユーザーは自分のデータのみ削除可能
CREATE POLICY "Users can delete own exams"
ON mock_exams FOR DELETE
USING (auth.uid() = user_id);

-- ===== 他のテーブルも同様に設定 =====

-- mock_goals
ALTER TABLE mock_goals ADD COLUMN user_id UUID REFERENCES auth.users(id);

DROP POLICY IF EXISTS "Allow public read access" ON mock_goals;
DROP POLICY IF EXISTS "Allow public write access" ON mock_goals;

CREATE POLICY "Users can read own goals"
ON mock_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
ON mock_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
ON mock_goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
ON mock_goals FOR DELETE
USING (auth.uid() = user_id);

-- mock_reflections
ALTER TABLE mock_reflections ADD COLUMN user_id UUID REFERENCES auth.users(id);

DROP POLICY IF EXISTS "Allow public read access" ON mock_reflections;
DROP POLICY IF EXISTS "Allow public write access" ON mock_reflections;

CREATE POLICY "Users can read own reflections"
ON mock_reflections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections"
ON mock_reflections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections"
ON mock_reflections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections"
ON mock_reflections FOR DELETE
USING (auth.uid() = user_id);

-- mock_review_tasks
ALTER TABLE mock_review_tasks ADD COLUMN user_id UUID REFERENCES auth.users(id);

DROP POLICY IF EXISTS "Allow public read access" ON mock_review_tasks;
DROP POLICY IF EXISTS "Allow public write access" ON mock_review_tasks;

CREATE POLICY "Users can read own tasks"
ON mock_review_tasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
ON mock_review_tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
ON mock_review_tasks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
ON mock_review_tasks FOR DELETE
USING (auth.uid() = user_id);
```

### 4. RLSを有効化

```sql
-- 全テーブルでRLSを有効化
ALTER TABLE mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_review_tasks ENABLE ROW LEVEL SECURITY;
```

### 5. テストユーザーを作成

1. **Authentication** → **Users** → **Add user**
2. Email: `test@example.com`
3. Password: `test123456`
4. **Auto Confirm User** にチェック
5. Create User

---

## ✅ 設定完了チェックリスト

- [ ] Email Authenticationが有効
- [ ] Email Confirmation設定（開発時はOFF推奨）
- [ ] 全テーブルに `user_id` カラム追加
- [ ] RLSポリシー作成
- [ ] RLS有効化
- [ ] テストユーザー作成

---

## 🔄 既存データの移行（オプション）

既にデータがある場合、テストユーザーに紐付ける：

```sql
-- テストユーザーのUIDを取得
SELECT id FROM auth.users WHERE email = 'test@example.com';

-- 既存データにuser_idを設定（UIDを上記で取得した値に置き換える）
UPDATE mock_exams SET user_id = 'YOUR-USER-UUID-HERE';
UPDATE mock_goals SET user_id = 'YOUR-USER-UUID-HERE';
UPDATE mock_reflections SET user_id = 'YOUR-USER-UUID-HERE';
UPDATE mock_review_tasks SET user_id = 'YOUR-USER-UUID-HERE';
```

---

次のステップ: `auth-setup.sql` を実行してフロントエンドを実装します。
