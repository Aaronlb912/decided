export function downloadLog(log, filename) {
  const name = filename || fileNameFor(log)
  const blob = new Blob([JSON.stringify(log, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

function fileNameFor(log) {
  const slug = String(log?.title || 'decided')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${slug || 'decided'}.json`
}

function newId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}`
}

export function newDecisionId() {
  return newId('d')
}

export function newLogId() {
  return newId('log')
}

export function blankDecision() {
  return {
    id: newDecisionId(),
    what: '',
    when: todayStamp(),
    who: '',
    stillOpen: false,
    owner: '',
    notes: '',
    thread: '',
    followUp: '',
    closedOn: '',
  }
}

export function blankLog() {
  return {
    id: newLogId(),
    title: 'Decisions',
    note: '',
    meetingOn: '',
    decisions: [],
  }
}

function todayStamp() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function formatWhen(value) {
  const raw = String(value || '').trim()
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return raw
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatHeadingDate(value) {
  const raw = String(value || '').trim()
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return raw
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function asText(value) {
  return typeof value === 'string' ? value : ''
}

export function normalizeDecision(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return blankDecision()
  }
  const what = asText(raw.what) || asText(raw.title)
  const owner = asText(raw.owner) || asText(raw.ownedBy)
  const stillOpen = Boolean(raw.stillOpen ?? raw.open ?? raw.still_open)
  const thread = asText(raw.thread) || asText(raw.source)
  return {
    id: asText(raw.id) || newDecisionId(),
    what: what.trim(),
    when: asText(raw.when).trim(),
    who: asText(raw.who).trim(),
    stillOpen,
    owner: owner.trim(),
    notes: asText(raw.notes).trim(),
    thread: thread.trim(),
    followUp: asText(raw.followUp).trim(),
    closedOn: asText(raw.closedOn).trim(),
  }
}

export function normalizeLog(raw) {
  if (Array.isArray(raw)) {
    return {
      id: newLogId(),
      title: 'Decisions',
      note: '',
      meetingOn: '',
      decisions: raw.map((item) => normalizeDecision(item)),
    }
  }
  if (!raw || typeof raw !== 'object') {
    return blankLog()
  }
  const decisions = Array.isArray(raw.decisions) ? raw.decisions : []
  return {
    id: asText(raw.id) || newLogId(),
    title: asText(raw.title).trim() || 'Decisions',
    note: asText(raw.note).trim(),
    meetingOn: asText(raw.meetingOn).trim(),
    decisions: decisions
      .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
      .map((item) => normalizeDecision(item)),
  }
}

function uniqueLines(lines) {
  const seen = new Set()
  const out = []
  lines.forEach((line) => {
    const key = line.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    out.push(line)
  })
  return out
}

export function splitPaste(text) {
  const raw = String(text || '').replace(/\r\n/g, '\n').trim()
  if (!raw) return []

  const blocks = raw
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
  if (blocks.length > 1) return uniqueLines(blocks)

  const sentences = raw
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 1)
  if (sentences.length > 1) return uniqueLines(sentences)

  return uniqueLines(
    raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
  )
}

export function looksStillOpen(text) {
  const line = String(text || '').trim()
  if (!line) return false
  if (line.includes('?')) return true
  return /^(still|open|need|who|when)\b/i.test(line)
}

export function parseLogJson(text) {
  const parsed = JSON.parse(String(text || ''))
  return normalizeLog(parsed)
}

export function decisionsFromLines(lines, extras) {
  const thread = asText(extras?.thread)
  return lines
    .map((line) => String(line || '').trim())
    .filter(Boolean)
    .map((what) =>
      normalizeDecision({
        ...blankDecision(),
        what,
        stillOpen: looksStillOpen(what),
        thread,
      }),
    )
}
