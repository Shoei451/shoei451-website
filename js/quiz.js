// ============================================================
// js/quiz.js
// QuizUI — クイズ画面の共通 DOM 操作ユーティリティ
//
// 使い方:
//   <script src="../../js/quiz.js"></script>
//   各ロジックファイルから QuizUI.xxx() を呼ぶ
// ============================================================

const QuizUI = (() => {

    // ── 画面切り替え ────────────────────────────────────────
    /**
     * 指定 id の画面を表示し、それ以外を非表示にする。
     * @param {string} screenId  表示したい要素の id
     * @param {string[]} allIds  切り替え対象となる全画面の id 配列
     */
    function showScreen(screenId, allIds) {
        allIds.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.classList.toggle('hidden', id !== screenId);
        });
    }

    // ── プログレスバー ───────────────────────────────────────
    /**
     * @param {number} current  1-indexed の現在問題番号
     * @param {number} total    総問題数
     * @param {HTMLElement} barEl   .quiz-progress-bar 要素
     * @param {HTMLElement} [scoreEl]  スコアテキスト要素（省略可）
     * @param {number} [correct]    現在の正解数（scoreEl と一緒に使う）
     */
    function updateProgress(current, total, barEl, scoreEl, correct) {
        if (barEl) {
            const pct = total > 0 ? (current / total) * 100 : 0;
            barEl.style.width = pct + '%';
        }
        if (scoreEl !== undefined && scoreEl !== null) {
            if (correct !== undefined) {
                scoreEl.textContent = `正解数: ${correct} / ${current}`;
            } else {
                scoreEl.textContent = `${current} / ${total}`;
            }
        }
    }

    // ── 4択ボタン生成 ────────────────────────────────────────
    /**
     * container の中に choice-btn を生成して返す。
     * @param {HTMLElement} container
     * @param {string[]} choices
     * @param {function(string, HTMLButtonElement): void} onSelect  選択時コールバック
     * @returns {HTMLButtonElement[]}
     */
    function renderChoices(container, choices, onSelect) {
        container.innerHTML = '';
        return choices.map(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice;
            btn.addEventListener('click', () => onSelect(choice, btn));
            container.appendChild(btn);
            return btn;
        });
    }

    // ── 正解・不正解ハイライト ───────────────────────────────
    /**
     * @param {HTMLButtonElement[]} buttons  renderChoices の戻り値
     * @param {string} correctAnswer
     * @param {string} selectedAnswer
     */
    function highlightAnswer(buttons, correctAnswer, selectedAnswer) {
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            } else if (btn.textContent === selectedAnswer) {
                btn.classList.add('incorrect');
            }
        });
    }

    // ── スコア更新 ───────────────────────────────────────────
    /**
     * @param {number} correct
     * @param {number} answered  現時点で回答した問題数
     * @param {HTMLElement} el
     */
    function updateScore(correct, answered, el) {
        if (el) el.textContent = `正解数: ${correct} / ${answered}`;
    }

    // ── 結果画面生成 ─────────────────────────────────────────
    /**
     * @param {HTMLElement} scoreContainer   スコアカードグリッドの親
     * @param {HTMLElement} mistakesContainer 不正解リストの親
     * @param {object} opts
     *   opts.score    {number}
     *   opts.total    {number}
     *   opts.mistakes {Array<{title:string, category?:string, desc?:string, yourAnswer:string, correctAnswer:string}>}
     */
    function renderResult(scoreContainer, mistakesContainer, opts) {
        const { score, total, mistakes = [] } = opts;
        const pct = total > 0 ? Math.round((score / total) * 100) : 0;

        // Score summary cards
        if (scoreContainer) {
            scoreContainer.innerHTML = `
                <div class="quiz-score-card">
                    <div class="qlabel">正解数</div>
                    <div class="number">${score}</div>
                </div>
                <div class="quiz-score-card">
                    <div class="qlabel">不正解数</div>
                    <div class="number">${total - score}</div>
                </div>
                <div class="quiz-score-card">
                    <div class="qlabel">正解率</div>
                    <div class="number">${pct}%</div>
                </div>
            `;
        }

        // Mistakes list
        if (mistakesContainer) {
            if (mistakes.length === 0) {
                mistakesContainer.innerHTML = `
                    <div style="text-align:center;padding:40px;color:var(--secondary);">
                        🎉 完璧です！全問正解おめでとうございます！
                    </div>`;
                return;
            }
            mistakesContainer.innerHTML = `<h3 style="color:var(--primary);margin-bottom:16px;">間違えた問題（復習用）</h3>` +
                mistakes.map(m => `
                    <div class="mistake-item">
                        <div class="mistake-header">
                            <span class="mistake-title">${_esc(m.title)}</span>
                            ${m.category ? `<span class="quiz-chip is-badge">${_esc(m.category)}</span>` : ''}
                        </div>
                        ${m.desc ? `<div style="color:var(--secondary);font-size:0.88rem;margin-top:4px;">${_esc(m.desc)}</div>` : ''}
                        <div class="mistake-answers">
                            <span class="mistake-your">あなたの回答: ${_esc(m.yourAnswer)}</span>
                            <span class="mistake-correct">正解: ${_esc(m.correctAnswer)}</span>
                        </div>
                    </div>`
                ).join('');
        }
    }

    // ── フィードバック表示（年号入力タイプ向け） ─────────────
    /**
     * @param {HTMLElement} el  .quiz-feedback 要素
     * @param {boolean} isCorrect
     * @param {string} html  表示する HTML（改行は <br> で）
     */
    function showFeedback(el, isCorrect, html) {
        el.classList.remove('hidden', 'correct', 'incorrect');
        el.classList.add(isCorrect ? 'correct' : 'incorrect');
        el.innerHTML = html;
    }

    // ── 年号フォーマット（共通） ─────────────────────────────
    /**
     * 負数 = 紀元前。wh-utils.js の formatYear と同じ仕様。
     */
    function formatYear(year) {
        if (year === null || year === undefined) return '不明';
        return year < 0 ? `前${Math.abs(year)}年` : `${year}年`;
    }

    // ── XSS エスケープ（内部用） ─────────────────────────────
    function _esc(s) {
        const d = document.createElement('div');
        d.textContent = String(s ?? '');
        return d.innerHTML;
    }

    return { showScreen, updateProgress, renderChoices, highlightAnswer, updateScore, renderResult, showFeedback, formatYear };
})();

window.QuizUI = QuizUI;