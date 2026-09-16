# Muhamad Yoga Ibrahim — Portfolio

Personal portfolio for an AI Engineer / Data Scientist / Data Analyst, built with
React 19, Vite and Tailwind CSS v4. It ships nine interactive dashboard recreations
that run live in the browser on synthetic data.

**Live:** https://yogaibhh.github.io/my-portofolio-yoganthrophic/

---

## Highlights

- **Light & dark themes** — a warm "linen" palette and a deep "ink" palette, both
  driven by the same CSS custom properties. The visitor's choice is remembered and
  stamped before first paint, so there is no flash of the wrong palette.
- **Command palette (`⌘K` / `Ctrl+K`, or `/`)** — fuzzy jump to any section or
  dashboard, copy the email, download the CV, flip the theme.
- **Live dashboards** — nine React dashboards (Recharts + Leaflet) lazy-loaded only
  when their section scrolls into view, each with its own detail page.
- **Live GitHub activity** — contribution calendar and latest repositories pulled
  from the GitHub API, cached per browser session to stay well inside the
  unauthenticated rate limit.
- **Motion with restraint** — scroll reveals, count-ups, cursor spotlights and a
  tech marquee, all disabled under `prefers-reduced-motion`.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (`@theme` tokens + cascade layers) |
| Routing | React Router 7 (`HashRouter`, for GitHub Pages) |
| Charts | Recharts |
| Maps | Leaflet + React Leaflet, OpenStreetMap tiles |

## Getting started

```bash
npm install
npm run dev
```

The dev server prints a URL that already includes the `/my-portofolio-yoganthrophic/`
base path — open that one, not bare `localhost`.

Other scripts:

```bash
npm run build     # production bundle into dist/
npm run preview   # serve the built bundle locally
npm run lint      # eslint across the repo
```

## Project structure

```
src/
  components/      Section components + shared UI (Icon, Reveal, SectionHeading…)
  pages/           Home, DashboardDetail, NotFound
  dashboards/      The nine live dashboard demos, each with scoped CSS
  data/
    profile.js     ← all personal content lives here
    dashboards.js  dashboard metadata (name, description, pipeline, tech)
    nav.js         section list + scroll helper
  hooks/           useTheme, useReveal, useInView, useCountUp, useSpotlight
  index.css        design tokens, base layer, component classes, motion
```

## Updating the content

Almost everything a recruiter reads comes from [`src/data/profile.js`](src/data/profile.js) —
bio, roles, stats, experience, projects, skills, education, certifications, awards
and social links. Components only handle presentation, so adding a job or a project
is a one-file edit.

The CV is a static file in `public/`; replace it and update `profile.cvFile` if the
filename changes.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which lints, builds, and
force-pushes `dist/` to the `gh-pages` branch — the branch GitHub Pages serves for
this repo. No manual step is needed; `gh-pages` holds build output only.

Routing uses `HashRouter` on purpose: GitHub Pages has no server-side rewrite, so a
hard refresh on `/dashboard/…` would otherwise 404.

## Notes

All dashboard figures are **synthetic sample data for demonstration only** — they are
not real operational data from any employer or client.
