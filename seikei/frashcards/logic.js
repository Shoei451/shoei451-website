const CATS = ["ALL", ...new Set(ALL_QA.map(q => q.cat))];
let currentCat = "ALL";
let questions = [], idx = 0, answered = 0, correct = 0, wrong = 0, revealed = false;

function getQuestions() {
  return currentCat === "ALL" ? [...ALL_QA] : ALL_QA.filter(q => q.cat === currentCat);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function init() {
  questions = getQuestions();
  idx = 0; answered = 0; correct = 0; wrong = 0;
  document.getElementById('total-count').textContent = ALL_QA.length;
  document.getElementById('result-screen').classList.remove('visible');
  document.getElementById('quiz-area').style.display = '';
  updateStats();
  showCard();
}

function showCard() {
  if (idx >= questions.length) { showResult(); return; }
  const q = questions[idx];
  document.getElementById('card-category').textContent = q.cat.toUpperCase();
  document.getElementById('card-number').textContent = `${idx + 1} / ${questions.length}`;
  document.getElementById('quiz-card').setAttribute('data-index', `Q${idx + 1}`);
  document.getElementById('card-question').textContent = q.q;
  document.getElementById('card-answer').textContent = q.a;
  document.getElementById('answer-area').classList.remove('visible');
  document.getElementById('reveal-row').style.display = '';
  document.getElementById('mark-row').style.display = 'none';
  document.getElementById('section-header').textContent = q.cat;
  revealed = false;

  // re-trigger card animation
  const card = document.getElementById('quiz-card');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = '';
}

function revealAnswer() {
  document.getElementById('answer-area').classList.add('visible');
  document.getElementById('reveal-row').style.display = 'none';
  document.getElementById('mark-row').style.display = '';
  revealed = true;
}

function mark(isCorrect) {
  if (!revealed) return;
  answered++;
  if (isCorrect) correct++; else wrong++;
  idx++;
  updateStats();
  showCard();
}

function updateStats() {
  const total = questions.length;
  document.getElementById('s-answered').textContent = answered;
  document.getElementById('s-correct').textContent = correct;
  document.getElementById('s-wrong').textContent = wrong;
  const pct = answered > 0 ? Math.round(correct / answered * 100) : 0;
  document.getElementById('s-pct').textContent = (answered > 0 ? pct + '%' : '—%');
  const prog = total ? Math.round(answered / total * 100) : 0;
  document.getElementById('progress-bar').style.width = prog + '%';
  document.getElementById('progress-label').textContent = `${answered} / ${total}`;
}

function showResult() {
  document.getElementById('quiz-area').style.display = 'none';
  document.getElementById('result-screen').classList.add('visible');
  const pct = questions.length ? Math.round(correct / questions.length * 100) : 0;
  document.getElementById('result-score').textContent = `SCORE: ${correct} / ${questions.length}  [${pct}%]`;
  const msgs = [
    [90, '>> EXCELLENT. 本番も大丈夫！'],
    [70, '>> GOOD JOB. あと少し！'],
    [50, '>> KEEP GOING. 苦手を復習しよう。'],
    [0,  '>> RETRY. もう一度挑戦！'],
  ];
  document.getElementById('result-msg').textContent = msgs.find(([t]) => pct >= t)[1];
  document.getElementById('result-detail').textContent =
    `正解 ${correct}問 / 不正解 ${wrong}問 / 計 ${questions.length}問`;
}

function restart() {
  questions = getQuestions();
  idx = 0; answered = 0; correct = 0; wrong = 0;
  document.getElementById('result-screen').classList.remove('visible');
  document.getElementById('quiz-area').style.display = '';
  updateStats();
  showCard();
}

function shuffleAndRestart() {
  questions = shuffle(getQuestions());
  idx = 0; answered = 0; correct = 0; wrong = 0;
  document.getElementById('result-screen').classList.remove('visible');
  document.getElementById('quiz-area').style.display = '';
  updateStats();
  showCard();
}

function buildTabs() {
  const container = document.getElementById('tabs');
  CATS.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'nav-link' + (cat === currentCat ? ' active' : '');
    btn.textContent = cat;
    btn.onclick = () => {
      currentCat = cat;
      document.querySelectorAll('.nav-link').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      init();
    };
    container.appendChild(btn);
  });
}

buildTabs();
init();