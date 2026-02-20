let selectedMode = 'typing';
let questionCount = 20;
const STORAGE_QUESTION_COUNT = 'jodoushi:questionCount';

function saveSettings() {
  localStorage.setItem('jodoushi:selectedMode', selectedMode);
  localStorage.setItem(STORAGE_QUESTION_COUNT, String(questionCount));
}

function loadSettings() {
  const savedMode = localStorage.getItem('jodoushi:selectedMode');
  if (savedMode === 'typing' || savedMode === 'table') selectedMode = savedMode;
  const savedCount = Number(localStorage.getItem(STORAGE_QUESTION_COUNT) || 20);
  if (Number.isFinite(savedCount)) {
    questionCount = Math.max(5, Math.min(50, Math.floor(savedCount / 5) * 5));
  }
}

function selectMode(mode) {
  selectedMode = mode;
  document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('modeCard-' + mode).classList.add('selected');
}

function updateQuestionCount(value) {
  questionCount = Number(value);
  const out = document.getElementById('questionCountValue');
  if (out) out.textContent = String(questionCount);
}

function startQuiz() {
  saveSettings();
  if (selectedMode === 'table') {
    window.location.href = 'table.html';
  } else {
    window.location.href = 'typing.html';
  }
}

function applySettingsToUi() {
  selectMode(selectedMode);
  const range = document.getElementById('questionCountRange');
  const out = document.getElementById('questionCountValue');
  if (range) range.value = String(questionCount);
  if (out) out.textContent = String(questionCount);
}

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  applySettingsToUi();
});
