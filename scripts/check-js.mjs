import { readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const IGNORE_DIRS = new Set([".git", "node_modules"]);

function collectJsFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        files.push(...collectJsFiles(join(dir, entry.name)));
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(join(dir, entry.name));
    }
  }

  return files;
}

const jsFiles = collectJsFiles(ROOT);
if (!jsFiles.length) {
  console.log("No JS files found.");
  process.exit(0);
}

let hasError = false;
for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "pipe",
    encoding: "utf8",
  });

  if (result.status !== 0) {
    hasError = true;
    process.stdout.write(result.stdout || "");
    process.stderr.write(result.stderr || "");
  }
}

if (hasError) {
  console.error("JavaScript syntax check failed.");
  process.exit(1);
}

console.log(`JavaScript syntax check passed for ${jsFiles.length} files.`);
