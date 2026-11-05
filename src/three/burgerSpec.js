/** Height of the stage pedestal the burger lands on in the last scene. */
export const PEDESTAL_TOP = 0.3

/** Which layer each exploded-view label points at, its side, and where on the layer. */
export const LABELS = [
  { key: 'crown', layer: 'crown', side: 1, dy: 0.16 },
  { key: 'patty', layer: 'pattyB', side: -1, dy: 0.05 },
  { key: 'pickles', layer: 'pickles', side: 1, dy: 0.01 },
  { key: 'lettuce', layer: 'lettuceB', side: -1, dy: 0.03 },
  { key: 'sauce', layer: 'sauceB', side: 1, dy: 0.01 },
  { key: 'club', layer: 'club', side: -1, dy: 0.07 },
  { key: 'cheese', layer: 'cheese', side: 1, dy: 0.0 },
  { key: 'onions', layer: 'sauceA', side: -1, dy: 0.02 },
]
