// ═══════════════════════════════════════════════
// app.js — 古典常識カード
// ═══════════════════════════════════════════════

const SUPABASE_URL = 'https://gjuqsyaugrsshmjerhme.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdXFzeWF1Z3Jzc2htamVyaG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NzA3NTYsImV4cCI6MjA4MjA0Njc1Nn0.V8q5ddz5tPy7wBaQ73aGtmCZyqzA6pPciPRwRIZjJcs';

// ── State ──
let CAT_LABELS   = {};   // { key: label } — Supabase から動的構築
let allQuestions = [];
let deck         = [];
let deckIdx      = 0;
let isFlipped    = false;
let isCardTransitioning = false;
let mastery      = {};
let selectedCategory      = 'mix';
let selectedQuestionCount = '20';

const CARD_SWAP_OUT_MS = 140;
const CARD_SWAP_IN_MS  = 180;

// ══════════════════════════════════════════════
// SUPABASE
// ══════════════════════════════════════════════
async function sbFetch(path) {
  const res = await fetch(SUPABASE_URL + path, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || res.statusText);
  return res.json();
}

async function sbPost(path, body) {
  const res = await fetch(SUPABASE_URL + path, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json', 'Prefer': 'return=representation',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || res.statusText);
  return res.json();
}

function normalizeRow(r) {
  return { id: r.id, category: r.category, question: r.question,
           answer: r.answer, explanation: r.explanation || '', image_url: r.image_url || '' };
}

function setSbStatus(type, msg) {
  const el = document.getElementById('sbStatus');
  el.textContent = msg;
  el.className = 'sb-status' + (type ? ' ' + type : '');
}

// ── 初回ロード：categories + questions を並列取得 ──
async function loadAll() {
  setSbStatus('', '読み込み中…');
  try {
    const [cats, qs] = await Promise.all([
      sbFetch('/rest/v1/koten_categories?select=key,label,sort&order=sort'),
      sbFetch('/rest/v1/koten_questions?select=*&order=id'),
    ]);
    CAT_LABELS = {};
    cats.forEach(c => { CAT_LABELS[c.key] = c.label; });
    allQuestions = qs.map(normalizeRow);
    setSbStatus('ok', `${allQuestions.length}件`);
    buildStartCats();
    buildCategorySelect();
    updateStartMeta();
  } catch (e) {
    setSbStatus('err', 'エラー: ' + e.message);
    showToast('読み込みエラー: ' + e.message);
  }
}

// ── スタート画面カテゴリボタンを動的生成 ──
function buildStartCats() {
  const wrap = document.getElementById('startCats');
  wrap.innerHTML = '';
  [['mix', 'Mix mode'], ...Object.entries(CAT_LABELS)].forEach(([key, label]) => {
    const btn = document.createElement('button');
    btn.className = 'start-cat' + (key === selectedCategory ? ' active' : '');
    btn.dataset.startCat = key;
    btn.textContent = label;
    btn.addEventListener('click', () => setStartCategory(key));
    wrap.appendChild(btn);
  });
}

// ── エディタ select を動的生成 ──
function buildCategorySelect() {
  const sel = document.getElementById('f_category');
  sel.innerHTML = '';
  Object.entries(CAT_LABELS).forEach(([key, label]) => {
    const opt = document.createElement('option');
    opt.value = key; opt.textContent = label;
    sel.appendChild(opt);
  });
}

// ══════════════════════════════════════════════
// DECK
// ══════════════════════════════════════════════
function buildDeck() {
  let src = allQuestions.filter(q => selectedCategory === 'mix' || q.category === selectedCategory);
  if (selectedQuestionCount !== 'all') {
    const n = Math.min(Number(selectedQuestionCount), src.length);
    src = shuffle([...src]).slice(0, n);
  }
  deck = shuffle([...src]);
  deckIdx = 0; isFlipped = false;
  renderCard(); renderDots(); renderList();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isStartVisible() {
  return document.getElementById('startOverlay').style.display !== 'none';
}

function setStartCategory(cat) {
  selectedCategory = cat;
  document.querySelectorAll('[data-start-cat]').forEach(b =>
    b.classList.toggle('active', b.dataset.startCat === cat));
  updateStartMeta();
}

function openStartScreen() {
  mastery = {};
  document.getElementById('startOverlay').style.display = 'flex';
  updateStartMeta();
}

function startStudy() {
  if (!allQuestions.length) { showToast('問題が読み込まれていません'); return; }
  document.getElementById('startOverlay').style.display = 'none';
  document.getElementById('completeOverlay').style.display = 'none';
  mastery = {};
  buildDeck();
}

function updateStartMeta() {
  const filtered = allQuestions.filter(q => selectedCategory === 'mix' || q.category === selectedCategory);
  const count = selectedQuestionCount === 'all'
    ? filtered.length : Math.min(Number(selectedQuestionCount), filtered.length);
  document.getElementById('startMeta').textContent =
    `出題: ${count}問 / 対象データ: ${filtered.length}問`;
}

function initStartScreen() {
  document.getElementById('startCount').addEventListener('change', e => {
    selectedQuestionCount = e.target.value; updateStartMeta();
  });
  selectedQuestionCount = document.getElementById('startCount').value;
  openStartScreen();
}

// ══════════════════════════════════════════════
// RENDER CARD
// ══════════════════════════════════════════════
function renderCard() {
  const body = document.getElementById('cardBody');
  body.classList.add('no-flip-transition');
  body.classList.remove('flipped');
  void body.offsetWidth;
  body.classList.remove('no-flip-transition');
  isFlipped = false;
  setMasteryActive(false);

  if (!deck.length) {
    document.getElementById('cardQuestion').textContent    = '該当する問題がありません';
    document.getElementById('cardAnswer').textContent      = '';
    document.getElementById('cardExplanation').textContent = '';
    document.getElementById('deckIndicator').textContent   = '0 / 0';
    return;
  }

  const q = deck[deckIdx], total = deck.length;
  const label = CAT_LABELS[q.category] || q.category;

  document.getElementById('progressFill').style.width = ((deckIdx + 1) / total * 100) + '%';
  document.getElementById('deckIndicator').textContent = (deckIdx + 1) + ' / ' + total;
  document.getElementById('prevBtn').disabled = deckIdx === 0;
  document.getElementById('nextBtn').disabled = deckIdx === total - 1;

  const fb = document.getElementById('frontBadge');
  fb.textContent = label; fb.className = 'face-badge badge-cat badge-' + q.category;
  document.getElementById('backBadge').textContent = label;

  const img = document.getElementById('cardImage');
  if (q.image_url) { img.src = q.image_url; img.style.display = 'block'; }
  else img.style.display = 'none';

  document.getElementById('cardQuestion').textContent    = q.question;
  document.getElementById('cardAnswer').textContent      = q.answer;
  document.getElementById('cardExplanation').textContent = q.explanation || '';

  renderDots(); renderList();
}

function renderDots() {
  const row = document.getElementById('masteryDots');
  if (deck.length > 60) { row.innerHTML = ''; return; }
  row.innerHTML = deck.map((q, i) =>
    `<div class="m-dot ${mastery[q.id] || ''} ${i === deckIdx ? 'current' : ''}"></div>`
  ).join('');
}

// ══════════════════════════════════════════════
// FLIP / TRANSITION
// ══════════════════════════════════════════════
function flipCard() {
  if (!deck.length || isCardTransitioning) return;
  isFlipped = !isFlipped;
  document.getElementById('cardBody').classList.toggle('flipped', isFlipped);
  setMasteryActive(isFlipped);
}

function setMasteryActive(on) {
  document.querySelectorAll('.mastery-btn').forEach(b => b.classList.toggle('active', on));
}

function transitionToCard(targetIdx, dir = 1) {
  if (!deck.length || targetIdx < 0 || targetIdx >= deck.length) return;
  if (targetIdx === deckIdx || isCardTransitioning) return;
  const scene = document.querySelector('.card-scene');
  if (!scene) { deckIdx = targetIdx; renderCard(); return; }

  isCardTransitioning = true;
  scene.classList.add('is-swapping');
  const outC = dir >= 0 ? 'swap-out-left' : 'swap-out-right';
  const inC  = dir >= 0 ? 'swap-in-right' : 'swap-in-left';
  scene.classList.add(outC);
  setTimeout(() => {
    scene.classList.remove(outC);
    deckIdx = targetIdx; renderCard();
    void scene.offsetWidth;
    scene.classList.add(inC);
    setTimeout(() => {
      scene.classList.remove(inC, 'is-swapping');
      isCardTransitioning = false;
    }, CARD_SWAP_IN_MS);
  }, CARD_SWAP_OUT_MS);
}

// ══════════════════════════════════════════════
// NAVIGATION / MASTERY
// ══════════════════════════════════════════════
function nextCard() { if (!isCardTransitioning) deckIdx < deck.length - 1 ? transitionToCard(deckIdx + 1, 1) : showComplete(); }
function prevCard() { if (!isCardTransitioning && deckIdx > 0) transitionToCard(deckIdx - 1, -1); }

function markCard(level) {
  if (!isFlipped || !deck.length || isCardTransitioning) return;
  mastery[deck[deckIdx].id] = level;
  renderDots(); renderList();
  const btn = document.querySelectorAll('.mastery-btn')[{ forgot:0, unsure:1, knew:2 }[level]];
  btn.style.transform = 'scale(0.91)';
  setTimeout(() => { btn.style.transform = ''; }, 120);
  setTimeout(() => deckIdx < deck.length - 1 ? transitionToCard(deckIdx + 1, 1) : showComplete(), 230);
}

// ══════════════════════════════════════════════
// COMPLETE
// ══════════════════════════════════════════════
function showComplete() {
  const total = deck.length;
  const knew  = Object.values(mastery).filter(v => v === 'knew').length;
  const unsure= Object.values(mastery).filter(v => v === 'unsure').length;
  const forgot= Object.values(mastery).filter(v => v === 'forgot').length;
  const unk   = total - knew - unsure - forgot;
  document.getElementById('completeStats').innerHTML = `
    <div class="stat-pill sp-knew"><span class="sp-n">${knew}</span><span class="sp-l">わかった</span></div>
    <div class="stat-pill sp-unsure"><span class="sp-n">${unsure}</span><span class="sp-l">あやふや</span></div>
    <div class="stat-pill sp-forgot"><span class="sp-n">${forgot}</span><span class="sp-l">わからない</span></div>
    ${unk > 0 ? `<div class="stat-pill"><span class="sp-n">${unk}</span><span class="sp-l">未確認</span></div>` : ''}
  `;
  document.getElementById('completeOverlay').style.display = 'flex';
}

function reviewWeak() {
  document.getElementById('completeOverlay').style.display = 'none';
  const weak = deck.filter(q => mastery[q.id] !== 'knew');
  if (!weak.length) { showToast('すべて「わかった」です！'); openStartScreen(); return; }
  deck = shuffle(weak); deckIdx = 0;
  renderCard(); renderList();
}

function restartDeck() {
  document.getElementById('completeOverlay').style.display = 'none';
  openStartScreen();
}

// ══════════════════════════════════════════════
// SIDE LIST
// ══════════════════════════════════════════════
let listOpen = false;
function toggleList() {
  listOpen = !listOpen;
  document.getElementById('listPanel').classList.toggle('open', listOpen);
  document.getElementById('listArrow').innerHTML = listOpen ? '&#x2039;' : '&#x203A;';
}

function renderList() {
  const body = document.getElementById('listBody');
  body.innerHTML = deck.map((q, i) => {
    const txt = q.question.length > 38 ? q.question.slice(0, 38) + '…' : q.question;
    return `<div class="list-item ${i === deckIdx ? 'current' : ''}" onclick="jumpTo(${i})">
      <span class="li-n">${i + 1}</span>
      <span class="li-d ${mastery[q.id] || ''}"></span>
      <span class="li-t">${txt}</span>
    </div>`;
  }).join('');
  body.querySelector('.current')?.scrollIntoView({ block: 'nearest' });
}

function jumpTo(idx) {
  if (isCardTransitioning) return;
  if (idx !== deckIdx) transitionToCard(idx, idx > deckIdx ? 1 : -1);
  if (window.innerWidth < 640) toggleList();
}

// ══════════════════════════════════════════════
// KEYBOARD
// ══════════════════════════════════════════════
document.addEventListener('keydown', e => {
  if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;
  switch (e.code) {
    case 'Space':      e.preventDefault(); flipCard();          break;
    case 'ArrowRight': nextCard();                              break;
    case 'ArrowLeft':  prevCard();                              break;
    case 'Digit1':     if (isFlipped) markCard('forgot');       break;
    case 'Digit2':     if (isFlipped) markCard('unsure');       break;
    case 'Digit3':     if (isFlipped) markCard('knew');         break;
  }
});

// ══════════════════════════════════════════════
// EDITOR
// ══════════════════════════════════════════════
function resetForm() {
  ['f_question','f_answer','f_explanation','f_imageUrl'].forEach(id =>
    document.getElementById(id).value = '');
  document.getElementById('imagePreview').innerHTML = '';
  document.getElementById('f_imageFile').value = '';
}

function previewImage() {
  const url = document.getElementById('f_imageUrl').value.trim();
  document.getElementById('imagePreview').innerHTML = url
    ? `<img src="${url}" onerror="this.parentNode.innerHTML='<span class=img-err>読み込めません</span>'">`
    : '';
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

async function saveQuestion() {
  const question    = document.getElementById('f_question').value.trim();
  const answer      = document.getElementById('f_answer').value.trim();
  const category    = document.getElementById('f_category').value;
  const explanation = document.getElementById('f_explanation').value.trim();
  const image_url   = document.getElementById('f_imageUrl').value.trim();

  if (!question) { showToast('問題文を入力してください'); return; }
  if (!answer)   { showToast('答えを入力してください');   return; }

  try {
    const [row] = await sbPost('/rest/v1/koten_questions', { category, question, answer, explanation, image_url });
    allQuestions.push(normalizeRow(row));
    showToast('保存しました');
    resetForm();
    renderQList();
  } catch (e) {
    showToast('保存エラー: ' + e.message);
  }
}

// ── アコーディオン形式の問題一覧 ──
function renderQList() {
  const list  = document.getElementById('qList');
  const count = document.getElementById('qListCount');
  count.textContent = allQuestions.length + '件';

  if (!allQuestions.length) {
    list.innerHTML = '<p class="qlist-empty">問題がありません</p>';
    return;
  }

  // CAT_LABELS の順序でグループ化
  const groups = {};
  Object.keys(CAT_LABELS).forEach(k => { groups[k] = []; });
  allQuestions.forEach(q => {
    if (!groups[q.category]) groups[q.category] = [];
    groups[q.category].push(q);
  });

  list.innerHTML = Object.entries(groups)
    .filter(([, qs]) => qs.length > 0)
    .map(([key, qs]) => `
      <details class="q-group">
        <summary class="q-group-header">
          <span class="qg-chevron">▶</span>
          <span class="qg-label">${CAT_LABELS[key] || key}</span>
          <span class="qg-count">${qs.length}問</span>
        </summary>
        <div class="q-group-body">
          ${qs.map((q, i) => `
            <div class="q-list-item">
              <span class="qli-n">${i + 1}</span>
              <span class="qli-t">${q.question.length > 55 ? q.question.slice(0,55)+'…' : q.question}</span>
            </div>
          `).join('')}
        </div>
      </details>
    `).join('');
}

// ══════════════════════════════════════════════
// EXPORT
// ══════════════════════════════════════════════
function exportCSV() {
  const rows = allQuestions.map(q =>
    [q.id, q.category, csvEsc(q.question), csvEsc(q.answer),
     csvEsc(q.explanation||''), csvEsc(q.image_url||'')].join(','));
  dl('koten_questions.csv',
    ['id,category,question,answer,explanation,image_url', ...rows].join('\n'),
    'text/csv;charset=utf-8');
}
function exportJSON() {
  dl('koten_questions.json', JSON.stringify(allQuestions, null, 2), 'application/json');
}
function csvEsc(s) { return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s; }
function dl(name, content, mime) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\uFEFF'+content], {type:mime}));
  a.download = name; a.click();
}

// ══════════════════════════════════════════════
// TOAST / MODE
// ══════════════════════════════════════════════
let _toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('visible'), 2400);
}

function switchMode(mode) {
  document.querySelectorAll('.mode-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.h-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('mode-' + mode).classList.add('active');
  document.getElementById('htab-' + mode).classList.add('active');
  if (mode === 'editor') renderQList();
}

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
initStartScreen();
loadAll();