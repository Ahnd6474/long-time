import type { BoardCell } from './types';

const BOARD_ROWS = 10;
const BOARD_COLUMNS = 9;

export function createEmptyBoard(): BoardCell[][] {
  return Array.from({ length: BOARD_ROWS }, (_, rowIndex) =>
    Array.from({ length: BOARD_COLUMNS }, (_, columnIndex) => ({
      row: rowIndex,
      column: columnIndex,
      label: `${rowIndex + 1}-${columnIndex + 1}`,
    })),
  );
}
