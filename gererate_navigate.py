#!/usr/bin/env python3
"""
generate_navigate.py
デプロイ前に実行して navigate.html を自動生成するスクリプト。

使い方:
  python generate_navigate.py              # カレントディレクトリを走査
  python generate_navigate.py ./dist       # distフォルダを走査

GitHub Actions で自動化する場合は README 末尾を参照。
"""

import os
import sys
import re
from pathlib import Path
from datetime import datetime

# ========== 設定 ==========
# 除外するファイル・フォルダ（正規表現）
EXCLUDE_PATTERNS = [
    r"^navigate\.html$",       # 自分自身
    r"^\..*",                  # 隠しファイル・フォルダ
    r"^node_modules",
    r"^\.git",
    r".*\.py$",                # Pythonスクリプト
    r".*\.sh$",
]

# プレビュー対象の拡張子（ブラウザで開けるもの）
PREVIEWABLE = {".html", ".htm", ".css", ".js", ".json", ".txt", ".md", ".xml", ".svg"}

# 拡張子ごとのアイコン（emoji）
ICONS = {
    ".html": "🌐",
    ".htm":  "🌐",
    ".css":  "🎨",
    ".js":   "⚙️",
    ".json": "📋",
    ".md":   "📝",
    ".txt":  "📄",
    ".png":  "🖼️",
    ".jpg":  "🖼️",
    ".jpeg": "🖼️",
    ".gif":  "🖼️",
    ".svg":  "🖼️",
    ".pdf":  "📕",
    ".xml":  "📋",
}

# ==========================


def should_exclude(path_str: str) -> bool:
    parts = Path(path_str).parts
    for part in parts:
        for pattern in EXCLUDE_PATTERNS:
            if re.fullmatch(pattern, part):
                return True
    return False


def scan_files(root: Path) -> list[dict]:
    """ファイルを走査してメタデータのリストを返す"""
    results = []
    for file_path in sorted(root.rglob("*")):
        if not file_path.is_file():
            continue
        rel = file_path.relative_to(root)
        rel_str = rel.as_posix()
        if should_exclude(rel_str):
            continue
        ext = file_path.suffix.lower()
        results.append({
            "path": rel_str,
            "name": file_path.name,
            "ext":  ext,
            "icon": ICONS.get(ext, "📁"),
            "size": file_path.stat().st_size,
            "dir":  str(rel.parent) if str(rel.parent) != "." else "",
        })
    return results


def group_by_dir(files: list[dict]) -> dict:
    groups: dict[str, list] = {}
    for f in files:
        key = f["dir"] or "（ルート）"
        groups.setdefault(key, []).append(f)
    return groups


def format_size(size: int) -> str:
    if size < 1024:
        return f"{size} B"
    elif size < 1024 ** 2:
        return f"{size / 1024:.1f} KB"
    else:
        return f"{size / 1024**2:.1f} MB"


def build_cards(files: list[dict]) -> str:
    html = ""
    for f in files:
        ext_class = f["ext"].lstrip(".") or "other"
        size_str = format_size(f["size"])
        html += f"""
        <a href="{f['path']}" class="card ext-{ext_class}" target="_blank" rel="noopener">
          <span class="card-icon">{f['icon']}</span>
          <span class="card-name">{f['name']}</span>
          <span class="card-meta">{f['path']} · {size_str}</span>
        </a>"""
    return html


def build_html(root: Path, files: list[dict]) -> str:
    groups = group_by_dir(files)
    sections = ""
    for dir_name, dir_files in groups.items():
        cards = build_cards(dir_files)
        sections += f"""
    <section>
      <h2 class="dir-heading">
        <span class="dir-slash">/</span>{dir_name}
        <span class="dir-count">{len(dir_files)} files</span>
      </h2>
      <div class="card-grid">{cards}
      </div>
    </section>"""

    total = len(files)
    generated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    return f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site Navigator</title>
  <style>
    /* ── Base ── */
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}

    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap');

    :root {{
      --bg: #0d0d0d;
      --surface: #161616;
      --border: #2a2a2a;
      --accent: #00ff88;
      --accent2: #0088ff;
      --text: #e8e8e8;
      --muted: #666;
      --font-mono: 'Space Mono', monospace;
      --font-body: 'Noto Sans JP', sans-serif;
      --radius: 8px;
    }}

    body {{
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      min-height: 100vh;
      padding: 24px 16px 60px;
    }}

    /* ── Header ── */
    header {{
      max-width: 900px;
      margin: 0 auto 40px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 20px;
    }}
    .header-top {{
      display: flex;
      align-items: baseline;
      gap: 16px;
      flex-wrap: wrap;
    }}
    h1 {{
      font-family: var(--font-mono);
      font-size: clamp(1.4rem, 4vw, 2rem);
      color: var(--accent);
      letter-spacing: -0.03em;
    }}
    .header-meta {{
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--muted);
      margin-top: 8px;
    }}

    /* ── Search ── */
    .search-wrap {{
      max-width: 900px;
      margin: 0 auto 32px;
    }}
    #search {{
      width: 100%;
      padding: 12px 16px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--text);
      font-family: var(--font-mono);
      font-size: 0.9rem;
      outline: none;
      transition: border-color .2s;
    }}
    #search:focus {{ border-color: var(--accent); }}
    #search::placeholder {{ color: var(--muted); }}

    /* ── Sections ── */
    section {{
      max-width: 900px;
      margin: 0 auto 36px;
    }}
    .dir-heading {{
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--muted);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }}
    .dir-slash {{ color: var(--accent2); }}
    .dir-count {{
      margin-left: auto;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 0.7rem;
    }}

    /* ── Cards ── */
    .card-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
    }}
    .card {{
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 14px 14px 12px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      text-decoration: none;
      color: var(--text);
      transition: border-color .15s, transform .15s, background .15s;
      overflow: hidden;
    }}
    .card:hover {{
      border-color: var(--accent);
      background: #1c1c1c;
      transform: translateY(-2px);
    }}
    .card-icon {{ font-size: 1.4rem; line-height: 1; }}
    .card-name {{
      font-family: var(--font-mono);
      font-size: 0.85rem;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }}
    .card-meta {{
      font-size: 0.7rem;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }}

    /* ext color accents */
    .card.ext-html:hover, .card.ext-htm:hover {{ border-color: #ff6b6b; }}
    .card.ext-css:hover  {{ border-color: #4ecdc4; }}
    .card.ext-js:hover   {{ border-color: #ffd93d; }}
    .card.ext-md:hover   {{ border-color: #a8e6cf; }}

    /* ── No results ── */
    #no-results {{
      display: none;
      text-align: center;
      color: var(--muted);
      font-family: var(--font-mono);
      padding: 60px 0;
    }}

    /* ── Footer ── */
    footer {{
      text-align: center;
      font-size: 0.7rem;
      color: var(--muted);
      font-family: var(--font-mono);
      margin-top: 40px;
    }}
  </style>
</head>
<body>

<header>
  <div class="header-top">
    <h1>⚡ Site Navigator</h1>
  </div>
  <p class="header-meta">
    {total} files &nbsp;·&nbsp; generated {generated_at} &nbsp;·&nbsp; root: {root.resolve()}
  </p>
</header>

<div class="search-wrap">
  <input id="search" type="search" placeholder="🔍  ファイル名やパスで絞り込む..." autocomplete="off">
</div>

{sections}

<p id="no-results">No files found.</p>

<footer>navigate.html — auto-generated by generate_navigate.py</footer>

<script>
  const search = document.getElementById('search');
  const cards  = document.querySelectorAll('.card');
  const noRes  = document.getElementById('no-results');
  const sections = document.querySelectorAll('section');

  search.addEventListener('input', () => {{
    const q = search.value.trim().toLowerCase();
    let visible = 0;

    sections.forEach(sec => {{
      let secVisible = 0;
      sec.querySelectorAll('.card').forEach(card => {{
        const text = card.textContent.toLowerCase();
        const show = !q || text.includes(q);
        card.style.display = show ? '' : 'none';
        if (show) secVisible++;
      }});
      sec.style.display = secVisible > 0 ? '' : 'none';
      visible += secVisible;
    }});

    noRes.style.display = visible === 0 ? 'block' : 'none';
  }});
</script>

</body>
</html>
"""


def main():
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
    root = root.resolve()

    if not root.is_dir():
        print(f"エラー: '{root}' はディレクトリではありません")
        sys.exit(1)

    print(f"📁 走査中: {root}")
    files = scan_files(root)
    print(f"✅ {len(files)} ファイルを検出")

    html = build_html(root, files)
    out = root / "navigate.html"
    out.write_text(html, encoding="utf-8")
    print(f"🚀 生成完了: {out}")


if __name__ == "__main__":
    main()