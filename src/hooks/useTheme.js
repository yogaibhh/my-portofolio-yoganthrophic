import { useCallback, useEffect, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'portfolio:theme'

/* One module-level store shared by every consumer, so the navbar toggle and
   the command palette never disagree about which theme is active. */
const listeners = new Set()

/* The initial attribute is stamped by the inline boot script in index.html
   before first paint, so there's no flash of the wrong palette. */
let current =
  (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) || 'light'

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return current
}

function apply(theme, { persist = true } = {}) {
  if (theme !== 'light' && theme !== 'dark') return
  current = theme
  document.documentElement.setAttribute('data-theme', theme)
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* private mode / blocked storage — the choice just won't persist */
    }
  }
  listeners.forEach((l) => l())
}

export default function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => 'light')

  /* Follow the OS only while the visitor hasn't picked a theme themselves */
  useEffect(() => {
    let stored = null
    try {
      stored = localStorage.getItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    if (stored) return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e) => apply(e.matches ? 'dark' : 'light', { persist: false })
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback((next) => apply(next), [])
  const toggle = useCallback(() => apply(current === 'dark' ? 'light' : 'dark'), [])

  return { theme, setTheme, toggle }
}
