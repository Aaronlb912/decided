export function Book({ meetings, activeId, onSelect, bookMenu, children }) {
  const list = Array.isArray(meetings) && meetings.length ? meetings : []
  return (
    <div className="dd-app">
      <nav className="dd-spine" aria-label="Meeting book">
        <p className="dd-spine-mark">Meeting book</p>
        <ol className="dd-spine-meetings">
          {list.map((meeting) => (
            <li key={meeting.id}>
              <button
                type="button"
                className={meeting.id === activeId ? 'is-on' : ''}
                aria-current={meeting.id === activeId ? 'page' : undefined}
                onClick={() => onSelect && onSelect(meeting.id)}
              >
                {meeting.title}
              </button>
            </li>
          ))}
        </ol>
        {bookMenu}
      </nav>
      <div className="dd-stage">
        <div className="dd-pad">
          <div className="dd-tape" aria-hidden="true" />
          {children}
        </div>
      </div>
    </div>
  )
}
