import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon'
import Reveal from '../components/Reveal'
import FitReport from '../components/FitReport'
import useDocumentHead, { SITE } from '../hooks/useDocumentHead'
import sampleJobs, { getSampleJob } from '../data/sampleJobs'
import { fitCheck } from '../data/roles'
import { profile } from '../data/profile'
import { analyzeJob, MAX_CHARS } from '../fit/analyze'

/* /fit: paste a job description, get a requirement-by-requirement report.

   The text never leaves the browser. It is kept in sessionStorage so a
   refresh does not lose it, which the privacy note on the page says in so
   many words, rather than claiming nothing is stored at all. */

const STORAGE_KEY = 'fit:jd'

function readStored() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

function store(text) {
  try {
    if (text) sessionStorage.setItem(STORAGE_KEY, text)
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* private mode or blocked storage: the text just won't survive a refresh */
  }
}

export default function FitCheck() {
  useDocumentHead({ title: fitCheck.title, description: fitCheck.description, path: '/fit' })

  const location = useLocation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  /* Starting text, in order: handed over by the homepage box, a sample named
     in the URL, or whatever this tab had last. */
  const [text, setText] = useState(
    () => location.state?.jd ?? getSampleJob(params.get('sample'))?.text ?? readStored(),
  )
  const deferred = useDeferredValue(text)
  const report = useMemo(() => analyzeJob(deferred), [deferred])
  const activeSample = sampleJobs.find((s) => s.text === text)?.id ?? null

  /* The handover rides in history state. Drop it once read, so a refresh
     after editing restores the edits rather than the original paste. */
  useEffect(() => {
    if (location.state?.jd) navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
  }, [location, navigate])

  useEffect(() => store(deferred), [deferred])

  const edit = (value) => {
    setText(value.slice(0, MAX_CHARS))
    if (params.has('sample')) setParams({}, { replace: true })
  }

  const pickSample = (sample) => {
    setText(sample.text)
    setParams({ sample: sample.id }, { replace: true })
  }

  const hasText = deferred.trim().length > 0

  return (
    <article className="relative isolate overflow-hidden pt-[68px] print:pt-0">
      <div className="aurora print:hidden" aria-hidden="true" />

      <div className="shell relative z-[1] py-12 md:py-16 print:py-0">
        <Reveal className="mb-8 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-soft print:hidden">
          <Link to="/" className="no-underline transition-colors hover:text-primary">
            Portfolio
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/#recruiters" className="no-underline transition-colors hover:text-primary">
            For recruiters
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-body">Fit check</span>
        </Reveal>

        <header className="mb-10 max-w-3xl print:mb-6">
          <Reveal className="mb-4 flex items-center gap-3 print:hidden">
            <span className="h-px w-8 bg-primary/60" aria-hidden="true" />
            <span className="eyebrow">For recruiters</span>
          </Reveal>
          <Reveal as="h1" className="mb-5 print:mb-2 print:text-4xl">
            Does my work fit <span className="text-gradient">your role?</span>
          </Reveal>
          <Reveal as="p" delay={80} className="text-base leading-relaxed text-muted md:text-lg print:hidden">
            Paste a job description. Every technical requirement in it is checked against the projects, dashboards and
            jobs on this site, each match links to the proof, and anything I have not shown yet is marked as such.
          </Reveal>
          <p className="hidden text-sm text-muted print:block">
            Fit check for {profile.name}, generated at {SITE}/fit/
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10">
          <section aria-label="Job description" className="print:hidden lg:sticky lg:top-24">
            <div className="card p-5 md:p-6">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <label htmlFor="fit-jd" className="text-sm font-semibold text-ink">
                  Job description
                </label>
                <span className="font-mono text-[10px] text-muted-soft">
                  {text.length.toLocaleString('en-US')} / {MAX_CHARS.toLocaleString('en-US')}
                </span>
              </div>

              <textarea
                id="fit-jd"
                value={text}
                onChange={(e) => edit(e.target.value)}
                maxLength={MAX_CHARS}
                rows={14}
                spellCheck={false}
                aria-describedby="fit-privacy"
                placeholder="Paste the job description here, requirements section included…"
                className="block w-full resize-y rounded-xl border border-hairline bg-canvas px-4 py-3 text-sm leading-relaxed text-body-strong transition-colors placeholder:text-muted-soft focus:border-primary focus:outline-none"
              />

              <div className="mt-4">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-soft">Or try a sample</p>
                <div className="flex flex-wrap gap-2">
                  {sampleJobs.map((sample) => {
                    const active = activeSample === sample.id
                    return (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => pickSample(sample)}
                        aria-pressed={active}
                        className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-300 ${
                          active
                            ? 'border-primary bg-primary text-on-primary'
                            : 'border-hairline-soft bg-surface-soft text-body-strong hover:border-primary hover:text-primary'
                        }`}
                      >
                        {sample.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-5 flex items-start gap-2.5 border-t border-hairline-soft pt-4">
                <Icon name="shield" size={16} className="mt-0.5 shrink-0 text-accent-teal" />
                <p id="fit-privacy" className="text-xs leading-relaxed text-muted">
                  Runs in your browser. Nothing you paste is sent anywhere; it is kept in this tab only, so a refresh
                  does not lose it.
                </p>
              </div>

              {text && (
                <button
                  type="button"
                  onClick={() => edit('')}
                  className="mt-3 cursor-pointer text-xs font-medium text-muted underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  Clear the text
                </button>
              )}
            </div>
          </section>

          <section aria-label="Fit report" className="min-w-0">
            {/* One short line for screen readers, rather than re-reading the
                whole report every time the text changes. */}
            <p className="sr-only" role="status">
              {report.enough ? `Fit score ${report.score} percent: ${report.label}.` : ''}
            </p>
            <FitReport report={report} hasText={hasText} />
          </section>
        </div>
      </div>
    </article>
  )
}
