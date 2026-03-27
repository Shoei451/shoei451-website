// ============================================================
// history/world/year-to-event/quiz.js
//
// 世界史年代クイズ【年号 → 出来事】
//
// フィルタキー : period（時代区分）
// 回答形式     : 4択（choice-buttons.js）
// 問題文       : 年号　　選択肢 : 出来事
//
// 使用コンポーネント:
//   start-screen, progress, question-area,
//   choice-buttons, feedback, result
// ============================================================

// ── 時代区分（period フィールドと対応） ───────────────────
const PERIODS = [
  { id: "~0", label: "紀元前" },
  { id: "1~1000", label: "1年〜1000年" },
  { id: "1001~1500", label: "1001年〜1500年" },
  { id: "1501~1700", label: "1501年〜1700年" },
  { id: "1701~1800", label: "1701年〜1800年" },
  { id: "1801~1900", label: "1801年〜1900年" },
  { id: "1901~1945", label: "1901年〜1945年" },
  { id: "1946~1989", label: "1946年〜1989年" },
  { id: "1990~", label: "1990年〜" },
];

// ── 状態 ──────────────────────────────────────────────────
let allData = [];
let quizSet = [];
let currentIndex = 0;
let correctCount = 0;
let mistakes = [];

// ── start-screen config ───────────────────────────────────
const START_CONFIG = {
  title: "世界史年代クイズ",
  subtitle: "年号 → 出来事",
  image: "../../../images/worldhistoryquiz.png",

  rangeMode: "single",
  rangeLabel: "時代区分",
  ranges: PERIODS,

  countMode: "select",
  countDefault: 10,
  countOptions: [10, 20, 30, "all"],

  onStart,
};

// ── データ読み込み ─────────────────────────────────────────
async function loadQuestions() {
  let all = [],
    start = 0;
  const BATCH = 1000;

  while (true) {
    const { data, error } = await db
      .from(TABLES.WH_QUIZ)
      .select("*")
      .order("is_bc", { ascending: false })
      .order("year", { ascending: true })
      .range(start, start + BATCH - 1);

    if (error) {
      showLoadError(error.message);
      return false;
    }
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < BATCH) break;
    start += BATCH;
  }

  allData = all;
  return true;
}

function showLoadError(msg) {
  document.getElementById("start-screen").innerHTML = `
    <div style="text-align:center; padding:3rem; color:var(--qz-incorrect);">
      <p style="font-size:1.1rem; font-weight:700; margin-bottom:8px;">⚠️ データ読み込みエラー</p>
      <p style="font-size:0.88rem; color:var(--qz-text-sub);">${msg}</p>
      <button class="qz-btn qz-btn--ghost" style="margin-top:1.5rem;"
              onclick="location.reload()">再読み込み</button>
    </div>
  `;
}

// ── クイズ開始 ────────────────────────────────────────────
async function onStart([selectedPeriod], count) {
  if (allData.length === 0) {
    const btn = document.getElementById("qz-start-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "読み込み中...";
    }
    if (!(await loadQuestions())) return;
  }

  const filtered = allData.filter((q) => q.period === selectedPeriod);
  if (filtered.length === 0) {
    alert(
      "このセクションに問題がありません。別のセクションを選択してください。",
    );
    return;
  }

  const total = count === "all" ? filtered.length : parseInt(count);
  quizSet = shuffleArray(filtered).slice(0, Math.min(total, filtered.length));
  currentIndex = 0;
  correctCount = 0;
  mistakes = [];

  initProgress({
    total: quizSet.length,
    lastLabel: "結果を見る",
    resetConfirm: "最初に戻りますか？進捗はリセットされます。",
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

  // 問題文: 年号
  showQuestion({
    text: formatYear(toDisplayYear(q)),
    category: q.period,
  });

  // 選択肢: 同じ period から3件の不正解を用意
  const others = buildDistractors(q, allData);
  const options = shuffleArray([q, ...others]).map((item) => item.event);

  showChoices({
    options,
    correct: q.event,
    onAnswer({ isCorrect, selected }) {
      if (isCorrect) {
        correctCount++;
      } else {
        mistakes.push({
          questionText: formatYear(toDisplayYear(q)),
          category: q.period,
          userAnswer: selected,
          correctAnswer: q.event,
        });
      }
      showFeedback({
        isCorrect,
        correctLabel: isCorrect ? null : q.event,
        userLabel: isCorrect ? null : selected,
        // 参考リンクがあれば extra に表示
        extraRenderer: q.link
          ? (el) => {
              el.innerHTML = `<a href="${q.link}" target="_blank" rel="noopener"
                            style="font-size:0.82rem; color:var(--qz-accent-dark);
                                   text-decoration:underline;">
                            参考リンク →
                          </a>`;
            }
          : null,
      });
    },
  });
}

// ── 選択肢生成（同 period から3件、不正解候補） ──────────
function buildDistractors(current, pool) {
  return shuffleArray(
    pool.filter(
      (q) => q.period === current.period && q.event !== current.event,
    ),
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
    onRetry: resetToStart,
    onRetryMistakes(ms) {
      quizSet = ms
        .map((m) => allData.find((q) => q.event === m.correctAnswer))
        .filter(Boolean);
      if (!quizSet.length) {
        resetToStart();
        return;
      }

      currentIndex = correctCount = 0;
      mistakes = [];

      initProgress({
        total: quizSet.length,
        lastLabel: "結果を見る",
        resetConfirm: "最初に戻りますか？",
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

function showScreen(id) {
  ["start-screen", "quiz-screen", "result-screen"].forEach((s) =>
    document.getElementById(s).classList.add("hidden"),
  );
  document.getElementById(id).classList.remove("hidden");
}

// ── ユーティリティ ────────────────────────────────────────
function formatYear(y) {
  if (y == null) return "不明";
  return y < 0 ? `前${Math.abs(y)}年` : `${y}年`;
}

// world_history_quiz: is_bc フラグ + 正数 year → 負数統一に変換
function toDisplayYear(q) {
  return q.is_bc ? -Math.abs(q.year) : q.year;
}

// ── エントリポイント ───────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initStartScreen(START_CONFIG);
});
