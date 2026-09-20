import { describe, it, expect } from 'vitest'
import { buildRoutes, canonical, SITE } from './routes.mjs'
import { projects } from '../src/data/profile.js'
import dashboards from '../src/data/dashboards.js'

/* The build writes one HTML file per route. If a route goes missing, the
   page 404s on a hard refresh and drops out of the sitemap, which is exactly
   the failure the old HashRouter setup was replaced to avoid. */

describe('published routes', () => {
  const routes = buildRoutes()

  it('publishes the homepage, every project and every dashboard', () => {
    expect(routes).toHaveLength(1 + projects.length + dashboards.length)
    expect(routes[0].path).toBe('/')

    const paths = new Set(routes.map((r) => r.path))
    projects.forEach((p) => expect(paths.has(`/project/${p.slug}`)).toBe(true))
    dashboards.forEach((d) => expect(paths.has(`/dashboard/${d.id}`)).toBe(true))
  })

  it('gives each route a distinct title and a description', () => {
    const titles = routes.map((r) => r.title)
    expect(new Set(titles).size).toBe(titles.length)
    routes.forEach((r) => {
      expect(r.description, `${r.path} description`).toBeTruthy()
      expect(r.description.length, `${r.path} description too short`).toBeGreaterThan(40)
    })
  })

  it('keeps titles short enough to survive a search result', () => {
    routes.forEach((r) => {
      expect(r.title.length, `${r.path} title is ${r.title.length} chars`).toBeLessThan(110)
    })
  })

  it('has no duplicate paths', () => {
    const paths = routes.map((r) => r.path)
    expect(new Set(paths).size).toBe(paths.length)
  })
})

describe('canonical URLs', () => {
  it('keeps the root bare', () => {
    expect(canonical('/')).toBe(`${SITE}/`)
  })

  /* Pages 301s `/project/x` to `/project/x/`. A canonical pointing at the
     redirect rather than the destination is a wasted hop and a weak signal. */
  it('gives sub-routes the trailing slash Pages actually serves', () => {
    expect(canonical('/project/hermes-agent')).toBe(`${SITE}/project/hermes-agent/`)
    buildRoutes().forEach((r) => {
      expect(canonical(r.path).endsWith('/')).toBe(true)
      expect(canonical(r.path)).not.toContain('//project')
    })
  })
})
