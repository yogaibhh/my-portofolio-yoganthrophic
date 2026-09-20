import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Projects from './Projects'
import { projects } from '../data/profile'

/* The projects grid is the route into every case study, so the thing worth
   testing is that each card actually points somewhere real. */

function renderSection() {
  return render(
    <MemoryRouter>
      <Projects />
    </MemoryRouter>,
  )
}

describe('Projects section', () => {
  it('links every visible card to its case study', () => {
    renderSection()
    const links = screen.getAllByRole('link')
    const hrefs = new Set(links.map((a) => a.getAttribute('href')))

    /* Featured projects are also rendered in the grid below, so checking the
       featured set covers both paths without depending on the collapse
       threshold. */
    projects
      .filter((p) => p.featured)
      .forEach((p) => {
        expect(hrefs.has(`/project/${p.slug}`), `${p.title} is not linked`).toBe(true)
      })

    links.forEach((a) => {
      expect(a.getAttribute('href')).toMatch(/^\/project\/[a-z0-9-]+$/)
    })
  })

  it('shows each featured project with its headline metric', () => {
    renderSection()
    projects
      .filter((p) => p.featured && p.metric)
      .forEach((p) => {
        expect(screen.getAllByText(p.title).length).toBeGreaterThan(0)
        expect(screen.getAllByText(p.metric.value).length).toBeGreaterThan(0)
      })
  })

  it('offers a filter per category, each counting its own projects', () => {
    renderSection()
    const counts = { All: projects.length }
    projects.forEach((p) => {
      counts[p.category] = (counts[p.category] ?? 0) + 1
    })

    Object.entries(counts).forEach(([category, count]) => {
      const button = screen.getByRole('button', { name: new RegExp(`^${category}\\s*${count}$`) })
      expect(button, `${category} filter`).toBeInTheDocument()
    })
  })

  it('marks private work rather than implying a missing repository', () => {
    renderSection()
    const withoutRepo = projects.filter((p) => !p.link)
    if (!withoutRepo.length) return
    expect(screen.getAllByText(/private work/i).length).toBeGreaterThan(0)
  })

  it('says a case study is there to read', () => {
    renderSection()
    const first = screen.getAllByRole('link')[0]
    expect(within(first).getByText(/read the case study/i)).toBeInTheDocument()
  })
})
