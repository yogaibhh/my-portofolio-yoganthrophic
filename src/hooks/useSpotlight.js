import { useCallback } from 'react'

/* Feeds the pointer position into --mx / --my so the `.spotlight` CSS rule can
   draw a sheen that follows the cursor. Spread the result onto any element
   that also carries the `spotlight` class. */
export default function useSpotlight() {
  const onPointerMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }, [])

  return { onPointerMove }
}
