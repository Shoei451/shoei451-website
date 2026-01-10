// classical-viewer.js - 閲覧モードの機能

// ===== 閲覧モード表示 =====
function renderViewMode() {
    if (words.length === 0) {
        alert('品詞分解されたテキストがありません。編集モードで作成してください。');
        switchMode('edit');
        return;
    }
    
    // ヘッダー情報
    const title = document.getElementById('textTitle').value || '（タイトル未設定）';
    const author = document.getElementById('textAuthor').value || '';
    const period = document.getElementById('textPeriod').value || '';
    const genre = document.getElementById('textGenre').value || '';
    
    document.getElementById('viewTitle').textContent = title;
    
    const metaParts = [];
    if (author) metaParts.push(`作者: ${author}`);
    if (period) metaParts.push(period);
    if (genre) metaParts.push(genre);
    document.getElementById('viewMeta').textContent = metaParts.join(' | ');
    
    // 登場人物図
    renderCharactersDiagram();
    
    // 本文表示
    renderViewText();
    
    // 係り結び矢印を描画
    setTimeout(() => {
        renderKakariMusubiArrows();
    }, 100);
}

// ===== 登場人物図 =====
function renderCharactersDiagram() {
    const diagram = document.getElementById('charactersDiagram');
    
    if (characters.length === 0) {
        diagram.innerHTML = '';
        return;
    }
    
    diagram.innerHTML = '<h4 style="width: 100%; text-align: center; margin-bottom: 15px; color: var(--primary);">登場人物</h4>';
    
    characters.forEach(char => {
        const badge = document.createElement('div');
        badge.className = 'character-badge';
        badge.textContent = `${char.name}${char.social_status ? ' (' + char.social_status + ')' : ''}`;
        diagram.appendChild(badge);
    });
}

// ===== 本文表示 =====
function renderViewText() {
    const viewText = document.getElementById('viewText');
    viewText.innerHTML = '';
    
    words.forEach((word, index) => {
        const span = document.createElement('span');
        span.className = 'view-word';
        span.textContent = word.surface_form;
        span.dataset.index = index;
        span.dataset.pos = word.part_of_speech;
        
        // 補助動詞マーク
        if (word.is_auxiliary) {
            span.classList.add('auxiliary');
        }
        
        // 敬語アイコン
        if (word.honorific_type) {
            const icon = document.createElement('span');
            icon.className = 'honorific-icon';
            
            if (word.honorific_type === '尊敬語') icon.textContent = '尊';
            else if (word.honorific_type === '謙譲語') icon.textContent = '謙';
            else if (word.honorific_type === '丁寧語') icon.textContent = '丁';
            
            span.appendChild(icon);
        }
        
        // ツールチップイベント
        span.addEventListener('click', (e) => showWordTooltip(e, index));
        
        viewText.appendChild(span);
        
        // 読点・句点の後に少し余白
        if (word.surface_form === '。' || word.surface_form === '、') {
            viewText.appendChild(document.createTextNode(' '));
        }
    });
}

// ===== 単語ツールチップ =====
function showWordTooltip(event, index) {
    const word = words[index];
    const tooltip = document.getElementById('wordTooltip');
    
    let html = `<h4>${word.surface_form}</h4>`;
    
    // 基本情報
    if (word.part_of_speech) {
        html += `<div class="info-row">
            <span class="info-label">品詞</span>
            <span class="info-value">${word.part_of_speech}</span>
        </div>`;
    }
    
    if (word.conjugation_type) {
        html += `<div class="info-row">
            <span class="info-label">活用の種類</span>
            <span class="info-value">${word.conjugation_type}</span>
        </div>`;
    }
    
    if (word.conjugation_form) {
        html += `<div class="info-row">
            <span class="info-label">活用形</span>
            <span class="info-value">${word.conjugation_form}</span>
        </div>`;
    }
    
    if (word.usage_note) {
        html += `<div class="info-row">
            <span class="info-label">用法</span>
            <span class="info-value">${word.usage_note}</span>
        </div>`;
    }
    
    if (word.is_auxiliary) {
        html += `<div class="info-row">
            <span class="info-label">特殊</span>
            <span class="info-value">補助動詞</span>
        </div>`;
    }
    
    // 敬語情報
    if (word.honorific_type) {
        html += `<div class="info-row">
            <span class="info-label">敬語</span>
            <span class="info-value">${word.honorific_type}</span>
        </div>`;
        
        const fromChar = characters.find(c => c.id === word.honorific_from_character_id);
        const toChar = characters.find(c => c.id === word.honorific_to_character_id);
        
        if (fromChar || toChar) {
            const fromName = fromChar ? fromChar.name : '（不明）';
            const toName = toChar ? toChar.name : '（不明）';
            
            html += `<div class="info-row">
                <span class="info-label">敬意の向き</span>
                <span class="info-value">${fromName} → ${toName}</span>
            </div>`;
        }
    }
    
    tooltip.innerHTML = html;
    
    // 位置調整
    const rect = event.target.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.bottom + 10) + 'px';
    
    tooltip.classList.remove('hidden');
    
    // クリック外で閉じる
    setTimeout(() => {
        document.addEventListener('click', closeTooltip, { once: true });
    }, 10);
}

function closeTooltip(e) {
    const tooltip = document.getElementById('wordTooltip');
    if (!tooltip.contains(e.target)) {
        tooltip.classList.add('hidden');
    }
}

// ===== 係り結び矢印 =====
function renderKakariMusubiArrows() {
    // 係り結びのペアを検出（簡易実装）
    const kakariWords = words.filter(w => 
        w.usage_note && ['ぞ', 'なむ', 'や', 'か', 'こそ'].includes(w.usage_note)
    );
    
    if (kakariWords.length === 0) return;
    
    const svg = document.getElementById('kakariMusubiSvg');
    const viewText = document.getElementById('viewText');
    
    // SVGのサイズを調整
    const textRect = viewText.getBoundingClientRect();
    svg.style.width = textRect.width + 'px';
    svg.style.height = textRect.height + 'px';
    
    // マーカー定義（矢印の先端）
    svg.innerHTML = `
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="var(--accent)" />
            </marker>
        </defs>
    `;
    
    // 各係助詞について結びの語を探す
    kakariWords.forEach(kakari => {
        const kakariIndex = kakari.position;
        
        // 係助詞の後ろで、適切な活用形の語を探す
        let musubiIndex = -1;
        
        for (let i = kakariIndex + 1; i < words.length; i++) {
            const word = words[i];
            
            // 「こそ」→已然形、それ以外→連体形
            const expectedForm = kakari.usage_note === 'こそ' ? '已然形' : '連体形';
            
            if (word.conjugation_form === expectedForm) {
                musubiIndex = i;
                break;
            }
            
            // 句点で終了
            if (word.surface_form === '。') break;
        }
        
        if (musubiIndex === -1) return;
        
        // 矢印を描画
        const kakariElement = viewText.querySelector(`[data-index="${kakariIndex}"]`);
        const musubiElement = viewText.querySelector(`[data-index="${musubiIndex}"]`);
        
        if (!kakariElement || !musubiElement) return;
        
        const kakariRect = kakariElement.getBoundingClientRect();
        const musubiRect = musubiElement.getBoundingClientRect();
        const containerRect = viewText.getBoundingClientRect();
        
        const x1 = kakariRect.left + kakariRect.width / 2 - containerRect.left;
        const y1 = kakariRect.top - containerRect.top - 5;
        const x2 = musubiRect.left + musubiRect.width / 2 - containerRect.left;
        const y2 = musubiRect.top - containerRect.top - 5;
        
        // ベジェ曲線で矢印を描画
        const controlY = Math.min(y1, y2) - 30;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'kakari-arrow');
        path.setAttribute('d', `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${controlY}, ${x2} ${y2}`);
        path.setAttribute('marker-end', 'url(#arrowhead)');
        
        svg.appendChild(path);
    });
}

// ===== ウィンドウリサイズ対応 =====
window.addEventListener('resize', () => {
    const viewMode = document.getElementById('viewMode');
    if (!viewMode.classList.contains('hidden')) {
        renderKakariMusubiArrows();
    }
});
