/* The list of routes the site publishes, shared by the post-build step and
   its tests.

   It lives apart from postbuild.mjs so the route list can be asserted
   against the content without running a build: a project whose slug drifts
   from its case-study key, or a dashboard with no page, shows up as a failing
   test rather than as a page nobody notices is missing. */

import dashboards from '../src/data/dashboards.js'
import { projects } from '../src/data/profile.js'
import caseStudies from '../src/data/caseStudies.js'

export const SITE = 'https://yogaibhh.github.io/my-portofolio-yoganthrophic'
export const NAME = 'Muhamad Yoga Ibrahim'

/* GitHub Pages serves a directory as `/path/` and 301s the bare form to it,
   so every canonical URL carries the trailing slash the server returns. */
export function canonical(path) {
  return `${SITE}${path === '/' ? '/' : `${path}/`}`
}

export function buildRoutes() {
  return [
    {
      path: '/',
      title: `${NAME} · AI Engineer · Data Scientist · Data Analyst`,
      description:
        'AI Engineer, Data Scientist & Data Analyst in Bogor, Indonesia. Muhamad Yoga Ibrahim builds edge ML models, LLM-integrated tools, dashboards, and data pipelines.',
      priority: '1.0',
    },
    ...projects.map((p) => ({
      path: `/project/${p.slug}`,
      title: `${p.title} · case study · ${NAME}`,
      description: caseStudies[p.slug]?.tagline ?? p.description,
      priority: '0.8',
    })),
    ...dashboards.map((d) => ({
      path: `/dashboard/${d.id}`,
      title: `${d.name} · live dashboard · ${NAME}`,
      description: d.description,
      priority: '0.7',
    })),
  ]
}
