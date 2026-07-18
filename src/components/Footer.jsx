const quickLinks = [
  { label: 'About', id: 'about' },
  { label: 'Experience', id: 'experience' },
  { label: 'Projects', id: 'projects' },
  { label: 'Skills', id: 'skills' },
  { label: 'Education', id: 'education' },
]

/* Plain href="#about" would overwrite the HashRouter route hash and blank the
   page — scroll manually instead (Footer only renders on Home). */
const goToSection = (id) => (e) => {
  e.preventDefault()
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 64
  window.scrollTo({ top, behavior: 'smooth' })
}

const socials = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/muhamadyogaibra' },
  { label: 'GitHub', href: 'https://github.com/yogaibhh' },
]

export default function Footer() {
  return (
    <footer className="bg-surface-dark py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Brand */}
        <div className="mb-12">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="font-display text-2xl text-on-dark tracking-tight"
          >
            Yoga Ibrahim
          </a>
          <p className="text-on-dark-soft text-sm mt-2 max-w-sm">
            AI Engineer &middot; Data Scientist &middot; Data Analyst. Based in Bogor,
            Indonesia — building ML models, LLM workflows, and data-driven dashboards.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-on-dark-soft/20">
          {/* Quick Links */}
          <div>
            <h4 className="text-on-dark text-sm font-semibold uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={goToSection(link.id)}
                    className="text-on-dark-soft text-sm hover:text-on-dark transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-on-dark text-sm font-semibold uppercase tracking-wider mb-4">
              Social
            </h4>
            <ul className="space-y-2">
              {socials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-on-dark-soft text-sm hover:text-on-dark transition-colors"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-on-dark text-sm font-semibold uppercase tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-2 text-on-dark-soft text-sm">
              <li>yoga.ibh205@gmail.com</li>
              <li>+62 812-9235-8420</li>
              <li>Bogor, Indonesia</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 text-center">
          <p className="text-on-dark-soft text-sm">
            &copy; {new Date().getFullYear()} Muhamad Yoga Ibrahim. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
