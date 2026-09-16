import Icon from './Icon'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import useCountUp from '../hooks/useCountUp'
import useSpotlight from '../hooks/useSpotlight'
import { profile, stats, education } from '../data/profile'

const focusAreas = [
  {
    icon: 'spark',
    title: 'Applied AI',
    body: 'LLM providers wired into real tooling, agentic workflows over MCP, and guardrails that keep agents scoped to read-only data.',
  },
  {
    icon: 'cloud',
    title: 'Edge ML',
    body: 'PyTorch models trained, quantised to TensorFlow Lite, and shipped into Flutter apps that predict with no connection at all.',
  },
  {
    icon: 'pipeline',
    title: 'Data foundations',
    body: 'Python ETL with retries, quality gates and idempotent loads — the unglamorous layer every AI system quietly depends on.',
  },
]

function StatCard({ stat, delay }) {
  const [ref, value] = useCountUp(stat.value)
  const spotlight = useSpotlight()

  return (
    <Reveal delay={delay} variant="scale">
      <div
        {...spotlight}
        className="card card-hover spotlight h-full overflow-hidden p-6 text-center"
      >
        <div ref={ref} className="relative">
          <span className="font-display text-4xl leading-none text-ink md:text-5xl">
            {value}
            <span className="text-primary">{stat.suffix}</span>
          </span>
          <p className="mt-3 text-sm font-medium text-body-strong">{stat.label}</p>
          <p className="mt-1 text-xs leading-snug text-muted">{stat.hint}</p>
        </div>
      </div>
    </Reveal>
  )
}

export default function About() {
  return (
    <section id="about" className="section-pad relative isolate overflow-hidden">
      <div className="dot-bg" aria-hidden="true" />

      <div className="shell relative z-[1]">
        <SectionHeading
          eyebrow="About"
          title="Engineer first, data scientist by training"
          lede="I build the whole path — from raw, messy sources through models, to the interface a stakeholder actually clicks."
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          {/* Bio + focus areas */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-5">
              {profile.bio.map((para, i) => (
                <Reveal as="p" key={i} delay={i * 80} className="text-base leading-relaxed text-body md:text-lg">
                  {para}
                </Reveal>
              ))}
              <Reveal as="p" delay={160} className="text-base leading-relaxed text-body md:text-lg">
                I graduated from{' '}
                <span className="font-medium text-ink">{education.school}</span> with a degree in{' '}
                {education.degree} (GPA {education.gpa}) — which is where the meteorology,
                geospatial and remote-sensing thread in my work comes from.
              </Reveal>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {focusAreas.map((area, i) => (
                <Reveal key={area.title} delay={i * 90} variant="up">
                  <div className="card card-hover h-full p-5">
                    <span className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-primary/12 text-primary">
                      <Icon name={area.icon} size={19} />
                    </span>
                    <h3 className="mb-2 font-body text-base font-semibold tracking-normal text-ink">
                      {area.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted">{area.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* "Currently" panel */}
          <Reveal variant="right" delay={120}>
            <div className="card sticky top-24 overflow-hidden p-7">
              <div className="mb-5 flex items-center gap-2.5">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-70 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <h3 className="font-body text-[13px] font-semibold uppercase tracking-[0.14em] text-ink">
                  Currently
                </h3>
              </div>

              <ul className="flex flex-col gap-4">
                {profile.now.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-body">
                    <Icon name="arrowRight" size={15} className="mt-1 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-3 border-t border-hairline pt-5 text-sm">
                <div className="flex items-center gap-2.5 text-muted">
                  <Icon name="pin" size={15} className="text-primary" />
                  {profile.location}
                </div>
                <div className="flex items-center gap-2.5 text-muted">
                  <Icon name="clock" size={15} className="text-primary" />
                  {profile.timezone} (GMT+7)
                </div>
                <div className="flex items-center gap-2.5 text-muted">
                  <Icon name="briefcase" size={15} className="text-primary" />
                  Open to remote & hybrid
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Stats */}
        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  )
}
