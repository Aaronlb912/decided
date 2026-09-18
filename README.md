# Decided

Decided is a notebook for what happened in a meeting.

A lot of meetings end with a long email or a pile of notes, and by
next week nobody is sure what was actually agreed and what is
still hanging. This tool is for writing that down in one place.

You keep two kinds of lines. The left page is still open: a
leftover job or an unanswered question, with the name of the
person who still has it. The right page is decided: a call the
group already made, so you do not have to argue it again.

You can type a new line yourself, or paste a dump from an email
and keep the lines that matter.

## Who it is for

A shop or crew that already runs React and keeps losing what was
agreed in a long email. They want one place that says what is
still open and what they already decided.

## Run the demo

```
npm install
npm start
```

Open http://127.0.0.1:48531/

The demo starts on a closed cover. Write your name so it shows on
the spine. It stays in this browser, and it is not an account.
Then open the Oak & Vine florist sample, or start a blank
notebook. How to use it is linked from the cover.

## Copy `src/lib/`

You can skip this if you just want to try the notebook in the
browser. If you already have a React app, copy that folder into
it. Import `Log` and pass `value` / `onChange`. A whole notebook
is `{ title, logs }`. One meeting is still `{ title, decisions }`.
The cover pages are demo-only. They are not in `src/lib/`.
