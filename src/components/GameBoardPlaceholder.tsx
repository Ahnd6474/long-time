import { createBoardCells } from '../game/board';
import type { Board, PieceType } from '../game/types';

type GameBoardPlaceholderProps = {
  board: Board;
};

const PIECE_LABELS: Record<PieceType, string> = {
  general: 'Ge',
  guard: 'Gu',
  horse: 'Ho',
  elephant: 'El',
  chariot: 'Ch',
  cannon: 'Ca',
  soldier: 'So',
};

export function GameBoardPlaceholder({ board }: GameBoardPlaceholderProps) {
  const boardCells = createBoardCells(board);

  return (
    <section className="panel board-panel" aria-labelledby="board-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Rules Engine</p>
          <h2 id="board-title">Initial Board State</h2>
        </div>
      </div>

      <div className="board-grid" role="grid" aria-label="Janggi board state">
        {boardCells.map((row) =>
          row.map((cell) => (
            <div
              key={`${cell.row}-${cell.column}`}
              className="board-cell"
              role="gridcell"
              aria-label={`Row ${cell.row + 1} column ${cell.column + 1}`}
            >
              {cell.piece ? `${cell.piece.color[0].toUpperCase()}-${PIECE_LABELS[cell.piece.type]}` : ''}
            </div>
          )),
        )}
      </div>
    </section>
  );
}
