import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ContextPicture } from './ContextPicture'
import { earlyReaderCueGroups, earlyReaderSoundTiming, earlyReaderWordFeatures } from './stories'
import { clamp, locateDrag } from './drag'

const Chevron = ({ back = false }) => <svg aria-hidden="true" viewBox="0 0 24 24" className={`icon ${back ? 'icon-left' : ''}`}><path d="m9 5 7 7-7 7" /></svg>
const stopAudio = () => window.speechSynthesis?.cancel()

function readPlace(id) {
  try {
    const saved = JSON.parse(localStorage.getItem(`lesen:${id}`))
    return saved && Number.isInteger(saved.page) ? saved : {}
  } catch { return {} }
}

export function Reader({ story, onClose }) {
  const [sentenceIndex, setSentenceIndex] = useState(() => clamp(readPlace(story.id).page || 0, 0, story.sentences.length - 1))
  const [wordIndex, setWordIndex] = useState(0)
  const [positions, setPositions] = useState({})
  const [finished, setFinished] = useState(false)
  const [ending, setEnding] = useState(false)
  const [supported, setSupported] = useState(['preschool', 'kindy'].includes(story.level))
  const [floating, setFloating] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showDemo, setShowDemo] = useState(() => {
    try { return !localStorage.getItem('lesen:drag-demonstrated') } catch { return true }
  })
  const [speaking, setSpeaking] = useState(false)
  const [audioError, setAudioError] = useState('')
  const stageRef = useRef(null)
  const railRefs = useRef([])
  const handleRefs = useRef([])
  const gestureRef = useRef(null)
  const indexRef = useRef(0)
  const positionsRef = useRef({})
  const headingRef = useRef(null)
  const endingRef = useRef(null)
  const sentence = story.sentences[sentenceIndex]
  const words = sentence.split(/\s+/)
  const mode = story.mode ?? 'story'
  const unit = mode === 'sound' ? 'Sound' : mode === 'word' ? 'Word' : 'Page'
  const ready = finished || !supported
  const lastPage = sentenceIndex === story.sentences.length - 1
  const progress = (sentenceIndex + (ready ? 1 : 0)) / story.sentences.length * 100

  useEffect(() => {
    try { localStorage.setItem(`lesen:${story.id}`, JSON.stringify({ page: sentenceIndex })) } catch { /* Reading still works without storage. */ }
  }, [story.id, sentenceIndex])

  useEffect(() => () => stopAudio(), [])
  useEffect(() => { if (ending) endingRef.current?.focus({ preventScroll: true }) }, [ending])

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
    return () => {
      window.removeEventListener('resize', cancel)
      window.removeEventListener('blur', cancel)
    }
  }, [])

  const place = (index, value) => {
    const next = { ...positionsRef.current, [index]: value }
    // Backtracking restores a genuine reading position, including after completion.
    for (let i = index + 1; i < words.length; i++) delete next[i]
    for (let i = 0; i < index; i++) next[i] = 100
    positionsRef.current = next
    indexRef.current = index
    setPositions(next)
    setWordIndex(index)
    setFinished(index === words.length - 1 && value >= 100)
  }

  const railGeometry = () => railRefs.current.slice(0, words.length).map((rail, index) => {
    if (!rail) return null
    const bounds = rail.getBoundingClientRect()
    const handle = handleRefs.current[index]?.getBoundingClientRect()
    return { left: bounds.left, right: bounds.right, width: bounds.width, y: handle ? handle.top + handle.height / 2 : bounds.bottom + 48 }
  })

  const beginDrag = (event, index, fromRail = false) => {
    if (gestureRef.current || !event.isPrimary || event.button !== 0) return
    event.preventDefault()
    try { localStorage.setItem('lesen:drag-demonstrated', 'yes') } catch { /* Optional hint preference. */ }
    const handle = handleRefs.current[index].getBoundingClientRect()
    const rails = railGeometry()
    const centreX = handle.left + handle.width / 2
    const centreY = handle.top + handle.height / 2
    const offsetX = fromRail ? 0 : event.clientX - centreX
    const offsetY = event.clientY - centreY
    gestureRef.current = { pointerId: event.pointerId, offsetX, offsetY }
    stageRef.current.setPointerCapture(event.pointerId)
    handleRefs.current[index].focus({ preventScroll: true })
    if (fromRail) place(index, clamp((event.clientX - rails[index].left) / rails[index].width * 100, 0, 100))
    else if (index !== indexRef.current) place(index, positionsRef.current[index] ?? 0)
    setFloating({ x: event.clientX - offsetX, y: centreY })
  }

  const drag = (event) => {
    const gesture = gestureRef.current
    if (!gesture || event.pointerId !== gesture.pointerId) return
    const x = event.clientX - gesture.offsetX
    const y = event.clientY - gesture.offsetY
    const next = locateDrag(indexRef.current, x, y, railGeometry())
    place(next.index, next.value)
    setFloating({ x, y })
  }

  const selectWord = (index, value = 0) => {
    endDrag()
    place(clamp(index, 0, words.length - 1), value)
    requestAnimationFrame(() => handleRefs.current[clamp(index, 0, words.length - 1)]?.focus({ preventScroll: true }))
  }

  const resetPage = (index = sentenceIndex) => {
    endDrag()
    setShowDemo(false)
    stopAudio()
    setSpeaking(false)
    setAudioError('')
    positionsRef.current = {}
    indexRef.current = 0
    setPositions({})
    setWordIndex(0)
    setFinished(false)
    setEnding(false)
    setSentenceIndex(index)
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }))
  }

  const speak = () => {
    if (speaking) { stopAudio(); setSpeaking(false); return }
    if (!window.speechSynthesis) return
    const utterance = new SpeechSynthesisUtterance(sentence)
    utterance.lang = 'en-AU'
    utterance.rate = .8
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = (event) => {
      setSpeaking(false)
      if (!['interrupted', 'canceled'].includes(event.error)) setAudioError('Voice playback is unavailable. You can keep reading.')
    }
    setAudioError('')
    stopAudio()
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <main className="reader-shell">
      <header className="reader-header">
        <button className="icon-button" onClick={onClose} aria-label="Back to stories"><Chevron back /></button>
        <div className="reader-meta" ref={headingRef} tabIndex={-1}>
          <strong>{story.title}</strong>
          <span>{ending ? 'The end' : `${unit} ${sentenceIndex + 1} of ${story.sentences.length}`}</span>
        </div>
        <button className="icon-button" aria-label="How to read" aria-expanded={showHelp} onClick={() => setShowHelp(!showHelp)}>?</button>
      </header>
      <div className="progress-track" role="progressbar" aria-label="Story progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
      {showHelp && <aside className="reading-help">
        <div className="drag-demo" aria-hidden="true"><span /><i /></div>
        <strong>Slide along as you read.</strong>
        <p>Hold the blue handle. Pause whenever you like. Keep holding to move to the next word, or go back.</p>
        <p><span className="cue-example hold" /> Stretch the sound. <span className="cue-example quick" /> A quick sound.</p>
        <p>Joined letters share a cue. Grey letters stay quiet. The arrows let you move without dragging.</p>
        <button className="quiet-button" onClick={() => setShowHelp(false)}>Let’s read</button>
      </aside>}
      {ending ? <section className="story-ending">
        <span className="ending-art" aria-hidden="true">{story.pictures?.at(-1)?.symbol ?? story.art}</span>
        <p className="eyebrow">{mode === 'story' ? 'The end' : 'Practice complete'}</p>
        <h1 ref={endingRef} tabIndex={-1}>{mode === 'story' ? 'One more time?' : 'What shall we try next?'}</h1>
        <p>{story.recall ?? (mode === 'story' ? 'Tell someone your favourite part.' : 'Try your favourite sound or word again.')}</p>
        <div className="ending-actions"><button className="primary-button" onClick={() => resetPage(0)}>Read again</button><button className="quiet-button" onClick={onClose}>Choose another</button></div>
      </section> : <>
        <section ref={stageRef} className={`reading-stage ${story.pictures ? 'has-picture-cue' : ''} ${floating ? 'is-dragging' : ''}`}
          aria-label="Reading practice" onPointerMove={drag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}>
          {story.pictures?.[sentenceIndex] && <ContextPicture pictures={story.pictures} currentIndex={sentenceIndex} progress={finished ? 1 : (positions[0] ?? 0) / 100} celebrating={finished} mode={mode} target={sentence} />}
          <p className="reader-prompt" id="reading-instruction">{!supported ? 'Read at your own pace.' : mode === 'sound' ? 'Say the sound. Slide along.' : 'Slide along. Take your time.'}</p>
          {supported && showDemo && <div className="first-drag-hint"><div className="drag-demo" aria-hidden="true"><span /><i /></div><span>Hold. Slide. Try it!</span><button className="text-button" aria-label="Hide dragging demonstration" onClick={() => { setShowDemo(false); try { localStorage.setItem('lesen:drag-demonstrated', 'yes') } catch { /* Optional preference. */ } }}>Got it</button></div>}
          {supported ? <>
            <p className="sr-only">{sentence}</p>
            <div className="word-line">
              {words.map((word, index) => <WordSlider key={`${sentenceIndex}-${index}`} word={word} index={index}
                active={index === wordIndex} complete={index < wordIndex} value={positions[index] ?? 0}
                cueing={['preschool', 'kindy'].includes(story.level)} practiceMode={mode}
                railRef={(node) => { railRefs.current[index] = node }} handleRef={(node) => { handleRefs.current[index] = node }}
                onStart={beginDrag} onPlace={selectWord} last={index === words.length - 1} />)}
            </div>
            {floating && <span className="slider-marker floating-marker" style={{ left: floating.x, top: floating.y }} aria-hidden="true"><i /></span>}
          </> : <p className="independent-sentence">{sentence}</p>}
        </section>
        <footer className="reading-controls">
          {supported && <div className="word-controls" aria-label="Word controls">
            <button className="quiet-button" disabled={wordIndex === 0 && (positions[0] ?? 0) === 0} onClick={() => selectWord(wordIndex > 0 ? wordIndex - 1 : 0)}><Chevron back /> Back</button>
            <button className="quiet-button" onClick={() => wordIndex < words.length - 1 ? selectWord(wordIndex + 1) : selectWord(wordIndex, 100)}>{wordIndex < words.length - 1 ? 'Next word' : 'Done'}<Chevron /></button>
          </div>}
          <div className="page-controls">
            <button className="quiet-button" disabled={sentenceIndex === 0} onClick={() => resetPage(sentenceIndex - 1)} aria-label={`Previous ${unit.toLowerCase()}`}><Chevron back /></button>
            <button className="quiet-button" onClick={() => resetPage()}>Read again</button>
            <button className="primary-button" disabled={!ready || Boolean(floating)} onClick={() => { if (lastPage) { stopAudio(); setEnding(true) } else resetPage(sentenceIndex + 1) }}>{lastPage ? 'Finish' : `Next ${unit.toLowerCase()}`}<Chevron /></button>
          </div>
          <p className="completion-note" aria-live="polite">{finished && !floating ? `${unit} complete. Read again or keep going.` : '\u00a0'}</p>
          <div className="reader-options">
            {mode === 'story' && <button className="text-button" aria-pressed={supported} onClick={() => { endDrag(); setSupported(!supported) }}>{supported ? 'Read without sliders' : 'Show reading sliders'}</button>}
            {mode !== 'sound' && 'speechSynthesis' in window && <button className="text-button" onClick={speak}>{speaking ? 'Stop voice' : 'Hear with device voice'}</button>}
          </div>
          {audioError && <p role="status">{audioError}</p>}
        </footer>
      </>}
    </main>
  )
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
          else if (['ArrowLeft', 'ArrowDown'].includes(event.key)) onPlace(value === 0 && index > 0 ? index - 1 : index, value === 0 && index > 0 ? 100 : Math.max(0, value - 5))
          else onPlace(value === 100 && !last ? index + 1 : index, value === 100 && !last ? 0 : Math.min(100, value + 5))
        }}><span className="slider-marker" aria-hidden="true"><i /></span></button>
    </div>
  </div>
}
