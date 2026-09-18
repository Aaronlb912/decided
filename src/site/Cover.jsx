export function Cover({ bookTitle, hasBook, hasDeskName, onOpen, onContinue }) {
  return (
    <div className="site">
      <div className="site-cover">
        <p className="site-mark">Meeting book</p>
        <h1>Decided</h1>
        <p className="site-lede">What we decided, and what is still open.</p>
        {hasBook && bookTitle ? (
          <p className="site-plate">{bookTitle} is on the desk.</p>
        ) : (
          <p className="site-plate">No book on the desk yet.</p>
        )}
        <div className="site-actions">
          {hasBook && hasDeskName ? (
            <button type="button" className="site-primary" onClick={onContinue}>
              Open it
            </button>
          ) : (
            <button type="button" className="site-primary" onClick={onOpen}>
              Open the book
            </button>
          )}
          {hasBook && hasDeskName ? (
            <button type="button" className="site-quiet" onClick={onOpen}>
              Open a different book
            </button>
          ) : null}
        </div>
        <p className="site-links">
          <a href="#/how">How this pad works</a>
          <a href="#/drop-in">Drop into a React app</a>
        </p>
      </div>
    </div>
  )
}
