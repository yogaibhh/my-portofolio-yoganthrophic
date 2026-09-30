import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import FitCheck from './FitCheck'

/* The page a recruiter pastes a job description into. What matters is that
   it scores, that every match points at real work, that a gap is shown as a
   gap, and that it is upfront about where the text goes. */

function renderAt(entry) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/fit" element={<FitCheck />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => sessionStorage.clear())

describe('Fit check page', () => {
  it('scores a sample and links the matches to case studies', async () => {
    renderAt('/fit?sample=data-analyst')
    expect(await screen.findByRole('img', { name: /fit score \d+ percent/i })).toBeInTheDocument()

    const proof = screen.getAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('/project/'))
    expect(proof.length).toBeGreaterThan(0)
  })

  it('marks what the portfolio does not show as not yet', async () => {
    renderAt('/fit?sample=ai-engineer')
    expect((await screen.findAllByText('Not yet')).length).toBeGreaterThan(0)
  })

  it('says plainly that the text stays in the browser', () => {
    renderAt('/fit')
    expect(screen.getByText(/nothing you paste is sent anywhere/i)).toBeInTheDocument()
  })

  it('asks for more rather than scoring a scrap of text', async () => {
    renderAt('/fit')
    fireEvent.change(screen.getByRole('textbox', { name: /job description/i }), {
      target: { value: 'We are hiring a friendly person.' },
    })
    expect(await screen.findByText(/not enough to score yet/i)).toBeInTheDocument()
  })
})
