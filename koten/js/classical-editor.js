// classical-editor.js - 編集モードの機能

// ===== グローバル変数 =====
let currentTextId = null;
let currentPassageId = null;
let characters = [];
let words = [];
let currentWordIndex = -1;
let kakariMusubiPairs = [];

// ===== スラッシュ挿入機能 =====
function insertSlash() {
    const textarea = document.getElementById('textInput');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    // カーソル位置に/を挿入
    const newText = text.substring(0, start) + '/' + text.substring(end);
    textarea.value = newText;
    
    // カーソル位置を/の後ろに移動
    textarea.selectionStart = textarea.selectionEnd = start + 1;
    textarea.focus();
}

// ===== モード切り替え =====
function switchMode(mode) {
    const modeSelection = document.getElementById('modeSelection');
    const editMode = document.getElementById('editMode');
    const viewMode = document.getElementById('viewMode');
    
    modeSelection.classList.add('hidden');
    editMode.classList.add('hidden');
    viewMode.classList.add('hidden');
    
    if (mode === 'select') {
        modeSelection.classList.remove('hidden');
    } else if (mode === 'edit') {
        editMode.classList.remove('hidden');
        updateCharacterSelects();
    } else if (mode === 'view') {
        viewMode.classList.remove('hidden');
        renderViewMode();
    }
}

// ===== 登場人物管理 =====
function addCharacter() {
    const nameInput = document.getElementById('newCharacterName');
    const statusInput = document.getElementById('newCharacterStatus');
    
    const name = nameInput.value.trim();
    const status = statusInput.value.trim();
    
    if (!name) {
        alert('人物名を入力してください');
        return;
    }
    
    const character = {
        id: 'char_' + Date.now(),
        name,
        social_status: status
    };
    
    characters.push(character);
    renderCharactersList();
    updateCharacterSelects();
    
    nameInput.value = '';
    statusInput.value = '';
}

function removeCharacter(characterId) {
    characters = characters.filter(c => c.id !== characterId);
    renderCharactersList();
    updateCharacterSelects();
}

function renderCharactersList() {
    const list = document.getElementById('charactersList');
    list.innerHTML = '';
    
    characters.forEach(char => {
        const tag = document.createElement('div');
        tag.className = 'character-tag';
        tag.innerHTML = `
            <span class="name">${char.name}</span>
            ${char.social_status ? `<span class="status">(${char.social_status})</span>` : ''}
            <button onclick="removeCharacter('${char.id}')">✕</button>
        `;
        list.appendChild(tag);
    });
}

function updateCharacterSelects() {
    const fromSelect = document.getElementById('honorificFrom');
    const toSelect = document.getElementById('honorificTo');
    
    if (!fromSelect || !toSelect) return;
    
    const options = characters.map(c => 
        `<option value="${c.id}">${c.name}${c.social_status ? ' (' + c.social_status + ')' : ''}</option>`
    ).join('');
    
    fromSelect.innerHTML = '<option value="">選択してください</option>' + options;
    toSelect.innerHTML = '<option value="">選択してください</option>' + options;
}

// ===== テキスト解析 =====
function parseText() {
    const input = document.getElementById('textInput').value.trim();
    
    if (!input) {
        alert('本文を入力してください');
        return;
    }
    
    // スラッシュで分割
    const rawWords = input.split('/').map(w => w.trim()).filter(w => w);
    
    if (rawWords.length === 0) {
        alert('単語が見つかりません。/で区切ってください');
        return;
    }
    
    // 単語配列を初期化
    words = rawWords.map((word, index) => ({
        position: index,
        surface_form: word,
        part_of_speech: '',
        conjugation_type: '',
        conjugation_form: '',
        usage_note: '',
        is_auxiliary: false,
        honorific_type: '',
        honorific_from_character_id: '',
        honorific_to_character_id: ''
    }));
    
    renderWordsList();
    document.getElementById('wordsListPanel').classList.remove('hidden');
}

function renderWordsList() {
    const list = document.getElementById('wordsList');
    list.innerHTML = '';
    
    words.forEach((word, index) => {
        const item = document.createElement('div');
        item.className = 'word-item';
        item.onclick = () => openWordPanel(index);
        
        const posInfo = word.part_of_speech || '未設定';
        const conjugationInfo = word.conjugation_type ? 
            `${word.conjugation_type}・${word.conjugation_form || ''}` : '';
        
        item.innerHTML = `
            <div class="word-item-text">${word.surface_form}</div>
            <div class="word-item-info">
                ${posInfo}
                ${conjugationInfo ? `<br>${conjugationInfo}` : ''}
                ${word.is_auxiliary ? ' [補助]' : ''}
                ${word.honorific_type ? ` [${word.honorific_type}]` : ''}
            </div>
        `;
        list.appendChild(item);
    });
}

// ===== 単語編集パネル =====
function openWordPanel(index) {
    currentWordIndex = index;
    const word = words[index];
    
    document.getElementById('currentWord').textContent = word.surface_form;
    document.getElementById('wordPartOfSpeech').value = word.part_of_speech;
    document.getElementById('wordConjugationType').value = word.conjugation_type;
    document.getElementById('wordConjugationForm').value = word.conjugation_form;
    
    // 用法フィールドの表示切り替え
    updateUsageNoteField(word.part_of_speech);
    
    if (word.part_of_speech === '助詞' && ['係助詞', '接続助詞', '格助詞', '副助詞', '終助詞', '間投助詞'].includes(word.usage_note)) {
        document.getElementById('wordUsageNoteSelect').value = word.usage_note;
    } else {
        document.getElementById('wordUsageNote').value = word.usage_note;
    }
    
    document.getElementById('isAuxiliary').checked = word.is_auxiliary;
    
    // 敬語設定
    if (word.honorific_type) {
        document.getElementById('isHonorific').checked = true;
        document.getElementById('honorificSettings').classList.remove('hidden');
        document.getElementById('honorificType').value = word.honorific_type;
        document.getElementById('honorificFrom').value = word.honorific_from_character_id;
        document.getElementById('honorificTo').value = word.honorific_to_character_id;
    } else {
        document.getElementById('isHonorific').checked = false;
        document.getElementById('honorificSettings').classList.add('hidden');
    }
    
    updateConjugationOptions();
    document.getElementById('wordAnalysisPanel').classList.remove('hidden');
}

function closeWordPanel() {
    document.getElementById('wordAnalysisPanel').classList.add('hidden');
    currentWordIndex = -1;
}

function saveWordAnalysis() {
    if (currentWordIndex === -1) return;
    
    const word = words[currentWordIndex];
    
    word.part_of_speech = document.getElementById('wordPartOfSpeech').value;
    word.conjugation_type = document.getElementById('wordConjugationType').value;
    word.conjugation_form = document.getElementById('wordConjugationForm').value;
    
    // 用法の取得（助詞の場合はselectから、それ以外はinputから）
    if (word.part_of_speech === '助詞') {
        word.usage_note = document.getElementById('wordUsageNoteSelect').value;
    } else {
        word.usage_note = document.getElementById('wordUsageNote').value;
    }
    
    word.is_auxiliary = document.getElementById('isAuxiliary').checked;
    
    if (document.getElementById('isHonorific').checked) {
        word.honorific_type = document.getElementById('honorificType').value;
        word.honorific_from_character_id = document.getElementById('honorificFrom').value;
        word.honorific_to_character_id = document.getElementById('honorificTo').value;
    } else {
        word.honorific_type = '';
        word.honorific_from_character_id = '';
        word.honorific_to_character_id = '';
    }
    
    renderWordsList();
    closeWordPanel();
}

function updateUsageNoteField(partOfSpeech) {
    const inputField = document.getElementById('wordUsageNote');
    const selectField = document.getElementById('wordUsageNoteSelect');
    
    if (partOfSpeech === '助詞') {
        inputField.classList.add('hidden');
        selectField.classList.remove('hidden');
    } else {
        inputField.classList.remove('hidden');
        selectField.classList.add('hidden');
    }
}

function updateConjugationOptions() {
    const pos = document.getElementById('wordPartOfSpeech').value;
    const typeSelect = document.getElementById('wordConjugationType');
    const formSelect = document.getElementById('wordConjugationForm');
    
    const typeGroup = document.getElementById('conjugationTypeGroup');
    const formGroup = document.getElementById('conjugationFormGroup');
    
    // 用法フィールドの表示切り替え
    updateUsageNoteField(pos);
    
    if (pos === '動詞' || pos === '形容詞' || pos === '形容動詞' || pos === '助動詞') {
        typeGroup.style.display = 'block';
        formGroup.style.display = 'block';
        
        const types = getConjugationTypeOptions(pos);
        typeSelect.innerHTML = '<option value="">選択してください</option>' + 
            types.map(t => `<option value="${t}">${t}</option>`).join('');
        
        updateConjugationFormOptions();
    } else {
        typeGroup.style.display = 'none';
        formGroup.style.display = 'none';
    }
}

function updateConjugationFormOptions() {
    const formSelect = document.getElementById('wordConjugationForm');
    const forms = getConjugationFormOptions();
    
    formSelect.innerHTML = '<option value="">選択してください</option>' + 
        forms.map(f => `<option value="${f}">${f}</option>`).join('');
}

function toggleHonorificSettings() {
    const isChecked = document.getElementById('isHonorific').checked;
    const settings = document.getElementById('honorificSettings');
    
    if (isChecked) {
        settings.classList.remove('hidden');
    } else {
        settings.classList.add('hidden');
    }
}

function toggleKakariSettings() {
    const isChecked = document.getElementById('isKakari').checked;
    const settings = document.getElementById('kakariSettings');
    
    if (isChecked) {
        settings.classList.remove('hidden');
    } else {
        settings.classList.add('hidden');
    }
}

// ===== データ保存 =====
async function saveText() {
    // 作品情報取得
    const textData = {
        title: document.getElementById('textTitle').value.trim(),
        author: document.getElementById('textAuthor').value.trim(),
        period: document.getElementById('textPeriod').value.trim(),
        genre: document.getElementById('textGenre').value.trim()
    };
    
    if (!textData.title) {
        alert('作品名を入力してください');
        return;
    }
    
    if (words.length === 0) {
        alert('本文を入力して品詞分解してください');
        return;
    }
    
    try {
        // 作品情報を保存
        const savedText = await saveTextInfo(textData);
        if (!savedText) throw new Error('作品情報の保存に失敗しました');
        
        currentTextId = savedText.id;
        
        // 登場人物を保存
        for (const char of characters) {
            const savedChar = await saveCharacter(currentTextId, char);
            if (savedChar) {
                char.db_id = savedChar.id; // データベースIDを保持
            }
        }
        
        // 本文を保存
        const passageData = {
            chapter_number: 1,
            paragraph_number: 1,
            original_text: words.map(w => w.surface_form).join('/')
        };
        
        const savedPassage = await savePassage(currentTextId, passageData);
        if (!savedPassage) throw new Error('本文の保存に失敗しました');
        
        currentPassageId = savedPassage.id;
        
        // 単語解析を保存
        for (const word of words) {
            const wordData = {
                passage_id: currentPassageId,
                word_position: word.position,
                surface_form: word.surface_form,
                part_of_speech: word.part_of_speech,
                conjugation_type: word.conjugation_type,
                conjugation_form: word.conjugation_form,
                usage_note: word.usage_note,
                is_auxiliary: word.is_auxiliary,
                honorific_type: word.honorific_type || null,
                honorific_from_character_id: word.honorific_from_character_id ? 
                    characters.find(c => c.id === word.honorific_from_character_id)?.db_id : null,
                honorific_to_character_id: word.honorific_to_character_id ? 
                    characters.find(c => c.id === word.honorific_to_character_id)?.db_id : null
            };
            
            const savedWord = await saveWordAnalysis(currentPassageId, wordData);
            if (savedWord) {
                word.db_id = savedWord.id;
            }
        }
        
        alert('✅ 保存完了しました！');
        
    } catch (error) {
        console.error('保存エラー:', error);
        alert('❌ 保存に失敗しました: ' + error.message);
    }
}

// ===== データ読み込み =====
async function loadText() {
    const textsList = await getTextsList();
    
    if (textsList.length === 0) {
        alert('保存されたデータがありません');
        return;
    }
    
    // 簡易的な選択UI（後で改善可能）
    const selectedIndex = prompt(
        '読み込む作品を選んでください（番号を入力）:\n\n' +
        textsList.map((t, i) => `${i + 1}. ${t.title} (${t.author || '作者不明'})`).join('\n')
    );
    
    if (!selectedIndex) return;
    
    const index = parseInt(selectedIndex) - 1;
    if (index < 0 || index >= textsList.length) {
        alert('無効な番号です');
        return;
    }
    
    const textId = textsList[index].id;
    const textDetail = await getTextDetail(textId);
    
    if (!textDetail) {
        alert('データの読み込みに失敗しました');
        return;
    }
    
    // データをフォームに反映
    document.getElementById('textTitle').value = textDetail.title;
    document.getElementById('textAuthor').value = textDetail.author || '';
    document.getElementById('textPeriod').value = textDetail.period || '';
    document.getElementById('textGenre').value = textDetail.genre || '';
    
    characters = textDetail.characters.map(c => ({
        id: 'char_' + c.id,
        db_id: c.id,
        name: c.name,
        social_status: c.social_status
    }));
    
    renderCharactersList();
    updateCharacterSelects();
    
    if (textDetail.passages.length > 0) {
        const passage = textDetail.passages[0];
        currentPassageId = passage.id;
        document.getElementById('textInput').value = passage.original_text;
        
        // 単語解析を読み込み
        const wordAnalyses = await getWordAnalyses(passage.id);
        
        words = wordAnalyses.map(w => ({
            position: w.word_position,
            surface_form: w.surface_form,
            part_of_speech: w.part_of_speech,
            conjugation_type: w.conjugation_type || '',
            conjugation_form: w.conjugation_form || '',
            usage_note: w.usage_note || '',
            is_auxiliary: w.is_auxiliary,
            honorific_type: w.honorific_type || '',
            honorific_from_character_id: w.honorific_from_character_id ? 
                'char_' + w.honorific_from_character_id : '',
            honorific_to_character_id: w.honorific_to_character_id ? 
                'char_' + w.honorific_to_character_id : '',
            db_id: w.id
        }));
        
        renderWordsList();
        document.getElementById('wordsListPanel').classList.remove('hidden');
    }
    
    alert('✅ データを読み込みました！');
}