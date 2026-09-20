/* Customer Churn Monitor — telco retention analytics.

   The monitoring companion to the public telco-churn-prediction study:
   7,043 customers, 26.5% churn, best model logistic regression (test ROC-AUC
   0.842 / accuracy 0.806 / precision 0.657 / recall 0.559), drivers being
   tenure, fiber optic and month-to-month contracts. Every number here is
   synthetic and deterministic, held consistent with those margins.

   Presentation comes from the shared dashboard system in ./ui. */

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, Cell, LabelList, AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
} from 'recharts'
import useChartTheme from './ui/chartTheme'
import {
  DashFrame, DashBar, DashBody, Region as Col, Panel, Stat, StatGrid,
  Segment, Status, Meters, Meter,
} from './ui'

/* Tenure cohort × contract matrix (customers n / churned ch). Rows sum to the
   cohort totals and columns to the contract totals (3,875 / 1,473 / 1,695 =
   7,043; churned 1,655 / 166 / 48 = 1,869, so 26.5%), which keeps every filter
   view consistent with the study: 0-6 months ~53% against 49-72 months ~9.5%,
   month-to-month 42.7% against two-year 2.8%. */
const COHORTS = [
  { cohort: '0-6', m2m: { n: 1326, ch: 756 }, one: { n: 98, ch: 18 }, two: { n: 57, ch: 6 } },
  { cohort: '7-12', m2m: { n: 672, ch: 269 }, one: { n: 114, ch: 18 }, two: { n: 57, ch: 5 } },
  { cohort: '13-24', m2m: { n: 716, ch: 266 }, one: { n: 197, ch: 18 }, two: { n: 111, ch: 6 } },
  { cohort: '25-48', m2m: { n: 704, ch: 253 }, one: { n: 427, ch: 38 }, two: { n: 463, ch: 14 } },
  { cohort: '49-72', m2m: { n: 457, ch: 111 }, one: { n: 637, ch: 74 }, two: { n: 1007, ch: 17 } },
]

const SEGMENTS = [
  { value: 'all', label: 'All' },
  { value: 'm2m', label: 'Month-to-month' },
  { value: 'one', label: 'One year' },
  { value: 'two', label: 'Two year' },
]

/* highRisk counts customers scored p(churn) >= 0.60 by the deployed model. */
const SEG_META = {
  all: { label: 'All contracts', highRisk: 1030, auc: 0.842 },
  m2m: { label: 'Month-to-month', highRisk: 908, auc: 0.815 },
  one: { label: 'One year', highRisk: 94, auc: 0.828 },
  two: { label: 'Two year', highRisk: 28, auc: 0.871 },
}

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

/* Holdout test-set metrics, logistic regression baseline at threshold 0.50 */
const MODEL = [
  { label: 'ROC-AUC', value: 0.842 },
  { label: 'Accuracy', value: 0.806 },
  { label: 'Precision', value: 0.657 },
  { label: 'Recall', value: 0.559 },
  { label: 'F1 score', value: 0.604 },
]

/* Segments the model surfaces, with the probability band it scored them into.
   `level` maps to the shared status vocabulary, so each row carries an icon
   and a word rather than a colour on its own. */
const RISK_SEGMENTS = [
  { name: 'M2M · fiber · 0-6 mo', size: 486, band: '0.75-0.95', level: 'critical', word: 'Critical' },
  { name: 'M2M · electronic check', size: 812, band: '0.60-0.80', level: 'serious', word: 'High' },
  { name: 'Fiber · no tech support', size: 1104, band: '0.45-0.65', level: 'warning', word: 'Elevated' },
  { name: 'Senior · paperless billing', size: 571, band: '0.35-0.55', level: 'good', word: 'Watch' },
  { name: 'M2M · DSL · 7-12 mo', size: 348, band: '0.30-0.50', level: 'good', word: 'Watch' },
]

/* 24-month observed churn trend: deterministic mild noise around the 26.5%
   baseline, no Math.random anywhere. */
const TREND = (() => {
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const out = []
  for (let i = 0; i < 24; i++) {
    const y = i < 6 ? 24 : i < 18 ? 25 : 26 // Jul '24 through Jun '26
    const v = 26.4 + Math.sin(i * 0.85) * 1.2 + Math.cos(i * 1.9) * 0.7
    out.push({ month: `${M[(6 + i) % 12]} '${y}`, rate: +v.toFixed(1) })
  }
  return out
})()

/* Churn rate tooltips also carry the counts behind the percentage, so the
   rate is never the only thing a reader can get out of the chart. */
function RateTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="dash-tooltip">
      <div className="dash-tooltip-label">
        {label}
        {d.cohort ? ' months tenure' : ''}
      </div>
      <div className="dash-tooltip-row">
        Churn rate<span className="value">{d.rate.toFixed(1)}%</span>
      </div>
      <div className="dash-tooltip-row">
        Customers
        <span className="value">
          {d.churned.toLocaleString('en-US')} of {d.n.toLocaleString('en-US')}
        </span>
      </div>
    </div>
  )
}

export default function ChurnMonitorDashboard() {
  const t = useChartTheme()
  const [seg, setSeg] = useState('all')

  /* Tenure chart recomputed from the cohort × contract matrix. */
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
    <DashFrame>
      <DashBar
        icon="people"
        title="Customer Churn Monitor"
        subtitle="Telco subscriber base · 7,043 customers · synthetic demo data"
      >
        <span className="dash-panel-note">Contract</span>
        <Segment options={SEGMENTS} value={seg} onChange={setSeg} label="Filter by contract type" />
      </DashBar>

      <DashBody rows="auto minmax(0, 1fr)">
        <StatGrid columns="repeat(4, minmax(0, 1fr))">
          <Stat
            label="Customers"
            value={kpi.n.toLocaleString('en-US')}
            note={seg === 'all' ? 'active subscriber base' : `${kpi.label} · of 7,043 total`}
          />
          <Stat
            label="Churn rate"
            value={`${kpi.rate.toFixed(1)}%`}
            note={`${kpi.churned.toLocaleString('en-US')} customers churned`}
          />
          <Stat
            label="High-risk customers"
            value={kpi.highRisk.toLocaleString('en-US')}
            note="predicted p(churn) ≥ 0.60"
          />
          <Stat
            label="Model ROC-AUC"
            value={kpi.auc.toFixed(3)}
            note={seg === 'all' ? 'Logistic regression · test set' : `Segment AUC · ${kpi.label}`}
          />
        </StatGrid>

        <DashBody columns="minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1fr)" style={{ padding: 0 }}>
          {/* ── Tenure and trend ────────────────────────────── */}
          <Col>
            <Panel title="Churn rate by tenure cohort" note={`${kpi.label} · months`} grow bodyFill>
              <div className="dash-chart" style={{ flex: 1, minHeight: 150 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tenureData} margin={{ top: 18, right: 10, left: -12, bottom: 4 }}>
                    <CartesianGrid {...t.grid} />
                    <XAxis dataKey="cohort" {...t.xAxis} />
                    <YAxis domain={[0, 60]} {...t.yAxis} tickFormatter={(v) => `${v}%`} width={34} />
                    <Tooltip content={<RateTip />} cursor={t.barCursor} />
                    <Bar dataKey="rate" name="Churn rate" fill={t.seriesAt(0)} radius={[4, 4, 0, 0]} barSize={34}>
                      <LabelList
                        dataKey="rate"
                        position="top"
                        fill={t.body}
                        fontSize={11}
                        formatter={(v) => `${v.toFixed(1)}%`}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="dash-note">
                Risk is front-loaded: the first six months churn at several times the rate of the
                longest-tenured cohort.
              </p>
            </Panel>

            <Panel title="Monthly churn trend" note="24 months · all contracts" grow bodyFill>
              <div className="dash-chart" style={{ flex: 1, minHeight: 130 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TREND} margin={{ top: 8, right: 10, left: -12, bottom: 4 }}>
                    <defs>
                      <linearGradient id="churnTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={t.seriesAt(0)} stopOpacity={0.26} />
                        <stop offset="100%" stopColor={t.seriesAt(0)} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...t.grid} />
                    <XAxis dataKey="month" {...t.xAxis} interval={3} />
                    <YAxis domain={[22, 30]} {...t.yAxis} tickFormatter={(v) => `${v}%`} width={34} />
                    <Tooltip
                      content={({ active, payload, label }) =>
                        active && payload?.length ? (
                          <div className="dash-tooltip">
                            <div className="dash-tooltip-label">{label}</div>
                            <div className="dash-tooltip-row">
                              Churn rate<span className="value">{payload[0].value}%</span>
                            </div>
                          </div>
                        ) : null
                      }
                      cursor={t.cursor}
                    />
                    <ReferenceLine
                      y={26.5}
                      stroke={t.muted}
                      strokeWidth={1.5}
                      label={{ value: 'baseline 26.5%', fill: t.muted, fontSize: 11, position: 'insideTopRight' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="rate"
                      name="Churn rate"
                      stroke={t.seriesAt(0)}
                      strokeWidth={2}
                      fill="url(#churnTrend)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </Col>

          {/* ── Drivers ─────────────────────────────────────── */}
          <Col>
            <Panel title="Churn by contract type" note="click a bar to filter" grow bodyFill>
              <div className="dash-chart" style={{ flex: 1, minHeight: 130 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CONTRACTS} layout="vertical" margin={{ top: 4, right: 46, left: 6, bottom: 4 }}>
                    <CartesianGrid stroke={t.grid.stroke} horizontal={false} />
                    <XAxis type="number" domain={[0, 48]} {...t.xAxis} tickFormatter={(v) => `${v}%`} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      {...t.yAxis}
                      width={96}
                      tick={{ fill: t.body, fontSize: 11 }}
                    />
                    <Tooltip content={<RateTip />} cursor={t.barCursor} />
                    <Bar dataKey="rate" name="Churn rate" radius={[0, 4, 4, 0]} barSize={18}>
                      {CONTRACTS.map((c) => (
                        <Cell
                          key={c.id}
                          cursor="pointer"
                          fill={t.seriesAt(0)}
                          fillOpacity={seg === 'all' || seg === c.id ? 1 : 0.3}
                          onClick={() => toggleSeg(c.id)}
                        />
                      ))}
                      <LabelList
                        dataKey="rate"
                        position="right"
                        fill={t.body}
                        fontSize={11}
                        formatter={(v) => `${v.toFixed(1)}%`}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Churn by internet service" note="all contracts" grow bodyFill>
              <div className="dash-chart" style={{ flex: 1, minHeight: 130 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={INTERNET} layout="vertical" margin={{ top: 4, right: 46, left: 6, bottom: 4 }}>
                    <CartesianGrid stroke={t.grid.stroke} horizontal={false} />
                    <XAxis type="number" domain={[0, 48]} {...t.xAxis} tickFormatter={(v) => `${v}%`} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      {...t.yAxis}
                      width={96}
                      tick={{ fill: t.body, fontSize: 11 }}
                    />
                    <Tooltip content={<RateTip />} cursor={t.barCursor} />
                    <Bar
                      dataKey="rate"
                      name="Churn rate"
                      fill={t.seriesAt(0)}
                      radius={[0, 4, 4, 0]}
                      barSize={18}
                    >
                      <LabelList
                        dataKey="rate"
                        position="right"
                        fill={t.body}
                        fontSize={11}
                        formatter={(v) => `${v.toFixed(1)}%`}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </Col>

          {/* ── Model and at-risk segments ──────────────────── */}
          <Col scroll>
            <Panel title="Model performance" note="holdout test set" grow>
              <Meters>
                {MODEL.map((m) => (
                  <Meter
                    key={m.label}
                    label={m.label}
                    value={m.value * 100}
                    color={t.seriesAt(0)}
                    display={m.value.toFixed(3)}
                  />
                ))}
              </Meters>
              <p className="dash-note" style={{ marginTop: 10 }}>
                Logistic regression baseline · 80/20 split · threshold 0.50. It beat both tree
                ensembles on cross-validated and held-out ROC-AUC.
              </p>
            </Panel>

            <Panel title="Top at-risk segments" note="model-scored" grow>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th scope="col">Segment</th>
                    <th scope="col" className="num">Size</th>
                    <th scope="col" className="num">P(churn)</th>
                    <th scope="col">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {RISK_SEGMENTS.map((r) => (
                    <tr key={r.name}>
                      <td>{r.name}</td>
                      <td className="num">{r.size.toLocaleString('en-US')}</td>
                      <td className="num">{r.band}</td>
                      <td>
                        <Status level={r.level}>{r.word}</Status>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </Col>
        </DashBody>
      </DashBody>
    </DashFrame>
  )
}
