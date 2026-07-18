import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import dashboards from '../data/dashboards'
import { DashboardDemo, hasDemo } from '../dashboards/registry'
import Reveal from './Reveal'

/* Render the heavy live demo only once its section scrolls into view,
   so the top of the homepage stays fast. */
function useInView(ref, rootMargin = '250px') {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    if (seen || !ref.current) return
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); ob.disconnect() } },
      { rootMargin },
    )
    ob.observe(ref.current)
    return () => ob.disconnect()
  }, [seen, ref, rootMargin])
  return seen
}

function Dashboards() {
  const [activeId, setActiveId] = useState('fmcg-sales-performance')
  const active = dashboards.find((d) => d.id === activeId) ?? dashboards[0]
  const demoRef = useRef(null)
  const inView = useInView(demoRef)

  return (
    <section id="dashboards" className="py-20 px-6 md:px-12 lg:px-24">
      <Reveal className="max-w-6xl mx-auto">
        <h2 className="mb-4">Dashboards</h2>
        <p className="text-muted text-lg mb-8 max-w-2xl">
          Live, interactive recreations of dashboards I&apos;ve built — running right here with synthetic
          sample data and free OpenStreetMap tiles. Pick one to explore it inline.
        </p>

        {/* tab selector */}
        <div className="flex flex-wrap gap-2 mb-5">
          {dashboards.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveId(d.id)}
              className={`px-3.5 py-2 text-sm font-medium rounded-full border transition-all duration-200 cursor-pointer ${
                active.id === d.id
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-soft text-body-strong border-hairline-soft hover:border-primary'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* live demo frame */}
        <div
          ref={demoRef}
          className="rounded-2xl border border-hairline bg-surface-dark/5 p-2 md:p-3 shadow-sm"
        >
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {inView && hasDemo(active.id) ? (
                <DashboardDemo id={active.id} key={active.id} />
              ) : (
                <div className="flex items-center justify-center h-[760px] text-muted-soft text-sm">
                  Loading interactive demo…
                </div>
              )}
            </div>
          </div>
        </div>

        {/* active dashboard info + full-page link */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-5">
          <div className="max-w-2xl">
            <h3 className="text-xl text-ink mb-2" style={{ fontSize: '20px' }}>{active.name}</h3>
            <p className="text-muted text-sm mb-3 leading-relaxed">{active.description}</p>
            <div className="flex flex-wrap gap-2">
              {active.tech.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 text-xs font-medium rounded-full bg-surface-soft text-body-strong border border-hairline-soft"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <Link
            to={`/dashboard/${active.id}`}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-canvas border border-hairline text-ink text-sm font-medium hover:border-primary hover:text-primary transition-colors no-underline"
          >
            Open full page
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <p className="text-muted-soft text-xs mt-3">
          Synthetic sample data for demonstration only — not real operational data.
        </p>
      </Reveal>
    </section>
  )
}

export default Dashboards
