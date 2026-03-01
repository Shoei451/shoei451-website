function animateCardsOnScroll() {
    const cards = document.querySelectorAll(".card");
    if (!cards.length) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animate");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach((card) => observer.observe(card));
}

function initCardsPage(sectionConfigs) {
    document.addEventListener("DOMContentLoaded", () => {
        sectionConfigs.forEach((config) => {
            const items = window[config.itemsVar];
            if (Array.isArray(items)) {
                generateCards(items, config.containerId);
            }
        });

        animateCardsOnScroll();
    });
}

window.initCardsPage = initCardsPage;
window.animateCardsOnScroll = animateCardsOnScroll;
