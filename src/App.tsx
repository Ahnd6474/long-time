import { useEffect, useState } from 'react';
import { GameBoard } from './components/GameBoard';
import { HelpModal } from './components/HelpModal';
import { SidebarPanel } from './components/SidebarPanel';
import { formatPieceLabel, formatPlayerColor } from './components/piecePresentation';
import { cloneBoard, formatCellLabel, positionsEqual } from './game/board';
import {
  applyMove,
  createInitialGameState,
  getLegalMovesForPosition,
  getMoveFailureMessage,
  undoLastMove,
} from './game/engine';
import type { GameState, PlayerColor, Position } from './game/types';

type AppProps = {
  initialState?: GameState;
};

const PRODUCT_HIGHLIGHTS = [
  'Legal move overlays',
  'Clear turn guidance',
  'Responsive board layout',
];

function cloneGameState(baseState: GameState): GameState {
  return {
    ...baseState,
    board: cloneBoard(baseState.board),
    moveHistory: baseState.moveHistory.slice(),
  };
}

function buildScenarioState(sourceState?: GameState): GameState {
  return cloneGameState(sourceState ?? createInitialGameState());
}

function buildStandardState(): GameState {
  return cloneGameState(createInitialGameState());
}

function buildOpeningMessage(currentTurn: PlayerColor, prefix?: string): string {
  const message = `${formatPlayerColor(currentTurn)} to move. Select a ${currentTurn} piece to see its legal moves.`;

  return prefix ? `${prefix} ${message}` : message;
}

function formatCount(count: number, label: string): string {
  return `${count} ${label}${count === 1 ? '' : 's'}`;
}

export default function App({ initialState }: AppProps) {
  const [gameState, setGameState] = useState<GameState>(() => buildScenarioState(initialState));
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [invalidPosition, setInvalidPosition] = useState<Position | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    buildOpeningMessage(initialState?.currentTurn ?? 'blue'),
  );
  const selectedPiece = selectedPosition
    ? gameState.board[selectedPosition.row][selectedPosition.column]
    : null;
  const legalMoves = selectedPosition ? getLegalMovesForPosition(gameState, selectedPosition) : [];
  const currentTurnLabel =
    gameState.status === 'finished' && gameState.winner
      ? `${formatPlayerColor(gameState.winner)} wins`
      : `${formatPlayerColor(gameState.currentTurn)} to move`;
  const selectedSummary =
    selectedPiece && selectedPosition
      ? `${formatPieceLabel(selectedPiece)} at ${formatCellLabel(selectedPosition)}`
      : 'No piece selected';

  useEffect(() => {
    if (!invalidPosition) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setInvalidPosition(null);
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [invalidPosition]);

  function handlePieceSelection(position: Position) {
    const piece = gameState.board[position.row][position.column];

    if (!piece) {
      return;
    }

    const nextLegalMoves = getLegalMovesForPosition(gameState, position);

    setSelectedPosition(position);
    setInvalidPosition(null);
    setStatusMessage(
      `${formatPieceLabel(piece)} selected at ${formatCellLabel(position)}. ${formatCount(
        nextLegalMoves.length,
        'legal destination',
      )} highlighted.`,
    );
  }

  function handleBoardClick(position: Position) {
    const clickedPiece = gameState.board[position.row][position.column];

    if (selectedPosition && positionsEqual(selectedPosition, position)) {
      setSelectedPosition(null);
      setInvalidPosition(null);
      setStatusMessage(`Selection cleared. ${formatPlayerColor(gameState.currentTurn)} to move.`);
      return;
    }

    if (gameState.status === 'finished') {
      setInvalidPosition(position);
      setStatusMessage(
        `${formatPlayerColor(gameState.winner ?? gameState.currentTurn)} already won. Start a new game to play again.`,
      );
      return;
    }

    if (clickedPiece && clickedPiece.color === gameState.currentTurn) {
      handlePieceSelection(position);
      return;
    }

    const selectedMove = selectedPosition
      ? legalMoves.find((move) => positionsEqual(move.to, position))
      : undefined;

    if (selectedPosition && selectedMove) {
      const moveResult = applyMove(gameState, {
        from: selectedPosition,
        to: position,
      });

      if (!moveResult.ok) {
        setInvalidPosition(position);
        setStatusMessage(getMoveFailureMessage(moveResult.reason));
        return;
      }

      const destinationLabel = formatCellLabel(selectedMove.to);
      const moveMessage = selectedMove.capturedPiece
        ? `${formatPieceLabel(selectedMove.piece)} captured ${formatPieceLabel(selectedMove.capturedPiece).toLowerCase()} on ${destinationLabel}.`
        : `${formatPieceLabel(selectedMove.piece)} moved to ${destinationLabel}.`;
      const followUpMessage =
        moveResult.state.status === 'finished' && moveResult.state.winner
          ? `${formatPlayerColor(moveResult.state.winner)} wins.`
          : `${formatPlayerColor(moveResult.state.currentTurn)} to move.`;

      setGameState(moveResult.state);
      setSelectedPosition(null);
      setInvalidPosition(null);
      setStatusMessage(`${moveMessage} ${followUpMessage}`);
      return;
    }

    setInvalidPosition(position);

    if (selectedPosition) {
      setStatusMessage(
        clickedPiece
          ? 'That target is not a legal capture. Choose a highlighted square.'
          : 'That square is not a legal destination. Choose a highlighted square.',
      );
      return;
    }

    setStatusMessage(
      clickedPiece
        ? `It is ${gameState.currentTurn}'s turn. Select a ${gameState.currentTurn} piece to continue.`
        : `Select a ${gameState.currentTurn} piece to see its legal moves.`,
    );
  }

  function handleUndo() {
    const undoResult = undoLastMove(gameState);

    if (!undoResult.ok) {
      setStatusMessage('There is no move to undo yet.');
      return;
    }

    setGameState(undoResult.state);
    setSelectedPosition(null);
    setInvalidPosition(null);
    setStatusMessage(`Last move undone. ${formatPlayerColor(undoResult.state.currentTurn)} to move.`);
  }

  function handleNewGame() {
    const nextState = buildStandardState();

    setGameState(nextState);
    setSelectedPosition(null);
    setInvalidPosition(null);
    setStatusMessage(buildOpeningMessage(nextState.currentTurn, 'Fresh standard match ready.'));
  }

  function handleReset() {
    const nextState = buildScenarioState(initialState);

    setGameState(nextState);
    setSelectedPosition(null);
    setInvalidPosition(null);
    setStatusMessage(
      buildOpeningMessage(nextState.currentTurn, 'Board reset to the opening setup for this match.'),
    );
  }

  return (
    <div className="app-shell">
      <header className="hero" aria-labelledby="site-title">
        <div className="hero-copy-block">
          <div className="hero-brand-row">
            <p className="eyebrow">Built by Jakal Flow</p>
            <p className="hero-badge">Modern Janggi on the web</p>
          </div>
          <h1 id="site-title">Long Time</h1>
          <p className="hero-copy">
            A focused Janggi website with readable match flow, strong move-state cues, and a
            built-in guide for local two-player sessions.
          </p>
          <ul className="hero-feature-list" aria-label="Product highlights">
            {PRODUCT_HIGHLIGHTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <section className="hero-status-card" aria-labelledby="match-overview-title">
          <p className="eyebrow">Live Match</p>
          <h2 id="match-overview-title" className="hero-status-heading">
            Match overview
          </h2>
          <p className="hero-status-callout">{currentTurnLabel}</p>
          <p className="hero-status-copy">
            Select one of the current player&apos;s pieces to reveal only legal destinations, then
            click a highlighted square to commit the move.
          </p>

          <dl className="hero-metric-grid">
            <div>
              <dt>Current turn</dt>
              <dd>{currentTurnLabel}</dd>
            </div>
            <div>
              <dt>Selection focus</dt>
              <dd>{selectedSummary}</dd>
            </div>
            <div>
              <dt>Legal targets</dt>
              <dd>
                {selectedPosition ? formatCount(legalMoves.length, 'available move') : 'Select a piece'}
              </dd>
            </div>
            <div>
              <dt>Moves played</dt>
              <dd>{formatCount(gameState.moveHistory.length, 'move')}</dd>
            </div>
          </dl>
        </section>
      </header>

      <main className="layout">
        <GameBoard
          board={gameState.board}
          currentTurn={gameState.currentTurn}
          currentTurnLabel={currentTurnLabel}
          invalidPosition={invalidPosition}
          legalMoves={legalMoves}
          selectedPosition={selectedPosition}
          onCellClick={handleBoardClick}
        />
        <SidebarPanel
          currentTurnLabel={currentTurnLabel}
          selectedSummary={selectedSummary}
          legalMoveCount={legalMoves.length}
          moveCount={gameState.moveHistory.length}
          statusMessage={statusMessage}
          canUndo={gameState.moveHistory.length > 0}
          onUndo={handleUndo}
          onReset={handleReset}
          onNewGame={handleNewGame}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
      </main>

      <HelpModal open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
