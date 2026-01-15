# 政治・経済 学習用年表 セットアップガイド

## 📋 概要

このシステムは、政治・経済の重要イベントを整理・学習するためのインタラクティブな年表です。
Supabaseをバックエンドとして使用し、イベントの追加・編集・削除が可能です。

## 📦 含まれるファイル

1. **seikei-timeline-table-setup.sql** - Supabaseテーブル作成用SQL
2. **seikei-timeline.html** - メインHTMLページ
3. **seikei-timeline.css** - スタイルシート
4. **seikei-timeline.js** - JavaScript（Supabase連携）
5. **seikei-print.html** - 印刷用ページ

## 🚀 セットアップ手順

### ステップ1: Supabaseデータベースの設定

1. Supabaseプロジェクトにログイン
2. SQL Editorを開く
3. `seikei-timeline-table-setup.sql` の内容をコピー&ペースト
4. 実行して、`politics_economics_events` テーブルを作成

### ステップ2: ファイルの配置

プロジェクトのディレクトリ構成:

```
your-website/
├── css/
│   └── common.css (既存)
├── js/
│   └── theme-toggle.js (既存)
├── images/
│   └── favicon.png (既存)
├── politics-economics/  (新規作成)
│   ├── seikei-timeline.html
│   ├── seikei-timeline.css
│   ├── seikei-timeline.js
│   └── seikei-print.html
```

### ステップ3: Supabase認証情報の確認

`seikei-timeline.js` と `seikei-print.html` の以下の部分が正しいか確認:

```javascript
const SUPABASE_URL = 'https://gjuqsyaugrsshmjerhme.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_KEY';
```

現在は既にあなたのSupabase情報が設定済みです。

## 🎯 主な機能

### 1. イベントの表示
- 日付順でイベントを表形式で表示
- カテゴリ別の色分けバッジ
- レスポンシブデザイン（モバイル対応）

### 2. フィルタリング機能
- カテゴリタブによるフィルタ（政治、経済、国際関係、社会政策、その他）
- リアルタイム検索（イベント名・説明で検索）

### 3. CRUD操作
- **追加**: 新しいイベントを追加
- **編集**: 既存イベントの修正
- **削除**: 不要なイベントを削除

### 4. 印刷機能
- 印刷最適化されたページ（`seikei-print.html`）
- カテゴリ別に印刷可能

### 5. ダークモード対応
- 自動的に既存のテーマシステムと連携

## 📝 使い方

### イベントの追加方法

1. 「➕ イベントを追加」ボタンをクリック
2. モーダルフォームが開く
3. 必須項目を入力:
   - 日付（YYYY-MM-DD形式）
   - イベント名
   - カテゴリ
4. 任意で説明を追加
5. 「保存」をクリック

### イベントの編集方法

1. 編集したいイベントの「編集」ボタンをクリック
2. フォームに既存データが表示される
3. 必要な変更を加える
4. 「保存」をクリック

### イベントの削除方法

1. 削除したいイベントの「削除」ボタンをクリック
2. 確認ダイアログで「OK」を選択

### 検索・フィルタリング

- **カテゴリフィルタ**: 上部のタブをクリック
- **キーワード検索**: 検索ボックスに入力（リアルタイム反映）

### 印刷

1. 「🖨️ 印刷用表示」ボタンをクリック
2. 新しいタブで印刷用ページが開く
3. 必要に応じてカテゴリを選択
4. ブラウザの印刷機能を使用（Ctrl+P / Cmd+P）

## 🎨 カスタマイズ

### カテゴリの追加

1. **SQL** (`seikei-timeline-table-setup.sql`):
```sql
category TEXT NOT NULL CHECK (category IN ('政治', '経済', '国際関係', '社会政策', '新カテゴリ', 'その他'))
```

2. **HTML** (`seikei-timeline.html`):
```html
<button class="category-tab" data-category="新カテゴリ">新カテゴリ</button>
```

3. **CSS** (`seikei-timeline.css`):
```css
.category-新カテゴリ {
  background: #色コード;
  color: #色コード;
}
```

### スタイルの変更

`seikei-timeline.css` でカラーやレイアウトを調整できます。
既存の `common.css` の変数を活用しています:
- `--primary`: メインテキスト色
- `--accent`: アクセントカラー
- `--card-bg`: カード背景色
- `--theme`: ページ背景色

## 🔧 トラブルシューティング

### データが表示されない

1. ブラウザのコンソールでエラーを確認
2. Supabase接続情報が正しいか確認
3. テーブル名が `politics_economics_events` であることを確認
4. Row Level Security (RLS) ポリシーが正しく設定されているか確認

### イベントの追加/編集/削除ができない

1. Supabase RLSポリシーを確認
2. 現在の設定では全ユーザーが操作可能（`WITH CHECK (true)`）
3. 本番環境では認証を追加することを推奨

### スタイルが適用されない

1. CSSファイルのパスが正しいか確認
2. `common.css` が存在するか確認
3. ブラウザのキャッシュをクリア

## 🔐 セキュリティ推奨事項

現在の設定は学習用途向けです。本番環境では:

1. **認証の追加**:
```sql
CREATE POLICY "Authenticated users only" 
ON politics_economics_events
FOR ALL USING (auth.uid() IS NOT NULL);
```

2. **API Keyの保護**:
- 環境変数を使用
- サーバーサイドで処理

3. **入力バリデーション**:
- XSS対策（現在実装済み: `escapeHtml`関数）
- SQL injection対策（Supabaseクライアントが自動処理）

## 📚 今後の拡張案

- [ ] ユーザー認証システム
- [ ] イベントへの画像添付機能
- [ ] タイムライン表示（視覚的な年表）
- [ ] Excelエクスポート機能
- [ ] 複数年にまたがるイベントの対応
- [ ] タグ機能の追加

## 💡 ヒント

- **日付入力**: HTMLのdate inputを使用しているため、ブラウザのネイティブカレンダーが使えます
- **キーボードショートカット**: Escキーでモーダルを閉じられます
- **データのバックアップ**: Supabaseダッシュボードから定期的にエクスポート推奨

## 📞 サポート

問題が発生した場合:
1. ブラウザのデベロッパーツールでコンソールを確認
2. Supabaseダッシュボードでテーブル構造を確認
3. SQL実行時のエラーメッセージを確認

---

**作成者**: Shoei451  
**最終更新**: 2026年1月