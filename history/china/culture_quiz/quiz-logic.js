// 中国王朝文化史クイズ - ロジック

// SVGアイコン
const icons = {
  home: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>`,
  
  reset: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="23 4 23 10 17 10"></polyline>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>`
};

// アプリの状態
let state = {
  mode: 'menu',
  previousMode: null,
  currentQuestion: 0,
  score: 0,
  quizQuestions: [],
  selectedAnswer: null,
  showResult: false,
  multiSelectAnswers: new Set(),
  matchingData: null,
  selectedMatch: null,
  groupingData: null,
  draggedItem: null,
  timelineData: null
};

// ユーティリティ関数
function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function resetState() {
  state.currentQuestion = 0;
  state.score = 0;
  state.quizQuestions = [];
  state.selectedAnswer = null;
  state.showResult = false;
  state.multiSelectAnswers = new Set();
  state.matchingData = null;
  state.selectedMatch = null;
  state.groupingData = null;
  state.timelineData = null;
}

// クイズ生成関数
function generatePersonToDynastyQuiz() {
  const shuffled = shuffle(quizData);
  state.quizQuestions = shuffled.slice(0, 10).map(person => {
    const wrongDynasties = dynasties
      .filter(d => d !== person.dynasty)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = shuffle([...wrongDynasties, person.dynasty]);
    
    return {
      question: person.name,
      options,
      correct: person.dynasty,
      type: 'single'
    };
  });
}

function generateDynastyToPeopleQuiz() {
  const availableDynasties = dynasties.filter(
    dynasty => quizData.some(person => person.dynasty === dynasty)
  );

  const questions = availableDynasties.map(dynasty => {
    const correctPeople = quizData.filter(p => p.dynasty === dynasty);
    const wrongPeople = quizData
      .filter(p => p.dynasty !== dynasty)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    const options = shuffle([...correctPeople, ...wrongPeople]).map(p => p.name);
    
    return {
      question: dynasty,
      options,
      correct: correctPeople.map(p => p.name),
      type: 'multiple'
    };
  });
  
  state.quizQuestions = shuffle(questions).slice(0, 5);
}

function generateMatchingQuiz() {
  const shuffled = shuffle(quizData.filter(p => p.works.length > 0)).slice(0, 6);
  
  // IDを完全に分離してバグを修正
  const people = shuffled.map((p, idx) => ({
    id: `person-${idx}`,
    text: p.name,
    type: 'person'
  }));
  
  const works = shuffle(shuffled.map((p, idx) => ({
    id: `work-${idx}`,
    text: p.works[0],
    type: 'work'
  })));
  
  state.matchingData = {
    people,
    works,
    matched: [],
    correctMatches: shuffled.map(p => ({ person: p.name, work: p.works[0] }))
  };
}

function generateGroupingQuiz() {
  const items = shuffle(quizData).slice(0, 12);
  const groups = {};
  categories.forEach(cat => groups[cat] = []);
  
  state.groupingData = {
    ungrouped: items.map(p => ({ name: p.name, category: p.category })),
    groups,
    categories
  };
}

function generateTimelineQuiz() {
  const dynastyRepresentativeMap = new Map();

  dynasties.forEach(dynasty => {
    const candidates = quizData.filter(person => person.dynasty === dynasty);
    if (candidates.length === 0) return;
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    dynastyRepresentativeMap.set(dynasty, selected);
  });

  const items = shuffle([...dynastyRepresentativeMap.values()]).slice(0, 6);
  state.timelineData = {
    items: shuffle(items.map(p => ({ name: p.name, era: p.era }))),
    correctOrder: items.sort((a, b) => a.era - b.era).map(p => p.name)
  };
}

function generateTrueFalseQuiz() {
  const dynastyStatements = [];
  const workStatements = [];

  quizData.forEach(person => {
    dynastyStatements.push({
      statement: `${person.name}は${person.dynasty}の人物である`,
      correct: true
    });

    const wrongDynasties = dynasties.filter(d => d !== person.dynasty);
    const wrongDynasty = wrongDynasties[Math.floor(Math.random() * wrongDynasties.length)];
    dynastyStatements.push({
      statement: `${person.name}は${wrongDynasty}の人物である`,
      correct: false
    });
  });

  const peopleWithWorks = quizData.filter(p => p.works.length > 0);
  peopleWithWorks.forEach(person => {
    workStatements.push({
      statement: `${person.name}の主な功績に『${person.works[0]}』がある`,
      correct: true
    });

    const otherPeople = peopleWithWorks.filter(p => p.name !== person.name);
    if (otherPeople.length > 0) {
      const randomOther = otherPeople[Math.floor(Math.random() * otherPeople.length)];
      workStatements.push({
        statement: `${person.name}の主な功績に『${randomOther.works[0]}』がある`,
        correct: false
      });
    }
  });

  const mixedStatements = shuffle([
    ...shuffle(dynastyStatements).slice(0, 5),
    ...shuffle(workStatements).slice(0, 5)
  ]);

  state.quizQuestions = mixedStatements.map(s => ({
    question: s.statement,
    correct: s.correct,
    type: 'truefalse'
  }));
}
// イベントハンドラ
function startQuiz(quizMode) {
  resetState();
  state.mode = quizMode;
  state.previousMode = quizMode;
  
  if (quizMode === 'person-to-dynasty') {
    generatePersonToDynastyQuiz();
  } else if (quizMode === 'dynasty-to-people') {
    generateDynastyToPeopleQuiz();
  } else if (quizMode === 'matching') {
    generateMatchingQuiz();
  } else if (quizMode === 'grouping') {
    generateGroupingQuiz();
  } else if (quizMode === 'timeline') {
    generateTimelineQuiz();
  } else if (quizMode === 'truefalse') {
    generateTrueFalseQuiz();
  }
  
  render();
}

function handleAnswer(answer) {
  if (state.showResult) return;
  
  state.selectedAnswer = answer;
  state.showResult = true;
  
  const current = state.quizQuestions[state.currentQuestion];
  if (current.type === 'single' && answer === current.correct) {
    state.score++;
  } else if (current.type === 'truefalse' && answer === current.correct) {
    state.score++;
  }
  
  render();
}

function handleMultiSelect(answer) {
  if (state.multiSelectAnswers.has(answer)) {
    state.multiSelectAnswers.delete(answer);
  } else {
    state.multiSelectAnswers.add(answer);
  }
  render();
}

function submitMultiSelect() {
  if (state.showResult) return;
  
  state.showResult = true;
  const current = state.quizQuestions[state.currentQuestion];
  const correctSet = new Set(current.correct);
  
  if (state.multiSelectAnswers.size === correctSet.size &&
      [...state.multiSelectAnswers].every(a => correctSet.has(a))) {
    state.score++;
  }
  
  render();
}

function nextQuestion() {
  if (state.currentQuestion < state.quizQuestions.length - 1) {
    state.currentQuestion++;
    state.selectedAnswer = null;
    state.showResult = false;
    state.multiSelectAnswers = new Set();
  } else {
    state.mode = 'results';
  }
  render();
}

function handleMatching(item) {
  if (!state.selectedMatch) {
    state.selectedMatch = item;
  } else {
    if (state.selectedMatch.type !== item.type) {
      const person = state.selectedMatch.type === 'person' ? state.selectedMatch : item;
      const work = state.selectedMatch.type === 'work' ? state.selectedMatch : item;
      
      const isCorrect = state.matchingData.correctMatches.some(
        m => m.person === person.text && m.work === work.text
      );
      
      if (isCorrect) {
        state.matchingData.matched.push({ person: person.text, work: work.text });
        state.score++;
      }
    }
    state.selectedMatch = null;
  }
  render();
}

// Grouping drag & drop
function handleDragStart(item, event) {
  state.draggedItem = item;
  event.target.classList.add('dragging');
}

function handleDragEnd(event) {
  event.target.classList.remove('dragging');
}

function handleDragOver(event) {
  event.preventDefault();
  if (event.currentTarget.classList.contains('category-box')) {
    event.currentTarget.classList.add('drag-over');
  }
}

function handleDragLeave(event) {
  if (event.currentTarget.classList.contains('category-box')) {
    event.currentTarget.classList.remove('drag-over');
  }
}

function handleDrop(category, event) {
  event.preventDefault();
  if (event.currentTarget.classList.contains('category-box')) {
    event.currentTarget.classList.remove('drag-over');
  }
  
  if (!state.draggedItem) return;
  
  state.groupingData.ungrouped = state.groupingData.ungrouped.filter(
    i => i.name !== state.draggedItem.name
  );
  
  Object.keys(state.groupingData.groups).forEach(cat => {
    state.groupingData.groups[cat] = state.groupingData.groups[cat].filter(
      i => i.name !== state.draggedItem.name
    );
  });
  
  state.groupingData.groups[category].push(state.draggedItem);
  
  if (state.draggedItem.category === category) {
    state.score++;
  }
  
  state.draggedItem = null;
  render();
}

// Timeline sorting
let timelineDraggedIndex = null;

function handleTimelineDragStart(index, event) {
  timelineDraggedIndex = index;
  event.target.classList.add('dragging');
}

function handleTimelineDragEnd(event) {
  event.target.classList.remove('dragging');
  timelineDraggedIndex = null;
}

function handleTimelineDragOver(event) {
  event.preventDefault();
}

function handleTimelineDrop(dropIndex, event) {
  event.preventDefault();
  if (timelineDraggedIndex === null || timelineDraggedIndex === dropIndex) return;
  
  const items = [...state.timelineData.items];
  const [draggedItem] = items.splice(timelineDraggedIndex, 1);
  items.splice(dropIndex, 0, draggedItem);
  
  state.timelineData.items = items;
  render();
}

function submitTimeline() {
  const userOrder = state.timelineData.items.map(i => i.name);
  const correctOrder = state.timelineData.correctOrder;
  
  if (JSON.stringify(userOrder) === JSON.stringify(correctOrder)) {
    state.score = state.timelineData.items.length;
  } else {
    // 部分点を付与
    userOrder.forEach((name, idx) => {
      if (name === correctOrder[idx]) {
        state.score++;
      }
    });
  }
  
  state.mode = 'results';
  render();
}

function resetToMenu() {
  state.mode = 'menu';
  resetState();
  render();
}

// レンダリング関数
function renderControlBar() {
  return `
    <div class="control-bar">
      <button class="control-btn" onclick="resetToMenu()">
        ${icons.home}
        <span>Back to Home</span>
      </button>
      <button class="control-btn" onclick="startQuiz('${state.previousMode}')">
        ${icons.reset}
        <span>Reset</span>
      </button>
    </div>
  `;
}

function renderProgressBar(current, total) {
  const percentage = Math.round((current / total) * 100);
  return `
    <div class="progress-wrap">
      <div class="progress-track">
        <div class="progress-fill" style="width: ${percentage}%;"></div>
      </div>
      <div class="progress-label">進捗 ${current} / ${total}</div>
    </div>
  `;
}

function renderMenu() {
  return `
    <div class="pattern-bg">
      <div class="text-center mb-6 animate-fadeIn">
        <h1 class="title-chinese">中国王朝文化史</h1>
        <div class="seal-stamp">クイズ</div>
        <p style="margin-top: 1.5rem; color: #6b7280; font-size: 1.125rem;">
          学習形式を選択してください
        </p>
      </div>
      
      <div class="grid-3">
        <div class="quiz-card animate-slideUp-1" onclick="startQuiz('person-to-dynasty')">
          <h3>人物→王朝</h3>
          <p>人物名から活躍した王朝を選択</p>
          <div class="meta">4択問題 • 10問</div>
        </div>
        
        <div class="quiz-card animate-slideUp-2" onclick="startQuiz('dynasty-to-people')">
          <h3>王朝→人物</h3>
          <p>王朝に該当する人物を全て選択</p>
          <div class="meta">複数選択 • 5問</div>
        </div>
        
        <div class="quiz-card animate-slideUp-3" onclick="startQuiz('matching')">
          <h3>人物と作品</h3>
          <p>人物名と代表作品をマッチング</p>
          <div class="meta">マッチング • 6組</div>
        </div>
        
        <div class="quiz-card animate-slideUp-4" onclick="startQuiz('grouping')">
          <h3>カテゴリ分類</h3>
          <p>人物をカテゴリ別にグルーピング</p>
          <div class="meta">ドラッグ&ドロップ • 12人</div>
        </div>
        
        <div class="quiz-card animate-slideUp-5" onclick="startQuiz('timeline')">
          <h3>時代順並べ替え</h3>
          <p>人物を古い順に並べ替え</p>
          <div class="meta">並べ替え • 6人</div>
        </div>
        
        <div class="quiz-card animate-slideUp-6" onclick="startQuiz('truefalse')">
          <h3>◯✗問題</h3>
          <p>記述の正誤を判定</p>
          <div class="meta">正誤問題 • 10問</div>
        </div>
      </div>
    </div>
  `;
}

function renderQuiz() {
  const current = state.quizQuestions[state.currentQuestion];
  const isMultiple = current.type === 'multiple';
  
  let optionsHtml = '';
  current.options.forEach((option, idx) => {
    const isSelected = isMultiple
      ? state.multiSelectAnswers.has(option)
      : state.selectedAnswer === option;
    const isCorrect = isMultiple
      ? current.correct.includes(option)
      : option === current.correct;
    
    let className = 'option-btn';
    let iconHtml = '';
    
    if (state.showResult) {
      if (isMultiple) {
        if (isCorrect && state.multiSelectAnswers.has(option)) {
          className += ' correct';
          iconHtml = '<span class="icon check">✓</span>';
        } else if (isCorrect && !state.multiSelectAnswers.has(option)) {
          className += ' missed';
          iconHtml = '<span class="icon info">✓</span>';
        } else if (!isCorrect && state.multiSelectAnswers.has(option)) {
          className += ' incorrect';
          iconHtml = '<span class="icon x">✗</span>';
        }
      } else {
        if (option === current.correct) {
          className += ' correct';
          iconHtml = '<span class="icon check">✓</span>';
        } else if (isSelected) {
          className += ' incorrect';
          iconHtml = '<span class="icon x">✗</span>';
        }
      }
    } else if (isSelected) {
      className += ' selected';
    }
    
    const onClick = isMultiple
      ? `handleMultiSelect('${option.replace(/'/g, "\\'")}')`
      : `handleAnswer('${option.replace(/'/g, "\\'")}')`; 
    const disabled = state.showResult && !isMultiple ? 'disabled' : '';
    
    optionsHtml += `
      <button class="${className}" onclick="${onClick}" ${disabled}>
        ${option}
        ${iconHtml}
      </button>
    `;
  });
  
  let actionButton = '';
  if (isMultiple && !state.showResult) {
    const disabled = state.multiSelectAnswers.size === 0 ? 'disabled' : '';
    actionButton = `<button class="submit-btn" onclick="submitMultiSelect()" ${disabled}>解答を確定</button>`;
  } else if (state.showResult) {
    const text = state.currentQuestion < state.quizQuestions.length - 1 ? '次の問題' : '結果を見る';
    actionButton = `<button class="next-btn" onclick="nextQuestion()">${text} →</button>`;
  }
  
  return `
    ${renderControlBar()}
    <div class="quiz-container">
      <div class="quiz-header">
        <div>問題 ${state.currentQuestion + 1} / ${state.quizQuestions.length}</div>
        <div class="score">正解: ${state.score}</div>
      </div>
      ${renderProgressBar(state.currentQuestion + 1, state.quizQuestions.length)}
      <div class="quiz-box">
        <h2 class="question-title">${current.question}</h2>
        <p class="question-subtitle">
          ${isMultiple ? '該当する人物を全て選択してください' : 'この人物が活躍した王朝は？'}
        </p>
        
        <div class="options-grid">
          ${optionsHtml}
        </div>
        
        ${actionButton}
      </div>
    </div>
  `;
}

function renderTrueFalse() {
  const current = state.quizQuestions[state.currentQuestion];
  const trueSelected = state.selectedAnswer === true;
  const falseSelected = state.selectedAnswer === false;
  
  let trueClass = 'tf-btn';
  let falseClass = 'tf-btn';
  
  if (state.showResult) {
    if (current.correct === true) {
      trueClass += ' correct';
      if (falseSelected) falseClass += ' incorrect';
    } else {
      falseClass += ' correct';
      if (trueSelected) trueClass += ' incorrect';
    }
  } else {
    if (trueSelected) trueClass += ' selected';
    if (falseSelected) falseClass += ' selected';
  }
  
  const disabled = state.showResult ? 'disabled' : '';
  
  return `
    ${renderControlBar()}
    <div class="quiz-container">
      <div class="quiz-header">
        <div>問題 ${state.currentQuestion + 1} / ${state.quizQuestions.length}</div>
        <div class="score">正解: ${state.score}</div>
      </div>
      ${renderProgressBar(state.currentQuestion + 1, state.quizQuestions.length)}
      <div class="quiz-box">
        <h2 class="question-title">${current.question}</h2>
        <p class="question-subtitle">この記述は正しいですか？</p>
        
        <div class="tf-options">
          <button class="${trueClass}" onclick="handleAnswer(true)" ${disabled}>
            ◯ 正しい
          </button>
          <button class="${falseClass}" onclick="handleAnswer(false)" ${disabled}>
            ✗ 間違い
          </button>
        </div>
        
        ${state.showResult ? `
          <button class="next-btn" onclick="nextQuestion()">
            ${state.currentQuestion < state.quizQuestions.length - 1 ? '次の問題' : '結果を見る'} →
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

function renderMatching() {
  const isMatched = (text, type) => {
    return state.matchingData.matched.some(m =>
      type === 'person' ? m.person === text : m.work === text
    );
  };
  
  const isSelected = (id) => state.selectedMatch?.id === id;
  
  let peopleHtml = '';
  state.matchingData.people.forEach(person => {
    const matched = isMatched(person.text, 'person');
    const selected = isSelected(person.id);
    const className = matched ? 'matching-btn' : selected ? 'matching-btn selected' : 'matching-btn';
    const disabled = matched ? 'disabled' : '';
    
    const itemJson = JSON.stringify(person).replace(/"/g, '&quot;');
    
    peopleHtml += `
      <button class="${className}" onclick='handleMatching(${itemJson})' ${disabled}>
        ${person.text}
      </button>
    `;
  });
  
  let worksHtml = '';
  state.matchingData.works.forEach(work => {
    const matched = isMatched(work.text, 'work');
    const selected = isSelected(work.id);
    const className = matched ? 'matching-btn' : selected ? 'matching-btn selected' : 'matching-btn';
    const disabled = matched ? 'disabled' : '';
    
    const itemJson = JSON.stringify(work).replace(/"/g, '&quot;');
    
    worksHtml += `
      <button class="${className}" onclick='handleMatching(${itemJson})' ${disabled}>
        ${work.text}
      </button>
    `;
  });
  
  const allMatched = state.matchingData.matched.length === state.matchingData.people.length;
  
  return `
    ${renderControlBar()}
    <div class="matching-container">
      <div class="text-center mb-6">
        <h2 class="question-title">人物と作品のマッチング</h2>
        <p class="question-subtitle">人物と作品をクリックして組み合わせてください</p>
        <div style="margin-top: 1rem; font-size: 1.25rem; font-weight: bold; color: #b45309;">
          正解: ${state.score} / ${state.matchingData.people.length}
        </div>
      </div>
      
      <div class="matching-grid">
        <div class="matching-column">
          <h3>人物</h3>
          <div class="matching-items">
            ${peopleHtml}
          </div>
        </div>
        
        <div class="matching-column">
          <h3>作品</h3>
          <div class="matching-items">
            ${worksHtml}
          </div>
        </div>
      </div>
      
      ${allMatched ? '<button class="menu-btn" onclick="resetToMenu()" style="margin-top: 2rem;">結果を見る →</button>' : ''}
    </div>
  `;
}

function renderGrouping() {
  let ungroupedHtml = '';
  state.groupingData.ungrouped.forEach(item => {
    const itemJson = JSON.stringify(item).replace(/"/g, '&quot;');
    ungroupedHtml += `
      <div class="draggable-item" draggable="true" 
           ondragstart="handleDragStart(${itemJson}, event)"
           ondragend="handleDragEnd(event)">
        ${item.name}
      </div>
    `;
  });
  
  let categoriesHtml = '';
  state.groupingData.categories.forEach(category => {
    let itemsHtml = '';
    state.groupingData.groups[category].forEach(item => {
      const className = item.category === category ? 'grouped-item correct' : 'grouped-item incorrect';
      itemsHtml += `<div class="${className}">${item.name}</div>`;
    });
    
    categoriesHtml += `
      <div class="category-box" 
           ondragover="handleDragOver(event)"
           ondragleave="handleDragLeave(event)"
           ondrop="handleDrop('${category}', event)">
        <div class="category-title">${category}</div>
        <div class="category-items">
          ${itemsHtml}
        </div>
      </div>
    `;
  });
  
  const allGrouped = state.groupingData.ungrouped.length === 0;
  
  return `
    ${renderControlBar()}
    <div class="grouping-container">
      <div class="text-center mb-6">
        <h2 class="question-title">カテゴリ分類</h2>
        <p class="question-subtitle">人物を適切なカテゴリにドラッグしてください</p>
        <div style="margin-top: 1rem; font-size: 1.25rem; font-weight: bold; color: #b45309;">
          正解: ${state.score}
        </div>
      </div>
      
      <div class="mb-6">
        <div class="ungrouped-title">未分類</div>
        <div class="ungrouped-area">
          ${ungroupedHtml || '<div style="color: #9ca3af;">全ての項目が分類されました</div>'}
        </div>
      </div>
      
      <div class="categories-grid">
        ${categoriesHtml}
      </div>
      
      ${allGrouped ? '<button class="menu-btn" onclick="resetToMenu()" style="margin-top: 2rem;">結果を見る →</button>' : ''}
    </div>
  `;
}

function renderTimeline() {
  let itemsHtml = '';
  state.timelineData.items.forEach((item, idx) => {
    itemsHtml += `
      <div class="sortable-item" draggable="true"
           ondragstart="handleTimelineDragStart(${idx}, event)"
           ondragend="handleTimelineDragEnd(event)"
           ondragover="handleTimelineDragOver(event)"
           ondrop="handleTimelineDrop(${idx}, event)">
        <div class="drag-handle">⋮⋮</div>
        <div class="item-content">${item.name}</div>
      </div>
    `;
  });
  
  return `
    ${renderControlBar()}
    <div class="timeline-container">
      <div class="text-center mb-6">
        <h2 class="question-title">時代順並べ替え</h2>
        <p class="question-subtitle">人物を古い時代から新しい時代の順に並べ替えてください</p>
      </div>
      
      <div class="sortable-list">
        ${itemsHtml}
      </div>
      
      <button class="submit-btn" onclick="submitTimeline()">解答を確定</button>
    </div>
  `;
}

function renderResults() {
  let total, percentage;
  
  if (state.previousMode === 'timeline') {
    total = state.timelineData.items.length;
    percentage = Math.round((state.score / total) * 100);
  } else if (state.previousMode === 'matching') {
    total = 6;
    percentage = Math.round((state.score / total) * 100);
  } else if (state.previousMode === 'grouping') {
    total = 12;
    percentage = Math.round((state.score / total) * 100);
  } else {
    total = state.quizQuestions.length;
    percentage = Math.round((state.score / total) * 100);
  }
  
  return `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div class="results-box">
        <h2 class="results-title">結果</h2>
        
        <div class="results-score">
          ${state.score} / ${total}
        </div>
        <div class="results-percentage">
          正答率: ${percentage}%
        </div>
        
        <div class="results-buttons">
          <button class="menu-btn" onclick="resetToMenu()">
            ${icons.home} メニューに戻る
          </button>
          
          <button class="retry-btn" onclick="startQuiz('${state.previousMode}')">
            ${icons.reset} もう一度挑戦
          </button>
        </div>
      </div>
    </div>
  `;
}

function render() {
  const app = document.getElementById('app');
  
  let content = '';
  if (state.mode === 'menu') {
    content = renderMenu();
  } else if (state.mode === 'person-to-dynasty' || state.mode === 'dynasty-to-people') {
    content = renderQuiz();
  } else if (state.mode === 'truefalse') {
    content = renderTrueFalse();
  } else if (state.mode === 'matching') {
    content = renderMatching();
  } else if (state.mode === 'grouping') {
    content = renderGrouping();
  } else if (state.mode === 'timeline') {
    content = renderTimeline();
  } else if (state.mode === 'results') {
    content = renderResults();
  }
  
  app.innerHTML = content;
}

// 初期レンダリング
render();
