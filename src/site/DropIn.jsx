export function DropIn() {
  return (
    <div className="site">
      <div className="site-matter">
        <p className="site-matter-back">
          <a href="#/">Back to the closed book</a>
        </p>
        <h1>Copy into a React app</h1>
        <p>
          You can skip this page if you just want to try the
          notebook in the browser. This page is only for a shop
          that already runs React and wants the notebook inside
          that app.
        </p>
        <p>
          Copy the <code>src/lib/</code> folder into the app you
          already have. The cover pages stay here in this repo.
          The README has the same notes.
        </p>
        <p>Then import the notebook and pass it in:</p>
        <pre>{`import { Log } from './lib/index.js'

<Log value={book} onChange={setBook} />`}</pre>
        <p>
          A whole notebook looks like <code>{'{ title, logs }'}</code>.
          One meeting still looks like <code>{'{ title, decisions }'}</code>.
          Old files load either way.
        </p>
        <p className="site-matter-links">
          <a href="#/how">How to use it</a>
          <a href="#/open">Open a notebook</a>
        </p>
      </div>
    </div>
  )
}
