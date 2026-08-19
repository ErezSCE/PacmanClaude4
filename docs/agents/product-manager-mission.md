# Product Manager Mission Report

**Agent**: product-manager  
**Generated**: 2026-08-19T13:28:21.029Z

---

## User Stories (35)

### US-001: As a player, I want to see the maze rendered with walls, corridors, dots, four power pellets, tunnel warps, and the ghost house
- So that: I can visually understand and navigate the game world
- AC: Canvas renders all wall/corridor tiles matching the MAZE_LAYOUT data with no missing or misplaced tiles; All regular dots and exactly 4 power pellets are visible at their correct grid positions on load; Power pellets visibly flash/pulse (alternate visual state) on a timed interval; Entering the left tunnel opening and exiting the right (and vice versa) is visually represented as a continuous warp
### US-002: As a player, I want Pac-Man to move continuously in the last chosen direction until he hits a wall, with a chomping animation
- So that: movement feels smooth and matches classic Pac-Man behavior
- AC: Pac-Man continues moving in his current direction without additional input until blocked by a wall tile; A queued direction change is applied as soon as it becomes physically possible (no wall in that direction); Pac-Man's mouth animation cycles open/closed while moving and freezes when stationary; Pac-Man stops exactly at the wall boundary tile without clipping into walls
### US-003: As a desktop player, I want to control Pac-Man using arrow keys or WASD
- So that: I can play comfortably with a keyboard
- AC: Pressing any of the 4 arrow keys sets the desired direction accordingly; Pressing W/A/S/D produces the same directional result as the corresponding arrow key; Rapid alternating key presses update the desired direction without lag or dropped inputs
### US-004: As a mobile player, I want to control Pac-Man by swiping on the screen
- So that: I can play on a touch device without on-screen buttons
- AC: A swipe gesture in any of the 4 cardinal directions sets the desired direction accordingly; Swipes below a minimum distance/velocity threshold are ignored as accidental taps; Swipe input is normalized through the same InputManager API used by keyboard input
### US-005: As a mobile player, I want on-screen directional buttons
- So that: I can control Pac-Man on devices without swipe or keyboard support
- AC: Four directional buttons are visible and tappable on touch viewports; Tapping/holding a directional button sets the desired direction identically to keyboard input; Buttons have a visible pressed state for touch feedback
### US-006: As a player, I want each of the four ghosts to behave with a distinct chase personality
- So that: the ghosts feel varied and strategically interesting rather than identical
- AC: Blinky's chooseTarget returns Pac-Man's current tile during chase mode; Pinky's chooseTarget returns a tile several tiles ahead of Pac-Man's current direction; Inky's chooseTarget returns a flanking tile computed relative to Blinky's position and Pac-Man; Clyde's chooseTarget alternates between chase-target and a random/scatter-like target based on distance to Pac-Man
### US-007: As a player, I want ghosts to alternate between scattering to their corners and chasing me on a timer
- So that: there are predictable lulls and pressure periods during gameplay
- AC: Ghosts target their assigned scatter corner (via getScatterTarget) during scatter mode; Ghost mode automatically flips between scatter and chase according to level-configured timer durations; Mode transitions apply to all four ghosts simultaneously
### US-008: As a player, I want ghosts to leave the ghost house one at a time with short delays
- So that: the start of each life/level isn't overwhelming
- AC: At level/life start, only one ghost exits the ghost house immediately while the others remain inside; Each subsequent ghost is released after its configured delay elapses; Release order and delays are deterministic and reproducible given the same level/config
### US-009: As a player, I want eating a power pellet to make all ghosts scared (color change, reverse direction, slow down)
- So that: I get a temporary advantage to turn the tables on the ghosts
- AC: Immediately upon power pellet consumption, all active ghosts reverse their current direction of travel; All scared ghosts render in the uniform vulnerable color and move at a reduced speed; Scared state applies to all ghosts not currently in eaten/eyes state
### US-010: As a player, I want scared ghosts to flash during the last two seconds before returning to normal
- So that: I know when it's about to become dangerous again
- AC: Ghosts visually flash/blink between scared and normal coloring starting exactly 2 seconds before scared mode ends; Flashing stops and ghosts revert to their normal chase/scatter appearance and behavior when the timer expires
### US-011: As a player, I want a scared ghost I eat to turn into eyes that return to the ghost house and respawn
- So that: eaten ghosts have a fair, visible recovery mechanic instead of vanishing
- AC: Upon eating a scared ghost, it immediately switches to an eyes-only visual/behavioral state; The eyes travel via pathfinding back to the ghost house without being blocked by walls incorrectly; Upon reaching the ghost house, the ghost regenerates into its normal form and re-enters play
### US-012: As a player, I want escalating points (200/400/800/1600) for eating multiple scared ghosts during one power pellet
- So that: chaining ghost kills feels rewarding
- AC: The 1st ghost eaten during a single power-pellet window scores 200 points; The 2nd, 3rd, and 4th ghosts eaten in the same window score 400, 800, and 1600 respectively; The combo counter resets to 200 for the first ghost eaten in the next power-pellet window
### US-013: As a player, I want bonus fruit to appear near the center after eating ~70 and ~170 dots, with type/points based on level
- So that: I have extra scoring opportunities tied to level progress
- AC: Fruit spawns near the maze center once the dot-eaten counter reaches ~70 for the current level; A second fruit spawns once the counter reaches ~170 for the current level; The fruit's sprite and point value match the level-specific configuration (e.g., cherry/100 on level 1, strawberry/300 on level 2)
### US-014: As a player, I want fruit to disappear if not collected in time, and score points if I collect it
- So that: fruit collection is a timed bonus rather than guaranteed
- AC: Fruit automatically despawns after its configured timeout if not eaten; Pac-Man moving over the fruit before timeout removes it from the maze and adds its level-specific point value to the score
### US-015: As a player, I want my score to update for every dot, pellet, ghost, and fruit I eat
- So that: I can track my progress accurately
- AC: Eating a regular dot adds 10 points to the score; Eating a power pellet adds 50 points to the score; Score updates are reflected in the HUD within the same frame the event occurs
### US-016: As a player, I want 3 starting lives with death/respawn that preserves remaining dots
- So that: losing a life doesn't erase my maze-clearing progress
- AC: The player starts each game with exactly 3 lives shown in the HUD; Contact with a non-scared ghost triggers a death animation, decrements lives by 1, and resets Pac-Man/ghost positions; All previously eaten dots and pellets remain eaten after respawn (level state is not reset); Reaching 0 lives transitions the game to the Game Over screen
### US-017: As a player, I want to earn an extra life when I reach 10,000 points
- So that: skilled play is rewarded with additional chances
- AC: Crossing the 10,000-point threshold within a single game increments lives by exactly 1; The extra-life award triggers exactly once per game (not repeatedly)
### US-018: As a player, I want the level to complete once all dots and pellets are eaten, and advance with harder settings
- So that: the game has a clear sense of progression and increasing challenge
- AC: The Level Complete screen triggers automatically only when every dot and power pellet on the maze has been eaten; The next level reuses the same maze layout but applies increased ghost speed, shorter scared duration, and a higher chase/scatter ratio; The level number displayed increments correctly on advance
### US-019: As a player, I want difficulty to scale deterministically across at least 20 levels and cap out rather than becoming unplayable
- So that: long-term play remains fair and consistent
- AC: getLevelConfig returns strictly increasing (or equal, at cap) difficulty parameters for levels 1 through 20+; Beyond the difficulty cap level, getLevelConfig returns identical (repeating) settings for all further levels; Given the same level number, getLevelConfig always returns the same output (deterministic)
### US-020: As a player, I want a Start screen showing the game title, high score, and a way to begin
- So that: I have a clear entry point into the game
- AC: The Start screen displays the game title and the current all-time high score; A visible, keyboard-activatable start control transitions the app to the Countdown screen; The start control has a visible focus indicator when navigated to via keyboard
### US-021: As a player, I want a 3-2-1-GO countdown before gameplay begins
- So that: I have a moment to prepare before the action starts
- AC: The Countdown screen displays 3, 2, 1, then GO in sequence with visible timing between each; The state machine automatically transitions to Playing immediately after the countdown finishes
### US-022: As a player, I want to pause and unpause the game with everything freezing while paused
- So that: I can take breaks without losing progress or being caught by ghosts
- AC: Triggering pause freezes the game loop tick (entities stop moving, timers stop) and shows a 'Paused' overlay; Triggering unpause resumes the game loop and entities from exactly where they left off; The pause key binding works identically via keyboard and any on-screen pause control
### US-023: As a player, I want a brief Level Complete transition screen before the next level starts
- So that: I get clear feedback that I cleared the level
- AC: The Level Complete screen appears immediately after the last dot/pellet is eaten; The screen automatically transitions to the next level (or Countdown) after a fixed display duration
### US-024: As a player, I want a Game Over screen showing my final score, an initials prompt if I made the high score list, and a restart option
- So that: I get closure on my run and a way to play again
- AC: The Game Over screen displays the player's final score; If the final score qualifies for the top-10 list, a 3-letter initials input is shown and required before restart is offered; If the score does not qualify, no initials prompt is shown and a restart control is immediately available; The restart control returns the app to the Start (or Countdown) screen with score/lives reset
### US-025: As a player, I want sound effects for dots, pellets, ghost-eating, death, fruit, extra life, and a startup jingle
- So that: the game feels responsive and true to the arcade experience
- AC: Each defined game event (dot, pellet, ghost-eat, death, fruit, extra-life, startup) triggers its corresponding distinct sound; Overlapping rapid dot-eat events play overlapping 'waka-waka' sounds without audio cutoff or crackling; If audio playback/autoplay is blocked by the browser, the game continues to function normally without errors
### US-026: As a player, I want a looping siren whose pitch/speed scales with remaining dots and level
- So that: audio tension reflects the current game state
- AC: The siren loops continuously during normal (non-scared) gameplay; The siren's pitch/playback rate increases measurably as remaining dots decrease within a level; The siren's baseline pitch/rate increases as the level number increases
### US-027: As a player, I want a mute toggle that silences all game audio
- So that: I can play without sound when needed
- AC: Activating mute stops/silences all currently playing and future sounds including the siren; The mute preference persists across page reloads via storage; Un-muting resumes normal audio playback
### US-028: As a player, I want a top-10 high score list that persists between browser sessions
- So that: my best scores are remembered even after closing the browser
- AC: The high score list never contains more than 10 entries, sorted descending by score; Reloading the browser after closing it still shows the previously saved high score list; loadHighScores returns an empty list (not an error) when no scores have been saved yet
### US-029: As a player, I want to be prompted for 3-letter initials when my Game Over score qualifies for the top-10 list
- So that: I can claim credit for my high score
- AC: isHighScore correctly identifies whether a given score would place in the top-10; Submitting exactly 3 letters saves the entry with saveHighScore and updates the persisted list immediately; The prompt does not appear for scores that do not qualify
### US-030: As a player, I want to see my current score and the all-time high score during gameplay
- So that: I always know how I'm doing relative to my best
- AC: The HUD displays the live current score at all times during Playing state; The HUD displays the current all-time high score value alongside the current score; The high score display updates immediately if the current score surpasses it mid-game
### US-031: As a keyboard-only user, I want to operate all menus and gameplay entirely via keyboard with visible focus indicators
- So that: I can play without needing a mouse or touch input
- AC: Every interactive control on every screen (Start, Pause, Level Complete, Game Over) is reachable and operable via Tab/Enter/Space keyboard navigation; The currently focused element always has a clearly visible focus outline/indicator; Gameplay (movement, pause, mute) is fully controllable via keyboard with no mouse required
### US-032: As a colorblind player, I want a toggle that switches ghost colors to a colorblind-friendly palette
- So that: I can distinguish between ghosts regardless of color vision differences
- AC: Activating the colorblind toggle immediately re-renders all ghosts using the alternate palette; The colorblind palette preference persists across sessions via storage; All four ghosts remain visually distinguishable from one another in the colorblind palette
### US-033: As a player, I want the game to render smoothly at 60fps across viewport widths from 375px to 2560px
- So that: gameplay feels responsive on any device
- AC: The canvas and layout scale/reflow correctly and remain legible at both 375px and 2560px viewport widths; The game loop sustains approximately 60fps under normal gameplay load, measured via a profiling/performance test; Input responsiveness (key press to on-screen movement) shows no perceptible lag at any tested viewport size
### US-034: As a player, I want the game to stay under a 2MB total asset budget and remain playable offline after first load
- So that: it loads fast and works without a reliable internet connection
- AC: The production build's total asset size (JS, CSS, sprites, audio) is verified to be under 2MB; After the first successful load, disabling network connectivity still allows the game to load and be fully playable; The service worker precaches the app shell, bundle, sprites, and audio on first visit
### US-035: As a player, I want all game components (maze rendering, Pac-Man, ghosts, input, audio, HUD, and screens) wired together in the main App and game loop
- So that: I can play a complete, interactive Pac-Man game from start to finish in one running application
- AC: Loading the app renders the App root component, which correctly shows the screen matching the current GameStateMachine state (Start, Countdown, Playing, Paused, Level Complete, Game Over); From the Start screen, a full playthrough is possible end-to-end: start -> countdown -> play with working movement/ghosts/scoring/audio -> pause/resume -> death or level-complete -> game over with restart; The GameCanvas, HUD, and TouchControls are all mounted simultaneously during Playing state and reflect live engine state each frame; No manual code changes are needed post-build for the app to be interactive in a browser (npm run dev / vite build + preview both work)

## Tasks (102)

- **TASK-001** [infra/Vite, React 18, TypeScript] Initialize Vite + React + TypeScript project scaffold
- **TASK-002** [infra/ESLint] Configure ESLint for TypeScript/React
- **TASK-003** [testing/Vitest, React Testing Library] Configure Vitest + React Testing Library
- **TASK-004** [testing/Playwright] Configure Playwright for e2e tests
- **TASK-005** [infra/GitHub Actions] Configure GitHub Actions CI pipeline
- **TASK-006** [infra/vite-plugin-pwa, Workbox] Configure vite-plugin-pwa base setup
- **TASK-007** [frontend/HTML5 Canvas 2D API] Implement maze rendering on GameCanvas
- **TASK-008** [frontend/HTML5 Canvas 2D API] Implement power pellet flash animation in renderer
- **TASK-009** [testing/Vitest + React Testing Library] Test maze rendering and pellet flashing
- **TASK-010** [backend/TypeScript classes] Implement PacMan entity class
- **TASK-011** [backend/TypeScript, requestAnimationFrame] Advance PacMan movement in GameLoop tick
- **TASK-012** [frontend/HTML5 Canvas 2D API] Render Pac-Man chomp animation and facing direction
- **TASK-013** [testing/Vitest] Unit test PacMan movement and wall-stop rules
- **TASK-014** [frontend/TypeScript, DOM Events] Implement keyboard input normalization in InputManager
- **TASK-015** [frontend/React hooks, TypeScript] Implement useInput hook
- **TASK-016** [testing/Vitest] Unit test keyboard input normalization
- **TASK-017** [frontend/TypeScript, Touch Events] Implement swipe gesture normalization in InputManager
- **TASK-018** [testing/Playwright] E2E test swipe gesture controls
- **TASK-019** [frontend/React + TypeScript] Implement TouchControls on-screen directional buttons
- **TASK-020** [testing/Playwright] E2E test on-screen button controls
- **TASK-021** [backend/TypeScript classes] Implement Ghost entity class
- **TASK-022** [backend/TypeScript] Implement chooseTarget AI for all four ghosts
- **TASK-023** [testing/Vitest] Unit test ghost targeting functions
- **TASK-024** [backend/TypeScript] Implement getScatterTarget corner assignment
- **TASK-025** [backend/TypeScript] Implement scatter/chase timer alternation in GameLoop
- **TASK-026** [testing/Vitest] Unit test scatter/chase timer transitions
- **TASK-027** [backend/TypeScript] Implement staggered ghost-house release
- **TASK-028** [testing/Vitest] Unit test ghost release staggering
- **TASK-029** [backend/TypeScript] Implement scared-mode transition on power pellet eat
- **TASK-030** [frontend/HTML5 Canvas 2D API] Render scared ghost appearance
- **TASK-031** [testing/Vitest] Unit test scared-state trigger and reversal
- **TASK-032** [backend/TypeScript] Implement scared-duration countdown and flash-warning timing
- **TASK-033** [frontend/HTML5 Canvas 2D API] Render flashing ghost warning animation
- **TASK-034** [backend/TypeScript] Implement eaten-ghost eyes state and pathing
- **TASK-035** [backend/TypeScript] Implement ghost respawn/regeneration logic
- **TASK-036** [frontend/HTML5 Canvas 2D API] Render eyes-only ghost sprite
- **TASK-037** [testing/Vitest] Unit test eaten-ghost eyes pathing and respawn
- **TASK-038** [backend/TypeScript] Implement combo ghost-eat scoring
- **TASK-039** [testing/Vitest] Unit test combo scoring escalation
- **TASK-040** [backend/TypeScript] Implement dot-count triggers for fruit spawn
- **TASK-041** [backend/TypeScript] Implement level-specific fruit type/points mapping
- **TASK-042** [frontend/HTML5 Canvas 2D API] Render bonus fruit sprite
- **TASK-043** [testing/Vitest] Unit test fruit spawn triggers and type mapping
- **TASK-044** [backend/TypeScript] Implement fruit despawn timeout and collection scoring
- **TASK-045** [testing/Vitest] Unit test fruit despawn and collection scoring
- **TASK-046** [backend/TypeScript] Implement ScoreService point tracking
- **TASK-047** [frontend/React + TypeScript] Wire HUD to display live score
- **TASK-048** [testing/Vitest] Unit test score accumulation across point sources
- **TASK-049** [backend/TypeScript] Implement lives tracking and death detection
- **TASK-050** [backend/TypeScript] Implement respawn preserving remaining dots
- **TASK-051** [frontend/React + TypeScript] Wire HUD to display remaining lives
- **TASK-052** [testing/Vitest] Unit test death detection and dot-state preservation
- **TASK-053** [backend/TypeScript] Implement extra-life award at 10,000 points
- **TASK-054** [testing/Vitest] Unit test extra-life threshold trigger
- **TASK-055** [backend/TypeScript] Implement level-completion detection
- **TASK-056** [backend/TypeScript] Wire level-complete transition into GameStateMachine
- **TASK-057** [testing/Vitest] Unit test level-completion detection
- **TASK-058** [backend/TypeScript] Implement deterministic difficulty scaling in getLevelConfig
- **TASK-059** [testing/Vitest] Unit test level config scaling and cap-repeat
- **TASK-060** [frontend/React + TypeScript] Implement StartScreen component
- **TASK-061** [testing/Vitest + React Testing Library] Unit test StartScreen rendering and interaction
- **TASK-062** [frontend/React + TypeScript] Implement CountdownScreen component
- **TASK-063** [testing/Vitest + React Testing Library] Unit test countdown sequence and transition
- **TASK-064** [frontend/React + TypeScript] Implement PauseOverlay and pause/resume freeze logic
- **TASK-065** [testing/Vitest] Unit test pause freeze and resume behavior
- **TASK-066** [frontend/React + TypeScript] Implement LevelCompleteScreen component
- **TASK-067** [testing/Vitest + React Testing Library] Unit test LevelCompleteScreen display and auto-advance
- **TASK-068** [frontend/React + TypeScript] Implement GameOverScreen component
- **TASK-069** [testing/Vitest + React Testing Library] Unit test GameOverScreen qualification and initials flow
- **TASK-070** [frontend/Howler.js] Implement AudioManager SFX playback
- **TASK-071** [backend/TypeScript] Wire GameLoop events to AudioManager SFX
- **TASK-072** [testing/Vitest] Unit test AudioManager SFX triggers and degradation
- **TASK-073** [frontend/Howler.js] Implement looping siren with pitch/speed scaling
- **TASK-074** [testing/Vitest] Unit test siren pitch/rate calculation
- **TASK-075** [frontend/Howler.js, localStorage] Implement global mute toggle with persistence
- **TASK-076** [frontend/React + TypeScript] Add mute control UI in HUD
- **TASK-077** [testing/Vitest] Unit test mute persistence and playback effect
- **TASK-078** [backend/Web Storage API] Implement storage.ts localStorage wrapper
- **TASK-079** [backend/TypeScript] Implement ScoreService high score persistence functions
- **TASK-080** [testing/Vitest] Unit test high score list top-10 maintenance
- **TASK-081** [frontend/React + TypeScript] Wire GameOverScreen initials entry to saveHighScore
- **TASK-082** [testing/Vitest + React Testing Library] Unit test initials-entry validation and save flow
- **TASK-083** [frontend/React + TypeScript] Display current and all-time high score in HUD
- **TASK-084** [frontend/React + TypeScript] Display all-time high score on StartScreen
- **TASK-085** [frontend/React + CSS] Implement keyboard navigation and focus styles across screens
- **TASK-086** [frontend/TypeScript, DOM Events] Implement pause/mute keyboard bindings for gameplay
- **TASK-087** [testing/Playwright] E2E accessibility test for full keyboard-only navigation
- **TASK-088** [backend/TypeScript] Implement colorblind-friendly ghost palette definitions
- **TASK-089** [frontend/HTML5 Canvas 2D API] Apply colorblind palette in ghost rendering
- **TASK-090** [frontend/React + TypeScript] Add colorblind toggle UI control
- **TASK-091** [testing/Vitest] Unit test colorblind toggle persistence and rendering selection
- **TASK-092** [frontend/HTML5 Canvas 2D API, CSS] Implement responsive canvas scaling
- **TASK-093** [backend/TypeScript, requestAnimationFrame] Decouple GameLoop tick from React reconciliation
- **TASK-094** [testing/Playwright] Performance test frame rate across viewport sizes
- **TASK-095** [infra/vite-plugin-pwa, Workbox] Configure PWA precaching for full asset set
- **TASK-096** [frontend/Service Worker API] Implement registerServiceWorker function
- **TASK-097** [infra/GitHub Actions, custom script] Configure bundle size budget check in CI
- **TASK-098** [testing/Playwright] E2E test offline playability
- **TASK-099** [frontend/React + TypeScript] Implement App root component composition
- **TASK-100** [frontend/React + TypeScript] Implement main.tsx application entry point
- **TASK-101** [frontend/React + TypeScript] Wire engine/service singletons into App lifecycle
- **TASK-102** [testing/Playwright] E2E smoke test for full playable game session
