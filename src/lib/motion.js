export function motionOff() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

export function afterMotion(fn, ms) {
  if (motionOff()) {
    fn()
    return
  }
  window.setTimeout(fn, ms)
}
