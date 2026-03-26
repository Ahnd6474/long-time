import { useEffect } from 'react';

type HelpModalProps = {
  open: boolean;
  onClose: () => void;
};

const PIECE_GUIDE = [
  {
    name: 'General',
    description:
      'Stays inside the palace and moves one step at a time along the palace lines, including palace diagonals.',
  },
  {
    name: 'Guard',
    description:
      'Also stays inside the palace and uses the same one-step palace lines as the general.',
  },
  {
    name: 'Horse',
    description:
      'Moves one orthogonal step and then one diagonal step outward. If the first adjacent square is occupied, the horse is blocked.',
  },
  {
    name: 'Elephant',
    description:
      'Moves one orthogonal step and then two diagonal steps outward. Either of the two intermediate squares can block the move.',
  },
  {
    name: 'Chariot',
    description:
      'Slides any distance horizontally or vertically until blocked. Inside the palace it can also travel along palace diagonals.',
  },
  {
    name: 'Cannon',
    description:
      'Moves like a jumping chariot: it must leap over exactly one screen piece, and cannons cannot use another cannon as the screen or capture a cannon.',
  },
  {
    name: 'Soldier',
    description:
      'Moves one step forward or sideways. Inside the enemy palace it may also move one step diagonally forward along palace lines.',
  },
];

const SITE_GUIDE = [
  'Click your own piece to select it. The selected square glows gold.',
  'Green markers show legal empty destinations, and red rings show legal captures.',
  'Click another friendly piece to switch the selection, or click the selected square again to clear it.',
  'The game rejects moves that would leave your own general under attack.',
];

const CONTROL_GUIDE = [
  'Undo move reverses the latest move and restores the previous turn.',
  'Reset board returns the current scenario to its opening layout and clears the move history.',
  'New game starts a fresh standard Janggi opening, even if you loaded a custom position.',
  'Help and manual reopens this guide without leaving the board.',
];

const LIMITATIONS = [
  'This release is local two-player only. There is no AI opponent or online play yet.',
  'The match ends when a general is captured. There is no separate check, checkmate, draw, or repetition presentation yet.',
  'There is no saved match history, import/export, or annotated move list yet.',
];

const HELP_SUMMARY_CARDS = [
  {
    label: 'Goal',
    value: 'Capture the opposing general',
    description: 'Matches end when one general is taken off the board.',
  },
  {
    label: 'Opening',
    value: 'Blue starts from the top',
    description: 'Red responds from the bottom and players take alternating turns.',
  },
  {
    label: 'Move signals',
    value: 'Gold, teal, and coral markers',
    description: 'Selected pieces, legal moves, and captures each get a distinct board cue.',
  },
];

export function HelpModal({ open, onClose }: HelpModalProps) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <section
        className="help-modal panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        aria-describedby="help-intro"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="help-modal__header">
          <div className="help-modal__header-copy">
            <p className="eyebrow">Built by Jakal Flow</p>
            <h2 id="help-title">How to Play Long Time</h2>
            <p id="help-intro" className="hero-status-copy">
              Long Time is a local, pass-and-play Janggi board for two people on one device. Blue
              starts at the top, red starts at the bottom, and the goal in this build is to capture
              the opposing general.
            </p>
          </div>

          <button
            className="control-button control-button--secondary help-modal__close-button"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="help-modal__body">
          <div className="help-summary-grid" aria-label="Quick facts">
            {HELP_SUMMARY_CARDS.map((card) => (
              <article key={card.label} className="help-summary-card">
                <p className="eyebrow">{card.label}</p>
                <p className="help-summary-card__value">{card.value}</p>
                <p>{card.description}</p>
              </article>
            ))}
          </div>

          <section className="help-section" aria-labelledby="help-janggi-title">
            <h3 id="help-janggi-title">What is Janggi?</h3>
            <p>
              Janggi is the Korean member of the chess family, played on a 9 by 10 board with
              palaces near each side. Pieces do not all move the same way as Western chess pieces,
              and palace diagonals matter for several moves.
            </p>
          </section>

          <section className="help-section" aria-labelledby="help-pieces-title">
            <h3 id="help-pieces-title">Piece guide</h3>
            <div className="help-piece-grid">
              {PIECE_GUIDE.map((piece) => (
                <article key={piece.name} className="help-piece-card">
                  <h4>{piece.name}</h4>
                  <p>{piece.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="help-section" aria-labelledby="help-site-title">
            <h3 id="help-site-title">Playing on this site</h3>
            <ul className="help-list">
              {SITE_GUIDE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="help-section" aria-labelledby="help-controls-title">
            <h3 id="help-controls-title">Controls</h3>
            <ul className="help-list">
              {CONTROL_GUIDE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="help-section" aria-labelledby="help-limitations-title">
            <h3 id="help-limitations-title">Current limitations</h3>
            <ul className="help-list">
              {LIMITATIONS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="help-modal__footer">Built by Jakal Flow</footer>
      </section>
    </div>
  );
}
