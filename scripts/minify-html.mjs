import { minify } from "html-minifier-terser";
import fs from "fs";
import path from "path";

const ROOT = "dist";

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    return d.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(ROOT);

for (const file of files) {
  if (!file.endsWith(".html")) continue;

  const input = fs.readFileSync(file, "utf-8");

  const output = await minify(input, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    minifyCSS: true,
    minifyJS: true,
  });

  fs.writeFileSync(file, output);
  console.log("minified:", file);
}
