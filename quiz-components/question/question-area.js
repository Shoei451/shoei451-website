// ============================================================
// quiz-components/question/question-area.js
//
// 問題文・カテゴリチップ・補足テキスト・画像を表示するエンジン。
//
// 使い方:
//   1. HTML に <div id="qz-question-area"></div> を置く
//   2. showQuestion(questionData) を呼ぶたびに内容が書き換わる
//
// @typedef {Object} QuestionData
// @property {string}   text          - 問題文（メイン）
// @property {string}   [sub]         - 補足テキスト（例: 日本語訳）
// @property {string}   [category]    - カテゴリラベル（チップ表示）
// @property {string}   [imageUrl]    - 問題画像のURL（省略可）
// @property {string}   [imageAlt]    - 画像の alt テキスト
//
// ============================================================

(function () {

  const DEFAULT_ID = "qz-question-area";

  /**
   * 問題エリアに問題を表示する。
   * @param {QuestionData} data
   * @param {string} [mountId]
   */
  window.showQuestion = function (data, mountId = DEFAULT_ID) {
    const el = document.getElementById(mountId);
    if (!el) {
      console.error(`showQuestion: #${mountId} が見つかりません`);
      return;
    }

    const chip = data.category
      ? `<span class="qz-category-chip">${_esc(data.category)}</span>`
      : "";

    const img = data.imageUrl
      ? `<img class="qz-question-image" src="${_esc(data.imageUrl)}"
              alt="${_esc(data.imageAlt ?? "問題画像")}">`
      : "";

    const sub = data.sub
      ? `<p class="qz-question-sub">${_esc(data.sub)}</p>`
      : "";

    el.innerHTML = `
      <div class="qz-question">
        ${chip}
        ${img}
        <p class="qz-question-text">${_esc(data.text)}</p>
        ${sub}
      </div>
    `;
  };

  function _esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

})();