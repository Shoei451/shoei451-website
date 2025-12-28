# 衣類取り扱い表示クイズ セットアップガイド

## 📋 概要
このクイズアプリは、衣類の取り扱い表示記号（JIS L 0001）を学習するための2つのモードを提供します：

1. **基本モード**: 記号を見て意味を4択で答える
2. **素材特定モード**: 実際の衣類を見て、表示記号から素材を推測する（Supabaseに記録）

## 🖼️ 画像のセットアップ

### 必要な画像
ICOMPO（https://icompo.net/）から以下の洗濯表示記号の画像をダウンロードしてください：

#### 洗濯処理（11個）
- wash-30-normal.png (洗濯機30℃)
- wash-30-weak.png (洗濯機30℃（弱）)
- wash-30-very-weak.png (洗濯機30℃（弱弱）)
- wash-40-normal.png (洗濯機40℃)
- wash-40-weak.png (洗濯機40℃（弱）)
- hand-wash-30.png (手洗い30℃)
- hand-wash-40.png (手洗い40℃)
- wash-prohibited.png (家庭での洗濯禁止)

#### 漂白処理（3個）
- bleach-ok.png (漂白剤OK)
- bleach-oxygen-only.png (酸素系漂白剤のみOK)
- bleach-prohibited.png (漂白剤使用禁止)

#### 乾燥処理（9個）
- tumble-dry-60.png (タンブル乾燥60℃)
- tumble-dry-80.png (タンブル乾燥80℃)
- tumble-dry-prohibited.png (タンブル乾燥禁止)
- hang-dry.png (つり干し)
- drip-hang-dry.png (ぬれつり干し)
- flat-dry.png (平干し)
- shade-hang-dry.png (日陰でつり干し)

#### アイロン仕上げ（5個）
- iron-210.png (アイロン210℃)
- iron-160.png (アイロン160℃)
- iron-120.png (アイロン120℃)
- iron-120-no-steam.png (アイロン120℃スチーム禁止)
- iron-prohibited.png (アイロン仕上げ禁止)

#### クリーニング（7個）
- dry-clean-ok.png (ドライクリーニングOK)
- dry-clean-weak.png (ドライクリーニングOK（弱）)
- petroleum-only.png (ドライクリーニング石油系のみOK)
- dry-clean-prohibited.png (ドライクリーニング禁止)
- wet-clean-ok.png (ウェットクリーニングOK)
- wet-clean-weak.png (ウェットクリーニングOK（弱）)
- wet-clean-prohibited.png (ウェットクリーニング禁止)

### ディレクトリ構造
```
home_economics/
├── care-symbols-quiz.html
├── care-symbols-data.js
├── care-symbols-logic.js
├── care-symbols-style.css
└── images/
    └── care-symbols/
        ├── wash-30-normal.png
        ├── wash-30-weak.png
        ├── (その他の画像...)
```

### 画像のダウンロード手順

1. **ICOMPOにアクセス**
   - https://icompo.net/ にアクセス
   - 検索バーで「洗濯表示」と検索

2. **必要な記号をダウンロード**
   - 各記号をクリック
   - PNG形式でダウンロード（推奨サイズ: 512x512px）
   - 上記のファイル名に変更

3. **配置**
   - `home_economics/images/care-symbols/` フォルダを作成
   - ダウンロードした画像をすべて配置

## 🗄️ Supabaseセットアップ

### テーブル作成
素材特定モードで使用するテーブルを作成してください：

```sql
CREATE TABLE clothing_material_identification (
    id BIGSERIAL PRIMARY KEY,
    symbols TEXT[] NOT NULL,
    material_guess TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLSを有効化（誰でも挿入可能に設定）
ALTER TABLE clothing_material_identification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON clothing_material_identification
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Allow public read" ON clothing_material_identification
    FOR SELECT TO anon
    USING (true);
```

## ✅ 動作確認

1. ブラウザでHTMLファイルを開く
2. 基本モードで記号が正しく表示されることを確認
3. 素材特定モードで記録がSupabaseに保存されることを確認

## 📝 カスタマイズ

### 問題の追加
`care-symbols-data.js` の `careSymbolsData` 配列に新しい問題を追加できます：

```javascript
{
    id: 29,
    category: "washing",
    categoryJP: "洗濯処理",
    symbol: "wash-50-normal",
    imageUrl: "images/care-symbols/wash-50-normal.png",
    meaning: "洗濯機50℃",
    description: "液温は50℃を限度とし、洗濯機で洗濯ができる",
    choices: [
        "洗濯機40℃",
        "洗濯機50℃",
        "洗濯機60℃",
        "手洗い50℃"
    ],
    correctAnswer: 1,
    relatedMaterials: ["白い綿製品"],
    difficulty: "easy"
}
```

## 🎯 使い方

### 基本モード
1. 出題カテゴリーを選択
2. 出題数を選択
3. 学習モードを選択（ランダム/弱点克服/未学習）
4. クイズ開始
5. 記号を見て意味を4択で回答
6. 解説で詳細を確認

### 素材特定モード
1. 手元の衣類のタグを確認
2. 該当する洗濯表示記号を選択
3. 素材を予想して入力
4. 送信するとSupabaseに記録される
5. 授業で正誤を確認

## 🔧 トラブルシューティング

### 画像が表示されない
- 画像のパスが正しいか確認
- ファイル名が正確か確認（大文字小文字も区別されます）

### Supabaseエラー
- ブラウザのコンソールでエラー内容を確認
- RLSポリシーが正しく設定されているか確認
- API KeyとURLが正しいか確認

## 📚 参考資料
- [消費者庁 - 新しい洗濯表示](https://www.caa.go.jp/policies/policy/representation/household_goods/laundry_symbols.html)
- [ICOMPO - 商用フリーアイコン素材](https://icompo.net/)
