import { useLocation } from 'react-router-dom'

/* Cross-route entrance.

   Keyed on the pathname so React remounts the subtree on every navigation
   and the CSS animation replays. It is deliberately one short fade and rise
   rather than an exit/enter pair: an exit animation delays the new page by
   its own duration, which is the thing that makes SPA transitions feel slow.

   The animation itself lives in index.css under `.page-enter`, where
   prefers-reduced-motion turns it off. */
export default function PageTransition({ children }) {
  const { pathname } = useLocation()

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  )
}
