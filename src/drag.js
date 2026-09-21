export const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

// Only enter an adjacent word. On a new line, enter at its reading edge,
// never halfway through a word just because it sits below the previous one.
export function locateDrag(index, x, y, rails) {
  const current = rails[index]
  if (!current) return { index, value: 0 }
  const valueAt = (rail) => clamp((x - rail.left) / Math.max(1, rail.width) * 100, 0, 100)
  for (const direction of [-1, 1]) {
    const next = rails[index + direction]
    if (!next) continue
    const sameRow = Math.abs(current.y - next.y) < 24
    const atHeight = Math.abs(y - next.y) <= 48
    const crossed = direction === 1 ? x >= next.left : x <= next.right
    const atEntry = direction === 1
      ? x >= next.left - 24 && x <= next.left + Math.min(40, next.width * .25)
      : x <= next.right + 24 && x >= next.right - Math.min(40, next.width * .25)
    if (atHeight && (sameRow ? crossed : atEntry)) {
      return { index: index + direction, value: valueAt(next) }
    }
  }
  return { index, value: valueAt(current) }
}
