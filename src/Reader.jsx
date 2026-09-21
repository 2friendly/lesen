
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ContextPicture } from './ContextPicture'
import { earlyReaderCueGroups, earlyReaderSoundTiming, earlyReaderWordFeatures } from './stories'
import { markerOnRail, positionOnRail } from './drag'
import { readingSteps, savedStepIndex } from './readingSteps'

const Chevron = ({ back = false }) => <svg aria-hidden="true" viewBox="0 0 24 24" className={`icon ${back ? 'icon-left' : ''}`}><path d="m9 5 7 7-7 7" /></svg>
const Book = () => <svg aria-hidden="true" viewBox="0 0 24 24" className="icon"><path d="M12 5v15M12 5C9 3 5 3 2 4v14c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-7-1-10 1Z" /></svg>
const stopAudio = () => window.speechSynthesis?.cancel()
const readPlace = (id) => {
  try { return JSON.parse(localStorage.getItem(`lesen:${id}`)) ?? {} } catch { return {} }
}

export function Reader({ story, onClose, nextStory, onNextStory, resume = false }) {
  const earlyReader = ['preschool', 'kindy'].includes(story.level)
  const [supported, setSupported] = useState(earlyReader)
  const steps = readingSteps(story, supported)
  const [stepIndex, setStepIndex] = useState(() => resume ? savedStepIndex(steps, readPlace(story.id)) : 0)
  const [value, setValue] = useState(0)
  const [ending, setEnding] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [floating, setFloating] = useState(null)
  const [speaking, setSpeaking] = useState(false)
  const [audioError, setAudioError] = useState('')
  const stageRef = useRef(null)
  const railRef = useRef(null)
  const handleRef = useRef(null)
  const gestureRef = useRef(null)
  const headingRef = useRef(null)
  const step = steps[stepIndex] ?? steps[0]
  const mode = story.mode ?? 'story'
  const lastStep = stepIndex === steps.length - 1
  const progress = ending ? 100 : stepIndex / steps.length * 100

  useEffect(() => {
    try { localStorage.setItem(`lesen:${story.id}`, JSON.stringify({ page: step.page, word: step.word })) } catch { /* Storage is optional. */ }
  }, [story.id, step.page, step.word])
  useEffect(() => () => stopAudio(), [])

  const endDrag = (event) => {
    const gesture = gestureRef.current
    if (!gesture || (event && event.pointerId !== gesture.pointerId)) return
    gestureRef.current = null
    setFloating(null)
    if (stageRef.current?.hasPointerCapture(gesture.pointerId)) stageRef.current.releasePointerCapture(gesture.pointerId)
  }

  useEffect(() => {
    const cancel = () => endDrag()
    window.addEventListener('resize', cancel)
    window.addEventListener('blur', cancel)
    return () => { window.removeEventListener('resize', cancel); window.removeEventListener('blur', cancel) }
  }, [])

  const geometry = () => {
    const rail = railRef.current.getBoundingClientRect()
    const handle = handleRef.current.getBoundingClientRect()
    return { left: rail.left, right: rail.right, width: rail.width, y: handle.top + handle.height / 2 }
  }
  const beginDrag = (event, index, fromRail = false) => {
    if (gestureRef.current || !event.isPrimary || event.button !== 0) return
    event.preventDefault()
    const rail = geometry()
    const offsetX = fromRail ? 0 : event.clientX - (rail.left + rail.width * value / 100)
    gestureRef.current = { pointerId: event.pointerId, offsetX }
    stageRef.current.setPointerCapture(event.pointerId)
    handleRef.current.focus({ preventScroll: true })
    const x = event.clientX - offsetX
    if (fromRail) setValue(positionOnRail(rail, x))
    setFloating(markerOnRail(rail, x))
  }
  const drag = (event) => {
    const gesture = gestureRef.current
    if (!gesture || event.pointerId !== gesture.pointerId) return
    const rail = geometry()
    const x = event.clientX - gesture.offsetX
    setValue(positionOnRail(rail, x))
    setFloating(markerOnRail(rail, x))
  }

  const clearInteraction = () => {
    endDrag()
    stopAudio()
    setSpeaking(false)
    setAudioError('')
    setValue(0)
    setShowHelp(false)
  }
  const goTo = (index) => {
    clearInteraction()
    setEnding(false)
    setStepIndex(index)
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }))
  }
  const next = () => {
    if (lastStep) { clearInteraction(); setEnding(true); requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true })) }
    else goTo(stepIndex + 1)
  }
  const back = () => ending ? goTo(stepIndex) : stepIndex > 0 ? goTo(stepIndex - 1) : onClose()
  const toggleSupport = () => {
    clearInteraction()
    const nextSupported = !supported
    setStepIndex(savedStepIndex(readingSteps(story, nextSupported), { page: step.page, word: 0 }))
    setSupported(nextSupported)
  }
  const speak = () => {
    if (speaking) { stopAudio(); setSpeaking(false); return }
    if (!window.speechSynthesis) return
    const utterance = new SpeechSynthesisUtterance(step.text)
    utterance.lang = 'en-AU'
    utterance.rate = .8
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = (event) => {
      setSpeaking(false)
      if (!['interrupted', 'canceled'].includes(event.error)) setAudioError('Voice unavailable. You can keep reading.')
    }
    stopAudio()
    setAudioError('')
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  return <main className="reader-shell tablet-reader">
    <header className="reader-header">
      <button className="quiet-button stories-button" onClick={onClose}><Book /> Stories</button>
      <div className="reader-meta" ref={headingRef} tabIndex={-1}><strong>{story.title}</strong><span>{ending ? 'The end' : `${mode === 'sound' ? 'Sound' : supported ? 'Word' : 'Page'} ${stepIndex + 1} of ${steps.length}`}</span></div>
      <button className="icon-button" aria-label={showHelp ? 'Close reading help' : 'Reading help and options'} aria-expanded={showHelp} onClick={() => { endDrag(); setShowHelp(!showHelp) }}>{showHelp ? '×' : '?'}</button>
    </header>
    <div className="progress-track" role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
    {showHelp ? <section className="tablet-help">
      <div className="drag-demo" aria-hidden="true"><span /><i /></div>
      <h1>Slide. Read. Next.</h1>
      <p>Slide the blue handle as you read. Tap the big arrow for the next word. The other arrow takes you back.</p>
      <p><span className="cue-example hold" /> Stretch the sound. <span className="cue-example quick" /> A quick sound.</p>
      <div className="help-options">
        {mode === 'story' && <button className="quiet-button" onClick={toggleSupport}>{supported ? 'Read whole sentences' : 'Practise one word at a time'}</button>}
        {mode !== 'sound' && 'speechSynthesis' in window && <button className="quiet-button" onClick={speak}>{speaking ? 'Stop voice' : 'Hear with device voice'}</button>}
      </div>
      {audioError && <p role="status">{audioError}</p>}
      <button className="primary-button" onClick={() => setShowHelp(false)}>Back to reading</button>
    </section> : ending ? <section className="story-ending">
      <span className="ending-art" aria-hidden="true">{story.pictures?.at(-1)?.symbol ?? story.art}</span>
      <p className="eyebrow">{mode === 'story' ? 'The end' : 'All done'}</p>
      <h1>{mode === 'story' ? 'You reached the end!' : 'A little more practice?'}</h1>
      <p>{nextStory ? <>Up next: <strong>{nextStory.title}</strong> <span aria-hidden="true">{nextStory.art}</span></> : 'Choose another story to read.'}</p>
      <button className="quiet-button" onClick={() => goTo(0)}>↺ Read again</button>
    </section> : <section ref={stageRef} className={`reading-stage ${floating ? 'is-dragging' : ''}`} aria-label="Reading practice" onPointerMove={drag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}>
      {story.pictures?.[step.page] && <ContextPicture pictures={story.pictures} currentIndex={step.page} progress={value / 100} celebrating={value === 100} mode={mode} target={step.text} />}
      {supported && mode === 'story' && <p className="sentence-context" aria-label={`Sentence: ${step.sentence}`}>{step.sentence.split(/\s+/).map((word, index) => <React.Fragment key={index}><span className={index === step.word ? 'current-word' : ''} aria-current={index === step.word ? 'step' : undefined}>{word}</span>{' '}</React.Fragment>)}</p>}
      <p className="reader-prompt" id="reading-instruction">{supported ? mode === 'sound' ? 'Say the sound. Slide along.' : 'Slide along as you read.' : 'Read at your own pace.'}</p>
      {supported ? <div className="word-line solo-word"><p className="sr-only">{step.text}</p><WordSlider key={`${stepIndex}-${supported}`} word={step.text} index={0} active complete={false} value={value} cueing={earlyReader} practiceMode={mode}
        railRef={(node) => { railRef.current = node }} handleRef={(node) => { handleRef.current = node }} onStart={beginDrag} onPlace={(index, nextValue) => { endDrag(); setValue(nextValue) }} last /></div>
        : <p className="independent-sentence">{step.text}</p>}
      {floating && <span className="slider-marker floating-marker" style={{ left: floating.x, top: floating.y }} aria-hidden="true"><i /></span>}
    </section>}
    {!showHelp && <footer className="tablet-navigation" aria-label="Reading navigation">
      <button className="navigation-button nav-back" onClick={back}><Chevron back /><span>Back</span></button>
      <span className="navigation-hint" aria-live="polite">{ending ? 'Ready for another?' : value === 100 ? 'Ready? Tap Next.' : 'Take your time.'}</span>
      <button className="navigation-button nav-next" onClick={ending ? nextStory ? onNextStory : onClose : next}><span>{ending ? nextStory ? 'Next story' : 'Stories' : 'Next'}</span><Chevron /></button>
    </footer>}
  </main>
}

function WordSlider({ word, index, active, complete, value, cueing, practiceMode, railRef, handleRef, onStart, onPlace, last }) {
  const [, prefix = '', readable = word, suffix = ''] = word.match(/^([^\p{L}\p{N}]*)([\p{L}\p{N}'’-]+)([^\p{L}\p{N}]*)$/u) ?? []
  const key = readable.toLowerCase()
  const authored = cueing ? earlyReaderCueGroups[key] : null
  const valid = authored?.join('') === key
  const silent = new Set(earlyReaderWordFeatures[key]?.silentGroups ?? [])
  let offset = 0
  let soundIndex = 0
  const groups = (valid ? authored : [readable]).map((group, i) => {
    const text = readable.slice(offset, offset + group.length)
    offset += group.length
    const quiet = valid && silent.has(i)
    return { text, silent: quiet, index: quiet ? -1 : soundIndex++, timing: earlyReaderSoundTiming[group] ?? 'hold' }
  })
  const sounded = groups.filter((group) => !group.silent)
  const segmentsRef = useRef(null)
  const [cue, setCue] = useState(0)
  useLayoutEffect(() => {
    const measure = () => {
      const node = segmentsRef.current
      if (!node) return
      const rail = node.getBoundingClientRect()
      const x = rail.left + rail.width * value / 100
      const segments = [...node.children]
      // Gaps belong to the preceding sound; activation starts exactly at
      // the next painted segment, in either direction.
      let current = 0
      segments.forEach((segment, i) => { if (x >= segment.getBoundingClientRect().left) current = i })
      setCue(current)
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (segmentsRef.current) observer.observe(segmentsRef.current)
    return () => observer.disconnect()
  }, [value, word])
  const width = valid ? Math.max(9, sounded.reduce((total, group) => total + (group.timing === 'quick' ? .62 : 1.65) * 3.35, 0)) : Math.max(9, readable.length * 1.35)
  return <div className={`word-unit ${active ? 'is-active' : ''} ${complete ? 'is-complete' : ''} ${practiceMode === 'sound' ? 'is-sound-practice' : ''}`} style={{ '--word-path-width': `${width + 6}rem`, '--marker-position': `${value}%` }}>
    <span className="word-display" aria-hidden="true"><span className="punctuation">{prefix}</span><span className="letters">{groups.map((group, i) => <span key={i} className={`${group.silent ? 'is-silent' : ''} ${valid && group.text.length > 1 && !group.silent ? 'is-grapheme-team' : ''} ${valid && active && group.index === cue ? 'is-cued' : ''} ${!group.silent && (complete || (active && group.index < cue)) ? 'is-passed' : ''}`}>{group.text}</span>)}</span><span className="punctuation">{suffix}</span></span>
    <div className="slider-wrap">
      <div className={`slider-rail ${valid ? 'has-sound-groups' : ''}`}>
        <span className="slider-segments" ref={(node) => { segmentsRef.current = node; railRef(node) }} aria-hidden="true">{sounded.map((group, i) => <i key={i} className={`sound-segment ${valid ? `is-${group.timing}` : ''} ${active && i === cue ? 'is-current' : ''} ${complete || (active && i < cue) ? 'is-passed' : ''}`} style={{ flexGrow: valid && group.timing === 'quick' ? .62 : 1.65 }} />)}</span>
        <button className="rail-touch" tabIndex={-1} aria-label={`Move reading marker in ${readable}`} onPointerDown={(event) => onStart(event, index, true)} />
      </div>
      <button className="handle-target" ref={handleRef} role="slider" aria-label={`Read ${readable}`} aria-describedby="reading-instruction" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}
        aria-valuetext={valid ? `${sounded[cue]?.text}, ${sounded[cue]?.timing === 'quick' ? 'quick sound' : 'stretch sound'}` : `${Math.round(value)} percent through ${readable}`}
        tabIndex={active ? 0 : -1} onPointerDown={(event) => onStart(event, index)}
        onKeyDown={(event) => {
          if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
          event.preventDefault()
          if (event.key === 'Home') onPlace(index, 0)
          else if (event.key === 'End') onPlace(index, 100)
          else if (['ArrowLeft', 'ArrowDown'].includes(event.key)) onPlace(value === 0 && index > 0 ? index - 1 : index, value === 0 && index > 0 ? 100 : Math.max(0, value - 5), false)
          else onPlace(value === 100 && !last ? index + 1 : index, value === 100 && !last ? 0 : Math.min(100, value + 5))
        }}><span className="slider-marker" aria-hidden="true"><i /></span></button>
    </div>
  </div>
}
