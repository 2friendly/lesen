import { earlyReaderCueGroups, earlyReaderSoundTiming, earlyReaderWordFeatures, stories } from '../src/stories.js'

const earlyLevels = new Set(['preschool', 'kindy'])
const storyWords = new Set(
  stories
    .filter((story) => earlyLevels.has(story.level))
    .flatMap((story) => story.sentences)
    .flatMap((sentence) => sentence.toLowerCase().match(/[a-z'’-]+/g) ?? []),
)

const errors = []

for (const word of storyWords) {
  if (!earlyReaderCueGroups[word]) errors.push(`Missing sound groups for "${word}".`)
}

for (const [word, groups] of Object.entries(earlyReaderCueGroups)) {
  if (groups.join('') !== word) errors.push(`Sound groups for "${word}" do not reconstruct the word.`)

  const silentGroups = new Set(earlyReaderWordFeatures[word]?.silentGroups ?? [])

  for (const [groupIndex, group] of groups.entries()) {
    if (silentGroups.has(groupIndex)) continue
    if (!['hold', 'quick'].includes(earlyReaderSoundTiming[group])) {
      errors.push(`Missing hold/quick timing for "${group}" in "${word}".`)
    }
  }
}

for (const [word, features] of Object.entries(earlyReaderWordFeatures)) {
  const groups = earlyReaderCueGroups[word]
  if (!groups) {
    errors.push(`Word features exist for "${word}", but it has no sound groups.`)
    continue
  }

  const silentGroups = features.silentGroups ?? []
  if (!Array.isArray(silentGroups) || new Set(silentGroups).size !== silentGroups.length) {
    errors.push(`Silent groups for "${word}" must be a list of unique indexes.`)
    continue
  }

  for (const groupIndex of silentGroups) {
    if (!Number.isInteger(groupIndex) || groupIndex < 0 || groupIndex >= groups.length) {
      errors.push(`Silent group index ${groupIndex} is invalid for "${word}".`)
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`Validated phonics cues for ${storyWords.size} early-reader words.`)
