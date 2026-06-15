import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import DashboardDetail from './pages/DashboardDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard/:id" element={<DashboardDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
