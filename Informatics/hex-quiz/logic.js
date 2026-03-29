// ============================================================
// Informatics/hex-quiz/logic.js
//
// 16進法クイズのロジック。
// 問題生成・quiz-componentsとのグルーコードを担当。
// マークシートは廃止し、quiz-components の progress.js に統一。
// ============================================================

// ===================================================
// 問題生成ロジック（変更なし）
// ===================================================

const categoryNames = {
  conversion_dec_hex: "10進⇔16進変換",
  conversion_bin_hex: "2進⇔16進変換",
  calc_hex_hex: "16進数四則演算",
  calc_mixed_base: "複数基数混合",
  calc_negative: "負の数計算",
  color_code: "カラーコード",
  ascii_binary: "ASCII 2進数",
};

// ── 各カテゴリの問題生成 ──────────────────────────────────

function generateConversionDecHex() {
  const isDecToHex = Math.random() > 0.5;
  if (isDecToHex) {
    const dec = Math.floor(Math.random() * 256);
    const hex = dec.toString(16).toUpperCase();
    const correct = `0x${hex}`;
    return {
      text: `10進数の ${dec} を16進数に変換すると？`,
      correct,
      options: generateHexChoices(correct),
      explanation: `${dec} ÷ 16 の余りを読むと 0x${hex} になります。`,
    };
  } else {
    const dec = Math.floor(Math.random() * 256);
    const hex = dec.toString(16).toUpperCase();
    const correct = dec.toString();
    return {
      text: `16進数の 0x${hex} を10進数に変換すると？`,
      correct,
      options: generateDecChoices(dec),
      explanation: `0x${hex} を10進数に変換すると ${dec} です。`,
    };
  }
}

function generateConversionBinHex() {
  const isBinToHex = Math.random() > 0.5;
  if (isBinToHex) {
    const dec = Math.floor(Math.random() * 256);
    const bin = dec.toString(2).padStart(8, "0");
    const hex = dec.toString(16).toUpperCase();
    const correct = `0x${hex}`;
    return {
      text: `2進数の ${bin} を16進数に変換すると？`,
      correct,
      options: generateHexChoices(correct),
      explanation: `4ビットずつ区切って変換すると 0x${hex} です。`,
    };
  } else {
    const dec = Math.floor(Math.random() * 256);
    const hex = dec.toString(16).toUpperCase();
    const bin = dec.toString(2).padStart(8, "0");
    return {
      text: `16進数の 0x${hex} を2進数に変換すると？`,
      correct: bin,
      options: generateBinChoices(bin),
      explanation: `各16進数桁を4ビットに展開すると ${bin} です。`,
    };
  }
}

function generateCalcHexHex() {
  const ops = ["+", "-", "*"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, result;
  if (op === "+") {
    a = Math.floor(Math.random() * 128);
    b = Math.floor(Math.random() * 128);
    result = a + b;
  } else if (op === "-") {
    a = Math.floor(Math.random() * 200) + 50;
    b = Math.floor(Math.random() * 50);
    result = a - b;
  } else {
    a = Math.floor(Math.random() * 16);
    b = Math.floor(Math.random() * 16);
    result = a * b;
  }
  const hexA = "0x" + a.toString(16).toUpperCase();
  const hexB = "0x" + b.toString(16).toUpperCase();
  const correct = "0x" + result.toString(16).toUpperCase();
  return {
    text: `${hexA} ${op} ${hexB} = ?`,
    correct,
    options: generateHexChoices(correct),
    explanation: `結果は10進数で ${result}、16進数で ${correct} です。`,
  };
}

function generateCalcMixedBase() {
  const ops = ["+", "-"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = Math.floor(Math.random() * 100);
  let b = Math.floor(Math.random() * 100);
  const useDecFirst = Math.random() > 0.5;
  let result;
  if (op === "+") {
    result = a + b;
  } else {
    if (a < b) [a, b] = [b, a];
    result = a - b;
  }
  const hexB = "0x" + b.toString(16).toUpperCase();
  const correct = "0x" + result.toString(16).toUpperCase();
  const text = useDecFirst
    ? `10進数の ${a} ${op} 16進数の ${hexB} = 16進数で？`
    : `16進数の 0x${a.toString(16).toUpperCase()} ${op} 10進数の ${b} = 16進数で？`;
  return {
    text,
    correct,
    options: generateHexChoices(correct),
    explanation: `結果は10進数で ${result}、16進数で ${correct} です。`,
  };
}

function generateCalcNegative() {
  const a = Math.floor(Math.random() * 50) + 10;
  const b = Math.floor(Math.random() * 100) + a + 10;
  const result = a - b;
  const hexA = "0x" + a.toString(16).toUpperCase();
  const hexB = "0x" + b.toString(16).toUpperCase();
  const absResult = Math.abs(result);
  const correct = "-0x" + absResult.toString(16).toUpperCase();
  return {
    text: `${hexA} - ${hexB} = ?`,
    correct,
    options: generateNegativeHexChoices(correct),
    explanation: `${a} - ${b} = ${result}、16進数では ${correct} です。`,
  };
}

function generateColorCode() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const colorCode =
    "#" +
    r.toString(16).padStart(2, "0").toUpperCase() +
    g.toString(16).padStart(2, "0").toUpperCase() +
    b.toString(16).padStart(2, "0").toUpperCase();
  const correct = `R:${r}, G:${g}, B:${b}`;
  return {
    text: `カラーコード ${colorCode} のRGB値は？`,
    correct,
    options: generateRGBChoices(r, g, b),
    explanation: `#RRGGBB 形式で各2桁が赤・緑・青を表します。`,
    colorCode, // 問題表示時のカラープレビュー用
  };
}

function generateASCIIBinary() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
  const char = chars[Math.floor(Math.random() * chars.length)];
  const code = char.charCodeAt(0);
  const binary = code.toString(2).padStart(8, "0");
  const isCharToBin = Math.random() > 0.5;
  if (isCharToBin) {
    return {
      text: `文字 '${char}' のASCIIコードを2進数で表すと？`,
      correct: binary,
      options: generateBinChoices(binary),
      explanation: `'${char}' のASCIIコードは ${code}（10進）= ${binary}（2進）です。`,
      showASCII: true,
    };
  } else {
    return {
      text: `2進数 ${binary} はASCIIコードで何の文字？`,
      correct: char,
      options: generateCharChoices(char, chars),
      explanation: `${binary}（2進）= ${code}（10進）= '${char}' です。`,
      showASCII: true,
    };
  }
}

function generateQuestions(category, count) {
  const gen = {
    conversion_dec_hex: generateConversionDecHex,
    conversion_bin_hex: generateConversionBinHex,
    calc_hex_hex: generateCalcHexHex,
    calc_mixed_base: generateCalcMixedBase,
    calc_negative: generateCalcNegative,
    color_code: generateColorCode,
    ascii_binary: generateASCIIBinary,
  };
  const fn = gen[category];
  if (!fn) return [];
  return Array.from({ length: count }, () => {
    const q = fn();
    q.category = categoryNames[category];
    return q;
  });
}

// ── 選択肢生成ヘルパー ─────────────────────────────────────

function generateHexChoices(correct) {
  const n = parseInt(correct, 16);
  const set = new Set([correct]);
  while (set.size < 4) {
    const off = Math.round((Math.random() - 0.5) * 50);
    const w = Math.max(0, n + off);
    set.add("0x" + w.toString(16).toUpperCase());
  }
  return shuffle([...set]);
}

function generateDecChoices(correct) {
  const set = new Set([String(correct)]);
  while (set.size < 4) {
    const off = Math.round((Math.random() - 0.5) * 50);
    set.add(String(Math.max(0, correct + off)));
  }
  return shuffle([...set]);
}

function generateBinChoices(correct) {
  const n = parseInt(correct, 2);
  const set = new Set([correct]);
  while (set.size < 4) {
    const off = Math.round((Math.random() - 0.5) * 16);
    set.add(
      Math.max(0, n + off)
        .toString(2)
        .padStart(8, "0"),
    );
  }
  return shuffle([...set]);
}

function generateNegativeHexChoices(correct) {
  const n = parseInt(correct.replace("-0x", ""), 16);
  const set = new Set([correct]);
  while (set.size < 4) {
    const off = Math.round((Math.random() - 0.5) * 20);
    set.add(
      "-0x" +
        Math.max(1, n + off)
          .toString(16)
          .toUpperCase(),
    );
  }
  return shuffle([...set]);
}

function generateRGBChoices(r, g, b) {
  const correct = `R:${r}, G:${g}, B:${b}`;
  const set = new Set([correct]);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  while (set.size < 4) {
    const wr = clamp(r + Math.round((Math.random() - 0.5) * 100));
    const wg = clamp(g + Math.round((Math.random() - 0.5) * 100));
    const wb = clamp(b + Math.round((Math.random() - 0.5) * 100));
    set.add(`R:${wr}, G:${wg}, B:${wb}`);
  }
  return shuffle([...set]);
}

function generateCharChoices(correct, charSet) {
  const set = new Set([correct]);
  while (set.size < 4)
    set.add(charSet[Math.floor(Math.random() * charSet.length)]);
  return shuffle([...set]);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===================================================
// quiz-components グルーコード
// ===================================================

let quizQ = [];
let currentIndex = 0;
let correctCount = 0;
let mistakes = [];

// ── Start Screen ──────────────────────────────────────────

const QUIZ_CONFIG = {
  title: "16進法クイズ",
  subtitle: "Hexadecimal — binary, decimal, and color conversions",
  rangeMode: "multi",
  rangeLabel: "出題分野",
  ranges: [
    { id: "conversion_dec_hex", label: "10進⇔16進変換" },
    { id: "conversion_bin_hex", label: "2進⇔16進変換" },
    { id: "calc_hex_hex", label: "16進数四則演算" },
    { id: "calc_mixed_base", label: "複数基数混合" },
    { id: "calc_negative", label: "負の数計算" },
    { id: "color_code", label: "カラーコード" },
    { id: "ascii_binary", label: "ASCII 2進数" },
  ],
  countMode: "select",
  countDefault: 10,
  countOptions: [10, 20, 50, "all"],
  onStart(selectedRanges, count) {
    startQuiz(selectedRanges, count);
  },
};

// ── 画面切替 ──────────────────────────────────────────────

function showScreen(id) {
  ["start-screen", "quiz-screen", "result-screen"].forEach((s) => {
    document.getElementById(s).classList.add("hidden");
  });
  document.getElementById(id).classList.remove("hidden");
}

// ── クイズ開始 ────────────────────────────────────────────

function startQuiz(selectedRanges, count) {
  // 問題生成
  const total = count === "all" ? Infinity : parseInt(count);
  const perCategory = isFinite(total)
    ? Math.ceil(total / selectedRanges.length)
    : 30; // "all" 時は各カテゴリ30問生成してそのまま使う

  let pool = [];
  for (const rangeId of selectedRanges) {
    pool.push(...generateQuestions(rangeId, perCategory));
  }
  pool = shuffle(pool);
  if (isFinite(total)) pool = pool.slice(0, total);

  quizQ = pool;
  currentIndex = 0;
  correctCount = 0;
  mistakes = [];

  initProgress({
    total: quizQ.length,
    lastLabel: "結果を見る",
    resetConfirm: "最初に戻りますか？進捗はリセットされます。",
    onNext: advanceQuestion,
    onReset: resetToStart,
  });

  showScreen("quiz-screen");
  renderQuestion(0);
}

// ── 問題描画 ──────────────────────────────────────────────

function renderQuestion(i) {
  hideFeedback();
  updateProgress(i);

  const q = quizQ[i];

  showQuestion({
    text: q.text,
    category: q.category ?? null,
  });

  // カラーコードプレビュー
  const preview = document.getElementById("hex-color-preview");
  if (q.colorCode) {
    preview.style.backgroundColor = q.colorCode;
    preview.setAttribute("title", q.colorCode);
    preview.classList.remove("hidden");
  } else {
    preview.classList.add("hidden");
  }

  // ASCII表ボタン
  const asciiWrap = document.getElementById("hex-ascii-btn-wrap");
  asciiWrap.classList.toggle("hidden", !q.showASCII);

  // 選択肢
  showChoices({
    options: q.options,
    correct: q.correct,
    onAnswer({ isCorrect, selected }) {
      if (isCorrect) {
        correctCount++;
      } else {
        mistakes.push({
          questionText: q.text,
          category: q.category ?? null,
          userAnswer: selected,
          correctAnswer: q.correct,
        });
      }
      showFeedback({
        isCorrect,
        correctLabel: isCorrect ? null : q.correct,
        userLabel: isCorrect ? null : selected,
        extraHtml: q.explanation
          ? `<p style="margin-top:6px; font-size:0.85rem; font-weight:400;">${_esc(q.explanation)}</p>`
          : null,
      });
    },
  });
}

// ── 次へ / 結果 ───────────────────────────────────────────

function advanceQuestion(idx) {
  const next = idx + 1;
  if (next < quizQ.length) {
    currentIndex = next;
    renderQuestion(next);
    return;
  }
  showScreen("result-screen");
  showResult({
    correct: correctCount,
    total: quizQ.length,
    mistakes,
    onRetry: resetToStart,
    onRetryMistakes(ms) {
      // 間違えた問題IDでquizQを再構築することはできないため、
      // 同じカテゴリの問題を再生成する代わりに、
      // mistakesの問題を直接quizQとして再利用する。
      quizQ = ms
        .map((m) => quizQ.find((q) => q.text === m.questionText))
        .filter(Boolean);

      if (!quizQ.length) {
        resetToStart();
        return;
      }

      currentIndex = 0;
      correctCount = 0;
      mistakes = [];

      initProgress({
        total: quizQ.length,
        lastLabel: "結果を見る",
        resetConfirm: "最初に戻りますか？",
        onNext: advanceQuestion,
        onReset: resetToStart,
      });

      showScreen("quiz-screen");
      renderQuestion(0);
    },
  });
}

// ── リセット ──────────────────────────────────────────────

function resetToStart() {
  const el = document.getElementById("start-screen");
  el.innerHTML = "";
  showScreen("start-screen");
  initStartScreen(QUIZ_CONFIG);
}

// ===================================================
// ASCII表モーダル
// ===================================================

document.getElementById("hex-ascii-btn").addEventListener("click", openASCII);
document
  .getElementById("hex-ascii-close")
  .addEventListener("click", closeASCII);
document.getElementById("hex-ascii-modal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeASCII();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeASCII();
});

function openASCII() {
  const container = document.getElementById("hex-ascii-table-container");
  if (!container.innerHTML) container.innerHTML = buildASCIITableHTML();
  document.getElementById("hex-ascii-modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeASCII() {
  document.getElementById("hex-ascii-modal").classList.add("hidden");
  document.body.style.overflow = "";
}

function buildASCIITableHTML() {
  const controlChars = [
    "NUL",
    "SOH",
    "STX",
    "ETX",
    "EOT",
    "ENQ",
    "ACK",
    "BEL",
    "BS",
    "HT",
    "LF",
    "VT",
    "FF",
    "CR",
    "SO",
    "SI",
    "DLE",
    "DC1",
    "DC2",
    "DC3",
    "DC4",
    "NAK",
    "SYN",
    "ETB",
    "CAN",
    "EM",
    "SUB",
    "ESC",
    "FS",
    "GS",
    "RS",
    "US",
  ];

  let html = '<table class="hex-ascii-table">';
  html +=
    '<tr><th class="hex-ascii-corner">下位4ビット →<br>上位4ビット ↓</th>';
  for (let i = 0; i < 16; i++)
    html += `<th>${i.toString(16).toUpperCase()}</th>`;
  html += "</tr>";

  for (let row = 0; row < 8; row++) {
    html += `<tr><th>${row}</th>`;
    for (let col = 0; col < 16; col++) {
      const code = row * 16 + col;
      if (code < 32) {
        html += `<td class="hex-ascii-ctrl">${controlChars[code]}</td>`;
      } else if (code === 32) {
        html += `<td>SP</td>`;
      } else if (code === 127) {
        html += `<td class="hex-ascii-ctrl">DEL</td>`;
      } else {
        html += `<td>${String.fromCharCode(code)}</td>`;
      }
    }
    html += "</tr>";
  }
  html += "</table>";
  return html;
}

// ===================================================
// ユーティリティ
// ===================================================

function _esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ===================================================
// 初期化
// ===================================================

initStartScreen(QUIZ_CONFIG);
