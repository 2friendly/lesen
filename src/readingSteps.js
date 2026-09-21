export function readingSteps(story, supported) {
  return story.sentences.flatMap((sentence, page) => supported
    ? sentence.split(/\s+/).map((text, word) => ({ text, sentence, page, word }))
    : [{ text: sentence, sentence, page, word: 0 }])
}

export function savedStepIndex(steps, saved) {
  const index = steps.findIndex((step) => step.page === saved?.page && step.word === (saved?.word ?? 0))
  return index < 0 ? 0 : index
}
