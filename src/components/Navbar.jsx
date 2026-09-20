import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import ThemeToggle from './ThemeToggle'
import { primaryNav, sections, scrollToId, NAV_HEIGHT } from '../data/nav'
import { profile } from '../data/profile'

export default function Navbar({ onOpenPalette }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeId, setActiveId] = useState('')
  const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > 8)
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Scroll-spy: highlight the section currently filling most of the viewport.
     Only meaningful on Home; the derived value below blanks it elsewhere. */
  useEffect(() => {
    if (!isHome) return
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
      { rootMargin: `-${NAV_HEIGHT}px 0px -45% 0px`, threshold: [0, 0.25, 0.5] }
    )
    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [isHome])

  /* Lock the page behind the mobile drawer */
  useEffect(() => {
    document.body.classList.toggle('no-scroll', mobileOpen)
    return () => document.body.classList.remove('no-scroll')
  }, [mobileOpen])

  const currentActive = isHome ? activeId : ''

  /* Scroll manually rather than letting the browser jump to the anchor, so
     the sticky header offset is respected. When the visitor is on a detail
     page, go home first and scroll once layout settles. */
  const goToSection = (id) => (e) => {
    e.preventDefault()
    setMobileOpen(false)
    if (!isHome) {
      navigate('/')
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToId(id)))
    } else {
      scrollToId(id)
    }
  }

  return (
    <>
      <nav
        aria-label="Main navigation"
        className={`fixed inset-x-0 top-0 z-50 h-[68px] transition-all duration-300 ${
          scrolled ? 'glass shadow-[var(--shadow-sm)]' : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="shell flex h-full items-center justify-between gap-4">
          {/* Brand */}
          <a
            href="#"
            onClick={goToSection('hero')}
            className="group flex shrink-0 items-center gap-2.5"
            aria-label={`${profile.shortName}, back to top`}
          >
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent-amber font-display text-[15px] font-semibold text-on-primary shadow-[var(--shadow-sm)] transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3"
            >
              {profile.initials}
            </span>
            <span className="hidden font-display text-xl tracking-tight text-ink sm:block">
              {profile.shortName}
            </span>
          </a>

          {/* Desktop links, with a sliding pill marking the active section */}
          <div className="hidden items-center gap-1 rounded-full border border-hairline-soft bg-surface-soft/60 p-1 lg:flex">
            {primaryNav.map((link) => {
              const active = currentActive === link.id
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={goToSection(link.id)}
                  aria-current={active ? 'true' : undefined}
                  className={`relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-300 ${
                    active ? 'text-on-primary' : 'text-body hover:text-ink'
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-primary shadow-[var(--shadow-sm)]"
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </a>
              )
            })}
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenPalette}
              aria-label="Open command palette"
              className="hidden items-center gap-2 rounded-lg border border-hairline px-3 py-[7px] text-xs text-muted transition-colors hover:border-primary hover:text-primary cursor-pointer md:flex"
            >
              <Icon name="search" size={14} />
              <span>Search</span>
              <kbd className="rounded border border-hairline px-1 font-mono text-[10px] leading-4">
                ⌘K
              </kbd>
            </button>

            <ThemeToggle />

            <a
              href="#contact"
              onClick={goToSection('contact')}
              className="btn btn-primary hidden px-4 py-[9px] text-sm sm:inline-flex"
            >
              Let&apos;s talk
            </a>

            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-lg border border-hairline text-ink transition-colors hover:border-primary hover:text-primary cursor-pointer lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <Icon name={mobileOpen ? 'close' : 'menu'} size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute inset-x-0 top-[68px] origin-top rounded-b-3xl border-b border-hairline bg-canvas px-6 pb-8 pt-6 shadow-[var(--shadow-xl)] transition-all duration-300 ${
            mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
          style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
        >
          <ul className="flex flex-col">
            {sections.map((link, i) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={goToSection(link.id)}
                  className="flex items-center gap-3 border-b border-hairline-soft py-3.5 text-lg text-ink transition-colors hover:text-primary"
                  style={{
                    transitionDelay: mobileOpen ? `${i * 25}ms` : '0ms',
                  }}
                >
                  <Icon name={link.icon} size={17} className="text-primary" />
                  {link.label}
                  <Icon name="arrowRight" size={15} className="ml-auto text-muted-soft" />
                </a>
              </li>
            ))}
          </ul>

          <a
            href="#contact"
            onClick={goToSection('contact')}
            className="btn btn-primary mt-6 w-full"
          >
            Let&apos;s work together
            <Icon name="arrowRight" size={16} />
          </a>
        </div>
      </div>
    </>
  )
}
