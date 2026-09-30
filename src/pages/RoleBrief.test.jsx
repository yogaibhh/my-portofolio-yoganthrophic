import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import RoleBrief from './RoleBrief'
import { roles, generalBrief } from '../data/roles'

/* A brief is the link that goes out with an application. It has to open on
   the right role, send the reader to the right case studies, and back every
   skill it lists with something to click. */

function renderAt(entry) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/brief" element={<RoleBrief />} />
        <Route path="/for/:role" element={<RoleBrief />} />
      </Routes>
    </MemoryRouter>,
  )
}

const hrefs = () => screen.getAllByRole('link').map((a) => a.getAttribute('href'))

describe('Recruiter briefs', () => {
  it.each(roles.map((r) => [r.title, r]))('opens the %s brief on its own case studies', (_, role) => {
    renderAt(`/for/${role.id}`)
    expect(screen.getByText(role.headline)).toBeInTheDocument()
    role.projects.forEach((slug) => expect(hrefs()).toContain(`/project/${slug}`))
  })

  it('serves the general brief at /brief', () => {
    renderAt('/brief')
    expect(screen.getByText('30-second brief')).toBeInTheDocument()
    generalBrief.projects.forEach((slug) => expect(hrefs()).toContain(`/project/${slug}`))
  })

  it('backs every skill it lists with a link to the work', () => {
    const role = roles[0]
    renderAt(`/for/${role.id}`)
    const skills = screen.getByRole('region', { name: /skills, with the work that proves them/i })
    const rows = [...skills.querySelector('ul').children]
    expect(rows).toHaveLength(role.focusSkills.length)
    rows.forEach((row) => expect(within(row).getAllByRole('link').length).toBeGreaterThan(0))
  })

  it('says so when the role does not exist', () => {
    renderAt('/for/astronaut')
    expect(screen.getByText("That brief isn't here")).toBeInTheDocument()
  })
})
