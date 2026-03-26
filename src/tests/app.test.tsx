import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
});
