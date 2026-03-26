import {
  cloneBoard,
  createEmptyBoard,
  createInitialBoard,
  findGeneralPosition,
  getForwardStep,
  getOpponentColor,
  getPalaceConnections,
  getPalaceDiagonalLines,
  getPieceAt,
  isInsideBoard,
  isInsideEnemyPalace,
  positionsEqual,
} from './board';
import type {
  ApplyMoveResult,
  Board,
  GameState,
  LegalMove,
  MoveFailureReason,
  MoveHistoryEntry,
  MoveInput,
  MoveValidationResult,
  Piece,
  PlayerColor,
  Position,
  UndoMoveResult,
} from './types';

const ORTHOGONAL_DIRECTIONS: Position[] = [
  { row: -1, column: 0 },
  { row: 1, column: 0 },
  { row: 0, column: -1 },
  { row: 0, column: 1 },
];

const HORSE_PATTERNS = [
  {
    blocker: { row: -1, column: 0 },
    destinations: [
      { row: -2, column: -1 },
      { row: -2, column: 1 },
    ],
  },
  {
    blocker: { row: 1, column: 0 },
    destinations: [
      { row: 2, column: -1 },
      { row: 2, column: 1 },
    ],
  },
  {
    blocker: { row: 0, column: -1 },
    destinations: [
      { row: -1, column: -2 },
      { row: 1, column: -2 },
    ],
  },
  {
    blocker: { row: 0, column: 1 },
    destinations: [
      { row: -1, column: 2 },
      { row: 1, column: 2 },
    ],
  },
];

const ELEPHANT_PATTERNS = [
  {
    blockers: [
      { row: -1, column: 0 },
      { row: -2, column: -1 },
    ],
    destination: { row: -3, column: -2 },
  },
  {
    blockers: [
      { row: -1, column: 0 },
      { row: -2, column: 1 },
    ],
    destination: { row: -3, column: 2 },
  },
  {
    blockers: [
      { row: 1, column: 0 },
      { row: 2, column: -1 },
    ],
    destination: { row: 3, column: -2 },
  },
  {
    blockers: [
      { row: 1, column: 0 },
      { row: 2, column: 1 },
    ],
    destination: { row: 3, column: 2 },
  },
  {
    blockers: [
      { row: 0, column: -1 },
      { row: -1, column: -2 },
    ],
    destination: { row: -2, column: -3 },
  },
  {
    blockers: [
      { row: 0, column: -1 },
      { row: 1, column: -2 },
    ],
    destination: { row: 2, column: -3 },
  },
  {
    blockers: [
      { row: 0, column: 1 },
      { row: -1, column: 2 },
    ],
    destination: { row: -2, column: 3 },
  },
  {
    blockers: [
      { row: 0, column: 1 },
      { row: 1, column: 2 },
    ],
    destination: { row: 2, column: 3 },
  },
];

type CreateGameStateOptions = Partial<GameState>;

export function createGameState(options: CreateGameStateOptions = {}): GameState {
  return {
    board: options.board ?? createEmptyBoard(),
    currentTurn: options.currentTurn ?? 'blue',
    status: options.status ?? 'active',
    winner: options.winner ?? null,
    moveHistory: options.moveHistory ?? [],
  };
}

export function createInitialGameState(): GameState {
  return createGameState({
    board: createInitialBoard(),
  });
}

export function getLegalMoves(state: GameState, position: Position): LegalMove[] {
  if (state.status === 'finished') {
    return [];
  }

  const piece = getPieceAt(state.board, position);

  if (!piece || piece.color !== state.currentTurn) {
    return [];
  }

  return getPseudoLegalMoves(state.board, position, piece).filter(
    (move) => !wouldExposeGeneral(state.board, move, piece.color),
  );
}

export function getLegalMovesForPosition(state: GameState, position: Position): LegalMove[] {
  return getLegalMoves(state, position);
}

export function getAllLegalMoves(
  state: GameState,
  color: PlayerColor = state.currentTurn,
): LegalMove[] {
  if (state.status === 'finished') {
    return [];
  }

  const legalMoves: LegalMove[] = [];

  for (let row = 0; row < state.board.length; row += 1) {
    for (let column = 0; column < state.board[row].length; column += 1) {
      const piece = state.board[row][column];

      if (!piece || piece.color !== color) {
        continue;
      }

      legalMoves.push(
        ...getPseudoLegalMoves(state.board, { row, column }, piece).filter(
          (move) => !wouldExposeGeneral(state.board, move, piece.color),
        ),
      );
    }
  }

  return legalMoves;
}

export function validateMove(state: GameState, input: MoveInput): MoveValidationResult {
  if (state.status === 'finished') {
    return { ok: false, reason: 'game-over' };
  }

  const piece = getPieceAt(state.board, input.from);

  if (!piece) {
    return { ok: false, reason: 'no-piece-at-source' };
  }

  if (piece.color !== state.currentTurn) {
    return { ok: false, reason: 'wrong-turn' };
  }

  const legalMove = getLegalMoves(state, input.from).find((move) =>
    positionsEqual(move.to, input.to),
  );

  if (!legalMove) {
    return { ok: false, reason: 'illegal-move' };
  }

  return {
    ok: true,
    move: legalMove,
  };
}

export function applyMove(state: GameState, input: MoveInput): ApplyMoveResult {
  const validation = validateMove(state, input);

  if (!validation.ok) {
    return validation;
  }

  const nextBoard = applyLegalMoveToBoard(state.board, validation.move);
  const moveHistoryEntry: MoveHistoryEntry = {
    move: validation.move,
    previousTurn: state.currentTurn,
    previousStatus: state.status,
    previousWinner: state.winner,
  };
  const didCaptureGeneral = validation.move.capturedPiece?.type === 'general';

  return {
    ok: true,
    move: moveHistoryEntry,
    state: {
      board: nextBoard,
      currentTurn: getOpponentColor(state.currentTurn),
      status: didCaptureGeneral ? 'finished' : 'active',
      winner: didCaptureGeneral ? state.currentTurn : null,
      moveHistory: [...state.moveHistory, moveHistoryEntry],
    },
  };
}

export function undoMove(state: GameState): UndoMoveResult {
  const lastMove = state.moveHistory[state.moveHistory.length - 1];

  if (!lastMove) {
    return {
      ok: false,
      reason: 'no-history',
    };
  }

  const previousBoard = cloneBoard(state.board);
  const { from, to, piece, capturedPiece } = lastMove.move;

  previousBoard[from.row][from.column] = piece;
  previousBoard[to.row][to.column] = capturedPiece;

  return {
    ok: true,
    move: lastMove,
    state: {
      board: previousBoard,
      currentTurn: lastMove.previousTurn,
      status: lastMove.previousStatus,
      winner: lastMove.previousWinner,
      moveHistory: state.moveHistory.slice(0, -1),
    },
  };
}

export function undoLastMove(state: GameState): UndoMoveResult {
  return undoMove(state);
}

export function isPlayerInCheck(
  state: Pick<GameState, 'board'>,
  color: PlayerColor,
): boolean {
  const generalPosition = findGeneralPosition(state.board, color);

  if (!generalPosition) {
    return true;
  }

  return isPositionThreatened(state.board, generalPosition, getOpponentColor(color));
}

function getPseudoLegalMoves(board: Board, from: Position, piece: Piece): LegalMove[] {
  switch (piece.type) {
    case 'general':
    case 'guard':
      return getPalaceStepMoves(board, from, piece);
    case 'horse':
      return getHorseMoves(board, from, piece);
    case 'elephant':
      return getElephantMoves(board, from, piece);
    case 'chariot':
      return getChariotMoves(board, from, piece);
    case 'cannon':
      return getCannonMoves(board, from, piece);
    case 'soldier':
      return getSoldierMoves(board, from, piece);
    default:
      return [];
  }
}

function getPalaceStepMoves(board: Board, from: Position, piece: Piece): LegalMove[] {
  const moves: LegalMove[] = [];

  for (const target of getPalaceConnections(from)) {
    pushMoveIfAvailable(moves, board, from, target, piece);
  }

  return moves;
}

function getHorseMoves(board: Board, from: Position, piece: Piece): LegalMove[] {
  const moves: LegalMove[] = [];

  for (const pattern of HORSE_PATTERNS) {
    const blockerPosition = offsetPosition(from, pattern.blocker);

    if (!isInsideBoard(blockerPosition) || getPieceAt(board, blockerPosition)) {
      continue;
    }

    for (const destinationOffset of pattern.destinations) {
      pushMoveIfAvailable(moves, board, from, offsetPosition(from, destinationOffset), piece);
    }
  }

  return moves;
}

function getElephantMoves(board: Board, from: Position, piece: Piece): LegalMove[] {
  const moves: LegalMove[] = [];

  for (const pattern of ELEPHANT_PATTERNS) {
    const blockersAreClear = pattern.blockers.every((offset) => {
      const blockerPosition = offsetPosition(from, offset);
      return isInsideBoard(blockerPosition) && !getPieceAt(board, blockerPosition);
    });

    if (!blockersAreClear) {
      continue;
    }

    pushMoveIfAvailable(moves, board, from, offsetPosition(from, pattern.destination), piece);
  }

  return moves;
}

function getChariotMoves(board: Board, from: Position, piece: Piece): LegalMove[] {
  const moves: LegalMove[] = [];

  for (const direction of ORTHOGONAL_DIRECTIONS) {
    collectSlidingMoves(moves, board, from, piece, direction);
  }

  for (const line of getPalaceDiagonalLines(from)) {
    const lineIndex = line.findIndex((position) => positionsEqual(position, from));
    collectLineMoves(moves, board, from, piece, line, lineIndex);
  }

  return moves;
}

function getCannonMoves(board: Board, from: Position, piece: Piece): LegalMove[] {
  const moves: LegalMove[] = [];

  for (const direction of ORTHOGONAL_DIRECTIONS) {
    collectCannonMovesInDirection(moves, board, from, piece, direction);
  }

  for (const line of getPalaceDiagonalLines(from)) {
    const lineIndex = line.findIndex((position) => positionsEqual(position, from));

    if (lineIndex !== 0 && lineIndex !== line.length - 1) {
      continue;
    }

    const centerPiece = getPieceAt(board, line[1]);
    const target = lineIndex === 0 ? line[2] : line[0];

    if (!centerPiece || centerPiece.type === 'cannon') {
      continue;
    }

    const targetPiece = getPieceAt(board, target);

    if (!targetPiece) {
      moves.push(createMove(from, target, piece, null));
      continue;
    }

    if (targetPiece.color !== piece.color && targetPiece.type !== 'cannon') {
      moves.push(createMove(from, target, piece, targetPiece));
    }
  }

  return moves;
}

function getSoldierMoves(board: Board, from: Position, piece: Piece): LegalMove[] {
  const moves: LegalMove[] = [];
  const forwardStep = getForwardStep(piece.color);

  pushMoveIfAvailable(
    moves,
    board,
    from,
    { row: from.row + forwardStep, column: from.column },
    piece,
  );
  pushMoveIfAvailable(moves, board, from, { row: from.row, column: from.column - 1 }, piece);
  pushMoveIfAvailable(moves, board, from, { row: from.row, column: from.column + 1 }, piece);

  if (!isInsideEnemyPalace(from, piece.color)) {
    return moves;
  }

  for (const target of getPalaceConnections(from)) {
    if (target.row - from.row !== forwardStep || Math.abs(target.column - from.column) !== 1) {
      continue;
    }

    pushMoveIfAvailable(moves, board, from, target, piece);
  }

  return moves;
}

function collectSlidingMoves(
  moves: LegalMove[],
  board: Board,
  from: Position,
  piece: Piece,
  direction: Position,
): void {
  let target = offsetPosition(from, direction);

  while (isInsideBoard(target)) {
    const targetPiece = getPieceAt(board, target);

    if (!targetPiece) {
      moves.push(createMove(from, target, piece, null));
      target = offsetPosition(target, direction);
      continue;
    }

    if (targetPiece.color !== piece.color) {
      moves.push(createMove(from, target, piece, targetPiece));
    }

    return;
  }
}

function collectLineMoves(
  moves: LegalMove[],
  board: Board,
  from: Position,
  piece: Piece,
  line: Position[],
  startIndex: number,
): void {
  for (const step of [-1, 1]) {
    let index = startIndex + step;

    while (index >= 0 && index < line.length) {
      const target = line[index];
      const targetPiece = getPieceAt(board, target);

      if (!targetPiece) {
        moves.push(createMove(from, target, piece, null));
        index += step;
        continue;
      }

      if (targetPiece.color !== piece.color) {
        moves.push(createMove(from, target, piece, targetPiece));
      }

      break;
    }
  }
}

function collectCannonMovesInDirection(
  moves: LegalMove[],
  board: Board,
  from: Position,
  piece: Piece,
  direction: Position,
): void {
  let target = offsetPosition(from, direction);
  let screen: Piece | null = null;

  while (isInsideBoard(target)) {
    const targetPiece = getPieceAt(board, target);

    if (!screen) {
      if (!targetPiece) {
        target = offsetPosition(target, direction);
        continue;
      }

      if (targetPiece.type === 'cannon') {
        return;
      }

      screen = targetPiece;
      target = offsetPosition(target, direction);
      continue;
    }

    if (!targetPiece) {
      moves.push(createMove(from, target, piece, null));
      target = offsetPosition(target, direction);
      continue;
    }

    if (targetPiece.color !== piece.color && targetPiece.type !== 'cannon') {
      moves.push(createMove(from, target, piece, targetPiece));
    }

    return;
  }
}

function pushMoveIfAvailable(
  moves: LegalMove[],
  board: Board,
  from: Position,
  target: Position,
  piece: Piece,
): void {
  if (!isInsideBoard(target)) {
    return;
  }

  const targetPiece = getPieceAt(board, target);

  if (targetPiece?.color === piece.color) {
    return;
  }

  moves.push(createMove(from, target, piece, targetPiece ?? null));
}

function createMove(
  from: Position,
  to: Position,
  piece: Piece,
  capturedPiece: Piece | null,
): LegalMove {
  return {
    from,
    to,
    piece,
    capturedPiece,
  };
}

function applyLegalMoveToBoard(board: Board, move: LegalMove): Board {
  const nextBoard = cloneBoard(board);

  nextBoard[move.from.row][move.from.column] = null;
  nextBoard[move.to.row][move.to.column] = move.piece;

  return nextBoard;
}

function wouldExposeGeneral(board: Board, move: LegalMove, color: PlayerColor): boolean {
  const nextBoard = applyLegalMoveToBoard(board, move);
  const generalPosition = findGeneralPosition(nextBoard, color);

  if (!generalPosition) {
    return false;
  }

  return isPositionThreatened(nextBoard, generalPosition, getOpponentColor(color));
}

function isPositionThreatened(
  board: Board,
  target: Position,
  attackerColor: PlayerColor,
): boolean {
  for (let row = 0; row < board.length; row += 1) {
    for (let column = 0; column < board[row].length; column += 1) {
      const piece = board[row][column];

      if (!piece || piece.color !== attackerColor) {
        continue;
      }

      const moves = getPseudoLegalMoves(board, { row, column }, piece);

      if (moves.some((move) => positionsEqual(move.to, target))) {
        return true;
      }
    }
  }

  return false;
}

function offsetPosition(position: Position, offset: Position): Position {
  return {
    row: position.row + offset.row,
    column: position.column + offset.column,
  };
}

export function getMoveFailureMessage(reason: MoveFailureReason): string {
  switch (reason) {
    case 'game-over':
      return 'The game is already finished.';
    case 'no-piece-at-source':
      return 'There is no piece at the selected source position.';
    case 'wrong-turn':
      return 'It is not that piece’s turn.';
    case 'illegal-move':
      return 'That move is not legal in the current position.';
    default:
      return 'The move could not be applied.';
  }
}
