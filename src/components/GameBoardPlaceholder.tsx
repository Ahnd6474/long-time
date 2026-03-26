import type { BoardCell } from '../game/types';

type GameBoardPlaceholderProps = {
  board: BoardCell[][];
};

export function GameBoardPlaceholder({ board }: GameBoardPlaceholderProps) {
  return (
    <section className="panel board-panel" aria-labelledby="board-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Web App Bootstrap</p>
          <h2 id="board-title">Board Surface</h2>
        </div>
      </div>

      <div className="board-grid" role="grid" aria-label="Janggi board placeholder">
        {board.map((row, rowIndex) =>
          row.map((cell, columnIndex) => (
            <div
              key={`${rowIndex}-${columnIndex}`}
              className="board-cell"
              role="gridcell"
              aria-label={`Row ${rowIndex + 1} column ${columnIndex + 1}`}
            >
              {cell.label}
            </div>
          )),
        )}
      </div>
    </section>
  );
}
