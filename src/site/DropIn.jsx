export function DropIn() {
  return (
    <div className="site">
      <div className="site-matter">
        <p className="site-matter-back">
          <a href="#/">Front cover</a>
        </p>
        <h1>Copy into a React app</h1>
        <p className="site-matter-lede">
          You do not need this page to try the notebook. Skip it
          unless you already run React and want the pad inside
          that app.
        </p>
        <p>
          Copy <code>src/lib/</code> into the React app you
          already have. The cover pages stay in this repo. Details
          are in the README.
        </p>
        <p>Import the notebook and pass the book:</p>
        <pre>{`import { Log } from './lib/index.js'

<Log value={book} onChange={setBook} />`}</pre>
        <p>
          A whole notebook is <code>{'{ title, logs }'}</code>.
          One meeting is still <code>{'{ title, decisions }'}</code>.
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
