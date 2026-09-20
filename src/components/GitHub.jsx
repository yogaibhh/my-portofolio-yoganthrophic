import { useEffect, useMemo, useState } from 'react'
import Icon from './Icon'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import useSpotlight from '../hooks/useSpotlight'
import { profile } from '../data/profile'

const GH_USER = profile.githubUser
const GH_URL = `https://github.com/${GH_USER}`

/* Full literal class strings so Tailwind's static scanner keeps them */
const LEVEL_CLASSES = [
  'bg-surface-cream-strong',
  'bg-primary/25',
  'bg-primary/50',
  'bg-primary/75',
  'bg-primary',
]

/* Rough GitHub language colours for the repo dots */
const LANG_COLORS = {
  Python: '#3572A5',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Jupyter: '#DA5B0B',
  'Jupyter Notebook': '#DA5B0B',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Dart: '#00B4AB',
  Shell: '#89e051',
  SQL: '#e38c00',
}

/* Cache in sessionStorage so we hit the APIs at most once per browser session
   (GitHub allows 60 unauthenticated requests/hour per IP) */
async function fetchJsonCached(key, url, transform = (d) => d) {
  try {
    const cached = sessionStorage.getItem(key)
    if (cached) return JSON.parse(cached)
  } catch {
    /* storage unavailable — fall through to network */
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = transform(await res.json())
  try {
    sessionStorage.setItem(key, JSON.stringify(data))
  } catch {
    /* quota exceeded — skip caching */
  }
  return data
}

const slimRepos = (data) =>
  data
    .filter((repo) => !repo.fork)
    .slice(0, 6)
    .map((repo) => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      topics: repo.topics ?? [],
      pushedAt: repo.pushed_at,
      url: repo.html_url,
    }))

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

function relativeTime(iso) {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days < 1) return 'today'
  if (days < 7) return rtf.format(-days, 'day')
  if (days < 30) return rtf.format(-Math.round(days / 7), 'week')
  if (days < 365) return rtf.format(-Math.round(days / 30), 'month')
  return rtf.format(-Math.round(days / 365), 'year')
}

function ContributionCalendar({ data }) {
  const { contributions, total } = data

  const weeks = useMemo(() => {
    if (!contributions?.length) return []
    /* Pad the first week so weekdays line up vertically (Sunday on top),
       then chunk the days into columns of 7 */
    const pad = new Date(contributions[0].date + 'T00:00:00').getDay()
    const cells = [...Array(pad).fill(null), ...contributions]
    const out = []
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7))
    return out
  }, [contributions])

  if (!weeks.length) return null

  const lastYear = total?.lastYear ?? contributions.reduce((s, d) => s + d.count, 0)
  const busiest = contributions.reduce((m, d) => (d.count > m.count ? d : m), contributions[0])

  return (
    <div className="card mb-10 p-6">
      <div className="mb-4 flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <p className="text-sm text-body-strong">
          <span className="font-display text-2xl text-ink">{lastYear.toLocaleString()}</span>{' '}
          contributions in the last year
        </p>
        <p className="font-mono text-[11px] text-muted-soft">
          busiest day · {busiest.count} on{' '}
          {new Date(busiest.date + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) =>
                day ? (
                  <div
                    key={day.date}
                    className={`h-[11px] w-[11px] rounded-[2px] transition-transform duration-200 hover:scale-150 ${
                      LEVEL_CLASSES[day.level]
                    }`}
                    title={`${day.count} contribution${day.count === 1 ? '' : 's'} on ${new Date(
                      day.date + 'T00:00:00'
                    ).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}`}
                  />
                ) : (
                  <div key={`pad-${di}`} className="h-[11px] w-[11px]" />
                )
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-1.5 text-xs text-muted-soft">
        Less
        {LEVEL_CLASSES.map((level) => (
          <span key={level} className={`h-[11px] w-[11px] rounded-[2px] ${level}`} />
        ))}
        More
      </div>
    </div>
  )
}

function RepoCard({ repo }) {
  const spotlight = useSpotlight()

  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      {...spotlight}
      className="card card-hover spotlight group flex h-full flex-col gap-3 overflow-hidden p-6"
    >
      <div className="relative flex h-full flex-col">
        <div className="mb-2 flex items-center gap-2">
          <Icon name="repo" size={17} className="shrink-0 text-primary" />
          <h3 className="truncate font-body text-[17px] font-semibold tracking-normal text-ink">
            {repo.name}
          </h3>
          <Icon
            name="external"
            size={13}
            className="ml-auto shrink-0 text-muted-soft opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        </div>

        <p className="mb-4 flex-1 text-sm leading-relaxed text-muted">
          {repo.description || 'No description provided.'}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hairline-soft pt-3 text-xs text-muted">
          {repo.language && (
            <span className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: LANG_COLORS[repo.language] ?? 'var(--color-muted-soft)' }}
                aria-hidden="true"
              />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Icon name="star" size={13} />
            {repo.stars}
          </span>
          {repo.forks > 0 && (
            <span className="flex items-center gap-1">
              <Icon name="fork" size={13} />
              {repo.forks}
            </span>
          )}
          <span className="ml-auto font-mono text-[10px] text-muted-soft">
            {relativeTime(repo.pushedAt)}
          </span>
        </div>
      </div>
    </a>
  )
}

function RepoSkeleton() {
  return (
    <div className="card flex flex-col gap-3 p-6">
      <div className="skeleton h-5 w-2/3 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-5/6 rounded" />
      <div className="skeleton mt-3 h-4 w-1/2 rounded" />
    </div>
  )
}

export default function GitHub() {
  const [repos, setRepos] = useState(null)
  const [reposError, setReposError] = useState(false)
  const [contrib, setContrib] = useState(null)
  const [contribError, setContribError] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetchJsonCached(
      'gh:repos:v2',
      `https://api.github.com/users/${GH_USER}/repos?sort=pushed&direction=desc&per_page=12`,
      slimRepos
    )
      .then((data) => !cancelled && setRepos(data))
      .catch(() => !cancelled && setReposError(true))

    fetchJsonCached('gh:contrib', `https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`)
      .then((data) => !cancelled && setContrib(data))
      .catch(() => !cancelled && setContribError(true))

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section id="github" className="section-pad bg-surface-soft">
      <div className="shell">
        <SectionHeading
          eyebrow="Open source"
          title="What I've been pushing"
          lede="Pulled live from the GitHub API: contribution graph and the six repositories I touched most recently."
        >
          <Reveal delay={160}>
            <a
              href={GH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-canvas px-4 py-2 text-sm font-medium text-body transition-colors hover:border-primary hover:text-primary"
            >
              <Icon name="github" size={17} />@{GH_USER}
              <Icon name="external" size={13} />
            </a>
          </Reveal>
        </SectionHeading>

        {contrib ? (
          <ContributionCalendar data={contrib} />
        ) : (
          !contribError && <div className="skeleton mb-10 h-[170px] rounded-2xl" />
        )}

        <div className="mb-6 flex flex-wrap items-baseline gap-3">
          <h3 className="font-body text-lg font-semibold tracking-normal text-ink">
            Latest repositories
          </h3>
          <span className="font-mono text-xs text-muted-soft">sorted by last push</span>
        </div>

        {reposError ? (
          <div className="card p-8 text-center text-sm text-muted">
            Couldn&apos;t load repositories right now. Browse them directly on{' '}
            <a
              href={GH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline font-medium text-primary"
            >
              GitHub
            </a>
            .
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {repos
              ? repos.map((repo, i) => (
                  <Reveal key={repo.name} delay={i * 60} className="h-full">
                    <RepoCard repo={repo} />
                  </Reveal>
                ))
              : Array.from({ length: 6 }, (_, i) => <RepoSkeleton key={i} />)}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <a
            href={`${GH_URL}?tab=repositories`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            View all on GitHub
            <Icon name="arrowRight" size={15} />
          </a>
        </div>
      </div>
    </section>
  )
}
