// 衣類取り扱い表示クイズのロジック

// Supabase 初期化
const SUPABASE_URL = 'https://gjuqsyaugrsshmjerhme.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdXFzeWF1Z3Jzc2htamVyaG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NzA3NTYsImV4cCI6MjA4MjA0Njc1Nn0.V8q5ddz5tPy7wBaQ73aGtmCZyqzA6pPciPRwRIZjJcs';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentMode = 'basic';
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let answeredQuestions = 0;
let selectedQuestionCount = 10;
let selectedCategory = 'all';
let quizMode = 'random';
let wrongAnswers = [];
let selectedSymbols = new Set();

// 統計データ（ローカルストレージ）
let stats = {
    totalAttempts: {},
    correctAttempts: {},
    lastAttempted: {}
};

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('care-symbols-theme', theme);
});

// Load theme
const savedTheme = localStorage.getItem('care-symbols-theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark');
}

// 統計データの読み込み・保存
function loadStats() {
    const saved = localStorage.getItem('care-symbols-stats');
    if (saved) {
        stats = JSON.parse(saved);
    }
}

function saveStats() {
    localStorage.setItem('care-symbols-stats', JSON.stringify(stats));
}

function updateQuestionStats(questionId, isCorrect) {
    if (!stats.totalAttempts[questionId]) {
        stats.totalAttempts[questionId] = 0;
        stats.correctAttempts[questionId] = 0;
    }
    
    stats.totalAttempts[questionId]++;
    if (isCorrect) {
        stats.correctAttempts[questionId]++;
    }
    stats.lastAttempted[questionId] = Date.now();
    
    saveStats();
}

function getCorrectRate(questionId) {
    if (!stats.totalAttempts[questionId] || stats.totalAttempts[questionId] === 0) {
        return null;
    }
    return (stats.correctAttempts[questionId] / stats.totalAttempts[questionId]) * 100;
}

// シャッフル
function shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// モード選択
function selectMode(mode) {
    currentMode = mode;
    document.getElementById('startScreen').classList.add('hidden');
    
    if (mode === 'basic') {
        document.getElementById('basicSettings').classList.remove('hidden');
    } else if (mode === 'material') {
        document.getElementById('materialMode').classList.remove('hidden');
        initializeMaterialMode();
    }
}

function backToStart() {
    document.getElementById('basicSettings').classList.add('hidden');
    document.getElementById('materialMode').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
}

// === 基本モード ===

function filterQuestionsByMode(questions, mode) {
    const MIN_ATTEMPTS = 3;
    
    switch(mode) {
        case 'difficult':
            return questions.filter(q => {
                const attempts = stats.totalAttempts[q.id] || 0;
                if (attempts < MIN_ATTEMPTS) return false;
                const rate = getCorrectRate(q.id);
                return rate !== null && rate < 50;
            });
        
        case 'unattempted':
            return questions.filter(q => {
                const attempts = stats.totalAttempts[q.id] || 0;
                return attempts < MIN_ATTEMPTS;
            });
        
        case 'random':
        default:
            return questions;
    }
}

document.getElementById('startBasicBtn').addEventListener('click', () => {
    loadStats();
    
    const categorySelect = document.getElementById('categorySelect');
    const modeSelect = document.getElementById('quizMode');
    const countSelect = document.getElementById('questionCount');
    
    selectedCategory = categorySelect.value;
    quizMode = modeSelect.value;
    const countValue = countSelect.value;
    
    // カテゴリーでフィルタリング
    let filtered = selectedCategory === 'all' 
        ? careSymbolsData.slice() 
        : careSymbolsData.filter(q => q.category === selectedCategory);
    
    if (filtered.length === 0) {
        alert('該当する問題がありません。');
        return;
    }
    
    // モードでフィルタリング
    filtered = filterQuestionsByMode(filtered, quizMode);
    
    if (filtered.length === 0) {
        alert('このモードで出題できる問題がまだありません。ランダム練習をお試しください。');
        return;
    }
    
    // シャッフル
    filtered = shuffle(filtered);
    
    // 出題数を決定
    selectedQuestionCount = countValue === 'all' ? filtered.length : parseInt(countValue);
    selectedQuestionCount = Math.min(selectedQuestionCount, filtered.length);
    questions = filtered.slice(0, selectedQuestionCount);
    
    // 初期化
    currentQuestionIndex = 0;
    score = 0;
    answeredQuestions = 0;
    wrongAnswers = [];
    
    // 画面切り替え
    document.getElementById('basicSettings').classList.add('hidden');
    document.getElementById('quizScreen').classList.remove('hidden');
    
    showQuestion();
});

function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }
    
    const question = questions[currentQuestionIndex];
    
    // カテゴリーバッジ
    document.getElementById('categoryBadge').textContent = question.categoryJP;
    
    // 記号画像を表示
    const symbolImage = document.getElementById('symbolImage');
    symbolImage.src = question.imageUrl;
    symbolImage.alt = question.meaning;
    
    // 問題文
    document.getElementById('question').textContent = 'この記号の意味は？';
    
    // 選択肢（既にシャッフル済み）
    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';
    
    question.choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.textContent = choice;
        btn.onclick = () => checkAnswer(index, btn);
        choicesDiv.appendChild(btn);
    });
    
    // フィードバックを非表示
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('nextBtn').classList.add('hidden');
    
    updateProgress();
}

function checkAnswer(selectedIndex, button) {
    const question = questions[currentQuestionIndex];
    const buttons = document.getElementById('choices').querySelectorAll('button');
    
    buttons.forEach(btn => btn.disabled = true);
    
    const isCorrect = question.choices[selectedIndex] === question.choices[question.correctAnswer];
    answeredQuestions++;
    
    if (isCorrect) {
        score++;
        button.classList.add('correct');
    } else {
        button.classList.add('incorrect');
        wrongAnswers.push({ question, selectedAnswer: selectedIndex });
        
        // 正解を表示
        buttons.forEach((btn, idx) => {
            if (btn.textContent === question.choices[question.correctAnswer]) {
                btn.classList.add('correct');
            }
        });
    }
    
    updateQuestionStats(question.id, isCorrect);
    showFeedback(question, isCorrect);
    
    document.getElementById('score').textContent = `スコア: ${score}/${answeredQuestions}`;
    document.getElementById('nextBtn').classList.remove('hidden');
}

function showFeedback(question, isCorrect) {
    const feedbackDiv = document.getElementById('feedback');
    const bannerClass = isCorrect ? 'correct-banner' : 'incorrect-banner';
    
    const attempts = stats.totalAttempts[question.id] || 0;
    const correctRate = getCorrectRate(question.id);
    const rateText = correctRate !== null ? `${correctRate.toFixed(1)}%` : '初回';
    
    const materialsText = question.relatedMaterials && question.relatedMaterials.length > 0
        ? question.relatedMaterials.join('、')
        : '一般的な衣類';
    
    feedbackDiv.innerHTML = `
        <h3 class="${bannerClass}">${isCorrect ? '✓ 正解！' : '✗ 不正解'}</h3>
        <div class="feedback-content">
            <div class="feedback-item">
                <span class="feedback-label">正解</span>
                <div class="feedback-value">${question.meaning}</div>
            </div>
            <div class="feedback-item">
                <span class="feedback-label">詳細</span>
                <div class="feedback-value">${question.description}</div>
            </div>
            <div class="feedback-item">
                <span class="feedback-label">代表的な素材</span>
                <div class="feedback-value">${materialsText}</div>
            </div>
            <div class="feedback-item">
                <span class="feedback-label">あなたの正答率</span>
                <div class="feedback-value">${rateText}（${attempts}回目の挑戦）</div>
            </div>
        </div>
    `;
    
    feedbackDiv.classList.remove('hidden');
}

function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

document.getElementById('nextBtn').addEventListener('click', () => {
    currentQuestionIndex++;
    showQuestion();
});

function showResults() {
    document.getElementById('quizScreen').classList.add('hidden');
    document.getElementById('resultsScreen').classList.remove('hidden');
    
    const percentage = Math.round((score / questions.length) * 100);
    
    let comment = '';
    if (percentage >= 90) {
        comment = '完璧！洗濯表示をマスターしています！🎉';
    } else if (percentage >= 70) {
        comment = 'よくできました！基本はバッチリです！👍';
    } else if (percentage >= 50) {
        comment = '頑張りました。よく間違える記号を復習しましょう！📚';
    } else {
        comment = '基礎からもう一度確認しましょう！💪';
    }
    
    document.getElementById('finalScore').innerHTML = `
        <p style="font-size: 2em; margin: 20px 0;">スコア: ${score}/${questions.length}</p>
        <p style="font-size: 1.5em; margin: 20px 0;">${percentage}%</p>
        <p class="note">${comment}</p>
    `;
    
    showCategoryBreakdown();
    document.getElementById('reviewBtn').style.display = wrongAnswers.length > 0 ? 'inline-block' : 'none';
}

function showCategoryBreakdown() {
    const breakdown = {};
    
    questions.forEach((q, idx) => {
        if (!breakdown[q.category]) {
            breakdown[q.category] = {
                total: 0,
                correct: 0,
                name: q.categoryJP
            };
        }
        breakdown[q.category].total++;
        
        const wasWrong = wrongAnswers.some(wa => wa.question.id === q.id);
        if (!wasWrong && idx < answeredQuestions) {
            breakdown[q.category].correct++;
        }
    });
    
    const breakdownDiv = document.getElementById('categoryBreakdown');
    
    if (Object.keys(breakdown).length > 1) {
        let html = '<h3>カテゴリー別成績</h3>';
        
        for (const [category, data] of Object.entries(breakdown)) {
            const rate = Math.round((data.correct / data.total) * 100);
            html += `
                <div class="category-stat">
                    <strong>${data.name}</strong>
                    <span>${data.correct}/${data.total} (${rate}%)</span>
                </div>
            `;
        }
        
        breakdownDiv.innerHTML = html;
    } else {
        breakdownDiv.innerHTML = '';
    }
}

document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('resultsScreen').classList.add('hidden');
    document.getElementById('basicSettings').classList.remove('hidden');
});

document.getElementById('reviewBtn').addEventListener('click', () => {
    if (wrongAnswers.length === 0) return;
    
    questions = wrongAnswers.map(wa => wa.question);
    currentQuestionIndex = 0;
    score = 0;
    answeredQuestions = 0;
    wrongAnswers = [];
    
    document.getElementById('resultsScreen').classList.add('hidden');
    document.getElementById('quizScreen').classList.remove('hidden');
    
    showQuestion();
});

document.getElementById('homeBtn').addEventListener('click', () => {
    if (confirm('進行中のクイズを終了しますか？')) {
        document.getElementById('quizScreen').classList.add('hidden');
        document.getElementById('startScreen').classList.remove('hidden');
    }
});

// === 素材特定モード ===

function initializeMaterialMode() {
    const symbolSelector = document.getElementById('symbolSelector');
    symbolSelector.innerHTML = '';
    selectedSymbols.clear();
    
    materialIdentificationSymbols.forEach(symbol => {
        const div = document.createElement('div');
        div.className = 'symbol-option';
        div.onclick = () => toggleSymbol(symbol.id, div);
        
        div.innerHTML = `
            <img src="${symbol.imageUrl}" alt="${symbol.label}" />
            <label>${symbol.label}</label>
        `;
        
        symbolSelector.appendChild(div);
    });
}

function toggleSymbol(symbolId, element) {
    if (selectedSymbols.has(symbolId)) {
        selectedSymbols.delete(symbolId);
        element.classList.remove('selected');
    } else {
        selectedSymbols.add(symbolId);
        element.classList.add('selected');
    }
}

document.getElementById('submitMaterialBtn').addEventListener('click', async () => {
    const materialGuess = document.getElementById('materialGuess').value.trim();
    
    if (selectedSymbols.size === 0) {
        alert('洗濯表示記号を最低1つ選択してください。');
        return;
    }
    
    if (!materialGuess) {
        alert('素材名を入力してください。');
        return;
    }
    
    // Supabaseに記録
    try {
        const symbolsArray = Array.from(selectedSymbols);
        
        const { data, error } = await supabaseClient
            .from('clothing_material_identification')
            .insert({
                symbols: symbolsArray,
                material_guess: materialGuess,
                timestamp: new Date().toISOString()
            })
            .select();
        
        if (error) {
            console.error('Supabase error:', error);
            showMaterialResult(false, '記録に失敗しました。もう一度お試しください。');
            return;
        }
        
        // 成功メッセージ
        showMaterialResult(true, `
            <h4>✓ データを記録しました</h4>
            <p>選択した記号: ${symbolsArray.length}個</p>
            <p>予想素材: ${materialGuess}</p>
            <p class="note">※ 実際の正誤は授業で確認しましょう。このデータは学習記録として保存されました。</p>
        `);
        
        // リセット
        document.getElementById('materialGuess').value = '';
        selectedSymbols.clear();
        document.querySelectorAll('.symbol-option').forEach(el => el.classList.remove('selected'));
        
    } catch (error) {
        console.error('Error:', error);
        showMaterialResult(false, 'エラーが発生しました。');
    }
});

function showMaterialResult(success, message) {
    const resultDiv = document.getElementById('materialResult');
    resultDiv.innerHTML = message;
    resultDiv.classList.remove('hidden');
    
    if (success) {
        resultDiv.style.borderLeftColor = '#4caf50';
    } else {
        resultDiv.style.borderLeftColor = '#f44336';
    }
}

// 初期化
loadStats();
