# Team Leader Mission Report

**Agent**: team-leader  
**Generated**: 2026-08-19T13:42:19.590Z

---

## Assignments (46)

### ASSIGN-001 -> principal-frontend [principal]
- Priority: critical | Complexity: moderate
- Scaffold the Vite + React 18 + TypeScript project at repo root. Create package.json (dev/build/test/test:e2e/lint scripts per contract), vite.config.ts, tsconfig.json, index.html, folder structure (src/components, src/engine, src/input, src/audio, src/services, src/pwa, src/types). Configure ESLint for TS/React (TASK-002), Vitest + React Testing Library config (TASK-003), Playwright config (TASK-004), and GitHub Actions CI pipeline skeleton running lint/unit/e2e/build (TASK-005), plus base vite-plugin-pwa registration scaffolding (TASK-006, full precaching config comes later). Do not implement game logic here. This is the foundation all other branches build on.
### ASSIGN-002 -> senior-frontend [senior]
- Priority: critical | Complexity: moderate
- Create the frozen shared contract files: src/types/index.ts (export Tile, Direction, GhostMode, GameConfig, LevelConfig, HighScoreEntry, GameSnapshot types matching all downstream module signatures) and src/engine/maze/MazeMap.ts (export MAZE_LAYOUT tile-grid constant covering walls/corridors/dots/power-pellets/tunnels/ghost-house, and Maze class with collision/lookup helpers). These files are FROZEN after this assignment merges - no other assignment may modify them, only import from them.
### ASSIGN-003 -> senior-frontend [senior]
- Priority: critical | Complexity: moderate
- [STUBS] Create placeholder stub files (throwing new Error('not implemented')) for every remaining module path in the contract so all feature branches compile in parallel: src/main.tsx, src/App.tsx, src/components/GameCanvas.tsx, src/components/HUD.tsx, src/components/TouchControls.tsx, src/components/screens/{StartScreen,CountdownScreen,PauseOverlay,LevelCompleteScreen,GameOverScreen}.tsx, src/engine/GameLoop.ts, src/engine/entities/{PacMan,Ghost}.ts, src/engine/ai/ghostAI.ts, src/engine/state/GameStateMachine.ts, src/engine/levels/levelConfig.ts, src/input/InputManager.ts, src/audio/AudioManager.ts, src/services/{ScoreService,storage}.ts, src/pwa/registerServiceWorker.ts. Export the exact function/class signatures listed in the repo contract. These are intentional temporary placeholders replaced by real implementations in feature branches.
### ASSIGN-004 -> principal-frontend [principal]
- Priority: critical | Complexity: complex
- Implement real GameCanvas.tsx (src/components/GameCanvas.tsx) replacing the stub: imperative Canvas 2D renderer mounted via React ref, reading Maze/MAZE_LAYOUT (frozen) to draw walls/corridors/dots/power pellets/tunnel warps/ghost house each frame. Implement power pellet flash/pulse animation on a timed interval. Establish the core draw-loop/context pattern that all later rendering work (pacman, ghosts, fruit, colorblind palette, responsive scaling) will extend in this same file. Owns GameCanvas.tsx exclusively for this feature; note in code comments the extension points for future contributors.
### ASSIGN-005 -> junior-react [junior]
- Priority: high | Complexity: simple
- Write Vitest + RTL tests verifying GameCanvas.tsx renders all wall/corridor/dot/pellet tiles matching MAZE_LAYOUT and that the pellet flash animation alternates visual state on interval. Read ASSIGN-004's implementation first to match its rendering API.
### ASSIGN-006 -> senior-frontend [senior]
- Priority: high | Complexity: complex
- Extend GameCanvas.tsx (created in ASSIGN-004, do not re-scaffold) to render: Pac-Man's chomp mouth animation/facing direction (supports US-002 AC2), scared-ghost uniform vulnerable color (supports US-009 AC1), the flashing warning animation for the final 2s of scared mode (supports US-010 AC0), eyes-only ghost sprite for eaten ghosts (supports US-011 AC0), and the bonus fruit sprite (supports US-013 AC2). Read GameSnapshot type in src/types/index.ts for the data shape each frame provides. Follow the drawing pattern established in ASSIGN-004.
### ASSIGN-007 -> senior-backend [senior]
- Priority: critical | Complexity: complex
- Implement src/engine/entities/PacMan.ts (PacMan class: position, current/queued direction, chomp frame, movement rules continuing in last chosen direction until wall-blocked) replacing the stub. Implement src/engine/GameLoop.ts (GameLoop class + createGameLoop function) replacing the stub with the requestAnimationFrame tick loop that advances PacMan each frame using Maze collision helpers, applying queued direction changes as soon as possible and stopping exactly at wall boundaries. This establishes the core loop other systems (ghosts, fruit, scoring, lives) will extend.
### ASSIGN-008 -> junior-react [junior]
- Priority: high | Complexity: simple
- Write Vitest unit tests for PacMan.ts movement and wall-stop rules: continues in direction until blocked, queued direction applies when possible, stops exactly at wall boundary. Read ASSIGN-007's implementation first.
### ASSIGN-009 -> senior-frontend [senior]
- Priority: high | Complexity: moderate
- Create src/engine/InputManager.ts keyboard normalization (arrow keys + WASD -> direction enum) and src/hooks/useInput.ts React hook exposing current direction to game loop. Add unit tests in InputManager.test.ts covering key mapping edge cases (diagonal presses, key release). Owns InputManager.ts and useInput.ts on this branch.
### ASSIGN-010 -> senior-frontend [senior]
- Priority: high | Complexity: moderate
- Extend InputManager.ts (created in ASSIGN-009) with swipe gesture normalization using touchstart/touchend deltas to derive direction. Add Playwright/Cypress E2E test simulating swipe gestures on the canvas. Read existing InputManager.ts before editing to preserve keyboard handling.
### ASSIGN-011 -> junior-react [junior]
- Priority: medium | Complexity: simple
- Create src/components/TouchControls.tsx rendering on-screen directional buttons (up/down/left/right) that call the same direction-setter used by InputManager. Add E2E test clicking each button and asserting direction change. Owns TouchControls.tsx only.
### ASSIGN-012 -> senior-backend [senior]
- Priority: critical | Complexity: complex
- Create src/engine/Ghost.ts entity class (position, state, direction) and chooseTarget(ghostType, gameState) implementing distinct personalities: Blinky (direct chase), Pinky (4-tile ahead ambush), Inky (vector-based flank using Blinky position), Clyde (chase/scatter switch based on distance). Add unit tests for each ghost's targeting function. Owns Ghost.ts and ghostAI.ts.
### ASSIGN-013 -> senior-backend [senior]
- Priority: high | Complexity: moderate
- Add getScatterTarget(ghostType) corner-assignment function to ghostAI.ts and implement scatter/chase timer alternation inside GameLoop.ts (7s scatter / 20s chase pattern, matching level-based timing table). Add unit tests for timer transitions. Read Ghost.ts and ghostAI.ts from ASSIGN-012 first.
### ASSIGN-014 -> junior-python [junior]
- Priority: medium | Complexity: simple
- Implement staggered ghost-house release logic in GameLoop.ts / GhostHouse.ts: each ghost exits after a short delay (dot-count or timer based) in Blinky->Pinky->Inky->Clyde order. Add unit test asserting release ordering and delays. Follow patterns from ASSIGN-013's timer code.
### ASSIGN-015 -> senior-backend [senior]
- Priority: high | Complexity: moderate
- Implement scared-mode transition in Ghost.ts / GameLoop.ts triggered on power pellet eat: reverse current direction, switch to scared color state, reduce speed multiplier. Add unit tests for trigger and direction-reversal correctness.
### ASSIGN-016 -> junior-python [junior]
- Priority: medium | Complexity: simple
- Implement scared-duration countdown timer in Ghost.ts with a flash-warning flag set true during the final 2 seconds so rendering can alternate blue/white. Read scared-mode code from ASSIGN-015 first.
### ASSIGN-017 -> senior-backend [senior]
- Priority: high | Complexity: moderate
- Implement eaten-ghost 'eyes' state (fast return-path to ghost house using pathfinding) and respawn/regeneration logic resetting ghost to normal state inside house. Add unit tests for eyes pathing and respawn timing.
### ASSIGN-018 -> junior-python [junior]
- Priority: medium | Complexity: simple
- Implement combo ghost-eat scoring (200/400/800/1600 escalation per power-pellet window) in ScoreService.ts, resetting combo counter on new pellet eat. Add unit test for escalation and reset behavior.
### ASSIGN-019 -> senior-backend [senior]
- Priority: high | Complexity: moderate
- Implement FruitManager.ts dot-count triggers (spawn near ~70 and ~170 dots eaten) and level-specific fruit type/points mapping table (cherry->key etc). Add unit tests for spawn triggers and type mapping.
### ASSIGN-020 -> junior-python [junior]
- Priority: medium | Complexity: simple
- Implement fruit despawn timeout (~9-10s) in FruitManager.ts removing uncollected fruit, and collection scoring when Pac-Man overlaps fruit tile. Add unit test for despawn and scoring. Read FruitManager.ts from ASSIGN-019 first.
### ASSIGN-021 -> senior-backend [senior]
- Priority: high | Complexity: moderate
- Implement ScoreService.ts point tracking aggregating dots, pellets, ghosts (combo), and fruit points into a single running score with subscribable updates. Add unit test verifying accumulation across all point sources.
### ASSIGN-022 -> junior-react [junior]
- Priority: medium | Complexity: simple
- Wire HUD.tsx to subscribe to ScoreService (ASSIGN-021) and display the live score, updating on each change. Owns HUD score display region only.
### ASSIGN-023 -> senior-backend [senior]
- Priority: high | Complexity: complex
- Implement lives tracking (start at 3) and death detection (ghost collision while not scared) in GameStateMachine.ts, plus respawn logic that resets Pac-Man/ghost positions while preserving remaining dot/pellet state. Add unit tests for death detection and dot-state preservation.
### ASSIGN-024 -> junior-react [junior]
- Priority: medium | Complexity: simple
- Wire HUD.tsx to display remaining lives (icon count) sourced from GameStateMachine (ASSIGN-023). Owns HUD lives display region only.
### ASSIGN-025 -> junior-python [junior]
- Priority: medium | Complexity: simple
- Implement extra-life award triggered once when cumulative score crosses 10,000 (ScoreService/GameStateMachine hook). Add unit test verifying single trigger at threshold and no repeat awards.
### ASSIGN-026 -> senior-backend [senior]
- Priority: high | Complexity: moderate
- Implement level-completion detection (all dots + pellets eaten) and wire a level-complete transition state into GameStateMachine.ts that advances to the next level with harder settings. Add unit test for detection accuracy.
### ASSIGN-027 -> senior-backend [senior]
- Priority: medium | Complexity: moderate
- Implement deterministic difficulty scaling in getLevelConfig(level) (ghost speed, scatter/chase durations, fruit type) across 20+ levels, capping/repeating settings beyond the max defined level rather than breaking. Add unit test for scaling curve and cap-repeat behavior.
### ASSIGN-028 -> junior-react [junior]
- Priority: high | Complexity: simple
- Create src/screens/StartScreen.tsx showing game title, high score (placeholder until ASSIGN-039 wires real value), and a Start button/key prompt. Add unit test for rendering and start interaction. Owns StartScreen.tsx.
### ASSIGN-029 -> junior-react [junior]
- Priority: high | Complexity: simple
- Create src/screens/CountdownScreen.tsx showing 3-2-1-GO sequence with timed transitions before gameplay starts. Add unit test asserting sequence timing and transition to gameplay. Owns CountdownScreen.tsx.
### ASSIGN-030 -> senior-frontend [senior]
- Priority: high | Complexity: moderate
- Create src/components/PauseOverlay.tsx and implement pause/resume logic that freezes GameLoop tick, ghost timers, and animations while displayed, resuming exactly where left off. Add unit test for freeze/resume state integrity.
### ASSIGN-031 -> junior-react [junior]
- Priority: medium | Complexity: simple
- Create src/screens/LevelCompleteScreen.tsx showing a brief transition (level number, score) then auto-advancing to CountdownScreen for next level. Add unit test for display and auto-advance timing. Owns LevelCompleteScreen.tsx.
### ASSIGN-032 -> senior-frontend [senior]
- Priority: high | Complexity: moderate
- Create src/screens/GameOverScreen.tsx showing final score, checking qualification against top-10 high score list (stub interface until ASSIGN-037 lands), showing an initials-entry prompt when qualified, and a restart option. Add unit test for qualification branch and restart action.
### ASSIGN-033 -> senior-frontend [senior]
- Priority: medium | Complexity: moderate
- Implement src/audio/AudioManager.ts with SFX playback methods for dot, pellet, ghost-eat, death, fruit, extra-life, and startup jingle, including graceful degradation if Web Audio is unavailable. Add unit tests for trigger calls and degradation fallback.
### ASSIGN-034 -> senior-backend [senior]
- Priority: medium | Complexity: simple
- Wire GameLoop.ts event emissions (dot eaten, pellet eaten, ghost eaten, death, fruit eaten, extra life, level start) to AudioManager (ASSIGN-033) SFX calls via an event bus/callback pattern. Read AudioManager.ts API first.
### ASSIGN-035 -> senior-frontend [senior]
- Priority: medium | Complexity: moderate
- Implement looping siren playback in AudioManager.ts whose pitch/playback-rate scales with remaining dot count and current level. Add unit test for the pitch/rate calculation formula across sample states.
### ASSIGN-036 -> junior-react [junior]
- Priority: medium | Complexity: moderate
- Implement a global mute toggle in AudioManager.ts (persisted via storage.ts from ASSIGN-037, or localStorage directly if not yet available) and add a mute control button in HUD.tsx. Add unit test for persistence across reloads and playback silencing effect.
### ASSIGN-037 -> senior-backend [senior]
- Priority: high | Complexity: moderate
- Implement src/services/storage.ts localStorage wrapper (get/set/JSON safe-parse with try/catch) and ScoreService.ts high score persistence functions maintaining a top-10 sorted list across sessions. Add unit test for top-10 maintenance (insert, evict lowest, ties).
### ASSIGN-038 -> senior-frontend [senior]
- Priority: medium | Complexity: moderate
- Wire GameOverScreen.tsx (ASSIGN-032) initials-entry UI to call ScoreService.saveHighScore (ASSIGN-037) when the score qualifies for top-10. Add unit test for initials validation (3 letters, uppercase) and save flow.
### ASSIGN-039 -> junior-react [junior]
- Priority: medium | Complexity: simple
- Display current score and all-time high score together in HUD.tsx during gameplay, and display the all-time high score on StartScreen.tsx (ASSIGN-028), sourcing values from ScoreService (ASSIGN-037).
### ASSIGN-040 -> senior-frontend [senior]
- Priority: medium | Complexity: moderate
- Implement keyboard navigation and visible focus styles across StartScreen, PauseOverlay, GameOverScreen and other screens, plus pause/mute keyboard bindings during gameplay (e.g. P to pause, M to mute). Add E2E accessibility test for full keyboard-only navigation flow.
### ASSIGN-041 -> junior-python [junior]
- Priority: low | Complexity: simple
- Define a colorblind-friendly ghost palette mapping (per ghost type) in src/data/palettes.ts alongside the default palette, following the frozen data pattern used elsewhere.
### ASSIGN-042 -> junior-react [junior]
- Priority: low | Complexity: moderate
- Apply the colorblind palette (ASSIGN-041) in ghost rendering component and add a colorblind toggle UI control (in HUD or settings), persisting the choice via storage.ts. Add unit test for toggle persistence and correct palette selection during render.
### ASSIGN-043 -> senior-frontend [senior]
- Priority: medium | Complexity: moderate
- Implement responsive canvas scaling (maintain aspect ratio, scale maze to fit viewport widths 375px-2560px) in the main canvas/GameCanvas component using ResizeObserver.
### ASSIGN-044 -> senior-backend [senior]
- Priority: medium | Complexity: complex
- Decouple GameLoop.ts tick from React reconciliation (drive game state via requestAnimationFrame outside React render cycle, pushing snapshots to a ref/store for rendering) to guarantee steady 60fps. Add a performance test measuring frame rate across representative viewport sizes.
### ASSIGN-045 -> principal-frontend [principal]
- Priority: medium | Complexity: complex
- Configure PWA precaching (service worker config covering all sprite/audio assets) to keep total asset budget under 2MB, implement registerServiceWorker() in main.tsx bootstrap, add a bundle-size budget check step in CI config, and add an E2E test verifying offline playability after first load. This is cross-cutting build/infra work suited to the frontend principal.
### ASSIGN-046 -> principal-frontend [principal]
- Priority: critical | Complexity: complex
- Implement App.tsx root component composing maze rendering, Pac-Man, ghosts, InputManager/useInput, TouchControls, AudioManager, HUD, and all screens (Start, Countdown, Pause, LevelComplete, GameOver) into the GameStateMachine-driven flow. Implement/finalize main.tsx entry point mounting App and registering the service worker. Wire all engine/service singletons (GameLoop, ScoreService, AudioManager, storage) into the App lifecycle (mount/unmount, pause on blur). Add an E2E smoke test playing a full session from Start screen through gameplay to Game Over. This is the final integration point ensuring the game is interactive end-to-end.
