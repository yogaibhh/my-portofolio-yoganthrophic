import Icon from './Icon'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import { education, certifications, awards } from '../data/profile'

export default function Education() {
  return (
    <section id="education" className="section-pad relative isolate overflow-hidden">
      <div className="shell relative z-[1]">
        <SectionHeading
          eyebrow="Background"
          title="Education, certifications & awards"
          lede="A meteorology degree explains the geospatial thread; the certifications are where the analytics stack got formalised."
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          {/* Degree */}
          <Reveal variant="left">
            <div className="card ring-gradient relative h-full overflow-hidden p-7">
              <div className="mb-6 flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                  <Icon name="book" size={22} />
                </span>
                <div>
                  <h3 className="font-body text-xl font-semibold tracking-normal text-ink">
                    {education.school}
                  </h3>
                  <p className="text-sm text-muted">{education.location}</p>
                </div>
              </div>

              <dl className="flex flex-col gap-3 text-sm">
                <div className="flex items-baseline justify-between gap-4 border-b border-hairline-soft pb-3">
                  <dt className="font-medium text-body-strong">{education.degree}</dt>
                  <dd className="font-mono text-xs text-muted">{education.period}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-body">Grade point average</dt>
                  <dd className="font-display text-lg text-primary">{education.gpa}</dd>
                </div>
              </dl>

              <div className="mt-6 border-t border-hairline pt-5">
                <h4 className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-soft">
                  Activities
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {education.activities.map((a) => (
                    <li key={a} className="flex items-start gap-3 text-sm leading-relaxed text-muted">
                      <span
                        className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-teal"
                        aria-hidden="true"
                      />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          <div className="flex flex-col gap-5">
            {/* Certifications */}
            <Reveal variant="right" delay={80}>
              <div className="card p-7">
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-teal/14 text-accent-teal">
                    <Icon name="check" size={19} />
                  </span>
                  <h3 className="font-body text-lg font-semibold tracking-normal text-ink">
                    Certifications
                  </h3>
                  <span className="ml-auto font-mono text-xs text-muted-soft">
                    {certifications.length}
                  </span>
                </div>

                <ul className="flex flex-col divide-y divide-hairline-soft">
                  {certifications.map((cert) => (
                    <li key={cert.name} className="flex items-center gap-3 py-2.5">
                      <Icon name="award" size={15} className="shrink-0 text-muted-soft" />
                      <span className="text-sm text-body">{cert.name}</span>
                      <span className="ml-auto whitespace-nowrap font-mono text-[10px] text-muted-soft">
                        {cert.issuer}
                        {cert.year ? ` · ${cert.year}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* Awards */}
            <Reveal variant="right" delay={160}>
              <div className="card p-7">
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-amber/16 text-accent-amber">
                    <Icon name="star" size={19} />
                  </span>
                  <h3 className="font-body text-lg font-semibold tracking-normal text-ink">
                    Awards & recognition
                  </h3>
                </div>

                <ul className="flex flex-col gap-4">
                  {awards.map((award) => (
                    <li key={award.title} className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-amber/20 text-accent-amber">
                        <Icon name="star" size={11} />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-body-strong">{award.title}</p>
                        <p className="text-xs text-muted">
                          {award.org} · {award.year}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
