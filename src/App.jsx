import { useCallback, useEffect, useState } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollProgress from './components/ScrollProgress'
import BackToTop from './components/BackToTop'
import CommandPalette from './components/CommandPalette'
import Home from './pages/Home'
import DashboardDetail from './pages/DashboardDetail'
import NotFound from './pages/NotFound'

/* Land at the top on every route change — without this, opening a dashboard
   from halfway down the homepage drops you halfway down the detail page. */
function ScrollToTopOnNavigate() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

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
      <Navbar onOpenPalette={() => setPaletteOpen(true)} />
      <ScrollProgress />

      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard/:id" element={<DashboardDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <BackToTop />
      {paletteOpen && <CommandPalette onClose={closePalette} />}
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  )
}
