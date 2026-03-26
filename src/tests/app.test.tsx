import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';
import { createEmptyBoard } from '../game/board';
import { createGameState } from '../game/engine';
import type { GameState, Piece, PieceType, PlayerColor, Position } from '../game/types';

afterEach(() => {
  cleanup();
});

function createPiece(color: PlayerColor, type: PieceType, idSuffix = '1'): Piece {
  return {
    id: `${color}-${type}-${idSuffix}`,
    color,
    type,
  };
}

function createState(
  pieces: Array<{ piece: Piece; position: Position }>,
  currentTurn: PlayerColor = 'blue',
): GameState {
  const board = createEmptyBoard();

  for (const entry of pieces) {
    board[entry.position.row][entry.position.column] = entry.piece;
  }

  return createGameState({
    board,
    currentTurn,
    status: 'active',
    winner: null,
    moveHistory: [],
  });
}

function getCell(row: number, column: number): HTMLElement {
  return screen.getByTestId(`cell-${row}-${column}`);
}

describe('App board interactions', () => {
  it('highlights only legal destinations for the selected current-turn piece', () => {
    render(<App />);

    fireEvent.click(getCell(3, 0));

    expect(getCell(3, 0)).toHaveAttribute('data-move-state', 'selected');
    expect(getCell(4, 0)).toHaveAttribute('data-move-state', 'legal');
    expect(getCell(3, 1)).toHaveAttribute('data-move-state', 'legal');
    expect(getCell(5, 0)).toHaveAttribute('data-move-state', 'idle');
    expect(screen.getByRole('status')).toHaveTextContent(
      /blue soldier selected at 4-1\. 2 legal destinations highlighted\./i,
    );
  });

  it('moves a piece to a legal destination and switches the turn', () => {
    render(<App />);

    fireEvent.click(getCell(3, 0));
    fireEvent.click(getCell(4, 0));

    expect(getCell(3, 0).getAttribute('aria-label')).toMatch(/empty/i);
    expect(getCell(4, 0).getAttribute('aria-label')).toMatch(/blue soldier/i);
    expect(screen.getByTestId('turn-indicator')).toHaveTextContent(/red to move/i);
    expect(screen.getByRole('status')).toHaveTextContent(/moved to 5-1\. red to move\./i);
  });

  it('marks capture targets and resolves captures through the board UI', () => {
    const blueGeneral = createPiece('blue', 'general');
    const redGeneral = createPiece('red', 'general');
    const blueSoldier = createPiece('blue', 'soldier');
    const redSoldier = createPiece('red', 'soldier', 'enemy');
    const state = createState([
      { piece: blueGeneral, position: { row: 1, column: 4 } },
      { piece: redGeneral, position: { row: 8, column: 4 } },
      { piece: blueSoldier, position: { row: 4, column: 4 } },
      { piece: redSoldier, position: { row: 5, column: 4 } },
    ]);

    render(<App initialState={state} />);

    fireEvent.click(getCell(4, 4));

    expect(getCell(5, 4)).toHaveAttribute('data-move-state', 'capture');

    fireEvent.click(getCell(5, 4));

    expect(getCell(5, 4).getAttribute('aria-label')).toMatch(/blue soldier/i);
    expect(screen.getByRole('status')).toHaveTextContent(/captured red soldier on 6-5\./i);
    expect(screen.getByTestId('turn-indicator')).toHaveTextContent(/red to move/i);
  });

  it('surfaces invalid clicks without changing the board state', () => {
    render(<App />);

    fireEvent.click(getCell(6, 0));

    expect(getCell(6, 0)).toHaveAttribute('data-invalid', 'true');
    expect(screen.getByRole('status')).toHaveTextContent(
      /it is blue's turn\. select a blue piece to continue\./i,
    );
    expect(screen.getByTestId('turn-indicator')).toHaveTextContent(/blue to move/i);
  });

  it('undoes the latest move from the sidebar controls', () => {
    render(<App />);

    fireEvent.click(getCell(3, 0));
    fireEvent.click(getCell(4, 0));
    fireEvent.click(screen.getByRole('button', { name: /undo move/i }));

    expect(getCell(3, 0).getAttribute('aria-label')).toMatch(/blue soldier/i);
    expect(getCell(4, 0).getAttribute('aria-label')).toMatch(/empty/i);
    expect(screen.getByTestId('turn-indicator')).toHaveTextContent(/blue to move/i);
    expect(screen.getByRole('status')).toHaveTextContent(/last move undone/i);
  });

  it('resets the active scenario to its starting layout', () => {
    const blueGeneral = createPiece('blue', 'general');
    const redGeneral = createPiece('red', 'general');
    const blueSoldier = createPiece('blue', 'soldier');
    const state = createState([
      { piece: blueGeneral, position: { row: 1, column: 4 } },
      { piece: redGeneral, position: { row: 8, column: 4 } },
      { piece: blueSoldier, position: { row: 4, column: 4 } },
    ]);

    render(<App initialState={state} />);

    fireEvent.click(getCell(4, 4));
    fireEvent.click(getCell(5, 4));
    fireEvent.click(screen.getByRole('button', { name: /reset board/i }));

    expect(getCell(4, 4).getAttribute('aria-label')).toMatch(/blue soldier/i);
    expect(getCell(5, 4).getAttribute('aria-label')).toMatch(/empty/i);
    expect(screen.getByTestId('turn-indicator')).toHaveTextContent(/blue to move/i);
    expect(screen.getByRole('status')).toHaveTextContent(/board reset to the opening setup/i);
  });

  it('starts a fresh standard match from the new game control', () => {
    const blueGeneral = createPiece('blue', 'general');
    const redGeneral = createPiece('red', 'general');
    const state = createState([
      { piece: blueGeneral, position: { row: 1, column: 4 } },
      { piece: redGeneral, position: { row: 8, column: 4 } },
    ]);

    render(<App initialState={state} />);

    fireEvent.click(screen.getByRole('button', { name: /new game/i }));

    expect(getCell(0, 0).getAttribute('aria-label')).toMatch(/blue chariot/i);
    expect(getCell(3, 0).getAttribute('aria-label')).toMatch(/blue soldier/i);
    expect(screen.getByRole('status')).toHaveTextContent(/fresh standard match ready/i);
  });

  it('opens the in-app manual with branded help content', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /help|manual/i }));

    const dialog = screen.getByRole('dialog', { name: /how to play long time/i });

    expect(within(dialog).getAllByText(/built by jakal flow/i)).toHaveLength(2);
    expect(within(dialog).getByRole('heading', { name: /what is janggi\?/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: /piece guide/i })).toBeInTheDocument();
    expect(within(dialog).getByText(/click your own piece to select it/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/reset board returns the current scenario/i)).toBeInTheDocument();
  });
});
