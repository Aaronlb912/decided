import { useState } from 'react'
import { Log, normalizeBook, sampleBook } from './lib/index.js'

const STORAGE_KEY = 'decided-book'
const OLD_KEY = 'decided-log'

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return normalizeBook(JSON.parse(raw))
    const old = localStorage.getItem(OLD_KEY)
    if (old) return normalizeBook(JSON.parse(old))
    return normalizeBook(sampleBook)
  } catch {
    return normalizeBook(sampleBook)
  }
}

function writeStored(book) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(book))
  } catch {
    // Demo still runs if storage is blocked.
  }
}

export default function App() {
  const [book, setBook] = useState(readStored)

  function change(next) {
    const normalized = normalizeBook(next)
    setBook(normalized)
    writeStored(normalized)
  }

  function resetSample() {
    if (!window.confirm('Replace stored meetings with the sample book?')) {
      return
    }
    change(normalizeBook(sampleBook))
  }

  return <Log value={book} onChange={change} onResetSample={resetSample} />
}
