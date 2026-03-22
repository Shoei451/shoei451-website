// ============================================================
// js/quiz-engine.js
// QuizEngine — 設定駆動の年代クイズ ステートマシン
//
// 依存:
//   quiz.js (QuizUI) — renderResult, showFeedback, showScreen
//
// 提供するもの:
//   QuizEngine         — クラス（メインエンジン）
//   proximityScoring   — 年号入力向け近似採点
//   exactScoring       — 完全一致採点
//   renderProgressDots — 進捗ドット / バー描画
//
// 読み込み順:
//   <script src="quiz.js"></script>
//   <script src="quiz-engine.js"></script>
//   <script src="quiz-config.js"></script>  ← 各ページの設定
// ============================================================


// ================================================================
// 採点関数
// ================================================================

/**
 * 完全一致採点（4択など）
 * @param {*}      answer   ユーザーの回答
 * @param {*}      correct  正解
 * @returns {{ isCorrect, score, diff }}
 */
function exactScoring(answer, correct) {
  const isCorrect = answer === correct;
  return { isCorrect, score: isCorrect ? 100 : 0, diff: null };
}

/**
 * 近似採点（年号入力向け）
 * score = round(100 × exp(-|diff| / decay))
 *
 * decay = 15 の場合:
 *   diff  0  → score 100
 *   diff  5  → score  72
 *   diff 15  → score  37
 *   diff 30  → score  13
 *   diff 50  → score   4
 *
 * @param {number} userYear    ユーザーが入力した年（負数=BC）
 * @param {number} correctYear 正解の年（負数=BC）
 * @param {number} decay       減衰定数（デフォルト 15）
 * @returns {{ isCorrect, score, diff }}
 */
function proximityScoring(userYear, correctYear, decay = 15) {
  const diff     = userYear - correctYear;   // 正なら未来方向のズレ
  const absDiff  = Math.abs(diff);
  const isCorrect = absDiff === 0;
  const score    = Math.round(100 * Math.exp(-absDiff / decay));
  return { isCorrect, score, diff };
}


// ================================================================
// 進捗コンポーネント
// （quiz.css の .qe-dot / .quiz-progress-outer を使う）
// ================================================================

/**
 * 進捗ドット or バーを描画する。
 *
 * total ≤ 20 → クリック可能なドット（各ドットに正誤色が付く）
 * total > 20 → プログレスバー（色なし、現在位置のみ表示）
 *
 * @param {HTMLElement}  container   描画先 DOM
 * @param {Array}        answers     answers[i] = { isCorrect } | undefined
 * @param {number}       total       総問題数
 * @param {number}       currentIndex 現在の問題インデックス（0-indexed）
 * @param {Function|null} onJump      ドットクリック時のコールバック (idx) => void
 */
function renderProgressDots(container, answers, total, currentIndex, onJump) {
  if (!container) return;

  if (total > 20) {
    // ── バーモード ────────────────────────────────────────────
    const pct = Math.round((currentIndex + 1) / total * 100);
    container.innerHTML = `
      <div class="quiz-progress-outer">
        <div class="quiz-progress-bar" style="width:${pct}%"></div>
      </div>
      <div class="qe-progress-label">${currentIndex + 1} / ${total}</div>`;
    return;
  }

  // ── ドットモード ──────────────────────────────────────────
  container.innerHTML = Array.from({ length: total }, (_, i) => {
    const ans = answers[i];
    const cls = i === currentIndex ? 'current'
              : !ans               ? ''
              : ans.isCorrect      ? 'correct'
              :                      'incorrect';
    return `<button class="qe-dot ${cls}" data-idx="${i}" aria-label="問題${i + 1}へ"></button>`;
  }).join('');

  if (onJump) {
    container.querySelectorAll('.qe-dot').forEach(btn =>
      btn.addEventListener('click', () => onJump(Number(btn.dataset.idx)))
    );
  }
}


// ================================================================
// QuizEngine クラス
// ================================================================

class QuizEngine {

  /**
   * @param {object} config — quiz-config.js で定義する設定オブジェクト
   *
   * 必須プロパティ:
   *   dataSource.fetch(db, TABLES) → Promise<Array>
   *   getYear(item)                → number（負数=BC）
   *   formatAnswer(year)           → string（表示用）
   *
   * 任意プロパティ（デフォルト動作あり）:
   *   ranges[]              範囲選択肢の定義
   *   rangeType             'multi' | 'single'（デフォルト 'multi'）
   *   rangeFilter(item, v)  フィルタ関数
   *   questionCount         { min, max, default }
   *   scoringType           'proximity' | 'exact'（デフォルト 'proximity'）
   *   proximityDecay        減衰定数（デフォルト 15）
   *   getPrompt(item)       問題文
   *   getSubPrompt(item)    補足テキスト
   *   getCategory(item)     カテゴリ名
   *   onSetup(engine)       セットアップ画面のカスタム描画
   *   onQuestion(engine, q) 問題画面のカスタム描画（省略時はデフォルト）
   *   onReview(engine, ans) 正誤フィードバックのカスタム描画（省略時はデフォルト）
   *   onDone(engine)        結果画面のカスタム描画（省略時はデフォルト）
   */
  constructor(config) {
    this.config     = config;
    this._allData   = [];
    this._questions = [];
    this._answers   = [];   // answers[i] = { question, userAnswer, isCorrect, score, diff }
    this._index     = 0;
    this._phase     = 'idle';
  }

  // ── 初期化 ───────────────────────────────────────────────────

  /** データ読み込み → setup 画面を表示 */
  async init() {
    this._setPhase('loading');
    try {
      this._allData = await this.config.dataSource.fetch(
        window.db,
        window.TABLES
      );
    } catch (e) {
      console.error('QuizEngine: データ読み込み失敗', e);
      this._allData = [];
      // ロード失敗でも setup に進む（エラー表示は onSetup で行う）
    }
    this._setPhase('setup');
  }

  // ── 操作メソッド ─────────────────────────────────────────────

  /**
   * クイズ開始
   * @param {Array}  selectedRanges  選択された範囲の value 配列
   * @param {number} count           出題数
   */
  start(selectedRanges, count) {
    let filtered = this._allData;

    if (this.config.rangeFilter && selectedRanges.length > 0) {
      filtered = this._allData.filter(item =>
        selectedRanges.some(r => this.config.rangeFilter(item, r))
      );
    }

    if (filtered.length === 0) {
      alert('選択した範囲に問題がありません。');
      return;
    }

    const actual      = Math.min(count, filtered.length);
    this._questions   = QuizEngine._shuffle(filtered).slice(0, actual);
    this._answers     = new Array(actual).fill(undefined);
    this._index       = 0;
    this._setPhase('running');
  }

  /**
   * 回答提出
   * @param {number} answer ユーザーが入力した数値
   */
  submit(answer) {
    if (this._phase !== 'running') return;
    const q      = this._questions[this._index];
    const result = this._score(answer, q);
    this._answers[this._index] = { question: q, userAnswer: answer, ...result };
    this._setPhase('reviewing');
  }

  /** 次の問題へ */
  next() {
    if (this._phase !== 'reviewing') return;
    this._index++;
    if (this._index >= this._questions.length) {
      this._setPhase('done');
    } else {
      this._setPhase('running');
    }
  }

  /** 問題ジャンプ（進捗ドットから） */
  jumpTo(idx) {
    if (idx < 0 || idx >= this._questions.length) return;
    this._index = idx;
    const existing = this._answers[idx];
    this._setPhase(existing ? 'reviewing' : 'running');
  }

  /** 設定画面へ戻る（確認メッセージ付き） */
  reset(skipConfirm = false) {
    if (!skipConfirm && this._phase !== 'setup' && this._phase !== 'done') {
      if (!confirm('途中でリセットしますか？\n進捗は失われます。')) return;
    }
    this._questions = [];
    this._answers   = [];
    this._index     = 0;
    this._setPhase('setup');
  }

  /** 復習モード（不正解のみ再出題） */
  reviewMode() {
    const wrongs = this._answers
      .filter(a => a && !a.isCorrect)
      .map(a => a.question);

    if (wrongs.length === 0) {
      alert('間違えた問題がありません！');
      return;
    }
    this._questions = QuizEngine._shuffle(wrongs);
    this._answers   = new Array(this._questions.length).fill(undefined);
    this._index     = 0;
    this._setPhase('running');
  }

  // ── Getter ───────────────────────────────────────────────────

  get phase()           { return this._phase; }
  get currentQuestion() { return this._questions[this._index]; }
  get currentAnswer()   { return this._answers[this._index]; }
  get allData()         { return this._allData; }

  get results() {
    const answered   = this._answers.filter(Boolean);
    const total      = this._questions.length;
    const correct    = answered.filter(a => a.isCorrect).length;
    const totalScore = answered.reduce((s, a) => s + (a.score || 0), 0);
    const avgScore   = answered.length > 0
      ? Math.round(totalScore / answered.length) : 0;
    return {
      total, correct, avgScore,
      pct:      total > 0 ? Math.round(correct / total * 100) : 0,
      mistakes: answered.filter(a => !a.isCorrect),
    };
  }

  // ── 内部メソッド ─────────────────────────────────────────────

  _score(answer, question) {
    const type = this.config.scoringType || 'proximity';
    if (type === 'proximity') {
      const correct = this.config.getYear(question);
      const decay   = this.config.proximityDecay || 15;
      return proximityScoring(answer, correct, decay);
    }
    return exactScoring(answer, this.config.getCorrect(question));
  }

  _setPhase(phase) {
    this._phase = phase;
    this._render();
  }

  _render() {
    const phase = this._phase;

    // 画面切り替え
    QuizUI.showScreen(
      phase === 'loading'                             ? 'loadingScreen'
    : phase === 'setup'                               ? 'setupScreen'
    : (phase === 'running' || phase === 'reviewing')  ? 'quizScreen'
    : 'resultScreen',
      ['loadingScreen', 'setupScreen', 'quizScreen', 'resultScreen']
    );

    if (phase === 'setup') {
      this._renderSetup();
    }
    if (phase === 'running') {
      this._renderProgress();
      this._renderRunning();
    }
    if (phase === 'reviewing') {
      this._renderProgress();
      this._renderReviewing();
    }
    if (phase === 'done') {
      this._renderDone();
    }
  }

  _renderSetup() {
    if (this.config.onSetup) {
      this.config.onSetup(this);
      return;
    }
    // デフォルト：範囲チップを生成する
    const container = document.getElementById('rangeSelection');
    if (!container || !this.config.ranges) return;
    container.innerHTML = this.config.ranges.map(r => `
      <button type="button" class="quiz-chip" data-value="${_esc(r.value)}">
        ${_esc(r.label)}
      </button>`).join('');

    const rangeType = this.config.rangeType || 'multi';

    container.querySelectorAll('.quiz-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        if (rangeType === 'single') {
          container.querySelectorAll('.quiz-chip').forEach(b =>
            b.classList.remove('selected')
          );
        }
        btn.classList.toggle('selected');
      });
    });
  }

  _renderProgress() {
    renderProgressDots(
      document.getElementById('quizProgress'),
      this._answers,
      this._questions.length,
      this._index,
      (idx) => this.jumpTo(idx)
    );
    // 問題カウンター
    const counter = document.getElementById('quizCounter');
    if (counter) {
      counter.textContent = `問題 ${this._index + 1} / ${this._questions.length}`;
    }
  }

  _renderRunning() {
    if (this.config.onQuestion) {
      this.config.onQuestion(this, this.currentQuestion);
      return;
    }
    // ── デフォルト（yearInput 前提） ──────────────────────────
    const q   = this.currentQuestion;
    const cfg = this.config;

    _setText('categoryChip',
      cfg.getCategory ? `<span class="quiz-chip is-badge">${_esc(cfg.getCategory(q))}</span>` : '');
    _setAttr('categoryChip', 'innerHTML',
      cfg.getCategory ? `<span class="quiz-chip is-badge">${_esc(cfg.getCategory(q))}</span>` : '');

    const promptEl = document.getElementById('promptText');
    if (promptEl) promptEl.textContent = cfg.getPrompt ? cfg.getPrompt(q) : '';

    const subEl = document.getElementById('subPromptText');
    if (subEl) {
      const sub = cfg.getSubPrompt ? cfg.getSubPrompt(q) : '';
      subEl.textContent = sub;
      subEl.style.display = sub ? '' : 'none';
    }

    // 入力欄リセット
    const input = document.getElementById('yearInput');
    if (input) {
      input.value     = '';
      input.className = 'qe-year-input';
      input.disabled  = false;
      setTimeout(() => input.focus(), 80);
    }

    // フィードバック非表示
    const fb = document.getElementById('feedback');
    if (fb) fb.classList.add('hidden');

    // ボタン状態
    _show('submitBtn');
    _hide('nextBtn');
  }

  _renderReviewing() {
    if (this.config.onReview) {
      this.config.onReview(this, this.currentAnswer);
      return;
    }
    // ── デフォルト ────────────────────────────────────────────
    const ans  = this.currentAnswer;
    const cfg  = this.config;
    const fmt  = cfg.formatAnswer || String;

    const input = document.getElementById('yearInput');
    if (input) {
      input.disabled  = true;
      input.className = `qe-year-input ${ans.isCorrect ? 'correct' : 'incorrect'}`;
    }

    // フィードバックテキスト
    let fbHtml;
    if (ans.isCorrect) {
      fbHtml = `✓ 正解！　${fmt(cfg.getYear(ans.question))}`;
    } else {
      const correctLabel = fmt(cfg.getYear(ans.question));
      const yourLabel    = fmt(ans.userAnswer);
      const diffLabel    = ans.diff !== null
        ? `　（${ans.diff > 0 ? '+' : ''}${ans.diff}年）` : '';
      fbHtml = `✗ 不正解　正解: ${correctLabel}<br>あなたの回答: ${yourLabel}${diffLabel}`;
    }

    QuizUI.showFeedback(
      document.getElementById('feedback'),
      ans.isCorrect,
      fbHtml
    );

    // ボタン状態
    _hide('submitBtn');
    _show('nextBtn');

    // 最終問題なら「結果を見る」に変更
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.textContent = this._index >= this._questions.length - 1
        ? '結果を見る →' : '次へ →';
    }
  }

  _renderDone() {
    if (this.config.onDone) {
      this.config.onDone(this);
      return;
    }
    // ── デフォルト ────────────────────────────────────────────
    const r   = this.results;
    const cfg = this.config;
    const fmt = cfg.formatAnswer || String;

    QuizUI.renderResult(
      document.getElementById('scoreSummary'),
      document.getElementById('mistakesList'),
      {
        score:    r.correct,
        total:    r.total,
        mistakes: r.mistakes.map(a => ({
          title:         cfg.getPrompt ? cfg.getPrompt(a.question) : '—',
          category:      cfg.getCategory ? cfg.getCategory(a.question) : null,
          desc:          cfg.getSubPrompt ? cfg.getSubPrompt(a.question) : '',
          yourAnswer:    fmt(a.userAnswer),
          correctAnswer: fmt(cfg.getYear(a.question)),
        })),
      }
    );
  }

  // ── ユーティリティ ───────────────────────────────────────────

  static _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}


// ================================================================
// DOM ヘルパー（エンジン内部で使用）
// ================================================================

function _esc(s) {
  const d = document.createElement('div');
  d.textContent = String(s ?? '');
  return d.innerHTML;
}

function _setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function _setAttr(id, attr, val) {
  const el = document.getElementById(id);
  if (el) el[attr] = val;
}

function _show(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function _hide(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}


// ================================================================
// グローバルに公開
// ================================================================

window.QuizEngine       = QuizEngine;
window.proximityScoring = proximityScoring;
window.exactScoring     = exactScoring;
window.renderProgressDots = renderProgressDots;