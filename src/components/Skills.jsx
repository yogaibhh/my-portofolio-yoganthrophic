import Icon from './Icon'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import useInView from '../hooks/useInView'
import { skillGroups } from '../data/profile'

const ACCENTS = {
  primary: { text: 'text-primary', bg: 'bg-primary/12', bar: 'bg-primary' },
  teal: { text: 'text-accent-teal', bg: 'bg-accent-teal/14', bar: 'bg-accent-teal' },
  violet: { text: 'text-accent-violet', bg: 'bg-accent-violet/14', bar: 'bg-accent-violet' },
  amber: { text: 'text-accent-amber', bg: 'bg-accent-amber/14', bar: 'bg-accent-amber' },
}

function SkillRow({ skill, accent, inView, delay }) {
  return (
    <li className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-body-strong">{skill.name}</span>
        <span className="font-mono text-[10px] text-muted-soft">{skill.level}</span>
      </div>

      <p className="text-xs leading-snug text-muted">{skill.detail}</p>

      <div
        className="mt-1 h-1 w-full overflow-hidden rounded-full bg-surface-cream-strong"
        role="meter"
        aria-valuenow={skill.level}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${skill.name} proficiency`}
      >
        <span
          className={`block h-full rounded-full ${accent.bar}`}
          style={{
            width: inView ? `${skill.level}%` : '0%',
            transition: `width 1.1s var(--ease-out-expo) ${delay}ms`,
          }}
        />
      </div>
    </li>
  )
}

function SkillCard({ group, index }) {
  const [ref, inView] = useInView({ rootMargin: '0px 0px -12% 0px' })
  const accent = ACCENTS[group.accent] ?? ACCENTS.primary

  return (
    <Reveal delay={index * 80} variant="up" className="h-full">
      <div ref={ref} className="card card-hover flex h-full flex-col p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className={`grid h-10 w-10 place-items-center rounded-xl ${accent.bg} ${accent.text}`}>
            <Icon name={group.icon} size={19} />
          </span>
          <h3 className="font-body text-base font-semibold tracking-normal text-ink">
            {group.title}
          </h3>
        </div>

        <ul className="flex flex-col gap-4">
          {group.skills.map((skill, i) => (
            <SkillRow
              key={skill.name}
              skill={skill}
              accent={accent}
              inView={inView}
              delay={i * 110}
            />
          ))}
        </ul>
      </div>
    </Reveal>
  )
}

export default function Skills() {
  return (
    <section id="skills" className="section-pad bg-surface-soft">
      <div className="shell">
        <SectionHeading
          eyebrow="Toolkit"
          title="Skills & expertise"
          lede="Levels are self-assessed against how often I ship with each one in production, not against a certification."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {skillGroups.map((group, i) => (
            <SkillCard key={group.title} group={group} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
