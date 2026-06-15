const projects = [
  {
    title: 'Cloud Seeding Hunter',
    description:
      'Flutter mobile app for meteorological data analysis with PyTorch/TensorFlow Lite edge AI, geospatial tracking dashboard. 40% improvement in field reporting workflow.',
    tags: ['Flutter', 'PyTorch', 'TensorFlow Lite', 'Geospatial'],
    link: '#',
  },
  {
    title: 'AI Screen Reader',
    description:
      'Electron/React desktop app integrated with Generative AI APIs (Deepgram, Groq, OpenRouter) for automated visual context reading.',
    tags: ['Electron', 'React', 'Deepgram', 'Groq', 'OpenRouter'],
    link: '#',
  },
  {
    title: 'MCP AI Data Analyst',
    description:
      'Model Context Protocol integration for natural-language querying of PostgreSQL with read-only sandboxed AI operations.',
    tags: ['MCP', 'PostgreSQL', 'AI Agent', 'Python'],
    link: '#',
  },
]

export default function Projects() {
  return (
    <section id="projects" className="bg-canvas py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section heading */}
        <div className="mb-12">
          <h2>Featured Projects</h2>
          <div className="w-16 h-[3px] bg-primary mt-4"></div>
        </div>

        {/* Project cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.title}
              className="bg-surface-card rounded-xl p-8 flex flex-col gap-4 hover:shadow-lg transition-shadow"
            >
              {/* Icon placeholder */}
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>

              <h3 className="text-ink text-xl font-body font-semibold">
                {project.title}
              </h3>

              <p className="text-muted text-sm leading-relaxed flex-1">
                {project.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-canvas text-muted text-xs font-medium border border-hairline"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Link */}
              <a
                href={project.link}
                className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:text-primary-active transition-colors mt-2"
              >
                Learn More
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
