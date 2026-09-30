import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import Reveal from './Reveal'
import { roles, generalBrief } from '../data/roles'

/* The homepage's front door for someone hiring: paste a job description and
   go straight to the fit check, or open the one-page brief for a role.

   The text box only hands its contents to /fit. The matcher itself loads
   with that page, so this section adds nothing heavy to the homepage. */

const BRIEFS = [
  { to: '/brief', title: 'General brief', note: generalBrief.headline },
  ...roles.map((r) => ({ to: `/for/${r.id}`, title: `${r.title} brief`, note: r.headline })),
]

export default function Recruiters() {
  const [text, setText] = useState('')
  const navigate = useNavigate()

  const submit = (e) => {
    e.preventDefault()
    if (text.trim()) navigate('/fit', { state: { jd: text } })
  }

  return (
    <section id="recruiters" aria-labelledby="recruiters-title" className="section-pad relative pt-0">
      <div className="shell">
        <Reveal variant="scale">
          <div className="card ring-gradient relative overflow-hidden p-6 md:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
            />

            <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-14">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px w-8 bg-primary/60" aria-hidden="true" />
                  <span className="eyebrow">For recruiters</span>
                </div>
                <h2 id="recruiters-title" className="mb-4 text-[clamp(1.9rem,1.4rem+2vw,2.75rem)]">
                  Hiring? Check the fit in seconds
                </h2>
                <p className="mb-6 max-w-xl text-base leading-relaxed text-muted">
                  Paste a job description and every technical requirement is checked against the work on this site, with a
                  link to the proof and an honest “not yet” where I have nothing to show. It runs in your browser; nothing
                  is sent anywhere.
                </p>

                <form onSubmit={submit} className="flex flex-col gap-3">
                  <label htmlFor="recruiters-jd" className="sr-only">
                    Job description
                  </label>
                  <textarea
                    id="recruiters-jd"
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste the job description here…"
                    className="block w-full resize-y rounded-xl border border-hairline bg-canvas px-4 py-3 text-sm leading-relaxed text-body-strong transition-colors placeholder:text-muted-soft focus:border-primary focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <button
                      type="submit"
                      disabled={!text.trim()}
                      className="btn btn-primary disabled:pointer-events-none disabled:opacity-50"
                    >
                      Check my fit
                      <Icon name="arrowRight" size={16} />
                    </button>
                    <span className="text-xs text-muted-soft">or try a sample:</span>
                    {roles.map((r) => (
                      <Link key={r.id} to={`/fit?sample=${r.sample}`} className="chip chip-interactive no-underline">
                        {r.title}
                      </Link>
                    ))}
                  </div>
                </form>
              </div>

              <div className="flex flex-col lg:border-l lg:border-hairline-soft lg:pl-14">
                <h3 className="mb-2 flex items-center gap-2 font-body text-base font-semibold tracking-normal text-ink">
                  <Icon name="file" size={17} className="text-primary" />
                  30-second briefs
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-muted">
                  One printable page per role: the skills with the work that proves them, the three case studies to read
                  first, availability and contact.
                </p>
                <ul className="flex flex-col divide-y divide-hairline-soft border-y border-hairline-soft">
                  {BRIEFS.map((b) => (
                    <li key={b.to}>
                      <Link to={b.to} className="group flex items-center justify-between gap-3 py-3 no-underline">
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-ink transition-colors group-hover:text-primary">
                            {b.title}
                          </span>
                          <span className="block truncate text-xs text-muted">{b.note}</span>
                        </span>
                        <Icon
                          name="arrowRight"
                          size={15}
                          className="shrink-0 text-muted-soft transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
