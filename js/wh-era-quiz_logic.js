// ============================================================
// js/wh-era-quiz_logic.js
// 世界史年代クイズ ロジック
// 依存: supabase_config.js, wh-utils.js, quiz.js
// ============================================================

// ── テーマ ──────────────────────────────────────────────────
const _theme = localStorage.getItem('theme') || 'light';
if (_theme === 'dark') document.body.classList.add('dark');
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// ── 画面 ID リスト ──────────────────────────────────────────
const SCREENS = ['startScreen', 'sectionScreen', 'settingsScreen', 'addQuestionScreen', 'quizScreen'];

// ── 状態 ────────────────────────────────────────────────────
let allData        = [];
let currentSet     = [];
let currentIndex   = 0;
let correctCount   = 0;
let questionCount  = 0;
let selectedSection = '';
let currentMode    = '';  // 'yearToEvent' | 'eventToYear'
let currentButtons = [];  // renderChoices の戻り値

const periods = [
    { value: "~0",        label: "紀元前" },
    { value: "1~1000",    label: "1年〜1000年" },
    { value: "1001~1500", label: "1001年〜1500年" },
    { value: "1501~1700", label: "1501年〜1700年" },
    { value: "1701~1800", label: "1701年〜1800年" },
    { value: "1801~1900", label: "1801年〜1900年" },
    { value: "1901~1945", label: "1901年〜1945年" },
    { value: "1946~1989", label: "1946年〜1989年" },
    { value: "1990~",     label: "1990年〜" },
];

const chapters = [
    { value: "第1章",  label: "古代文明圏【オリエント・ギリシア・ローマ・中国古代】" },
    { value: "第2章",  label: "中世ヨーロッパ" },
    { value: "第3章",  label: "近現代ヨーロッパ" },
    { value: "第4章",  label: "東アジア（中国・モンゴル）" },
    { value: "第5章",  label: "東アジア（日本・朝鮮）" },
    { value: "第6章",  label: "イスラーム世界" },
    { value: "第7章",  label: "南アジア・東南アジア" },
    { value: "第8章",  label: "アメリカ大陸" },
    { value: "第9章",  label: "第一次世界大戦" },
    { value: "第10章", label: "第二次世界大戦" },
    { value: "第11章", label: "戦後国際史" },
];

// ── DOM 参照（DOMContentLoaded 後に取得） ────────────────────
let progressBar, scoreEl, nextBtn, choicesDiv, questionDiv;

document.addEventListener('DOMContentLoaded', () => {
    progressBar = document.getElementById('progressBar');
    scoreEl     = document.getElementById('score');
    nextBtn     = document.getElementById('nextBtn');
    choicesDiv  = document.getElementById('choices');
    questionDiv = document.getElementById('question');

    nextBtn.addEventListener('click', onNext);

    // 年号入力欄の自動 period 計算
    const newYearInput = document.getElementById('newYear');
    if (newYearInput) {
        newYearInput.addEventListener('input', () => {
            const parsed = parseYearInput(newYearInput.value.trim());
            const el = document.getElementById('newPeriod');
            if (!el) return;
            if (!parsed.numericYear || isNaN(parsed.numericYear)) { el.value = ''; return; }
            const labels = {
                "~0": "紀元前", "1~1000": "1年〜1000年", "1001~1500": "1001年〜1500年",
                "1501~1700": "1501年〜1700年", "1701~1800": "1701年〜1800年",
                "1801~1900": "1801年〜1900年", "1901~1945": "1901年〜1945年",
                "1946~1989": "1946年〜1989年", "1990~": "1990年〜",
            };
            el.value = labels[determinePeriod(parsed.numericYear, parsed.is_bc)] || '';
        });
    }

    loadQuestions();
});

// ── データ読み込み ───────────────────────────────────────────
async function loadQuestions() {
    let all = [], start = 0;
    while (true) {
        const { data, error } = await db
            .from(TABLES.WH_QUIZ)
            .select('*')
            .order('is_bc', { ascending: false })
            .order('year',  { ascending: true })
            .range(start, start + 999);
        if (error) { console.error(error); return; }
        if (!data?.length) break;
        all.push(...data);
        if (data.length < 1000) break;
        start += 1000;
    }
    allData = all;
    console.log(`Loaded ${allData.length} questions`);
}

// ── 年号ユーティリティ（旧テーブル用、is_bc boolean + 正数） ──
function parseYearInput(yearStr) {
    const is_bc = yearStr.startsWith('前');
    const numericYear = parseInt(yearStr.replace(/[^\d]/g, ''));
    return { numericYear, is_bc };
}

function determinePeriod(year, is_bc) {
    if (is_bc) return "~0";
    if (year <= 1000) return "1~1000";
    if (year <= 1500) return "1001~1500";
    if (year <= 1700) return "1501~1700";
    if (year <= 1800) return "1701~1800";
    if (year <= 1900) return "1801~1900";
    if (year <= 1945) return "1901~1945";
    if (year <= 1989) return "1946~1989";
    return "1990~";
}

function toDisplayYear(q) {
    return q.is_bc ? -Math.abs(q.year) : q.year;
}

// ── 画面遷移 ─────────────────────────────────────────────────
function goToStart() {
    QuizUI.showScreen('startScreen', SCREENS);
}

function showSectionScreen() {
    currentMode = document.getElementById('modeSelect').value;
    QuizUI.showScreen('sectionScreen', SCREENS);

    const container = document.getElementById('sectionButtons');
    container.innerHTML = '';
    const sections = currentMode === 'yearToEvent' ? periods : chapters;
    sections.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'section-btn';
        btn.textContent = s.label;
        btn.onclick = () => selectSection(s.value, s.label);
        container.appendChild(btn);
    });
}

function selectSection(value, label) {
    selectedSection = value;
    QuizUI.showScreen('settingsScreen', SCREENS);
    document.getElementById('selectedSectionDisplay').textContent = `選択: ${label}`;
}

function backToStart()         { QuizUI.showScreen('startScreen',   SCREENS); }
function backToSectionScreen() { QuizUI.showScreen('sectionScreen', SCREENS); }
function showAddQuestionScreen() { QuizUI.showScreen('addQuestionScreen', SCREENS); }

// ── クイズ開始 ───────────────────────────────────────────────
function startQuiz() {
    const countValue = document.getElementById('countSelect').value;
    const filtered = allData.filter(q =>
        currentMode === 'yearToEvent'
            ? q.period  === selectedSection
            : q.chapter === selectedSection
    );
    if (!filtered.length) { alert('該当する問題がありません。'); return; }

    questionCount = countValue === 'all' ? filtered.length : Math.min(parseInt(countValue), filtered.length);
    currentSet    = shuffleArray(filtered).slice(0, questionCount);
    currentIndex  = 0;
    correctCount  = 0;

    QuizUI.showScreen('quizScreen', SCREENS);
    showQuestion();
}

// ── 問題表示 ─────────────────────────────────────────────────
function showQuestion() {
    if (currentIndex >= currentSet.length) { showResult(); return; }

    const q = currentSet[currentIndex];
    nextBtn.style.display = 'none';

    // プログレス
    QuizUI.updateProgress(currentIndex + 1, questionCount, progressBar);
    scoreEl.textContent = `正解数: ${correctCount} / ${currentIndex}`;

    // 問題文 & 選択肢生成
    if (currentMode === 'yearToEvent') {
        questionDiv.textContent = formatYear(toDisplayYear(q));

        const others = shuffleArray(
            allData.filter(x => x.period === q.period &&
                (x.event !== q.event || x.year !== q.year || x.is_bc !== q.is_bc))
        ).slice(0, 3);

        currentButtons = QuizUI.renderChoices(
            choicesDiv,
            shuffleArray([q, ...others]).map(x => x.event),
            (selected, btn) => checkAnswer(selected, q.event, btn)
        );
    } else {
        questionDiv.textContent = q.event;

        // 重複年号を排除
        const uniqueYears = new Set([`${q.is_bc}-${q.year}`]);
        const others = [];
        for (const x of shuffleArray(allData.filter(x => x.chapter === q.chapter))) {
            const key = `${x.is_bc}-${x.year}`;
            if (!uniqueYears.has(key) && (x.year !== q.year || x.is_bc !== q.is_bc)) {
                uniqueYears.add(key);
                others.push(x);
            }
            if (others.length >= 3) break;
        }
        // 不足補充
        if (others.length < 3) {
            for (const x of shuffleArray(allData)) {
                const key = `${x.is_bc}-${x.year}`;
                if (!uniqueYears.has(key)) {
                    uniqueYears.add(key);
                    others.push(x);
                }
                if (others.length >= 3) break;
            }
        }

        const correctLabel = formatYear(toDisplayYear(q));
        currentButtons = QuizUI.renderChoices(
            choicesDiv,
            shuffleArray([q, ...others]).map(x => formatYear(toDisplayYear(x))),
            (selected, btn) => checkAnswer(selected, correctLabel, btn)
        );
    }
}

// ── 回答チェック ─────────────────────────────────────────────
function checkAnswer(selected, correct, _btn) {
    const isCorrect = selected === correct;
    if (isCorrect) correctCount++;

    QuizUI.highlightAnswer(currentButtons, correct, selected);
    scoreEl.textContent = `正解数: ${correctCount} / ${currentIndex + 1}`;

    // yearToEvent で不正解時、選択肢に年号を表示
    if (!isCorrect && currentMode === 'yearToEvent') {
        currentButtons.forEach(btn => {
            const q = allData.find(x => x.event === btn.textContent);
            if (q) btn.innerHTML = `<div>${btn.textContent}</div><div style="font-size:0.82em;opacity:0.9;">${formatYear(toDisplayYear(q))}</div>`;
        });
    }

    // 参考リンク
    const q = currentSet[currentIndex];
    if (q.link) {
        const a = document.createElement('div');
        a.style.cssText = 'margin-top:14px;text-align:center;';
        a.innerHTML = `<a href="${q.link}" target="_blank" style="color:var(--accent-text);font-weight:600;text-decoration:underline;">参考リンクはこちら</a>`;
        choicesDiv.appendChild(a);
    }

    nextBtn.style.display = 'block';
}

// ── 次の問題 ─────────────────────────────────────────────────
function onNext() {
    if (currentIndex < currentSet.length - 1) {
        currentIndex++;
        showQuestion();
    } else {
        showResult();
    }
}

// ── 結果画面 ─────────────────────────────────────────────────
function showResult() {
    questionDiv.textContent = 'クイズ終了！';
    const pct = Math.round((correctCount / questionCount) * 100);
    choicesDiv.innerHTML = `
        <p style="font-size:1.5em;margin:20px 0;text-align:center;color:var(--primary);font-weight:700;">
            ${correctCount} / ${questionCount} 問正解<br>
            正答率: ${pct}%
        </p>`;
    nextBtn.textContent = '最初に戻る';
    nextBtn.style.display = 'block';
    nextBtn.onclick = () => location.reload();
    scoreEl.textContent = '';
    progressBar.style.width = '100%';
}

// ── 問題追加 ─────────────────────────────────────────────────
async function addQuestion() {
    const yearStr = document.getElementById('newYear').value.trim();
    const event   = document.getElementById('newEvent').value.trim();
    const chapter = document.getElementById('newChapter').value;
    const link    = document.getElementById('newLink').value.trim();

    if (!yearStr || !event) { alert('年号と出来事を入力してください。'); return; }

    const { numericYear, is_bc } = parseYearInput(yearStr);
    if (!numericYear || isNaN(numericYear)) { alert('年号が解釈できません。'); return; }

    const dupes = allData.filter(q => q.year === numericYear && q.is_bc === is_bc);
    if (dupes.length) {
        const msg = `同じ年号「${yearStr}」が既に${dupes.length}件あります:\n` +
            dupes.map((q, i) => `${i+1}. ${q.event} (${q.chapter})`).join('\n') +
            '\n\nこのまま追加しますか？';
        if (!confirm(msg)) return;
    }

    const period = determinePeriod(numericYear, is_bc);
    const { error } = await db.from(TABLES.WH_QUIZ).insert({
        year: numericYear, is_bc, event, chapter, period, link: link || null
    });

    if (error) { alert('保存エラー: ' + error.message); return; }

    allData.push({ year: numericYear, is_bc, event, chapter, period, link: link || null });
    ['newYear', 'newEvent', 'newLink', 'newPeriod'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const msg = document.getElementById('addMessage');
    if (msg) {
        msg.textContent = '問題を追加しました！';
        setTimeout(() => { msg.textContent = ''; }, 3000);
    }
}