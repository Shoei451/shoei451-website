
    const display = document.getElementById("display");
    const message = document.getElementById("message");
    const loadingBar = document.getElementById("loading-bar");
    const warningSound = document.getElementById("warning-sound");
    const succeedSound = document.getElementById("succeed-sound");
    const clickSound = document.getElementById("click-sound");

    const swContainer = document.getElementById("specialWarning");
    const swImg = document.getElementById("sw-img");
    const swTitle = document.getElementById("sw-title");
    const swSub = document.getElementById("sw-sub");

    const lifeBlocks = document.querySelectorAll(".life-block");
    const timerDisplay = document.getElementById("timer-display");

    let inputCode = "";
    let lives = 5;
    let wrongCount = 0;

    // タイマー変数
    let timerInterval;
    let timeLeft = 300; // 5分

    // パスワードマップ
    const passwordMap = {
      "0760": "success.html",
      "1420": "success.html",
      "1831": "success.html"
    };

    // 野獣モード
    let beastMode = false;
    let zeroCount = 0;

    const specialCodes = {
      "0810": { audio: "resources/hikakin.mp3", img: "resources/cozy.jpg", title: "!!! SPECIAL ALERT !!!", sub: "なにを四天王" },
      "114514": { audio: "resources/YAJU&U_8bit_cut.mp3", img: "resources/cozy.jpg", title: "!!! SPECIAL ALERT !!!", sub: "す こ こ い" }
    };

    // === 残機表示更新 ===
    function updateLives() {
      lifeBlocks.forEach((block, index) => {
        if (index >= lives) {
          block.classList.add("lost");
        } else {
          block.classList.remove("lost");
        }
      });
    }

    // === タイマー更新 ===
    function updateTimer() {
      let m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
      let s = String(timeLeft % 60).padStart(2, '0');
      timerDisplay.textContent = `${m}:${s}`;
      
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        window.location.href = "fail.html";
      }
    }

    // === タイマーボタン ===
    document.getElementById("start-timer").addEventListener("click", () => {
      clearInterval(timerInterval);
      updateTimer();
      timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
      }, 1000);
    });

    document.getElementById("stop-timer").addEventListener("click", () => {
      clearInterval(timerInterval);
    });

    document.getElementById("restart-timer").addEventListener("click", () => {
      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
      }, 1000);
    });

    document.getElementById("reset-timer").addEventListener("click", () => {
      clearInterval(timerInterval);
      timeLeft = 300;
      updateTimer();
    });

    // === リセット処理 ===
    function resetAll() {
      inputCode = "";
      display.textContent = "";
      message.textContent = "";
      message.className = "";
      document.body.classList.remove("warning-bg");
      loadingBar.style.width = "0";
    }

    // === ステータス表示 ===
    function showStatus() {
      if (inputCode.length === 4) {
        if (inputCode === "1145") message.textContent = "まさか…？";
        else message.textContent = "READY";
        message.className = "";
      } else if (inputCode.length === 6 && inputCode === "114514") {
        message.textContent = "READY";
        message.className = "";
      } else message.textContent = "";
    }

    // === 特別コード表示 ===
    function triggerSpecial(sc) {
      swImg.src = sc.img;
      swTitle.textContent = sc.title;
      swSub.textContent = sc.sub;
      swContainer.style.display = "flex";
      new Audio(sc.audio).play();
      setTimeout(() => {
        swContainer.style.display = "none";
        resetAll();
      }, 6000);
    }

    // === パスワードチェック ===
    function checkPassword() {
      // 野獣モードトリガー
      if (inputCode === "0000") {
        zeroCount++;
        if (zeroCount >= 3) {
          beastMode = true;
          zeroCount = 0;
          alert("野獣モードが解放された…！");
        }
        resetAll();
        return;
      } else {
        zeroCount = 0;
      }

      // 特別コード (野獣モード限定)
      if (beastMode && specialCodes[inputCode]) {
        triggerSpecial(specialCodes[inputCode]);
        return;
      }

      // 通常コード
      if (passwordMap[inputCode]) {
        message.textContent = "ACCESS GRANTED\nLOADING...";
        message.className = "granted";
        loadingBar.style.width = "0";
        loadingBar.offsetWidth;
        loadingBar.style.width = "100%";
        succeedSound.currentTime = 0;
        succeedSound.play();
        setTimeout(() => {
          window.location.href = passwordMap[inputCode];
        }, 3000);
      } else {
        // 不正解処理
        wrongCount++;
        lives--;
        updateLives();

        if (lives <= 0) {
          // 残機0 → ゲームオーバー
          message.textContent = "GAME OVER";
          message.className = "denied";
          document.body.classList.add("warning-bg");
          warningSound.currentTime = 0;
          warningSound.play();
          setTimeout(() => {
            window.location.href = "fail.html";
          }, 2000);
        } else {
          // 残機あり → 通常エラー
          message.textContent = `ACCESS DENIED\n(${wrongCount}/5)`;
          message.className = "denied";
          document.body.classList.add("warning-bg");
          warningSound.currentTime = 0;
          warningSound.play();
          setTimeout(() => {
            resetAll();
          }, 3000);
        }
      }
    }

    // === ボタンクリック ===
    document.querySelectorAll(".btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const val = btn.textContent;

        if (!isNaN(val) || val === "←" || val === "C") {
          clickSound.currentTime = 0;
          clickSound.play();
        }

        if (!isNaN(val)) {
          if (inputCode.length < 4 || (inputCode.startsWith("1145") && inputCode.length < 6)) {
            inputCode += val;
            display.textContent = inputCode;
            showStatus();
          }
        } else if (val === "←") {
          inputCode = inputCode.slice(0, -1);
          display.textContent = inputCode;
          showStatus();
        } else if (val === "C") {
          resetAll();
        } else if (val === "ENTER") {
          if (inputCode.length === 4 || inputCode.length === 6) {
            checkPassword();
          }
        }
      });
    });

    // === キーボード対応 ===
    document.addEventListener("keydown", e => {
      if (e.key >= "0" && e.key <= "9") {
        if (inputCode.length < 4 || (inputCode.startsWith("1145") && inputCode.length < 6)) {
          inputCode += e.key;
          display.textContent = inputCode;
          showStatus();
          clickSound.currentTime = 0;
          clickSound.play();
        }
      } else if (e.key === "Backspace") {
        inputCode = inputCode.slice(0, -1);
        display.textContent = inputCode;
        showStatus();
        clickSound.currentTime = 0;
        clickSound.play();
      } else if (e.key.toLowerCase() === "c") {
        resetAll();
        clickSound.currentTime = 0;
        clickSound.play();
      } else if (e.key === "Enter") {
        if (inputCode.length === 4 || inputCode.length === 6) {
          checkPassword();
        }
      }
    });

    // 初期化
    updateLives();
    updateTimer();