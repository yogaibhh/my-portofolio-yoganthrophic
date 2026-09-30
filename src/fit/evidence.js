import taxonomy from '../data/skillTaxonomy'
import { projects, experiences, certifications, education } from '../data/profile'
import caseStudies from '../data/caseStudies'
import dashboards from '../data/dashboards'
import { findMentions } from './terms'

/* Which work on this site proves which skill.

   Only curated, list-shaped fields are read: project titles and tags,
   case-study stacks, job titles, stacks and bullets, dashboard names and
   tech lists, certification names and the degree. Case-study prose and
   descriptions are deliberately not read. They are full of negations
   ("without hiding behind Airflow", "rather than native Slicers and
   PivotTables"), and a matcher that reads them would claim exactly the
   things the write-ups say were not used.

   The Skills section's self-assessed bars are not evidence either; the
   tests check the other way round, that every skill listed there is backed
   by something here. */

const KIND_ORDER = { project: 0, dashboard: 1, experience: 2, certification: 3, education: 4, section: 5 }

const SECTIONS = {
  github: { label: 'Public repositories on GitHub', href: '/#github' },
}

const companyName = (company) => company.replace(/\s*\([^)]*\)\s*$/, '')

function sources() {
  const out = []

  projects.forEach((p) => {
    const stack = (caseStudies[p.slug]?.stack ?? []).flatMap((group) => group.items)
    out.push({
      item: { kind: 'project', key: `project:${p.slug}`, label: p.title, href: `/project/${p.slug}` },
      texts: [p.title, ...p.tags, ...stack],
    })
  })

  experiences.forEach((e, i) => {
    out.push({
      item: {
        kind: 'experience',
        key: `experience:${i}`,
        label: `${e.role} · ${companyName(e.company)}`,
        href: '/#experience',
      },
      texts: [e.role, ...(e.stack ?? []), ...e.bullets],
    })
  })

  dashboards.forEach((d) => {
    out.push({
      item: { kind: 'dashboard', key: `dashboard:${d.id}`, label: d.name, href: `/dashboard/${d.id}` },
      texts: [d.name, ...d.tech],
      /* Every one of them is, before anything else, a dashboard. */
      always: ['dashboards'],
    })
  })

  certifications.forEach((c) => {
    out.push({
      item: { kind: 'certification', key: `certification:${c.name}`, label: `${c.name} (${c.issuer})`, href: '/#education' },
      texts: [c.name],
    })
  })

  out.push({
    item: { kind: 'education', key: 'education', label: `${education.degree}, ${education.school}`, href: '/#education' },
    texts: [education.degree],
  })

  return out
}

/* 'project:<slug>' | 'dashboard:<id>' | 'section:<name>' → an evidence item,
   or null when the reference points at nothing. */
export function resolveRef(ref) {
  const [kind, id] = ref.split(':')
  if (kind === 'project') {
    const p = projects.find((x) => x.slug === id)
    return p ? { kind, key: ref, label: p.title, href: `/project/${id}` } : null
  }
  if (kind === 'dashboard') {
    const d = dashboards.find((x) => x.id === id)
    return d ? { kind, key: ref, label: d.name, href: `/dashboard/${id}` } : null
  }
  if (kind === 'section' && SECTIONS[id]) return { kind, key: ref, ...SECTIONS[id] }
  return null
}

let index = null

export function evidenceIndex() {
  if (index) return index
  const map = new Map()

  const add = (skillId, item) => {
    const list = map.get(skillId) ?? []
    if (!list.some((e) => e.key === item.key)) list.push(item)
    map.set(skillId, list)
  }

  for (const { item, texts, always = [] } of sources()) {
    for (const text of texts) {
      for (const mention of findMentions(text)) add(mention.id, { ...item, via: text })
    }
    always.forEach((skillId) => add(skillId, { ...item, via: null }))
  }

  for (const entry of taxonomy) {
    for (const ref of entry.evidence ?? []) {
      const item = resolveRef(ref)
      if (item) add(entry.id, { ...item, via: null })
    }
  }

  /* PostgreSQL work is SQL work: pass evidence along `implies` until
     nothing changes. The graph is small and acyclic in practice, and the
     dedupe in add() stops it growing even if it were not. */
  let changed = true
  while (changed) {
    changed = false
    for (const entry of taxonomy) {
      const own = map.get(entry.id)
      if (!own?.length) continue
      for (const target of entry.implies ?? []) {
        const before = map.get(target)?.length ?? 0
        own.forEach((item) => add(target, item))
        if ((map.get(target)?.length ?? 0) !== before) changed = true
      }
    }
  }

  /* Case studies first, then dashboards, then job history. Sort is stable,
     so within a kind the order of the data files is kept. */
  map.forEach((list) => list.sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]))

  index = map
  return map
}

export function evidenceFor(skillId) {
  return evidenceIndex().get(skillId) ?? []
}
