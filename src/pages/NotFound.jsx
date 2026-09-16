import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[80svh] items-center overflow-hidden pt-[68px]">
      <div className="aurora" aria-hidden="true" />
      <div className="grid-bg" aria-hidden="true" />

      <div className="shell relative z-[1] py-20 text-center">
        <p className="eyebrow mb-4">Error 404</p>
        <h1 className="mb-5">
          This page went <span className="text-gradient">off the map</span>
        </h1>
        <p className="mx-auto mb-9 max-w-md text-base leading-relaxed text-muted md:text-lg">
          The link is broken or the page was moved. Everything else is still one scroll away.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn btn-primary no-underline">
            <Icon name="arrowLeft" size={16} />
            Back to the portfolio
          </Link>
          <a
            href="https://github.com/yogaibhh"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            <Icon name="github" size={16} />
            Browse GitHub instead
          </a>
        </div>
      </div>
    </section>
  )
}
