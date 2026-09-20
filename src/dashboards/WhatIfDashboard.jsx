/* Geopolitical What-If — scenario simulation.

   A React port of an internal scenario tool: Mapbox became Leaflet with
   OpenStreetMap tiles for the transmission path, and the live API and LLM
   call became embedded scenarios with a pre-written narrative. Everything
   here is synthetic.

   Presentation comes from the shared dashboard system in ./ui. */

import { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  ResponsiveContainer, AreaChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import useChartTheme from './ui/chartTheme'
import { chartTooltip } from './ui/chartTooltip'
import {
  DashFrame, DashBar, DashBody, Region as Col, Panel, Stat, StatGrid,
  Chip, Status, List, Row, DashIcon,
} from './ui'

/* Scenario type is an identity, so each one holds a fixed palette slot. */
const TYPE_SLOT = { Economic: 1, Security: 7, Diplomatic: 0, Technology: 2 }

/* Severity is a state, so it uses the reserved status vocabulary. */
const SEVERITY = {
  CRITICAL: { level: 'critical', label: 'Critical' },
  HIGH: { level: 'serious', label: 'High' },
  MODERATE: { level: 'warning', label: 'Moderate' },
  LOW: { level: 'good', label: 'Low' },
}

const SCENARIOS = [
  {
    id: 'hormuz',
    type: 'Security',
    title: 'Strait of Hormuz Closure',
    origin: 'Naval escalation forces a 21-day closure of the Strait of Hormuz',
    country: 'Iran',
    severity: 'CRITICAL',
    prob: 0.27,
    horizon: 'T+0 to T+30 days',
    actors: ['IRGC Navy', 'GCC States', 'US Fifth Fleet', 'OPEC+'],
    impacts: [
      { k: 'Brent crude', v: '+38%', dir: 'up' },
      { k: 'Global LNG flow', v: '-21%', dir: 'down' },
      { k: 'Tanker insurance', v: '+410%', dir: 'up' },
      { k: 'Asia refiner margin', v: '-14%', dir: 'down' },
    ],
    assumptions: [
      'Closure holds 21 days before mediated de-escalation.',
      'No direct strike on GCC export terminals.',
      'Coordinated IEA stock release of 1.2M bbl/day.',
      'Cape reroute adds 9 to 14 days transit on affected cargo.',
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
      '- **Reroute channel:** Cape-of-Good-Hope diversions add 9 to 14 days, tightening Q3 product balances in Northeast Asia.\n' +
      '**Stakeholders most exposed:** import-dependent Asian refiners, GCC sovereign budgets, and bunker-fuel-sensitive container lines.\n' +
      'Reversal indicators: tanker AIS resuming eastbound, war-risk quotes easing below 2.5%, and a coordinated IEA stock-draw statement.',
  },
  {
    id: 'semicurb',
    type: 'Technology',
    title: 'Advanced Semiconductor Export Curb',
    origin: 'Tightened export controls cut sub-5nm tooling and HBM to key fabs',
    country: 'Taiwan',
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
      'Hyperscaler capex re-timed rather than cancelled.',
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
    country: 'Ukraine',
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
      'Danube barge and rail capture only about 40% of diverted volume.',
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
      '- **Logistics channel:** Danube barge and rail recapture only about 40% of volume, so MENA inventories draw down within three weeks.\n' +
      '- **Fiscal channel:** MENA food-import bills rise **+8%**, pressuring subsidy regimes running thin buffers.\n' +
      '**Stakeholders most exposed:** WFP relief pipelines, MENA importers, and smallholder margins facing input-cost passthrough.\n' +
      'Reversal indicators: corridor inspections resuming, Bosphorus vessel queues clearing, and futures backwardation re-establishing.',
  },
  {
    id: 'accord',
    type: 'Diplomatic',
    title: 'Surprise Normalisation Accord',
    origin: 'Two rival powers announce a phased normalisation framework',
    country: 'Saudi Arabia',
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
      'Framework is phased, with full implementation beyond the window.',
      'No spoiler veto from third-party regional actors.',
      'Sanctions relief sequenced against verification milestones.',
      'Markets price about 60% accord-durability in the base case.',
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
      'A phased normalisation framework compresses the **regional risk premium by about 18%**. The impulse is benign and front-loaded, then partially fades as durability is repriced.\n' +
      '- **Risk channel:** sovereign CDS and freight war-risk both ease; capital rotates toward regional equities.\n' +
      '- **Investment channel:** FDI announcements jump **+24%** as project pipelines paused on tail-risk reactivate.\n' +
      '- **Sector rotation:** defence indices give back **-7%** while tourism and logistics re-rate higher.\n' +
      '**Stakeholders most exposed:** sovereign issuers, regional bourses, and cross-border infrastructure sponsors.\n' +
      'Reversal indicators: verification milestones slipping, spoiler rhetoric escalating, and risk premia retracing toward the pre-accord level.',
  },
]

const HORIZONS = [
  { value: '14', label: 'T+14 days' },
  { value: '30', label: 'T+30 days' },
  { value: '60', label: 'T+60 days' },
]

/* Small inline markdown renderer, standing in for ReactMarkdown. */
function renderNarrative(md) {
  const out = []
  md.split('\n').forEach((raw, i) => {
    const line = raw.trim()
    if (!line) return
    if (line.startsWith('## ')) {
      out.push(
        <h4 key={i} style={{ fontSize: 13, fontWeight: 600, color: 'var(--dash-ink)', margin: '0 0 6px' }}>
          {line.slice(3)}
        </h4>,
      )
    } else if (line.startsWith('- ')) {
      out.push(
        <li key={i} style={{ marginLeft: 14, listStyle: 'disc', marginBottom: 4 }}>
          {fmtInline(line.slice(2))}
        </li>,
      )
    } else {
      out.push(
        <p key={i} style={{ marginBottom: 6 }}>
          {fmtInline(line)}
        </p>,
      )
    }
  })
  return out
}

function fmtInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? (
      <strong key={i} style={{ color: 'var(--dash-ink)', fontWeight: 600 }}>
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  )
}

const ImpactTip = chartTooltip({ format: (v) => `${v > 0 ? '+' : ''}${v}` })

export default function WhatIfDashboard() {
  const t = useChartTheme()

  const [selId, setSelId] = useState(SCENARIOS[0].id)
  const [intensity, setIntensity] = useState(70)
  const [horizon, setHorizon] = useState('30')
  const [showAssumptions, setShowAssumptions] = useState(true)

  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  /* The resize handler re-fits the path, so it needs the current scenario
     without re-running the map effect. */
  const pathRef = useRef(SCENARIOS[0].path)

  const scenario = useMemo(() => SCENARIOS.find((s) => s.id === selId), [selId])
  const accent = t.seriesAt(TYPE_SLOT[scenario.type])

  const chart = useMemo(() => {
    const mul = intensity / 70
    return scenario.series.map((v, i) => ({
      t: `T+${Math.round((i / (scenario.series.length - 1)) * Number(horizon))}`,
      scenario: +(v * mul).toFixed(1),
      baseline: 0,
    }))
  }, [scenario, intensity, horizon])

  const peak = useMemo(() => {
    const values = chart.map((c) => c.scenario)
    const max = Math.max(...values.map(Math.abs))
    const at = chart.find((c) => Math.abs(c.scenario) === max)
    return { value: chart[values.findIndex((v) => Math.abs(v) === max)], label: at?.t ?? '', max }
  }, [chart])

  /* Map init, guarded against StrictMode's double effect. */
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return

    const map = L.map(mapEl.current, {
      center: [25, 55],
      zoom: 2,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 12,
    }).addTo(map)
    mapRef.current = map
    layerRef.current = L.layerGroup().addTo(map)

    /* A resize leaves the previous zoom in place, which pushes the outer
       nodes off the panel. Re-fit whenever the box changes. */
    const fit = () => {
      map.invalidateSize({ animate: false })
      const pts = pathRef.current.map((p) => [p.lat, p.lng])
      map.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 4, animate: false })
    }
    const observer = new ResizeObserver(fit)
    observer.observe(mapEl.current)
    const settle = setTimeout(fit, 80)

    return () => {
      clearTimeout(settle)
      observer.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [])

  /* Redraw the transmission path for the selected scenario. */
  useEffect(() => {
    const map = mapRef.current
    const group = layerRef.current
    if (!map || !group) return
    group.clearLayers()

    pathRef.current = scenario.path
    const pts = scenario.path.map((p) => [p.lat, p.lng])
    L.polyline(pts, { color: accent, weight: 2.5, opacity: 0.85, dashArray: '6 5' }).addTo(group)

    scenario.path.forEach((p, i) => {
      const isOrigin = i === 0
      L.circleMarker([p.lat, p.lng], {
        radius: isOrigin ? 7 : 5,
        color: t.surface,
        weight: 2,
        fillColor: accent,
        fillOpacity: isOrigin ? 1 : 0.75,
      })
        .bindTooltip(`<b>${p.n}</b><br/>${isOrigin ? 'Shock origin' : `Transmission node ${i}`}`, {
          sticky: true,
        })
        .addTo(group)
    })
    /* fitBounds rather than flyToBounds: the resize handler re-fits too, and
       an in-flight animation and a fit racing each other left nodes outside
       the panel when the scenario changed. */
    map.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 4, animate: false })
  }, [scenario, accent, t.surface])

  return (
    <DashFrame>
      <DashBar
        icon="target"
        title="Geopolitical What-If"
        subtitle="Scenario simulation · synthetic library · no live API"
      >
        <Chip icon="clock">{scenario.horizon}</Chip>
        <Status level={SEVERITY[scenario.severity].level}>
          {SEVERITY[scenario.severity].label}
        </Status>
      </DashBar>

      <DashBody rows="auto minmax(0, 1fr)">
        {/* The headline figures run across the full width, as they do on the
            other demos. Inside the middle column each tile was down to about
            100px and the labels were clipping. */}
        <StatGrid columns="repeat(3, minmax(0, 1fr))">
          <Stat label="Probability" value={`${Math.round(scenario.prob * 100)}%`} note="of occurrence" />
          <Stat
            label="Peak deviation"
            value={`${peak.value?.scenario > 0 ? '+' : ''}${peak.value?.scenario ?? 0}`}
            note={`at ${peak.label} · ${scenario.horizon}`}
          />
          <Stat label="Scenario type" value={scenario.type} note={scenario.country} />
        </StatGrid>

        <DashBody columns="316px minmax(0, 1fr) 340px" style={{ padding: 0 }}>
          {/* ── Scenario library and controls ───────────────── */}
          <Col scroll>
            <Panel title="Shock intensity" note={`${intensity}% of base`}>
              <input
                type="range"
                min="20"
                max="120"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                aria-label="Shock intensity"
                style={{ width: '100%', accentColor: accent, cursor: 'pointer' }}
              />
              <div className="dash-note" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>20%</span>
                <span>120%</span>
              </div>

              <div className="dash-sep" style={{ margin: '12px 0 10px' }} />

              <span className="dash-panel-title" style={{ display: 'block', marginBottom: 6 }}>
                Simulation horizon
              </span>
              <div style={{ display: 'flex', gap: 5 }}>
                {HORIZONS.map((h) => (
                  <button
                    key={h.value}
                    type="button"
                    className="dash-chip"
                    aria-pressed={horizon === h.value}
                    onClick={() => setHorizon(h.value)}
                    style={{
                      cursor: 'pointer',
                      borderColor: horizon === h.value ? 'var(--dash-accent-line)' : undefined,
                      background: horizon === h.value ? 'var(--dash-selected)' : undefined,
                      color: horizon === h.value ? 'var(--dash-ink)' : undefined,
                    }}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
              <p className="dash-note" style={{ marginTop: 10 }}>
                The projection recomputes as you change these. There is no run button because there
                is nothing to wait for.
              </p>
            </Panel>

            <Panel title="Scenario library" note={`${SCENARIOS.length} scenarios`} grow>
              <List>
                {SCENARIOS.map((s) => (
                  <Row
                    key={s.id}
                    name={s.title}
                    sub={`${s.type} · ${s.country} · P ${Math.round(s.prob * 100)}%`}
                    selected={s.id === selId}
                    onSelect={() => setSelId(s.id)}
                  >
                    <span
                      className="dash-legend-swatch"
                      style={{ background: t.seriesAt(TYPE_SLOT[s.type]) }}
                      aria-hidden="true"
                    />
                  </Row>
                ))}
              </List>
            </Panel>

            <Panel title="Actors in play" note={`${scenario.actors.length}`}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {scenario.actors.map((a) => (
                  <span className="dash-chip" key={a}>
                    {a}
                  </span>
                ))}
              </div>
            </Panel>
          </Col>

          {/* ── Projection and transmission path ────────────── */}
          <Col scroll>
            <Panel title="Selected scenario" note={scenario.horizon}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dash-ink)' }}>
                {scenario.title}
              </div>
              <p className="dash-note" style={{ marginTop: 4 }}>
                {scenario.origin}
              </p>
            </Panel>

            <Panel title="Impact projection" note="scenario against baseline" bodyFill>
              <div className="dash-chart">
                <ResponsiveContainer width="100%" height={188}>
                  <AreaChart data={chart} margin={{ top: 8, right: 10, left: -14, bottom: 4 }}>
                    <defs>
                      <linearGradient id="wfGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={accent} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...t.grid} />
                    <XAxis dataKey="t" {...t.xAxis} interval={2} />
                    <YAxis {...t.yAxis} width={34} />
                    <Tooltip content={<ImpactTip />} cursor={t.cursor} />
                    <ReferenceLine y={0} stroke={t.axis} />
                    <Area
                      type="monotone"
                      dataKey="scenario"
                      name="Scenario"
                      stroke={accent}
                      strokeWidth={2}
                      fill="url(#wfGrad)"
                    />
                    <Line
                      type="monotone"
                      dataKey="baseline"
                      name="Baseline"
                      stroke={t.muted}
                      strokeWidth={1.5}
                      strokeDasharray="5 4"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Transmission path" note="OpenStreetMap" grow bodyFill>
              <div ref={mapEl} className="dash-map" style={{ minHeight: 210, borderRadius: 8 }} />
            </Panel>
          </Col>

          {/* ── Impacts, assumptions, narrative ─────────────── */}
          <Col scroll>
            {/* Direction is shown with an arrow and the value in ink. A rise is
                not always bad here, so colour would be asserting a judgement
                the data does not make. */}
            <Panel title="Projected impacts" note="at peak">
              <table className="dash-table">
                <tbody>
                  {scenario.impacts.map((im) => (
                    <tr key={im.k}>
                      <td>{im.k}</td>
                      <td className="num">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <DashIcon
                            name={im.dir === 'up' ? 'trendUp' : 'trendDown'}
                            size={12}
                            className="dash-muted"
                          />
                          <span style={{ color: 'var(--dash-ink)', fontWeight: 500 }}>{im.v}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>

            <Panel
              title="Assumptions"
              note={
                <button
                  type="button"
                  onClick={() => setShowAssumptions((v) => !v)}
                  style={{
                    border: 0,
                    background: 'transparent',
                    color: 'var(--dash-accent)',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: 11,
                  }}
                >
                  {showAssumptions ? 'Hide' : 'Show'}
                </button>
              }
            >
              {showAssumptions && (
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {scenario.assumptions.map((a) => (
                    <li key={a} className="dash-note" style={{ display: 'flex', gap: 7 }}>
                      <DashIcon name="check" size={12} />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Scenario interpretation" note="pre-written, synthetic" grow>
              <div className="dash-note" style={{ lineHeight: 1.6 }}>
                {renderNarrative(scenario.narrative)}
              </div>
            </Panel>
          </Col>
        </DashBody>
      </DashBody>
    </DashFrame>
  )
}
