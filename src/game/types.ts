export const BOARD_ROWS = 10;
export const BOARD_COLUMNS = 9;

export type PlayerColor = 'blue' | 'red';

export type PieceType =
  | 'general'
  | 'guard'
  | 'horse'
  | 'elephant'
  | 'chariot'
  | 'cannon'
  | 'soldier';

export type Position = {
  row: number;
  column: number;
};

export type Piece = {
  id: string;
  color: PlayerColor;
  type: PieceType;
};

export type Board = Array<Array<Piece | null>>;

export type BoardCell = {
  row: number;
  column: number;
  label: string;
  piece: Piece | null;
};

export type GameStatus = 'active' | 'finished';

export type LegalMove = {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece: Piece | null;
};

export type MoveHistoryEntry = {
  move: LegalMove;
  previousTurn: PlayerColor;
  previousStatus: GameStatus;
  previousWinner: PlayerColor | null;
};

export type GameState = {
  board: Board;
  currentTurn: PlayerColor;
  status: GameStatus;
  winner: PlayerColor | null;
  moveHistory: MoveHistoryEntry[];
};

export type MoveInput = {
  from: Position;
  to: Position;
};

export type MoveFailureReason =
  | 'game-over'
  | 'no-piece-at-source'
  | 'wrong-turn'
  | 'illegal-move';

export type MoveValidationResult =
  | {
      ok: true;
      move: LegalMove;
    }
  | {
      ok: false;
      reason: MoveFailureReason;
    };

export type ApplyMoveResult =
  | {
      ok: true;
      state: GameState;
      move: MoveHistoryEntry;
    }
  | {
      ok: false;
      reason: MoveFailureReason;
    };

export type UndoMoveResult =
  | {
      ok: true;
      state: GameState;
      move: MoveHistoryEntry;
    }
  | {
      ok: false;
      reason: 'no-history';
    };
