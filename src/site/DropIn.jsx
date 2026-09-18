export function DropIn() {
  return (
    <div className="site">
      <div className="site-matter">
        <p className="site-matter-back">
          <a href="#/">Cover</a>
        </p>
        <h1>Drop into a React app</h1>
        <p className="site-matter-lede">
          Copy <code>src/lib/</code> into a React app you already
          have. The demo around it stays in this repo. Details are
          in the README.
        </p>
        <p>Import the pad and pass the book:</p>
        <pre>{`import { Log } from './lib/index.js'

<Log value={book} onChange={setBook} />`}</pre>
        <p>
          A whole book is <code>{'{ title, logs }'}</code>. One
          meeting is still <code>{'{ title, decisions }'}</code>.
          Old JSON loads either way.
        </p>
        <p className="site-matter-links">
          <a href="#/how">How this pad works</a>
          <a href="#/open">Open the book</a>
        </p>
      </div>
    </div>
  )
}
