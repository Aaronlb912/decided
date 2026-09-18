import { useEffect, useState } from 'react'
import { formatHeadingDate, normalizeDecision } from './decided-json.js'

export function DecisionPage({
  decision,
  mode,
  onSave,
  onCancel,
  onRemove,
  onDuplicate,
}) {
  const isNew = mode === 'new'
  const [what, setWhat] = useState(decision.what || '')
  const [when, setWhen] = useState(decision.when || '')
  const [who, setWho] = useState(decision.who || '')
  const [stillOpen, setStillOpen] = useState(Boolean(decision.stillOpen))
  const [owner, setOwner] = useState(decision.owner || '')
  const [notes, setNotes] = useState(decision.notes || '')
  const [thread, setThread] = useState(decision.thread || '')
  const [followUp, setFollowUp] = useState(decision.followUp || '')
  const [miss, setMiss] = useState('')

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  function save(event) {
    event.preventDefault()
    if (!what.trim()) {
      setMiss('Write the leftover job or the decision first.')
      return
    }
    setMiss('')
    onSave(
      normalizeDecision({
        ...decision,
        what,
        when,
        who,
        stillOpen,
        owner,
        notes,
        thread,
        followUp,
      }),
    )
  }

  return (
    <div className="dd-call">
      <button type="button" className="dd-quiet dd-back dd-noprint" onClick={onCancel}>
        Back to the pages
      </button>
      <header className="dd-heading">
        <h1>{isNew ? 'New line' : what.trim() || 'This line'}</h1>
        <p className="dd-heading-date">{formatHeadingDate(when) || 'No date'}</p>
        <p className="dd-spread-hint dd-noprint">
          This line is the leftover job or the decision. Who was
          in the room. Owner still has this.
        </p>
      </header>

      {miss ? (
        <p className="dd-banner dd-miss" role="alert">
          {miss}
        </p>
      ) : null}

      <form onSubmit={save}>
        <label className={`dd-field${miss ? ' dd-field-miss' : ''}`}>
          Line
          <textarea
            rows={3}
            value={what}
            onChange={(event) => setWhat(event.target.value)}
            autoFocus
          />
        </label>
        <label className="dd-field">
          Date
          <input
            type="date"
            value={when}
            onChange={(event) => setWhen(event.target.value)}
          />
        </label>
        <label className="dd-field">
          Who
          <input value={who} onChange={(event) => setWho(event.target.value)} />
        </label>
        <label className="dd-field dd-check">
          Still open
          <span>
            <input
              type="checkbox"
              checked={stillOpen}
              onChange={(event) => setStillOpen(event.target.checked)}
            />
          </span>
        </label>
        {stillOpen ? (
          <label className="dd-field">
            Owner
            <input value={owner} onChange={(event) => setOwner(event.target.value)} />
          </label>
        ) : null}
        {stillOpen ? (
          <label className="dd-field">
            Follow up
            <input
              type="date"
              value={followUp}
              onChange={(event) => setFollowUp(event.target.value)}
            />
          </label>
        ) : null}
        <label className="dd-field">
          Huddle
          <input value={thread} onChange={(event) => setThread(event.target.value)} />
        </label>
        <label className="dd-field">
          Notes
          <textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>
        <div className="dd-call-actions">
          <button type="submit">Save</button>
          <button type="button" className="dd-cancel" onClick={onCancel}>
            Cancel
          </button>
          {onDuplicate ? (
            <button type="button" className="dd-quiet" onClick={onDuplicate}>
              Duplicate
            </button>
          ) : null}
          {!isNew && onRemove ? (
            <button type="button" className="dd-quiet" onClick={() => onRemove(decision.id)}>
              Remove
            </button>
          ) : null}
        </div>
      </form>
    </div>
  )
}
