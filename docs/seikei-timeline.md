# 政治・経済 学習用オンライン年表

高校生向けの政治・経済学習用のインタラクティブな年表アプリケーション

## 📋 機能一覧

### 主要機能
- ✅ Supabaseバックエンド連携によるデータ永続化
- ✅ カテゴリ別タブナビゲーション（政治、経済、国際関係、社会、その他）
- ✅ イベントのCRUD操作（作成・読取・更新・削除）
- ✅ リアルタイム検索機能
- ✅ レスポンシブデザイン（モバイル・タブレット・デスクトップ対応）
- ✅ ダークモード対応
- ✅ 印刷用ページ（seikei-print.html）

### デザイン仕様
- アクセントカラー: #FABA40 (ゴールド) / #1A2B3C (ネイビー)
- ミニマルで見やすいデザイン
- テーマ切り替え機能（ライト/ダーク）

## 🚀 セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクト名を入力（例: seikei-timeline）
4. データベースパスワードを設定
5. リージョンを選択（Tokyo推奨）

### 2. データベーステーブルの作成

Supabaseのダッシュボードで：
1. 左メニューから「SQL Editor」を選択
2. 「New query」をクリック
3. 以下のSQLを貼り付けて実行：

```sql
-- eventsテーブルの作成
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('国際政治', '国際経済', '国内政治', '日銀金融政策', '農業', '消費者生活・公害対策', '労働問題', '社会保障')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックスの作成（検索パフォーマンス向上）
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);

-- RLS (Row Level Security) の有効化
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能
CREATE POLICY "Enable read access for all users" ON events
  FOR SELECT USING (true);

-- 全ユーザーが挿入可能
CREATE POLICY "Enable insert access for all users" ON events
  FOR INSERT WITH CHECK (true);

-- 全ユーザーが更新可能
CREATE POLICY "Enable update access for all users" ON events
  FOR UPDATE USING (true);

-- 全ユーザーが削除可能
CREATE POLICY "Enable delete access for all users" ON events
  FOR DELETE USING (true);

-- サンプルデータの挿入（任意）
INSERT INTO events (title, description, date, category) VALUES
  ('ブレトンウッズ協定', 'IMFと世界銀行の設立。固定為替相場制を採用', '1944-07-01', '国際経済'),
  ('GATT発足', '関税及び貿易に関する一般協定が発効', '1948-01-01', '国際経済'),
  ('サンフランシスコ平和条約', '日本が主権を回復', '1952-04-28', '国際政治'),
  ('農地改革完了', 'GHQの指導のもと、農地改革が完了', '1950-12-31', '農業'),
  ('55年体制成立', '自由民主党が結成され、保守政権が確立', '1955-11-15', '国内政治'),
  ('食糧管理法制定', '米の生産・流通を国が管理', '1942-02-21', '農業'),
  ('労働基準法制定', '労働者の権利を保護する法律が施行', '1947-04-07', '労働問題'),
  ('国民健康保険法制定', '国民皆保険制度の基礎が確立', '1958-12-27', '社会保障'),
  ('公害対策基本法制定', '公害問題に対する初の包括的な法律', '1967-08-03', '消費者生活・公害対策'),
  ('ニクソンショック', 'ドルと金の交換停止を宣言。ブレトンウッズ体制崩壊', '1971-08-15', '国際経済'),
  ('日銀による量的緩和開始', 'ゼロ金利政策を導入', '1999-02-12', '日銀金融政策'),
  ('消費税導入', '日本で初めて消費税3%が導入された', '1989-04-01', '国内政治'),
  ('バブル経済崩壊', '株価と地価が急落し、長期的な経済停滞が始まる', '1991-01-01', '国際経済'),
  ('WTO設立', 'GATTに代わり世界貿易機関が設立', '1995-01-01', '国際経済'),
  ('消費税5%に引き上げ', '消費税率が3%から5%に引き上げられた', '1997-04-01', '国内政治'),
  ('介護保険制度開始', '高齢者介護を社会全体で支える制度がスタート', '2000-04-01', '社会保障'),
  ('政権交代（民主党）', '自民党から民主党への初の本格的政権交代', '2009-09-16', '国内政治'),
  ('TPP交渉開始', '環太平洋パートナーシップ協定の交渉に参加', '2013-03-15', '国際経済'),
  ('消費税8%に引き上げ', '消費税率が5%から8%に引き上げられた', '2014-04-01', '国内政治'),
  ('マイナス金利政策導入', '日銀が初のマイナス金利政策を導入', '2016-01-29', '日銀金融政策'),
  ('働き方改革関連法成立', '長時間労働の是正などを目的とした法律', '2018-06-29', '労働問題'),
  ('消費税10%に引き上げ', '消費税率が8%から10%に引き上げられた', '2019-10-01', '国内政治');
```

### 3. API認証情報の取得

1. Supabaseダッシュボードの「Settings」→「API」に移動
2. 以下の情報をコピー：
   - **Project URL** (例: https://xxxxx.supabase.co)
   - **anon public key** (長い文字列)

### 4. HTMLファイルの設定

両方のHTMLファイル（`seikei-timeline.html` と `seikei-print.html`）で、以下の部分を編集：

```javascript
// この部分を自分のSupabase情報に書き換える
const SUPABASE_URL = 'YOUR_SUPABASE_URL';  // ← Project URLを貼り付け
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';  // ← anon keyを貼り付け
```

**編集例：**
```javascript
const SUPABASE_URL = 'https://abcdefghijk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 5. アプリケーションの起動

1. `seikei-timeline.html`をブラウザで開く
2. データが正常に読み込まれることを確認
3. イベントの追加・編集・削除をテスト

## 📖 使い方

### メイン画面（seikei-timeline.html）

#### イベントの追加
1. 右上の「+ イベント追加」ボタンをクリック
2. モーダルが開くので、以下を入力：
   - イベント名（必須）
   - 日付（必須）
   - カテゴリ（必須）
   - 説明（任意）
3. 「保存」ボタンをクリック

#### イベントの編集
1. 編集したいイベントの行にある「編集」ボタンをクリック
2. モーダルで内容を修正
3. 「保存」ボタンをクリック

#### イベントの削除
1. 削除したいイベントの行にある「削除」ボタンをクリック
2. 確認ダイアログで「OK」をクリック

#### カテゴリフィルタ
- タブをクリックすることで、特定カテゴリのイベントのみを表示
- 「すべて」タブで全イベントを表示

#### 検索機能
- 右上の検索ボックスにキーワードを入力
- イベント名と説明から検索

#### ダークモード
- 右上の🌙/☀️アイコンをクリックしてテーマを切り替え

### 印刷用画面（seikei-print.html）

1. `seikei-print.html`をブラウザで開く
2. 必要に応じてカテゴリフィルタで絞り込み
3. 「🖨️ 印刷」ボタンをクリック、または Ctrl+P (Command+P)
4. プリンタ設定で以下を推奨：
   - 用紙サイズ: A4
   - 向き: 縦
   - 余白: 標準

## 🔧 カスタマイズ

### カテゴリの追加・変更

現在のカテゴリ：
- 国際政治
- 国際経済
- 国内政治
- 日銀金融政策
- 農業
- 消費者生活・公害対策
- 労働問題
- 社会保障

カテゴリを変更する場合：

1. HTMLファイル内の以下の箇所を編集：

```html
<!-- タブ部分 -->
<button class="tab" data-category="新カテゴリ">新カテゴリ</button>

<!-- フォーム部分 -->
<option value="新カテゴリ">新カテゴリ</option>
```

2. Supabase側でもCHECK制約を更新：

```sql
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_category_check;
ALTER TABLE events ADD CONSTRAINT events_category_check 
  CHECK (category IN ('国際政治', '国際経済', '国内政治', '日銀金融政策', '農業', '消費者生活・公害対策', '労働問題', '社会保障', '新カテゴリ'));
```

### デザインのカスタマイズ

CSSの`:root`セクションで色を変更：

```css
:root {
    --accent-gold: #FABA40;  /* アクセントカラー1 */
    --accent-navy: #1A2B3C;  /* アクセントカラー2 */
}
```

## 🛡️ セキュリティ設定（本番環境用）

現在の設定では全ユーザーがデータを編集できます。実際の運用では以下を検討してください：

### 1. 認証の追加
```sql
-- 認証済みユーザーのみ編集可能にする例
DROP POLICY IF EXISTS "Enable insert access for all users" ON events;
CREATE POLICY "Enable insert access for authenticated users only" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 2. 管理者権限の設定
- Supabase Authを使用してユーザー管理
- 特定のユーザーのみ編集権限を付与

## 📱 レスポンシブデザイン

以下の画面サイズに対応：
- 📱 モバイル: 〜768px
- 📱 タブレット: 768px〜1024px
- 💻 デスクトップ: 1024px〜

## 🐛 トラブルシューティング

### データが読み込まれない
1. ブラウザのコンソール（F12）でエラーを確認
2. Supabase URLとAPI Keyが正しいか確認
3. SupabaseダッシュボードでRLS設定を確認

### イベントが保存できない
1. 必須項目（タイトル、日付、カテゴリ）がすべて入力されているか確認
2. 日付が正しい形式（YYYY-MM-DD）か確認
3. カテゴリが定義済みの値か確認

### 印刷がうまくいかない
1. ブラウザの印刷設定で「背景のグラフィック」を有効化
2. 用紙サイズがA4になっているか確認
3. 余白設定を調整

## 📄 ファイル構成

```
seikei-timeline/
├── seikei-timeline.html    # メイン画面
├── seikei-print.html        # 印刷用画面
└── README.md                # このファイル
```

## 🔄 データのバックアップ

Supabaseダッシュボードで：
1. 「Database」→「Backups」からバックアップを作成
2. または、SQL Editorで以下を実行してCSVエクスポート：

```sql
COPY (SELECT * FROM events ORDER BY date) TO STDOUT WITH CSV HEADER;
```

## 💡 今後の拡張案

- [ ] イベントへの画像添付機能
- [ ] タグ機能の追加
- [ ] PDFエクスポート機能
- [ ] イベント間の関連性表示
- [ ] タイムライン形式の表示
- [ ] 複数ユーザーでの共同編集
- [ ] コメント機能

## 📞 サポート

問題が発生した場合：
1. このREADMEのトラブルシューティングセクションを確認
2. Supabaseの公式ドキュメントを参照: https://supabase.com/docs
3. ブラウザのコンソールログを確認

---

**作成日**: 2026年1月16日  
**対象**: 高校2年生の政治・経済学習用