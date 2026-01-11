// ===============================
// subject-gate.js
// 科目別アクセスゲート（A案・軽量版）
// ===============================

// ---------- ページ設定 ----------
// bodyタグに書かれた data-* を唯一の文脈情報として使う
const subjectConfig = {
  subject: document.body.dataset.subject,        // e.g. "geography"
  subjectName: document.body.dataset.subjectName // e.g. "地理総合"
};

// ---------- Supabase設定 ----------
const SUPABASE_URL = 'https://gjuqsyaugrsshmjerhme.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdXFzeWF1Z3Jzc2htamVyaG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NzA3NTYsImV4cCI6MjA4MjA0Njc1Nn0.V8q5ddz5tPy7wBaQ73aGtmCZyqzA6pPciPRwRIZjJcs';
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

// ---------- アクセスログ ----------
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
    console.warn('ログ記録失敗:', e);
  }
}

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

      await logAccess('login_failed', {
        attempted_code: code.slice(0, 2) + '***'
      });
      return;
    }

    // 認証成功
    message.innerHTML =
      '<p class="success-message">✓ 認証成功</p>';

    await logAccess('login_success');

    // 少し待ってから遷移（UX用）
    setTimeout(() => {
      window.location.href = data.target_url;
    }, 400);

  } catch (e) {
    console.error(e);
    message.innerHTML =
      '<p class="error-message">エラーが発生しました</p>';
  }
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
