import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../state/gameState';

describe('createInitialGameState', () => {
  it('creates a 10 by 9 board for the web app bootstrap', () => {
    const state = createInitialGameState();

    expect(state.board).toHaveLength(10);
    expect(state.board[0]).toHaveLength(9);
    expect(state.currentTurn).toBe('blue');
    expect(state.status).toBe('setup');
  });
});
