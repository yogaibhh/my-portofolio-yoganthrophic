import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const navLinks = [
  { label: 'GitHub', id: 'github' },
  { label: 'About', id: 'about' },
  { label: 'Experience', id: 'experience' },
  { label: 'Projects', id: 'projects' },
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
  const navigate = useNavigate()
  const location = useLocation()

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
      className="fixed top-0 left-0 right-0 z-50 bg-canvas/95 backdrop-blur-sm border-b border-hairline-soft h-16 flex items-center"
      aria-label="Main navigation"
    >
      <div className="max-w-[1200px] mx-auto w-full px-6 flex items-center justify-between">
        {/* Brand */}
        <a href="#" className="font-display text-xl text-ink tracking-tight">
          Yoga Ibrahim
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={goToSection(link.id)}
              className="text-sm font-medium text-body hover:text-ink transition-colors"
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
              className="text-2xl font-display text-ink hover:text-primary transition-colors"
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
