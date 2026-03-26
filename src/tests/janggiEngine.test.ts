import { describe, expect, it } from 'vitest';
import { createEmptyBoard } from '../game/board';
import {
  applyMove,
  createInitialGameState,
  getLegalMovesForPosition,
  isPlayerInCheck,
  undoLastMove,
  validateMove,
} from '../game/engine';
import type { GameState, Piece, PieceType, PlayerColor, Position } from '../game/types';

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

  return {
    board,
    currentTurn,
    status: 'active',
    winner: null,
    moveHistory: [],
  };
}

function moveTargets(state: GameState, position: Position): string[] {
  return getLegalMovesForPosition(state, position).map((move) => `${move.to.row},${move.to.column}`);
}

describe('janggi move generation', () => {
  it('keeps generals inside the palace while allowing every connected palace step', () => {
    const blueGeneral = createPiece('blue', 'general');
    const redGeneral = createPiece('red', 'general');
    const state = createState([
      { piece: blueGeneral, position: { row: 1, column: 4 } },
      { piece: redGeneral, position: { row: 8, column: 4 } },
    ]);

    expect(moveTargets(state, { row: 1, column: 4 }).sort()).toEqual([
      '0,3',
      '0,4',
      '0,5',
      '1,3',
      '1,5',
      '2,3',
      '2,4',
      '2,5',
    ]);
  });

  it('lets guards capture inside the palace but not land on allies or leave the palace', () => {
    const guard = createPiece('blue', 'guard');
    const alliedSoldier = createPiece('blue', 'soldier', 'ally');
    const enemySoldier = createPiece('red', 'soldier', 'enemy');
    const blueGeneral = createPiece('blue', 'general');
    const redGeneral = createPiece('red', 'general');
    const state = createState([
      { piece: guard, position: { row: 0, column: 3 } },
      { piece: alliedSoldier, position: { row: 1, column: 3 } },
      { piece: enemySoldier, position: { row: 0, column: 4 } },
      { piece: blueGeneral, position: { row: 2, column: 4 } },
      { piece: redGeneral, position: { row: 8, column: 4 } },
    ]);

    expect(moveTargets(state, { row: 0, column: 3 }).sort()).toEqual(['0,4', '1,4']);
  });

  it('blocks horses when the first orthogonal step is occupied', () => {
    const horse = createPiece('blue', 'horse');
    const blocker = createPiece('blue', 'soldier', 'blocker');
    const blueGeneral = createPiece('blue', 'general');
    const redGeneral = createPiece('red', 'general');
    const state = createState([
      { piece: horse, position: { row: 4, column: 4 } },
      { piece: blocker, position: { row: 3, column: 4 } },
      { piece: blueGeneral, position: { row: 1, column: 4 } },
      { piece: redGeneral, position: { row: 8, column: 4 } },
    ]);

    const targets = moveTargets(state, { row: 4, column: 4 });

    expect(targets).toEqual(
      expect.arrayContaining(['6,3', '6,5', '3,2', '5,2', '3,6', '5,6']),
    );
    expect(targets).not.toContain('2,3');
    expect(targets).not.toContain('2,5');
  });

  it('blocks elephants when either intermediate point is occupied', () => {
    const elephant = createPiece('blue', 'elephant');
    const blocker = createPiece('blue', 'soldier', 'blocker');
    const blueGeneral = createPiece('blue', 'general');
    const redGeneral = createPiece('red', 'general');
    const state = createState([
      { piece: elephant, position: { row: 4, column: 4 } },
      { piece: blocker, position: { row: 5, column: 4 } },
      { piece: blueGeneral, position: { row: 1, column: 4 } },
      { piece: redGeneral, position: { row: 8, column: 4 } },
    ]);

    const targets = moveTargets(state, { row: 4, column: 4 });

    expect(targets).toEqual(
      expect.arrayContaining(['1,2', '1,6', '2,1', '6,1', '2,7', '6,7']),
    );
    expect(targets).not.toContain('7,2');
    expect(targets).not.toContain('7,6');
  });

  it('allows chariots to move diagonally through the palace', () => {
    const chariot = createPiece('blue', 'chariot');
    const blueGeneral = createPiece('blue', 'general');
    const redGeneral = createPiece('red', 'general');
    const state = createState([
      { piece: chariot, position: { row: 0, column: 3 } },
      { piece: blueGeneral, position: { row: 2, column: 3 } },
      { piece: redGeneral, position: { row: 8, column: 4 } },
    ]);

    expect(moveTargets(state, { row: 0, column: 3 })).toEqual(
      expect.arrayContaining(['1,4', '2,5']),
    );
  });

  it('stops chariots at the first occupied square and only allows the first enemy capture', () => {
    const chariot = createPiece('blue', 'chariot');
    const alliedSoldier = createPiece('blue', 'soldier', 'ally');
    const targetHorse = createPiece('red', 'horse', 'target');
    const hiddenEnemy = createPiece('red', 'soldier', 'hidden');
    const blueGeneral = createPiece('blue', 'general');
    const redGeneral = createPiece('red', 'general');
    const state = createState([
      { piece: chariot, position: { row: 4, column: 4 } },
      { piece: alliedSoldier, position: { row: 4, column: 2 } },
      { piece: targetHorse, position: { row: 4, column: 6 } },
      { piece: hiddenEnemy, position: { row: 4, column: 8 } },
      { piece: blueGeneral, position: { row: 1, column: 4 } },
      { piece: redGeneral, position: { row: 8, column: 4 } },
    ]);

    const targets = moveTargets(state, { row: 4, column: 4 });

    expect(targets).toEqual(expect.arrayContaining(['4,3', '4,5', '4,6']));
    expect(targets).not.toContain('4,2');
    expect(targets).not.toContain('4,1');
    expect(targets).not.toContain('4,7');
    expect(targets).not.toContain('4,8');
  });

  it('requires a non-cannon screen for cannon movement and captures', () => {
    const cannon = createPiece('blue', 'cannon');
    const screen = createPiece('blue', 'soldier', 'screen');
    const target = createPiece('red', 'horse', 'target');
    const redCannon = createPiece('red', 'cannon', 'target-cannon');
    const blueGeneral = createPiece('blue', 'general');
    const redGeneral = createPiece('red', 'general');
    const state = createState([
      { piece: cannon, position: { row: 4, column: 1 } },
      { piece: screen, position: { row: 4, column: 3 } },
      { piece: target, position: { row: 4, column: 6 } },
      { piece: redCannon, position: { row: 4, column: 8 } },
      { piece: blueGeneral, position: { row: 1, column: 4 } },
      { piece: redGeneral, position: { row: 8, column: 4 } },
    ]);

    const targets = moveTargets(state, { row: 4, column: 1 });

    expect(targets).toEqual(
      expect.arrayContaining(['4,4', '4,5', '4,6']),
    );
    expect(targets).not.toContain('4,8');
  });

  it('allows soldiers to use forward palace diagonals in the enemy palace', () => {
    const soldier = createPiece('blue', 'soldier');
    const blueGeneral = createPiece('blue', 'general');
    const redGeneral = createPiece('red', 'general');
    const state = createState([
      { piece: soldier, position: { row: 8, column: 4 } },
      { piece: blueGeneral, position: { row: 1, column: 4 } },
      { piece: redGeneral, position: { row: 9, column: 4 } },
    ]);

    const targets = moveTargets(state, { row: 8, column: 4 });

    expect(targets).toEqual(
      expect.arrayContaining(['9,3', '9,5', '8,3', '8,5']),
    );
    expect(targets).not.toContain('7,3');
    expect(targets).not.toContain('7,5');
  });
});

describe('janggi validation and history', () => {
  it('reports empty-source and wrong-turn failures with distinct reasons', () => {
    const blueGeneral = createPiece('blue', 'general');
    const redGeneral = createPiece('red', 'general');
    const redSoldier = createPiece('red', 'soldier');
    const state = createState([
      { piece: blueGeneral, position: { row: 1, column: 4 } },
      { piece: redGeneral, position: { row: 8, column: 4 } },
      { piece: redSoldier, position: { row: 6, column: 0 } },
    ]);

    expect(validateMove(state, { from: { row: 4, column: 4 }, to: { row: 5, column: 4 } })).toEqual({
      ok: false,
      reason: 'no-piece-at-source',
    });
    expect(validateMove(state, { from: { row: 6, column: 0 }, to: { row: 5, column: 0 } })).toEqual({
      ok: false,
      reason: 'wrong-turn',
    });
  });

  it('rejects moves that break piece movement rules or palace boundaries', () => {
    const blueGeneral = createPiece('blue', 'general');
    const blueGuard = createPiece('blue', 'guard');
    const blueSoldier = createPiece('blue', 'soldier');
    const redGeneral = createPiece('red', 'general');
    const state = createState([
      { piece: blueGeneral, position: { row: 1, column: 4 } },
      { piece: blueGuard, position: { row: 0, column: 3 } },
      { piece: blueSoldier, position: { row: 4, column: 4 } },
      { piece: redGeneral, position: { row: 8, column: 4 } },
    ]);

    expect(validateMove(state, { from: { row: 0, column: 3 }, to: { row: 0, column: 2 } })).toEqual({
      ok: false,
      reason: 'illegal-move',
    });
    expect(validateMove(state, { from: { row: 4, column: 4 }, to: { row: 3, column: 4 } })).toEqual({
      ok: false,
      reason: 'illegal-move',
    });
  });

  it('rejects moves that expose the general to attack', () => {
    const blueGeneral = createPiece('blue', 'general');
    const blueGuard = createPiece('blue', 'guard');
    const redChariot = createPiece('red', 'chariot');
    const redGeneral = createPiece('red', 'general');
    const state = createState([
      { piece: blueGeneral, position: { row: 1, column: 4 } },
      { piece: blueGuard, position: { row: 2, column: 4 } },
      { piece: redChariot, position: { row: 5, column: 4 } },
      { piece: redGeneral, position: { row: 8, column: 4 } },
    ]);

    expect(validateMove(state, { from: { row: 2, column: 4 }, to: { row: 2, column: 3 } })).toEqual({
      ok: false,
      reason: 'illegal-move',
    });
    expect(isPlayerInCheck(state, 'blue')).toBe(false);
  });

  it('applies a legal capture, advances the turn, and stores undo-ready history', () => {
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

    const result = applyMove(state, { from: { row: 4, column: 4 }, to: { row: 5, column: 4 } });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.state.board[5][4]).toEqual(blueSoldier);
    expect(result.state.board[4][4]).toBeNull();
    expect(result.state.currentTurn).toBe('red');
    expect(result.state.moveHistory).toHaveLength(1);
    expect(result.move.move.capturedPiece).toEqual(redSoldier);
  });

  it('finishes the game after a legal general capture and rejects later moves', () => {
    const blueGeneral = createPiece('blue', 'general');
    const redGeneral = createPiece('red', 'general');
    const blueChariot = createPiece('blue', 'chariot');
    const state = createState([
      { piece: blueGeneral, position: { row: 1, column: 4 } },
      { piece: redGeneral, position: { row: 8, column: 4 } },
      { piece: blueChariot, position: { row: 8, column: 3 } },
    ]);

    const result = applyMove(state, { from: { row: 8, column: 3 }, to: { row: 8, column: 4 } });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.state.status).toBe('finished');
    expect(result.state.winner).toBe('blue');
    expect(validateMove(result.state, { from: { row: 1, column: 4 }, to: { row: 2, column: 4 } })).toEqual({
      ok: false,
      reason: 'game-over',
    });
  });

  it('restores the board and turn when undoing the last move', () => {
    const state = createInitialGameState();
    const movedStateResult = applyMove(state, { from: { row: 3, column: 0 }, to: { row: 4, column: 0 } });

    expect(movedStateResult.ok).toBe(true);
    if (!movedStateResult.ok) {
      return;
    }

    const undoResult = undoLastMove(movedStateResult.state);

    expect(undoResult.ok).toBe(true);
    if (!undoResult.ok) {
      return;
    }

    expect(undoResult.state.currentTurn).toBe('blue');
    expect(undoResult.state.board[3][0]?.type).toBe('soldier');
    expect(undoResult.state.board[4][0]).toBeNull();
    expect(undoResult.state.moveHistory).toHaveLength(0);
  });
});
