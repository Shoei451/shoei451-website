-- ============================================================
-- 世界史年表 管理画面 - Supabase セキュリティ設定
-- ============================================================
-- 手順：
-- 1. Supabase Dashboard > Authentication > Users
--    「Add User」で管理者アカウントを作成（メール＋パスワード）
--    作成後、そのユーザーのUUIDをメモする（例：abc123-...）
--
-- 2. Supabase Dashboard > SQL Editor でこのファイルを実行
--    ※ YOUR_ADMIN_USER_UUID の部分を実際のUUIDに置き換えること
--
-- 3. script.js の SUPABASE_ANON_KEY を
--    Supabase Dashboard > Settings > API > anon/public キーに更新
-- ============================================================


-- ① RLS を有効化
ALTER TABLE world_history_quiz ENABLE ROW LEVEL SECURITY;


-- ② 既存のポリシーをクリア（再実行時のため）
DROP POLICY IF EXISTS "Public can read" ON world_history_quiz;
DROP POLICY IF EXISTS "Admin can insert" ON world_history_quiz;
DROP POLICY IF EXISTS "Admin can update" ON world_history_quiz;
DROP POLICY IF EXISTS "Admin can delete" ON world_history_quiz;


-- ③ 誰でも読み取りOK（クイズ公開ページ用）
CREATE POLICY "Public can read"
ON world_history_quiz
FOR SELECT
USING (true);


-- ④ 管理者ユーザーのみ追加・編集・削除を許可
--    ↓↓↓ ここを実際のUUIDに書き換えてください ↓↓↓
DO $$
DECLARE
  admin_uid UUID := 'YOUR_ADMIN_USER_UUID';
BEGIN

  EXECUTE format(
    'CREATE POLICY "Admin can insert" ON world_history_quiz FOR INSERT
     WITH CHECK (auth.uid() = %L)',
    admin_uid
  );

  EXECUTE format(
    'CREATE POLICY "Admin can update" ON world_history_quiz FOR UPDATE
     USING (auth.uid() = %L)
     WITH CHECK (auth.uid() = %L)',
    admin_uid, admin_uid
  );

  EXECUTE format(
    'CREATE POLICY "Admin can delete" ON world_history_quiz FOR DELETE
     USING (auth.uid() = %L)',
    admin_uid
  );

END $$;


-- ⑤ 設定確認クエリ（実行して正しく表示されればOK）
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'world_history_quiz'
ORDER BY cmd;
