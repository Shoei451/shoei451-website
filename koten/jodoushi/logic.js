let selectedMode = 'typing';
let activeCols = new Set(COL_KEYS);
let qCorrect = 0;
let qTotal = 0;
let qStreak = 0;
let current = null;
let answered = false;

const STORAGE_ACTIVE_COLS = 'jodoushi:activeCols';
const TBL_COLS = ['setsuzoku', 'katsuyo', 'imi', 'mizen', 'renyo', 'shushi', 'rentai', 'izen', 'meirei'];
const TBL_BLANKABLE_COLS = ['mizen', 'renyo', 'shushi', 'rentai', 'izen', 'meirei'];

let tableBlankMap = {};
let tableInputs = [];

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  window.scrollTo(0, 0);
}

function goHome() {
  window.location.href = 'index.html';
}

function startQuiz() {
  if (selectedMode === 'table') {
    buildTableQuiz();
    showScreen('tableScreen');
    return;
  }
  qCorrect = 0;
  qTotal = 0;
  qStreak = 0;
  const hScoreC = document.getElementById('hScoreC');
  const hScoreT = document.getElementById('hScoreT');
  const title = document.getElementById('quizHeaderTitle');
  if (hScoreC) hScoreC.textContent = '0';
  if (hScoreT) hScoreT.textContent = '0';
  if (title) title.textContent = 'Typing Mode';
  nextQuestion();
  showScreen('quizScreen');
}

function nextQuestion() {
  answered = false;
  const row = DATA[Math.floor(Math.random() * DATA.length)];
  const cols = [...activeCols];
  const col = cols[Math.floor(Math.random() * cols.length)];
  current = { row, col };
  qTotal += 1;
  updateQScore();

  const card = document.getElementById('qCard');
  if (card) {
    card.style.animation = 'none';
    requestAnimationFrame(() => {
      card.style.animation = '';
    });
  }

  const qNum = document.getElementById('qNum');
  const qColTag = document.getElementById('qColTag');
  const qText = document.getElementById('qText');
  const feedback = document.getElementById('feedback');
  const nextBtn = document.getElementById('nextBtn');
  const hintBox = document.getElementById('hintBox');
  const inp = document.getElementById('ansInput');

  if (qNum) qNum.textContent = `Q.${String(qTotal).padStart(3, '0')}`;
  if (qColTag) qColTag.textContent = COL_LABELS[col] || col;
  if (qText) qText.innerHTML = `<span class="hw">${row.name}</span> - ${COL_LABELS[col]} ?`;
  if (feedback) {
    feedback.className = 'feedback';
    feedback.textContent = '';
  }
  if (nextBtn) nextBtn.style.display = 'none';
  if (hintBox) {
    hintBox.className = 'hint-box';
    hintBox.textContent = '';
  }
  if (inp) {
    inp.value = '';
    inp.className = 'ans-input';
    inp.disabled = false;
    setTimeout(() => inp.focus(), 60);
  }
}

function checkTyping() {
  if (answered || !current) return;
  const inp = document.getElementById('ansInput');
  if (!inp) return;
  const val = norm(inp.value);
  const ans = norm(current.row[current.col]);
  answered = true;
  inp.disabled = true;
  const ok = val === ans;
  inp.className = `ans-input ${ok ? 'ok' : 'ng'}`;
  recordQ(ok);
}

function recordQ(ok) {
  if (ok) {
    qCorrect += 1;
    qStreak += 1;
  } else {
    qStreak = 0;
  }
  updateQScore();
  showFeedbackQ(ok);
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) nextBtn.style.display = '';
}

function showFeedbackQ(ok) {
  if (!current) return;
  const r = current.row;
  const c = current.col;
  const fb = document.getElementById('feedback');
  if (!fb) return;

  if (ok) {
    let memo = '';
    if (c === 'setsuzoku') memo = `katsuyo: ${r.katsuyo}`;
    else if (c === 'katsuyo') memo = `setsuzoku: ${r.setsuzoku}`;
    else if (c === 'imi') memo = `setsuzoku: ${r.setsuzoku} / katsuyo: ${r.katsuyo}`;
    else memo = `mizen:${r.mizen} renyo:${r.renyo} shushi:${r.shushi} rentai:${r.rentai} izen:${r.izen} meirei:${r.meirei}`;

    fb.className = 'feedback ok';
    fb.innerHTML = `Correct<div class="memo">${memo}</div>`;
  } else {
    fb.className = 'feedback ng';
    fb.innerHTML = `Incorrect. Correct: <span class="correct-ans">${r[c]}</span><div class="memo">setsuzoku:${r.setsuzoku} / katsuyo:${r.katsuyo} / imi:${r.imi}</div>`;
  }
}

function showHint() {
  if (!current) return;
  const h = document.getElementById('hintBox');
  if (!h) return;
  h.className = 'hint-box show';
  const fn = HINTS[current.col];
  h.textContent = typeof fn === 'function' ? fn(current.row) : '';
}

function updateQScore() {
  const hScoreC = document.getElementById('hScoreC');
  const hScoreT = document.getElementById('hScoreT');
  if (hScoreC) hScoreC.textContent = String(qCorrect);
  if (hScoreT) hScoreT.textContent = String(qTotal);

  const sp = document.getElementById('streakPill');
  const streakNum = document.getElementById('streakNum');
  if (!sp || !streakNum) return;
  if (qStreak >= 3) {
    sp.style.display = '';
    streakNum.textContent = String(qStreak);
  } else {
    sp.style.display = 'none';
  }
}

function endQuiz() {
  const resultBig = document.getElementById('resultBig');
  const resultComment = document.getElementById('resultComment');
  const rate = qTotal > 0 ? Math.round((qCorrect / qTotal) * 100) : 0;
  if (resultBig) resultBig.textContent = `${qCorrect} / ${qTotal}`;
  if (resultComment) {
    const comment = rate >= 90 ? 'Excellent.'
      : rate >= 70 ? 'Good progress.'
      : rate >= 50 ? 'Almost there.'
      : 'Review basics and retry.';
    resultComment.textContent = comment;
  }
  showScreen('resultsScreen');
}

function restartSameMode() {
  startQuiz();
}

function buildTableQuiz() {
  tableBlankMap = {};
  tableInputs = [];
  const tblResult = document.getElementById('tblResult');
  if (tblResult) tblResult.classList.remove('show');

  const tbody = document.getElementById('tblBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  DATA.forEach((row, ri) => {
    const blankCols = shuffle([...TBL_BLANKABLE_COLS]).slice(0, Math.floor(4 + Math.random() * 3));
    blankCols.forEach((c) => {
      tableBlankMap[`${ri}_${c}`] = true;
    });

    const tr = document.createElement('tr');
    const tdName = document.createElement('td');
    tdName.className = 'name-cell';
    tdName.textContent = row.name;
    tr.appendChild(tdName);

    TBL_COLS.forEach((col) => {
      const td = document.createElement('td');
      if (tableBlankMap[`${ri}_${col}`]) {
        td.className = 'tbl-cell-blank';
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.className = 'tbl-input';
        inp.placeholder = '...';
        inp.dataset.ri = String(ri);
        inp.dataset.col = col;
        inp.setAttribute('autocomplete', 'off');
        inp.addEventListener('input', () => autoCheck(inp));
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            const idx = tableInputs.indexOf(inp);
            if (idx < tableInputs.length - 1) tableInputs[idx + 1].focus();
          }
        });
        td.appendChild(inp);
        tableInputs.push(inp);
      } else {
        td.textContent = row[col];
        td.style.color = 'var(--ink2)';
      }
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  const tblTotal = document.getElementById('tblTotal');
  const tblProgress = document.getElementById('tblProgress');
  const tblCorrectCount = document.getElementById('tblCorrectCount');
  if (tblTotal) tblTotal.textContent = String(tableInputs.length);
  if (tblProgress) tblProgress.textContent = '0';
  if (tblCorrectCount) tblCorrectCount.textContent = '0';
}

function autoCheck(inp) {
  const row = DATA[Number(inp.dataset.ri)];
  const ans = norm(row[inp.dataset.col]);
  const val = norm(inp.value);
  if (val === '') {
    inp.className = 'tbl-input';
    return;
  }
  if (val === ans) {
    inp.className = 'tbl-input ok';
    inp.disabled = true;
  } else {
    inp.className = 'tbl-input';
  }
  updateTblScore();
}

function updateTblScore() {
  const filled = tableInputs.filter((i) => i.value.trim() !== '').length;
  const correct = tableInputs.filter((i) => i.classList.contains('ok')).length;
  const tblProgress = document.getElementById('tblProgress');
  const tblCorrectCount = document.getElementById('tblCorrectCount');
  if (tblProgress) tblProgress.textContent = String(filled);
  if (tblCorrectCount) tblCorrectCount.textContent = String(correct);
}

function checkAllTable() {
  tableInputs.forEach((inp) => {
    if (inp.disabled) return;
    const ans = norm(DATA[Number(inp.dataset.ri)][inp.dataset.col]);
    const val = norm(inp.value);
    if (val === '') return;
    inp.className = `tbl-input ${val === ans ? 'ok' : 'ng'}`;
    if (val === ans) inp.disabled = true;
  });
  updateTblScore();
  if (tableInputs.length > 0 && tableInputs.every((i) => i.disabled)) {
    showTblResult(tableInputs.filter((i) => i.classList.contains('ok')).length);
  }
}

function revealAllTable() {
  tableInputs.forEach((inp) => {
    if (inp.disabled) return;
    inp.value = DATA[Number(inp.dataset.ri)][inp.dataset.col];
    inp.className = 'tbl-input ok';
    inp.disabled = true;
  });
  updateTblScore();
  showTblResult(tableInputs.length);
}

function resetTable() {
  buildTableQuiz();
  const tblResult = document.getElementById('tblResult');
  if (tblResult) tblResult.classList.remove('show');
  if (tableInputs.length > 0) tableInputs[0].focus();
}

function showTblResult(correct) {
  const total = tableInputs.length;
  const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
  const score = document.getElementById('tblResultScore');
  const commentEl = document.getElementById('tblResultComment');
  const result = document.getElementById('tblResult');
  if (score) score.textContent = `${correct} / ${total}`;
  if (commentEl) {
    const comment = rate >= 90 ? 'Excellent.'
      : rate >= 70 ? 'Good.'
      : rate >= 50 ? 'Keep going.'
      : 'Review and retry.';
    commentEl.textContent = comment;
  }
  if (result) {
    result.classList.add('show');
    result.scrollIntoView({ behavior: 'smooth' });
  }
}

function norm(s) {
  return (s || '').trim().replace(/\s+/g, '');
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function loadActiveColsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_COLS);
    const cols = JSON.parse(raw || '[]');
    if (!Array.isArray(cols) || cols.length === 0) return new Set(COL_KEYS);
    const valid = cols.filter((c) => COL_KEYS.includes(c));
    return new Set(valid.length > 0 ? valid : COL_KEYS);
  } catch (_) {
    return new Set(COL_KEYS);
  }
}

function initPage() {
  const page = document.body?.dataset.page;
  if (page === 'typing') {
    selectedMode = 'typing';
    activeCols = loadActiveColsFromStorage();
    startQuiz();
    return;
  }
  if (page === 'table') {
    selectedMode = 'table';
    buildTableQuiz();
    showScreen('tableScreen');
  }
}

document.addEventListener('DOMContentLoaded', initPage);
