// ========================================
// 衣類取り扱い表示クイズのロジック
// ========================================

let currentMode = 'basic';
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let answeredQuestions = 0;
let selectedQuestionCount = 10;
let selectedCategory = 'all';
let quizMode = 'random';
let wrongAnswers = [];

// 統計データ（ローカルストレージ）
let stats = {
    totalAttempts: {},
    correctAttempts: {},
    lastAttempted: {}
};

// ===== Theme =====
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('care-symbols-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});
if (localStorage.getItem('care-symbols-theme') === 'dark') {
    document.body.classList.add('dark');
}

// ===== Stats =====
function loadStats() {
    const saved = localStorage.getItem('care-symbols-stats');
    if (saved) stats = JSON.parse(saved);
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
    if (isCorrect) stats.correctAttempts[questionId]++;
    stats.lastAttempted[questionId] = Date.now();
    saveStats();
}

function getCorrectRate(questionId) {
    if (!stats.totalAttempts[questionId] || stats.totalAttempts[questionId] === 0) return null;
    return (stats.correctAttempts[questionId] / stats.totalAttempts[questionId]) * 100;
}

// ===== Helpers =====
function shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function filterQuestionsByMode(questions, mode) {
    const MIN_ATTEMPTS = 3;
    switch (mode) {
        case 'difficult':
            return questions.filter(q => {
                const attempts = stats.totalAttempts[q.id] || 0;
                if (attempts < MIN_ATTEMPTS) return false;
                const rate = getCorrectRate(q.id);
                return rate !== null && rate < 50;
            });
        case 'unattempted':
            return questions.filter(q => (stats.totalAttempts[q.id] || 0) < MIN_ATTEMPTS);
        default:
            return questions;
    }
}

// ===== Navigation =====
function backToStart() {
    document.getElementById('basicSettings').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
}

// ===== Quiz Start =====
document.getElementById('startBasicBtn').addEventListener('click', () => {
    loadStats();

    selectedCategory = document.getElementById('categorySelect').value;
    quizMode = document.getElementById('quizMode').value;
    const countValue = document.getElementById('questionCount').value;

    let filtered = selectedCategory === 'all'
        ? careSymbolsData.slice()
        : careSymbolsData.filter(q => q.category === selectedCategory);

    if (filtered.length === 0) { alert('該当する問題がありません。'); return; }

    filtered = filterQuestionsByMode(filtered, quizMode);

    if (filtered.length === 0) {
        alert('このモードで出題できる問題がまだありません。ランダム練習をお試しください。');
        return;
    }

    filtered = shuffle(filtered);
    selectedQuestionCount = countValue === 'all' ? filtered.length : parseInt(countValue);
    selectedQuestionCount = Math.min(selectedQuestionCount, filtered.length);
    questions = filtered.slice(0, selectedQuestionCount);

    currentQuestionIndex = 0;
    score = 0;
    answeredQuestions = 0;
    wrongAnswers = [];

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

    document.getElementById('categoryBadge').textContent = question.categoryJP;

    const symbolImage = document.getElementById('symbolImage');
    symbolImage.src = question.imageUrl;
    symbolImage.alt = question.meaning;
    symbolImage.classList.remove('loaded');
    symbolImage.onload = () => symbolImage.classList.add('loaded');

    document.getElementById('choices').innerHTML = '';

    question.choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice;
        btn.style.animationDelay = `${index * 0.07}s`;
        btn.onclick = () => checkAnswer(index, btn);
        document.getElementById('choices').appendChild(btn);
    });

    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('nextBtn').classList.add('hidden');

    updateProgress();
}

function checkAnswer(selectedIndex, button) {
    const question = questions[currentQuestionIndex];
    const buttons = document.querySelectorAll('.choice-btn');

    buttons.forEach(btn => btn.disabled = true);

    const isCorrect = question.choices[selectedIndex] === question.choices[question.correctAnswer];
    answeredQuestions++;

    if (isCorrect) {
        score++;
        button.classList.add('correct');
    } else {
        button.classList.add('incorrect');
        wrongAnswers.push({ question, selectedAnswer: selectedIndex });
        buttons.forEach(btn => {
            if (btn.textContent === question.choices[question.correctAnswer]) {
                btn.classList.add('correct');
            }
        });
    }

    updateQuestionStats(question.id, isCorrect);
    showFeedback(question, isCorrect);

    document.getElementById('score').textContent = `${score} / ${answeredQuestions}`;
    document.getElementById('nextBtn').classList.remove('hidden');
}

function showFeedback(question, isCorrect) {
    const feedbackDiv = document.getElementById('feedback');
    const attempts = stats.totalAttempts[question.id] || 0;
    const correctRate = getCorrectRate(question.id);
    const rateText = correctRate !== null ? `${correctRate.toFixed(0)}%` : '初回';
    const materialsText = question.relatedMaterials?.length
        ? question.relatedMaterials.join('・')
        : '一般的な衣類';

    feedbackDiv.className = `feedback ${isCorrect ? 'feedback--correct' : 'feedback--incorrect'}`;
    feedbackDiv.innerHTML = `
        <div class="feedback__header">
            <span class="feedback__icon">${isCorrect ? '✓' : '✗'}</span>
            <span class="feedback__verdict">${isCorrect ? '正解' : '不正解'}</span>
        </div>
        <div class="feedback__grid">
            <div class="feedback__item">
                <span class="feedback__label">正しい意味</span>
                <span class="feedback__value">${question.meaning}</span>
            </div>
            <div class="feedback__item">
                <span class="feedback__label">詳細説明</span>
                <span class="feedback__value">${question.description}</span>
            </div>
            <div class="feedback__item">
                <span class="feedback__label">代表素材</span>
                <span class="feedback__value">${materialsText}</span>
            </div>
            <div class="feedback__item">
                <span class="feedback__label">あなたの正答率</span>
                <span class="feedback__value">${rateText}（${attempts}回挑戦）</span>
            </div>
        </div>
    `;
    feedbackDiv.classList.remove('hidden');
}

function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    document.getElementById('progressLabel').textContent = `${currentQuestionIndex + 1} / ${questions.length}`;
}

document.getElementById('nextBtn').addEventListener('click', () => {
    currentQuestionIndex++;
    showQuestion();
});

// ===== Results =====
function showResults() {
    document.getElementById('quizScreen').classList.add('hidden');
    document.getElementById('resultsScreen').classList.remove('hidden');

    const percentage = Math.round((score / questions.length) * 100);
    let comment = '';
    if (percentage >= 90) comment = '完璧！洗濯表示をマスターしています！';
    else if (percentage >= 70) comment = 'よくできました！基本はバッチリです！';
    else if (percentage >= 50) comment = '頑張りました。苦手な記号を復習しましょう。';
    else comment = '基礎からもう一度確認しましょう！';

    document.getElementById('finalScore').innerHTML = `
        <div class="result__score">${score}<span>/${questions.length}</span></div>
        <div class="result__percent">${percentage}%</div>
        <p class="result__comment">${comment}</p>
    `;

    showCategoryBreakdown();
    document.getElementById('reviewBtn').style.display = wrongAnswers.length > 0 ? 'inline-block' : 'none';
}

function showCategoryBreakdown() {
    const breakdown = {};
    questions.forEach((q, idx) => {
        if (!breakdown[q.category]) {
            breakdown[q.category] = { total: 0, correct: 0, name: q.categoryJP };
        }
        breakdown[q.category].total++;
        const wasWrong = wrongAnswers.some(wa => wa.question.id === q.id);
        if (!wasWrong && idx < answeredQuestions) breakdown[q.category].correct++;
    });

    const el = document.getElementById('categoryBreakdown');
    if (Object.keys(breakdown).length <= 1) { el.innerHTML = ''; return; }

    let html = '<h3 class="breakdown__title">カテゴリー別</h3>';
    for (const [, data] of Object.entries(breakdown)) {
        const rate = Math.round((data.correct / data.total) * 100);
        html += `
            <div class="breakdown__row">
                <span class="breakdown__name">${data.name}</span>
                <div class="breakdown__bar-wrap">
                    <div class="breakdown__bar" style="width:${rate}%"></div>
                </div>
                <span class="breakdown__stat">${data.correct}/${data.total}</span>
            </div>`;
    }
    el.innerHTML = html;
}

document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('resultsScreen').classList.add('hidden');
    document.getElementById('basicSettings').classList.remove('hidden');
});

document.getElementById('reviewBtn').addEventListener('click', () => {
    if (!wrongAnswers.length) return;
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

// ===== Init =====
loadStats();
