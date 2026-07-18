/* Customer Churn Monitor — telco retention analytics.
   Recharts-only monitoring UI (no map). Numbers echo the public telco-churn-prediction
   study: 7,043 customers, churn 26.5%, best model Logistic Regression (test ROC-AUC
   0.842 / acc 0.806 / prec 0.657 / rec 0.559), drivers = tenure, fiber optic,
   month-to-month contracts. All data SYNTHETIC + deterministic (hardcoded arrays
   consistent with those margins). Scoped under .churn-dash, @keyframes at top level. */
import { useState, useMemo } from 'react'
import {
  BarChart, Bar, Cell, LabelList,
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
} from 'recharts'
import './ChurnMonitorDashboard.css'

/* Accent palette (shared visual language with the other dashboards) */
const ROSE = '#f43f5e'
const ORANGE = '#fb923c'
const YELLOW = '#facc15'
const CYAN = '#22d3ee'
const GREEN = '#34d399'
const PURPLE = '#c084fc'

/* ── Tenure cohort × contract matrix (customers n / churned ch). Rows sum to the
   cohort totals, columns to the contract totals (3,875 / 1,473 / 1,695 = 7,043;
   churned 1,655 / 166 / 48 = 1,869 -> 26.5%), so every filter view stays
   consistent with the study's margins: 0-6 mo ~53% vs 49-72 mo ~9.5%,
   month-to-month 42.7% vs two-year 2.8%. ── */
const COHORTS = [
  { cohort: '0-6', m2m: { n: 1326, ch: 756 }, one: { n: 98, ch: 18 }, two: { n: 57, ch: 6 } },
  { cohort: '7-12', m2m: { n: 672, ch: 269 }, one: { n: 114, ch: 18 }, two: { n: 57, ch: 5 } },
  { cohort: '13-24', m2m: { n: 716, ch: 266 }, one: { n: 197, ch: 18 }, two: { n: 111, ch: 6 } },
  { cohort: '25-48', m2m: { n: 704, ch: 253 }, one: { n: 427, ch: 38 }, two: { n: 463, ch: 14 } },
  { cohort: '49-72', m2m: { n: 457, ch: 111 }, one: { n: 637, ch: 74 }, two: { n: 1007, ch: 17 } },
]

/* Segment filter (contract type) + per-segment model stats.
   highRisk = customers scored p(churn) >= 0.60 by the deployed model. */
const SEGMENTS = [
  { id: 'all', label: 'All' },
  { id: 'm2m', label: 'Month-to-month' },
  { id: 'one', label: 'One year' },
  { id: 'two', label: 'Two year' },
]
const SEG_META = {
  all: { label: 'All contracts', highRisk: 1030, auc: 0.842 },
  m2m: { label: 'Month-to-month', highRisk: 908, auc: 0.815 },
  one: { label: 'One year', highRisk: 94, auc: 0.828 },
  two: { label: 'Two year', highRisk: 28, auc: 0.871 },
}

/* Overall churn by contract type and by internet service (study margins) */
const CONTRACTS = [
  { id: 'm2m', name: 'Month-to-month', n: 3875, churned: 1655, rate: 42.7 },
  { id: 'one', name: 'One year', n: 1473, churned: 166, rate: 11.3 },
  { id: 'two', name: 'Two year', n: 1695, churned: 48, rate: 2.8 },
]
const INTERNET = [
  { name: 'Fiber optic', n: 3096, churned: 1297, rate: 41.9 },
  { name: 'DSL', n: 2421, churned: 459, rate: 19.0 },
  { name: 'No internet', n: 1526, churned: 113, rate: 7.4 },
]

/* Holdout test-set metrics — Logistic Regression baseline (threshold 0.50) */
const MODEL = [
  { label: 'ROC-AUC', value: 0.842, color: PURPLE },
  { label: 'Accuracy', value: 0.806, color: CYAN },
  { label: 'Precision', value: 0.657, color: ORANGE },
  { label: 'Recall', value: 0.559, color: ROSE },
  { label: 'F1 score', value: 0.604, color: GREEN },
]

/* Top at-risk segments surfaced by the model (probability band = p(churn) range) */
const RISK_SEGMENTS = [
  { name: 'M2M · fiber · 0-6 mo', size: 486, band: '0.75–0.95', level: 'Critical', color: ROSE },
  { name: 'M2M · electronic check', size: 812, band: '0.60–0.80', level: 'High', color: ORANGE },
  { name: 'Fiber · no tech support', size: 1104, band: '0.45–0.65', level: 'Elevated', color: YELLOW },
  { name: 'Senior · paperless billing', size: 571, band: '0.35–0.55', level: 'Watch', color: CYAN },
  { name: 'M2M · DSL · 7-12 mo', size: 348, band: '0.30–0.50', level: 'Watch', color: CYAN },
]

/* ── 24-month observed churn trend — deterministic mild noise around the 26.5%
   baseline (same closed-form idiom as the NPI trend, no Math.random) ── */
const TREND = (() => {
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const out = []
  for (let i = 0; i < 24; i++) {
    const y = i < 6 ? 24 : i < 18 ? 25 : 26 // Jul '24 -> Jun '26
    const v = 26.4 + Math.sin(i * 0.85) * 1.2 + Math.cos(i * 1.9) * 0.7
    out.push({ month: `${M[(6 + i) % 12]} '${y}`, rate: +v.toFixed(1) })
  }
  return out
})()

/* Shared tooltip for the churn-rate bar charts (rate + churned / cohort size) */
function RateTip({ active, payload, label, color }) {
  if (!active || !payload || !payload.length) return null
  const d = payload[0].payload
  return (
    <div className="churn-tip">
      <div className="t-l">{label}{d.cohort ? ' months tenure' : ''}</div>
      <div className="t-v" style={{ color }}>{d.rate.toFixed(1)}% churn</div>
      <div className="t-m">{d.churned.toLocaleString('en-US')} of {d.n.toLocaleString('en-US')} customers</div>
    </div>
  )
}

export default function ChurnMonitorDashboard() {
  const [seg, setSeg] = useState('all')

  /* tenure chart recomputed from the cohort × contract matrix */
  const tenureData = useMemo(() => {
    const parts = seg === 'all' ? ['m2m', 'one', 'two'] : [seg]
    return COHORTS.map((c) => {
      const n = parts.reduce((a, k) => a + c[k].n, 0)
      const ch = parts.reduce((a, k) => a + c[k].ch, 0)
      return { cohort: c.cohort, n, churned: ch, rate: +((ch / n) * 100).toFixed(1) }
    })
  }, [seg])

  const kpi = useMemo(() => {
    const n = tenureData.reduce((a, d) => a + d.n, 0)
    const churned = tenureData.reduce((a, d) => a + d.churned, 0)
    return { n, churned, rate: (churned / n) * 100, ...SEG_META[seg] }
  }, [tenureData, seg])

  const toggleSeg = (id) => setSeg((p) => (p === id ? 'all' : id))

  return (
    <div className="churn-dash">
      {/* HEADER */}
      <div className="H">
        <h1>
          Customer Churn Monitor
          <span className="sub">Telco subscriber base · 7,043 customers · synthetic demo data</span>
        </h1>
        <div className="hr">
          <div className="live">SCORING LIVE</div>
          <span className="hr-l">Contract</span>
          <div className="seg-chips">
            {SEGMENTS.map((s) => (
              <button
                key={s.id}
                className={`seg-chip${seg === s.id ? ' on' : ''}`}
                onClick={() => setSeg(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="body">
        {/* KPI ROW */}
        <div className="kpis">
          <div className="kpi">
            <span className="k-acc" style={{ background: CYAN }} />
            <div className="k-l">Customers</div>
            <div className="k-v">{kpi.n.toLocaleString('en-US')}</div>
            <div className="k-s">{seg === 'all' ? 'active subscriber base' : `${kpi.label} · of 7,043 total`}</div>
          </div>
          <div className="kpi">
            <span className="k-acc" style={{ background: ROSE }} />
            <div className="k-l">Churn rate</div>
            <div className="k-v" style={{ color: ROSE }}>{kpi.rate.toFixed(1)}%</div>
            <div className="k-s">{kpi.churned.toLocaleString('en-US')} customers churned</div>
          </div>
          <div className="kpi">
            <span className="k-acc" style={{ background: ORANGE }} />
            <div className="k-l">High-risk customers</div>
            <div className="k-v" style={{ color: ORANGE }}>{kpi.highRisk.toLocaleString('en-US')}</div>
            <div className="k-s">predicted p(churn) ≥ 0.60</div>
          </div>
          <div className="kpi">
            <span className="k-acc" style={{ background: PURPLE }} />
            <div className="k-l">Model ROC-AUC</div>
            <div className="k-v" style={{ color: PURPLE }}>{kpi.auc.toFixed(3)}</div>
            <div className="k-s">{seg === 'all' ? 'Logistic Regression · test set' : `segment AUC · ${kpi.label}`}</div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="main">
          {/* COL 1 — tenure + trend */}
          <div className="col">
            <div className="c">
              <div className="ct">Churn rate by tenure cohort <span className="src">{kpi.label} · months</span></div>
              <div className="ch">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tenureData} margin={{ top: 16, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
                    <XAxis dataKey="cohort" tick={{ fill: '#5a6478', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 60]} tick={{ fill: '#5a6478', fontSize: 8 }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} width={34} />
                    <Tooltip content={<RateTip color={ROSE} />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
                    <Bar dataKey="rate" fill={ROSE} fillOpacity={0.88} radius={[4, 4, 0, 0]} barSize={36}>
                      <LabelList dataKey="rate" position="top" fill="#e2e8f0" fontSize={9} formatter={(v) => `${v.toFixed(1)}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="c">
              <div className="ct">Monthly churn trend · 24 mo <span className="src">all contracts</span></div>
              <div className="ch">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TREND} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="churnTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ROSE} stopOpacity={0.45} />
                        <stop offset="100%" stopColor={ROSE} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#5a6478', fontSize: 8 }} interval={3} axisLine={false} tickLine={false} />
                    <YAxis domain={[22, 30]} tick={{ fill: '#5a6478', fontSize: 8 }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} width={34} />
                    <Tooltip
                      contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, fontSize: 10 }}
                      labelStyle={{ color: '#94a3b8' }}
                      itemStyle={{ color: ROSE }}
                      formatter={(v) => [`${v}%`, 'churn']}
                    />
                    <ReferenceLine y={26.5} stroke={GREEN} strokeDasharray="4 4" strokeWidth={1.4}
                      label={{ value: 'baseline 26.5%', fill: GREEN, fontSize: 8, position: 'insideTopRight' }} />
                    <Area type="monotone" dataKey="rate" stroke={ROSE} fill="url(#churnTrend)" strokeWidth={1.8} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* COL 2 — churn drivers */}
          <div className="col">
            <div className="c">
              <div className="ct">Churn by contract type <span className="src">click bar to filter</span></div>
              <div className="ch">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CONTRACTS} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,.05)" horizontal={false} />
                    <XAxis type="number" domain={[0, 48]} tick={{ fill: '#5a6478', fontSize: 8 }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} width={92} />
                    <Tooltip content={<RateTip color={ORANGE} />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
                    <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={18}>
                      {CONTRACTS.map((c) => (
                        <Cell
                          key={c.id}
                          cursor="pointer"
                          fill={ORANGE}
                          fillOpacity={seg === 'all' || seg === c.id ? 0.88 : 0.25}
                          stroke={seg === c.id ? '#e2e8f0' : 'none'}
                          strokeWidth={seg === c.id ? 1 : 0}
                          onClick={() => toggleSeg(c.id)}
                        />
                      ))}
                      <LabelList dataKey="rate" position="right" fill="#e2e8f0" fontSize={9} formatter={(v) => `${v.toFixed(1)}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="c">
              <div className="ct">Churn by internet service <span className="src">all contracts</span></div>
              <div className="ch">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={INTERNET} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,.05)" horizontal={false} />
                    <XAxis type="number" domain={[0, 48]} tick={{ fill: '#5a6478', fontSize: 8 }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} width={92} />
                    <Tooltip content={<RateTip color={CYAN} />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
                    <Bar dataKey="rate" fill={CYAN} fillOpacity={0.88} radius={[0, 4, 4, 0]} barSize={18}>
                      <LabelList dataKey="rate" position="right" fill="#e2e8f0" fontSize={9} formatter={(v) => `${v.toFixed(1)}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* COL 3 — model performance + at-risk segments */}
          <div className="col">
            <div className="c">
              <div className="ct">Model performance <span className="src">holdout test set</span></div>
              <div className="mgrid">
                {MODEL.map((m) => (
                  <div className="mrow" key={m.label}>
                    <span className="m-lab">{m.label}</span>
                    <span className="m-track">
                      <span className="m-fill" style={{ width: `${m.value * 100}%`, background: m.color }} />
                    </span>
                    <span className="m-val" style={{ color: m.color }}>{m.value.toFixed(3)}</span>
                  </div>
                ))}
              </div>
              <div className="m-meta">Logistic Regression baseline · 80/20 split · threshold 0.50</div>
            </div>

            <div className="c">
              <div className="ct">Top at-risk segments <span className="src">model-scored</span></div>
              <div className="rt-wrap">
                <table className="rt">
                  <thead>
                    <tr><th>Segment</th><th>Size</th><th>P(churn)</th><th>Level</th></tr>
                  </thead>
                  <tbody>
                    {RISK_SEGMENTS.map((r) => (
                      <tr key={r.name}>
                        <td className="rt-name">{r.name}</td>
                        <td className="rt-num">{r.size.toLocaleString('en-US')}</td>
                        <td className="rt-num">{r.band}</td>
                        <td><span className="rt-badge" style={{ background: r.color + '1c', color: r.color }}>{r.level}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
