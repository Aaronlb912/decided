# Decided

A meeting notebook. After a huddle or a long email, write leftover
jobs on the left (still open, with a name) and finished calls on
the right (already decided). Paste an email if you do not want to
type.

## Who it is for

A shop or crew that already runs React and keeps losing what was
decided in a long email. They finish "this is still open, this we
already decided."

## Run the demo

```
npm install
npm start
```

Open http://127.0.0.1:48531/

The demo starts on a closed cover. Write your name (it stays in
this browser, not an account), then open the Oak & Vine florist
sample or a blank notebook. How to use it is linked from the
cover.

## Copy `src/lib/`

You only need this if you already have a React app. Copy that
folder into it. Import `Log` and pass `value` / `onChange`. A
whole notebook is `{ title, logs }`. One meeting is still
`{ title, decisions }`. The cover pages are demo-only. They are
not in `src/lib/`.
