const folders = ['game', 'state', 'components', 'styles', 'tests'];

export function SidebarPanel() {
  return (
    <aside className="panel sidebar-panel" aria-labelledby="sidebar-title">
      <p className="eyebrow">State</p>
      <h2 id="sidebar-title">Rules Engine Ready</h2>
      <p className="sidebar-copy">
        The repository now includes a standalone Janggi rules layer with typed game state,
        legal move generation, validation, captures, turn flow, and undo-ready history.
      </p>

      <ul className="folder-list">
        {folders.map((folder) => (
          <li key={folder}>{folder}</li>
        ))}
      </ul>

      <section className="info-block" aria-labelledby="next-steps-title">
        <h3 id="next-steps-title">Next gameplay slices</h3>
        <p>Connect the engine to board interactions, legal move highlighting, and the help UI.</p>
      </section>

      <footer className="panel-footer">Built by Jakal Flow</footer>
    </aside>
  );
}
