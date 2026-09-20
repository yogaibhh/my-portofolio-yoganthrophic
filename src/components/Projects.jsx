import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import useSpotlight from '../hooks/useSpotlight'
import useTilt from '../hooks/useTilt'
import { projects, projectCategories } from '../data/profile'

const COLLAPSED_COUNT = 6

/* The whole card is one link to the case study. The repo gets its button on
   the case-study page rather than a second anchor nested inside this one. */
function ProjectCard({ project, featured = false }) {
  const spotlight = useSpotlight()
  const tilt = useTilt({ max: featured ? 4 : 3 })

  return (
    <Link
      to={`/project/${project.slug}`}
      {...spotlight}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      className={`card card-hover spotlight ring-gradient tilt group flex h-full cursor-pointer flex-col overflow-hidden p-6 no-underline ${
        featured ? 'md:p-7' : ''
      }`}
    >
      <div className="relative flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
            <Icon name={project.icon} size={20} />
          </span>

          {project.metric && (
            <span className="rounded-lg border border-hairline bg-canvas px-2.5 py-1.5 text-right">
              <span className="block font-display text-base leading-none text-primary">
                {project.metric.value}
              </span>
              <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-wider text-muted-soft">
                {project.metric.label}
              </span>
            </span>
          )}
        </div>

        <h3
          className={`mb-2 font-body font-semibold tracking-normal text-ink ${
            featured ? 'text-xl' : 'text-[17px]'
          }`}
        >
          {project.title}
        </h3>

        <p className="mb-4 flex-1 text-sm leading-relaxed text-muted">
          {featured ? project.description : project.blurb}
        </p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {project.tags.slice(0, featured ? 6 : 4).map((tag) => (
            <span key={tag} className="chip px-2.5 py-1 text-[11px]">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-3 border-t border-hairline-soft pt-4 text-sm font-medium">
          <span className="inline-flex items-center gap-1.5 text-primary">
            Read the case study
            <Icon
              name="arrowRight"
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-muted-soft">
            <Icon name={project.link ? 'github' : 'briefcase'} size={13} />
            {project.link ? 'Source available' : 'Private work'}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function Projects() {
  const [filter, setFilter] = useState('All')
  const [showAll, setShowAll] = useState(false)

  const counts = useMemo(() => {
    const map = { All: projects.length }
    projects.forEach((p) => {
      map[p.category] = (map[p.category] ?? 0) + 1
    })
    return map
  }, [])

  const featured = projects.filter((p) => p.featured)
  const filtered = filter === 'All' ? projects : projects.filter((p) => p.category === filter)
  const collapsed = filter === 'All' && !showAll && filtered.length > COLLAPSED_COUNT
  const visible = collapsed ? filtered.slice(0, COLLAPSED_COUNT) : filtered

  return (
    <section id="projects" className="section-pad relative isolate overflow-hidden">
      <div className="shell relative z-[1]">
        <SectionHeading
          eyebrow="Selected work"
          title="Projects I've shipped"
          lede="Edge-inference models, agentic tooling, analytics pipelines and BI dashboards, most of them open on GitHub."
        />

        {/* Featured strip */}
        <div className="mb-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {featured.map((project, i) => (
            <Reveal key={project.title} delay={i * 90} variant="scale" className="h-full">
              <ProjectCard project={project} featured />
            </Reveal>
          ))}
        </div>

        {/* Filter bar */}
        <Reveal className="mb-8 flex flex-wrap items-center gap-2">
          {projectCategories.map((cat) => {
            const active = filter === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                aria-pressed={active}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-300 ${
                  active
                    ? 'border-primary bg-primary text-on-primary shadow-[var(--shadow-sm)]'
                    : 'border-hairline-soft bg-surface-soft text-body-strong hover:border-primary hover:text-primary'
                }`}
              >
                {cat}
                <span
                  className={`font-mono text-[10px] ${active ? 'text-on-primary/70' : 'text-muted-soft'}`}
                >
                  {counts[cat] ?? 0}
                </span>
              </button>
            )
          })}
        </Reveal>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((project, i) => (
            /* key includes the filter so cards re-mount and replay their
               entrance animation when the category changes */
            <Reveal key={`${filter}-${project.title}`} delay={i * 60} className="h-full">
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>

        {filter === 'All' && projects.length > COLLAPSED_COUNT && (
          <div className="mt-10 flex justify-center">
            <button type="button" onClick={() => setShowAll((v) => !v)} className="btn btn-ghost">
              {showAll ? 'Show fewer' : `Show all ${projects.length} projects`}
              <Icon
                name="chevronDown"
                size={15}
                className={`transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
