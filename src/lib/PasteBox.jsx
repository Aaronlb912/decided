import { useState } from 'react'
import { splitPaste, todayStamp } from './decided-json.js'

export function PasteBox({ onKeep, onCancel }) {
  const [text, setText] = useState('')
  const [thread, setThread] = useState('')
  const [when, setWhen] = useState(todayStamp())
  const [lines, setLines] = useState(null)
  const [picked, setPicked] = useState({})
  const [miss, setMiss] = useState('')

  function split(event) {
    event.preventDefault()
    const next = splitPaste(text)
    if (!next.length) {
      setLines([])
      setPicked({})
      setMiss('Paste some text first, then split it into lines.')
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
      setMiss('Split into lines first, then pick the ones to keep.')
      return
    }
    const kept = lines.filter((_, index) => picked[index])
    if (!kept.length) {
      setMiss('Tick at least one line you want to keep.')
      return
    }
    onKeep(kept, { thread: thread.trim(), when })
  }

  return (
    <section className="dd-paste-wrap dd-noprint">
      <div className="dd-paste-head">
        <h2>Paste an email or some notes, then keep the lines you want</h2>
        {onCancel ? (
          <button type="button" className="dd-quiet" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
      <form className="dd-paste" onSubmit={keep}>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Sam: Need a backup driver. Owner: Priya Shah"
          autoFocus
        />
        <label className="dd-field">
          Huddle
          <input
            value={thread}
            onChange={(event) => setThread(event.target.value)}
            placeholder="Floor huddle, 16 Sep"
          />
        </label>
        <label className="dd-field">
          Date
          <input type="date" value={when} onChange={(event) => setWhen(event.target.value)} />
        </label>
        {miss ? (
          <p className="dd-miss" role="alert">
            {miss}
          </p>
        ) : null}
        {lines ? (
          lines.length === 0 ? (
            <p className="dd-quiet-line">
              We could not turn that paste into lines to keep.
            </p>
          ) : (
            <ul className="dd-candidates">
              {lines.map((line, index) => (
                <li key={`${index}-${line.slice(0, 24)}`}>
                  <input
                    type="checkbox"
                    checked={Boolean(picked[index])}
                    onChange={() => setPicked({ ...picked, [index]: !picked[index] })}
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          )
        ) : null}
        <div className="dd-paste-actions">
          <button type="button" onClick={split}>
            Split into lines
          </button>
          {lines && lines.length > 0 ? (
            <button type="submit">Keep these lines</button>
          ) : null}
        </div>
      </form>
    </section>
  )
}
