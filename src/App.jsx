import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { scrollToId } from './data/nav'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollProgress from './components/ScrollProgress'
import BackToTop from './components/BackToTop'
import CommandPalette from './components/CommandPalette'
import PageTransition from './components/PageTransition'
import Home from './pages/Home'
import DashboardDetail from './pages/DashboardDetail'
import ProjectDetail from './pages/ProjectDetail'
import NotFound from './pages/NotFound'

/* Land at the top on every route change. Without this, opening a dashboard
   from halfway down the homepage drops you halfway down the detail page.
   A hash means "take me to that section" instead, which is how the
   case-study breadcrumb gets back to the projects grid. */
function ScrollToTopOnNavigate() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }
    /* Two frames: one for the route swap, one for layout to settle. */
    const id = hash.slice(1)
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => scrollToId(id)),
    )
    return () => cancelAnimationFrame(raf)
  }, [pathname, hash])

  return null
}

/* The site used HashRouter until the build started emitting a static file per
   route. Anything shared back then looks like /#/dashboard/x, so those links
   are rewritten to the real path instead of landing on the homepage. */
function LegacyHashRedirect() {
  const navigate = useNavigate()

  useEffect(() => {
    const hash = window.location.hash
    if (hash.startsWith('#/') && hash.length > 2) {
      navigate(hash.slice(1), { replace: true })
    }
  }, [navigate])

  return null
}

function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false)

  const closePalette = useCallback(() => setPaletteOpen(false), [])

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
      // "/" opens search too, but not while the visitor is typing somewhere
      if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(e.target.tagName) && !e.target.isContentEditable) {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-canvas">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <ScrollToTopOnNavigate />
      <LegacyHashRedirect />
      <Navbar onOpenPalette={() => setPaletteOpen(true)} />
      <ScrollProgress />

      <main id="main">
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard/:id" element={<DashboardDetail />} />
            <Route path="/project/:slug" element={<ProjectDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </main>

      <Footer />
      <BackToTop />
      {paletteOpen && <CommandPalette onClose={closePalette} />}
    </div>
  )
}

export default function App() {
  /* GitHub Pages serves this project from a sub-path, and the build writes a
     real HTML file at every route, so clean URLs work on a hard refresh. */
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppShell />
    </BrowserRouter>
  )
}
