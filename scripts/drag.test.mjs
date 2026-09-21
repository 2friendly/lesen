import test from 'node:test'
import assert from 'node:assert/strict'
import { locateDrag } from '../src/drag.js'

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
