import React from 'react'

export function ContextPicture({ pictures, currentIndex, progress, celebrating, mode, target }) {
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
