import test from 'node:test'
import assert from 'node:assert/strict'
import { locateDrag, markerOnRail } from '../src/drag.js'

const rails = [
  { left: 50, right: 250, width: 200, y: 150 },
  { left: 350, right: 550, width: 200, y: 150 },
  { left: 50, right: 250, width: 200, y: 350 },
]

test('movement is proportional, without snapping or speed limits', () => {
  for (const x of [50, 50.1, 95, 149.5, 249.9, 250]) {
    const position = locateDrag(0, x, 150, rails)
    assert.equal(position.index, 0)
    assert(Math.abs(position.value - (x - 50) / 2) < 1e-10)
  }
})
test('crosses adjacent words in both directions without release', () => {
  assert.deepEqual(locateDrag(0, 360, 150, rails), { index: 1, value: 5 })
  assert.deepEqual(locateDrag(1, 240, 150, rails), { index: 0, value: 95 })
})
test('the gap neither skips nor starts another word', () => {
  assert.deepEqual(locateDrag(0, 300, 150, rails), { index: 0, value: 100 })
  assert.deepEqual(locateDrag(1, 300, 150, rails), { index: 1, value: 0 })
})
test('new lines must be entered near their reading edge', () => {
  assert.equal(locateDrag(1, 200, 350, rails).index, 1)
  assert.deepEqual(locateDrag(1, 55, 350, rails), { index: 2, value: 2.5 })
  assert.deepEqual(locateDrag(2, 545, 150, rails), { index: 1, value: 97.5 })
})
test('finishing a rail never locks backward movement', () => {
  assert.deepEqual(locateDrag(2, 250, 350, rails), { index: 2, value: 100 })
  assert.deepEqual(locateDrag(2, 150, 350, rails), { index: 2, value: 50 })
})

test('marker stays at rail height despite vertical finger movement', () => {
  for (const y of [-500, 90, 150, 210, 1000]) {
    const next = locateDrag(0, 125, y, rails)
    assert.deepEqual(markerOnRail(rails[next.index], 125), { x: 125, y: 150 })
  }
})

test('marker cannot escape rail endpoints or float through page whitespace', () => {
  assert.deepEqual(markerOnRail(rails[0], -100), { x: 50, y: 150 })
  assert.deepEqual(markerOnRail(rails[0], 300), { x: 250, y: 150 })
  assert.deepEqual(markerOnRail(rails[2], 1000), { x: 250, y: 350 })
})

test('wrapped handoff places marker on the new rail, not under the finger', () => {
  const next = locateDrag(1, 55, 325, rails)
  assert.equal(next.index, 2)
  assert.deepEqual(markerOnRail(rails[next.index], 55), { x: 55, y: 350 })
})
