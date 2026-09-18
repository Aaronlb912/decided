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
        setMiss(result || 'That file is not a meeting book we can load.')
      }
    }
    reader.onerror = () => setMiss('Could not read that file.')
    reader.readAsText(file)
  }

  function needName(then) {
    if (!String(deskName || '').trim()) {
      setMiss('Write who is at the desk.')
      return
    }
    setMiss('')
    then()
  }

  return (
    <div className="site">
      <div className="site-cover">
        <p className="site-back">
          <a href="#/">Cover</a>
        </p>
        <p className="site-mark">Open the book</p>
        <h1>Decided</h1>
        <label className="site-name">
          Who's at the desk
          <input
            value={deskName}
            onChange={(event) => {
              onDeskName(event.target.value)
              setMiss('')
            }}
            autoComplete="name"
          />
        </label>
        {miss ? (
          <p className="site-miss" role="alert">
            {miss}
          </p>
        ) : null}
        <div className="site-actions">
          {hasBook ? (
            <button type="button" className="site-primary" onClick={() => needName(onContinue)}>
              Continue {bookTitle || 'this book'}
            </button>
          ) : null}
          <button type="button" className="site-secondary" onClick={() => needName(onSample)}>
            Oak & Vine sample
          </button>
          <button type="button" className="site-secondary" onClick={() => needName(onBlank)}>
            Blank book
          </button>
          <button
            type="button"
            className="site-secondary"
            onClick={() => {
              if (!String(deskName || '').trim()) {
                setMiss('Write who is at the desk.')
                return
              }
              setMiss('')
              fileRef.current && fileRef.current.click()
            }}
          >
            Load JSON
          </button>
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
