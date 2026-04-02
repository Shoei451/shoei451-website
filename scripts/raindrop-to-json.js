// scripts/raindrop-to-json.mjs
//
// Raindrop.io の全件CSVエクスポートを links/config/*.json に変換する。
//
// 使い方:
//   node scripts/raindrop-to-json.mjs <input.csv> [--out <dir>]
//
// オプション:
//   --out <dir>  出力先ディレクトリ（デフォルト: src/links/config）
//
// 出力:
//   folder名をケバブケースに変換したファイル名で JSON を生成する。
//   例: "The University of Tokyo" → the-university-of-tokyo.json

const { readFileSync, mkdirSync, writeFileSync } = require("fs");
const { resolve } = require("path");

const ROOT = resolve(__dirname, "..");

// ── 引数パース ─────────────────────────────────────────────
const args = process.argv.slice(2);
if (!args.length || args[0].startsWith("--")) {
  console.error(
    "Usage: node scripts/raindrop-to-json.mjs <input.csv> [--out <dir>]",
  );
  process.exit(1);
}

const csvPath = resolve(args[0]);
const outIndex = args.indexOf("--out");
const outDir =
  outIndex !== -1
    ? resolve(args[outIndex + 1])
    : resolve(ROOT, "src/links/config");

// ── CSVパース（RFC 4180準拠・最小実装） ────────────────────
function parseCsv(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const headers = parseRow(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseRow(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = values[idx] ?? "";
    });
    rows.push(row);
  }

  return rows;
}

function parseRow(line) {
  const cells = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      // quoted field
      let val = "";
      i++; // skip opening quote
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          val += '"';
          i += 2;
        } else if (line[i] === '"') {
          i++; // skip closing quote
          break;
        } else {
          val += line[i++];
        }
      }
      cells.push(val);
      if (line[i] === ",") i++;
    } else {
      // unquoted field
      const end = line.indexOf(",", i);
      if (end === -1) {
        cells.push(line.slice(i));
        break;
      } else {
        cells.push(line.slice(i, end));
        i = end + 1;
      }
    }
  }
  return cells;
}

// ── folder名 → ファイル名変換 ──────────────────────────────
function toSlug(folder) {
  return folder
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-");
}

// ── メイン ────────────────────────────────────────────────
const csv = readFileSync(csvPath, "utf-8");
const rows = parseCsv(csv);

// folder ごとにグループ化
const groups = new Map();
for (const row of rows) {
  const folder = row.folder?.trim() || "Unsorted";
  if (!groups.has(folder)) groups.set(folder, []);
  groups.get(folder).push(row);
}

mkdirSync(outDir, { recursive: true });

for (const [folder, items] of groups) {
  const slug = toSlug(folder);
  const outPath = resolve(outDir, `${slug}.json`);

  const sections = [
    {
      title: folder,
      items: items.map((row) => {
        const item = {
          title: row.title?.trim() || row.url,
          url: row.url?.trim(),
        };
        const desc = row.excerpt?.trim();
        if (desc) item.description = desc;
        return item;
      }),
    },
  ];

  const config = {
    title: folder,
    description: "",
    backLabel: "Links",
    sections,
  };

  writeFileSync(outPath, JSON.stringify(config, null, 2), "utf-8");
  console.log(`✓ ${slug}.json  (${items.length} items)`);
}

console.log(`\nDone. Output: ${outDir}`);
