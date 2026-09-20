import { describe, it, expect } from 'vitest'
import { projects, projectCategories, experiences, skillGroups } from './profile'
import caseStudies from './caseStudies'
import dashboards from './dashboards'
import { demos } from '../dashboards/demoRegistry'

/* The content is the product here. A slug that drifts from its case-study
   key does not throw, it just quietly serves a project page with no story on
   it, and nobody notices until a recruiter is already reading it. These
   tests are the thing that notices. */

describe('projects', () => {
  it('gives every project a URL-safe slug', () => {
    projects.forEach((p) => {
      expect(p.slug, `${p.title} has no slug`).toBeTruthy()
      expect(p.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    })
  })

  it('keeps slugs unique, so no project shadows another', () => {
    const slugs = projects.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('only uses categories the filter bar offers', () => {
    projects.forEach((p) => {
      expect(projectCategories).toContain(p.category)
    })
  })

  it('carries the fields a card renders', () => {
    projects.forEach((p) => {
      expect(p.title, 'title').toBeTruthy()
      expect(p.blurb, `${p.title} blurb`).toBeTruthy()
      expect(p.description, `${p.title} description`).toBeTruthy()
      expect(p.tags.length, `${p.title} tags`).toBeGreaterThan(0)
      expect(p.icon, `${p.title} icon`).toBeTruthy()
    })
  })
})

describe('case studies', () => {
  it('maps every key onto a real project', () => {
    const slugs = new Set(projects.map((p) => p.slug))
    Object.keys(caseStudies).forEach((key) => {
      expect(slugs.has(key), `case study "${key}" matches no project slug`).toBe(true)
    })
  })

  it('gives every project a study to link to', () => {
    projects.forEach((p) => {
      expect(caseStudies[p.slug], `${p.title} has no case study`).toBeTruthy()
    })
  })

  it('fills the sections the page renders', () => {
    Object.entries(caseStudies).forEach(([slug, study]) => {
      expect(study.tagline, `${slug} tagline`).toBeTruthy()
      expect(study.challenge, `${slug} challenge`).toBeTruthy()
      expect(study.context.length, `${slug} context`).toBeGreaterThan(0)
      expect(study.approach.length, `${slug} approach`).toBeGreaterThan(1)
      expect(study.results.length, `${slug} results`).toBeGreaterThan(2)
      expect(study.lessons.length, `${slug} lessons`).toBeGreaterThan(0)
      expect(study.stack.length, `${slug} stack`).toBeGreaterThan(0)

      study.approach.forEach((step) => {
        expect(step.title, `${slug} approach step title`).toBeTruthy()
        expect(step.body, `${slug} approach step body`).toBeTruthy()
      })
      study.results.forEach((r) => {
        expect(r.value, `${slug} result value`).toBeTruthy()
        expect(r.label, `${slug} result label`).toBeTruthy()
      })
    })
  })

  /* The published page must never advertise its own gaps. An unmeasured
     figure belongs in `pendingMetric`, which only renders on the dev server. */
  it('keeps placeholder wording out of anything that ships', () => {
    const placeholder = /\b(tbd|todo|to be filled|fill in|coming soon|lorem|xxx)\b/i
    Object.entries(caseStudies).forEach(([slug, study]) => {
      const published = [
        study.tagline,
        study.challenge,
        ...study.context,
        ...study.approach.flatMap((a) => [a.title, a.body]),
        ...study.results.flatMap((r) => [String(r.value), r.label, r.note ?? '']),
        ...study.lessons,
      ]
      published.forEach((text) => {
        expect(placeholder.test(text), `${slug} publishes placeholder text: "${text}"`).toBe(false)
      })
    })
  })

  it('does not leave a results tile marked as needing input', () => {
    Object.entries(caseStudies).forEach(([slug, study]) => {
      study.results.forEach((r) => {
        expect(r.needsInput, `${slug} still ships a needsInput result`).toBeFalsy()
      })
    })
  })

  it('credits work built on somebody else&apos;s project', () => {
    /* Hermes Agent is Nous Research's framework; the study covers deploying
       it. If that credit ever disappears the page starts reading as an
       authorship claim. */
    const hermes = caseStudies['hermes-agent']
    expect(hermes.credit).toBeTruthy()
    expect(hermes.credit.href).toMatch(/^https:\/\//)
    expect(hermes.credit.body).toMatch(/Nous Research/i)
  })

  it('points every external link at an absolute https URL', () => {
    Object.entries(caseStudies).forEach(([slug, study]) => {
      ;(study.links ?? []).forEach((l) => {
        expect(l.href, `${slug} link href`).toMatch(/^https:\/\//)
        expect(l.label, `${slug} link label`).toBeTruthy()
      })
    })
  })
})

describe('dashboards', () => {
  it('registers a live demo for every dashboard', () => {
    dashboards.forEach((d) => {
      expect(demos[d.id], `${d.name} has no demo registered`).toBeTruthy()
    })
  })

  it('has metadata for every registered demo', () => {
    const ids = new Set(dashboards.map((d) => d.id))
    Object.keys(demos).forEach((id) => {
      expect(ids.has(id), `demo "${id}" has no dashboard entry`).toBe(true)
    })
  })

  it('keeps ids unique and URL-safe', () => {
    const ids = dashboards.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/))
  })

  it('describes a pipeline for each one', () => {
    dashboards.forEach((d) => {
      expect(d.description, `${d.name} description`).toBeTruthy()
      expect(d.tech.length, `${d.name} tech`).toBeGreaterThan(0)
      expect(d.pipeline.length, `${d.name} pipeline`).toBeGreaterThan(1)
    })
  })
})

describe('the rest of the CV content', () => {
  it('orders experience newest first', () => {
    expect(experiences[0].current).toBe(true)
  })

  it('keeps skill levels inside the bar they are drawn on', () => {
    skillGroups.forEach((group) => {
      group.skills.forEach((s) => {
        expect(s.level, `${s.name} level`).toBeGreaterThan(0)
        expect(s.level, `${s.name} level`).toBeLessThanOrEqual(100)
      })
    })
  })
})
