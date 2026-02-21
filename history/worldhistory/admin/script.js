// ============================================================
// 世界史年表 管理画面 - script.js
// ============================================================

const SUPABASE_URL = 'https://gjuqsyaugrsshmjerhme.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdXFzeWF1Z3Jzc2htamVyaG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NzA3NTYsImV4cCI6MjA4MjA0Njc1Nn0.V8q5ddz5tPy7wBaQ73aGtmCZyqzA6pPciPRwRIZjJcs';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// State
// ============================================================
let allEvents = [];
let currentCategory = 'all';
let currentViewMode = 'chapter';
let searchQuery = '';

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

    // テーマトグル
    document.getElementById('theme-toggle').addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.toggle('dark');
        localStorage.setItem('pref-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });

    // ログインボタン
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('loginPassword').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // ログアウトボタン
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // セッション確認（リロード時に維持）
    const { data: { session } } = await db.auth.getSession();
    if (session) {
        showAdminScreen(session.user);
    } else {
        showLoginScreen();
    }

    // セッション変化を監視
    db.auth.onAuthStateChange((_event, session) => {
        if (session) {
            showAdminScreen(session.user);
        } else {
            showLoginScreen();
        }
    });
});

// ============================================================
// Auth: Login / Logout
// ============================================================
async function handleLogin() {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl  = document.getElementById('loginError');
    const btn      = document.getElementById('loginBtn');

    if (!email || !password) {
        showLoginError('メールアドレスとパスワードを入力してください');
        return;
    }

    btn.textContent = 'ログイン中...';
    btn.disabled = true;
    errorEl.style.display = 'none';

    const { error } = await db.auth.signInWithPassword({ email, password });

    btn.textContent = 'ログイン';
    btn.disabled = false;

    if (error) {
        showLoginError('ログインに失敗しました。メールアドレスまたはパスワードが違います。');
        console.error('Login error:', error.message);
    }
    // 成功時は onAuthStateChange が自動で showAdminScreen を呼ぶ
}

async function handleLogout() {
    await db.auth.signOut();
    // onAuthStateChange が showLoginScreen を呼ぶ
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

    await loadEvents();
    setupEventListeners();
    renderTabs();
    renderTimeline();
}

// ============================================================
// Data loading
// ============================================================
async function loadEvents() {
    try {
        let collected = [];
        let start = 0;
        const batchSize = 1000;

        while (true) {
            const { data, error } = await db
                .from('world_history_quiz')
                .select('*')
                .order('is_bc', { ascending: false })
                .order('year', { ascending: true })
                .range(start, start + batchSize - 1);

            if (error) throw error;
            if (!data || data.length === 0) break;

            collected.push(...data);
            if (data.length < batchSize) break;
            start += batchSize;
        }

        allEvents = collected;
        document.getElementById('totalEvents').textContent = allEvents.length;
    } catch (error) {
        console.error('Error loading events:', error);
        document.getElementById('timelineContainer').innerHTML = `
            <div class="empty-state">
                <p>⚠️ データの読み込みに失敗しました</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">${escapeHtml(error.message)}</p>
            </div>`;
    }
}

// ============================================================
// UI setup
// ============================================================
function setupEventListeners() {
    // 重複登録を防ぐ
    const searchBox = document.getElementById('searchBox');
    const viewMode  = document.getElementById('viewMode');
    searchBox.replaceWith(searchBox.cloneNode(true));
    viewMode.replaceWith(viewMode.cloneNode(true));

    document.getElementById('searchBox').addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderTimeline();
    });

    document.getElementById('viewMode').addEventListener('change', (e) => {
        currentViewMode = e.target.value;
        currentCategory = 'all';
        renderTabs();
        renderTimeline();
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
    const container   = document.getElementById('categoryTabs');
    const categories  = currentViewMode === 'period' ? periods : chapters;

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
            renderTimeline();
        });
    });
}

function renderTimeline() {
    const container = document.getElementById('timelineContainer');

    const filtered = allEvents.filter(event => {
        const matchesCategory =
            currentCategory === 'all' ||
            (currentViewMode === 'period'
                ? event.period   === currentCategory
                : event.chapter  === currentCategory);
        const matchesSearch =
            !searchQuery ||
            event.event.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    document.getElementById('displayedEvents').textContent = filtered.length;

    if (filtered.length === 0) {
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
                ${filtered.map(event => `
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
    if (is_bc)       return "~0";
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
// Modal: open / close
// ============================================================
function openAddModal() {
    document.getElementById('modalTitle').textContent = '新規イベントを追加';
    document.getElementById('editForm').reset();
    document.getElementById('editEventId').value = '';
    document.getElementById('editModal').classList.add('active');
}

function editEvent(id) {
    const event = allEvents.find(e => e.id === id);
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
    const event = allEvents.find(e => e.id === id);
    if (!event) return;
    if (!confirm(`「${event.event}」を削除してもよろしいですか？\n\nこの操作は取り消せません。`)) return;

    const { error } = await db
        .from('world_history_quiz')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Delete error:', error);
        alert('削除に失敗しました: ' + error.message);
        return;
    }
    await loadEvents();
    renderTimeline();
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
        console.error('Save error:', error);
        // RLS違反の場合は分かりやすいメッセージに
        const msg = error.code === '42501'
            ? '権限エラー：このアカウントには編集権限がありません'
            : '保存に失敗しました: ' + error.message;
        alert(msg);
        return;
    }

    closeModal();
    await loadEvents();
    renderTimeline();
}
