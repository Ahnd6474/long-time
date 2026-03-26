# Long Time

Long Time is a web-only Janggi project built with React, TypeScript, and Vite. The repository now includes a playable board UI backed by a standalone rules engine with typed board state, initial setup, legal move generation, authoritative move validation, capture handling, turn flow, and undo-ready history.

Built by Jakal Flow.

## Stack

- React
- TypeScript
- Vite
- Vitest
- Pytest

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

## Test

```bash
npm test
python -m pytest
```

## Folder Structure

```text
src/
  components/  UI building blocks
  game/        board and rules-oriented logic
  state/       application state factories and reducers
  styles/      global styling
  tests/       frontend unit tests
tests/         repository-level pytest checks
```

## Current Feature Summary

- Runnable Vite React TypeScript website from repository root
- Responsive playable board with current-turn messaging and side controls
- Standalone Janggi rules engine under `src/game`
- Standard opening setup plus legal move generation for every piece
- Selection-driven legal move highlighting, capture highlighting, invalid-click feedback, and local turn switching
- Move validation, capture handling, turn advancement, undo, and new-game controls
- Frontend Vitest coverage executed through the repository-level `python -m pytest` path
