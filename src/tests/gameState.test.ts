import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../state/gameState';

describe('createInitialGameState', () => {
  it('creates the standard 10 by 9 janggi setup', () => {
    const state = createInitialGameState();

    expect(state.board).toHaveLength(10);
    expect(state.board[0]).toHaveLength(9);
    expect(state.currentTurn).toBe('blue');
    expect(state.status).toBe('active');
    expect(state.winner).toBeNull();
    expect(state.moveHistory).toHaveLength(0);

    expect(state.board[1][4]?.type).toBe('general');
    expect(state.board[1][4]?.color).toBe('blue');
    expect(state.board[8][4]?.type).toBe('general');
    expect(state.board[8][4]?.color).toBe('red');
    expect(state.board[2][1]?.type).toBe('cannon');
    expect(state.board[7][7]?.type).toBe('cannon');
    expect(state.board[3][4]?.type).toBe('soldier');
    expect(state.board[6][4]?.type).toBe('soldier');
  });
});
