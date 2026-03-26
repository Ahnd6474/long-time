import { createEmptyBoard } from '../game/board';
import type { BoardCell } from '../game/types';

export type GameState = {
  board: BoardCell[][];
  currentTurn: 'blue';
  status: 'setup';
};

export function createInitialGameState(): GameState {
  return {
    board: createEmptyBoard(),
    currentTurn: 'blue',
    status: 'setup',
  };
}
