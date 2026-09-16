import { useEffect, useRef } from 'react'

/* Reveal an element the moment any part of it crosses into the viewport.
   threshold stays 0 on purpose: a ratio-based trigger (e.g. 0.15) never fires
   for wrappers taller than ~6x the viewport, which silently hid whole
   sections. The negative bottom margin delays the trigger just enough that
   the animation reads as a reveal rather than firing off-screen. */
export default function useReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible')
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          io.disconnect()
        }
      },
      { threshold: 0, rootMargin: '0px 0px -10% 0px' }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return ref
}
