// ===== Countdown Logic =====
const examKyotsu = new Date(2027, 0, 16, 0, 0, 0);
const examTodai = new Date(2027, 1, 25, 0, 0, 0);
const startDate = new Date(2024, 0, 7, 0, 0, 0);

const quotes = [
    "努力は裏切らない。ただし、サボれば確実に裏切る。",
    "今日の1時間が、未来の1点を作る。",
    "できるかできないかじゃない。やるかやらないかだ。",
    "自分を信じる。それが一番の武器になる。",
    "焦らず、でも止まらず。"
];

function formatCountdown(targetDate) {
    const now = new Date();
    const diff = targetDate - now;
    
    if (diff <= 0) return "当日です！";
    
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${days}日 ${hours}時間 ${minutes}分 ${seconds}秒`;
}

function updateCountdowns() {
    const now = new Date();
    
    // Update countdowns
    document.getElementById("count-kyotsu").textContent = formatCountdown(examKyotsu);
    document.getElementById("count-todai").textContent = formatCountdown(examTodai);
    
    // Update today info
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const day = weekdays[now.getDay()];
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    
    document.getElementById("today").textContent = 
        `今日は ${y}年${m}月${d}日(${day}) ${hh}:${mm}:${ss}`;
    
    // Update progress bar
    const total = examKyotsu - startDate;
    const elapsed = now - startDate;
    const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
    document.getElementById("progress-bar").style.width = percent + "%";
    document.getElementById("progress-text").textContent = `${percent.toFixed(2)}%`;
}

function updateQuote() {
    const random = Math.floor(Math.random() * quotes.length);
    document.getElementById("quote").textContent = "『" + quotes[random] + "』";
}

// Initialize countdown
setInterval(updateCountdowns, 1000);
updateCountdowns();
updateQuote();
setInterval(updateQuote, 10000);

// ===== Countdown Toggle =====
const countdownCard = document.querySelector('.countdown-card');
