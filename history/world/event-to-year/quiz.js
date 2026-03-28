// ============================================================
// history/world/event-to-year/quiz.js
//
// 世界史年代クイズ【出来事 → 年号】
//
// フィルタキー : chapter（章）
// 回答形式     : 年号入力（text-input.js）
// 問題文       : 出来事　　回答 : 年号を直接入力
//
// 使用コンポーネント:
//   start-screen, progress, question-area,
//   text-input, feedback, result
// ============================================================

import { db, tables } from "../../../js/supabase_config.js";

// ── 章（chapter フィールドと対応） ───────────────────────
const CHAPTERS = [
  {
    id: "第1章",
    label: "第1章 — 古代文明圏【オリエント・ギリシア・ローマ・中国古代】",
  },
  { id: "第2章", label: "第2章 — 中世ヨーロッパ" },
  { id: "第3章", label: "第3章 — 近現代ヨーロッパ" },
  { id: "第4章", label: "第4章 — 東アジア（中国・モンゴル）" },
  { id: "第5章", label: "第5章 — 東アジア（日本・朝鮮）" },
  { id: "第6章", label: "第6章 — イスラーム世界" },
  { id: "第7章", label: "第7章 — 南アジア・東南アジア" },
  { id: "第8章", label: "第8章 — アメリカ大陸" },
  { id: "第9章", label: "第9章 — 第一次世界大戦" },
  { id: "第10章", label: "第10章 — 第二次世界大戦" },
  { id: "第11章", label: "第11章 — 戦後国際史" },
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
  subtitle: "出来事 → 年号",
  image: "../../../images/worldhistoryquiz.png",

  rangeMode: "single",
  rangeLabel: "章",
  ranges: CHAPTERS,

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
      .from(tables.WH_QUIZ)
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
async function onStart([selectedChapter], count) {
  if (allData.length === 0) {
    const btn = document.getElementById("qz-start-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "読み込み中...";
    }
    if (!(await loadQuestions())) return;
  }

  const filtered = allData.filter((q) => q.chapter === selectedChapter);
  if (filtered.length === 0) {
    alert("この章に問題がありません。別の章を選択してください。");
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
  const correctYear = toDisplayYear(q);
  const correctLabel = formatYear(correctYear);

  // 問題文: 出来事
  showQuestion({
    text: q.event,
    category: q.chapter,
  });

  // 回答: 年号入力
  showTextInput({
    label: "年号を入力",
    placeholder: "例: 1789",
    hint: "紀元前は負の数で入力（例：-221 = 前221年）",
    validate(raw) {
      const n = parseInt(raw, 10);
      if (isNaN(n)) return { ok: false, message: "数字を入力してください" };
      return { ok: true, value: n, isCorrect: n === correctYear };
    },
    onAnswer({ value, isCorrect }) {
      const userLabel = formatYear(value);

      if (isCorrect) {
        correctCount++;
      } else {
        mistakes.push({
          questionText: q.event,
          category: q.chapter,
          userAnswer: userLabel,
          correctAnswer: correctLabel,
        });
      }

      showFeedback({
        isCorrect,
        correctLabel: isCorrect ? null : correctLabel,
        userLabel: isCorrect ? null : userLabel,
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
        .map((m) => allData.find((q) => q.event === m.questionText))
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

function toDisplayYear(q) {
  return q.is_bc ? -Math.abs(q.year) : q.year;
}

// ── エントリポイント ───────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initStartScreen(START_CONFIG);
});
