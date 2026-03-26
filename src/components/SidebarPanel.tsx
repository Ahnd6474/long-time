type SidebarPanelProps = {
  currentTurnLabel: string;
  selectedSummary: string;
  legalMoveCount: number;
  moveCount: number;
  statusMessage: string;
  canUndo: boolean;
  canClearSelection: boolean;
  onUndo: () => void;
  onNewGame: () => void;
  onClearSelection: () => void;
};

const LEGEND_ITEMS = [
  {
    className: 'legend-swatch--selected',
    label: 'Selected piece',
  },
  {
    className: 'legend-swatch--legal',
    label: 'Legal move',
  },
  {
    className: 'legend-swatch--capture',
    label: 'Capture move',
  },
  {
    className: 'legend-swatch--invalid',
    label: 'Invalid click',
  },
];

export function SidebarPanel({
  currentTurnLabel,
  selectedSummary,
  legalMoveCount,
  moveCount,
  statusMessage,
  canUndo,
  canClearSelection,
  onUndo,
  onNewGame,
  onClearSelection,
}: SidebarPanelProps) {
  return (
    <aside className="panel sidebar-panel" aria-labelledby="sidebar-title">
      <div className="panel-heading">
        <p className="eyebrow">Match State</p>
        <h2 id="sidebar-title" data-testid="turn-indicator">
          {currentTurnLabel}
        </h2>
        <p className="sidebar-copy">
          Pass-and-play Janggi with immediate move feedback, board-side controls, and visible turn
          flow.
        </p>
      </div>

      <div className="status-strip" role="status" aria-live="polite">
        {statusMessage}
      </div>

      <section className="sidebar-section" aria-labelledby="selection-title">
        <h3 id="selection-title">Selection</h3>
        <dl className="detail-list">
          <div>
            <dt>Active piece</dt>
            <dd>{selectedSummary}</dd>
          </div>
          <div>
            <dt>Legal targets</dt>
            <dd>{legalMoveCount}</dd>
          </div>
          <div>
            <dt>Moves played</dt>
            <dd>{moveCount}</dd>
          </div>
        </dl>
      </section>

      <section className="sidebar-section" aria-labelledby="controls-title">
        <h3 id="controls-title">Controls</h3>
        <div className="control-stack">
          <button className="control-button" type="button" onClick={onUndo} disabled={!canUndo}>
            Undo move
          </button>
          <button
            className="control-button control-button--secondary"
            type="button"
            onClick={onClearSelection}
            disabled={!canClearSelection}
          >
            Clear selection
          </button>
          <button
            className="control-button control-button--secondary"
            type="button"
            onClick={onNewGame}
          >
            New game
          </button>
        </div>
      </section>

      <section className="sidebar-section" aria-labelledby="legend-title">
        <h3 id="legend-title">Board legend</h3>
        <ul className="legend-list">
          {LEGEND_ITEMS.map((item) => (
            <li key={item.label}>
              <span className={`legend-swatch ${item.className}`} aria-hidden="true" />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="panel-footer">Built by Jakal Flow</footer>
    </aside>
  );
}
