let selectedMode = 'typing';
let activeCols = new Set(COL_KEYS);
let qCorrect = 0;
let qTotal = 0;
let qAnswered = 0;
let qStreak = 0;
let current = null;
let answered = false;

const STORAGE_ACTIVE_COLS = 'jodoushi:activeCols';
const STORAGE_QUESTION_COUNT = 'jodoushi:questionCount';
const MAX_TYPING_COUNT = 50;
const MAX_TABLE_COUNT = 29;
const TBL_COLS = ['setsuzoku', 'katsuyo', 'imi', 'mizen', 'renyo', 'shushi', 'rentai', 'izen', 'meirei'];
const TBL_BLANKABLE_COLS = ['mizen', 'renyo', 'shushi', 'rentai', 'izen', 'meirei'];
const TBL_ROWS = [
  { key: 'name', label: '助動詞' },
  { key: 'setsuzoku', label: '接続' },
  { key: 'katsuyo', label: '活用の種類' },
  { key: 'imi', label: '意味' },
  { key: 'mizen', label: '未然形' },
  { key: 'renyo', label: '連用形' },
  { key: 'shushi', label: '終止形' },
  { key: 'rentai', label: '連体形' },
  { key: 'izen', label: '已然形' },
  { key: 'meirei', label: '命令形' },
];
const KATSUYO_FORM_COLS = ['mizen', 'renyo', 'shushi', 'rentai', 'izen', 'meirei'];
const TYPING_GROUPS = [
  { key: 'katsuyoForms', label: '活用形', cols: KATSUYO_FORM_COLS },
  { key: 'setsuzoku', label: '接続', cols: ['setsuzoku'] },
  { key: 'imi', label: '意味', cols: ['imi'] },
];

let tableBlankMap = {};
let tableInputs = [];
let tableOrder = [];
let tableQuestionIndex = 0;
let tableQuestionCorrect = 0;
let tableCurrentRevealed = false;
let tableCurrentDone = false;
let questionLimit = 20;

function saveActiveColsToStorage() {
  localStorage.setItem(STORAGE_ACTIVE_COLS, JSON.stringify([...activeCols]));
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  window.scrollTo(0, 0);
}

function goHome() {
  window.location.href = 'index.html';
}

function renderTypingSetupButtons() {
  const wrap = document.getElementById('typingColButtons');
  if (!wrap) return;
  wrap.innerHTML = '';

  TYPING_GROUPS.forEach((group) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `typing-col-btn ${isTypingGroupActive(group) ? 'on' : ''}`;
    btn.textContent = group.label;
    btn.addEventListener('click', () => {
      const next = new Set(activeCols);
      if (isTypingGroupActive(group)) {
        group.cols.forEach((col) => next.delete(col));
        if (!hasTypingGroupSelection(next)) return;
      } else {
        group.cols.forEach((col) => next.add(col));
      }
      activeCols = next;
      btn.classList.toggle('on', isTypingGroupActive(group));
    });
    wrap.appendChild(btn);
  });
}

function startTypingQuiz() {
  saveActiveColsToStorage();
  startQuiz();
}

function isTypingGroupActive(group) {
  return group.cols.every((col) => activeCols.has(col));
}

function hasTypingGroupSelection(colsSet) {
  return TYPING_GROUPS.some((group) => group.cols.some((col) => colsSet.has(col)));
}

function normalizeTypingActiveCols(colsSet) {
  const normalized = new Set();
  if (colsSet.has('setsuzoku')) normalized.add('setsuzoku');
  if (colsSet.has('imi')) normalized.add('imi');
  if (KATSUYO_FORM_COLS.some((col) => colsSet.has(col))) {
    KATSUYO_FORM_COLS.forEach((col) => normalized.add(col));
  }
  if (!hasTypingGroupSelection(normalized)) {
    COL_KEYS.forEach((col) => normalized.add(col));
  }
  return normalized;
}

function startQuiz() {
  if (selectedMode === 'table') {
    buildTableQuiz();
    showScreen('tableScreen');
    return;
  }
  qCorrect = 0;
  qTotal = 0;
  qAnswered = 0;
  qStreak = 0;
  const hScoreC = document.getElementById('hScoreC');
  const hScoreT = document.getElementById('hScoreT');
  const title = document.getElementById('quizHeaderTitle');
  if (hScoreC) hScoreC.textContent = '0';
  if (hScoreT) hScoreT.textContent = '0';
  if (title) title.textContent = '一問一答モード';
  updateTypingProgressBar();
  nextQuestion();
  showScreen('quizScreen');
}

function nextQuestion() {
  answered = false;
  const cols = [...activeCols];
  const candidates = [];
  DATA.forEach((row) => {
    cols.forEach((col) => {
      if (!isEmptyAnswerValue(row[col])) {
        candidates.push({ row, col });
      }
    });
  });

  if (candidates.length === 0) {
    current = null;
    const qText = document.getElementById('qText');
    const feedback = document.getElementById('feedback');
    const inp = document.getElementById('ansInput');
    if (qText) qText.textContent = '出題できるデータがありません。項目選択を見直してください。';
    if (feedback) {
      feedback.className = 'feedback';
      feedback.textContent = '';
    }
    if (inp) inp.disabled = true;
    return;
  }

  current = candidates[Math.floor(Math.random() * candidates.length)];
  const { row, col } = current;
  qTotal += 1;
  updateQScore();
  updateTypingProgressBar();

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
  const inp = document.getElementById('ansInput');

  if (qNum) qNum.textContent = `Q.${String(qTotal).padStart(3, '0')}`;
  if (qColTag) qColTag.textContent = COL_LABELS[col] || col;
  if (qText) {
    const suffix = asAnswerList(row[col]).length >= 2 ? '（1種類答えよ）' : '';
    qText.innerHTML = `助動詞 <span class="hw">${formatValue(row.name)}</span> の<span class="q-col-em">${COL_LABELS[col]}</span>は?${suffix}`;
  }
  if (feedback) {
    feedback.className = 'feedback';
    feedback.textContent = '';
  }
  if (nextBtn) nextBtn.style.display = 'none';
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
  const val = inp.value;
  const ans = current.row[current.col];
  answered = true;
  inp.disabled = true;
  const ok = isCorrectValue(ans, val);
  inp.className = `ans-input ${ok ? 'ok' : 'ng'}`;
  recordQ(ok);
}

function recordQ(ok) {
  qAnswered += 1;
  if (ok) {
    qCorrect += 1;
    qStreak += 1;
  } else {
    qStreak = 0;
  }
  updateQScore();
  showFeedbackQ(ok);
  updateTypingProgressBar();
  if (qTotal >= questionLimit) {
    endQuiz();
    return;
  }
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
    if (c === 'setsuzoku') memo = `katsuyo: ${formatValue(r.katsuyo)}`;
    else if (c === 'katsuyo') memo = `setsuzoku: ${formatValue(r.setsuzoku)}`;
    else if (c === 'imi') memo = `setsuzoku: ${formatValue(r.setsuzoku)} / katsuyo: ${formatValue(r.katsuyo)}`;
    else memo = `mizen:${formatValue(r.mizen)} renyo:${formatValue(r.renyo)} shushi:${formatValue(r.shushi)} rentai:${formatValue(r.rentai)} izen:${formatValue(r.izen)} meirei:${formatValue(r.meirei)}`;

    fb.className = 'feedback ok';
    fb.innerHTML = `Correct<div class="memo">${memo}</div>`;
  } else {
    fb.className = 'feedback ng';
    fb.innerHTML = `Incorrect. Correct: <span class="correct-ans">${formatValue(r[c])}</span><div class="memo">setsuzoku:${formatValue(r.setsuzoku)} / katsuyo:${formatValue(r.katsuyo)} / imi:${formatValue(r.imi)}</div>`;
  }
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

function updateTypingProgressBar() {
  const txt = document.getElementById('typingProgressText');
  const fill = document.getElementById('typingProgressFill');
  const total = Math.max(1, questionLimit);
  const currentNum = Math.min(qAnswered, total);
  if (txt) txt.textContent = `${currentNum} / ${total}`;
  if (fill) fill.style.width = `${Math.round((currentNum / total) * 100)}%`;
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
  tableOrder = [];
  tableQuestionIndex = 0;
  tableQuestionCorrect = 0;
  tableCurrentRevealed = false;
  tableCurrentDone = false;
  const tblResult = document.getElementById('tblResult');
  if (tblResult) tblResult.classList.remove('show');

  const order = DATA.map((_, i) => i);
  shuffle(order);
  tableOrder = order.slice(0, Math.max(1, Math.min(questionLimit, order.length)));
  renderCurrentTableQuestion();
}

function autoCheck(inp) {
  if (inp.disabled) return;
  const row = DATA[Number(inp.dataset.ri)];
  const ans = row[inp.dataset.col];
  const val = inp.value;
  if (val === '') {
    inp.className = 'tbl-input';
    return;
  }
  if (isCorrectValue(ans, val)) {
    inp.className = 'tbl-input ok';
    inp.disabled = true;
    const idx = tableInputs.indexOf(inp);
    if (idx >= 0) {
      const next = tableInputs.slice(idx + 1).find((i) => !i.disabled);
      if (next) next.focus();
    }
  } else {
    inp.className = 'tbl-input';
  }
  updateTblScore();
  if (tableInputs.length > 0 && tableInputs.every((i) => i.disabled)) {
    finalizeTableQuestion();
  }
}

function updateTblScore() {
  const completed = tableQuestionIndex + (tableCurrentDone ? 1 : 0);
  const tblProgress = document.getElementById('tblProgress');
  const tblCorrectCount = document.getElementById('tblCorrectCount');
  if (tblProgress) tblProgress.textContent = String(completed);
  if (tblCorrectCount) tblCorrectCount.textContent = String(tableQuestionCorrect);
  updateTableProgressBar(completed, tableOrder.length);
}

function checkAllTable() {
  tableInputs.forEach((inp) => {
    if (inp.disabled) return;
    const ans = DATA[Number(inp.dataset.ri)][inp.dataset.col];
    const val = inp.value;
    if (val === '') return;
    const ok = isCorrectValue(ans, val);
    inp.className = `tbl-input ${ok ? 'ok' : 'ng'}`;
    if (ok) inp.disabled = true;
  });
  updateTblScore();
  if (tableInputs.length > 0 && tableInputs.every((i) => i.disabled)) {
    finalizeTableQuestion();
  }
}

function revealAllTable() {
  tableCurrentRevealed = true;
  tableInputs.forEach((inp) => {
    if (inp.disabled) return;
    inp.value = formatValue(DATA[Number(inp.dataset.ri)][inp.dataset.col]);
    inp.className = 'tbl-input ok';
    inp.disabled = true;
  });
  updateTblScore();
  finalizeTableQuestion();
}

function resetTable() {
  buildTableQuiz();
  const tblResult = document.getElementById('tblResult');
  if (tblResult) tblResult.classList.remove('show');
}

function nextTableQuestion() {
  if (!tableCurrentDone) return;
  tableQuestionIndex += 1;
  if (tableQuestionIndex >= tableOrder.length) {
    showTblResult();
    return;
  }
  renderCurrentTableQuestion();
}

function showTblResult() {
  const total = tableOrder.length;
  const correct = tableQuestionCorrect;
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

function updateTableProgressBar(completed, totalRaw) {
  const total = Math.max(1, totalRaw || 0);
  const done = Math.min(completed, total);
  const txt = document.getElementById('tableProgressText');
  const fill = document.getElementById('tableProgressFill');
  if (txt) txt.textContent = `${done} / ${total}`;
  if (fill) fill.style.width = `${Math.round((done / total) * 100)}%`;
}

function finalizeTableQuestion() {
  if (tableCurrentDone) return;
  tableCurrentDone = true;
  if (!tableCurrentRevealed && tableInputs.every((i) => i.classList.contains('ok'))) {
    tableQuestionCorrect += 1;
  }
  updateTblScore();
  const nextBtn = document.getElementById('tblNextBtn');
  if (!nextBtn) return;
  nextBtn.style.display = '';
  nextBtn.textContent = tableQuestionIndex >= tableOrder.length - 1 ? '結果を見る' : '次の助動詞へ';
}

function renderCurrentTableQuestion() {
  tableInputs = [];
  tableCurrentRevealed = false;
  tableCurrentDone = false;
  const tbody = document.getElementById('tblBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const nextBtn = document.getElementById('tblNextBtn');
  if (nextBtn) nextBtn.style.display = 'none';

  const ri = tableOrder[tableQuestionIndex];
  const row = DATA[ri];
  const blankCols = TBL_BLANKABLE_COLS.filter((col) => !isEmptyAnswerValue(row[col]));

  TBL_ROWS.forEach((rowDef) => {
    const tr = document.createElement('tr');
    const rowHead = document.createElement('th');
    rowHead.className = 'row-head';
    rowHead.scope = 'row';
    rowHead.textContent = rowDef.label;
    tr.appendChild(rowHead);

    const col = rowDef.key;
    const td = document.createElement('td');
    if (col !== 'name' && blankCols.includes(col)) {
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
          else checkAllTable();
        }
      });
      td.appendChild(inp);
      tableInputs.push(inp);
    } else if (col === 'name') {
      td.className = 'name-cell';
      td.textContent = formatValue(row.name);
    } else {
      td.textContent = formatValue(row[col]);
      td.style.color = 'var(--ink2)';
    }
    tr.appendChild(td);
    if (rowDef.key === 'name') tr.classList.add('name-row');
    tbody.appendChild(tr);
  });

  const tblTotal = document.getElementById('tblTotal');
  if (tblTotal) tblTotal.textContent = String(tableOrder.length);
  updateTblScore();
  if (tableInputs.length > 0) {
    tableInputs[0].focus();
  } else {
    finalizeTableQuestion();
  }
}

function norm(s) {
  return (s || '').trim().replace(/\s+/g, '');
}

function asAnswerList(v) {
  if (Array.isArray(v)) return v;
  return [v];
}

function formatValue(v) {
  return asAnswerList(v).join('・');
}

function isCorrectValue(answerValue, inputValue) {
  const input = norm(inputValue);
  return asAnswerList(answerValue).some((ans) => norm(ans) === input);
}

function isEmptyAnswerValue(v) {
  return asAnswerList(v).every((ans) => {
    const n = norm(ans);
    return n === '' || n === '-' || n === '－' || n === '—';
  });
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

function loadQuestionLimitFromStorage() {
  const max = selectedMode === 'table' ? MAX_TABLE_COUNT : MAX_TYPING_COUNT;
  const v = Number(localStorage.getItem(STORAGE_QUESTION_COUNT) || 20);
  if (!Number.isFinite(v)) return 20;
  return Math.max(1, Math.min(max, Math.floor(v)));
}

function initPage() {
  const page = document.body?.dataset.page;
  if (page === 'typing') {
    selectedMode = 'typing';
    activeCols = normalizeTypingActiveCols(loadActiveColsFromStorage());
    questionLimit = loadQuestionLimitFromStorage();
    renderTypingSetupButtons();
    showScreen('typingSetupScreen');
    return;
  }
  if (page === 'table') {
    selectedMode = 'table';
    questionLimit = loadQuestionLimitFromStorage();
    buildTableQuiz();
    showScreen('tableScreen');
  }
}

document.addEventListener('DOMContentLoaded', initPage);

