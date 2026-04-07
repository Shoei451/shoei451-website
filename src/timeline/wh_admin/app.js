import { db } from "/js/supabase_config.js";
import {
  loadRegions,
  setupEventListeners,
  fetchTotalCount,
  fetchPage,
} from "./data-app.js";

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

  const { createWorldHistoryMemoApp } = await import("./memo-app.js");
  const memoApp = createWorldHistoryMemoApp();

  const layout = document.getElementById("tl-layout");
  const dialog = document.getElementById("tl-detail-modal");
  if (layout) layout.style.display = "none";
  if (dialog) dialog.style.display = "none";
  if (legendWrap) legendWrap.hidden = true;
  if (stateEl) stateEl.style.display = "none";

  // <template> からマークアップをクローン
  const tpl = document.getElementById("admin-app-tpl");
  if (!tpl) throw new Error("#admin-app-tpl が見つかりません");
  root.hidden = false;
  root.classList.add("tl-admin-app");
  root.appendChild(tpl.content.cloneNode(true));

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
      await loadRegions();
      setupEventListeners();
      dataInitialized = true;
    }

    if (!memoInitialized) {
      memoApp.init();
      memoInitialized = true;
    }

    await Promise.all([fetchTotalCount(), fetchPage(0)]);
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
