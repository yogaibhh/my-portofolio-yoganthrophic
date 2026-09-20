/* Line icons for the demos.

   These replaced the emoji the dashboards used as icons (🌫️ 📡 ⚠️ 🧪 …),
   which rendered as a different font on every OS and read as clip art next
   to real UI. Stroke icons inherit currentColor, so a status colour or a
   panel colour carries straight through. */

const PATHS = {
  activity: <path d="M3 12h4l3 8 4-16 3 8h4" />,
  alert: (
    <>
      <path d="M12 3L2 20h20L12 3z" />
      <path d="M12 10v4M12 17.5v.01" />
    </>
  ),
  alertOctagon: (
    <>
      <path d="M8 2h8l6 6v8l-6 6H8l-6-6V8z" />
      <path d="M12 8v5M12 16.5v.01" />
    </>
  ),
  check: <path d="M4 12.5l5 5L20 6.5" />,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  cloud: <path d="M6.5 19A4.5 4.5 0 016 10.1a6 6 0 0111.6-1.6A4 4 0 0117.5 19z" />,
  database: (
    <>
      <ellipse cx="12" cy="5.5" rx="8" ry="3" />
      <path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13" />
      <path d="M20 12c0 1.7-3.6 3-8 3s-8-1.3-8-3" />
    </>
  ),
  dot: <circle cx="12" cy="12" r="4" />,
  droplet: <path d="M12 3s6 6.4 6 10.3A6 6 0 016 13.3C6 9.4 12 3 12 3z" />,
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8z" />,
  flame: (
    <>
      <path d="M12 2.5c3.5 4 6 6.7 6 10.5a6 6 0 01-12 0c0-2 1-3.6 2.4-5.2.6 1.3 1.4 2 2.2 2.2C10 8 10.7 5.4 12 2.5z" />
    </>
  ),
  flat: <path d="M4 12h16" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.8 4 5.8 4 9s-1.4 6.2-4 9c-2.6-2.8-4-5.8-4-9s1.4-6.2 4-9z" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </>
  ),
  layers: <path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5" />,
  map: (
    <>
      <path d="M9 3.5L3 6v14.5l6-2.5 6 2.5 6-2.5V3.5L15 6z" />
      <path d="M9 3.5V18M15 6v14.5" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0113 0" />
      <path d="M16 5.2a3.5 3.5 0 010 5.6M17.5 20a6.4 6.4 0 00-1.8-4.5" />
    </>
  ),
  pulse: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M5.6 5.6a9 9 0 000 12.8M18.4 18.4a9 9 0 000-12.8" />
    </>
  ),
  satellite: (
    <>
      <path d="M12 12l-4.5 4.5M9.5 4.5l3 3-5 5-3-3zM14.5 9.5l5 5-3 3-5-5z" />
      <path d="M15.5 4.5a5 5 0 014 4" />
    </>
  ),
  shield: <path d="M12 2.5l8 3v6c0 5-3.4 9.3-8 10.5-4.6-1.2-8-5.5-8-10.5v-6z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
    </>
  ),
  table: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9.5h18M3 15h18M9.5 9.5V20" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </>
  ),
  trendDown: <path d="M3 7l7 7 4-4 7 7M21 17v-5h-5" />,
  trendUp: <path d="M3 17l7-7 4 4 7-7M21 7v5h-5" />,
  waves: <path d="M2 7.5c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0M2 13c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0M2 18.5c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0" />,
  wind: <path d="M3 8h10a3 3 0 10-3-3M3 16h13a3 3 0 11-3 3M3 12h16" />,
  zap: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
}

export function DashIcon({ name, size = 14, className = '', ...rest }) {
  const path = PATHS[name]
  if (!path) return null

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ flexShrink: 0, display: 'block' }}
      {...rest}
    >
      {path}
    </svg>
  )
}

export default DashIcon
