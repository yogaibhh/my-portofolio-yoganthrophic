import { techMarquee } from '../data/profile'

/* Infinite ticker. The list is rendered twice and the track slides exactly
   -50%, so the seam lands on an identical frame. Pauses on hover. */
export default function TechMarquee() {
  return (
    <section
      aria-label="Technologies I work with"
      className="relative border-y border-hairline-soft bg-surface-soft/60 py-5"
    >
      <div className="marquee-mask overflow-hidden">
        <div className="marquee-track gap-3" style={{ '--marquee-duration': '48s' }}>
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              className="flex shrink-0 items-center gap-3 pr-3"
              aria-hidden={copy === 1 ? 'true' : undefined}
            >
              {techMarquee.map((tech) => (
                <li
                  key={tech}
                  className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-hairline bg-canvas px-4 py-1.5 text-sm font-medium text-body"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden="true" />
                  {tech}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
