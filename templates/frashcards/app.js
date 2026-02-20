// ═══════════════════════════════════════════════
// app.js — フラッシュカード エンジン（汎用）
// config.js の APP_CONFIG を読み込んで動作します
// ═══════════════════════════════════════════════

// ── Config から取得 ──────────────────────────────
const CAT_LABELS = Object.fromEntries(
  Object.entries(APP_CONFIG.categories).map(([k, v]) => [k, v.label])
);

// ── カテゴリバッジのCSSを動的生成 ─────────────────
function injectCategoryStyles() {
  const style = document.createElement('style');
  style.textContent = Object.entries(APP_CONFIG.categories).map(([key, cat]) => {
    const hex = cat.color;
    return `
      .badge-${key} {
        background: ${hexToRgba(hex, 0.1)};
        color: ${hex};
        border: 1px solid ${hexToRgba(hex, 0.35)};
      }
    `;
  }).join('');
  document.head.appendChild(style);
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── タイトル挿入 ─────────────────────────────────
function applyConfigToDOM() {
  const titleMain = document.querySelector('.title-main');
  const titleKana = document.querySelector('.title-kana');
  const titleSub  = document.querySelector('.title-sub');
  if (titleMain) titleMain.textContent = APP_CONFIG.title;
  if (titleKana) titleKana.textContent = APP_CONFIG.titleKana;
  if (titleSub)  titleSub.textContent  = APP_CONFIG.titleSub;
  document.title = APP_CONFIG.title + 'カード';

  // カテゴリ選択ボタンを動的生成
  const catsDiv = document.querySelector('.start-cats');
  if (catsDiv) {
    const mixBtn = `<button class="start-cat active" data-start-cat="mix">Mix mode</button>`;
    const catBtns = Object.entries(APP_CONFIG.categories).map(([key, cat]) =>
      `<button class="start-cat" data-start-cat="${key}">${cat.label}</button>`
    ).join('');
    catsDiv.innerHTML = mixBtn + catBtns;
  }
}

// ── Supabase 設定 ────────────────────────────────
let sbUrl = (APP_CONFIG.supabaseUrl     || '').trim().replace(/\/$/, '');
let sbKey = (APP_CONFIG.supabaseAnonKey || '').trim();
const SB_TABLE = APP_CONFIG.tableName || 'flashcard_questions';

// ── State ────────────────────────────────────────
let allQuestions = [...APP_CONFIG.defaultQuestions];
let deck    = [];
let deckIdx = 0;
let isFlipped = false;
let isCardTransitioning = false;
let mastery = {};
let selectedCategory = 'mix';
let selectedQuestionCount = '20';
const CARD_SWAP_OUT_MS = 160;
const CARD_SWAP_IN_MS = 220;

// ══════════════════════════════════════════════
// MODE SWITCH
// ══════════════════════════════════════════════
function switchMode(mode) {
  document.querySelectorAll('.mode-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.h-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('mode-' + mode).classList.add('active');
  document.getElementById('htab-' + mode).classList.add('active');
  if (mode === 'editor') renderQList();
}

// ══════════════════════════════════════════════
// SUPABASE
// ══════════════════════════════════════════════
function hasSupabaseConfig() {
  return !!(sbUrl && sbKey);
}

function setSbStatus(type, msg) {
  const el = document.getElementById('sbStatus');
  el.textContent = msg;
  el.className = 'sb-status' + (type ? ' ' + type : '');
}

async function syncSupabase() {
  await connectSupabase(true);
}

async function connectSupabase(showFeedback = false) {
  if (!hasSupabaseConfig()) {
    setSbStatus('err', 'config.js に Supabase 設定がありません');
    if (showFeedback) showToast('Supabase 設定が未入力です');
    return false;
  }
  setSbStatus('', '接続中…');
  try {
    const data = await sbFetch('GET', `/rest/v1/${SB_TABLE}?select=*&order=id`);
    allQuestions = data.map(normalizeRow);
    setSbStatus('ok', `接続済み（${allQuestions.length}件）`);
    showBanner(`Supabase から ${allQuestions.length} 件の問題を読み込みました`);
    if (isStartVisible()) updateStartMeta();
    else buildDeck();
    renderQList();
    if (showFeedback) showToast('Supabase を再読み込みしました');
    return true;
  } catch (e) {
    setSbStatus('err', 'エラー: ' + e.message);
    if (showFeedback) showToast('接続エラー: ' + e.message);
    return false;
  }
}

async function sbFetch(method, path, body) {
  const res = await fetch(sbUrl + path, {
    method,
    headers: {
      'apikey': sbKey,
      'Authorization': 'Bearer ' + sbKey,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : '',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || res.statusText);
  }
  return res.status === 204 ? null : res.json();
}

function normalizeRow(r) {
  return {
    id:          r.id,
    category:    r.category,
    question:    r.question,
    answer:      r.answer,
    explanation: r.explanation || '',
    image_url:   r.image_url   || '',
  };
}

// ══════════════════════════════════════════════
// BANNER
// ══════════════════════════════════════════════
function showBanner(msg) {
  document.getElementById('sbBannerText').textContent = msg;
  document.getElementById('sbBanner').style.display = '';
}
function closeBanner() {
  document.getElementById('sbBanner').style.display = 'none';
}

// ══════════════════════════════════════════════
// DECK
// ══════════════════════════════════════════════
function buildDeck(keepOrder = false) {
  const pool0 = allQuestions.filter(q =>
    selectedCategory === 'mix' || q.category === selectedCategory
  );
  let pool = [...pool0];
  if (selectedQuestionCount !== 'all') {
    const count = Math.min(Number(selectedQuestionCount), pool.length);
    pool = shuffle(pool).slice(0, count);
  }
  deck    = keepOrder ? [...pool] : shuffle([...pool]);
  deckIdx = 0;
  isFlipped = false;
  renderCard();
  renderDots();
  renderList();
}

function shuffleDeck() { buildDeck(false); }
function restartDeck() {
  document.getElementById('completeOverlay').style.display = 'none';
  openStartScreen();
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

function setStartCategory(category) {
  selectedCategory = category;
  document.querySelectorAll('[data-start-cat]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.startCat === category);
  });
  updateStartMeta();
}

function openStartScreen() {
  mastery = {};
  document.getElementById('startOverlay').style.display = 'flex';
  updateStartMeta();
}

function startStudy() {
  document.getElementById('startOverlay').style.display = 'none';
  document.getElementById('completeOverlay').style.display = 'none';
  mastery = {};
  buildDeck();
}

function updateStartMeta() {
  const filtered = allQuestions.filter(q =>
    selectedCategory === 'mix' || q.category === selectedCategory
  );
  const count = selectedQuestionCount === 'all'
    ? filtered.length
    : Math.min(Number(selectedQuestionCount), filtered.length);
  document.getElementById('startMeta').textContent =
    `出題: ${count}問 / 対象データ: ${filtered.length}問`;
}

function initStartScreen() {
  // カテゴリボタンはDOM生成後にイベントを委譲
  document.querySelector('.start-cats').addEventListener('click', e => {
    const btn = e.target.closest('[data-start-cat]');
    if (btn) setStartCategory(btn.dataset.startCat);
  });

  document.getElementById('startCount').addEventListener('change', e => {
    selectedQuestionCount = e.target.value;
    updateStartMeta();
  });

  selectedQuestionCount = document.getElementById('startCount').value;
  setStartCategory('mix');
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
    document.getElementById('cardQuestion').textContent = '該当する問題がありません';
    document.getElementById('cardAnswer').textContent   = '';
    document.getElementById('cardExplanation').textContent = '';
    document.getElementById('deckIndicator').textContent = '0 / 0';
    return;
  }

  const q = deck[deckIdx];
  const total = deck.length;

  document.getElementById('progressFill').style.width = ((deckIdx + 1) / total * 100) + '%';
  document.getElementById('deckIndicator').textContent = (deckIdx + 1) + ' / ' + total;
  document.getElementById('prevBtn').disabled = deckIdx === 0;
  document.getElementById('nextBtn').disabled = deckIdx === total - 1;

  const catLabel = APP_CONFIG.categories[q.category]?.label ?? q.category;
  const fb = document.getElementById('frontBadge');
  fb.textContent = catLabel;
  fb.className   = 'face-badge badge-' + q.category;
  const bb = document.getElementById('backBadge');
  bb.textContent = catLabel;
  bb.className   = 'face-badge back-badge badge-' + q.category;

  const img = document.getElementById('cardImage');
  if (q.image_url) { img.src = q.image_url; img.style.display = 'block'; }
  else             { img.style.display = 'none'; }

  document.getElementById('cardQuestion').textContent    = q.question;
  document.getElementById('cardAnswer').textContent      = q.answer;
  document.getElementById('cardExplanation').textContent = q.explanation || '';

  renderDots();
  renderList();
}

// ── Dots ──
function renderDots() {
  const row = document.getElementById('masteryDots');
  if (deck.length > 60) { row.innerHTML = ''; return; }
  row.innerHTML = deck.map((q, i) => {
    const m = mastery[q.id] || '';
    return `<div class="m-dot ${m} ${i === deckIdx ? 'current' : ''}" title="${q.answer}"></div>`;
  }).join('');
}

// ══════════════════════════════════════════════
// FLIP
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

function transitionToCard(targetIdx, direction = 1) {
  if (!deck.length) return;
  if (targetIdx < 0 || targetIdx >= deck.length) return;
  if (targetIdx === deckIdx) return;
  if (isCardTransitioning) return;

  const scene = document.querySelector('.card-scene');
  const body = document.getElementById('cardBody');
  if (!scene || !body) {
    deckIdx = targetIdx;
    renderCard();
    return;
  }

  isCardTransitioning = true;
  scene.classList.add('is-swapping');
  body.classList.remove('swap-out-left', 'swap-out-right', 'swap-in-left', 'swap-in-right');

  const outClass = direction >= 0 ? 'swap-out-left' : 'swap-out-right';
  const inClass  = direction >= 0 ? 'swap-in-right' : 'swap-in-left';

  body.classList.add(outClass);
  setTimeout(() => {
    body.classList.remove(outClass);
    deckIdx = targetIdx;
    renderCard();
    void body.offsetWidth;
    body.classList.add(inClass);

    setTimeout(() => {
      body.classList.remove(inClass);
      scene.classList.remove('is-swapping');
      isCardTransitioning = false;
    }, CARD_SWAP_IN_MS);
  }, CARD_SWAP_OUT_MS);
}

// ══════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════
function nextCard() {
  if (isCardTransitioning) return;
  if (deckIdx < deck.length - 1) transitionToCard(deckIdx + 1, 1);
  else showComplete();
}
function prevCard() {
  if (isCardTransitioning) return;
  if (deckIdx > 0) transitionToCard(deckIdx - 1, -1);
}

// ══════════════════════════════════════════════
// MASTERY
// ══════════════════════════════════════════════
function markCard(level) {
  if (!isFlipped || !deck.length || isCardTransitioning) return;
  mastery[deck[deckIdx].id] = level;
  renderDots(); renderList();

  const idxMap = { forgot: 0, unsure: 1, knew: 2 };
  const btn = document.querySelectorAll('.mastery-btn')[idxMap[level]];
  btn.style.transform = 'scale(0.91)';
  setTimeout(() => { btn.style.transform = ''; }, 120);

  setTimeout(() => {
    if (deckIdx < deck.length - 1) transitionToCard(deckIdx + 1, 1);
    else showComplete();
  }, 230);
}

// ══════════════════════════════════════════════
// COMPLETE OVERLAY
// ══════════════════════════════════════════════
function showComplete() {
  const total   = deck.length;
  const knew    = Object.values(mastery).filter(v => v === 'knew').length;
  const unsure  = Object.values(mastery).filter(v => v === 'unsure').length;
  const forgot  = Object.values(mastery).filter(v => v === 'forgot').length;
  const unknown = total - knew - unsure - forgot;

  document.getElementById('completeStats').innerHTML = `
    <div class="stat-pill sp-knew">
      <span class="sp-n">${knew}</span><span class="sp-l">わかった</span>
    </div>
    <div class="stat-pill sp-unsure">
      <span class="sp-n">${unsure}</span><span class="sp-l">あやふや</span>
    </div>
    <div class="stat-pill sp-forgot">
      <span class="sp-n">${forgot}</span><span class="sp-l">わからない</span>
    </div>
    ${unknown > 0 ? `<div class="stat-pill"><span class="sp-n">${unknown}</span><span class="sp-l">未確認</span></div>` : ''}
  `;
  document.getElementById('completeOverlay').style.display = 'flex';
}

function reviewWeak() {
  document.getElementById('completeOverlay').style.display = 'none';
  const weak = deck.filter(q => mastery[q.id] !== 'knew');
  if (!weak.length) { showToast('すべて「わかった」です！'); restartDeck(); return; }
  deck = shuffle(weak);
  deckIdx = 0;
  renderCard(); renderList();
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
    const m   = mastery[q.id] || '';
    const txt = q.question.length > 38 ? q.question.slice(0, 38) + '…' : q.question;
    return `<div class="list-item ${i === deckIdx ? 'current' : ''}" onclick="jumpTo(${i})">
      <span class="li-n">${i + 1}</span>
      <span class="li-d ${m}"></span>
      <span class="li-t">${txt}</span>
    </div>`;
  }).join('');
  const cur = body.querySelector('.current');
  if (cur) cur.scrollIntoView({ block: 'nearest' });
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
    case 'Space':      e.preventDefault(); flipCard();           break;
    case 'ArrowRight': nextCard();                               break;
    case 'ArrowLeft':  prevCard();                               break;
    case 'Digit1':     if (isFlipped) markCard('forgot');        break;
    case 'Digit2':     if (isFlipped) markCard('unsure');        break;
    case 'Digit3':     if (isFlipped) markCard('knew');          break;
  }
});

// ══════════════════════════════════════════════
// EDITOR — FORM
// ══════════════════════════════════════════════
let editingId = null;

function buildCategoryOptions(selectedValue = '') {
  return Object.entries(APP_CONFIG.categories).map(([key, cat]) =>
    `<option value="${key}" ${key === selectedValue ? 'selected' : ''}>${cat.label}</option>`
  ).join('');
}

function initEditorCategorySelect() {
  const sel = document.getElementById('f_category');
  if (sel) sel.innerHTML = buildCategoryOptions();
}

function resetForm() {
  editingId = null;
  document.getElementById('formTitle').textContent = '問題を追加';
  const firstCat = Object.keys(APP_CONFIG.categories)[0] || '';
  document.getElementById('f_category').innerHTML = buildCategoryOptions(firstCat);
  document.getElementById('f_question').value    = '';
  document.getElementById('f_answer').value      = '';
  document.getElementById('f_explanation').value = '';
  document.getElementById('f_imageUrl').value    = '';
  document.getElementById('imagePreview').innerHTML = '';
  document.getElementById('f_imageFile').value   = '';
}

function previewImage() {
  const url  = document.getElementById('f_imageUrl').value.trim();
  const prev = document.getElementById('imagePreview');
  prev.innerHTML = url
    ? `<img src="${url}" onerror="this.parentNode.innerHTML='<span style=color:var(--vermillion);font-size:0.76rem>画像を読み込めません</span>'">`
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
  if (!answer)   { showToast('答えを入力してください'); return; }

  const obj = { category, question, answer, explanation, image_url };

  if (hasSupabaseConfig()) {
    try {
      if (editingId !== null) {
        await sbFetch('PATCH', `/rest/v1/${SB_TABLE}?id=eq.${editingId}`, obj);
        const idx = allQuestions.findIndex(q => q.id === editingId);
        allQuestions[idx] = { id: editingId, ...obj };
        showToast('Supabase に更新しました');
      } else {
        const [row] = await sbFetch('POST', `/rest/v1/${SB_TABLE}`, obj);
        allQuestions.push(normalizeRow(row));
        showToast('Supabase に保存しました');
      }
    } catch (e) {
      showToast('Supabase エラー: ' + e.message); return;
    }
  } else {
    if (editingId !== null) {
      const idx = allQuestions.findIndex(q => q.id === editingId);
      allQuestions[idx] = { id: editingId, ...obj };
      showToast('更新しました（ローカル）');
    } else {
      const newId = Math.max(0, ...allQuestions.map(q => q.id)) + 1;
      allQuestions.push({ id: newId, ...obj });
      showToast('追加しました（ローカル）');
    }
  }

  resetForm();
  buildDeck();
  renderQList();
}

function editQuestion(id) {
  const q = allQuestions.find(x => x.id === id);
  if (!q) return;
  editingId = id;
  document.getElementById('formTitle').textContent = '問題を編集';
  document.getElementById('f_category').innerHTML  = buildCategoryOptions(q.category);
  document.getElementById('f_question').value    = q.question;
  document.getElementById('f_answer').value      = q.answer;
  document.getElementById('f_explanation').value = q.explanation || '';
  document.getElementById('f_imageUrl').value    = q.image_url   || '';
  previewImage();
  document.querySelector('.q-form').scrollIntoView({ behavior: 'smooth' });
}

async function deleteQuestion(id) {
  if (!confirm('この問題を削除しますか？')) return;
  if (hasSupabaseConfig()) {
    try {
      await sbFetch('DELETE', `/rest/v1/${SB_TABLE}?id=eq.${id}`);
    } catch (e) {
      showToast('削除エラー: ' + e.message); return;
    }
  }
  allQuestions = allQuestions.filter(q => q.id !== id);
  buildDeck();
  renderQList();
  showToast('削除しました');
}

function renderQList() {
  const list  = document.getElementById('qList');
  const count = document.getElementById('qListCount');
  count.textContent = allQuestions.length + '件';
  if (!allQuestions.length) {
    list.innerHTML = '<p style="color:var(--silver);font-size:0.8rem;padding:12px 0">問題がありません</p>';
    return;
  }
  list.innerHTML = allQuestions.map((q, i) => `
    <div class="q-list-item">
      <span class="qli-n">${i + 1}</span>
      <span class="qli-t">${q.question.length > 50 ? q.question.slice(0,50)+'…' : q.question}</span>
      <span class="qli-badge badge-${q.category}">${APP_CONFIG.categories[q.category]?.label ?? q.category}</span>
      <div class="qli-actions">
        <button class="qli-edit" onclick="editQuestion(${q.id})">編集</button>
        <button class="qli-del"  onclick="deleteQuestion(${q.id})">削除</button>
      </div>
    </div>
  `).join('');
}

// ══════════════════════════════════════════════
// EXPORT
// ══════════════════════════════════════════════
function exportCSV() {
  const header = 'id,category,question,answer,explanation,image_url';
  const rows = allQuestions.map(q => [
    q.id, q.category,
    csvEscape(q.question), csvEscape(q.answer),
    csvEscape(q.explanation || ''), csvEscape(q.image_url || ''),
  ].join(','));
  download(SB_TABLE + '.csv', [header, ...rows].join('\n'), 'text/csv;charset=utf-8');
}

function exportJSON() {
  download(SB_TABLE + '.json', JSON.stringify(allQuestions, null, 2), 'application/json');
}

function csvEscape(s) {
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function download(filename, content, mime) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\uFEFF' + content], { type: mime }));
  a.download = filename;
  a.click();
}

// ══════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════
let _toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('visible'), 2400);
}

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
injectCategoryStyles();  // カテゴリバッジのCSSをconfigから生成
applyConfigToDOM();      // タイトル・カテゴリボタンをDOMに反映
initStartScreen();       // スタート画面を初期化
initEditorCategorySelect();
if (hasSupabaseConfig()) connectSupabase(false);
