// classical-data.js - Supabase連携とデータ管理

// Supabase設定
const SUPABASE_URL = 'https://gjuqsyaugrsshmjerhme.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdXFzeWF1Z3Jzc2htamVyaG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NzA3NTYsImV4cCI6MjA4MjA0Njc1Nn0.V8q5ddz5tPy7wBaQ73aGtmCZyqzA6pPciPRwRIZjJcs';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== 文法データベース =====

// 活用の種類（品詞ごと）
const conjugationTypes = {
    "動詞": ["四段", "上一段", "上二段", "下一段", "下二段", "ナ変", "ラ変", "カ変", "サ変"],
    "形容詞": ["ク活用", "シク活用"],
    "形容動詞": ["ナリ活用", "タリ活用"],
    "助動詞": ["特殊型", "ラ変型", "ナリ活用型", "タリ活用型", "ク活用型", "シク活用型", "四段型", "下二段型", "サ変型"]
};

// 活用形
const conjugationForms = [
    "未然形", "連用形", "終止形", "連体形", "已然形", "命令形"
];

// よく使う単語のプリセット
const commonWordPresets = {
    "給ふ": [
        { label: "尊敬語・補助動詞", 品詞: "動詞", 活用の種類: "四段", is_auxiliary: true, honorific_type: "尊敬語" },
        { label: "謙譲語・補助動詞", 品詞: "動詞", 活用の種類: "四段", is_auxiliary: true, honorific_type: "謙譲語" }
    ],
    "侍り": [
        { label: "丁寧語・補助動詞", 品詞: "動詞", 活用の種類: "ラ変", is_auxiliary: true, honorific_type: "丁寧語" }
    ],
    "おはす": [
        { label: "尊敬語", 品詞: "動詞", 活用の種類: "サ変", honorific_type: "尊敬語" }
    ],
    "参る": [
        { label: "謙譲語", 品詞: "動詞", 活用の種類: "四段", honorific_type: "謙譲語" }
    ],
    "申す": [
        { label: "謙譲語", 品詞: "動詞", 活用の種類: "四段", honorific_type: "謙譲語" }
    ],
    "候ふ": [
        { label: "丁寧語・補助動詞", 品詞: "動詞", 活用の種類: "四段", is_auxiliary: true, honorific_type: "丁寧語" }
    ],
    "奉る": [
        { label: "謙譲語・補助動詞", 品詞: "動詞", 活用の種類: "四段", is_auxiliary: true, honorific_type: "謙譲語" }
    ]
};

// ===== データ保存関数 =====

// 作品情報を保存
async function saveTextInfo(textData) {
    try {
        const { data, error } = await supabaseClient
            .from('classical_texts')
            .insert([{
                title: textData.title,
                author: textData.author,
                period: textData.period,
                genre: textData.genre
            }])
            .select()
            .single();
        
        if (error) throw error;
        console.log('✅ 作品情報保存成功:', data);
        return data;
    } catch (error) {
        console.error('❌ 作品情報保存エラー:', error);
        return null;
    }
}

// 登場人物を保存
async function saveCharacter(textId, characterData) {
    try {
        const { data, error } = await supabaseClient
            .from('characters')
            .insert([{
                text_id: textId,
                name: characterData.name,
                description: characterData.description || '',
                social_status: characterData.social_status || ''
            }])
            .select()
            .single();
        
        if (error) throw error;
        console.log('✅ 登場人物保存成功:', data);
        return data;
    } catch (error) {
        console.error('❌ 登場人物保存エラー:', error);
        return null;
    }
}

// 本文を保存
async function savePassage(textId, passageData) {
    try {
        const { data, error } = await supabaseClient
            .from('text_passages')
            .insert([{
                text_id: textId,
                chapter_number: passageData.chapter_number || 1,
                paragraph_number: passageData.paragraph_number || 1,
                original_text: passageData.original_text
            }])
            .select()
            .single();
        
        if (error) throw error;
        console.log('✅ 本文保存成功:', data);
        return data;
    } catch (error) {
        console.error('❌ 本文保存エラー:', error);
        return null;
    }
}

// 単語解析を保存
async function saveWordAnalysis(passageId, wordData) {
    try {
        const { data, error } = await supabaseClient
            .from('word_analyses')
            .insert([{
                passage_id: passageId,
                word_position: wordData.word_position,
                surface_form: wordData.surface_form,
                part_of_speech: wordData.part_of_speech,
                conjugation_type: wordData.conjugation_type || null,
                conjugation_form: wordData.conjugation_form || null,
                usage_note: wordData.usage_note || null,
                is_auxiliary: wordData.is_auxiliary || false,
                honorific_type: wordData.honorific_type || null,
                honorific_from_character_id: wordData.honorific_from_character_id || null,
                honorific_to_character_id: wordData.honorific_to_character_id || null
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ 単語解析保存エラー:', error);
        return null;
    }
}

// 係り結びを保存
async function saveKakariMusubi(passageId, kakariData) {
    try {
        const { data, error } = await supabaseClient
            .from('kakari_musubi')
            .insert([{
                passage_id: passageId,
                kakari_word_id: kakariData.kakari_word_id,
                musubi_word_id: kakariData.musubi_word_id,
                kakari_type: kakariData.kakari_type
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ 係り結び保存エラー:', error);
        return null;
    }
}

// ===== データ読み込み関数 =====

// 作品一覧を取得
async function getTextsList() {
    try {
        const { data, error } = await supabaseClient
            .from('classical_texts')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ 作品一覧取得エラー:', error);
        return [];
    }
}

// 作品の詳細を取得（登場人物と本文を含む）
async function getTextDetail(textId) {
    try {
        // 作品情報
        const { data: textData, error: textError } = await supabaseClient
            .from('classical_texts')
            .select('*')
            .eq('id', textId)
            .single();
        
        if (textError) throw textError;
        
        // 登場人物
        const { data: characters, error: charError } = await supabaseClient
            .from('characters')
            .select('*')
            .eq('text_id', textId);
        
        if (charError) throw charError;
        
        // 本文
        const { data: passages, error: passError } = await supabaseClient
            .from('text_passages')
            .select('*')
            .eq('text_id', textId)
            .order('chapter_number', { ascending: true })
            .order('paragraph_number', { ascending: true });
        
        if (passError) throw passError;
        
        return {
            ...textData,
            characters,
            passages
        };
    } catch (error) {
        console.error('❌ 作品詳細取得エラー:', error);
        return null;
    }
}

// 本文の単語解析を取得
async function getWordAnalyses(passageId) {
    try {
        const { data, error } = await supabaseClient
            .from('word_analyses')
            .select(`
                *,
                honorific_from:characters!honorific_from_character_id(name),
                honorific_to:characters!honorific_to_character_id(name)
            `)
            .eq('passage_id', passageId)
            .order('word_position', { ascending: true });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ 単語解析取得エラー:', error);
        return [];
    }
}

// 係り結びを取得
async function getKakariMusubi(passageId) {
    try {
        const { data, error } = await supabaseClient
            .from('kakari_musubi')
            .select(`
                *,
                kakari_word:word_analyses!kakari_word_id(*),
                musubi_word:word_analyses!musubi_word_id(*)
            `)
            .eq('passage_id', passageId);
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ 係り結び取得エラー:', error);
        return [];
    }
}

// ===== ユーティリティ関数 =====

// プリセット候補を取得
function getPresetSuggestions(word) {
    return commonWordPresets[word] || [];
}

// 活用の種類の候補を取得
function getConjugationTypeOptions(partOfSpeech) {
    return conjugationTypes[partOfSpeech] || [];
}

// 活用形の候補を取得
function getConjugationFormOptions() {
    return conjugationForms;
}