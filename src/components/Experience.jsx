const experiences = [
  {
    role: 'AI Native Engineer',
    company: 'PT Pixel Digital (PT Ebdesk Teknologi)',
    location: 'Tangerang',
    period: 'Jun 2026 — Present',
    bullets: [
      'Own full-stack scope (frontend, backend, database) building applied-AI "skills" that automate internal engineering workflows, moving beyond a data-scientist-only remit',
      'Migrating a fragmented internal BI-style dashboard system into a standardized full-stack boilerplate built through AI-assisted code generation, making bug handling faster and more consistent across dashboards',
      'Researching additional applied-AI capabilities: multi-format data cleaning (documents, spreadsheets, video, audio, satellite imagery), handwritten-document extraction from scanned PDFs, and Google Earth Engine code generation',
    ],
  },
  {
    role: 'Data Scientist',
    company: 'PT Pixel Digital (PT Ebdesk Teknologi)',
    location: 'Tangerang',
    period: 'Oct 2025 — Jun 2026',
    bullets: [
      'Engineered Python-based ETL pipelines to parse and normalize high-volume unstructured data feeding the National Stability Index and NPI predictive models',
      'Built React-based geospatial monitoring dashboards backed by Elasticsearch/Lucene queries and Mapbox GL, rendering real-time spatial and network-flow (Sankey) data for security operations',
      'Developed a fire-risk prediction model (Karhutla) using Google Earth Engine and NASA POWER meteorological data',
      'Prototyped AI-agent-assisted dashboard and template generation for internal ERP tooling — an early version of the full-stack standardization work later formalized in the AI Native role',
    ],
  },
  {
    role: 'Data Analyst',
    company: 'PT Pixel Digital (PT Ebdesk Teknologi)',
    location: 'Tangerang',
    period: 'May — Oct 2025',
    bullets: [
      'Integrated multi-agent simulation outputs into PostgreSQL, connecting raw simulation logs to downstream visualization layers',
      'Built dashboards tracking trade patterns and geopolitical trends for stakeholder use',
    ],
  },
  {
    role: 'Data Analyst',
    company: 'Anugerah Wisesa Selaras (weathermod.id)',
    location: 'Bandung',
    period: 'Oct — Dec 2024',
    bullets: [
      'Processed and analyzed 480+ hours of weather data in Python (Google Colab) and Excel, automating cleaning and visualization workflows',
      'Cut reporting time by 40% through automated data processing workflows for large meteorological datasets',
    ],
  },
  {
    role: 'Research Assistant',
    company: 'PIAREA Environment & Technology',
    location: 'Bogor',
    period: 'Sep — Oct 2023',
    bullets: [
      'Processed 175,000+ hourly weather data points (10 years, rainfall & temperature) in Excel',
      'Compiled the 2023 DKI Jakarta Air Quality Monitoring Map Album across 20+ monitoring locations',
    ],
  },
]

export default function Experience() {
  return (
    <section id="experience" className="bg-surface-soft py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section heading */}
        <div className="mb-12">
          <h2 className="text-ink">Work Experience</h2>
          <div className="w-16 h-[3px] bg-primary mt-4"></div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-0 md:left-8 top-0 bottom-0 w-px bg-ink/10 hidden md:block"></div>

          <div className="flex flex-col gap-10">
            {experiences.map((exp, idx) => (
              <div key={idx} className="relative md:pl-20">
                {/* Timeline dot */}
                <div className="absolute left-0 md:left-[29px] top-8 w-3 h-3 rounded-full bg-primary hidden md:block"></div>

                <div className="bg-canvas border border-hairline rounded-xl p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-ink text-xl font-display font-normal">
                        {exp.role}
                      </h3>
                      <p className="text-ink text-sm mt-1 opacity-75">
                        {exp.company} · {exp.location}
                      </p>
                    </div>
                    <span className="text-muted text-sm font-mono whitespace-nowrap">
                      {exp.period}
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {exp.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3 text-body text-sm leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-teal shrink-0"></span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
