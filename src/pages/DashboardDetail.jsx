import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import dashboards from '../data/dashboards'
import { hasDemo, DashboardDemo } from '../dashboards/registry'

function DashboardDetail() {
  const { id } = useParams()
  const dashboard = dashboards.find((d) => d.id === id)

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-canvas">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="mb-4">Dashboard Not Found</h2>
          <Link to="/" className="text-primary hover:text-primary-active transition-colors">
            &larr; Back to Portfolio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-20">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors mb-10 text-sm font-medium no-underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          Back to Portfolio
        </Link>

        {/* Header */}
        <header className="mb-12">
          <h1 className="mb-4">{dashboard.name}</h1>
          <p className="text-muted text-lg leading-relaxed max-w-3xl">
            {dashboard.description}
          </p>
        </header>

        {/* Live interactive demo */}
        {hasDemo(dashboard.id) && (
          <section className="mb-16">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <h2 className="text-2xl">Live Demo</h2>
              <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-surface-soft text-muted border border-hairline-soft">
                Interactive · sample data · free OpenStreetMap tiles
              </span>
            </div>
            <DashboardDemo id={dashboard.id} />
            <p className="text-muted-soft text-xs mt-3">
              All figures shown are synthetic sample data for demonstration only — not real operational intelligence.
            </p>
          </section>
        )}

        {/* Pipeline Flow */}
        <section className="mb-16">
          <h2 className="text-2xl mb-8">Data Pipeline Flow</h2>

          {/* Desktop: horizontal flow */}
          <div className="hidden md:flex items-stretch gap-0">
            {dashboard.pipeline.map((step, index) => (
              <div key={step.step} className="flex items-stretch">
                {/* Step box */}
                <div className="flex flex-col bg-surface-card border border-hairline rounded-lg p-5 w-48 min-h-[160px]">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-on-primary text-xs font-bold mb-3">
                    {step.step}
                  </span>
                  <h3 className="text-base font-semibold text-ink mb-2 leading-tight" style={{ fontSize: '16px' }}>
                    {step.title}
                  </h3>
                  <p className="text-muted text-xs leading-relaxed mt-auto">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector */}
                {index < dashboard.pipeline.length - 1 && (
                  <div className="flex items-center px-3">
                    <div className="flex items-center">
                      <div className="w-8 h-0.5 bg-primary"></div>
                      <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-primary"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile: vertical flow */}
          <div className="flex md:hidden flex-col items-center gap-0">
            {dashboard.pipeline.map((step, index) => (
              <div key={step.step} className="flex flex-col items-center w-full">
                {/* Step box */}
                <div className="flex flex-col bg-surface-card border border-hairline rounded-lg p-5 w-full">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-on-primary text-xs font-bold mb-3">
                    {step.step}
                  </span>
                  <h3 className="text-base font-semibold text-ink mb-2" style={{ fontSize: '16px' }}>
                    {step.title}
                  </h3>
                  <p className="text-muted text-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector (vertical) */}
                {index < dashboard.pipeline.length - 1 && (
                  <div className="flex flex-col items-center py-2">
                    <div className="w-0.5 h-6 bg-primary"></div>
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-primary"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section>
          <h2 className="text-2xl mb-6">Tech Stack</h2>
          <div className="flex flex-wrap gap-3">
            {dashboard.tech.map((t) => (
              <span
                key={t}
                className="px-4 py-2 text-sm font-medium rounded-full bg-surface-soft text-body-strong border border-hairline-soft"
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default DashboardDetail
