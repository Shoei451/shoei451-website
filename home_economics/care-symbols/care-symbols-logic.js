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

// Material mode specific
let materialQuestions = [];
let materialCurrentIndex = 0;
let materialScore = 0;
let materialAnswered = 0;

// 統計データ（ローカルストレージ）
let stats = {
    totalAttempts: {},
    correctAttempts: {},
    lastAttempted: {}
};

// 素材名の日英対応
const materialNames = {
    cotton: '綿',
    polyester: 'ポリエステル',
    wool: 'ウール',
    silk: 'シルク',
    linen: '麻',
    nylon: 'ナイロン',
    acrylic: 'アクリル',
    rayon: 'レーヨン'
};

const materialColors = {
    cotton: '#E8F5E9',
    polyester: '#E3F2FD',
    wool: '#FFF3E0',
    silk: '#FCE4EC',
    linen: '#F1F8E9',
    nylon: '#E0F2F1',
    acrylic: '#F3E5F5',
    rayon: '#FFF9C4'
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
    }
}

function backToStart() {
    document.getElementById('basicSettings').classList.add('hidden');
    document.getElementById('materialMode').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
}

function backToMaterialMode() {
    document.getElementById('materialQuizScreen').classList.add('hidden');
    document.getElementById('addMaterialScreen').classList.add('hidden');
    document.getElementById('materialResultsScreen').classList.add('hidden');
    document.getElementById('materialMode').classList.remove('hidden');
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

// 素材特定クイズを開始
async function showMaterialQuiz() {
    document.getElementById('materialMode').classList.add('hidden');
    document.getElementById('loading').classList.remove('hidden');
    
    try {
        // Supabaseから問題データを取得
        const { data, error } = await supabaseClient
            .from('clothing_materials')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            alert('まだ問題が登録されていません。先に問題を追加してください。');
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('materialMode').classList.remove('hidden');
            return;
        }
        
        // 10問選択（ランダム）
        materialQuestions = shuffle(data).slice(0, Math.min(10, data.length));
        materialCurrentIndex = 0;
        materialScore = 0;
        materialAnswered = 0;
        
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('materialQuizScreen').classList.remove('hidden');
        
        showMaterialQuestion();
        
    } catch (error) {
        console.error('Error loading material questions:', error);
        alert('問題の読み込みに失敗しました: ' + error.message);
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('materialMode').classList.remove('hidden');
    }
}

function showMaterialQuestion() {
    if (materialCurrentIndex >= materialQuestions.length) {
        showMaterialResults();
        return;
    }
    
    const question = materialQuestions[materialCurrentIndex];
    
    // 洗濯表示記号を表示
    const symbolsDisplay = document.getElementById('materialSymbolsDisplay');
    symbolsDisplay.innerHTML = '';
    
    question.symbols.forEach(symbolId => {
        const symbolData = materialIdentificationSymbols.find(s => s.id === symbolId);
        if (symbolData) {
            const img = document.createElement('img');
            img.src = symbolData.imageUrl;
            img.alt = symbolData.label;
            symbolsDisplay.appendChild(img);
        }
    });
    
    // 円グラフの選択肢を生成（正解1つ + ダミー3つ）
    const choices = generatePieChartChoices(question);
    displayPieChartChoices(choices, question);
    
    // フィードバックを非表示
    document.getElementById('materialFeedback').classList.add('hidden');
    document.getElementById('materialNextBtn').classList.add('hidden');
    
    updateMaterialProgress();
}

function generatePieChartChoices(correctQuestion) {
    const choices = [correctQuestion];
    
    // ダミーを3つ生成
    for (let i = 0; i < 3; i++) {
        const dummy = generateDummyComposition(correctQuestion);
        choices.push(dummy);
    }
    
    return shuffle(choices);
}

function generateDummyComposition(correct) {
    const materials = ['cotton', 'polyester', 'wool', 'silk', 'linen', 'nylon', 'acrylic', 'rayon'];
    const dummy = {
        cotton: 0,
        polyester: 0,
        wool: 0,
        silk: 0,
        linen: 0,
        nylon: 0,
        acrylic: 0,
        rayon: 0,
        isDummy: true
    };
    
    // 正解の主要な素材を取得
    const correctMaterials = materials.filter(m => correct[m] > 0);
    
    // ランダムに1〜2つの素材を変更
    const changeCount = Math.random() < 0.5 ? 1 : 2;
    const materialsToChange = shuffle(correctMaterials).slice(0, changeCount);
    
    let remainingPercent = 100;
    
    materials.forEach(material => {
        if (materialsToChange.includes(material)) {
            // この素材を変更（±20%程度）
            const originalPercent = correct[material];
            const change = Math.floor(Math.random() * 40) - 20; // -20 to +20
            dummy[material] = Math.max(0, Math.min(100, originalPercent + change));
        } else if (correctMaterials.includes(material)) {
            // そのまま使用（微調整）
            dummy[material] = correct[material];
        }
    });
    
    // 合計を100%に調整
    const total = Object.values(dummy).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
    if (total !== 100) {
        const adjustment = 100 - total;
        const nonZeroMaterials = materials.filter(m => dummy[m] > 0);
        if (nonZeroMaterials.length > 0) {
            const targetMaterial = nonZeroMaterials[0];
            dummy[targetMaterial] = Math.max(0, dummy[targetMaterial] + adjustment);
        }
    }
    
    return dummy;
}

function displayPieChartChoices(choices, correctQuestion) {
    const container = document.getElementById('pieChartChoices');
    container.innerHTML = '';
    
    choices.forEach((choice, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'pie-chart-option';
        
        const canvas = document.createElement('canvas');
        canvas.className = 'pie-chart-canvas';
        canvas.id = `pieChart${index}`;
        
        optionDiv.appendChild(canvas);
        
        const label = document.createElement('div');
        label.className = 'pie-chart-label';
        label.textContent = `選択肢 ${index + 1}`;
        optionDiv.appendChild(label);
        
        optionDiv.onclick = () => checkMaterialAnswer(choice, correctQuestion, optionDiv, choices);
        
        container.appendChild(optionDiv);
        
        // 円グラフを描画
        setTimeout(() => createPieChart(canvas.id, choice), 100);
    });
}

function createPieChart(canvasId, composition) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const materials = ['cotton', 'polyester', 'wool', 'silk', 'linen', 'nylon', 'acrylic', 'rayon'];
    const labels = [];
    const data = [];
    const colors = [];
    
    materials.forEach(material => {
        if (composition[material] > 0) {
            labels.push(materialNames[material]);
            data.push(composition[material]);
            colors.push(materialColors[material]);
        }
    });
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

function checkMaterialAnswer(selected, correct, optionDiv, allChoices) {
    const options = document.querySelectorAll('.pie-chart-option');
    options.forEach(opt => opt.style.pointerEvents = 'none');
    
    const isCorrect = !selected.isDummy;
    materialAnswered++;
    
    if (isCorrect) {
        materialScore++;
        optionDiv.classList.add('correct');
    } else {
        optionDiv.classList.add('incorrect');
        
        // 正解を表示
        const correctIndex = allChoices.findIndex(c => !c.isDummy);
        if (correctIndex !== -1) {
            options[correctIndex].classList.add('correct');
        }
    }
    
    showMaterialFeedback(correct, isCorrect);
    
    document.getElementById('materialScore').textContent = `スコア: ${materialScore}/${materialAnswered}`;
    document.getElementById('materialNextBtn').classList.remove('hidden');
}

function showMaterialFeedback(question, isCorrect) {
    const feedbackDiv = document.getElementById('materialFeedback');
    const bannerClass = isCorrect ? 'correct-banner' : 'incorrect-banner';
    
    const materials = ['cotton', 'polyester', 'wool', 'silk', 'linen', 'nylon', 'acrylic', 'rayon'];
    const compositionText = materials
        .filter(m => question[m] > 0)
        .map(m => `${materialNames[m]} ${question[m]}%`)
        .join('、');
    
    feedbackDiv.innerHTML = `
        <h3 class="${bannerClass}">${isCorrect ? '✓ 正解！' : '✗ 不正解'}</h3>
        <div class="feedback-content">
            <div class="feedback-item">
                <span class="feedback-label">服の名前</span>
                <div class="feedback-value">${question.item_name}</div>
            </div>
            <div class="feedback-item">
                <span class="feedback-label">正しい素材構成</span>
                <div class="feedback-value">${compositionText}</div>
            </div>
            ${question.created_by ? `
            <div class="feedback-item">
                <span class="feedback-label">追加者</span>
                <div class="feedback-value">${question.created_by}</div>
            </div>
            ` : ''}
        </div>
    `;
    
    feedbackDiv.classList.remove('hidden');
}

function updateMaterialProgress() {
    const progress = ((materialCurrentIndex + 1) / materialQuestions.length) * 100;
    document.getElementById('materialProgressBar').style.width = `${progress}%`;
}

document.getElementById('materialNextBtn').addEventListener('click', () => {
    materialCurrentIndex++;
    showMaterialQuestion();
});

function showMaterialResults() {
    document.getElementById('materialQuizScreen').classList.add('hidden');
    document.getElementById('materialResultsScreen').classList.remove('hidden');
    
    const percentage = Math.round((materialScore / materialQuestions.length) * 100);
    
    let comment = '';
    if (percentage >= 90) {
        comment = '完璧！素材の特定をマスターしています！🎉';
    } else if (percentage >= 70) {
        comment = 'よくできました！👍';
    } else if (percentage >= 50) {
        comment = '頑張りました。もっと練習しましょう！📚';
    } else {
        comment = '洗濯表示と素材の関係を復習しましょう！💪';
    }
    
    document.getElementById('materialFinalScore').innerHTML = `
        <p style="font-size: 2em; margin: 20px 0;">スコア: ${materialScore}/${materialQuestions.length}</p>
        <p style="font-size: 1.5em; margin: 20px 0;">${percentage}%</p>
        <p class="note">${comment}</p>
    `;
}

document.getElementById('materialRestartBtn').addEventListener('click', () => {
    showMaterialQuiz();
});

// 問題追加画面
function showAddMaterial() {
    document.getElementById('materialMode').classList.add('hidden');
    document.getElementById('addMaterialScreen').classList.remove('hidden');
    
    initializeAddMaterialForm();
}

function initializeAddMaterialForm() {
    // スライダーの初期化
    const materials = ['cotton', 'polyester', 'wool', 'silk', 'linen', 'nylon', 'acrylic', 'rayon'];
    
    materials.forEach(material => {
        const slider = document.getElementById(material);
        const valueSpan = document.getElementById(`${material}Value`);
        
        slider.value = 0;
        valueSpan.textContent = '0';
        
        slider.oninput = function() {
            valueSpan.textContent = this.value;
            updateTotalPercentage();
        };
    });
    
    // シンボルセレクターの初期化
    const symbolSelector = document.getElementById('addSymbolSelector');
    symbolSelector.innerHTML = '';
    selectedSymbols.clear();
    
    materialIdentificationSymbols.forEach(symbol => {
        const div = document.createElement('div');
        div.className = 'symbol-option';
        div.onclick = () => toggleAddSymbol(symbol.id, div);
        
        div.innerHTML = `
            <img src="${symbol.imageUrl}" alt="${symbol.label}" />
            <label>${symbol.label}</label>
        `;
        
        symbolSelector.appendChild(div);
    });
    
    updateTotalPercentage();
}

function toggleAddSymbol(symbolId, element) {
    if (selectedSymbols.has(symbolId)) {
        selectedSymbols.delete(symbolId);
        element.classList.remove('selected');
    } else {
        selectedSymbols.add(symbolId);
        element.classList.add('selected');
    }
}

function updateTotalPercentage() {
    const materials = ['cotton', 'polyester', 'wool', 'silk', 'linen', 'nylon', 'acrylic', 'rayon'];
    const total = materials.reduce((sum, material) => {
        return sum + parseInt(document.getElementById(material).value);
    }, 0);
    
    const totalDisplay = document.getElementById('totalPercentage');
    totalDisplay.textContent = `合計: ${total}%`;
    
    if (total === 100) {
        totalDisplay.classList.add('valid');
        totalDisplay.classList.remove('invalid');
    } else {
        totalDisplay.classList.add('invalid');
        totalDisplay.classList.remove('valid');
    }
}

document.getElementById('submitMaterialDataBtn').addEventListener('click', async () => {
    const itemName = document.getElementById('itemName').value.trim();
    const createdBy = document.getElementById('createdBy').value.trim();
    
    if (!itemName) {
        alert('服の名前を入力してください。');
        return;
    }
    
    if (selectedSymbols.size === 0) {
        alert('洗濯表示記号を最低1つ選択してください。');
        return;
    }
    
    const materials = ['cotton', 'polyester', 'wool', 'silk', 'linen', 'nylon', 'acrylic', 'rayon'];
    const total = materials.reduce((sum, material) => {
        return sum + parseInt(document.getElementById(material).value);
    }, 0);
    
    if (total !== 100) {
        alert('素材の合計を100%にしてください。');
        return;
    }
    
    try {
        document.getElementById('submitMaterialDataBtn').disabled = true;
        
        const materialData = {
            item_name: itemName,
            symbols: Array.from(selectedSymbols),
            cotton: parseInt(document.getElementById('cotton').value),
            polyester: parseInt(document.getElementById('polyester').value),
            wool: parseInt(document.getElementById('wool').value),
            silk: parseInt(document.getElementById('silk').value),
            linen: parseInt(document.getElementById('linen').value),
            nylon: parseInt(document.getElementById('nylon').value),
            acrylic: parseInt(document.getElementById('acrylic').value),
            rayon: parseInt(document.getElementById('rayon').value),
            created_by: createdBy || null
        };
        
        const { data, error } = await supabaseClient
            .from('clothing_materials')
            .insert(materialData)
            .select();
        
        if (error) throw error;
        
        // 成功メッセージ
        const messageDiv = document.getElementById('addMaterialMessage');
        messageDiv.innerHTML = `
            <div style="padding: 16px; background: #4caf50; color: white; border-radius: 12px; margin-top: 16px;">
                ✓ 問題を追加しました！
            </div>
        `;
        messageDiv.classList.remove('hidden');
        
        // フォームをリセット
        document.getElementById('itemName').value = '';
        document.getElementById('createdBy').value = '';
        materials.forEach(material => {
            document.getElementById(material).value = 0;
            document.getElementById(`${material}Value`).textContent = '0';
        });
        selectedSymbols.clear();
        document.querySelectorAll('#addSymbolSelector .symbol-option').forEach(el => el.classList.remove('selected'));
        updateTotalPercentage();
        
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 3000);
        
    } catch (error) {
        console.error('Error adding material:', error);
        alert('問題の追加に失敗しました: ' + error.message);
    } finally {
        document.getElementById('submitMaterialDataBtn').disabled = false;
    }
});

// 初期化
loadStats();
