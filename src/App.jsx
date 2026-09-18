import { useEffect, useState } from 'react'
import { Log, blankBook, normalizeBook, parseIncoming, sampleBook } from './lib/index.js'
import { Cover } from './site/Cover.jsx'
import { DropIn } from './site/DropIn.jsx'
import { How } from './site/How.jsx'
import { OpenBook } from './site/OpenBook.jsx'
import { go, pageTitle } from './site/hash.js'
import { useHashPage } from './site/useHashPage.js'
import './site/site.css'

const BOOK_KEY = 'decided-book'
const OLD_KEY = 'decided-log'
const DESK_KEY = 'decided-desk'

function readBook() {
  try {
    const raw = localStorage.getItem(BOOK_KEY)
    if (raw) return normalizeBook(JSON.parse(raw))
    const old = localStorage.getItem(OLD_KEY)
    if (old) return normalizeBook(JSON.parse(old))
  } catch {
    return null
  }
  return null
}

function readDesk() {
  try {
    return String(localStorage.getItem(DESK_KEY) || '')
  } catch {
    return ''
  }
}

function writeBook(book) {
  try {
    localStorage.setItem(BOOK_KEY, JSON.stringify(book))
  } catch {
    // Demo still runs if storage is blocked.
  }
}

function writeDesk(name) {
  try {
    localStorage.setItem(DESK_KEY, name)
  } catch {
    // Demo still runs if storage is blocked.
  }
}

export default function App() {
  const page = useHashPage()
  const [book, setBook] = useState(readBook)
  const [deskName, setDeskName] = useState(readDesk)
  const hasBook = Boolean(book)
  const hasDeskName = Boolean(String(deskName).trim())
  const bookTitle = book?.logs?.[0]?.title || book?.title || ''

  useEffect(() => {
    document.title = pageTitle(page, bookTitle)
  }, [page, bookTitle])

  useEffect(() => {
    if (page === 'pad' && !book) go('open')
  }, [page, book])

  function changeBook(next) {
    const normalized = normalizeBook(next)
    setBook(normalized)
    writeBook(normalized)
  }

  function setName(next) {
    setDeskName(next)
    writeDesk(next)
  }

  function openPad(nextBook) {
    if (nextBook) changeBook(nextBook)
    go('pad')
  }

  function loadJson(text) {
    try {
      const next = parseIncoming(text)
      openPad(next)
      return true
    } catch {
      return 'That file is not a notebook we can open. Use a file you saved from here.'
    }
  }

  function resetSample() {
    if (!window.confirm('Replace this notebook with the Oak & Vine florist sample?')) {
      return
    }
    changeBook(sampleBook)
  }

  if (page === 'how') return <How />
  if (page === 'drop-in') return <DropIn />
  if (page === 'open') {
    return (
      <OpenBook
        deskName={deskName}
        onDeskName={setName}
        hasBook={hasBook}
        bookTitle={bookTitle}
        onContinue={() => go('pad')}
        onSample={() => openPad(sampleBook)}
        onBlank={() => openPad(blankBook())}
        onLoad={loadJson}
      />
    )
  }
  if (page === 'pad') {
    if (!book) return null
    return (
      <Log
        value={book}
        onChange={changeBook}
        onResetSample={resetSample}
        onCover={() => go('cover')}
        deskName={String(deskName).trim()}
      />
    )
  }

  return (
    <Cover
      bookTitle={bookTitle}
      hasBook={hasBook}
      hasDeskName={hasDeskName}
      onOpen={() => go('open')}
      onContinue={() => go('pad')}
    />
  )
}
