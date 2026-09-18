import { useRef, useState } from 'react'

export function OpenBook({
  deskName,
  onDeskName,
  hasBook,
  bookTitle,
  onContinue,
  onSample,
  onBlank,
  onLoad,
}) {
  const fileRef = useRef(null)
  const [miss, setMiss] = useState('')

  function pickFile(event) {
    const file = event.target.files && event.target.files[0]
    event.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = onLoad(String(reader.result || ''))
      if (result !== true) {
        setMiss(result || 'That file is not a notebook we can open.')
      }
    }
    reader.onerror = () => setMiss('Could not read that file. Try again.')
    reader.readAsText(file)
  }

  function needName(then) {
    if (!String(deskName || '').trim()) {
      setMiss('Write your name first. It stays in this browser. It is not an account.')
      return
    }
    setMiss('')
    then()
  }

  return (
    <div className="site">
      <div className="site-cover">
        <p className="site-back">
          <a href="#/">Front cover</a>
        </p>
        <p className="site-mark">Pick a notebook</p>
        <h1>Decided</h1>
        <label className="site-name">
          Your name
          <input
            value={deskName}
            onChange={(event) => {
              onDeskName(event.target.value)
              setMiss('')
            }}
            autoComplete="name"
          />
        </label>
        <p className="site-why">
          It is written on the spine so the shop knows who used
          this computer. It stays in this browser. Not an account.
        </p>
        {miss ? (
          <p className="site-miss" role="alert">
            {miss}
          </p>
        ) : null}
        <div className="site-actions">
          {hasBook ? (
            <div className="site-choice">
              <button type="button" className="site-primary" onClick={() => needName(onContinue)}>
                Keep {bookTitle || 'this notebook'}
              </button>
              <p className="site-hint">The notebook already in this browser.</p>
            </div>
          ) : null}
          <div className="site-choice">
            <button type="button" className="site-secondary" onClick={() => needName(onSample)}>
              Open the florist sample
            </button>
            <p className="site-hint">Oak & Vine. Practice, fake shop.</p>
          </div>
          <div className="site-choice">
            <button type="button" className="site-secondary" onClick={() => needName(onBlank)}>
              Start a blank notebook
            </button>
            <p className="site-hint">Your own meeting.</p>
          </div>
          <div className="site-choice">
            <button
              type="button"
              className="site-secondary"
              onClick={() => {
                if (!String(deskName || '').trim()) {
                  setMiss(
                    'Write your name first. It stays in this browser. It is not an account.',
                  )
                  return
                }
                setMiss('')
                fileRef.current && fileRef.current.click()
              }}
            >
              Load a saved notebook file
            </button>
            <p className="site-hint">A file you saved from here (.json).</p>
          </div>
        </div>
        <input
          ref={fileRef}
          className="site-file"
          type="file"
          accept="application/json,.json"
          onChange={pickFile}
        />
      </div>
    </div>
  )
}
