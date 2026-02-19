// ═══════════════════════════════════════════════
// app.js — 古典常識カード メインロジック
// ═══════════════════════════════════════════════

// ── ローカル fallback データ（Supabase 未設定時） ──
const LOCAL_QUESTIONS = [
  {id:1,  category:'rhetoric', question:'枕詞「あしひきの」がかかる語は？',                         answer:'山',                             explanation:'「あしひきの山鳥の尾のしだり尾の」など多くの和歌に使われる。', image_url:''},
  {id:2,  category:'rhetoric', question:'枕詞「たらちねの」がかかる語は？',                         answer:'母',                             explanation:'「たらちねの母の命は」のように用いる。', image_url:''},
  {id:3,  category:'rhetoric', question:'枕詞「ちはやぶる」がかかる語は？',                         answer:'神',                             explanation:'「荒々しい・威勢がよい」という意を持つ。在原業平の歌で有名。', image_url:''},
  {id:4,  category:'rhetoric', question:'枕詞「ぬばたまの」がかかる語の種類は？',                   answer:'夜・黒・髪など暗さに関係する語', explanation:'ヒオウギの黒い実に由来する。「夜」「黒」「髪」「闇」などにかかる。', image_url:''},
  {id:5,  category:'rhetoric', question:'枕詞「あをによし」がかかる語は？',                         answer:'奈良',                           explanation:'「あをによし奈良の都は…」（小野老）。奈良産の青丹（顔料）に由来。', image_url:''},
  {id:6,  category:'rhetoric', question:'小野小町「…ながめせしまに」の「ながめ」の掛詞は？',       answer:'眺め（物思い）と長雨',           explanation:'春の長雨の間に物思いにふけっているうちに花が散った、という意。', image_url:''},
  {id:7,  category:'rhetoric', question:'掛詞（かけことば）とはどのような技法か？',                 answer:'同音異義を利用し一語に二つ以上の意味を持たせる技法', explanation:'「松（待つ）」「秋（飽き）」のように。和歌の重層的な意味を生む。', image_url:''},
  {id:8,  category:'rhetoric', question:'序詞（じょことば）とはどのような技法か？',                 answer:'5音以上の長い前置きで、あとの語句を導く比喩・象徴的表現', explanation:'枕詞より長く文脈によって内容が変わる。比喩・象徴として機能する。', image_url:''},
  {id:9,  category:'rhetoric', question:'縁語（えんご）とはどのような技法か？',                     answer:'一首の中に意味的に関連する語群を複数配置する技法', explanation:'「弓・矢・射る・的」など。掛詞と組み合わせて用いられることも多い。', image_url:''},
  {id:10, category:'rhetoric', question:'本歌取り（ほんかどり）とはどのような技法か？',             answer:'先人の有名な和歌の語句・表現を取り入れ新たな意味を創り出す技法', explanation:'新古今時代に盛んで藤原定家が多用。読者が本歌を知ることで重層的意味が生まれる。', image_url:''},
  {id:11, category:'rank',     question:'正一位の次に高い位階は？',                                 answer:'従一位',                         explanation:'官位は「正・従」の2つに分かれ、それぞれ一位〜八位まであった。', image_url:''},
  {id:12, category:'rank',     question:'清涼殿の殿上の間への昇殿を許された四位・五位の貴族の総称は？', answer:'殿上人（てんじょうびと）',   explanation:'三位以上は公卿。六位以下は地下（じげ）と呼ばれ殿上を許されない。', image_url:''},
  {id:13, category:'rank',     question:'公卿（くぎょう）と呼ばれるための条件は？',                 answer:'三位以上、または参議に任じられた四位', explanation:'現代でも「上達部（かんだちめ）」と呼ぶ。源氏物語でも重要な概念。', image_url:''},
  {id:14, category:'rank',     question:'受領（ずりょう）とは何か？',                               answer:'実際に任国に赴任した国司の最上席者', explanation:'「受領は倒るる所に土をも掴め」という俗語があるほど財を蓄えた。', image_url:''},
  {id:15, category:'rank',     question:'蔵人頭（くろうどのとう）とはどのような役職か？',           answer:'蔵人所の最高職。天皇の秘書的役割を担い公卿への登竜門とされた', explanation:'四位・五位の優秀な中流貴族が任じられた。源氏物語の頭中将もこの地位。', image_url:''},
  {id:16, category:'rank',     question:'摂政と関白の違いは？',                                     answer:'摂政は幼帝・女帝のとき代わりに政務を行い、関白は成人天皇を補佐する', explanation:'どちらも藤原氏が独占した。両者が置かれた政治体制を「摂関政治」という。', image_url:''},
  {id:17, category:'rank',     question:'源氏物語で光源氏が最終的に到達した地位は？',               answer:'准太上天皇（じゅんだいじょうてんのう）', explanation:'実際の官職ではなく名誉的地位。紫式部が源氏の卓越性を示すための設定。', image_url:''},
  {id:18, category:'rank',     question:'六位以下で殿上の間への昇殿を許されない貴族の総称は？',     answer:'地下（じげ）',                   explanation:'殿上人（四位・五位）や公卿（三位以上）と区別される平安の身分区分。', image_url:''},
  {id:19, category:'lit',      question:'枕草子の作者は？',                                         answer:'清少納言',                       explanation:'一条天皇の中宮・定子に仕えた。「春はあけぼの」の書き出しで有名な随筆。', image_url:''},
  {id:20, category:'lit',      question:'源氏物語の成立はいつ頃か？',                               answer:'平安時代中期（1000年前後）',     explanation:'紫式部の作。一条天皇の中宮・彰子に仕えた。現存最古の長編小説の一つ。', image_url:''},
  {id:21, category:'lit',      question:'日本最古の和歌集は？',                                     answer:'万葉集',                         explanation:'奈良時代末期に成立。約4500首を収録。大伴家持が編纂に関わったとされる。', image_url:''},
  {id:22, category:'lit',      question:'古今和歌集の成立年と主な撰者は？',                         answer:'905年頃・紀貫之ら4人',           explanation:'醍醐天皇の勅命で成立した最初の勅撰和歌集。仮名序は紀貫之が記した。', image_url:''},
  {id:23, category:'lit',      question:'更級日記の作者は？',                                       answer:'菅原孝標女（すがわらのたかすえのむすめ）', explanation:'源氏物語に憧れた少女時代から老境までを回想した日記文学。', image_url:''},
  {id:24, category:'lit',      question:'新古今和歌集の成立年と美的理念は？',                       answer:'1205年・幽玄と余情',             explanation:'後鳥羽上皇の命で成立した第八勅撰集。藤原定家らが撰者。本歌取りを多用。', image_url:''},
  {id:25, category:'lit',      question:'土佐日記の作者と特徴は？',                                 answer:'紀貫之。男性が女性の仮名体裁で書いた最初の日記文学', explanation:'934〜935年成立。土佐守の任期を終えた帰京の道中を記す。', image_url:''},
  {id:26, category:'lit',      question:'伊勢物語の特徴は？',                                       answer:'作者未詳。在原業平をモデルとする「昔男」の恋愛と旅を描いた歌物語', explanation:'9〜10世紀頃成立。125段構成。和歌を中心に散文が付く形式。', image_url:''},
  {id:27, category:'lit',      question:'方丈記の作者と成立年は？',                                 answer:'鴨長明・1212年（鎌倉前期）',     explanation:'無常観と隠遁生活を記した随筆。「ゆく河の流れは絶えずして…」で始まる。', image_url:''},
  {id:28, category:'lit',      question:'徒然草の作者と成立時代は？',                               answer:'吉田兼好（兼好法師）・鎌倉後期〜南北朝', explanation:'244段から成る随筆。「つれづれなるままに…」で始まる。', image_url:''},
  {id:29, category:'lit',      question:'平家物語の中心テーマは？',                                 answer:'平氏の盛衰と諸行無常の仏教的世界観', explanation:'「盛者必衰」を描く軍記物語。琵琶法師により語り継がれた。', image_url:''},
];

// ── State ──
let allQuestions = [...LOCAL_QUESTIONS]; // 全問 (Supabase or local)
let deck    = [];
let deckIdx = 0;
let isFlipped = false;
let mastery = {};   // { id: 'knew' | 'unsure' | 'forgot' }
let selectedCategory = 'mix';
let selectedQuestionCount = '20';

const INLINE_SUPABASE_URL = '';
const INLINE_SUPABASE_ANON_KEY = '';
let sbUrl = (INLINE_SUPABASE_URL || '').trim().replace(/\/$/, '');
let sbKey = (INLINE_SUPABASE_ANON_KEY || '').trim();

const CAT_LABELS = { rhetoric: '和歌の修辞', rank: '貴族の位', lit: '文学史' };

// ══════════════════════════════════════════════
// MODE SWITCH
// ══════════════════════════════════════════════
function switchMode(mode) {
  document.querySelectorAll('.mode-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.h-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('mode-' + mode).classList.add('active');
  document.getElementById('htab-' + mode).classList.add('active');

  if (mode === 'editor') {
    renderQList();
  }
}

// ══════════════════════════════════════════════
// SUPABASE
// ══════════════════════════════════════════════
function hasInlineSupabaseConfig() {
  return !!(sbUrl && sbKey);
}

function setSbStatus(type, msg) {
  const el = document.getElementById('sbStatus');
  el.textContent = msg;
  el.className = 'sb-status' + (type ? ' ' + type : '');
}

async function syncSupabaseInline() {
  await connectSupabaseInline(true);
}

async function connectSupabaseInline(showFeedback = false) {
  if (!hasInlineSupabaseConfig()) {
    setSbStatus('err', 'app.js に Supabase 設定がありません');
    if (showFeedback) showToast('Supabase 設定が未入力です');
    return false;
  }

  setSbStatus('', '接続中…');
  try {
    const data = await sbFetch('GET', '/rest/v1/questions?select=*&order=id');
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

async function tryInlineConnect() {
  await connectSupabaseInline(false);
}

// ══════════════════════════════════════════════
// BANNER
// ══════════════════════════════════════════════
function showBanner(msg) {
  const el = document.getElementById('sbBanner');
  document.getElementById('sbBannerText').textContent = msg;
  el.style.display = '';
}
function closeBanner() {
  document.getElementById('sbBanner').style.display = 'none';
}

// ══════════════════════════════════════════════
// DECK
// ══════════════════════════════════════════════
function buildDeck(keepOrder = false) {
  const byCategory = allQuestions.filter(q =>
    selectedCategory === 'mix' || q.category === selectedCategory
  );
  let pool = [...byCategory];

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
  const byCategory = allQuestions.filter(q =>
    selectedCategory === 'mix' || q.category === selectedCategory
  );
  const count = selectedQuestionCount === 'all'
    ? byCategory.length
    : Math.min(Number(selectedQuestionCount), byCategory.length);

  document.getElementById('startMeta').textContent =
    `出題: ${count}問 / 対象データ: ${byCategory.length}問`;
}

function initStartScreen() {
  document.querySelectorAll('[data-start-cat]').forEach(btn => {
    btn.addEventListener('click', () => setStartCategory(btn.dataset.startCat));
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
  body.classList.remove('flipped');
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

  // Progress
  document.getElementById('progressFill').style.width = ((deckIdx + 1) / total * 100) + '%';
  document.getElementById('deckIndicator').textContent = (deckIdx + 1) + ' / ' + total;
  document.getElementById('prevBtn').disabled = deckIdx === 0;
  document.getElementById('nextBtn').disabled = deckIdx === total - 1;

  // Front
  const fb = document.getElementById('frontBadge');
  fb.textContent = CAT_LABELS[q.category];
  fb.className   = 'face-badge badge-' + q.category;
  document.getElementById('backBadge').textContent = CAT_LABELS[q.category];

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
  if (!deck.length) return;
  isFlipped = !isFlipped;
  document.getElementById('cardBody').classList.toggle('flipped', isFlipped);
  setMasteryActive(isFlipped);
}

function setMasteryActive(on) {
  document.querySelectorAll('.mastery-btn').forEach(b => b.classList.toggle('active', on));
}

// ══════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════
function nextCard() {
  if (deckIdx < deck.length - 1) { deckIdx++; renderCard(); }
  else showComplete();
}
function prevCard() {
  if (deckIdx > 0) { deckIdx--; renderCard(); }
}

// ══════════════════════════════════════════════
// MASTERY
// ══════════════════════════════════════════════
function markCard(level) {
  if (!isFlipped || !deck.length) return;
  mastery[deck[deckIdx].id] = level;
  renderDots(); renderList();

  const idxMap = { forgot: 0, unsure: 1, knew: 2 };
  const btn = document.querySelectorAll('.mastery-btn')[idxMap[level]];
  btn.style.transform = 'scale(0.91)';
  setTimeout(() => { btn.style.transform = ''; }, 120);

  setTimeout(() => {
    if (deckIdx < deck.length - 1) { deckIdx++; renderCard(); }
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
  deckIdx = idx;
  renderCard();
  if (window.innerWidth < 640) toggleList();
}

// ══════════════════════════════════════════════
// KEYBOARD
// ══════════════════════════════════════════════
document.addEventListener('keydown', e => {
  // Don't hijack when typing in editor inputs
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

function resetForm() {
  editingId = null;
  document.getElementById('formTitle').textContent = '問題を追加';
  document.getElementById('f_category').value  = 'rhetoric';
  document.getElementById('f_question').value  = '';
  document.getElementById('f_answer').value    = '';
  document.getElementById('f_explanation').value = '';
  document.getElementById('f_imageUrl').value  = '';
  document.getElementById('imagePreview').innerHTML = '';
  document.getElementById('f_imageFile').value = '';
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

  // Try Supabase first
  if (sbUrl && sbKey) {
    try {
      if (editingId !== null) {
        await sbFetch('PATCH', `/rest/v1/questions?id=eq.${editingId}`, obj);
        const idx = allQuestions.findIndex(q => q.id === editingId);
        allQuestions[idx] = { id: editingId, ...obj };
        showToast('Supabase に更新しました');
      } else {
        const [row] = await sbFetch('POST', '/rest/v1/questions', obj);
        allQuestions.push(normalizeRow(row));
        showToast('Supabase に保存しました');
      }
    } catch (e) {
      showToast('Supabase エラー: ' + e.message); return;
    }
  } else {
    // Local only
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
  document.getElementById('f_category').value    = q.category;
  document.getElementById('f_question').value    = q.question;
  document.getElementById('f_answer').value      = q.answer;
  document.getElementById('f_explanation').value = q.explanation || '';
  document.getElementById('f_imageUrl').value    = q.image_url   || '';
  previewImage();
  document.querySelector('.q-form').scrollIntoView({ behavior: 'smooth' });
}

async function deleteQuestion(id) {
  if (!confirm('この問題を削除しますか？')) return;
  if (sbUrl && sbKey) {
    try {
      await sbFetch('DELETE', `/rest/v1/questions?id=eq.${id}`);
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
  const list = document.getElementById('qList');
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
      <span class="qli-badge badge-${q.category}">${CAT_LABELS[q.category]}</span>
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
    q.id,
    q.category,
    csvEscape(q.question),
    csvEscape(q.answer),
    csvEscape(q.explanation || ''),
    csvEscape(q.image_url   || ''),
  ].join(','));
  download('koten_questions.csv', [header, ...rows].join('\n'), 'text/csv;charset=utf-8');
}

function exportJSON() {
  download('koten_questions.json', JSON.stringify(allQuestions, null, 2), 'application/json');
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
initStartScreen();
tryInlineConnect();
