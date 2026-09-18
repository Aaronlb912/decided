export function Book({ title, bookMenu, children }) {
  return (
    <div className="dd-app">
      <nav className="dd-spine" aria-label="Meeting book">
        <p className="dd-spine-mark">Meeting book</p>
        <ol className="dd-spine-meetings">
          <li>
            <button type="button" className="is-on" aria-current="page">
              {title}
            </button>
          </li>
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
