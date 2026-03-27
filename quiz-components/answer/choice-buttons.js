// ============================================================
// quiz-components/answer/choice-buttons.js
//
// 4択ボタンの描画・正誤判定・コールバック注入エンジン。
// 正解発表後の追加表示など、クイズ固有の処理はコールバックで外から渡す。
//
// 使い方:
//   1. HTML に <div id="qz-choices"></div> を置く
//   2. showChoices(choiceConfig) を呼ぶたびに選択肢が再描画される
//
// @typedef {Object} ChoiceConfig
// @property {string[]}  options        - 選択肢テキストの配列（2〜6個）
// @property {string}    correct        - 正解テキスト（options の中の1つ）
// @property {string}    [mountId]      - マウント先 id（デフォルト: "qz-choices"）
// @property {Function}  [onAnswer]     - 回答後コールバック
//                                        ({ selected, correct, isCorrect, buttons }) => void
//                                        ページ固有の追加表示はここで行う
//
// ============================================================

(function () {
  const DEFAULT_ID = "qz-choices";

  /**
   * 選択肢ボタンを描画する。
   * @param {ChoiceConfig} config
   */
  window.showChoices = function (config) {
    const mountId = config.mountId ?? DEFAULT_ID;
    const el = document.getElementById(mountId);
    if (!el) {
      console.error(`showChoices: #${mountId} が見つかりません`);
      return;
    }

    el.innerHTML = config.options
      .map(
        (opt, i) => `
      <button class="qz-choice" data-index="${i}" type="button">
        <span class="qz-choice__letter">${_letter(i)}</span>
        <span class="qz-choice__text">${_esc(opt)}</span>
      </button>
    `,
      )
      .join("");

    el.querySelectorAll(".qz-choice").forEach((btn) => {
      btn.addEventListener("click", () => _handleAnswer(btn, config, el));
    });
  };

  // ── 回答処理 ──────────────────────────────────────────────

  function _handleAnswer(clicked, config, container) {
    // 全ボタンを即座に無効化
    const buttons = container.querySelectorAll(".qz-choice");
    buttons.forEach((b) => {
      b.disabled = true;
      b.classList.add("is-locked");
    });

    const selected = clicked.querySelector(".qz-choice__text").textContent;
    const isCorrect = selected === config.correct;

    // 正解・不正解の色付け
    buttons.forEach((b) => {
      const text = b.querySelector(".qz-choice__text").textContent;
      if (text === config.correct) {
        b.classList.add("is-correct");
      } else if (b === clicked && !isCorrect) {
        b.classList.add("is-incorrect");
      }
    });

    // 「次へ」ボタンを有効化
    window.enableNextButton?.();

    // ページ固有のコールバック（追加表示など）
    if (config.onAnswer) {
      config.onAnswer({
        selected,
        correct: config.correct,
        isCorrect,
        buttons: [...buttons],
      });
    }
  }

  // ── ユーティリティ ─────────────────────────────────────────

  function _letter(i) {
    return ["A", "B", "C", "D", "E", "F"][i] ?? String(i + 1);
  }

  function _esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
