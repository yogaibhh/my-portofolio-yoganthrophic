/* Recharts tooltip content renderer, styled from the same tokens as the
   panels. Lives in its own module because it is a factory rather than a
   component, and mixing the two in one file breaks fast refresh.

   Tooltips here enhance the chart; they never gate a value. Every number a
   tooltip shows is also reachable from a direct label or the panel's table. */
export function chartTooltip({ format } = {}) {
  return function DashTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
      <div className="dash-tooltip">
        {label != null && <div className="dash-tooltip-label">{label}</div>}
        {payload.map((p) => (
          <div className="dash-tooltip-row" key={p.dataKey ?? p.name}>
            <span className="swatch" style={{ background: p.color ?? p.stroke ?? p.fill }} />
            {p.name}
            <span className="value">{format ? format(p.value, p) : p.value}</span>
          </div>
        ))}
      </div>
    )
  }
}

export default chartTooltip
