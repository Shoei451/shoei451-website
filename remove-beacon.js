const fs = require("fs");
const path = require("path");

// sendBeaconスニペットのパターン（空白・改行の揺れに対応）
const PATTERN = /\n?[ \t]*<script>\s*\n\s*navigator\.sendBeacon\(\s*\n?\s*['"]\/api\/sw[^]*?navigator\.sendBeacon[^]*?<\/script>/;

// より単純・確実なパターン（行単位で削除）
const BEACON_MARKER = "/api/sw?path=";

function containsBeacon(html) {
  return html.includes(BEACON_MARKER);
}

/**
 * <script> ... navigator.sendBeacon('/api/sw'...) ... </script> ブロックを除去する。
 * インデントや改行の揺れに対応するため、開始 <script> から </script> を
 * 行単位でスキャンして特定する。
 */
function removeBeacon(html) {
  const lines = html.split("\n");
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // <script> 単体行（インラインscriptではない）を検出
    if (line.trim() === "<script>") {
      // このブロックがsendBeaconブロックかどうか先読みする
      let j = i + 1;
      let isBeaconBlock = false;
      const blockLines = [line];

      while (j < lines.length) {
        blockLines.push(lines[j]);
        if (lines[j].includes(BEACON_MARKER)) {
          isBeaconBlock = true;
        }
        if (lines[j].trim() === "</script>") {
          j++;
          break;
        }
        j++;
      }

      if (isBeaconBlock) {
        // ブロック全体をスキップ（前の空行も消す）
        if (result.length > 0 && result[result.length - 1].trim() === "") {
          result.pop();
        }
        i = j;
        continue;
      }
    }

    result.push(line);
    i++;
  }

  return result.join("\n");
}

const SKIP_DIRS = new Set(["netlify", "node_modules", ".git"]);

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(fullPath);
    } else if (entry.name.endsWith(".html")) {
      processFile(fullPath);
    }
  }
}

let removed = 0;
let skipped = 0;

function processFile(filePath) {
  const html = fs.readFileSync(filePath, "utf-8");

  if (!containsBeacon(html)) {
    return;
  }

  const updated = removeBeacon(html);

  if (updated === html) {
    console.log(`warn (pattern not matched): ${filePath}`);
    skipped++;
    return;
  }

  fs.writeFileSync(filePath, updated, "utf-8");
  console.log(`done: ${filePath}`);
  removed++;
}

walk(".");
console.log(`\n✅ sendBeacon削除完了 — ${removed}ファイル処理 / ${skipped}ファイルスキップ`);