import { useParams, Link } from 'react-router-dom'
import Icon from '../components/Icon'
import Reveal from '../components/Reveal'
import useDocumentHead from '../hooks/useDocumentHead'
import dashboards from '../data/dashboards'
import DashboardDemo from '../dashboards/registry'
import { hasDemo } from '../dashboards/demoRegistry'

function NotFoundState() {
  return (
    <div className="shell py-28 text-center">
      <p className="eyebrow mb-4">Unknown dashboard</p>
      <h1 className="mb-5">That dashboard isn&apos;t here</h1>
      <p className="mx-auto mb-8 max-w-md text-muted">
        The id in the URL doesn&apos;t match any dashboard in this portfolio.
      </p>
      <Link to="/" className="btn btn-primary no-underline">
        <Icon name="arrowLeft" size={16} />
        Back to portfolio
      </Link>
    </div>
  )
}

export default function DashboardDetail() {
  const { id } = useParams()
  const index = dashboards.findIndex((d) => d.id === id)
  const dashboard = dashboards[index]

  useDocumentHead(
    dashboard
      ? {
          title: `${dashboard.name} · live dashboard`,
          description: dashboard.description,
          path: `/dashboard/${id}`,
        }
      : { title: 'Dashboard not found', path: `/dashboard/${id}` },
  )

  if (!dashboard) return <NotFoundState />

  const prev = dashboards[(index - 1 + dashboards.length) % dashboards.length]
  const next = dashboards[(index + 1) % dashboards.length]

  return (
    <article className="relative isolate overflow-hidden pt-[68px]">
      <div className="aurora" aria-hidden="true" />

      <div className="shell relative z-[1] py-12 md:py-16">
        {/* Breadcrumb */}
        <Reveal className="mb-8 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-soft">
          <Link to="/" className="no-underline transition-colors hover:text-primary">
            Portfolio
          </Link>
          <span aria-hidden="true">/</span>
          <span>Dashboards</span>
          <span aria-hidden="true">/</span>
          <span className="text-body">{dashboard.name}</span>
        </Reveal>

        {/* Header */}
        <header className="mb-10 max-w-3xl">
          <Reveal as="h1" className="mb-5">
            {dashboard.name}
          </Reveal>
          <Reveal as="p" delay={80} className="text-base leading-relaxed text-muted md:text-lg">
            {dashboard.description}
          </Reveal>
          <Reveal delay={140} className="mt-6 flex flex-wrap gap-2">
            {dashboard.tech.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </Reveal>
        </header>

        {/* Live demo */}
        {hasDemo(dashboard.id) && (
          <section className="mb-16" aria-label="Live demo">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl">Live demo</h2>
              <span className="chip text-[11px]">
                <Icon name="spark" size={12} className="text-primary" />
                Interactive · sample data · OpenStreetMap tiles
              </span>
            </div>

            <div className="rounded-2xl border border-hairline bg-surface-card p-2 shadow-[var(--shadow-lg)] md:p-3">
              <div className="overflow-x-auto">
                <div className="min-w-[1000px]">
                  <DashboardDemo id={dashboard.id} />
                </div>
              </div>
            </div>

            <p className="mt-3 font-mono text-[11px] text-muted-soft">
              All figures are synthetic sample data for demonstration only, not real
              operational intelligence.
            </p>
          </section>
        )}

        {/* Pipeline */}
        <section className="mb-16" aria-label="Data pipeline">
          <h2 className="text-2xl mb-8">Data pipeline flow</h2>

          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dashboard.pipeline.map((step, i) => (
              <Reveal
                as="li"
                key={step.step}
                delay={i * 80}
                className="relative flex h-full flex-col rounded-2xl border border-hairline bg-surface-card p-5"
              >
                {/* Connector: desktop only, never after the last card */}
                {i < dashboard.pipeline.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-4 top-1/2 hidden h-px w-4 -translate-y-1/2 bg-primary/50 lg:block"
                  />
                )}

                <span className="mb-3 grid h-8 w-8 place-items-center rounded-full bg-primary font-mono text-xs font-bold text-on-primary">
                  {step.step}
                </span>
                <h3 className="mb-2 font-body text-base font-semibold tracking-normal text-ink">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">{step.description}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* Prev / next */}
        <nav
          aria-label="Other dashboards"
          className="grid grid-cols-1 gap-4 border-t border-hairline pt-8 sm:grid-cols-2"
        >
          <Link
            to={`/dashboard/${prev.id}`}
            className="card card-hover group flex items-center gap-3 p-5 no-underline"
          >
            <Icon
              name="arrowLeft"
              size={18}
              className="shrink-0 text-primary transition-transform duration-300 group-hover:-translate-x-1"
            />
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-soft">
                Previous
              </span>
              <span className="text-sm font-medium text-ink">{prev.name}</span>
            </span>
          </Link>

          <Link
            to={`/dashboard/${next.id}`}
            className="card card-hover group flex items-center justify-end gap-3 p-5 text-right no-underline"
          >
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-soft">
                Next
              </span>
              <span className="text-sm font-medium text-ink">{next.name}</span>
            </span>
            <Icon
              name="arrowRight"
              size={18}
              className="shrink-0 text-primary transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </nav>
      </div>
    </article>
  )
}
