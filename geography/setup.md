# 定期テスト過去問 保護システム セットアップガイド

## 📋 概要

アクセスコード方式で学校メンバー限定の過去問PDFを配布するシステムです。

### 特徴
- ✅ サインアップ不要（アクセスコード入力のみ）
- ✅ 24時間セッション維持（再ログイン不要）
- ✅ 複数科目対応（地理総合、家庭基礎、保健）
- ✅ Supabase Storage直接連携
- ✅ モバイル対応

---

## 🚀 セットアップ手順

### ステップ1: Supabaseプロジェクト設定

1. **Supabase Dashboardにログイン**
   - https://supabase.com/dashboard

2. **既存プロジェクトを選択**（または新規作成）

3. **APIキーを取得**
   - Settings → API → Project URL と anon public key をコピー

### ステップ2: データベーステーブル作成

1. **SQL Editorを開く**
   - 左メニュー → SQL Editor

2. **`supabase-setup.sql` の内容を実行**
   ```sql
   -- access_codes テーブルが作成される
   -- 初期アクセスコードが2つ挿入される
   ```

3. **結果確認**
   - Table Editor → access_codes → 2行表示されることを確認

### ステップ3: Storage バケット設定

1. **Storageセクションを開く**
   - 左メニュー → Storage

2. **新しいバケット作成**
   - Name: `exam-papers`
   - Public: **ON** にする（重要！）
   - Create bucket

3. **フォルダ構造を作成**
   ```
   exam-papers/
   ├── geography/          （地理総合用）
   ├── home-economics/     （家庭基礎用）
   └── healthcare/         （保健用）
   ```

4. **PDFファイルをアップロード**
   - 各フォルダに該当するPDFをアップロード
   - ファイル名例: `2024_geography_term1.pdf`

### ステップ4: HTMLファイル編集

1. **APIキーを設定**
   
   **geography_past-exams.html** の編集:
   ```javascript
   // 72行目あたり
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_KEY = 'your-anon-key-here';
   ```

   **home-economics_past-exams.html** の編集:
   ```javascript
   // 113行目あたり
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_KEY = 'your-anon-key-here';
   ```

2. **ファイルをサーバーにアップロード**
   - `geography_past-exams.html` → `geography/` フォルダへ
   - `home-economics_past-exams.html` → 適切なフォルダへ

### ステップ5: リンク追加

#### geography/list2.js に追加:
```javascript
const sectionItems2 = [
    {
        icon: "📄",  
        title: "地理総合 定期テスト過去問",
        titleEN: "Geography Past Exams (School Only)",
        description: "定期テストの過去問データベース（学校メンバー限定）",
        link: "past-exams.html",
        target: "_blank"
    },
];
```

#### upcoming/projects-list.js から該当項目を削除または更新

---

## 🔑 アクセスコード管理

### 初期コード（変更してください）
- 地理総合: `GEO2025TEST`
- 家庭基礎/保健: `HOME2025EXAM`

### コードの変更方法

**Supabase Dashboard → Table Editor → access_codes**

#### 新しいコード追加:
```sql
INSERT INTO access_codes (code, subject, notes) 
VALUES ('NEW_CODE_2025', 'geography', '2025年2月更新');
```

#### 古いコード無効化:
```sql
UPDATE access_codes 
SET active = false 
WHERE code = 'GEO2025TEST';
```

### 推奨運用
- 🔄 **月1回コード変更**（外部流出防止）
- 📢 **Classroomで告知**
- 🔐 **英数字8文字以上**のランダムコード使用

---

## 📁 ファイル命名規則

Storageにアップロードする際は以下の命名規則に従ってください：

### 地理総合
```
YYYY_geography_termN.pdf
例: 2024_geography_term1.pdf
```

### 家庭基礎
```
YYYY_termN.pdf
例: 2024_term1.pdf
```

### 保健
```
YYYY_termN.pdf
例: 2024_term1.pdf
```

**Note:** HTMLコードがファイル名から年度・回数を自動抽出します。

---

## 🧪 テスト手順

1. **アクセスコード確認**
   ```sql
   SELECT code, subject, active FROM access_codes WHERE active = true;
   ```

2. **HTMLページを開く**
   - https://yoursite.com/geography/past-exams.html

3. **コード入力**
   - 取得したコードを入力

4. **PDF表示確認**
   - リストにPDFが表示される
   - リンクをクリックしてPDFが開く

---

## ⚠️ トラブルシューティング

### PDFが表示されない
**原因:** Storageバケットが非公開
**解決:** Storage → exam-papers → Settings → Public ON

### コードが無効と表示される
**原因:** `active = false` または subject が一致しない
**解決:** 
```sql
SELECT * FROM access_codes WHERE code = 'YOUR_CODE';
-- active が true で subject が正しいか確認
```

### CORSエラー
**原因:** Supabaseドメイン制限
**解決:** Settings → API → CORS → サイトドメイン追加

### 24時間後にアクセスできない
**仕様:** セッションは24時間で期限切れ
**対応:** 再度アクセスコード入力（自動的に促される）

---

## 🔒 セキュリティ考慮事項

### ✅ 実装済み
- アクセスコード認証
- セッション期限（24時間）
- 科目別コード分離
- RLS（Row Level Security）有効

### ⚠️ 制限事項
- **PDFは公開URL**: 直リンクを知れば誰でもアクセス可能
- **完全な保護ではない**: あくまで「限定公開」レベル

### 🛡️ より安全にしたい場合
1. **Storageを非公開に変更**
2. **署名付きURL使用**
3. **メール認証に移行**

---

## 📊 使用統計（オプション）

アクセスログを記録したい場合、`supabase-setup.sql` の access_logs テーブルを利用できます。

```javascript
// HTMLに追加
async function logAccess(code, subject) {
    await supabaseClient
        .from('access_logs')
        .insert({
            code_used: code,
            subject: subject,
            user_agent: navigator.userAgent
        });
}
```

---

## 🆘 サポート

問題が発生した場合：
1. ブラウザのコンソールを確認（F12 → Console）
2. Supabaseのログを確認（Dashboard → Logs）
3. このREADMEのトラブルシューティングを参照

---

## 📝 今後の拡張案

- [ ] アクセスログ記録機能
- [ ] PDF閲覧回数カウント
- [ ] 自動コードローテーション
- [ ] 管理者ダッシュボード
- [ ] メール認証への移行

---

**作成日:** 2024-12-26  
**バージョン:** 1.0  
**対象:** 学校メンバー限定過去問配布システム