(() => {
  const DATA_SOURCES = {
    history: "/history/list.json",
    seikei: "/seikei/list.json",
    geography: "/geography/list.json",
    miscellaneous: "/miscellaneous/list.json",
  };

  function isAbsolutePath(value) {
    return (
      !value ||
      value.startsWith("/") ||
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("#") ||
      value.startsWith("mailto:")
    );
  }

  function normalizeLink(link, slug) {
    if (isAbsolutePath(link)) return link;
    if (link.startsWith(`${slug}/`)) return `/${link}`;
    return `/${slug}/${link}`;
  }

  function normalizeIcon(icon) {
    if (!icon) return "";
    if (/^bi-[\w-]+$/.test(icon)) return icon;
    if (isAbsolutePath(icon)) return icon;
    return `/${icon.replace(/^(\.\.\/)+/, "")}`;
  }

  function extractItems(config, slug) {
    return (config.sections || []).flatMap((section) =>
      (section.items || []).map((item) => ({
        title: item.title,
        description: item.description || "",
        icon: normalizeIcon(item.icon || ""),
        link: normalizeLink(item.link || "#", slug),
        target: item.target,
      })),
    );
  }

  async function fetchSection(slug, path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: HTTP ${response.status}`);
    }

    const config = await response.json();
    return extractItems(config, slug);
  }

  async function loadCardsData() {
    const entries = await Promise.all(
      Object.entries(DATA_SOURCES).map(async ([slug, path]) => [
        slug,
        await fetchSection(slug, path),
      ]),
    );

    return Object.fromEntries(entries);
  }

  window.CARDS_DATA_READY = loadCardsData()
    .then((data) => {
      window.CARDS_DATA = data;
      document.dispatchEvent(
        new CustomEvent("cards-data-ready", { detail: data }),
      );
      if (typeof window.tryRenderAll === "function") {
        window.tryRenderAll();
      }
      return data;
    })
    .catch((error) => {
      console.error("Failed to build CARDS_DATA from list.json files.", error);
      document.dispatchEvent(
        new CustomEvent("cards-data-error", { detail: error }),
      );
      throw error;
    });
})();
