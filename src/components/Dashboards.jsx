import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import useInView from '../hooks/useInView'
import dashboards from '../data/dashboards'
import DashboardDemo from '../dashboards/registry'
import { hasDemo } from '../dashboards/demoRegistry'

export default function Dashboards() {
  const [activeId, setActiveId] = useState('fmcg-sales-performance')
  const active = dashboards.find((d) => d.id === activeId) ?? dashboards[0]

  /* Mount the heavy Leaflet/Recharts demo only once the section approaches the
     viewport, so the top of the homepage stays fast. */
  const [demoRef, demoInView] = useInView({ rootMargin: '300px' })

  return (
    <section id="dashboards" className="section-pad relative isolate overflow-hidden">
      <div className="dot-bg" aria-hidden="true" />

      <div className="shell relative z-[1]">
        <SectionHeading
          eyebrow="Live demos"
          title="Dashboards, running right here"
          lede="Interactive recreations of dashboards I've built — real React, synthetic data, free OpenStreetMap tiles. Pick one and poke at it."
        />

        {/* Tab selector */}
        <Reveal className="mb-5 flex flex-wrap gap-2">
          {dashboards.map((d) => {
            const isActive = active.id === d.id
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveId(d.id)}
                aria-pressed={isActive}
                className={`cursor-pointer rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'border-primary bg-primary text-on-primary shadow-[var(--shadow-sm)]'
                    : 'border-hairline-soft bg-surface-soft text-body-strong hover:border-primary hover:text-primary'
                }`}
              >
                {d.name}
              </button>
            )
          })}
        </Reveal>

        {/* Demo frame */}
        <Reveal variant="scale">
          <div
            ref={demoRef}
            className="rounded-2xl border border-hairline bg-surface-card p-2 shadow-[var(--shadow-lg)] md:p-3"
          >
            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
                {demoInView && hasDemo(active.id) ? (
                  <DashboardDemo id={active.id} key={active.id} />
                ) : (
                  <div className="flex h-[760px] items-center justify-center rounded-xl bg-surface-soft text-sm text-muted-soft">
                    Loading interactive demo…
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        <p className="mt-2 text-center font-mono text-[11px] text-muted-soft md:hidden">
          ← swipe the frame to pan across the dashboard →
        </p>

        {/* Active dashboard meta */}
        <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <h3 className="mb-2 font-body text-lg font-semibold tracking-normal text-ink">
              {active.name}
            </h3>
            <p className="mb-3 text-sm leading-relaxed text-muted">{active.description}</p>
            <div className="flex flex-wrap gap-2">
              {active.tech.map((t) => (
                <span key={t} className="chip text-[11px]">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <Link to={`/dashboard/${active.id}`} className="btn btn-ghost shrink-0 no-underline">
            Open full page
            <Icon name="arrowRight" size={15} />
          </Link>
        </div>

        <p className="mt-5 flex items-center gap-2 font-mono text-[11px] text-muted-soft">
          <Icon name="spark" size={12} />
          Synthetic sample data for demonstration only — not real operational data.
        </p>
      </div>
    </section>
  )
}
