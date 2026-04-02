// ══════════════════════════════════════════════════════════
// culture-quiz.js — 文化史クイズ ロジック
// ════════════════════════════════════════════════

// ── ユーティリティ ──
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function escHtml(s) {
  const d = document.createElement('div'); d.textContent = s; return d.innerHTML;
}
function showToast(msg, ms = 1400) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('visible');
  setTimeout(() => t.classList.remove('visible'), ms);
}

// ── State ──
let state = {
  mode: null,
  currentQ: 0,
  score: 0,
  questions: [],          // p2d, d2p, tf 用
  checked: new Set(),     // d2p checkbox
  showResult: false,
  matchData: null,
  selectedMatch: null,
  tlItems: [],            // timeline 並べ替え中の配列
  tlCorrect: [],
};

function resetState() {
  state.currentQ = 0; state.score = 0; state.questions = [];
  state.checked = new Set(); state.showResult = false;
  state.matchData = null; state.selectedMatch = null;
  state.tlItems = []; state.tlCorrect = [];
}

// ── ビュー切り替え ──
const VIEWS = ['Menu','P2D','D2P','Match','TF','Timeline','Results'];
function showView(name) {
  VIEWS.forEach(v => {
    const el = document.getElementById('view' + v);
    if (el) el.classList.toggle('hidden', v !== name);
  });
}

// ── クイズ開始 ──
function startQuiz(mode) {
  resetState(); state.mode = mode;
  if (mode === 'person-to-dynasty') { genP2D(); renderP2D(); showView('P2D'); }
  else if (mode === 'dynasty-to-people') { genD2P(); renderD2P(); showView('D2P'); }
  else if (mode === 'matching') { genMatch(); renderMatch(); showView('Match'); }
  else if (mode === 'truefalse') { genTF(); renderTF(); showView('TF'); }
  else if (mode === 'timeline') { genTimeline(); renderTimeline(); showView('Timeline'); }
}
function resetToMenu() { showView('Menu'); }
function retryMode() { startQuiz(state.mode); }

// ════════════════════════════════
// MODE 01: 人物 → 王朝（4択）
// ════════════════════════════════
function genP2D() {
  state.questions = shuffle(quizData).slice(0, 10).map(p => {
    const wrong = shuffle(dynasties.filter(d => d !== p.dynasty)).slice(0, 3);
    return { question: p.name, options: shuffle([...wrong, p.dynasty]),
             correct: p.dynasty, info: p.category, type: 'single' };
  });
}

function renderP2D() {
  const q = state.questions[state.currentQ];
  const n = state.currentQ + 1, total = state.questions.length;
  document.getElementById('p2d-progress').textContent = `問題 ${n} / ${total}`;
  document.getElementById('p2d-score').textContent = `正解: ${state.score}`;
  document.getElementById('p2d-fill').style.width = (n / total * 100) + '%';
  document.getElementById('p2d-question').textContent = q.question;
  document.getElementById('p2d-info').textContent = `カテゴリ: ${q.info}`;

  const grid = document.getElementById('p2d-options');
  grid.innerHTML = q.options.map(opt => {
    let cls = 'option-btn';
    let icon = '';
    if (state.showResult) {
      if (opt === q.correct)          { cls += ' correct';   icon = '<span class="option-icon">✓</span>'; }
      else if (opt === state.selected){ cls += ' incorrect'; icon = '<span class="option-icon">✗</span>'; }
    }
    const dis = state.showResult ? 'disabled' : '';
    return `<button class="${cls}" onclick="handleP2D('${escHtml(opt)}')" ${dis}>
              ${escHtml(opt)}${icon}
            </button>`;
  }).join('');

  const actions = document.getElementById('p2d-actions');
  if (state.showResult) {
    const label = state.currentQ < state.questions.length - 1 ? '次の問題 →' : '結果を見る →';
    actions.innerHTML = `<button class="btn-next" onclick="nextP2D()">${label}</button>`;
  } else {
    actions.innerHTML = '';
  }
}

function handleP2D(opt) {
  if (state.showResult) return;
  state.selected = opt; state.showResult = true;
  if (opt === state.questions[state.currentQ].correct) state.score++;
  renderP2D();
}
function nextP2D() {
  if (state.currentQ < state.questions.length - 1) {
    state.currentQ++; state.showResult = false; state.selected = null; renderP2D();
  } else { showResults(state.score, state.questions.length); }
}

// ════════════════════════════════
// MODE 02: 王朝 → 人物（checkbox）
// ════════════════════════════════
function genD2P() {
  const avail = dynasties.filter(d => quizData.some(p => p.dynasty === d));
  state.questions = shuffle(avail).slice(0, 5).map(dynasty => {
    const correct = quizData.filter(p => p.dynasty === dynasty);
    const wrong = shuffle(quizData.filter(p => p.dynasty !== dynasty)).slice(0, 4);
    return { question: dynasty, options: shuffle([...correct, ...wrong]).map(p => p.name),
             correct: correct.map(p => p.name), type: 'multiple' };
  });
}

function renderD2P() {
  const q = state.questions[state.currentQ];
  const n = state.currentQ + 1, total = state.questions.length;
  document.getElementById('d2p-progress').textContent = `問題 ${n} / ${total}`;
  document.getElementById('d2p-score').textContent = `正解: ${state.score}`;
  document.getElementById('d2p-fill').style.width = (n / total * 100) + '%';
  document.getElementById('d2p-question').textContent = q.question;

  const correctSet = new Set(q.correct);
  const grid = document.getElementById('d2p-options');
  grid.innerHTML = q.options.map(name => {
    const isChecked  = state.checked.has(name);
    const isCorrect  = correctSet.has(name);
    let cls = 'checkbox-item';
    let resultIcon = '';

    if (state.showResult) {
      cls += ' disabled';
      if (isCorrect && isChecked)   { cls += ' correct';   resultIcon = '✓'; }
      else if (isCorrect && !isChecked) { cls += ' missed'; resultIcon = '!'; }   // 選び忘れ
      else if (!isCorrect && isChecked) { cls += ' incorrect'; resultIcon = '✗'; } // 誤選択
    } else {
      if (isChecked) cls += ' checked';
    }

    const onClick = state.showResult ? '' : `onclick="toggleD2P('${escHtml(name)}')"`;
    // 変更後
    const personDynasty = quizData.find(p => p.name === name)?.dynasty ?? '';
    return `
    <div class="${cls}" ${onClick}>
    <div class="checkbox-box"><span class="checkbox-check"></span></div>
    <span class="checkbox-label">${escHtml(name)}</span>
    <span class="checkbox-dynasty">${escHtml(personDynasty)}</span>
    <span class="checkbox-result-icon">${resultIcon}</span>
  </div>`;
  }).join('');

  const actions = document.getElementById('d2p-actions');
  if (state.showResult) {
    const label = state.currentQ < state.questions.length - 1 ? '次の問題 →' : '結果を見る →';
    actions.innerHTML = `<button class="btn-next" onclick="nextD2P()">${label}</button>`;
  } else {
    actions.innerHTML = `<button class="btn-primary" id="d2p-submit"
      onclick="submitD2P()" ${state.checked.size === 0 ? 'disabled' : ''}>解答を確定</button>`;
  }
}

function toggleD2P(name) {
  if (state.showResult) return;
  if (state.checked.has(name)) state.checked.delete(name);
  else state.checked.add(name);
  renderD2P();
}
function submitD2P() {
  if (state.showResult) return;
  state.showResult = true;
  const q = state.questions[state.currentQ];
  const correctSet = new Set(q.correct);
  // 全正解かつ誤選択なし → 正解
  const allCorrect = [...correctSet].every(n => state.checked.has(n));
  const noWrong    = [...state.checked].every(n => correctSet.has(n));
  if (allCorrect && noWrong) state.score++;
  renderD2P();
}
function nextD2P() {
  if (state.currentQ < state.questions.length - 1) {
    state.currentQ++; state.showResult = false; state.checked = new Set(); renderD2P();
  } else { showResults(state.score, state.questions.length); }
}

// ════════════════════════════════
// MODE 03: マッチング
// ════════════════════════════════
function genMatch() {
  const picked = shuffle(quizData.filter(p => p.works.length > 0)).slice(0, 6);
  state.matchData = {
    people:  picked.map((p, i) => ({ id: `person-${i}`, text: p.name, type: 'person' })),
    works:   shuffle(picked.map((p, i) => ({ id: `work-${i}`, text: p.works[0], type: 'work' }))),
    matched: [],
    correct: picked.map(p => ({ person: p.name, work: p.works[0] })),
  };
}

function renderMatch() {
  const d = state.matchData;
  document.getElementById('match-score').textContent = `${d.matched.length} / ${d.correct.length}`;

  const isMatchedPerson = t => d.matched.some(m => m.person === t);
  const isMatchedWork   = t => d.matched.some(m => m.work   === t);

  document.getElementById('match-people').innerHTML = d.people.map(item => {
    const matched = isMatchedPerson(item.text);
    const selected = state.selectedMatch?.id === item.id;
    let cls = 'match-item' + (matched ? ' matched' : selected ? ' selected' : '');
    const dis = matched ? 'pointer-events:none' : '';
    return `<div class="${cls}" style="${dis}" onclick="handleMatch(${JSON.stringify(item).replace(/"/g,'&quot;')})">${escHtml(item.text)}</div>`;
  }).join('');

  document.getElementById('match-works').innerHTML = d.works.map(item => {
    const matched = isMatchedWork(item.text);
    const selected = state.selectedMatch?.id === item.id;
    let cls = 'match-item' + (matched ? ' matched' : selected ? ' selected' : '');
    const dis = matched ? 'pointer-events:none' : '';
    return `<div class="${cls}" style="${dis}" onclick="handleMatch(${JSON.stringify(item).replace(/"/g,'&quot;')})">${escHtml(item.text)}</div>`;
  }).join('');

  const actions = document.getElementById('match-actions');
  if (d.matched.length === d.correct.length) {
    actions.innerHTML = `<button class="btn-next" onclick="showResults(${d.correct.length},${d.correct.length})">結果を見る →</button>`;
    state.score = d.correct.length;
  } else { actions.innerHTML = ''; }
}

function handleMatch(item) {
  const d = state.matchData;
  if (!state.selectedMatch) {
    state.selectedMatch = item;
  } else {
    if (state.selectedMatch.type !== item.type) {
      const person = state.selectedMatch.type === 'person' ? state.selectedMatch : item;
      const work   = state.selectedMatch.type === 'work'   ? state.selectedMatch : item;
      const isCorrect = d.correct.some(m => m.person === person.text && m.work === work.text);
      if (isCorrect) {
        d.matched.push({ person: person.text, work: work.text });
        state.score++;
        showToast('✓ 正解！');
      } else {
        showToast('✗ 不正解');
      }
    }
    state.selectedMatch = null;
  }
  renderMatch();
}

// ════════════════════════════════
// MODE 04: ◯ / ✗
// ════════════════════════════════
function genTF() {
  const dyStmts = [], wkStmts = [];
  quizData.forEach(p => {
    dyStmts.push({ statement: `${p.name}は${p.dynasty}の人物である`, correct: true });
    const wrong = shuffle(dynasties.filter(d => d !== p.dynasty))[0];
    dyStmts.push({ statement: `${p.name}は${wrong}の人物である`, correct: false });
  });
  const withWorks = quizData.filter(p => p.works.length > 0);
  withWorks.forEach(p => {
    wkStmts.push({ statement: `${p.name}の主な功績に『${p.works[0]}』がある`, correct: true });
    const other = shuffle(withWorks.filter(q => q.name !== p.name))[0];
    if (other) wkStmts.push({ statement: `${p.name}の主な功績に『${other.works[0]}』がある`, correct: false });
  });
  state.questions = shuffle([
    ...shuffle(dyStmts).slice(0, 5),
    ...shuffle(wkStmts).slice(0, 5),
  ]).map(s => ({ question: s.statement, correct: s.correct, type: 'truefalse' }));
}

function renderTF() {
  const q = state.questions[state.currentQ];
  const n = state.currentQ + 1, total = state.questions.length;
  document.getElementById('tf-progress').textContent = `問題 ${n} / ${total}`;
  document.getElementById('tf-score').textContent = `正解: ${state.score}`;
  document.getElementById('tf-fill').style.width = (n / total * 100) + '%';
  document.getElementById('tf-question').textContent = q.question;

  const trueSelected  = state.selected === true;
  const falseSelected = state.selected === false;
  let tCls = 'tf-btn', fCls = 'tf-btn';

  if (state.showResult) {
    if (q.correct === true)  { tCls += ' correct'; if (falseSelected) fCls += ' incorrect'; }
    else                     { fCls += ' correct'; if (trueSelected)  tCls += ' incorrect'; }
  } else {
    if (trueSelected)  tCls += ' selected';
    if (falseSelected) fCls += ' selected';
  }
  const dis = state.showResult ? 'disabled' : '';
  document.getElementById('tf-options').innerHTML = `
    <button class="${tCls}" onclick="handleTF(true)"  ${dis}>◯</button>
    <button class="${fCls}" onclick="handleTF(false)" ${dis}>✗</button>`;

  const actions = document.getElementById('tf-actions');
  if (state.showResult) {
    const label = state.currentQ < state.questions.length - 1 ? '次の問題 →' : '結果を見る →';
    actions.innerHTML = `<button class="btn-next" onclick="nextTF()">${label}</button>`;
  } else { actions.innerHTML = ''; }
}

function handleTF(val) {
  if (state.showResult) return;
  state.selected = val; state.showResult = true;
  if (val === state.questions[state.currentQ].correct) state.score++;
  renderTF();
}
function nextTF() {
  if (state.currentQ < state.questions.length - 1) {
    state.currentQ++; state.showResult = false; state.selected = null; renderTF();
  } else { showResults(state.score, state.questions.length); }
}

// ════════════════════════════════
// MODE 05: 時代順並べ替え（↑↓ボタン）
// ════════════════════════════════
function genTimeline() {
  // 王朝ごとに代表者1人を選出
  const repMap = new Map();
  dynasties.forEach(d => {
    const cands = quizData.filter(p => p.dynasty === d);
    if (cands.length) repMap.set(d, cands[Math.floor(Math.random() * cands.length)]);
  });
  const picked = shuffle([...repMap.values()]).slice(0, 6);
  state.tlCorrect = [...picked].sort((a, b) => a.era - b.era).map(p => p.name);
  state.tlItems   = shuffle(picked.map(p => ({ name: p.name, era: p.era })));
}

function renderTimeline() {
  const items = state.tlItems;
  document.getElementById('tl-list').innerHTML = items.map((item, idx) => `
    <div class="sort-item">
      <span class="sort-item__rank">${idx + 1}</span>
      <span class="sort-item__name">${escHtml(item.name)}</span>
      <div class="sort-item__btns">
        <button class="sort-btn" onclick="moveItem(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} title="上へ">▲</button>
        <button class="sort-btn" onclick="moveItem(${idx},  1)" ${idx === items.length - 1 ? 'disabled' : ''} title="下へ">▼</button>
      </div>
    </div>`).join('');
}

function moveItem(idx, dir) {
  const items = state.tlItems;
  const target = idx + dir;
  if (target < 0 || target >= items.length) return;
  [items[idx], items[target]] = [items[target], items[idx]];
  renderTimeline();
}

function submitTimeline() {
  const userOrder    = state.tlItems.map(i => i.name);
  const correctOrder = state.tlCorrect;

  // 部分点：位置が合っているもの
  let correct = 0;
  userOrder.forEach((name, idx) => { if (name === correctOrder[idx]) correct++; });
  state.score = correct;

  // 結果を視覚化してからResultsへ
  const list = document.getElementById('tl-list');
  list.innerHTML = state.tlItems.map((item, idx) => {
    const isCorrect = item.name === correctOrder[idx];
    const cls = 'sort-item ' + (isCorrect ? 'result-correct' : 'result-wrong');
    const correctPos = correctOrder.indexOf(item.name) + 1;
    return `
      <div class="${cls}">
        <span class="sort-item__rank">${idx + 1}</span>
        <span class="sort-item__name">${escHtml(item.name)}</span>
        <span class="sort-item__correct-pos">正: ${correctPos}位</span>
        ${isCorrect ? '<span style="color:#2d6a4f;font-size:0.9rem;">✓</span>' : '<span style="color:#c0392b;font-size:0.9rem;">✗</span>'}
      </div>`;
  }).join('');

  document.getElementById('tl-actions').innerHTML = `
    <button class="btn-next" onclick="showResults(${correct}, ${state.tlItems.length})">結果を見る →</button>
    <button class="btn-ghost" onclick="resetToMenu()">メニューへ</button>`;
}

// ════════════════════════════════
// 結果画面
// ════════════════════════════════
function showResults(score, total) {
  const pct = Math.round(score / total * 100);
  document.getElementById('result-score').textContent = `${score} / ${total}`;
  document.getElementById('result-pct').textContent   = `正答率 ${pct}%`;
  showView('Results');
}