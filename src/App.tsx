import { GameBoardPlaceholder } from './components/GameBoardPlaceholder';
import { SidebarPanel } from './components/SidebarPanel';
import { createInitialGameState } from './state/gameState';

const initialGameState = createInitialGameState();

export default function App() {
  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Built by Jakal Flow</p>
          <h1>Long Time</h1>
          <p className="hero-copy">
            A web-only React + TypeScript Janggi project with the core rules engine in place.
          </p>
        </div>
      </header>

      <main className="layout">
        <GameBoardPlaceholder board={initialGameState.board} />
        <SidebarPanel />
      </main>
    </div>
  );
}
