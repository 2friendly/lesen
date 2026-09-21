import test from 'node:test'
import assert from 'node:assert/strict'
import { readingSteps, savedStepIndex } from '../src/readingSteps.js'
import { stories, earlyReaderCueGroups } from '../src/stories.js'

const story = { sentences: ['Pip sat.', 'Pip got wet.'] }
test('supported reading presents exactly one word per step, preserving punctuation and sentence context', () => {
  const steps = readingSteps(story, true)
  assert.deepEqual(steps.map(step => step.text), ['Pip', 'sat.', 'Pip', 'got', 'wet.'])
  assert.deepEqual(steps[3], { text: 'got', sentence: 'Pip got wet.', page: 1, word: 1 })
})
test('independent reading keeps one sentence per page', () => {
  assert.deepEqual(readingSteps(story, false).map(step => step.text), story.sentences)
})
test('resume restores the precise word and tolerates old or invalid saved places', () => {
  const steps = readingSteps(story, true)
  assert.equal(savedStepIndex(steps, { page: 1, word: 1 }), 3)
  assert.equal(savedStepIndex(steps, { page: 1 }), 2)
  assert.equal(savedStepIndex(steps, { page: 100 }), 0)
  assert.equal(savedStepIndex(steps, null), 0)
})
test('Kindy uses short sentences and authored cues for every word', () => {
  for (const item of stories.filter(item => item.level === 'kindy')) {
    for (const sentence of item.sentences) assert(sentence.split(/\s+/).length <= 5)
    for (const step of readingSteps(item, true)) {
      const word = step.text.toLowerCase().replace(/[^a-z]/g, '')
      assert(word.length <= 3, `Kindy word is too long: ${word}`)
      assert.equal(earlyReaderCueGroups[word]?.join(''), word)
    }
  }
})
