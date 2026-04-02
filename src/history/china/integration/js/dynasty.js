/* ================================================================
   js/dynasty.js
   - Layout: 451-docs（position:fixed sidebar, overlay, toggle）
   - Cloze:  note-app.js の toggleCloze/revealAll/hideAll を移植
   - Tabs:   まとめ / 穴埋め / 年表 / 人物（4タブ）
   依存: marked.js(CDN), events.js, quizdata.js, dynasties.js, icons.js
================================================================ */

/* ────────────────────────────────────
   UTILS
──────────────────────────────────── */
function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatYear(y) {
  return y < 0 ? `前${Math.abs(y)}` : String(y);
}

/* ────────────────────────────────────
   404
──────────────────────────────────── */
function show404(slugValue) {
  document.body.innerHTML = `
    <div class="not-found-page">
      <div class="not-found-inner">
        <p class="not-found-code">404</p>
        <h1 class="not-found-title">王朝が見つかりません</h1>
        <p class="not-found-desc">
          ${slugValue
            ? `「<code>${escHtml(slugValue)}</code>」に該当する王朝データは存在しません。`
            : 'URL に <code>?slug=</code> パラメータが指定されていません。'}
        </p>
        <a class="not-found-btn" href="index.html">← 王朝一覧に戻る</a>
      </div>
    </div>`;
}

/* ────────────────────────────────────
   SLUG / DYNASTY
──────────────────────────────────── */
const slug    = new URLSearchParams(location.search).get('slug');
const dynasty = DYNASTY_MAP?.[slug];

if (!dynasty) { show404(slug); throw new Error('Unknown slug: ' + slug); }

/* CSS 変数を王朝カラーで上書き */
document.documentElement.style.setProperty('--unit-color',       dynasty.color);
document.documentElement.style.setProperty('--unit-color-light', dynasty.color + '18');

/* ────────────────────────────────────
   HEADER
──────────────────────────────────── */
document.getElementById('dynastyName').textContent = dynasty.name;
document.getElementById('dynastyMeta').textContent =
  `${formatYear(dynasty.start)} – ${formatYear(dynasty.end)}　${dynasty.capital ?? ''}`;
document.title = `${dynasty.name} — 中国史ノート`;
const headerBack = document.getElementById('headerBack');
if (typeof SVG !== 'undefined' && SVG.back) {
  headerBack.innerHTML = SVG.back + ' 一覧';
}

/* ────────────────────────────────────
   451-docs サイドバー開閉
──────────────────────────────────── */
const tocToggle = document.getElementById('tocToggle');
const overlay   = document.getElementById('overlay');
const navList   = document.getElementById('navList');
const TOC_VISIBLE_TABS = new Set(['summary', 'quiz']);

function syncTocToggleState() {
  if (!tocToggle) return;
  const expanded = document.body.classList.contains('toc-open');
  tocToggle.setAttribute('aria-expanded', String(expanded));
  tocToggle.setAttribute('aria-label', expanded ? '目次を閉じる' : '目次を開く');
}

function closeToc() {
  document.body.classList.remove('toc-open');
  syncTocToggleState();
}

function toggleToc() {
  document.body.classList.toggle('toc-open');
  syncTocToggleState();
}

tocToggle?.addEventListener('click', toggleToc);
overlay?.addEventListener('click', closeToc);
navList?.addEventListener('click', e => {
  if (e.target.closest('a')) closeToc();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeToc(); });
syncTocToggleState();

/* ────────────────────────────────────
   TAB SWITCH
──────────────────────────────────── */
const TABS = ['summary', 'quiz', 'timeline', 'figures'];
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function syncTocToggleVisibility(tabName) {
  if (!tocToggle) return;
  const shouldShow = TOC_VISIBLE_TABS.has(tabName);
  tocToggle.hidden = !shouldShow;
  if (!shouldShow) document.body.classList.remove('toc-open');
  syncTocToggleState();
}

function switchTab(name) {
  TABS.forEach(t => {
    const panel = document.getElementById('panel' + cap(t));
    const btn   = document.getElementById('btn'   + cap(t));
    panel.style.display = t === name ? 'block' : 'none';
    btn.classList.toggle('active', t === name);
  });
  closeToc();
  syncTocToggleVisibility(name);
}
window.switchTab = switchTab;
syncTocToggleVisibility('summary');

/* ────────────────────────────────────
   CLOZE UTILS（note-app.js を完全移植）
   ⟦⟦語句⟧⟧ → .cloze-word.cloze-hidden span
──────────────────────────────────── */

// MD テキストから cloze span を生成して HTML を返す
// marked がエスケープしないようプレースホルダ方式
function parseCloze(mdText) {
  const map = [];
  const safe = mdText.replace(/⟦⟦([\s\S]*?)⟧⟧/g, (_, t) => {
    map.push(t);
    return `CLZPH_${map.length - 1}_END`;
  });
  let html = marked.parse(safe);
  html = html.replace(/CLZPH_(\d+)_END/g, (_, i) => {
    const text = escHtml(map[+i]);
    return `<span class="cloze-word cloze-hidden" onclick="toggleCloze(this)" data-answer="${text}">${text}</span>`;
  });
  return { html, count: map.length };
}

// まとめタブ用：cloze を .cloze-hint（下線ハイライト）に変換
function parseClozeHint(mdText) {
  const map = [];
  const safe = mdText.replace(/⟦⟦([\s\S]*?)⟧⟧/g, (_, t) => {
    map.push(t);
    return `CLZPH_${map.length - 1}_END`;
  });
  let html = marked.parse(safe);
  html = html.replace(/CLZPH_(\d+)_END/g, (_, i) =>
    `<span class="cloze-hint">${escHtml(map[+i])}</span>`
  );
  return html;
}

/* ── note-app.js の toggleCloze / revealAll / hideAll ── */
function toggleCloze(el) {
  el.classList.toggle('cloze-hidden');
  el.classList.toggle('revealed');
  updateQuizScore();
}
function revealAll() {
  document.querySelectorAll('#quizWrap .cloze-word').forEach(el => {
    el.classList.remove('cloze-hidden');
    el.classList.add('revealed');
  });
  updateQuizScore();
  showToast('すべて表示しました');
}
function hideAll() {
  document.querySelectorAll('#quizWrap .cloze-word').forEach(el => {
    el.classList.add('cloze-hidden');
    el.classList.remove('revealed');
  });
  updateQuizScore();
  showToast('すべて隠しました');
}
function updateQuizScore() {
  const all      = document.querySelectorAll('#quizWrap .cloze-word');
  const revealed = document.querySelectorAll('#quizWrap .cloze-word.revealed');
  const scoreEl  = document.getElementById('quizScore');
  if (scoreEl) scoreEl.textContent = `${revealed.length} / ${all.length}`;
}
window.toggleCloze = toggleCloze;
window.revealAll   = revealAll;
window.hideAll     = hideAll;

/* ────────────────────────────────────
   SIDE NAV（スクロール連動アクティブ）
──────────────────────────────────── */
function buildSideNav(container) {
  const headings = [...container.querySelectorAll('h2, h3')];
  const list = document.getElementById('navList');
  list.innerHTML = headings.map((h, i) => {
    h.id = 'h-' + i;
    const cls = h.tagName === 'H3' ? ' class="h3"' : '';
    return `<li${cls}><a href="#h-${i}">${h.textContent}</a></li>`;
  }).join('');

  const links = list.querySelectorAll('a');
  if (!links.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.remove('active'));
      list.querySelector(`a[href="#${e.target.id}"]`)?.classList.add('active');
    });
  }, { rootMargin: '-15% 0px -70% 0px' });
  headings.forEach(h => obs.observe(h));
}

/* ────────────────────────────────────
   RENDER SUMMARY（まとめタブ）
──────────────────────────────────── */
function renderSummary(mdText) {
  const el = document.getElementById('summaryContent');
  el.innerHTML = parseClozeHint(mdText);  // cloze は下線ハイライト表示
  el.style.display = 'block';
  document.getElementById('loadingSummary').style.display = 'none';
  buildSideNav(el);
}

/* ────────────────────────────────────
   RENDER QUIZ（穴埋めタブ）
──────────────────────────────────── */
// MD はまとめタブが fetch したものをキャッシュして使う
let _mdCache = null;

function renderQuiz(mdText) {
  const wrap      = document.getElementById('quizWrap');
  const controls  = document.getElementById('quizControls');
  const emptyEl   = document.getElementById('quizEmpty');
  const { html, count } = parseCloze(mdText);

  if (count === 0) {
    emptyEl.style.display = 'block';
    controls.style.display = 'none';
    return;
  }
  wrap.innerHTML = html;
  controls.style.display = 'flex';
  updateQuizScore();
}

/* ────────────────────────────────────
   RENDER TIMELINE（年表タブ）
──────────────────────────────────── */

function renderTimeline(events) {
  const wrap = document.getElementById('timelineContent');
  if (!events.length) {
    wrap.innerHTML = '<div class="empty-state"><span>📜</span>この王朝の年表データがありません。</div>';
    return;
  }
  wrap.innerHTML = events.map(ev => `
    <div class="tl-item" data-cat="${escHtml(ev.category ?? '')}">
      <span class="tl-year">${escHtml(formatYear(ev.year))}年</span>
      <span class="tl-icon">${CATEGORY_ICON[ev.category] ?? '•'}</span>
      <span class="tl-title">${escHtml(ev.title)}</span>
      <span class="tl-cat">${escHtml(ev.category ?? 'その他')}</span>
    </div>`).join('');
}

/* ────────────────────────────────────
   RENDER FIGURES（人物タブ）
──────────────────────────────────── */
function renderFigures(figures) {
  const wrap = document.getElementById('figuresContent');
  if (!figures.length) {
    wrap.innerHTML = '<div class="empty-state"><span>👤</span>この王朝の文化人物データがありません。</div>';
    return;
  }
  const groups = {};
  figures.forEach(f => { (groups[f.category] ??= []).push(f); });
  wrap.innerHTML = Object.entries(groups).map(([cat, people]) => `
    <div class="fig-section">
      <p class="fig-section__label">${escHtml(cat)}</p>
      <div class="fig-grid">
        ${people.sort((a,b) => a.era - b.era).map(p => `
          <div class="fig-card" onclick="this.classList.toggle('open')">
            <p class="fig-card__name">${escHtml(p.name)}</p>
            <p class="fig-card__dynasty">${escHtml(p.dynasty)}</p>
            <ul class="fig-card__works">
              ${p.works.map(w => `<li>${escHtml(w)}</li>`).join('')}
            </ul>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

/* ────────────────────────────────────
   TOAST
──────────────────────────────────── */
let _toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('visible'), 1800);
}

/* ────────────────────────────────────
   INIT
──────────────────────────────────── */
async function init() {
  // 年表・人物は同期で即レンダリング
  const events = (typeof EVENTS !== 'undefined' ? EVENTS : [])
    .filter(ev => ev.year >= dynasty.start && ev.year <= dynasty.end)
    .sort((a, b) => a.year - b.year);
  renderTimeline(events);

  const figures = (typeof quizData !== 'undefined' ? quizData : [])
    .filter(q => dynasty.quizMatch?.includes(q.dynasty));
  renderFigures(figures);

  // まとめ MD を fetch → まとめ・穴埋め両タブに流す
  try {
    const res = await fetch(`notes/${slug}.md`);
    if (!res.ok) throw new Error(res.status);
    _mdCache = await res.text();
    renderSummary(_mdCache);
    renderQuiz(_mdCache);
  } catch {
    // ノートなし
    document.getElementById('loadingSummary').style.display = 'none';
    document.getElementById('summaryContent').innerHTML =
      '<div class="empty-state"><span>📝</span>まだノートが作成されていません。</div>';
    document.getElementById('summaryContent').style.display = 'block';
    // 穴埋めタブも同様
    document.getElementById('quizEmpty').style.display = 'block';
    // side-nav は空のまま（ノートがないので目次も不要）
    document.getElementById('navList').innerHTML = '';
  }
}

init();
