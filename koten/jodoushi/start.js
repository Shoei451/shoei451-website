let selectedMode = 'typing';
let activeCols = new Set(COL_KEYS);

function saveSettings() {
  localStorage.setItem('jodoushi:selectedMode', selectedMode);
  localStorage.setItem('jodoushi:activeCols', JSON.stringify([...activeCols]));
}

function loadSettings() {
  const savedMode = localStorage.getItem('jodoushi:selectedMode');
  if (savedMode === 'typing' || savedMode === 'table') selectedMode = savedMode;

  try {
    const savedCols = JSON.parse(localStorage.getItem('jodoushi:activeCols') || '[]');
    if (Array.isArray(savedCols) && savedCols.length > 0) {
      activeCols = new Set(savedCols.filter(c => COL_KEYS.includes(c)));
    }
  } catch (_) {}
}

function selectMode(mode) {
  selectedMode = mode;
  document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('modeCard-' + mode).classList.add('selected');
  document.getElementById('colFilterSection').style.display = mode === 'table' ? 'none' : 'block';
}

function toggleCol(el, col) {
  if (activeCols.has(col)) {
    if (activeCols.size === 1) return;
    activeCols.delete(col);
    el.classList.remove('on');
  } else {
    activeCols.add(col);
    el.classList.add('on');
  }
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
  document.querySelectorAll('.col-chip').forEach(chip => {
    const col = chip.dataset.col;
    chip.classList.toggle('on', activeCols.has(col));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  applySettingsToUi();
});
