// wh-era-quiz_logic.js
  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') {
    document.body.classList.add('dark');
  }

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
  });

  // Supabase client/table constants are provided by js/supabase_config.js

  let allData = [];
  let currentSet = [];
  let currentIndex = 0;
  let correctAnswer = '';
  let score = 0;
  let total = 0;
  let questionCount = 0;
  let selectedSection = '';
  let currentMode = '';

  const periods = [
    { value: "~0", label: "紀元前" },
    { value: "1~1000", label: "1年~1000年" },
    { value: "1001~1500", label: "1001年~1500年" },
    { value: "1501~1700", label: "1501年~1700年" },
    { value: "1701~1800", label: "1701年~1800年" },
    { value: "1801~1900", label: "1801年~1900年" },
    { value: "1901~1945", label: "1901年~1945年" },
    { value: "1946~1989", label: "1946年~1989年" },
    { value: "1990~", label: "1990年~" },
  ];

  const chapters = [
    { value: "第1章", label: "古代文明圏【オリエント・ギリシア・ローマ・中国古代】" },
    { value: "第2章", label: "中世ヨーロッパ" },
    { value: "第3章", label: "近現代ヨーロッパ" },
    { value: "第4章", label: "東アジア（中国・モンゴル）" },
    { value: "第5章", label: "東アジア（日本・朝鮮）" },
    { value: "第6章", label: "イスラーム世界" },
    { value: "第7章", label: "南アジア・東南アジア" },
    { value: "第8章", label: "アメリカ大陸" },
    { value: "第9章", label: "第一次世界大戦" },
    { value: "第10章", label: "第二次世界大戦" },
    { value: "第11章", label: "戦後国際史" },
  ];

  function parseYearInput(yearStr) {
    const is_bc = yearStr.startsWith('前');
    const numericYear = parseInt(yearStr.replace(/[^\d]/g, ''));
    return { numericYear, is_bc };
  }

  function determinePeriod(year, is_bc) {
    if (is_bc) return "~0";
    if (year <= 1000) return "1~1000";
    if (year <= 1500) return "1001~1500";
    if (year <= 1700) return "1501~1700";
    if (year <= 1800) return "1701~1800";
    if (year <= 1900) return "1801~1900";
    if (year <= 1945) return "1901~1945";
    if (year <= 1989) return "1946~1989";
    return "1990~";
  }

  function toDisplayYearValue(q) {
    return q.is_bc ? -Math.abs(q.year) : q.year;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const newYearInput = document.getElementById('newYear');
    if (newYearInput) {
      newYearInput.addEventListener('input', function () {
        const yearStr = this.value.trim();
        if (!yearStr) {
          document.getElementById('newPeriod').value = '';
          return;
        }
        const { numericYear, is_bc } = parseYearInput(yearStr);
        if (!numericYear || isNaN(numericYear)) {
          document.getElementById('newPeriod').value = '';
          return;
        }
        const period = determinePeriod(numericYear, is_bc);
        const periodLabels = {
          "~0": "紀元前",
          "1~1000": "1年~1000年",
          "1001~1500": "1001年~1500年",
          "1501~1700": "1501年~1700年",
          "1701~1800": "1701年~1800年",
          "1801~1900": "1801年~1900年",
          "1901~1945": "1901年~1945年",
          "1946~1989": "1946年~1989年",
          "1990~": "1990年~",
        };
        document.getElementById('newPeriod').value = periodLabels[period] || '';
      });
    }
  });

  async function loadQuestions() {
  let allQuestions = [];
  let start = 0;
  const batchSize = 1000;
  
  while (true) {
    const { data, error } = await db
      .from(TABLES.WH_QUIZ)
      .select('*')
      .order('is_bc', { ascending: false })
      .order('year', { ascending: true })
      .range(start, start + batchSize - 1); // 1000件ずつ取得
    
    if (error) {
      console.error('読み込みエラー:', error);
      return;
    }
    
    if (!data || data.length === 0) break; // データがなくなったら終了
    
    allQuestions.push(...data);
    
    if (data.length < batchSize) break; // 最後のバッチなら終了
    
    start += batchSize;
  }
  
  allData = allQuestions;
  console.log(`Supabaseから ${allData.length} 件の問題を読み込みました`);
}

  async function addQuestion() {
    const yearStr = document.getElementById('newYear').value.trim();
    const event = document.getElementById('newEvent').value.trim();
    const chapter = document.getElementById('newChapter').value;
    const link = document.getElementById('newLink').value.trim();

    if (!yearStr || !event) {
      alert('年号と出来事を入力してください。');
      return;
    }

    const { numericYear, is_bc } = parseYearInput(yearStr);
    if (!numericYear || isNaN(numericYear)) {
      alert('年号が解釈できません。');
      return;
    }

    const sameYearQuestions = allData.filter(q => q.year === numericYear && q.is_bc === is_bc);
    if (sameYearQuestions.length > 0) {
      let message = `同じ年号「${yearStr}」の問題が既に${sameYearQuestions.length}件存在します:\n\n`;
      sameYearQuestions.forEach((q, index) => {
        message += `${index + 1}. ${q.event} (${q.chapter})\n`;
      });
      message += `\nこのまま追加してもよろしいですか？`;
      if (!confirm(message)) {
        return;
      }
    }

    const period = determinePeriod(numericYear, is_bc);

    const newQuestion = {
      year: numericYear,
      is_bc,
      event,
      chapter,
      period,
      link: link || null
    };

    const { error } = await db
      .from(TABLES.WH_QUIZ)
      .insert(newQuestion);

    if (error) {
      alert('保存エラー: ' + error.message);
      return;
    }

    allData.push(newQuestion);

    document.getElementById('newYear').value = '';
    document.getElementById('newEvent').value = '';
    document.getElementById('newLink').value = '';
    document.getElementById('newPeriod').value = '';
    document.getElementById('addMessage').textContent = '問題を追加しました！';
    setTimeout(() => {
      document.getElementById('addMessage').textContent = '';
    }, 3000);
  }

  function showSectionScreen() {
    currentMode = document.getElementById('modeSelect').value;
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('sectionScreen').classList.remove('hidden');

    const sectionButtons = document.getElementById('sectionButtons');
    sectionButtons.innerHTML = '';

    const sections = currentMode === 'yearToEvent' ? periods : chapters;

    sections.forEach(section => {
      const btn = document.createElement('button');
      btn.className = 'section-btn';
      btn.textContent = section.label;
      btn.onclick = () => selectSection(section.value, section.label);
      sectionButtons.appendChild(btn);
    });
  }

  function selectSection(value, label) {
    selectedSection = value;
    document.getElementById('sectionScreen').classList.add('hidden');
    document.getElementById('settingsScreen').classList.remove('hidden');
    document.getElementById('selectedSectionDisplay').textContent = `選択: ${label}`;
  }

  function backToStart() {
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('sectionScreen').classList.add('hidden');
    document.getElementById('settingsScreen').classList.add('hidden');
    document.getElementById('addQuestionScreen').classList.add('hidden');
  }

  function backToSectionScreen() {
    document.getElementById('settingsScreen').classList.add('hidden');
    document.getElementById('sectionScreen').classList.remove('hidden');
  }

  function showAddQuestionScreen() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('addQuestionScreen').classList.remove('hidden');
  }

  function startQuiz() {
    const countValue = document.getElementById('countSelect').value;

    let filtered = allData.filter(q => {
      if (currentMode === 'yearToEvent') {
        return q.period === selectedSection;
      } else {
        return q.chapter === selectedSection;
      }
    });

    if (filtered.length === 0) {
      alert('該当する問題がありません。');
      return;
    }

    questionCount = countValue === 'all' ? filtered.length : parseInt(countValue);
    questionCount = Math.min(questionCount, filtered.length);

    currentSet = shuffleArray(filtered).slice(0, questionCount);
    currentIndex = 0;
    score = 0;
    total = questionCount;

    document.getElementById('settingsScreen').classList.add('hidden');
    document.getElementById('quizScreen').classList.remove('hidden');

    showQuestion();
  }

  function showQuestion() {
  if (currentIndex >= currentSet.length) {
    showResult();
    return;
  }

  const current = currentSet[currentIndex];
  const questionDiv = document.getElementById('question');
  const choicesDiv = document.getElementById('choices');
  const nextBtn = document.getElementById('nextBtn');

  nextBtn.style.display = 'none';
  choicesDiv.innerHTML = '';

  if (currentMode === 'yearToEvent') {
    questionDiv.textContent = formatYear(toDisplayYearValue(current));
    correctAnswer = current.event;

    const othersInSameSection = allData.filter(q => 
      q.period === current.period &&
      (q.event !== current.event || q.year !== current.year || q.is_bc !== current.is_bc)
    );
    const shuffledOthers = shuffleArray(othersInSameSection).slice(0, 3);
    const choices = shuffleArray([current, ...shuffledOthers]);

    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.textContent = choice.event;
      btn.onclick = () => checkAnswer(choice.event, btn);
      choicesDiv.appendChild(btn);
    });

  } else {
    // 🔴 出来事→年号モード
    questionDiv.textContent = current.event;
    correctAnswer = formatYear(toDisplayYearValue(current));

    const othersInSameChapter = allData.filter(q => 
      q.chapter === current.chapter &&
      (q.year !== current.year || q.is_bc !== current.is_bc || q.event !== current.event)
    );
    
    // 🔴 年号の重複を除外
    const uniqueYears = new Set();
    uniqueYears.add(`${current.is_bc}-${current.year}`); // 正解を先に追加
    
    const uniqueOthers = [];
    for (const q of shuffleArray(othersInSameChapter)) {
      const yearKey = `${q.is_bc}-${q.year}`;
      if (!uniqueYears.has(yearKey)) {
        uniqueYears.add(yearKey);
        uniqueOthers.push(q);
      }
      if (uniqueOthers.length >= 3) break;
    }
    
    // 🔴 不足する場合は全データから補充（年号重複を避ける）
    if (uniqueOthers.length < 3) {
      const allOthers = allData.filter(q => 
        q.year !== current.year || q.is_bc !== current.is_bc
      );
      for (const q of shuffleArray(allOthers)) {
        const yearKey = `${q.is_bc}-${q.year}`;
        if (!uniqueYears.has(yearKey)) {
          uniqueYears.add(yearKey);
          uniqueOthers.push(q);
        }
        if (uniqueOthers.length >= 3) break;
      }
    }

    const choices = shuffleArray([current, ...uniqueOthers]);

    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.textContent = formatYear(toDisplayYearValue(choice));
      btn.onclick = () => checkAnswer(formatYear(toDisplayYearValue(choice)), btn);
      choicesDiv.appendChild(btn);
    });
  }

  updateProgress();
}

  function checkAnswer(selected, btn) {
  const buttons = document.getElementById('choices').getElementsByTagName('button');
  const current = currentSet[currentIndex];

  for (let b of buttons) {
    b.disabled = true;
    if (b.textContent === correctAnswer) {
      b.classList.add('correct');
    }
  }

  const isCorrect = selected === correctAnswer;
  
  if (isCorrect) {
    btn.classList.add('correct');
    score++;
  } else {
    btn.classList.add('incorrect');
    
    // 🔴 年代→出来事モードで間違えた場合、各選択肢に年号を追加表示
    if (currentMode === 'yearToEvent') {
      showYearsForAllChoices();
    }
  }

  if (current.link) {
    const linkDiv = document.createElement('div');
    linkDiv.style.marginTop = '16px';
    linkDiv.style.textAlign = 'center';
    linkDiv.innerHTML = `<a href="${current.link}" target="_blank" style="color: var(--accent); font-weight: 600; text-decoration: underline;">参考リンクはこちら</a>`;
    document.getElementById('choices').appendChild(linkDiv);
  }

  document.getElementById('nextBtn').style.display = 'block';
  updateScore();
}

// 🔴 各選択肢に年号を追加表示する関数
function showYearsForAllChoices() {
  const buttons = document.getElementById('choices').querySelectorAll('button');
  
  buttons.forEach(btn => {
    const eventText = btn.textContent;
    
    // この出来事に対応する年号を検索
    const question = allData.find(q => q.event === eventText);
    
    if (question) {
      const yearText = formatYear(toDisplayYearValue(question));
      
      // 既存のテキストの下に年号を追加
      btn.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 6px;">${eventText}</div>
        <div style="font-size: 0.85em; opacity: 0.9; font-weight: 500;">
           ${yearText}
        </div>
      `;
    }
  });
}


  function updateProgress() {
    const progress = ((currentIndex + 1) / total) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
  }

  function updateScore() {
    document.getElementById('score').textContent = `正解数: ${score} / ${currentIndex + 1}`;
  }

  function showResult() {
    const percentage = Math.round((score / total) * 100);
    document.getElementById('question').textContent = 'クイズ終了！';
    document.getElementById('choices').innerHTML = `
      <p style="font-size: 1.5em; margin: 20px 0; text-align: center; color: var(--primary); font-weight: 700;">
        ${score} / ${total} 問正解<br>
        正答率: ${percentage}%
      </p>
    `;
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.textContent = '最初に戻る';
    nextBtn.style.display = 'block';
    nextBtn.onclick = () => {
      location.reload();
    };
  }

  document.getElementById('nextBtn').addEventListener('click', function () {
    if (currentIndex < currentSet.length) {
      currentIndex++;
      showQuestion();
    }
  });

  window.addEventListener('DOMContentLoaded', async () => {
    await loadQuestions();
  });
