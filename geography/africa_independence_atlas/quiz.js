// quiz.js
// 依存: data.js (africaFull, AFRICA_ISOS, ERA_COLORS, ERA_LABELS, COL_COLORS, COL_LABELS, FLAG_CODE, flagUrl, getColor)
// 外部ライブラリ: D3 v7, topojson-client@3, world-atlas countries-50m.json

// ── STATE ─────────────────────────────────────────────────────────────────────
const state = {
  mode:        'name',    // 'name' | 'era' | 'colonial'
  queue:       [],        // ISO codes for this session
  current:     0,         // index into queue
  correct:     0,
  missed:      [],        // ISO codes answered wrong (this session)
  allMissed:   [],        // persistent across sessions (for review mode)
  isReview:    false,
  answered:    false,
  topoData:    null,
  mapReady:    false,
};

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
// Africa ISOs as array (order doesn't matter — we'll shuffle)
const ALL_ISOS = Object.keys(africaFull);

const MODE_DESC = {
  name:     '地図上でハイライトされた国の名前を4択から選ぼう。',
  era:      '国名と国旗をヒントに、その国の独立年代を4択から選ぼう。',
  colonial: '国名と国旗をヒントに、旧宗主国を8択から選ぼう。',
};

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadLibsAndMap();
  updateStartScreen();
});

// ── MODE ──────────────────────────────────────────────────────────────────────
function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll('#modeToggle .mode-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  document.getElementById('startDesc').textContent = MODE_DESC[mode];
  updateStartScreen();
}

// ── START / RESTART ───────────────────────────────────────────────────────────
function startQuiz(reviewMode) {
  state.isReview = reviewMode;
  state.correct  = 0;
  state.missed   = [];
  state.answered = false;

  const pool = reviewMode ? [...state.allMissed] : [...ALL_ISOS];
  state.queue   = shuffle(pool);
  state.current = 0;

  showScreen('screenQuiz');
  renderQuestion();
}

// ── QUESTION ──────────────────────────────────────────────────────────────────
function renderQuestion() {
  state.answered = false;
  const iso = state.queue[state.current];
  const d   = africaFull[iso];

  // progress
  updateProgress();

  // 地図ハイライト
  highlightMap(iso);

  // プロンプト（era / colonial のみ表示）
  const prompt = document.getElementById('qPrompt');
  if (state.mode === 'name') {
    prompt.classList.add('hidden');
  } else {
    prompt.classList.remove('hidden');
    const url = flagUrl(iso);
    document.getElementById('qPromptFlag').innerHTML = url
      ? `<img src="${url}" alt="${d.name}" onerror="this.outerHTML='<span class=\\'flag-emoji\\'>${d.flag}</span>'">`
      : `<span class="flag-emoji">${d.flag}</span>`;
    document.getElementById('qPromptText').innerHTML =
      `<span class="country-name">${d.name}</span> の${state.mode === 'era' ? '独立年代' : '旧宗主国'}は？`;
  }

  // 選択肢
  renderChoices(iso);

  // フィードバック非表示
  const fb = document.getElementById('qFeedback');
  fb.classList.add('hidden');
  fb.className = 'q-feedback hidden';
}

// ── CHOICES ───────────────────────────────────────────────────────────────────
function renderChoices(iso) {
  const box = document.getElementById('qChoices');
  box.innerHTML = '';

  if (state.mode === 'name') {
    box.className = 'q-choices grid-2x2';
    const options = buildNameOptions(iso);
    options.forEach(optIso => {
      const d   = africaFull[optIso];
      const url = flagUrl(optIso);
      const btn = document.createElement('button');
      btn.className    = 'q-choice';
      btn.dataset.iso  = optIso;
      btn.innerHTML    = `
        <span class="q-choice-flag">
          ${url
            ? `<img src="${url}" alt="${d.name}" onerror="this.outerHTML='<span class=\\'flag-emoji\\'>${d.flag}</span>'">`
            : `<span class="flag-emoji">${d.flag}</span>`}
        </span>
        <span>${d.name}</span>`;
      btn.addEventListener('click', () => answerName(iso, optIso, btn));
      box.appendChild(btn);
    });

  } else if (state.mode === 'era') {
    box.className = 'q-choices grid-col1';
    const eraKeys = Object.keys(ERA_LABELS);
    eraKeys.forEach(era => {
      const btn = document.createElement('button');
      btn.className   = 'q-choice';
      btn.dataset.era = era;
      btn.innerHTML   = `
        <span class="q-choice-swatch" style="background:${ERA_COLORS[era]}"></span>
        <span>${ERA_LABELS[era]}</span>`;
      btn.addEventListener('click', () => answerEra(iso, era, btn));
      box.appendChild(btn);
    });

  } else { // colonial
    box.className = 'q-choices grid-2x4';
    const colKeys = Object.keys(COL_LABELS);
    colKeys.forEach(col => {
      const btn = document.createElement('button');
      btn.className   = 'q-choice';
      btn.dataset.col = col;
      btn.innerHTML   = `
        <span class="q-choice-swatch" style="background:${COL_COLORS[col]}"></span>
        <span>${COL_LABELS[col]}</span>`;
      btn.addEventListener('click', () => answerColonial(iso, col, btn));
      box.appendChild(btn);
    });
  }
}

// 4択生成（場所→国名）: 正解1 + ランダム3
function buildNameOptions(correctIso) {
  const others = shuffle(ALL_ISOS.filter(i => i !== correctIso)).slice(0, 3);
  return shuffle([correctIso, ...others]);
}

// ── ANSWER HANDLERS ───────────────────────────────────────────────────────────
function answerName(correctIso, chosenIso, btn) {
  if (state.answered) return;
  state.answered = true;
  disableChoices();

  const isCorrect = chosenIso === correctIso;
  if (isCorrect) {
    state.correct++;
    btn.classList.add('correct');
    highlightCorrect(correctIso);
  } else {
    state.missed.push(correctIso);
    btn.classList.add('wrong');
    // 正解ボタンも緑に
    document.querySelectorAll('#qChoices .q-choice').forEach(b => {
      if (b.dataset.iso === correctIso) b.classList.add('correct');
    });
    highlightWrong(correctIso);
  }
  showFeedback(isCorrect, correctIso);
}

function answerEra(correctIso, chosenEra, btn) {
  if (state.answered) return;
  state.answered = true;
  disableChoices();

  const correctEra = africaFull[correctIso].era;
  const isCorrect  = chosenEra === correctEra;
  if (isCorrect) {
    state.correct++;
    btn.classList.add('correct');
  } else {
    state.missed.push(correctIso);
    btn.classList.add('wrong');
    document.querySelectorAll('#qChoices .q-choice').forEach(b => {
      if (b.dataset.era === correctEra) b.classList.add('correct');
    });
  }
  showFeedback(isCorrect, correctIso);
}

function answerColonial(correctIso, chosenCol, btn) {
  if (state.answered) return;
  state.answered = true;
  disableChoices();

  const correctCol = africaFull[correctIso].colonial;
  const isCorrect  = chosenCol === correctCol;
  if (isCorrect) {
    state.correct++;
    btn.classList.add('correct');
  } else {
    state.missed.push(correctIso);
    btn.classList.add('wrong');
    document.querySelectorAll('#qChoices .q-choice').forEach(b => {
      if (b.dataset.col === correctCol) b.classList.add('correct');
    });
  }
  showFeedback(isCorrect, correctIso);
}

function disableChoices() {
  document.querySelectorAll('#qChoices .q-choice').forEach(b => { b.disabled = true; });
}

// ── FEEDBACK ──────────────────────────────────────────────────────────────────
function showFeedback(isCorrect, iso) {
  const d  = africaFull[iso];
  const fb = document.getElementById('qFeedback');
  fb.classList.remove('hidden', 'correct', 'wrong');
  fb.classList.add(isCorrect ? 'correct' : 'wrong');

  document.getElementById('feedbackIcon').textContent = isCorrect ? '✓' : '✗';

  let msg = '';
  if (state.mode === 'name') {
    msg = isCorrect
      ? `正解！ <strong>${d.name}</strong>（${d.en}）`
      : `不正解。正解は <strong>${d.name}</strong>（${d.en}）`;
  } else if (state.mode === 'era') {
    const eraLabel = ERA_LABELS[d.era] || d.era;
    msg = isCorrect
      ? `正解！ 独立年代：<strong>${eraLabel}</strong>`
      : `不正解。正解は <strong>${eraLabel}</strong>（${d.indYear ? d.indYear + '年' : '植民地化されず'}）`;
  } else {
    const colLabel = COL_LABELS[d.colonial] || d.colonial;
    msg = isCorrect
      ? `正解！ 旧宗主国：<strong>${colLabel}</strong>`
      : `不正解。正解は <strong>${colLabel}</strong>`;
  }

  document.getElementById('feedbackText').innerHTML = msg;

  // キーボード: Enterで次へ
  const handler = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { nextQuestion(); document.removeEventListener('keydown', handler); }
  };
  document.addEventListener('keydown', handler);
}

// ── NEXT ──────────────────────────────────────────────────────────────────────
function nextQuestion() {
  state.current++;
  if (state.current >= state.queue.length) {
    finishQuiz();
  } else {
    renderQuestion();
  }
}

// ── FINISH ────────────────────────────────────────────────────────────────────
function finishQuiz() {
  // allMissed を更新（重複除去）
  const newMissed = state.isReview
    ? state.missed  // 復習モードでまた間違えたものだけ残す
    : state.missed;
  state.allMissed = [...new Set(newMissed)];
  saveMissed();

  const total = state.queue.length;
  const pct   = total > 0 ? Math.round((state.correct / total) * 100) : 0;

  const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '😊' : '📚';
  const msg   = pct >= 80 ? 'すばらしい！'
              : pct >= 60 ? 'もう少し！'
              : '復習しよう';

  document.getElementById('resultEmoji').textContent   = emoji;
  document.getElementById('resultMsg').textContent     = msg;
  document.getElementById('resultCorrect').textContent = state.correct;
  document.getElementById('resultTotal').textContent   = total;
  document.getElementById('resultPct').textContent     = `正答率 ${pct}%`;

  // 復習リスト
  buildMissedList();

  // 復習ボタン
  const cnt = state.allMissed.length;
  const rb  = document.getElementById('retryMissedBtn');
  document.getElementById('resultReviewCount').textContent = cnt;
  rb.disabled = cnt === 0;

  // 地図リセット
  resetMapColors();

  showScreen('screenResult');
  updateStartScreen();
}

function buildMissedList() {
  const sec  = document.getElementById('missedSection');
  const list = document.getElementById('missedList');
  list.innerHTML = '';

  if (state.missed.length === 0) {
    sec.style.display = 'none';
    return;
  }
  sec.style.display = '';

  state.missed.forEach(iso => {
    const d   = africaFull[iso];
    const url = flagUrl(iso);
    const li  = document.createElement('div');
    li.className = 'missed-item';
    li.innerHTML = `
      ${url
        ? `<img src="${url}" alt="${d.name}" onerror="this.outerHTML='<span class=\\'missed-item-emoji\\'>${d.flag}</span>'">`
        : `<span class="missed-item-emoji">${d.flag}</span>`}
      <span class="missed-item-name">${d.name}</span>
      <span class="missed-item-year">${d.indYear ? d.indYear + '年' : '—'}</span>`;
    list.appendChild(li);
  });
}

// ── PROGRESS ──────────────────────────────────────────────────────────────────
function updateProgress() {
  const total   = state.queue.length;
  const current = state.current + 1;
  const pct     = total > 0 ? ((state.current) / total) * 100 : 0;
  document.getElementById('progressFill').style.width  = pct + '%';
  document.getElementById('progressLabel').textContent = `${state.current} / ${total}`;
}

// ── MAP ───────────────────────────────────────────────────────────────────────
function renderQuizMap(topoData) {
  const svg = document.getElementById('qMap');
  const W = svg.clientWidth  || svg.parentElement.clientWidth;
  const H = svg.clientHeight || svg.parentElement.clientHeight;

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width',  W);
  svg.setAttribute('height', H);
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const projection = d3.geoMercator()
    .center([20, 2])
    .scale(Math.min(W, H) * 1.18)
    .translate([W * .46, H * .5]);

  const pathGen  = d3.geoPath().projection(projection);
  const features = topojson.feature(topoData, topoData.objects.countries).features;

  features.forEach(feat => {
    const iso      = String(feat.id).padStart(3, '0');
    const isAfrica = AFRICA_ISOS.has(iso);
    const dStr     = pathGen(feat);
    if (!dStr) return;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', dStr);
    path.setAttribute('class', isAfrica ? 'country' : 'country non-africa');
    path.dataset.iso = iso;

    if (isAfrica) {
      // クイズ中は全体をニュートラルカラーに
      path.style.fill = '#b8c4ce';
    }

    svg.appendChild(path);
  });

  state.mapReady = true;
}

function highlightMap(iso) {
  resetMapColors();
  const path = document.querySelector(`#qMap [data-iso="${iso}"]`);
  if (!path) return;
  path.classList.add('q-highlight');
  path.style.fill = '#f0a500';
}

function highlightCorrect(iso) {
  const path = document.querySelector(`#qMap [data-iso="${iso}"]`);
  if (!path) return;
  path.classList.remove('q-highlight');
  path.classList.add('q-correct');
}

function highlightWrong(correctIso) {
  // ハイライト国（選択した国）を赤に — すでに highlight クラスがある
  const highlighted = document.querySelector('#qMap .q-highlight');
  if (highlighted) {
    highlighted.classList.remove('q-highlight');
    highlighted.classList.add('q-wrong');
  }
  // 正解国を緑に
  const correct = document.querySelector(`#qMap [data-iso="${correctIso}"]`);
  if (correct) {
    correct.classList.remove('q-highlight');
    correct.classList.add('q-reveal');
  }
}

function resetMapColors() {
  document.querySelectorAll('#qMap .country').forEach(el => {
    el.classList.remove('q-highlight', 'q-correct', 'q-wrong', 'q-reveal');
    if (!el.classList.contains('non-africa')) {
      el.style.fill = '#b8c4ce';
    }
  });
}

// ── SCREEN SWITCHING ──────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.quiz-screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ── START SCREEN UPDATE ───────────────────────────────────────────────────────
function updateStartScreen() {
  const cnt = state.allMissed.length;
  document.getElementById('statTotal').textContent  = ALL_ISOS.length;
  document.getElementById('statMissed').textContent = cnt;
  document.getElementById('reviewCount').textContent = cnt;
  const rb = document.getElementById('reviewBtn');
  rb.disabled = cnt === 0;
}

// ── PERSISTENCE (missed list) ─────────────────────────────────────────────────
const STORAGE_KEY = 'africa-quiz-missed';

function saveMissed() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.allMissed)); } catch(e) {}
}
function loadMissed() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v) state.allMissed = JSON.parse(v);
  } catch(e) {}
}

// ── UTILS ─────────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── LIBRARY LOADER ────────────────────────────────────────────────────────────
function loadLibsAndMap() {
  document.getElementById('qLoading').classList.remove('hidden');
  loadMissed();
  updateStartScreen();

  const s1 = document.createElement('script');
  s1.src = 'https://d3js.org/d3.v7.min.js';
  s1.onload = () => {
    const s2 = document.createElement('script');
    s2.src = 'https://unpkg.com/topojson-client@3/dist/topojson-client.min.js';
    s2.onload = () => {
      fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
        .then(r => r.json())
        .then(data => {
          state.topoData = data;
          document.getElementById('qLoading').classList.add('hidden');
          // クイズ開始前に地図を初期描画
          renderQuizMap(data);
          window.addEventListener('resize', () => {
            if (state.topoData) renderQuizMap(state.topoData);
          });
        })
        .catch(() => {
          document.getElementById('qLoading').innerHTML =
            '<span style="color:#e53">地図データの読み込みに失敗しました</span>';
        });
    };
    document.head.appendChild(s2);
  };
  document.head.appendChild(s1);
}
