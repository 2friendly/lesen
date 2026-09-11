import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { earlyReaderCueGroups, earlyReaderSoundTiming, earlyReaderWordFeatures, levels, stories } from './stories'

const WORD_COMPLETE_THRESHOLD = 94

const Chevron = ({ direction = 'right' }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={`icon icon-${direction}`}>
    <path d="m9 5 7 7-7 7" />
  </svg>
)

const Speaker = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="icon">
    <path d="M5 10v4h4l5 4V6l-5 4H5Z" /><path d="M17 9a4 4 0 0 1 0 6" />
  </svg>
)

function App() {
  const [view, setView] = useState('library')
  const [level, setLevel] = useState('preschool')
  const [story, setStory] = useState(null)

  const openStory = (nextStory) => {
    setStory(nextStory)
    setView('reader')
  }

  if (view === 'reader' && story) {
    return <Reader story={story} onClose={() => setView('library')} />
  }

  return <Library level={level} setLevel={setLevel} onOpen={openStory} />
}

function Library({ level, setLevel, onOpen }) {
  const visibleStories = stories.filter((story) => story.level === level)
  const isPreK = level === 'preschool'

  const itemDescription = (story) => {
    const unit = story.mode === 'sound' ? 'sound' : story.mode === 'word' ? 'word' : 'little page'
    return `${story.sentences.length} ${unit}${story.sentences.length === 1 ? '' : 's'}`
  }

  return (
    <main className="library-shell">
      <header className="brand-row">
        <a className="brand" href="#top" aria-label="lesen home">
          <span className="brand-eye"><i /><i /></span>
          <span className="brand-lockup">
            <span className="brand-name">lesen</span>
            <span className="brand-phonetic" aria-hidden="true">/ˈleːzn̩/</span>
          </span>
        </a>
        <span className="grown-up-note">Read at your pace</span>
      </header>

      <section className="welcome" id="top">
        <div>
          <p className="eyebrow">{isPreK ? 'Start small' : 'Pick a story'}</p>
          <h1>{isPreK ? <>Let’s play with<br />sounds.</> : <>What shall we<br />read today?</>}</h1>
        </div>
        <div className="sun-sketch" aria-hidden="true"><span>✦</span></div>
      </section>

      <nav className="level-tabs" aria-label="Reading level">
        {levels.map((item) => (
          <button
            key={item.id}
            className={level === item.id ? 'active' : ''}
            aria-pressed={level === item.id}
            onClick={() => setLevel(item.id)}
          >
            <span>{item.short}</span>
            <small>{item.label}</small>
          </button>
        ))}
      </nav>

      <section className="story-list" aria-live="polite">
        <div className="shelf-heading">
          <h2>{levels.find((item) => item.id === level)?.shelf}</h2>
          <span>{visibleStories.length} {isPreK ? 'activities' : 'stories'}</span>
        </div>
        <div className="story-grid">
          {visibleStories.map((story, index) => (
            <button
              className={`story-card story-color-${index % 4}`}
              key={story.id}
              onClick={() => onOpen(story)}
            >
              <span className="story-number">0{index + 1}</span>
              <span className="story-art" aria-hidden="true">{story.art}</span>
              <span className="story-copy">
                <strong>{story.title}</strong>
                <small>{itemDescription(story)}</small>
              </span>
              <span className="round-arrow"><Chevron /></span>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}

function ContextPicture({ pictures, currentIndex, progress, celebrating, mode, target }) {
  const picture = pictures[currentIndex]
  const cueLength = mode === 'sound' ? target.length : picture.label.length
  const cueText = picture.label.slice(0, cueLength)
  const restText = picture.label.slice(cueLength)

  return (
    <div
      className={`context-picture ${celebrating ? 'is-celebrating' : ''}`}
      role="img"
      aria-label={mode === 'sound' ? `${picture.label}. ${picture.label} begins with ${target}.` : `Picture of a ${picture.label}.`}
    >
      <span className="picture-sparkle sparkle-one" aria-hidden="true">✦</span>
      <span className="picture-sparkle sparkle-two" aria-hidden="true">✦</span>
      <div
        className="picture-object"
        aria-hidden="true"
        style={{ transform: `translateY(${(1 - progress) * 4}px) scale(${.94 + progress * .06})` }}
      >
        {picture.symbol}
      </div>
      <div className="picture-word" aria-hidden="true">
        <strong>{cueText}</strong>{restText}
      </div>
      <div className="picture-recap" aria-hidden="true">
        {pictures.map((item, pictureIndex) => {
          const revealed = pictureIndex < currentIndex || (pictureIndex === currentIndex && celebrating)
          return (
            <span className={`${revealed ? 'is-revealed' : ''} ${pictureIndex === currentIndex ? 'is-current' : ''}`} key={item.label}>
              {revealed ? item.symbol : ''}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function Reader({ story, onClose }) {
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const [positions, setPositions] = useState({})
  const [finished, setFinished] = useState(false)
  const [returningWordIndex, setReturningWordIndex] = useState(null)
  const inputRefs = useRef([])
  const readingStageRef = useRef(null)
  const continuousDragRef = useRef(null)
  const returnTimerRef = useRef(null)
  const sentence = story.sentences[sentenceIndex]
  const words = sentence.split(/\s+/)
  const mode = story.mode ?? 'story'
  const unitName = mode === 'sound' ? 'Sound' : mode === 'word' ? 'Word' : 'Page'
  const prompt = mode === 'sound'
    ? 'Say the sound and move the handle'
    : mode === 'word' ? 'Blend the sounds together' : 'Move the blue handle as you read'
  const successMessage = mode === 'sound'
    ? 'Great sound!'
    : mode === 'word' ? 'You blended the word!' : 'You read the whole sentence!'
  const nextLabel = sentenceIndex === story.sentences.length - 1
    ? mode === 'story' ? 'Finish story' : 'Finish activity'
    : mode === 'sound' ? 'Next sound' : mode === 'word' ? 'Next word' : 'Next page'
  const isPreK = story.level === 'preschool'
  const pictureProgress = finished ? 1 : Math.min(1, (positions[0] ?? 0) / 100)
  const progress = ((sentenceIndex + (finished ? 1 : 0)) / story.sentences.length) * 100

  useEffect(() => {
    window.clearTimeout(returnTimerRef.current)
    continuousDragRef.current = null
    setReturningWordIndex(null)
    setWordIndex(0)
    setPositions({})
    setFinished(false)
    requestAnimationFrame(() => inputRefs.current[0]?.focus())

    return () => window.clearTimeout(returnTimerRef.current)
  }, [sentenceIndex])

  const speakSentence = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(sentence)
      utterance.rate = 0.72
      window.speechSynthesis.speak(utterance)
    }
  }

  const moveMarker = (index, rawValue) => {
    const value = Number(rawValue)
    setPositions((current) => ({ ...current, [index]: value }))

    if (value >= WORD_COMPLETE_THRESHOLD && index === wordIndex) {
      setPositions((current) => ({ ...current, [index]: 100 }))
      if (index < words.length - 1) {
        const activePointerId = continuousDragRef.current?.pointerId
        if (activePointerId != null) {
          try {
            readingStageRef.current?.setPointerCapture(activePointerId)
          } catch {
            // The pointer may already have ended; normal word handoff still works.
          }
        }
        setWordIndex(index + 1)
        requestAnimationFrame(() => inputRefs.current[index + 1]?.focus())
      } else {
        setFinished(true)
      }
    }
  }

  const startContinuousDrag = (index, pointerId) => {
    window.clearTimeout(returnTimerRef.current)
    setReturningWordIndex(null)
    continuousDragRef.current = { originIndex: index, pointerId }
  }

  const continueContinuousDrag = (event) => {
    const gesture = continuousDragRef.current
    if (!gesture || wordIndex <= gesture.originIndex || finished) return

    const activeInput = inputRefs.current[wordIndex]
    if (!activeInput) return

    const bounds = activeInput.getBoundingClientRect()
    const styles = window.getComputedStyle(activeInput)
    const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0
    const paddingRight = Number.parseFloat(styles.paddingRight) || 0
    const trackStart = bounds.left + paddingLeft
    const trackEnd = bounds.right - paddingRight
    const trackWidth = Math.max(1, trackEnd - trackStart)
    const verticalAllowance = 28

    if (event.clientY < bounds.top - verticalAllowance || event.clientY > bounds.bottom + verticalAllowance) return

    const nextValue = Math.max(0, Math.min(100, ((event.clientX - trackStart) / trackWidth) * 100))
    moveMarker(wordIndex, nextValue)
  }

  const endContinuousDrag = () => {
    const gesture = continuousDragRef.current
    continuousDragRef.current = null
    if (!gesture || wordIndex <= gesture.originIndex || finished) return

    const currentValue = positions[wordIndex] ?? 0
    if (currentValue <= 0 || currentValue >= WORD_COMPLETE_THRESHOLD) return

    setReturningWordIndex(wordIndex)
    setPositions((current) => ({ ...current, [wordIndex]: 0 }))
    window.clearTimeout(returnTimerRef.current)
    returnTimerRef.current = window.setTimeout(() => setReturningWordIndex(null), 340)
  }

  const moveToPreviousWord = (index) => {
    if (index !== wordIndex || index <= 0) return

    const previousIndex = index - 1
    setFinished(false)
    setPositions((current) => ({
      ...current,
      [index]: 0,
      [previousIndex]: 100,
    }))
    setWordIndex(previousIndex)
    requestAnimationFrame(() => inputRefs.current[previousIndex]?.focus())
  }

  const nextSentence = () => {
    if (sentenceIndex < story.sentences.length - 1) {
      setSentenceIndex((current) => current + 1)
    } else {
      onClose()
    }
  }

  return (
    <main className="reader-shell">
      <header className="reader-header">
        <button className="icon-button" onClick={onClose} aria-label="Leave story">
          <Chevron direction="left" />
        </button>
        <div className="reader-meta">
          <strong>{story.title}</strong>
          <span>{unitName} {sentenceIndex + 1} of {story.sentences.length}</span>
        </div>
        {mode === 'sound'
          ? <span aria-hidden="true" />
          : (
            <button className="icon-button" onClick={speakSentence} aria-label={`Hear this ${mode === 'word' ? 'word' : 'sentence'}`}>
              <Speaker />
            </button>
          )}
      </header>

      <div className="progress-track" aria-label={`${Math.round(progress)} percent complete`}>
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>

      <section
        ref={readingStageRef}
        className={`reading-stage ${isPreK ? 'has-picture-cue' : ''}`}
        aria-label="Reading practice"
        onPointerMove={continueContinuousDrag}
        onPointerUp={endContinuousDrag}
        onPointerCancel={endContinuousDrag}
      >
        <div className="page-mark" aria-hidden="true">{String(sentenceIndex + 1).padStart(2, '0')}</div>
        {isPreK && story.pictures?.[sentenceIndex] && (
          <ContextPicture
            pictures={story.pictures}
            currentIndex={sentenceIndex}
            progress={pictureProgress}
            celebrating={finished}
            mode={mode}
            target={sentence}
          />
        )}
        <p className="reader-prompt" id="reading-instruction">{prompt}</p>
        <div className="word-line">
          {words.map((word, index) => (
            <WordSlider
              key={`${sentenceIndex}-${index}-${word}`}
              word={word}
              index={index}
              active={index === wordIndex && !finished}
              complete={index < wordIndex || finished}
              cueing={story.level === 'preschool' || story.level === 'kindy'}
              practiceMode={mode}
              value={positions[index] ?? 0}
              externalReturning={returningWordIndex === index}
              onChange={moveMarker}
              onPrevious={moveToPreviousWord}
              onGestureStart={startContinuousDrag}
              inputRef={(element) => { inputRefs.current[index] = element }}
            />
          ))}
        </div>

        <div className={`sentence-done ${finished ? 'visible' : ''}`} aria-live="polite">
          <span aria-hidden="true">✦</span>
          <strong>{successMessage}</strong>
          <button onClick={nextSentence} disabled={!finished}>
            {nextLabel}
            <Chevron />
          </button>
        </div>
      </section>

      <footer className="reader-tip">Take your time. Every sound counts.</footer>
    </main>
  )
}

function WordSlider({ word, index, active, complete, cueing, practiceMode, value, externalReturning, onChange, onPrevious, onGestureStart, inputRef }) {
  const wordParts = word.match(/^([^\p{L}\p{N}]*)([\p{L}\p{N}'’-]+)([^\p{L}\p{N}]*)$/u)
  const [, prefix = '', readableWord = word, suffix = ''] = wordParts ?? []
  const normalizedWord = readableWord.toLowerCase()
  const authoredGroups = cueing ? earlyReaderCueGroups[normalizedWord] : null
  const wordFeatures = cueing ? earlyReaderWordFeatures[normalizedWord] : null
  const silentGroupIndexes = new Set(wordFeatures?.silentGroups ?? [])
  const hasSoundCues = Boolean(authoredGroups?.length && authoredGroups.join('') === readableWord.toLowerCase())
  let characterOffset = 0
  const visualGroups = hasSoundCues
    ? authoredGroups.map((group) => {
        const text = readableWord.slice(characterOffset, characterOffset + group.length)
        characterOffset += group.length
        return text
      })
    : [readableWord]
  let soundIndex = 0
  const groupModels = visualGroups.map((text, groupIndex) => {
    const silent = hasSoundCues && silentGroupIndexes.has(groupIndex)
    return {
      text,
      silent,
      soundIndex: silent ? null : soundIndex++,
      timing: silent ? null : earlyReaderSoundTiming[authoredGroups?.[groupIndex]],
    }
  })
  const soundGroups = hasSoundCues ? groupModels.filter((group) => !group.silent) : []
  const soundTimings = soundGroups.map((group) => group.timing)
  const soundWeights = hasSoundCues
    ? soundTimings.map((timing) => timing === 'quick' ? 0.62 : 1.65)
    : [1]
  let cueWeightOffset = 0
  const cueCentres = soundWeights.map((weight) => {
    const centre = cueWeightOffset + weight / 2
    cueWeightOffset += weight
    return centre
  })
  const firstCueCentre = cueCentres[0] ?? 0
  const lastCueCentre = cueCentres.at(-1) ?? firstCueCentre
  const cuePositions = cueCentres.map((centre) => (
    lastCueCentre === firstCueCentre ? 0 : ((centre - firstCueCentre) / (lastCueCentre - firstCueCentre)) * 100
  ))
  const [cueIndex, setCueIndex] = useState(0)
  const [returning, setReturning] = useState(false)
  const [backPull, setBackPull] = useState(0)
  const backGestureRef = useRef(null)
  const currentSoundTiming = soundTimings[cueIndex]
  let trailingSilentLength = 0
  if (hasSoundCues) {
    for (let groupIndex = groupModels.length - 1; groupIndex >= 0; groupIndex -= 1) {
      if (!groupModels[groupIndex].silent) break
      trailingSilentLength += groupModels[groupIndex].text.length
    }
  }
  const soundedWidthRatio = hasSoundCues
    ? Math.max(.35, (readableWord.length - trailingSilentLength) / readableWord.length)
    : 1
  const sliderValueText = hasSoundCues
    ? `${soundGroups[cueIndex]?.text}, ${currentSoundTiming === 'quick' ? 'quick sound' : 'hold this sound'}`
    : value < 5 ? 'Start of word' : value > 95 ? 'End of word' : `${Math.round(value)} percent through word`

  const moveWithCue = (rawValue) => {
    const nextValue = Number(rawValue)

    if (hasSoundCues && cuePositions.length > 1) {
      let nearestIndex = 0
      let nearestDistance = Number.POSITIVE_INFINITY

      cuePositions.forEach((position, groupIndex) => {
        const distance = Math.abs(position - nextValue)
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = groupIndex
        }
      })

      setCueIndex(nearestIndex)
    }

    onChange(index, nextValue)
  }

  const pullMarkerBack = (rawValue = value) => {
    if (!active) return

    const releaseValue = Number(rawValue)
    if (releaseValue >= WORD_COMPLETE_THRESHOLD) return

    setReturning(releaseValue > .1)
    setCueIndex(0)
    onChange(index, 0)
  }

  const beginDrag = (event) => {
    setReturning(false)
    setBackPull(0)
    backGestureRef.current = { pointerId: event.pointerId, used: false }
    onGestureStart(index, event.pointerId)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const trackBackGesture = (event) => {
    if (!active || index === 0 || backGestureRef.current?.used) return

    const inputBounds = event.currentTarget.getBoundingClientRect()
    const inputPadding = Number.parseFloat(window.getComputedStyle(event.currentTarget).paddingLeft) || 0
    const trackStart = inputBounds.left + inputPadding
    const overshoot = Math.max(0, trackStart - event.clientX)
    setBackPull(-Math.min(18, overshoot * .45))

    if (overshoot >= 40) {
      backGestureRef.current.used = true
      setBackPull(0)
      onPrevious(index)
    }
  }

  const endDrag = (event) => {
    setBackPull(0)
    backGestureRef.current = null
    pullMarkerBack(event.currentTarget.value)
  }

  return (
    <div
      className={`word-unit ${practiceMode === 'sound' ? 'is-sound-practice' : ''} ${active ? 'is-active' : ''} ${complete ? 'is-complete' : ''} ${returning || externalReturning ? 'is-returning' : ''} ${backPull < 0 ? 'is-pulling-back' : ''}`}
      style={{
        '--marker-position': `${value * soundedWidthRatio}%`,
        '--back-pull': `${backPull}px`,
        '--sound-track-width': `${soundedWidthRatio * 100}%`,
        '--sound-path-width': currentSoundTiming === 'quick' ? '5.25rem' : '8.25rem',
      }}
    >
      <span className="word-display" aria-hidden="true">
        {prefix && <span className="punctuation">{prefix}</span>}
        <span className="letters">
          {groupModels.map((group, groupIndex) => (
            <span
              key={`${group.text}-${groupIndex}`}
              className={`${group.silent ? 'is-silent' : ''} ${hasSoundCues && group.text.length > 1 && !group.silent ? 'is-grapheme-team' : ''} ${hasSoundCues && active && group.soundIndex === cueIndex ? 'is-cued' : ''} ${hasSoundCues && !group.silent && (complete || (active && group.soundIndex < cueIndex)) ? 'is-passed' : ''}`}
            >
              {group.text}
            </span>
          ))}
        </span>
        {suffix && <span className="punctuation">{suffix}</span>}
      </span>
      <div className="slider-wrap">
        <span className={`slider-rail ${hasSoundCues ? 'has-sound-groups' : ''}`} aria-hidden="true">
          <span className="slider-segments">
            {(hasSoundCues ? soundGroups : [{ text: readableWord }]).map((group, groupIndex) => (
              <i
                key={`${group.text}-${groupIndex}`}
                className={`sound-segment ${hasSoundCues ? `is-${soundTimings[groupIndex]}` : ''} ${hasSoundCues && groupIndex === cueIndex && active ? 'is-current' : ''} ${hasSoundCues && (complete || groupIndex < cueIndex) ? 'is-passed' : ''}`}
                style={{ flexGrow: soundWeights[groupIndex] }}
              />
            ))}
          </span>
        </span>
        {!hasSoundCues && (
          <span
            className="slider-progress"
            style={{ transform: `scaleX(${value / 100})` }}
            aria-hidden="true"
          />
        )}
        <span
          className="slider-marker"
          aria-hidden="true"
          onTransitionEnd={(event) => {
            if (event.propertyName === 'left') setReturning(false)
          }}
        ><i /></span>
        <input
          ref={inputRef}
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={value}
          disabled={!active}
          aria-label={`Read the word ${readableWord}`}
          aria-describedby="reading-instruction"
          aria-valuetext={sliderValueText}
          onPointerDown={beginDrag}
          onPointerMove={trackBackGesture}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onBlur={(event) => pullMarkerBack(event.currentTarget.value)}
          onChange={(event) => moveWithCue(event.target.value)}
          onKeyDown={(event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
            event.preventDefault()
            if (event.key === 'Home') moveWithCue(0)
            if (event.key === 'End') moveWithCue(100)
            if (event.key === 'ArrowLeft' && value <= 0 && index > 0) onPrevious(index)
            else if (event.key === 'ArrowLeft') moveWithCue(Math.max(0, value - 10))
            if (event.key === 'ArrowRight') moveWithCue(Math.min(100, value + 10))
          }}
        />
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
