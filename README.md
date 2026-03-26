# Long Time

Long Time is a browser-first Janggi web app built with React, TypeScript, and Vite. It delivers a polished local match experience with legal move highlighting, turn-aware controls, a built-in rules guide, and a standalone rules engine that stays separate from the UI.

Built by Jakal Flow.

## Overview

This project ships a playable Korean Janggi website for two people sharing one device. Blue starts at the top, red starts at the bottom, and players click pieces to reveal only legal move targets before committing a move on the board.

The current build includes a responsive board, a match sidebar with undo and reset controls, a branded help modal, and automated coverage for both the rules engine and the main browser interactions.

## Stack

- React 19
- TypeScript
- Vite
- Vitest
- Testing Library
- Pytest

## Setup

1. Install Node.js and npm.
2. Install the web app dependencies from the repository root:

```bash
npm install
```

3. If you want to use the repository-level verification command, make sure `pytest` is available in your active Python environment:

```bash
python -m pip install pytest
```

## Run Locally

Start the Vite development server from the repository root:

```bash
npm run dev
```

Vite will print the local URL in the terminal, usually `http://localhost:5173`.

Create a production build:

```bash
npm run build
```

Preview the built site locally:

```bash
npm run preview
```

## Testing

Run the frontend unit and interaction tests:

```bash
npm test
```

Run the repository-level verification path used by the managed task flow:

```bash
python -m pytest
```

The `python -m pytest` suite checks the repository layout and then runs `npm test`, so both commands should stay healthy.

## Project Structure

```text
src/
  App.tsx               Main app shell and gameplay wiring
  components/           GameBoard, SidebarPanel, HelpModal, display helpers
  game/                 Board helpers, shared types, and the Janggi rules engine
  state/                Thin state exports used by the app and tests
  styles/               Global styling for the board, layout, panels, and modal
  tests/                Vitest coverage for gameplay logic and UI behavior
tests/
  test_bootstrap_web_app.py   Repository-level pytest checks
index.html              Vite entry document
vite.config.ts          Vite and Vitest configuration
```

Key paths:

- `src/components/` holds the rendered UI pieces, including the board, sidebar, and help modal.
- `src/game/` contains the board helpers, rules engine, and shared gameplay types.
- `src/state/` exposes the state entry points used by the app and tests.
- `src/styles/` contains the global site styling.
- `src/tests/` contains the Vitest and Testing Library suites.
- `tests/` contains the repository-level `pytest` checks.

## Feature Summary

- Fully playable browser board for local two-player Janggi.
- Click-to-select interaction that reveals every legal move for the active piece.
- Distinct visual states for selected squares, legal move targets, capture targets, and invalid clicks.
- Rules-engine validation for all shipped piece types, palace movement, turn order, captures, undo history, and moves that would expose your own general.
- Match sidebar with live turn messaging, selection details, move counts, `undo`, `reset board`, and `new game` controls.
- In-app help modal covering what Janggi is, how each piece moves, how this website handles selection and movement, and what the board highlights mean.
- Responsive product-style layout with visible Jakal Flow branding on the main surface and help modal.

## Known Limitations

- This release is local two-player only. There is no AI opponent and no online play.
- Matches end when a general is captured. The UI does not yet present separate check, checkmate, draw, or repetition states.
- There is no saved match history, import/export flow, or annotated move list yet.
