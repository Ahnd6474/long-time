# Long Time

Long Time is a web-only Janggi project scaffolded with React, TypeScript, and Vite. This repository now contains the browser app foundation that later gameplay work will build on, with a source layout that separates game logic, state, UI, styles, and tests.

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
- Web-only app shell with responsive layout
- Starter board placeholder for the future Janggi board
- Typed game state bootstrap for later gameplay work
- Frontend and repository-level test hooks
