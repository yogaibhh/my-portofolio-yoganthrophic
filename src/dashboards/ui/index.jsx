/* Shared building blocks for the nine live demos.

   Every demo is assembled from these, so a panel header, a stat tile or a
   legend looks and behaves the same everywhere. Before this existed each
   dashboard re-invented them with one-letter class names and emoji for
   icons, which is exactly what made nine good demos look like nine
   unrelated screenshots. */

import './system.css'
import { DashIcon } from './icons'

export { DashIcon }

/* ── Shell ─────────────────────────────────────────────────── */

export function DashFrame({ children, style, ...rest }) {
  return (
    <div className="dash" style={style} {...rest}>
      <div className="dash-shell">{children}</div>
    </div>
  )
}

export function DashBar({ icon, title, subtitle, children }) {
  return (
    <header className="dash-bar">
      <div className="dash-bar-id">
        {icon && (
          <span className="dash-bar-mark" aria-hidden="true">
            <DashIcon name={icon} size={15} />
          </span>
        )}
        <div style={{ minWidth: 0 }}>
          <div className="dash-bar-title">{title}</div>
          {subtitle && <div className="dash-bar-sub">{subtitle}</div>}
        </div>
      </div>
      {children && <div className="dash-bar-meta">{children}</div>}
    </header>
  )
}

/* `columns` is a grid-template-columns value; `rows` a grid-template-rows. */
export function DashBody({ columns, rows, children, style }) {
  return (
    <div
      className="dash-body"
      style={{ gridTemplateColumns: columns, gridTemplateRows: rows, ...style }}
    >
      {children}
    </div>
  )
}

export function Region({ scroll = false, children, style, ...rest }) {
  return (
    <div className={`dash-region${scroll ? ' is-scroll' : ''}`} style={style} {...rest}>
      {children}
    </div>
  )
}

/* ── Panel ─────────────────────────────────────────────────── */

export function Panel({ title, note, grow = false, flush = false, bodyFill = false, children, style, ...rest }) {
  return (
    <section
      className={`dash-panel${grow ? ' is-grow' : ''}${flush ? ' is-flush' : ''}`}
      style={style}
      {...rest}
    >
      {(title || note) && (
        <div className="dash-panel-head">
          {title && <h3 className="dash-panel-title">{title}</h3>}
          {note && <span className="dash-panel-note">{note}</span>}
        </div>
      )}
      <div className={`dash-panel-body${flush ? ' is-flush' : ''}${bodyFill ? ' is-fill' : ''}`}>
        {children}
      </div>
    </section>
  )
}

/* ── Numbers ───────────────────────────────────────────────── */

export function StatGrid({ columns, children }) {
  return (
    <div className="dash-stats" style={columns ? { gridTemplateColumns: columns } : undefined}>
      {children}
    </div>
  )
}

export function Stat({ label, value, unit, delta, deltaDir = 'flat', note }) {
  return (
    <div className="dash-stat">
      <div className="dash-stat-label">{label}</div>
      <div className="dash-stat-value">
        {value}
        {unit && <span className="unit">{unit}</span>}
      </div>
      {(delta || note) && (
        <div className="dash-stat-foot">
          {delta && (
            <span className="dash-delta" data-dir={deltaDir}>
              <DashIcon
                name={deltaDir === 'up' ? 'trendUp' : deltaDir === 'down' ? 'trendDown' : 'flat'}
                size={12}
              />
              {delta}
            </span>
          )}
          {note && <span>{note}</span>}
        </div>
      )}
    </div>
  )
}

export function Hero({ value, caption, color }) {
  return (
    <div className="dash-hero">
      <div className="dash-hero-value" style={color ? { color } : undefined}>
        {value}
      </div>
      {caption && <div className="dash-hero-caption">{caption}</div>}
    </div>
  )
}

/* ── Chips & status ────────────────────────────────────────── */

export function Chip({ icon, children, value }) {
  return (
    <span className="dash-chip">
      {icon && <DashIcon name={icon} size={12} />}
      {children}
      {value != null && <span className="num">{value}</span>}
    </span>
  )
}

/* Status never carries meaning by colour alone: icon + label, always. */
const STATUS_ICON = {
  good: 'check',
  warning: 'alert',
  serious: 'alert',
  critical: 'alertOctagon',
}

export function Status({ level = 'good', children }) {
  return (
    <span className="dash-status" data-level={level}>
      <DashIcon name={STATUS_ICON[level] ?? 'dot'} size={12} />
      {children}
    </span>
  )
}

/* ── Controls ──────────────────────────────────────────────── */

export function Segment({ options, value, onChange, label }) {
  return (
    <div className="dash-segment" role="group" aria-label={label}>
      {options.map((o) => {
        const key = typeof o === 'string' ? o : o.value
        const text = typeof o === 'string' ? o : o.label
        return (
          <button
            key={key}
            type="button"
            aria-pressed={value === key}
            onClick={() => onChange(key)}
          >
            {text}
          </button>
        )
      })}
    </div>
  )
}

/* ── Lists ─────────────────────────────────────────────────── */

export function List({ children, style }) {
  return (
    <div className="dash-list" style={style}>
      {children}
    </div>
  )
}

export function Row({ rank, name, sub, value, selected = false, accent, onSelect, children }) {
  return (
    <button
      type="button"
      className="dash-row"
      aria-selected={selected}
      onClick={onSelect}
    >
      {rank != null && (
        <span
          className="dash-row-rank"
          style={accent ? { background: `${accent}22`, color: accent } : undefined}
        >
          {rank}
        </span>
      )}
      <span className="dash-row-main">
        <span className="dash-row-name">{name}</span>
        {sub && <span className="dash-row-sub">{sub}</span>}
      </span>
      {children}
      {value != null && (
        <span className="dash-row-value" style={accent ? { color: accent } : undefined}>
          {value}
        </span>
      )}
    </button>
  )
}

/* ── Meter ─────────────────────────────────────────────────── */

export function Meters({ children }) {
  return <div className="dash-meters">{children}</div>
}

export function Meter({ label, value, max = 100, color, display }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="dash-meter">
      <span className="dash-meter-label">{label}</span>
      <span className="dash-meter-track">
        <span className="dash-meter-fill" style={{ width: `${pct}%`, background: color }} />
      </span>
      <span className="dash-meter-value">{display ?? value}</span>
    </div>
  )
}

/* ── Legend ────────────────────────────────────────────────── */

export function Legend({ items, stacked = false }) {
  return (
    <div className={`dash-legend${stacked ? ' is-stacked' : ''}`}>
      {items.map((it) => (
        <span className="dash-legend-item" key={it.label}>
          <span className="dash-legend-swatch" style={{ background: it.color }} />
          {it.label}
          {it.value != null && (
            <>
              <span className="spacer" />
              <span className="value">{it.value}</span>
            </>
          )}
        </span>
      ))}
    </div>
  )
}

/* ── Table view ────────────────────────────────────────────── */

/* Every chart in these demos has a table twin reachable from the same
   panel, so no value is locked behind a hover. */
export function Table({ columns, rows, caption }) {
  return (
    <table className="dash-table">
      {caption && <caption className="sr-only">{caption}</caption>}
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} className={c.num ? 'num' : undefined} scope="col">
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.key ?? i} aria-selected={r.selected || undefined}>
            {columns.map((c) => (
              <td key={c.key} className={c.num ? 'num' : undefined}>
                {r[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/* ── Map overlay ───────────────────────────────────────────── */

export function MapOverlay({ position = 'bottom-left', title, children }) {
  return (
    <div className={`dash-overlay is-${position}`}>
      {title && <div className="dash-overlay-title">{title}</div>}
      {children}
    </div>
  )
}
