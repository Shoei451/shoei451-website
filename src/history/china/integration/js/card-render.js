// js/card-render.js
// index.html 用カードレンダラー + 検索エンジン統合
// 依存: js/common/dynasties.js, js/common/events.js, js/common/quizdata.js, js/common/search.js

// ─── CARD RENDER ───
function createCard(d, query = '', hitResult = null) {
  const href      = `dynasty.html?slug=${d.slug}`;
  const periodStr = formatPeriod(d);

  // 検索クエリでハイライト
  const hl = (str) => {
    if (!query) return escHtml(str);
    const re = new RegExp('(' + escRe(query) + ')', 'gi');
    return escHtml(str).replace(re, '<mark style="background:var(--color-accent-light);color:var(--color-accent)">$1</mark>');
  };

  // ヒット理由スニペット（name/era 以外のフィールドからマッチした場合だけ表示）
  const snippetHtml = (() => {
    if (!hitResult || !query) return '';
    const q = query.toLowerCase();
    const nonObvious = hitResult.matches.filter(m => {
      const plain = m.replace(/…/g, '').trim().toLowerCase();
      return !d.name.toLowerCase().includes(plain) &&
             !d.era.toLowerCase().includes(plain);
    });
    if (!nonObvious.length) return '';
    return `<p class="dynasty-card__snip">${SearchEngine.highlight(escHtml(nonObvious[0]), query)}</p>`;
  })();

  const card = document.createElement('a');
  card.className = 'dynasty-card';
  card.href = href;
  card.dataset.slug = d.slug;
  card.style.setProperty('--card-color', d.color);
  card.innerHTML = `
    <p class="dynasty-card__era">${d.era}</p>
    <p class="dynasty-card__name">${hl(d.name)}</p>
    <p class="dynasty-card__period">${hl(periodStr)}</p>
    ${d.capital ? `<p class="dynasty-card__capital">${hl(d.capital)}</p>` : ''}
    ${snippetHtml}
    <span class="dynasty-card__badge" data-badge="${d.slug}">準備中</span>
  `;
  return card;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escRe(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── RENDER ALL ───
// ERA_ORDER は dynasties.js で定義済み

function renderAll(query = '', hitSlugs = null, searchResults = []) {
  const container = document.getElementById('dynastyContainer');
  container.innerHTML = '';

  const q = query.trim().toLowerCase();

  // hitSlugs があれば SearchEngine の結果を優先、なければ既存フィルタ
  const filtered = hitSlugs
    ? DYNASTIES.filter(d => hitSlugs.has(d.slug))
    : q
      ? DYNASTIES.filter(d =>
          d.name.toLowerCase().includes(q) ||
          (d.nameAlts ?? []).some(a => a.toLowerCase().includes(q)) ||
          (d.capital ?? '').toLowerCase().includes(q) ||
          d.era.toLowerCase().includes(q) ||
          formatPeriod(d).includes(q)
        )
      : DYNASTIES;

  document.getElementById('searchEmpty').style.display =
    filtered.length === 0 ? 'block' : 'none';
  document.getElementById('searchQuery').textContent = query;

  // era でグループ化して表示
  ERA_ORDER.forEach(era => {
    const group = filtered.filter(d => d.era === era);
    if (!group.length) return;

    const section = document.createElement('section');
    section.className = 'era-section';
    section.dataset.era = era;

    section.innerHTML = `
      <div class="era-divider">
        <div class="era-divider__line"></div>
        <span class="era-divider__label">${era}</span>
        <div class="era-divider__line" style="background:linear-gradient(to left,var(--color-border),transparent)"></div>
      </div>
      <div class="dynasty-grid" id="grid-${era}"></div>
    `;
    container.appendChild(section);

    const grid = section.querySelector('.dynasty-grid');
    group.forEach(d => {
      const hitResult = searchResults.find(r => r.slug === d.slug) ?? null;
      grid.appendChild(createCard(d, q, hitResult));
    });
  });

  // 非同期でノートの有無を確認してバッジを更新
  checkNotesExistence();
}

// ─── CHECK notes/{slug}.md existence ───
async function checkNotesExistence() {
  await Promise.allSettled(
    DYNASTIES.map(async d => {
      try {
        const res = await fetch(`notes/${d.slug}.md`, { method: 'HEAD' });
        if (res.ok) {
          document.querySelectorAll(`[data-badge="${d.slug}"]`).forEach(el => {
            el.textContent = 'ノートあり';
            el.classList.add('ready');
          });
          document.querySelectorAll(`[data-slug="${d.slug}"]`).forEach(el => {
            el.classList.remove('wip');
          });
        } else {
          document.querySelectorAll(`[data-slug="${d.slug}"]`).forEach(el => {
            el.classList.add('wip');
          });
        }
      } catch {
        document.querySelectorAll(`[data-slug="${d.slug}"]`).forEach(el => {
          el.classList.add('wip');
        });
      }
    })
  );
}

// ─── SEARCH ───
// SearchEngine インデックスをページロード時に即時構築
SearchEngine.buildIndex();

let searchTimer = null;
function handleSearch(val) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    const q = val.trim();
    if (!q) {
      renderAll('', null, []);
      return;
    }
    const results   = SearchEngine.search(q);
    const hitSlugs  = new Set(results.map(r => r.slug));
    renderAll(q, hitSlugs, results);
  }, 120);
}

// ─── KEYBOARD SHORTCUTS ───
document.addEventListener('keydown', e => {
  // ⌘K / Ctrl+K でサーチフォーカス
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('searchInput')?.focus();
    return;
  }
  // Escape でクリア
  if (e.key === 'Escape') {
    const inp = document.getElementById('searchInput');
    if (inp?.value) {
      inp.value = '';
      handleSearch('');
    }
  }
});

// ─── INIT ───
renderAll();