export function Cover({ bookTitle, hasBook, hasDeskName, onOpen, onContinue }) {
  const ready = hasBook && hasDeskName
  return (
    <div className="site">
      <div className="site-cover">
        <p className="site-mark">Meeting notebook</p>
        <h1>Decided</h1>
        <p className="site-lede">
          Decided is a notebook for what happened in a meeting.
          After the notes pile up, you write what is still hanging
          on the left and what the group already agreed on the
          right. There is no account.
        </p>
        {hasBook && bookTitle ? (
          <p className="site-plate">
            {bookTitle} is already open in this browser.
          </p>
        ) : (
          <p className="site-plate">
            You do not have a notebook in this browser yet.
          </p>
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
          <a href="#/drop-in">Copy this into a React app you already have, if you need that</a>
        </p>
      </div>
    </div>
  )
}
