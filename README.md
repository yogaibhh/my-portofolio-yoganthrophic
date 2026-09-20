# Muhamad Yoga Ibrahim — Portfolio

Personal portfolio for an AI Engineer / Data Scientist / Data Analyst, built with
React 19, Vite and Tailwind CSS v4. It ships nine interactive dashboard
recreations that run live in the browser on synthetic data, and a written case
study behind every project.

**Live:** https://yogaibhh.github.io/my-portofolio-yoganthrophic/

---

## Highlights

- **Case studies, not just cards.** Every project has its own page at
  `/project/<slug>`: the problem, the approach step by step, the numbers, the
  findings, and what I took from it.
- **Nine live dashboards** (Recharts + Leaflet), lazy-loaded when their section
  scrolls into view, each with a detail page of its own.
- **One dashboard design system.** All nine demos are built from the same
  primitives and the same theme-aware tokens, so they read as one body of work
  rather than nine unrelated screenshots.
- **Light and dark themes.** A warm "linen" palette and a deep "ink" palette
  driven by the same CSS custom properties, including inside the dashboards.
  The choice is remembered and stamped before first paint, so there is no flash
  of the wrong palette.
- **Command palette** (`⌘K` / `Ctrl+K`, or `/`): fuzzy jump to any section,
  project or dashboard, copy the email, download the CV, flip the theme.
- **Real URLs with real metadata.** The build writes a static HTML file per
  route with its own title, description and Open Graph tags, so deep links
  survive a refresh and link previews are correct.
- **Live GitHub activity**: contribution calendar and latest repositories from
  the GitHub API, cached per browser session to stay inside the unauthenticated
  rate limit.
- **Motion with restraint.** Scroll reveals, count-ups, cursor spotlights, card
  tilt and a route transition, all switched off under `prefers-reduced-motion`.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (`@theme` tokens + cascade layers) |
| Routing | React Router 7 (`BrowserRouter`, one static file per route) |
| Charts | Recharts |
| Maps | Leaflet + React Leaflet, OpenStreetMap tiles |

## Getting started

```bash
npm install
npm run dev
```

The dev server prints a URL that already includes the `/my-portofolio-yoganthrophic/`
base path. Open that one, not bare `localhost`.

Other scripts:

```bash
npm run build     # production bundle into dist/, then the per-route HTML pass
npm run preview   # serve the built bundle locally
npm run lint      # eslint across the repo
```

## Project structure

```
src/
  components/      Section components + shared UI (Icon, Reveal, SectionHeading…)
  pages/           Home, ProjectDetail, DashboardDetail, NotFound
  dashboards/
    ui/            The dashboard design system: tokens, primitives, chart theme
    *.jsx          The nine live demos, all built on ui/
    data.js        Synthetic data for the demos that share it
  data/
    profile.js     ← bio, roles, stats, experience, projects, skills, education
    caseStudies.js ← the long-form write-up behind each project, keyed by slug
    dashboards.js  dashboard metadata (name, description, pipeline, tech)
    nav.js         section list + scroll helper
  hooks/           useTheme, useReveal, useInView, useCountUp, useSpotlight,
                   useTilt, useDocumentHead
  index.css        design tokens, base layer, component classes, motion
scripts/
  postbuild.mjs    writes one HTML file per route, plus 404.html and sitemap.xml
```

## Updating the content

Almost everything a recruiter reads comes from two files:

- [`src/data/profile.js`](src/data/profile.js) for bio, roles, stats, experience,
  projects, skills, education, certifications, awards and social links.
- [`src/data/caseStudies.js`](src/data/caseStudies.js) for the long-form study
  behind each project, keyed by the `slug` on that project.

Components only handle presentation, so adding a job or a project is a one-file
edit. A project without a case-study entry still renders its card and a short
detail page; it just has no long-form sections.

Anything in a case study that still needs a real measurement is marked
`needsInput: true`, which renders a visible "needs a real figure" note on the
page so it cannot be forgotten.

The CV is a static file in `public/`. Replace it and update `profile.cvFile` if
the filename changes.

## The dashboard design system

`src/dashboards/ui/` holds everything the nine demos share:

- `system.css` — theme-aware tokens and every primitive (bar, panel, stat tile,
  row, meter, legend, table, map skin). Smallest type is 11px, weights stop at
  600, and no dashboard hardcodes a colour.
- `index.jsx` — the React primitives (`DashFrame`, `Panel`, `Stat`, `Row`,
  `Meter`, `Legend`, `Status`, `Segment`, `MapOverlay`…).
- `chartTheme.js` — one Recharts theme plus the validated categorical palette.
  Both light and dark steps clear the lightness band, chroma floor, adjacent
  colourblind separation and the normal-vision floor against the dashboard
  surfaces. Slot order is the safety mechanism, so slots are assigned in order
  and never cycled past the eighth.
- `icons.jsx` — the line icons the demos use.

Status colours (good / warning / serious / critical) are reserved for state and
never reused as a series colour, and every status renders with an icon and a
word so meaning never rides on hue alone.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which lints, builds,
and force-pushes `dist/` to the `gh-pages` branch, which is the branch GitHub
Pages serves for this repo. No manual step is needed; `gh-pages` holds build
output only.

Routing uses `BrowserRouter`. GitHub Pages has no server-side rewrite, so
`scripts/postbuild.mjs` writes a real `index.html` at every route path after the
bundle is built. That makes a hard refresh on `/project/…` resolve, gives each
route its own metadata for link previews and crawlers, and feeds `sitemap.xml`.
`404.html` is a copy of the app shell, so anything unmatched still lands in the
app and renders the in-app not-found page. Links shared back when the site used
`HashRouter` (`/#/dashboard/…`) are redirected to the real path on load.

## Notes

All dashboard figures are **synthetic sample data for demonstration only**. They
are not real operational data from any employer or client.

The Hermes Agent case study covers deploying and integrating
[Hermes Agent](https://github.com/NousResearch/hermes-agent), which is Nous
Research's open-source project, not mine. The page says so directly.
