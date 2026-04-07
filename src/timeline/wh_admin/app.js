import { db } from "/js/supabase_config.js";

const ADMIN_VIEWS = [
  { id: "data", label: "データ管理" },
  { id: "memo", label: "メモ編集" },
];

let appBootPromise;

export async function initWorldHistoryAdminApp({
  root,
  tabsWrap,
  legendWrap,
  stateEl,
}) {
  if (!appBootPromise) {
    appBootPromise = bootAdminApp({ root, tabsWrap, legendWrap, stateEl });
  }
  await appBootPromise;
}

async function bootAdminApp({ root, tabsWrap, legendWrap, stateEl }) {
  await Promise.all([
    ensureClassicScript("/js/wh-utils.js", "wh-utils-classic"),
    ensureClassicScript(
      "https://cdn.jsdelivr.net/npm/marked/marked.min.js",
      "marked-classic",
    ),
    ensureStylesheet(
      new URL("./app.css", import.meta.url).href,
      "tl-admin-app-css",
    ),
  ]);

  const [{ createWorldHistoryMemoApp }] = await Promise.all([
    import("./memo-app.js"),
    import("./data-app.js"),
  ]);
  const memoApp = createWorldHistoryMemoApp();

  const layout = document.getElementById("tl-layout");
  const dialog = document.getElementById("tl-detail-modal");
  if (layout) layout.style.display = "none";
  if (dialog) dialog.style.display = "none";
  if (legendWrap) legendWrap.hidden = true;
  if (stateEl) stateEl.style.display = "none";

  root.hidden = false;
  root.classList.add("tl-admin-app");
  root.innerHTML = getAppMarkup();

  const loginScreen = document.getElementById("admin-login-screen");
  const adminScreen = document.getElementById("admin-app-screen");
  const loginBtn = document.getElementById("admin-login-btn");
  const loginPassword = document.getElementById("admin-login-password");
  const logoutBtn = document.getElementById("admin-logout-btn");
  const loginError = document.getElementById("admin-login-error");
  const dataView = document.getElementById("admin-data-view");
  const memoView = document.getElementById("admin-memo-view");
  const homeLink = document.getElementById("admin-home-link");
  const headerUserEl = ensureHeaderUserEl();

  let currentView = getRequestedView();
  let dataInitialized = false;
  let memoInitialized = false;

  homeLink?.addEventListener("click", (e) => {
    e.preventDefault();
    location.assign("./index.html?slug=world-history");
  });

  loginBtn.addEventListener("click", handleLogin);
  loginPassword.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleLogin();
  });
  logoutBtn.addEventListener("click", async () => {
    await db.auth.signOut();
  });

  renderTabs();

  const {
    data: { session },
  } = await db.auth.getSession();
  if (session) {
    await showAdmin(session.user);
  } else {
    showLogin();
  }

  db.auth.onAuthStateChange(async (_event, sessionNow) => {
    if (sessionNow) {
      await showAdmin(sessionNow.user);
    } else {
      showLogin();
    }
  });

  function renderTabs() {
    tabsWrap.innerHTML = "";
    tabsWrap.hidden = true;

    ADMIN_VIEWS.forEach((view) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tl-tab";
      btn.dataset.adminView = view.id;
      btn.textContent = view.label;
      btn.addEventListener("click", () => setView(view.id));
      tabsWrap.appendChild(btn);
    });
  }

  async function handleLogin() {
    const email = document.getElementById("admin-login-email").value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
      showLoginError("メールアドレスとパスワードを入力してください");
      return;
    }

    loginBtn.textContent = "ログイン中...";
    loginBtn.disabled = true;
    loginError.style.display = "none";

    const { error } = await db.auth.signInWithPassword({ email, password });

    loginBtn.textContent = "ログイン";
    loginBtn.disabled = false;

    if (error) {
      showLoginError(
        "ログインに失敗しました。メールアドレスまたはパスワードが違います。",
      );
    }
  }

  function showLoginError(message) {
    loginError.textContent = message;
    loginError.style.display = "block";
  }

  function showLogin() {
    loginScreen.hidden = false;
    loginScreen.style.display = "flex";
    adminScreen.hidden = true;
    tabsWrap.hidden = true;
    headerUserEl.hidden = true;
    headerUserEl.textContent = "";
    loginError.style.display = "none";
    document.getElementById("admin-login-email").value = "";
    document.getElementById("admin-login-password").value = "";
  }

  async function showAdmin(user) {
    loginScreen.hidden = true;
    loginScreen.style.display = "none";
    adminScreen.hidden = false;
    tabsWrap.hidden = false;
    headerUserEl.hidden = false;
    headerUserEl.textContent = user.email;

    if (!dataInitialized) {
      await window.loadRegions();
      window.setupEventListeners();
      dataInitialized = true;
    }

    if (!memoInitialized) {
      memoApp.init();
      memoInitialized = true;
    }

    await Promise.all([window.fetchTotalCount(), window.fetchPage(0)]);
    if (currentView === "memo") {
      await memoApp.loadRecords();
    }
    await setView(currentView);
  }

  async function setView(nextView) {
    currentView = ADMIN_VIEWS.some((view) => view.id === nextView)
      ? nextView
      : "data";

    dataView.hidden = currentView !== "data";
    memoView.hidden = currentView !== "memo";

    document.querySelectorAll(".tl-tab[data-admin-view]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.adminView === currentView);
    });

    const nextParams = new URLSearchParams(location.search);
    nextParams.set("adminView", currentView);
    history.replaceState(
      {},
      "",
      `${location.pathname}?${nextParams.toString()}`,
    );

    if (!adminScreen.hidden && currentView === "memo") {
      await memoApp.loadRecords();
    }
  }
}

function getRequestedView() {
  const view = new URLSearchParams(location.search).get("adminView");
  return ADMIN_VIEWS.some((item) => item.id === view) ? view : "data";
}

function ensureHeaderUserEl() {
  const controls = document.querySelector(".tl-header__controls");
  let userEl = document.getElementById("tl-admin-header-user");
  if (!userEl) {
    userEl = document.createElement("span");
    userEl.id = "tl-admin-header-user";
    userEl.className = "tl-admin-app__header-user";
    userEl.hidden = true;
    controls?.prepend(userEl);
  }
  return userEl;
}

function ensureClassicScript(src, id) {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error(`${src} の読み込みに失敗しました。`)),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", () => {
      reject(new Error(`${src} の読み込みに失敗しました。`));
    });
    document.head.appendChild(script);
  });
}

function ensureStylesheet(href, id) {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing) {
      resolve();
      return;
    }

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    link.addEventListener("load", () => resolve(), { once: true });
    link.addEventListener(
      "error",
      () => reject(new Error(`${href} の読み込みに失敗しました。`)),
      { once: true },
    );
    document.head.appendChild(link);
  });
}

function getAppMarkup() {
  return `
    <section class="tl-admin-app__login" id="admin-login-screen">
      <div class="tl-admin-app__login-card">
        <div class="tl-admin-app__logo">WH</div>
        <h2 class="tl-admin-app__login-title">管理者ログイン</h2>
        <p class="tl-admin-app__login-subtitle">世界史年表のデータとメモを共通 shell 上で管理します。</p>
        <div class="tl-admin-app__login-error" id="admin-login-error" style="display:none;"></div>
        <label class="tl-admin-app__field">
          <span>メールアドレス</span>
          <input type="email" id="admin-login-email" placeholder="admin@example.com" autocomplete="email" />
        </label>
        <label class="tl-admin-app__field">
          <span>パスワード</span>
          <input type="password" id="admin-login-password" placeholder="••••••••" autocomplete="current-password" />
        </label>
        <button type="button" class="tl-admin-app__primary-btn" id="admin-login-btn">ログイン</button>
      </div>
    </section>

    <section class="tl-admin-app__screen" id="admin-app-screen" hidden>
      <div class="tl-admin-app__toolbar">
        <div>
          <p class="tl-admin-app__eyebrow">World History Admin</p>
          <h2 class="tl-admin-app__title">wh_dates 管理</h2>
        </div>
        <div class="tl-admin-app__toolbar-actions">
          <button type="button" class="tl-admin-app__ghost-btn" id="admin-home-link">年表へ戻る</button>
          <button type="button" class="tl-admin-app__ghost-btn" id="admin-logout-btn">ログアウト</button>
        </div>
      </div>

      <section id="admin-data-view">
        <div class="container">
          <div class="stats" id="statsSection">
            <div class="stat-item">
              <div class="stat-number" id="totalEvents">-</div>
              <div class="stat-label">総件数</div>
            </div>
            <div class="stat-item">
              <div class="stat-number" id="displayedEvents">-</div>
              <div class="stat-label">表示中</div>
            </div>
          </div>

          <div class="controls">
            <input
              type="text"
              id="searchBox"
              class="search-box"
              placeholder="出来事を検索..."
            />
            <select id="regionFilter" class="filter-select">
              <option value="all">地域: すべて</option>
            </select>
            <select id="fieldFilter" class="filter-select">
              <option value="all">分野: すべて</option>
              <option value="政治">政治</option>
              <option value="経済">経済</option>
              <option value="文化・宗教">文化・宗教</option>
              <option value="社会">社会</option>
              <option value="外交・戦争">外交・戦争</option>
            </select>
            <button class="btn-add" onclick="openAddModal()">+ 新規追加</button>
          </div>

          <div class="tabs" id="recordTypeTabs">
            <button class="tab active" data-record-type="all">すべて</button>
            <button class="tab" data-record-type="event">出来事</button>
            <button class="tab" data-record-type="period">期間</button>
            <button class="tab" data-record-type="person">人物</button>
          </div>

          <div id="timelineContainer">
            <div class="loading">読み込み中...</div>
          </div>
        </div>

        <div class="modal" id="editModal">
          <div class="modal-content">
            <div class="modal-header">
              <h2 id="modalTitle">新規追加</h2>
              <button class="close-modal" id="closeModal" type="button">×</button>
            </div>
            <form id="editForm">
              <input type="hidden" id="editEventId" />
              <input type="hidden" id="editRecordType" value="event" />

              <div class="wizard-steps">
                <div class="wizard-step active" data-step="1">
                  <div class="step-dot">1</div>
                  <div class="step-label">種別</div>
                </div>
                <div class="wizard-step" data-step="2">
                  <div class="step-dot">2</div>
                  <div class="step-label">内容</div>
                </div>
                <div class="wizard-step" data-step="3">
                  <div class="step-dot">3</div>
                  <div class="step-label">地域</div>
                </div>
                <div class="wizard-step" data-step="4">
                  <div class="step-dot">4</div>
                  <div class="step-label">確認</div>
                </div>
              </div>

              <section id="step1" class="wizard-panel active">
                <div class="form-group">
                  <label>登録するレコード種別</label>
                  <div class="record-type-grid">
                    <button type="button" class="record-type-btn" data-rtype="event">
                      <span class="rtype-icon">●</span>
                      <span class="rtype-label">出来事</span>
                      <span class="rtype-desc">単一年の出来事を登録</span>
                    </button>
                    <button type="button" class="record-type-btn" data-rtype="period">
                      <span class="rtype-icon">↔</span>
                      <span class="rtype-label">期間</span>
                      <span class="rtype-desc">開始年と終了年を登録</span>
                    </button>
                    <button type="button" class="record-type-btn" data-rtype="person">
                      <span class="rtype-icon">◎</span>
                      <span class="rtype-label">人物</span>
                      <span class="rtype-desc">生没年つき人物を登録</span>
                    </button>
                  </div>
                </div>
              </section>

              <section id="step2" class="wizard-panel">
                <div id="s2-year-block">
                  <div class="form-row">
                    <div class="form-group">
                      <label for="editYear" id="s2-year-label">年</label>
                      <input type="number" id="editYear" placeholder="例: 1789 / -221" />
                      <small>紀元前は負の数。不明なら空白。</small>
                    </div>
                    <div class="form-group" id="s2-yearend-wrap" style="display:none;">
                      <label for="editYearEnd">終了年</label>
                      <input type="number" id="editYearEnd" placeholder="例: 1918 / -206" />
                      <small>不明なら空白。</small>
                    </div>
                  </div>
                </div>

                <div id="s2-person-block" style="display:none;">
                  <div class="form-row">
                    <div class="form-group">
                      <label for="editYearBirth">生年</label>
                      <input type="number" id="editYearBirth" placeholder="例: 1769 / -551" />
                      <small>紀元前は負の数。不明なら空白。</small>
                    </div>
                    <div class="form-group">
                      <label for="editYearDeath">没年</label>
                      <input type="number" id="editYearDeath" placeholder="例: 1821 / -479" />
                      <small>不明なら空白。</small>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="editDateType">日付の形式</label>
                  <select id="editDateType">
                    <option value="year">年のみ</option>
                    <option value="full">完全な日付</option>
                    <option value="circa">頃（circa）</option>
                  </select>
                </div>

                <div class="form-group" id="s2-fulldate-wrap" style="display:none;">
                  <label for="editFullDate">日付</label>
                  <input type="date" id="editFullDate" />
                </div>

                <div class="form-group">
                  <label for="editEvent" id="s2-event-label">出来事</label>
                  <div class="event-wiki-row">
                    <input type="text" id="editEvent" placeholder="例: フランス革命 / ナポレオン" />
                    <button type="button" id="wikiSearchBtn">Wiki検索</button>
                  </div>
                  <small id="s2-event-hint">名詞形で短く。例: フランス革命</small>
                  <div id="wikiResultPanel" style="display:none;"></div>
                  <div id="dupePanel" class="dupe-panel hidden">
                    <div id="dupeBanner" class="dupe-banner warn-soft"></div>
                    <div id="dupeRecords" class="dupe-records"></div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="editDescription">説明</label>
                  <textarea id="editDescription" placeholder="補足説明（フラッシュカード裏面）"></textarea>
                </div>

                <div class="form-group">
                  <label for="editField">分野</label>
                  <select id="editField">
                    <option value="">未設定</option>
                    <option value="政治">政治</option>
                    <option value="経済">経済</option>
                    <option value="文化・宗教">文化・宗教</option>
                    <option value="社会">社会</option>
                    <option value="外交・戦争">外交・戦争</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="editWikiUrl">Wikipedia URL</label>
                  <input type="url" id="editWikiUrl" placeholder="https://ja.wikipedia.org/wiki/..." />
                </div>

                <div class="form-group">
                  <label for="editMemo">メモ（Markdown）</label>
                  <textarea id="editMemo" placeholder="補足資料・関連リンクなど"></textarea>
                </div>
              </section>

              <section id="step3" class="wizard-panel">
                <div class="form-group">
                  <label>地域</label>
                  <div id="regionToggles" class="region-toggle-grid"></div>
                </div>
              </section>

              <section id="step4" class="wizard-panel">
                <div class="form-group">
                  <label>登録内容の確認</label>
                  <table class="confirm-table">
                    <tbody id="confirmTable"></tbody>
                  </table>
                </div>
              </section>

              <div class="wizard-footer">
                <button type="button" class="btn-cancel" id="cancelBtn">キャンセル</button>
                <button type="button" class="btn-back" id="wizardBack" style="display:none;">戻る</button>
                <button type="button" class="btn-next" id="wizardNext">次へ</button>
                <button type="button" class="btn-save" id="wizardSave" style="display:none;">保存</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section id="admin-memo-view" hidden>
        <div class="memo-page-wrap">
          <div class="stats">
            <div class="stat-item">
              <div class="stat-number" id="memoStatTotal">-</div>
              <div class="stat-label">総件数</div>
            </div>
            <div class="stat-item">
              <div class="stat-number" id="memoStatMemo">-</div>
              <div class="stat-label">メモあり</div>
            </div>
            <div class="stat-item">
              <div class="stat-number" id="memoStatFiltered">-</div>
              <div class="stat-label">表示中</div>
            </div>
          </div>

          <div class="memo-toolbar">
            <input
              type="search"
              id="memoSearchInput"
              class="search-box"
              style="flex: 1; width: auto"
              placeholder="出来事・地域・分野で検索..."
              autocomplete="off"
            />
            <button class="filter-toggle" id="memoFilterBtn">メモあり</button>
            <select id="memoFieldFilter" class="filter-select">
              <option value="">分野: すべて</option>
              <option value="政治">政治</option>
              <option value="経済">経済</option>
              <option value="文化・宗教">文化・宗教</option>
              <option value="社会">社会</option>
              <option value="外交・戦争">外交・戦争</option>
            </select>
          </div>

          <div id="memoRecordList">
            <div class="loading">読み込み中...</div>
          </div>
        </div>

        <div class="sheet-backdrop" id="memoSheetBackdrop"></div>
        <div class="sheet" id="memoSheet">
          <div class="sheet-drag-bar"><span></span></div>
          <div class="sheet-info">
            <div class="sheet-info-year" id="memoSheetYear"></div>
            <div class="sheet-info-event" id="memoSheetEvent"></div>
            <div class="sheet-info-tags" id="memoSheetTags"></div>
          </div>

          <div class="editor-tabs">
            <button class="editor-tab active" id="memoTabEdit" type="button">編集</button>
            <button class="editor-tab" id="memoTabPreview" type="button">Preview</button>
          </div>

          <div class="editor-body">
            <textarea class="memo-textarea" id="memoTextarea" placeholder="Markdownでメモを書けます"></textarea>
            <div class="md-preview" id="memoMdPreview" style="display:none;"></div>
          </div>

          <div class="sheet-footer">
            <button class="btn-clear" id="memoClearBtn" type="button" style="display:none;">削除</button>
            <button class="btn-cancel" id="memoCancelBtn" type="button">キャンセル</button>
            <button class="btn-save" id="memoSaveBtn" type="button">保存</button>
          </div>
        </div>

        <div class="toast" id="memoToast"></div>
      </section>
    </section>
  `;
}

const timelineConfig = {
  title: "世界史年表 管理",
  backLink: "../sub-index.html?slug=history",
  backLabel: "歴史ホーム",
  accentColor: "#1a2b3c",
  showSearch: false,
  showStats: false,

  async renderApp(ctx) {
    await initWorldHistoryAdminApp(ctx);
  },
};

export default timelineConfig;
