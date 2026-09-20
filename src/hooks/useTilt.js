import { useCallback, useRef } from 'react'

/* Pointer-tracked tilt for a card.

   Returns props to spread onto the element. The handlers only write CSS
   custom properties, so the transform itself stays in the stylesheet, where
   prefers-reduced-motion can switch it off without the JS knowing.

   Coarse pointers are skipped: on a touch screen the "hover" fires on tap and
   leaves the card stuck at an angle. */
export default function useTilt({ max = 5, lift = -4 } = {}) {
  const frame = useRef(0)

  const onPointerMove = useCallback(
    (e) => {
      if (e.pointerType !== 'mouse') return
      const el = e.currentTarget
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5

      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        el.style.setProperty('--tilt-y', `${px * max * 2}deg`)
        el.style.setProperty('--tilt-x', `${-py * max * 2}deg`)
        el.style.setProperty('--tilt-lift', `${lift}px`)
        el.dataset.tilting = 'true'
      })
    },
    [max, lift],
  )

  const onPointerLeave = useCallback((e) => {
    const el = e.currentTarget
    cancelAnimationFrame(frame.current)
    el.dataset.tilting = 'false'
    el.style.setProperty('--tilt-x', '0deg')
    el.style.setProperty('--tilt-y', '0deg')
    el.style.setProperty('--tilt-lift', '0px')
  }, [])

  return { onPointerMove, onPointerLeave, className: 'tilt' }
}
