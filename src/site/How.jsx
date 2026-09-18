export function How() {
  return (
    <div className="site">
      <div className="site-matter">
        <p className="site-matter-back">
          <a href="#/">Back to the closed book</a>
        </p>
        <h1>How to use it</h1>
        <p>
          Decided is a notebook for what happened in a meeting.
        </p>
        <p>
          A lot of meetings end with a long email or a pile of
          notes, and by next week nobody is sure what was actually
          agreed and what is still hanging. This tool is for
          writing that down in one place.
        </p>
        <p>
          You keep two kinds of lines. The left page is still
          open: a leftover job or an unanswered question, with the
          name of the person who still has it. The right page is
          decided: a call the group already made, so you do not
          have to argue it again.
        </p>
        <p>
          You can type a new line yourself, or paste a dump from
          an email and keep the lines that matter. If several
          meetings belong together, they sit as tabs on the cloth
          spine, like pages in the same book.
        </p>
        <p>
          There is no account. The demo in this browser is a fake
          florist shop, Oak & Vine, so you can see how it works.
          If you already have a React app, you can copy the
          notebook into that app and keep your own meetings there.
        </p>
        <p>
          On the florist sample, Lena Ortiz still has the Tuesday
          hospital van. Saturday hours stay 9 to 4 is already
          decided.
        </p>
        <p>
          If you press Close on a leftover job, it moves to the
          right page. Reopen brings it back if you were wrong.
        </p>
        <p>
          To add a line, type a name and the leftover job on the
          next blank line, then press Enter. Click a line if you
          need dates and notes.
        </p>
        <p>
          The cloth strip on the left is other meetings in the
          same notebook. Click Saturday counter if you want to
          switch.
        </p>
        <p>
          You can paste a long email and keep the lines that
          matter. If a line starts with <code>Sam:</code>, Sam is
          the owner.
        </p>
        <p>
          Files on the spine let you print these pages, or save
          and load a notebook file.
        </p>
        <p>
          You do not need the keys, but they are there. n starts a
          new line, / finds, j and k move, c closes, Enter opens a
          line, and Escape backs out.
        </p>
        <p className="site-matter-links">
          <a href="#/open">Open a notebook</a>
        </p>
      </div>
    </div>
  )
}
