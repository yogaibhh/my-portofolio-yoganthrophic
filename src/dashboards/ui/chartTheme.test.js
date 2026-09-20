import { describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import useTheme from '../../hooks/useTheme'
import useChartTheme, { STATUS, SEVERITY, SEVERITY_ORDER, severityColor } from './chartTheme'

/* The palette's colourblind safety comes from the slot order, so these tests
   guard the rules the demos were written against rather than the hexes
   themselves. */

/* The theme lives in a module-level store that is seeded once at import,
   so switching it means going through the same setter the toggle uses
   rather than poking the attribute. */
function themeFor(mode) {
  const { result: theme } = renderHook(() => useTheme())
  act(() => theme.current.setTheme(mode))
  const { result } = renderHook(() => useChartTheme())
  return result.current
}

describe.each(['light', 'dark'])('chart theme (%s)', (mode) => {
  it('assigns the first eight slots in a fixed order', () => {
    const t = themeFor(mode)
    const first = Array.from({ length: 8 }, (_, i) => t.seriesAt(i))
    expect(new Set(first).size).toBe(8)
    expect(first).toEqual(t.series.slice(0, 8))
  })

  it('wraps rather than inventing a ninth hue', () => {
    const t = themeFor(mode)
    expect(t.seriesAt(8)).toBe(t.seriesAt(0))
    expect(t.seriesAt(13)).toBe(t.seriesAt(5))
  })

  it('never hands a status colour out as a series colour', () => {
    const t = themeFor(mode)
    const statuses = new Set(Object.values(STATUS).map((c) => c.toLowerCase()))
    t.series.forEach((c) => expect(statuses.has(c.toLowerCase())).toBe(false))
  })

  it('draws ordinal steps from the single sequential hue', () => {
    const t = themeFor(mode)
    const steps = [0, 1, 2].map((i) => t.ordinalAt(i, 3))
    expect(new Set(steps).size).toBe(3)
    steps.forEach((s) => expect(t.sequential).toContain(s))
  })

  it('keeps the ordinal ramp clear of the lightest sequential step', () => {
    /* The step nearest the surface has to stay readable, so ordinal use
       starts one step in. */
    const t = themeFor(mode)
    expect(t.ordinalAt(0, 4)).not.toBe(t.sequential[0])
  })

  it('reports the mode it was asked for', () => {
    expect(themeFor(mode).dark).toBe(mode === 'dark')
  })
})

describe('severity vocabulary', () => {
  it('maps every level to a status colour', () => {
    SEVERITY_ORDER.forEach((key) => {
      expect(SEVERITY[key], `${key} missing`).toBeTruthy()
      expect(SEVERITY[key].label, `${key} label`).toBeTruthy()
      expect(STATUS[SEVERITY[key].level], `${key} level`).toBeTruthy()
      expect(severityColor(key)).toBe(STATUS[SEVERITY[key].level])
    })
  })

  it('falls back to a defined colour for an unknown level', () => {
    expect(severityColor('not-a-level')).toBe(STATUS.good)
  })
})
