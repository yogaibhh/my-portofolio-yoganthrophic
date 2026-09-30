import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Icon from '../components/Icon'
import Reveal from '../components/Reveal'
import EvidenceChips from '../components/EvidenceChips'
import useDocumentHead, { SITE } from '../hooks/useDocumentHead'
import { roles, generalBrief, getBrief, briefTitle } from '../data/roles'
import { profile, projects, experiences, education, stats, socials } from '../data/profile'
import dashboards from '../data/dashboards'
import { taxonomyById } from '../data/skillTaxonomy'
import { CV_URL, mailtoHref, whatsappHref } from '../data/links'
import { evidenceFor } from '../fit/evidence'

/* /brief and /for/<role>: one page a recruiter can read in half a minute,
   forward, or print. Every skill on it links to the work behind it, so the
   page carries its own proof. */

const BRIEFS = [generalBrief, ...roles]

const pathFor = (brief) => (brief.id === 'general' ? '/brief' : `/for/${brief.id}`)

const companyName = (company) => company.replace(/\s*\([^)]*\)\s*$/, '')

const bareUrl = (href) => href.replace(/^https?:\/\/(www\.)?/, '')

function NotFoundState() {
  return (
    <div className="shell py-28 text-center">
      <p className="eyebrow mb-4">Unknown brief</p>
      <h1 className="mb-5">That brief isn&apos;t here</h1>
      <p className="mx-auto mb-8 max-w-md text-muted">
        There is a brief for each role I apply for, and a general one.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {BRIEFS.map((b) => (
          <Link key={b.id} to={pathFor(b)} className="btn btn-ghost no-underline">
            {briefTitle(b)}
          </Link>
        ))}
      </div>
    </div>
  )
}

function Toolbar({ brief }) {
  const [copied, setCopied] = useState(false)
  const url = `${SITE}${pathFor(brief)}/`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link', url)
    }
  }

  return (
    <Reveal className="mb-6 flex flex-col gap-4 print:hidden md:flex-row md:items-center md:justify-between">
      <nav aria-label="Brief for role" className="flex flex-wrap gap-2">
        {BRIEFS.map((b) => {
          const active = b.id === brief.id
          return (
            <Link
              key={b.id}
              to={pathFor(b)}
              aria-current={active ? 'page' : undefined}
              className={`rounded-full border px-3.5 py-2 text-sm font-medium no-underline transition-all duration-300 ${
                active
                  ? 'border-primary bg-primary text-on-primary shadow-[var(--shadow-sm)]'
                  : 'border-hairline-soft bg-surface-soft text-body-strong hover:border-primary hover:text-primary'
              }`}
            >
              {b.title}
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copy} className="btn btn-ghost px-4 py-2.5 text-sm">
          <Icon name={copied ? 'check' : 'link'} size={15} />
          <span aria-live="polite">{copied ? 'Link copied' : 'Copy link'}</span>
        </button>
        <button type="button" onClick={() => window.print()} className="btn btn-ghost px-4 py-2.5 text-sm">
          <Icon name="printer" size={15} />
          Print / save as PDF
        </button>
      </div>
    </Reveal>
  )
}

export default function RoleBrief() {
  const { role: roleId } = useParams()
  const brief = getBrief(roleId)

  useDocumentHead(
    brief
      ? { title: briefTitle(brief), description: brief.description, path: pathFor(brief) }
      : { title: 'Brief not found', path: `/for/${roleId}` },
  )

  if (!brief) return <NotFoundState />

  const current = experiences.find((e) => e.current) ?? experiences[0]
  const years = stats.find((s) => s.id === 'years')
  const whatsapp = whatsappHref(
    `Hi ${profile.shortName.split(' ')[0]}, I read your ${brief.id === 'general' ? 'recruiter' : brief.title} brief and would like to talk about a role.`,
  )
  const linkedin = socials.find((s) => s.icon === 'linkedin')
  const github = socials.find((s) => s.icon === 'github')

  const glance = [
    { label: 'Status', value: profile.availability },
    { label: 'Based in', value: `${profile.location} · GMT+7` },
    { label: 'Work mode', value: profile.workMode },
    { label: 'Current role', value: `${current.role}, ${companyName(current.company)}` },
    years && { label: 'Experience', value: `${years.value}${years.suffix} years` },
    { label: 'Education', value: `${education.degree}, ${education.school} · GPA ${education.gpa}` },
    profile.noticePeriod && { label: 'Notice period', value: profile.noticePeriod },
  ].filter(Boolean)

  const briefProjects = brief.projects.map((slug) => projects.find((p) => p.slug === slug)).filter(Boolean)
  const briefDashboards = brief.dashboards.map((id) => dashboards.find((d) => d.id === id)).filter(Boolean)
  const subject = brief.id === 'general' ? 'A role for Yoga' : `${brief.title} role for Yoga`

  return (
    <article className="relative isolate overflow-hidden pt-[68px] print:pt-0">
      <div className="aurora print:hidden" aria-hidden="true" />

      <div className="shell relative z-[1] py-10 md:py-14 print:max-w-none print:px-0 print:py-0">
        <Toolbar brief={brief} />

        <Reveal
          variant="scale"
          className="card overflow-hidden p-6 shadow-[var(--shadow-lg)] md:p-10 print:rounded-none print:border-0 print:bg-transparent print:p-0 print:shadow-none"
        >
          {/* Header, laid out like the top of a CV */}
          <header className="flex flex-col gap-6 border-b border-hairline pb-6 md:flex-row md:items-end md:justify-between print:flex-row print:items-end print:justify-between print:pb-4">
            <div className="min-w-0">
              <p className="eyebrow">{brief.id === 'general' ? '30-second brief' : `Brief · ${brief.title}`}</p>
              <h1 className="mt-2 text-[clamp(2.2rem,1.5rem+3vw,3.6rem)] print:text-[34px]">{profile.name}</h1>
              <p className="mt-1 font-display text-xl text-primary md:text-2xl print:text-lg">{brief.headline}</p>
            </div>
            <ul className="flex shrink-0 flex-col gap-1 text-sm text-muted md:items-end md:text-right print:items-end print:text-right print:text-xs">
              <li>
                <a href={`mailto:${profile.email}`} className="transition-colors hover:text-primary">
                  {profile.email}
                </a>
              </li>
              <li>
                <a href={whatsapp ?? `tel:${profile.phone.replace(/[^+\d]/g, '')}`} className="transition-colors hover:text-primary">
                  {profile.phone}
                  {whatsapp ? ' · WhatsApp' : ''}
                </a>
              </li>
              {linkedin && (
                <li>
                  <a href={linkedin.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary">
                    {bareUrl(linkedin.href)}
                  </a>
                </li>
              )}
              {github && (
                <li>
                  <a href={github.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary">
                    {bareUrl(github.href)}
                  </a>
                </li>
              )}
            </ul>
          </header>

          <p className="mt-6 max-w-3xl text-base leading-relaxed text-body md:text-[17px] print:mt-4 print:text-sm">
            {brief.pitch}
          </p>

          {/* At a glance */}
          <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-3 rounded-xl border border-hairline bg-canvas p-4 text-sm sm:grid-cols-2 lg:grid-cols-3 print:mt-4 print:grid-cols-3 print:bg-transparent print:text-xs">
            {glance.map((item) => (
              <div key={item.label} className="min-w-0">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-soft">{item.label}</dt>
                <dd className="mt-0.5 text-body-strong">{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-12 print:mt-5 print:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] print:gap-6">
            {/* Skills, each with its proof */}
            <section aria-labelledby="brief-skills">
              <h2 id="brief-skills" className="text-xl md:text-2xl print:text-base">
                Skills, with the work that proves them
              </h2>
              <ul className="mt-3">
                {brief.focusSkills.map((id) => (
                  <li
                    key={id}
                    className="grid grid-cols-1 gap-1.5 border-t border-hairline-soft py-3 first:border-t-0 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-4 print:grid-cols-[8rem_minmax(0,1fr)] print:py-1.5"
                  >
                    <span className="text-sm font-medium text-ink print:text-xs">{taxonomyById.get(id)?.label}</span>
                    <EvidenceChips items={evidenceFor(id)} max={3} />
                  </li>
                ))}
              </ul>
            </section>

            {/* Career */}
            <section aria-labelledby="brief-career">
              <h2 id="brief-career" className="text-xl md:text-2xl print:text-base">
                Career
              </h2>
              <ol className="mt-4 flex flex-col gap-3 print:mt-2 print:gap-1.5">
                {experiences.map((e) => (
                  <li key={`${e.role}-${e.period}`} className="text-sm print:text-xs">
                    <p className="font-mono text-[11px] text-muted-soft print:text-[9px]">{e.period}</p>
                    <p>
                      <span className="font-medium text-ink">{e.role}</span>
                      <span className="text-muted"> · {companyName(e.company)}</span>
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* Case studies */}
          <section aria-labelledby="brief-work" className="mt-8 print:mt-5">
            <h2 id="brief-work" className="text-xl md:text-2xl print:text-base">
              Start with these case studies
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 print:mt-2 print:grid-cols-3 print:gap-3">
              {briefProjects.map((p) => (
                <Link
                  key={p.slug}
                  to={`/project/${p.slug}`}
                  className="card card-hover group flex h-full flex-col bg-canvas p-4 no-underline print:bg-transparent print:p-3"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <Icon name={p.icon} size={17} className="shrink-0 text-primary" />
                    {p.metric && (
                      <span className="text-right">
                        <span className="block font-display text-lg leading-none text-primary print:text-sm">{p.metric.value}</span>
                        <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-wider text-muted-soft">
                          {p.metric.label}
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-ink print:text-xs">{p.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted print:text-[10px]">{p.blurb}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-medium text-primary print:hidden">
                    Read the case study
                    <Icon name="arrowRight" size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                  <span className="hidden pt-1.5 font-mono text-[8px] text-muted print:block">
                    {SITE}/project/{p.slug}/
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {briefDashboards.length > 0 && (
            <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted print:mt-3 print:text-xs">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-soft">Live dashboards</span>
              {briefDashboards.map((d) => (
                <Link key={d.id} to={`/dashboard/${d.id}`} className="chip chip-interactive no-underline">
                  <Icon name="chart" size={11} className="text-primary" />
                  {d.name}
                </Link>
              ))}
            </p>
          )}

          <footer className="mt-8 flex flex-col gap-4 border-t border-hairline pt-6 print:hidden md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <a href={mailtoHref({ subject })} className="btn btn-primary px-4 py-2.5 text-sm">
                <Icon name="mail" size={15} />
                Email me
              </a>
              {whatsapp && (
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-ghost px-4 py-2.5 text-sm">
                  <Icon name="whatsapp" size={15} />
                  WhatsApp
                </a>
              )}
              <a href={CV_URL} download={profile.cvFile} className="btn btn-ghost px-4 py-2.5 text-sm">
                <Icon name="download" size={15} />
                Download CV
              </a>
            </div>
            <Link to="/fit" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary no-underline">
              <Icon name="target" size={15} />
              Have a job description? Check my fit
              <Icon name="arrowRight" size={14} />
            </Link>
          </footer>

          <p className="mt-6 hidden border-t border-hairline pt-3 font-mono text-[9px] text-muted print:block">
            Portfolio {SITE}/ · This brief {SITE}
            {pathFor(brief)}/ · Every skill above links to its evidence on the site.
          </p>
        </Reveal>
      </div>
    </article>
  )
}
