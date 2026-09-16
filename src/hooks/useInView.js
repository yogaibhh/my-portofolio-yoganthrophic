import { useEffect, useRef, useState } from 'react'

/* Returns [ref, inView] and latches to true the first time the element
   appears — used for one-shot entrance effects (progress bars, heavy demos). */
export default function useInView({ rootMargin = '0px', threshold = 0 } = {}) {
  const ref = useRef(null)
  /* No IntersectionObserver (very old browsers, some test envs) means we can't
     detect entry at all — show the content straight away instead. */
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin, threshold }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [inView, rootMargin, threshold])

  return [ref, inView]
}
