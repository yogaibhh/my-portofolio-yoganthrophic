import Reveal from './Reveal'

const CV_URL = `${import.meta.env.BASE_URL}Muhamad_Yoga_Ibrahim_CV_AI_Engineer.pdf`
const CV_FILENAME = 'Muhamad_Yoga_Ibrahim_CV_AI_Engineer.pdf'

export default function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen pt-16 flex items-center bg-canvas"
    >
      <div className="max-w-[1200px] mx-auto w-full px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <div className="flex flex-col gap-6">
          {/* Availability chip */}
          <Reveal className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full border border-hairline bg-surface-soft">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent-teal opacity-75 motion-safe:animate-ping"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-teal"></span>
            </span>
            <span className="text-xs font-medium text-body">Open to AI/ML engineering roles</span>
          </Reveal>

          <Reveal delay={80} className="flex items-center gap-3">
            <span className="inline-block w-12 h-[2px] bg-primary"></span>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              Hello, I'm
            </span>
          </Reveal>

          <Reveal as="h1" delay={160}>
            Muhamad Yoga Ibrahim
          </Reveal>

          <Reveal
            as="p"
            delay={240}
            className="font-display text-primary text-[28px] md:text-[34px] leading-tight tracking-tight -mt-2"
          >
            AI Engineer — Applied ML &amp; LLM Integration
          </Reveal>

          <Reveal as="p" delay={320} className="text-body text-lg max-w-lg leading-relaxed">
            AI/ML engineer building edge-inference models, integrating LLM providers
            (OpenAI, Groq, OpenRouter, Deepgram) into production tooling, and shipping
            agentic workflows with the Model Context Protocol — backed by a data
            engineering foundation in Python, Elasticsearch, and PostgreSQL.
          </Reveal>

          <Reveal delay={400} className="flex flex-wrap items-center gap-4 mt-4">
            <a
              href="#projects"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-on-primary font-medium hover:bg-primary-active transition-colors"
            >
              View Projects
            </a>
            <a
              href={CV_URL}
              download={CV_FILENAME}
              className="inline-flex items-center px-6 py-3 rounded-lg border border-hairline text-body font-medium hover:border-ink hover:text-ink transition-colors"
            >
              Download CV
            </a>
          </Reveal>

          {/* Quick stats */}
          <Reveal delay={480} className="flex flex-wrap gap-6 mt-6 text-sm">
            <div>
              <span className="text-2xl font-display text-ink">3+</span>
              <p className="text-muted mt-1">Years Experience</p>
            </div>
            <div>
              <span className="text-2xl font-display text-ink">40%</span>
              <p className="text-muted mt-1">Faster Pipelines</p>
            </div>
            <div>
              <span className="text-2xl font-display text-ink">4</span>
              <p className="text-muted mt-1">LLM Providers Integrated</p>
            </div>
          </Reveal>
        </div>

        {/* Right visual — live CV preview */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-md aspect-square">
            <div className="absolute inset-0 rounded-2xl bg-surface-card overflow-hidden border border-hairline flex flex-col">
              {/* Header bar */}
              <div className="shrink-0 z-10 flex items-center justify-between px-4 py-3 bg-canvas/90 backdrop-blur-sm border-b border-hairline-soft">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">
                  Resume Preview
                </span>
                <a
                  href={CV_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-active transition-colors"
                >
                  Open Full CV
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <path d="M15 3h6v6M10 14L21 3" />
                  </svg>
                </a>
              </div>

              {/* Inline PDF embed */}
              <object
                data={CV_URL}
                type="application/pdf"
                className="flex-1 w-full min-h-0"
              >
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-8 text-center h-full">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                  <p className="text-muted text-sm">
                    Preview isn't supported on this device.
                  </p>
                  <a
                    href={CV_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary-active transition-colors"
                  >
                    Open CV
                  </a>
                </div>
              </object>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
