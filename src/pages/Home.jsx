import useDocumentHead from '../hooks/useDocumentHead'
import Hero from '../components/Hero'
import TechMarquee from '../components/TechMarquee'
import About from '../components/About'
import Experience from '../components/Experience'
import Projects from '../components/Projects'
import Dashboards from '../components/Dashboards'
import Skills from '../components/Skills'
import GitHub from '../components/GitHub'
import Education from '../components/Education'
import Contact from '../components/Contact'

export default function Home() {
  useDocumentHead({ path: '/' })

  return (
    <>
      <Hero />
      <TechMarquee />
      <About />
      <Experience />
      <Projects />
      <Dashboards />
      <Skills />
      <GitHub />
      <Education />
      <Contact />
    </>
  )
}
