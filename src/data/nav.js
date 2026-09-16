export const NAV_HEIGHT = 68

export const sections = [
  { id: 'about', label: 'About', icon: 'spark' },
  { id: 'experience', label: 'Experience', icon: 'briefcase' },
  { id: 'projects', label: 'Projects', icon: 'layers' },
  { id: 'dashboards', label: 'Dashboards', icon: 'chart' },
  { id: 'skills', label: 'Skills', icon: 'code' },
  { id: 'github', label: 'GitHub', icon: 'repo' },
  { id: 'education', label: 'Education', icon: 'book' },
  { id: 'contact', label: 'Contact', icon: 'mail' },
]

/* Links shown in the desktop bar — the rest stay reachable via ⌘K and mobile menu */
export const primaryNav = sections.filter((s) =>
  ['about', 'experience', 'projects', 'dashboards', 'skills'].includes(s.id)
)

export function scrollToId(id) {
  if (id === 'hero' || id === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT - 8
  window.scrollTo({ top, behavior: 'smooth' })
}
