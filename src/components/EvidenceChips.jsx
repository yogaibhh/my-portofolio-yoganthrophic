import { Link } from 'react-router-dom'
import Icon from './Icon'

/* The proof behind a skill: links to the case studies, dashboards and jobs
   that show it. Shared by the fit report and the recruiter briefs. */

const KIND_ICON = {
  project: 'layers',
  dashboard: 'chart',
  experience: 'briefcase',
  certification: 'award',
  education: 'book',
  section: 'github',
}

function tooltip(via) {
  if (!via) return undefined
  return `Matched on “${via.length > 140 ? `${via.slice(0, 137)}…` : via}”`
}

export default function EvidenceChips({ items, max = 3 }) {
  if (!items?.length) return null
  const shown = items.slice(0, max)
  const more = items.length - shown.length

  return (
    <ul className="flex flex-wrap gap-1.5">
      {shown.map((item) => (
        <li key={item.key} className="min-w-0 max-w-full">
          <Link
            to={item.href}
            title={tooltip(item.via)}
            className="chip chip-interactive max-w-full px-2.5 py-1 text-[11px] no-underline"
          >
            <Icon name={KIND_ICON[item.kind]} size={11} className="shrink-0 text-primary" />
            <span className="truncate">{item.label}</span>
          </Link>
        </li>
      ))}
      {more > 0 && (
        <li className="chip px-2.5 py-1 text-[11px] text-muted-soft">
          +{more} more
        </li>
      )}
    </ul>
  )
}
