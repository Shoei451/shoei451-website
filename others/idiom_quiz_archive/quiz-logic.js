// Idiom quiz logic
let questions = [];
let allQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let answeredQuestions = 0;
let selectedQuestionCount = 10;
let quizMode = 'random';
let currentChoiceButtons = [];

const SCREEN_IDS = ['startScreen', 'quizScreen', 'resultsScreen'];

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = String(value ?? '');
    return div.innerHTML;
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Fetch questions from Supabase
async function fetchQuestions() {
    try {
        document.getElementById('loading').classList.remove('hidden');

        const response = await fetch(`${SUPABASE_URL}/rest/v1/english_idioms?select=*`, {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch questions: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        document.getElementById('loading').classList.add('hidden');

        if (data.length === 0) {
            throw new Error('No questions found in database');
        }

        return data;
    } catch (error) {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('error').innerHTML = `
            <strong>Error:</strong> ${error.message}<br>
            <small style="margin-top: 10px; display: block;">
            Please check:<br>
            1. Your Supabase URL is correct<br>
            2. Your API key is correct<br>
            3. The table "english_idioms" exists<br>
            4. Row Level Security (RLS) allows public read access
            </small>
        `;
        document.getElementById('error').classList.remove('hidden');
        return [];
    }
}

function generateChoices(correctAnswer, rows) {
    const choices = [correctAnswer];
    const others = rows.filter((q) => q.idiom_extracted !== correctAnswer);
    const shuffled = shuffleArray(others);

    for (let i = 0; i < 3 && i < shuffled.length; i++) {
        choices.push(shuffled[i].idiom_extracted);
    }

    return shuffleArray(choices);
}

function filterQuestionsByMode(rows, mode) {
    const minAttempts = 5;

    if (mode === 'difficult') {
        return rows.filter((q) => q.total_attempts >= minAttempts && (q.correct_rate === null || q.correct_rate < 50));
    }

    if (mode === 'unattempted') {
        return rows.filter((q) => q.total_attempts === null || q.total_attempts < minAttempts);
    }

    if (mode === 'mixed') {
        const difficult = rows.filter((q) => q.total_attempts >= minAttempts && (q.correct_rate === null || q.correct_rate < 50));
        const medium = rows.filter((q) => q.total_attempts >= minAttempts && q.correct_rate >= 50 && q.correct_rate < 75);
        const easy = rows.filter((q) => q.total_attempts >= minAttempts && q.correct_rate >= 75);
        const unattempted = rows.filter((q) => q.total_attempts === null || q.total_attempts < minAttempts);

        return [
            ...shuffleArray(difficult),
            ...shuffleArray(medium),
            ...shuffleArray(easy),
            ...shuffleArray(unattempted),
        ];
    }

    return rows;
}

function pickQuestions(rows, countValue) {
    const shuffled = shuffleArray(rows);

    if (countValue === 'all') {
        selectedQuestionCount = shuffled.length;
        return shuffled;
    }

    selectedQuestionCount = parseInt(countValue, 10);
    return shuffled.slice(0, selectedQuestionCount);
}

async function updateQuestionStats(questionId, isCorrect) {
    try {
        const getResponse = await fetch(`${SUPABASE_URL}/rest/v1/english_idioms?id=eq.${questionId}&select=total_attempts,correct_attempts`, {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
            },
        });

        if (!getResponse.ok) return;

        const data = await getResponse.json();
        if (data.length === 0) return;

        const current = data[0];
        const newTotalAttempts = (current.total_attempts || 0) + 1;
        const newCorrectAttempts = (current.correct_attempts || 0) + (isCorrect ? 1 : 0);
        const newCorrectRate = (newCorrectAttempts / newTotalAttempts) * 100;

        await fetch(`${SUPABASE_URL}/rest/v1/english_idioms?id=eq.${questionId}`, {
            method: 'PATCH',
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal',
            },
            body: JSON.stringify({
                total_attempts: newTotalAttempts,
                correct_attempts: newCorrectAttempts,
                correct_rate: newCorrectRate,
            }),
        });
    } catch (error) {
        console.error('Failed to update stats:', error);
    }
}

async function reportCorruption(questionId, reason) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/english_idioms?id=eq.${questionId}`, {
            method: 'PATCH',
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal',
            },
            body: JSON.stringify({
                corruption_istrue: true,
                corruption_reason: reason,
            }),
        });

        return response.ok;
    } catch (error) {
        console.error('Failed to report corruption:', error);
        return false;
    }
}

function displayQuestion() {
    const question = questions[currentQuestionIndex];
    const questionEl = document.getElementById('question');
    const questionJpEl = document.getElementById('questionJp');
    const choicesEl = document.getElementById('choices');
    const feedbackEl = document.getElementById('feedback');

    feedbackEl.classList.add('hidden');
    document.getElementById('nextBtn').classList.add('hidden');

    questionEl.textContent = question.fill_in_the_blanks;

    if (question.example_jp) {
        questionJpEl.textContent = question.example_jp;
        questionJpEl.classList.remove('hidden');
    } else {
        questionJpEl.classList.add('hidden');
    }

    const choices = generateChoices(question.idiom_extracted, questions);
    currentChoiceButtons = QuizUI.renderChoices(choicesEl, choices, (selected) => selectAnswer(selected, question));

    updateProgress();
}

function selectAnswer(selectedAnswer, question) {
    const feedbackEl = document.getElementById('feedback');

    const isCorrect = selectedAnswer === question.idiom_extracted;
    if (isCorrect) {
        score++;
    }
    answeredQuestions++;

    updateQuestionStats(question.id, isCorrect);
    QuizUI.highlightAnswer(currentChoiceButtons, question.idiom_extracted, selectedAnswer);

    const bannerClass = isCorrect ? 'correct-banner' : 'incorrect-banner';
    feedbackEl.innerHTML = `
        <div class="idiom-feedback">
            <div class="idiom-feedback-banner ${bannerClass}">${isCorrect ? 'Correct!' : 'Incorrect'}</div>
            <div class="idiom-feedback-body">
                <div class="feedback-item">
                    <span class="feedback-label">ID</span>
                    <div class="feedback-value">#${question.id}</div>
                </div>
                <div class="feedback-item">
                    <span class="feedback-label">Idiom</span>
                    <div class="feedback-value feedback-idiom">${escapeHtml(question.idiom)}</div>
                </div>
                <div class="feedback-item">
                    <span class="feedback-label">Meaning</span>
                    <div class="feedback-value">${escapeHtml(question.definition_jp)}</div>
                </div>
                <div class="feedback-item">
                    <span class="feedback-label">Example Sentence</span>
                    <div class="feedback-value feedback-example">${escapeHtml(question.example)}</div>
                </div>
                ${question.tips ? `
                <div class="feedback-item">
                    <span class="feedback-label">Tips</span>
                    <div class="feedback-value">${escapeHtml(question.tips)}</div>
                </div>` : ''}
                <div class="report-section">
                    <h4>データに誤りがありますか？</h4>
                    <button type="button" class="report-btn" onclick="toggleReportForm(${question.id})">データの誤りを報告</button>
                    <div id="reportForm${question.id}" class="report-form hidden">
                        <select id="reportReason${question.id}">
                            <option value="">-- 理由を選択してください --</option>
                            <option value="空欄とイディオムが合っていない">空欄とイディオムが合っていない</option>
                            <option value="誤った例文">誤った例文</option>
                            <option value="誤った日本語訳">誤った日本語訳</option>
                            <option value="誤ったイディオム">誤ったイディオム</option>
                            <option value="誤った意味">誤った意味</option>
                            <option value="スペルミス">スペルミス</option>
                            <option value="その他">その他</option>
                        </select>
                        <button type="button" class="report-submit" onclick="submitReport(${question.id})">送信</button>
                        <button type="button" onclick="toggleReportForm(${question.id})">キャンセル</button>
                        <div id="reportMessage${question.id}"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    feedbackEl.classList.remove('hidden');

    document.getElementById('score').textContent = `Score: ${score}/${answeredQuestions}`;
    document.getElementById('nextBtn').classList.remove('hidden');
}

function updateProgress() {
    QuizUI.updateProgress(
        currentQuestionIndex + 1,
        questions.length,
        document.getElementById('progressBar')
    );
}

function showScreen(screenId) {
    QuizUI.showScreen(screenId, SCREEN_IDS);
}

function showResults() {
    showScreen('resultsScreen');

    const percentage = Math.round((score / questions.length) * 100);
    document.getElementById('finalScore').innerHTML = `
        <p>Your Score: ${score}/${questions.length}</p>
        <p>${percentage}%</p>
        <p class="quiz-note">${percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good job! Keep practicing!' : 'Keep studying! You will improve!'}</p>
    `;
}

function resetQuizState() {
    currentQuestionIndex = 0;
    score = 0;
    answeredQuestions = 0;
    document.getElementById('score').textContent = 'Score: 0/0';
    document.getElementById('progressBar').style.width = '0%';
}

document.getElementById('nextBtn').addEventListener('click', () => {
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        showResults();
    }
});

document.getElementById('startBtn').addEventListener('click', async () => {
    document.getElementById('error').classList.add('hidden');

    const countValue = document.getElementById('questionCount').value;
    quizMode = document.getElementById('quizMode').value;

    allQuestions = await fetchQuestions();
    if (allQuestions.length === 0) {
        showScreen('startScreen');
        return;
    }

    let filteredQuestions = filterQuestionsByMode(allQuestions, quizMode);
    if (filteredQuestions.length === 0) {
        alert('Not enough questions match this mode yet. Switching to random practice.');
        filteredQuestions = allQuestions;
    }

    questions = pickQuestions(filteredQuestions, countValue);
    resetQuizState();
    showScreen('quizScreen');
    displayQuestion();
});

document.getElementById('homeBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
        resetQuizState();
        showScreen('startScreen');
    }
});

document.getElementById('restartBtn').addEventListener('click', () => {
    if (allQuestions.length === 0) {
        showScreen('startScreen');
        return;
    }

    const countValue = document.getElementById('questionCount').value;
    const filtered = filterQuestionsByMode(allQuestions, quizMode);
    questions = pickQuestions(filtered.length > 0 ? filtered : allQuestions, countValue);

    resetQuizState();
    showScreen('quizScreen');
    displayQuestion();
});
