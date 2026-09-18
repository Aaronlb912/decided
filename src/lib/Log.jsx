import { useEffect, useRef, useState } from 'react'
import { Book } from './Book.jsx'
import { DecisionPage } from './DecisionPage.jsx'
import { PasteBox } from './PasteBox.jsx'
import {
  blankDecision,
  blankLog,
  decisionsFromLines,
  downloadLog,
  formatHeadingDate,
  formatWhen,
  newDecisionId,
  normalizeDecision,
  normalizeLog,
  parseLogJson,
} from './decided-json.js'
import './decided.css'

export function Log({ value, onChange, onResetSample }) {
  const log = normalizeLog(value)
  const [open, setOpen] = useState(null)
  const [undo, setUndo] = useState(null)
  const [query, setQuery] = useState('')
  const [pasting, setPasting] = useState(false)
  const [pageTab, setPageTab] = useState('open')
  const [renaming, setRenaming] = useState(false)
  const [dating, setDating] = useState(false)
  const [titleDraft, setTitleDraft] = useState(log.title)
  const [dateDraft, setDateDraft] = useState(log.meetingOn)
  const [loadMiss, setLoadMiss] = useState('')
  const undoTimer = useRef(null)
  const fileRef = useRef(null)
  const searchRef = useRef(null)
  const skipTitleBlur = useRef(false)

  useEffect(() => {
    if (!renaming) setTitleDraft(log.title)
  }, [log.title, renaming])

  useEffect(() => {
    if (!dating) setDateDraft(log.meetingOn)
  }, [log.meetingOn, dating])

  useEffect(() => {
    function onKey(event) {
      if (event.target.closest('input, textarea, select')) return
      if (event.key === 'n') {
        event.preventDefault()
        addNew()
      }
      if (event.key === '/') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function changeLog(next) {
    onChange(normalizeLog(next))
  }

  function changeDecisions(decisions) {
    changeLog({ ...log, decisions })
  }

  function addNew() {
    setUndo(null)
    setLoadMiss('')
    setPasting(false)
    setOpen({ mode: 'new', decision: { ...blankDecision(), stillOpen: true } })
  }

  function openOne(decision) {
    setLoadMiss('')
    setPasting(false)
    setOpen({ mode: 'edit', decision })
  }

  function saveDecision(next) {
    if (open?.mode === 'new') {
      changeDecisions([...log.decisions, next])
    } else {
      changeDecisions(
        log.decisions.map((item) => (item.id === next.id ? next : item)),
      )
    }
    setOpen(null)
  }

  function removeDecision(id) {
    const index = log.decisions.findIndex((item) => item.id === id)
    if (index < 0) return
    const decision = log.decisions[index]
    const decisions = log.decisions.filter((item) => item.id !== id)
    changeDecisions(decisions)
    setOpen(null)
    if (undoTimer.current) clearTimeout(undoTimer.current)
    setUndo({ decision, index })
    undoTimer.current = setTimeout(() => setUndo(null), 12000)
  }

  function undoRemove() {
    if (!undo) return
    const decisions = [...log.decisions]
    decisions.splice(Math.min(undo.index, decisions.length), 0, undo.decision)
    changeDecisions(decisions)
    if (undoTimer.current) clearTimeout(undoTimer.current)
    setUndo(null)
  }

  function closeDecision(id) {
    const today = new Date()
    const closedOn = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    changeDecisions(
      log.decisions.map((item) =>
        item.id === id ? { ...item, stillOpen: false, closedOn } : item,
      ),
    )
  }

  function reopenDecision(id) {
    changeDecisions(
      log.decisions.map((item) =>
        item.id === id ? { ...item, stillOpen: true, closedOn: '' } : item,
      ),
    )
  }

  function duplicateDecision(item) {
    const copy = normalizeDecision({
      ...item,
      id: newDecisionId(),
      what: item.what ? `${item.what} (copy)` : 'Copy',
    })
    setOpen({ mode: 'new', decision: copy })
  }

  function keepLines(lines, thread) {
    const added = decisionsFromLines(lines, { thread })
    changeDecisions([...log.decisions, ...added])
    setPasting(false)
  }

  function commitTitle() {
    if (skipTitleBlur.current) {
      skipTitleBlur.current = false
      return
    }
    const title = titleDraft.trim() || 'Decisions'
    setRenaming(false)
    if (title !== log.title) changeLog({ ...log, title })
  }

  function cancelTitle() {
    skipTitleBlur.current = true
    setTitleDraft(log.title)
    setRenaming(false)
  }

  function commitDate() {
    setDating(false)
    const meetingOn = dateDraft.trim()
    if (meetingOn !== log.meetingOn) changeLog({ ...log, meetingOn })
  }

  function startBlank() {
    if (!window.confirm('Clear this pad?')) return
    setUndo(null)
    setQuery('')
    setLoadMiss('')
    setRenaming(false)
    setPasting(false)
    setOpen(null)
    changeLog(blankLog())
  }

  function onPickFile(event) {
    const file = event.target.files && event.target.files[0]
    event.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const next = parseLogJson(String(reader.result || ''))
        setUndo(null)
        setQuery('')
        setLoadMiss('')
        setRenaming(false)
        setPasting(false)
        setOpen(null)
        changeLog(next)
      } catch {
        setLoadMiss('That file is not a meeting we can load.')
      }
    }
    reader.onerror = () => setLoadMiss('Could not read that file.')
    reader.readAsText(file)
  }

  const needle = query.trim().toLowerCase()
  function matches(item) {
    if (!needle) return true
    return [item.what, item.who, item.owner, item.notes, item.thread]
      .join('\n')
      .toLowerCase()
      .includes(needle)
  }

  const matched = log.decisions.filter(matches)
  const stillOpen = matched.filter((item) => item.stillOpen)
  const decided = matched
    .filter((item) => !item.stillOpen)
    .slice()
    .sort((left, right) =>
      String(right.closedOn || right.when).localeCompare(String(left.closedOn || left.when)),
    )
  const logEmpty = log.decisions.length === 0
  const missFind = !logEmpty && matched.length === 0

  const bookMenu = (
    <details className="dd-book-menu dd-noprint">
      <summary>Book</summary>
      <div className="dd-book-menu-panel">
        <button type="button" onClick={() => window.print()}>
          Print pad
        </button>
        <button type="button" onClick={() => downloadLog(log)}>
          Download JSON
        </button>
        <button type="button" onClick={() => fileRef.current && fileRef.current.click()}>
          Load JSON
        </button>
        <button type="button" onClick={startBlank}>
          Start blank
        </button>
        {onResetSample ? (
          <button type="button" onClick={onResetSample}>
            Reset sample
          </button>
        ) : null}
      </div>
      <input
        ref={fileRef}
        className="dd-file"
        type="file"
        accept="application/json,.json"
        onChange={onPickFile}
      />
    </details>
  )

  if (open) {
    return (
      <Book title={log.title} bookMenu={bookMenu}>
        <DecisionPage
          decision={open.decision}
          mode={open.mode}
          onSave={saveDecision}
          onCancel={() => setOpen(null)}
          onRemove={removeDecision}
          onDuplicate={open.mode === 'edit' ? () => duplicateDecision(open.decision) : undefined}
        />
      </Book>
    )
  }

  return (
    <Book title={log.title} bookMenu={bookMenu}>
      <header className="dd-heading">
        {renaming ? (
          <h1>
            <input
              className="dd-title-input"
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              onBlur={commitTitle}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  commitTitle()
                }
                if (event.key === 'Escape') {
                  event.preventDefault()
                  cancelTitle()
                }
              }}
              autoFocus
              aria-label="Meeting title"
            />
          </h1>
        ) : (
          <h1>
            <button
              type="button"
              className="dd-title-btn"
              onClick={() => {
                setTitleDraft(log.title)
                setRenaming(true)
              }}
            >
              {log.title}
            </button>
          </h1>
        )}
        {dating ? (
          <p className="dd-heading-date">
            <input
              className="dd-date-input"
              type="date"
              value={dateDraft}
              onChange={(event) => setDateDraft(event.target.value)}
              onBlur={commitDate}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  commitDate()
                }
                if (event.key === 'Escape') {
                  event.preventDefault()
                  setDating(false)
                  setDateDraft(log.meetingOn)
                }
              }}
              autoFocus
              aria-label="Meeting date"
            />
          </p>
        ) : (
          <p className="dd-heading-date">
            <button
              type="button"
              className="dd-date-btn"
              onClick={() => {
                setDateDraft(log.meetingOn)
                setDating(true)
              }}
            >
              {formatHeadingDate(log.meetingOn) || 'Meeting date'}
            </button>
          </p>
        )}
      </header>

      <div className="dd-tray dd-noprint">
        <div className="dd-tabs">
          <button
            type="button"
            className={pageTab === 'open' ? 'is-on' : ''}
            onClick={() => setPageTab('open')}
          >
            Open
          </button>
          <button
            type="button"
            className={pageTab === 'decided' ? 'is-on' : ''}
            onClick={() => setPageTab('decided')}
          >
            Decided
          </button>
        </div>
        <label className="dd-find-stamp">
          Find
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Find a call"
          />
        </label>
        <button type="button" className="dd-new" onClick={addNew}>
          New
        </button>
        <button
          type="button"
          className={`dd-paste-btn${pasting ? ' is-on' : ''}`}
          onClick={() => setPasting((on) => !on)}
        >
          Paste
        </button>
      </div>

      {loadMiss ? (
        <p className="dd-banner dd-miss dd-noprint" role="alert">
          {loadMiss}
        </p>
      ) : null}

      {undo ? (
        <p className="dd-banner dd-undo dd-noprint">
          Removed.
          <button type="button" className="dd-quiet" onClick={undoRemove}>
            Undo
          </button>
        </p>
      ) : null}

      {pasting ? <PasteBox onKeep={keepLines} onCancel={() => setPasting(false)} /> : null}

      {logEmpty ? (
        <p className="dd-empty-line">This pad is blank.</p>
      ) : missFind ? (
        <p className="dd-empty-line">
          Nothing matches.
          <button type="button" className="dd-quiet" onClick={() => setQuery('')}>
            Clear find
          </button>
        </p>
      ) : (
        <div className="dd-spread">
          <section
            className={`dd-leaf dd-leaf-open${pageTab === 'open' ? ' is-on' : ''}`}
            aria-labelledby="dd-open-h"
          >
            <h2 id="dd-open-h">Still open</h2>
            {stillOpen.length === 0 ? (
              <p className="dd-quiet-line">Nothing open.</p>
            ) : (
              <ul className="dd-lines">
                {stillOpen.map((item) => (
                  <li key={item.id}>
                    <button type="button" className="dd-line" onClick={() => openOne(item)}>
                      <span className="dd-owner">{item.owner || item.who || '—'}</span>
                      <span className="dd-what">{item.what}</span>
                      <span className="dd-when">{formatWhen(item.followUp || item.when) || '—'}</span>
                    </button>
                    <button
                      type="button"
                      className="dd-stamp"
                      onClick={() => closeDecision(item.id)}
                    >
                      Close
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            className={`dd-leaf dd-leaf-decided${pageTab === 'decided' ? ' is-on' : ''}`}
            aria-labelledby="dd-log-h"
          >
            <h2 id="dd-log-h">Decided</h2>
            {decided.length === 0 ? (
              <p className="dd-quiet-line">Nothing filed yet.</p>
            ) : (
              <ul className="dd-lines">
                {decided.map((item) => (
                  <li key={item.id}>
                    <button type="button" className="dd-line" onClick={() => openOne(item)}>
                      <span className="dd-when">{formatWhen(item.closedOn || item.when) || '—'}</span>
                      <span className="dd-what">{item.what}</span>
                    </button>
                    <button
                      type="button"
                      className="dd-stamp dd-noprint"
                      onClick={() => reopenDecision(item.id)}
                    >
                      Reopen
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Book>
  )
}
