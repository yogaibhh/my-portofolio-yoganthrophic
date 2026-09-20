import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import useTheme from '../hooks/useTheme'
import { sections, scrollToId } from '../data/nav'
import dashboards from '../data/dashboards'
import { profile, projects, socials } from '../data/profile'

const CV_URL = `${import.meta.env.BASE_URL}${profile.cvFile}`

/* Subsequence match — "mcp" hits "MCP AI Data Analyst", "cchm" hits
   "Customer Churn Monitor". Cheap, no dependency, good enough for ~30 items. */
function fuzzy(query, text) {
  if (!query) return true
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  let i = 0
  for (const ch of t) {
    if (ch === q[i]) i++
    if (i === q.length) return true
  }
  return false
}

export default function CommandPalette({ onClose }) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggle } = useTheme()

  const go = useCallback(
    (id) => {
      onClose()
      if (location.pathname !== '/') {
        navigate('/')
        // Two frames: one for the route swap, one for layout to settle
        requestAnimationFrame(() => requestAnimationFrame(() => scrollToId(id)))
      } else {
        scrollToId(id)
      }
    },
    [location.pathname, navigate, onClose]
  )

  const commands = useMemo(() => {
    const items = [
      {
        group: 'Navigate',
        label: 'Top of page',
        icon: 'arrowUp',
        run: () => go('hero'),
      },
      ...sections.map((s) => ({
        group: 'Navigate',
        label: s.label,
        icon: s.icon,
        run: () => go(s.id),
      })),
      ...projects.map((pr) => ({
        group: 'Projects',
        label: pr.title,
        icon: pr.icon,
        run: () => {
          onClose()
          navigate(`/project/${pr.slug}`)
        },
      })),
      ...dashboards.map((d) => ({
        group: 'Dashboards',
        label: d.name,
        icon: 'chart',
        run: () => {
          onClose()
          navigate(`/dashboard/${d.id}`)
        },
      })),
      {
        group: 'Actions',
        label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        icon: theme === 'dark' ? 'sun' : 'moon',
        run: () => {
          toggle()
          onClose()
        },
      },
      {
        group: 'Actions',
        label: copied ? 'Email copied!' : `Copy email · ${profile.email}`,
        icon: copied ? 'check' : 'copy',
        keepOpen: true,
        run: async () => {
          try {
            await navigator.clipboard.writeText(profile.email)
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
          } catch {
            window.location.href = `mailto:${profile.email}`
          }
        },
      },
      {
        group: 'Actions',
        label: 'Download CV (PDF)',
        icon: 'download',
        run: () => {
          onClose()
          const a = document.createElement('a')
          a.href = CV_URL
          a.download = profile.cvFile
          a.click()
        },
      },
      ...socials.map((s) => ({
        group: 'Links',
        label: s.label,
        icon: s.icon,
        run: () => {
          onClose()
          window.open(s.href, '_blank', 'noopener,noreferrer')
        },
      })),
    ]

    return items.filter((item) => fuzzy(query, `${item.group} ${item.label}`))
  }, [query, theme, toggle, copied, go, navigate, onClose])

  /* The parent mounts this component only while the palette is open, so state
     starts clean every time, so no reset effects are needed. */
  useEffect(() => {
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    document.body.classList.add('no-scroll')
    return () => {
      cancelAnimationFrame(id)
      document.body.classList.remove('no-scroll')
    }
  }, [])

  /* Keep the highlighted row in view while arrowing through a long list */
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${cursor}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => (commands.length ? (c + 1) % commands.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => (commands.length ? (c - 1 + commands.length) % commands.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      commands[cursor]?.run()
    }
  }

  let lastGroup = null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <button
        type="button"
        aria-label="Close command palette"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/35 backdrop-blur-sm animate-fade-in-up"
        style={{ animationDuration: '0.2s' }}
      />

      <div
        className="glass relative w-full max-w-xl overflow-hidden rounded-2xl shadow-[var(--shadow-xl)] animate-fade-in-up"
        style={{ animationDuration: '0.28s' }}
        onKeyDown={onKeyDown}
      >
        {/* Search field */}
        <div className="flex items-center gap-3 border-b border-hairline-soft px-4 py-3.5">
          <Icon name="search" size={18} className="text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setCursor(0)
            }}
            placeholder="Jump to a section, dashboard, or action…"
            aria-label="Search commands"
            className="w-full bg-transparent text-body-strong placeholder:text-muted-soft outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {commands.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted">
              No matches for “{query}”.
            </p>
          )}

          {commands.map((cmd, i) => {
            const showGroup = cmd.group !== lastGroup
            lastGroup = cmd.group
            const active = i === cursor

            return (
              <div key={`${cmd.group}-${cmd.label}`}>
                {showGroup && (
                  <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-soft">
                    {cmd.group}
                  </p>
                )}
                <button
                  type="button"
                  data-index={i}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => cmd.run()}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                    active ? 'bg-primary/12 text-ink' : 'text-body hover:bg-surface-soft'
                  }`}
                >
                  <Icon
                    name={cmd.icon}
                    size={16}
                    className={active ? 'text-primary' : 'text-muted'}
                  />
                  <span className="flex-1 truncate">{cmd.label}</span>
                  {active && <Icon name="arrowRight" size={14} className="text-primary" />}
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 border-t border-hairline-soft px-4 py-2.5 font-mono text-[10px] text-muted-soft">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span className="ml-auto">{commands.length} results</span>
        </div>
      </div>
    </div>
  )
}
