import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, extname, join, resolve, relative } from "node:path";

const ROOT = process.cwd();
const IGNORE_DIRS = new Set([".git", "node_modules", "templates"]);
const ATTR_PATTERN = /(href|src)\s*=\s*["']([^"']+)["']/gi;
const KNOWN_IGNORES = new Set([
    "history/china/timeline.html::chinese-history-quiz.html"
]);

function collectHtmlFiles(dir) {
    const entries = readdirSync(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!IGNORE_DIRS.has(entry.name)) {
                files.push(...collectHtmlFiles(fullPath));
            }
            continue;
        }

        if (entry.isFile() && entry.name.endsWith(".html")) {
            files.push(fullPath);
        }
    }

    return files;
}

function isSkippableLink(link) {
    return (
        !link ||
        link.includes("${") ||
        link.startsWith("#") ||
        link.startsWith("http://") ||
        link.startsWith("https://") ||
        link.startsWith("mailto:") ||
        link.startsWith("javascript:") ||
        link.startsWith("data:")
    );
}

function existsAsPath(targetPath) {
    if (!existsSync(targetPath)) {
        return false;
    }
    return true;
}

function resolveCandidates(filePath, rawLink) {
    const cleanLink = rawLink.split("#")[0].split("?")[0];
    const basePath = cleanLink.startsWith("/")
        ? resolve(ROOT, `.${cleanLink}`)
        : resolve(dirname(filePath), cleanLink);
    const candidates = [basePath];

    if (!extname(basePath)) {
        candidates.push(`${basePath}.html`);
        candidates.push(join(basePath, "index.html"));
    }

    return candidates;
}

const htmlFiles = collectHtmlFiles(ROOT);
const errors = [];

for (const htmlFile of htmlFiles) {
    const content = readFileSync(htmlFile, "utf8")
        .replace(/<!--[\s\S]*?-->/g, "");
    const matches = [...content.matchAll(ATTR_PATTERN)];

    for (const match of matches) {
        const link = match[2].trim();
        if (isSkippableLink(link)) {
            continue;
        }

        const relativeFile = relative(ROOT, htmlFile).replaceAll("\\", "/");
        if (KNOWN_IGNORES.has(`${relativeFile}::${link}`)) {
            continue;
        }

        const candidates = resolveCandidates(htmlFile, link);
        const found = candidates.some((candidate) => existsAsPath(candidate));

        if (!found) {
            errors.push(`${relativeFile} -> ${link}`);
        }
    }
}

if (errors.length) {
    console.error("Broken local links found:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
}

console.log(`Local link check passed for ${htmlFiles.length} HTML files.`);
