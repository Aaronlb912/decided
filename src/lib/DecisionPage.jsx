import { useEffect, useState } from 'react'
import { normalizeDecision } from './decided-json.js'

export function DecisionPage({ decision, mode, onSave, onCancel, onRemove }) {
  const isNew = mode === 'new'
  const [what, setWhat] = useState(decision.what || '')
  const [when, setWhen] = useState(decision.when || '')
  const [who, setWho] = useState(decision.who || '')
  const [stillOpen, setStillOpen] = useState(Boolean(decision.stillOpen))
  const [owner, setOwner] = useState(decision.owner || '')
  const [notes, setNotes] = useState(decision.notes || '')
  const [miss, setMiss] = useState('')

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  function built() {
    if (!what.trim()) {
      setMiss('Need what we decided.')
      return null
    }
    setMiss('')
    return normalizeDecision({
      ...decision,
      what,
      when,
      who,
      stillOpen,
      owner,
      notes,
    })
  }

  function save(event) {
    event.preventDefault()
    const next = built()
    if (!next) return
    onSave(next)
  }

  return (
    <div className="dd dd-page">
      <p className="dd-kicker">{isNew ? 'Add a decision' : 'Open decision'}</p>
      <h1>{isNew ? 'New decision' : decision.what || 'Decision'}</h1>
      <p className="dd-hint">
        {isNew
          ? 'What we called, when, who was in the room. Escape goes back without saving.'
          : 'Change the call, then save. Escape goes back without saving.'}
      </p>

      {miss ? (
        <p className="dd-miss" role="alert">
          {miss}
        </p>
      ) : null}

      <form className="dd-form" onSubmit={save}>
        <label className="dd-field">
          What we decided
          <input
            value={what}
            onChange={(event) => setWhat(event.target.value)}
            autoFocus
          />
        </label>
        <label className="dd-field">
          When
          <input
            type="date"
            value={when}
            onChange={(event) => setWhen(event.target.value)}
          />
        </label>
        <label className="dd-field">
          Who
          <input
            value={who}
            onChange={(event) => setWho(event.target.value)}
            placeholder="Who made the call"
          />
        </label>
        <label className="dd-field dd-check">
          <input
            type="checkbox"
            checked={stillOpen}
            onChange={(event) => setStillOpen(event.target.checked)}
          />
          Still open
        </label>
        <label className="dd-field">
          Owner
          <input
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
            placeholder="Who still owns it if this is open"
          />
        </label>
        <label className="dd-field">
          Notes
          <textarea
            rows={5}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
        <div className="dd-form-actions">
          <button type="submit">Save</button>
          <button type="button" className="dd-secondary" onClick={onCancel}>
            Cancel
          </button>
          {!isNew ? (
            <button type="button" className="dd-quiet" onClick={() => onRemove(decision.id)}>
              Remove
            </button>
          ) : null}
        </div>
      </form>
    </div>
  )
}
