import { createBoardCells, isInsidePalace, positionsEqual } from '../game/board';
import type { Board, LegalMove, PieceType, PlayerColor, Position } from '../game/types';

type GameBoardProps = {
  board: Board;
  currentTurn: PlayerColor;
  currentTurnLabel: string;
  selectedPosition: Position | null;
  legalMoves: LegalMove[];
  invalidPosition: Position | null;
  onCellClick: (position: Position) => void;
};

type CellState = 'idle' | 'selected' | 'legal' | 'capture';

const PIECE_CODES: Record<PieceType, string> = {
  general: 'GEN',
  guard: 'GRD',
  horse: 'HOR',
  elephant: 'ELP',
  chariot: 'CHA',
  cannon: 'CAN',
  soldier: 'SOL',
};

const PIECE_NAMES: Record<PieceType, string> = {
  general: 'General',
  guard: 'Guard',
  horse: 'Horse',
  elephant: 'Elephant',
  chariot: 'Chariot',
  cannon: 'Cannon',
  soldier: 'Soldier',
};

const MOVE_GUIDE_ITEMS = [
  {
    label: 'Selected',
    className: 'board-guide-item__swatch--selected',
  },
  {
    label: 'Legal',
    className: 'board-guide-item__swatch--legal',
  },
  {
    label: 'Capture',
    className: 'board-guide-item__swatch--capture',
  },
];

function getCellState(
  position: Position,
  selectedPosition: Position | null,
  legalMoves: LegalMove[],
): CellState {
  if (selectedPosition && positionsEqual(position, selectedPosition)) {
    return 'selected';
  }

  const matchingMove = legalMoves.find((move) => positionsEqual(move.to, position));

  if (!matchingMove) {
    return 'idle';
  }

  return matchingMove.capturedPiece ? 'capture' : 'legal';
}

function getCellAriaLabel(
  label: string,
  pieceLabel: string | null,
  cellState: CellState,
  isPalaceCell: boolean,
  isInvalid: boolean,
): string {
  const parts = [`Cell ${label}`, pieceLabel ?? 'empty'];

  if (cellState === 'selected') {
    parts.push('selected');
  }

  if (cellState === 'legal') {
    parts.push('legal move');
  }

  if (cellState === 'capture') {
    parts.push('capture move');
  }

  if (isPalaceCell) {
    parts.push('palace');
  }

  if (isInvalid) {
    parts.push('invalid');
  }

  return parts.join(', ');
}

export function GameBoard({
  board,
  currentTurn,
  currentTurnLabel,
  selectedPosition,
  legalMoves,
  invalidPosition,
  onCellClick,
}: GameBoardProps) {
  const boardCells = createBoardCells(board);

  return (
    <section className="panel board-panel" aria-labelledby="board-title">
      <div className="panel-heading board-panel-heading">
        <div>
          <p className="eyebrow">Playable Board</p>
          <h2 id="board-title">Janggi board</h2>
        </div>
        <p className="board-caption">
          Current state: <span>{currentTurnLabel}</span>
        </p>
      </div>

      <div className="board-guide-row">
        <p className="board-guide-copy">Blue opens at the top. Palace spaces carry a warmer tone.</p>
        <ul className="board-guide-list" aria-label="Move state guide">
          {MOVE_GUIDE_ITEMS.map((item) => (
            <li key={item.label} className="board-guide-item">
              <span className={`board-guide-item__swatch ${item.className}`} aria-hidden="true" />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="board-frame">
        <div className="board-grid" role="grid" aria-label="Playable Janggi board">
          {boardCells.flat().map((cell) => {
            const position = { row: cell.row, column: cell.column };
            const cellState = getCellState(position, selectedPosition, legalMoves);
            const pieceLabel = cell.piece ? `${cell.piece.color} ${PIECE_NAMES[cell.piece.type]}` : null;
            const isPalaceCell = isInsidePalace(position);
            const isInvalid = invalidPosition ? positionsEqual(position, invalidPosition) : false;

            return (
              <button
                key={cell.label}
                aria-label={getCellAriaLabel(cell.label, pieceLabel, cellState, isPalaceCell, isInvalid)}
                aria-pressed={cellState === 'selected'}
                className={`board-cell board-cell--${cellState} ${
                  isPalaceCell ? 'board-cell--palace' : ''
                } ${isInvalid ? 'board-cell--invalid' : ''} ${
                  cell.piece?.color === currentTurn ? 'board-cell--active-side' : ''
                }`}
                data-cell-state={cellState}
                data-invalid={isInvalid ? 'true' : 'false'}
                data-move-state={cellState}
                data-piece={cell.piece ? `${cell.piece.color}-${cell.piece.type}` : 'empty'}
                data-testid={`cell-${cell.row}-${cell.column}`}
                type="button"
                onClick={() => onCellClick(position)}
              >
                <span className="cell-coordinate">{cell.label}</span>

                {cellState === 'legal' ? <span className="move-indicator" aria-hidden="true" /> : null}
                {cellState === 'capture' ? (
                  <span className="capture-indicator" aria-hidden="true" />
                ) : null}

                {cell.piece ? (
                  <span className={`piece-token piece-token--${cell.piece.color}`}>
                    <span className="piece-code">{PIECE_CODES[cell.piece.type]}</span>
                    <span className="piece-name">{PIECE_NAMES[cell.piece.type]}</span>
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
