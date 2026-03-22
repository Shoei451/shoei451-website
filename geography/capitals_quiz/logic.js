// Quiz Logic
let quizList = [];
let index = 0;
let correct = 0;
let questionCount = 10;
let currentAnswer = "";
let currentAnswerJP = "";

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function updateProgress() {
  const progress = (index / quizList.length) * 100;
  document.getElementById('progressBar').style.width = progress + '%';
}

function startGame() {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("quizScreen").style.display = "block";

  questionCount = Number(document.getElementById("questionCount").value);
  const region = document.getElementById("regionSelect").value;

  quizList = region === "all"
    ? [...countries]
    : countries.filter(c => c.region === region);

  shuffle(quizList);
  quizList = quizList.slice(0, questionCount);

  index = 0;
  correct = 0;
  updateProgress();
  loadQuestion();
}

function loadQuestion() {
  if (index >= quizList.length) {
    const percentage = Math.round((correct / quizList.length) * 100);
    document.getElementById("result").innerHTML = `
      <strong>Quiz Complete!</strong><br>
      Final Score: ${correct} / ${quizList.length} (${percentage}%)
    `;
    document.getElementById("flag").style.display = "none";
    document.getElementById("country").textContent = "";
    document.getElementById("options").innerHTML = "";
    return;
  }

  const q = quizList[index];
  currentAnswer = q.capital;
  currentAnswerJP = q.capitalJP;

  document.getElementById("flag").style.display = "block";
  document.getElementById("flag").src = `https://flagcdn.com/w320/${q.code}.png`;
  document.getElementById("country").textContent = q.country;
  document.getElementById("result").textContent = "";

  let options = [q.capital];
  while (options.length < 4) {
    let r = countries[Math.floor(Math.random() * countries.length)].capital;
    if (!options.includes(r)) options.push(r);
  }

  shuffle(options);

  const box = document.getElementById("options");
  box.innerHTML = "";
  options.forEach(opt => {
    const countryObj = countries.find(c => c.capital === opt);
    const btn = document.createElement("button");
    btn.innerHTML = `${countryObj.capital}<br><small>${countryObj.capitalJP}</small>`;
    btn.onclick = () => showAnswer(opt);
    box.appendChild(btn);
  });

  updateProgress();
}

function showAnswer(sel) {
  const result = document.getElementById("result");
  
  result.classList.remove("correct", "wrong");
  void result.offsetWidth;

  index++;

  if (sel === currentAnswer) {
    correct++;
    result.textContent = "Correct!";
    result.classList.add("correct");
  } else {
    result.textContent = "Wrong! Answer: " + currentAnswer + " (" + currentAnswerJP + ")";
    result.classList.add("wrong");
  }

  document.getElementById("score").textContent = `Score: ${correct} / ${index}`;

  // Disable all buttons
  document.querySelectorAll("#options button").forEach(btn => {
    btn.disabled = true;
    btn.style.cursor = "not-allowed";
    btn.style.opacity = "0.6";
  });

  setTimeout(() => {
    loadQuestion();
  }, 1500);
}

function goToTop() {
  document.getElementById("quizScreen").style.display = "none";
  document.getElementById("startScreen").style.display = "block";
  document.getElementById("result").textContent = "";
  document.getElementById("score").textContent = "Score: 0 / 0";
  document.getElementById("progressBar").style.width = "0%";
}
