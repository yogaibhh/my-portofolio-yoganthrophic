import { useState } from 'react'
import Icon from './Icon'
import Reveal from './Reveal'
import { profile, socials } from '../data/profile'

const CV_URL = `${import.meta.env.BASE_URL}${profile.cvFile}`

function CopyEmailButton() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="group inline-flex w-full cursor-pointer items-center gap-3 rounded-xl border border-on-primary/25 bg-on-primary/5 px-4 py-3 text-left transition-colors hover:bg-on-primary/12 sm:w-auto"
    >
      <Icon name={copied ? 'check' : 'mail'} size={17} className="shrink-0 text-on-primary/80" />
      <span className="font-mono text-sm text-on-primary">{profile.email}</span>
      <span className="ml-auto pl-2 font-mono text-[10px] uppercase tracking-wider text-on-primary/60">
        {copied ? 'Copied' : 'Copy'}
      </span>
    </button>
  )
}

export default function Contact() {
  return (
    <section id="contact" className="section-pad">
      <div className="shell">
        <Reveal variant="scale">
          <div className="relative isolate grain overflow-hidden rounded-3xl bg-primary px-6 py-14 md:px-14 md:py-20">
            {/* Ambient shapes inside the slab */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-on-primary/10 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-accent-amber/20 blur-3xl"
            />

            <div className="relative z-[2] grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <div>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-on-primary/25 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-on-primary/85">
                  <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-on-primary opacity-70 motion-safe:animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-on-primary" />
                  </span>
                  Available for new roles
                </span>

                <h2 className="text-on-primary mb-4">Let&apos;s build something that ships</h2>

                <p className="max-w-lg text-base leading-relaxed text-on-primary/85 md:text-lg">
                  I&apos;m open to AI/ML engineering, data science, and data analyst roles,
                  remote or hybrid. Send a message and I&apos;ll get back to you within a day or two.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href={`mailto:${profile.email}?subject=Opportunity%20for%20Yoga`}
                    className="btn bg-canvas text-ink hover:bg-surface-soft"
                  >
                    <Icon name="mail" size={17} />
                    Send an email
                  </a>
                  <a
                    href={CV_URL}
                    download={profile.cvFile}
                    className="btn border border-on-primary/30 text-on-primary hover:bg-on-primary/10"
                  >
                    <Icon name="download" size={16} />
                    Download CV
                  </a>
                </div>
              </div>

              {/* Details card */}
              <div className="flex flex-col gap-3 rounded-2xl border border-on-primary/20 bg-on-primary/8 p-5 backdrop-blur-sm">
                <CopyEmailButton />

                <a
                  href={`tel:${profile.phone.replace(/[^+\d]/g, '')}`}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-on-primary/90 transition-colors hover:bg-on-primary/10"
                >
                  <Icon name="phone" size={17} className="shrink-0 text-on-primary/80" />
                  {profile.phone}
                </a>

                <p className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-on-primary/90">
                  <Icon name="pin" size={17} className="shrink-0 text-on-primary/80" />
                  {profile.location} · GMT+7
                </p>

                <div className="mt-1 flex gap-2 border-t border-on-primary/20 pt-4">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target={s.href.startsWith('http') ? '_blank' : undefined}
                      rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      aria-label={s.label}
                      title={s.label}
                      className="grid h-10 w-10 place-items-center rounded-lg border border-on-primary/25 text-on-primary/85 transition-all duration-300 hover:-translate-y-0.5 hover:bg-on-primary/12"
                    >
                      <Icon name={s.icon} size={17} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
