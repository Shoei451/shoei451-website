// ═══════════════════════════════════════
// CARDS.JS — 暗記カードロジック
// ═══════════════════════════════════════

// ── State ──
let deck = [];           // current filtered+shuffled deck
let deckIdx = 0;         // current card index
let isFlipped = false;
let mastery = {};        // { questionId: 'knew' | 'unsure' | 'forgot' }

let filterCat  = 'all';
let filterDiff = 'all';

const CATEGORY_LABELS  = { rhetoric:'和歌の修辞', rank:'貴族の位', lit:'文学史' };
const DIFFICULTY_LABELS = { easy:'基礎', medium:'標準', hard:'発展' };

// ── Init ──
function init() {
  buildDeck();
  bindFilters();
  renderCard();
  renderList();

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    switch (e.code) {
      case 'Space':      e.preventDefault(); flipCard();         break;
      case 'ArrowRight': nextCard();                             break;
      case 'ArrowLeft':  prevCard();                             break;
      case 'Digit1':     if (isFlipped) markCard('forgot');      break;
      case 'Digit2':     if (isFlipped) markCard('unsure');      break;
      case 'Digit3':     if (isFlipped) markCard('knew');        break;
    }
  });
}

// ── Deck building ──
function buildDeck(keepOrder = false) {
  let pool = questions.filter(q =>
    (filterCat  === 'all' || q.category  === filterCat)  &&
    (filterDiff === 'all' || q.difficulty === filterDiff)
  );
  deck = keepOrder ? pool : shuffle([...pool]);
  deckIdx = 0;
  isFlipped = false;

  document.getElementById('deckCount').textContent = deck.length + '枚';
  updateProgress();
  renderDots();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Filters ──
function bindFilters() {
  document.querySelectorAll('[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-cat]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterCat = btn.dataset.cat;
      buildDeck();
      renderCard();
      renderList();
    });
  });

  document.querySelectorAll('[data-diff]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-diff]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterDiff = btn.dataset.diff;
      buildDeck();
      renderCard();
      renderList();
    });
  });
}

function shuffleDeck() {
  buildDeck(false);
  renderCard();
  renderList();
}

// ── Render card ──
function renderCard() {
  if (!deck.length) {
    document.getElementById('cardQuestion').textContent = '該当する問題がありません';
    document.getElementById('cardAnswer').textContent = '';
    document.getElementById('cardOptionsList').innerHTML = '';
    document.getElementById('cardExplanation').textContent = '';
    return;
  }

  // Un-flip
  const body = document.getElementById('cardBody');
  body.classList.remove('flipped');
  isFlipped = false;

  // Mastery buttons → inactive
  setMasteryActive(false);

  const q = deck[deckIdx];

  // FRONT
  const badge = document.getElementById('frontBadge');
  badge.textContent = CATEGORY_LABELS[q.category];
  badge.className = `face-badge q-category-badge badge-${q.category}`;
  document.getElementById('frontDiff').textContent = DIFFICULTY_LABELS[q.difficulty];
  document.getElementById('backBadge').textContent = CATEGORY_LABELS[q.category];

  // Image
  const imgEl = document.getElementById('cardImage');
  if (q.image) {
    imgEl.src = q.image;
    imgEl.style.display = 'block';
  } else {
    imgEl.style.display = 'none';
  }

  document.getElementById('cardQuestion').textContent = q.question;

  // BACK: correct answer + all options dimmed
  document.getElementById('cardAnswer').textContent = q.options[q.correct];

  const optsList = document.getElementById('cardOptionsList');
  optsList.innerHTML = q.options.map((opt, i) =>
    `<span class="card-opt-chip${i === q.correct ? ' correct-chip' : ''}">${opt}</span>`
  ).join('');

  document.getElementById('cardExplanation').textContent = q.explanation || '';

  // Progress
  updateProgress();
  renderDots();
  renderList();
}

function updateProgress() {
  const total = deck.length;
  if (!total) return;
  const pct = ((deckIdx + 1) / total) * 100;
  document.getElementById('cardProgressFill').style.width = pct + '%';
  document.getElementById('deckIndicator').textContent = (deckIdx + 1) + ' / ' + total;
  document.getElementById('prevBtn').disabled = deckIdx === 0;
  document.getElementById('nextBtn').disabled = deckIdx === total - 1;
}

function renderDots() {
  const row = document.getElementById('masteryRow');
  if (deck.length > 60) { row.innerHTML = ''; return; } // don't render too many dots
  row.innerHTML = deck.map((q, i) => {
    const m = mastery[q.id] || '';
    const isCur = i === deckIdx;
    return `<div class="mastery-dot ${m} ${isCur ? 'current' : ''}" title="${q.options[q.correct]}"></div>`;
  }).join('');
}

// ── Flip ──
function flipCard() {
  if (!deck.length) return;
  const body = document.getElementById('cardBody');
  isFlipped = !isFlipped;
  body.classList.toggle('flipped', isFlipped);
  setMasteryActive(isFlipped);
}

function setMasteryActive(active) {
  document.querySelectorAll('.mastery-btn').forEach(b => {
    b.classList.toggle('active', active);
  });
}

// ── Navigation ──
function nextCard() {
  if (deckIdx < deck.length - 1) {
    deckIdx++;
    renderCard();
  } else {
    // reached end
    showComplete();
  }
}

function prevCard() {
  if (deckIdx > 0) {
    deckIdx--;
    renderCard();
  }
}

// ── Mastery marking ──
function markCard(level) {
  if (!isFlipped || !deck.length) return;
  const q = deck[deckIdx];
  mastery[q.id] = level;

  // Animate the clicked button
  const map = { forgot: 0, unsure: 1, knew: 2 };
  const btns = document.querySelectorAll('.mastery-btn');
  const btn = btns[map[level]];
  btn.style.transform = 'scale(0.93)';
  setTimeout(() => btn.style.transform = '', 120);

  // Auto-advance after short delay
  setTimeout(() => {
    if (deckIdx < deck.length - 1) {
      deckIdx++;
      renderCard();
    } else {
      showComplete();
    }
  }, 250);
}

// ── Complete overlay ──
function showComplete() {
  const total = deck.length;
  const knew   = Object.values(mastery).filter(v => v === 'knew').length;
  const unsure = Object.values(mastery).filter(v => v === 'unsure').length;
  const forgot = Object.values(mastery).filter(v => v === 'forgot').length;
  const unmarked = total - knew - unsure - forgot;

  document.getElementById('completeStats').innerHTML = `
    <div class="stat-pill knew-pill">
      <span class="sp-num">${knew}</span>
      <span class="sp-label">わかった</span>
    </div>
    <div class="stat-pill unsure-pill">
      <span class="sp-num">${unsure}</span>
      <span class="sp-label">あやふや</span>
    </div>
    <div class="stat-pill forgot-pill">
      <span class="sp-num">${forgot}</span>
      <span class="sp-label">わからない</span>
    </div>
    ${unmarked > 0 ? `<div class="stat-pill"><span class="sp-num">${unmarked}</span><span class="sp-label">未確認</span></div>` : ''}
  `;
  document.getElementById('completeOverlay').style.display = 'flex';
}

function hideComplete() {
  document.getElementById('completeOverlay').style.display = 'none';
}

function reviewWeak() {
  hideComplete();
  // Keep only unsure + forgot + unmarked
  const weak = deck.filter(q => mastery[q.id] !== 'knew');
  if (!weak.length) {
    alert('✓ すべて「わかった」です！');
    restartDeck();
    return;
  }
  deck = shuffle(weak);
  deckIdx = 0;
  renderCard();
  renderList();
}

function restartDeck() {
  hideComplete();
  mastery = {};
  buildDeck(false);
  renderCard();
  renderList();
}

// ── Side list ──
let listOpen = false;
function toggleList() {
  listOpen = !listOpen;
  document.getElementById('listPanel').classList.toggle('open', listOpen);
  document.getElementById('listArrow').textContent = listOpen ? '›' : '‹';
}

function renderList() {
  const container = document.getElementById('listItems');
  container.innerHTML = deck.map((q, i) => {
    const m = mastery[q.id] || '';
    const isCur = i === deckIdx;
    const text = q.question.length > 42 ? q.question.slice(0, 42) + '…' : q.question;
    return `
      <div class="list-item ${isCur ? 'current' : ''}" onclick="jumpTo(${i})">
        <span class="li-num">${i + 1}</span>
        <span class="li-dot ${m}"></span>
        <span class="li-text">${text}</span>
      </div>
    `;
  }).join('');

  // Scroll current into view
  const cur = container.querySelector('.current');
  if (cur) cur.scrollIntoView({ block: 'nearest' });
}

function jumpTo(idx) {
  deckIdx = idx;
  renderCard();
  if (window.innerWidth < 768) toggleList(); // close on mobile
}

// ── Start ──
init();