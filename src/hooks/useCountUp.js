import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* Count from 0 to `target` once the element scrolls into view.
   Returns [ref, value] — attach the ref to whatever wraps the number. */
export default function useCountUp(target, duration = 1400) {
  const ref = useRef(null)
  /* Skip the animation entirely — and start on the final number — when motion
     is unwelcome or unobservable. */
  const [still] = useState(
    () => prefersReducedMotion() || typeof IntersectionObserver === 'undefined'
  )
  const [value, setValue] = useState(() => (still ? target : 0))

  useEffect(() => {
    const el = ref.current
    if (!el || still) return

    let frame = 0
    let start = 0

    const tick = (now) => {
      if (!start) start = now
      const t = Math.min((now - start) / duration, 1)
      // easeOutExpo — fast out of the gate, settles gently on the final number
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setValue(Math.round(target * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          frame = requestAnimationFrame(tick)
          io.disconnect()
        }
      },
      { threshold: 0.4 }
    )

    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [target, duration, still])

  return [ref, value]
}
