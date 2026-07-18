/* FMCG Sales Performance — distributor BI dashboard.
   The interactive web sibling of the author's FMCG Excel dashboard. Recharts-only
   (no map). 24 months (Jul 2024 - Jun 2026) x 5 categories x 4 Java regions of
   SYNTHETIC, deterministic sales (seeded LCG, ~0.9%/mo growth, Ramadan/Lebaran
   spikes). Headline KPIs are trailing-12-month; YoY compares the last 12 months
   against the prior 12. Scoped under .fmcg-dash, @keyframes at top level. */
import { useState, useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, Cell, LabelList,
  PieChart, Pie, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import './FmcgSalesDashboard.css'

const CYAN = '#22d3ee'
const ORANGE = '#fb923c'
const PURPLE = '#c084fc'
const GREEN = '#34d399'
const YELLOW = '#facc15'
const ROSE = '#f43f5e'

const CATEGORIES = [
  { id: 'bev', name: 'Beverages', base: 420, price: 8000, basket: 5, color: CYAN },
  { id: 'snk', name: 'Snacks', base: 380, price: 6000, basket: 6, color: ORANGE },
  { id: 'pc', name: 'Personal Care', base: 310, price: 25000, basket: 3, color: PURPLE },
  { id: 'hh', name: 'Household', base: 260, price: 35000, basket: 2, color: GREEN },
  { id: 'dr', name: 'Dairy', base: 220, price: 15000, basket: 4, color: YELLOW },
]

const REGIONS = [
  { id: 'jbd', name: 'Jabodetabek', w: 1.6 },
  { id: 'wjv', name: 'West Java', w: 1.15 },
  { id: 'cjv', name: 'Central Java', w: 0.85 },
  { id: 'ejv', name: 'East Java', w: 1.0 },
]

/* SKUs attributed to a category; a category's revenue is split across its SKUs
   by weight so SKU totals always reconcile to the category totals. */
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
/* Jul '24 (index 0) -> Jun '26 (index 23) */
const MONTHS = Array.from({ length: 24 }, (_, i) => {
  const d = new Date(2024, 6 + i, 1)
  return { mi: i, label: MN[d.getMonth()], y: d.getFullYear() % 100, moy: d.getMonth() }
})
/* Lebaran demand spikes: Mar-Apr 2025 (idx 8,9) and Feb-Mar 2026 (idx 19,20) */
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

const REGION_CHIPS = [{ id: 'all', name: 'All regions' }, ...REGIONS]

function TrendTip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="fmcg-tip">
      <div className="t-l">{label}</div>
      {payload.map((p) => (
        <div className="t-v" key={p.name} style={{ color: p.color }}>
          {p.name}: {fmtRp(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function FmcgSalesDashboard() {
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
    return {
      rev,
      units,
      aov: (rev * 1e6) / orders,
      yoy: ((rev - revPrev) / revPrev) * 100,
    }
  }, [rows])

  /* 12-month YoY trend aligned by calendar month (Jul..Jun) */
  const trendData = useMemo(() => {
    return Array.from({ length: 12 }, (_, k) => {
      const mi = 12 + k
      const label = MONTHS[mi].label
      const thisYear = rows.reduce((a, c) => (c.mi === mi ? a + c.revenue : a), 0)
      const lastYear = rows.reduce((a, c) => (c.mi === k ? a + c.revenue : a), 0)
      return { month: label, 'This year': +thisYear.toFixed(0), 'Last year': +lastYear.toFixed(0) }
    })
  }, [rows])

  const regionData = useMemo(() => {
    return REGIONS.map((r) => ({
      id: r.id,
      name: r.name,
      revenue: +CELLS.filter((c) => c.region === r.id && c.mi >= 12)
        .reduce((a, c) => a + c.revenue, 0)
        .toFixed(0),
    })).sort((a, b) => b.revenue - a.revenue)
  }, [])

  const categoryData = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      revenue: +rows.filter((c) => c.cat === cat.id && c.mi >= 12).reduce((a, c) => a + c.revenue, 0).toFixed(0),
      units: rows.filter((c) => c.cat === cat.id && c.mi >= 12).reduce((a, c) => a + c.units, 0),
    })).sort((a, b) => b.revenue - a.revenue)
  }, [rows])

  const catYoY = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const cur = rows.filter((c) => c.cat === cat.id && c.mi >= 12).reduce((a, c) => a + c.revenue, 0)
      const pre = rows.filter((c) => c.cat === cat.id && c.mi < 12).reduce((a, c) => a + c.revenue, 0)
      return { name: cat.name, color: cat.color, yoy: ((cur - pre) / pre) * 100 }
    }).sort((a, b) => b.yoy - a.yoy)
  }, [rows])

  const skuData = useMemo(() => {
    const catRev = {}
    const catWt = {}
    CATEGORIES.forEach((cat) => {
      catRev[cat.id] = rows.filter((c) => c.cat === cat.id && c.mi >= 12).reduce((a, c) => a + c.revenue, 0)
      catWt[cat.id] = SKUS.filter((s) => s.cat === cat.id).reduce((a, s) => a + s.wt, 0)
    })
    return SKUS.map((s) => {
      const cat = CATEGORIES.find((c) => c.id === s.cat)
      return { name: s.name, color: cat.color, cat: cat.name, revenue: (catRev[s.cat] * s.wt) / catWt[s.cat] }
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 8)
  }, [rows])

  const maxSku = skuData.length ? skuData[0].revenue : 1
  const totalCatRev = categoryData.reduce((a, c) => a + c.revenue, 0)

  return (
    <div className="fmcg-dash">
      {/* HEADER */}
      <div className="H">
        <h1>
          FMCG Sales Performance
          <span className="sub">Java distribution · trailing 12 months · synthetic demo data</span>
        </h1>
        <div className="hr">
          <div className="live">LIVE</div>
          <span className="hr-l">Region</span>
          <div className="seg-chips">
            {REGION_CHIPS.map((r) => (
              <button
                key={r.id}
                className={`seg-chip${region === r.id ? ' on' : ''}`}
                onClick={() => setRegion(r.id)}
              >
                {r.name}
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
            <div className="k-l">Revenue · 12 mo</div>
            <div className="k-v" style={{ color: CYAN }}>{fmtRp(kpi.rev)}</div>
            <div className="k-s">{region === 'all' ? 'all Java regions' : REGIONS.find((r) => r.id === region).name}</div>
          </div>
          <div className="kpi">
            <span className="k-acc" style={{ background: ORANGE }} />
            <div className="k-l">Units sold · 12 mo</div>
            <div className="k-v" style={{ color: ORANGE }}>{fmtUnits(kpi.units)}</div>
            <div className="k-s">across 5 categories</div>
          </div>
          <div className="kpi">
            <span className="k-acc" style={{ background: PURPLE }} />
            <div className="k-l">Avg order value</div>
            <div className="k-v" style={{ color: PURPLE }}>{fmtIDR(kpi.aov)}</div>
            <div className="k-s">revenue per order</div>
          </div>
          <div className="kpi">
            <span className="k-acc" style={{ background: kpi.yoy >= 0 ? GREEN : ROSE }} />
            <div className="k-l">YoY growth</div>
            <div className="k-v" style={{ color: kpi.yoy >= 0 ? GREEN : ROSE }}>
              {kpi.yoy >= 0 ? '▲' : '▼'} {Math.abs(kpi.yoy).toFixed(1)}%
            </div>
            <div className="k-s">vs prior 12 months</div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="main">
          {/* COL 1 — trend + region */}
          <div className="col">
            <div className="c">
              <div className="ct">Revenue trend · YoY <span className="src">this year vs last year</span></div>
              <div className="ch">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fmcgThis" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CYAN} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={CYAN} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#5a6478', fontSize: 8 }} interval={1} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#5a6478', fontSize: 8 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}B`} axisLine={false} tickLine={false} width={34} />
                    <Tooltip content={<TrendTip />} cursor={{ stroke: 'rgba(255,255,255,.12)' }} />
                    <Area type="monotone" dataKey="Last year" stroke="#64748b" strokeWidth={1.4} strokeDasharray="4 3" fill="none" />
                    <Area type="monotone" dataKey="This year" stroke={CYAN} strokeWidth={1.9} fill="url(#fmcgThis)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="c">
              <div className="ct">Revenue by region <span className="src">click bar to filter · 12 mo</span></div>
              <div className="ch">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionData} layout="vertical" margin={{ top: 4, right: 52, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#5a6478', fontSize: 8 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}B`} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,.04)' }} formatter={(v) => [fmtRp(v), 'revenue']} contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, fontSize: 10 }} labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: GREEN }} />
                    <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={20}>
                      {regionData.map((r) => (
                        <Cell
                          key={r.id}
                          cursor="pointer"
                          fill={GREEN}
                          fillOpacity={region === 'all' || region === r.id ? 0.88 : 0.25}
                          stroke={region === r.id ? '#e2e8f0' : 'none'}
                          strokeWidth={region === r.id ? 1 : 0}
                          onClick={() => setRegion(region === r.id ? 'all' : r.id)}
                        />
                      ))}
                      <LabelList dataKey="revenue" position="right" fill="#e2e8f0" fontSize={9} formatter={(v) => fmtRp(v)} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* COL 2 — category mix + units */}
          <div className="col">
            <div className="c">
              <div className="ct">Revenue mix <span className="src">by category · 12 mo</span></div>
              <div className="ch donut">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="revenue" nameKey="name" cx="50%" cy="50%" innerRadius="52%" outerRadius="80%" paddingAngle={2} stroke="none">
                      {categoryData.map((c) => <Cell key={c.id} fill={c.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [fmtRp(v), n]} contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, fontSize: 10 }} itemStyle={{ color: '#e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="legend">
                {categoryData.map((c) => (
                  <div className="lg" key={c.id}>
                    <span className="lg-d" style={{ background: c.color }} />
                    <span className="lg-n">{c.name}</span>
                    <span className="lg-v">{totalCatRev ? Math.round((c.revenue / totalCatRev) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="c">
              <div className="ct">Units sold by category <span className="src">12 mo</span></div>
              <div className="ch">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ top: 4, right: 44, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#5a6478', fontSize: 8 }} tickFormatter={(v) => fmtUnits(v)} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 8 }} axisLine={false} tickLine={false} width={78} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,.04)' }} formatter={(v) => [fmtUnits(v) + ' units', 'volume']} contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, fontSize: 10 }} labelStyle={{ color: '#94a3b8' }} />
                    <Bar dataKey="units" radius={[0, 4, 4, 0]} barSize={15}>
                      {categoryData.map((c) => <Cell key={c.id} fill={c.color} fillOpacity={0.85} />)}
                      <LabelList dataKey="units" position="right" fill="#cbd5e1" fontSize={8} formatter={(v) => fmtUnits(v)} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* COL 3 — category YoY + top SKUs */}
          <div className="col">
            <div className="c">
              <div className="ct">Category growth · YoY <span className="src">vs prior 12 mo</span></div>
              <div className="mgrid">
                {catYoY.map((c) => (
                  <div className="mrow" key={c.name}>
                    <span className="m-dot" style={{ background: c.color }} />
                    <span className="m-lab">{c.name}</span>
                    <span className="m-track">
                      <span className="m-fill" style={{ width: `${Math.min(100, Math.abs(c.yoy) * 4)}%`, background: c.yoy >= 0 ? GREEN : ROSE }} />
                    </span>
                    <span className="m-val" style={{ color: c.yoy >= 0 ? GREEN : ROSE }}>
                      {c.yoy >= 0 ? '+' : ''}{c.yoy.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="m-meta">Growth = last 12 mo revenue vs the prior 12 mo</div>
            </div>

            <div className="c">
              <div className="ct">Top SKUs <span className="src">by revenue · 12 mo</span></div>
              <div className="sku-wrap">
                {skuData.map((s, i) => (
                  <div className="sku" key={s.name}>
                    <span className="sku-rank">{i + 1}</span>
                    <span className="sku-info">
                      <span className="sku-n">{s.name}</span>
                      <span className="sku-bar"><span className="sku-fill" style={{ width: `${(s.revenue / maxSku) * 100}%`, background: s.color }} /></span>
                    </span>
                    <span className="sku-v">{fmtRp(s.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
