import { useEffect, useState } from 'react'

const GH_USER = 'yogaibhh'
const GH_URL = `https://github.com/${GH_USER}`

/* Full literal class strings so Tailwind's static scanner picks them up */
const LEVEL_CLASSES = [
  'bg-surface-cream-strong',
  'bg-[#f2cdbd]',
  'bg-[#e3a688]',
  'bg-primary',
  'bg-primary-active',
]

/* Cache in sessionStorage so we hit the APIs at most once per browser
   session (GitHub allows 60 unauthenticated requests/hour per IP) */
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
  if (!contributions?.length) return null

  /* Pad the first week so weekdays align vertically (Sunday on top),
     then chunk the days into columns of 7 */
  const pad = new Date(contributions[0].date + 'T00:00:00').getDay()
  const cells = [...Array(pad).fill(null), ...contributions]
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  return (
    <div className="bg-surface-card rounded-xl p-6 mb-12">
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-[3px] min-w-max">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) =>
                day ? (
                  <div
                    key={day.date}
                    className={`w-[10px] h-[10px] rounded-[2px] ${LEVEL_CLASSES[day.level]}`}
                    title={`${day.count} contribution${day.count === 1 ? '' : 's'} on ${new Date(
                      day.date + 'T00:00:00'
                    ).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  ></div>
                ) : (
                  <div key={`pad-${di}`} className="w-[10px] h-[10px]"></div>
                )
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 text-xs text-muted">
        <span>{total.lastYear} contributions in the last year</span>
        <span className="flex items-center gap-1">
          Less
          {LEVEL_CLASSES.map((level) => (
            <span key={level} className={`w-[10px] h-[10px] rounded-[2px] ${level}`}></span>
          ))}
          More
        </span>
      </div>
    </div>
  )
}

function RepoCard({ repo }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-surface-card rounded-xl p-6 flex flex-col gap-3 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary shrink-0">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
        <h3 className="text-ink text-lg font-body font-semibold truncate">{repo.name}</h3>
      </div>

      <p className="text-muted text-sm leading-relaxed flex-1">
        {repo.description || 'No description provided.'}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted">
        {repo.language && (
          <span className="px-3 py-1 rounded-full bg-canvas font-medium border border-hairline">
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {repo.stars}
        </span>
        <span>{relativeTime(repo.pushedAt)}</span>
      </div>
    </a>
  )
}

function RepoSkeleton() {
  return (
    <div className="bg-surface-card rounded-xl p-6 flex flex-col gap-3 animate-pulse">
      <div className="h-5 w-2/3 rounded bg-surface-cream-strong"></div>
      <div className="h-4 w-full rounded bg-surface-cream-strong"></div>
      <div className="h-4 w-5/6 rounded bg-surface-cream-strong"></div>
      <div className="h-6 w-1/2 rounded-full bg-surface-cream-strong mt-2"></div>
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
      'gh:repos',
      `https://api.github.com/users/${GH_USER}/repos?sort=pushed&direction=desc&per_page=12`,
      slimRepos
    )
      .then((data) => { if (!cancelled) setRepos(data) })
      .catch(() => { if (!cancelled) setReposError(true) })
    fetchJsonCached('gh:contrib', `https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`)
      .then((data) => { if (!cancelled) setContrib(data) })
      .catch(() => { if (!cancelled) setContribError(true) })
    return () => { cancelled = true }
  }, [])

  return (
    <section id="github" className="bg-canvas py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section heading + profile badge */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2>GitHub Activity</h2>
            <div className="w-16 h-[3px] bg-primary mt-4"></div>
          </div>
          <a
            href={GH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-full border border-hairline bg-surface-card text-body text-sm font-medium hover:border-ink hover:text-ink transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            @{GH_USER}
          </a>
        </div>

        {/* Contribution calendar — hidden entirely if its API fails */}
        {contrib ? (
          <ContributionCalendar data={contrib} />
        ) : (
          !contribError && <div className="h-[130px] rounded-xl bg-surface-cream-strong animate-pulse mb-12"></div>
        )}

        {/* Latest repositories, sorted by most recent push */}
        <div className="flex flex-wrap items-baseline gap-3 mb-6">
          <h3 className="text-ink text-xl font-body font-semibold">Latest Repositories</h3>
          <span className="text-muted text-sm">sorted by last push</span>
        </div>

        {reposError ? (
          <div className="bg-surface-card rounded-xl p-8 text-center text-muted text-sm">
            Couldn't load repositories right now — browse them directly on{' '}
            <a
              href={GH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:text-primary-active transition-colors"
            >
              GitHub
            </a>
            .
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos
              ? repos.map((repo) => <RepoCard key={repo.name} repo={repo} />)
              : Array.from({ length: 6 }, (_, i) => <RepoSkeleton key={i} />)}
          </div>
        )}

        {/* View all */}
        <div className="flex justify-center mt-10">
          <a
            href={`${GH_URL}?tab=repositories`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-hairline text-body font-medium hover:border-ink hover:text-ink transition-colors"
          >
            View all on GitHub
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
