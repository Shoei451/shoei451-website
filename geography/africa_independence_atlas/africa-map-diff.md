# africa-independence-map.html 差分

3つの変更。対象行は現行ファイルの行番号基準。

---

## 1. ズーム・パン（D3 zoom）

### CSS — `#map` と `.country` のストローク幅調整を追加

**変更箇所：** `#map { ... }` と `#map .country { ... }` のブロック（行 31–36）

```diff
- #map { width:100%; height:100%; display:block; }
- #map .country { stroke:rgba(255,255,255,.7); stroke-width:.5; cursor:pointer; transition:filter .15s, stroke-width .12s, stroke .12s; }
- #map .country:hover { stroke:#fff; stroke-width:1.6; filter:brightness(1.13) drop-shadow(0 2px 6px rgba(0,0,0,.25)); }
- #map .country.selected { stroke:#111; stroke-width:2.2; }
+ #map { width:100%; height:100%; display:block; cursor:grab; }
+ #map:active { cursor:grabbing; }
+ #map .country { stroke:rgba(255,255,255,.7); stroke-width:.5; cursor:pointer; transition:filter .15s; }
+ #map .country:hover { stroke:#fff; stroke-width:1.6; filter:brightness(1.13) drop-shadow(0 2px 6px rgba(0,0,0,.25)); }
+ #map .country.selected { stroke:#111; stroke-width:2.2; }
```

### CSS — ズームコントロールボタンを追加

**変更箇所：** `.map-tooltip.visible { ... }` の直後（行 83 の後）に挿入

```diff
+ .zoom-controls { position:absolute; top:14px; right:14px; display:flex; flex-direction:column; gap:4px; z-index:10; }
+ .zoom-btn { width:32px; height:32px; background:rgba(255,255,255,.93); backdrop-filter:blur(6px);
+   border:1px solid var(--border); border-radius:var(--r); cursor:pointer; display:flex; align-items:center;
+   justify-content:center; color:var(--text); font-size:1rem; transition:background .15s; line-height:1; }
+ .zoom-btn:hover { background:var(--surface); }
+ .zoom-btn:active { background:var(--bg); }
```

### HTML — ズームコントロールボタンを追加

**変更箇所：** `<div class="map-tooltip" ...>` の直後（行 107 の後）に挿入

```diff
+ <div class="zoom-controls">
+   <button class="zoom-btn" onclick="zoomBy(1.5)" title="ズームイン">
+     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
+   </button>
+   <button class="zoom-btn" onclick="zoomBy(1/1.5)" title="ズームアウト">
+     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
+   </button>
+   <button class="zoom-btn" onclick="resetZoom()" title="リセット" style="font-family:var(--mono);font-size:.65rem;font-weight:600;color:var(--sub);">1:1</button>
+ </div>
```

### JS — `renderMap` 関数を置き換え、zoom関数を追加

**変更箇所：** `function renderMap(topoData) { ... }` ブロック全体（行 192–228）と、その直後のグローバル変数宣言部に以下を置き換え・追記

```diff
- let currentMode = 'year', selectedIso = null;
+ let currentMode = 'year', selectedIso = null;
+ let zoomBehavior = null, svgSelection = null, mapGroup = null;

- function renderMap(topoData) {
-   const container = document.querySelector('.map-area');
-   const W = container.clientWidth, H = container.clientHeight;
-   const svgEl = document.getElementById('map');
-   svgEl.setAttribute('viewBox',`0 0 ${W} ${H}`);
-   svgEl.setAttribute('width',W); svgEl.setAttribute('height',H);
-   while(svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);
-
-   const projection = d3.geoMercator().center([20,2]).scale(Math.min(W,H)*1.18).translate([W*.46,H*.5]);
-   const pathGen = d3.geoPath().projection(projection);
-   const features = topojson.feature(topoData, topoData.objects.countries).features;
-   const tooltip = document.getElementById('tooltip');
-
-   features.forEach(feat => {
-     const iso = String(feat.id).padStart(3,'0');
-     const isAfrica = AFRICA_ISOS.has(iso);
-     const dStr = pathGen(feat); if(!dStr) return;
-     const path = document.createElementNS('http://www.w3.org/2000/svg','path');
-     path.setAttribute('d', dStr);
-     path.setAttribute('class', isAfrica ? 'country' : 'country non-africa');
-     path.dataset.iso = iso;
-     if(isAfrica) {
-       path.style.fill = getColor(iso, currentMode);
-       const d = africaFull[iso];
-       path.addEventListener('mouseenter', e => { tooltip.textContent = d?d.name:iso; tooltip.classList.add('visible'); });
-       path.addEventListener('mousemove', e => {
-         const r = container.getBoundingClientRect();
-         tooltip.style.left = (e.clientX-r.left+14)+'px';
-         tooltip.style.top  = (e.clientY-r.top-32)+'px';
-       });
-       path.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
-       path.addEventListener('click', () => selectCountry(iso, path));
-     }
-     svgEl.appendChild(path);
-   });
-   updateLegend();
- }
+ function renderMap(topoData) {
+   const container = document.querySelector('.map-area');
+   const W = container.clientWidth, H = container.clientHeight;
+   const svgEl = document.getElementById('map');
+   svgEl.setAttribute('viewBox',`0 0 ${W} ${H}`);
+   svgEl.setAttribute('width',W); svgEl.setAttribute('height',H);
+   while(svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);
+
+   // ズーム対象の<g>グループ
+   const g = document.createElementNS('http://www.w3.org/2000/svg','g');
+   g.id = 'map-g';
+   svgEl.appendChild(g);
+   mapGroup = g;
+
+   const projection = d3.geoMercator().center([20,2]).scale(Math.min(W,H)*1.18).translate([W*.46,H*.5]);
+   const pathGen = d3.geoPath().projection(projection);
+   const features = topojson.feature(topoData, topoData.objects.countries).features;
+   const tooltip = document.getElementById('tooltip');
+
+   features.forEach(feat => {
+     const iso = String(feat.id).padStart(3,'0');
+     const isAfrica = AFRICA_ISOS.has(iso);
+     const dStr = pathGen(feat); if(!dStr) return;
+     const path = document.createElementNS('http://www.w3.org/2000/svg','path');
+     path.setAttribute('d', dStr);
+     path.setAttribute('class', isAfrica ? 'country' : 'country non-africa');
+     path.dataset.iso = iso;
+     if(isAfrica) {
+       path.style.fill = getColor(iso, currentMode);
+       const d = africaFull[iso];
+       path.addEventListener('mouseenter', e => { tooltip.textContent = d?d.name:iso; tooltip.classList.add('visible'); });
+       path.addEventListener('mousemove', e => {
+         const r = container.getBoundingClientRect();
+         tooltip.style.left = (e.clientX-r.left+14)+'px';
+         tooltip.style.top  = (e.clientY-r.top-32)+'px';
+       });
+       path.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
+       path.addEventListener('click', () => selectCountry(iso, path));
+     }
+     g.appendChild(path);  // svgEl → g に変更
+   });
+
+   // D3 zoom のセットアップ
+   svgSelection = d3.select(svgEl);
+   zoomBehavior = d3.zoom()
+     .scaleExtent([0.5, 12])
+     .on('zoom', e => {
+       d3.select('#map-g').attr('transform', e.transform);
+       // ズームレベルに応じてストローク幅を逆スケール（常に細く見える）
+       const k = e.transform.k;
+       document.querySelectorAll('#map .country').forEach(el => {
+         el.style.strokeWidth = (el.classList.contains('selected') ? 2.2 : 0.5) / k;
+       });
+     });
+   svgSelection.call(zoomBehavior);
+   // ダブルクリックズームは無効化（クリックと競合するため）
+   svgSelection.on('dblclick.zoom', null);
+
+   updateLegend();
+ }
+
+ function zoomBy(factor) {
+   if(!svgSelection || !zoomBehavior) return;
+   svgSelection.transition().duration(300).call(zoomBehavior.scaleBy, factor);
+ }
+
+ function resetZoom() {
+   if(!svgSelection || !zoomBehavior) return;
+   svgSelection.transition().duration(400).call(zoomBehavior.transform, d3.zoomIdentity);
+ }
```

### JS — `recolorMap` のセレクタ変更

**変更箇所：** `function recolorMap()` 内（行 231）— `#map .country` は `<g>` 内に移ったが変更不要。ただしリサイズ時にzoomをリセットする処理を追加

**変更箇所：** ローダー末尾の `resize` ハンドラ（行 308）

```diff
- window.addEventListener('resize',()=>renderMap(data));
+ window.addEventListener('resize', () => { renderMap(data); });
+ // ※ renderMap内でzoomBehaviorが再生成されるため、リサイズ後はzoomがリセットされる。
+ // 維持したい場合は transform を保存・復元するが、モバイルでは初期化の方が UX が良い。
```

---

## 2. レスポンシブ対応

### CSS — モバイル用メディアクエリを拡充

**変更箇所：** `@media (max-width:700px) { ... }` ブロック全体（行 84–88）を置き換え

```diff
- @media (max-width:700px) {
-   :root { --panel-w:100vw; }
-   .side-panel { position:absolute; right:0; top:0; bottom:0; z-index:15; box-shadow:-4px 0 20px rgba(0,0,0,.12); }
-   .map-hint { display:none; }
- }
+ /* ── タブレット（〜900px） */
+ @media (max-width:900px) {
+   :root { --panel-w:300px; }
+   .nav-sub { display:none; }
+ }
+ /* ── モバイル（〜600px） */
+ @media (max-width:600px) {
+   :root { --panel-w:100vw; --nav-h:48px; }
+   .nav-title { font-size:.85rem; }
+   .mode-btn  { padding:4px 10px; font-size:.73rem; }
+   .side-panel { position:absolute; right:0; top:0; bottom:0; z-index:15;
+     box-shadow:-4px 0 20px rgba(0,0,0,.14); }
+   .map-hint { display:none; }
+   .zoom-controls { top:10px; right:10px; }
+   .legend { font-size:.7rem; min-width:140px; padding:9px 11px; }
+ }
+ /* ── 極小画面（〜380px） */
+ @media (max-width:380px) {
+   .mode-toggle { gap:1px; }
+   .mode-btn { padding:4px 8px; }
+ }
```

---

## 3. 国旗画像（flagcdn.com）

### JS — `FLAG_CODE` マッピングを追加

**変更箇所：** `const AFRICA_ISOS = ...` の直後（行 188 付近）に挿入

```diff
+ // ISO numeric → ISO alpha-2（flagcdn.com 用）
+ const FLAG_CODE = {
+   '012':'dz','024':'ao','072':'bw','108':'bi','120':'cm','132':'cv',
+   '140':'cf','148':'td','174':'km','178':'cg','180':'cd','204':'bj',
+   '226':'gq','231':'et','232':'er','262':'dj','266':'ga','270':'gm',
+   '288':'gh','324':'gn','384':'ci','404':'ke','426':'ls','430':'lr',
+   '434':'ly','450':'mg','454':'mw','466':'ml','478':'mr','480':'mu',
+   '504':'ma','508':'mz','516':'na','562':'ne','566':'ng','624':'gw',
+   '646':'rw','678':'st','686':'sn','694':'sl','706':'so','710':'za',
+   '716':'zw','728':'ss','729':'sd','732':'eh','748':'sz','768':'tg',
+   '788':'tn','800':'ug','818':'eg','834':'tz','854':'bf','894':'zm',
+ };
+
+ function flagUrl(iso) {
+   const cc = FLAG_CODE[iso];
+   return cc ? `https://flagcdn.com/w80/${cc}.png` : null;
+ }
```

### JS — `renderPanel` の国旗表示部分を置き換え

**変更箇所：** `renderPanel` 内の `flag-img` を含む行（行 265）

```diff
- <div class="flag-img">${d.flag}</div>
+ <div class="flag-img">
+   ${flagUrl(iso)
+     ? `<img src="${flagUrl(iso)}" alt="${d.name}の国旗" width="48" height="32"
+            style="border-radius:3px;border:1px solid var(--border);object-fit:cover;display:block;"
+            onerror="this.replaceWith(document.createTextNode('${d.flag}'))">`
+     : d.flag}
+ </div>
```

### CSS — `.flag-img` のスタイル調整

**変更箇所：** `.flag-img { ... }` の行（行 54）

```diff
- .flag-img { font-size:2rem; line-height:1; flex-shrink:0; }
+ .flag-img { font-size:2rem; line-height:1; flex-shrink:0; width:48px; height:32px;
+   display:flex; align-items:center; justify-content:center; }
```

---

## 変更サマリー

| # | 変更 | 関連箇所 |
|---|------|---------|
| 1 | **ズーム・パン** | CSS 2行、HTML 8行（ボタン）、JS `renderMap`全体 + `zoomBy` / `resetZoom` 追加 |
| 2 | **レスポンシブ** | CSS `@media` ブロック置き換え（3ブレークポイント） |
| 3 | **国旗画像** | JS `FLAG_CODE` + `flagUrl()` 追加、`renderPanel` 内 `flag-img` 1行 |

> **注意：** ズームの `stroke-width` 逆スケーリング（zoom イベント内）はパフォーマンスに影響しやすい。
> 国数が多い場合は `#map-g` 全体に `vector-effect: non-scaling-stroke` を CSS で指定する方がGPU効率が良い。
> その場合、zoom ハンドラ内の `forEach` ループは不要になる。
>
> ```css
> /* 代替案：CSSのみでストローク幅を固定 */
> #map .country { vector-effect: non-scaling-stroke; }
> ```