// exam-papers.js - 全科目共通スクリプト

// bodyタグからsubject情報を取得
const subjectConfig = {
    subject: document.body.dataset.subject,
    subjectName: document.body.dataset.subjectName,
    storagePath: document.body.dataset.storagePath
};

// Theme Toggle
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

// Supabase設定
const SUPABASE_URL = 'https://gjuqsyaugrsshmjerhme.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdXFzeWF1Z3Jzc2htamVyaG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NzA3NTYsImV4cCI6MjA4MjA0Njc1Nn0.V8q5ddz5tPy7wBaQ73aGtmCZyqzA6pPciPRwRIZjJcs';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentSemester = '2025-term1';

// アクセス確認
async function verifyAccess() {
    const code = document.getElementById('codeInput').value.trim();
    const messageDiv = document.getElementById('message');
    
    if (!code) {
        messageDiv.innerHTML = '<p class="error-message">アクセスコードを入力してください</p>';
        return;
    }
    
    messageDiv.innerHTML = '<p style="color: var(--secondary);">確認中...</p>';
    
    try {
        const { data, error } = await supabaseClient
            .from('access_codes')
            .select('*')
            .eq('code', code)
            .eq('active', true)
            .eq('subject', subjectConfig.subject)
            .single();
        
        if (error) throw error;
        
        if (data) {
            messageDiv.innerHTML = '<p class="success-message">✓ 認証成功</p>';
            const accessKey = `${subjectConfig.subject}Access`;
            sessionStorage.setItem(accessKey, 'verified');
            sessionStorage.setItem(`${accessKey}Expiry`, Date.now() + (24 * 60 * 60 * 1000));
            
            setTimeout(() => {
                showProtectedContent();
            }, 500);
        } else {
            messageDiv.innerHTML = '<p class="error-message">✗ コードが正しくありません</p>';
        }
    } catch (error) {
        console.error('認証エラー:', error);
        messageDiv.innerHTML = '<p class="error-message">エラーが発生しました。もう一度お試しください。</p>';
    }
}

// 保護されたコンテンツ表示
function showProtectedContent() {
    document.getElementById('accessForm').style.display = 'none';
    document.getElementById('protectedContent').style.display = 'block';
    loadExamPapers(currentSemester);
}

// 学期切り替え
function switchSemester(semester) {
    currentSemester = semester;
    
    document.querySelectorAll('.subject-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.getElementById('examList').innerHTML = '';
    document.getElementById('loadingMessage').style.display = 'block';
    loadExamPapers(semester);
}

// 過去問データ読み込み
async function loadExamPapers(semester) {
    const listDiv = document.getElementById('examList');
    const loadingDiv = document.getElementById('loadingMessage');
    
    try {
        const storagePath = `${subjectConfig.storagePath}/${semester}`;
        console.log('📂 読み込み開始:', storagePath);
        
        const { data: files, error } = await supabaseClient
            .storage
            .from('exam-papers')
            .list(storagePath, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' }
            });
        
        if (error) {
            console.error('❌ Storageエラー:', error);
            loadingDiv.innerHTML = `<p style="color: #f44336;">エラー: ${error.message}</p>`;
            return;
        }
        
        console.log('✅ 取得したファイル:', files);
        
        loadingDiv.style.display = 'none';
        
        if (!files || files.length === 0) {
            listDiv.innerHTML = `<p style="text-align: center; color: var(--secondary);">この学期の過去問はまだアップロードされていません。<br>パス: ${storagePath}</p>`;
            return;
        }
        
        const pdfFiles = files.filter(file => file.name.endsWith('.pdf'));
        
        if (pdfFiles.length === 0) {
            listDiv.innerHTML = `<p style="text-align: center; color: var(--secondary);">この学期の過去問はまだアップロードされていません。</p>`;
            return;
        }
        
        // ファイルをソート: 中間→中間解答→期末→期末解答
        pdfFiles.sort((a, b) => {
            const getOrder = (fileName) => {
                const lower = fileName.toLowerCase();
                const isAnswer = lower.includes('answer') || lower.includes('解答') || lower.includes('ans');
                
                if (lower.includes('midterm') || lower.includes('中間') || lower.includes('mid')) {
                    return isAnswer ? 2 : 1;
                }
                if (lower.includes('final') || lower.includes('期末')) {
                    return isAnswer ? 4 : 3;
                }
                if (lower.includes('quiz') || lower.includes('小テスト')) {
                    return isAnswer ? 6 : 5;
                }
                return isAnswer ? 8 : 7;
            };
            
            return getOrder(a.name) - getOrder(b.name);
        });
        
        pdfFiles.forEach(file => {
            const fileName = file.name.replace('.pdf', '');
            const [year, term] = semester.split('-');
            const termNum = term.replace('term', '');
            
            let examType = '';
            const isAnswer = fileName.toLowerCase().includes('answer') || 
                             fileName.toLowerCase().includes('解答') ||
                             fileName.toLowerCase().includes('ans');
            
            if (fileName.toLowerCase().includes('midterm') || fileName.includes('中間') || fileName.toLowerCase().includes('mid')) {
                examType = '中間試験';
            } else if (fileName.toLowerCase().includes('final') || fileName.includes('期末')) {
                examType = '期末試験';
            } else if (fileName.toLowerCase().includes('quiz') || fileName.includes('小テスト')) {
                examType = '小テスト';
            } else {
                examType = 'その他';
            }
            
            const additionalInfo = isAnswer ? ' (解答)' : '';
            
            const dateMatch = fileName.match(/(\d{4})-(\d{2})-(\d{2})/);
            let dateInfo = '';
            if (dateMatch) {
                dateInfo = ` - ${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
            }
            
            const { data: urlData } = supabaseClient
                .storage
                .from('exam-papers')
                .getPublicUrl(`${subjectConfig.storagePath}/${semester}/${file.name}`);
            
            const card = document.createElement('div');
            card.className = 'exam-card';
            
            if (isAnswer) {
                card.style.borderLeft = '4px solid #faba40';
                card.style.backgroundColor = 'var(--code-bg)';
            }
            
            card.innerHTML = `
                <h3>${subjectConfig.subjectName} ${year}年度 ${termNum}学期 ${examType}${additionalInfo}</h3>
                <div class="exam-meta">
                    <span class="exam-badge"> ${(file.metadata?.size / 1024).toFixed(0)} KB</span>
                    ${dateInfo ? `<span class="exam-badge"> ${dateInfo}</span>` : ''}
                </div>
                <div class="exam-meta" style="margin-top: 8px; font-size: 0.85em; color: var(--secondary);">
                    <span> ${file.name}</span>
                </div>
                <a href="${urlData.publicUrl}" target="_blank" class="exam-link">
                     PDFを開く
                </a>
            `;
            
            listDiv.appendChild(card);
        });
        
    } catch (error) {
        console.error('読み込みエラー:', error);
        loadingDiv.innerHTML = '<p style="color: #f44336;">データの読み込みに失敗しました。</p>';
    }
}

// セッション確認（ページ読み込み時）
window.addEventListener('DOMContentLoaded', () => {
    const accessKey = `${subjectConfig.subject}Access`;
    const accessVerified = sessionStorage.getItem(accessKey);
    const expiry = sessionStorage.getItem(`${accessKey}Expiry`);
    
    if (accessVerified === 'verified' && expiry && Date.now() < parseInt(expiry)) {
        showProtectedContent();
    } else {
        sessionStorage.removeItem(accessKey);
        sessionStorage.removeItem(`${accessKey}Expiry`);
    }
});