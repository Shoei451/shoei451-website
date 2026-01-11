// ===== 16進法クイズ ロジック =====

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('hex-quiz-theme') || 'light';
if (currentTheme === 'dark') {
    document.body.classList.add('dark');
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('hex-quiz-theme', theme);
});

/*
// Supabase 初期化
const supabaseUrl = "https://gjuqsyaugrsshmjerhme.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdXFzeWF1Z3Jzc2htamVyaG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0NzMwNzEsImV4cCI6MjA0OTA0OTA3MX0.sb_publishable_K-TVhPlOAGY7cLhanI9Tag_kKIDoIGU";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
*/

// グローバル変数
let allQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let selectedCategories = [];
let questionCount = 10;

// カテゴリー名の日本語マッピング
const categoryNames = {
    'conversion_dec_hex': '10進⇔16進変換',
    'conversion_bin_hex': '2進⇔16進変換',
    'calc_hex_hex': '16進数四則演算',
    'calc_mixed_base': '複数基数混合',
    'calc_negative': '負の数計算',
    'color_code': 'カラーコード',
    'ascii_binary': 'ASCII 2進数'
};

// ===== カテゴリー選択 =====
function selectAll() {
    document.querySelectorAll('input[name="category"]').forEach(cb => {
        cb.checked = true;
    });
}

function deselectAll() {
    document.querySelectorAll('input[name="category"]').forEach(cb => {
        cb.checked = false;
    });
}

// ===== クイズ開始 =====
async function startQuiz() {
    // 選択されたカテゴリーを取得
    selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
        .map(cb => cb.value);
    
    if (selectedCategories.length === 0) {
        showError('少なくとも1つの分野を選択してください');
        return;
    }
    
    // 問題数を取得
    const countValue = document.getElementById('countSelect').value;
    
    // 問題を生成
    allQuestions = [];
    for (const category of selectedCategories) {
        const questions = generateQuestions(category, countValue === 'all' ? 20 : Math.ceil(parseInt(countValue) / selectedCategories.length));
        allQuestions.push(...questions);
    }
    
    // シャッフル
    allQuestions = shuffle(allQuestions);
    
    // 問題数を調整
    if (countValue !== 'all') {
        allQuestions = allQuestions.slice(0, parseInt(countValue));
    }
    
    questionCount = allQuestions.length;
    
    // 初期化
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = new Array(questionCount).fill(null);
    
    // 画面切り替え
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('quizScreen').classList.remove('hidden');
    
    // マークシート生成
    generateMarkSheet();
    
    // 最初の問題を表示
    showQuestion();
}

// ===== 問題生成 =====
function generateQuestions(category, count) {
    const questions = [];
    
    for (let i = 0; i < count; i++) {
        let question;
        
        switch (category) {
            case 'conversion_dec_hex':
                question = generateConversionDecHex();
                break;
            case 'conversion_bin_hex':
                question = generateConversionBinHex();
                break;
            case 'calc_hex_hex':
                question = generateCalcHexHex();
                break;
            case 'calc_mixed_base':
                question = generateCalcMixedBase();
                break;
            case 'calc_negative':
                question = generateCalcNegative();
                break;
            case 'color_code':
                question = generateColorCode();
                break;
            case 'ascii_binary':
                question = generateASCIIBinary();
                break;
        }
        
        question.category = category;
        questions.push(question);
    }
    
    return questions;
}

// ===== 各カテゴリーの問題生成関数 =====

// 10進⇔16進変換
function generateConversionDecHex() {
    const isDecToHex = Math.random() > 0.5;
    
    if (isDecToHex) {
        const dec = Math.floor(Math.random() * 256); // 0-255
        const hex = dec.toString(16).toUpperCase();
        const correctAnswer = `0x${hex}`;
        
        return {
            question: `10進数の ${dec} を16進数に変換すると？`,
            correctAnswer: correctAnswer,
            choices: generateHexChoices(correctAnswer),
            explanation: `${dec}を16で割り続けると、余りは${hex}となります。`
        };
    } else {
        const dec = Math.floor(Math.random() * 256);
        const hex = dec.toString(16).toUpperCase();
        const correctAnswer = dec.toString();
        
        return {
            question: `16進数の 0x${hex} を10進数に変換すると？`,
            correctAnswer: correctAnswer,
            choices: generateDecChoices(parseInt(correctAnswer)),
            explanation: `0x${hex}を10進数に変換すると${dec}になります。`
        };
    }
}

// 2進⇔16進変換
function generateConversionBinHex() {
    const isBinToHex = Math.random() > 0.5;
    
    if (isBinToHex) {
        const dec = Math.floor(Math.random() * 256);
        const bin = dec.toString(2).padStart(8, '0');
        const hex = dec.toString(16).toUpperCase();
        const correctAnswer = `0x${hex}`;
        
        return {
            question: `2進数の ${bin} を16進数に変換すると？`,
            correctAnswer: correctAnswer,
            choices: generateHexChoices(correctAnswer),
            explanation: `2進数を4桁ずつ区切って16進数に変換します。`
        };
    } else {
        const dec = Math.floor(Math.random() * 256);
        const hex = dec.toString(16).toUpperCase();
        const bin = dec.toString(2).padStart(8, '0');
        const correctAnswer = bin;
        
        return {
            question: `16進数の 0x${hex} を2進数に変換すると？`,
            correctAnswer: correctAnswer,
            choices: generateBinChoices(correctAnswer),
            explanation: `16進数の各桁を4ビットの2進数に変換します。`
        };
    }
}

// 16進数同士の四則演算
function generateCalcHexHex() {
    const operations = ['+', '-', '*'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let a, b, result;
    
    if (op === '+') {
        a = Math.floor(Math.random() * 128);
        b = Math.floor(Math.random() * 128);
        result = a + b;
    } else if (op === '-') {
        a = Math.floor(Math.random() * 200) + 50;
        b = Math.floor(Math.random() * 50);
        result = a - b;
    } else { // *
        a = Math.floor(Math.random() * 16);
        b = Math.floor(Math.random() * 16);
        result = a * b;
    }
    
    const hexA = '0x' + a.toString(16).toUpperCase();
    const hexB = '0x' + b.toString(16).toUpperCase();
    const hexResult = '0x' + result.toString(16).toUpperCase();
    
    return {
        question: `${hexA} ${op} ${hexB} = ?`,
        correctAnswer: hexResult,
        choices: generateHexChoices(hexResult),
        explanation: `計算結果は10進数で${result}、16進数で${hexResult}です。`
    };
}

// 複数基数混合計算
function generateCalcMixedBase() {
    const operations = ['+', '-'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let a = Math.floor(Math.random() * 100);
    let b = Math.floor(Math.random() * 100);
    
    const useDecFirst = Math.random() > 0.5;
    
    let result;
    if (op === '+') {
        result = a + b;
    } else {
        if (a < b) [a, b] = [b, a];
        result = a - b;
    }
    
    const hexB = '0x' + b.toString(16).toUpperCase();
    const hexResult = '0x' + result.toString(16).toUpperCase();
    
    const question = useDecFirst 
        ? `10進数の ${a} ${op} 16進数の ${hexB} = 16進数で？`
        : `16進数の 0x${a.toString(16).toUpperCase()} ${op} 10進数の ${b} = 16進数で？`;
    
    return {
        question: question,
        correctAnswer: hexResult,
        choices: generateHexChoices(hexResult),
        explanation: `計算結果は10進数で${result}、16進数で${hexResult}です。`
    };
}

// 負の数を含む計算
function generateCalcNegative() {
    const a = Math.floor(Math.random() * 50) + 10;
    const b = Math.floor(Math.random() * 100) + a + 10;
    const result = a - b;
    
    const hexA = '0x' + a.toString(16).toUpperCase();
    const hexB = '0x' + b.toString(16).toUpperCase();
    const absResult = Math.abs(result);
    const hexResult = '-0x' + absResult.toString(16).toUpperCase();
    
    return {
        question: `${hexA} - ${hexB} = ?`,
        correctAnswer: hexResult,
        choices: generateNegativeHexChoices(hexResult),
        explanation: `${a} - ${b} = ${result}、これを16進数で表すと${hexResult}です。`
    };
}

// カラーコード → RGB値
function generateColorCode() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    
    const colorCode = '#' + 
        r.toString(16).padStart(2, '0').toUpperCase() +
        g.toString(16).padStart(2, '0').toUpperCase() +
        b.toString(16).padStart(2, '0').toUpperCase();
    
    const correctAnswer = `R:${r}, G:${g}, B:${b}`;
    
    return {
        question: `カラーコード ${colorCode} のRGB値は？`,
        correctAnswer: correctAnswer,
        choices: generateRGBChoices(r, g, b),
        colorCode: colorCode,
        explanation: `#RRGGBB形式で、各2桁が赤、緑、青を表します。`
    };
}

// ASCII文字コード（2進数変換）
function generateASCIIBinary() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    const char = chars[Math.floor(Math.random() * chars.length)];
    const asciiCode = char.charCodeAt(0);
    const binary = asciiCode.toString(2).padStart(8, '0');
    
    const isCharToBin = Math.random() > 0.5;
    
    if (isCharToBin) {
        return {
            question: `文字 '${char}' のASCIIコードを2進数で表すと？`,
            correctAnswer: binary,
            choices: generateBinChoices(binary),
            showASCIITable: true,
            explanation: `文字 '${char}' のASCIIコードは10進数で${asciiCode}、2進数で${binary}です。`
        };
    } else {
        return {
            question: `2進数 ${binary} はASCIIコードで何の文字？`,
            correctAnswer: char,
            choices: generateCharChoices(char, chars),
            showASCIITable: true,
            explanation: `2進数${binary}は10進数で${asciiCode}、これは文字 '${char}' です。`
        };
    }
}

// ===== 選択肢生成ヘルパー関数 =====

function generateHexChoices(correct) {
    const correctNum = parseInt(correct, 16);
    const choices = [correct];
    
    while (choices.length < 4) {
        const offset = (Math.random() - 0.5) * 50;
        const wrongNum = Math.max(0, Math.floor(correctNum + offset));
        const wrongHex = '0x' + wrongNum.toString(16).toUpperCase();
        if (!choices.includes(wrongHex)) {
            choices.push(wrongHex);
        }
    }
    
    return shuffle(choices);
}

function generateDecChoices(correct) {
    const choices = [correct.toString()];
    
    while (choices.length < 4) {
        const offset = Math.floor((Math.random() - 0.5) * 50);
        const wrong = Math.max(0, correct + offset);
        if (!choices.includes(wrong.toString())) {
            choices.push(wrong.toString());
        }
    }
    
    return shuffle(choices);
}

function generateBinChoices(correct) {
    const correctNum = parseInt(correct, 2);
    const choices = [correct];
    
    while (choices.length < 4) {
        const offset = Math.floor((Math.random() - 0.5) * 16);
        const wrongNum = Math.max(0, correctNum + offset);
        const wrongBin = wrongNum.toString(2).padStart(8, '0');
        if (!choices.includes(wrongBin)) {
            choices.push(wrongBin);
        }
    }
    
    return shuffle(choices);
}

function generateNegativeHexChoices(correct) {
    const correctNum = parseInt(correct.replace('-0x', ''), 16);
    const choices = [correct];
    
    while (choices.length < 4) {
        const offset = Math.floor((Math.random() - 0.5) * 20);
        const wrongNum = Math.max(1, correctNum + offset);
        const wrongHex = '-0x' + wrongNum.toString(16).toUpperCase();
        if (!choices.includes(wrongHex)) {
            choices.push(wrongHex);
        }
    }
    
    return shuffle(choices);
}

function generateRGBChoices(r, g, b) {
    const correct = `R:${r}, G:${g}, B:${b}`;
    const choices = [correct];
    
    while (choices.length < 4) {
        const offsetR = Math.floor((Math.random() - 0.5) * 100);
        const offsetG = Math.floor((Math.random() - 0.5) * 100);
        const offsetB = Math.floor((Math.random() - 0.5) * 100);
        
        const wrongR = Math.max(0, Math.min(255, r + offsetR));
        const wrongG = Math.max(0, Math.min(255, g + offsetG));
        const wrongB = Math.max(0, Math.min(255, b + offsetB));
        
        const wrong = `R:${wrongR}, G:${wrongG}, B:${wrongB}`;
        if (!choices.includes(wrong)) {
            choices.push(wrong);
        }
    }
    
    return shuffle(choices);
}

function generateCharChoices(correct, charSet) {
    const choices = [correct];
    
    while (choices.length < 4) {
        const randomChar = charSet[Math.floor(Math.random() * charSet.length)];
        if (!choices.includes(randomChar)) {
            choices.push(randomChar);
        }
    }
    
    return shuffle(choices);
}

// ===== 問題表示 =====
function showQuestion() {
    const question = allQuestions[currentQuestionIndex];
    
    // 進捗情報更新
    document.getElementById('progressInfo').textContent = `問題 ${currentQuestionIndex + 1} / ${questionCount}`;
    document.getElementById('progressBar').style.width = `${((currentQuestionIndex + 1) / questionCount) * 100}%`;
    
    // カテゴリーバッジ
    document.getElementById('categoryBadge').textContent = categoryNames[question.category];
    
    // 問題文
    document.getElementById('question').textContent = question.question;
    
    // カラープレビュー
    const colorPreview = document.getElementById('colorPreview');
    if (question.colorCode) {
        colorPreview.style.backgroundColor = question.colorCode;
        colorPreview.classList.remove('hidden');
    } else {
        colorPreview.classList.add('hidden');
    }
    
    // ASCII表ボタン
    const asciiBtn = document.getElementById('asciiTableBtn');
    if (question.showASCIITable) {
        asciiBtn.classList.remove('hidden');
    } else {
        asciiBtn.classList.add('hidden');
    }
    
    // 選択肢
    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';
    
    question.choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.textContent = choice;
        btn.onclick = () => selectAnswer(choice, btn);
        
        // 既に回答済みの場合
        if (userAnswers[currentQuestionIndex] !== null) {
            btn.disabled = true;
            if (choice === question.correctAnswer) {
                btn.classList.add('correct');
            }
            if (choice === userAnswers[currentQuestionIndex] && choice !== question.correctAnswer) {
                btn.classList.add('incorrect');
            }
        } else if (userAnswers[currentQuestionIndex] === choice) {
            btn.classList.add('selected');
        }
        
        choicesDiv.appendChild(btn);
    });
    
    // 解説
    const explanationDiv = document.getElementById('explanation');
    if (userAnswers[currentQuestionIndex] !== null && question.explanation) {
        explanationDiv.innerHTML = `<h4>📝 解説</h4><p>${question.explanation}</p>`;
        explanationDiv.classList.remove('hidden');
    } else {
        explanationDiv.classList.add('hidden');
    }
    
    // ナビゲーションボタン
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    
    // マークシート更新
    updateMarkSheet();
}

// ===== 回答選択 =====
function selectAnswer(answer, btn) {
    const question = allQuestions[currentQuestionIndex];
    
    // 回答を記録
    userAnswers[currentQuestionIndex] = answer;
    
    // 正誤判定
    const isCorrect = answer === question.correctAnswer;
    if (isCorrect && score <= currentQuestionIndex) {
        score++;
    }
    
    // ボタンの状態を更新
    const allButtons = document.querySelectorAll('#choices button');
    allButtons.forEach(b => {
        b.disabled = true;
        if (b.textContent === question.correctAnswer) {
            b.classList.add('correct');
        }
    });
    
    if (!isCorrect) {
        btn.classList.add('incorrect');
    }
    
    // スコア更新
    document.getElementById('score').textContent = `正解数: ${score}`;
    
    // 解説表示
    const explanationDiv = document.getElementById('explanation');
    if (question.explanation) {
        explanationDiv.innerHTML = `<h4>📝 解説</h4><p>${question.explanation}</p>`;
        explanationDiv.classList.remove('hidden');
    }
    
    // マークシート更新
    updateMarkSheet();
}

// ===== ナビゲーション =====
function nextQuestion() {
    if (currentQuestionIndex < questionCount - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        showResult();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

function jumpToQuestion(index) {
    currentQuestionIndex = index;
    showQuestion();
}

// ===== マークシート =====
function generateMarkSheet() {
    const grid = document.getElementById('markSheetGrid');
    grid.innerHTML = '';
    
    for (let i = 0; i < questionCount; i++) {
        const item = document.createElement('div');
        item.className = 'mark-item';
        item.textContent = `Q${i + 1}`;
        item.onclick = () => jumpToQuestion(i);
        grid.appendChild(item);
    }
}

function updateMarkSheet() {
    const items = document.querySelectorAll('.mark-item');
    items.forEach((item, index) => {
        item.className = 'mark-item';
        
        if (index === currentQuestionIndex) {
            item.classList.add('current');
        }
        
        if (userAnswers[index] !== null) {
            const question = allQuestions[index];
            if (userAnswers[index] === question.correctAnswer) {
                item.classList.add('correct');
            } else {
                item.classList.add('incorrect');
            }
        }
    });
}

// ===== ASCII表表示 =====
function showASCIITable() {
    const modal = document.getElementById('asciiModal');
    const container = document.getElementById('asciiTableContainer');
    
    // ASCII表を生成（初回のみ）
    if (container.innerHTML === '') {
        container.innerHTML = generateASCIITableHTML();
    }
    
    modal.classList.remove('hidden');
}

function closeASCIITable() {
    document.getElementById('asciiModal').classList.add('hidden');
}

function generateASCIITableHTML() {
    let html = '<table class="ascii-table">';
    
    // ヘッダー行
    html += '<tr><th>下位4ビット</th>';
    for (let i = 0; i < 16; i++) {
        html += `<th>${i.toString(16).toUpperCase()}</th>`;
    }
    html += '</tr>';
    
    // データ行
    for (let row = 0; row < 8; row++) {
        html += `<tr><th>${row}</th>`;
        for (let col = 0; col < 16; col++) {
            const code = row * 16 + col;
            let char;
            
            if (code < 32 || code === 127) {
                // 制御文字
                const controlChars = ['NUL', 'SOH', 'STX', 'ETX', 'EOT', 'ENQ', 'ACK', 'BEL', 
                                     'BS', 'HT', 'LF', 'VT', 'FF', 'CR', 'SO', 'SI',
                                     'DLE', 'DC1', 'DC2', 'DC3', 'DC4', 'NAK', 'SYN', 'ETB',
                                     'CAN', 'EM', 'SUB', 'ESC', 'FS', 'GS', 'RS', 'US'];
                char = code === 127 ? 'DEL' : controlChars[code];
                html += `<td class="control-char">${char}</td>`;
            } else if (code === 32) {
                html += `<td>SP</td>`;
            } else {
                char = String.fromCharCode(code);
                html += `<td>${char}</td>`;
            }
        }
        html += '</tr>';
    }
    
    html += '</table>';
    return html;
}

// ===== 結果表示 =====
function showResult() {
    document.getElementById('quizScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');
    
    const percentage = Math.round((score / questionCount) * 100);
    
    // 結果サマリー
    const summary = document.getElementById('resultSummary');
    summary.innerHTML = `
        <div class="score-display">${score} / ${questionCount}</div>
        <div class="percentage">正答率: ${percentage}%</div>
        <p style="font-size: 1.2rem; color: var(--secondary); margin-top: 15px;">
            ${percentage >= 80 ? '🎉 素晴らしい！' : percentage >= 60 ? '👍 よくできました！' : '📚 もう一度挑戦してみましょう！'}
        </p>
    `;
    
    // カテゴリー別成績
    const breakdown = document.getElementById('categoryBreakdown');
    breakdown.innerHTML = '<h3>📊 分野別成績</h3>';
    
    const categoryStats = {};
    selectedCategories.forEach(cat => {
        categoryStats[cat] = { correct: 0, total: 0 };
    });
    
    allQuestions.forEach((q, index) => {
        categoryStats[q.category].total++;
        if (userAnswers[index] === q.correctAnswer) {
            categoryStats[q.category].correct++;
        }
    });
    
    Object.entries(categoryStats).forEach(([cat, stats]) => {
        if (stats.total > 0) {
            const catPercentage = Math.round((stats.correct / stats.total) * 100);
            breakdown.innerHTML += `
                <div class="category-stat">
                    <span class="stat-name">${categoryNames[cat]}</span>
                    <span class="stat-score">${stats.correct} / ${stats.total} (${catPercentage}%)</span>
                </div>
            `;
        }
    });
}

// ===== スタート画面に戻る =====
function backToStart() {
    document.getElementById('quizScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    
    // リセット
    allQuestions = [];
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
}

// ===== ユーティリティ関数 =====
function shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    setTimeout(() => {
        errorDiv.classList.remove('show');
    }, 3000);
}

// ===== モーダル外クリックで閉じる =====
document.getElementById('asciiModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeASCIITable();
    }
});
