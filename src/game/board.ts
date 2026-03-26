import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  type Board,
  type BoardCell,
  type Piece,
  type PieceType,
  type PlayerColor,
  type Position,
} from './types';

const BACK_RANK: Array<PieceType | null> = [
  'chariot',
  'horse',
  'elephant',
  'guard',
  null,
  'guard',
  'elephant',
  'horse',
  'chariot',
];

const CANNON_COLUMNS = [1, 7];
const SOLDIER_COLUMNS = [0, 2, 4, 6, 8];

const BLUE_PALACE_ROWS = new Set([0, 1, 2]);
const RED_PALACE_ROWS = new Set([7, 8, 9]);
const PALACE_COLUMNS = new Set([3, 4, 5]);

const PALACE_DIAGONAL_LINES: Position[][] = [
  [
    { row: 0, column: 3 },
    { row: 1, column: 4 },
    { row: 2, column: 5 },
  ],
  [
    { row: 0, column: 5 },
    { row: 1, column: 4 },
    { row: 2, column: 3 },
  ],
  [
    { row: 7, column: 3 },
    { row: 8, column: 4 },
    { row: 9, column: 5 },
  ],
  [
    { row: 7, column: 5 },
    { row: 8, column: 4 },
    { row: 9, column: 3 },
  ],
];

const PALACE_CONNECTIONS = buildPalaceConnections();

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_ROWS }, () =>
    Array.from({ length: BOARD_COLUMNS }, () => null),
  );
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.slice());
}

export function createInitialBoard(): Board {
  const board = createEmptyBoard();
  const pieceCounts = new Map<string, number>();

  const placePiece = (color: PlayerColor, type: PieceType, position: Position) => {
    const key = `${color}-${type}`;
    const nextIndex = (pieceCounts.get(key) ?? 0) + 1;
    pieceCounts.set(key, nextIndex);

    board[position.row][position.column] = {
      id: `${key}-${nextIndex}`,
      color,
      type,
    };
  };

  BACK_RANK.forEach((pieceType, columnIndex) => {
    if (!pieceType) {
      return;
    }

    placePiece('blue', pieceType, { row: 0, column: columnIndex });
    placePiece('red', pieceType, { row: 9, column: columnIndex });
  });

  placePiece('blue', 'general', { row: 1, column: 4 });
  placePiece('red', 'general', { row: 8, column: 4 });

  CANNON_COLUMNS.forEach((column) => {
    placePiece('blue', 'cannon', { row: 2, column });
    placePiece('red', 'cannon', { row: 7, column });
  });

  SOLDIER_COLUMNS.forEach((column) => {
    placePiece('blue', 'soldier', { row: 3, column });
    placePiece('red', 'soldier', { row: 6, column });
  });

  return board;
}

export function createBoardCells(board: Board): BoardCell[][] {
  return board.map((row, rowIndex) =>
    row.map((piece, columnIndex) => ({
      row: rowIndex,
      column: columnIndex,
      label: formatCellLabel({ row: rowIndex, column: columnIndex }),
      piece,
    })),
  );
}

export function formatCellLabel(position: Position): string {
  return `${position.row + 1}-${position.column + 1}`;
}

export function isInsideBoard(position: Position): boolean {
  return (
    position.row >= 0 &&
    position.row < BOARD_ROWS &&
    position.column >= 0 &&
    position.column < BOARD_COLUMNS
  );
}

export function isInsidePalace(position: Position, color?: PlayerColor): boolean {
  if (!PALACE_COLUMNS.has(position.column)) {
    return false;
  }

  if (!color) {
    return RED_PALACE_ROWS.has(position.row) || BLUE_PALACE_ROWS.has(position.row);
  }

  return color === 'red'
    ? RED_PALACE_ROWS.has(position.row)
    : BLUE_PALACE_ROWS.has(position.row);
}

export function isInsideEnemyPalace(position: Position, color: PlayerColor): boolean {
  return isInsidePalace(position, getOpponentColor(color));
}

export function positionsEqual(left: Position, right: Position): boolean {
  return left.row === right.row && left.column === right.column;
}

export function getPieceAt(board: Board, position: Position): Piece | null {
  if (!isInsideBoard(position)) {
    return null;
  }

  return board[position.row][position.column];
}

export function findGeneralPosition(board: Board, color: PlayerColor): Position | null {
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let column = 0; column < BOARD_COLUMNS; column += 1) {
      const piece = board[row][column];

      if (piece && piece.color === color && piece.type === 'general') {
        return { row, column };
      }
    }
  }

  return null;
}

export function getOpponentColor(color: PlayerColor): PlayerColor {
  return color === 'blue' ? 'red' : 'blue';
}

export function getForwardStep(color: PlayerColor): number {
  return color === 'blue' ? 1 : -1;
}

export function getPalaceConnections(position: Position): Position[] {
  return PALACE_CONNECTIONS.get(getPositionKey(position)) ?? [];
}

export function getPalaceDiagonalLines(position: Position): Position[][] {
  return PALACE_DIAGONAL_LINES.filter((line) =>
    line.some((linePosition) => positionsEqual(linePosition, position)),
  );
}

function buildPalaceConnections(): Map<string, Position[]> {
  const connections = new Map<string, Position[]>();

  const attachPalace = (rows: number[]) => {
    for (const row of rows) {
      for (let column = 3; column <= 5; column += 1) {
        const position = { row, column };

        if (row + 1 <= rows[rows.length - 1]) {
          connectPositions(connections, position, { row: row + 1, column });
        }

        if (column + 1 <= 5) {
          connectPositions(connections, position, { row, column: column + 1 });
        }
      }
    }
  };

  attachPalace([0, 1, 2]);
  attachPalace([7, 8, 9]);

  for (const line of PALACE_DIAGONAL_LINES) {
    connectPositions(connections, line[0], line[1]);
    connectPositions(connections, line[1], line[2]);
  }

  return connections;
}

function connectPositions(
  connections: Map<string, Position[]>,
  source: Position,
  target: Position,
): void {
  pushConnection(connections, source, target);
  pushConnection(connections, target, source);
}

function pushConnection(
  connections: Map<string, Position[]>,
  source: Position,
  target: Position,
): void {
  const key = getPositionKey(source);
  const currentTargets = connections.get(key) ?? [];

  if (currentTargets.some((position) => positionsEqual(position, target))) {
    return;
  }

  connections.set(key, [...currentTargets, target]);
}

function getPositionKey(position: Position): string {
  return `${position.row},${position.column}`;
}
