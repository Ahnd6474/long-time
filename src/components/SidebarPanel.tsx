const folders = ['game', 'state', 'components', 'styles', 'tests'];

export function SidebarPanel() {
  return (
    <aside className="panel sidebar-panel" aria-labelledby="sidebar-title">
      <p className="eyebrow">Structure</p>
      <h2 id="sidebar-title">Project Ready For Gameplay</h2>
      <p className="sidebar-copy">
        This step establishes the browser app shell, typed state boundaries, and test hooks
        needed for the next Janggi implementation pass.
      </p>

      <ul className="folder-list">
        {folders.map((folder) => (
          <li key={folder}>{folder}</li>
        ))}
      </ul>

      <section className="info-block" aria-labelledby="next-steps-title">
        <h3 id="next-steps-title">Next gameplay slices</h3>
        <p>Rules engine, legal move highlighting, local turn flow, and help UI.</p>
      </section>

      <footer className="panel-footer">Built by Jakal Flow</footer>
    </aside>
  );
}
