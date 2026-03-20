const fs = require("fs");
const path = require("path");

const SNIPPET = `  <script>
    navigator.sendBeacon(
      '/api/track?path=' + encodeURIComponent(location.pathname) +
      '&ref=' + encodeURIComponent(document.referrer)
    );
  </script>`;

const TARGET = "</body>";

function processFile(filePath) {
  let html = fs.readFileSync(filePath, "utf-8");

  if (html.includes("api/track")) {
    console.log(`skip (already has beacon): ${filePath}`);
    return;
  }

  if (!html.includes(TARGET)) {
    console.log(`skip (no </body>): ${filePath}`);
    return;
  }

  html = html.replace(TARGET, `${SNIPPET}\n${TARGET}`);
  fs.writeFileSync(filePath, html, "utf-8");
  console.log(`done: ${filePath}`);
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["netlify", "node_modules", ".git"].includes(entry.name)) walk(fullPath);
    } else if (entry.name.endsWith(".html")) {
      processFile(fullPath);
    }
  }
}

walk(".");
console.log("✅ sendBeacon挿入完了");