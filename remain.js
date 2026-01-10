//const toggleBtn = document.getElementById('countdown-toggle-btn');

// Load saved preference
const countdownVisible = localStorage.getItem('countdown-visible') !== 'false';
if (!countdownVisible) {
    countdownCard.classList.add('hidden-countdown');
    toggleBtn.textContent = '⏳';
    toggleBtn.style.opacity = '0.6';
}

toggleBtn.addEventListener('click', () => {
    const isHidden = countdownCard.classList.toggle('hidden-countdown');
    
    if (isHidden) {
        toggleBtn.textContent = '⏳';
        toggleBtn.style.opacity = '0.6';
        localStorage.setItem('countdown-visible', 'false');
    } else {
        toggleBtn.textContent = '✕';
        toggleBtn.style.opacity = '1';
        localStorage.setItem('countdown-visible', 'true');
    }
});

// Set initial button state
if (countdownVisible) {
    toggleBtn.textContent = '✕';
    toggleBtn.style.opacity = '1';
}