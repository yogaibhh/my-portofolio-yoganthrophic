import Icon from './Icon'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import useSpotlight from '../hooks/useSpotlight'
import { experiences } from '../data/profile'

function ExperienceCard({ exp, index }) {
  const spotlight = useSpotlight()

  return (
    <Reveal delay={index * 60} className="relative pl-12 md:pl-20">
      {/* Rail marker */}
      <span
        aria-hidden="true"
        className={`absolute left-[11px] top-7 grid h-[18px] w-[18px] place-items-center rounded-full border-2 md:left-[27px] ${
          exp.current
            ? 'border-primary bg-canvas'
            : 'border-hairline bg-surface-card'
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            exp.current ? 'bg-primary motion-safe:animate-pulse' : 'bg-muted-soft'
          }`}
        />
      </span>

      <div {...spotlight} className="card card-hover spotlight overflow-hidden p-6 md:p-7">
        <div className="relative flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="font-body text-lg font-semibold tracking-normal text-ink md:text-xl">
              {exp.role}
            </h3>
            {exp.current && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                Current
              </span>
            )}
            <span className="ml-auto font-mono text-xs whitespace-nowrap text-muted">
              {exp.period}
            </span>
          </div>

          <p className="text-sm text-body-strong">
            {exp.company}
            <span className="text-muted-soft"> · {exp.location}</span>
          </p>

          <ul className="mt-4 flex flex-col gap-2.5">
            {exp.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-body">
                <span
                  className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-teal"
                  aria-hidden="true"
                />
                {bullet}
              </li>
            ))}
          </ul>

          {exp.stack?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-hairline-soft pt-4">
              {exp.stack.map((t) => (
                <span key={t} className="chip text-[11px]">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Reveal>
  )
}

export default function Experience() {
  return (
    <section id="experience" className="section-pad bg-surface-soft">
      <div className="shell">
        <SectionHeading
          eyebrow="Career"
          title="Where I've been building"
          lede="Three years moving up the stack: dashboards, then models, now the full-stack AI tooling that ties both together."
        />

        <div className="relative">
          {/* Timeline rail — fades out at the bottom so it doesn't just stop */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-[19px] top-2 w-px bg-gradient-to-b from-primary/50 via-hairline to-transparent md:left-[35px]"
          />

          <div className="flex flex-col gap-6">
            {experiences.map((exp, i) => (
              <ExperienceCard key={`${exp.role}-${exp.period}`} exp={exp} index={i} />
            ))}
          </div>
        </div>

        <Reveal delay={120} className="mt-10 flex justify-center">
          <a
            href="https://www.linkedin.com/in/muhamadyogaibra"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            <Icon name="linkedin" size={16} />
            Full history on LinkedIn
            <Icon name="external" size={14} />
          </a>
        </Reveal>
      </div>
    </section>
  )
}
