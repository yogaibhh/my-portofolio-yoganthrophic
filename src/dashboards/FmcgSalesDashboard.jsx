/* FMCG Sales Performance — distributor BI dashboard.

   The interactive web sibling of the author's FMCG Excel dashboard.
   24 months (Jul 2024 to Jun 2026) across 5 categories and 4 Java regions of
   synthetic, deterministic sales (seeded LCG, ~0.9%/month growth, Ramadan and
   Lebaran spikes). Headline KPIs are trailing twelve months; YoY compares the
   last 12 months against the prior 12.

   Presentation comes from the shared dashboard system in ./ui. */

import { useState, useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, Cell, LabelList,
  PieChart, Pie, XAxis, YAxis, Tooltip, Legend as RcLegend,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import useChartTheme from './ui/chartTheme'
import { chartTooltip } from './ui/chartTooltip'
import {
  DashFrame, DashBar, DashBody, Region as Col, Panel, Stat, StatGrid,
  Segment, Legend, Meters, Meter, DashIcon,
} from './ui'

/* Categories carry a fixed palette slot rather than a hex, so colour follows
   the entity and both themes resolve from the same index. */
const CATEGORIES = [
  { id: 'bev', name: 'Beverages', base: 420, price: 8000, basket: 5, slot: 0 },
  { id: 'snk', name: 'Snacks', base: 380, price: 6000, basket: 6, slot: 1 },
  { id: 'pc', name: 'Personal Care', base: 310, price: 25000, basket: 3, slot: 2 },
  { id: 'hh', name: 'Household', base: 260, price: 35000, basket: 2, slot: 3 },
  { id: 'dr', name: 'Dairy', base: 220, price: 15000, basket: 4, slot: 4 },
]

const REGIONS = [
  { id: 'jbd', name: 'Jabodetabek', w: 1.6 },
  { id: 'wjv', name: 'West Java', w: 1.15 },
  { id: 'cjv', name: 'Central Java', w: 0.85 },
  { id: 'ejv', name: 'East Java', w: 1.0 },
]

/* SKUs attributed to a category; a category's revenue splits across its SKUs
   by weight, so SKU totals always reconcile to the category totals. */
const SKUS = [
  { name: 'Teh Botol 350ml', cat: 'bev', wt: 1.0 },
  { name: 'Kopi Sachet 3-in-1', cat: 'bev', wt: 0.85 },
  { name: 'AMDK Galon 19L', cat: 'bev', wt: 0.7 },
  { name: 'Keripik Kentang 68g', cat: 'snk', wt: 0.9 },
  { name: 'Biskuit Cokelat', cat: 'snk', wt: 0.8 },
  { name: 'Wafer Roll', cat: 'snk', wt: 0.6 },
  { name: 'Sabun Mandi Cair', cat: 'pc', wt: 0.9 },
  { name: 'Sampo Sachet', cat: 'pc', wt: 0.8 },
  { name: 'Pasta Gigi 190g', cat: 'pc', wt: 0.65 },
  { name: 'Deterjen Bubuk 800g', cat: 'hh', wt: 0.95 },
  { name: 'Pembersih Lantai 800ml', cat: 'hh', wt: 0.7 },
  { name: 'Susu UHT 1L', cat: 'dr', wt: 1.0 },
  { name: 'Susu Kental Manis', cat: 'dr', wt: 0.75 },
  { name: 'Yogurt Cup 80g', cat: 'dr', wt: 0.55 },
]

const MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* Jul '24 (index 0) through Jun '26 (index 23) */
const MONTHS = Array.from({ length: 24 }, (_, i) => {
  const d = new Date(2024, 6 + i, 1)
  return { mi: i, label: MN[d.getMonth()], y: d.getFullYear() % 100, moy: d.getMonth() }
})

/* Lebaran demand spikes: Mar and Apr 2025 (idx 8, 9), Feb and Mar 2026 (idx 19, 20) */
const LEBARAN = new Set([8, 9, 19, 20])

const mkR = (s) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }

/* Flat cell table: one row per (month, region, category) */
const CELLS = (() => {
  const out = []
  REGIONS.forEach((region, ri) => {
    CATEGORIES.forEach((cat, ci) => {
      const rand = mkR((ri + 1) * 100003 + (ci + 1) * 7919)
      MONTHS.forEach((mo) => {
        const trend = Math.pow(1.009, mo.mi)
        const season = 1 + 0.06 * Math.sin(((mo.mi + 2) * Math.PI) / 6)
        const leb = LEBARAN.has(mo.mi)
          ? (['bev', 'snk', 'dr'].includes(cat.id) ? 1.35 : 1.12)
          : 1
        const noise = 0.9 + rand() * 0.2
        const revenue = cat.base * region.w * trend * season * leb * noise // million IDR
        const units = Math.round((revenue * 1e6) / cat.price)
        const orders = Math.round(units / cat.basket)
        out.push({ mi: mo.mi, region: region.id, cat: cat.id, revenue, units, orders })
      })
    })
  })
  return out
})()

const fmtRp = (m) => (m >= 1000 ? `Rp ${(m / 1000).toFixed(1)}B` : `Rp ${Math.round(m)}M`)
const fmtUnits = (u) => (u >= 1e6 ? `${(u / 1e6).toFixed(1)}M` : u >= 1e3 ? `${(u / 1e3).toFixed(0)}K` : `${u}`)
const fmtIDR = (v) => `Rp ${Math.round(v).toLocaleString('en-US')}`

const REGION_OPTIONS = [
  { value: 'all', label: 'All Java' },
  ...REGIONS.map((r) => ({ value: r.id, label: r.name })),
]

const RevenueTip = chartTooltip({ format: (v) => fmtRp(v) })
const UnitsTip = chartTooltip({ format: (v) => `${fmtUnits(v)} units` })

export default function FmcgSalesDashboard() {
  const t = useChartTheme()
  const [region, setRegion] = useState('all')

  const rows = useMemo(
    () => (region === 'all' ? CELLS : CELLS.filter((c) => c.region === region)),
    [region],
  )

  const kpi = useMemo(() => {
    const rev = rows.reduce((a, c) => (c.mi >= 12 ? a + c.revenue : a), 0)
    const revPrev = rows.reduce((a, c) => (c.mi < 12 ? a + c.revenue : a), 0)
    const units = rows.reduce((a, c) => (c.mi >= 12 ? a + c.units : a), 0)
    const orders = rows.reduce((a, c) => (c.mi >= 12 ? a + c.orders : a), 0)
    return { rev, units, aov: (rev * 1e6) / orders, yoy: ((rev - revPrev) / revPrev) * 100 }
  }, [rows])

  /* 12-month trend aligned by calendar month (Jul through Jun) */
  const trendData = useMemo(
    () =>
      Array.from({ length: 12 }, (_, k) => {
        const mi = 12 + k
        return {
          month: MONTHS[mi].label,
          'This year': +rows.reduce((a, c) => (c.mi === mi ? a + c.revenue : a), 0).toFixed(0),
          'Last year': +rows.reduce((a, c) => (c.mi === k ? a + c.revenue : a), 0).toFixed(0),
        }
      }),
    [rows],
  )

  const regionData = useMemo(
    () =>
      REGIONS.map((r) => ({
        id: r.id,
        name: r.name,
        revenue: +CELLS.filter((c) => c.region === r.id && c.mi >= 12)
          .reduce((a, c) => a + c.revenue, 0)
          .toFixed(0),
      })).sort((a, b) => b.revenue - a.revenue),
    [],
  )

  const categoryData = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        id: cat.id,
        name: cat.name,
        color: t.seriesAt(cat.slot),
        revenue: +rows
          .filter((c) => c.cat === cat.id && c.mi >= 12)
          .reduce((a, c) => a + c.revenue, 0)
          .toFixed(0),
        units: rows.filter((c) => c.cat === cat.id && c.mi >= 12).reduce((a, c) => a + c.units, 0),
      })).sort((a, b) => b.revenue - a.revenue),
    [rows, t],
  )

  const catYoY = useMemo(
    () =>
      CATEGORIES.map((cat) => {
        const cur = rows.filter((c) => c.cat === cat.id && c.mi >= 12).reduce((a, c) => a + c.revenue, 0)
        const pre = rows.filter((c) => c.cat === cat.id && c.mi < 12).reduce((a, c) => a + c.revenue, 0)
        return { name: cat.name, yoy: ((cur - pre) / pre) * 100 }
      }).sort((a, b) => b.yoy - a.yoy),
    [rows],
  )

  const skuData = useMemo(() => {
    const catRev = {}
    const catWt = {}
    CATEGORIES.forEach((cat) => {
      catRev[cat.id] = rows.filter((c) => c.cat === cat.id && c.mi >= 12).reduce((a, c) => a + c.revenue, 0)
      catWt[cat.id] = SKUS.filter((s) => s.cat === cat.id).reduce((a, s) => a + s.wt, 0)
    })
    return SKUS.map((s) => {
      const cat = CATEGORIES.find((c) => c.id === s.cat)
      return {
        name: s.name,
        color: t.seriesAt(cat.slot),
        cat: cat.name,
        revenue: (catRev[s.cat] * s.wt) / catWt[s.cat],
      }
    })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
  }, [rows, t])

  const maxSku = skuData.length ? skuData[0].revenue : 1
  const totalCatRev = categoryData.reduce((a, c) => a + c.revenue, 0)
  const regionLabel = region === 'all' ? 'all Java regions' : REGIONS.find((r) => r.id === region).name

  /* Growth is a polarity, so it uses the diverging poles rather than the
     reserved status colours. */
  const positive = t.seriesAt(0)
  const negative = t.dark ? '#e66767' : '#c0392f'

  return (
    <DashFrame>
      <DashBar
        icon="grid"
        title="FMCG Sales Performance"
        subtitle="Java distribution · trailing 12 months · synthetic demo data"
      >
        <span className="dash-panel-note">Region</span>
        <Segment options={REGION_OPTIONS} value={region} onChange={setRegion} label="Filter by region" />
      </DashBar>

      <DashBody rows="auto minmax(0, 1fr)">
        <StatGrid columns="repeat(4, minmax(0, 1fr))">
          <Stat label="Revenue · 12 mo" value={fmtRp(kpi.rev)} note={regionLabel} />
          <Stat label="Units sold · 12 mo" value={fmtUnits(kpi.units)} note="across 5 categories" />
          <Stat label="Avg order value" value={fmtIDR(kpi.aov)} note="revenue per order" />
          <Stat
            label="YoY growth"
            value={`${kpi.yoy >= 0 ? '+' : ''}${kpi.yoy.toFixed(1)}%`}
            delta={`${Math.abs(kpi.yoy).toFixed(1)}%`}
            deltaDir={kpi.yoy >= 0 ? 'up' : 'down'}
            note="vs prior 12 months"
          />
        </StatGrid>

        <DashBody
          columns="minmax(0, 1.15fr) minmax(0, 1fr) minmax(0, 1fr)"
          style={{ padding: 0 }}
        >
          {/* ── Trend and regions ───────────────────────────── */}
          <Col>
            <Panel title="Revenue trend" note="this year vs last year" grow bodyFill>
              <div className="dash-chart" style={{ flex: 1, minHeight: 150 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 8, right: 10, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fmcgThis" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={t.seriesAt(0)} stopOpacity={0.26} />
                        <stop offset="100%" stopColor={t.seriesAt(0)} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...t.grid} />
                    <XAxis dataKey="month" {...t.xAxis} interval={1} />
                    <YAxis {...t.yAxis} tickFormatter={(v) => `${(v / 1000).toFixed(0)}B`} width={34} />
                    <Tooltip content={<RevenueTip />} cursor={t.cursor} />
                    <RcLegend
                      verticalAlign="top"
                      height={22}
                      iconType="plainline"
                      iconSize={12}
                      wrapperStyle={{ fontSize: 11, color: t.body }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Last year"
                      stroke={t.muted}
                      strokeWidth={1.6}
                      strokeDasharray="5 4"
                      fill="none"
                    />
                    <Area
                      type="monotone"
                      dataKey="This year"
                      stroke={t.seriesAt(0)}
                      strokeWidth={2}
                      fill="url(#fmcgThis)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* One measure across four nominal regions, so a single colour.
                The active filter is marked by opacity and an outline, not a
                different hue. */}
            <Panel title="Revenue by region" note="click a bar to filter" grow bodyFill>
              <div className="dash-chart" style={{ flex: 1, minHeight: 130 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionData} layout="vertical" margin={{ top: 4, right: 58, left: 6, bottom: 4 }}>
                    <CartesianGrid stroke={t.grid.stroke} horizontal={false} />
                    <XAxis
                      type="number"
                      {...t.xAxis}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}B`}
                    />
                    <YAxis type="category" dataKey="name" {...t.yAxis} width={84} tick={{ fill: t.body, fontSize: 11 }} />
                    <Tooltip content={<RevenueTip />} cursor={t.barCursor} />
                    <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]} barSize={18}>
                      {regionData.map((r) => (
                        <Cell
                          key={r.id}
                          cursor="pointer"
                          fill={t.seriesAt(0)}
                          fillOpacity={region === 'all' || region === r.id ? 1 : 0.3}
                          onClick={() => setRegion(region === r.id ? 'all' : r.id)}
                        />
                      ))}
                      <LabelList
                        dataKey="revenue"
                        position="right"
                        fill={t.body}
                        fontSize={11}
                        formatter={(v) => fmtRp(v)}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </Col>

          {/* ── Category mix ────────────────────────────────── */}
          <Col>
            <Panel title="Revenue mix" note="by category · 12 mo" grow bodyFill>
              <div className="dash-chart" style={{ flex: 1, minHeight: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="54%"
                      outerRadius="82%"
                      paddingAngle={2}
                      stroke={t.surface}
                      strokeWidth={2}
                    >
                      {categoryData.map((c) => (
                        <Cell key={c.id} fill={c.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<RevenueTip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <Legend
                stacked
                items={categoryData.map((c) => ({
                  label: c.name,
                  color: c.color,
                  value: `${totalCatRev ? Math.round((c.revenue / totalCatRev) * 100) : 0}%`,
                }))}
              />
            </Panel>

            <Panel title="Units sold" note="by category · 12 mo" grow bodyFill>
              <div className="dash-chart" style={{ flex: 1, minHeight: 130 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ top: 4, right: 48, left: 6, bottom: 4 }}>
                    <CartesianGrid stroke={t.grid.stroke} horizontal={false} />
                    <XAxis type="number" {...t.xAxis} tickFormatter={fmtUnits} />
                    <YAxis type="category" dataKey="name" {...t.yAxis} width={84} tick={{ fill: t.body, fontSize: 11 }} />
                    <Tooltip content={<UnitsTip />} cursor={t.barCursor} />
                    <Bar dataKey="units" name="Units" radius={[0, 4, 4, 0]} barSize={14}>
                      {categoryData.map((c) => (
                        <Cell key={c.id} fill={c.color} />
                      ))}
                      <LabelList
                        dataKey="units"
                        position="right"
                        fill={t.body}
                        fontSize={11}
                        formatter={fmtUnits}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </Col>

          {/* ── Growth and SKUs ─────────────────────────────── */}
          <Col>
            <Panel title="Category growth" note="vs prior 12 mo" grow>
              <Meters>
                {catYoY.map((c) => (
                  <Meter
                    key={c.name}
                    label={c.name}
                    value={Math.min(100, Math.abs(c.yoy) * 4)}
                    color={c.yoy >= 0 ? positive : negative}
                    display={`${c.yoy >= 0 ? '+' : ''}${c.yoy.toFixed(1)}%`}
                  />
                ))}
              </Meters>
              <p className="dash-note" style={{ marginTop: 10 }}>
                Growth compares the last 12 months of revenue with the 12 before it.
              </p>
            </Panel>

            <Panel title="Top SKUs" note="by revenue · 12 mo" grow>
              <div className="dash-scroll" style={{ maxHeight: 210 }}>
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">SKU</th>
                      <th scope="col" className="num">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skuData.map((s, i) => (
                      <tr key={s.name}>
                        <td className="num">{i + 1}</td>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span
                              className="dash-legend-swatch"
                              style={{ background: s.color }}
                              aria-hidden="true"
                            />
                            <span>
                              {s.name}
                              <span
                                style={{
                                  display: 'block',
                                  height: 3,
                                  marginTop: 3,
                                  borderRadius: 2,
                                  width: `${(s.revenue / maxSku) * 100}%`,
                                  background: s.color,
                                  opacity: 0.55,
                                }}
                              />
                            </span>
                          </span>
                        </td>
                        <td className="num">{fmtRp(s.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="dash-note" style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <DashIcon name="filter" size={12} />
                Scoped to {regionLabel}.
              </p>
            </Panel>
          </Col>
        </DashBody>
      </DashBody>
    </DashFrame>
  )
}
