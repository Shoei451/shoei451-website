//クイズのロジック 
        const SUPABASE_URL = 'https://gjuqsyaugrsshmjerhme.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdXFzeWF1Z3Jzc2htamVyaG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NzA3NTYsImV4cCI6MjA4MjA0Njc1Nn0.V8q5ddz5tPy7wBaQ73aGtmCZyqzA6pPciPRwRIZjJcs';

        let questions = [];
        let allQuestions = [];
        let currentQuestionIndex = 0;
        let score = 0;
        let answeredQuestions = 0;
        let selectedQuestionCount = 10;
        let quizMode = 'random';

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
        });

        // Fetch questions from Supabase
        async function fetchQuestions() {
            try {
                document.getElementById('loading').classList.remove('hidden');
                
                const response = await fetch(`${SUPABASE_URL}/rest/v1/english_idioms?select=*`, {
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch questions: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                document.getElementById('loading').classList.add('hidden');

                if (data.length === 0) {
                    throw new Error('No questions found in database');
                }

                return data;
            } catch (error) {
                document.getElementById('loading').classList.add('hidden');
                document.getElementById('error').innerHTML = `
                    <strong>Error:</strong> ${error.message}<br>
                    <small style="margin-top: 10px; display: block;">
                    Please check:<br>
                    1. Your Supabase URL is correct<br>
                    2. Your API key (anon/public key) is correct<br>
                    3. The table "english_idioms" exists<br>
                    4. Row Level Security (RLS) allows public read access
                    </small>
                `;
                document.getElementById('error').classList.remove('hidden');
                return [];
            }
        }

        // Generate multiple choice options from fill-in-the-blank
        function generateChoices(correctAnswer, allIdioms) {
            const choices = [correctAnswer];
            
            // Get other idioms as wrong answers
            const otherIdioms = allIdioms.filter(q => q.idiom_extracted !== correctAnswer);
            
            // Shuffle and pick 3 wrong answers
            const shuffled = otherIdioms.sort(() => 0.5 - Math.random());
            for (let i = 0; i < 3 && i < shuffled.length; i++) {
                choices.push(shuffled[i].idiom_extracted);
            }
            
            // Shuffle all choices
            return choices.sort(() => 0.5 - Math.random());
        }

        // Filter questions based on quiz mode
        function filterQuestionsByMode(questions, mode) {
            const MIN_ATTEMPTS = 5; // Minimum attempts to consider data reliable
            
            switch(mode) {
                case 'difficult':
                    // Questions with low correct rate and enough attempts
                    return questions.filter(q => 
                        q.total_attempts >= MIN_ATTEMPTS && 
                        (q.correct_rate === null || q.correct_rate < 50)
                    );
                
                case 'unattempted':
                    // Questions never attempted or with very few attempts
                    return questions.filter(q => 
                        q.total_attempts === null || q.total_attempts < MIN_ATTEMPTS
                    );
                
                case 'mixed':
                    // Weighted selection: 60% difficult, 30% medium, 10% easy
                    const difficult = questions.filter(q => 
                        q.total_attempts >= MIN_ATTEMPTS && 
                        (q.correct_rate === null || q.correct_rate < 50)
                    );
                    const medium = questions.filter(q => 
                        q.total_attempts >= MIN_ATTEMPTS && 
                        q.correct_rate >= 50 && q.correct_rate < 75
                    );
                    const easy = questions.filter(q => 
                        q.total_attempts >= MIN_ATTEMPTS && 
                        q.correct_rate >= 75
                    );
                    
                    const mixed = [];
                    const targetCount = questions.length;
                    
                    // Add 60% difficult (or as many as available)
                    const difficultCount = Math.min(difficult.length, Math.ceil(targetCount * 0.6));
                    mixed.push(...difficult.slice(0, difficultCount));
                    
                    // Add 30% medium
                    const mediumCount = Math.min(medium.length, Math.ceil(targetCount * 0.3));
                    mixed.push(...medium.slice(0, mediumCount));
                    
                    // Add 10% easy
                    const easyCount = Math.min(easy.length, Math.ceil(targetCount * 0.1));
                    mixed.push(...easy.slice(0, easyCount));
                    
                    // If not enough, fill with unattempted
                    if (mixed.length < targetCount) {
                        const unattempted = questions.filter(q => 
                            q.total_attempts === null || q.total_attempts < MIN_ATTEMPTS
                        );
                        mixed.push(...unattempted.slice(0, targetCount - mixed.length));
                    }
                    
                    return mixed;
                
                case 'random':
                default:
                    return questions;
            }
        }

        // Update question statistics in Supabase
        async function updateQuestionStats(questionId, isCorrect) {
            try {
                // First, get current stats
                const getResponse = await fetch(`${SUPABASE_URL}/rest/v1/english_idioms?id=eq.${questionId}&select=total_attempts,correct_attempts`, {
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`
                    }
                });
                
                if (!getResponse.ok) return;
                
                const data = await getResponse.json();
                if (data.length === 0) return;
                
                const current = data[0];
                const newTotalAttempts = (current.total_attempts || 0) + 1;
                const newCorrectAttempts = (current.correct_attempts || 0) + (isCorrect ? 1 : 0);
                const newCorrectRate = (newCorrectAttempts / newTotalAttempts) * 100;
                
                // Update the record
                await fetch(`${SUPABASE_URL}/rest/v1/english_idioms?id=eq.${questionId}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        total_attempts: newTotalAttempts,
                        correct_attempts: newCorrectAttempts,
                        correct_rate: newCorrectRate
                    })
                });
            } catch (error) {
                console.error('Failed to update stats:', error);
                // Don't block the quiz if stats update fails
            }
        }

        // Report data corruption
        async function reportCorruption(questionId, reason) {
            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/english_idioms?id=eq.${questionId}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        corruption_istrue: true,
                        corruption_reason: reason
                    })
                });
                
                return response.ok;
            } catch (error) {
                console.error('Failed to report corruption:', error);
                return false;
            }
        }

        // Display question
        function displayQuestion() {
            const question = questions[currentQuestionIndex];
            const questionEl = document.getElementById('question');
            const questionJpEl = document.getElementById('questionJp');
            const choicesEl = document.getElementById('choices');
            const feedbackEl = document.getElementById('feedback');
            
            feedbackEl.classList.add('hidden');
            document.getElementById('nextBtn').classList.add('hidden');

            // Display the fill-in-the-blank question (example sentence)
            questionEl.textContent = question.fill_in_the_blanks;
            
            // Display Japanese translation of example sentence
            if (question.example_jp) {
                questionJpEl.textContent = ` ${question.example_jp}`;
                questionJpEl.style.display = 'block';
            } else {
                questionJpEl.style.display = 'none';
            }

            // Generate and display choices
            const choices = generateChoices(question.idiom_extracted, questions);
            choicesEl.innerHTML = '';
            
            choices.forEach(choice => {
                const btn = document.createElement('button');
                btn.textContent = choice;
                btn.addEventListener('click', () => selectAnswer(choice, question));
                choicesEl.appendChild(btn);
            });

            // Update progress
            updateProgress();
        }

        // Handle answer selection
        function selectAnswer(selectedAnswer, question) {
            const choicesEl = document.getElementById('choices');
            const buttons = choicesEl.querySelectorAll('button');
            const feedbackEl = document.getElementById('feedback');
            
            // Disable all buttons
            buttons.forEach(btn => btn.disabled = true);

            // Check if correct
            const isCorrect = selectedAnswer === question.idiom_extracted;
            
            if (isCorrect) {
                score++;
            }
            answeredQuestions++;

            // Update statistics in database
            updateQuestionStats(question.id, isCorrect);

            // Highlight correct and incorrect answers
            buttons.forEach(btn => {
                if (btn.textContent === question.idiom_extracted) {
                    btn.classList.add('correct');
                } else if (btn.textContent === selectedAnswer && !isCorrect) {
                    btn.classList.add('incorrect');
                }
            });

            // Show feedback
            const bannerClass = isCorrect ? 'correct-banner' : 'incorrect-banner';
            feedbackEl.innerHTML = `
                <h3 class="${bannerClass}">${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</h3>
                <div class="feedback-content">
                    <div class="feedback-item">
                        <span class="feedback-label">ID</span>
                        <div class="feedback-value">#${question.id}</div>
                    </div>
                    <div class="feedback-item">
                        <span class="feedback-label">Idiom</span>
                        <div class="feedback-value feedback-idiom">${question.idiom}</div>
                    </div>
                    <div class="feedback-item">
                        <span class="feedback-label">意味 (Meaning)</span>
                        <div class="feedback-value">${question.definition_jp}</div>
                    </div>
                    <div class="feedback-item">
                        <span class="feedback-label">Example Sentence</span>
                        <div class="feedback-value feedback-example">${question.example}</div>
                    </div>
                    ${question.tips ? `
                    <div class="feedback-item">
                        <span class="feedback-label">💡 Tips</span>
                        <div class="feedback-value">${question.tips}</div>
                    </div>
                    ` : ''}
                </div>
                <div class="report-section">
                    <h4>⚠️ データに誤りがありますか？</h4>
                    <button class="report-btn" onclick="toggleReportForm(${question.id})">データの誤りを報告</button>
                    <div id="reportForm${question.id}" class="report-form hidden">
                        <select id="reportReason${question.id}">
                            <option value="">-- 理由を選択してください --</option>
                            <option value="空欄とイディオムが合っていない">空欄とイディオムが合っていない</option>
                            <option value="誤った例文">誤った例文</option>
                            <option value="誤った日本語訳">誤った日本語訳</option>
                            <option value="誤ったイディオム">誤ったイディオム</option>
                            <option value="誤った意味">誤った意味</option>
                            <option value="スペルミス">スペルミス</option>
                            <option value="その他">その他</option>
                        </select>
                        <button onclick="submitReport(${question.id})">送信</button>
                        <button onclick="toggleReportForm(${question.id})" style="background: var(--secondary);color: white;">キャンセル</button>
                        <div id="reportMessage${question.id}"></div>
                    </div>
                </div>
            `;
            feedbackEl.classList.remove('hidden');

            // Update score display
            document.getElementById('score').textContent = `Score: ${score}/${answeredQuestions}`;

            // Show next button
            document.getElementById('nextBtn').classList.remove('hidden');
        }

        // Update progress bar
        function updateProgress() {
            const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
            document.getElementById('progressBar').style.width = `${progress}%`;
        }

        // Next question
        document.getElementById('nextBtn').addEventListener('click', () => {
            currentQuestionIndex++;
            
            if (currentQuestionIndex < questions.length) {
                displayQuestion();
            } else {
                showResults();
            }
        });

        // Show results
        function showResults() {
            document.getElementById('quizScreen').classList.add('hidden');
            document.getElementById('resultsScreen').classList.remove('hidden');
            
            const percentage = Math.round((score / questions.length) * 100);
            document.getElementById('finalScore').innerHTML = `
                <p style="font-size: 2em; margin: 20px 0;">Your Score: ${score}/${questions.length}</p>
                <p style="font-size: 1.5em; margin: 20px 0;">${percentage}%</p>
                <p class="note">${percentage >= 80 ? 'Excellent work! 🎉' : percentage >= 60 ? 'Good job! Keep practicing! 👍' : 'Keep studying! You\'ll improve! 💪'}</p>
            `;
        }

        // Start quiz
        document.getElementById('startBtn').addEventListener('click', async () => {
            const countSelect = document.getElementById('questionCount');
            const modeSelect = document.getElementById('quizMode');
            const countValue = countSelect.value;
            quizMode = modeSelect.value;
            
            document.getElementById('startScreen').classList.add('hidden');
            
            allQuestions = await fetchQuestions();
            
            if (allQuestions.length > 0) {
                // Filter based on mode
                let filteredQuestions = filterQuestionsByMode(allQuestions, quizMode);
                
                // If filtered results are too few, fall back to random
                if (filteredQuestions.length === 0) {
                    alert('Not enough questions match this mode yet. Switching to random practice.');
                    filteredQuestions = allQuestions;
                }
                
                // Shuffle filtered questions
                filteredQuestions = filteredQuestions.sort(() => 0.5 - Math.random());
                
                // Select number of questions
                if (countValue === 'all') {
                    selectedQuestionCount = filteredQuestions.length;
                    questions = filteredQuestions;
                } else {
                    selectedQuestionCount = parseInt(countValue);
                    questions = filteredQuestions.slice(0, selectedQuestionCount);
                }
                
                document.getElementById('quizScreen').classList.remove('hidden');
                displayQuestion();
            }
        });

        // Home button
        document.getElementById('homeBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
                resetQuiz();
                document.getElementById('quizScreen').classList.add('hidden');
                document.getElementById('resultsScreen').classList.add('hidden');
                document.getElementById('startScreen').classList.remove('hidden');
            }
        });

        // Restart quiz
        document.getElementById('restartBtn').addEventListener('click', () => {
            resetQuiz();
            
            // Reshuffle and select questions again
            allQuestions = allQuestions.sort(() => 0.5 - Math.random());
            if (selectedQuestionCount === allQuestions.length) {
                questions = allQuestions;
            } else {
                questions = allQuestions.slice(0, selectedQuestionCount);
            }
            
            document.getElementById('resultsScreen').classList.add('hidden');
            document.getElementById('quizScreen').classList.remove('hidden');
            
            displayQuestion();
        });

        // Reset quiz state
        function resetQuiz() {
            currentQuestionIndex = 0;
            score = 0;
            answeredQuestions = 0;
            document.getElementById('score').textContent = 'Score: 0/0';
            document.getElementById('progressBar').style.width = '0%';
        }
