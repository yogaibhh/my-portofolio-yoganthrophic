import Reveal from './Reveal'

const projects = [
  {
    title: 'Cloud Seeding Hunter',
    description:
      'Trained and deployed a lightweight edge-inference classification model (PyTorch, TensorFlow Lite) for offline, on-device predictions in remote areas. Built the end-to-end Flutter mobile app, including an interactive geospatial tracking dashboard for the field engineering team.',
    tags: ['Flutter', 'PyTorch', 'TensorFlow Lite', 'Edge AI', 'Geospatial'],
    link: '#',
  },
  {
    title: 'AI Screen Reader',
    description:
      'Electron/React desktop app integrating multiple LLM providers (Deepgram, Groq, OpenRouter) to read and interpret on-screen visual context automatically, with API credential handling across a compiled cross-platform executable.',
    tags: ['Electron', 'React', 'Deepgram', 'Groq', 'OpenRouter'],
    link: '#',
  },
  {
    title: 'MCP AI Data Analyst',
    description:
      'Configured Model Context Protocol (MCP) to connect a local PostgreSQL instance for real-time, natural-language querying of production tables — scoped to a strict read-only role to sandbox all AI operations. Public SQLite demo implementation on GitHub.',
    tags: ['MCP', 'PostgreSQL', 'AI Agent', 'Python'],
    link: 'https://github.com/yogaibhh/mcp-sqlite-analyst',
  },
  {
    title: 'Telco Customer Churn Prediction',
    description:
      'End-to-end churn analysis of 7,043 telecom customers: EDA of churn drivers, sklearn preprocessing pipelines, and a three-model comparison reaching 0.84 ROC-AUC — permutation importance points to tenure, fiber-optic service, and month-to-month contracts.',
    tags: ['Python', 'scikit-learn', 'Machine Learning', 'EDA'],
    link: 'https://github.com/yogaibhh/telco-churn-prediction',
  },
  {
    title: 'Music Store SQL Analytics',
    description:
      'Twelve business questions answered in pure SQL on the Chinook database — CTEs, window functions (LAG, ROW_NUMBER, running totals), and multi-table joins — surfacing revenue concentration, catalog dead stock, and customer lifetime value.',
    tags: ['SQL', 'SQLite', 'Window Functions', 'Data Analysis'],
    link: 'https://github.com/yogaibhh/chinook-sql-analytics',
  },
  {
    title: 'Weather ETL Pipeline',
    description:
      'Production-style ETL from the Open-Meteo API into a SQLite dim/fact warehouse for five Indonesian cities (4,560 daily rows): retry/backoff extraction, data-quality gates, idempotent upserts, logging, and 17 unit tests.',
    tags: ['Python', 'ETL', 'SQLite', 'Data Engineering'],
    link: 'https://github.com/yogaibhh/weather-etl-pipeline',
  },
  {
    title: 'Indonesia Earthquake Analysis',
    description:
      'Geospatial EDA of 10,294 M4.5+ earthquakes from the USGS catalog (2015–2026): Gutenberg-Richter b-value fitting, depth profiling, and a spatial map tracing the Sunda subduction zone.',
    tags: ['Python', 'Geospatial', 'EDA', 'USGS API'],
    link: 'https://github.com/yogaibhh/indonesia-earthquake-analysis',
  },
  {
    title: 'FMCG Sales Dashboard (Excel)',
    description:
      'Interactive Excel dashboard built from cleaned FMCG transaction data — KPI cards, charts, and a real dropdown-driven filter wired to SUMIFS/AVERAGEIFS formulas, generated end-to-end with a reproducible Python workflow.',
    tags: ['Excel', 'Python', 'Data Visualization', 'BI'],
    link: 'https://github.com/yogaibhh/fmcg-dashboard-excel-testing',
  },
]

export default function Projects() {
  return (
    <section id="projects" className="bg-canvas py-24">
      <Reveal className="max-w-[1200px] mx-auto px-6">
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

              {/* Link — hidden until a real URL is filled in */}
              {project.link && project.link !== '#' && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:text-primary-active transition-colors mt-2"
                >
                  Learn More
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
