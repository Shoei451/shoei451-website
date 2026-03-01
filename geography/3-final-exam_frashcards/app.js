// ══════════════════════════════════════════════
// app.js — フラッシュカード v2
// data.js の USE_SUPABASE で動作が分岐する
// ══════════════════════════════════════════════

// ─────────────────────────────────────────────
// 定数
// ─────────────────────────────────────────────
const SWAP_OUT_MS = 130;
const SWAP_IN_MS  = 170;

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
let allCards        = [];
let deck            = [];
let deckIdx         = 0;
let isFlipped       = false;
let isTransitioning = false;
let mastery         = {};
let listOpen        = false;
let shuffleOn       = false;

let selectedFilterId = 'all';
let selectedCount    = '20';

// Supabase 編集状態
let editingId = null;   // null = 新規, number = 編集中の id

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
(async function init() {
  setupModeUI();
  await loadCards();
  buildFilters();
  updateStartMeta();
  openStartScreen();
})();

// ─────────────────────────────────────────────
// モード UI セットアップ
// Supabase 無効時は Editor タブを非表示
// ─────────────────────────────────────────────
function setupModeUI() {
  const editorTab = document.getElementById('tab-editor');
  if (!USE_SUPABASE) {
    editorTab.style.display = 'none';
  }
}

// ─────────────────────────────────────────────
// カード読み込み（データソース分岐）
// ─────────────────────────────────────────────
async function loadCards(showStatus) {
  if (USE_SUPABASE) {
    await loadFromSupabase(showStatus);
  } else {
    // CARDS 配列をそのまま使う（Supabase 列名に合わせて正規化）
    allCards = CARDS.map((c, i) => ({
      id:          i,
      category:    c.category || 'default',
      q:           c.q,
      a:           c.a,
      sub:         c.sub  || '',
      image_url:   c.image_url || '',
      label:       c.category || 'default',
    }));
  }
}

// ─────────────────────────────────────────────
// Supabase: 取得
// ─────────────────────────────────────────────
async function loadFromSupabase(showStatus) {
  setStatus('読み込み中…', '');
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=*&order=id.asc`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    allCards = data.map(r => ({
      id:        r.id,
      category:  r.category || 'default',
      q:         r.question,
      a:         r.answer,
      sub:       r.explanation || '',
      image_url: r.image_url   || '',
      label:     r.category    || 'default',
    }));
    setStatus(`✓ ${allCards.length} 件取得`, 'ok');
    buildFilters();
    updateStartMeta();
    renderQList();
  } catch (e) {
    setStatus(`✗ ${e.message}`, 'err');
  }
}

function setStatus(msg, cls) {
  const el = document.getElementById('sbStatus');
  if (!el) return;
  el.textContent = msg;
  el.className   = 'sb-status ' + cls;
}

// ─────────────────────────────────────────────
// フィルター自動生成
// ─────────────────────────────────────────────
function buildFilters() {
  const cats = [...new Set(allCards.map(c => c.category))];
  const wrap  = document.getElementById('startCats');
  if (!wrap) return;

  const filters = [
    { id: 'all', label: 'すべて', match: () => true },
    ...cats.map(cat => ({ id: cat, label: cat, match: c => c.category === cat })),
  ];
  window._filters = filters;

  if (!filters.find(f => f.id === selectedFilterId)) selectedFilterId = 'all';

  wrap.innerHTML = filters.map(f => {
    const n = allCards.filter(f.match).length;
    return `<button class="start-cat ${f.id === selectedFilterId ? 'active' : ''}"
              data-filter="${f.id}" onclick="selectFilter('${f.id}')">
              ${f.label}
              <span style="font-size:0.65rem;opacity:0.65;margin-left:4px">${n}</span>
            </button>`;
  }).join('');
}

function selectFilter(id) {
  selectedFilterId = id;
  document.querySelectorAll('.start-cat').forEach(b =>
    b.classList.toggle('active', b.dataset.filter === id)
  );
  updateStartMeta();
}

// ─────────────────────────────────────────────
// Start screen
// ─────────────────────────────────────────────
function updateStartMeta() {
  const filter = (window._filters || []).find(f => f.id === selectedFilterId);
  const pool   = filter ? allCards.filter(filter.match) : allCards;
  const actual = selectedCount === 'all'
    ? pool.length
    : Math.min(Number(selectedCount), pool.length);
  const el = document.getElementById('startMeta');
  if (el) el.textContent = `出題: ${actual}問 ／ 対象: ${pool.length}問`;
}

document.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('startCount');
  if (sel) {
    sel.addEventListener('change', e => { selectedCount = e.target.value; updateStartMeta(); });
    selectedCount = sel.value;
  }
});

function openStartScreen() {
  mastery = {};
  const ov = document.getElementById('startOverlay');
  if (ov) ov.classList.remove('hidden');
  const co = document.getElementById('completeOverlay');
  if (co) co.style.display = 'none';
  updateStartMeta();
}

function startStudy() {
  const ov = document.getElementById('startOverlay');
  if (ov) ov.classList.add('hidden');
  mastery = {};
  buildDeck();
  switchMode('study', document.getElementById('tab-study'));
}

// ─────────────────────────────────────────────
// モード切り替え（学習 / 編集）
// ─────────────────────────────────────────────
function switchMode(mode, btn) {
  document.querySelectorAll('.h-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.mode-panel').forEach(p => p.style.display = 'none');
  const panel = document.getElementById('mode-' + mode);
  if (panel) panel.style.display = '';
  if (mode === 'editor') {
    renderQList();
  }
}

// ─────────────────────────────────────────────
// DECK
// ─────────────────────────────────────────────
function buildDeck() {
  const filter = (window._filters || []).find(f => f.id === selectedFilterId) || { match: () => true };
  const basePool = selectedFilterId === 'all'
    ? [...allCards]
    : allCards.filter(filter.match);
  const takeCount = selectedCount === 'all'
    ? basePool.length
    : Math.min(Number(selectedCount), basePool.length);

  deck = shuffleOn
    ? shuffle([...basePool]).slice(0, takeCount)
    : basePool.slice(0, takeCount);
  deckIdx = 0;
  isFlipped = false;
  renderCard();
  renderDots();
  renderList();
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─────────────────────────────────────────────
// カード描画
// ─────────────────────────────────────────────
function renderCard() {
  const body = document.getElementById('cardBody');
  body.classList.add('no-transition');
  body.classList.remove('flipped');
  void body.offsetWidth;
  body.classList.remove('no-transition');

  isFlipped = false;
  setMasteryActive(false);

  if (!deck.length) {
    document.getElementById('cardQuestion').textContent = '該当する問題がありません';
    document.getElementById('cardAnswer').textContent   = '';
    document.getElementById('cardSub').textContent      = '';
    document.getElementById('cardImg').style.display    = 'none';
    document.getElementById('deckIndicator').textContent = '0 / 0';
    updateProgress(0);
    return;
  }

  const card = deck[deckIdx];
  const col  = CATEGORY_STYLES[card.category] || CATEGORY_STYLES.default;

  // バッジ
  const fb = document.getElementById('frontBadge');
  fb.textContent      = card.label || card.category;
  fb.style.color      = col.text;
  fb.style.background = col.bg;
  fb.style.border     = `1px solid ${col.text}33`;

  const bb = document.getElementById('backBadge');
  bb.textContent = card.label || card.category;

  // 裏面カラー
  const back = document.getElementById('cardBack');
  back.style.setProperty('--card-back-color', col.card);
  back.style.background = col.card;

  // テキスト
  document.getElementById('cardQuestion').textContent = card.q;
  document.getElementById('cardAnswer').textContent   = card.a;
  document.getElementById('cardSub').textContent      = card.sub || '';

  // 画像
  const img = document.getElementById('cardImg');
  if (card.image_url) {
    img.src           = card.image_url;
    img.style.display = 'block';
  } else {
    img.style.display = 'none';
  }

  // ナビ
  const total = deck.length;
  document.getElementById('deckIndicator').textContent = `${deckIdx + 1} / ${total}`;
  document.getElementById('prevBtn').disabled = deckIdx === 0;
  document.getElementById('nextBtn').disabled = deckIdx === total - 1;
  updateProgress((deckIdx + 1) / total);

  renderDots();
  renderList();
}

function updateProgress(ratio) {
  document.getElementById('progressFill').style.width = (ratio * 100) + '%';
}

// ─────────────────────────────────────────────
// フリップ
// ─────────────────────────────────────────────
function flipCard() {
  if (!deck.length || isTransitioning) return;
  isFlipped = !isFlipped;
  document.getElementById('cardBody').classList.toggle('flipped', isFlipped);
  setMasteryActive(isFlipped);
}

function setMasteryActive(on) {
  document.querySelectorAll('.mastery-btn').forEach(b => b.classList.toggle('active', on));
}

// ─────────────────────────────────────────────
// トランジション
// ─────────────────────────────────────────────
function transitionToCard(targetIdx, direction) {
  if (!deck.length || isTransitioning) return;
  if (targetIdx < 0 || targetIdx >= deck.length) return;
  if (targetIdx === deckIdx) return;

  isTransitioning = true;
  const scene = document.getElementById('cardScene');
  scene.classList.add('is-swapping');
  scene.classList.remove('swap-out-left', 'swap-out-right', 'swap-in-left', 'swap-in-right');

  const outClass = direction >= 0 ? 'swap-out-left'  : 'swap-out-right';
  const inClass  = direction >= 0 ? 'swap-in-right'  : 'swap-in-left';

  scene.classList.add(outClass);
  setTimeout(() => {
    scene.classList.remove(outClass);
    deckIdx = targetIdx;
    renderCard();
    void scene.offsetWidth;
    scene.classList.add(inClass);
    setTimeout(() => {
      scene.classList.remove(inClass, 'is-swapping');
      isTransitioning = false;
    }, SWAP_IN_MS);
  }, SWAP_OUT_MS);
}

// ─────────────────────────────────────────────
// ナビゲーション
// ─────────────────────────────────────────────
function nextCard() {
  if (isTransitioning) return;
  if (deckIdx < deck.length - 1) transitionToCard(deckIdx + 1, 1);
  else showComplete();
}

function prevCard() {
  if (isTransitioning) return;
  if (deckIdx > 0) transitionToCard(deckIdx - 1, -1);
}

function jumpTo(idx) {
  if (isTransitioning || idx === deckIdx) return;
  transitionToCard(idx, idx > deckIdx ? 1 : -1);
  if (window.innerWidth < 640) toggleList();
}

// ─────────────────────────────────────────────
// 習得度マーキング
// ─────────────────────────────────────────────
function markCard(level) {
  if (!isFlipped || !deck.length || isTransitioning) return;
  mastery[deckIdx] = level;
  renderDots();
  renderList();

  const idxMap = { forgot: 0, unsure: 1, knew: 2 };
  const btn = document.querySelectorAll('.mastery-btn')[idxMap[level]];
  if (btn) {
    btn.style.transform = 'scale(0.91)';
    setTimeout(() => { btn.style.transform = ''; }, 130);
  }

  setTimeout(() => {
    if (deckIdx < deck.length - 1) transitionToCard(deckIdx + 1, 1);
    else showComplete();
  }, 240);
}

// ─────────────────────────────────────────────
// マスタリードット
// ─────────────────────────────────────────────
function renderDots() {
  const row = document.getElementById('masteryDots');
  if (!deck.length || deck.length > 60) { row.innerHTML = ''; return; }
  row.innerHTML = deck.map((_, i) => {
    const m = mastery[i] || '';
    return `<div class="m-dot ${m} ${i === deckIdx ? 'current' : ''}"></div>`;
  }).join('');
}

// ─────────────────────────────────────────────
// 完了画面
// ─────────────────────────────────────────────
function showComplete() {
  const total  = deck.length;
  const knew   = Object.values(mastery).filter(v => v === 'knew').length;
  const unsure = Object.values(mastery).filter(v => v === 'unsure').length;
  const forgot = Object.values(mastery).filter(v => v === 'forgot').length;
  const skip   = total - knew - unsure - forgot;

  document.getElementById('completeStats').innerHTML = `
    <div class="stat-pill sp-knew"><span class="sp-n">${knew}</span><span class="sp-l">わかった</span></div>
    <div class="stat-pill sp-unsure"><span class="sp-n">${unsure}</span><span class="sp-l">あやふや</span></div>
    <div class="stat-pill sp-forgot"><span class="sp-n">${forgot}</span><span class="sp-l">わからない</span></div>
    ${skip > 0 ? `<div class="stat-pill"><span class="sp-n">${skip}</span><span class="sp-l">未確認</span></div>` : ''}
  `;

  const catMap = {};
  deck.forEach((card, i) => {
    const cat = card.category;
    if (!catMap[cat]) catMap[cat] = { label: card.label || cat, knew: 0, total: 0 };
    catMap[cat].total++;
    if (mastery[i] === 'knew') catMap[cat].knew++;
  });
  document.getElementById('completeBreakdown').innerHTML = Object.values(catMap).map(c => {
    const pct = c.total ? Math.round(c.knew / c.total * 100) : 0;
    return `<div class="breakdown-row">
      <span class="breakdown-label">${c.label}</span>
      <div class="breakdown-bar-wrap"><div class="breakdown-bar" style="width:${pct}%"></div></div>
      <span class="breakdown-num">${c.knew}/${c.total}</span>
    </div>`;
  }).join('');

  document.getElementById('completeOverlay').style.display = 'flex';
}

function reviewWeak() {
  document.getElementById('completeOverlay').style.display = 'none';
  const weak = deck.filter((_, i) => mastery[i] !== 'knew');
  if (!weak.length) { showToast('すべて「わかった」です！'); restartDeck(); return; }
  deck = shuffleOn ? shuffle([...weak]) : weak;
  deckIdx = 0;
  mastery = {};
  renderCard(); renderDots(); renderList();
}

function restartDeck() {
  document.getElementById('completeOverlay').style.display = 'none';
  openStartScreen();
}

// ─────────────────────────────────────────────
// サイドリスト
// ─────────────────────────────────────────────
function toggleList() {
  listOpen = !listOpen;
  document.getElementById('listPanel').classList.toggle('open', listOpen);
  document.getElementById('listArrow').textContent = listOpen ? '‹' : '›';
}

function renderList() {
  const body = document.getElementById('listBody');
  if (!body || !deck.length) { if (body) body.innerHTML = ''; return; }

  body.innerHTML = deck.map((card, i) => {
    const m   = mastery[i] || '';
    const txt = card.q.length > 36 ? card.q.slice(0, 36).replace(/\n/g, ' ') + '…' : card.q.replace(/\n/g, ' ');
    return `<div class="list-item ${i === deckIdx ? 'current' : ''}" onclick="jumpTo(${i})">
      <span class="li-n">${i + 1}</span>
      <span class="li-d ${m}"></span>
      <span class="li-t">${txt}</span>
    </div>`;
  }).join('');

  const cur = body.querySelector('.current');
  if (cur) cur.scrollIntoView({ block: 'nearest' });
}

// ─────────────────────────────────────────────
// シャッフルトグル
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('shuffleBtn');
  if (btn) btn.addEventListener('click', () => {
    shuffleOn = !shuffleOn;
    btn.classList.toggle('active', shuffleOn);
    document.getElementById('shuffleLabel').textContent = shuffleOn ? 'on' : 'shuffle';
    showToast(shuffleOn ? 'シャッフル: ON' : 'シャッフル: OFF');
  });
});

// ─────────────────────────────────────────────
// キーボードショートカット
// ─────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
  switch (e.code) {
    case 'Space':       e.preventDefault(); flipCard(); break;
    case 'ArrowRight':  nextCard(); break;
    case 'ArrowLeft':   prevCard(); break;
    case 'Digit1':      if (isFlipped) markCard('forgot'); break;
    case 'Digit2':      if (isFlipped) markCard('unsure'); break;
    case 'Digit3':      if (isFlipped) markCard('knew');   break;
  }
});

// ─────────────────────────────────────────────
// ══════ EDITOR（Supabase 時のみ表示） ══════
// ─────────────────────────────────────────────

// ── 問題一覧 ──
function renderQList() {
  const wrap = document.getElementById('qList');
  const cnt  = document.getElementById('qListCount');
  if (!wrap) return;
  if (cnt) cnt.textContent = `(${allCards.length})`;

  wrap.innerHTML = allCards.map(c => `
    <div class="q-list-item">
      <div class="qli-meta">
        <span class="qli-cat">${escHtml(c.category)}</span>
        <span class="qli-id">#${c.id}</span>
      </div>
      <div class="qli-q">${escHtml(c.q.replace(/\n/g,' ').slice(0,80))}${c.q.length>80?'…':''}</div>
      <div class="qli-a">${escHtml(c.a)}</div>
      <div class="qli-actions">
        <button class="btn-ghost-sm" onclick="editQuestion(${c.id})">編集</button>
        <button class="btn-ghost-sm danger" onclick="deleteQuestion(${c.id})">削除</button>
      </div>
    </div>
  `).join('');
}

// ── フォームに値をセット（編集時）──
function editQuestion(id) {
  const card = allCards.find(c => c.id === id);
  if (!card) return;
  editingId = id;
  document.getElementById('formTitle').textContent   = '問題を編集';
  document.getElementById('f_category').value        = card.category;
  document.getElementById('f_question').value        = card.q;
  document.getElementById('f_answer').value          = card.a;
  document.getElementById('f_explanation').value     = card.sub;
  document.getElementById('f_imageUrl').value        = card.image_url || '';
  previewImg();
  document.getElementById('f_category').scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
  editingId = null;
  document.getElementById('formTitle').textContent = '問題を追加';
  ['f_category','f_question','f_answer','f_explanation','f_imageUrl'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('imagePreview').innerHTML = '';
}

function previewImg() {
  const url = document.getElementById('f_imageUrl').value.trim();
  const el  = document.getElementById('imagePreview');
  el.innerHTML = url ? `<img src="${escHtml(url)}" alt="preview" onerror="this.style.display='none'">` : '';
}

// ── 保存（INSERT / UPDATE）──
async function saveQuestion() {
  const category    = document.getElementById('f_category').value.trim();
  const question    = document.getElementById('f_question').value.trim();
  const answer      = document.getElementById('f_answer').value.trim();
  const explanation = document.getElementById('f_explanation').value.trim();
  const image_url   = document.getElementById('f_imageUrl').value.trim();

  if (!category || !question || !answer) {
    showToast('カテゴリ・問題文・答えは必須です');
    return;
  }

  const body = JSON.stringify({ category, question, answer, explanation, image_url });

  try {
    let res;
    if (editingId !== null) {
      // UPDATE
      res = await fetch(
        `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?id=eq.${editingId}`,
        {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body,
        }
      );
    } else {
      // INSERT
      res = await fetch(
        `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`,
        {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body,
        }
      );
    }
    if (!res.ok) throw new Error(`${res.status}`);
    showToast(editingId !== null ? '✓ 更新しました' : '✓ 追加しました');
    resetForm();
    await loadFromSupabase(false);
  } catch(e) {
    showToast(`✗ 保存エラー: ${e.message}`);
  }
}

// ── 削除 ──
async function deleteQuestion(id) {
  if (!confirm('この問題を削除しますか？')) return;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: 'return=minimal',
        },
      }
    );
    if (!res.ok) throw new Error(`${res.status}`);
    showToast('✓ 削除しました');
    if (editingId === id) resetForm();
    await loadFromSupabase(false);
  } catch(e) {
    showToast(`✗ 削除エラー: ${e.message}`);
  }
}

// ── CSV インポート ──
function importCSV() {
  const file = document.getElementById('csvFile').files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async e => {
    const lines = e.target.result.split('\n').filter(l => l.trim());
    if (!lines.length) return;
    // 1行目ヘッダーをスキップ
    const rows = lines.slice(1).map(l => {
      const cols = l.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
      return {
        category:    cols[0] || 'default',
        question:    cols[1] || '',
        answer:      cols[2] || '',
        explanation: cols[3] || '',
        image_url:   cols[4] || '',
      };
    }).filter(r => r.question && r.answer);

    if (!rows.length) { showToast('有効な行がありません'); return; }

    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`,
        {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify(rows),
        }
      );
      if (!res.ok) throw new Error(`${res.status}`);
      showToast(`✓ ${rows.length} 件インポート完了`);
      await loadFromSupabase(false);
    } catch(e) {
      showToast(`✗ インポートエラー: ${e.message}`);
    }
    document.getElementById('csvFile').value = '';
  };
  reader.readAsText(file, 'UTF-8');
}

// ── CSV エクスポート ──
function exportCSV() {
  const header = 'category,question,answer,explanation,image_url';
  const rows   = allCards.map(c =>
    [c.category, c.q, c.a, c.sub, c.image_url || '']
      .map(v => `"${String(v).replace(/"/g,'""')}"`)
      .join(',')
  );
  download([header, ...rows].join('\n'), 'flashcards.csv', 'text/csv');
}

// ── JSON エクスポート ──
function exportJSON() {
  const data = allCards.map(c => ({
    category: c.category, question: c.q, answer: c.a,
    explanation: c.sub, image_url: c.image_url,
  }));
  download(JSON.stringify(data, null, 2), 'flashcards.json', 'application/json');
}

function download(content, filename, type) {
  const a = document.createElement('a');
  a.href  = URL.createObjectURL(new Blob([content], { type }));
  a.download = filename;
  a.click();
}

// ─────────────────────────────────────────────
// ユーティリティ
// ─────────────────────────────────────────────
function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

let _toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('visible'), 2400);
}
