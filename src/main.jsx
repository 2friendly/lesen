import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { levels, stories } from './stories'
import { Reader } from './Reader'

const Chevron = ({ direction = 'right' }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={`icon icon-${direction}`}>
    <path d="m9 5 7 7-7 7" />
  </svg>
)

function App() {
  const [view, setView] = useState('library')
  const [level, setLevel] = useState('preschool')
  const [story, setStory] = useState(null)
  const [resume, setResume] = useState(false)
  const [lastStory, setLastStory] = useState(() => {
    try { return stories.find((item) => item.id === localStorage.getItem('lesen:last-story')) } catch { return null }
  })

  const openStory = (nextStory, shouldResume = false) => {
    try { localStorage.setItem('lesen:last-story', nextStory.id) } catch { /* Storage is optional. */ }
    setLastStory(nextStory)
    setStory(nextStory)
    setResume(shouldResume)
    setLevel(nextStory.level)
    setView('reader')
  }

  if (view === 'reader' && story) {
    const shelf = stories.filter((item) => item.level === story.level)
    const nextStory = shelf[(shelf.findIndex((item) => item.id === story.id) + 1) % shelf.length]
    return <Reader key={story.id} story={story} resume={resume} onClose={() => setView('library')} nextStory={nextStory} onNextStory={() => openStory(nextStory)} />
  }

  return <Library key={level} level={level} setLevel={setLevel} onOpen={openStory} lastStory={lastStory} />
}

function Library({ level, setLevel, onOpen, lastStory }) {
  const [shelfPage, setShelfPage] = useState(0)
  const visibleStories = stories.filter((story) => story.level === level)
  const pageCount = Math.ceil(visibleStories.length / 2)
  const pageStories = visibleStories.slice(shelfPage * 2, shelfPage * 2 + 2)
  const isPreK = level === 'preschool'

  const itemDescription = (story) => {
    if (story.level === 'kindy') return `${story.sentences.reduce((total, sentence) => total + sentence.split(/\s+/).length, 0)} little words`
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
          <h1>{isPreK ? 'Pick something to try.' : 'Pick a story.'}</h1>
        </div>
        <div className="sun-sketch" aria-hidden="true"><span>✦</span></div>
      </section>

      {lastStory && <button className="continue-card" onClick={() => onOpen(lastStory, true)}><span aria-hidden="true">{lastStory.art}</span><span><small>Keep reading</small><strong>{lastStory.title}</strong></span><Chevron /></button>}

      <details className="shelf-settings">
        <summary>For grown-ups · Choose reading level</summary>
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
      </details>

      <section className="story-list" aria-live="polite">
        <div className="shelf-heading">
          <h2>{levels.find((item) => item.id === level)?.shelf}</h2>
          <span>{visibleStories.length} {isPreK ? 'activities' : 'stories'}</span>
        </div>
        <div className="story-grid">
          {pageStories.map((story, index) => (
            <button
              className={`story-card story-color-${index % 4}`}
              key={story.id}
              onClick={() => onOpen(story)}
            >
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
      <nav className="shelf-navigation" aria-label="Story shelf pages">
        <button className="quiet-button" disabled={shelfPage === 0} onClick={() => setShelfPage(shelfPage - 1)}><Chevron direction="left" /> Back</button>
        <span>{shelfPage + 1} / {pageCount}</span>
        <button className="primary-button" disabled={shelfPage === pageCount - 1} onClick={() => setShelfPage(shelfPage + 1)}>More stories <Chevron /></button>
      </nav>
    </main>
  )
}



createRoot(document.getElementById('root')).render(<App />)
