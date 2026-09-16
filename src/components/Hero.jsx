import { useEffect, useState } from 'react'
import Icon from './Icon'
import Reveal from './Reveal'
import useCountUp from '../hooks/useCountUp'
import { profile, stats, socials } from '../data/profile'
import { scrollToId } from '../data/nav'

const CV_URL = `${import.meta.env.BASE_URL}${profile.cvFile}`

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* Types a role out, holds, deletes, moves to the next one.
   Falls back to plain static text when the visitor prefers reduced motion. */
function RoleTyper({ roles }) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState(roles[0])
  const [phase, setPhase] = useState('hold')
  const [still] = useState(reduceMotion)

  useEffect(() => {
    if (still) return

    const full = roles[index]
    let timer

    if (phase === 'typing') {
      if (text.length < full.length) {
        timer = setTimeout(() => setText(full.slice(0, text.length + 1)), 55)
      } else {
        timer = setTimeout(() => setPhase('hold'), 1900)
      }
    } else if (phase === 'hold') {
      timer = setTimeout(() => setPhase('deleting'), 1900)
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => setText(full.slice(0, text.length - 1)), 28)
      } else {
        timer = setTimeout(() => {
          setIndex((i) => (i + 1) % roles.length)
          setPhase('typing')
        }, 180)
      }
    }

    return () => clearTimeout(timer)
  }, [text, phase, index, roles, still])

  if (still) return <span>{roles[0]}</span>

  return (
    <span className="inline-flex items-center">
      <span>{text}</span>
      <span className="caret h-[0.85em] self-center" aria-hidden="true" />
      <span className="sr-only">{roles.join(', ')}</span>
    </span>
  )
}

function StatBlock({ stat, delay }) {
  const [ref, value] = useCountUp(stat.value)

  return (
    <Reveal
      delay={delay}
      className="group relative flex-1 min-w-[130px] border-l border-hairline pl-4"
    >
      <div ref={ref}>
        <span className="block font-display text-3xl leading-none text-ink md:text-4xl">
          {value}
          <span className="text-primary">{stat.suffix}</span>
        </span>
        <p className="mt-1.5 text-xs leading-snug text-muted">{stat.label}</p>
      </div>
    </Reveal>
  )
}

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate grain flex min-h-[100svh] items-center overflow-hidden pt-[68px]"
    >
      <div className="aurora" aria-hidden="true" />
      <div className="grid-bg" aria-hidden="true" />

      <div className="shell relative z-[2] grid w-full grid-cols-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
        {/* ── Left column ───────────────────────────── */}
        <div className="flex flex-col gap-5">
          <Reveal
            variant="scale"
            className="inline-flex w-fit items-center gap-2.5 rounded-full border border-hairline bg-surface-soft/80 py-1.5 pl-2.5 pr-4 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent-teal opacity-70 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-teal" />
            </span>
            <span className="text-xs font-medium text-body">{profile.availability}</span>
          </Reveal>

          <Reveal delay={70} className="flex items-center gap-3">
            <span className="h-px w-10 bg-primary" aria-hidden="true" />
            <span className="eyebrow">Hello, I&apos;m</span>
          </Reveal>

          <Reveal as="h1" delay={140} className="leading-[0.98]">
            Muhamad Yoga
            <br />
            <span className="text-gradient">Ibrahim</span>
          </Reveal>

          {/* Rotating role line */}
          <Reveal
            delay={210}
            className="flex min-h-[2.5rem] items-center font-display text-[26px] leading-tight tracking-tight text-primary md:text-[34px]"
          >
            <RoleTyper roles={profile.roles} />
          </Reveal>

          <Reveal as="p" delay={280} className="max-w-xl text-base leading-relaxed text-body md:text-lg">
            {profile.summary}
          </Reveal>

          <Reveal delay={350} className="mt-2 flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('projects')
              }}
              className="btn btn-primary"
            >
              Explore my work
              <Icon name="arrowRight" size={16} />
            </a>
            <a href={CV_URL} download={profile.cvFile} className="btn btn-ghost">
              <Icon name="download" size={16} />
              Download CV
            </a>

            <span className="mx-1 hidden h-6 w-px bg-hairline sm:block" aria-hidden="true" />

            <div className="flex items-center gap-1.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={s.label}
                  title={s.label}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-hairline text-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                >
                  <Icon name={s.icon} size={17} />
                </a>
              ))}
            </div>
          </Reveal>

          {/* Stats strip */}
          <div className="mt-8 flex flex-wrap gap-y-6">
            {stats.slice(0, 3).map((stat, i) => (
              <StatBlock key={stat.label} stat={stat} delay={420 + i * 70} />
            ))}
          </div>
        </div>

        {/* ── Right column: live CV preview ──────────── */}
        <Reveal variant="scale" delay={260} className="relative mx-auto w-full max-w-md lg:max-w-none">
          {/* Soft glow behind the card */}
          <div
            aria-hidden="true"
            className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-accent-teal/20 blur-2xl"
          />

          <div className="ring-gradient relative flex aspect-[4/5] flex-col overflow-hidden rounded-2xl border border-hairline bg-surface-card shadow-[var(--shadow-xl)] sm:aspect-square lg:aspect-[4/5]">
            {/* Window chrome */}
            <div className="z-10 flex shrink-0 items-center justify-between gap-3 border-b border-hairline-soft bg-canvas/90 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-error/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                </span>
                <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  Resume
                </span>
              </div>
              <a
                href={CV_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary-active"
              >
                Open full CV
                <Icon name="external" size={12} />
              </a>
            </div>

            <object data={CV_URL} type="application/pdf" className="min-h-0 w-full flex-1">
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-8 text-center">
                <Icon name="file" size={40} className="text-primary" />
                <p className="text-sm text-muted">Inline preview isn&apos;t supported here.</p>
                <a href={CV_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary py-2.5 text-sm">
                  Open CV
                </a>
              </div>
            </object>
          </div>

          {/* Floating credential badges */}
          <div className="float-slow pointer-events-none absolute -left-6 top-[20%] hidden rounded-xl border border-hairline bg-canvas/95 px-3.5 py-2.5 shadow-[var(--shadow-lg)] backdrop-blur-sm xl:block">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Based in</p>
            <p className="text-sm font-medium text-ink">{profile.location}</p>
          </div>

          <div
            className="float-slow pointer-events-none absolute -right-6 bottom-[14%] hidden rounded-xl border border-hairline bg-canvas/95 px-3.5 py-2.5 shadow-[var(--shadow-lg)] backdrop-blur-sm xl:block"
            style={{ animationDelay: '-3s' }}
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Focus</p>
            <p className="text-sm font-medium text-ink">Applied AI · Edge ML</p>
          </div>
        </Reveal>
      </div>

      {/* Scroll hint */}
      <button
        type="button"
        onClick={() => scrollToId('about')}
        aria-label="Scroll to about section"
        className="absolute bottom-6 left-1/2 z-[2] hidden -translate-x-1/2 flex-col items-center gap-2 text-muted-soft transition-colors hover:text-primary cursor-pointer md:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <span className="relative grid h-9 w-[22px] place-items-start justify-center rounded-full border border-hairline pt-1.5">
          <span className="scroll-hint-dot h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
      </button>
    </section>
  )
}
