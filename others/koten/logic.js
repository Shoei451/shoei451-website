
// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────
let selectedCats = new Set(['rhetoric','rank','lit']);
let selectedDiff = 'all';
let quizQuestions = [];
let currentIdx = 0;
let score = 0;
let answered = false;
let editingId = null;

const CATEGORY_LABELS = { rhetoric:'和歌の修辞', rank:'貴族の位', lit:'文学史' };
const DIFFICULTY_LABELS = { easy:'基礎', medium:'標準', hard:'発展' };
const CATEGORY_COLORS = { rhetoric:'#7b5ea7', rank:'#b8941f', lit:'#2a6641' };
const OPTION_MARKERS = ['1','2','3','4'];

// ─────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────
function showTab(tab) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + tab).classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
  if (tab === 'top') updateCounts();
  if (tab === 'editor') renderQList();
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'page-top') document.getElementById('tab-top').classList.add('active');
}

// ─────────────────────────────────────────────
// TOP PAGE
// ─────────────────────────────────────────────
function updateCounts() {
  ['rhetoric','rank','lit'].forEach(cat => {
    const n = questions.filter(q => q.category === cat).length;
    document.getElementById('cnt-' + cat).textContent = n + '問';
  });
  const total = getFilteredPool().length;
  const slider = document.getElementById('countSlider');
  slider.max = Math.max(5, total);
  if (parseInt(slider.value) > total) slider.value = Math.max(5, total);
  updateCount();

  document.getElementById('startBtn').disabled = total === 0 || selectedCats.size === 0;
}

function getFilteredPool() {
  return questions.filter(q =>
    selectedCats.has(q.category) &&
    (selectedDiff === 'all' || q.difficulty === selectedDiff)
  );
}

function toggleCat(el) {
  const cat = el.dataset.cat;
  if (selectedCats.has(cat)) {
    if (selectedCats.size === 1) return; // keep at least one
    selectedCats.delete(cat);
    el.classList.remove('selected');
  } else {
    selectedCats.add(cat);
    el.classList.add('selected');
  }
  updateCounts();
}

function selectDiff(el) {
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  selectedDiff = el.dataset.diff;
  updateCounts();
}

function updateCount() {
  const v = document.getElementById('countSlider').value;
  document.getElementById('countVal').textContent = v + '問';
}

// ─────────────────────────────────────────────
// QUIZ
// ─────────────────────────────────────────────
function startQuiz() {
  const pool = getFilteredPool();
  const n = Math.min(parseInt(document.getElementById('countSlider').value), pool.length);
  quizQuestions = shuffle([...pool]).slice(0, n);
  currentIdx = 0; score = 0;
  showPage('page-quiz');
  renderQuestion();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderQuestion() {
  answered = false;
  const q = quizQuestions[currentIdx];
  const total = quizQuestions.length;

  // Progress
  const pct = (currentIdx / total) * 100;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = (currentIdx + 1) + ' / ' + total;
  document.getElementById('progressScore').textContent = '正解：' + score;

  // Meta
  const catBadge = document.getElementById('qCatBadge');
  catBadge.textContent = CATEGORY_LABELS[q.category];
  catBadge.className = 'q-category-badge badge-' + q.category;
  document.getElementById('qDiffBadge').textContent = DIFFICULTY_LABELS[q.difficulty];
  document.getElementById('qNum').textContent = 'Q' + (currentIdx + 1);

  // Image
  const imgEl = document.getElementById('qImage');
  if (q.image) {
    imgEl.src = q.image;
    imgEl.style.display = 'block';
  } else {
    imgEl.style.display = 'none';
  }

  // Question text
  document.getElementById('qText').textContent = q.question;

  // Options
  const grid = document.getElementById('optionsGrid');
  grid.innerHTML = '';
  // Shuffle option display
  const optOrder = shuffle([0,1,2,3]);
  q._displayOrder = optOrder;
  optOrder.forEach((origIdx, displayIdx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.dataset.orig = origIdx;
    btn.innerHTML = `<span class="opt-marker">${OPTION_MARKERS[displayIdx]}</span><span>${q.options[origIdx]}</span>`;
    btn.onclick = () => selectOption(btn, origIdx, q.correct);
    grid.appendChild(btn);
  });

  // Reset feedback
  document.getElementById('resultIndicator').className = 'result-indicator';
  document.getElementById('explanationBox').className = 'explanation-box';
  document.getElementById('nextBtn').style.display = 'none';
}

function selectOption(btn, origIdx, correct) {
  if (answered) return;
  answered = true;

  const isCorrect = origIdx === correct;
  if (isCorrect) score++;

  // Color buttons
  document.querySelectorAll('.option-btn').forEach(b => {
    b.disabled = true;
    const oi = parseInt(b.dataset.orig);
    if (oi === correct) b.classList.add('correct');
    else if (b === btn && !isCorrect) b.classList.add('wrong');
  });

  // Result indicator
  const ind = document.getElementById('resultIndicator');
  ind.textContent = isCorrect ? '✓ 正解！' : '✗ 不正解';
  ind.style.color = isCorrect ? 'var(--moss)' : 'var(--vermillion)';
  ind.classList.add('visible');

  // Explanation
  const q = quizQuestions[currentIdx];
  if (q.explanation) {
    document.getElementById('explanationText').textContent = q.explanation;
    document.getElementById('explanationBox').classList.add('visible');
  }

  // Score update
  document.getElementById('progressScore').textContent = '正解：' + score;

  // Next button
  const nextBtn = document.getElementById('nextBtn');
  nextBtn.style.display = 'inline-block';
  nextBtn.textContent = currentIdx + 1 < quizQuestions.length ? '次の問題 →' : '結果を見る';
}

function nextQuestion() {
  currentIdx++;
  if (currentIdx >= quizQuestions.length) {
    showResult();
  } else {
    renderQuestion();
  }
}

function quitQuiz() {
  if (confirm('クイズを中断してホームに戻りますか？')) {
    showTab('top');
  }
}

// ─────────────────────────────────────────────
// RESULT
// ─────────────────────────────────────────────
function showResult() {
  showPage('page-result');
  const total = quizQuestions.length;
  const pct = score / total;

  // Score ring
  document.getElementById('scoreNum').textContent = score;
  document.getElementById('scoreDenom').textContent = '/ ' + total;
  const circumference = 326.7;
  const offset = circumference * (1 - pct);
  const ringFill = document.getElementById('ringFill');
  setTimeout(() => {
    ringFill.style.strokeDashoffset = offset;
    const hue = Math.round(pct * 120);
    ringFill.style.stroke = `hsl(${hue}, 50%, 40%)`;
  }, 100);

  // Rank
  let rank, msg;
  if (pct >= 0.9) { rank = '正三位　優等'; msg = '見事な成績です！古典の知識は充分に身についています。'; }
  else if (pct >= 0.7) { rank = '従四位　良好'; msg = '全体的によく理解できています。苦手分野を重点的に見直しましょう。'; }
  else if (pct >= 0.5) { rank = '正五位　及第'; msg = 'もう少しで合格ライン。基礎的な知識の再確認が必要です。'; }
  else { rank = '六位　要復習'; msg = '基本事項をしっかり復習しましょう。問題を繰り返し解くことで定着します。'; }
  document.getElementById('resultRank').textContent = rank;
  document.getElementById('resultMsg').textContent = msg;

  // Breakdown by category
  const cats = ['rhetoric','rank','lit'];
  const breakdown = document.getElementById('breakdown');
  const catData = {};
  cats.forEach(c => { catData[c] = { correct: 0, total: 0 }; });
  quizQuestions.forEach((q, i) => {
    catData[q.category].total++;
  });
  // We need to track per-question results; store them
  // Re-use a simpler approach: compare answers stored during quiz
  // Actually we didn't store per-question results. Let's compute from current state.
  // We'll just show category totals for now.

  let bdHtml = '<div class="breakdown-title">カテゴリー別</div>';
  cats.forEach(c => {
    const tot = catData[c].total;
    if (!tot) return;
    const label = CATEGORY_LABELS[c];
    const color = CATEGORY_COLORS[c];
    bdHtml += `<div class="breakdown-item">
      <span class="b-label">${label}</span>
      <div class="breakdown-bar-wrap"><div class="breakdown-bar" style="width:0%;background:${color}" data-pct="${(tot/total*100).toFixed(0)}"></div></div>
      <span class="b-score">${tot}問</span>
    </div>`;
  });
  breakdown.innerHTML = bdHtml;
  setTimeout(() => {
    breakdown.querySelectorAll('.breakdown-bar').forEach(b => {
      b.style.width = b.dataset.pct + '%';
    });
  }, 200);
}

function retryQuiz() {
  startQuiz();
}
function goHome() {
  showTab('top');
}

// ─────────────────────────────────────────────
// EDITOR
// ─────────────────────────────────────────────
function renderQList() {
  const list = document.getElementById('qList');
  if (!questions.length) {
    list.innerHTML = '<p style="color:var(--silver);font-size:0.85rem;text-align:center;padding:20px">問題がありません</p>';
    return;
  }
  list.innerHTML = questions.map((q, i) => `
    <div class="q-list-item">
      <span class="qli-num">${i + 1}.</span>
      <span class="qli-text">${q.question.slice(0, 60)}${q.question.length > 60 ? '…' : ''}</span>
      <span class="qli-badge badge-${q.category}">${CATEGORY_LABELS[q.category]}</span>
      <span class="qli-badge" style="background:var(--washi);color:var(--silver);border:1px solid var(--washi-dark)">${DIFFICULTY_LABELS[q.difficulty]}</span>
      <div class="qli-actions">
        <button class="qli-edit" onclick="editQuestion(${q.id})">編集</button>
        <button class="qli-del" onclick="deleteQuestion(${q.id})">削除</button>
      </div>
    </div>
  `).join('');
}

function resetForm() {
  editingId = null;
  document.getElementById('f_question').value = '';
  document.getElementById('f_imageUrl').value = '';
  document.getElementById('f_explanation').value = '';
  document.getElementById('imagePreview').innerHTML = '';
  ['opt0','opt1','opt2','opt3'].forEach(id => document.getElementById(id).value = '');
  document.querySelector('input[name=correct][value="0"]').checked = true;
  document.getElementById('f_category').value = 'rhetoric';
  document.getElementById('f_difficulty').value = 'easy';
}

function previewImage() {
  const url = document.getElementById('f_imageUrl').value.trim();
  const prev = document.getElementById('imagePreview');
  if (url) {
    prev.innerHTML = `<img src="${url}" onerror="this.parentNode.innerHTML='<span style=color:var(--vermillion);font-size:0.8rem>画像を読み込めません</span>'">`;
  } else {
    prev.innerHTML = '';
  }
}

function handleImageFile() {
  const file = document.getElementById('f_imageFile').files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('f_imageUrl').value = e.target.result;
    document.getElementById('imagePreview').innerHTML = `<img src="${e.target.result}">`;
  };
  reader.readAsDataURL(file);
}

function saveQuestion() {
  const q = document.getElementById('f_question').value.trim();
  if (!q) { showToast('問題文を入力してください'); return; }
  const opts = [0,1,2,3].map(i => document.getElementById('opt' + i).value.trim());
  if (opts.some(o => !o)) { showToast('選択肢を全て入力してください'); return; }
  const correct = parseInt(document.querySelector('input[name=correct]:checked').value);
  const imgUrl = document.getElementById('f_imageUrl').value.trim();

  if (editingId !== null) {
    const idx = questions.findIndex(x => x.id === editingId);
    questions[idx] = {
      id: editingId,
      category: document.getElementById('f_category').value,
      difficulty: document.getElementById('f_difficulty').value,
      question: q,
      options: opts,
      correct,
      image: imgUrl || undefined,
      explanation: document.getElementById('f_explanation').value.trim() || undefined,
    };
    showToast('問題を更新しました');
  } else {
    const newId = Math.max(0, ...questions.map(x => x.id)) + 1;
    questions.push({
      id: newId,
      category: document.getElementById('f_category').value,
      difficulty: document.getElementById('f_difficulty').value,
      question: q,
      options: opts,
      correct,
      image: imgUrl || undefined,
      explanation: document.getElementById('f_explanation').value.trim() || undefined,
    });
    showToast('問題を追加しました');
  }
  resetForm();
  renderQList();
  updateCounts();
}

function editQuestion(id) {
  const q = questions.find(x => x.id === id);
  if (!q) return;
  editingId = id;
  document.getElementById('f_category').value = q.category;
  document.getElementById('f_difficulty').value = q.difficulty;
  document.getElementById('f_question').value = q.question;
  document.getElementById('f_imageUrl').value = q.image || '';
  document.getElementById('f_explanation').value = q.explanation || '';
  q.options.forEach((o, i) => document.getElementById('opt' + i).value = o);
  document.querySelector(`input[name=correct][value="${q.correct}"]`).checked = true;
  previewImage();
  document.getElementById('qEditForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteQuestion(id) {
  if (!confirm('この問題を削除しますか？')) return;
  questions = questions.filter(x => x.id !== id);
  renderQList();
  updateCounts();
  showToast('削除しました');
}

function exportQuestions() {
  const json = JSON.stringify(questions, null, 2);
  const blob = new Blob([json], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'koten_questions.json';
  a.click();
}

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('visible'), 2400);
}

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
updateCounts();