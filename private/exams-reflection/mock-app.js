// ===== Supabase Configuration =====
const SUPABASE_URL = 'https://gjuqsyaugrsshmjerhme.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdXFzeWF1Z3Jzc2htamVyaG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NzA3NTYsImV4cCI6MjA4MjA0Njc1Nn0.V8q5ddz5tPy7wBaQ73aGtmCZyqzA6pPciPRwRIZjJcs';

// Supabase client will be initialized after library loads
let supabaseClient;

// ===== Exam Types Configuration =====
const EXAM_TYPES = {
    kyotsu: {
        name: '共通テスト',
        color: '#018270',
        subjects: ['現代文', '古文', '漢文', '数学1A', '数学2BC', '英語R', '英語L', '世界史', '地理', '理科基礎', '情報1']
    },
    kijutsu: {
        name: '記述模試',
        color: '#114514',
        subjects: ['現代文', '古文', '漢文', '数学1A', '数学2BC', '英語', '世界史', '地理']
    },
    todai: {
        name: '東大模試',
        color: '#00b1cd',
        subjects: ['現代文', '古文', '漢文', '数学', '英語', '世界史', '地理']
    },
    teiki: {
        name: '定期テスト',
        color: '#FABA40',
        subjects: []
    }
};

// ===== State Management =====
let state = {
    currentExamType: 'kyotsu',
    currentView: 'dashboard',
    exams: [],
    goals: {},
    reflections: [],
    reviewTasks: [],
    charts: {
        progress: null,
        subject: null
    }
};

// ===== DOM Elements =====
const elements = {
    sidebar: document.getElementById('sidebar'),
    mainContent: document.getElementById('main-content'),
    menuToggle: document.getElementById('menu-toggle'),
    closeSidebar: document.getElementById('close-sidebar'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    headerSubtitle: document.getElementById('header-subtitle')
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase client after library loads
    if (typeof window.supabase !== 'undefined') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    
    setupEventListeners();
    setupThemeToggle();
    await loadData();
    renderDashboard();
});

// ===== Event Listeners Setup =====
function setupEventListeners() {
    // Exam type buttons
    document.querySelectorAll('.exam-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.exam-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentExamType = btn.dataset.type;
            elements.headerSubtitle.textContent = EXAM_TYPES[state.currentExamType].name;
            if (state.currentView === 'dashboard') renderDashboard();
            else if (state.currentView === 'input') renderInputView();
            else if (state.currentView === 'goals') renderGoalsView();
        });
    });

    // View buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentView = btn.dataset.view;
            switchView(btn.dataset.view);
        });
    });

    // Mobile menu
    elements.menuToggle.addEventListener('click', () => {
        elements.sidebar.classList.add('show');
    });

    elements.closeSidebar.addEventListener('click', () => {
        elements.sidebar.classList.remove('show');
    });

    // Reflection modal
    document.getElementById('add-reflection-btn')?.addEventListener('click', () => {
        openReflectionModal();
    });

    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('reflection-modal').close();
    });

    document.getElementById('reflection-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveReflection();
    });

    document.getElementById('delete-reflection-btn').addEventListener('click', async () => {
        if (confirm('この振り返りを削除しますか？')) {
            await deleteReflection();
        }
    });

    // Forms
    document.getElementById('score-input-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveExam();
    });

    document.getElementById('goals-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveGoals();
    });
}

// ===== Theme Toggle =====
function setupThemeToggle() {
    if (localStorage.getItem('pref-theme') === 'dark') {
        document.body.classList.add('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark');
    }

    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('pref-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        
        // Update charts
        if (state.charts.progress) state.charts.progress.update();
        if (state.charts.subject) state.charts.subject.update();
    });
}

// ===== Data Loading =====
async function loadData() {
    try {
        showLoading(true);

        // Check if Supabase is initialized
        if (!supabaseClient) {
            console.warn('Supabase not initialized - using empty data');
            state.exams = [];
            state.goals = {};
            state.reflections = [];
            state.reviewTasks = [];
            showLoading(false);
            return;
        }

        // Load exams
        const { data: examsData, error: examsError } = await supabaseClient
            .from('mock_exams')
            .select('*')
            .order('date', { ascending: true });

        if (examsError) throw examsError;
        state.exams = examsData || [];

        // Load goals
        const { data: goalsData, error: goalsError } = await supabaseClient
            .from('mock_goals')
            .select('*');

        if (goalsError) throw goalsError;
        state.goals = {};
        (goalsData || []).forEach(goal => {
            if (!state.goals[goal.exam_type]) {
                state.goals[goal.exam_type] = {};
            }
            state.goals[goal.exam_type][goal.subject] = goal.target_score;
        });

        // Load reflections
        const { data: reflectionsData, error: reflectionsError } = await supabaseClient
            .from('mock_reflections')
            .select('*')
            .order('timestamp', { ascending: false });

        if (reflectionsError) throw reflectionsError;
        state.reflections = reflectionsData || [];

        // Load review tasks
        const { data: tasksData, error: tasksError } = await supabaseClient
            .from('mock_review_tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (tasksError) throw tasksError;
        state.reviewTasks = tasksData || [];

        showLoading(false);
    } catch (error) {
        console.error('Data loading error:', error);
        showError('データの読み込みに失敗しました: ' + error.message);
        showLoading(false);
    }
}

// ===== View Switching =====
function switchView(view) {
    document.querySelectorAll('.view-container').forEach(v => v.classList.add('hidden'));

    switch(view) {
        case 'dashboard':
            document.getElementById('dashboard-view').classList.remove('hidden');
            renderDashboard();
            break;
        case 'input':
            document.getElementById('input-view').classList.remove('hidden');
            renderInputView();
            break;
        case 'reflections':
            document.getElementById('reflections-view').classList.remove('hidden');
            renderReflectionsManager();
            break;
        case 'goals':
            document.getElementById('goals-view').classList.remove('hidden');
            renderGoalsView();
            break;
    }

    // Close mobile sidebar
    elements.sidebar.classList.remove('show');
}

// ===== Dashboard Rendering =====
function renderDashboard() {
    const filteredExams = state.exams.filter(e => e.exam_type === state.currentExamType);
    const latestExam = filteredExams[filteredExams.length - 1];
    const currentGoals = state.goals[state.currentExamType] || {};

    // Update stats
    if (latestExam) {
        document.getElementById('latest-score').textContent = latestExam.total_score || '--';
        const goalTotal = Object.values(currentGoals).reduce((sum, val) => sum + (val || 0), 0);
        document.getElementById('goal-score').textContent = goalTotal || '--';
        
        const achievementRate = goalTotal ? Math.round((latestExam.total_score / goalTotal) * 100) : 0;
        document.getElementById('achievement-rate').textContent = achievementRate + '%';
    } else {
        document.getElementById('latest-score').textContent = '--';
        document.getElementById('goal-score').textContent = '--';
        document.getElementById('achievement-rate').textContent = '--%';
    }

    // Review tasks progress
    const completedTasks = state.reviewTasks.filter(t => t.completed).length;
    const totalTasks = state.reviewTasks.length;
    const reviewProgress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    document.getElementById('review-progress').textContent = reviewProgress + '%';
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('total-tasks').textContent = totalTasks;

    // Render charts
    renderProgressChart(filteredExams);
    renderSubjectChart(latestExam);

    // Render reflections
    renderReflectionsList();

    // Render review tasks
    renderReviewTasks();
    
    // Show helpful message if no data
    if (filteredExams.length === 0 && state.reflections.length === 0 && state.reviewTasks.length === 0) {
        showWelcomeMessage();
    }
}

function showWelcomeMessage() {
    const container = document.getElementById('reflections-list');
    container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: var(--card-bg); border-radius: 15px; box-shadow: 0 4px 15px var(--shadow);">
            <div style="font-size: 4rem; margin-bottom: 20px;">👋</div>
            <h2 style="color: var(--primary); margin-bottom: 15px;">模試成績管理へようこそ！</h2>
            <p style="color: var(--secondary); font-size: 1.1rem; line-height: 1.8; max-width: 600px; margin: 0 auto 30px;">
                まだデータがありません。<br>
                左サイドバーの「成績入力」から模試の結果を入力してみましょう。
            </p>
            <button onclick="switchView('input')" class="btn-primary">成績を入力する</button>
        </div>
    `;
}

// ===== Chart Rendering =====
function renderProgressChart(exams) {
    const ctx = document.getElementById('progress-chart');
    const currentGoals = state.goals[state.currentExamType] || {};
    const goalTotal = Object.values(currentGoals).reduce((sum, val) => sum + (val || 0), 0);

    if (state.charts.progress) {
        state.charts.progress.destroy();
    }

    const isDark = document.body.classList.contains('dark');
    const textColor = isDark ? '#ffffff' : '#313A49';

    state.charts.progress = new Chart(ctx, {
        type: 'line',
        data: {
            labels: exams.map(e => new Date(e.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })),
            datasets: [
                {
                    label: '得点',
                    data: exams.map(e => e.total_score),
                    borderColor: EXAM_TYPES[state.currentExamType].color,
                    backgroundColor: EXAM_TYPES[state.currentExamType].color + '33',
                    tension: 0.4,
                    borderWidth: 3
                },
                {
                    label: '目標',
                    data: exams.map(() => goalTotal),
                    borderColor: '#FF6B6B',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            },
            scales: {
                x: { ticks: { color: textColor }, grid: { color: isDark ? '#ffffff22' : '#00000022' } },
                y: { ticks: { color: textColor }, grid: { color: isDark ? '#ffffff22' : '#00000022' } }
            }
        }
    });
}

function renderSubjectChart(exam) {
    const ctx = document.getElementById('subject-chart');
    const subjects = EXAM_TYPES[state.currentExamType].subjects;
    const currentGoals = state.goals[state.currentExamType] || {};

    if (state.charts.subject) {
        state.charts.subject.destroy();
    }

    if (!exam) {
        return;
    }

    const isDark = document.body.classList.contains('dark');
    const textColor = isDark ? '#ffffff' : '#313A49';

    state.charts.subject = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: subjects,
            datasets: [
                {
                    label: '得点',
                    data: subjects.map(s => exam.scores?.[s] || 0),
                    backgroundColor: EXAM_TYPES[state.currentExamType].color
                },
                {
                    label: '目標',
                    data: subjects.map(s => currentGoals[s] || 0),
                    backgroundColor: '#FF6B6B88'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            },
            scales: {
                x: { 
                    ticks: { 
                        color: textColor,
                        maxRotation: 45,
                        minRotation: 45
                    }, 
                    grid: { color: isDark ? '#ffffff22' : '#00000022' } 
                },
                y: { 
                    ticks: { color: textColor }, 
                    grid: { color: isDark ? '#ffffff22' : '#00000022' } 
                }
            }
        }
    });
}

// ===== Reflections Rendering =====
function renderReflectionsList() {
    const container = document.getElementById('reflections-list');
    const filteredReflections = state.reflections.filter(ref => {
        const exam = state.exams.find(e => e.id === ref.exam_id);
        return exam?.exam_type === state.currentExamType;
    }).slice(0, 6); // Show latest 6

    if (filteredReflections.length === 0) {
        container.innerHTML = '<p style="color: var(--secondary); text-align: center;">振り返りがまだありません。</p>';
        return;
    }

    container.innerHTML = filteredReflections.map(ref => {
        const exam = state.exams.find(e => e.id === ref.exam_id);
        const categories = ref.categories ? JSON.parse(ref.categories) : [];
        
        return `
            <div class="reflection-card" onclick="openReflectionModal(${ref.id})">
                <div class="reflection-meta">
                    <div class="reflection-date">
                        📅 <span>${ref.timestamp}</span>
                    </div>
                    <div class="reflection-category" style="background: ${EXAM_TYPES[exam?.exam_type || 'kyotsu'].color}">
                        ${exam?.name || '未設定'}
                    </div>
                </div>
                
                <h3>${ref.title}</h3>
                
                <div class="reflection-excerpt">${ref.content}</div>
                
                <div class="reflection-tags">
                    ${categories.map(cat => `
                        <span class="reflection-tag">
                            🏷️ ${cat}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function renderReflectionsManager() {
    const container = document.getElementById('reflections-manager-list');
    const filteredReflections = state.reflections.filter(ref => {
        const exam = state.exams.find(e => e.id === ref.exam_id);
        return exam?.exam_type === state.currentExamType;
    });

    if (filteredReflections.length === 0) {
        container.innerHTML = '<p style="color: var(--secondary); text-align: center; padding: 40px;">振り返りがまだありません。右上の「+ 新規作成」ボタンから追加してください。</p>';
        return;
    }

    container.innerHTML = filteredReflections.map(ref => {
        const exam = state.exams.find(e => e.id === ref.exam_id);
        const categories = ref.categories ? JSON.parse(ref.categories) : [];
        
        return `
            <div class="reflection-card" onclick="openReflectionModal(${ref.id})">
                <div class="reflection-meta">
                    <div class="reflection-date">
                        📅 <span>${ref.timestamp}</span>
                    </div>
                    <div class="reflection-category" style="background: ${EXAM_TYPES[exam?.exam_type || 'kyotsu'].color}">
                        ${exam?.name || '未設定'}
                    </div>
                </div>
                
                <h3>${ref.title}</h3>
                
                <div class="reflection-excerpt">${ref.content}</div>
                
                <div class="reflection-tags">
                    ${categories.map(cat => `
                        <span class="reflection-tag">
                            🏷️ ${cat}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// ===== Review Tasks Rendering =====
function renderReviewTasks() {
    const container = document.getElementById('review-tasks-list');
    
    if (state.reviewTasks.length === 0) {
        container.innerHTML = '<p style="color: var(--secondary); text-align: center; padding: 20px;">解き直しタスクがありません。</p>';
        return;
    }

    container.innerHTML = state.reviewTasks.map(task => `
        <div class="review-task">
            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleTask(${task.id}, this.checked)">
            <div class="review-task-content">
                <div class="review-task-subject ${task.completed ? 'completed' : ''}">
                    ${task.subject}
                </div>
                <div class="review-task-description ${task.completed ? 'completed' : ''}">
                    ${task.task}
                </div>
            </div>
        </div>
    `).join('');
}

async function toggleTask(taskId, completed) {
    if (!supabaseClient) {
        showError('データベース接続がありません');
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('mock_review_tasks')
            .update({ completed })
            .eq('id', taskId);

        if (error) throw error;

        const task = state.reviewTasks.find(t => t.id === taskId);
        if (task) task.completed = completed;

        renderDashboard();
    } catch (error) {
        showError('タスクの更新に失敗しました: ' + error.message);
    }
}

// ===== Input View =====
function renderInputView() {
    const subjects = EXAM_TYPES[state.currentExamType].subjects;
    const container = document.getElementById('subjects-input');

    container.innerHTML = subjects.map(subject => `
        <div class="subject-input">
            <label>${subject}</label>
            <input type="number" name="score_${subject}" min="0" placeholder="点数">
        </div>
    `).join('');
}

async function saveExam() {
    if (!supabaseClient) {
        showError('データベース接続がありません');
        return;
    }
    
    // Get current user
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        showError('ログインが必要です');
        return;
    }
    
    try {
        const form = document.getElementById('score-input-form');
        const formData = new FormData(form);
        
        const scores = {};
        const subjects = EXAM_TYPES[state.currentExamType].subjects;
        let totalScore = 0;

        subjects.forEach(subject => {
            const score = parseInt(formData.get(`score_${subject}`)) || 0;
            scores[subject] = score;
            totalScore += score;
        });

        const examData = {
            user_id: user.id,  // ← Add user_id
            exam_type: state.currentExamType,
            name: formData.get('exam-name'),
            date: formData.get('exam-date'),
            scores: scores,
            total_score: totalScore
        };

        const { error } = await supabaseClient
            .from('mock_exams')
            .insert([examData]);

        if (error) throw error;

        alert('成績を保存しました！');
        form.reset();
        await loadData();
        switchView('dashboard');
    } catch (error) {
        showError('成績の保存に失敗しました: ' + error.message);
    }
}

// ===== Goals View =====
function renderGoalsView() {
    const subjects = EXAM_TYPES[state.currentExamType].subjects;
    const currentGoals = state.goals[state.currentExamType] || {};
    const container = document.getElementById('goals-input');

    container.innerHTML = subjects.map(subject => `
        <div class="subject-input">
            <label>${subject}</label>
            <input type="number" name="goal_${subject}" value="${currentGoals[subject] || ''}" 
                   min="0" placeholder="目標点">
        </div>
    `).join('');
}

async function saveGoals() {
    if (!supabaseClient) {
        showError('データベース接続がありません');
        return;
    }
    
    // Get current user
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        showError('ログインが必要です');
        return;
    }
    
    try {
        const form = document.getElementById('goals-form');
        const formData = new FormData(form);
        const subjects = EXAM_TYPES[state.currentExamType].subjects;

        // Delete existing goals for this exam type and user
        await supabaseClient
            .from('mock_goals')
            .delete()
            .eq('exam_type', state.currentExamType)
            .eq('user_id', user.id);

        // Insert new goals
        const goalsData = subjects.map(subject => ({
            user_id: user.id,  // ← Add user_id
            exam_type: state.currentExamType,
            subject: subject,
            target_score: parseInt(formData.get(`goal_${subject}`)) || 0
        }));

        const { error } = await supabaseClient
            .from('mock_goals')
            .insert(goalsData);

        if (error) throw error;

        alert('目標を保存しました！');
        await loadData();
        switchView('dashboard');
    } catch (error) {
        showError('目標の保存に失敗しました: ' + error.message);
    }
}

// ===== Reflection Modal =====
function openReflectionModal(reflectionId = null) {
    const modal = document.getElementById('reflection-modal');
    const form = document.getElementById('reflection-form');
    const deleteBtn = document.getElementById('delete-reflection-btn');

    if (reflectionId) {
        const reflection = state.reflections.find(r => r.id === reflectionId);
        if (reflection) {
            document.getElementById('modal-title').textContent = '振り返りを編集';
            document.getElementById('reflection-id').value = reflection.id;
            document.getElementById('reflection-exam-id').value = reflection.exam_id;
            document.getElementById('reflection-title').value = reflection.title;
            document.getElementById('reflection-content').value = reflection.content;
            const categories = reflection.categories ? JSON.parse(reflection.categories) : [];
            document.getElementById('reflection-categories').value = categories.join(', ');
            deleteBtn.classList.remove('hidden');
        }
    } else {
        document.getElementById('modal-title').textContent = '振り返りを追加';
        form.reset();
        deleteBtn.classList.add('hidden');
    }

    modal.showModal();
}

async function saveReflection() {
    if (!supabaseClient) {
        showError('データベース接続がありません');
        return;
    }
    
    // Get current user
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        showError('ログインが必要です');
        return;
    }
    
    try {
        const reflectionId = document.getElementById('reflection-id').value;
        const categories = document.getElementById('reflection-categories').value
            .split(',')
            .map(c => c.trim())
            .filter(c => c);

        const reflectionData = {
            user_id: user.id,  // ← Add user_id
            exam_id: document.getElementById('reflection-exam-id').value || null,
            title: document.getElementById('reflection-title').value,
            content: document.getElementById('reflection-content').value,
            categories: JSON.stringify(categories),
            timestamp: new Date().toISOString().split('T')[0]
        };

        let error;
        if (reflectionId) {
            ({ error } = await supabaseClient
                .from('mock_reflections')
                .update(reflectionData)
                .eq('id', reflectionId));
        } else {
            ({ error } = await supabaseClient
                .from('mock_reflections')
                .insert([reflectionData]));
        }

        if (error) throw error;

        document.getElementById('reflection-modal').close();
        await loadData();
        if (state.currentView === 'dashboard') renderDashboard();
        else if (state.currentView === 'reflections') renderReflectionsManager();
    } catch (error) {
        showError('振り返りの保存に失敗しました: ' + error.message);
    }
}

async function deleteReflection() {
    if (!supabaseClient) {
        showError('データベース接続がありません');
        return;
    }
    
    try {
        const reflectionId = document.getElementById('reflection-id').value;

        const { error } = await supabaseClient
            .from('mock_reflections')
            .delete()
            .eq('id', reflectionId);

        if (error) throw error;

        document.getElementById('reflection-modal').close();
        await loadData();
        if (state.currentView === 'dashboard') renderDashboard();
        else if (state.currentView === 'reflections') renderReflectionsManager();
    } catch (error) {
        showError('振り返りの削除に失敗しました: ' + error.message);
    }
}

// ===== Utility Functions =====
function showLoading(show) {
    elements.loading.classList.toggle('hidden', !show);
}

function showError(message) {
    elements.error.textContent = message;
    elements.error.classList.remove('hidden');
    setTimeout(() => {
        elements.error.classList.add('hidden');
    }, 5000);
}

// Make functions available globally
window.toggleTask = toggleTask;
window.openReflectionModal = openReflectionModal;
window.switchView = switchView;
