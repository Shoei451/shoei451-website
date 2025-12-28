# 📊 模試成績管理システム

純粋なHTML/CSS/JSで構築された模試成績管理アプリケーション。Supabaseをバックエンドとして使用し、既存サイトのデザインシステムに統合されています。

## 🎯 機能

### ダッシュボード
- 最新得点、目標達成率、解き直し進捗の統計表示
- 得点推移グラフ（Chart.js）
- 科目別比較グラフ
- 振り返り記録の表示
- 解き直しタスクリスト

### 成績入力
- 模試タイプごとの科目別成績入力
- 自動合計点計算
- Supabaseへの保存

### 振り返り管理
- ブログ形式の振り返り記録
- カテゴリータグ付け
- 編集・削除機能
- モーダルでの入力UI

### 目標設定
- 科目別目標点の設定
- グラフでの可視化

## 🚀 セットアップ手順

### 1. Supabaseプロジェクトの準備

1. [Supabase](https://supabase.com)にアクセスしてプロジェクトを作成
2. プロジェクトのSQL Editorを開く
3. `supabase-schema.sql`の内容を全てコピー＆ペースト
4. 実行してテーブルとサンプルデータを作成

### 2. 認証情報の設定

`mock-app.js`の2-3行目を自分のSupabase情報に書き換えます：

```javascript
const SUPABASE_URL = 'あなたのSupabase URL';
const SUPABASE_KEY = 'あなたのSupabase anon/public key';
```

**Supabase URL と API Key の取得方法：**
1. Supabaseプロジェクトのダッシュボードを開く
2. 左サイドバーから「Settings」→「API」を選択
3. 「Project URL」をコピー → `SUPABASE_URL`に貼り付け
4. 「Project API keys」の「anon public」をコピー → `SUPABASE_KEY`に貼り付け

### 3. ファイル配置

既存サイトのディレクトリ構造に統合：

```
shoei451-website/
├── css/
│   └── common.css (既存)
├── images/
│   └── favicon.png (既存)
├── mock-test-manager/  ← 新しく作成
│   ├── index.html
│   ├── mock-style.css
│   ├── mock-app.js
│   └── supabase-schema.sql (参考用)
└── index.html (既存)
```

### 4. ホームページへの追加

`js/cards-data.js`に以下を追加：

```javascript
{ 
    icon: "📊",
    title: "模試成績管理", 
    titleJP: "Mock Test Manager",
    text: "模試の成績を記録・分析し、振り返りを管理できるツールです", 
    link: "mock-test-manager/" 
}
```

## 📦 依存関係

すべてCDN経由で読み込まれるため、追加のインストールは不要です：

- **Chart.js 4.4.0** - グラフ描画
- **Supabase JS 2.x** - データベース連携

## 🎨 デザインシステム

既存サイトの`common.css`を使用：
- カラーパレット: `--theme`, `--primary`, `--accent`など
- ダークモード対応
- レスポンシブデザイン
- アニメーション統合

## 📱 対応ブラウザ

- Chrome / Edge (最新版)
- Firefox (最新版)
- Safari (最新版)
- モバイルブラウザ対応

## 🛠️ カスタマイズ

### 模試タイプの追加

`mock-app.js`の`EXAM_TYPES`オブジェクトに追加：

```javascript
const EXAM_TYPES = {
    // ... 既存
    new_type: {
        name: '新しい模試タイプ',
        color: '#カラーコード',
        subjects: ['科目1', '科目2', ...]
    }
};
```

### カラーテーマの変更

各模試タイプの`color`プロパティを編集すると、グラフとUIの色が変わります。

## 📊 データベース構造

### mock_exams（模試成績）
- `id`: 主キー
- `exam_type`: 模試タイプ（kyotsu/kijutsu/todai/teiki）
- `name`: 模試名
- `date`: 実施日
- `scores`: 科目別点数（JSONB）
- `total_score`: 合計点

### mock_goals（目標）
- `id`: 主キー
- `exam_type`: 模試タイプ
- `subject`: 科目名
- `target_score`: 目標点

### mock_reflections（振り返り）
- `id`: 主キー
- `exam_id`: 模試ID（外部キー）
- `title`: タイトル
- `content`: 内容
- `categories`: カテゴリー（JSONB配列）
- `timestamp`: 日付

### mock_review_tasks（解き直しタスク）
- `id`: 主キー
- `exam_id`: 模試ID（外部キー）
- `subject`: 科目
- `task`: タスク内容
- `completed`: 完了フラグ

## 🔒 セキュリティ

現在の実装は**公開読み書き**（誰でもデータの追加・変更が可能）です。

本番環境では以下の対策を推奨：
1. Supabase Authenticationの実装
2. RLSポリシーの変更（ユーザーごとのデータ分離）
3. API Keyの環境変数化

## 💡 今後の拡張案

- [ ] Supabase Authenticationによるユーザー管理
- [ ] CSVエクスポート機能
- [ ] PDFレポート生成
- [ ] 時間配分管理機能
- [ ] プッシュ通知（試験日リマインダー）
- [ ] データのバックアップ/復元機能

## 📝 ライセンス

個人利用・学校利用は自由です。

## 🤝 サポート

問題や質問があれば、以下まで連絡してください：
- Email: okamotoshoei451@gmail.com
- GitHub Issues: （リポジトリURL）

---

**作成者:** Shoei451  
**バージョン:** 1.0.0  
**最終更新:** 2024-12-28
