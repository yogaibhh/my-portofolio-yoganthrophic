/* Post-build: turn the single-page bundle into one static HTML file per
   route, plus a sitemap.

   Why this exists. GitHub Pages has no server-side rewrite, so a hard refresh
   on /project/telco-churn-prediction would 404 unless a file exists at that
   path. The site used HashRouter to dodge that, at the cost of URLs that no
   crawler indexes separately and no link preview can read.

   Writing a real file per route fixes both: the path resolves on a refresh,
   and each file carries its own title, description and Open Graph tags, which
   is what link previews read since they do not run the page's JavaScript.
   404.html is a copy of the homepage shell, so anything unmatched still lands
   in the app and renders the in-app not-found page. */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

import { buildRoutes, canonical } from './routes.mjs'

/* The shell is trusted build output, but route text comes from the data
   files, so it is escaped before going into an attribute. */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/* Rewrite the head tags that differ per route. Everything else in the shell
   (fonts, theme boot script, icons, JSON-LD) is shared and left alone. */
function renderRoute(shell, { path, title, description }) {
  /* Pages serves a directory as `/path/` and 301s the bare form to it, so
     the canonical and the sitemap point at the URL it actually returns
     rather than at a redirect. */
  const url = canonical(path)
  const safeTitle = escapeHtml(title)
  const safeDesc = escapeHtml(description)

  return shell
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"\s*\/>/,
      `<meta name="description" content="${safeDesc}" />`,
    )
    .replace(
      /<link rel="canonical" href="[^"]*"\s*\/>/,
      `<link rel="canonical" href="${url}" />`,
    )
    .replace(
      /<meta property="og:url" content="[^"]*"\s*\/>/,
      `<meta property="og:url" content="${url}" />`,
    )
    .replace(
      /<meta property="og:title" content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${safeTitle}" />`,
    )
    .replace(
      /<meta property="og:description" content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${safeDesc}" />`,
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*"\s*\/>/,
      `<meta name="twitter:title" content="${safeTitle}" />`,
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*"\s*\/>/,
      `<meta name="twitter:description" content="${safeDesc}" />`,
    )
}

const shell = await readFile(join(dist, 'index.html'), 'utf8')

const routes = buildRoutes()

let written = 0
for (const route of routes) {
  const html = renderRoute(shell, route)

  if (route.path === '/') {
    await writeFile(join(dist, 'index.html'), html)
  } else {
    const dir = join(dist, route.path)
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, 'index.html'), html)
  }
  written++
}

/* Unmatched paths fall back to the app shell, which renders NotFound. */
await writeFile(join(dist, '404.html'), renderRoute(shell, routes[0]))

const today = new Date().toISOString().slice(0, 10)
const urls = routes
  .map(
    (r) =>
      `  <url>\n    <loc>${canonical(r.path)}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${r.priority}</priority>\n  </url>`,
  )
  .join('\n')

await writeFile(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
)

console.log(`postbuild: ${written} route files, 404.html and sitemap.xml written`)
