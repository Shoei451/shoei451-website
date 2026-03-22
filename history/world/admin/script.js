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

// ============================================================
// ウィザードモーダル ロジック
// script.js の末尾に追記（または既存の openAddModal / editEvent /
// handleFormSubmit を削除してこれで置き換える）
// ============================================================

// ── ウィザード状態 ──────────────────────────────────────────
const WIZ = {
    currentStep: 1,
    totalSteps:  4,
    isEdit:      false,
    selectedType: null,      // 'event' | 'period' | 'person'
    selectedRegions: new Set(),
    dupeCheckTimer: null,
};

// ── ユーティリティ ───────────────────────────────────────────
function wizFormatYear(y) {
    if (y === null || y === undefined || y === '') return '不明';
    const n = parseInt(y, 10);
    return n < 0 ? `前${Math.abs(n)}年` : `${n}年`;
}

// ── ステップUI更新 ────────────────────────────────────────────
function wizUpdateStepIndicator(step) {
    document.querySelectorAll('.wizard-step').forEach(el => {
        const n = parseInt(el.dataset.step, 10);
        el.classList.toggle('active', n === step);
        el.classList.toggle('done',   n < step);
    });
}

function wizShowStep(step) {
    document.querySelectorAll('.wizard-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    wizUpdateStepIndicator(step);
    WIZ.currentStep = step;

    const backBtn = document.getElementById('wizardBack');
    const nextBtn = document.getElementById('wizardNext');
    const saveBtn = document.getElementById('wizardSave');

    backBtn.style.display = step > 1 ? '' : 'none';
    nextBtn.style.display = step < WIZ.totalSteps ? '' : 'none';
    saveBtn.style.display = step === WIZ.totalSteps ? '' : 'none';

    if (step === WIZ.totalSteps) wizBuildConfirm();
}

// ── Step 1: 種別選択 ──────────────────────────────────────────
function wizInitStep1() {
    document.querySelectorAll('.record-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.record-type-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            WIZ.selectedType = btn.dataset.rtype;
            document.getElementById('editRecordType').value = WIZ.selectedType;
            // 自動で次へ
            setTimeout(() => wizGoNext(), 180);
        });
    });
}

// ── Step 2: フォーム切り替え ─────────────────────────────────
function wizUpdateStep2ForType(type) {
    const isEvent  = type === 'event';
    const isPeriod = type === 'period';
    const isPerson = type === 'person';

    document.getElementById('s2-year-block').style.display  = (isEvent || isPeriod) ? '' : 'none';
    document.getElementById('s2-person-block').style.display = isPerson ? '' : 'none';
    document.getElementById('s2-yearend-wrap').style.display = isPeriod ? '' : 'none';

    document.getElementById('s2-year-label').textContent  = isPeriod ? '開始年' : '年';
    document.getElementById('s2-event-label').textContent = isPerson ? '人物名' : '出来事';
    document.getElementById('s2-event-hint').textContent  = isPerson
        ? '人物名を正式な形で入力。'
        : '名詞形で短く。例: フランス革命';
}

// ── Step 2: 日付形式切り替え ─────────────────────────────────
function wizInitStep2() {
    document.getElementById('editDateType').addEventListener('change', e => {
        document.getElementById('s2-fulldate-wrap').style.display =
            e.target.value === 'full' ? '' : 'none';
    });

    // Wiki検索
    document.getElementById('wikiSearchBtn').addEventListener('click', doWikiSearch);

    // 重複チェック（debounce）
    document.getElementById('editEvent').addEventListener('input', () => {
        clearTimeout(WIZ.dupeCheckTimer);
        WIZ.dupeCheckTimer = setTimeout(wizCheckDuplicate, 500);
    });
    document.getElementById('editYear').addEventListener('change', wizCheckDuplicate);
}

// ── 重複チェック ─────────────────────────────────────────────
async function wizCheckDuplicate() {
    const eventText = document.getElementById('editEvent').value.trim();
    const yearText  = document.getElementById('editYear').value.trim();
    const panel     = document.getElementById('dupePanel');
    const banner    = document.getElementById('dupeBanner');
    const records   = document.getElementById('dupeRecords');

    if (eventText.length < 3) {
        panel.classList.add('hidden');
        return;
    }

    // 編集モードで自分自身のIDは除外
    const selfId = document.getElementById('editEventId').value;

    let q = db.from('wh_dates')
        .select('id, year, year_end, event, record_type')
        .ilike('event', `%${eventText}%`)
        .limit(5);

    if (selfId) q = q.neq('id', parseInt(selfId));

    const { data, error } = await q;
    if (error || !data || data.length === 0) {
        panel.classList.add('hidden');
        return;
    }

    // 年まで一致するものを「強警告」、名称だけ類似を「弱警告」
    const yearNum     = yearText !== '' ? parseInt(yearText) : null;
    const exactMatch  = yearNum !== null && data.some(r => r.year === yearNum);

    banner.className = `dupe-banner ${exactMatch ? 'warn-hard' : 'warn-soft'}`;
    banner.innerHTML = exactMatch
        ? `⚠️ <strong>同年・類似名の記録が存在します</strong> — 重複登録でないか確認してください`
        : `ℹ️ 類似する名称の記録があります（${data.length}件）`;

    records.innerHTML = data.map(r => `
        <div class="dupe-record-item">
            <span class="dupe-year">${wizFormatYear(r.year)}</span>
            <span class="dupe-event">${escapeHtml(r.event)}</span>
            <span class="category-chip record-chip record-chip--${escapeHtml(r.record_type)}" style="font-size:0.75rem;">
                ${escapeHtml({ event:'出来事', period:'期間', person:'人物' }[r.record_type] ?? r.record_type)}
            </span>
        </div>
    `).join('');

    panel.classList.remove('hidden');
}

// ── Step 3: 地域トグル ────────────────────────────────────────
function wizRenderRegionToggles(selected = []) {
    WIZ.selectedRegions = new Set(selected);
    const container = document.getElementById('regionToggles');
    container.innerHTML = regions.map(r => `
        <button type="button"
                class="region-toggle-btn ${selected.includes(r.key) ? 'selected' : ''}"
                data-key="${escapeHtml(r.key)}">
            ${escapeHtml(r.label)}
        </button>
    `).join('');

    container.querySelectorAll('.region-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.key;
            if (WIZ.selectedRegions.has(key)) {
                WIZ.selectedRegions.delete(key);
                btn.classList.remove('selected');
            } else {
                WIZ.selectedRegions.add(key);
                btn.classList.add('selected');
            }
        });
    });
}

// ── Step 4: 確認テーブル生成 ─────────────────────────────────
function wizBuildConfirm() {
    const type     = document.getElementById('editRecordType').value;
    const year     = document.getElementById('editYear').value;
    const yearEnd  = document.getElementById('editYearEnd').value;
    const birth    = document.getElementById('editYearBirth').value;
    const death    = document.getElementById('editYearDeath').value;
    const dateType = document.getElementById('editDateType').value;
    const fullDate = document.getElementById('editFullDate').value;
    const event    = document.getElementById('editEvent').value.trim();
    const field    = document.getElementById('editField').value;
    const desc     = document.getElementById('editDescription').value.trim();
    const wikiUrl  = document.getElementById('editWikiUrl').value.trim();
    const memo     = document.getElementById('editMemo').value.trim();

    const typeLabel = { event: '出来事', period: '期間', person: '人物' }[type] ?? type;

    let yearDisplay = '';
    if (type === 'person') {
        yearDisplay = `${wizFormatYear(birth)} — ${wizFormatYear(death)}`;
    } else if (type === 'period') {
        yearDisplay = `${wizFormatYear(year)} 〜 ${wizFormatYear(yearEnd)}`;
    } else {
        yearDisplay = wizFormatYear(year);
    }
    if (dateType === 'circa') yearDisplay += '（頃）';
    if (dateType === 'full' && fullDate) yearDisplay = fullDate;

    const regionLabels = [...WIZ.selectedRegions]
        .map(k => regions.find(r => r.key === k)?.label ?? k)
        .join('、') || '<span class="confirm-empty">未設定</span>';

    const rows = [
        ['種別', typeLabel],
        ['年代', yearDisplay],
        [type === 'person' ? '人物名' : '出来事', event || '<span class="confirm-empty">（未入力）</span>'],
        ['地域', regionLabels],
        ['分野', field || '<span class="confirm-empty">未設定</span>'],
        ['説明', desc || '<span class="confirm-empty">なし</span>'],
        ['Wikipedia', wikiUrl ? `<a href="${escapeHtml(wikiUrl)}" target="_blank" style="color:var(--accent-gold);">リンク</a>` : '<span class="confirm-empty">なし</span>'],
        ['メモ', memo || '<span class="confirm-empty">なし</span>'],
    ];

    document.getElementById('confirmTable').innerHTML = rows.map(([k, v]) => `
        <tr>
            <th>${k}</th>
            <td>${v}</td>
        </tr>
    `).join('');
}

// ── バリデーション ────────────────────────────────────────────
function wizValidateStep(step) {
    if (step === 1) {
        if (!WIZ.selectedType) {
            alert('種別を選択してください');
            return false;
        }
        return true;
    }
    if (step === 2) {
        const event = document.getElementById('editEvent').value.trim();
        if (!event) {
            alert(`${WIZ.selectedType === 'person' ? '人物名' : '出来事'}を入力してください`);
            document.getElementById('editEvent').focus();
            return false;
        }
        return true;
    }
    return true;
}

// ── ナビゲーション ────────────────────────────────────────────
function wizGoNext() {
    if (!wizValidateStep(WIZ.currentStep)) return;
    if (WIZ.currentStep === 1) {
        wizUpdateStep2ForType(WIZ.selectedType);
    }
    if (WIZ.currentStep < WIZ.totalSteps) {
        wizShowStep(WIZ.currentStep + 1);
    }
}

function wizGoBack() {
    if (WIZ.currentStep > 1) {
        wizShowStep(WIZ.currentStep - 1);
    }
}

// ── フォームデータ収集 → 既存の handleFormSubmit 互換 ─────────
function wizCollectPayload() {
    const type    = document.getElementById('editRecordType').value;
    const isPerson = type === 'person';
    const isPeriod = type === 'period';

    const yearRaw    = isPerson
        ? document.getElementById('editYearBirth').value.trim()
        : document.getElementById('editYear').value.trim();
    const yearEndRaw = isPerson
        ? document.getElementById('editYearDeath').value.trim()
        : document.getElementById('editYearEnd').value.trim();

    return {
        record_type: type,
        year:        yearRaw    !== '' ? parseInt(yearRaw,    10) : null,
        year_end:    yearEndRaw !== '' ? parseInt(yearEndRaw, 10) : null,
        date_type:   document.getElementById('editDateType').value,
        full_date:   document.getElementById('editFullDate').value || null,
        event:       document.getElementById('editEvent').value.trim(),
        description: document.getElementById('editDescription').value.trim() || null,
        region:      [...WIZ.selectedRegions],
        field:       document.getElementById('editField').value || null,
        wiki_url:    document.getElementById('editWikiUrl').value.trim() || null,
        memo:        document.getElementById('editMemo').value.trim() || null,
    };
}

async function wizSave() {
    const payload  = wizCollectPayload();
    if (!payload.event) { alert('出来事 / 人物名が入力されていません'); return; }

    const saveBtn = document.getElementById('wizardSave');
    saveBtn.textContent = '保存中...';
    saveBtn.disabled = true;

    const eventId = document.getElementById('editEventId').value;
    let error;

    if (eventId) {
        ({ error } = await db.from('wh_dates').update(payload).eq('id', eventId));
    } else {
        ({ error } = await db.from('wh_dates').insert([payload]));
    }

    saveBtn.textContent = '💾 保存';
    saveBtn.disabled = false;

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

// ── モーダルの初期化・開閉 ─────────────────────────────────────
function wizResetModal() {
    // フォームリセット
    ['editEventId','editYear','editYearEnd','editYearBirth','editYearDeath',
     'editEvent','editDescription','editWikiUrl','editMemo'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('editDateType').value = 'year';
    document.getElementById('editField').value    = '';
    document.getElementById('editRecordType').value = 'event';
    document.getElementById('s2-fulldate-wrap').style.display = 'none';
    document.getElementById('wikiResultPanel').style.display  = 'none';
    document.getElementById('dupePanel').classList.add('hidden');

    // 種別ボタンの選択解除
    document.querySelectorAll('.record-type-btn').forEach(b => b.classList.remove('selected'));
    WIZ.selectedType = null;

    // 地域トグルリセット
    wizRenderRegionToggles([]);

    // ステップ1へ
    wizShowStep(1);
}

// ── openAddModal を上書き ─────────────────────────────────────
function openAddModal() {
    document.getElementById('modalTitle').textContent = '新規追加';
    WIZ.isEdit = false;
    wizResetModal();
    document.getElementById('editModal').classList.add('active');
}

// ── editEvent を上書き ────────────────────────────────────────
function editEvent(id) {
    const row = currentPageData.find(r => r.id === id);
    if (!row) return;

    WIZ.isEdit = true;
    document.getElementById('modalTitle').textContent = '編集';
    wizResetModal();

    // 値セット
    document.getElementById('editEventId').value     = row.id;
    document.getElementById('editRecordType').value  = row.record_type ?? 'event';
    document.getElementById('editDateType').value    = row.date_type ?? 'year';
    document.getElementById('editFullDate').value    = row.full_date ?? '';
    document.getElementById('editEvent').value       = row.event ?? '';
    document.getElementById('editDescription').value = row.description ?? '';
    document.getElementById('editField').value       = row.field ?? '';
    document.getElementById('editWikiUrl').value     = row.wiki_url ?? '';
    document.getElementById('editMemo').value        = row.memo ?? '';

    if (row.record_type === 'person') {
        document.getElementById('editYearBirth').value = row.year ?? '';
        document.getElementById('editYearDeath').value = row.year_end ?? '';
    } else {
        document.getElementById('editYear').value    = row.year ?? '';
        document.getElementById('editYearEnd').value = row.year_end ?? '';
    }

    // 種別ボタンを選択状態にする
    WIZ.selectedType = row.record_type ?? 'event';
    document.querySelectorAll('.record-type-btn').forEach(b => {
        b.classList.toggle('selected', b.dataset.rtype === WIZ.selectedType);
    });

    // 地域
    wizRenderRegionToggles(row.region ?? []);

    // full_date 表示切り替え
    document.getElementById('s2-fulldate-wrap').style.display =
        (row.date_type === 'full') ? '' : 'none';

    // 編集は Step 2 から
    wizUpdateStep2ForType(WIZ.selectedType);
    wizShowStep(2);

    document.getElementById('editModal').classList.add('active');
}

// ── イベントバインド（DOMContentLoaded 後に呼ぶ） ────────────────
function wizBindEvents() {
    wizInitStep1();
    wizInitStep2();

    document.getElementById('wizardNext').addEventListener('click', wizGoNext);
    document.getElementById('wizardBack').addEventListener('click', wizGoBack);
    document.getElementById('wizardSave').addEventListener('click', wizSave);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('editModal').addEventListener('click', e => {
        if (e.target.id === 'editModal') closeModal();
    });
}

// ── closeModal（上書き） ─────────────────────────────────────
function closeModal() {
    document.getElementById('editModal').classList.remove('active');
}