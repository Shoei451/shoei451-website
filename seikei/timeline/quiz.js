// ============================================================
// seikei/timeline/quiz.js
//
// 政治・経済 年代当てクイズ【出来事 → 年号】
//
// フィルタキー : category
// 回答形式     : 年号入力（text-input.js）
// 問題文       : 出来事　　回答 : 年号を直接入力
// ============================================================

import { db, tables } from "../../js/supabase_config.js";

const SEIKEI_CATEGORIES = [
  "国際政治",
  "国際経済",
  "国内政治",
  "日銀金融政策",
  "農業",
  "消費者生活・公害対策",
  "労働問題",
  "社会保障",
];

let allEvents = [];
let quizSet = [];
let currentIndex = 0;
let correctCount = 0;
let mistakes = [];

const START_CONFIG = {
  title: "政治・経済 年代当てクイズ",
  subtitle: "出来事 → 年号",
  rangeMode: "multi",
  rangeLabel: "出題カテゴリ",
  ranges: SEIKEI_CATEGORIES.map((category) => ({
    id: category,
    label: category,
  })),
  countMode: "slider",
  countMin: 5,
  countMax: 50,
  countDefault: 10,
  onStart,
};

async function loadQuestions() {
  const { data, error } = await db.from(tables.SEIKEI).select("*");

  if (error) {
    showLoadError(error.message);
    return false;
  }

  allEvents = data || [];
  return true;
}

function showLoadError(message) {
  document.getElementById("start-screen").innerHTML = `
    <div style="text-align:center; padding:3rem; color:var(--qz-incorrect);">
      <p style="font-size:1.1rem; font-weight:700; margin-bottom:8px;">⚠️ データ読み込みエラー</p>
      <p style="font-size:0.88rem; color:var(--qz-text-sub);">${escapeHtml(message)}</p>
      <button class="qz-btn qz-btn--ghost" style="margin-top:1.5rem;" onclick="location.reload()">
        再読み込み
      </button>
    </div>
  `;
}

async function onStart(selectedCategories, count) {
  if (allEvents.length === 0) {
    const btn = document.getElementById("qz-start-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "読み込み中...";
    }
    if (!(await loadQuestions())) return;
  }

  const filtered = allEvents.filter((event) =>
    selectedCategories.includes(event.category),
  );

  if (filtered.length === 0) {
    alert("選択したカテゴリに問題がありません。");
    return;
  }

  const total = parseInt(count, 10);
  if (filtered.length < total) {
    alert(
      `選択したカテゴリには${filtered.length}個のイベントしかありません`,
    );
    return;
  }

  quizSet = shuffleArray(filtered).slice(0, total);
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

function renderQuestion(index) {
  hideFeedback();
  updateProgress(index);

  const question = quizSet[index];
  showQuestion({
    text: question.title,
    category: question.category,
    sub: question.description || "",
  });

  showTextInput({
    label: "この出来事は何年？",
    placeholder: "例: 1945",
    hint: "西暦4桁で入力してください",
    maxLength: 4,
    validate(raw) {
      if (!/^\d{4}$/.test(raw)) {
        return {
          ok: false,
          message: "4桁の年を半角数字で入力してください（例：1945）",
        };
      }

      const value = parseInt(raw, 10);
      return {
        ok: true,
        value,
        isCorrect: value === extractYear(question),
      };
    },
    onAnswer({ value, isCorrect }) {
      const correctYear = extractYear(question);
      const userLabel = `${value}年`;
      const correctLabel = `${correctYear}年`;

      if (isCorrect) {
        correctCount++;
      } else {
        mistakes.push({
          id: question.id,
          questionText: question.title,
          category: question.category,
          desc: question.description || "",
          userAnswer: userLabel,
          correctAnswer: correctLabel,
        });
      }

      showFeedback({
        isCorrect,
        correctLabel: isCorrect ? null : correctLabel,
        userLabel: isCorrect ? null : userLabel,
      });
    },
  });
}

function advanceQuestion(index) {
  const next = index + 1;
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
    renderMistake(item) {
      const chip = item.category
        ? `<span class="qz-category-chip" style="font-size:0.7rem;">${escapeHtml(item.category)}</span>`
        : "";
      const desc = item.desc
        ? `<p style="color:var(--qz-text-sub); font-size:0.88rem; margin-top:6px;">${escapeHtml(item.desc)}</p>`
        : "";

      return `
        <div class="qz-review-item__header">
          ${chip}
          <p class="qz-review-item__question">${escapeHtml(item.questionText)}</p>
        </div>
        ${desc}
        <div class="qz-review-item__answers">
          <span class="qz-review-item__user">あなた：${escapeHtml(item.userAnswer)}</span>
          <span class="qz-review-item__correct">正解：<strong>${escapeHtml(item.correctAnswer)}</strong></span>
        </div>
      `;
    },
    onRetry: resetToStart,
    onRetryMistakes(items) {
      quizSet = items
        .map((item) => allEvents.find((event) => event.id === item.id))
        .filter(Boolean);

      if (!quizSet.length) {
        resetToStart();
        return;
      }

      currentIndex = 0;
      correctCount = 0;
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

function extractYear(question) {
  return parseInt(String(question.date).substring(0, 4), 10);
}

function resetToStart() {
  const startScreen = document.getElementById("start-screen");
  startScreen.innerHTML = "";
  startScreen.classList.add("hidden");
  showScreen("start-screen");
  initStartScreen(START_CONFIG);
}

function showScreen(id) {
  ["start-screen", "quiz-screen", "result-screen"].forEach((screenId) =>
    document.getElementById(screenId).classList.add("hidden"),
  );
  document.getElementById(id).classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  initStartScreen(START_CONFIG);
});
