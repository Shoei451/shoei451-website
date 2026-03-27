// ============================================================
// others/idiom_quiz/quiz.js
//
// Vintage イディオムクイズ — idiom 固有ロジック。
// quiz-components/ の各コンポーネントを呼び出してクイズを制御する。
//
// テーブル: english_idioms（db = Supabase Project 1）
// ============================================================

// ── 状態 ──────────────────────────────────────────────────
let allQuestions = [];
let quizSet = [];
let currentIndex = 0;
let correctCount = 0;
let mistakes = [];
let selectedCount = 10;
let selectedMode = "random";

const MIN_ATTEMPTS = 5;

// ── start-screen config ───────────────────────────────────
const START_CONFIG = {
  title: "Vintage 冬季課題 イディオムクイズ",
  subtitle: "Fill-in-the-blank idiom questions",
  tutorialMd: "tutorial.md",

  rangeMode: "single",
  rangeLabel: "Quiz Mode",
  ranges: [
    { id: "random", label: "Random Practice  — 全267問からランダム出題" },
    { id: "difficult", label: "Focus on Weak Areas — 正答率50%未満" },
    { id: "unattempted", label: "Not Yet Attempted — 取り組み数5未満" },
    {
      id: "mixed",
      label: "Mixed Review — 60% difficult / 30% medium / 10% easy",
    },
  ],

  countMode: "select",
  countDefault: 10,
  countOptions: [5, 10, 20, 30, 50, "all"],
  startLabel: "Start Quiz",

  onStart,
};

// ── データ読み込み ─────────────────────────────────────────
async function loadQuestions() {
  const { data, error } = await db.from("english_idioms").select("*");

  if (error) {
    showLoadError(error.message);
    return false;
  }
  if (!data || data.length === 0) {
    showLoadError("No questions found in database.");
    return false;
  }
  allQuestions = data;
  return true;
}

function showLoadError(msg) {
  document.getElementById("start-screen").innerHTML = `
    <div style="text-align:center; padding:3rem; color:var(--qz-incorrect);">
      <p style="font-size:1.1rem; font-weight:700; margin-bottom:8px;">⚠️ Failed to load questions</p>
      <p style="font-size:0.88rem; color:var(--qz-text-sub);">${_esc(msg)}</p>
      <button class="qz-btn qz-btn--ghost" style="margin-top:1.5rem;"
              onclick="location.reload()">Retry</button>
    </div>
  `;
}

// ── モードによるフィルタ ───────────────────────────────────
function filterByMode(questions, mode) {
  switch (mode) {
    case "difficult":
      return questions.filter(
        (q) =>
          q.total_attempts >= MIN_ATTEMPTS &&
          (q.correct_rate === null || q.correct_rate < 50),
      );

    case "unattempted":
      return questions.filter(
        (q) => q.total_attempts === null || q.total_attempts < MIN_ATTEMPTS,
      );

    case "mixed": {
      const difficult = questions.filter(
        (q) =>
          q.total_attempts >= MIN_ATTEMPTS &&
          (q.correct_rate === null || q.correct_rate < 50),
      );
      const medium = questions.filter(
        (q) =>
          q.total_attempts >= MIN_ATTEMPTS &&
          q.correct_rate >= 50 &&
          q.correct_rate < 75,
      );
      const easy = questions.filter(
        (q) => q.total_attempts >= MIN_ATTEMPTS && q.correct_rate >= 75,
      );
      const unattempted = questions.filter(
        (q) => q.total_attempts === null || q.total_attempts < MIN_ATTEMPTS,
      );

      const mixed = [];
      mixed.push(
        ...shuffleArray(difficult).slice(0, Math.ceil(questions.length * 0.6)),
      );
      mixed.push(
        ...shuffleArray(medium).slice(0, Math.ceil(questions.length * 0.3)),
      );
      mixed.push(
        ...shuffleArray(easy).slice(0, Math.ceil(questions.length * 0.1)),
      );

      if (mixed.length === 0) {
        mixed.push(...shuffleArray(unattempted));
      }
      return mixed;
    }

    case "random":
    default:
      return questions;
  }
}

// ── クイズ開始 ────────────────────────────────────────────
async function onStart([mode], count) {
  selectedMode = mode;
  selectedCount = count;

  if (allQuestions.length === 0) {
    const btn = document.getElementById("qz-start-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Loading...";
    }

    if (!(await loadQuestions())) return;
  }

  let filtered = filterByMode(allQuestions, mode);

  if (filtered.length === 0) {
    alert("Not enough data for this mode yet. Switching to random practice.");
    filtered = [...allQuestions];
  }

  filtered = shuffleArray(filtered);

  const total = count === "all" ? filtered.length : parseInt(count);
  quizSet = filtered.slice(0, Math.min(total, filtered.length));
  currentIndex = 0;
  correctCount = 0;
  mistakes = [];

  initProgress({
    total: quizSet.length,
    lastLabel: "See Results",
    resetConfirm: "Quit quiz? Your progress will be lost.",
    onNext: advanceQuestion,
    onReset: resetToStart,
  });

  showScreen("quiz-screen");
  renderQuestion(0);
}

// ── 問題描画 ──────────────────────────────────────────────
function renderQuestion(i) {
  hideFeedback();
  updateProgress(i);

  const q = quizSet[i];

  // 問題文: fill-in-the-blank 例文 + 日本語訳
  showQuestion({
    text: q.fill_in_the_blanks,
    sub: q.example_jp ?? null,
  });

  // 選択肢生成: 正解 + 他3件
  const others = buildDistractors(
    q,
    quizSet.length > 4 ? quizSet : allQuestions,
  );
  const options = shuffleArray([q, ...others]).map(
    (item) => item.idiom_extracted,
  );

  showChoices({
    options,
    correct: q.idiom_extracted,
    onAnswer({ isCorrect, selected }) {
      // Supabase 統計を非同期で更新（結果を待たない）
      updateQuestionStats(q.id, isCorrect);

      if (isCorrect) {
        correctCount++;
      } else {
        mistakes.push({
          questionText: q.fill_in_the_blanks,
          category: null,
          userAnswer: selected,
          correctAnswer: q.idiom_extracted,
          _raw: q, // renderMistake で使用
        });
      }

      // フィードバックカードを extraRenderer で構築
      showFeedback({
        isCorrect,
        extraRenderer: (el) => buildFeedbackCard(el, q, isCorrect, selected),
      });
    },
  });
}

// ── フィードバックカード ───────────────────────────────────
function buildFeedbackCard(container, q, isCorrect, selected) {
  const headerClass = isCorrect ? "is-correct" : "is-incorrect";
  const headerText = isCorrect ? "✓ Correct!" : "✗ Incorrect";

  const tipsHTML = q.tips
    ? `
    <div class="idiom-field">
      <div class="idiom-field__label">💡 Tips</div>
      <div class="idiom-field__value">${_esc(q.tips)}</div>
    </div>
  `
    : "";

  container.innerHTML = `
    <div class="idiom-feedback-card">
      <div class="idiom-feedback-card__header ${headerClass}">${headerText}</div>
      <div class="idiom-feedback-card__body">
        <div class="idiom-field">
          <div class="idiom-field__label">ID</div>
          <div class="idiom-field__value">#${_esc(String(q.id))}</div>
        </div>
        <div class="idiom-field">
          <div class="idiom-field__label">Idiom</div>
          <div class="idiom-field__value is-idiom">${_esc(q.idiom)}</div>
        </div>
        <div class="idiom-field">
          <div class="idiom-field__label">意味 (Meaning)</div>
          <div class="idiom-field__value">${_esc(q.definition_jp)}</div>
        </div>
        <div class="idiom-field">
          <div class="idiom-field__label">Example Sentence</div>
          <div class="idiom-field__value is-example">${_esc(q.example)}</div>
        </div>
        ${tipsHTML}
        <div class="report-section" id="report-${q.id}">
          <div class="report-section__title">⚠️ データに誤りがありますか？</div>
          <button class="report-btn" onclick="toggleReportForm(${q.id})">
            データの誤りを報告
          </button>
          <div class="report-form hidden" id="report-form-${q.id}">
            <select id="report-reason-${q.id}">
              <option value="">-- 理由を選択してください --</option>
              <option value="空欄とイディオムが合っていない">空欄とイディオムが合っていない</option>
              <option value="誤った例文">誤った例文</option>
              <option value="誤った日本語訳">誤った日本語訳</option>
              <option value="誤ったイディオム">誤ったイディオム</option>
              <option value="誤った意味">誤った意味</option>
              <option value="スペルミス">スペルミス</option>
              <option value="その他">その他</option>
            </select>
            <div class="report-form-actions">
              <button class="report-submit-btn" onclick="submitReport(${q.id})">送信</button>
              <button class="report-cancel-btn" onclick="toggleReportForm(${q.id})">キャンセル</button>
            </div>
            <div class="report-message" id="report-msg-${q.id}"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── 報告フォーム ──────────────────────────────────────────
function toggleReportForm(id) {
  const form = document.getElementById(`report-form-${id}`);
  if (form) form.classList.toggle("hidden");
}

async function submitReport(id) {
  const reasonEl = document.getElementById(`report-reason-${id}`);
  const msgEl = document.getElementById(`report-msg-${id}`);
  const reason = reasonEl?.value;

  if (!reason) {
    if (msgEl) {
      msgEl.textContent = "理由を選択してください";
      msgEl.className = "report-message is-error";
    }
    return;
  }

  if (msgEl) {
    msgEl.textContent = "送信中...";
    msgEl.className = "report-message";
  }

  try {
    const { error } = await db
      .from("english_idioms")
      .update({ corruption_istrue: true, corruption_reason: reason })
      .eq("id", id);

    if (error) throw error;
    if (msgEl) {
      msgEl.textContent = "報告ありがとうございました！";
      msgEl.className = "report-message is-success";
    }
    if (reasonEl) reasonEl.disabled = true;
    // submit/cancel ボタンを無効化
    const actions = document.querySelector(
      `#report-form-${id} .report-form-actions`,
    );
    if (actions)
      actions.querySelectorAll("button").forEach((b) => (b.disabled = true));
  } catch (_) {
    if (msgEl) {
      msgEl.textContent = "送信に失敗しました。もう一度お試しください。";
      msgEl.className = "report-message is-error";
    }
  }
}

// ── Supabase 統計更新 ────────────────────────────────────
async function updateQuestionStats(id, isCorrect) {
  try {
    const { data, error } = await db
      .from("english_idioms")
      .select("total_attempts, correct_attempts")
      .eq("id", id)
      .single();

    if (error || !data) return;

    const newTotal = (data.total_attempts ?? 0) + 1;
    const newCorrect = (data.correct_attempts ?? 0) + (isCorrect ? 1 : 0);
    const newRate = (newCorrect / newTotal) * 100;

    await db
      .from("english_idioms")
      .update({
        total_attempts: newTotal,
        correct_attempts: newCorrect,
        correct_rate: newRate,
      })
      .eq("id", id);
  } catch (_) {
    // 統計更新の失敗はクイズ進行に影響させない
  }
}

// ── 選択肢生成 ────────────────────────────────────────────
function buildDistractors(current, pool) {
  return shuffleArray(
    pool.filter((q) => q.idiom_extracted !== current.idiom_extracted),
  ).slice(0, 3);
}

// ── 次の問題 / 結果 ───────────────────────────────────────
function advanceQuestion(idx) {
  const next = idx + 1;
  if (next < quizSet.length) {
    currentIndex = next;
    renderQuestion(next);
    return;
  }

  showScreen("result-screen");
  showResult({
    correct: correctCount,
    total: quizSet.length,
    mistakes,
    retryLabel: "Restart Quiz",
    retryMistakesLabel: "Retry Mistakes",

    // 復習リストのカスタムレンダラー
    renderMistake(item) {
      const q = item._raw;
      return `
        <div class="qz-review-item__header">
          <p class="qz-review-item__question">${_esc(item.questionText)}</p>
        </div>
        <div style="font-size:0.85rem; margin:6px 0; color:var(--qz-text-sub);">${q ? _esc(q.example_jp ?? "") : ""}</div>
        <div class="qz-review-item__answers">
          <span class="qz-review-item__user">Your answer: ${_esc(item.userAnswer)}</span>
          <span class="qz-review-item__correct">Correct: <strong>${_esc(item.correctAnswer)}</strong></span>
        </div>
        ${q ? `<div style="font-size:0.8rem; color:var(--qz-text-sub); margin-top:6px;">${_esc(q.idiom)} — ${_esc(q.definition_jp)}</div>` : ""}
      `;
    },

    onRetry: resetToStart,

    onRetryMistakes(ms) {
      quizSet = ms
        .map((m) =>
          allQuestions.find((q) => q.idiom_extracted === m.correctAnswer),
        )
        .filter(Boolean);

      if (!quizSet.length) {
        resetToStart();
        return;
      }

      currentIndex = correctCount = 0;
      mistakes = [];

      initProgress({
        total: quizSet.length,
        lastLabel: "See Results",
        resetConfirm: "Quit quiz? Your progress will be lost.",
        onNext: advanceQuestion,
        onReset: resetToStart,
      });

      showScreen("quiz-screen");
      renderQuestion(0);
    },
  });
}

// ── リセット ──────────────────────────────────────────────
function resetToStart() {
  const el = document.getElementById("start-screen");
  el.innerHTML = "";
  el.classList.add("hidden");
  showScreen("start-screen");
  initStartScreen(START_CONFIG);
}

// ── 画面切替 ──────────────────────────────────────────────
function showScreen(id) {
  ["start-screen", "quiz-screen", "result-screen"].forEach((s) =>
    document.getElementById(s).classList.add("hidden"),
  );
  document.getElementById(id).classList.remove("hidden");
}

// ── ユーティリティ ────────────────────────────────────────
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function _esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── エントリポイント ───────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initStartScreen(START_CONFIG);
});
