import { useEffect, useState } from 'react'
import { pageFromHash } from './hash.js'

export function useHashPage() {
  const [page, setPage] = useState(pageFromHash)

  useEffect(() => {
    function onHash() {
      setPage(pageFromHash())
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return page
}
