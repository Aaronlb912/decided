export function Cover({ bookTitle, hasBook, hasDeskName, onOpen, onContinue }) {
  const ready = hasBook && hasDeskName
  return (
    <div className="site">
      <div className="site-cover">
        <p className="site-mark">Meeting notebook</p>
        <h1>Decided</h1>
        <p className="site-lede">This is a meeting notebook.</p>
        <p className="site-lede">
          Still open on the left, with a name. Already decided on
          the right.
        </p>
        {hasBook && bookTitle ? (
          <p className="site-plate">{bookTitle} is in this browser.</p>
        ) : (
          <p className="site-plate">No notebook in this browser yet.</p>
        )}
        <div className="site-actions">
          {ready ? (
            <button type="button" className="site-primary" onClick={onContinue}>
              Open {bookTitle || 'this notebook'}
            </button>
          ) : (
            <button type="button" className="site-primary" onClick={onOpen}>
              Open a notebook
            </button>
          )}
          {ready ? (
            <button type="button" className="site-quiet" onClick={onOpen}>
              Start a different notebook
            </button>
          ) : null}
        </div>
        <p className="site-links">
          <a href="#/how">How to use it</a>
          <a href="#/drop-in">Copy into a React app you already run</a>
        </p>
      </div>
    </div>
  )
}
