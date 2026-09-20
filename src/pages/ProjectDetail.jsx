import { useParams, Link } from 'react-router-dom'
import Icon from '../components/Icon'
import Reveal from '../components/Reveal'
import useDocumentHead from '../hooks/useDocumentHead'
import { projects } from '../data/profile'
import { getCaseStudy } from '../data/caseStudies'

function NotFoundState() {
  return (
    <div className="shell py-28 text-center">
      <p className="eyebrow mb-4">Unknown project</p>
      <h1 className="mb-5">That project isn&apos;t here</h1>
      <p className="mx-auto mb-8 max-w-md text-muted">
        The id in the URL doesn&apos;t match any project in this portfolio.
      </p>
      <Link to="/" className="btn btn-primary no-underline">
        <Icon name="arrowLeft" size={16} />
        Back to portfolio
      </Link>
    </div>
  )
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const index = projects.findIndex((p) => p.slug === slug)
  const project = projects[index]
  const study = project ? getCaseStudy(slug) : null

  useDocumentHead(
    project
      ? {
          title: `${project.title} · case study`,
          description: project.description,
          path: `/project/${slug}`,
        }
      : { title: 'Project not found', path: `/project/${slug}` },
  )

  if (!project) return <NotFoundState />

  const prev = projects[(index - 1 + projects.length) % projects.length]
  const next = projects[(index + 1) % projects.length]

  return (
    <article className="relative isolate overflow-hidden pt-[68px]">
      <div className="aurora" aria-hidden="true" />

      <div className="shell relative z-[1] py-12 md:py-16">
        {/* Breadcrumb */}
        <Reveal className="mb-8 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-soft">
          <Link to="/" className="no-underline transition-colors hover:text-primary">
            Portfolio
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/#projects" className="no-underline transition-colors hover:text-primary">
            Projects
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-body">{project.title}</span>
        </Reveal>

        {/* Header */}
        <header className="mb-12 max-w-3xl">
          <Reveal className="mb-5 flex flex-wrap items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
              <Icon name={project.icon} size={22} />
            </span>
            <span className="chip">{project.category}</span>
            {study?.privateWork && (
              <span className="chip">
                <Icon name="briefcase" size={12} />
                Client / internal work
              </span>
            )}
          </Reveal>

          <Reveal as="h1" className="mb-5">
            {project.title}
          </Reveal>

          <Reveal as="p" delay={80} className="text-base leading-relaxed text-muted md:text-lg">
            {study?.tagline ?? project.description}
          </Reveal>

          <Reveal delay={140} className="mt-7 flex flex-wrap items-center gap-3">
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary no-underline"
              >
                <Icon name="github" size={16} />
                View the source
              </a>
            )}
            {study?.links
              ?.filter((l) => l.href !== project.link)
              .map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost no-underline"
                >
                  <Icon name={l.kind === 'github' ? 'github' : 'external'} size={15} />
                  {l.label}
                </a>
              ))}
            {study?.role && (
              <span className="font-mono text-xs text-muted-soft">Role: {study.role}</span>
            )}
          </Reveal>
        </header>

        {/* No long-form study yet: show the card copy and stop. */}
        {!study ? (
          <Reveal className="card max-w-3xl p-7">
            <p className="text-base leading-relaxed text-muted">{project.description}</p>
            <div className="mt-6 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span key={tag} className="chip px-2.5 py-1 text-[11px]">
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>
        ) : (
          <>
            {/* Attribution, where the work was integrating someone else's tool */}
            {study.credit && (
              <Reveal className="mb-12 max-w-3xl rounded-2xl border border-hairline bg-surface-soft p-5 md:p-6">
                <p className="eyebrow mb-2">{study.credit.label}</p>
                <p className="text-sm leading-relaxed text-muted">
                  {study.credit.body}{' '}
                  <a
                    href={study.credit.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary"
                  >
                    See the project
                  </a>
                  .
                </p>
              </Reveal>
            )}

            {/* Results */}
            <section className="mb-16" aria-label="Results">
              <h2 className="mb-6 text-2xl">By the numbers</h2>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {study.results.map((r, i) => (
                  <Reveal
                    key={r.label}
                    delay={i * 70}
                    className="card flex h-full flex-col p-5"
                  >
                    <span className="font-display text-3xl leading-none text-primary">
                      {r.value}
                    </span>
                    <span className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-soft">
                      {r.label}
                    </span>
                    <span className="mt-2 text-sm leading-relaxed text-muted">
                      {r.note}
                      {r.needsInput && (
                        <span className="mt-2 block font-mono text-[10px] uppercase tracking-wider text-accent-amber">
                          Needs a real figure
                        </span>
                      )}
                    </span>
                  </Reveal>
                ))}
              </div>
            </section>

            {/* Context */}
            <section className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
              <div>
                <h2 className="mb-6 text-2xl">The problem</h2>
                {study.context.map((para, i) => (
                  <Reveal
                    as="p"
                    key={i}
                    delay={i * 70}
                    className="mb-4 text-base leading-relaxed text-muted"
                  >
                    {para}
                  </Reveal>
                ))}
                <Reveal
                  delay={160}
                  className="mt-6 rounded-2xl border-l-2 border-primary bg-surface-soft py-4 pl-5 pr-5"
                >
                  <p className="eyebrow mb-2">What it came down to</p>
                  <p className="text-base leading-relaxed text-body-strong">{study.challenge}</p>
                </Reveal>
              </div>

              <Reveal variant="left" className="card h-fit p-6">
                <h3 className="mb-4 font-body text-base font-semibold tracking-normal text-ink">
                  Stack
                </h3>
                <div className="flex flex-col gap-5">
                  {study.stack.map((group) => (
                    <div key={group.group}>
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-soft">
                        {group.group}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.items.map((item) => (
                          <span key={item} className="chip px-2.5 py-1 text-[11px]">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </section>

            {/* Approach */}
            <section className="mb-16" aria-label="Approach">
              <h2 className="mb-8 text-2xl">How I built it</h2>
              <ol className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {study.approach.map((step, i) => (
                  <Reveal
                    as="li"
                    key={step.title}
                    delay={i * 60}
                    className="card flex h-full flex-col p-6"
                  >
                    <span className="mb-3 grid h-8 w-8 place-items-center rounded-full bg-primary font-mono text-xs font-bold text-on-primary">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mb-2 font-body text-base font-semibold tracking-normal text-ink">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted">{step.body}</p>
                  </Reveal>
                ))}
              </ol>
            </section>

            {/* Findings */}
            {study.findings && (
              <section className="mb-16" aria-label="Findings">
                <h2 className="mb-6 text-2xl">What the data said</h2>
                <Reveal className="card overflow-hidden p-0">
                  <table className="w-full border-collapse text-left">
                    <caption className="sr-only">Key findings</caption>
                    <tbody>
                      {study.findings.map((f) => (
                        <tr key={f.label} className="border-b border-hairline-soft last:border-0">
                          <th
                            scope="row"
                            className="px-5 py-4 text-sm font-medium text-ink md:w-1/3"
                          >
                            {f.label}
                          </th>
                          <td className="px-5 py-4 font-mono text-base text-primary">{f.value}</td>
                          <td className="px-5 py-4 text-sm leading-relaxed text-muted">{f.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Reveal>
              </section>
            )}

            {/* Lessons */}
            <section className="mb-16" aria-label="What I took from it">
              <h2 className="mb-6 text-2xl">What I took from it</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {study.lessons.map((lesson, i) => (
                  <Reveal key={i} delay={i * 70} className="card flex h-full gap-4 p-6">
                    <Icon name="spark" size={18} className="mt-0.5 shrink-0 text-primary" />
                    <p className="text-sm leading-relaxed text-muted">{lesson}</p>
                  </Reveal>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Prev / next */}
        <nav
          aria-label="Other projects"
          className="grid grid-cols-1 gap-4 border-t border-hairline pt-8 sm:grid-cols-2"
        >
          <Link
            to={`/project/${prev.slug}`}
            className="card card-hover group flex items-center gap-3 p-5 no-underline"
          >
            <Icon
              name="arrowLeft"
              size={18}
              className="shrink-0 text-primary transition-transform duration-300 group-hover:-translate-x-1"
            />
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-soft">
                Previous
              </span>
              <span className="text-sm font-medium text-ink">{prev.title}</span>
            </span>
          </Link>

          <Link
            to={`/project/${next.slug}`}
            className="card card-hover group flex items-center justify-end gap-3 p-5 text-right no-underline"
          >
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-soft">
                Next
              </span>
              <span className="text-sm font-medium text-ink">{next.title}</span>
            </span>
            <Icon
              name="arrowRight"
              size={18}
              className="shrink-0 text-primary transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </nav>
      </div>
    </article>
  )
}
