export const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

// The finger selects a position; the marker stays on the selected rail.
// Vertical finger movement never moves the marker off its rail.
export function markerOnRail(rail, x) {
  return { x: clamp(x, rail.left, rail.right), y: rail.y }
}

export function positionOnRail(rail, x) {
  return clamp((x - rail.left) / Math.max(1, rail.width) * 100, 0, 100)
}
