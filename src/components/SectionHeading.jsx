import Reveal from './Reveal'

/* Shared section header: monospace eyebrow, display title, optional lede.
   `align="center"` is used by the full-bleed sections. */
export default function SectionHeading({
  eyebrow,
  title,
  lede,
  align = 'left',
  className = '',
  children,
}) {
  const centered = align === 'center'

  return (
    <div
      className={`mb-12 flex flex-col gap-4 ${
        centered ? 'items-center text-center' : 'items-start'
      } ${className}`.trim()}
    >
      {eyebrow && (
        <Reveal className="flex items-center gap-3">
          <span className="h-px w-8 bg-primary/60" aria-hidden="true" />
          <span className="eyebrow">{eyebrow}</span>
          {centered && <span className="h-px w-8 bg-primary/60" aria-hidden="true" />}
        </Reveal>
      )}

      <Reveal as="h2" delay={60}>
        {title}
      </Reveal>

      {lede && (
        <Reveal
          as="p"
          delay={120}
          className={`text-muted text-base md:text-lg leading-relaxed max-w-2xl ${
            centered ? 'mx-auto' : ''
          }`}
        >
          {lede}
        </Reveal>
      )}

      {children}
    </div>
  )
}
