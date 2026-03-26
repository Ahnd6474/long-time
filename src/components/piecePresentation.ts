import type { Piece, PlayerColor } from '../game/types';

const COLOR_LABELS: Record<PlayerColor, string> = {
  blue: 'Blue',
  red: 'Red',
};

const PIECE_LABELS: Record<Piece['type'], string> = {
  general: 'General',
  guard: 'Guard',
  horse: 'Horse',
  elephant: 'Elephant',
  chariot: 'Chariot',
  cannon: 'Cannon',
  soldier: 'Soldier',
};

export function formatPlayerColor(color: PlayerColor): string {
  return COLOR_LABELS[color];
}

export function formatPieceLabel(piece: Piece): string {
  return `${formatPlayerColor(piece.color)} ${PIECE_LABELS[piece.type]}`;
}
