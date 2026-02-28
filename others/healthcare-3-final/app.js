// ═══════════════════════════════════════════════
// app.js — 保健 まとめノート
// ═══════════════════════════════════════════════

const UNITS = [
  {
    id:    'u01',
    num:   '01',
    title: '大気汚染と健康',
    file:  'units/01.md',
    color: '#5b6abf',

    quiz: [
      {
        q:      '1952年にイギリスで起きた大気汚染事件を___といい、その数日間で通常より___人多く死亡した。',
        blanks: ['ロンドンスモッグ事件', '4000'],
      },
      {
        q:      '日本の四日市喘息の原因物質は___である。これは四大公害病の一つである。',
        blanks: ['硫黄酸化物'],
      },
      {
        q:      '粒径が概ね___μm以下の微小粒子状物質を___と呼び、肺の奥深くまで入り込んで肺がんや循環器疾患を引き起こす。',
        blanks: ['2.5', 'PM2.5'],
      },
      {
        q:      '建材・接着剤・塗料などから発生する化学物質が原因で頭痛・めまいなどが起きる状態を___という。代表的な化学物質には___や___がある。',
        blanks: ['シックハウス症候群', 'ホルムアルデヒド', 'トルエン'],
      },
      {
        q:      'フロン類が___を破壊することが問題となった。過剰な___が地表に届くと皮膚がんや白内障の原因となる。',
        blanks: ['オゾン層', '紫外線'],
      },
    ],
  },
  {
    id:    'u02',
    num:   '02',
    title: '水質汚濁・土壌汚染と健康',
    file:  'units/02.md',
    color: '#2e86ab',

    quiz: [
      {
        q:      '水俣病の原因物質は___で、食物連鎖の過程で生物濃縮が起こり人間に影響を及ぼした。',
        blanks: ['メチル水銀'],
      },
      {
        q:      'イタイイタイ病の原因物質は___で、富山県___流域で発生した。腎臓障害・骨軟化が主な症状。',
        blanks: ['カドミウム', '神通川'],
      },
      {
        q:      '河川・湖沼等で窒素・リンが増えることを___という。これにより___（青緑色）や赤潮（赤・オレンジ色）が発生する。',
        blanks: ['富栄養化', 'アオコ'],
      },
      {
        q:      'PCBは水に溶け___く、脂肪に溶け___い。分解___いため体内に蓄積しやすい。',
        blanks: ['にく', 'やす', 'されにく'],
      },
      {
        q:      '土壌汚染は目に見えず1か所に溜まるため、市街地では長期間___されないことが多い。',
        blanks: ['気づか'],
      },
    ],
  },
  {
    id:    'u03',
    num:   '03',
    title: '健康被害を防ぐための環境対策',
    file:  'units/03.md',
    color: '#3d8b5e',

    quiz: [
      {
        q:      '環境汚染防止の基本的考え方は、①汚染物質を生じさせない、②___、③汚染が生じたら取り除くor人を遠ざける、の順に優先される。',
        blanks: ['排出前に適切に処理・低減する'],
      },
      {
        q:      '排出基準は環境基準の原則___倍値であり、超えた場合は___がある。',
        blanks: ['10', '罰則'],
      },
      {
        q:      '大規模な開発事業について環境への影響を事前に評価する制度を___制度という。',
        blanks: ['環境アセスメント'],
      },
      {
        q:      '大気汚染物質の広域監視システム「___」は環境省が提供している。',
        blanks: ['そらまめ君'],
      },
      {
        q:      'アスベストは___・___の原因となる。製造・出荷は禁止されているが、建物解体時には___対策が必要。',
        blanks: ['肺がん', '中皮腫', '飛散'],
      },
      {
        q:      '四大公害病は水俣病・新潟水俣病・___・___の4つである。',
        blanks: ['四日市喘息', 'イタイイタイ病'],
      },
    ],
  },
  {
    id:    'u04',
    num:   '04',
    title: '環境衛生に関わる活動',
    file:  'units/04.md',
    color: '#7b5ea7',

    quiz: [
      {
        q:      '日本の上水道の普及率はほぼ___%である。水源が汚れると塩素処理の際に___が生成するリスクがある。',
        blanks: ['100', 'トリハロメタン'],
      },
      {
        q:      '下水道が整備されていない地域では___を設置して汚水を処理する。汚水処理の普及率は約___割。',
        blanks: ['合併処理浄化槽', '9'],
      },
      {
        q:      '日本では1人1日あたり約___kgのごみを排出している（年間4,000万トン以上）。ごみの約___割が焼却処理される。',
        blanks: ['1', '8'],
      },
      {
        q:      '環境中で5mm以下になったプラスチックを___と呼び、海洋生態系に影響を与える。',
        blanks: ['マイクロプラスチック'],
      },
      {
        q:      '3Rとは___（ごみを出さない）・___（繰り返し使う）・___（再生利用）の略称である。',
        blanks: ['リデュース', 'リユース', 'リサイクル'],
      },
    ],
  },
  {
    id:    'u05',
    num:   '05',
    title: '食品の安全性と健康',
    file:  'units/05.md',
    color: '#c0392b',

    quiz: [
      {
        q:      '食中毒の細菌のうち、感染型の代表例は___・___・___であり、毒素型の代表例は___・___である。',
        blanks: ['カンピロバクター', 'サルモネラ属菌', '腸管出血性大腸菌', 'ブドウ球菌', 'ボツリヌス菌'],
      },
      {
        q:      '日本の食中毒発生件数は毎年約___件・被害者は約___万人である。',
        blanks: ['1000', '1'],
      },
      {
        q:      '食物アレルギーによる急激な血圧低下・呼吸困難・意識障害を___という。対応はアドレナリン自己注射（___）と救急搬送。',
        blanks: ['アナフィラキシー', 'エピペン'],
      },
      {
        q:      '食品表示法で表示義務のある特定原材料は___品目。卵・牛乳・小麦・ソバ・落花生・エビ・___・___が含まれる。',
        blanks: ['8', 'カニ', 'クルミ'],
      },
    ],
  },
  {
    id:    'u06',
    num:   '06',
    title: '食品安全を確保する取り組み',
    file:  'units/06.md',
    color: '#d35400',

    quiz: [
      {
        q:      '食品安全に関する3つのリスク管理：①___（食品安全委員会が担当）、②___（厚生労働省など）、③___（消費者・企業・行政の意見交換）。',
        blanks: ['リスク評価', 'リスク管理', 'リスクコミュニケーション'],
      },
      {
        q:      'ADI（1日摂取許容量）は無毒性量の___分の1で、人が一生毎日摂取し続けても健康への悪影響がない量。',
        blanks: ['100'],
      },
      {
        q:      'HACCPとは___の略で、日本語では「___」ともいう。食品事業者への制度化が進んでいる。',
        blanks: ['Hazard Analysis and Critical Control Point', '危害要因分析重要管理点'],
      },
      {
        q:      'WHOの食中毒予防5つの鍵：清潔に保つ・___・よく加熱する・___・安全な水と原材料を使う。',
        blanks: ['生の食品と加熱済み食品を分ける', '安全な温度に保つ'],
      },
      {
        q:      '食品安全委員会は___府に設置され、他の行政機関から___している。',
        blanks: ['内閣', '独立'],
      },
    ],
  },
  {
    id:    'u07',
    num:   '07',
    title: '医薬品の制度とその活用',
    file:  'units/07.md',
    color: '#1a7a6e',

    quiz: [
      {
        q:      '要指導医薬品は___のみが販売でき、インターネット販売は___。対面での販売が義務づけられている。',
        blanks: ['薬剤師', '不可'],
      },
      {
        q:      '一般用医薬品の第___類は薬剤師または登録販売者が販売でき、購入者が直接手に取れる場所に陳列される。第___類と第___類が該当。',
        blanks: ['2・3', '2', '3'],
      },
      {
        q:      '医薬品の開発段階：基礎的研究 → ___（動物実験） → ___（治験） → 審査・承認 → 発売 → 市販後調査。',
        blanks: ['非臨床試験', '臨床試験'],
      },
      {
        q:      '「くすりはリスク」という言葉のとおり、医薬品は有効性（主作用）だけでなく___のリスクもある。',
        blanks: ['副作用'],
      },
      {
        q:      '医薬品の血中濃度が___にある時に効果が現れる。多く服用すると___、少なすぎると___になる。',
        blanks: ['有効域', '中毒域', '無効域'],
      },
      {
        q:      '適正に使用したにもかかわらず副作用被害を受けた患者を国が補償する制度を___という。',
        blanks: ['医薬品副作用被害救済制度'],
      },
    ],
  },
];

// ──────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────
let currentUnitIdx = 0;
let currentTab     = 'summary';
let quizState      = null;
const mdCache      = {};

// ──────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────
(function init() {
  buildNav();
  navigateTo(0);
})();

// ──────────────────────────────────────────────
// NAV BUILD
// ──────────────────────────────────────────────
function buildNav() {
  const sidebar = document.getElementById('unitNav');
  sidebar.innerHTML = `
    <p class="nav-section-label">Units</p>
    ${UNITS.map((u, i) => `
      <button class="nav-unit-btn" id="nav-${u.id}" onclick="navTo(${i})"
              style="--unit-color:${u.color}; --unit-color-light:${hexToLight(u.color)}">
        <span class="nav-num">${u.num}</span>
        <span class="nav-label">${u.title}</span>
        <span class="nav-quiz-dot" id="navdot-${u.id}"></span>
      </button>
    `).join('')}
  `;

  const toggle  = document.getElementById('navToggle');
  const overlay = document.getElementById('navOverlay');

  toggle.addEventListener('click', () => document.body.classList.toggle('nav-open'));
  overlay.addEventListener('click', () => document.body.classList.remove('nav-open'));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.body.classList.remove('nav-open');
  });
  sidebar.addEventListener('click', e => {
    if (e.target.closest('.nav-unit-btn') && window.innerWidth <= 768) {
      document.body.classList.remove('nav-open');
    }
  });
}

function navTo(idx) { navigateTo(idx); }

// ──────────────────────────────────────────────
// NAVIGATE
// ──────────────────────────────────────────────
async function navigateTo(idx) {
  if (idx < 0 || idx >= UNITS.length) return;
  currentUnitIdx = idx;
  quizState = null;
  const unit = UNITS[idx];

  document.querySelectorAll('.nav-unit-btn').forEach(b => b.classList.remove('active'));
  const navBtn = document.getElementById(`nav-${unit.id}`);
  if (navBtn) navBtn.classList.add('active');

  document.documentElement.style.setProperty('--unit-color', unit.color);
  document.documentElement.style.setProperty('--unit-color-light', hexToLight(unit.color));
  document.getElementById('headerSub').textContent = `Unit ${unit.num}`;
  document.getElementById('unitNum').textContent   = `Unit ${unit.num}`;
  document.getElementById('unitTitle').textContent = unit.title;
  document.getElementById('unitNumQ').textContent  = `Unit ${unit.num}`;
  document.getElementById('unitTitleQ').textContent = unit.title;

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (currentTab === 'summary') {
    await loadSummary(unit);
  } else {
    renderQuiz(unit);
  }
}

// ──────────────────────────────────────────────
// TAB SWITCH
// ──────────────────────────────────────────────
async function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tabSummary').classList.toggle('active', tab === 'summary');
  document.getElementById('tabQuiz').classList.toggle('active',    tab === 'quiz');
  document.getElementById('panelSummary').style.display = 'none';
  document.getElementById('panelQuiz').style.display    = 'none';
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('errorState').style.display   = 'none';
  const unit = UNITS[currentUnitIdx];
  if (tab === 'summary') await loadSummary(unit);
  else renderQuiz(unit);
}

// ──────────────────────────────────────────────
// SUMMARY
// ──────────────────────────────────────────────
async function loadSummary(unit) {
  const body    = document.getElementById('panelSummary');
  const loading = document.getElementById('loadingState');
  const error   = document.getElementById('errorState');
  const mdBody  = document.getElementById('markdownBody');

  body.style.display    = 'none';
  error.style.display   = 'none';
  loading.style.display = 'flex';

  try {
    let md;
    if (mdCache[unit.file]) {
      md = mdCache[unit.file];
    } else {
      const res = await fetch(unit.file);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      md = await res.text();
      mdCache[unit.file] = md;
    }
    mdBody.innerHTML = marked.parse(md);
    updateUnitProgress(unit);
    loading.style.display = 'none';
    body.style.display    = 'block';
  } catch (e) {
    loading.style.display = 'none';
    document.getElementById('errorMsg').textContent =
      `「${unit.file}」を読み込めませんでした: ${e.message}`;
    error.style.display = 'flex';
  }
}

function reloadUnit() {
  const unit = UNITS[currentUnitIdx];
  delete mdCache[unit.file];
  loadSummary(unit);
}

function updateUnitProgress(unit) {
  const el = document.getElementById('unitProgress');
  if (!quizState) {
    const total = (unit.quiz || []).reduce((s, q) => s + q.blanks.length, 0);
    el.textContent = total > 0 ? `穴埋め ${total}問` : '';
    return;
  }
  const correct = quizState.correct.filter(Boolean).length;
  const total   = quizState.correct.length;
  el.textContent = `穴埋め ${correct} / ${total} 正解`;
}

// ──────────────────────────────────────────────
// QUIZ
// ──────────────────────────────────────────────
function renderQuiz(unit) {
  const questions = unit.quiz || [];
  document.getElementById('panelQuiz').style.display    = 'block';
  document.getElementById('panelSummary').style.display = 'none';
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('errorState').style.display   = 'none';

  const wrap = document.getElementById('quizWrap');

  if (!questions.length) {
    wrap.innerHTML = `<p style="color:var(--color-text-secondary);font-size:0.88rem;padding:2rem 0">このUnitにはクイズがありません。</p>`;
    document.getElementById('quizScore').textContent = '';
    document.getElementById('quizProgressFill').style.width = '0%';
    return;
  }

  wrap.innerHTML = questions.map((q, qi) => {
    let blankIdx = 0;
    const qHtml = escapeHtml(q.q).replace(/___/g, () => {
      const idx = blankIdx++;
      return `<input class="blank-input" data-qi="${qi}" data-bi="${idx}" type="text" placeholder="　　　" autocomplete="off" autocorrect="off" spellcheck="false">`;
    });
    return `
      <div class="q-item" id="qitem-${qi}">
        <div class="q-text">Q${qi + 1}. ${qHtml}</div>
        <div class="q-feedback" id="qfb-${qi}"></div>
      </div>
    `;
  }).join('');

  quizState = {
    inputs:  wrap.querySelectorAll('.blank-input'),
    correct: new Array(questions.reduce((s, q) => s + q.blanks.length, 0)).fill(null),
  };

  quizState.inputs.forEach(inp => {
    inp.addEventListener('input', updateQuizProgress);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') focusNextBlank(inp); });
  });

  document.getElementById('quizScore').textContent = '';
  updateQuizProgress();
}

function updateQuizProgress() {
  if (!quizState) return;
  const inputs = document.querySelectorAll('.blank-input');
  const filled = [...inputs].filter(i => i.value.trim().length > 0).length;
  const pct    = inputs.length ? filled / inputs.length * 100 : 0;
  document.getElementById('quizProgressFill').style.width = pct + '%';
}

function focusNextBlank(current) {
  const inputs = [...document.querySelectorAll('.blank-input')];
  const idx    = inputs.indexOf(current);
  if (idx >= 0 && idx < inputs.length - 1) inputs[idx + 1].focus();
}

function checkQuiz() {
  const unit      = UNITS[currentUnitIdx];
  const questions = unit.quiz || [];
  if (!questions.length) return;

  let globalBlankIdx = 0;
  let totalCorrect   = 0;
  let totalBlanks    = 0;

  questions.forEach((q, qi) => {
    const item = document.getElementById(`qitem-${qi}`);
    const fb   = document.getElementById(`qfb-${qi}`);
    let qAllCorrect = true;

    q.blanks.forEach((ans, bi) => {
      const inp = document.querySelector(`.blank-input[data-qi="${qi}"][data-bi="${bi}"]`);
      if (!inp) return;
      totalBlanks++;
      const ok = normalizeAnswer(inp.value) === normalizeAnswer(ans);
      inp.classList.toggle('correct', ok);
      inp.classList.toggle('wrong',   !ok);
      if (quizState) quizState.correct[globalBlankIdx] = ok;
      globalBlankIdx++;
      if (ok) totalCorrect++;
      else    qAllCorrect = false;
    });

    item.classList.toggle('all-correct', qAllCorrect);
    item.classList.toggle('has-wrong',   !qAllCorrect);
    fb.className   = `q-feedback ${qAllCorrect ? 'correct' : 'wrong'}`;
    fb.textContent = qAllCorrect ? '✓ 正解' : '✗ 正解: ' + q.blanks.join(' ／ ');
  });

  const pct = totalBlanks ? Math.round(totalCorrect / totalBlanks * 100) : 0;
  document.getElementById('quizScore').textContent = `${totalCorrect} / ${totalBlanks}  (${pct}%)`;

  const dot = document.getElementById(`navdot-${unit.id}`);
  if (dot) dot.classList.toggle('done', pct === 100);

  updateQuizProgress();
  updateUnitProgress(unit);
  showToast(pct === 100 ? '🎉 全問正解！' : `${totalCorrect} / ${totalBlanks} 正解`);
}

function retryWrong() {
  const inputs = [...document.querySelectorAll('.blank-input')];
  let firstWrong = null;
  inputs.forEach(inp => {
    if (inp.classList.contains('wrong')) {
      inp.value = '';
      inp.classList.remove('wrong');
      if (!firstWrong) firstWrong = inp;
    }
  });
  document.querySelectorAll('.q-item').forEach(item => item.classList.remove('has-wrong', 'all-correct'));
  document.querySelectorAll('.q-feedback').forEach(fb => {
    if (fb.classList.contains('wrong')) { fb.textContent = ''; fb.className = 'q-feedback'; }
  });
  document.getElementById('quizScore').textContent = '';
  if (firstWrong) firstWrong.focus();
  updateQuizProgress();
}

function resetQuiz() { renderQuiz(UNITS[currentUnitIdx]); }

function normalizeAnswer(s) {
  return (s || '')
    .replace(/[　\s]/g, '')
    .replace(/[、。，,・]/g, '')
    .replace(/[（(）)]/g, '')
    .replace(/[ー－]/g, 'ー')
    .toLowerCase();
}

// ──────────────────────────────────────────────
// UTILS
// ──────────────────────────────────────────────
function hexToLight(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},0.09)`;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ──────────────────────────────────────────────
// TOAST
// ──────────────────────────────────────────────
let _toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('visible'), 2400);
}

// ──────────────────────────────────────────────
// KEYBOARD SHORTCUTS
// ──────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
  if (e.key === 'ArrowRight' || e.key === 'l') navigateTo(currentUnitIdx + 1);
  if (e.key === 'ArrowLeft'  || e.key === 'h') navigateTo(currentUnitIdx - 1);
  if (e.key === 's') switchTab('summary');
  if (e.key === 'q') switchTab('quiz');
});
