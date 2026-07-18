import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const navLinks = [
  { label: 'GitHub', id: 'github' },
  { label: 'About', id: 'about' },
  { label: 'Experience', id: 'experience' },
  { label: 'Projects', id: 'projects' },
  { label: 'Dashboards', id: 'dashboards' },
  { label: 'Skills', id: 'skills' },
  { label: 'Contact', id: 'contact' },
]

const NAVBAR_HEIGHT = 64

function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT
  window.scrollTo({ top, behavior: 'smooth' })
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeId, setActiveId] = useState('')
  const [scrolled, setScrolled] = useState(() => window.scrollY > 8)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Scroll-spy: highlight the nav link whose section fills most of the viewport.
     Only meaningful on Home — elsewhere the derived value below blanks it. */
  useEffect(() => {
    if (location.pathname !== '/') return
    const ratios = new Map()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0))
        let best = ''
        let bestRatio = 0
        ratios.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio
            best = id
          }
        })
        setActiveId(best)
      },
      { rootMargin: '-64px 0px -45% 0px', threshold: [0, 0.25, 0.5] }
    )
    navLinks.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [location.pathname])

  const currentActive = location.pathname === '/' ? activeId : ''

  /* HashRouter uses "#" for routing, so a plain <a href="#about"> would
     overwrite the route hash and land on a blank, unmatched route.
     Scroll manually instead, navigating home first if on another page. */
  const goToSection = (id) => (e) => {
    e.preventDefault()
    setMobileOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToId(id)))
    } else {
      scrollToId(id)
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-canvas/95 backdrop-blur-sm border-b h-16 flex items-center transition-shadow ${
        scrolled ? 'border-hairline shadow-sm' : 'border-hairline-soft'
      }`}
      aria-label="Main navigation"
    >
      <div className="max-w-[1200px] mx-auto w-full px-6 flex items-center justify-between">
        {/* Brand */}
        <a href="#" onClick={goToSection('hero')} className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-base font-semibold text-on-primary"
          >
            YI
          </span>
          <span className="font-display text-xl text-ink tracking-tight">Yoga Ibrahim</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={goToSection(link.id)}
              aria-current={currentActive === link.id ? 'true' : undefined}
              className={`relative text-sm font-medium transition-colors ${
                currentActive === link.id
                  ? 'text-primary after:absolute after:-bottom-[22px] after:left-0 after:h-[2px] after:w-full after:bg-primary'
                  : 'text-body hover:text-ink'
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={goToSection('contact')}
            className="inline-flex items-center px-5 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary-active transition-colors"
          >
            Contact Me
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-ink"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 top-16 bg-canvas z-40 flex flex-col items-center justify-center gap-8 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={goToSection(link.id)}
              className={`text-2xl font-display transition-colors ${
                currentActive === link.id ? 'text-primary' : 'text-ink hover:text-primary'
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={goToSection('contact')}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-on-primary text-base font-medium hover:bg-primary-active transition-colors"
          >
            Contact Me
          </a>
        </div>
      )}
    </nav>
  )
}
