const quickLinks = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Education', href: '#education' },
]

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
          <a href="#" className="font-display text-2xl text-on-dark tracking-tight">
            Yoga Ibrahim
          </a>
          <p className="text-on-dark-soft text-sm mt-2 max-w-sm">
            Data Scientist & Analytics Engineer based in Bogor, Indonesia.
            Building data-driven solutions with modern technologies.
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
                <li key={link.href}>
                  <a
                    href={link.href}
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
              <li>+62 8129235842</li>
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
