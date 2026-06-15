/* Geopolitical What-If / Scenario Simulation — faithful React port of
   erpdesign/whatif.jsx (styled-components + ReactMarkdown + axios).
   Mapbox -> free Leaflet/OSM (transmission-path overlay). Live API + LLM ->
   embedded synthetic scenarios + pre-written narrative. All data synthetic. */
import { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  ResponsiveContainer, AreaChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import './whatif.css'

/* ---- scenario-type accent gradients (from original survey) ---- */
const TYPE = {
  Economic: { a: '#f59e0b', b: '#ea580c', label: 'ECONOMIC' },
  Security: { a: '#f43f5e', b: '#db2777', label: 'SECURITY' },
  Diplomatic: { a: '#3b82f6', b: '#2563eb', label: 'DIPLOMATIC' },
  Technology: { a: '#14b8a6', b: '#0d9488', label: 'TECHNOLOGY' },
}

/* ---- synthetic scenario library ---- */
const SCENARIOS = [
  {
    id: 'hormuz',
    type: 'Security',
    title: 'Strait of Hormuz Closure',
    origin: 'Naval escalation forces a 21-day closure of the Strait of Hormuz',
    country: { name: 'Iran', code: 'ir' },
    severity: 'CRITICAL',
    prob: 0.27,
    horizon: 'T+0 to T+30 days',
    actors: ['IRGC Navy', 'GCC States', 'US Fifth Fleet', 'OPEC+'],
    impacts: [
      { k: 'Brent Crude', v: '+38%', dir: 'up' },
      { k: 'Global LNG flow', v: '-21%', dir: 'down' },
      { k: 'Tanker insurance', v: '+410%', dir: 'up' },
      { k: 'Asia refiner margin', v: '-14%', dir: 'down' },
    ],
    assumptions: [
      'Closure holds 21 days before mediated de-escalation.',
      'No direct strike on GCC export terminals.',
      'Coordinated IEA stock release of 1.2M bbl/day.',
      'Cape reroute adds 9-14 days transit on affected cargo.',
    ],
    series: [0, 5, 12, 21, 34, 52, 68, 74, 71, 66, 58, 47, 39, 33, 28],
    path: [
      { n: 'Strait of Hormuz', lat: 26.57, lng: 56.25 },
      { n: 'Fujairah Hub', lat: 25.12, lng: 56.34 },
      { n: 'Mumbai Refining', lat: 19.08, lng: 72.88 },
      { n: 'Singapore Bunkers', lat: 1.29, lng: 103.85 },
      { n: 'Ningbo Imports', lat: 29.87, lng: 121.55 },
    ],
    narrative:
      '## Strait of Hormuz Closure\n' +
      'A simulated 21-day closure removes roughly **17 million barrels/day** of seaborne crude from the market. The shock front propagates through three coupled channels.\n' +
      '- **Price channel:** Brent gaps higher on day 2 and peaks near **+38%** around T+7 as floating storage is exhausted.\n' +
      '- **Insurance channel:** war-risk premia for Gulf transits spike **+410%**, pricing marginal cargoes out before physical scarcity binds.\n' +
      '- **Reroute channel:** Cape-of-Good-Hope diversions add 9-14 days, tightening Q3 product balances in Northeast Asia.\n' +
      '**Stakeholders most exposed:** import-dependent Asian refiners, GCC sovereign budgets, and bunker-fuel-sensitive container lines.\n' +
      'Reversal indicators: tanker AIS resuming eastbound, war-risk quotes easing below 2.5%, and a coordinated IEA stock-draw statement.',
  },
  {
    id: 'semicurb',
    type: 'Technology',
    title: 'Advanced Semiconductor Export Curb',
    origin: 'Tightened export controls cut sub-5nm tooling and HBM to key fabs',
    country: { name: 'Taiwan', code: 'tw' },
    severity: 'HIGH',
    prob: 0.41,
    horizon: 'T+0 to T+30 days',
    actors: ['Foundry Alliance', 'EUV Tooling Vendor', 'Hyperscalers', 'Memory Makers'],
    impacts: [
      { k: 'AI accelerator lead time', v: '+19 wks', dir: 'up' },
      { k: 'HBM spot price', v: '+27%', dir: 'up' },
      { k: 'Affected fab utilisation', v: '-12%', dir: 'down' },
      { k: 'Edge-device BOM cost', v: '+6%', dir: 'up' },
    ],
    assumptions: [
      'Controls apply to sub-5nm logic and HBM3E only.',
      'Grandfathering of in-transit tools for 60 days.',
      'No retaliatory rare-earth restriction in the window.',
      'Hyperscaler capex re-timed, not cancelled.',
    ],
    series: [0, 3, 6, 11, 17, 24, 30, 35, 38, 40, 41, 41, 40, 39, 38],
    path: [
      { n: 'Hsinchu Fabs', lat: 24.78, lng: 121.0 },
      { n: 'Tainan Mega-fab', lat: 23.0, lng: 120.23 },
      { n: 'Penang Assembly', lat: 5.41, lng: 100.33 },
      { n: 'Arizona Cluster', lat: 33.6, lng: -111.9 },
      { n: 'Dresden Node', lat: 51.05, lng: 13.74 },
    ],
    narrative:
      '## Advanced Semiconductor Export Curb\n' +
      'The simulation gates leading-edge logic and high-bandwidth memory at the tooling layer rather than the chip layer, so the impulse is **slow but durable**.\n' +
      '- **Supply channel:** affected fab utilisation slips **-12%** as spares and field-service access tighten; the curve plateaus rather than spikes.\n' +
      '- **Allocation channel:** AI accelerator lead times stretch by **~19 weeks**, pushing buyers toward N-1 nodes and refurbished inventory.\n' +
      '- **Price channel:** HBM spot lifts **+27%**, the binding constraint for frontier-model training clusters.\n' +
      '**Stakeholders most exposed:** memory makers, downstream AI buildouts, and edge-device OEMs absorbing a **+6%** BOM step-up.\n' +
      'Reversal indicators: license carve-outs published, HBM lead times normalising, and resumed tool shipments on customs manifests.',
  },
  {
    id: 'grain',
    type: 'Economic',
    title: 'Black Sea Grain Corridor Disruption',
    origin: 'Renewed blockade halts the Black Sea grain export corridor',
    country: { name: 'Ukraine', code: 'ua' },
    severity: 'HIGH',
    prob: 0.34,
    horizon: 'T+0 to T+30 days',
    actors: ['Corridor JCC', 'Grain Majors', 'MENA Importers', 'WFP'],
    impacts: [
      { k: 'Wheat futures', v: '+22%', dir: 'up' },
      { k: 'Sunflower oil', v: '+31%', dir: 'up' },
      { k: 'MENA food-import bill', v: '+8%', dir: 'up' },
      { k: 'Corridor throughput', v: '-63%', dir: 'down' },
    ],
    assumptions: [
      'Corridor throughput falls 63% for the window.',
      'Danube barge + rail capture only ~40% of diverted volume.',
      'No simultaneous Northern-Hemisphere harvest failure.',
      'WFP emergency procurement front-loaded by 30 days.',
    ],
    series: [0, 4, 9, 14, 18, 21, 22, 22, 21, 20, 19, 18, 17, 16, 15],
    path: [
      { n: 'Odesa Port', lat: 46.48, lng: 30.73 },
      { n: 'Bosphorus', lat: 41.12, lng: 29.07 },
      { n: 'Alexandria', lat: 31.2, lng: 29.92 },
      { n: 'Beirut', lat: 33.9, lng: 35.5 },
      { n: 'Mombasa Relief', lat: -4.04, lng: 39.67 },
    ],
    narrative:
      '## Black Sea Grain Corridor Disruption\n' +
      'A renewed blockade strips **~63%** of corridor throughput. Because grain demand is inelastic, the price response is sharp and the humanitarian tail is long.\n' +
      '- **Price channel:** wheat futures climb **+22%**; sunflower oil, with thinner substitution, runs to **+31%**.\n' +
      '- **Logistics channel:** Danube barge and rail recapture only ~40% of volume, so MENA inventories draw down within three weeks.\n' +
      '- **Fiscal channel:** MENA food-import bills rise **+8%**, pressuring subsidy regimes running thin buffers.\n' +
      '**Stakeholders most exposed:** WFP relief pipelines, MENA importers, and smallholder margins facing input-cost passthrough.\n' +
      'Reversal indicators: corridor inspections resuming, Bosphorus vessel queues clearing, and futures backwardation re-establishing.',
  },
  {
    id: 'accord',
    type: 'Diplomatic',
    title: 'Surprise Normalisation Accord',
    origin: 'Two rival powers announce a phased normalisation framework',
    country: { name: 'Saudi Arabia', code: 'sa' },
    severity: 'MODERATE',
    prob: 0.22,
    horizon: 'T+0 to T+30 days',
    actors: ['Mediating State', 'Signatory A', 'Signatory B', 'Regional Bloc'],
    impacts: [
      { k: 'Regional risk premium', v: '-18%', dir: 'down' },
      { k: 'FDI announcements', v: '+24%', dir: 'up' },
      { k: 'Defence-stock index', v: '-7%', dir: 'down' },
      { k: 'Tourism bookings', v: '+11%', dir: 'up' },
    ],
    assumptions: [
      'Framework is phased; full implementation beyond the window.',
      'No spoiler veto from third-party regional actors.',
      'Sanctions relief sequenced against verification milestones.',
      'Markets price ~60% accord-durability in the base case.',
    ],
    series: [0, -3, -7, -11, -14, -16, -17, -18, -18, -17, -16, -15, -14, -13, -12],
    path: [
      { n: 'Mediator Capital', lat: 24.71, lng: 46.68 },
      { n: 'Signatory A', lat: 35.69, lng: 51.39 },
      { n: 'Signatory B', lat: 33.31, lng: 44.36 },
      { n: 'Regional Bloc HQ', lat: 30.04, lng: 31.24 },
      { n: 'Markets Hub', lat: 25.2, lng: 55.27 },
    ],
    narrative:
      '## Surprise Normalisation Accord\n' +
      'A phased normalisation framework compresses the **regional risk premium by ~18%**. The impulse is benign and front-loaded, then partially fades as durability is repriced.\n' +
      '- **Risk channel:** sovereign CDS and freight war-risk both ease; capital rotates toward regional equities.\n' +
      '- **Investment channel:** FDI announcements jump **+24%** as project pipelines paused on tail-risk reactivate.\n' +
      '- **Sector rotation:** defence indices give back **-7%** while tourism and logistics re-rate higher.\n' +
      '**Stakeholders most exposed:** sovereign issuers, regional bourses, and cross-border infrastructure sponsors.\n' +
      'Reversal indicators: verification milestones slipping, spoiler rhetoric escalating, and risk premia retracing toward the pre-accord level.',
  },
]

/* tiny inline markdown -> JSX (synthetic narrative; replaces ReactMarkdown) */
function renderNarrative(md, accent) {
  const out = []
  md.split('\n').forEach((raw, i) => {
    const line = raw.trim()
    if (!line) return
    if (line.startsWith('## ')) out.push(<h3 key={i} style={{ color: accent }}>{line.slice(3)}</h3>)
    else if (line.startsWith('- ')) out.push(<li key={i}>{fmtInline(line.slice(2), accent)}</li>)
    else out.push(<p key={i}>{fmtInline(line, accent)}</p>)
  })
  return out
}
function fmtInline(text, accent) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} style={{ color: accent }}>{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>,
  )
}

const SEV_BG = { CRITICAL: '#dc2626', HIGH: '#ea580c', MODERATE: '#d97706', LOW: '#16a34a' }

export default function WhatIfDashboard() {
  const [selId, setSelId] = useState(SCENARIOS[0].id)
  const [country, setCountry] = useState('')
  const [intensity, setIntensity] = useState(70)
  const [horizon, setHorizon] = useState('30')
  const [showAssump, setShowAssump] = useState(true)
  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  const sel = useMemo(() => SCENARIOS.find((s) => s.id === selId), [selId])
  const accent = TYPE[sel.type]

  const chart = useMemo(() => {
    const mul = intensity / 70
    return sel.series.map((v, i) => ({
      t: `T+${Math.round((i / (sel.series.length - 1)) * Number(horizon))}`,
      scenario: +(v * mul).toFixed(1),
      baseline: 0,
    }))
  }, [sel, intensity, horizon])

  // Leaflet init (guard StrictMode double-mount)
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return
    const m = L.map(mapEl.current, {
      center: [25, 55], zoom: 2, zoomControl: true, attributionControl: true, scrollWheelZoom: false,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap', maxZoom: 12,
    }).addTo(m)
    mapRef.current = m
    layerRef.current = L.layerGroup().addTo(m)
    const ro = new ResizeObserver(() => m.invalidateSize({ animate: false })); ro.observe(mapEl.current)
    const t = setTimeout(() => m.invalidateSize({ animate: false }), 80)
    return () => { clearTimeout(t); ro.disconnect(); m.remove(); mapRef.current = null }
  }, [])

  // redraw transmission path for selected scenario
  useEffect(() => {
    const m = mapRef.current, grp = layerRef.current
    if (!m || !grp) return
    grp.clearLayers()
    const pts = sel.path.map((p) => [p.lat, p.lng])
    L.polyline(pts, { color: accent.a, weight: 2.5, opacity: 0.85, dashArray: '6 5' }).addTo(grp)
    sel.path.forEach((p, i) => {
      const isOrigin = i === 0
      L.circleMarker([p.lat, p.lng], {
        radius: isOrigin ? 7 : 5, color: '#fff', weight: 1.5,
        fillColor: isOrigin ? accent.b : accent.a, fillOpacity: 1,
      }).bindTooltip(`<b>${p.n}</b><br/>${isOrigin ? 'Shock origin' : 'Transmission node ' + i}`, { sticky: true }).addTo(grp)
    })
    m.flyToBounds(L.latLngBounds(pts), { padding: [30, 30], duration: 0.9, maxZoom: 4 })
  }, [sel, accent])

  return (
    <div className="whatif-dash">
      <div className="wf-wrap">
        {/* LEFT — Scenario Engine */}
        <div className="wf-panel wf-left">
          <div className="wf-head">
            <div className="wf-tg">
              <div className="wf-ic" style={{ color: accent.a }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
              </div>
              <div>
                <h2 className="wf-title">Scenario Engine</h2>
                <div className="wf-sub">Scenario Injection Parameters</div>
              </div>
            </div>
            <button className="wf-iconbtn" title="Settings">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            </button>
          </div>

          <div className="wf-scroll">
            <div className="wf-badges">
              <div className="wf-badge" style={{ color: accent.a, background: accent.a + '1a', borderColor: accent.a + '4d' }}>
                <span className="wf-dot" style={{ background: accent.a }} /> {accent.label}
              </div>
              <div className="wf-badge wf-badge-blue">
                <img src={`https://flagcdn.com/w20/${sel.country.code}.png`} alt="" style={{ width: 12, borderRadius: 2 }} /> {sel.country.name}
              </div>
              <div className="wf-badge wf-badge-blue">Strategic Persona</div>
            </div>

            <label className="wf-label">Target Country</label>
            <select className="wf-select" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="">Inherit from scenario ({sel.country.name})</option>
              {['Iran', 'Taiwan', 'Ukraine', 'Saudi Arabia', 'United States', 'China', 'Germany'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <label className="wf-label" style={{ marginTop: 14 }}>Shock Intensity · {intensity}%</label>
            <input className="wf-range" type="range" min="20" max="120" value={intensity}
              style={{ accentColor: accent.a }}
              onChange={(e) => setIntensity(Number(e.target.value))} />

            <label className="wf-label" style={{ marginTop: 14 }}>Simulation Horizon</label>
            <select className="wf-select" value={horizon} onChange={(e) => setHorizon(e.target.value)}>
              <option value="14">T+0 → T+14 days</option>
              <option value="30">T+0 → T+30 days</option>
              <option value="60">T+0 → T+60 days</option>
            </select>

            <label className="wf-label" style={{ marginTop: 16 }}>Scenario Library</label>
            <div className="wf-scn-list">
              {SCENARIOS.map((s) => {
                const t = TYPE[s.type]
                const on = s.id === selId
                return (
                  <div key={s.id} className={`wf-scn${on ? ' on' : ''}`}
                    style={on ? { borderColor: t.a, background: `linear-gradient(135deg, ${t.a}1f, transparent)` } : {}}
                    onClick={() => setSelId(s.id)}>
                    <div className="wf-scn-bar" style={{ background: `linear-gradient(${t.a}, ${t.b})` }} />
                    <div className="wf-scn-body">
                      <div className="wf-scn-top">
                        <span className="wf-scn-type" style={{ color: t.a }}>{t.label}</span>
                        <span className="wf-sev" style={{ background: SEV_BG[s.severity] }}>{s.severity}</span>
                      </div>
                      <div className="wf-scn-title">{s.title}</div>
                      <div className="wf-scn-meta">P(occurrence) {Math.round(s.prob * 100)}% · {s.actors.length} actors</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button className="wf-exec" style={{ background: `linear-gradient(135deg, ${accent.a}, ${accent.b})` }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              EXECUTE SIMULATION
            </button>
          </div>
        </div>

        {/* RIGHT — Output */}
        <div className="wf-panel wf-right">
          <div className="wf-head">
            <div className="wf-tg">
              <div className="wf-ic" style={{ color: accent.b }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" /><path d="M8.5 8.5a4 4 0 0 0 0 5.66" /><path d="M15.5 8.5a4 4 0 0 1 0 5.66" /></svg>
              </div>
              <div>
                <h2 className="wf-title">Impact Simulation Output</h2>
                <div className="wf-sub">Projected Strategic Transmission · {sel.horizon}</div>
              </div>
            </div>
            <div className="wf-prob" style={{ color: accent.a }}>P {Math.round(sel.prob * 100)}%</div>
          </div>

          <div className="wf-scroll">
            <div className="wf-card" style={{ background: `linear-gradient(135deg, ${accent.a}14, transparent)`, borderColor: accent.a + '33' }}>
              <div className="wf-ct">Selected Scenario</div>
              <div className="wf-scn-hl">{sel.title}</div>
              <div className="wf-origin">{sel.origin}</div>
              <div className="wf-actors">{sel.actors.map((a) => <span key={a} className="wf-chip">{a}</span>)}</div>
            </div>

            <div className="wf-card">
              <div className="wf-ct">Projected Impacts</div>
              <div className="wf-impacts">
                {sel.impacts.map((im) => (
                  <div key={im.k} className="wf-impact">
                    <div className="wf-imk">{im.k}</div>
                    <div className="wf-imv" style={{ color: im.dir === 'up' ? '#f43f5e' : '#22c55e' }}>{im.dir === 'up' ? '▲' : '▼'} {im.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="wf-card">
              <div className="wf-ct">Impact Projection <span className="wf-src">scenario vs baseline · {sel.horizon}</span></div>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <AreaChart data={chart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="wfGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={accent.a} stopOpacity={0.45} />
                        <stop offset="100%" stopColor={accent.a} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                    <XAxis dataKey="t" tick={{ fontSize: 8, fill: '#64748b' }} interval={2} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 8, fontSize: 11, color: '#e2e8f0' }} />
                    <ReferenceLine y={0} stroke="rgba(148,163,184,0.35)" />
                    <Area type="monotone" dataKey="scenario" stroke={accent.a} strokeWidth={2} fill="url(#wfGrad)" />
                    <Line type="monotone" dataKey="baseline" stroke="#475569" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="wf-card">
              <div className="wf-ct">Transmission Path <span className="wf-src">OpenStreetMap</span></div>
              <div ref={mapEl} className="wf-map" />
            </div>

            <div className="wf-card">
              <div className="wf-ct wf-ct-row">
                <span>Scenario Assumptions</span>
                <button className="wf-toggle" onClick={() => setShowAssump((v) => !v)}>{showAssump ? 'Hide' : 'Show'}</button>
              </div>
              {showAssump && <ul className="wf-assump">{sel.assumptions.map((a, i) => <li key={i}>{a}</li>)}</ul>}
            </div>

            <div className="wf-ai" style={{ borderColor: accent.a + '26', background: `linear-gradient(135deg, ${accent.a}0d, rgba(59,130,246,0.04))` }}>
              <div className="wf-ai-head" style={{ color: accent.a }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" /></svg>
                AI STRATEGIC INTERPRETATION
                <span className="wf-ai-tag">Synthetic narrative</span>
              </div>
              <div className="wf-md">{renderNarrative(sel.narrative, accent.a)}</div>
            </div>
          </div>

          <div className="wf-foot">
            <span>SCENARIO <b style={{ color: accent.a }}>{SCENARIOS.findIndex((s) => s.id === selId) + 1}</b> OF <b style={{ color: accent.a }}>{SCENARIOS.length}</b></span>
            <span className="wf-foot-r">Portfolio demo · synthetic data · no live API</span>
          </div>
        </div>
      </div>
    </div>
  )
}
