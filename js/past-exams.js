// =====================================
// subject-gate.js
// 科目別アクセスゲート（Vercel対応・UX改善版）
// =====================================

// ---------- ページ設定 ----------
const subjectConfig = {
  subject: document.body.dataset.subject,        // e.g. "geography"
  subjectName: document.body.dataset.subjectName // e.g. "地理総合"
};

// ---------- Supabase設定 ----------
const SUPABASE_URL = 'https://gjuqsyaugrsshmjerhme.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdXFzeWF1Z3Jzc2htamVyaG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NzA3NTYsImV4cCI6MjA4MjA0Njc1Nn0.V8q5ddz5tPy7wBaQ73aGtmCZyqzA6pPciPRwRIZjJcs'; // ← anon key
const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ---------- セッションID（ログ用） ----------
const getSessionId = () => {
  let id = sessionStorage.getItem('session_id');
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem('session_id', id);
  }
  return id;
};

// ---------- ログ記録 ----------
async function logAccess(type, extra = {}) {
  try {
    await supabaseClient
      .from('access_logs')
      .insert([{
        subject: subjectConfig.subject,
        access_type: type,
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        ...extra
      }]);
  } catch (e) {
    // ログ失敗は致命的ではない
    console.warn('ログ記録失敗:', e);
  }
}

// ---------- 認証後の遷移用 ----------
let authorizedUrl = null;

// ---------- 認証処理（核心） ----------
async function verifyAccess() {
  const input = document.getElementById('codeInput');
  const message = document.getElementById('message');
  const code = input.value.trim();

  if (!code) {
    message.innerHTML =
      '<p class="error-message">アクセスコードを入力してください</p>';
    return;
  }

  message.innerHTML =
    '<p style="color: var(--secondary);">確認中...</p>';

  try {
    const { data, error } = await supabaseClient
      .from('subject_gateways')
      .select('target_url')
      .eq('subject', subjectConfig.subject) // ← ページ側で固定
      .eq('password', code)
      .eq('active', true)
      .single();

    if (error || !data) {
      message.innerHTML =
        '<p class="error-message">✗ コードが正しくありません</p>';

      logAccess('login_failed', {
        attempted_code: code.slice(0, 2) + '***'
      });
      return;
    }

    // ---------- 認証成功 ----------
    authorizedUrl = data.target_url;

    message.innerHTML = `
      <p class="success-message">✓ 認証成功</p>
      <button id="goButton" class="go-button">
        過去問を見る
      </button>
      <p style="margin-top:.5rem;font-size:.8rem;color:var(--secondary);">
        タップして次へ進んでください
      </p>
    `;

    // ユーザー操作起点で遷移（Vercel / mobile safe）
    document
      .getElementById('goButton')
      .addEventListener('click', goToTarget);

    logAccess('login_success');

  } catch (e) {
    console.error(e);
    message.innerHTML =
      '<p class="error-message">エラーが発生しました</p>';
  }
}

// ---------- 遷移 ----------
function goToTarget() {
  if (!authorizedUrl) return;
  logAccess('redirect');
  window.location.href = authorizedUrl;
}

// ---------- Enterキー対応 ----------
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('codeInput');
  if (!input) return;

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      verifyAccess();
    }
  });
});
