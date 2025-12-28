// ===== Supabase Configuration =====
const SUPABASE_URL = 'https://fsjanwqececsgtmwwmyd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzamFud3FlY2Vjc2d0bXd3bXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4ODcxMDgsImV4cCI6MjA4MjQ2MzEwOH0.kHeKLUKcx2SQGUuYI8y_Y5wEnOcl9Gy9-mRlIx-wimE';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== UI Elements =====
const authScreen = document.getElementById('auth-screen');
const mainContent = document.getElementById('main-content');
const authError = document.getElementById('auth-error');
const authSuccess = document.getElementById('auth-success');

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const resetForm = document.getElementById('reset-form');

// ===== Helper Functions =====
function showError(message) {
    authError.textContent = message;
    authError.classList.add('show');
    authSuccess.classList.remove('show');
    setTimeout(() => authError.classList.remove('show'), 5000);
}

function showSuccess(message) {
    authSuccess.textContent = message;
    authSuccess.classList.add('show');
    authError.classList.remove('show');
    setTimeout(() => authSuccess.classList.remove('show'), 5000);
}

function showAuthScreen() {
    authScreen.classList.remove('hidden');
    mainContent.classList.add('hidden');
}

function showMainContent(user) {
    authScreen.classList.add('hidden');
    mainContent.classList.remove('hidden');
    document.getElementById('user-email').textContent = user.email;
}

// ===== Tab Switching =====
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Update active tab
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding form
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        if (targetTab === 'login') {
            loginForm.classList.add('active');
        } else if (targetTab === 'signup') {
            signupForm.classList.add('active');
        }
        
        // Clear messages
        authError.classList.remove('show');
        authSuccess.classList.remove('show');
    });
});

// ===== Forgot Password Link =====
document.getElementById('forgot-password-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    resetForm.classList.add('active');
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
});

document.getElementById('back-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    loginForm.classList.add('active');
    document.querySelector('[data-tab="login"]').classList.add('active');
});

// ===== Login =====
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const submitBtn = loginForm.querySelector('.auth-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'ログイン中...';
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        showSuccess('ログイン成功！');
        setTimeout(() => {
            showMainContent(data.user);
            setupThemeToggle();
            generateCards();
        }, 500);
        
    } catch (error) {
        showError(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'ログイン';
    }
});

// ===== Signup =====
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm').value;
    
    // Password confirmation check
    if (password !== passwordConfirm) {
        showError('パスワードが一致しません');
        return;
    }
    
    const submitBtn = signupForm.querySelector('.auth-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '登録中...';
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        
        if (error) throw error;
        
        // Check if email confirmation is required
        if (data.user && data.user.confirmed_at) {
            showSuccess('登録成功！自動的にログインします...');
            setTimeout(() => {
                showMainContent(data.user);
                setupThemeToggle();
                generateCards();
            }, 1000);
        } else {
            showSuccess('登録成功！確認メールを送信しました。メールを確認してください。');
            // Switch to login tab
            setTimeout(() => {
                document.querySelector('[data-tab="login"]').click();
            }, 3000);
        }
        
        signupForm.reset();
        
    } catch (error) {
        showError(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '新規登録';
    }
});

// ===== Password Reset =====
resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('reset-email').value;
    
    const submitBtn = resetForm.querySelector('.auth-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/private/reset-password.html'
        });
        
        if (error) throw error;
        
        showSuccess('パスワードリセットメールを送信しました！メールを確認してください。');
        resetForm.reset();
        
        setTimeout(() => {
            document.getElementById('back-to-login').click();
        }, 3000);
        
    } catch (error) {
        showError(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'リセットメール送信';
    }
});

// ===== Logout =====
document.getElementById('logout-btn').addEventListener('click', async () => {
    if (confirm('ログアウトしますか？')) {
        await supabase.auth.signOut();
        location.reload();
    }
});

// ===== Check Auth State =====
async function checkAuthState() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        showMainContent(user);
        setupThemeToggle();
        generateCards();
    } else {
        showAuthScreen();
    }
}

// ===== Theme Toggle =====
function setupThemeToggle() {
    if (localStorage.getItem("pref-theme") === "dark") {
        document.body.classList.add('dark');
    } else if (localStorage.getItem("pref-theme") === "light") {
        document.body.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark');
    }

    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        if (document.body.classList.contains('dark')) {
            localStorage.setItem('pref-theme', 'dark');
        } else {
            localStorage.setItem('pref-theme', 'light');
        }
    });
}

// ===== Generate Cards =====
function generateCards() {
    const container = document.getElementById('private-cards-container');
    container.innerHTML = '';
    
    privateTools.forEach(tool => {
        const cardElement = document.createElement('a');
        cardElement.href = tool.link;
        cardElement.className = 'card';
        
        const isExternal = tool.link.startsWith('http://') || tool.link.startsWith('https://');
        if (isExternal || tool.target === '_blank') {
            cardElement.target = '_blank';
            cardElement.rel = 'noopener noreferrer';
        }
        
        cardElement.innerHTML = `
            <div class="card-icon">${tool.icon}</div>
            <h3>${tool.title}</h3>
            <p class="subtitle">${tool.titleEN || ''}</p>
            <p>${tool.description}</p>
        `;
        container.appendChild(cardElement);
    });
    
    // Animate Cards
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));
}

// ===== Listen to Auth Changes =====
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        showMainContent(session.user);
        setupThemeToggle();
        generateCards();
    } else if (event === 'SIGNED_OUT') {
        showAuthScreen();
    }
});

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
});
