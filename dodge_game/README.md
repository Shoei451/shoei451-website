# DODGE — Survive

A browser-based action survival game built with vanilla HTML/CSS/JS and the Web Audio API. No frameworks, no build tools, no external dependencies.

---

## Play

Open `dodge-game-v10.html` directly in a browser. No server required.

---

## Controls

| Platform | Move | Shoot |
|---|---|---|
| Desktop | Arrow keys / WASD | Auto-fires |
| Mobile | Drag anywhere | Auto-fires while touching |

**Pause:** `Esc` key or the ⏸ button (top-right)  
**Mute:** Speaker icon below the pause button

---

## Gameplay

### Objective
Survive as long as possible. Score increases passively over time and by destroying enemies.

### Levels
Levels increase at fixed score thresholds. Each level raises enemy speed and spawn rate.

| Level Up | Score Required |
|---|---|
| Lv 1 → 2 | 400 |
| Lv 2 → 3 | 1,200 |
| Lv 3 → 4 | 2,000 |
| Lv 4 → 5 | 2,800 |
| Each after | +800 |

### Boss Waves
A boss spawns at every multiple of 4 (Lv 4, 8, 12…). Normal enemies stop spawning during boss fights.

- **Phase 1** (HP > 50%) — charges the player, fires 5-bullet radial bursts
- **Phase 2** (HP ≤ 50%) — faster movement, 8-bullet bursts, turns red
- Boss HP scales: 80 + (bossNumber − 1) × 40
- Defeating a boss guarantees a drop (life if missing one, otherwise weapon upgrade)

### Enemies

| Type | Shape | Notes |
|---|---|---|
| Normal | Circle | Appears from Lv 1 |
| Fast | Diamond | Appears from Lv 3, worth more score |
| Large | Hexagon | Appears from Lv 5, 3 HP |

### Weapons
Drops from defeated enemies. Upgrades chain: **SINGLE → SPREAD → LASER → HYPER**. Each upgrade lasts 15 seconds then steps down one tier.

| Weapon | Color | Fire Rate | Pattern |
|---|---|---|---|
| SINGLE | Cyan | 220ms | 1 bullet straight |
| SPREAD | Purple | 180ms | 3-way fan |
| LASER | Pink | 80ms | Fast capsule |
| HYPER | Orange | 90ms | Laser + spread (3 bullets) |

### Drops

| Drop | Color | Effect | Rarity |
|---|---|---|---|
| Weapon | Varies | Upgrades weapon tier | Common |
| Shield ◈ | Green | Absorbs next hit | Uncommon |
| Life ♥ | Red | Restores 1 life (only when missing a life) | Rare |

### Combo System
Killing enemies within 2.5 seconds chains a combo multiplier (×2, ×3…). Kill score is multiplied by the current combo count.

---

## UI / HUD

- **Top-left** — Score
- **Top-center** — Level
- **Top-right** — Lives (dots) / Pause button / Mute button
- **Top-center** (boss only) — Boss HP bar
- **Bottom-center** — Current weapon + timer bar
- **Mid-screen** — Combo display, pickup toasts, level badge

---

## File Structure

```
dodge-game-v10.html   ← single self-contained file
README.md
PROGRESS.md
```

---

## Technical Notes

- Canvas-based rendering, `requestAnimationFrame` loop
- Web Audio API for all sound effects (synthesized, no audio files)
- Touch input: drag-anywhere virtual joystick (invisible, no UI buttons)
- `localStorage` for high score persistence
- Screen shake via canvas `translate` with exponential decay
- No frameworks, no build step — open and play