let selectedMode = 'typing';

function saveSettings() {
  localStorage.setItem('jodoushi:selectedMode', selectedMode);
}

function loadSettings() {
  const savedMode = localStorage.getItem('jodoushi:selectedMode');
  if (savedMode === 'typing' || savedMode === 'table') selectedMode = savedMode;
}

function selectMode(mode) {
  selectedMode = mode;
  document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('modeCard-' + mode).classList.add('selected');
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
}

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  applySettingsToUi();
});
