import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import GitHub from '../components/GitHub'
import About from '../components/About'
import Experience from '../components/Experience'
import Projects from '../components/Projects'
import Dashboards from '../components/Dashboards'
import Skills from '../components/Skills'
import Education from '../components/Education'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

function Home() {
  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <main>
        <Hero />
        <GitHub />
        <About />
        <Experience />
        <Projects />
        <Dashboards />
        <Skills />
        <Education />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default Home
