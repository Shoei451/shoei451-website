let selectedMode = 'typing';
let questionCount = 20;
const STORAGE_QUESTION_COUNT = 'jodoushi:questionCount';
const MAX_TYPING_COUNT = 50;
const MAX_TABLE_COUNT = 29;

function saveSettings() {
  localStorage.setItem('jodoushi:selectedMode', selectedMode);
  localStorage.setItem(STORAGE_QUESTION_COUNT, String(questionCount));
}

function loadSettings() {
  const savedMode = localStorage.getItem('jodoushi:selectedMode');
  if (savedMode === 'typing' || savedMode === 'table') selectedMode = savedMode;
  const savedCount = Number(localStorage.getItem(STORAGE_QUESTION_COUNT) || 20);
  if (Number.isFinite(savedCount)) {
    questionCount = Math.max(1, Math.min(MAX_TYPING_COUNT, Math.floor(savedCount)));
  }
}

function selectMode(mode) {
  selectedMode = mode;
  document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('modeCard-' + mode).classList.add('selected');
  applyQuestionCountUiByMode();
}

function updateQuestionCount(value) {
  const n = Number(value);
  questionCount = Number.isFinite(n) ? n : questionCount;
  const out = document.getElementById('questionCountValue');
  if (out) out.textContent = String(questionCount);
}

function applyQuestionCountUiByMode() {
  const range = document.getElementById('questionCountRange');
  const out = document.getElementById('questionCountValue');
  const unit = document.getElementById('questionCountUnit');
  if (!range || !out || !unit) return;
  const max = selectedMode === 'table' ? MAX_TABLE_COUNT : MAX_TYPING_COUNT;
  const min = 1;
  questionCount = Math.max(min, Math.min(max, questionCount));
  range.min = String(min);
  range.max = String(max);
  range.step = '1';
  range.value = String(questionCount);
  out.textContent = String(questionCount);
  unit.textContent = selectedMode === 'table' ? '助動詞' : '問';
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
  applyQuestionCountUiByMode();
}

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  applySettingsToUi();
});
