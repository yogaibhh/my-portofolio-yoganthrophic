const experiences = [
  {
    role: 'Data Scientist | Generative AI',
    company: 'PT Pixel Digital (PT Ebdesk Teknologi)',
    location: 'Tangerang',
    period: 'Oct 2025 — Present',
    bullets: [
      'Engineered robust Python-based ETL pipelines for National Stability Index and NPI predictive models',
      'Architected interactive React-based security monitoring dashboards (Kodam Radin Inten, NETRA) with Elasticsearch & Mapbox GL',
      'Developed Fire Risk Prediction System (Karhutla) using Google Earth Engine and NASA POWER data',
      'Integrated AI agents into development workflows for ERP design optimization',
    ],
  },
  {
    role: 'Data Analyst | Geopolitical Simulation',
    company: 'PT Pixel Digital (PT Ebdesk Teknologi)',
    location: 'Tangerang',
    period: 'May — Oct 2025',
    bullets: [
      'Integrated multi-agent simulation results into PostgreSQL databases',
      'Built dynamic visualizations for trade patterns and geopolitical trends',
    ],
  },
  {
    role: 'Data Analyst',
    company: 'Anugerah Wisesa Selaras (weathermod.id)',
    location: 'Bandung',
    period: 'Oct — Dec 2024',
    bullets: [
      'Processed 480+ hours of weather data, automating data cleaning & visualization',
      '40% faster reporting time for weather modification projects',
    ],
  },
  {
    role: 'Research Assistant',
    company: 'PIAREA Environment & Technology',
    location: 'Bogor',
    period: 'Sep — Oct 2023',
    bullets: [
      'Processed 175,000+ hourly weather data points spanning 10 years',
      'Developed 2023 DKI Jakarta Air Quality Monitoring Map Album',
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
