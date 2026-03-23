// ============================================================
// history/world/quiz.js
//
// 世界史年代クイズ — world 固有ロジック。
// quiz-components/ の各コンポーネントを呼び出してクイズを制御する。
//
// 依存（読み込み順）:
//   @supabase/supabase-js
//   js/supabase_config.js   → db, TABLES
//   quiz-components/start/start-screen.js
//   quiz-components/progress/progress.js
//   quiz-components/question/question-area.js
//   quiz-components/answer/choice-buttons.js
//   quiz-components/feedback/feedback.js
//   quiz-components/result/result.js
//   history/world/quiz.js   ← このファイル
//
// テーブル: TABLES.WH_QUIZ（world_history_quiz）
//   将来 wh_dates に切り替える場合は loadQuestions() と
//   buildChoices() の内部だけ変更すればよい。
// ============================================================

// ── 状態 ──────────────────────────────────────────────────
let allData       = [];   // Supabaseから取得した全問題
let quizSet       = [];   // 今回の出題セット
let currentIndex  = 0;
let correctCount  = 0;
let mistakes      = [];
let currentMode   = "";   // "yearToEvent" | "eventToYear"
let currentSection = "";  // 選択した period or chapter の id

// ── 時代区分・章の定義 ────────────────────────────────────
const PERIODS = [
  { id: "~0",        label: "紀元前" },
  { id: "1~1000",    label: "1年〜1000年" },
  { id: "1001~1500", label: "1001年〜1500年" },
  { id: "1501~1700", label: "1501年〜1700年" },
  { id: "1701~1800", label: "1701年〜1800年" },
  { id: "1801~1900", label: "1801年〜1900年" },
  { id: "1901~1945", label: "1901年〜1945年" },
  { id: "1946~1989", label: "1946年〜1989年" },
  { id: "1990~",     label: "1990年〜" },
];

const CHAPTERS = [
  { id: "第1章",  label: "古代文明圏【オリエント・ギリシア・ローマ・中国古代】" },
  { id: "第2章",  label: "中世ヨーロッパ" },
  { id: "第3章",  label: "近現代ヨーロッパ" },
  { id: "第4章",  label: "東アジア（中国・モンゴル）" },
  { id: "第5章",  label: "東アジア（日本・朝鮮）" },
  { id: "第6章",  label: "イスラーム世界" },
  { id: "第7章",  label: "南アジア・東南アジア" },
  { id: "第8章",  label: "アメリカ大陸" },
  { id: "第9章",  label: "第一次世界大戦" },
  { id: "第10章", label: "第二次世界大戦" },
  { id: "第11章", label: "戦後国際史" },
];

// ── start-screen config ───────────────────────────────────
// ranges は選択したモード（period / chapter）に応じて動的に差し替える。
// ここではモード選択を「ranges の single 選択」として表現する。
// onStart → loadQuestions → startQuiz の順で呼ばれる。

function buildStartConfig() {
  return {
    title:    "世界史年代クイズ",
    subtitle: "年代と出来事を結びつけよう",
    image:    "../../images/worldhistoryquiz.png",

    // Step 1: 出題モード選択（単一）
    rangeMode:  "single",
    rangeLabel: "出題モード",
    ranges: [
      { id: "yearToEvent", label: "【年号出題】年号 → 出来事" },
      { id: "eventToYear", label: "【出来事出題】出来事 → 年号" },
    ],

    countMode:    "select",
    countDefault: 10,
    countOptions: [10, 20, 30, "all"],

    onStart(selectedRanges, count) {
      currentMode = selectedRanges[0];
      // モード確定後、セクション選択画面へ遷移
      showSectionPicker(currentMode, count);
    },
  };
}

// ── セクション選択（2段階スタート画面の2段目） ────────────
// start-screen.js を再利用してセクション選択を描画する。

function showSectionPicker(mode, count) {
  const isByChapter = mode === "eventToYear";  // 章別 or 時代別（旧仕様そのまま）
  // ※ 旧ロジックでは yearToEvent=period別、eventToYear=chapter別 だったが、
  //    今回は両モードとも同じセクション（period / chapter）を選べるようにする。
  //    ただし旧仕様を維持したい場合は isByChapter の判定に戻す。

  initStartScreen({
    title:    "出題範囲を選択",
    subtitle: mode === "yearToEvent" ? "年号 → 出来事モード" : "出来事 → 年号モード",

    rangeMode:  "single",
    rangeLabel: "時代区分",
    ranges:     PERIODS,   // 両モードとも時代別で統一（旧仕様と若干異なる）

    countMode:    "select",
    countDefault: count,
    countOptions: [10, 20, 30, "all"],

    startLabel: "クイズを開始",

    onStart(selectedRanges, finalCount) {
      currentSection = selectedRanges[0];
      onQuizStart(finalCount);
    },
  });
}

// ── データ読み込み ─────────────────────────────────────────
async function loadQuestions() {
  // 1000件超を想定してページネーション
  let all   = [];
  let start = 0;
  const BATCH = 1000;

  while (true) {
    const { data, error } = await db
      .from(TABLES.WH_QUIZ)
      .select("*")
      .order("is_bc", { ascending: false })
      .order("year",  { ascending: true })
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
    <div style="text-align:center; padding: 3rem; color: var(--qz-incorrect);">
      <p style="font-size:1.1rem; font-weight:700; margin-bottom:8px;">⚠️ データ読み込みエラー</p>
      <p style="font-size:0.88rem; color:var(--qz-text-sub);">${msg}</p>
      <button class="qz-btn qz-btn--ghost" style="margin-top:1.5rem;"
              onclick="location.reload()">再読み込み</button>
    </div>
  `;
}

// ── クイズ開始 ────────────────────────────────────────────
async function onQuizStart(count) {
  // データ未取得なら読み込む
  if (allData.length === 0) {
    // スタートボタンをローディング表示に
    const btn = document.getElementById("qz-start-btn");
    if (btn) { btn.disabled = true; btn.textContent = "読み込み中..."; }

    const ok = await loadQuestions();
    if (!ok) return;
  }

  // セクションでフィルタ
  const filtered = allData.filter(q => q.period === currentSection);

  if (filtered.length === 0) {
    alert("このセクションに問題がありません。別のセクションを選択してください。");
    return;
  }

  const total = count === "all" ? filtered.length : parseInt(count);
  quizSet      = shuffleArray(filtered).slice(0, Math.min(total, filtered.length));
  currentIndex = 0;
  correctCount = 0;
  mistakes     = [];

  // progress 初期化
  initProgress({
    total:         quizSet.length,
    lastLabel:     "結果を見る",
    resetConfirm:  "最初に戻りますか？進捗はリセットされます。",
    onNext:        advanceQuestion,
    onReset:       resetToStart,
  });

  showScreen("quiz-screen");
  renderQuestion(0);
}

// ── 問題描画 ──────────────────────────────────────────────
function renderQuestion(i) {
  hideFeedback();
  updateProgress(i);

  const q = quizSet[i];

  if (currentMode === "yearToEvent") {
    // 問題文: 年号　選択肢: 出来事
    showQuestion({
      text:     formatYear(toDisplayYear(q)),
      category: q.period,
    });

    const others = buildDistractors_byEvent(q, allData);
    const options = shuffleArray([q, ...others]).map(item => item.event);

    showChoices({
      options,
      correct: q.event,
      onAnswer({ isCorrect, selected }) {
        recordAnswer(q, isCorrect, selected, q.event);
        showFeedback({
          isCorrect,
          correctLabel: isCorrect ? null : q.event,
          userLabel:    isCorrect ? null : selected,
        });
      },
    });

  } else {
    // 問題文: 出来事　選択肢: 年号
    showQuestion({
      text:     q.event,
      category: q.chapter,
    });

    const others  = buildDistractors_byYear(q, allData);
    const options = shuffleArray([q, ...others]).map(item => formatYear(toDisplayYear(item)));
    const correct = formatYear(toDisplayYear(q));

    showChoices({
      options,
      correct,
      onAnswer({ isCorrect, selected, buttons }) {
        recordAnswer(q, isCorrect, selected, correct);

        // eventToYear 固有: 不正解時に全選択肢へ年号を補足表示
        if (!isCorrect) {
          appendYearAnnotations(buttons, options, [q, ...others]);
        }

        showFeedback({
          isCorrect,
          correctLabel: isCorrect ? null : correct,
          userLabel:    isCorrect ? null : selected,
          // 正解の出来事名を extra で補足表示
          extraRenderer: isCorrect ? null : (el) => {
            el.innerHTML = `<p style="font-size:0.85rem; margin-top:4px;">
              出来事：<strong>${escHtml(q.event)}</strong>
            </p>`;
          },
        });
      },
    });
  }
}

// ── eventToYear 固有: 不正解時の年号補足表示 ─────────────
// ボタンのテキストの下に対応する年号を追記する。
function appendYearAnnotations(buttons, yearLabels, questionItems) {
  // yearLabels[i] は既にフォーマット済みの年号文字列
  // buttons[i] がその選択肢ボタンに対応している
  buttons.forEach((btn, i) => {
    const item = questionItems[i];
    if (!item) return;
    const textEl = btn.querySelector(".qz-choice__text");
    if (!textEl) return;

    // すでに注釈がある場合はスキップ
    if (btn.querySelector(".qz-year-annotation")) return;

    const note = document.createElement("span");
    note.className = "qz-year-annotation";
    note.textContent = yearLabels[i] ?? "";
    textEl.appendChild(note);
  });
}

// ── 選択肢生成 ────────────────────────────────────────────

// yearToEvent: 同じ period から 3 件の不正解選択肢を取得
function buildDistractors_byEvent(current, pool) {
  return shuffleArray(
    pool.filter(q => q.period === current.period && q.event !== current.event)
  ).slice(0, 3);
}

// eventToYear: 同じ chapter から年号が重複しない 3 件を取得
// 不足する場合は全データから補充
function buildDistractors_byYear(current, pool) {
  const usedYears = new Set([`${current.is_bc}-${current.year}`]);
  const result    = [];

  // まず同章から探す
  for (const q of shuffleArray(pool.filter(q => q.chapter === current.chapter))) {
    const key = `${q.is_bc}-${q.year}`;
    if (usedYears.has(key)) continue;
    usedYears.add(key);
    result.push(q);
    if (result.length >= 3) break;
  }

  // 不足分を全データから補充
  if (result.length < 3) {
    for (const q of shuffleArray(pool)) {
      const key = `${q.is_bc}-${q.year}`;
      if (usedYears.has(key)) continue;
      usedYears.add(key);
      result.push(q);
      if (result.length >= 3) break;
    }
  }

  return result;
}

// ── 回答記録 ──────────────────────────────────────────────
function recordAnswer(q, isCorrect, userAnswer, correctAnswer) {
  if (isCorrect) {
    correctCount++;
  } else {
    mistakes.push({
      questionText:  currentMode === "yearToEvent"
                      ? formatYear(toDisplayYear(q))
                      : q.event,
      category:      q.period ?? q.chapter ?? null,
      userAnswer,
      correctAnswer,
    });
  }
}

// ── 次の問題 / 結果へ ─────────────────────────────────────
function advanceQuestion(idx) {
  const next = idx + 1;
  if (next < quizSet.length) {
    currentIndex = next;
    renderQuestion(next);
  } else {
    showScreen("result-screen");
    showResult({
      correct:  correctCount,
      total:    quizSet.length,
      mistakes,
      onRetry:  resetToStart,
      onRetryMistakes(ms) {
        // 復習モード: 間違えた問題だけ再出題
        quizSet = ms.map(m =>
          allData.find(q =>
            (currentMode === "yearToEvent"
              ? formatYear(toDisplayYear(q))
              : q.event) === m.questionText
          )
        ).filter(Boolean);

        if (quizSet.length === 0) { resetToStart(); return; }

        currentIndex = correctCount = 0;
        mistakes = [];

        initProgress({
          total:        quizSet.length,
          lastLabel:    "結果を見る",
          resetConfirm: "最初に戻りますか？",
          onNext:       advanceQuestion,
          onReset:      resetToStart,
        });

        showScreen("quiz-screen");
        renderQuestion(0);
      },
    });
  }
}

// ── リセット ──────────────────────────────────────────────
function resetToStart() {
  const el = document.getElementById("start-screen");
  el.innerHTML = "";
  el.classList.add("hidden");
  showScreen("start-screen");
  initStartScreen(buildStartConfig());
}

// ── 画面切替 ──────────────────────────────────────────────
function showScreen(id) {
  ["start-screen", "quiz-screen", "result-screen"].forEach(s =>
    document.getElementById(s).classList.add("hidden")
  );
  document.getElementById(id).classList.remove("hidden");
}

// ── ユーティリティ ────────────────────────────────────────

// wh-utils.js の formatYear と同じ仕様（year が負数 → 紀元前）
function formatYear(y) {
  if (y === null || y === undefined) return "不明";
  return y < 0 ? `前${Math.abs(y)}年` : `${y}年`;
}

// world_history_quiz は is_bc フラグ + 正数 year の旧仕様
// → 表示用に負数統一の値に変換する
function toDisplayYear(q) {
  return q.is_bc ? -Math.abs(q.year) : q.year;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── エントリポイント ───────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initStartScreen(buildStartConfig());
});