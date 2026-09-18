import { useRef, useState } from 'react'
import { afterMotion } from '../lib/motion.js'

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
  const [opening, setOpening] = useState(false)

  function openThen(then) {
    if (opening) return
    setOpening(true)
    afterMotion(then, 300)
  }

  function pickFile(event) {
    const file = event.target.files && event.target.files[0]
    event.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = onLoad(String(reader.result || ''))
      if (result !== true) {
        setMiss(
          result ||
            'That file is not a notebook we can open. Try one you saved from this page.',
        )
      }
    }
    reader.onerror = () =>
      setMiss('We could not read that file. You can try another one.')
    reader.readAsText(file)
  }

  function needName(then) {
    if (!String(deskName || '').trim()) {
      setMiss(
        'Write your name first so we can put it on the spine. It stays in this browser, and it is not an account.',
      )
      return
    }
    setMiss('')
    then()
  }

  function goPad(then) {
    needName(() => openThen(then))
  }

  return (
    <div className="site">
      <div className={`site-cover${opening ? ' is-opening' : ''}`}>
        <p className="site-back">
          <a href="#/">Back to the closed book</a>
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
          Write your name so it shows on the spine. It stays in
          this browser on this computer. It is not an account.
        </p>
        {miss ? (
          <p className="site-miss" role="alert">
            {miss}
          </p>
        ) : null}
        <div className="site-actions">
          {hasBook ? (
            <div className="site-choice">
              <button type="button" className="site-primary" onClick={() => goPad(onContinue)}>
                Keep {bookTitle || 'this notebook'}
              </button>
              <p className="site-hint">
                This is the notebook you already have in this
                browser.
              </p>
            </div>
          ) : null}
          <div className="site-choice">
            <button type="button" className="site-secondary" onClick={() => goPad(onSample)}>
              Open the florist sample
            </button>
            <p className="site-hint">
              This opens Oak & Vine, a fake florist shop, so you
              can practice.
            </p>
          </div>
          <div className="site-choice">
            <button type="button" className="site-secondary" onClick={() => goPad(onBlank)}>
              Start a blank notebook
            </button>
            <p className="site-hint">
              This starts empty, for a meeting of your own.
            </p>
          </div>
          <div className="site-choice">
            <button
              type="button"
              className="site-secondary"
              onClick={() => {
                if (!String(deskName || '').trim()) {
                  setMiss(
                    'Write your name first so we can put it on the spine. It stays in this browser, and it is not an account.',
                  )
                  return
                }
                setMiss('')
                fileRef.current && fileRef.current.click()
              }}
            >
              Load a saved notebook file
            </button>
            <p className="site-hint">
              This opens a notebook file you saved from here.
            </p>
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
