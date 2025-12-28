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
