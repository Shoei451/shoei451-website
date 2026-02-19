function generateCards(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !Array.isArray(items)) {
        return;
    }

    items.forEach((item) => {
        const cardElement = document.createElement("a");
        cardElement.href = item.link;
        cardElement.className = "card";

        const isExternal = item.link.startsWith("http://") || item.link.startsWith("https://");
        if (isExternal || item.target === "_blank") {
            cardElement.target = "_blank";
            cardElement.rel = "noopener noreferrer";
        }

        let iconHTML;
        if (
            item.iconType === "image" ||
            item.icon.includes(".png") ||
            item.icon.includes(".jpg") ||
            item.icon.includes(".svg") ||
            item.icon.includes(".gif")
        ) {
            iconHTML = `<img src="${item.icon}" alt="${item.title}" class="card-icon-img">`;
        } else {
            iconHTML = `<div class="card-icon">${item.icon}</div>`;
        }

        const externalIcon = (isExternal || item.target === "_blank")
            ? `<svg class="external-link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>`
            : "";

        cardElement.innerHTML = `
    ${iconHTML}
    <h3>${item.title}${externalIcon}</h3>
    <p class="subtitle">${item.titleEN || ""}</p>
    <p>${item.description}</p>
`;
        container.appendChild(cardElement);
    });
}

window.generateCards = generateCards;
