// ============================================================
// 世界史年表 管理画面 (wh_dates) - script.js
// Supabase Project 1: gjuqsyaugrsshmjerhme
// db は js/supabase_config.js から提供される
// ============================================================

// ============================================================
// State
// ============================================================
const PAGE_SIZE = 50;

let currentPageData = [];
let currentRecordType = 'all';
let currentRegion    = 'all';
let currentField     = 'all';
let searchQuery      = '';
let currentPage      = 0;
let totalCount       = 0;
let isFetching       = false;
let searchDebounce   = null;
let regions          = [];   // wh_regions から取得

const RECORD_TYPE_LABELS = { event: '出来事', period: '期間', person: '人物' };
const FIELDS = ['政治', '経済', '文化・宗教', '社会', '外交・戦争'];

// ============================================================
// Theme（インライン化 — theme-toggle.js に依存しない）
// ============================================================
(function initTheme() {
    const pref = localStorage.getItem('pref-theme');
    if (pref === 'dark' || (!pref && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark');
    }
})();

// ============================================================
// Entry point
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {

    document.getElementById('theme-toggle').addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.toggle('dark');
        localStorage.setItem('pref-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });

    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('loginPassword').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    const { data: { session } } = await db.auth.getSession();
    if (session) showAdminScreen(session.user);
    else         showLoginScreen();

    db.auth.onAuthStateChange((_event, session) => {
        if (session) showAdminScreen(session.user);
        else         showLoginScreen();
    });
});

// ============================================================
// Auth
// ============================================================
async function handleLogin() {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn      = document.getElementById('loginBtn');

    if (!email || !password) { showLoginError('メールアドレスとパスワードを入力してください'); return; }

    btn.textContent = 'ログイン中...';
    btn.disabled = true;
    document.getElementById('loginError').style.display = 'none';

    const { error } = await db.auth.signInWithPassword({ email, password });

    btn.textContent = 'ログイン';
    btn.disabled = false;

    if (error) showLoginError('ログインに失敗しました。メールアドレスまたはパスワードが違います。');
}

async function handleLogout() {
    await db.auth.signOut();
}

function showLoginError(msg) {
    const el = document.getElementById('loginError');
    el.textContent = msg;
    el.style.display = 'block';
}

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminScreen').style.display  = 'none';
    document.getElementById('loginEmail').value    = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').style.display = 'none';
}

async function showAdminScreen(user) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminScreen').style.display = 'block';
    document.getElementById('loggedInUser').textContent  = user.email;

    await loadRegions();
    setupEventListeners();
    await fetchTotalCount();
    await fetchPage(0);
}

// ============================================================
// Data — wh_regions
// ============================================================
async function loadRegions() {
    const { data, error } = await db.from('wh_regions').select('*').order('sort');
    if (error) { console.error('wh_regions 取得失敗:', error.message); return; }

    regions = data ?? [];

    const sel = document.getElementById('regionFilter');
    regions.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.key;
        opt.textContent = r.label;
        sel.appendChild(opt);
    });
}

function getRegionLabel(key) {
    return regions.find(r => r.key === key)?.label ?? key;
}

// ============================================================
// Data — wh_dates フェッチ
// ============================================================
function applyFilters(query) {
    if (currentRecordType !== 'all') query = query.eq('record_type', currentRecordType);
    if (currentRegion !== 'all')     query = query.contains('region', [currentRegion]);
    if (currentField !== 'all')      query = query.eq('field', currentField);
    if (searchQuery.trim())          query = query.ilike('event', `%${searchQuery.trim()}%`);
    return query;
}

async function fetchTotalCount() {
    let q = db.from('wh_dates').select('*', { count: 'exact', head: true });
    q = applyFilters(q);
    const { count, error } = await q;
    if (error) { console.error('count error:', error.message); return; }
    totalCount = count ?? 0;
    document.getElementById('totalEvents').textContent = totalCount;
}

async function fetchPage(page) {
    if (isFetching) return;
    isFetching = true;
    document.getElementById('timelineContainer').innerHTML = '<div class="loading">読み込み中...</div>';

    const from = page * PAGE_SIZE;
    const to   = from + PAGE_SIZE - 1;

    let q = db
        .from('wh_dates')
        .select('*')
        .order('year', { ascending: true, nullsFirst: false })
        .range(from, to);
    q = applyFilters(q);

    const { data, error } = await q;
    isFetching = false;

    if (error) {
        document.getElementById('timelineContainer').innerHTML = `
            <div class="empty-state">
                <p>⚠️ データの取得に失敗しました</p>
                <p style="font-size:0.9rem;margin-top:8px;">${escapeHtml(error.message)}</p>
            </div>`;
        return;
    }

    currentPageData = data ?? [];
    currentPage = page;
    renderTimeline();
    renderPagination();
}

async function resetAndFetch() {
    currentPage = 0;
    await fetchTotalCount();
    await fetchPage(0);
}

// ============================================================
// Render — テーブル
// ============================================================
function renderTimeline() {
    const container = document.getElementById('timelineContainer');
    document.getElementById('displayedEvents').textContent = totalCount;

    if (!currentPageData.length) {
        container.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                    </path>
                </svg>
                <p>データがありません</p>
            </div>`;
        return;
    }

    container.innerHTML = `
        <table class="timeline-table">
            <thead>
                <tr>
                    <th style="width:150px;">年代</th>
                    <th>出来事</th>
                    <th style="width:80px;">種別</th>
                    <th style="width:110px;">分野</th>
                    <th class="col-region">地域</th>
                    <th style="width:50px;">Wiki</th>
                    <th style="width:140px;">操作</th>
                </tr>
            </thead>
            <tbody>
                ${currentPageData.map(row => `
                    <tr>
                        <td class="event-year">${escapeHtml(formatYearRange(row))}</td>
                        <td class="event-title">${escapeHtml(row.event)}</td>
                        <td><span class="category-chip record-chip record-chip--${escapeHtml(row.record_type)}">
                            ${escapeHtml(RECORD_TYPE_LABELS[row.record_type] ?? row.record_type)}
                        </span></td>
                        <td>${row.field
                            ? `<span class="category-chip field-chip field-chip--${escapeHtml(row.field)}">${escapeHtml(row.field)}</span>`
                            : '<span style="color:var(--text-light-secondary);font-size:0.85rem;">-</span>'}</td>
                        <td class="col-region">
                            ${(row.region ?? []).map(r =>
                                `<span class="region-tag">${escapeHtml(getRegionLabel(r))}</span>`
                            ).join('')}
                        </td>
                        <td>${row.wiki_url
                            ? `<a href="${escapeHtml(row.wiki_url)}" target="_blank" rel="noopener" class="event-link">🔗</a>`
                            : '-'}</td>
                        <td class="event-actions">
                            <button class="btn-edit"   onclick="editEvent(${row.id})">編集</button>
                            <button class="btn-delete" onclick="deleteEvent(${row.id})">削除</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>`;
}

// ============================================================
// Render — ページネーション
// ============================================================
function renderPagination() {
    let el = document.getElementById('pagination');
    if (!el) {
        el = document.createElement('div');
        el.id = 'pagination';
        el.className = 'pagination';
        document.getElementById('timelineContainer').after(el);
    }

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    if (totalPages <= 1) { el.innerHTML = ''; return; }

    const start = currentPage * PAGE_SIZE + 1;
    const end   = Math.min((currentPage + 1) * PAGE_SIZE, totalCount);

    el.innerHTML = `
        <button class="btn-page" id="prevPage" ${currentPage === 0 ? 'disabled' : ''}>← 前へ</button>
        <span class="page-info">
            ${start}〜${end} 件 / 全${totalCount}件
            &nbsp;（${currentPage + 1} / ${totalPages} ページ）
        </span>
        <button class="btn-page" id="nextPage" ${currentPage >= totalPages - 1 ? 'disabled' : ''}>次へ →</button>`;

    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 0) fetchPage(currentPage - 1);
    });
    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage < totalPages - 1) fetchPage(currentPage + 1);
    });
}

// ============================================================
// Event listeners
// ============================================================
function setupEventListeners() {
    // 検索（400ms デバウンス）
    document.getElementById('searchBox').addEventListener('input', (e) => {
        searchQuery = e.target.value;
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => resetAndFetch(), 400);
    });

    // 地域・分野フィルタ
    document.getElementById('regionFilter').addEventListener('change', (e) => {
        currentRegion = e.target.value;
        resetAndFetch();
    });
    document.getElementById('fieldFilter').addEventListener('change', (e) => {
        currentField = e.target.value;
        resetAndFetch();
    });

    // 種別タブ
    document.querySelectorAll('.tab[data-record-type]').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.tab[data-record-type]').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentRecordType = e.target.dataset.recordType;
            resetAndFetch();
        });
    });

    // モーダル
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('editForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target.id === 'editModal') closeModal();
    });

    // フォーム内の動的表示切り替え
    document.getElementById('editRecordType').addEventListener('change', updateFormVisibility);
    document.getElementById('editDateType').addEventListener('change', updateFormVisibility);

    // Wikipedia 検索
    document.getElementById('wikiSearchBtn').addEventListener('click', doWikiSearch);
}

// ============================================================
// フォーム — 表示切り替え
// ============================================================
function updateFormVisibility() {
    const rt = document.getElementById('editRecordType').value;
    const dt = document.getElementById('editDateType').value;

    // year_end は period / person のとき表示
    document.getElementById('yearEndGroup').style.display =
        (rt === 'period' || rt === 'person') ? 'block' : 'none';

    // full_date は date_type=full のとき表示
    document.getElementById('fullDateGroup').style.display =
        dt === 'full' ? 'block' : 'none';
}

// ============================================================
// Wikipedia 検索
// ============================================================
async function doWikiSearch() {
    const query = document.getElementById('editEvent').value.trim();
    if (!query) { alert('先に「出来事」欄に名称を入力してください'); return; }

    const btn = document.getElementById('wikiSearchBtn');
    btn.textContent = '検索中...';
    btn.disabled = true;

    try {
        const res = await fetch(
            `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
        );
        if (res.ok) {
            const data = await res.json();
            showWikiResult(data);
        } else {
            showWikiResult(null, query);
        }
    } catch {
        showWikiResult(null, query);
    } finally {
        btn.textContent = '🔍 Wiki検索';
        btn.disabled = false;
    }
}

function showWikiResult(data, query = '') {
    const panel = document.getElementById('wikiResultPanel');

    if (!data) {
        panel.innerHTML = `
            <div class="wiki-result wiki-result--miss">
                「${escapeHtml(query)}」の記事がWikipediaで見つかりませんでした。
                URLを手動で入力してください。
            </div>`;
        panel.style.display = 'block';
        return;
    }

    const pageUrl = data.content_urls?.desktop?.page ?? '';
    const extract = data.extract ? data.extract.slice(0, 140) + '…' : '';

    panel.innerHTML = `
        <div class="wiki-result">
            <div class="wiki-result__title">${escapeHtml(data.title)}</div>
            <div class="wiki-result__extract">${escapeHtml(extract)}</div>
            <button type="button" class="wiki-result__use"
                onclick="useWikiUrl('${escapeHtml(pageUrl)}')">
                このURLを使用
            </button>
        </div>`;
    panel.style.display = 'block';
}

function useWikiUrl(url) {
    document.getElementById('editWikiUrl').value = url;
    document.getElementById('wikiResultPanel').style.display = 'none';
}

// ============================================================
// モーダル — 開く / 閉じる
// ============================================================
function openAddModal() {
    document.getElementById('modalTitle').textContent = '新規追加';
    document.getElementById('editForm').reset();
    document.getElementById('editEventId').value = '';
    document.getElementById('wikiResultPanel').style.display = 'none';
    renderRegionCheckboxes([]);
    updateFormVisibility();
    document.getElementById('editModal').classList.add('active');
}

function editEvent(id) {
    const row = currentPageData.find(r => r.id === id);
    if (!row) return;

    document.getElementById('modalTitle').textContent = '編集';
    document.getElementById('editEventId').value    = row.id;
    document.getElementById('editRecordType').value = row.record_type ?? 'event';
    document.getElementById('editYear').value       = row.year ?? '';
    document.getElementById('editYearEnd').value    = row.year_end ?? '';
    document.getElementById('editDateType').value   = row.date_type ?? 'year';
    document.getElementById('editFullDate').value   = row.full_date ?? '';
    document.getElementById('editEvent').value      = row.event ?? '';
    document.getElementById('editDescription').value = row.description ?? '';
    document.getElementById('editField').value      = row.field ?? '';
    document.getElementById('editWikiUrl').value    = row.wiki_url ?? '';
    document.getElementById('editMemo').value       = row.memo ?? '';
    document.getElementById('wikiResultPanel').style.display = 'none';

    renderRegionCheckboxes(row.region ?? []);
    updateFormVisibility();
    document.getElementById('editModal').classList.add('active');
}

function renderRegionCheckboxes(selected) {
    const container = document.getElementById('regionCheckboxes');
    container.innerHTML = regions.map(r => `
        <label class="region-checkbox-label">
            <input type="checkbox" name="region" value="${escapeHtml(r.key)}"
                ${selected.includes(r.key) ? 'checked' : ''}>
            ${escapeHtml(r.label)}
        </label>
    `).join('');
}

function closeModal() {
    document.getElementById('editModal').classList.remove('active');
}

// ============================================================
// CRUD
// ============================================================
async function deleteEvent(id) {
    const row = currentPageData.find(r => r.id === id);
    if (!row) return;
    if (!confirm(`「${row.event}」を削除してもよろしいですか？\n\nこの操作は取り消せません。`)) return;

    const { error } = await db.from('wh_dates').delete().eq('id', id);
    if (error) { alert('削除に失敗しました: ' + error.message); return; }
    await resetAndFetch();
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const eventText = document.getElementById('editEvent').value.trim();
    if (!eventText) { alert('出来事を入力してください'); return; }

    const yearRaw    = document.getElementById('editYear').value.trim();
    const yearEndRaw = document.getElementById('editYearEnd').value.trim();

    const selectedRegions = [...document.querySelectorAll('#regionCheckboxes input[type=checkbox]:checked')]
        .map(cb => cb.value);

    const payload = {
        record_type: document.getElementById('editRecordType').value,
        year:        yearRaw    !== '' ? parseInt(yearRaw,    10) : null,
        year_end:    yearEndRaw !== '' ? parseInt(yearEndRaw, 10) : null,
        date_type:   document.getElementById('editDateType').value,
        full_date:   document.getElementById('editFullDate').value || null,
        event:       eventText,
        description: document.getElementById('editDescription').value.trim() || null,
        region:      selectedRegions,
        field:       document.getElementById('editField').value || null,
        wiki_url:    document.getElementById('editWikiUrl').value.trim() || null,
        memo:        document.getElementById('editMemo').value.trim() || null,
    };

    const eventId = document.getElementById('editEventId').value;
    let error;

    if (eventId) {
        ({ error } = await db.from('wh_dates').update(payload).eq('id', eventId));
    } else {
        ({ error } = await db.from('wh_dates').insert([payload]));
    }

    if (error) {
        const msg = error.code === '42501'
            ? '権限エラー：このアカウントには編集権限がありません'
            : '保存に失敗しました: ' + error.message;
        alert(msg);
        return;
    }

    closeModal();
    await resetAndFetch();
}

