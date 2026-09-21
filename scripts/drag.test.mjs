import test from 'node:test'
import assert from 'node:assert/strict'
import { markerOnRail, positionOnRail } from '../src/drag.js'

const rail = { left: 50, right: 250, width: 200, y: 150 }
test('horizontal movement remains proportional and unstepped', () => {
  for (const x of [50, 50.1, 95, 149.5, 249.9, 250]) {
    assert(Math.abs(positionOnRail(rail, x) - (x - 50) / 2) < 1e-10)
  }
})
test('endpoints clamp without changing the practice word', () => {
  assert.equal(positionOnRail(rail, -100), 0)
  assert.equal(positionOnRail(rail, 1500), 100)
  assert.equal(positionOnRail(rail, 150), 50)
})
test('marker stays locked to rail height and endpoints', () => {
  assert.deepEqual(markerOnRail(rail, 125), { x: 125, y: 150 })
  assert.deepEqual(markerOnRail(rail, -100), { x: 50, y: 150 })
  assert.deepEqual(markerOnRail(rail, 1000), { x: 250, y: 150 })
})
