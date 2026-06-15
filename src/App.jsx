import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import DashboardDetail from './pages/DashboardDetail'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard/:id" element={<DashboardDetail />} />
      </Routes>
    </HashRouter>
  )
}

export default App
