/* logic.js — quiz engine (data-agnostic, expects ALL_QA global) */

let currentCat = "ALL";
let questions = [], idx = 0, answered = 0, correct = 0, wrong = 0, revealed = false;

/* ── helpers ── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getQuestions() {
  return currentCat === "ALL" ? [...ALL_QA] : ALL_QA.filter(q => q.cat === currentCat);
}

/* ── screens ── */
function showScreen(id) {
  ["start-screen", "quiz-area", "result-screen"].forEach(s => {
    document.getElementById(s).style.display = s === id ? "" : "none";
  });
}

/* ── start screen ── */
function buildStartScreen() {
  const cats = ["ALL", ...new Set(ALL_QA.map(q => q.cat))];
  const grid = document.getElementById("cat-grid");
  grid.innerHTML = "";
  cats.forEach(cat => {
    const count = cat === "ALL" ? ALL_QA.length : ALL_QA.filter(q => q.cat === cat).length;
    const btn = document.createElement("button");
    btn.className = "cat-btn" + (cat === currentCat ? " active" : "");
    btn.innerHTML = `<span class="cat-name">${cat}</span><span class="cat-count">${count}問</span>`;
    btn.onclick = () => {
      currentCat = cat;
      grid.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    };
    grid.appendChild(btn);
  });
}

function startQuiz(doShuffle) {
  questions = doShuffle ? shuffle(getQuestions()) : getQuestions();
  idx = 0; answered = 0; correct = 0; wrong = 0;
  updateStats();
  showCard();
  showScreen("quiz-area");
}

/* ── quiz ── */
function showCard() {
  if (idx >= questions.length) { showResult(); return; }
  const q = questions[idx];
  document.getElementById("card-category").textContent = q.cat.toUpperCase();
  document.getElementById("card-number").textContent = `${idx + 1} / ${questions.length}`;
  document.getElementById("card-question").textContent = q.q;
  document.getElementById("card-answer").textContent = q.a;
  document.getElementById("answer-area").classList.remove("visible");
  document.getElementById("reveal-row").style.display = "";
  document.getElementById("mark-row").style.display = "none";
  revealed = false;

  const card = document.getElementById("quiz-card");
  card.style.animation = "none";
  void card.offsetWidth;
  card.style.animation = "";
}

function revealAnswer() {
  document.getElementById("answer-area").classList.add("visible");
  document.getElementById("reveal-row").style.display = "none";
  document.getElementById("mark-row").style.display = "";
  revealed = true;
}

function mark(isCorrect) {
  if (!revealed) return;
  answered++;
  if (isCorrect) correct++; else wrong++;
  idx++;
  updateStats();
  showCard();
}

function updateStats() {
  const total = questions.length;
  document.getElementById("s-answered").textContent = answered;
  document.getElementById("s-correct").textContent  = correct;
  document.getElementById("s-wrong").textContent    = wrong;
  const pct = answered > 0 ? Math.round(correct / answered * 100) : 0;
  document.getElementById("s-pct").textContent = answered > 0 ? pct + "%" : "—%";
  const prog = total ? Math.round(answered / total * 100) : 0;
  document.getElementById("progress-bar").style.width = prog + "%";
  document.getElementById("progress-label").textContent = `${answered} / ${total}`;
}

/* ── result ── */
function showResult() {
  showScreen("result-screen");
  const pct = questions.length ? Math.round(correct / questions.length * 100) : 0;
  document.getElementById("result-score").textContent = `SCORE: ${correct} / ${questions.length}  [${pct}%]`;
  const msgs = [[90,">> EXCELLENT. 本番も大丈夫！"],[70,">> GOOD JOB. あと少し！"],[50,">> KEEP GOING. 苦手を復習しよう。"],[0,">> RETRY. もう一度挑戦！"]];
  document.getElementById("result-msg").textContent = msgs.find(([t]) => pct >= t)[1];
  document.getElementById("result-detail").textContent = `正解 ${correct}問 / 不正解 ${wrong}問 / 計 ${questions.length}問`;
}

function goToStart() {
  buildStartScreen();
  showScreen("start-screen");
}

/* ── init ── */
window.addEventListener("DOMContentLoaded", () => {
  buildStartScreen();
  showScreen("start-screen");
});