# Decided

What we decided, and what is still open. Paste a long email or a
meeting dump. Keep the call, the open question, and who owns it.

## Who it is for

A shop or crew that already runs React and keeps losing the call
from a long email. They finish "we decided this, this is still
open."

## Run the demo

```
npm install
npm start
```

Open http://127.0.0.1:48531/

The demo starts on a cover. Open the book with a name at the
desk, then the Oak & Vine sample or a blank pad. How this pad
works and drop-in notes are linked from the cover.

## Copy `src/lib/`

Copy that folder into a React app you already have. Import
`Log` and pass `value` / `onChange`. A whole book is
`{ title, logs }`. One meeting is still `{ title, decisions }`.
The cover pages are demo-only. They are not in `src/lib/`.
