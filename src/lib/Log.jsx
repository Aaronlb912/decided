import { useRef, useState } from 'react'
import { DecisionPage } from './DecisionPage.jsx'
import { PasteBox } from './PasteBox.jsx'
import {
  blankDecision,
  decisionsFromLines,
  downloadLog,
  normalizeLog,
} from './decided-json.js'
import './decided.css'

export function Log({ value, onChange, onResetSample }) {
  const log = normalizeLog(value)
  const [open, setOpen] = useState(null)
  const [undo, setUndo] = useState(null)
  const undoTimer = useRef(null)

  function changeDecisions(decisions) {
    onChange({ ...log, decisions })
  }

  function addNew() {
    setUndo(null)
    setOpen({ mode: 'new', decision: blankDecision() })
  }

  function openOne(decision) {
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

  function keepLines(lines) {
    const added = decisionsFromLines(lines)
    changeDecisions([...log.decisions, ...added])
  }

  if (open) {
    return (
      <DecisionPage
        decision={open.decision}
        mode={open.mode}
        onSave={saveDecision}
        onCancel={() => setOpen(null)}
        onRemove={removeDecision}
      />
    )
  }

  const decided = log.decisions.filter((item) => !item.stillOpen)
  const stillOpen = log.decisions.filter((item) => item.stillOpen)

  return (
    <div className="dd">
      <header className="dd-top">
        <p className="dd-kicker">Decided</p>
        <h1>{log.title}</h1>
        <p className="dd-note">
          {log.note || 'What we decided, and what is still open.'} Add by
          hand, or paste a dump. Work stays in this browser.
        </p>
        <div className="dd-actions">
          <button type="button" onClick={addNew}>
            Add a decision
          </button>
          <button
            type="button"
            className="dd-secondary"
            onClick={() => downloadLog(log)}
          >
            Download JSON
          </button>
          {onResetSample ? (
            <button type="button" className="dd-secondary" onClick={onResetSample}>
              Reset sample
            </button>
          ) : null}
        </div>
      </header>

      {undo ? (
        <p className="dd-undo">
          Removed.{' '}
          <button type="button" className="dd-quiet" onClick={undoRemove}>
            Undo
          </button>
        </p>
      ) : null}

      <section className="dd-section">
        <h2>Decided</h2>
        {decided.length === 0 ? (
          <p className="dd-empty">No calls yet. Add one, or paste a dump below.</p>
        ) : (
          <ul className="dd-list">
            {decided.map((item) => (
              <DecisionRow
                key={item.id}
                item={item}
                onOpen={() => openOne(item)}
                onRemove={() => removeDecision(item.id)}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="dd-section">
        <h2>Still open</h2>
        {stillOpen.length === 0 ? (
          <p className="dd-empty">Nothing still open.</p>
        ) : (
          <ul className="dd-list">
            {stillOpen.map((item) => (
              <DecisionRow
                key={item.id}
                item={item}
                onOpen={() => openOne(item)}
                onRemove={() => removeDecision(item.id)}
              />
            ))}
          </ul>
        )}
      </section>

      <PasteBox onKeep={keepLines} />
    </div>
  )
}

function DecisionRow({ item, onOpen, onRemove }) {
  return (
    <li className={item.stillOpen ? 'dd-card dd-card-open' : 'dd-card'}>
      <div>
        <h3>{item.what}</h3>
        <p className="dd-meta">
          {item.when ? item.when : 'No date'}
          {item.who ? ` · ${item.who}` : ''}
          {item.stillOpen && item.owner ? (
            <span className="dd-owner">{` · Owner ${item.owner}`}</span>
          ) : null}
        </p>
      </div>
      <div className="dd-row-actions">
        <button type="button" className="dd-quiet" onClick={onOpen}>
          Open
        </button>
        <button type="button" className="dd-quiet" onClick={onRemove}>
          Remove
        </button>
      </div>
    </li>
  )
}
