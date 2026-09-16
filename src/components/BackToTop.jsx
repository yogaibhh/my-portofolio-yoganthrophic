import { useEffect, useState } from 'react'
import Icon from './Icon'

/* Appears once the visitor is a screenful or two down the page. */
export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 1.2)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      title="Back to top"
      className={`fixed bottom-6 right-6 z-40 grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-hairline bg-canvas text-ink shadow-[var(--shadow-md)] transition-all duration-300 hover:border-primary hover:text-primary ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <Icon name="arrowUp" size={18} />
    </button>
  )
}
