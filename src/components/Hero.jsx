export default function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen pt-16 flex items-center bg-canvas"
    >
      <div className="max-w-[1200px] mx-auto w-full px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="inline-block w-12 h-[2px] bg-primary"></span>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              Hello, I'm Yoga
            </span>
          </div>

          <h1>
            Data Scientist &<br />
            Analytics Engineer
          </h1>

          <p className="text-body text-lg max-w-lg leading-relaxed">
            Versatile Data Scientist with expertise spanning complex data parsing,
            meteorological modeling, and interactive visualization. Building
            national-scale monitoring systems using React, Mapbox GL, and AI integrations.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <a
              href="#projects"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-on-primary font-medium hover:bg-primary-active transition-colors"
            >
              View Projects
            </a>
            <a
              href="#contact"
              className="inline-flex items-center px-6 py-3 rounded-lg border border-hairline text-body font-medium hover:border-ink hover:text-ink transition-colors"
            >
              Download CV
            </a>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-6 mt-6 text-sm">
            <div>
              <span className="text-2xl font-display text-ink">3+</span>
              <p className="text-muted mt-1">Years Experience</p>
            </div>
            <div>
              <span className="text-2xl font-display text-ink">40%</span>
              <p className="text-muted mt-1">Faster Pipelines</p>
            </div>
            <div>
              <span className="text-2xl font-display text-ink">1M+</span>
              <p className="text-muted mt-1">Data Points</p>
            </div>
          </div>
        </div>

        {/* Right visual */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-md aspect-square">
            {/* Background decorative shapes */}
            <div className="absolute inset-0 rounded-2xl bg-surface-card overflow-hidden">
              {/* Abstract geometric pattern */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Grid dots */}
                {Array.from({ length: 8 }, (_, i) =>
                  Array.from({ length: 8 }, (_, j) => (
                    <circle
                      key={`${i}-${j}`}
                      cx={60 + j * 40}
                      cy={60 + i * 40}
                      r="2"
                      fill="#cc785c"
                      opacity="0.2"
                    />
                  ))
                )}
                {/* Large accent circle */}
                <circle cx="280" cy="120" r="60" fill="#cc785c" opacity="0.15" />
                {/* Dark element */}
                <rect x="60" y="240" width="120" height="120" rx="12" fill="#181715" opacity="0.9" />
                {/* Teal accent */}
                <circle cx="320" cy="300" r="40" fill="#5db8a6" opacity="0.25" />
                {/* Coral stripe */}
                <rect x="200" y="180" width="160" height="8" rx="4" fill="#cc785c" opacity="0.6" />
                <rect x="200" y="200" width="120" height="8" rx="4" fill="#cc785c" opacity="0.4" />
                <rect x="200" y="220" width="80" height="8" rx="4" fill="#cc785c" opacity="0.2" />
              </svg>

              {/* Code snippet overlay */}
              <div className="absolute bottom-8 left-8 right-8 bg-surface-dark rounded-xl p-4 text-sm font-mono">
                <div className="text-on-dark-soft text-xs mb-2">// data_pipeline.py</div>
                <div className="text-accent-teal">def</div>
                <span className="text-on-dark"> process_pipeline</span>
                <span className="text-on-dark-soft">(data):</span>
                <div className="text-on-dark-soft ml-4 mt-1">return optimize(data)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
