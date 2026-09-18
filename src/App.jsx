import { useState } from 'react'
import { Log, normalizeLog, sampleLog } from './lib/index.js'

const STORAGE_KEY = 'decided-log'

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return normalizeLog(JSON.parse(raw))
    return normalizeLog(sampleLog)
  } catch {
    return normalizeLog(sampleLog)
  }
}

function writeStored(log) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
  } catch {
    // Demo still runs if storage is blocked.
  }
}

export default function App() {
  const [log, setLog] = useState(readStored)

  function change(next) {
    const normalized = normalizeLog(next)
    setLog(normalized)
    writeStored(normalized)
  }

  function resetSample() {
    if (!window.confirm('Replace stored decisions with the Oak & Vine sample?')) {
      return
    }
    change(normalizeLog(sampleLog))
  }

  return <Log value={log} onChange={change} onResetSample={resetSample} />
}
