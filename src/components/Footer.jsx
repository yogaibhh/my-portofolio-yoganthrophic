import { Link, useLocation, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { sections, scrollToId } from '../data/nav'
import { profile, socials } from '../data/profile'
import dashboards from '../data/dashboards'

export default function Footer() {
  const navigate = useNavigate()
  const location = useLocation()

  /* HashRouter owns "#", so plain anchors would blank the route — scroll
     manually, navigating home first when we're on a dashboard page. */
  const goToSection = (id) => (e) => {
    e.preventDefault()
    if (location.pathname !== '/') {
      navigate('/')
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToId(id)))
    } else {
      scrollToId(id)
    }
  }

  return (
    <footer className="relative isolate overflow-hidden border-t border-hairline bg-surface-dark text-on-dark">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[80%] -translate-x-1/2 rounded-full bg-primary/15 blur-[100px]"
      />

      <div className="shell relative z-[1] py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <a
              href="#"
              onClick={goToSection('hero')}
              className="inline-flex items-center gap-2.5"
              aria-label="Back to top"
            >
              <span
                aria-hidden="true"
                className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent-amber font-display text-[15px] font-semibold text-on-primary"
              >
                {profile.initials}
              </span>
              <span className="font-display text-xl tracking-tight text-on-dark">
                {profile.shortName}
              </span>
            </a>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-on-dark-soft">
              {profile.tagline}. Based in {profile.location} — building ML models, LLM workflows,
              and data-driven dashboards.
            </p>

            <div className="mt-5 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={s.label}
                  title={s.label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-on-dark-soft/25 text-on-dark-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                >
                  <Icon name={s.icon} size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          <nav aria-label="Footer sections">
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-on-dark-soft">
              Sections
            </h2>
            <ul className="flex flex-col gap-2.5">
              {sections.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={goToSection(link.id)}
                    className="text-sm text-on-dark-soft transition-colors hover:text-on-dark"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Dashboards */}
          <nav aria-label="Footer dashboards">
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-on-dark-soft">
              Dashboards
            </h2>
            <ul className="flex flex-col gap-2.5">
              {dashboards.slice(0, 6).map((d) => (
                <li key={d.id}>
                  <Link
                    to={`/dashboard/${d.id}`}
                    className="text-sm text-on-dark-soft no-underline transition-colors hover:text-on-dark"
                  >
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-on-dark-soft">
              Get in touch
            </h2>
            <ul className="flex flex-col gap-2.5 text-sm text-on-dark-soft">
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="transition-colors hover:text-on-dark"
                >
                  {profile.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${profile.phone.replace(/[^+\d]/g, '')}`}
                  className="transition-colors hover:text-on-dark"
                >
                  {profile.phone}
                </a>
              </li>
              <li>{profile.location}</li>
            </ul>

            <a
              href="#contact"
              onClick={goToSection('contact')}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-active"
            >
              Start a conversation
              <Icon name="arrowRight" size={14} />
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-on-dark-soft/20 pt-7 sm:flex-row">
          <p className="text-xs text-on-dark-soft">
            © {new Date().getFullYear()} {profile.name}. All rights reserved.
          </p>
          <p className="font-mono text-[11px] text-on-dark-soft/70">
            Built with React, Vite &amp; Tailwind · deployed on GitHub Pages
          </p>
        </div>
      </div>
    </footer>
  )
}
