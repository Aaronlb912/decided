import { useState } from 'react'
import { splitPaste } from './decided-json.js'

export function PasteBox({ onKeep }) {
  const [text, setText] = useState('')
  const [lines, setLines] = useState(null)
  const [picked, setPicked] = useState({})
  const [miss, setMiss] = useState('')

  function split(event) {
    event.preventDefault()
    const next = splitPaste(text)
    if (!next.length) {
      setLines([])
      setPicked({})
      setMiss('Paste a dump first.')
      return
    }
    const map = {}
    next.forEach((_, index) => {
      map[index] = true
    })
    setLines(next)
    setPicked(map)
    setMiss('')
  }

  function keep(event) {
    event.preventDefault()
    if (!lines || !lines.length) {
      setMiss('Split the paste into lines first.')
      return
    }
    const kept = lines.filter((_, index) => picked[index])
    if (!kept.length) {
      setMiss('Tick at least one line to keep.')
      return
    }
    onKeep(kept)
    setText('')
    setLines(null)
    setPicked({})
    setMiss('')
  }

  function toggle(index) {
    setPicked({ ...picked, [index]: !picked[index] })
  }

  return (
    <section className="dd-section">
      <h2>Paste a dump</h2>
      <p className="dd-hint">
        Drop in a long email or meeting notes. Split on blank lines, or
        sentences if it is one block. Tick the lines to keep.
      </p>
      <form className="dd-paste" onSubmit={keep}>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste here. Blank lines make separate calls."
        />
        {miss ? <p className="dd-miss" role="alert">{miss}</p> : null}
        {lines ? (
          lines.length === 0 ? (
            <p className="dd-hint">Nothing to keep in that paste.</p>
          ) : (
            <ul className="dd-candidates">
              {lines.map((line, index) => (
                <li key={`${index}-${line.slice(0, 24)}`}>
                  <input
                    type="checkbox"
                    checked={Boolean(picked[index])}
                    onChange={() => toggle(index)}
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          )
        ) : null}
        <div className="dd-actions">
          <button type="button" className="dd-secondary" onClick={split}>
            Split into lines
          </button>
          {lines && lines.length > 0 ? (
            <button type="submit">Keep ticked lines</button>
          ) : null}
        </div>
      </form>
    </section>
  )
}
