import { useEffect } from 'react'

/* Per-route document head.

   The build also writes a static HTML file per route with these same tags
   baked in (scripts/postbuild.mjs), which is what link previews and
   non-JS crawlers read. This hook keeps the head correct during client-side
   navigation, where no new document is fetched. */

const NAME = 'Muhamad Yoga Ibrahim'
const SITE = 'https://yogaibhh.github.io/my-portofolio-yoganthrophic'
const SITE_NAME = 'Muhamad Yoga Ibrahim · Portfolio'
const DEFAULT_TITLE = 'Muhamad Yoga Ibrahim · AI Engineer · Data Scientist · Data Analyst'
const DEFAULT_DESCRIPTION =
  'AI Engineer, Data Scientist & Data Analyst in Bogor, Indonesia. Muhamad Yoga Ibrahim builds edge ML models, LLM-integrated tools, dashboards, and data pipelines.'

function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    const [, kind, key] = selector.match(/\[(name|property)="([^"]+)"\]/) ?? []
    if (!kind) return
    el.setAttribute(kind, key)
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function useDocumentHead({ title, description, path = '/' } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${NAME}` : DEFAULT_TITLE
    const desc = description || DEFAULT_DESCRIPTION
    /* Pages serves these routes as directories, so the canonical carries the
       trailing slash the server actually returns. */
    const url = `${SITE}${path === '/' ? '/' : `${path}/`}`

    document.title = fullTitle
    setMeta('meta[name="description"]', 'content', desc)
    setMeta('meta[property="og:title"]', 'content', fullTitle)
    setMeta('meta[property="og:description"]', 'content', desc)
    setMeta('meta[property="og:url"]', 'content', url)
    setMeta('meta[property="og:site_name"]', 'content', SITE_NAME)
    setMeta('meta[name="twitter:title"]', 'content', fullTitle)
    setMeta('meta[name="twitter:description"]', 'content', desc)
    setLink('canonical', url)
  }, [title, description, path])
}

export { NAME, SITE, SITE_NAME, DEFAULT_TITLE, DEFAULT_DESCRIPTION }
