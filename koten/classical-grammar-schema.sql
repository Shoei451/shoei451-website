-- ========================================
-- 古典文法アプリ - Supabaseテーブル設計
-- ========================================

-- 1. 作品テーブル（複数の古典作品を管理）
CREATE TABLE IF NOT EXISTS classical_texts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    period TEXT, -- 例: 平安時代、鎌倉時代
    genre TEXT, -- 例: 物語、随筆、和歌
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 登場人物テーブル
CREATE TABLE IF NOT EXISTS characters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text_id UUID REFERENCES classical_texts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    social_status TEXT, -- 例: 帝、后、貴族、庶民
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 本文テーブル（作品の本文を章・段落単位で管理）
CREATE TABLE IF NOT EXISTS text_passages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text_id UUID REFERENCES classical_texts(id) ON DELETE CASCADE,
    chapter_number INTEGER,
    paragraph_number INTEGER,
    original_text TEXT NOT NULL, -- スラッシュ区切りの原文
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 単語解析テーブル（品詞分解の詳細）
CREATE TABLE IF NOT EXISTS word_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    passage_id UUID REFERENCES text_passages(id) ON DELETE CASCADE,
    word_position INTEGER NOT NULL, -- 文中の位置（0始まり）
    surface_form TEXT NOT NULL, -- 表層形（例: 給ふ）
    
    -- 基本文法情報
    part_of_speech TEXT NOT NULL, -- 品詞
    conjugation_type TEXT, -- 活用の種類（例: 四段、ラ変）
    conjugation_form TEXT, -- 活用形（例: 連用形、終止形）
    usage_note TEXT, -- 用法（例: 順接、逆接）
    
    -- 特殊マーク
    is_auxiliary BOOLEAN DEFAULT FALSE, -- 補助動詞フラグ
    
    -- 敬語情報
    honorific_type TEXT, -- null | '尊敬語' | '謙譲語' | '丁寧語'
    honorific_from_character_id UUID REFERENCES characters(id), -- 敬意の主体
    honorific_to_character_id UUID REFERENCES characters(id), -- 敬意の対象
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 係り結びテーブル
CREATE TABLE IF NOT EXISTS kakari_musubi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    passage_id UUID REFERENCES text_passages(id) ON DELETE CASCADE,
    kakari_word_id UUID REFERENCES word_analyses(id) ON DELETE CASCADE, -- 係助詞の位置
    musubi_word_id UUID REFERENCES word_analyses(id) ON DELETE CASCADE, -- 結びの語の位置
    kakari_type TEXT, -- 例: ぞ、なむ、や、か、こそ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. インデックス作成（パフォーマンス向上）
CREATE INDEX idx_word_analyses_passage ON word_analyses(passage_id);
CREATE INDEX idx_text_passages_text ON text_passages(text_id);
CREATE INDEX idx_characters_text ON characters(text_id);
CREATE INDEX idx_kakari_musubi_passage ON kakari_musubi(passage_id);

-- 7. Row Level Security (RLS) 設定
-- 注: 学習用なので、読み取りは全員OK、書き込みは認証ユーザーのみ

ALTER TABLE classical_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE kakari_musubi ENABLE ROW LEVEL SECURITY;

-- 読み取りポリシー（全員）
CREATE POLICY "Allow public read access" ON classical_texts FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON characters FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON text_passages FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON word_analyses FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON kakari_musubi FOR SELECT USING (true);

-- 書き込みポリシー（認証ユーザーのみ - 後で実装）
-- CREATE POLICY "Allow authenticated users to insert" ON classical_texts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- 同様に他のテーブルにも適用
