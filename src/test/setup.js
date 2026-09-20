import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

/* jsdom ships neither of the two browser APIs this app reads on mount.

   `matchMedia` is stubbed because useTheme asks the OS for its colour scheme.
   The stub answers "light", and any test that needs dark sets the
   `data-theme` attribute, which wins over the OS anyway.

   IntersectionObserver is deliberately left missing: the reveal hooks already
   fall back to showing their content when the API is absent, so components
   render in their visible state under test, which is the state worth
   asserting on. */

if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}
