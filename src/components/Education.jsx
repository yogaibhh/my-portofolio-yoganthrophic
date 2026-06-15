const certifications = [
  'Associate Data Analyst in Python (DataCamp)',
  'Associate Data Analyst in PowerBI (DataCamp)',
  'Working with OpenAI API (DataCamp, Oct 2025)',
  'Associate Data Analyst in SQL (DataCamp, Apr 2025)',
  'Associate Business Analyst in SQL (DataCamp, May 2025)',
  'Data Analyst | Generasi Gigih 3.0 (GoTo Impact Foundation, 2023)',
]

const awards = [
  { title: 'Finalist, National Infographic Competition', org: 'Agrocompetition', year: '2022' },
  { title: 'Presenter, Indonesian Aerosol Association Conference', org: 'IAA', year: '2024' },
  { title: 'Best Member, Special Team Division', org: 'PSN', year: '2021' },
]

export default function Education() {
  return (
    <section id="education" className="bg-canvas py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section heading */}
        <div className="mb-12">
          <h2>Education & Certifications</h2>
          <div className="w-16 h-[3px] bg-primary mt-4"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Education */}
          <div className="bg-surface-card rounded-xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div>
                <h3 className="text-ink text-xl font-body font-semibold">IPB University</h3>
                <p className="text-muted text-sm">Bogor, Indonesia</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-body font-medium">Applied Meteorology</span>
                <span className="text-muted">2020 — 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body">GPA</span>
                <span className="text-primary font-semibold">3.67 / 4.00</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-hairline">
              <h4 className="text-ink text-sm font-semibold mb-3">Activities</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-muted text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-teal shrink-0"></span>
                  Research Assistant & Presenter at international conferences
                </li>
                <li className="flex items-start gap-2 text-muted text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-teal shrink-0"></span>
                  Treasurer & PKM team leader
                </li>
                <li className="flex items-start gap-2 text-muted text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-teal shrink-0"></span>
                  Presented on AOD and PM Relationship in Jakarta
                </li>
              </ul>
            </div>
          </div>

          {/* Certifications & Awards */}
          <div className="flex flex-col gap-8">
            {/* Certifications */}
            <div className="bg-surface-card rounded-xl p-8">
              <h3 className="text-ink text-xl font-body font-semibold mb-4">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert) => (
                  <span
                    key={cert}
                    className="px-3 py-1.5 rounded-full bg-canvas text-muted text-xs font-medium border border-hairline"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* Awards */}
            <div className="bg-surface-card rounded-xl p-8">
              <h3 className="text-ink text-xl font-body font-semibold mb-4">Awards & Recognition</h3>
              <ul className="space-y-4">
                {awards.map((award) => (
                  <li key={award.title} className="flex items-start gap-3">
                    <div className="mt-1 w-6 h-6 rounded-full bg-accent-amber/20 flex items-center justify-center shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-accent-amber">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-body text-sm font-medium">{award.title}</p>
                      <p className="text-muted text-xs">{award.org} · {award.year}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
