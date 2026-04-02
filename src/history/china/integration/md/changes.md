# chinese-history-note 実装差分ガイド
> 作成: 2026-03-07

このファイルは、今回の3タスクの変更をどのファイルにどう適用するかをまとめたものです。
新規ファイル（`css/common.css`, `js/common/nav.js`）は別途提供済み。

---

## 1. 前漢・後漢・新の分離

### `js/common/dynasties.js`

`han` エントリ（`slug: 'han'`）を、`han_split_patch.js` の3エントリで**まるごと置換**する。

```
// 削除するブロック（startとendで特定）
{
  slug:      'han',
  ...
  end:       220,
  ...
}

// → 代わりに former_han / xin / later_han の3エントリを挿入
```

---

### `js/map.js`（または `logics/map.js`）

ノードを描画する箇所で `d.small` フラグを確認し、小ノードのスタイルを適用する。

**ノードのサイズ定数を2段階にする：**

```js
// 変更前（例）
const NODE_R = 36;  // 円の半径（px）

// 変更後
const NODE_R       = 36;   // 通常ノード
const NODE_R_SMALL = 22;   // small:true のノード（新朝など）
```

**描画時に分岐：**

```js
// renderCanvas() 内でノードを生成する箇所
const r = d.small ? NODE_R_SMALL : NODE_R;

// HTMLテンプレートに反映（例：インラインスタイルで幅・高さを設定している場合）
el.style.width  = `${r * 2}px`;
el.style.height = `${r * 2}px`;

// CSSクラスで制御する場合
if (d.small) el.classList.add('node--small');
```

**CSS側（`css/map.css`）に追加：**

```css
.node--small .node-circle {
  width: 44px;
  height: 44px;
  font-size: 0.72rem;
}
```

---

### `js/common/search.js`

変更不要。`DYNASTIES` 配列を動的に参照するため、`han` が3エントリに増えても自動対応する。

---

### `notes/` フォルダ

旧来の `notes/han.md` があれば、`notes/former_han.md` と `notes/later_han.md` に分割する。
（`xin`は受験重要度が低いため `notes/xin.md` は作成しなくてよい。）

---

## 2. CSS統合

### 新規ファイル

- `css/common.css` → 提供済み

### 各HTMLファイルへの追記

すべての HTML の `<head>` に以下を追加（既存の CSS より**前**に読み込む）：

```html
<link rel="stylesheet" href="css/common.css">
```

具体的には：

| ファイル | 追加位置 |
|---|---|
| `index.html` | `<link rel="stylesheet" href="css/index.css">` の前 |
| `map.html` | `<link rel="stylesheet" href="css/map.css">` の前 |
| `timeline.html` | `<link rel="stylesheet" href="css/timeline.css">` の前 |
| `dynasty.html` | `<link rel="stylesheet" href="css/dynasty.css">` の前 |
| `culture-quiz.html` | `<link rel="stylesheet" href="css/culture-quiz.css">` の前 |

---

### 各CSSファイルから削除するブロック

`common.css` に移動したため、各ファイルから以下を**削除**してよい。

#### `css/index.css`
- `:root { ... }` 全体（変数定義）
- `*, *::before, *::after { ... }` リセット
- `body { ... }` ベーススタイル
- `.site-header { ... }`
- `.header-logo { ... }`
- `.header-logo__dot { ... }`
- `.header-nav { ... }`
- `.header-nav a { ... }`
- `.header-nav a:hover { ... }`
- `.header-nav a.active { ... }`

#### `css/map.css`
- `:root { ... }` 全体（`--nav-bg`, `--nav-accent` など map固有変数は `common.css` に統一済み）
- `* { box-sizing: border-box; }` リセット
- `body { ... }` ベーススタイル（`body.lock-scroll` は残す）
- `.site-header { ... }`
- `.header-logo { ... }`
- `.header-logo__dot { ... }`
- `.header-nav { ... }`
- `.header-nav a { ... }`
- `.header-nav a:hover { ... }`
- `.header-nav a.active { ... }`

**map.css で残すもの：**
- `body.lock-scroll { overflow: hidden; }`
- `.header-search { ... }` 以降の map 固有スタイル
- キャンバス・サイドパネル・タイムラインオーバーレイ等すべてのページ固有スタイル

#### `css/timeline.css`
- `:root { ... }` 全体
- リセット・body・`.site-header` 系（上記と同様）

#### `css/dynasty.css`
- `:root { ... }` 全体（ただし `--unit-color` と `--unit-color-light`, `--nav-w` は残す）
- リセット・body・`.site-header` 系
- `.header-back { ... }` → `common.css` に移動済み

#### `css/culture-quiz.css`
- `:root { ... }` 全体（ただし `--color-accent-gold` などquiz固有変数は残す）
- リセット・body・`.site-header` 系
- `.header-back { ... }` → `common.css` に移動済み

---

## 3. nav.js

### 新規ファイル

- `js/common/nav.js` → 提供済み

### 各HTMLファイルへの変更

#### `index.html`
1. `<script src="js/common/nav.js"></script>` を他のscriptより**前**に追加
2. HTML内の `<header class="site-header">...</header>` ブロックを**削除**
3. 既存のいずれかのscript直後に以下を追加：

```html
<script>Nav.init('index');</script>
```

#### `map.html`
map.htmlは検索バーをヘッダー内に持つため、HTMLのヘッダーを残しつつ nav.js を読み込まない（既存ヘッダーがあれば `Nav.init()` はスキップする仕組みになっている）。

**対応方法：** `map.html` のヘッダーはそのままにする。`nav.js` を読み込んでも二重注入は起きないが、**読み込み不要**（map.htmlのヘッダーは現時点で完全実装済み）。

#### `timeline.html`
1. `<script src="js/common/nav.js"></script>` を他のscriptより前に追加
2. HTML内の `<header class="site-header">...</header>` ブロックを**削除**
3. script追加：

```html
<script>Nav.init('timeline');</script>
```

#### `dynasty.html`
- **変更不要**。独自ヘッダー（王朝名・タブ）を持つため nav.js を使わない。

#### `culture-quiz.html`
- **変更不要**。独自ヘッダー（← 戻る）を持つため nav.js を使わない。
- ただし、`css/common.css` の `.header-back` スタイルが適用されるので、
  `css/culture-quiz.css` の `.header-back` 定義は削除してよい。

---

## 4. まとめ：ファイル変更一覧

| ファイル | 変更種別 | 内容 |
|---|---|---|
| `css/common.css` | **新規** | 共通変数・リセット・ヘッダー系スタイル |
| `js/common/nav.js` | **新規** | 共通ナビ注入スクリプト |
| `js/common/dynasties.js` | **編集** | `han` → `former_han` / `xin` / `later_han` |
| `js/map.js` | **編集** | `small:true` フラグ対応（ノードサイズ分岐） |
| `index.html` | **編集** | `common.css` 追加・ヘッダー削除・`Nav.init` 追加 |
| `map.html` | **編集** | `common.css` 追加のみ（ヘッダーはそのまま） |
| `timeline.html` | **編集** | `common.css` 追加・ヘッダー削除・`Nav.init` 追加 |
| `dynasty.html` | **編集** | `common.css` 追加のみ |
| `culture-quiz.html` | **編集** | `common.css` 追加のみ |
| `css/index.css` | **編集** | 共通ブロック削除 |
| `css/map.css` | **編集** | 共通ブロック削除・`node--small` 追加 |
| `css/timeline.css` | **編集** | 共通ブロック削除 |
| `css/dynasty.css` | **編集** | 共通ブロック削除（unit-color系は残す） |
| `css/culture-quiz.css` | **編集** | 共通ブロック削除 |