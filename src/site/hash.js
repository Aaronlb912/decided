export function pageFromHash() {
  const raw = String(window.location.hash || '#/').replace(/^#/, '')
  const path = raw.split('?')[0] || '/'
  if (path === '/open' || path.startsWith('/open/')) return 'open'
  if (path === '/how' || path.startsWith('/how/')) return 'how'
  if (path === '/drop-in' || path.startsWith('/drop-in/')) return 'drop-in'
  if (path === '/pad' || path.startsWith('/pad/')) return 'pad'
  return 'cover'
}

export function go(page) {
  const hash = page === 'cover' ? '#/' : `#/${page}`
  if (window.location.hash !== hash) {
    window.location.hash = hash
  }
}

export function pageTitle(page, bookTitle) {
  if (page === 'open') return 'Open a notebook · Decided'
  if (page === 'how') return 'How to use it · Decided'
  if (page === 'drop-in') return 'Copy into a React app · Decided'
  if (page === 'pad') return bookTitle ? `${bookTitle} · Decided` : 'Decided'
  return 'Decided'
}
