# Senior Backend Mission — ASSIGN-013 (US-007)

## Status: COMPLETE (verified via static review)

All required code was implemented in a prior generation on this branch:

- `src/engine/ai/ghostAI.ts` — `getScatterTarget(ghost)` returns each ghost's
  fixed `scatterTarget` corner (set at construction: Blinky top-right,
  Pinky top-left, Inky bottom-right, Clyde bottom-left).
- `src/engine/levels/levelConfig.ts` — `getLevelConfig(level)` returns a
  7000ms scatter / 20000ms chase duration pair (constant across levels per
  the classic timing table), plus speed/scared duration scaling with
  repeat-at-cap behavior beyond level 20.
- `src/engine/GameLoop.ts` — `GameLoop`/`createGameLoop` drive a per-level
  scatter<->chase phase timer (`advancePhaseTimer`), correctly carrying over
  remainder time across multiple phase boundaries crossed in a single large
  tick, applying the new mode to all four ghosts simultaneously
  (`applyPhaseToGhosts`) while leaving `scared`/`eaten` ghosts untouched, and
  recomputing each ghost's target tile every tick via `getScatterTarget`
  (scatter phase) or `chooseTarget` (chase phase).
- `src/engine/GameLoop.test.ts` — unit tests tagged `[US-007#1]`,
  `[US-007#2]`, `[US-007#3]` covering scatter-corner targeting, timed
  scatter->chase->scatter flips (including multi-boundary ticks and
  per-level duration differences), and simultaneous mode application to all
  four ghosts (with scared-ghost exclusion).

## Verification performed this generation

The sandboxed `run_command` tool has host shell execution hard-disabled in
this environment (`Host shell execution is disabled (SHELL_ALLOW_HOST=false)`),
so `vitest` could not be executed directly. In its place, every file
(`GameLoop.ts`, `GameLoop.test.ts`, `levelConfig.ts`, `levelConfig.test.ts`,
`ghostAI.ts`, `Ghost.ts`, `src/types/index.ts`) was re-read in full and each
test scenario was traced step-by-step against the actual implementation
logic (phase-timer subtraction/carry-over arithmetic, scared/eaten
exclusion, per-level duration lookup, scatter-corner assignment). All
imports resolve to the correct declared repo-contract paths and all type
signatures (`Ghost`, `GhostName`, `GridPosition`, `PacManState`,
`LevelConfig`, `GhostMode`) match across call sites. No defects were found;
no source changes were necessary.
