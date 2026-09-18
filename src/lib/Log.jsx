import { useEffect, useRef, useState } from 'react'
import { Book } from './Book.jsx'
import { DecisionPage } from './DecisionPage.jsx'
import { PasteBox } from './PasteBox.jsx'
import {
  blankBook,
  blankDecision,
  decisionsFromLines,
  downloadBook,
  formatHeadingDate,
  formatWhen,
  isOverdue,
  looksLikeBook,
  newDecisionId,
  normalizeBook,
  normalizeDecision,
  parseIncoming,
  todayStamp,
} from './decided-json.js'
import './decided.css'

function Highlight({ text, needle }) {
  const value = String(text || '')
  const q = String(needle || '').trim()
  if (!q) return value
  const lower = value.toLowerCase()
  const find = q.toLowerCase()
  const parts = []
  let from = 0
  let key = 0
  while (from < value.length) {
    const at = lower.indexOf(find, from)
    if (at < 0) {
      parts.push(value.slice(from))
      break
    }
    if (at > from) parts.push(value.slice(from, at))
    parts.push(<mark key={key}>{value.slice(at, at + q.length)}</mark>)
    key += 1
    from = at + q.length
  }
  return parts
}

function itemMatches(item, needle, ownerFilter) {
  if (ownerFilter) {
    const name = ownerFilter.toLowerCase()
    const hay = `${item.owner} ${item.who}`.toLowerCase()
    if (!hay.includes(name)) return false
  }
  if (!needle) return true
  return [item.what, item.who, item.owner, item.notes, item.thread]
    .join('\n')
    .toLowerCase()
    .includes(needle)
}

function ownersFrom(decisions) {
  const seen = []
  decisions.forEach((item) => {
    const name = String(item.owner || '').trim()
    if (!name) return
    if (seen.some((entry) => entry.toLowerCase() === name.toLowerCase())) return
    seen.push(name)
  })
  return seen
}

export function Log({ value, onChange, onResetSample }) {
  const passedBook = looksLikeBook(value)
  const book = normalizeBook(value)
  const [activeId, setActiveId] = useState(book.logs[0]?.id || '')
  const log = book.logs.find((item) => item.id === activeId) || book.logs[0]
  const [open, setOpen] = useState(null)
  const [undo, setUndo] = useState(null)
  const [query, setQuery] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('')
  const [pasting, setPasting] = useState(false)
  const [drafting, setDrafting] = useState(false)
  const [draftOwner, setDraftOwner] = useState('')
  const [draftWhat, setDraftWhat] = useState('')
  const [draftMiss, setDraftMiss] = useState('')
  const [pageTab, setPageTab] = useState('open')
  const [selectedId, setSelectedId] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [dating, setDating] = useState(false)
  const [titleDraft, setTitleDraft] = useState(log.title)
  const [dateDraft, setDateDraft] = useState(log.meetingOn)
  const [loadMiss, setLoadMiss] = useState('')
  const undoTimer = useRef(null)
  const fileRef = useRef(null)
  const searchRef = useRef(null)
  const draftWhatRef = useRef(null)
  const dragId = useRef('')
  const skipTitleBlur = useRef(false)

  useEffect(() => {
    if (!book.logs.some((item) => item.id === activeId)) {
      setActiveId(book.logs[0].id)
    }
  }, [book, activeId])

  useEffect(() => {
    if (!renaming) setTitleDraft(log.title)
  }, [log.title, renaming])

  useEffect(() => {
    if (!dating) setDateDraft(log.meetingOn)
  }, [log.meetingOn, dating])

  function emitBook(nextBook) {
    const normalized = normalizeBook(nextBook)
    if (passedBook || normalized.logs.length > 1) onChange(normalized)
    else onChange(normalized.logs[0])
  }

  function changeLog(nextLog) {
    emitBook({
      ...book,
      logs: book.logs.map((item) => (item.id === log.id ? nextLog : item)),
    })
  }

  function changeDecisions(decisions) {
    changeLog({ ...log, decisions })
  }

  const needle = query.trim().toLowerCase()
  const matched = log.decisions.filter((item) => itemMatches(item, needle, ownerFilter))
  const stillOpen = matched.filter((item) => item.stillOpen)
  const decided = matched.filter((item) => !item.stillOpen)
  const visible = pageTab === 'open' ? stillOpen : decided
  const owners = ownersFrom(log.decisions)
  const elsewhere = needle
    ? book.logs.filter(
        (meeting) =>
          meeting.id !== log.id &&
          meeting.decisions.some((item) => itemMatches(item, needle, '')),
      )
    : []

  function startDraft() {
    setUndo(null)
    setLoadMiss('')
    setPasting(false)
    setOpen(null)
    setPageTab('open')
    setDrafting(true)
    setDraftOwner('')
    setDraftWhat('')
    setDraftMiss('')
    setTimeout(() => draftWhatRef.current?.focus(), 0)
  }

  function cancelDraft() {
    setDrafting(false)
    setDraftOwner('')
    setDraftWhat('')
    setDraftMiss('')
  }

  function fileDraft() {
    if (!draftWhat.trim()) {
      setDraftMiss('Need the call.')
      return
    }
    const next = normalizeDecision({
      ...blankDecision(),
      what: draftWhat,
      owner: draftOwner,
      stillOpen: true,
      when: log.meetingOn || todayStamp(),
    })
    changeDecisions([...log.decisions, next])
    cancelDraft()
    setSelectedId(next.id)
  }

  function openOne(decision) {
    setLoadMiss('')
    setPasting(false)
    cancelDraft()
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
    changeDecisions(log.decisions.filter((item) => item.id !== id))
    setOpen(null)
    if (undoTimer.current) clearTimeout(undoTimer.current)
    setUndo({ decision, index, logId: log.id })
    undoTimer.current = setTimeout(() => setUndo(null), 12000)
  }

  function undoRemove() {
    if (!undo) return
    const target = book.logs.find((item) => item.id === undo.logId) || log
    const decisions = [...target.decisions]
    decisions.splice(Math.min(undo.index, decisions.length), 0, undo.decision)
    emitBook({
      ...book,
      logs: book.logs.map((item) =>
        item.id === target.id ? { ...item, decisions } : item,
      ),
    })
    if (undoTimer.current) clearTimeout(undoTimer.current)
    setUndo(null)
  }

  function closeDecision(id) {
    changeDecisions(
      log.decisions.map((item) =>
        item.id === id ? { ...item, stillOpen: false, closedOn: todayStamp() } : item,
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
    changeDecisions([...log.decisions, copy])
    setOpen({ mode: 'edit', decision: copy })
  }

  function keepLines(lines, extras) {
    const added = decisionsFromLines(lines, extras)
    changeDecisions([...log.decisions, ...added])
    setPasting(false)
  }

  function moveOpen(fromId, toId) {
    if (!fromId || !toId || fromId === toId) return
    const opens = log.decisions.filter((item) => item.stillOpen)
    const from = opens.findIndex((item) => item.id === fromId)
    const to = opens.findIndex((item) => item.id === toId)
    if (from < 0 || to < 0) return
    const nextOpen = [...opens]
    const [item] = nextOpen.splice(from, 1)
    nextOpen.splice(to, 0, item)
    let index = 0
    changeDecisions(
      log.decisions.map((entry) => (entry.stillOpen ? nextOpen[index++] : entry)),
    )
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
    if (!window.confirm('Clear this book?')) return
    const next = blankBook()
    setUndo(null)
    setQuery('')
    setOwnerFilter('')
    setLoadMiss('')
    setRenaming(false)
    setPasting(false)
    setOpen(null)
    cancelDraft()
    setActiveId(next.logs[0].id)
    emitBook(next)
  }

  function printOpen() {
    document.body.classList.add('dd-print-open')
    window.print()
    window.setTimeout(() => document.body.classList.remove('dd-print-open'), 400)
  }

  function onPickFile(event) {
    const file = event.target.files && event.target.files[0]
    event.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const next = parseIncoming(String(reader.result || ''))
        setUndo(null)
        setQuery('')
        setOwnerFilter('')
        setLoadMiss('')
        setRenaming(false)
        setPasting(false)
        setOpen(null)
        cancelDraft()
        setActiveId(next.logs[0].id)
        emitBook(next)
      } catch {
        setLoadMiss('That file is not a meeting book we can load.')
      }
    }
    reader.onerror = () => setLoadMiss('Could not read that file.')
    reader.readAsText(file)
  }

  function moveSel(step) {
    if (!visible.length) return
    const index = visible.findIndex((item) => item.id === selectedId)
    const next = visible[(index < 0 ? 0 : index + step + visible.length) % visible.length]
    setSelectedId(next.id)
  }

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') {
        if (drafting) {
          event.preventDefault()
          cancelDraft()
        }
        return
      }
      if (event.target.closest('input, textarea, select')) return
      if (open) return
      if (event.key === 'n') {
        event.preventDefault()
        startDraft()
      }
      if (event.key === '/') {
        event.preventDefault()
        searchRef.current?.focus()
      }
      if (event.key === 'j') {
        event.preventDefault()
        moveSel(1)
      }
      if (event.key === 'k') {
        event.preventDefault()
        moveSel(-1)
      }
      if (event.key === 'c' && pageTab === 'open' && selectedId) {
        event.preventDefault()
        closeDecision(selectedId)
      }
      if (event.key === 'Enter' && selectedId) {
        event.preventDefault()
        const hit = log.decisions.find((item) => item.id === selectedId)
        if (hit) openOne(hit)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const missFind = Boolean(needle || ownerFilter) && matched.length === 0
  const bookMenu = (
    <details className="dd-book-menu dd-noprint">
      <summary>Book</summary>
      <div className="dd-book-menu-panel">
        <button type="button" onClick={() => window.print()}>
          Print pad
        </button>
        <button type="button" onClick={printOpen}>
          Print open
        </button>
        <button type="button" onClick={() => downloadBook(book)}>
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
      <Book
        meetings={book.logs}
        activeId={log.id}
        onSelect={(id) => {
          setOpen(null)
          setActiveId(id)
        }}
        bookMenu={bookMenu}
      >
        <DecisionPage
          decision={open.decision}
          mode={open.mode}
          onSave={saveDecision}
          onCancel={() => setOpen(null)}
          onRemove={removeDecision}
          onDuplicate={
            open.mode === 'edit' ? () => duplicateDecision(open.decision) : undefined
          }
        />
      </Book>
    )
  }

  return (
    <Book meetings={book.logs} activeId={log.id} onSelect={setActiveId} bookMenu={bookMenu}>
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
        {owners.length ? (
          <div className="dd-owners">
            {owners.map((name) => (
              <button
                key={name}
                type="button"
                className={ownerFilter === name ? 'is-on' : ''}
                onClick={() => setOwnerFilter(ownerFilter === name ? '' : name)}
              >
                {name}
              </button>
            ))}
          </div>
        ) : null}
        <button type="button" className="dd-new" onClick={startDraft}>
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

      {draftMiss ? (
        <p className="dd-banner dd-miss dd-noprint" role="alert">
          {draftMiss}
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

      {elsewhere.length ? (
        <p className="dd-banner dd-jumps dd-noprint">
          Also in
          {elsewhere.map((meeting) => (
            <button
              key={meeting.id}
              type="button"
              className="dd-quiet"
              onClick={() => {
                setActiveId(meeting.id)
                setOwnerFilter('')
              }}
            >
              {meeting.title}
            </button>
          ))}
        </p>
      ) : null}

      {pasting ? <PasteBox onKeep={keepLines} onCancel={() => setPasting(false)} /> : null}

      {missFind ? (
        <p className="dd-empty-line">
          Nothing matches.
          <button
            type="button"
            className="dd-quiet"
            onClick={() => {
              setQuery('')
              setOwnerFilter('')
            }}
          >
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
            {stillOpen.length === 0 && !drafting ? (
              <p className="dd-quiet-line">Nothing open.</p>
            ) : (
              <ul className="dd-lines">
                {stillOpen.map((item) => (
                  <li
                    key={item.id}
                    draggable
                    onDragStart={() => {
                      dragId.current = item.id
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault()
                      moveOpen(dragId.current, item.id)
                      dragId.current = ''
                    }}
                  >
                    <button
                      type="button"
                      className={`dd-line${selectedId === item.id ? ' is-selected' : ''}${isOverdue(item.followUp) ? ' is-late' : ''}`}
                      onClick={() => {
                        setSelectedId(item.id)
                        openOne(item)
                      }}
                    >
                      <span className="dd-owner">
                        <Highlight text={item.owner || item.who || '—'} needle={needle} />
                      </span>
                      <span className="dd-what">
                        <Highlight text={item.what} needle={needle} />
                      </span>
                      <span className="dd-when">
                        {formatWhen(item.followUp || item.when) || '—'}
                      </span>
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
                {drafting ? (
                  <li className="dd-draft">
                    <input
                      className="dd-draft-owner"
                      value={draftOwner}
                      onChange={(event) => setDraftOwner(event.target.value)}
                      placeholder="Owner"
                      aria-label="Owner"
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          fileDraft()
                        }
                        if (event.key === 'Escape') {
                          event.preventDefault()
                          cancelDraft()
                        }
                      }}
                    />
                    <input
                      ref={draftWhatRef}
                      className="dd-draft-what"
                      value={draftWhat}
                      onChange={(event) => {
                        setDraftWhat(event.target.value)
                        setDraftMiss('')
                      }}
                      placeholder="The call"
                      aria-label="The call"
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          fileDraft()
                        }
                        if (event.key === 'Escape') {
                          event.preventDefault()
                          cancelDraft()
                        }
                      }}
                    />
                  </li>
                ) : null}
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
                    <button
                      type="button"
                      className={`dd-line${selectedId === item.id ? ' is-selected' : ''}`}
                      onClick={() => {
                        setSelectedId(item.id)
                        openOne(item)
                      }}
                    >
                      <span className="dd-when">
                        {formatWhen(item.closedOn || item.when) || '—'}
                      </span>
                      <span className="dd-what">
                        <Highlight text={item.what} needle={needle} />
                      </span>
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
