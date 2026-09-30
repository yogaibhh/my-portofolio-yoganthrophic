import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import EvidenceChips from './EvidenceChips'
import { profile } from '../data/profile'
import { CV_URL, mailtoHref, whatsappHref } from '../data/links'
import { taxonomyById } from '../data/skillTaxonomy'
import { SITE } from '../hooks/useDocumentHead'
import {
  CREDIT,
  MIN_REQUIREMENTS,
  WEIGHTS,
  countsSentence,
  emailDraft,
  summaryText,
  whatsappDraft,
} from '../fit/analyze'

/* The report half of /fit. Status always travels as an icon plus a word,
   never as colour alone. */

const STATUS = {
  direct: { word: 'Direct', icon: 'check', tone: 'text-success', wash: 'bg-success/10' },
  transferable: { word: 'Transferable', icon: 'arrowUpRight', tone: 'text-accent-amber', wash: 'bg-accent-amber/12' },
  gap: { word: 'Not yet', icon: 'circleDashed', tone: 'text-muted', wash: 'bg-surface-cream-strong' },
}

const STATUS_MEANING = {
  direct: 'I have shipped it, and the report links to the work.',
  transferable: 'I have shipped the closest neighbour, and it links to that.',
  gap: 'Nothing on this site shows it yet, and the report says so.',
}

const labelOf = (id) => taxonomyById.get(id)?.label ?? id

const trimLine = (line) => line.replace(/^[^\p{L}\p{N}]+/u, '')

function StatusBadge({ status }) {
  const s = STATUS[status]
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-body-strong ${s.wash}`}>
      <Icon name={s.icon} size={13} strokeWidth={2.25} className={s.tone} />
      {s.word}
    </span>
  )
}

/* Circumference of the ring, in SVG user units. */
const RING_RADIUS = 52
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

function ScoreRing({ score, label }) {
  return (
    <div
      role="img"
      aria-label={`Fit score ${score} percent: ${label}`}
      className="relative grid h-[132px] w-[132px] shrink-0 place-items-center"
    >
      <svg viewBox="0 0 120 120" aria-hidden="true" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={RING_RADIUS} fill="none" stroke="var(--color-hairline)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={RING_LENGTH}
          strokeDashoffset={RING_LENGTH * (1 - score / 100)}
          className="fit-ring"
          style={{ '--ring-length': RING_LENGTH }}
        />
      </svg>
      <span className="font-display text-4xl leading-none text-ink">
        {score}
        <span className="text-xl text-primary">%</span>
      </span>
    </div>
  )
}

function CountsRow({ counts }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {['direct', 'transferable', 'gap'].map((status) => (
        <li key={status} className="inline-flex items-center gap-1.5 text-xs text-muted">
          <Icon name={STATUS[status].icon} size={13} strokeWidth={2.25} className={STATUS[status].tone} />
          <span className="font-mono text-body-strong">{counts[status]}</span>
          {STATUS[status].word}
        </li>
      ))}
    </ul>
  )
}

function ReportActions({ report }) {
  const [copyState, setCopyState] = useState('idle')
  const whatsapp = whatsappHref(whatsappDraft(report))

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText(report, { site: SITE }))
      setCopyState('copied')
    } catch {
      setCopyState('blocked')
    }
    setTimeout(() => setCopyState('idle'), 2200)
  }

  const copyLabel = { idle: 'Copy summary', copied: 'Copied', blocked: 'Copy blocked' }[copyState]

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <a href={mailtoHref(emailDraft(report))} className="btn btn-primary px-4 py-2.5 text-sm">
        <Icon name="mail" size={15} />
        Email me about this role
      </a>
      {whatsapp && (
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-ghost px-4 py-2.5 text-sm">
          <Icon name="whatsapp" size={15} />
          WhatsApp
        </a>
      )}
      <button type="button" onClick={copy} className="btn btn-ghost px-4 py-2.5 text-sm">
        <Icon name={copyState === 'copied' ? 'check' : 'copy'} size={15} />
        <span aria-live="polite">{copyLabel}</span>
      </button>
      <button type="button" onClick={() => window.print()} className="btn btn-ghost px-4 py-2.5 text-sm">
        <Icon name="printer" size={15} />
        Save as PDF
      </button>
      <a href={CV_URL} download={profile.cvFile} className="btn btn-ghost px-4 py-2.5 text-sm">
        <Icon name="download" size={15} />
        CV
      </a>
    </div>
  )
}

function RequirementRow({ requirement: r }) {
  let note = null
  if (r.status === 'transferable') note = `From ${r.via.map(labelOf).join(', ')}`
  else if (r.status === 'direct' && r.ids.length > 1) note = `Shown as ${labelOf(r.matched)}`

  /* One column, so the evidence gets the card's full width and a row of
     chips instead of a stack of them. */
  return (
    <li className="flex flex-col gap-2 border-t border-hairline-soft py-4 first:border-t-0 first:pt-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-ink">{r.said}</p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-soft">“{trimLine(r.line)}”</p>
        </div>
        <StatusBadge status={r.status} />
      </div>
      {note && <p className="text-xs text-muted">{note}</p>}
      {r.status === 'gap' ? (
        <p className="text-xs text-muted-soft">Nothing on this site shows it yet.</p>
      ) : (
        <EvidenceChips items={r.evidence} />
      )}
    </li>
  )
}

function RequirementGroup({ title, hint, items }) {
  if (!items.length) return null
  return (
    <section aria-label={title} className="card p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-body text-base font-semibold tracking-normal text-ink">{title}</h3>
        <span className="font-mono text-[11px] text-muted-soft">{items.length}</span>
      </div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      <ul className="mt-2">
        {items.map((r) => (
          <RequirementRow key={r.key} requirement={r} />
        ))}
      </ul>
    </section>
  )
}

function TopProjects({ items }) {
  if (!items.length) return null
  return (
    <section aria-label="Case studies to start with">
      <h3 className="mb-3 font-body text-base font-semibold tracking-normal text-ink">Start with these case studies</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {items.map(({ slug, project, covers }) => (
          <Link
            key={slug}
            to={`/project/${slug}`}
            className="card card-hover group flex h-full flex-col p-4 no-underline"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
                <Icon name={project.icon} size={17} />
              </span>
              {project.metric && (
                <span className="text-right">
                  <span className="block font-display text-lg leading-none text-primary">{project.metric.value}</span>
                  <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-wider text-muted-soft">
                    {project.metric.label}
                  </span>
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-ink">{project.title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              Covers {covers.slice(0, 4).join(', ')}
              {covers.length > 4 ? ` and ${covers.length - 4} more` : ''}
            </p>
            <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-medium text-primary">
              Read the case study
              <Icon name="arrowRight" size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function HowScored({ report }) {
  const read = report.sections.filter((s) => s.kind !== 'ignore')
  const skipped = report.sections.filter((s) => s.kind === 'ignore')

  return (
    <details className="card group p-5 print:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
        How this is scored
        <Icon name="chevronDown" size={15} className="text-muted transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <ul className="mt-4 flex flex-col gap-2.5 text-sm leading-relaxed text-muted">
        <li>
          Each technical requirement is checked against the project tags, case-study stacks, dashboard tech lists, job
          history and certifications on this site. The prose of a write-up never counts as evidence.
        </li>
        <li>
          <span className="font-medium text-body-strong">Direct</span> counts in full,{' '}
          <span className="font-medium text-body-strong">Transferable</span> counts {CREDIT.transferable * 100}%,{' '}
          <span className="font-medium text-body-strong">Not yet</span> counts nothing.
        </li>
        <li>
          Requirements weigh {WEIGHTS.required}, general mentions {WEIGHTS.general}, responsibilities{' '}
          {WEIGHTS.responsibilities} and nice-to-haves {WEIGHTS.nice}. “A or B” counts once, met by whichever I can show.
        </li>
        <li>
          Years of experience, degrees, certifications, languages and soft skills are not scored. Those are better settled
          in a conversation.
        </li>
      </ul>
      {(read.length > 0 || skipped.length > 0 || report.notScored > 0) && (
        <p className="mt-4 border-t border-hairline-soft pt-4 font-mono text-[11px] leading-relaxed text-muted-soft">
          {read.length > 0 && `Read: ${read.map((s) => s.label).join(' · ')}. `}
          {skipped.length > 0 && `Skipped: ${skipped.map((s) => s.label).join(' · ')}. `}
          {report.notScored > 0 &&
            `${report.notScored} degree or certification line${report.notScored === 1 ? '' : 's'} left unscored.`}
        </p>
      )}
    </details>
  )
}

function EmptyReport() {
  return (
    <div className="card flex flex-col items-center gap-4 px-6 py-12 text-center md:py-16">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/12 text-primary">
        <Icon name="target" size={26} />
      </span>
      <h2 className="text-[clamp(1.5rem,1.2rem+1vw,2rem)]">Your report shows up here</h2>
      <p className="max-w-md text-sm leading-relaxed text-muted">
        Paste a job description, or pick a sample. Every technical requirement comes back marked one of three ways:
      </p>
      <ul className="mt-1 flex max-w-md flex-col gap-3 text-left">
        {['direct', 'transferable', 'gap'].map((status) => (
          <li key={status} className="flex items-start gap-3 text-sm text-muted">
            <StatusBadge status={status} />
            <span className="pt-0.5">{STATUS_MEANING[status]}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function NotEnough({ report }) {
  const found = report.requirements.length
  return (
    <div className="card p-6 md:p-8">
      <h2 className="text-[clamp(1.5rem,1.2rem+1vw,2rem)]">Not enough to score yet</h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        {found === 0
          ? 'I have not found a technical requirement in this text yet.'
          : `I have found ${found} technical requirement${found === 1 ? '' : 's'} so far.`}{' '}
        A fair score needs at least {MIN_REQUIREMENTS}, so paste the full description, requirements section included.
      </p>
      {found > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {report.requirements.map((r) => (
            <li key={r.key} className="chip">
              <Icon name={STATUS[r.status].icon} size={12} strokeWidth={2.25} className={STATUS[r.status].tone} />
              {r.said}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function FitReport({ report, hasText }) {
  if (!hasText) return <EmptyReport />
  if (!report.enough) return <NotEnough report={report} />

  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="fit-verdict" className="card overflow-hidden p-5 md:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <ScoreRing score={report.score} label={report.label} />
          <div className="min-w-0">
            <p className="eyebrow mb-1.5">{report.title ? `Read as: ${report.title}` : 'Fit report'}</p>
            <h2 id="fit-verdict" className="text-[clamp(1.6rem,1.2rem+1.4vw,2.25rem)]">
              {report.label}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{countsSentence(report.counts)}</p>
            <CountsRow counts={report.counts} />
          </div>
        </div>
        <div className="mt-5 border-t border-hairline-soft pt-5 print:hidden">
          <ReportActions report={report} />
        </div>
      </section>

      <RequirementGroup title="Core requirements" items={report.core} />
      <RequirementGroup
        title="Nice to have"
        hint="Weighted at about a third of a core requirement."
        items={report.nice}
      />
      <TopProjects items={report.topProjects} />
      <HowScored report={report} />
    </div>
  )
}
