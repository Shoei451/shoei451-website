// ===== Supabase Configuration =====
const SUPABASE_URL = 'https://fsjanwqececsgtmwwmyd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzamFud3FlY2Vjc2d0bXd3bXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4ODcxMDgsImV4cCI6MjA4MjQ2MzEwOH0.kHeKLUKcx2SQGUuYI8y_Y5wEnOcl9Gy9-mRlIx-wimE';

// Global variables
let supabase;
let authScreen, mainContent, authError, authSuccess;
let loginForm, signupForm, resetForm;

// ===== Initialize Everything After DOM Loads =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    
    // Initialize Supabase
    if (!window.supabase) {
        console.error('Supabase library not loaded!');
        alert('エラー: Supabaseライブラリが読み込まれていません');
        return;
    }
    
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase initialized');
    
    // Get UI elements
    authScreen = document.getElementById('auth-screen');
    mainContent = document.getElementById('main-content');
    authError = document.getElementById('auth-error');
    authSuccess = document.getElementById('auth-success');
    loginForm = document.getElementById('login-form');
    signupForm = document.getElementById('signup-form');
    resetForm = document.getElementById('reset-form');
    
    if (!loginForm) {
        console.error('Login form not found!');
        return;
    }
    
    console.log('UI elements found');
    
    // Setup event listeners
    setupEventListeners();
    
    // Check auth state
    checkAuthState();
    
    // Listen to auth changes
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_IN') {
            showMainContent(session.user);
            setupThemeToggle();
            generateCards();
        } else if (event === 'SIGNED_OUT') {
            showAuthScreen();
        }
    });
});

// ===== Setup Event Listeners =====
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            console.log('Switching to tab:', targetTab);
            
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            if (targetTab === 'login') {
                loginForm.classList.add('active');
            } else if (targetTab === 'signup') {
                signupForm.classList.add('active');
            }
            
            authError.classList.remove('show');
            authSuccess.classList.remove('show');
        });
    });
    
    // Forgot password link
    document.getElementById('forgot-password-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        resetForm.classList.add('active');
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    });
    
    // Back to login
    document.getElementById('back-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        loginForm.classList.add('active');
        document.querySelector('[data-tab="login"]').classList.add('active');
    });
    
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Signup form
    signupForm.addEventListener('submit', handleSignup);
    
    // Reset form
    resetForm.addEventListener('submit', handlePasswordReset);
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    console.log('Event listeners set up');
}

// ===== Helper Functions =====
function showError(message) {
    console.error('Error:', message);
    authError.textContent = message;
    authError.classList.add('show');
    authSuccess.classList.remove('show');
    setTimeout(() => authError.classList.remove('show'), 5000);
}

function showSuccess(message) {
    console.log('Success:', message);
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
    console.log('Showing main content for user:', user.email);
    authScreen.classList.add('hidden');
    mainContent.classList.remove('hidden');
    document.getElementById('user-email').textContent = user.email;
}

// ===== Auth Handlers =====
async function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    console.log('Attempting login for:', email);
    
    const submitBtn = loginForm.querySelector('.auth-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'ログイン中...';
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        console.log('Login successful:', data.user.email);
        showSuccess('ログイン成功！');
        
        setTimeout(() => {
            showMainContent(data.user);
            setupThemeToggle();
            generateCards();
        }, 500);
        
    } catch (error) {
        console.error('Login failed:', error);
        showError(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'ログイン';
    }
}

async function handleSignup(e) {
    e.preventDefault();
    console.log('Signup form submitted');
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm').value;
    
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
        
        if (data.user && data.user.confirmed_at) {
            showSuccess('登録成功！自動的にログインします...');
            setTimeout(() => {
                showMainContent(data.user);
                setupThemeToggle();
                generateCards();
            }, 1000);
        } else {
            showSuccess('登録成功！確認メールを送信しました。メールを確認してください。');
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
}

async function handlePasswordReset(e) {
    e.preventDefault();
    console.log('Password reset form submitted');
    
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
}

async function handleLogout() {
    if (confirm('ログアウトしますか？')) {
        await supabase.auth.signOut();
        location.reload();
    }
}

// ===== Check Auth State =====
async function checkAuthState() {
    console.log('Checking auth state...');
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            console.log('User already logged in:', user.email);
            showMainContent(user);
            setupThemeToggle();
            generateCards();
        } else {
            console.log('No user logged in');
            showAuthScreen();
        }
    } catch (error) {
        console.error('Error checking auth state:', error);
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
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            if (document.body.classList.contains('dark')) {
                localStorage.setItem('pref-theme', 'dark');
            } else {
                localStorage.setItem('pref-theme', 'light');
            }
        });
    }
}

// ===== Generate Cards =====
function generateCards() {
    console.log('Generating cards...');
    
    const container = document.getElementById('private-cards-container');
    if (!container) {
        console.error('Cards container not found');
        return;
    }
    
    container.innerHTML = '';
    
    if (typeof privateTools === 'undefined') {
        console.error('privateTools not defined');
        return;
    }
    
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
    
    console.log('Cards generated:', privateTools.length);
    
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
