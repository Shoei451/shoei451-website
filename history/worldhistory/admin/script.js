// ============================================================
// 世界史年表 管理画面 - script.js
// ⚠️ anon key は公開前提（RLSで制御）
//    Service Role Key は絶対にフロントに書かないこと！
// ============================================================


// ============================================================
// State
// ============================================================
const PAGE_SIZE = 50;

let currentPageData = [];   // 今表示中のページのデータのみ（全件は持たない）
let currentCategory = 'all';
let currentViewMode = 'chapter';
let searchQuery     = '';
let currentPage     = 0;
let totalCount      = 0;
let isFetching      = false;
let searchDebounce  = null;

const chapters = [
    { value: "第1章",  label: "古代文明圏" },
    { value: "第2章",  label: "中世ヨーロッパ" },
    { value: "第3章",  label: "近現代ヨーロッパ" },
    { value: "第4章",  label: "東アジア（中国・モンゴル）" },
    { value: "第5章",  label: "東アジア（日本・朝鮮）" },
    { value: "第6章",  label: "イスラーム世界" },
    { value: "第7章",  label: "南アジア・東南アジア" },
    { value: "第8章",  label: "アメリカ大陸" },
    { value: "第9章",  label: "第一次世界大戦" },
    { value: "第10章", label: "第二次世界大戦" },
    { value: "第11章", label: "戦後国際史" }
];

const periods = [
    { value: "~0",        label: "紀元前" },
    { value: "1~1000",    label: "1年~1000年" },
    { value: "1001~1500", label: "1001年~1500年" },
    { value: "1501~1700", label: "1501年~1700年" },
    { value: "1701~1800", label: "1701年~1800年" },
    { value: "1801~1900", label: "1801年~1900年" },
    { value: "1901~1945", label: "1901年~1945年" },
    { value: "1946~1989", label: "1946年~1989年" },
    { value: "1990~",     label: "1990年~" }
];

// ============================================================
// Theme
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
    if (session) {
        showAdminScreen(session.user);
    } else {
        showLoginScreen();
    }

    db.auth.onAuthStateChange((_event, session) => {
        if (session) {
            showAdminScreen(session.user);
        } else {
            showLoginScreen();
        }
    });
});

// ============================================================
// Auth
// ============================================================
async function handleLogin() {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn      = document.getElementById('loginBtn');

    if (!email || !password) {
        showLoginError('メールアドレスとパスワードを入力してください');
        return;
    }

    btn.textContent = 'ログイン中...';
    btn.disabled = true;
    document.getElementById('loginError').style.display = 'none';

    const { error } = await db.auth.signInWithPassword({ email, password });

    btn.textContent = 'ログイン';
    btn.disabled = false;

    if (error) {
        showLoginError('ログインに失敗しました。メールアドレスまたはパスワードが違います。');
    }
}

async function handleLogout() {
    await db.auth.signOut();
}

function showLoginError(msg) {
    const el = document.getElementById('loginError');
    el.textContent = msg;
    el.style.display = 'block';
}

// ============================================================
// Screen switching
// ============================================================
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminScreen').style.display = 'none';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').style.display = 'none';
}

async function showAdminScreen(user) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminScreen').style.display = 'block';
    document.getElementById('loggedInUser').textContent = user.email;

    setupEventListeners();
    renderTabs();
    await fetchTotalCount();   // まず全件数だけ高速取得
    await fetchPage(0);        // 最初の50件だけ取得
}

// ============================================================
// Data fetching（ここが核心 - サーバーサイドで絞り込む）
// ============================================================

/**
 * 現在のフィルタ条件で全件数を取得（件数だけ、データは転送しない）
 * Supabase の count:'exact' + head:true はボディを返さない → 超高速
 */
async function fetchTotalCount() {
    let query = db
        .from('world_history_quiz')
        .select('*', { count: 'exact', head: true });

    query = applyFilters(query);

    const { count, error } = await query;
    if (error) { console.error('Count error:', error); return; }

    totalCount = count ?? 0;
    document.getElementById('totalEvents').textContent = totalCount;
}

/**
 * 指定ページのデータを取得（PAGE_SIZE件のみ）
 */
async function fetchPage(page) {
    if (isFetching) return;
    isFetching = true;
    setLoadingState(true);

    const from = page * PAGE_SIZE;
    const to   = from + PAGE_SIZE - 1;

    let query = db
        .from('world_history_quiz')
        .select('*')
        .order('is_bc', { ascending: false })
        .order('year',  { ascending: true })
        .range(from, to);

    query = applyFilters(query);

    const { data, error } = await query;

    isFetching = false;
    setLoadingState(false);

    if (error) {
        console.error('Fetch error:', error);
        document.getElementById('timelineContainer').innerHTML = `
            <div class="empty-state">
                <p>⚠️ データの読み込みに失敗しました</p>
                <p style="font-size:0.9rem;margin-top:8px;">${escapeHtml(error.message)}</p>
            </div>`;
        return;
    }

    currentPageData = data ?? [];
    currentPage = page;

    renderTimeline();
    renderPagination();
}

/**
 * クエリにフィルタを適用（チャプター/時代 + 全文検索）
 */
function applyFilters(query) {
    if (currentCategory !== 'all') {
        const col = currentViewMode === 'period' ? 'period' : 'chapter';
        query = query.eq(col, currentCategory);
    }
    if (searchQuery.trim()) {
        query = query.ilike('event', `%${searchQuery.trim()}%`);
    }
    return query;
}

/**
 * フィルタが変わったとき: ページをリセットして件数＋データを再取得
 */
async function resetAndFetch() {
    currentPage = 0;
    await fetchTotalCount();
    await fetchPage(0);
}

function setLoadingState(loading) {
    if (loading) {
        document.getElementById('timelineContainer').innerHTML =
            '<div class="loading">読み込み中...</div>';
    }
}

// ============================================================
// UI setup
// ============================================================
function setupEventListeners() {
    const searchBox = document.getElementById('searchBox');
    const viewMode  = document.getElementById('viewMode');
    searchBox.replaceWith(searchBox.cloneNode(true));
    viewMode.replaceWith(viewMode.cloneNode(true));

    // 検索：400ms デバウンス（毎キー入力でDBに問い合わせない）
    document.getElementById('searchBox').addEventListener('input', (e) => {
        searchQuery = e.target.value;
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => resetAndFetch(), 400);
    });

    document.getElementById('viewMode').addEventListener('change', (e) => {
        currentViewMode = e.target.value;
        currentCategory = 'all';
        renderTabs();
        resetAndFetch();
    });

    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('editForm').addEventListener('submit', handleFormSubmit);

    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target.id === 'editModal') closeModal();
    });

    document.getElementById('editYear').addEventListener('input', updatePeriodDisplay);
}

function renderTabs() {
    const container  = document.getElementById('categoryTabs');
    const categories = currentViewMode === 'period' ? periods : chapters;

    container.innerHTML = `
        <button class="tab active" data-category="all">すべて</button>
        ${categories.map(cat =>
            `<button class="tab" data-category="${cat.value}">${cat.label}</button>`
        ).join('')}
    `;

    container.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            resetAndFetch();
        });
    });
}

// ============================================================
// Render
// ============================================================
function renderTimeline() {
    const container = document.getElementById('timelineContainer');
    document.getElementById('displayedEvents').textContent = totalCount;

    if (currentPageData.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>イベントがありません</p></div>`;
        return;
    }

    container.innerHTML = `
        <table class="timeline-table">
            <thead>
                <tr>
                    <th style="width:100px;">年代</th>
                    <th style="width:35%;">出来事</th>
                    <th style="width:15%;">${currentViewMode === 'period' ? '章' : '時代'}</th>
                    <th style="width:10%;">リンク</th>
                    <th style="width:150px;">操作</th>
                </tr>
            </thead>
            <tbody>
                ${currentPageData.map(event => `
                    <tr>
                        <td class="event-year">${formatYear(event)}</td>
                        <td class="event-title">${escapeHtml(event.event)}</td>
                        <td>
                            <span class="category-chip chapter-chip ${escapeHtml(event.chapter)}">
                                ${escapeHtml(event.chapter)}
                            </span>
                        </td>
                        <td>
                            ${event.link
                                ? `<a href="${escapeHtml(event.link)}" target="_blank" rel="noopener" class="event-link">🔗</a>`
                                : '-'}
                        </td>
                        <td class="event-actions">
                            <button class="btn-edit"   onclick="editEvent(${event.id})">編集</button>
                            <button class="btn-delete" onclick="deleteEvent(${event.id})">削除</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderPagination() {
    let paginationEl = document.getElementById('pagination');
    if (!paginationEl) {
        paginationEl = document.createElement('div');
        paginationEl.id = 'pagination';
        paginationEl.className = 'pagination';
        document.getElementById('timelineContainer').after(paginationEl);
    }

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    if (totalPages <= 1) {
        paginationEl.innerHTML = '';
        return;
    }

    const start = currentPage * PAGE_SIZE + 1;
    const end   = Math.min((currentPage + 1) * PAGE_SIZE, totalCount);

    paginationEl.innerHTML = `
        <button class="btn-page" id="prevPage" ${currentPage === 0 ? 'disabled' : ''}>← 前へ</button>
        <span class="page-info">
            ${start}〜${end} 件 / 全${totalCount}件
            &nbsp;（${currentPage + 1} / ${totalPages} ページ）
        </span>
        <button class="btn-page" id="nextPage" ${currentPage >= totalPages - 1 ? 'disabled' : ''}>次へ →</button>
    `;

    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 0) fetchPage(currentPage - 1);
    });
    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage < totalPages - 1) fetchPage(currentPage + 1);
    });
}

// ============================================================
// Helpers
// ============================================================
function formatYear(event) {
    return event.is_bc ? `前${event.year}年` : `${event.year}年`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = String(text ?? '');
    return div.innerHTML;
}

function parseYearInput(yearStr) {
    const is_bc = yearStr.startsWith('前');
    const numericYear = parseInt(yearStr.replace(/[^\d]/g, ''), 10);
    return { numericYear, is_bc };
}

function determinePeriod(year, is_bc) {
    if (is_bc)        return "~0";
    if (year <= 1000) return "1~1000";
    if (year <= 1500) return "1001~1500";
    if (year <= 1700) return "1501~1700";
    if (year <= 1800) return "1701~1800";
    if (year <= 1900) return "1801~1900";
    if (year <= 1945) return "1901~1945";
    if (year <= 1989) return "1946~1989";
    return "1990~";
}

function updatePeriodDisplay() {
    const yearStr = document.getElementById('editYear').value.trim();
    const periodLabels = {
        "~0":        "紀元前",
        "1~1000":    "1年~1000年",
        "1001~1500": "1001年~1500年",
        "1501~1700": "1501年~1700年",
        "1701~1800": "1701年~1800年",
        "1801~1900": "1801年~1900年",
        "1901~1945": "1901年~1945年",
        "1946~1989": "1946年~1989年",
        "1990~":     "1990年~"
    };
    if (!yearStr) { document.getElementById('editPeriod').value = ''; return; }
    const { numericYear, is_bc } = parseYearInput(yearStr);
    if (!numericYear || isNaN(numericYear)) { document.getElementById('editPeriod').value = ''; return; }
    document.getElementById('editPeriod').value = periodLabels[determinePeriod(numericYear, is_bc)] || '';
}

// ============================================================
// Modal
// ============================================================
function openAddModal() {
    document.getElementById('modalTitle').textContent = '新規イベントを追加';
    document.getElementById('editForm').reset();
    document.getElementById('editEventId').value = '';
    document.getElementById('editModal').classList.add('active');
}

function editEvent(id) {
    // currentPageData から検索（表示中ページのみメモリに持つ）
    const event = currentPageData.find(e => e.id === id);
    if (!event) return;

    document.getElementById('modalTitle').textContent   = 'イベントを編集';
    document.getElementById('editEventId').value        = event.id;
    document.getElementById('editYear').value           = event.is_bc ? `前${event.year}` : `${event.year}`;
    document.getElementById('editEvent').value          = event.event;
    document.getElementById('editChapter').value        = event.chapter;
    document.getElementById('editLink').value           = event.link || '';
    updatePeriodDisplay();
    document.getElementById('editModal').classList.add('active');
}

function closeModal() {
    document.getElementById('editModal').classList.remove('active');
}

// ============================================================
// CRUD
// ============================================================
async function deleteEvent(id) {
    const event = currentPageData.find(e => e.id === id);
    if (!event) return;
    if (!confirm(`「${event.event}」を削除してもよろしいですか？\n\nこの操作は取り消せません。`)) return;

    const { error } = await db
        .from('world_history_quiz')
        .delete()
        .eq('id', id);

    if (error) {
        alert('削除に失敗しました: ' + error.message);
        return;
    }

    await resetAndFetch();
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const yearStr   = document.getElementById('editYear').value.trim();
    const eventText = document.getElementById('editEvent').value.trim();
    const chapter   = document.getElementById('editChapter').value;
    const link      = document.getElementById('editLink').value.trim();
    const eventId   = document.getElementById('editEventId').value;

    if (!yearStr || !eventText) { alert('年号と出来事を入力してください'); return; }

    const { numericYear, is_bc } = parseYearInput(yearStr);
    if (!numericYear || isNaN(numericYear)) { alert('年号が解釈できません'); return; }

    const payload = {
        year:    numericYear,
        is_bc,
        event:   eventText,
        chapter,
        period:  determinePeriod(numericYear, is_bc),
        link:    link || null
    };

    let error;
    if (eventId) {
        ({ error } = await db.from('world_history_quiz').update(payload).eq('id', eventId));
    } else {
        ({ error } = await db.from('world_history_quiz').insert([payload]));
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
